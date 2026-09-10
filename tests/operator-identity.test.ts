import test from 'node:test';
import assert from 'node:assert/strict';
import {operatorIdentity} from '../lib/operator-identity.ts';
import {createPresenceService} from '../lib/operator-presence.ts';
function store(){const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};}
test('100 reloads reuse one presence record; another session remains separate',async()=>{
 const storage=store(),other=store(),service=createPresenceService();let count=0;
 const create=()=>String(++count).padStart(32,'0');
 const send=async(id:string,mixId:string)=>{const response=await service(new Request('http://localhost/api/operators',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,mixId,address:'demo',name:'Operator',onAir:false})}));return await response.json() as {operators:{id:string;mixId:string}[]};};
 for(let i=0;i<100;i++){
  const id=operatorIdentity(storage,create);
  const data=await send(id,i%2?'main':'demo-mix-2');
  assert.equal(data.operators.length,1);
  assert.equal(data.operators[0].mixId,i%2?'main':'demo-mix-2');
 }
 assert.equal(count,1);
 const result=await send(operatorIdentity(other,create),'main');
 assert.equal(result.operators.length,2);
 assert.notEqual(result.operators[0].id,result.operators[1].id);
});
test('malformed stored identity is replaced once',()=>{
 const storage=store();storage.setItem('vmix-operator-session-v1','bad');
 assert.equal(operatorIdentity(storage,()=> 'a'.repeat(32)),'a'.repeat(32));
 assert.equal(operatorIdentity(storage,()=>{throw Error('must reuse');}),'a'.repeat(32));
});
