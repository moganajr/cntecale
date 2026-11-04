/** CNTE-VSL v1.0 precision servicing simulation for self-built equipment.
 * Technical training abstraction, not manufacturer-calibrated mechanical physics.
 */
import {EQUIPMENT,REPAIR_TOOL,newEquipmentState,actEquipment,equipmentStatus} from './equipmentEngine.js';
import {displacedPose,dockingTarget,evaluateDock,validatePose} from './spatialAssembly.js';
import {collisionReport,connectorRequirement,checkConnector,syntheticEquipmentResponse} from './physicalConstraints.js';
const finite=(v,name)=>{if(!Number.isFinite(v))throw Error(name+' must be finite');return v};
export function freshServiceBench(equipmentId='electrical-panel',name='Learner'){
 if(!EQUIPMENT[equipmentId])throw Error('Unknown equipment');
 const state=newEquipmentState(equipmentId);state.safe=false;return {name:String(name).slice(0,60),state,fasteners:{},poses:{},alignmentChecks:{},contact:null,connectors:{},lastResponse:null,operations:[],locked:false,submitted:false};
}
export function fastenerState(bench,partId){const model=EQUIPMENT[bench.state.equipmentId],part=model.parts.find(p=>p.id===partId);if(!part)throw Error('Unknown part');return bench.fasteners[partId]||{turns:0,secured:true};}
export function serviceAction(bench,action){
 if(bench.locked||bench.submitted)throw Error('Workbench is paused or submitted');
 if(!action||typeof action!=='object')throw Error('Action required');
 const model=EQUIPMENT[bench.state.equipmentId];const state=bench.state,part=model.parts.find(p=>p.id===action.part);
 const next={...bench,state,fasteners:{...bench.fasteners},poses:{...bench.poses},alignmentChecks:{...bench.alignmentChecks},connectors:{...bench.connectors},operations:[...bench.operations]};
 const fixed=x=>Math.round(x*10)/10;
 if(action.kind==='contact'){
  if(!state.safe)throw Error('Isolate equipment before approaching with a tool');
  if(!part||part.fixed)throw Error('Select a serviceable component');
  if(!['service-driver',REPAIR_TOOL[part.id]].includes(action.tool))throw Error('Tool incompatible with selected component');
  next.contact={partId:part.id,tool:action.tool};
 }else if(action.kind==='move'){
  if(!state.safe||!part||!state.removed.includes(part.id))throw Error('Remove and isolate the component before moving it');
  const result=collisionReport(state.equipmentId,part.id,action.pose,state.removed);
  if(!result.clear&&!evaluateDock(state.equipmentId,part.id,result.pose).aligned)throw Error('Component intersects '+result.conflicts.map(c=>c.label).join(', '));
  next.poses[part.id]=result.pose;
  next.alignmentChecks[part.id]=evaluateDock(state.equipmentId,part.id,result.pose);
 }else if(action.kind==='connect'){
  if(!state.safe||!part||state.removed.includes(part.id))throw Error('Install and isolate component before attaching connector');
  const kind=connectorRequirement(state.equipmentId).kind;
  const target=dockingTarget(state.equipmentId,part.id);
  const result=checkConnector(state.equipmentId,part.id,action.connectorKind,target);
  next.connectors[part.id]=result.kind;
 }else if(action.kind==='tool-turn'){
  if(!state.safe)throw Error('Isolate equipment before servicing');
  if(!part||part.fixed)throw Error('Select removable component');
  if(action.tool!=='service-driver'||next.contact?.partId!==part.id||next.contact?.tool!=='service-driver')throw Error('First position the service driver on the selected fastener');
  const previous=fastenerState(next,part.id);
  if(!Number.isFinite(action.degrees)||![90,-90].includes(action.degrees))throw Error('Turn by a 90 degree tool action');
  if(state.removed.includes(part.id))throw Error('Cannot turn fastener while part removed');
  const turns=Math.max(0,Math.min(4,previous.turns+(action.degrees<0?1:-1)));
  next.fasteners[part.id]={turns,secured:turns===0};
 }else if(action.kind==='remove'){
  if(!part||part.fixed)throw Error('Select removable component');
  if(fastenerState(next,part.id).turns<4)throw Error('Loosen the component fastener four quarter-turns before lifting');
  next.state=actEquipment(state,action);
  next.poses[part.id]=displacedPose(state.equipmentId,part.id);
  delete next.alignmentChecks[part.id];
  delete next.connectors[part.id];
 }else if(action.kind==='align'){
  if(!state.safe)throw Error('Isolate equipment before alignment');
  if(!part||!state.removed.includes(part.id))throw Error('Remove this component before aligning');
  const pose=validatePose(action.pose);
  next.poses[part.id]=pose;
  next.alignmentChecks[part.id]=evaluateDock(state.equipmentId,part.id,pose);
 }else if(action.kind==='install'){
  if(!part||!state.removed.includes(part.id))throw Error('Remove component before installing');
  if(!next.alignmentChecks[part.id]?.aligned)throw Error('Align the part position and rotation within the 3D docking tolerance before installation');
  next.state=actEquipment(state,action);
  if(part&&!part.fixed)next.fasteners[part.id]={turns:4,secured:false};
  next.poses[part.id]=dockingTarget(state.equipmentId,part.id);
  delete next.alignmentChecks[part.id];
 }else if(action.kind==='repair'){
  if(next.contact?.partId!==part?.id||next.contact?.tool!==action.tool)throw Error('Position the correct digital repair tool against the selected component first');
  next.state=actEquipment(state,action);
 }else if(action.kind==='inspect'||action.kind==='isolate'||action.kind==='rotate'||action.kind==='transparent'||action.kind==='labels'||action.kind==='exploded'){
  if(action.kind==='rotate')finite(action.degrees,'Angle');
  next.state=actEquipment(state,action);
 }else if(action.kind==='test'){
  const st=equipmentStatus(state);
  if(!st.assembled)throw Error('Install all components before functional test');
  const loose=model.parts.filter(p=>!p.fixed&&(next.fasteners[p.id]?.turns||0)>0);
  if(loose.length)throw Error('Secure all accessible fasteners before simulated functional test');
  if(!state.safe)throw Error('Training test requires safety-isolated test mode');
  if(st.faulty)throw Error('Repair the damaged component before simulated functional test');
  const connection=connectorRequirement(state.equipmentId);
  if(next.connectors[connection.partId]!==connection.kind)throw Error('Reconnect the serviced component before simulated function testing');
  next.lastResponse=syntheticEquipmentResponse(state.equipmentId,{assembled:st.assembled,repaired:!st.faulty,connected:true,secured:true});
  next.operations.push({kind:'test-passed',at:Date.now()});
 }else throw Error('Unsupported service action');
 next.operations.push({kind:action.kind,part:action.part||null,at:Date.now()});
 if(next.operations.length>200)next.operations.shift();
 return next;
}
export function serviceAssessment(bench){
 const st=equipmentStatus(bench.state),parts=EQUIPMENT[bench.state.equipmentId].parts;
 const secured=parts.every(p=>p.fixed||!bench.fasteners[p.id]||bench.fasteners[p.id].turns===0);
 const lastTest=bench.operations.findLastIndex(o=>o.kind==='test-passed');
 const completedTest=lastTest>=0&&!bench.operations.slice(lastTest+1).some(o=>['remove','install','repair','tool-turn','isolate','align','move','connect'].includes(o.kind))&&bench.lastResponse?.functional===true;
 const unique=new Set(bench.operations.map(o=>o.kind));
 const score=(unique.has('tool-turn')?15:0)+(unique.has('remove')?20:0)+(unique.has('inspect')?10:0)+(unique.has('repair')?25:0)+(unique.has('install')?15:0)+(st.operational&&secured&&completedTest?15:0);
 return {score,passed:score>=80&&st.operational&&secured&&completedTest,secured,completedTest,operational:st.operational,response:bench.lastResponse||null,simulationOnly:true};
}
