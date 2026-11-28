/** Unpowered, dimensionless educational gear trainer; not real-machine servicing instructions. */
export const GEAR_PARTS=['driver','driven','crank'];
export const GEAR_LABELS={driver:'Blue input gear (12 teeth)',driven:'Gold output gear (24 teeth)',crank:'Green hand crank'};
export const GEAR_HOME={driver:[-5,-2.4],driven:[-4,-2.4],crank:[-3,-2.4]};
export const GEAR_STATIONS={safety:[4,-2.4],bench:[0,.55],store:[-4,-2.4],test:[0,.55],record:[1.5,.55],turn:[0,.55],stop:[0,.55]};
export function newGearRoom(){return {items:Object.fromEntries(GEAR_PARTS.map(p=>[p,'store'])),held:null,safe:false,running:false,inputSteps:0,records:[],events:[],notes:'',spatialPose:null};}
export function gearRoomAction(s,id){
 const log=result=>{s.events.push({action:id,result});if(s.events.length>150)s.events.shift();return result};
 if(id==='stop'){s.running=false;return log('Hand-crank demonstration stopped.')}
 if(id==='safety'){s.safe=true;return log('Checked the unpowered training model.')}
 if(id==='turn'){if(!s.running)throw Error('Start the assembled model first.');if(s.inputSteps>=400)throw Error('Turn limit reached; restart the practical.');s.inputSteps++;return log('Turned the input crank one quarter revolution.')}
 if(id==='record'){if(!s.running)throw Error('Start the assembled hand-crank model before recording.');if(s.records.length>=100)throw Error('Observation limit reached.');if(!s.inputSteps)throw Error('Turn the hand crank before recording.');s.records.push({inputTurns:s.inputSteps/4,outputTurns:s.inputSteps/8,ratio:2,direction:'opposite'});return log('Recorded the measured input and output revolutions.')}
 if(id==='test'){if(!s.safe||!GEAR_PARTS.every(p=>s.items[p]==='bench'))throw Error('Assemble all three parts and check safety first.');s.running=true;return log('Hand crank enabled. Turn it to observe the gear ratio.')}
 if(!s.safe)throw Error('Visit the safety station before handling the training model.');
 if(s.running)throw Error('Stop the model before changing components.');
 if(GEAR_PARTS.includes(id)){
  if(s.held)throw Error('Place or return the part already in your hand.');
  if(id==='driver'&&s.items.crank==='bench')throw Error('Remove the crank before lifting the input gear.');
  if(s.items[id]!=='store'&&s.items[id]!=='bench')throw Error('Part is unavailable.');
  s.items[id]='held';s.held=id;return log('Collected '+GEAR_LABELS[id]+'.');
 }
 if(id==='bench'||id==='store'){
  const p=s.held;if(!p)throw Error('Collect a component first.');
  if(id==='bench'&&p==='crank'&&s.items.driver!=='bench')throw Error('Seat the input gear before attaching the hand crank.');
  s.items[p]=id;s.held=null;return log(id==='bench'?'Seated '+GEAR_LABELS[p]+' on the board.':'Returned '+GEAR_LABELS[p]+' to storage.');
 }
 throw Error('Unknown gear action');
}
export function gearRoomReport(s){
 const assembled=GEAR_PARTS.every(p=>s.items[p]==='bench'),observed=s.records.some(r=>r.inputTurns>=2),stopped=observed&&!s.running;
 const rubric={safety:s.safe?15:0,assembly:assembled?35:0,measurement:observed?30:0,stopping:stopped?10:0,interpretation:s.notes.trim().length>=30?10:0};
 return {score:Object.values(rubric).reduce((a,b)=>a+b,0),passed:s.safe&&assembled&&stopped&&rubric.interpretation===10,rubric};
}
