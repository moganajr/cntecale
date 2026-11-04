/** CNTE-VSL v1.1: original educational 3D docking constraints.
 * Coordinates are dimensionless training units; not OEM CAD dimensions.
 */
import {EQUIPMENT} from './equipmentEngine.js';
export const ALIGNMENT_TOLERANCE={distance:0.18,rotationDegrees:12};
export function normalizeAngle(value){if(!Number.isFinite(value))throw Error('Rotation must be finite');return ((value%360)+360)%360}
export function angularDifference(a,b){const d=Math.abs(normalizeAngle(a)-normalizeAngle(b));return Math.min(d,360-d)}
export function dockingTarget(equipmentId,partId){
 const equipment=EQUIPMENT[equipmentId],part=equipment?.parts.find(x=>x.id===partId);
 if(!part)throw Error('Unknown equipment docking part');
 return {position:[...part.position],rotation:0,axis:'z',partId};
}
export function validatePose(pose){
 if(!pose||!Array.isArray(pose.position)||pose.position.length!==3||pose.position.some(v=>!Number.isFinite(v)||Math.abs(v)>10))throw Error('Position must be a finite 3D vector within the training workspace');
 if(!Number.isFinite(pose.rotation))throw Error('Rotation must be finite');
 return {position:pose.position.map(Number),rotation:normalizeAngle(pose.rotation)};
}
export function evaluateDock(equipmentId,partId,pose,{distance=ALIGNMENT_TOLERANCE.distance,rotationDegrees=ALIGNMENT_TOLERANCE.rotationDegrees}={}){
 const actual=validatePose(pose),target=dockingTarget(equipmentId,partId);
 const separation=Math.hypot(...target.position.map((v,i)=>v-actual.position[i]));
 const angularError=angularDifference(actual.rotation,target.rotation);
 return {partId,positionError:separation,angularError,aligned:separation<=distance+1e-9&&angularError<=rotationDegrees+1e-9,tolerance:{distance,rotationDegrees},target};
}
export function displacedPose(equipmentId,partId){const target=dockingTarget(equipmentId,partId);return {position:[target.position[0]+.6,target.position[1]+.4,target.position[2]+.5],rotation:45}}
