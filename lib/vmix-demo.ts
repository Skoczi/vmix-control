import {MAX_MIXES,validMixNumber} from './vmix-limits.ts';
import {TRANSITIONS} from './transitions.ts';
// In-memory API transport: no network requests, video frames or real vMix commands.
export function createDemoFetcher(now:()=>number=Date.now,mixCount=MAX_MIXES):typeof fetch {
 if(!validMixNumber(mixCount)||mixCount<4)throw new Error('Demo obsługuje od 4 do 16 mixów.');
 const inputs=[
  ['demo-mix-2','AUX 1','Mix'],['demo-mix-3','AUX 2','Mix'],['demo-mix-4','AUX 3','Mix'],
  ['demo-cam-1','Camera 1 · Studio','Capture'],['demo-cam-2','Camera 2 · Guest','Capture'],['demo-cam-3','Camera 3 · Wide Shot','Capture'],
  ['demo-video-1','Show Intro','Video'],['demo-video-2','News Package','Video'],['demo-title-1','Lower Third · Guest','GT'],['demo-title-2','Live Scores','GT'],['demo-image-1','Break Slate','Image'],['demo-colour-1','Black','Colour'],
  ...Array.from({length:mixCount-4},(_,i)=>[`demo-mix-${i+5}`,`AUX ${i+4}`,'Mix'])
 ].map(([key,title,type],i)=>({key,title,type,number:String(i+1),state:type==='Capture'?'Running':'Paused'}));
 const active:Record<number,string>={0:'4',1:'5',2:'6',3:'11'};
 const preview:Record<number,string>={0:'5',1:'4',2:'7',3:'8'};
 for(let mix=4;mix<mixCount;mix++){active[mix]=String(4+mix%9);preview[mix]=String(4+(mix+1)%9);}
 const overlays:Record<number,string>=Object.fromEntries(Array.from({length:8},(_,i)=>[i+1,'']));
 let fadeToBlack=false;
 const pending=new Map<number,{number:string;at:number}>();
 const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const settle=()=>{for(const [mix,item] of pending)if(now()>=item.at){preview[mix]=active[mix];active[mix]=item.number;pending.delete(mix);}};
 return (async (request:RequestInfo|URL)=>{
  const url=new URL(request instanceof Request?request.url:String(request));settle();
  const fn=url.searchParams.get('Function');
  if(fn){
   if(fn==='FadeToBlack'){fadeToBlack=!fadeToBlack;return new Response('OK');}
   const overlay=fn.match(/^OverlayInput([1-8])(In|Out)$/);
   if(overlay){const n=Number(overlay[1]);if(overlay[2]==='Out'){overlays[n]='';return new Response('OK');}const mix=Number(url.searchParams.get('Mix')||'0');if(!(mix in active))return new Response('Invalid mix',{status:400});const source=inputs.find(i=>i.key===url.searchParams.get('Input'));if(!source||source.key===`demo-mix-${mix+1}`)return new Response('Unknown input',{status:400});overlays[n]=source.number;return new Response('OK');}

   const input=inputs.find(i=>i.key===url.searchParams.get('Input')||i.number===url.searchParams.get('Input'));
   if(!input)return new Response('Unknown input',{status:400});
   if(fn==='Play'){input.state='Running';return new Response('OK');}
   const mix=Number(url.searchParams.get('Mix')||'0');
   if(fn==='PreviewInput'){if(!(mix in active)||input.key===`demo-mix-${mix+1}`)return new Response('Invalid mix',{status:400});preview[mix]=input.number;return new Response('OK');}
   if(!TRANSITIONS.some(t=>t===fn)||!(mix in active)||input.key===`demo-mix-${mix+1}`)return new Response('Unsupported command',{status:400});
   const duration=fn==='Cut'?0:fn.startsWith('Stinger')?2000:Number(url.searchParams.get('Duration')||500);
   if(!Number.isInteger(duration)||duration<0||duration>10000)return new Response('Invalid duration',{status:400});
   pending.set(mix,{number:input.number,at:now()+duration});settle();return new Response('OK');
  }
  const xml=`<?xml version="1.0" encoding="utf-8"?><vmix><version>DEMO</version><inputs>${inputs.map(i=>`<input key="${i.key}" number="${i.number}" type="${i.type}" title="${escape(i.title)}" state="${i.state}"/>`).join('')}</inputs><overlays>${Object.entries(overlays).map(([n,value])=>`<overlay number="${n}">${value}</overlay>`).join('')}</overlays><fadeToBlack>${fadeToBlack?'True':'False'}</fadeToBlack><recording>False</recording><streaming>False</streaming><external>False</external><active>${active[0]}</active><preview>${preview[0]}</preview>${Array.from({length:mixCount-1},(_,i)=>i+1).map(m=>`<mix number="${m+1}"><active>${active[m]}</active><preview>${preview[m]}</preview></mix>`).join('')}</vmix>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml'}});
 }) as typeof fetch;
}
