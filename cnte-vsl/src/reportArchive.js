export const LABS=Object.freeze({physics:'Physics · DC circuits',water:'Foundations · water measurement',chemistry:'Chemistry · virtual titration',plant:'Biology · synthetic plant microscopy'});
export const KEY='cnte-vsl-aggregate-reports-v1';
const validId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/i.test(id);
const validLab=lab=>Object.hasOwn(LABS,lab);
const integer=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
export function aggregateReport(raw,id){
 if(!raw||raw.simulationOnly!==true||!validLab(raw.lab)||!Array.isArray(raw.learners)||raw.learners.length>40||!validId(id))throw Error('Invalid classroom progress report');
 const date=new Date(raw.exportedAt);if(!Number.isFinite(date.getTime()))throw Error('Invalid report date');
 let totalScore=0,passed=0,observed=0;
 for(const learner of raw.learners){
  const a=learner?.assessment;
  if(!a||!Number.isFinite(a.score)||a.score<0||a.score>100||typeof a.passed!=='boolean')throw Error('Invalid assessment');
  totalScore+=a.score;passed+=Number(a.passed);observed+=Number(Array.isArray(learner.observations)&&learner.observations.length>0);
 }
 return {id,lab:raw.lab,date:date.toISOString(),participants:raw.learners.length,passed,observed,totalScore};
}
export function normalizeArchive(rows){
 if(!Array.isArray(rows)||rows.length>200)throw Error('Invalid archive');
 const ids=new Set();
 return rows.map(r=>{
  if(!r||!validId(r.id)||ids.has(r.id)||!validLab(r.lab)||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||!integer(r.participants,40)||!integer(r.passed,r.participants)||!integer(r.observed,r.participants)||!Number.isFinite(r.totalScore)||r.totalScore<0||r.totalScore>100*r.participants)throw Error('Invalid archive entry');
  ids.add(r.id);return {id:r.id,lab:r.lab,date:new Date(r.date).toISOString(),participants:r.participants,passed:r.passed,observed:r.observed,totalScore:r.totalScore};
 });
}
export function readArchive(storage){return normalizeArchive(JSON.parse(storage.getItem(KEY)||'[]'))}
export function saveReport(storage,report){
 const rows=readArchive(storage).filter(r=>r.id!==report.id);
 if(rows.length>=200)throw Error('Archive is full. Export and clear older records first.');
 const next=normalizeArchive([...rows,report]);storage.setItem(KEY,JSON.stringify(next));return next;
}
export function summarize(rows){
 const total=rows.reduce((a,r)=>({classes:a.classes+1,participants:a.participants+r.participants,passed:a.passed+r.passed,observed:a.observed+r.observed,totalScore:a.totalScore+r.totalScore}),{classes:0,participants:0,passed:0,observed:0,totalScore:0});
 return {...total,average:total.participants?total.totalScore/total.participants:null,passRate:total.participants?100*total.passed/total.participants:null};
}
export function restoreArchive(storage,raw){
 if(!raw||raw.format!=='cnte-vsl-anonymous-archive-v1'||raw.simulationOnly!==true)throw Error('Invalid backup format');
 const incoming=normalizeArchive(raw.reports),merged=new Map(readArchive(storage).map(r=>[r.id,r]));
 for(const r of incoming){const existing=merged.get(r.id);if(!existing||existing.date<r.date)merged.set(r.id,r)}
 const next=normalizeArchive([...merged.values()]);storage.setItem(KEY,JSON.stringify(next));return next;
}
