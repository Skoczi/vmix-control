export type ProgramControl =
 | {kind:'overlay';channel:number;enabled:boolean;input?:string;expected:string}
 | {kind:'ftb';enabled:boolean;expected:boolean};
export type ProgramState = {overlays:Record<number,string>;fadeToBlack:boolean|null;recording:boolean|null;streaming:boolean|null;external:boolean|null};
export function readProgramState(xml:string):ProgramState {
 const root=xml.replace(/<inputs\b[^>]*>[\s\S]*?<\/inputs>/g,'').replace(/<mix\b[^>]*>[\s\S]*?<\/mix>/g,'');
 const overlays:Record<number,string>={};
 const section=root.match(/<overlays\b[^>]*>([\s\S]*?)<\/overlays>/)?.[1]||'';
 for(const match of section.matchAll(/<overlay\b[^>]*\bnumber=["']([1-8])["'][^>]*?(?:\/>|>([\s\S]*?)<\/overlay>)/g))overlays[Number(match[1])]=(match[2]||'').trim();
 const flag=(name:string)=>{const value=root.match(new RegExp('<'+name+'>\\s*(True|False)\\s*</'+name+'>','i'))?.[1];return value===undefined?null:value.toLowerCase()==='true';};
 return {overlays,fadeToBlack:flag('fadeToBlack'),recording:flag('recording'),streaming:flag('streaming'),external:flag('external')};
}
export function validateProgramControl(value:unknown):ProgramControl {
 if(!value||typeof value!=='object')throw Error('Invalid program control.');
 const c=value as Record<string,unknown>;
 if(typeof c.enabled!=='boolean')throw Error('Invalid program control.');
 if(c.kind==='ftb'&&typeof c.expected==='boolean')return {kind:'ftb',enabled:c.enabled,expected:c.expected};
 if(c.kind==='overlay'&&Number.isInteger(c.channel)&&Number(c.channel)>=1&&Number(c.channel)<=8&&typeof c.expected==='string'&&/^[\w-]{0,80}$/.test(c.expected)&&(!c.enabled||(typeof c.input==='string'&&/^[\w-]{1,80}$/.test(c.input))))return c as ProgramControl;
 throw Error('Invalid program control.');
}

export function supportsAuxEffects(version:string){return version==='DEMO'||Number.parseInt(version,10)>=28;}
