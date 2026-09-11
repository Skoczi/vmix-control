import test from 'node:test';
import type {IncomingMessage} from 'node:http';
import {markLocalRequest} from '../lib/local-access.ts';
import assert from 'node:assert/strict';
import {type Operator,createPresenceService} from '../lib/operator-presence.ts';
import {shortcutAction} from '../lib/switcher-shortcuts.ts';
import {reorderInputs} from '../lib/reorder-inputs.ts';
import {createDashboardService,createVmixService} from '../lib/vmix-proxy.ts';
import {createDemoFetcher} from '../lib/vmix-demo.ts';
const request=(body:object,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/operators',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const operator={id:'operator-one',name:'Adam',address:'demo',mixId:'main',onAir:false};
test('presence is shared across clients, updated and isolated from live room',async()=>{const service=createPresenceService();await service(request(operator));let response=await(await service(request({...operator,id:'operator-two',name:'Eva',mixId:'demo-mix-2',onAir:true}))).json() as {operators:Operator[]};assert.equal(response.operators.length,2);assert.equal(response.operators[1].onAir,true);response=await(await service(request({...operator,id:'operator-live',address:'127.0.0.1:8088'}))).json() as {operators:Operator[]};assert.equal(response.operators.length,1);response=await(await service(request({...operator,mixId:'demo-mix-3'}))).json() as {operators:Operator[]};assert.equal(response.operators.length,2);assert.equal(response.operators[0].mixId,'demo-mix-3');});
test('disconnected operators expire and explicit leave removes presence',async()=>{let time=0;const service=createPresenceService(()=>time);await service(request(operator));time=20001;let response=await(await service(request({...operator,id:'operator-two'}))).json() as {operators:Operator[]};assert.equal(response.operators.length,1);response=await(await service(request({...operator,id:'operator-two',leave:true}))).json() as {operators:Operator[]};assert.equal(response.operators.length,0);});
test('presence rejects cross-origin and invalid identities',async()=>{const service=createPresenceService();assert.equal((await service(request(operator,'http://evil.test'))).status,403);assert.equal((await service(request({...operator,id:''}))).status,400);assert.equal((await service(request({...operator,address:'https://example.com'}))).status,400);});
const event={key:'1',repeat:false,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,isComposing:false};
test('shortcuts map bank positions, AUTO and dedicated CUT',()=>{assert.deepEqual(shortcutAction(event,false),{kind:'preview',index:0});assert.deepEqual(shortcutAction({...event,key:'='},false),{kind:'preview',index:11});assert.deepEqual(shortcutAction({...event,key:'Enter'},false),{kind:'take',effect:'auto'});assert.deepEqual(shortcutAction({...event,key:'c'},false),{kind:'take',effect:'cut'});assert.equal(shortcutAction({...event,key:'Enter'},false,true),null);});
test('shortcuts ignore typing, repeats, IME and system modifiers',()=>{assert.equal(shortcutAction(event,true),null);for(const flag of ['repeat','altKey','ctrlKey','metaKey','shiftKey','isComposing'])assert.equal(shortcutAction({...event,[flag]:true},false),null);});
test('dragging preserves identity and visibility, adopts destination group and favorites',()=>{const items=[{key:'a',visible:false,favorite:false,group:'A'},{key:'b',visible:true,favorite:true,group:'B'},{key:'c',visible:true,favorite:true,group:'B'}];const result=reorderInputs(items,'a','c');assert.deepEqual(result.map(i=>i.key),['b','c','a']);assert.deepEqual(result[2],{key:'a',visible:false,favorite:true,group:'B'});assert.equal(items[0].group,'A');assert.equal(reorderInputs(items,'absent','a'),items);});
test('return rejects stale program without sending commands; valid return is confirmed',async()=>{let time=0;const transport=createDemoFetcher(()=>time,4),commands:string[]=[];const service=createDashboardService(undefined,createVmixService({fetcher:(async(url,init)=>{const fn=new URL(String(url)).searchParams.get('Function');if(fn)commands.push(fn);return transport(url,init);}) as typeof fetch,now:()=>time,sleep:async ms=>{time+=ms;},cacheMs:0}));const body={address:'demo',input:'demo-cam-2',mix:1,mixId:'main',play:false,transition:'Cut',duration:500,action:'back'};assert.equal((await service(request({...body,expectedProgram:'demo-cam-3'}))).status,409);assert.equal((await service(request(body))).status,409);assert.equal(commands.length,0);assert.equal((await service(request({...body,expectedProgram:'demo-cam-1'}))).status,200);assert.deepEqual(commands,['Cut']);});


test('verified localhost presence is Host (Admin), while LAN clients retain their names',async()=>{
 const service=createPresenceService();
 const local={headers:{},socket:{remoteAddress:'127.0.0.1'}} as IncomingMessage;
 markLocalRequest(local);
 const localRequest=request({...operator,name:'Old saved name'});
 for(const [key,value] of Object.entries(local.headers))localRequest.headers.set(key,String(value));
 const host=await (await service(localRequest)).json() as {operators:Operator[]};
 assert.equal(host.operators[0].name,'Host (Admin)');
 const remote={headers:{...local.headers,'x-forwarded-for':'127.0.0.1'},socket:{remoteAddress:'192.168.1.20'}} as unknown as IncomingMessage;
 markLocalRequest(remote);
 const remoteRequest=request({...operator,id:'remote-person',name:'Eva'});
 for(const [key,value] of Object.entries(remote.headers))remoteRequest.headers.set(key,String(value));
 const observed=await (await service(remoteRequest)).json() as {operators:Operator[]};
 assert.deepEqual(observed.operators.map(op=>op.name),['Host (Admin)','Eva']);
});
