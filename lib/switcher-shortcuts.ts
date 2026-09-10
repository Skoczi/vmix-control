export function shortcutAction(event:{key:string;repeat:boolean;altKey:boolean;ctrlKey:boolean;metaKey:boolean;shiftKey:boolean;isComposing:boolean},blocked:boolean,buttonFocused=false):{kind:'preview';index:number}|{kind:'take';effect:'auto'|'cut'}|null{
 if(blocked||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.isComposing)return null;
 const index='1234567890-='.indexOf(event.key);
 if(event.key.length===1&&index>=0)return {kind:'preview',index};
 if(event.key==='Enter'&&!buttonFocused)return {kind:'take',effect:'auto'};
 if(event.key.toLowerCase()==='c')return {kind:'take',effect:'cut'};
 return null;
}
