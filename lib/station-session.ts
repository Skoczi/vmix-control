import { decodeStation, validateStation, type Station } from './stations.ts';
export function restoreStationSession(href:string,saved:string|null):{station:Station|null;cleanUrl:string;imported:boolean}{
 const url=new URL(href);const hash=new URLSearchParams(url.hash.slice(1));const encoded=hash.get('station');
 if(encoded!==null){const station=decodeStation(encoded);hash.delete('station');url.hash=hash.toString();return {station,cleanUrl:url.href,imported:true};}
 return {station:saved?validateStation(JSON.parse(saved)):null,cleanUrl:url.href,imported:false};
}
export function selectedProfile(profiles:Station[],value:string):Station|undefined {return /^\d+$/.test(value)?profiles[Number(value)]:undefined;}
