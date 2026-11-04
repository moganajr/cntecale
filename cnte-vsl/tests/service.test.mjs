import assert from 'node:assert/strict';
import {EQUIPMENT,REPAIR_TOOL} from '../src/equipmentEngine.js';
import {freshServiceBench,fastenerState,serviceAction,serviceAssessment} from '../src/serviceMechanics.js';
let count=0;const yes=(v,l)=>{assert.ok(v,l);count++},eq=(a,b)=>{assert.deepEqual(a,b);count++},fails=fn=>{assert.throws(fn);count++};
for(const [id,model] of Object.entries(EQUIPMENT)){
 let b=freshServiceBench(id,'Test student');eq(b.state.equipmentId,id);eq(serviceAssessment(b).passed,false);
 eq(b.state.safe,false);fails(()=>serviceAction(b,{kind:'tool-turn',part:model.fault,tool:'service-driver',degrees:-90}));b=serviceAction(b,{kind:'isolate',value:true});eq(b.state.safe,true);
 const fault=model.fault,part=model.parts.find(p=>p.id===fault),target=[];
 function walk(partId){const p=model.parts.find(q=>q.id===partId);for(const dep of p.prerequisites||[])if(!target.includes(dep))walk(dep);if(!target.includes(partId))target.push(partId)}
 walk(fault);
 fails(()=>serviceAction(b,{kind:'remove',part:target[0]}));
 fails(()=>serviceAction(b,{kind:'tool-turn',part:target[0],tool:'improper',degrees:-90}));
 for(const component of target){
   for(let step=0;step<4;step++)b=serviceAction(b,{kind:'tool-turn',tool:'service-driver',part:component,degrees:-90});
   eq(fastenerState(b,component).turns,4);
   b=serviceAction(b,{kind:'remove',part:component});
   yes(b.state.removed.includes(component),'Part was removed');
 }
 fails(()=>serviceAction(b,{kind:'repair',part:fault,tool:REPAIR_TOOL[fault]}));
 b=serviceAction(b,{kind:'inspect',part:fault});
 fails(()=>serviceAction(b,{kind:'repair',part:fault,tool:'wrong'}));
 b=serviceAction(b,{kind:'repair',part:fault,tool:REPAIR_TOOL[fault]});
 for(const component of [...target].reverse()){
   b=serviceAction(b,{kind:'install',part:component});
   eq(fastenerState(b,component).secured,false);
   for(let step=0;step<4;step++)b=serviceAction(b,{kind:'tool-turn',tool:'service-driver',part:component,degrees:90});
   eq(fastenerState(b,component).secured,true);
 }
 b=serviceAction(b,{kind:'test'});eq(serviceAssessment(b).score,100);eq(serviceAssessment(b).passed,true);
 b.locked=true;fails(()=>serviceAction(b,{kind:'inspect',part:fault}));
}
fails(()=>freshServiceBench('not-exists'));
fails(()=>serviceAction(freshServiceBench('electrical-panel'),{kind:'tool-turn',part:'fuse',tool:'service-driver',degrees:91}));
console.log(count+' guided tool, fastener, repair and live-workbench checks passed.');
