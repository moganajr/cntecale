import assert from 'node:assert/strict';
import {EQUIPMENT} from '../src/equipmentEngine.js';
import {ALIGNMENT_TOLERANCE,normalizeAngle,angularDifference,dockingTarget,validatePose,evaluateDock,displacedPose} from '../src/spatialAssembly.js';
let count=0;const eq=(a,b)=>{assert.equal(a,b);count++},ok=v=>{assert.ok(v);count++},fails=fn=>{assert.throws(fn);count++};
eq(normalizeAngle(-30),330);eq(normalizeAngle(720),0);eq(angularDifference(359,1),2);eq(angularDifference(-180,180),0);
fails(()=>validatePose({position:[0,Infinity,0],rotation:0}));fails(()=>validatePose({position:[0,0,11],rotation:0}));fails(()=>normalizeAngle(NaN));
for(const [id,m] of Object.entries(EQUIPMENT))for(const part of m.parts.filter(p=>!p.fixed)){
 const target=dockingTarget(id,part.id),off=displacedPose(id,part.id);
 eq(target.position.length,3);
 eq(evaluateDock(id,part.id,target).aligned,true);
 eq(evaluateDock(id,part.id,off).aligned,false);
 const near={position:[target.position[0]+ALIGNMENT_TOLERANCE.distance*.5,target.position[1],target.position[2]],rotation:5};
 eq(evaluateDock(id,part.id,near).aligned,true);
 const rotated={position:target.position,rotation:30};eq(evaluateDock(id,part.id,rotated).aligned,false);
}
fails(()=>dockingTarget('missing','part'));fails(()=>evaluateDock('microscope','nonexistent',{position:[0,0,0],rotation:0}));
console.log(count+' 3D docking and tolerance assertions passed.');
