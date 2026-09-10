import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readVmixState} from '../lib/vmix-xml.ts';
test('XML mapping ignores input names and resolves root vs additional program',()=>{
 const state=readVmixState(`<vmix><inputs><input number='7' title='A &amp; B' key='abc' type='Mix'>Label<text name="foo">&lt;input&gt;</text></input><input type="Capture" number="8" key="cam"/></inputs><active>7</active><mix number="2"><preview>0</preview><active>8</active></mix></vmix>`);
 assert.equal(state.mixId(1),'main');assert.equal(state.mixId(2),'abc');assert.equal(state.mixId(3),undefined);assert.equal(state.active[1],'7');assert.equal(state.active[2],'8');
 assert.throws(()=>readVmixState('<html>Login</html>'));assert.throws(()=>readVmixState('<vmix><inputs>'));
});
test('XML accepts greater-than inside quoted titles and an empty input list',()=>{
 const state=readVmixState('<vmix><inputs><input title="A > B" number="1" type="Mix" key="abc"/></inputs><active>1</active><mix number="2"><active>1</active></mix></vmix>');assert.equal(state.mixId(2),'abc');assert.equal(readVmixState('<vmix><inputs /><active>0</active></vmix>').inputs.length,0);
});
