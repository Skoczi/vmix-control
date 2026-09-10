const KEY='vmix-operator-browser-v2';
type SessionStore=Pick<Storage,'getItem'|'setItem'>;
// Use a shared browser store so tabs at the same dashboard address reuse one identity.
export function operatorIdentity(storage:SessionStore,create:()=>string):string{
 const saved=storage.getItem(KEY);
 if(saved&&/^[a-f0-9]{32}$/.test(saved))return saved;
 const id=create();
 storage.setItem(KEY,id);
 return id;
}
