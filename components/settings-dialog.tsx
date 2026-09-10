'use client';
import {useRef,type RefObject} from 'react';
import {Radio,Plug,FlaskConical,X,LoaderCircle} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import type {Layout} from '@/lib/stations';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {LanguageSetting,useLanguage} from '@/components/language-provider';
import './settings-dialog.css';
import {AccessSettings} from './access-control';
type Props={canConfigure:boolean;shortcuts:boolean;onShortcuts:(value:boolean)=>void;tileSize:Layout['size'];onTileSize:(size:Layout['size'])=>void;open:boolean;onOpenChange:(open:boolean)=>void;triggerRef:RefObject<HTMLButtonElement|null>;address:string;onAddress:(value:string)=>void;play:boolean;onPlay:(value:boolean)=>void;busy:boolean;connecting:boolean;online:boolean;demo:boolean;error:string;onConnect:()=>void;onDemo:()=>void};
export function SettingsDialog(p:Props){
 const {t}=useLanguage(),addressRef=useRef<HTMLInputElement>(null),closeRef=useRef<HTMLButtonElement>(null);
 const locked=p.busy||p.connecting;
 return <Dialog open={p.open} onOpenChange={p.onOpenChange}><DialogContent id="connection-settings" className="settings-dialog" overlayClassName="settings-backdrop" showCloseButton={false} initialFocus={p.canConfigure?addressRef:closeRef} finalFocus={p.triggerRef}>
 <div className="settings-dialog-heading"><span className="settings-dialog-symbol"><Radio size={23}/></span><div><DialogTitle>{t('Ustawienia')}</DialogTitle><DialogDescription>vMix Control</DialogDescription></div><DialogClose ref={closeRef} render={<Button type="button" variant="ghost"/>} className="settings-dialog-close" aria-label={t('Zamknij')}><X size={18}/></DialogClose></div>
 {p.canConfigure&&<form className="settings-connect-form" onSubmit={e=>{e.preventDefault();p.onConnect();}}><label htmlFor="address">{t('Komputer z vMix')}</label><div className="settings-host"><span>HTTP</span><Input ref={addressRef} id="address" value={p.address} onChange={e=>p.onAddress(e.target.value)} placeholder="192.168.1.100:8088" disabled={locked} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={!!p.error} aria-describedby={p.error?'settings-connection-error':undefined}/></div>
 {p.error&&<p id="settings-connection-error" className="settings-connect-error" role="alert">{t(p.error)}</p>}
 <div className="settings-connect-actions"><Button type="submit" disabled={locked||!p.address.trim()}>{p.connecting?<LoaderCircle size={16} className="settings-spinner"/>:<Plug size={16}/>}<span>{p.connecting?t('Łączenie…'):t('Połącz')}</span></Button><Button type="button" variant="outline" disabled={locked} onClick={p.onDemo}><FlaskConical size={16}/><span>{t('Uruchom demo')}</span></Button></div></form>}
 <div className="settings-preferences"><div className="settings-play-row"><label htmlFor="play">{t('Odtwórz po przełączeniu')}</label><Switch id="play" checked={p.play} onCheckedChange={p.onPlay} disabled={locked}/></div><div className="settings-size-row"><label htmlFor="global-tile-size">{t('Rozmiar kafelków')}</label><NativeSelect id="global-tile-size" value={p.tileSize} disabled={p.busy} onChange={e=>{const value=e.target.value;if(value==='compact'||value==='normal'||value==='large')p.onTileSize(value);}}><NativeSelectOption value="compact">{t('Małe kafelki')}</NativeSelectOption><NativeSelectOption value="normal">{t('Średnie kafelki')}</NativeSelectOption><NativeSelectOption value="large">{t('Duże kafelki')}</NativeSelectOption></NativeSelect></div><div className="settings-play-row"><label htmlFor="keyboard-shortcuts">{t("Skróty klawiaturowe")}</label><Switch id="keyboard-shortcuts" checked={p.shortcuts} onCheckedChange={p.onShortcuts} disabled={locked}/></div><LanguageSetting/><AccessSettings/></div>
 <div className={`settings-dialog-status ${p.online?'connected':''}`} role="status"><i/>{p.connecting?t('Łączenie…'):p.online?p.demo?t('DEMO · Połączono'):t('Połączono z vMix'):t('Brak połączenia')}</div>
 </DialogContent></Dialog>;
}
