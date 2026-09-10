'use client';
import {useState} from 'react';
import {Layers,ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {useLanguage} from '@/components/language-provider';
import type {Source} from '@/lib/vmix-state';
import type {ProgramState,ProgramControl} from '@/lib/program-controls';
import './program-panel.css';
type Props={mix:number;mixName:string;mixId:string;state:ProgramState;inputs:Source[];locked:boolean;online:boolean;transition:string;stingers:number;onStinger:(effect:string)=>void;onControl:(control:ProgramControl)=>void};
export function ProgramPanel(p:Props){
 const {t}=useLanguage();
 const [selected,setSelected]=useState<Record<number,string>>({});
 const [armed,setArmed]=useState(false);
 const locked=p.locked||!p.online;
 return <section className="program-tools" aria-label={p.mixName+' · '+t('Production controls')}>
  <div className="program-tools-top"><div><span className="program-tools-label">{p.mix===1?'PGM':'MIX '+p.mix}</span><strong>{t('Production controls')}</strong></div>{p.mix===1&&<div className="program-output-status">{([['REC',p.state.recording],['STREAM',p.state.streaming],['EXT',p.state.external]] as const).map(([label,value])=><span key={label} data-active={p.online&&value===true} title={!p.online?t('Brak połączenia'):value===null?'—':value?'ON · GLOBAL':'OFF'}><i/>{label}</span>)}</div>}</div>
  <div className="program-transition-tools">{p.stingers>0&&<div className="program-stingers"><span className="program-tools-label">STINGER</span><div>{Array.from({length:p.stingers},(_,i)=>i+1).map(n=><Button key={n} variant="outline" aria-label={`Stinger ${n}`} aria-pressed={p.transition===`Stinger${n}`} disabled={locked} title={t('Select stinger, then AUTO. Configure in vMix.')} onClick={()=>p.onStinger(`Stinger${n}`)}>{String(n).padStart(2,'0')}</Button>)}</div></div>}
   {p.mix===1&&p.state.fadeToBlack!==null&&<div className="program-ftb"><Button variant="outline" disabled={locked} aria-pressed={p.online&&p.state.fadeToBlack} onClick={()=>{if(p.state.fadeToBlack){p.onControl({kind:'ftb',enabled:false,expected:true});setArmed(false);}else setArmed(!armed);}}>{p.state.fadeToBlack?t('Restore PGM'):'FTB'}</Button>{armed&&!p.state.fadeToBlack&&<Button variant="outline" className="ftb-confirm" disabled={locked} onClick={()=>{p.onControl({kind:'ftb',enabled:true,expected:false});setArmed(false);}}>{t('Fade PGM to black')}</Button>}</div>}
  </div>
  {!!Object.keys(p.state.overlays).length&&<details className="program-overlays" open><summary><Layers size={14}/><span>OVERLAYS</span><small>{t('Shared channels')}</small><ChevronDown size={14}/></summary><div className="program-overlay-grid">{Object.entries(p.state.overlays).map(([number,value])=>{
   const channel=Number(number),active=p.inputs.find(i=>i.number===value||i.key===value),choice=selected[channel]||active?.key||'';
   const valid=p.inputs.some(i=>i.key===choice&&i.key!==p.mixId);
   return <div className="program-overlay" key={channel} data-active={p.online&&!!value}><div className="program-overlay-heading"><span>OVL {number.padStart(2,'0')}</span><i>{!p.online?'—':value?'ON · GLOBAL':'OFF'}</i></div><NativeSelect aria-label={`Overlay ${number} · ${t('Wybierz źródło')}`} value={valid?choice:''} disabled={locked} onChange={e=>setSelected(prev=>({...prev,[channel]:e.target.value}))}><NativeSelectOption value="">{t('Wybierz źródło')}</NativeSelectOption>{p.inputs.filter(input=>input.key!==p.mixId).map(input=><NativeSelectOption key={input.key} value={input.key}>{input.number} · {input.title}</NativeSelectOption>)}</NativeSelect><div className="program-overlay-actions"><span title={active?.title}>{active?.title||'—'}</span><Button variant="outline" disabled={locked||!valid} title={p.mixName} onClick={()=>p.onControl({kind:'overlay',channel,enabled:true,input:choice,expected:active?.key||''})}>IN</Button><Button variant="outline" disabled={locked||!active} title={t('OUT clears this shared channel on every mix.')} onClick={()=>p.onControl({kind:'overlay',channel,enabled:false,expected:active?.key||''})}>OUT</Button></div></div>;
  })}</div></details>}
 </section>;
}
