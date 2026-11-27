import assert from 'node:assert/strict';
import {newTitrationRoom,titrationRoomAction,advanceTitration,titrationReport,roomPH,titrationSteps} from '../src/titrationRoomState.js';
const s=newTitrationRoom(),action=id=>titrationRoomAction(s,id);
assert.match(action('flask'),/safety/);action('safety');action('flask');action('bench');action('burette');action('bench');
assert.match(action('valve'),/Complete/);action('sample');action('flask');action('store');action('reference');action('burette');action('store');action('indicator');action('flask');action('store');action('inspect');assert.equal(action('valve'),'flow');
for(let i=0;i<125;i++)advanceTitration(s,.1);assert.ok(Math.abs(s.delivered-25)<1e-9);assert.ok(Math.abs(roomPH(s)-7)<1e-6);action('read:25');action('notebook');assert.ok(titrationSteps(s).every(Boolean));assert.equal(titrationReport(s).score,100);assert.equal(titrationReport(s).passed,true);assert.match(action('valve'),/fresh trial/);
console.log('Spatial titration state, setup gates, flow, model and competency tests passed.');
