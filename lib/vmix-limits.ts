// vMix: main program plus up to 15 additional Mix inputs; HTTP Mix is zero-based.
export const MAX_MIXES = 16;
export function validMixNumber(value:number){return Number.isInteger(value)&&value>=1&&value<=MAX_MIXES;}
