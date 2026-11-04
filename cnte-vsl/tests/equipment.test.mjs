import assert from 'node:assert/strict';
import {EQUIPMENT,TOOLS,REPAIR_TOOL,newEquipmentState,actEquipment,equipmentStatus,equipmentAssessment} from '../src/equipmentEngine.js';
let count=0;
const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const yes=(v,label)=>{assert.ok(v,label);count++};
const fails=(fn)=>{assert.throws(fn);count++};
eq(Object.keys(EQUIPMENT).length,7);
eq(Object.keys(TOOLS).length>=10,true);
for(const [id,model] of Object.entries(EQUIPMENT)){
 let s=newEquipmentState(id);
 eq(s.equipmentId,id);eq(equipmentStatus(s).operational,false);
 yes(model.parts.some(p=>p.id===model.fault),'Every equipment must declare damaged component');
 yes(model.tools.includes(REPAIR_TOOL[model.fault]),'Repair tool available');
 s=actEquipment(s,{kind:'rotate',degrees:450});eq(s.rotation,90);
 s=actEquipment(s,{kind:'rotate',degrees:-90});eq(s.rotation,270);
 s=actEquipment(s,{kind:'transparent',value:true});eq(s.transparent,true);
 s=actEquipment(s,{kind:'exploded',value:true});eq(s.exploded,true);
 s=actEquipment(s,{kind:'labels',value:false});eq(s.labels,false);
 const part=model.parts.find(x=>x.id===model.fault);
 if(part.prerequisites?.length)fails(()=>actEquipment(s,{kind:'remove',part:part.id}));
 const toRemove=[];const plan=id=>{const p=model.parts.find(x=>x.id===id);for(const prerequisite of p.prerequisites||[])if(!toRemove.includes(prerequisite))plan(prerequisite);if(!toRemove.includes(id))toRemove.push(id)};plan(part.id);
 for(const component of toRemove){s=actEquipment(s,{kind:'remove',part:component});yes(s.removed.includes(component))}
 fails(()=>actEquipment(s,{kind:'repair',part:model.fault,tool:'wrong-tool'}));
 fails(()=>actEquipment(s,{kind:'repair',part:model.fault,tool:REPAIR_TOOL[model.fault]}));
 s=actEquipment(s,{kind:'inspect',part:model.fault});eq(s.faultDetected,true);
 s=actEquipment(s,{kind:'repair',part:model.fault,tool:REPAIR_TOOL[model.fault]});eq(equipmentStatus(s).faulty,false);
 for(const component of toRemove.slice().reverse()){s=actEquipment(s,{kind:'install',part:component})}
 eq(equipmentStatus(s).operational,true);
 eq(equipmentAssessment(s).score,100);eq(equipmentAssessment(s).passed,true);
 let unsafe=actEquipment(s,{kind:'isolate',value:false});fails(()=>actEquipment(unsafe,{kind:'remove',part:part.id}));
}
fails(()=>newEquipmentState('unknown'));
fails(()=>actEquipment(newEquipmentState('microscope'),{kind:'rotate',degrees:NaN}));
fails(()=>actEquipment(newEquipmentState('microscope'),{kind:'remove',part:'frame'}));
console.log(count+' equipment mechanics and repair assertions passed.');
