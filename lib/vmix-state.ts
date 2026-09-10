import type {ProgramState} from './program-controls.ts';
import {validMixNumber} from './vmix-limits.ts';
export type Source = { key: string; number: string; title: string; type: string; state: string };
export type MixInfo = { id: string; name: string };
export type Snapshot = { program?:ProgramState; inputs: Source[]; mixes: Record<number, string>; previews?: Record<number, string>; mixInfo: Record<number, MixInfo>; version: string };

// vMix numbers additional mixes in input-list order. Keep the input GUID as the
// operator selection so removing a mix cannot silently select its replacement.
export function mixInformation(inputs: Source[], mixes: Record<number, string>, mainName='Program główny'): Record<number, MixInfo> {
  const info: Record<number, MixInfo> = {};
  const additional = inputs.filter(input => input.type === 'Mix');
  for (const n of Object.keys(mixes).map(Number)) {
    if (!validMixNumber(n)) continue;
    const source = additional[n - 2];
    info[n] = n === 1 ? { id: 'main', name: mainName } : { id: source?.key || `mix-${n}`, name: source?.title || `Mix ${n}` };
  }
  return info;
}
export function visibleMixNumbers(snapshot: Snapshot | null, selected: string): number[] {
  if (!snapshot) return [];
  return Object.keys(snapshot.mixes).map(Number).filter(n => validMixNumber(n) && (selected === 'all' || snapshot.mixInfo[n]?.id === selected)).sort((a,b) => a-b);
}
