/** CNTE-VSL v1.0 precision servicing simulation for self-built equipment.
 * Technical training abstraction, not manufacturer-calibrated mechanical physics.
 */
import {EQUIPMENT,REPAIR_TOOL,newEquipmentState,actEquipment,equipmentStatus} from './equipmentEngine.js';
const finite=(v,name)=>{if(!Number.isFinite(v))throw Error(name+' must be finite');return v};
export function freshServiceBench(equipmentId='electrical-panel',name='Learner'){
 if(!EQUIPMENT[equipmentId])throw Error('Unknown equipment');
 return {name:String(name).slice(0,60),state:newEquipmentState(equipmentId),fasteners:{},operations:[],locked:false,submitted:false};
}
export function fastenerState(bench,partId){const model=EQUIPMENT[bench.state.equipmentId],part=model.parts.find(p=>p.id===partId);if(!part)throw Error('Unknown part');return bench.fasteners[partId]||{turns:0,secured:true};}
export function serviceAction(bench,action){
 if(bench.locked||bench.submitted)throw Error('Workbench is paused or submitted');
 if(!action||typeof action!=='object')throw Error('Action required');
 const model=EQUIPMENT[bench.state.equipmentId];const state=bench.state,part=model.parts.find(p=>p.id===action.part);
 const next={...bench,state,fasteners:{...bench.fasteners},operations:[...bench.operations]};
 const fixed=x=>Math.round(x*10)/10;
 if(action.kind==='tool-turn'){
  if(!state.safe)throw Error('Isolate equipment before servicing');
  if(!part||part.fixed)throw Error('Select removable component');
  if(action.tool!=='service-driver')throw Error('Use the virtual fastener driver for quarter-turn operations');
  const previous=fastenerState(next,part.id);
  if(!Number.isFinite(action.degrees)||![90,-90].includes(action.degrees))throw Error('Turn by a 90 degree tool action');
  if(state.removed.includes(part.id))throw Error('Cannot turn fastener while part removed');
  const turns=Math.max(0,Math.min(4,previous.turns+(action.degrees<0?1:-1)));
  next.fasteners[part.id]={turns,secured:turns===0};
 }else if(action.kind==='remove'){
  if(!part||part.fixed)throw Error('Select removable component');
  if(fastenerState(next,part.id).turns<4)throw Error('Loosen the component fastener four quarter-turns before lifting');
  next.state=actEquipment(state,action);
 }else if(action.kind==='install'){
  next.state=actEquipment(state,action);
  if(part&&!part.fixed)next.fasteners[part.id]={turns:4,secured:false};
 }else if(action.kind==='inspect'||action.kind==='repair'||action.kind==='isolate'||action.kind==='rotate'||action.kind==='transparent'||action.kind==='labels'||action.kind==='exploded'){
  if(action.kind==='rotate')finite(action.degrees,'Angle');
  next.state=actEquipment(state,action);
 }else if(action.kind==='test'){
  const st=equipmentStatus(state);
  if(!st.assembled)throw Error('Install all components before functional test');
  const loose=model.parts.filter(p=>!p.fixed&&(next.fasteners[p.id]?.turns||0)>0);
  if(loose.length)throw Error('Secure all accessible fasteners before simulated functional test');
  if(!state.safe)throw Error('Training test requires safety-isolated test mode');
  if(st.faulty)throw Error('Repair the damaged component before simulated functional test');
  next.operations.push({kind:'test-passed',at:Date.now()});
 }else throw Error('Unsupported service action');
 next.operations.push({kind:action.kind,part:action.part||null,at:Date.now()});
 if(next.operations.length>200)next.operations.shift();
 return next;
}
export function serviceAssessment(bench){
 const st=equipmentStatus(bench.state),parts=EQUIPMENT[bench.state.equipmentId].parts;
 const secured=parts.every(p=>p.fixed||!bench.fasteners[p.id]||bench.fasteners[p.id].turns===0);
 const completedTest=bench.operations.some(o=>o.kind==='test-passed');
 const unique=new Set(bench.operations.map(o=>o.kind));
 const score=(unique.has('tool-turn')?15:0)+(unique.has('remove')?20:0)+(unique.has('inspect')?10:0)+(unique.has('repair')?25:0)+(unique.has('install')?15:0)+(st.operational&&secured&&completedTest?15:0);
 return {score,passed:score>=80&&st.operational&&secured&&completedTest,secured,completedTest,operational:st.operational,simulationOnly:true};
}
