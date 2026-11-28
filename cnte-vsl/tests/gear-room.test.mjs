import assert from 'node:assert/strict';
import {newGearRoom,gearRoomAction,gearRoomReport} from '../src/gearRoomState.js';
import {SPATIAL_LABS,freshSpatial,applySpatialAction,spatialAssessment} from '../src/spatialClassroomCore.js';
const s=newGearRoom(),act=id=>gearRoomAction(s,id);
assert.throws(()=>act('driver'));assert.throws(()=>act('test'));act('safety');
act('crank');assert.throws(()=>act('bench'));act('store');
act('driver');assert.throws(()=>act('driven'));act('bench');
act('driven');act('bench');act('crank');act('bench');
act('test');assert.throws(()=>act('driver'));assert.throws(()=>act('record'));
for(let i=0;i<8;i++)act('turn');act('record');assert.deepEqual(s.records[0],{inputTurns:2,outputTurns:1,ratio:2,direction:'opposite'});
assert.equal(gearRoomReport(s).passed,false);act('stop');assert.throws(()=>act('turn'));s.notes='The smaller input gear rotates twice for each opposite output revolution.';assert.equal(gearRoomReport(s).score,100);assert.equal(gearRoomReport(s).passed,true);
assert.ok(SPATIAL_LABS.includes('engineering'));const live=freshSpatial('engineering');applySpatialAction('engineering',live,{id:'safety'});assert.deepEqual(live.spatialPose,[4,-2.4]);assert.equal(spatialAssessment('engineering',live).score,15);assert.throws(()=>applySpatialAction('engineering',live,{id:'unsupported'}));
console.log('Mechanical workshop tests passed');

const fault=freshSpatial('engineering'),action=id=>applySpatialAction('engineering',fault,{id});
action('fault');assert.throws(()=>action('test'));action('safety');assert.throws(()=>action('driven'));action('test');for(let i=0;i<8;i++)action('turn');action('record');assert.equal(fault.records[0].outputTurns,.75);assert.equal(fault.records[0].phase,'before');action('stop');assert.throws(()=>action('diagnose'));action('inspect');action('diagnoseInput');assert.equal(fault.diagnosed,false);action('diagnose');action('driven');action('store');action('spare');action('bench');action('test');for(let i=0;i<8;i++)action('turn');action('record');assert.equal(fault.records[1].outputTurns,1);assert.equal(fault.records[1].ratio,2);assert.equal(fault.records[1].phase,'after');action('stop');applySpatialAction('engineering',fault,{id:'notes',text:'The damaged gear slipped and the replacement restored the model ratio.'});assert.equal(spatialAssessment('engineering',fault).passed,true);assert.equal(spatialAssessment('engineering',fault).score,100);console.log('Fault diagnosis and replacement tests passed');
