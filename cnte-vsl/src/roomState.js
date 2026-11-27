export const newRoom=(targetMl=50)=>({held:null,beaker:'storage',cylinder:'storage',beakerMl:0,cylinderMl:0,reading:null,records:[],targetMl:[30,50,70,100].includes(targetMl)?targetMl:50,events:[]});
export const capacity=100;
export function roomAction(s,id){const result=applyRoomAction(s,id);if(result)s.events.push({action:id,result,held:s.held,beakerMl:Math.round(s.beakerMl*10)/10,cylinderMl:Math.round(s.cylinderMl*10)/10,at:new Date().toISOString()});return result;}
function applyRoomAction(s,id){
 if(id==='beaker'||id==='cylinder'){
   if(s.held===id)return 'You are already carrying this apparatus.';
   if(s.held)return 'Place the apparatus you are holding on the bench first.';
   s.held=id;s[id]='held';return 'Apparatus collected.';
 }
 if(id==='bench'){
   if(!s.held)return 'The bench is ready for apparatus.';
   s[s.held]='bench';s.held=null;return 'Apparatus placed on the bench.';
 }
 if(id==='water'){
   if(s.held!=='beaker')return 'Collect the beaker before using the water station.';
   if(s.beakerMl===capacity)return 'The beaker is already full.';
   return 'fill';
 }
 if(id==='sink'){
   if(!s.held)return 'Collect a vessel before using the sink.';
   if(s[s.held+'Ml']<=0)return 'The vessel is already empty.';
   return 'drain';
 }
 if(id==='storage'){
   if(!s.held)return 'The apparatus store is ready.';
   if(s[s.held+'Ml']>0)return 'Empty the vessel at the sink before returning it.';
   s[s.held]='storage';s.held=null;return 'Apparatus returned to storage.';
 }
 if(id==='pour'){
   if(s.held!=='beaker'||s.cylinder!=='bench')return 'Carry the beaker to the cylinder on the bench first.';
   if(s.beakerMl<=0)return 'The beaker is empty.';
   if(s.cylinderMl>=capacity)return 'The cylinder is full.';
   return 'pour';
 }
 if(id.startsWith('mark:')){
   const n=Number(id.slice(5));
   if(s.cylinder!=='bench'||s.cylinderMl<=0||!Number.isInteger(n)||n<0||n>100||n%10)return 'Inspect the scale after placing and filling the cylinder.';
   s.reading=n;return 'Scale reading selected: '+n+' mL.';
 }
 if(id==='notebook'){
   if(s.reading===null)return 'Select a reading on the cylinder scale first.';
   const correct=Math.abs(s.reading-s.cylinderMl)<=5;
   const targetMet=Math.abs(s.targetMl-s.cylinderMl)<=5;
   s.records.push({observed:s.reading,actual:Math.round(s.cylinderMl),correct,targetMl:s.targetMl,targetMet});return !correct?'Observation recorded. Review the meniscus and try a new reading.':targetMet?'Observation recorded. Reading is within the 5 mL practice tolerance and target achieved.':'Reading is within tolerance, but the transferred volume differs from the assigned target.';
 }
 return '';
}
export function advanceLiquid(s,mode,dt){
 const amount=Math.max(0,Math.min(1,dt))*25;
 if(mode==='fill'){s.beakerMl=Math.min(capacity,s.beakerMl+amount);return s.beakerMl<capacity}
 if(mode==='pour'){const moved=Math.min(amount,s.beakerMl,capacity-s.cylinderMl);s.beakerMl-=moved;s.cylinderMl+=moved;if(moved>0)s.reading=null;return s.beakerMl>0&&s.cylinderMl<capacity}
 if(mode==='drain'&&s.held){const key=s.held+'Ml';s[key]=Math.max(0,s[key]-amount*2);if(s.held==='cylinder')s.reading=null;return s[key]>0}
 return false;
}
export function roomProgress(s){const finished=s.records.some(r=>r.correct&&r.targetMet);return [s.cylinder!=='storage'||finished,s.cylinder==='bench'||finished,s.beakerMl>0||s.cylinderMl>0||finished,s.cylinderMl>0||finished,finished]}
export const roomCleaned=s=>s.beaker==='storage'&&s.cylinder==='storage'&&s.beakerMl===0&&s.cylinderMl===0&&s.held===null;
export function roomAssessment(s){
 const achieved=s.records.some(r=>r.correct&&r.targetMet),correct=s.records.some(r=>r.correct),target=s.records.some(r=>r.targetMet);
 const rubric={apparatus:s.events.some(e=>e.action==='cylinder'&&e.result==='Apparatus collected.')?15:0,preparation:s.events.some(e=>e.action==='bench'&&e.result==='Apparatus placed on the bench.')?15:0,transfer:s.records.length?20:0,target:target?20:0,reading:correct?15:0,cleanup:roomCleaned(s)&&s.records.length?15:0};
 const score=Object.values(rubric).reduce((a,b)=>a+b,0);return {score,passed:achieved&&roomCleaned(s)&&score>=70,rubric,simulationOnly:true};
}
export function roomGuidance(s){if(s.records.some(r=>r.correct&&r.targetMet)){if(roomCleaned(s))return 'Practical complete. The apparatus is clean and returned to storage. Export your observations.';return s.held?(s[s.held+'Ml']>0?'Take the held vessel to the rinse sink to empty it.':'Click the apparatus store to return the held vessel.'): 'Collect the remaining vessel, empty it at the rinse sink and return it to storage.';}if(s.cylinder==='storage')return 'Find the graduated cylinder at the apparatus shelf. Click it to collect it.';if(s.cylinder==='held')return 'Click the central workbench to place the cylinder.';if(s.held!=='beaker'&&s.cylinderMl===0)return 'Collect the beaker from the shelf.';if(s.beakerMl===0&&s.cylinderMl===0)return 'Click the water dispenser to fill the beaker.';if(s.cylinderMl===0)return 'Click the cylinder on the workbench to begin pouring. Click again to stop near the assigned volume.';if(s.cylinderMl>s.targetMl+5)return 'The assigned volume was exceeded. Place the beaker down, collect the cylinder and empty it at the rinse sink before repeating.';if(s.cylinderMl<s.targetMl-5&&s.beakerMl>0)return 'The cylinder is below the assigned volume. Return to room view and continue pouring carefully.';return 'Inspect the liquid level, click the nearest graduation mark, then click the notebook.'}
