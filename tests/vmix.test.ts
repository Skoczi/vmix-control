import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createVmixService,vmixUrl} from '../lib/vmix-proxy.ts';
const payload=async (response:Response)=> await response.json() as {status:string;stinger?:boolean;warning:string};
const request=(body:object,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/vmix',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const xml=(active='1')=>`<vmix><inputs><input key="one" number="1" type="Capture"/><input key="two" number="2" type="Video"/>${[2,3,4,5].map(n=>`<input type="Mix" number="${n+1}" key="mix-${n}"/>`).join('')}</inputs><active>${active}</active>${[2,3,4,5].map(n=>`<mix number="${n}"><active>${active}</active></mix>`).join('')}</vmix>`;
function setup(options:{respond?: (url:URL)=>Promise<Response>;sleep?: (ms:number)=>Promise<void>}={}){
 const calls:URL[]=[];let active='1';let clock=0;const sleeps:number[]=[];
 const fetcher=(async(url:URL)=>{calls.push(new URL(url));if(options.respond)return options.respond(new URL(url));if(url.searchParams.has('Function')){if(url.searchParams.get('Function')!=='Play')active='2';return new Response('OK');}return new Response(xml(active));}) as typeof fetch;
 const handle=createVmixService({fetcher,now:()=>clock,sleep:options.sleep|| (async ms=>{sleeps.push(ms);clock+=ms;})});
 return {handle,calls,sleeps};
}
const command={address:'127.0.0.1',input:'two',mix:2,mixId:'mix-2',play:false,transition:'Fade',duration:750};
test('local target validation',()=>{assert.equal(vmixUrl('192.168.1.5').href,'http://192.168.1.5:8088/api/');for(const host of ['https://192.168.1.5','8.8.8.8','example.com','127.0.0.1/?Function=Cut','user:pass@127.0.0.1'])assert.throws(()=>vmixUrl(host));});
test('all five mixes validate identity and pass correct zero-based API number',async()=>{
 for(let mix=1;mix<=5;mix++){const {handle,calls}=setup();const res=await handle(request({...command,mix,mixId:mix===1?'main':`mix-${mix}`,transition:'Cut',play:true}));assert.equal(res.status,200);assert.equal((await payload(res)).status,'confirmed');const controls=calls.filter(c=>c.search);assert.equal(controls[0].searchParams.get('Mix'),String(mix-1));assert.equal(controls[0].searchParams.get('Function'),'Cut');assert.equal(controls[1].searchParams.get('Function'),'Play');}
});
test('Fade waits requested duration and confirms real program; stinger omits Duration',async()=>{const {handle,calls,sleeps}=setup();assert.equal((await handle(request(command))).status,200);assert.equal(calls[1].searchParams.get('Duration'),'750');assert.ok(sleeps.includes(750));const result=await handle(request({...command,transition:'Stinger8'}));assert.equal((await payload(result)).stinger,true);assert.equal(calls.filter(c=>c.searchParams.get('Function')==='Stinger8')[0].searchParams.has('Duration'),false);});
test('removed/reordered destination and self routing are rejected before any command',async()=>{const {handle,calls}=setup();for(const change of [{mixId:'removed'},{input:'mix-2'},{input:'removed'}])assert.ok((await handle(request({...command,...change}))).status>=400);assert.equal(calls.filter(c=>c.search).length,0);});
test('invalid transition, duration, identity and cross-origin requests never reach vMix',async()=>{const {handle,calls}=setup();for(const change of [{transition:'RemoveInput'},{duration:0},{duration:10001},{duration:'500'},{mix:0},{mixId:undefined}])assert.equal((await handle(request({...command,...change}))).status,400);assert.equal((await handle(request(command,'http://evil.test'))).status,403);assert.equal(calls.length,0);});
test('concurrent clients share one read and commands on the same mix cannot overlap',async()=>{
 let release!:()=>void;let entered!:()=>void;const started=new Promise<void>(r=>entered=r);const wait=new Promise<void>(r=>release=r);
 const {handle,calls}=setup({sleep:async ms=>{if(ms===750){entered();await wait;}}});
 await Promise.all([handle(request({address:'127.0.0.1'})),handle(request({address:'127.0.0.1'}))]);assert.equal(calls.length,1);
 const running=handle(request(command));await started;const blocked=await handle(request(command));assert.equal(blocked.status,409);assert.equal((await payload(blocked)).status,'busy');
 const other=await handle(request({...command,mix:3,mixId:'mix-3',transition:'Cut'}));assert.equal(other.status,200);release();assert.equal((await running).status,200);
});
test('uncertain delivery is not retried and Play is never sent after transition failure',async()=>{
 const {handle,calls}=setup({respond:async url=>url.search?Promise.reject(Error('timeout')):new Response(xml())});
 const result=await handle(request({...command,play:true}));assert.equal(result.status,502);assert.equal((await payload(result)).status,'uncertain');assert.equal(calls.filter(c=>c.search).length,1);
});
test('unconfirmed program times out without reporting success or resending command',async()=>{const {handle,calls}=setup({respond:async url=>new Response(url.search?'OK':xml())});const res=await handle(request(command));assert.equal(res.status,504);assert.equal((await payload(res)).status,'uncertain');assert.equal(calls.filter(c=>c.search).length,1);});
test('partial Play failure survives a successful confirmation',async()=>{const {handle}=setup({respond:async url=>url.searchParams.get('Function')==='Play'?new Response('Error',{status:500}):new Response(url.search?'OK':xml('2'))});const res=await handle(request({...command,play:true}));const data=await payload(res);assert.equal(data.status,'confirmed');assert.ok(data.warning.includes('odtwarzania'));});
test('localhost, loopback and local LAN address share the same operation lock',async()=>{
 let release!:()=>void;let entered!:()=>void;const ready=new Promise<void>(r=>entered=r);const gate=new Promise<void>(r=>release=r);let controls=0;
 const handle=createVmixService({localAddresses:['192.168.8.229'],fetcher:(async (url:URL)=>{if(url.search){controls++;return new Response('OK');}return new Response(xml('2'));}) as typeof fetch,sleep:async ms=>{if(ms===750){entered();await gate;}}});
 const first=handle(request({...command,address:'localhost:8088'}));await ready;
 for(const address of ['127.0.0.1:8088','192.168.8.229:8088']){const res=await handle(request({...command,address}));assert.equal(res.status,409);assert.equal((await payload(res)).status,'busy');}
 release();assert.equal((await first).status,200);assert.equal(controls,1);
});
test('a pinned dashboard rejects a different vMix without sending a command',async()=>{const {handle,calls}=setup();assert.equal((await handle(request({address:'127.0.0.1'}))).status,200);const res=await handle(request({...command,address:'192.168.2.123'}));assert.equal(res.status,409);assert.equal((await payload(res)).status,'wrong-instance');assert.equal(calls.length,1);});
test('an unsuccessful first connection does not permanently pin a bad address',async()=>{let first=true;const handle=createVmixService({localAddresses:[],fetcher:(async()=>{if(first){first=false;throw Error('offline');}return new Response(xml());}) as typeof fetch});assert.equal((await handle(request({address:'192.168.2.122'}))).status,502);assert.equal((await handle(request({address:'192.168.2.123'}))).status,200);});
