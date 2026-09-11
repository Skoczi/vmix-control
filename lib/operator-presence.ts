import {networkInterfaces} from 'node:os';
import {isLocalRequest} from './local-access.ts';
import {canonicalVmixUrl} from './vmix-proxy.ts';
export type Operator={id:string;name:string;mixId:string;onAir:boolean};
export function createPresenceService(now=Date.now){
 const records=new Map<string,Operator&{room:string;seen:number}>();
 const local=Object.values(networkInterfaces()).flatMap(entries=>(entries||[]).filter(e=>e.family==='IPv4').map(e=>e.address));
 return async (request:Request)=>{
  const json=(data:object,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Forbidden'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
  try{
   const raw=await request.text();if(raw.length>2048)throw Error();const body=JSON.parse(raw);
   if(typeof body.id!=='string'||!/^[-\w]{8,80}$/.test(body.id)||typeof body.name!=='string'||body.name.length>80||typeof body.mixId!=='string'||!/^[-\w]{1,80}$/.test(body.mixId)||typeof body.onAir!=='boolean')throw Error();
   const room=body.address==='demo'?'demo':canonicalVmixUrl(body.address,local).href;
   for(const [id,record] of records)if(now()-record.seen>20000)records.delete(id);
   if(body.leave===true)records.delete(body.id);
   else{if(records.size>=128&&!records.has(body.id))return json({error:'Capacity reached'},429);records.set(body.id,{id:body.id,name:isLocalRequest(request)?'Host (Admin)':body.name.trim(),mixId:body.mixId,onAir:body.onAir,room,seen:now()});}
   return json({operators:[...records.values()].filter(r=>r.room===room).map(({id,name,mixId,onAir})=>({id,name,mixId,onAir}))});
  }catch{return json({error:'Invalid presence request'},400);}
 };
}
export const handlePresence=createPresenceService();
