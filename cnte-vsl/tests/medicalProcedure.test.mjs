import assert from 'node:assert/strict';
import {MEDICAL_SCENARIOS,freshMedicalProcedure,medicalAction,medicalPracticalAssessment} from '../src/medicalProcedure.js';
const pass=(x)=>{assert.ok(x);count++},eq=(a,b)=>{assert.deepEqual(a,b);count++},fails=(fn)=>{assert.throws(fn);count++};let count=0;
eq(Object.keys(MEDICAL_SCENARIOS).length,4);
fails(()=>freshMedicalProcedure('unknown'));
for(const id of Object.keys(MEDICAL_SCENARIOS)){
 let s=freshMedicalProcedure(id);eq(s.equipmentId,id);eq(medicalPracticalAssessment(s).passed,false);
 fails(()=>medicalAction(s,{kind:'run',rpm:1500}));
 fails(()=>medicalAction(s,{kind:'identity',value:true}));
 s=medicalAction(s,{kind:'ppe',value:true});
 if(id==='field-microscope'){s=medicalAction(s,{kind:'slide-select',slide:'smear'});s=medicalAction(s,{kind:'slide-prepare',value:true});s=medicalAction(s,{kind:'slide-light',value:true});s=medicalAction(s,{kind:'slide-center',value:true});s=medicalAction(s,{kind:'slide-objective',value:4});s=medicalAction(s,{kind:'slide-focus',value:43});s=medicalAction(s,{kind:'slide-observe',structures:['erythrocytes','leukocyte','platelet fragments']});s=medicalAction(s,{kind:'slide-select',slide:'tissue'});s=medicalAction(s,{kind:'slide-prepare',value:true});s=medicalAction(s,{kind:'slide-center',value:true});s=medicalAction(s,{kind:'slide-focus',value:45});s=medicalAction(s,{kind:'slide-observe',structures:['nuclei','cell borders','extracellular space']});s=medicalAction(s,{kind:'interpret',text:'Synthetic slides reveal distinct teaching structures only, not clinical diagnoses.'});eq(medicalPracticalAssessment(s).passed,true);
 }else if(id==='hematology-analyzer'){
   fails(()=>medicalAction(s,{kind:'load',sampleId:'A'}));
   s=medicalAction(s,{kind:'identity',value:true});s=medicalAction(s,{kind:'accept',value:true});
   s=medicalAction(s,{kind:'load',sampleId:'A'});
   fails(()=>medicalAction(s,{kind:'run'}));
   for(const [level,value] of [['low',9],['normal',13.5],['high',17]]){
     s=medicalAction(s,{kind:'qc',level,value});
   }
   s=medicalAction(s,{kind:'run'});eq(s.reports.length,1);
   s=medicalAction(s,{kind:'load',sampleId:'B'});s=medicalAction(s,{kind:'run'});eq(s.reports.length,2);
   s=medicalAction(s,{kind:'interpret',text:'I reviewed three control levels, synthetic red cell indices, and the limitations of nonclinical practice.'});
   eq(medicalPracticalAssessment(s).score,100);eq(medicalPracticalAssessment(s).passed,true);
   const revoked=medicalAction(s,{kind:'qc',level:'high',value:20});
   eq(medicalPracticalAssessment(revoked).passed,false);
   const withoutPpe=medicalAction(s,{kind:'ppe',value:false});eq(medicalPracticalAssessment(withoutPpe).passed,false);
 }else if(id==='centrifuge'){
   s=medicalAction(s,{kind:'identity',value:true});s=medicalAction(s,{kind:'balance',value:true});
   fails(()=>medicalAction(s,{kind:'run',rpm:1500}));
   s=medicalAction(s,{kind:'rotor',value:true});s=medicalAction(s,{kind:'lid',value:true});
   fails(()=>medicalAction(s,{kind:'run',rpm:8000}));
   s=medicalAction(s,{kind:'run',rpm:1500});
   s=medicalAction(s,{kind:'interpret',text:'Balanced synthetic tubes, a secured rotor, closed protective lid and a bounded training speed.'});
   eq(medicalPracticalAssessment(s).score,100);eq(medicalPracticalAssessment(s).passed,true);
   s=medicalAction(s,{kind:'balance',value:false});eq(medicalPracticalAssessment(s).passed,false);
 }else{
   s=medicalAction(s,{kind:'circuit',value:true});
   fails(()=>medicalAction(s,{kind:'leak',value:true}));
   s=medicalAction(s,{kind:'filter',value:true});s=medicalAction(s,{kind:'leak',value:true});
   s=medicalAction(s,{kind:'run'});
   s=medicalAction(s,{kind:'interpret',text:'This is a nonpatient, synthetic respiratory training bench check and not a clinical ventilator calibration.'});
   eq(medicalPracticalAssessment(s).score,100);eq(medicalPracticalAssessment(s).passed,true);
   s=medicalAction(s,{kind:'leak',value:false});eq(medicalPracticalAssessment(s).passed,false);
 }
 pass(s.actions.length>3);
}
fails(()=>medicalAction(freshMedicalProcedure('centrifuge'),{kind:'qc',level:'normal',value:13.5}));
console.log(count+' medical equipment procedural and assessment assertions passed.');
