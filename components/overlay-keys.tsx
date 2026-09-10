'use client';
import {SlidersHorizontal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/language-provider';
import {quickOverlayControl,type ProgramControl} from '@/lib/program-controls';
import type {Source} from '@/lib/vmix-state';
type Props={overlays:Record<number,string>;sources:Record<number,string>;inputs:Source[];mixId:string;locked:boolean;online:boolean;onControl:(control:ProgramControl)=>void};
export function OverlayKeys(p:Props){
 const {t}=useLanguage();
 return <section className="desk-overlays" aria-label="Overlays"><div className="desk-overlays-heading"><span>OVERLAYS</span><small>{t('Shared channels')}</small><a href="#overlay-source-settings" aria-label={t('Wybierz źródło')} title={t('Wybierz źródło')}><SlidersHorizontal size={13}/></a></div><div className="desk-overlay-keys">{Object.entries(p.overlays).map(([number,value])=>{
  const channel=Number(number),control=quickOverlayControl(channel,value,p.sources[channel],p.inputs,p.mixId);
  const active=p.online&&!!value;
  const source=p.inputs.find(i=>i.key===(control?.kind==='overlay'?control.enabled?control.input:control.expected:undefined));
  return <Button key={number} variant="outline" disabled={p.locked||!p.online||!control} aria-pressed={active} aria-label={`Overlay ${number} · ${value?'OUT':'IN'}${source?' · '+source.title:''}`} title={source?`${source.title} · ${value?t('OUT clears this shared channel on every mix.'):'IN'}`:t('Wybierz źródło')} onClick={()=>{if(control)p.onControl(control);}}><span>{number}</span><i aria-hidden="true"/></Button>;
 })}</div></section>;
}
