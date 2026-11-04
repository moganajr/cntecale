/** Educational titration metrology and procedural scoring. Not a calibrated instrument. */
const finite=(v,name)=>{if(!Number.isFinite(v))throw Error(name+' must be finite');return v};
const round2=x=>Math.round((x+Number.EPSILON)*100)/100;
export function meniscusReading(volumeMl,{zeroOffsetMl=0,scaleMl=50}={}){
 finite(volumeMl,'Volume');finite(zeroOffsetMl,'Zero offset');
 if(volumeMl<0||volumeMl>scaleMl)throw Error('Burette reading outside calibrated scale');
 return round2(volumeMl+zeroOffsetMl);
}
export function titreFromReadings(initialMl,finalMl){
 finite(initialMl,'Initial reading');finite(finalMl,'Final reading');
 if(initialMl<0||finalMl<initialMl||finalMl>50.5)throw Error('Invalid initial/final burette readings');
 return round2(finalMl-initialMl);
}
export function summarizeTitres(trials,{concordanceMl=0.20,minTrials=2}={}){
 if(!Array.isArray(trials))throw Error('Trials must be an array');
 const valid=trials.map((trial,i)=>({number:i+1,titre:titreFromReadings(trial.initialMl,trial.finalMl),accepted:!!trial.accepted}))
   .filter(t=>t.accepted);
 if(valid.length<minTrials)return {concordant:false,count:valid.length,mean:null,spread:null,accepted:valid};
 const titres=valid.map(x=>x.titre);
 const spread=round2(Math.max(...titres)-Math.min(...titres));
 const mean=round2(titres.reduce((a,b)=>a+b,0)/titres.length);
 return {concordant:spread<=concordanceMl,count:valid.length,mean,spread,accepted:valid};
}
export function titrationPracticalGrade({ppe,prepared,calibrated,indicator,trials=[],notes='',safetyFail=false}){
 const summary=summarizeTitres(trials);
 const components={
 safety:ppe?15:0,
 preparation:prepared?10:0,
 calibration:calibrated?15:0,
 indicator:indicator?5:0,
 technique:trials.some(t=>t.accepted)?15:0,
 repeatability:summary.concordant?20:0,
 measurements:trials.length>=2?10:0,
 analysis:notes.trim().length>=30?10:0
 };
 const score=safetyFail?0:Object.values(components).reduce((a,b)=>a+b,0);
 return {score,passed:!safetyFail&&score>=70&&summary.concordant,components,summary,simulationOnly:true};
}
export function titrationCurve(phFn,{acidMolarity=.1,acidVolumeMl=25,baseMolarity=.1,maxMl=50,stepMl=.25}={}){
 if(typeof phFn!=='function')throw Error('Validated pH model required');
 if(maxMl<=0||stepMl<=0||maxMl/stepMl>5000)throw Error('Invalid curve sampling');
 const points=[];
 for(let i=0;i<=Math.floor(maxMl/stepMl);i++){const volumeMl=round2(i*stepMl);points.push({volumeMl,pH:phFn(acidMolarity,acidVolumeMl,baseMolarity,volumeMl)})}
 return points;
}
