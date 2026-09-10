import {programRows} from './program.ts';
import {LANGUAGES,rows,type Language} from './catalog.ts';
import {messageRows,aliases} from './messages.ts';
import {accessRows} from './access.ts';
import {operationsRows} from './operations.ts';
import {dynamicRows} from './dynamic.ts';
export {LANGUAGES,type Language};
export const catalog=[rows,messageRows,dynamicRows,operationsRows,accessRows,programRows].flatMap(text=>text.trim().split('\n').map(line=>line.split('|')));
export function isLanguage(value:unknown):value is Language{return LANGUAGES.some(([code])=>code===value);}
const dictionary=new Map<string,string[]>();
for(const row of catalog){if(row.length!==LANGUAGES.length||row.some(s=>!s))throw new Error(`Incomplete translation: ${row[0]}`);dictionary.set(row[1],row);}
// Recognize already-displayed messages when the operator changes language.
for(const row of catalog)for(const value of row)if(!dictionary.has(value))dictionary.set(value,row);
const escape=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=catalog.filter(row=>/^(Ten dashboard|vMix zwrócił|Nie można odczytać|Zapisano stanowisko|Usunięto)/.test(row[1])).map(row=>{const keys=[...row[1].matchAll(/\{(\w+)\}/g)].map(m=>m[1]);const pieces=row[1].split(/\{\w+\}/g);return {row,keys,re:new RegExp('^'+pieces.map(escape).join('([\\s\\S]*?)')+'$')};});
export function translate(source:string,language:Language,params:Record<string,string|number>={}):string{
 const index=LANGUAGES.findIndex(([code])=>code===language);
 const key=aliases[source]||source;
 let values=params,row=dictionary.get(key);
 if(!row){for(const pattern of patterns){const match=key.match(pattern.re);if(match){row=pattern.row;values=Object.fromEntries(pattern.keys.map((key,i)=>[key,key==='detail'?translate(match[i+1],language):match[i+1]]));break;}}}
 return (row?.[index]||source).replace(/\{(\w+)\}/g,(all,key)=>Object.hasOwn(values,key)?String(values[key]):all);
}
