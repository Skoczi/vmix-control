import type {LayoutItem} from './stations.ts';
export function reorderInputs(items:LayoutItem[],from:string,to:string){
 const source=items.findIndex(i=>i.key===from),target=items.findIndex(i=>i.key===to);
 if(source<0||target<0||source===target)return items;
 const next=[...items],moved={...next[source],group:next[target].group,favorite:next[target].favorite};next.splice(source,1);next.splice(target,0,moved);return next;
}
