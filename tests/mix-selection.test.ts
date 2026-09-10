import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mixInformation, visibleMixNumbers, type Source, type Snapshot } from '../lib/vmix-state.ts';
const inputs: Source[] = [
 {key:'camera',number:'1',title:'Camera',type:'Capture',state:'Running'},
 {key:'woz-1',number:'7',title:'WOZ1',type:'Mix',state:'Paused'},
 {key:'woz-2',number:'8',title:'Mix3',type:'Mix',state:'Paused'},
 {key:'woz-3',number:'9',title:'Mix4',type:'Mix',state:'Paused'},
];
function snapshot(sources=inputs,mixes:Record<number,string>={1:'1',2:'1',3:'1',4:'1'}):Snapshot{return {inputs:sources,mixes,mixInfo:mixInformation(sources,mixes),version:'29'};}
test('only available mixes appear; names refer to mix inputs, not active source',()=>{
 const state=snapshot();assert.deepEqual(visibleMixNumbers(state,'all'),[1,2,3,4]);assert.equal(state.mixInfo[2].name,'WOZ1');assert.equal(state.mixInfo[3].name,'Mix3');assert.equal(state.mixInfo[1].name,'Program główny');assert.equal(state.mixInfo[5],undefined);
});
test('operators have independent filtered views; renaming preserves selection',()=>{
 const state=snapshot();assert.deepEqual(visibleMixNumbers(state,'woz-1'),[2]);assert.deepEqual(visibleMixNumbers(state,'woz-2'),[3]);
 const renamed=snapshot(inputs.map(i=>i.key==='woz-1'?{...i,title:'WOZ ALFA'}:i));assert.deepEqual(visibleMixNumbers(renamed,'woz-1'),[2]);assert.equal(renamed.mixInfo[2].name,'WOZ ALFA');
});
test('removed selection never falls back to all or to replacement at same mix number',()=>{
 const state=snapshot(inputs.filter(i=>i.key!=='woz-1'),{1:'1',2:'1',3:'1'});assert.deepEqual(visibleMixNumbers(state,'woz-1'),[]);assert.deepEqual(visibleMixNumbers(null,'woz-1'),[]);assert.deepEqual(visibleMixNumbers(state,'woz-2'),[2]);assert.deepEqual(visibleMixNumbers(snapshot(),'unknown'),[]);
});
