import {GEAR_OBJECTS,GEAR_PARTS,GEAR_HOME,GEAR_STATIONS,newGearRoom,gearRoomAction,gearRoomReport} from './gearRoomState.js';
import {ITEMS,TERMINALS,newPhysicsRoom,physicsRoomAction,physicsRoomReport} from './physicsRoomState.js';
import {PLANT_SLIDES,PLANT_FEATURES,newPlantRoom,plantRoomAction,plantRoomReport} from './plantRoomState.js';
import {newRoom,roomAction,roomAssessment,advanceLiquid} from './roomState.js';
import {newTitrationRoom,titrationRoomAction,titrationReport,advanceTitration} from './titrationRoomState.js';
export const SPATIAL_LABS=['physics','plant','water','chemistry','engineering'];
export const freshSpatial=lab=>lab==='physics'?newPhysicsRoom():lab==='plant'?newPlantRoom():lab==='water'?newRoom():lab==='chemistry'?newTitrationRoom():lab==='engineering'?newGearRoom():null;
export const spatialAssessment=(lab,s)=>lab==='physics'?physicsRoomReport(s):lab==='plant'?plantRoomReport(s):lab==='water'?roomAssessment(s):lab==='engineering'?gearRoomReport(s):titrationReport(s);
const waterActions=new Set(['beaker','cylinder','bench','water','sink','storage','pour','notebook']);
const chemistryActions=new Set(['safety','flask','burette','sample','indicator','reference','bench','store','inspect','valve','notebook']);
export function stopSpatialFlow(state){if(!state?.flow)return false;state.flow=null;state.flowAt=null;return true;}
export function advanceSpatialFlow(lab,state,now=Date.now()){
 if(!state?.flow)return false;const dt=Math.max(0,Math.min(1,(now-state.flowAt)/1000));if(!dt)return false;state.flowAt=now;
 let more;if(lab==='water')more=advanceLiquid(state,state.flow,dt);else if(lab==='chemistry'){more=true;for(let left=dt;left>1e-8&&more;left-=.1)more=advanceTitration(state,Math.min(.1,left));}else return stopSpatialFlow(state);
 if(!more)stopSpatialFlow(state);return true;
}
const physicsActions=new Set(['safety','bench','store','clear','topology','voltage','power','notebook',...ITEMS,...TERMINALS.map(t=>'terminal:'+t)]);
const plantActions=new Set(['safety','scope','stage','bench','store','unload','light','objective','record',...PLANT_SLIDES,...PLANT_FEATURES.map(f=>'feature:'+f)]);
function stationFor(lab,state,id){
 if(lab==='water'){const shelf={beaker:-4.65,cylinder:-3.45};if(id in shelf)return state[id]==='storage'?[shelf[id],-2.4]:[id==='beaker'?-.95:.05,.45];return {bench:[0,.45],water:[4,-2.4],sink:[4,2.85],storage:[-4,-2.4],pour:[0,.45],notebook:[1.15,.45]}[id];}
 if(lab==='chemistry'){const shelf={flask:-4.98,burette:-3.75,sample:-4.95,reference:-4,indicator:-3.1};if(id in shelf&&state[id]==='store')return [shelf[id],-2.4];return {safety:[4,-2.4],store:[-4,-2.4],bench:[0,.55],flask:[-.6,.55],burette:[-.6,.55],inspect:[-.6,.55],valve:[-.6,.55],notebook:[1.25,.55]}[id];}
 const common={safety:[4,-2.4],store:[-4,-2.4],bench:[0,.55]};if(common[id])return common[id];
 if(lab==='physics'){const shelf={supply:-5,r1:-4,r2:-3,ammeter:-5,voltmeter:-4,switch:-3},bench={supply:-1.3,r1:-1.3,r2:0,ammeter:1.3,voltmeter:1.25,switch:0};if(ITEMS.includes(id))return state.items[id]==='store'?[shelf[id],-2.4]:[bench[id],.55];return {notebook:[1.55,.55],topology:[0,.55],clear:[0,.55],power:[0,.55],voltage:[-1.3,.55]}[id];}
 if(id==='scope'||PLANT_SLIDES.includes(id))return [id==='scope'?-4.6:-3.25,-2.4];return {stage:[-.4,.55],unload:[-.4,.55],light:[-.4,.55],objective:[-.4,.55],record:[1.3,.55]}[id];
}
export function applySpatialAction(lab,state,action){
 if(!state||!action||typeof action.id!=='string'||action.id.length>80)throw Error('Invalid spatial action');
 if(action.id==='notes'){if(typeof action.text!=='string'||action.text.length>2000)throw Error('Notes must be at most 2000 characters');state.notes=action.text;return 'Interpretation updated.';}
 if(lab==='engineering'){const id=action.id;if(!GEAR_OBJECTS.includes(id)&&!Object.hasOwn(GEAR_STATIONS,id))throw Error('Unsupported engineering action');const pose=GEAR_OBJECTS.includes(id)?(state.items[id]==='store'?GEAR_HOME[id]:[0,.55]):GEAR_STATIONS[id];const result=gearRoomAction(state,id);state.spatialPose=[...pose];return result;}
 if(state.flow){advanceSpatialFlow(lab,state);if(action.id==='stop'){stopSpatialFlow(state);return 'Virtual flow stopped.';}if(state.flow)throw Error('Stop virtual flow before changing apparatus.');}
 if(action.id==='stop'&&(lab==='water'||lab==='chemistry'))return 'Virtual flow stopped.';
 if(lab==='water'&&/^target:(30|50|70|100)$/.test(action.id)){if(state.events.length||state.records.length)throw Error('Set the target before starting a practical.');state.targetMl=Number(action.id.slice(7));return 'Assigned volume updated.';}
 const valid=lab==='physics'?physicsActions.has(action.id):lab==='plant'?(plantActions.has(action.id)||/^(focus|x|y):(?:100|[0-9]{1,2})$/.test(action.id)):lab==='water'?(waterActions.has(action.id)||/^mark:(?:100|[0-9]0|0)$/.test(action.id)):lab==='chemistry'&&(chemistryActions.has(action.id)||/^read:(?:[0-4]?[0-9](?:\.[05])?|50(?:\.0)?)$/.test(action.id));
 if(!valid)throw Error('Unsupported spatial action');
 if(state.records.length>=100&&action.id==='notebook')throw Error('Observation limit reached; reset the practical before additional recordings');
 const pose=stationFor(lab,state,action.id),message=lab==='physics'?physicsRoomAction(state,action.id):lab==='plant'?plantRoomAction(state,action.id):lab==='water'?roomAction(state,action.id):titrationRoomAction(state,action.id);
 if((lab==='water'&&['fill','pour','drain'].includes(message))||(lab==='chemistry'&&message==='flow')){state.flow=message;state.flowAt=Date.now();}
 if(pose)state.spatialPose=pose;
 if(state.events.length>150)state.events.splice(0,state.events.length-150);
 return message;
}
