export const INPUT_PAGE_SIZES=[12,24,48] as const;
export function inputPage<T>(inputs:T[],requested:number,size:number=12){
 const pageSize=INPUT_PAGE_SIZES.includes(size as 12|24|48)?size:12;
 const pages=Math.max(1,Math.ceil(inputs.length/pageSize));
 const page=Math.max(0,Math.min(pages-1,Number.isFinite(requested)?Math.floor(requested):0));
 const start=page*pageSize;
 return {page,pages,pageSize,start,end:Math.min(inputs.length,start+pageSize),items:inputs.slice(start,start+pageSize)};
}
