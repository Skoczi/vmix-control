const KEY='vmix-operator-session-v1';
type SessionStore=Pick<Storage,'getItem'|'setItem'>;
// Session storage survives reloads and component remounts without merging devices.
export function operatorIdentity(storage:SessionStore,create:()=>string):string{
 const saved=storage.getItem(KEY);
 if(saved&&/^[a-f0-9]{32}$/.test(saved))return saved;
 const id=create();
 storage.setItem(KEY,id);
 return id;
}
