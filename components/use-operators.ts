'use client';
import {useEffect,useRef,useState} from 'react';
import type {Operator} from '@/lib/operator-presence';
export function useOperators(address:string,mixId:string,name:string,onAir:boolean,online:boolean){
 const id=useRef('');const [operators,setOperators]=useState<Operator[]>([]),[available,setAvailable]=useState(true);
 useEffect(()=>{
  if(!address||!online){setOperators([]);return;}
  if(!id.current)id.current=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');let stopped=false;let timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  const body={id:id.current,address,mixId,name,onAir};
  async function tick(){try{const response=await fetch('/api/operators',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(6000)])});if(!response.ok)throw Error();const data=await response.json() as {operators:Operator[]};if(!stopped){setOperators(data.operators.filter(o=>o.id!==id.current));setAvailable(true);}}catch{if(!stopped){setAvailable(false);setOperators([]);}}finally{if(!stopped)timer=setTimeout(tick,5000);}}
  void tick();return()=>{stopped=true;controller.abort();clearTimeout(timer);};
 },[address,mixId,name,onAir,online]);
 return {operators,available};
}
