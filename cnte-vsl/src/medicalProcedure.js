/** CNTE-VSL v1.3: safety-gated synthetic medical equipment practicals.
 * Training-only deterministic scenarios: never real patient samples, diagnosis or treatment.
 */
import {assessControl,qualityGate,analyzeSyntheticSample,QC_LEVELS,TRAINING_SAMPLES} from './medicalLab.js';
export const MEDICAL_SCENARIOS={
 'hematology-analyzer':{title:'Synthetic hematology workflow',kind:'hematology',steps:['ppe','identity','accept','load','qc','run','interpret']},
 'centrifuge':{title:'Simulated centrifuge balance and rotor safety',kind:'centrifuge',steps:['ppe','identity','balance','lid','run','interpret']},
 'medical-ventilator':{title:'Respiratory equipment bench-check (no patient)',kind:'respiratory',steps:['ppe','circuit','filter','leak','test','interpret']}
};
export function freshMedicalProcedure(equipmentId){
 if(!MEDICAL_SCENARIOS[equipmentId])throw Error('Unsupported medical exercise');
 return {equipmentId,ppe:false,identity:false,accepted:false,loaded:false,controls:{},qcChoice:'normal',sampleId:'A',readings:[],reports:[],balanced:false,rotorSecured:false,lidClosed:false,spinRpm:0,cycleComplete:false,circuitConnected:false,filterInspected:false,leakPassed:false,benchPassed:false,interpretation:'',actions:[],safetyStops:0};
}
const record=(s,action)=>{s.actions.push({kind:action.kind,at:Date.now(),value:action.value??null});if(s.actions.length>150)s.actions.shift();return s};
export function medicalAction(procedure,action){
 if(!MEDICAL_SCENARIOS[procedure.equipmentId])throw Error('Unsupported equipment');
 if(!action||typeof action.kind!=='string')throw Error('Invalid medical action');
 const s={...procedure,controls:{...procedure.controls},readings:[...procedure.readings],reports:[...procedure.reports],actions:[...procedure.actions]};
 const scenario=MEDICAL_SCENARIOS[s.equipmentId].kind;
 const requirePpe=()=>{if(!s.ppe)throw Error('Complete synthetic PPE and biosafety check first')};
 switch(action.kind){
  case 'ppe':s.ppe=action.value===true;break;
  case 'identity':requirePpe();s.identity=action.value===true;break;
  case 'interpret':if(typeof action.text!=='string')throw Error('Interpretation must be text');s.interpretation=action.text.slice(0,2000);break;
  case 'accept':if(scenario!=='hematology')throw Error('Only hematology has this acceptance step');requirePpe();if(!s.identity)throw Error('Verify specimen label first');s.accepted=action.value===true;break;
  case 'load':if(scenario!=='hematology')throw Error('Invalid specimen loading scenario');requirePpe();if(!s.accepted)throw Error('Specimen acceptance is required');if(!TRAINING_SAMPLES[action.sampleId])throw Error('Unknown synthetic specimen');s.sampleId=action.sampleId;s.loaded=true;break;
  case 'qc':if(scenario!=='hematology')throw Error('QC is not part of this training exercise');requirePpe();if(!s.loaded)throw Error('Load a synthetic training specimen first');s.controls[action.level]=assessControl(action.level,action.value);s.reports=[];s.readings=[];break;
  case 'run':{
   requirePpe();
   if(scenario==='hematology'){
    if(!s.loaded||!s.identity||!s.accepted)throw Error('Complete specimen identification and acceptance');
    const x=analyzeSyntheticSample(s.sampleId,s.controls,{identityVerified:s.identity,specimenAccepted:s.accepted,analyzerReady:true});
    if(!x.released)throw Error('Training result locked: '+x.reason);
    s.readings.push({case:s.sampleId,hb:x.sample.hemoglobin,mcv:x.indices.mcv,mch:x.indices.mch,mchc:x.indices.mchc});
    s.reports=s.reports.filter(r=>r.sampleId!==s.sampleId).concat([{sampleId:s.sampleId,...x}]);
   }else if(scenario==='centrifuge'){
    if(!s.identity||!s.balanced||!s.rotorSecured||!s.lidClosed)throw Error('Rotor balance, lid closure and specimen identity are required');
    if(!Number.isFinite(action.rpm)||action.rpm<500||action.rpm>3000)throw Error('Training RPM range is 500–3000');
    s.spinRpm=action.rpm;s.cycleComplete=true;s.readings.push({rpm:action.rpm,balanced:true,lidClosed:true});
   }else{
    if(!s.circuitConnected||!s.filterInspected||!s.leakPassed)throw Error('Connect circuit, inspect filter and complete simulated leak check');
    s.benchPassed=true;s.readings.push({test:'bench airflow',status:'synthetic pass'});
   }
   break;
  }
  case 'balance':if(scenario!=='centrifuge')throw Error('Invalid balancing action');requirePpe();s.balanced=action.value===true;break;
  case 'rotor':if(scenario!=='centrifuge')throw Error('Invalid rotor action');requirePpe();s.rotorSecured=action.value===true;break;
  case 'lid':if(scenario!=='centrifuge')throw Error('Invalid lid action');requirePpe();s.lidClosed=action.value===true;break;
  case 'circuit':if(scenario!=='respiratory')throw Error('Invalid circuit action');requirePpe();s.circuitConnected=action.value===true;break;
  case 'filter':if(scenario!=='respiratory')throw Error('Invalid filter action');requirePpe();s.filterInspected=action.value===true;break;
  case 'leak':if(scenario!=='respiratory')throw Error('Invalid leak action');requirePpe();if(!s.circuitConnected||!s.filterInspected)throw Error('Prepare bench circuit and filter first');s.leakPassed=action.value===true;break;
  default:throw Error('Unsupported training action');
 }
 return record(s,action);
}
export function medicalPracticalAssessment(s){
 const kind=MEDICAL_SCENARIOS[s.equipmentId]?.kind;if(!kind)throw Error('Invalid medical scenario');
 const safety=s.ppe?15:0;
 let preparation=0,procedure=0,measurements=0;
 if(kind==='hematology'){preparation=(s.identity?10:0)+(s.accepted?10:0)+(s.loaded?10:0);procedure=qualityGate(s.controls).passed?25:0;measurements=s.reports.length>=2?15:s.reports.length?8:0}
 else if(kind==='centrifuge'){preparation=(s.identity?10:0)+(s.balanced?10:0)+(s.rotorSecured?10:0);procedure=s.lidClosed?25:0;measurements=s.cycleComplete?15:0}
 else {preparation=(s.circuitConnected?15:0)+(s.filterInspected?15:0);procedure=s.leakPassed?25:0;measurements=s.benchPassed?15:0}
 const interpretation=s.interpretation.trim().length>=30?15:0;
 const score=s.safetyStops?0:safety+preparation+procedure+measurements+interpretation;
 const completed=kind==='hematology'?s.ppe&&s.identity&&s.accepted&&s.loaded&&s.reports.length>=2&&qualityGate(s.controls).passed:kind==='centrifuge'?s.ppe&&s.identity&&s.balanced&&s.rotorSecured&&s.lidClosed&&s.cycleComplete:s.ppe&&s.circuitConnected&&s.filterInspected&&s.leakPassed&&s.benchPassed;
 return {score,passed:score>=70&&completed&&!s.safetyStops,parts:{safety,preparation,procedure,measurements,interpretation},completed,simulationOnly:true,mode:kind};
}
