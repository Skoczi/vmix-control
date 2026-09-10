'use client';

import './control-panels.css';
import {LanguageProvider,useLanguage} from '@/components/language-provider';
import {validMixNumber} from '@/lib/vmix-limits';
import {useOperators} from '@/components/use-operators';
import './operations.css';
import {APP_VERSION} from '@/lib/version';
import {AccessGate,useAccess} from '@/components/access-control';
import {SettingsDialog} from '@/components/settings-dialog';
import {MixPicker} from '@/components/mix-picker';
import {DirectorPanel} from '@/components/director-panel';

import {filterSources,validateLibrary} from '@/lib/profile-library';
import { restoreStationSession } from '@/lib/station-session';
import { StationPanel } from '@/components/station-panel';
import { DEFAULT_LAYOUT, arrangeSources, encodeStation, decodeStation, validateStation, type Layout, type Station } from '@/lib/stations';
import { Fragment } from 'react';
import { TRANSITIONS, hasDuration } from '@/lib/transitions';
import { useEffect, useRef, useState } from 'react';
import { Radio, ArrowUpRight, Monitor, RefreshCw, Layers, Type, Video, Check, Circle, Settings, Maximize, Search, Star, X, LockKeyhole, Unlock, Scan, Undo2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { mixInformation, visibleMixNumbers, type Source, type Snapshot } from '@/lib/vmix-state';
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function parse(xml: string): Snapshot {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror') || doc.documentElement.tagName !== 'vmix') throw new Error('Adres nie zwrócił danych vMix. Sprawdź IP i port.');
  const inputs = Array.from(doc.querySelectorAll('vmix > inputs > input')).map(el => ({ key: el.getAttribute('key') || '', number: el.getAttribute('number') || '', title: el.getAttribute('title') || '', type: el.getAttribute('type') || '', state: el.getAttribute('state') || '' }));
  const mixes: Record<number, string> = { 1: doc.querySelector('vmix > active')?.textContent || '' };
  const previews:Record<number,string>={1:doc.querySelector('vmix > preview')?.textContent||''};
  doc.querySelectorAll('vmix > mix, vmix > mixes > mix').forEach(el => { const n = Number(el.getAttribute('number')); if(n >= 2 && validMixNumber(n)){mixes[n] = el.querySelector('active')?.textContent || '';previews[n]=el.querySelector('preview')?.textContent||'';} });
  return { inputs, mixes, previews, mixInfo: mixInformation(inputs, mixes, doc.querySelector('version')?.textContent==='DEMO'?'PGM':'Program główny'), version: doc.querySelector('version')?.textContent || '' };
}
export default function Home(){return <LanguageProvider><AccessGate><Dashboard/></AccessGate></LanguageProvider>;}
function Dashboard() {
 const {local:canConfigure}=useAccess();
 const {t,language}=useLanguage();
  const [address, setAddress] = useState('127.0.0.1:8088');
  const [target, setTarget] = useState('');
  const [demoMode,setDemoMode]=useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selectedMix, setSelectedMix] = useState('all');
  const mixNumbers = visibleMixNumbers(snapshot, selectedMix);
  const availableMixNumbers = visibleMixNumbers(snapshot, 'all');
  const singleMode = selectedMix !== 'all' && mixNumbers.length === 1;
  const focusedMix = mixNumbers[0];
  const programInput = snapshot?.inputs.find(input => input.number === snapshot.mixes[focusedMix] || input.key === snapshot.mixes[focusedMix]);
  const missingSelection = !!snapshot && selectedMix !== 'all' && mixNumbers.length === 0;
  const mixDisplayName=(n:number)=>n===1&&snapshot?.version!=='DEMO'?t('Program główny'):snapshot?.mixInfo[n]?.name||'';
  const mixTitle = (n: number) => `Mix ${n} · ${mixDisplayName(n)}`;
  const [director,setDirector]=useState(true);
  useEffect(()=>{try{setDirector(localStorage.getItem('vmix-panel-view')!=='sources');}catch{}},[]);
  function toggleDirector(value:boolean){if(onAir)return;setDirector(value);try{localStorage.setItem('vmix-panel-view',value?'switcher':'sources');}catch{}}
  const [onAir,setOnAir]=useState(false);
  const [focusMode,setFocusMode]=useState(false);
  const [shortcuts,setShortcuts]=useState(true);
  const [operatorName,setOperatorName]=useState('');
  useEffect(()=>{try{setOperatorName(localStorage.getItem('vmix-operator-name')||'');setShortcuts(localStorage.getItem('vmix-shortcuts')!=='false');}catch{}},[]);
  function changeOperatorName(value:string){setOperatorName(value);try{localStorage.setItem('vmix-operator-name',value);}catch{}}
  function changeShortcuts(value:boolean){setShortcuts(value);try{localStorage.setItem('vmix-shortcuts',String(value));}catch{}}
  const [previousSources,setPreviousSources]=useState<Record<string,string>>({});
  const lastSnapshot=useRef<Snapshot|null>(null);
  const [online, setOnline] = useState(false);
  const {operators,available:presenceAvailable}=useOperators(target,selectedMix,operatorName,onAir,online);
  const previousSource=snapshot?.inputs.find(i=>i.key===previousSources[selectedMix]);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [play, setPlay] = useState(false);
  const [transition, setTransition] = useState('Cut');
  const [duration, setDuration] = useState('500');
  const durationValid = !hasDuration(transition) || (/^\d+$/.test(duration) && Number(duration) >= 1 && Number(duration) <= 10000);
  const transitionLabel = `${transition}${hasDuration(transition) ? ` · ${duration} ms` : ''}`;
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('vmix-transition') || '{}'); if (TRANSITIONS.some(value => value === saved.effect)) setTransition(saved.effect); if (Number.isInteger(saved.duration) && saved.duration >= 1 && saved.duration <= 10000) setDuration(String(saved.duration)); } catch {} }, []);
  function saveTransition(effect: string, time: string) { setTransition(effect); setDuration(time); try { localStorage.setItem('vmix-transition', JSON.stringify({ effect, duration: Number(time) })); } catch {} }
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [pendingInput, setPendingInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const settingsTrigger=useRef<HTMLButtonElement>(null);
  const [stationOpen,setStationOpen]=useState(false);
  const [notice, setNotice] = useState('');
  const generation = useRef(0);
  const commandLock = useRef(false);
  const [updated, setUpdated] = useState('');
  const [stationName,setStationName]=useState('');
  const [profiles,setProfiles]=useState<Station[]>([]);
  const [layouts,setLayouts]=useState<Record<string,Layout>>({});
  const [stationLink,setStationLink]=useState('');
  const layoutScope=`${target||address}|${selectedMix}`;
  const layout=layouts[layoutScope]||DEFAULT_LAYOUT;
  const [globalTileSize,setGlobalTileSize]=useState<Layout['size']|null>(null);
  useEffect(()=>{try{const saved=localStorage.getItem('vmix-tile-size');if(saved==='compact'||saved==='normal'||saved==='large')setGlobalTileSize(saved);}catch{}},[]);
  const tileSize=globalTileSize||layout.size;
  function changeTileSize(size:Layout['size']){if(onAir)return;setGlobalTileSize(size);try{localStorage.setItem('vmix-tile-size',size);}catch{setError(t('Nie udało się zapisać ustawień stanowiska.'));}}

  const [query,setQuery]=useState('');
  const [groupFilter,setGroupFilter]=useState<string|null>(null);
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const layoutInputs=arrangeSources(snapshot?.inputs||[],layout);
  const groups=[...new Set(layoutInputs.map(i=>i.assignedGroup))];
  const visibleInputs=filterSources(layoutInputs,query,groupFilter,favoritesOnly);
  const filtered=!!query||groupFilter!==null||favoritesOnly;
  function clearFilters(){setQuery('');setGroupFilter(null);setFavoritesOnly(false);}
  useEffect(()=>{clearFilters();},[layoutScope]);
  function changeProfiles(values:Station[]){if(onAir)return;const next=validateLibrary(values);localStorage.setItem('vmix-stations-v6',JSON.stringify(next));setProfiles(next);}

  const profileInit=useRef(false);
  const [sessionReady,setSessionReady]=useState(false);
  function updateLayout(next:Layout){if(onAir)return;setLayouts(previous=>{const updated={...previous,[layoutScope]:next};try{localStorage.setItem('vmix-layouts-v6',JSON.stringify(updated));}catch{setError(t("Nie udało się zapisać układu w przeglądarce."));}return updated;});setStationLink('');}
  useEffect(()=>{setStationLink('');},[stationName,target,selectedMix,transition,duration,play,layout]);
  function currentStation():Station{return validateStation({version:1,name:stationName,address:target||address,mixId:selectedMix,transition,duration:Number(duration),play,layout});}
  function saveProfile(){if(onAir)return;try{const profile=currentStation();if(profiles.length>=30&&!profiles.some(p=>p.name===profile.name))throw new Error(t("Można zapisać do 30 profili. Użyj nazwy istniejącego profilu, aby go zastąpić."));const next=[...profiles.filter(p=>p.name!==profile.name),profile];localStorage.setItem('vmix-stations-v6',JSON.stringify(next));setProfiles(next);localStorage.setItem('vmix-last-station-v6',JSON.stringify(profile));setNotice(t("Zapisano stanowisko „{name}”.",{name:profile.name}));}catch(e){setError(e instanceof Error?e.message:t("Nie udało się zapisać profilu."));}}
  function applyProfile(profile:Station){if(commandLock.current||onAir)return;try{localStorage.setItem('vmix-last-station-v6',JSON.stringify(profile));}catch{}setStationName(profile.name);setAddress(profile.address);setSelectedMix(profile.mixId);setTransition(profile.transition);setDuration(String(profile.duration));setPlay(profile.play);setLayouts(previous=>({...previous,[`${profile.address}|${profile.mixId}`]:profile.layout}));setStationLink('');void connect(canConfigure?profile.address:(target||profile.address),false);}
  async function shareProfile(){try{const link=new URL(window.location.href);link.hash=`station=${encodeStation(currentStation())}`;setStationLink(link.href);try{await navigator.clipboard.writeText(link.href);setNotice(t("Skopiowano link stanowiska."));}catch{setNotice(t("Zaznacz i skopiuj link z pola stanowiska."));}}catch(e){setError(e instanceof Error?e.message:t("Nie udało się przygotować linku."));}}


  useEffect(() => { try { setAddress(localStorage.getItem('vmix-address') || '127.0.0.1:8088'); setSelectedMix(localStorage.getItem('vmix-selected-mix') || 'all'); } catch {} }, []);
  useEffect(()=>{
    if(profileInit.current)return;profileInit.current=true;
    try{const saved=JSON.parse(localStorage.getItem('vmix-stations-v6')||'[]');if(Array.isArray(saved))setProfiles(saved.slice(-30).flatMap(item=>{try{return [validateStation(item)];}catch{return [];}}));const stored=JSON.parse(localStorage.getItem('vmix-layouts-v6')||'{}');const cleaned:Record<string,Layout>={};for(const [key,value] of Object.entries(stored)){try{cleaned[key]=validateStation({version:1,name:'Layout',address:'127.0.0.1:8088',mixId:'all',transition:'Cut',duration:500,play:false,layout:value}).layout;}catch{}}setLayouts(cleaned);}catch{}
    setSettingsOpen(false);
    void (async()=>{
    let activeAddress:string|null=null;try{const response=await fetch('/api/vmix',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const value=await response.json() as {address:string|null};activeAddress=value.address;}catch{setSettingsOpen(true);setSessionReady(true);return;}
    let restoredConnection=false;
    try{const restored=restoreStationSession(window.location.href,localStorage.getItem('vmix-last-station-v6'));if(restored.station&&(!activeAddress||restored.station.address===activeAddress)){restoredConnection=true;if(restored.imported){localStorage.setItem('vmix-last-station-v6',JSON.stringify(restored.station));window.history.replaceState(null,'',restored.cleanUrl);}applyProfile(restored.station);}}catch{setError(t("Nie udało się wczytać stanowiska. Wybierz profil lub połącz się ręcznie."));}
    if(!restoredConnection){if(activeAddress){if(activeAddress!=='demo')setAddress(activeAddress);await connect(activeAddress,false);}else setSettingsOpen(true);}
    setSessionReady(true);
    })();
  },[]);
  useEffect(()=>{if(!sessionReady||connecting||!target||!stationName.trim()||selectedMix==='all'||!durationValid)return;try{localStorage.setItem('vmix-last-station-v6',JSON.stringify(currentStation()));}catch{setError(t("Nie udało się zapisać ustawień stanowiska."));}},[sessionReady,connecting,target,stationName,selectedMix,transition,duration,play,layout,durationValid]);
  function selectMix(value: string) { if(onAir)return; setStationName('');try{localStorage.removeItem('vmix-last-station-v6');}catch{} setSelectedMix(value); setNotice(''); try { localStorage.setItem('vmix-selected-mix', value); } catch {} }
  const visibleState = useRef({ online, snapshot, selectedMix, visibleMixes: mixNumbers });
  visibleState.current = { online, snapshot, selectedMix, visibleMixes: mixNumbers };
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: object, options: { signal: AbortSignal }) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try { void Promise.resolve(context.registerTool({
      name: 'read_vmix_inputs', title: 'Odczytaj inputy i mixy vMix',
      description: 'Zwraca ostatni stan wyświetlany w panelu. Nie przełącza inputów. offline oznacza, że dane mogą być nieaktualne.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input: unknown) { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Oczekiwany pusty obiekt.'); return visibleState.current; },
    }, { signal: lifecycle.signal })).catch(() => {}); } catch {}
    return () => lifecycle.abort();
  }, []);
  async function api(host: string, command?: { input: string; mix: number; play: boolean; mixId: string; transition: string; duration: number; action?: string; expectedProgram?:string }, announce=false) {
    const res = await fetch('/api/vmix', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: host, ...(announce?{connect:true}:{}), ...command }), signal: AbortSignal.timeout(command ? 40000 : 8000) });
    const text = await res.text();
    if (!res.ok) { let message = text; try { message = JSON.parse(text).message || text; } catch {} throw new Error(message); }
    return text;
  }
  async function refresh(host: string, gen: number, announce=false) {
    try {
      const next = parse(await api(host,undefined,announce));
      if (gen !== generation.current) return;
      const before=lastSnapshot.current;
      if(before){const changed:Record<string,string>={};for(const [number,info] of Object.entries(next.mixInfo)){const n=Number(number);const oldNumber=Object.keys(before.mixInfo).map(Number).find(i=>before.mixInfo[i].id===info.id);if(oldNumber===undefined)continue;const oldInput=before.inputs.find(i=>i.number===before.mixes[oldNumber]||i.key===before.mixes[oldNumber]);const newInput=next.inputs.find(i=>i.number===next.mixes[n]||i.key===next.mixes[n]);if(oldInput&&newInput&&oldInput.key!==newInput.key)changed[info.id]=oldInput.key;}if(Object.keys(changed).length)setPreviousSources(previous=>({...previous,...changed}));}
      lastSnapshot.current=next;
      setSnapshot(next); setOnline(true); setConnectionError(''); setUpdated(new Date().toLocaleTimeString(language));
    } catch (e) { if (gen === generation.current) { setOnline(false); setConnectionError(e instanceof Error ? e.message : t("Brak połączenia z vMix.")); } }
  }
  useEffect(() => {
    if (!target) return;
    let stopped = false; let timer: ReturnType<typeof setTimeout>;
    async function tick() { if (!commandLock.current) await refresh(target, generation.current); if (!stopped) timer = setTimeout(tick, 1500); }
    timer = setTimeout(tick, 1500);
    return () => { stopped = true; clearTimeout(timer); };
  }, [target]);
  useEffect(() => { if (online) setSettingsOpen(false); }, [online]);
  async function connect(override?: string, announce=true) {
    if(announce&&!canConfigure)return;
    if((onAir&&announce)||commandLock.current)return;
    const host = (override || address).trim(); if (!host) return;
    lastSnapshot.current=null;setPreviousSources({});
    const gen = ++generation.current;
    setDemoMode(host==='demo');setConnecting(true); setTarget(''); setSnapshot(null); setOnline(false); setNotice(''); setError('');
    await refresh(host, gen, announce);
    if (gen === generation.current) { setTarget(host); setConnecting(false); if(!lastSnapshot.current)setSettingsOpen(true); try { if(host!=='demo')localStorage.setItem('vmix-address', host); } catch {} }
  }
  useEffect(()=>{
    if(canConfigure||!sessionReady)return;
    let stopped=false;let timer:ReturnType<typeof setTimeout>;
    async function follow(){try{const response=await fetch('/api/vmix',{cache:'no-store',signal:AbortSignal.timeout(6000)});if(!response.ok)throw Error();const shared=await response.json() as {address:string|null};if(stopped||commandLock.current)return;if(shared.address&&shared.address!==target){await connect(shared.address,false);}else if(!shared.address&&target){generation.current++;setTarget('');setSnapshot(null);setOnline(false);setDemoMode(false);setOnAir(false);setFocusMode(false);}}catch{if(!stopped)setOnline(false);}finally{if(!stopped)timer=setTimeout(follow,1500);}}
    void follow();return()=>{stopped=true;clearTimeout(timer);};
  },[canConfigure,sessionReady,target]);
  async function route(input: Source, mix: number, action='route', effect=transition) {
    if (commandLock.current || !online || !mixNumbers.includes(mix) || (action!=='preview'&&hasDuration(effect)&&!durationValid) || input.key === snapshot?.mixInfo[mix]?.id) return;
    commandLock.current = true; setBusy(true); setPendingInput(input.key); setNotice(''); setError('');
    const gen = ++generation.current;
    try {
      const result = JSON.parse(await api(target, { input: input.key, mix, mixId: snapshot!.mixInfo[mix].id, play, transition:effect, duration: Number(duration), action, ...(action==='back'?{expectedProgram:programInput?.key}:{}) }));
      if(result.warning) setError(result.warning);
      setNotice(`${input.title} → ${mixTitle(mix)} · ${action==='preview'?'PREVIEW':effect} · ${t('potwierdzono')} ${action==='preview'?'PREVIEW':'PROGRAM'}${result.stinger ? t(" (XML nie potwierdza końca animacji Stinger)") : ''}`);
    } catch (e) { setError(e instanceof Error ? e.message : t("Nie udało się potwierdzić przełączenia. Sprawdź vMix.")); }
    finally { await refresh(target, gen); commandLock.current = false; setBusy(false); setPendingInput(''); }
  }
  return <main className={`${singleMode ? 'console-mode' : 'matrix-mode'} tile-size-${tileSize} ${focusMode?'focus-mode':''} ${onAir?'on-air-mode':''}`}>
    <header className="masthead"><div className="brand"><span className="brand-icon"><Radio size={23}/></span><div><h1>vMix <span>Control</span></h1></div></div><div className="header-actions"><Button variant="outline" disabled={onAir} aria-expanded={stationOpen} aria-controls="station-settings" onClick={()=>setStationOpen(!stationOpen)}><Layers size={16}/>{t("Stanowisko")}</Button><Button variant="outline" aria-label={t("Pełny ekran")} onClick={() => { if(document.fullscreenElement) void document.exitFullscreen().catch(() => {}); else void document.documentElement.requestFullscreen().catch(() => setError(t("Pełny ekran jest niedostępny w tej przeglądarce."))); }}><Maximize size={16}/></Button><Button ref={settingsTrigger} disabled={onAir} variant="outline" aria-haspopup="dialog" aria-expanded={settingsOpen} aria-controls="connection-settings" onClick={() => setSettingsOpen(!settingsOpen)}><Settings size={16}/>{t("Ustawienia")}</Button><span className={`connection-status ${online?demoMode?'status-demo':'status-live':connecting?'status-connecting':'status-offline'}`} role="status" aria-label={online?demoMode?t('DEMO · Połączono'):t('Połączono z vMix'):connecting?t('Łączenie…'):t('Brak połączenia')} title={`${online?demoMode?t('DEMO · Połączono'):t('Połączono z vMix'):connecting?t('Łączenie…'):t('Brak połączenia')}${updated?` · ${t('Ostatni odczyt: {time}',{time:updated})}`:''}`}><i aria-hidden="true"/><span aria-hidden="true">{online?demoMode?'DEMO':'VMIX':connecting?'…':'OFFLINE'}</span></span></div></header>
    <SettingsDialog canConfigure={canConfigure} shortcuts={shortcuts} onShortcuts={changeShortcuts} tileSize={tileSize} onTileSize={changeTileSize} open={settingsOpen} onOpenChange={value=>{if(!onAir)setSettingsOpen(value);}} triggerRef={settingsTrigger} address={address} onAddress={setAddress} play={play} onPlay={setPlay} busy={busy} connecting={connecting} online={online} demo={demoMode} error={connectionError} onConnect={()=>void connect()} onDemo={()=>{selectMix('all');void connect('demo');}}/>

    {demoMode&&<div className="demo-banner" role="status"><span><strong>DEMO</strong> {t("Symulacja")}{snapshot ? t(" · {inputs} inputów · {mixes} mixów",{inputs:snapshot.inputs.length,mixes:availableMixNumbers.length}) : ''}</span>{canConfigure&&<Button variant="ghost" disabled={busy||connecting||onAir} onClick={async()=>{try{const response=await fetch('/api/vmix',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({disconnect:true})});if(!response.ok)throw Error();}catch{setError(t('Connection changed. Refresh the dashboard.'));return;}generation.current++;setTarget('');setSnapshot(null);setOnline(false);setDemoMode(false);setSettingsOpen(true);selectMix('all');setNotice('');setError('');setConnectionError('');try{localStorage.removeItem('vmix-last-station-v6');}catch{}}}>{t("Zakończ demo")}</Button>}</div>}
    <section className="operator-panel">{singleMode&&<div className="view-switch" aria-label={t("Tryb panelu")}><Button variant="outline" disabled={busy||onAir} aria-pressed={director} onClick={()=>toggleDirector(true)}>Switcher</Button><Button variant="outline" disabled={busy||onAir} aria-pressed={!director} onClick={()=>toggleDirector(false)}>{t("Źródła")}</Button></div>}<MixPicker value={selectedMix} onChange={selectMix} disabled={busy||connecting||onAir} loaded={!!snapshot} mixes={availableMixNumbers.map(n=>({...snapshot!.mixInfo[n],name:mixDisplayName(n),number:n}))}/></section>

    {(singleMode||onAir||focusMode)&&<div className="operations-bar"><strong>{singleMode?mixDisplayName(focusedMix):t("Mix niedostępny")}</strong><div className="operations-actions"><Button variant="outline" className="return-source" disabled={!singleMode||!online||busy||!previousSource||previousSource.key===programInput?.key} title={previousSource?.title} onClick={()=>{if(previousSource)void route(previousSource,focusedMix,'back','Cut');}}><Undo2 size={15}/><span>{t('Powrót')}{previousSource?` · ${previousSource.title}`:''}</span></Button><Button variant="outline" aria-pressed={onAir} title={t("Blokada konfiguracji")} disabled={busy||(!online&&!onAir)} onClick={()=>{setOnAir(!onAir);setSettingsOpen(false);setStationOpen(false);}}>{onAir?<LockKeyhole size={14}/>:<Unlock size={14}/>}ON AIR</Button><Button variant="outline" aria-pressed={focusMode} onClick={()=>{setFocusMode(!focusMode);if(!focusMode)setDirector(true);setStationOpen(false);}}><Scan size={15}/>{t(focusMode?'Wyjdź ze skupienia':'Skupienie')}</Button></div></div>}
    {online&&<div className="operator-presence" aria-label={t('Operatorzy')}><Users size={14}/><span>{operatorName||t('Operator')} · {selectedMix==='all'?t('Wszystkie mixy'):focusedMix?mixTitle(focusedMix):t('Mix niedostępny')}</span>{!presenceAvailable?<span>{t('Obecność niedostępna')}</span>:operators.map(op=><span key={op.id} className={op.mixId===selectedMix?'same-mix':''}>{op.name||t('Operator')} · {op.mixId==='all'?t('Wszystkie mixy'):snapshot?.mixInfo[availableMixNumbers.find(n=>snapshot?.mixInfo[n].id===op.mixId)||0]?.name||t('Mix niedostępny')}{op.onAir?' · ON AIR':''}</span>)}</div>}
    <div id="station-settings" hidden={!stationOpen}><StationPanel name={stationName} setName={setStationName} profiles={profiles} onProfilesChange={changeProfiles} onRename={(old,next)=>{if(stationName===old)setStationName(next);}} onLoad={applyProfile} onSave={saveProfile} onShare={() => void shareProfile()} link={stationLink} layout={layout} onLayout={updateLayout} inputs={snapshot?.inputs||[]} operatorName={operatorName} onOperatorName={changeOperatorName} disabled={busy||connecting||onAir} canSave={!!snapshot && selectedMix!=='all' && !missingSelection && durationValid}/></div>
    {missingSelection && <p className="error" role="status">{t("Mix niedostępny. Wybierz inny lub poczekaj na jego powrót.")}</p>}
    {singleMode ? <section hidden={director} className={`console-header ${online ? 'is-live' : ''}`} aria-label={t("Program główny")}>
      <div className="console-identity"><div className="console-eyebrow"><span className="mix-number">MIX {focusedMix.toString().padStart(2, '0')}</span>{stationName && <span>{stationName}</span>}</div><h2>{mixDisplayName(focusedMix)}</h2><p><Layers size={15}/> {layoutInputs.length} {t("inputów")} <span>·</span> {transitionLabel}</p></div>
      <div className="program-readout"><div className="program-caption"><span className="program-led"/>{online ? t("NA PROGRAMIE") : t("OSTATNI ODCZYT")}<span className="program-tag">{online ? demoMode ? 'DEMO' : 'LIVE' : 'OFFLINE'}</span></div><div className="program-source"><span className="program-source-icon"><Monitor size={25}/></span><div><h3>{programInput?.title || t("Brak źródła")}</h3><p>{online ? demoMode ? t("Symulowane źródło") : t("Aktywne źródło") : t("Dane nieaktualne")}{programInput ? ` · Input ${programInput.number}` : ''}</p></div></div></div>
    </section> : <section className={`mix-grid ${mixNumbers.length>5?'many-mixes':''}`} aria-label={t("Dostępne mixy")}>{mixNumbers.map(n => { const available = snapshot && n in snapshot.mixes; const active = snapshot?.inputs.find(i => i.number === snapshot.mixes[n] || i.key === snapshot.mixes[n]); return <div className={`mix-card ${online && available ? 'ready' : ''}`} key={n}><div className="mix-label"><span>MIX {n}</span><span>{n === 1 ? t("GŁÓWNY") : t("DODATKOWY")}</span></div><h2 className="mix-own-name">{mixDisplayName(n)}</h2><div className="mix-name" title={active?.title}>{t("Na programie:")} {active?.title || '—'}</div><small><i/>{!snapshot ? t("Oczekuje na połączenie") : !online ? t("Dane nieaktualne") : available ? 'Program' : t("Niedostępny w vMix")}</small></div>; })}</section>}

    <section hidden={singleMode&&director} className="transition-panel" aria-label={t("Przejście")}><div className="quick-effects">{['Cut','Fade'].map(effect => <Button key={effect} variant="outline" aria-pressed={transition === effect} disabled={busy} onClick={() => saveTransition(effect,duration)}>{effect}</Button>)}</div><div className="transition-field"><label htmlFor="transition-effect">{t("Przejście")}</label><NativeSelect id="transition-effect" value={transition} onChange={e => saveTransition(e.target.value, duration)} disabled={busy}>{TRANSITIONS.map(effect => <NativeSelectOption key={effect} value={effect}>{effect.replace(/^Stinger(\d)$/, 'Stinger $1')}</NativeSelectOption>)}</NativeSelect></div><div className="transition-field duration-field"><label htmlFor="transition-duration">{t("Czas")} <span>ms</span></label><Input id="transition-duration" type="number" min={1} max={10000} step={1} value={duration} onChange={e => saveTransition(transition, e.target.value)} disabled={busy || !hasDuration(transition)} aria-invalid={!durationValid} aria-describedby={!durationValid ? "transition-hint" : undefined}/></div><div className="duration-presets">{[250,500,1000].map(ms => <Button key={ms} variant="outline" aria-label={t("{ms} milisekund",{ms:ms})} aria-pressed={hasDuration(transition) && Number(duration) === ms} disabled={busy || !hasDuration(transition)} onClick={() => saveTransition(transition,String(ms))}>{ms}</Button>)}</div>{!durationValid && <p id="transition-hint" role="alert">{t("Podaj czas od 1 do 10000 ms.")}</p>}</section>
    {(error || busy || notice) && (<div className={`status-slot ${error ? 'has-error' : busy ? 'is-pending' : notice ? 'has-notice' : ''}`}>
      <div role={error ? 'alert' : 'status'}>{(error?t(error):'') || (busy ? t("Czekam na potwierdzenie z vMix…") : t(notice))}</div>
      {!busy && <Button variant="ghost" onClick={() => {setError('');setNotice('');}} aria-label={t("Zamknij komunikat")}>{t("Zamknij")}</Button>}
    </div>)}
    <section className={`input-panel ${singleMode ? 'single-mix' : ''}`}><div className="section-header"><div><h2>{singleMode ? director?'Switcher':t("Źródła") : t("Matryca źródeł")} <span>{visibleInputs.length} / {snapshot?.inputs.length ?? 0}</span></h2></div><Button variant="outline" disabled={!target || busy || connecting} onClick={() => void refresh(target, generation.current)}><RefreshCw size={16}/>{t("Odśwież")}</Button></div>
    {!!snapshot?.inputs.length&&<div className="source-toolbar"><div className="source-search"><Search size={17}/><Input aria-label={t("Szukaj inputów")} placeholder={t("Szukaj źródła…")} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<Button variant="ghost" aria-label={t("Wyczyść wyszukiwanie")} onClick={()=>setQuery('')}><X size={15}/></Button>}</div><div className="source-filters"><Button variant="outline" aria-pressed={favoritesOnly} onClick={()=>setFavoritesOnly(!favoritesOnly)}><Star size={15} fill={favoritesOnly?'currentColor':'none'}/>{t("Ulubione")}<span>{layoutInputs.filter(i=>i.favorite).length}</span></Button><NativeSelect aria-label={t("Filtruj grupę")} value={groupFilter===null?'all':`group:${groupFilter}`} onChange={e=>setGroupFilter(e.target.value==='all'?null:e.target.value.slice(6))}><NativeSelectOption value="all">{t("Wszystkie grupy")}</NativeSelectOption>{groupFilter!==null&&!groups.includes(groupFilter)&&<NativeSelectOption value={`group:${groupFilter}`}>{groupFilter}</NativeSelectOption>}{groups.map(g=><NativeSelectOption key={g} value={`group:${g}`}>{g==='Pozostałe'&&!layout.items.some(i=>i.group===g)?t('Pozostałe'):g}</NativeSelectOption>)}</NativeSelect>{filtered&&<Button variant="ghost" onClick={clearFilters}>{t("Wyczyść")}</Button>}</div></div>}
    {connectionError && !settingsOpen && <p className="error" role="alert">{t("Połączenie:")} {t(connectionError)}</p>}

    {!!snapshot?.inputs.length && !layoutInputs.length && <Empty className="empty-inputs"><EmptyTitle>{t("Brak widocznych inputów")}</EmptyTitle><EmptyDescription>{t("Otwórz „Stanowisko” → „Układ inputów” i włącz źródła.")}</EmptyDescription><Button variant="outline" onClick={()=>setStationOpen(true)}>{t("Otwórz stanowisko")}</Button></Empty>}
    {layoutInputs.length>0&&!visibleInputs.length&&<Empty className="empty-inputs"><Search size={28}/><EmptyTitle>{t("Brak wyników")}</EmptyTitle><Button variant="outline" onClick={clearFilters}>{t("Wyczyść filtry")}</Button></Empty>}
    {snapshot?.inputs.length ? singleMode ? director ? <DirectorPanel shortcuts={shortcuts&&!settingsOpen&&!stationOpen} inputs={visibleInputs} allInputs={snapshot.inputs} program={snapshot.mixes[focusedMix]} preview={snapshot.previews?.[focusedMix]||''} mixId={snapshot.mixInfo[focusedMix].id} busy={busy} online={online} demo={demoMode} transition={transition} duration={duration} durationValid={durationValid} onTransition={saveTransition} onPreview={input=>void route(input,focusedMix,'preview')} onProgram={input=>void route(input,focusedMix,'route','Cut')} onTake={effect=>{const input=snapshot.inputs.find(i=>i.number===snapshot.previews?.[focusedMix]||i.key===snapshot.previews?.[focusedMix]);if(input)void route(input,focusedMix,'take',effect);}}/> : <div className="source-pad" aria-label={t("Inputy dla {name}",{name:mixTitle(focusedMix)})}>
      {visibleInputs.map((input,index) => {
        const active = online && (snapshot.mixes[focusedMix] === input.number || snapshot.mixes[focusedMix] === input.key);
        const Icon = input.type === 'Mix' ? Layers : ['GT', 'Xaml', 'Title'].includes(input.type) ? Type : ['Video', 'VideoList', 'Capture'].includes(input.type) ? Video : Monitor;
        return <Fragment key={input.key}>{(index===0 || visibleInputs[index-1].stationGroup!==input.stationGroup) && <h3 className="source-group">{input.favorite?t('Ulubione'):layout.items.find(i=>i.key===input.key)?.group||t('Pozostałe')}</h3>}<Button variant="outline" className={`source-tile ${active ? 'on-program' : ''} ${pendingInput === input.key ? 'tile-pending' : ''}`} disabled={!online || busy || !durationValid || !input.key || input.key === snapshot.mixInfo[focusedMix]?.id} onClick={() => void route(input, focusedMix)} aria-label={`${t('{source} na {mix}',{source:input.title,mix:mixTitle(focusedMix)})}${active ? `, ${t('Na programie')}` : ''}`}>
          <span className="tile-top"><span className="tile-icon"><Icon size={22}/></span><span className="tile-number">{input.number.padStart(2, '0')}</span></span>
          <span className="tile-name">{input.title}</span><span className="tile-type">{input.type}<span>·</span>{input.state === 'Running' ? t("Odtwarzanie") : input.state === 'Paused' ? t("Wstrzymany") : input.state}</span>
          <span className="tile-action"><span>{pendingInput === input.key ? t("Potwierdzanie…") : input.key === snapshot.mixInfo[focusedMix]?.id ? t("Ten mix") : active ? <><Circle size={7} fill="currentColor"/>{t("Na programie")}</> : t("Wyślij na program")}</span>{active ? <Check size={17}/> : <ArrowUpRight size={17}/>}</span>
        </Button></Fragment>;
      })}
    </div> : <Table className={`routing-matrix ${mixNumbers.length>5?'wide-matrix':''}`} style={{minWidth:Math.max(720,280+mixNumbers.length*144)}}><colgroup><col style={{width:mixNumbers.length>5?'280px':mixNumbers.length ? '32%' : '100%'}}/>{mixNumbers.map(n=><col key={n} style={{width:mixNumbers.length>5?'144px':`${68/mixNumbers.length}%`}}/>)}</colgroup><TableHeader><TableRow><TableHead className="source-heading"><div className="matrix-heading"><span className="matrix-label">{t("ŹRÓDŁO")}</span><span className="matrix-subtitle">{t("Dostępne inputy")}</span></div></TableHead>{mixNumbers.map(n => <TableHead key={n}><div className="matrix-heading" title={mixTitle(n)}><span className="matrix-label"><i/>MIX {String(n).padStart(2,'0')}</span><span className="matrix-subtitle">{mixDisplayName(n)}</span></div></TableHead>)}</TableRow></TableHeader><TableBody>{visibleInputs.map(input => <TableRow key={input.key}><TableCell><div className="source"><span className="source-number">{input.number.padStart(2, '0')}</span><div><strong>{input.title}</strong><p>{input.type} <span>· {input.state === 'Running' ? t("Odtwarzanie") : input.state === 'Paused' ? t("Wstrzymany") : input.state}</span></p></div></div></TableCell>{mixNumbers.map(n => { const active = snapshot.mixes[n] === input.number || snapshot.mixes[n] === input.key; return <TableCell key={n}><Button className={`route-button ${active && online ? 'active' : ''}`} variant="outline" disabled={!online || busy || !durationValid || !(n in snapshot.mixes) || !input.key || input.key === snapshot.mixInfo[n]?.id} onClick={() => void route(input, n)} aria-label={t("{source} na {mix}",{source:input.title,mix:mixTitle(n)})}><span>{input.key === snapshot.mixInfo[n]?.id ? '—' : active && online ? 'PROGRAM' : t("Przełącz")}</span>{active && online ? <i/> : <ArrowUpRight size={16}/>}</Button></TableCell>; })}</TableRow>)}</TableBody></Table> : <Empty className="empty-inputs"><Monitor size={34}/><EmptyTitle>{online ? t("Brak inputów") : t(canConfigure?"Połącz się ze swoim vMix":"Waiting for the local operator to connect.")}</EmptyTitle><EmptyDescription>{online ? t("Dodaj inputy w vMix. Pojawią się tutaj automatycznie.") : (canConfigure?t("Wpisz adres komputera powyżej. Inputy i dostępne mixy zostaną pobrane automatycznie."):null)}</EmptyDescription></Empty>}

    </section>
    <footer className="site-footer">© 2026 | <a href="https://skoczi.dev" target="_blank" rel="noopener noreferrer">Skoczi.dev</a><span className="footer-version"> · v{APP_VERSION}</span></footer>
  </main>;
}
