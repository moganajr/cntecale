/** Shared, server-authoritative CNTE VSL live titration state machine. */
export const STEPS=['ppe','burette','flask','indicator','calibration','dispense','record','repeat'];
export const round1=n=>Math.round((n+Number.EPSILON)*10)/10;
export function freshBench(name='Learner'){return {name:String(name).slice(0,60),ppe:false,burette:false,flask:false,indicator:false,calibrated:false,volume:0,trialSealed:false,trials:[],notes:'',events:[],safetyStops:0,locked:false,updatedAt:Date.now()}}
export function expectedVolume(acidMolarity=.1,acidVolume=25,baseMolarity=.1){if(![acidMolarity,acidVolume,baseMolarity].every(x=>Number.isFinite(x)&&x>0))throw Error('Bad concentrations');return acidMolarity*acidVolume/baseMolarity}
export function simulatedPH(baseMl,{acidMolarity=.1,acidVolume=25,baseMolarity=.1}={}){if(!Number.isFinite(baseMl)||baseMl<0)throw Error('Bad burette volume');const concentration=(acidMolarity*acidVolume-baseMolarity*baseMl)/(acidVolume+baseMl);const h=(concentration+Math.sqrt(concentration*concentration+4e-14))/2;return Math.max(0,Math.min(14,-Math.log10(h)))}
export function evaluateTrials(trials){const a=trials.filter(t=>t.accepted).map(t=>t.volume);if(a.length<2)return {pass:false,count:a.length,mean:null,spread:null};const mean=a.reduce((x,y)=>x+y,0)/a.length,spread=Math.max(...a)-Math.min(...a);return {pass:spread<=.2+1e-9,count:a.length,mean:round1(mean*10)/10,spread:round1(spread)}}
export function practiceStatus(bench){const repeat=evaluateTrials(bench.trials);const parts={safety:bench.ppe?15:0,setup:bench.burette&&bench.flask?15:0,indicator:bench.indicator?10:0,calibration:bench.calibrated?15:0,recorded:bench.trials.some(t=>t.accepted)?15:0,repeatability:repeat.pass?20:0,explanation:bench.notes.trim().length>=30?10:0};const score=bench.safetyStops?0:Object.values(parts).reduce((x,y)=>x+y,0);return {score,passed:score>=70&&repeat.pass&&!bench.safetyStops,repeat,parts}}
export function applyBenchAction(bench,action,options={}){if(!action||typeof action!=='object')throw Error('Action required');if(bench.locked)throw Error('Lecturer has paused this workbench');
 const b={...bench,trials:[...bench.trials],events:[...bench.events]};const kind=String(action.kind||'');
 switch(kind){
 case 'ppe':b.ppe=!!action.value;break;
 case 'place':if(!b.ppe)throw Error('Select PPE before handling apparatus');if(!['burette','flask'].includes(action.item))throw Error('Unknown equipment');b[action.item]=true;break;
 case 'indicator':if(!b.flask)throw Error('Place the flask before indicator');b.indicator=true;break;
 case 'calibrate':if(!b.burette)throw Error('Mount the burette before calibration');b.calibrated=true;break;
 case 'dispense':{
   if(!b.ppe||!b.burette||!b.flask||!b.indicator||!b.calibrated)throw Error('Complete all instrument, PPE and indicator steps first');
   if(![.1,.5,1].includes(action.amount))throw Error('Select 0.1, 0.5 or 1 mL dispensing increment');
   if(b.volume+action.amount>50)throw Error('Burette capacity exceeded');
   if(b.trialSealed)throw Error('Start a new trial before dispensing');
   b.volume=round1(b.volume+action.amount);break}
 case 'record':{
   if(!b.indicator||!b.calibrated||!b.flask)throw Error('Prepare the apparatus and indicator');
   const observed=Number(action.reading);
   if(!Number.isFinite(observed)||Math.abs(observed-b.volume)>.11)throw Error('Meniscus reading does not match the burette');
   if(b.trialSealed)throw Error('This trial was already recorded; prepare the next trial');
   const endpoint=expectedVolume(),accepted=Math.abs(b.volume-endpoint)<=.25;
   b.trials.push({number:b.trials.length+1,volume:b.volume,reading:observed,accepted,sealed:true});b.trialSealed=true;
   break}
 case 'next':if(!b.trialSealed)throw Error('Record the current trial first');b.volume=0;b.indicator=false;b.trialSealed=false;break;
 case 'notes':if(typeof action.text!=='string')throw Error('Notes must be text');b.notes=action.text.slice(0,2000);break;
 default:throw Error('Unsupported workbench action');
 }
 b.updatedAt=Date.now();b.events.push({kind,at:b.updatedAt,volume:b.volume});if(b.events.length>150)b.events.shift();return b;
}
