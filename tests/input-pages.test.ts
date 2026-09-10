import test from 'node:test';
import assert from 'node:assert/strict';
import {inputPage} from '../lib/input-pages.ts';
test('input pages preserve order and cover all sources without duplication',()=>{
 const inputs=Array.from({length:29},(_,i)=>({key:`source-${i}`}));
 const pages=[0,1,2].map(page=>inputPage(inputs,page));
 assert.deepEqual(pages.flatMap(page=>page.items),inputs);
 assert.deepEqual(pages.map(page=>page.items.length),[12,12,5]);
 assert.equal(pages[2].start,24);assert.equal(pages[2].end,29);assert.equal(pages[0].pages,3);
});
test('empty, filtered and invalid page requests stay in range',()=>{
 assert.deepEqual(inputPage([],8).items,[]);assert.equal(inputPage([],8).page,0);
 assert.equal(inputPage([1,2,3],10).page,0);assert.equal(inputPage([1],-3).page,0);
 assert.equal(inputPage([1],NaN).page,0);assert.equal(inputPage([1],0,99).pageSize,12);
 assert.equal(inputPage(Array.from({length:50},(_,i)=>i),1,24).items[0],24);
});
