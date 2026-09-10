import {validateStation, type Station} from './stations.ts';
export function validateLibrary(values: unknown): Station[] {
 if(!Array.isArray(values)||values.length>30)throw new Error('Limit: 30 profili.');
 const profiles=values.map(validateStation);
 if(new Set(profiles.map(p=>p.name)).size!==profiles.length)throw new Error('Ta nazwa profilu już istnieje.');
 return profiles;
}
export function uniqueName(name:string,profiles:Station[]):string {
 let next=name.slice(0,80),n=2;
 while(profiles.some(p=>p.name===next)){const suffix=` (${n++})`;next=name.slice(0,80-suffix.length)+suffix;}
 return next;
}
export function importLibrary(text:string,existing:Station[]):Station[]{
 if(text.length>2_000_000)throw new Error('Plik jest zbyt duży.');
 const data=JSON.parse(text);
 if(data?.format!=='vmix-control-profiles'||data.version!==1)throw new Error('Nieobsługiwany plik profili.');
 const incoming=validateLibrary(data.profiles),next=[...existing];
 for(const profile of incoming)next.push({...profile,name:uniqueName(profile.name,next)});
 return validateLibrary(next);
}
export function exportLibrary(profiles:Station[]):string{return JSON.stringify({format:'vmix-control-profiles',version:1,profiles:validateLibrary(profiles)},null,2);}
export function filterSources<T extends {title:string;number:string;type:string;favorite:boolean;assignedGroup:string}>(sources:T[],query:string,group:string|null,favorites:boolean):T[]{
 const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
 const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
 return sources.filter(s=>(!favorites||s.favorite)&&(group===null||s.assignedGroup===group)&&terms.every(t=>normalize(`${s.title} ${s.number} ${s.type}`).includes(t)));
}
