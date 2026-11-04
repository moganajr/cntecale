/** CNTE-VSL v1.2 spatial constraints and educational connector behaviors.
 * Bounding boxes are conservative simplified geometry, not calibrated equipment CAD.
 */
import {EQUIPMENT} from './equipmentEngine.js';
import {validatePose,evaluateDock} from './spatialAssembly.js';

export const CONNECTORS={
 'electrical-panel':'electrical','car-starter':'electrical','chemistry-burette':'fluid',
 'microscope':'optical','hematology-analyzer':'sample-fluid','centrifuge':'mechanical',
 'field-microscope':'optical','irrigation-pump':'fluid','computer-workstation':'electrical',
 'sewing-machine':'mechanical','welding-trainer':'electrical','medical-ventilator':'airflow'
};
export const RESPONSE={
 electrical:{healthy:'Continuity restored (synthetic)',fault:'Open path / failed protective component'},
 fluid:{healthy:'Simulated flow restored',fault:'Restricted or uncontrolled flow'},
 optical:{healthy:'Illustrative illumination restored',fault:'No useful illumination'},
 'sample-fluid':{healthy:'Simulated sampling cycle ready; QC still required',fault:'Sampling cycle cannot complete'},
 mechanical:{healthy:'Simulated rotor or drive function restored',fault:'Mechanical drive cannot engage'},
 airflow:{healthy:'Synthetic airflow circuit ready; not clinical use',fault:'Airflow restricted or unavailable'}
};
function boxAt(part,position){
 const half=part.size.map(n=>n/2);
 return {min:position.map((n,i)=>n-half[i]),max:position.map((n,i)=>n+half[i])};
}
export function boxesOverlap(a,b,{clearance=.025}={}){
 return [0,1,2].every(i=>a.min[i]<b.max[i]-clearance&&a.max[i]>b.min[i]+clearance);
}
export function collisionReport(equipmentId,partId,pose,removed=[]){
 const model=EQUIPMENT[equipmentId],part=model?.parts.find(p=>p.id===partId);
 if(!part)throw Error('Unknown equipment component');
 const normalized=validatePose(pose),moving=boxAt(part,normalized.position);
 const conflicts=model.parts.filter(p=>p.id!==partId&&!removed.includes(p.id)&&boxesOverlap(moving,boxAt(p,p.position))).map(p=>({id:p.id,label:p.label}));
 return {clear:conflicts.length===0,conflicts,pose:normalized};
}
export function connectorRequirement(equipmentId){
 if(!EQUIPMENT[equipmentId])throw Error('Unknown equipment');
 return {partId:EQUIPMENT[equipmentId].fault,kind:CONNECTORS[equipmentId],requiresRestoredConnection:true};
}
export function checkConnector(equipmentId,partId,kind,pose){
 const requirement=connectorRequirement(equipmentId);
 if(partId!==requirement.partId)throw Error('Connection check must target the serviced component');
 if(kind!==requirement.kind)throw Error('Wrong connector type for equipment');
 const docking=evaluateDock(equipmentId,partId,pose);
 if(!docking.aligned)throw Error('Component must be accurately seated before connector engagement');
 return {connected:true,kind,partId,docking};
}
export function syntheticEquipmentResponse(equipmentId,{assembled,repaired,connected,secured}){
 const spec=connectorRequirement(equipmentId),responses=RESPONSE[spec.kind];
 const functional=!!(assembled&&repaired&&connected&&secured);
 return {functional,domain:spec.kind,observation:functional?responses.healthy:responses.fault,simulationOnly:true};
}
