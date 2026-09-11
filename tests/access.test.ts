import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type {IncomingMessage} from 'node:http';
import {createAccessControl} from '../lib/access-control.ts';
import {markLocalRequest} from '../lib/local-access.ts';
const request=(body?:object,cookie='',origin='http://localhost:3000',extra:Record<string,string>={})=>new Request('http://localhost:3000/api/access',{method:body?'POST':'GET',headers:{origin,'Content-Type':'application/json',cookie,...extra},...(body?{body:JSON.stringify(body)}:{})});
const cookie=(r:Response)=>r.headers.get('set-cookie')!.split(';')[0];
async function fixture(fn:(file:string)=>Promise<void>){const dir=await mkdtemp(path.join(os.tmpdir(),'vmix-access-'));try{await fn(path.join(dir,'access.json'));}finally{await rm(dir,{recursive:true,force:true});}}
test('password protection persists, gates API and revokes sessions on password changes',()=>fixture(async file=>{const a=createAccessControl(file,Date.now,()=>true);assert.equal(await a.guard(request()),null);const enable=await a.handle(request({action:'configure',enabled:true,password:'Secret-123'}));assert.equal(enable.status,200);const first=cookie(enable);assert.equal((await a.guard(request()))?.status,401);assert.equal(await a.guard(request(undefined,first)),null);assert.ok(!await readFile(file,'utf8').then(s=>s.includes('Secret-123')));const restarted=createAccessControl(file,Date.now,()=>true);assert.equal((await restarted.guard(request(undefined,first)))?.status,401);const login=await a.handle(request({action:'login',operatorName:'Test operator',password:'Secret-123'}));assert.equal(login.status,200);const second=cookie(login);assert.equal((await a.handle(request({action:'configure',enabled:true,password:'Changed-456',currentPassword:'Secret-123'},second))).status,200);assert.equal((await a.guard(request(undefined,first)))?.status,401);assert.equal((await a.guard(request(undefined,second)))?.status,401);assert.equal((await a.handle(request({action:'login',operatorName:'Test operator',password:'Secret-123'}))).status,403);}));
test('wrong passwords throttle, cross-origin changes fail and malformed config fails closed',()=>fixture(async file=>{let now=0;const a=createAccessControl(file,()=>now,()=>true);assert.equal((await a.handle(request({action:'configure',enabled:true,password:'abc'}))).status,400);await a.handle(request({action:'configure',enabled:true,password:'Secret-123'}));assert.equal((await a.handle(request({action:'configure',enabled:false},'','http://evil.test'))).status,403);for(let i=0;i<5;i++)assert.equal((await a.handle(request({action:'login',operatorName:'Test operator',password:'wrong'}))).status,403);assert.equal((await a.handle(request({action:'login',operatorName:'Test operator',password:'Secret-123'}))).status,429);now=30001;assert.equal((await a.handle(request({action:'login',operatorName:'Test operator',password:'Secret-123'}))).status,200);await writeFile(file,'broken');assert.equal((await a.guard(request()))?.status,503);}));
test('only verified loopback bypasses password; LAN spoofing localhost and forwarded headers does not',()=>fixture(async file=>{const a=createAccessControl(file,Date.now,()=>true);await a.handle(request({action:'configure',enabled:true,password:'Secret-123'}));const local={headers:{},socket:{remoteAddress:'127.0.0.1'}} as IncomingMessage;markLocalRequest(local);const headers=local.headers as Record<string,string>;assert.equal(await a.guard(request(undefined,'',undefined,headers)),null);const remote={headers:{...headers,'x-forwarded-for':'127.0.0.1',host:'localhost'},socket:{remoteAddress:'192.168.1.20'}} as unknown as IncomingMessage;markLocalRequest(remote);assert.equal((await a.guard(request(undefined,'',undefined,remote.headers as Record<string,string>)))?.status,401);assert.equal((await a.handle(request({action:'configure',enabled:false},'',undefined,headers))).status,200);assert.equal(await a.guard(request()),null);}));
test('logout and eight-hour expiration invalidate sessions',()=>fixture(async file=>{let now=0;const a=createAccessControl(file,()=>now,()=>true);const enabled=await a.handle(request({action:'configure',enabled:true,password:'Secret-123'}));const first=cookie(enabled);await a.handle(request({action:'logout'},first));assert.equal((await a.guard(request(undefined,first)))?.status,401);const logged=await a.handle(request({action:'login',operatorName:'Test operator',password:'Secret-123'}));now=8*60*60*1000;assert.equal((await a.guard(request(undefined,cookie(logged))))?.status,401);}));

test('four-character password can be saved and used to log in',()=>fixture(async file=>{const a=createAccessControl(file,Date.now,()=>true);assert.equal((await a.handle(request({action:'configure',enabled:true,password:'1234'}))).status,200);const login=await a.handle(request({action:'login',operatorName:'Test operator',password:'1234'}));assert.equal(login.status,200);assert.equal(await a.guard(request(undefined,cookie(login))),null);}));

test('remote authenticated operator cannot configure password protection',()=>fixture(async file=>{const admin=createAccessControl(file,Date.now,()=>true);await admin.handle(request({action:'configure',enabled:true,password:'1234'}));const remote=createAccessControl(file);const login=await remote.handle(request({action:'login',operatorName:'Test operator',password:'1234'}));assert.equal(login.status,200);assert.equal((await remote.handle(request({action:'configure',enabled:false,currentPassword:'1234'},cookie(login)))).status,403);assert.equal((await remote.guard(request()))?.status,401);}));


test('password login requires a name and restores it only for its own authenticated session',()=>fixture(async file=>{
 const a=createAccessControl(file,Date.now,()=>true);
 await a.handle(request({action:'configure',enabled:true,password:'1234'}));
 for(const operatorName of [undefined,null,123,'','   ','x'.repeat(81)]){
  const denied=await a.handle(request({action:'login',password:'1234',operatorName}));
  assert.equal(denied.status,400);assert.equal(denied.headers.get('set-cookie'),null);
 }
 const readStatus=async (sessionCookie='')=>await (await a.handle(request(undefined,sessionCookie))).json() as {operatorName:string;authenticated:boolean};
 const alice=await a.handle(request({action:'login',password:'1234',operatorName:'  Alicja 🎥  '}));
 assert.equal(alice.status,200);
 assert.equal((await readStatus(cookie(alice))).operatorName,'Alicja 🎥');
 const bob=await a.handle(request({action:'login',password:'1234',operatorName:'Bob'}));
 assert.equal((await readStatus(cookie(bob))).operatorName,'Bob');
 assert.equal((await readStatus()).operatorName,'');
 await a.handle(request({action:'logout'},cookie(alice)));
 const loggedOut=await readStatus(cookie(alice));
 assert.equal(loggedOut.authenticated,false);assert.equal(loggedOut.operatorName,'');
 assert.equal((await readStatus(cookie(bob))).operatorName,'Bob');
}));
