import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TRANSITIONS,transitionParameters,hasDuration} from '../lib/transitions.ts';
test('all menu effects preserve exact API names and duration semantics',()=>{
 for(const effect of TRANSITIONS){const params=transitionParameters(effect,500);assert.equal(params.Function,effect);assert.equal(params.Duration,hasDuration(effect)?'500':undefined);}
 assert.deepEqual(transitionParameters(),{Function:'Cut'});assert.throws(()=>transitionParameters('Unknown',500));
});
