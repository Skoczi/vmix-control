import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {isLocalRequest} from './local-access.ts';
const scrypt=promisify(scryptCallback);
type Config={salt:string;hash:string};
export function createAccessControl(file=path.resolve(process.env.VMIX_ACCESS_FILE||'.vmix-access.json'),now=Date.now,canConfigure:(request:Request)=>boolean=isLocalRequest){
 const sessions=new Map<string,number>();let locked=false;let failures=0;let retryAt=0;
 const json=(data:object,status=200,cookie?:string)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
 async function config():Promise<Config|null>{try{const value=JSON.parse(await readFile(file,'utf8'));if(value===null)return null;if(!/^[a-f0-9]{32}$/.test(value.salt)||!/^[a-f0-9]{128}$/.test(value.hash))throw Error();return value;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw Error('Access configuration unavailable');}}
 function token(request:Request){return (request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('vmix_session='))?.slice(13)||'';}
 function authenticated(request:Request){for(const [key,expires] of sessions)if(expires<=now())sessions.delete(key);return isLocalRequest(request)||sessions.has(token(request));}
 const cookie=(request:Request,value:string,age:number)=>`vmix_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
 function session(request:Request){if(sessions.size>=256)sessions.delete(sessions.keys().next().value!);const value=randomBytes(32).toString('hex');sessions.set(value,now()+8*60*60*1000);return cookie(request,value,8*60*60);}
 async function verify(password:unknown,c:Config){if(typeof password!=='string'||password.length>128)return false;const actual=await scrypt(password,c.salt,64) as Buffer;return timingSafeEqual(actual,Buffer.from(c.hash,'hex'));}
 async function save(value:Config|null){await mkdir(path.dirname(file),{recursive:true});const temp=file+'.tmp';await writeFile(temp,JSON.stringify(value),{mode:0o600});await rename(temp,file);}
 async function guard(request:Request){try{if(await config()&&!authenticated(request))return json({error:'Login required'},401);return null;}catch{return json({error:'Access configuration unavailable'},503);}}
 async function handle(request:Request){
  try{
   const c=await config();
   if(request.method==='GET')return json({enabled:!!c,authenticated:!c||authenticated(request),local:isLocalRequest(request)});
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Forbidden'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
   const raw=await request.text();if(raw.length>2048)return json({error:'Invalid request'},400);let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
   if(body.action==='logout'){sessions.delete(token(request));return json({ok:true},200,cookie(request,'',0));}
   if(body.action==='configure'&&!canConfigure(request))return json({error:'Only the local operator can change access settings'},403);
   if(!['login','configure'].includes(body.action))return json({error:'Invalid request'},400);
   if(locked)return json({error:'Please wait'},429);
   if(!isLocalRequest(request)&&now()<retryAt)return json({error:'Too many attempts. Try again in 30 seconds.'},429);
   locked=true;
   try{
    if(body.action==='configure'&&c&&!authenticated(request))return json({error:'Login required'},401);
    if(c&&!isLocalRequest(request)&&!await verify(body.action==='login'?body.password:body.currentPassword,c)){failures++;if(failures>=5){retryAt=now()+30000;failures=0;}return json({error:'Incorrect password'},403);}
    if(body.action==='login'){failures=0;return json({ok:true},200,c?session(request):undefined);}
    if(typeof body.enabled!=='boolean')return json({error:'Invalid request'},400);
    if(body.enabled&&(typeof body.password!=='string'||body.password.length<4||body.password.length>128))return json({error:'Use 4–128 characters'},400);
    let next:Config|null=null;if(body.enabled){const salt=randomBytes(16).toString('hex');next={salt,hash:(await scrypt(body.password,salt,64) as Buffer).toString('hex')};}
    await save(next);sessions.clear();failures=0;retryAt=0;
    return json({ok:true,enabled:!!next},200,next?session(request):cookie(request,'',0));
   }finally{locked=false;}
  }catch{return json({error:'Access configuration unavailable'},503);}
 }
 return {guard,handle};
}
export const accessControl=createAccessControl();
