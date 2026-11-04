/** Synthetic hematology workflow: education only, never real patient results. */
export const QC_LEVELS=Object.freeze({
 low:{label:'Low control',target:9.0,tolerance:.5},
 normal:{label:'Normal control',target:13.5,tolerance:.5},
 high:{label:'High control',target:17.0,tolerance:.6}
});
export const TRAINING_SAMPLES=Object.freeze({
 A:{label:'Synthetic case A',hemoglobin:13.4,hematocrit:40.2,rbc:4.7,wbc:6.8,platelets:238},
 B:{label:'Synthetic case B',hemoglobin:9.1,hematocrit:28.5,rbc:3.4,wbc:7.2,platelets:280},
 C:{label:'Synthetic case C',hemoglobin:17.1,hematocrit:50.8,rbc:5.7,wbc:9.3,platelets:198}
});
export function assessControl(level,observed){
 const control=QC_LEVELS[level];if(!control)throw Error('Unknown QC level');
 if(!Number.isFinite(observed)||observed<0)throw Error('QC observation must be a nonnegative finite value');
 const deviation=observed-control.target,pass=Math.abs(deviation)<=control.tolerance+1e-10;
 return {level,target:control.target,observed,deviation,limit:control.tolerance,pass};
}
export function qualityGate(controls){
 const list=['low','normal','high'].map(id=>controls?.[id]);
 const complete=list.every(x=>x&&x.level&&x.pass===true);
 return {passed:complete,levelsPassed:list.filter(x=>x?.pass).length,reason:complete?'All three simulated controls acceptable':'Complete and pass low, normal and high controls'};
}
export function calculateIndices(sample){
 if(!sample||![sample.hemoglobin,sample.hematocrit,sample.rbc].every(v=>Number.isFinite(v)&&v>0))throw Error('Invalid synthetic sample');
 return {mcv:sample.hematocrit*10/sample.rbc,mch:sample.hemoglobin*10/sample.rbc,mchc:sample.hemoglobin*100/sample.hematocrit};
}
export function analyzeSyntheticSample(sampleId,controls,{identityVerified=false,specimenAccepted=false,analyzerReady=false}={}){
 const sample=TRAINING_SAMPLES[sampleId];if(!sample)throw Error('Unknown synthetic case');
 const gate=qualityGate(controls);
 if(!identityVerified||!specimenAccepted||!analyzerReady||!gate.passed)return {released:false,reason:!identityVerified?'Verify synthetic specimen identity':!specimenAccepted?'Complete specimen acceptance checks':!analyzerReady?'Complete analyzer checks':gate.reason};
 return {released:true,reason:'Educational result released (not clinical)',sample:{...sample},indices:calculateIndices(sample)};
}
export function gradeMedicalPractical({ppe=false,identified=false,accepted=false,analyzerReady=false,controls={},reports=[],notes='',unsafeRelease=false}={}){
 const gate=qualityGate(controls),unique=new Set(reports.filter(r=>r.released).map(r=>r.sampleId));
 const parts={safety:ppe?15:0,identity:identified?10:0,specimen:accepted?10:0,analyzer:analyzerReady?10:0,qualityControl:gate.passed?25:0,measurement:unique.size?15:0,interpretation:notes.trim().length>=30?15:0};
 const score=unsafeRelease?0:Object.values(parts).reduce((a,b)=>a+b,0);
 return {score,passed:!unsafeRelease&&gate.passed&&unique.size>=2&&score>=70,parts,samplesReported:unique.size,simulationOnly:true,unsafeRelease};
}
