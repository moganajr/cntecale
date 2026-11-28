import {ITEMS,TERMINALS,newPhysicsRoom,physicsRoomAction,physicsRoomReport} from './physicsRoomState.js';
import {PLANT_SLIDES,PLANT_FEATURES,newPlantRoom,plantRoomAction,plantRoomReport} from './plantRoomState.js';
export const SPATIAL_LABS=['physics','plant'];
export const freshSpatial=lab=>lab==='physics'?newPhysicsRoom():lab==='plant'?newPlantRoom():null;
export const spatialAssessment=(lab,s)=>lab==='physics'?physicsRoomReport(s):plantRoomReport(s);
const physicsActions=new Set(['safety','bench','store','clear','topology','voltage','power','notebook',...ITEMS,...TERMINALS.map(t=>'terminal:'+t)]);
const plantActions=new Set(['safety','scope','stage','bench','store','unload','light','objective','record',...PLANT_SLIDES,...PLANT_FEATURES.map(f=>'feature:'+f)]);
function stationFor(lab,state,id){
 const common={safety:[4,-2.4],store:[-4,-2.4],bench:[0,.55]};if(common[id])return common[id];
 if(lab==='physics'){const shelf={supply:-5,r1:-4,r2:-3,ammeter:-5,voltmeter:-4,switch:-3},bench={supply:-1.3,r1:-1.3,r2:0,ammeter:1.3,voltmeter:1.25,switch:0};if(ITEMS.includes(id))return state.items[id]==='store'?[shelf[id],-2.4]:[bench[id],.55];return {notebook:[1.55,.55],topology:[0,.55],clear:[0,.55],power:[0,.55],voltage:[-1.3,.55]}[id];}
 if(id==='scope'||PLANT_SLIDES.includes(id))return [id==='scope'?-4.6:-3.25,-2.4];return {stage:[-.4,.55],unload:[-.4,.55],light:[-.4,.55],objective:[-.4,.55],record:[1.3,.55]}[id];
}
export function applySpatialAction(lab,state,action){
 if(!state||!action||typeof action.id!=='string'||action.id.length>80)throw Error('Invalid spatial action');
 if(action.id==='notes'){if(typeof action.text!=='string'||action.text.length>2000)throw Error('Notes must be at most 2000 characters');state.notes=action.text;return 'Interpretation updated.';}
 const valid=lab==='physics'?physicsActions.has(action.id):lab==='plant'&&(plantActions.has(action.id)||/^(focus|x|y):(?:100|[0-9]{1,2})$/.test(action.id));
 if(!valid)throw Error('Unsupported spatial action');
 if(state.records.length>=100&&action.id==='notebook')throw Error('Observation limit reached; reset the practical before additional recordings');
 const pose=stationFor(lab,state,action.id),message=lab==='physics'?physicsRoomAction(state,action.id):plantRoomAction(state,action.id);
 if(pose)state.spatialPose=pose;
 if(state.events.length>150)state.events.splice(0,state.events.length-150);
 return message;
}
