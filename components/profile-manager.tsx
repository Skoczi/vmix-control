'use client';
import {useLanguage} from '@/components/language-provider';
import {useRef,useState} from 'react';
import {Copy,Download,Upload,Pencil,Trash2,Check,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {exportLibrary,importLibrary,uniqueName} from '@/lib/profile-library';
import type {Station} from '@/lib/stations';
export function ProfileManager({profiles,onChange,onRename,disabled}:{profiles:Station[];onChange:(p:Station[])=>void;onRename:(old:string,next:string)=>void;disabled:boolean}){
 const {t}=useLanguage();
 const file=useRef<HTMLInputElement>(null),latest=useRef(profiles);latest.current=profiles;
 const [editing,setEditing]=useState<string|null>(null),[name,setName]=useState(''),[message,setMessage]=useState(''),[reading,setReading]=useState(false),[deleted,setDeleted]=useState<Station|null>(null);
 const locked=disabled||reading;
 function run(action:()=>void){try{action();setMessage('');}catch(e){setMessage(e instanceof Error?e.message:t("Nie udało się zapisać profili."));}}
 function download(){run(()=>{const url=URL.createObjectURL(new Blob([exportLibrary(profiles)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='vmix-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
 return <div className="profile-library"><div className="library-heading"><h3>{t("Zapisane profile")} <span>{profiles.length}/30</span></h3><div><Button variant="outline" disabled={locked} onClick={()=>file.current?.click()}><Upload size={15}/>{t("Importuj")}</Button><Button variant="outline" disabled={locked||!profiles.length} onClick={download}><Download size={15}/>{t("Eksportuj")}</Button></div></div>
 <input ref={file} hidden type="file" accept=".json,application/json" onChange={async e=>{const selected=e.target.files?.[0];e.target.value='';if(!selected)return;setReading(true);try{if(selected.size>2_000_000)throw new Error(t("Plik jest zbyt duży."));const text=await selected.text();onChange(importLibrary(text,latest.current));setMessage(t("Zaimportowano profile."));}catch(err){setMessage(err instanceof Error?err.message:t("Nie udało się odczytać pliku."));}finally{setReading(false);}}}/>
 {!profiles.length&&<p className="library-empty">{t("Brak zapisanych profili")}</p>}
 {profiles.map(p=><div className="profile-row" key={p.name}>{editing===p.name?<form onSubmit={e=>{e.preventDefault();run(()=>{const next=name.trim();onChange(profiles.map(item=>item.name===p.name?{...item,name:next}:item));onRename(p.name,next);setEditing(null);});}}><Input aria-label={t("Nowa nazwa profilu")} autoFocus maxLength={80} value={name} onChange={e=>setName(e.target.value)} disabled={locked}/><Button type="submit" variant="outline" disabled={locked||!name.trim()} aria-label={t("Zapisz nazwę")}><Check size={16}/></Button><Button type="button" variant="ghost" onClick={()=>setEditing(null)} aria-label={t("Anuluj zmianę nazwy")}><X size={16}/></Button></form>:<><div className="profile-identity"><strong>{p.name}</strong><span>{p.address} · {p.transition}</span></div><div className="profile-actions"><Button variant="ghost" disabled={locked} title={t("Zmień nazwę")} aria-label={t("Zmień nazwę {name}",{name:p.name})} onClick={()=>{setEditing(p.name);setName(p.name);}}><Pencil size={16}/></Button><Button variant="ghost" disabled={locked||profiles.length>=30} title={t("Duplikuj")} aria-label={t("Duplikuj {name}",{name:p.name})} onClick={()=>run(()=>onChange([...profiles,{...p,name:uniqueName(t("{name} — kopia",{name:p.name}),profiles)}]))}><Copy size={16}/></Button><Button variant="ghost" disabled={locked} title={t("Usuń")} aria-label={t("Usuń {name}",{name:p.name})} onClick={()=>run(()=>{onChange(profiles.filter(item=>item.name!==p.name));setDeleted(p);})}><Trash2 size={16}/></Button></div></>}</div>)}
 {deleted&&<div className="library-undo"><span>{t('Usunięto „{name}”',{name:deleted.name})}</span><Button variant="ghost" disabled={locked} onClick={()=>run(()=>{onChange([...profiles,{...deleted,name:uniqueName(deleted.name,profiles)}]);setDeleted(null);})}>{t("Cofnij")}</Button></div>}
 {message&&<p role="status" className="library-message">{t(message)}</p>}
 </div>;
}
