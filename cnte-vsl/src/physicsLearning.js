/** Contextual coaching and local report summaries for the ideal DC practical. */
export function physicsGuidance(session,result){
 const p=session.physics;
 if(p.unsafeAction)return {title:'Restart the attempt',detail:'Review the safety checks and reset your simulated workbench before continuing.'};
 if(!session.ppe||!session.prepared)return {title:'Prepare the workbench',detail:'Complete the safety and equipment inspection checks to unlock measurements.'};
 if(result.status==='blocked')return {title:'Resolve the safety stop',detail:result.reason};
 if(p.ammeter!=='series'||p.voltmeter!=='parallel')return {title:'Review meter connections',detail:'Select the instruments in the 3D workbench and review their connection settings.'};
 if(p.isolated||!p.switchClosed)return {title:'Review source readiness',detail:'Check the source and switch status in the workbench before measuring.'};
 if(!result.canMeasure)return {title:'Resolve the circuit state',detail:result.reason};
 const topologies=new Set(p.measurements.filter(m=>m.status==='measured').map(m=>m.topology));
 if(!topologies.has(p.topology))return {title:'Record this observation',detail:'Use the instrument measurement action to add evidence to your report.'};
 if(topologies.size<2)return {title:'Compare circuit configurations',detail:'Your report needs evidence from both network types. Review the procedure and record the remaining configuration.'};
 return {title:'Explain your observations',detail:'Compare measured current, equivalent resistance and power in your report, then save the evidence.'};
}

const topics={
 safety:'Safety orientation',preparation:'Equipment preparation',isolation:'Source isolation',
 connections:'Meter connections',measurement:'Measurement recording',comparison:'Series and parallel comparison',
 interpretation:'Scientific report writing'
};
const maximum={safety:15,preparation:10,isolation:15,connections:20,measurement:15,comparison:15,interpretation:10};
export function summarizePhysicsReports(records){
 const physics=records.filter(record=>record.lab==='ohm');
 const missed=Object.keys(maximum).map(key=>{
   const applicable=physics.filter(record=>Number.isFinite(record.rubric?.[key]));
   return {topic:topics[key],missed:applicable.filter(record=>record.rubric[key]<maximum[key]).length,reviewed:applicable.length};
 }).filter(row=>row.missed>0).sort((a,b)=>b.missed-a.missed);
 return {attempts:physics.length,passed:physics.filter(record=>record.passed).length,missed};
}
