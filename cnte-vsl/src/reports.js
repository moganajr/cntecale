import {LABS,KEY,aggregateReport,readArchive,saveReport,summarize,restoreArchive} from './reportArchive.js';
const $=id=>document.getElementById(id),status=$('status'),lab=$('lab');
for(const [value,label] of Object.entries(LABS)){const option=document.createElement('option');option.value=value;option.textContent=label;lab.append(option)}
const percent=n=>n===null?'—':n.toFixed(1)+'%';
function render(){
 try{
  const rows=readArchive(localStorage).filter(r=>!lab.value||r.lab===lab.value).sort((a,b)=>b.date.localeCompare(a.date)),s=summarize(rows);
  $('totals').textContent=s.classes+' saved summaries · '+s.participants+' participations · '+percent(s.average)+' mean score · '+percent(s.passRate)+' practice pass rate';
  $('rows').replaceChildren();
  for(const r of rows){const tr=document.createElement('tr');for(const value of [new Date(r.date).toLocaleString(),LABS[r.lab],r.participants,percent(r.participants?r.totalScore/r.participants:null),r.passed,r.observed]){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}$('rows').append(tr)}
 }catch(e){status.textContent='Archive unavailable: '+e.message}
}
lab.onchange=render;
$('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw Error('File exceeds 2 MB');const raw=JSON.parse(await file.text());if(raw?.format==='cnte-vsl-anonymous-archive-v1'){restoreArchive(localStorage,raw);status.textContent='Anonymous backup merged.'}else{saveReport(localStorage,aggregateReport(raw,crypto.randomUUID()));status.textContent='Anonymous summary imported.'}render()}catch(err){status.textContent='Import failed: '+err.message}finally{e.target.value=''}};
$('export').onclick=()=>{try{const payload={format:'cnte-vsl-anonymous-archive-v1',simulationOnly:true,reports:readArchive(localStorage)},url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cnte-anonymous-class-summary.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){status.textContent=e.message}};
$('clear').onclick=()=>{if(confirm('Delete all saved anonymous summaries from this browser?')){try{localStorage.removeItem(KEY);status.textContent='Archive cleared.';render()}catch(e){status.textContent=e.message}}};
window.addEventListener('storage',render);render();
