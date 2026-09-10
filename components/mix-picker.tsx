'use client';
import {useLanguage} from '@/components/language-provider';
import {useState} from 'react';
import {Layers,ChevronDown,LayoutGrid} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle} from '@/components/ui/popover';
import {Command,CommandInput,CommandList,CommandEmpty,CommandGroup,CommandItem} from '@/components/ui/command';
import './mix-picker.css';
type MixOption={id:string;name:string;number:number};
export function MixPicker({mixes,value,onChange,disabled,loaded}:{mixes:MixOption[];value:string;onChange:(value:string)=>void;disabled:boolean;loaded:boolean}){
 const {t}=useLanguage();
 const [open,setOpen]=useState(false);
 const selected=mixes.find(m=>m.id===value);
 const label=value==='all'?t("Wszystkie mixy"):selected?.name||(loaded?t("Mix niedostępny"):t("Zapamiętany mix"));
 function choose(id:string){if(disabled)return;onChange(id);setOpen(false);}
 const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
 return <Popover open={open&&!disabled} onOpenChange={setOpen}><PopoverTrigger render={<Button variant="outline"/>} id="operator-mix" className="mix-picker-trigger" disabled={disabled} aria-label={t("Wybierz mix: {name}",{name:label})}><span className="mix-picker-icon">{value==='all'?<LayoutGrid size={16}/>:<Layers size={16}/>}</span><span className="mix-picker-value"><strong>{label}</strong><small>{selected?`MIX ${String(selected.number).padStart(2,'0')}`:value==='all'?t("{count} dostępnych",{count:mixes.length}):loaded?t("Wybierz inny"):t("Połącz z vMix")}</small></span><ChevronDown size={15} className="mix-picker-chevron"/></PopoverTrigger><PopoverContent className="mix-picker-popup" align="end" sideOffset={8}><PopoverTitle className="mix-picker-caption">{t("WYBIERZ MIX")} <span>{mixes.length}</span></PopoverTitle><Command className="mix-picker-command" label={t("Wybór mixa")} filter={(text,search,keywords)=>normalize([text,...keywords||[]].join(' ')).includes(normalize(search).trim())?1:0}><CommandInput autoFocus placeholder={t("Szukaj nazwy lub numeru…")} aria-label={t("Szukaj mixa")}/><CommandList className="mix-picker-list"><CommandEmpty>{t("Nie znaleziono mixa")}</CommandEmpty><CommandGroup><CommandItem value="all" keywords={[t("Wszystkie mixy"),'matryca']} data-checked={value==='all'} onSelect={()=>choose('all')} className="mix-picker-all"><span className="mix-option-number"><LayoutGrid size={15}/></span><span className="mix-option-name">{t("Wszystkie mixy")}<small>{t("Matryca źródeł")}</small></span></CommandItem></CommandGroup><CommandGroup heading={t("Dostępne mixy")}>{mixes.map(m=><CommandItem key={m.id} value={m.id} keywords={[m.name,`Mix ${m.number}`,String(m.number)]} data-checked={value===m.id} onSelect={()=>choose(m.id)}><span className="mix-option-number">{String(m.number).padStart(2,'0')}</span><span className="mix-option-name" title={m.name}>{m.name}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>;
}
