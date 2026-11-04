import assert from 'node:assert/strict';
import {EQUIPMENT} from '../src/equipmentEngine.js';
import {CONNECTORS,RESPONSE,boxesOverlap,collisionReport,connectorRequirement,checkConnector,syntheticEquipmentResponse} from '../src/physicalConstraints.js';
import {dockingTarget,displacedPose} from '../src/spatialAssembly.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++},ok=(v)=>{assert.ok(v);count++},fails=f=>{assert.throws(f);count++};
eq(Object.keys(CONNECTORS).length,12);
ok(boxesOverlap({min:[0,0,0],max:[1,1,1]},{min:[.3,.3,.3],max:[2,2,2]}));
eq(boxesOverlap({min:[0,0,0],max:[1,1,1]},{min:[2,2,2],max:[3,3,3]}),false);
for(const [id,model] of Object.entries(EQUIPMENT)){
 const kind=CONNECTORS[id],part=model.fault,target=dockingTarget(id,part);
 eq(connectorRequirement(id).kind,kind);
 eq(checkConnector(id,part,kind,target).connected,true);
 fails(()=>checkConnector(id,part,'incompatible',target));
 fails(()=>checkConnector(id,part,kind,displacedPose(id,part)));
 eq(syntheticEquipmentResponse(id,{assembled:false,repaired:true,connected:true,secured:true}).functional,false);
 const correct=syntheticEquipmentResponse(id,{assembled:true,repaired:true,connected:true,secured:true});
 eq(correct.functional,true);ok(correct.observation.length>6);
 const candidate=collisionReport(id,part,displacedPose(id,part),[part]);
 ok(Array.isArray(candidate.conflicts));
 const same=collisionReport(id,part,target,[part]);
 ok(Array.isArray(same.conflicts));
}
fails(()=>connectorRequirement('unknown'));
fails(()=>collisionReport('unknown','part',{position:[0,0,0],rotation:0}));
console.log(count+' collision, connector and synthetic equipment response assertions passed.');
