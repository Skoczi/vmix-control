import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoFetcher} from '../lib/vmix-demo.ts';
import {createVmixService} from '../lib/vmix-proxy.ts';
import {readVmixState} from '../lib/vmix-xml.ts';
import {mixInformation,visibleMixNumbers,type Source} from '../lib/vmix-state.ts';
import {MAX_MIXES} from '../lib/vmix-limits.ts';
const request=(body:object)=>new Request('http://localhost:3000/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:18088',...body})});
test('maximum demo exposes 16 mixes and selection follows Mix 16 identity',async()=>{
 const xml=await(await createDemoFetcher()('http://demo/api/')).text(),state=readVmixState(xml);
 assert.equal(Object.keys(state.active).length,MAX_MIXES);assert.equal(state.inputs.length,24);assert.equal(state.mixId(16),'demo-mix-16');
 const inputs:Source[]=state.inputs.map(i=>({...i,title:i.key,state:'Paused'}));
 const snapshot={inputs,mixes:state.active,previews:state.preview,mixInfo:mixInformation(inputs,state.active),version:'DEMO'};
 assert.equal(visibleMixNumbers(snapshot,'all').length,16);assert.deepEqual(visibleMixNumbers(snapshot,'demo-mix-16'),[16]);
 delete snapshot.mixes[16];assert.deepEqual(visibleMixNumbers(snapshot,'demo-mix-16'),[]);
 const invalid=readVmixState(xml.replace('</vmix>','<mix number="17"><active>4</active></mix></vmix>'));assert.equal(invalid.active[17],undefined);
});
test('all 16 buses support Cut, Preview and Auto with HTTP indices 0–15',async()=>{
 let time=0;const calls:URL[]=[];const fetcher=createDemoFetcher(()=>time);
 const service=createVmixService({fetcher:(async(url,init)=>{calls.push(new URL(String(url)));return fetcher(url,init);}) as typeof fetch,cacheMs:0,now:()=>time,sleep:async ms=>{time+=ms;}});
 for(let mix=1;mix<=MAX_MIXES;mix++){
  const base={input:'demo-cam-1',mix,mixId:mix===1?'main':`demo-mix-${mix}`,play:false,transition:'Cut',duration:250};
  assert.equal((await service(request(base))).status,200);
  assert.equal((await service(request({...base,input:'demo-video-1',action:'preview'}))).status,200);
  assert.equal((await service(request({...base,input:'demo-video-1',action:'take',transition:'Fade'}))).status,200);
  const cmds=calls.filter(c=>c.searchParams.get('Mix')===String(mix-1));assert.deepEqual(cmds.map(c=>c.searchParams.get('Function')),['Cut','PreviewInput','Fade']);
 }
 const before=calls.length;
 for(const mix of [0,17,1.5,'16'])assert.equal((await service(request({input:'demo-cam-1',mix,mixId:'demo-mix-16',play:false,transition:'Cut',duration:250}))).status,400);
 assert.equal(calls.length,before);
});
test('older/smaller vMix rejects a missing high mix without issuing controls',async()=>{
 const calls:URL[]=[];const transport=createDemoFetcher(undefined,4);
 const service=createVmixService({fetcher:(async(url,init)=>{calls.push(new URL(String(url)));return transport(url,init);}) as typeof fetch});
 assert.equal((await service(request({input:'demo-cam-1',mix:16,mixId:'demo-mix-16',play:false,transition:'Cut',duration:250}))).status,409);
 assert.ok(calls.every(url=>!url.search));
});
