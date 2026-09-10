'use client';
import {useEffect,useState} from 'react';
import {operatorIdentity} from '@/lib/operator-identity';
import type {Operator} from '@/lib/operator-presence';
let fallbackIdentity='';
function browserIdentity(){
 const create=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
 try{return operatorIdentity(localStorage,()=>{try{const previous=sessionStorage.getItem('vmix-operator-session-v1');if(previous&&/^[a-f0-9]{32}$/.test(previous))return previous;}catch{}return create();});}catch{return fallbackIdentity||(fallbackIdentity=create());}
}
export function useOperators(address:string,mixId:string,name:string,onAir:boolean,online:boolean){
 const [operators,setOperators]=useState<Operator[]>([]),[available,setAvailable]=useState(true);
 useEffect(()=>{
  if(!address||!online){setOperators([]);return;}
  let stopped=false;let timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  
  async function tick(){try{const id=browserIdentity();const body={id,address,mixId,name,onAir};const response=await fetch('/api/operators',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(6000)])});if(!response.ok)throw Error();const data=await response.json() as {operators:Operator[]};if(!stopped){setOperators(data.operators.filter(o=>o.id!==id));setAvailable(true);}}catch{if(!stopped){setAvailable(false);setOperators([]);}}finally{if(!stopped)timer=setTimeout(tick,5000);}}
  void tick();return()=>{stopped=true;controller.abort();clearTimeout(timer);};
 },[address,mixId,name,onAir,online]);
 return {operators,available};
}
