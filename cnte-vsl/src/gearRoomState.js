/** Unpowered, dimensionless educational gear trainer; not real-machine servicing instructions. */
export const GEAR_PARTS=['driver','driven','crank'];
export const GEAR_OBJECTS=[...GEAR_PARTS,'spare'];
export const GEAR_LABELS={driver:'Blue input gear (12 teeth)',driven:'Gold output gear (24 teeth)',crank:'Green hand crank',spare:'Replacement output gear (24 teeth)'};
export const GEAR_HOME={driver:[-5,-2.4],driven:[-4,-2.4],crank:[-3,-2.4],spare:[-3,-2.4]};
export const GEAR_STATIONS={safety:[4,-2.4],bench:[0,.55],store:[-4,-2.4],test:[0,.55],record:[1.5,.55],turn:[0,.55],stop:[0,.55],fault:[0,.55],inspect:[0,.55],diagnose:[0,.55],diagnoseInput:[0,.55],diagnoseAlignment:[0,.55]};
export function newGearRoom(){return {items:Object.fromEntries(GEAR_PARTS.map(p=>[p,'store'])),held:null,safe:false,running:false,inputSteps:0,outputSteps:0,faultMode:false,inspected:false,diagnosed:false,records:[],events:[],notes:'',spatialPose:null};}
export function gearAssembled(s){return s.items.driver==='bench'&&s.items.crank==='bench'&&(s.items.driven==='bench'||s.faultMode&&s.items.spare==='bench')}
export function gearRoomAction(s,id){
 const log=result=>{s.events.push({action:id,result});if(s.events.length>150)s.events.shift();return result};
 if(id==='fault'){if(s.events.length||s.held||s.running)throw Error('Restart the practical before selecting the fault challenge.');s.faultMode=true;s.items={driver:'bench',driven:'bench',crank:'bench',spare:'store'};return log('Fault challenge loaded: inspect the model and compare its observed rotations with the expected ratio.')}
 if(id==='inspect'){if(!s.faultMode||!s.safe||s.running||s.items.driven!=='bench')throw Error('Stop the fault model, check safety and inspect the installed output gear.');s.inspected=true;return log('Inspection: the original output gear has a visible missing tooth.')}
 if(id==='diagnoseInput'||id==='diagnoseAlignment'){if(!s.inspected||s.running)throw Error('Stop and inspect the model first.');return log('That hypothesis does not match the observed output gear. Re-examine the visible model.');}
 if(id==='diagnose'){if(!s.faultMode||!s.inspected||s.running||!s.records.some(r=>r.phase==='before'&&r.inputTurns>=2))throw Error('First record a baseline, stop and inspect the installed output gear.');s.diagnosed=true;return log('Diagnosis recorded: damaged output gear causing intermittent slip in the simplified model.')}
 if(id==='stop'){s.running=false;return log('Hand-crank demonstration stopped.')}
 if(id==='safety'){s.safe=true;return log('Checked the unpowered training model.')}
 if(id==='turn'){if(!s.running)throw Error('Start the assembled model first.');if(s.inputSteps>=400)throw Error('Turn limit reached; restart the practical.');s.inputSteps++;if(!s.faultMode||s.items.spare==='bench'||s.inputSteps%4!==0)s.outputSteps++;return log('Turned the input crank one quarter revolution.')}
 if(id==='record'){if(!s.running)throw Error('Start the assembled hand-crank model before recording.');if(s.records.length>=100)throw Error('Observation limit reached.');if(!s.inputSteps)throw Error('Turn the hand crank before recording.');const outputTurns=s.outputSteps/8;s.records.push({inputTurns:s.inputSteps/4,outputTurns,ratio:outputTurns?(s.inputSteps/4)/outputTurns:null,direction:'opposite',...(s.faultMode?{phase:s.items.spare==='bench'?'after':'before'}:{})});return log('Recorded the measured input and output revolutions.')}
 if(id==='test'){if(!s.safe||!gearAssembled(s))throw Error('Assemble all three parts and check safety first.');if(s.faultMode&&!s.running){s.inputSteps=0;s.outputSteps=0;}s.running=true;return log('Hand crank enabled. Turn it to observe the gear ratio.')}
 if(!s.safe)throw Error('Visit the safety station before handling the training model.');
 if(s.running)throw Error('Stop the model before changing components.');
 if(GEAR_OBJECTS.includes(id)){
  if(id==='spare'&&!s.faultMode)throw Error('The spare is available in the fault challenge only.');
  if(s.faultMode&&id==='driven'&&!s.diagnosed)throw Error('Diagnose the fault before removing the original output gear.');
  if(s.held)throw Error('Place or return the part already in your hand.');
  if(id==='driver'&&s.items.crank==='bench')throw Error('Remove the crank before lifting the input gear.');
  if(s.items[id]!=='store'&&s.items[id]!=='bench')throw Error('Part is unavailable.');
  s.items[id]='held';s.held=id;return log('Collected '+GEAR_LABELS[id]+'.');
 }
 if(id==='bench'||id==='store'){
  const p=s.held;if(!p)throw Error('Collect a component first.');
  if(id==='bench'&&p==='spare'&&(!s.diagnosed||s.items.driven!=='store'))throw Error('Diagnose and return the damaged gear before seating the replacement.');
  if(id==='bench'&&p==='driven'&&s.items.spare==='bench')throw Error('The output gear position is occupied.');
  if(id==='bench'&&p==='crank'&&s.items.driver!=='bench')throw Error('Seat the input gear before attaching the hand crank.');
  s.items[p]=id;s.held=null;return log(id==='bench'?'Seated '+GEAR_LABELS[p]+' on the board.':'Returned '+GEAR_LABELS[p]+' to storage.');
 }
 throw Error('Unknown gear action');
}
export function gearRoomReport(s){
 if(s.faultMode){const baseline=s.records.some(r=>r.phase==='before'&&r.inputTurns>=2),retest=s.records.some(r=>r.phase==='after'&&r.inputTurns>=2&&r.ratio===2),repaired=s.items.spare==='bench'&&s.items.driven==='store'&&gearAssembled(s);const rubric={safety:s.safe?10:0,baseline:baseline?15:0,inspection:s.inspected?15:0,diagnosis:s.diagnosed?15:0,replacement:repaired?20:0,retest:retest?15:0,stopping:retest&&!s.running?5:0,interpretation:s.notes.trim().length>=30?5:0};const score=Object.values(rubric).reduce((a,b)=>a+b,0);return {score,passed:score===100,rubric};}
 const assembled=gearAssembled(s),observed=s.records.some(r=>r.inputTurns>=2),stopped=observed&&!s.running;
 const rubric={safety:s.safe?15:0,assembly:assembled?35:0,measurement:observed?30:0,stopping:stopped?10:0,interpretation:s.notes.trim().length>=30?10:0};
 return {score:Object.values(rubric).reduce((a,b)=>a+b,0),passed:s.safe&&assembled&&stopped&&rubric.interpretation===10,rubric};
}
