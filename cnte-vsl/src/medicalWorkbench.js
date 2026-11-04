import {QC_LEVELS,TRAINING_SAMPLES,assessControl,qualityGate,analyzeSyntheticSample} from './medicalLab.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(x,n=1)=>Number(x).toFixed(n);
export function initialMedical(){return {identified:false,accepted:false,ready:false,level:'normal',reading:13.5,controls:{},sampleId:'A',reports:[]}}
export function medicalView(s){const p=s.medical,gate=qualityGate(p.controls);return `
<div class="labbar"><button id="med-back">← All laboratories</button><span class="pill">Medical laboratory · v0.6</span></div>
<div class="pagehead"><span class="eyebrow">Allied Health / University</span><h1>Hematology Analyzer and Quality Control</h1><p class="muted">Perform synthetic preanalytical checks, three-level QC, educational measurements and reporting.</p></div>
<div class="split"><div>
<section class="panel"><h3>Virtual analyzer workstation</h3><div class="apparatus"><svg viewBox="0 0 520 270" role="img" aria-label="Simulated hematology analyzer showing quality control and sample port" style="max-height:280px"><rect width="520" height="270" rx="12" fill="#eaf4f6"/><rect x="105" y="23" width="306" height="225" rx="18" fill="#b4cbd6" stroke="#688b9d" stroke-width="4"/><rect x="133" y="49" width="204" height="118" rx="10" fill="#173c52"/><text x="235" y="82" fill="#b1fae3" text-anchor="middle" font-size="15">CNTE HEMATOLOGY</text><text x="235" y="115" fill="#fff" text-anchor="middle" font-size="23">QC ${gate.passed?'PASS':'LOCKED'}</text><text x="235" y="147" fill="#b1fae3" text-anchor="middle" font-size="13">${gate.levelsPassed} / 3 controls</text><rect x="356" y="77" width="39" height="96" rx="7" fill="#e2eaef" stroke="#6c91a0"/><rect x="366" y="116" width="20" height="43" rx="3" fill="#ae5c78"/><circle cx="149" cy="206" r="13" fill="${p.ready?'#2bb88e':'#dca85b'}"/><text x="171" y="211" font-size="13" fill="#29576b">${p.ready?'READY':'CHECK ANALYZER'}</text></svg></div>
<div class="note safety">Synthetic teaching values only. Never enter real patient data or treat these cases as clinical diagnoses. QC acceptance limits are examples, not manufacturer criteria.</div>
<div class="controls">
<label class="check full"><input id="med-ppe" type="checkbox" ${s.ppe?'checked':''}>Complete PPE and biosafety orientation</label>
<label class="check full"><input id="med-identified" type="checkbox" ${p.identified?'checked':''}>Verify synthetic specimen identity</label>
<label class="check full"><input id="med-accepted" type="checkbox" ${p.accepted?'checked':''}>Inspect simulated sample acceptance criteria</label>
<label class="check full"><input id="med-ready" type="checkbox" ${p.ready?'checked':''}>Complete instrument readiness checks</label></div></section>
<section class="panel"><h3>Three-level quality control</h3><div class="controls">
<div class="field"><label for="med-level">QC level</label><select id="med-level">${Object.entries(QC_LEVELS).map(([k,v])=>`<option value="${k}" ${p.level===k?'selected':''}>${esc(v.label)}</option>`).join('')}</select></div>
<div class="field"><label for="med-reading">Observed Hb (g/dL)</label><input id="med-reading" type="number" min="0" max="25" step=".1" value="${p.reading}"></div></div>
<p class="muted">Target: ${num(QC_LEVELS[p.level].target)} g/dL, tolerance ±${num(QC_LEVELS[p.level].tolerance)} g/dL (illustrative).</p>
<button class="secondary" id="med-qc">Record synthetic QC</button>
<div class="tablewrap"><table class="records"><thead><tr><th>Level</th><th>Observed</th><th>Deviation</th><th>Decision</th></tr></thead><tbody>${Object.entries(QC_LEVELS).map(([k,v])=>{const x=p.controls[k];return `<tr><td>${esc(v.label)}</td><td>${x?num(x.observed):'—'}</td><td>${x?num(x.deviation,2):'—'}</td><td>${!x?'Pending':x.pass?'PASS':'FAIL'}</td></tr>`}).join('')}</tbody></table></div><div class="note"><b>QC status:</b> ${esc(gate.reason)}</div></section>
<section class="panel"><h3>Synthetic specimen worklist</h3><div class="field"><label for="med-sample">Training specimen</label><select id="med-sample">${Object.entries(TRAINING_SAMPLES).map(([k,v])=>`<option value="${k}" ${p.sampleId===k?'selected':''}>${esc(v.label)}</option>`).join('')}</select></div>
<div class="toolbar"><button class="primary" id="med-analyze">Analyze synthetic specimen</button><button class="ghost" id="med-reset">Reset session</button></div>
${p.reports.length?`<div class="tablewrap"><table class="records"><thead><tr><th>Case</th><th>Hb (g/dL)</th><th>MCV (fL)</th><th>MCH (pg)</th><th>MCHC (g/dL)</th></tr></thead><tbody>${p.reports.map(x=>`<tr><td>${esc(x.sampleId)}</td><td>${num(x.sample.hemoglobin)}</td><td>${num(x.indices.mcv)}</td><td>${num(x.indices.mch)}</td><td>${num(x.indices.mchc)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No training results released.</p>'}
<div class="field"><label for="med-notes">Quality control and scientific interpretation</label><textarea id="med-notes" placeholder="Discuss QC decisions, calculate red cell indices, and compare the synthetic cases...">${esc(s.notes)}</textarea></div>
<div class="toolbar" style="margin-top:12px"><button class="primary" id="med-submit">Submit practice report</button><button class="ghost" id="med-export">Export training JSON</button></div></section></div>
<div><section class="panel"><h3>Procedure</h3><ol class="timeline"><li>Select PPE and inspect simulated specimen</li><li>Check instrument readiness</li><li>Run low, normal and high quality controls</li><li>Stop testing if QC fails</li><li>Analyze at least two different synthetic specimens</li><li>Record hemoglobin and calculated MCV, MCH, MCHC</li><li>Interpret results as educational examples only</li></ol></section><section class="panel"><h3>Calculation reference</h3><div class="note">MCV = Hct (%) × 10 / RBC<br>MCH = Hb (g/dL) × 10 / RBC<br>MCHC = Hb × 100 / Hct (%)</div><span class="badge provisional">Academic and clinical expert validation pending</span></section></div></div>`;}
export function wireMedical(s,{refresh,back,submit,download}){
 const p=s.medical;document.getElementById('med-back').onclick=back;
 document.getElementById('med-ppe').onchange=e=>{s.ppe=e.target.checked;refresh()};
 for(const key of ['identified','accepted','ready'])document.getElementById('med-'+key).onchange=e=>{p[key]=e.target.checked;refresh()};
 document.getElementById('med-level').onchange=e=>{p.level=e.target.value;p.reading=QC_LEVELS[p.level].target;refresh()};
 document.getElementById('med-reading').onchange=e=>{p.reading=Number(e.target.value);refresh()};
 document.getElementById('med-qc').onclick=()=>{if(!s.ppe||!p.ready){alert('Complete biosafety and analyzer checks first.');return}try{p.controls[p.level]=assessControl(p.level,p.reading)}catch(e){alert(e.message);return}p.reports=[];s.readings=[];s.outcome=null;refresh()};
 document.getElementById('med-sample').onchange=e=>{p.sampleId=e.target.value;refresh()};
 document.getElementById('med-analyze').onclick=()=>{if(!s.ppe){alert('Complete safety orientation first.');return}const o=analyzeSyntheticSample(p.sampleId,p.controls,{identityVerified:p.identified,specimenAccepted:p.accepted,analyzerReady:p.ready});if(!o.released){alert('Result blocked: '+o.reason);return}p.reports=p.reports.filter(x=>x.sampleId!==p.sampleId);p.reports.push({...o,sampleId:p.sampleId});s.readings.push({time:new Date().toLocaleTimeString(),label:'Synthetic specimen '+p.sampleId,value:'Hb '+o.sample.hemoglobin+' g/dL'});s.outcome={alert:false,text:'Synthetic result recorded',detail:p.sampleId};refresh()};
 document.getElementById('med-notes').oninput=e=>s.notes=e.target.value;
 document.getElementById('med-reset').onclick=()=>{if(confirm('Reset this synthetic medical practical?')){s.medical=initialMedical();s.ppe=false;s.notes='';s.readings=[];s.outcome=null;refresh()}};
 document.getElementById('med-submit').onclick=submit;
 document.getElementById('med-export').onclick=()=>download('cnte-vsl-medical.json',JSON.stringify(s,null,2),'application/json');
}
