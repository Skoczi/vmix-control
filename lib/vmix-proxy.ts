import {readProgramState,supportsAuxEffects,validateProgramControl,type ProgramControl} from './program-controls.ts';
import {isLocalRequest} from './local-access.ts';
import {validMixNumber} from './vmix-limits.ts';
import {createDemoFetcher} from './vmix-demo.ts';
import { transitionParameters } from './transitions.ts';
import { readVmixState } from './vmix-xml.ts';
import { isIP } from 'node:net';
import { networkInterfaces } from 'node:os';

export function vmixUrl(address: unknown) {
  if (typeof address !== 'string') throw new Error('Podaj adres IP komputera z vMix.');
  const url = new URL(address.includes('://') ? address : `http://${address}`);
  const host = url.hostname;
  const octets = host.split('.').map(Number);
  const local = host === 'localhost' || (isIP(host) === 4 && (octets[0] === 10 || octets[0] === 127 || (octets[0] === 192 && octets[1] === 168) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)));
  if (url.protocol !== 'http:' || !local || url.username || url.password || url.search || url.hash || !['/', '/api', '/api/'].includes(url.pathname)) throw new Error('Podaj lokalny adres IPv4, np. 192.168.1.100:8088, bez hasła i parametrów.');
  if (!url.port) url.port = '8088';
  url.pathname = '/api/';
  return url;
}

export function canonicalVmixUrl(address:unknown,localAddresses:string[]=[]){const url=vmixUrl(address);if(url.hostname==='localhost'||url.hostname.startsWith('127.')||localAddresses.includes(url.hostname))url.hostname='127.0.0.1';return url;}

type ServiceOptions = { fetcher?: typeof fetch; now?: () => number; sleep?: (ms:number) => Promise<void>; cacheMs?: number; localAddresses?: string[] };
export function createVmixService({fetcher=fetch,now=Date.now,sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms)),cacheMs=500,localAddresses=Object.values(networkInterfaces()).flatMap(entries=>(entries||[]).filter(e=>e.family==='IPv4').map(e=>e.address))}:ServiceOptions={}) {
  let instance: string | undefined;
  let instanceConfirmed=false;
  let routingAddress:string|undefined;
  const cache = new Map<string,{xml:string;time:number}>();
  const pending = new Map<string,Promise<string>>();
  const locks = new Set<string>();
  const json = (data:object,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  async function call(base:URL,params?:Record<string,string>) {
    const url=new URL(base); if(params) url.search=new URLSearchParams(params).toString();
    const res=await fetcher(url,{signal:AbortSignal.timeout(2500),redirect:'error',cache:'no-store'});
    if(!res.ok) throw new Error(`vMix zwrócił błąd ${res.status}. Sprawdź input, mix i konfigurację przejścia.`);
    return res.text();
  }
  async function read(base:URL,fresh=false) {
    const key=base.href;
    if(pending.has(key)) { await pending.get(key); if(!fresh) return cache.get(key)!.xml; }
    const previous=cache.get(key);
    if(!fresh && previous && now()-previous.time<cacheMs) return previous.xml;
    // Recheck after awaiting a concurrent request, then share this read.
    if(pending.has(key)) return pending.get(key)!;
    const promise=call(base).then(xml=>{readVmixState(xml);cache.set(key,{xml,time:now()});if(cache.size>64)cache.delete(cache.keys().next().value!);return xml;}).finally(()=>pending.delete(key));
    pending.set(key,promise); return promise;
  }
  return async function handle(request:Request) {
    const origin=request.headers.get('origin');
    if(origin && origin!==new URL(request.url).origin) return new Response('Niedozwolone źródło żądania.',{status:403});
    if(!request.headers.get('content-type')?.startsWith('application/json')) return new Response('Wymagany JSON.',{status:415});
    let body:Record<string,unknown>;let base:URL;let transition:Record<string,string>={};let control:ProgramControl|undefined;
    try {
      const raw=await request.text();if(raw.length>4096)throw new Error('Zbyt duże żądanie.');
      body=JSON.parse(raw);base=vmixUrl(body.address);
      if(body.control!==undefined){control=validateProgramControl(body.control);if(typeof body.mix!=='number'||!validMixNumber(body.mix)||typeof body.mixId!=='string'||!body.mixId||body.input!==undefined||body.action!==undefined||(control.kind==='ftb'&&(body.mix!==1||body.mixId!=='main')))throw Error('Invalid control destination. FTB requires PGM.');}
      if(body.action!==undefined&&!['preview','take','route','back'].includes(String(body.action)))throw new Error('Nieprawidłowa operacja.');
      if(body.input!==undefined){
        if(typeof body.input!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(body.input)||typeof body.mix!=='number'||!validMixNumber(body.mix)||typeof body.play!=='boolean'||typeof body.mixId!=='string'||!body.mixId)throw new Error('Nieprawidłowy input lub identyfikator mixu. Odśwież panel.');
        transition=body.action==='preview'?{Function:'PreviewInput'}:transitionParameters(body.transition,body.duration);
      }
    } catch(e){return new Response(e instanceof Error?e.message:'Nieprawidłowe żądanie.',{status:400});}
    const identity=canonicalVmixUrl(base.href,localAddresses).href;
    if(instance && instance!==identity)return json({status:'wrong-instance',message:`Ten dashboard jest połączony z ${routingAddress}. Użyj tego adresu. Aby zmienić komputer vMix, uruchom ponownie serwer dashboardu.`},409);
    instance ??= identity; routingAddress ??= base.href; base=new URL(routingAddress);
    if(body.input===undefined&&!control){try{const xml=await read(base);instanceConfirmed=true;return new Response(xml,{headers:{'Content-Type':'application/xml','Cache-Control':'no-store'}});}catch(e){if(!instanceConfirmed){instance=undefined;routingAddress=undefined;}return new Response(e instanceof Error?e.message:'Brak połączenia z vMix.',{status:502});}}
    const mix=Number(body.mix); const lock=`instance|${mix}`;
    const operationLocks=[lock,...(control?.kind==='overlay'?[`overlay|${control.channel}`]:transition.Function?.startsWith('Stinger')?[`stinger|${transition.Function}`]:[])];
    if(operationLocks.some(key=>locks.has(key)))return json({message:'Ten mix wykonuje polecenie innego operatora. Poczekaj na zakończenie.',status:'busy'},409);
    operationLocks.forEach(key=>locks.add(key));
    let sent=false;let warning='';let sentAt=0;
    try {
      const before=readVmixState(await read(base,true));instanceConfirmed=true;
      if(!(mix in before.active)||before.mixId(mix)!==body.mixId)return json({message:'Zmieniło się przypisanie mixu. Odśwież panel i wybierz go ponownie.',status:'rejected'},409);
      if(control){
        const controlXml=await read(base,true);
        const state=readProgramState(controlXml);
        if(mix!==1&&!supportsAuxEffects(controlXml.match(/<version>([^<]+)<\/version>/)?.[1]||''))return json({message:'Additional mix effects require vMix 28 or newer.',status:'rejected'},409);
        let params:Record<string,string>;
        let expectedNumber='';
        if(control.kind==='overlay'){
          if(!(control.channel in state.overlays))return json({message:'Overlay channel is unavailable.',status:'rejected'},409);
          const current=before.inputs.find(i=>i.number===state.overlays[control.channel]||i.key===state.overlays[control.channel])?.key||'';
          if(current!==control.expected)return json({message:'Overlay changed. Refresh and try again.',status:'rejected'},409);
          const source=before.inputs.find(i=>i.key===control.input);
          if(control.enabled&&source?.key===body.mixId)return json({message:'Cannot overlay a mix onto itself.',status:'rejected'},400);
          if(control.enabled&&!source)return json({message:'Input is unavailable.',status:'rejected'},409);
          expectedNumber=control.enabled?source!.number:'';
          params=control.enabled?{Function:`OverlayInput${control.channel}In`,Input:source!.key,Mix:String(mix-1)}:{Function:`OverlayInput${control.channel}Out`};
          if(!control.enabled&&state.overlays[control.channel]===expectedNumber)return json({status:'confirmed'});
        }else{
          if(state.fadeToBlack===null||state.fadeToBlack!==control.expected)return json({message:'FTB state changed. Refresh and try again.',status:'rejected'},409);
          if(state.fadeToBlack===control.enabled)return json({status:'confirmed'});
          params={Function:'FadeToBlack'};
        }
        sentAt=now();sent=true;
        await call(base,params);
        for(let attempt=0;attempt<24;attempt++){
          const updated=readProgramState(await read(base,true));
          if(control.kind==='overlay'?updated.overlays[control.channel]===expectedNumber:updated.fadeToBlack===control.enabled)return json({status:'confirmed'});
          await sleep(250);
        }
        return json({status:'uncertain',message:'Command sent; state not confirmed. Check vMix.'},504);
      }
      const input=before.inputs.find(i=>i.key===body.input);
      if(!input)return json({message:'Ten input nie jest już dostępny w vMix.',status:'rejected'},409);
      if(body.input===body.mixId)return json({message:'Nie można wysłać mixu na niego samego.',status:'rejected'},400);
      if(body.action==='take'&&before.preview[mix]!==input.number)return json({message:'Podgląd zmienił się. Sprawdź PREVIEW i ponów przejście.',status:'rejected'},409);
      if(body.action==='back'&&(typeof body.expectedProgram!=='string'||before.inputs.find(i=>i.number===before.active[mix])?.key!==body.expectedProgram))return json({message:'Program zmienił się. Sprawdź PROGRAM i ponów powrót.',status:'rejected'},409);
      sentAt=now();sent=true; // From this point a timeout has an uncertain result; never retry the command.
      await call(base,{...transition,Input:String(body.input),Mix:String(mix-1)});
      if(body.play&&body.action!=='preview'){try{await call(base,{Function:'Play',Input:String(body.input)});}catch{warning='Źródło przełączono, ale vMix nie potwierdził odtwarzania.';}}
      const stinger=transition.Function?.startsWith('Stinger');
      // For ordinary effects don't release the mix before the requested duration.
      // Stinger XML confirms the program source, not completion of the animation.
      await sleep(stinger?2000:Number(transition.Duration||0));
      for(let attempt=0;attempt<8;attempt++){
        const state=readVmixState(await read(base,true));
        if(state.mixId(mix)!==body.mixId)return json({message:'Konfiguracja mixów zmieniła się podczas polecenia. Sprawdź program w vMix.',status:'uncertain'},409);
        const current=state.inputs.find(i=>i.key===body.input);
        if(current && (body.action==='preview'?state.preview[mix]:state.active[mix])===current.number)return json({status:'confirmed',message:warning||(body.action==='preview'?'Potwierdzono podgląd.':'Potwierdzono źródło na programie.'),warning,stinger});
        await sleep(250);
      }
      return json({status:'uncertain',message:'Wysłano polecenie, ale nie potwierdzono docelowego źródła. Sprawdź vMix przed kolejnym kliknięciem.'},504);
    }catch(e){
      if(sent) await sleep(Math.max(1500,(transition.Function?.startsWith('Stinger')?2000:Number(transition.Duration||0))-(now()-sentAt)));
      return json({status:sent?'uncertain':'failed',message:sent?'Wynik polecenia jest niepewny. Sprawdź program w vMix. Polecenie nie zostało ponowione.':`Nie można odczytać vMix. ${e instanceof Error?e.message:''}`},502);
    }finally{if(!instanceConfirmed){instance=undefined;routingAddress=undefined;}cache.delete(base.href);operationLocks.forEach(key=>locks.delete(key));}
  };
}
export function createDashboardService(real=createVmixService(),demo=createVmixService({fetcher:createDemoFetcher()}),canConfigure:(request:Request)=>boolean=()=>true) {
 let activeTarget:string|null=null;
 return async (request:Request)=>{
  if(request.method==='GET')return new Response(JSON.stringify({address:activeTarget}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return new Response('JSON required',{status:415});
  // Dispatch only the explicit demo target to an isolated, in-memory instance.
  const raw=await request.clone().text();
  let body:Record<string,unknown>|undefined;
  if(raw.length<=4096){try{body=JSON.parse(raw);}catch{}}
  if(body?.disconnect===true){if(!canConfigure(request))return new Response('Forbidden',{status:403});activeTarget=null;return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}});}
  if(!canConfigure(request)){
   if(body?.connect===true)return new Response(JSON.stringify({message:'Only the local operator can change the connection.'}),{status:403,headers:{'Content-Type':'application/json'}});
   if(!activeTarget)return new Response(JSON.stringify({message:'Waiting for the local operator to connect.'}),{status:409,headers:{'Content-Type':'application/json'}});
   if(!body)return new Response('Invalid request',{status:400});
   if((body.input!==undefined||body.control!==undefined)&&body.address!==activeTarget)return new Response(JSON.stringify({message:'Connection changed. Refresh the dashboard.'}),{status:409,headers:{'Content-Type':'application/json'}});
   body={...body,address:activeTarget};request=new Request(request.url,{method:request.method,headers:request.headers,body:JSON.stringify(body)});
  }
  if(body?.address==='demo'){
   const forwarded=new Request(request.url,{method:request.method,headers:request.headers,body:JSON.stringify({...body,address:'127.0.0.1:18088'})});
   const response=await demo(forwarded);
   if(response.ok&&body.input===undefined&&body.control===undefined&&(body.connect===true||!activeTarget))activeTarget='demo';
   return response;
  }
  const response=await real(request);
  if(response.ok&&body?.input===undefined&&body?.control===undefined&&typeof body?.address==='string'&&(body.connect===true||!activeTarget))activeTarget=body.address;
  return response;
 };
}
export const handleVmix=createDashboardService(undefined,undefined,isLocalRequest);
