export const newRoom=()=>({held:null,beaker:'storage',cylinder:'storage',beakerMl:0,cylinderMl:0,reading:null,records:[]});
export const capacity=100;
export function roomAction(s,id){
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
   s.records.push({observed:s.reading,actual:Math.round(s.cylinderMl),correct});return correct?'Observation recorded. Reading is within the 5 mL practice tolerance.':'Observation recorded. Review the meniscus and try a new reading.';
 }
 return '';
}
export function advanceLiquid(s,mode,dt){
 const amount=Math.max(0,Math.min(1,dt))*25;
 if(mode==='fill'){s.beakerMl=Math.min(capacity,s.beakerMl+amount);return s.beakerMl<capacity}
 if(mode==='pour'){const moved=Math.min(amount,s.beakerMl,capacity-s.cylinderMl);s.beakerMl-=moved;s.cylinderMl+=moved;if(moved>0)s.reading=null;return s.beakerMl>0&&s.cylinderMl<capacity}
 return false;
}
export function roomProgress(s){return [s.cylinder!=='storage',s.cylinder==='bench',s.beakerMl>0||s.cylinderMl>0,s.cylinderMl>0,s.records.some(r=>r.correct)]}
export function roomGuidance(s){if(s.records.some(r=>r.correct))return 'Practical complete. Inspect your notebook or repeat the measurement.';if(s.cylinder==='storage')return 'Find the graduated cylinder at the apparatus shelf. Click it to collect it.';if(s.cylinder==='held')return 'Click the central workbench to place the cylinder.';if(s.held!=='beaker'&&s.cylinderMl===0)return 'Collect the beaker from the shelf.';if(s.beakerMl===0&&s.cylinderMl===0)return 'Click the water dispenser to fill the beaker.';if(s.cylinderMl===0)return 'Click the cylinder on the workbench to begin pouring. Click again to stop.';return 'Inspect the liquid level, click the nearest graduation mark, then click the notebook.'}
