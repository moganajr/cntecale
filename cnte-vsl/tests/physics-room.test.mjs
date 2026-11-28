import assert from 'node:assert/strict';
import {ITEMS,newPhysicsRoom,physicsRoomAction,roomCircuit,wiringMatches,physicsRoomReport} from '../src/physicsRoomState.js';
const s=newPhysicsRoom(),act=id=>physicsRoomAction(s,id),wire=(a,b)=>{act('terminal:'+a);return act('terminal:'+b)};
assert.match(act('supply'),/safety/);act('safety');for(const id of ITEMS){assert.match(act(id),/Collected/);act('bench')}
assert.match(act('power'),/interlock/);wire('supply:a','supply:b');assert.equal(wiringMatches(s),false);assert.match(act('power'),/interlock/);act('clear');
for(const [a,b] of [['supply:a','switch:a'],['switch:b','ammeter:a'],['ammeter:b','r1:a'],['r1:a','voltmeter:a'],['r1:b','r2:a'],['r2:b','supply:b'],['supply:b','voltmeter:b']])wire(a,b);
assert.equal(wiringMatches(s),true);act('power');assert.equal(roomCircuit(s).current,.02);assert.match(act('terminal:r1:a'),/Isolate/);act('notebook');act('power');act('topology');
for(const [a,b] of [['supply:a','switch:a'],['switch:b','ammeter:a'],['ammeter:b','r1:a'],['r1:a','r2:a'],['r2:a','voltmeter:a'],['r1:b','r2:b'],['r2:b','supply:b'],['supply:b','voltmeter:b']])wire(a,b);
assert.ok(wiringMatches(s));act('power');assert.ok(Math.abs(roomCircuit(s).current-.09)<1e-10);act('notebook');act('power');s.notes='The parallel circuit has lower equivalent resistance and higher total current.';assert.equal(physicsRoomReport(s).passed,true);assert.equal(physicsRoomReport(s).score,100);
console.log('Spatial physics: instrument preparation, terminal equivalence, interlocks, measurements and rubric passed.');
