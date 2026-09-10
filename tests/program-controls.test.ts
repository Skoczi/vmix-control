import test from 'node:test';
import assert from 'node:assert/strict';
import {createVmixService,createDashboardService} from '../lib/vmix-proxy.ts';
import {createDemoFetcher} from '../lib/vmix-demo.ts';
import {readProgramState} from '../lib/program-controls.ts';
import {readVmixState} from '../lib/vmix-xml.ts';
const req=(body:object)=>new Request('http://localhost:3000/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'demo',...body})});
function fixture(){
 let time=0;const commands:URL[]=[];const demo=createDemoFetcher(()=>time);
 const fetcher=(async(url,options)=>{const u=new URL(String(url));if(u.searchParams.has('Function'))commands.push(u);return demo(url,options);}) as typeof fetch;
 const service=createDashboardService(undefined,createVmixService({fetcher,now:()=>time,sleep:async ms=>{time+=ms;},cacheMs:0}));
 return {commands,service,read:async()=>await(await service(req({}))).text(),control:(control:object,extra:object={})=>service(req({mix:1,mixId:'main',control,...extra}))};
}
test('program XML uses root overlay channels and flags, not input layers or additional mix state',()=>{
 const state=readProgramState('<vmix><inputs><input><overlays><overlay number="8">99</overlay></overlays></input></inputs><mix number="2"><fadeToBlack>True</fadeToBlack></mix><overlays><overlay number="1"/><overlay number="2">4</overlay></overlays><fadeToBlack>False</fadeToBlack><recording>True</recording></vmix>');
 assert.deepEqual(state.overlays,{1:'',2:'4'});assert.equal(state.fadeToBlack,false);assert.equal(state.recording,true);assert.equal(state.streaming,null);
 assert.deepEqual(readProgramState('<vmix/>').overlays,{});
});
test('all eight overlay channels IN/OUT are confirmed and leave program and preview untouched',async()=>{
 const f=fixture();const before=readVmixState(await f.read());
 for(let channel=1;channel<=8;channel++){
  assert.equal((await f.control({kind:'overlay',channel,enabled:true,input:'demo-title-1',expected:''})).status,200);
  assert.equal(readProgramState(await f.read()).overlays[channel],'9');
  const input=f.commands.at(-1)!;assert.equal(input.searchParams.get('Function'),`OverlayInput${channel}In`);assert.equal(input.searchParams.get('Mix'),'0');
  assert.equal((await f.control({kind:'overlay',channel,enabled:false,expected:'demo-title-1'})).status,200);
  assert.equal(readProgramState(await f.read()).overlays[channel],'');
  assert.equal(f.commands.at(-1)!.searchParams.get('Mix'),null);
 }
 const after=readVmixState(await f.read());assert.deepEqual(after.active,before.active);assert.deepEqual(after.preview,before.preview);
});
test('stale overlay state, missing source, invalid channel and non-PGM controls send no command',async()=>{
 const f=fixture();await f.control({kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''});
 const count=f.commands.length;
 for(const [control,extra,code] of [
  [{kind:'overlay',channel:1,enabled:false,expected:''},{},409],
  [{kind:'overlay',channel:2,enabled:true,input:'deleted',expected:''},{},409],
  [{kind:'overlay',channel:9,enabled:true,input:'demo-title-1',expected:''},{},400],
  [{kind:'ftb',enabled:true,expected:false},{mix:2,mixId:'demo-mix-2'},400],
 ] as const)assert.equal((await f.control(control,extra)).status,code);
 assert.equal(f.commands.length,count);
});
test('FTB compares expected state, confirms on/off and does not change program',async()=>{
 const f=fixture();await f.read();
 assert.equal((await f.control({kind:'ftb',enabled:true,expected:false})).status,200);
 assert.equal(readProgramState(await f.read()).fadeToBlack,true);
 assert.equal((await f.control({kind:'ftb',enabled:true,expected:false})).status,409);
 assert.equal(f.commands.length,1);
 assert.equal((await f.control({kind:'ftb',enabled:false,expected:true})).status,200);
 assert.equal(readProgramState(await f.read()).fadeToBlack,false);
 assert.equal(readVmixState(await f.read()).active[1],'4');
});
test('all PGM stingers reach preview without a Duration override',async()=>{
 const f=fixture();
 for(let channel=1;channel<=8;channel++){
  const state=readVmixState(await f.read()),input=state.inputs.find(i=>i.number===state.preview[1])!;
  const response=await f.service(req({input:input.key,mix:1,mixId:'main',play:false,action:'take',transition:`Stinger${channel}`,duration:500}));
  assert.equal(response.status,200);assert.equal(readVmixState(await f.read()).active[1],input.number);
  assert.equal(f.commands.at(-1)!.searchParams.get('Duration'),null);
 }
});
test('uncertain overlay delivery is not retried',async()=>{
 let calls=0;const demo=createDemoFetcher();
 const service=createVmixService({fetcher:(async(url,options)=>{if(new URL(String(url)).searchParams.has('Function')){calls++;throw Error('lost');}return demo(url,options);}) as typeof fetch,sleep:async()=>{},cacheMs:0});
 const response=await service(new Request('http://localhost/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:8088',mix:1,mixId:'main',control:{kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''}})}));
 assert.equal(response.status,502);assert.equal(((await response.json()) as {status:string}).status,'uncertain');assert.equal(calls,1);
});
test('overlay controls share PGM lock with transitions and reject stale shared targets',async()=>{
 let release!:()=>void;let signal!:()=>void;const entered=new Promise<void>(r=>{signal=r;});
 const waiting=new Promise<void>(r=>{release=r;});const demo=createDemoFetcher();
 const service=createVmixService({fetcher:(async(url,options)=>{if(new URL(String(url)).searchParams.get('Function')==='OverlayInput1In'){signal();await waiting;}return demo(url,options);}) as typeof fetch,sleep:async()=>{},cacheMs:0});
 const command=(body:object)=>service(new Request('http://localhost/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:8088',mix:1,mixId:'main',...body})}));
 const first=command({control:{kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''}});
 await entered;
 assert.equal((await command({input:'demo-cam-2',play:false,transition:'Cut'})).status,409);
 release();assert.equal((await first).status,200);
 const shared=createDashboardService(undefined,createVmixService({fetcher:createDemoFetcher(),cacheMs:0}),r=>r.headers.get('admin')==='yes');
 const local=req({connect:true});local.headers.set('admin','yes');await shared(local);
 const stale=new Request('http://localhost:3000/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:8088',mix:1,mixId:'main',control:{kind:'ftb',enabled:true,expected:false}})});
 assert.equal((await shared(stale)).status,409);
});
test('all additional mixes route overlays to their own zero-based destination and reuse active channels',async()=>{
 const f=fixture();
 for(let mix=2;mix<=16;mix++){
  const expected=mix===2?'':'demo-title-1';
  const response=await f.control({kind:'overlay',channel:2,enabled:true,input:'demo-title-1',expected},{mix,mixId:`demo-mix-${mix}`});
  assert.equal(response.status,200);
  assert.equal(f.commands.at(-1)!.searchParams.get('Mix'),String(mix-1));
  assert.equal(f.commands.at(-1)!.searchParams.get('Function'),'OverlayInput2In');
 }
 assert.equal(f.commands.length,15);
 assert.equal((await f.control({kind:'overlay',channel:2,enabled:false,expected:'demo-title-1'},{mix:16,mixId:'demo-mix-16'})).status,200);
 assert.equal(f.commands.at(-1)!.searchParams.get('Mix'),null);
 assert.equal(readProgramState(await f.read()).overlays[2],'');
});
test('additional mix overlay rejects self-routing, stale mix identity and unsupported versions',async()=>{
 const f=fixture();
 assert.equal((await f.control({kind:'overlay',channel:1,enabled:true,input:'demo-mix-2',expected:''},{mix:2,mixId:'demo-mix-2'})).status,400);
 assert.equal((await f.control({kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''},{mix:2,mixId:'stale'})).status,409);
 assert.equal(f.commands.length,0);
 const demo=createDemoFetcher();
 let commands=0;
 const service=createVmixService({fetcher:(async(url,options)=>{if(new URL(String(url)).searchParams.has('Function'))commands++;const response=await demo(url,options);return new Response((await response.text()).replace('<version>DEMO</version>','<version>23.0.0.0</version>'));}) as typeof fetch});
 const response=await service(new Request('http://localhost/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:8088',mix:2,mixId:'demo-mix-2',control:{kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''}})}));
 assert.equal(response.status,409);assert.equal(commands,0);
});
test('shared overlay lock spans different mixes',async()=>{
 const demo=createDemoFetcher();let release!:()=>void;let entered!:()=>void;
 const signal=new Promise<void>(r=>{entered=r;}),wait=new Promise<void>(r=>{release=r;});
 const service=createVmixService({fetcher:(async(url,options)=>{if(new URL(String(url)).searchParams.get('Function')==='OverlayInput1In'){entered();await wait;}return demo(url,options);}) as typeof fetch,cacheMs:0});
 const command=(mix:number)=>service(new Request('http://localhost/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:8088',mix,mixId:`demo-mix-${mix}`,control:{kind:'overlay',channel:1,enabled:true,input:'demo-title-1',expected:''}})}));
 const first=command(2);await signal;assert.equal((await command(3)).status,409);
 release();assert.equal((await first).status,200);
});
