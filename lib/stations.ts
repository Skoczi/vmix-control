import { TRANSITIONS } from './transitions.ts';
export type LayoutItem = { key: string; visible: boolean; favorite: boolean; group: string };
export type Layout = { items: LayoutItem[]; showNew: boolean; size: 'compact'|'normal'|'large' };
export type Station = { version: 1; name: string; address: string; mixId: string; transition: string; duration: number; play: boolean; layout: Layout };
export const DEFAULT_LAYOUT: Layout = { items: [], showNew: true, size: 'normal' };
export function validateStation(value: unknown): Station {
  const p=value as Station;
  if(!p || p.version!==1 || typeof p.name!=='string' || !p.name.trim() || p.name.length>80 || typeof p.mixId!=='string' || !/^[\w-]{1,80}$/.test(p.mixId) || !TRANSITIONS.some(t=>t===p.transition) || !Number.isInteger(p.duration) || p.duration<1 || p.duration>10000 || typeof p.play!=='boolean') throw new Error('Nieprawidłowy profil stanowiska.');
  if(typeof p.address!=='string')throw new Error('Nieprawidłowy adres stanowiska.');
  const url=new URL(p.address==='demo'?'http://127.0.0.1:18088':p.address.includes('://')?p.address:`http://${p.address}`);
  const parts=url.hostname.split('.').map(Number);
  const local=url.hostname==='localhost'|| (parts.length===4&&parts.every(n=>Number.isInteger(n)&&n>=0&&n<=255)&&(parts[0]===127||parts[0]===10||(parts[0]===192&&parts[1]===168)||(parts[0]===172&&parts[1]>=16&&parts[1]<=31)));
  if(!local||url.protocol!=='http:'||url.username||url.password||url.search||url.hash||!['/','/api','/api/'].includes(url.pathname))throw new Error('Profil wymaga lokalnego adresu vMix.');
  if(!p.layout||!['compact','normal','large'].includes(p.layout.size)||typeof p.layout.showNew!=='boolean'||!Array.isArray(p.layout.items)||p.layout.items.length>300)throw new Error('Nieprawidłowy układ stanowiska.');
  const keys=new Set<string>();
  for(const item of p.layout.items){if(!item||typeof item.key!=='string'||!/^[\w-]{1,80}$/.test(item.key)||keys.has(item.key)||typeof item.visible!=='boolean'||typeof item.favorite!=='boolean'||typeof item.group!=='string'||item.group.length>40)throw new Error('Nieprawidłowa lista inputów.');keys.add(item.key);}
  return {version:1,name:p.name.trim(),address:p.address,mixId:p.mixId,transition:p.transition,duration:p.duration,play:p.play,layout:{size:p.layout.size,showNew:p.layout.showNew,items:p.layout.items.map(i=>({...i,group:i.group.trim()}))}};
}
export function encodeStation(value: Station) {return btoa(Array.from(new TextEncoder().encode(JSON.stringify(validateStation(value))),b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decodeStation(encoded:string) {if(encoded.length>100000)throw new Error('Link stanowiska jest zbyt długi.');return validateStation(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)))));}
export function arrangeSources<T extends {key:string}>(inputs:T[],layout:Layout):Array<T&{stationGroup:string;assignedGroup:string;favorite:boolean}> {
  const map=new Map(layout.items.map((item,index)=>[item.key,{...item,index}]));
  const ordered=inputs.filter(i=>map.get(i.key)?.visible??layout.showNew).map(i=>({...i,assignedGroup:map.get(i.key)?.group||'Pozostałe',stationGroup:map.get(i.key)?.favorite?'Ulubione':map.get(i.key)?.group||'Pozostałe',favorite:map.get(i.key)?.favorite||false})).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||(map.get(a.key)?.index??Infinity)-(map.get(b.key)?.index??Infinity));
  const groups=[...new Set(ordered.map(i=>i.stationGroup))];return groups.flatMap(group=>ordered.filter(i=>i.stationGroup===group));
}
export function editItems<T extends {key:string}>(inputs:T[],layout:Layout):LayoutItem[] {
  const known=new Set(layout.items.map(i=>i.key));return [...layout.items,...inputs.filter(i=>!known.has(i.key)).map(i=>({key:i.key,visible:layout.showNew,favorite:false,group:''}))];
}
