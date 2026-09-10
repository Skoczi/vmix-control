import {validMixNumber} from './vmix-limits.ts';
export type StateInput = { key: string; number: string; type: string };
export function readVmixState(xml: string) {
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<vmix\b/.test(xml) || !xml.includes('</vmix>')) throw new Error('Nieprawidłowa odpowiedź XML z vMix.');
  const section = /<inputs\s*\/>/.test(xml) ? '' : xml.match(/<inputs\b[^>]*>([\s\S]*?)<\/inputs>/)?.[1];
  if (section === undefined) throw new Error('Brak listy inputów w odpowiedzi vMix.');
  const inputs: StateInput[] = [];
  for (const match of section.matchAll(/<input\b((?:"[^"]*"|'[^']*'|[^'">])*)\/?\s*>/g)) {
    const attrs: Record<string,string> = {};
    for (const attr of match[1].matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)) attrs[attr[1]] = attr[3];
    if (!attrs.key || !/^\d+$/.test(attrs.number)) throw new Error('Nieprawidłowy input w odpowiedzi vMix.');
    inputs.push({key:attrs.key,number:attrs.number,type:attrs.type});
  }
  const withoutInputs = xml.replace(/<inputs\b[^>]*>[\s\S]*?<\/inputs>/, '');
  const withoutMixes = withoutInputs.replace(/<mix\b[^>]*>[\s\S]*?<\/mix>/g, '');
  const active: Record<number,string> = {1:withoutMixes.match(/<active>\s*(\d+)\s*<\/active>/)?.[1] || ''};
  const preview:Record<number,string>={1:withoutMixes.match(/<preview>\s*(\d+)\s*<\/preview>/)?.[1]||''};
  for (const match of withoutInputs.matchAll(/<mix\b[^>]*\bnumber=["'](\d+)["'][^>]*>([\s\S]*?)<\/mix>/g)) {if(Number(match[1])<2||!validMixNumber(Number(match[1])))continue;active[Number(match[1])] = match[2].match(/<active>\s*(\d+)\s*<\/active>/)?.[1] || '';preview[Number(match[1])]=match[2].match(/<preview>\s*(\d+)\s*<\/preview>/)?.[1]||'';}
  const mixInputs = inputs.filter(input=>input.type === 'Mix');
  return {inputs,active,preview,mixId(n:number){return n === 1 ? 'main' : mixInputs[n-2]?.key;}};
}
