/** CNTE-VSL native instructor/student medical practical UI. */
import {QC_LEVELS,TRAINING_SAMPLES,qualityGate} from './medicalLab.js';
import {MEDICAL_SCENARIOS,medicalPracticalAssessment} from './medicalProcedure.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const item=(id,label,checked)=>`<label class="check"><input type="checkbox" data-med-action="${id}" ${checked?'checked':''}> ${label}</label>`;
export function medicalPracticalPanel(s){
 if(!s)return '';
 const scenario=MEDICAL_SCENARIOS[s.equipmentId],grade=medicalPracticalAssessment(s);
 let task='';
 if(scenario.kind==='hematology'){
 task=`<div class="controls">${item('identity','Verify synthetic specimen identity',s.identity)}${item('accept','Specimen acceptance check',s.accepted)}</div>
 <div class="controls"><div class="field"><label for="clinical-case">Synthetic case</label><select id="clinical-case">${Object.entries(TRAINING_SAMPLES).map(([id,v])=>`<option value="${id}" ${s.sampleId===id?'selected':''}>${esc(v.label)}</option>`).join('')}</select></div><button class="secondary" id="clinical-load">Load selected specimen</button></div>
 <h4>Instrument quality controls</h4><div class="controls"><div class="field"><label for="clinical-qc-level">Control</label><select id="clinical-qc-level">${Object.entries(QC_LEVELS).map(([id,x])=>`<option value="${id}">${esc(x.label)} (target ${x.target})</option>`).join('')}</select></div><div class="field"><label for="clinical-qc-value">Simulated Hb (g/dL)</label><input id="clinical-qc-value" type="number" min="0" max="25" step=".1" value="9.0"></div><button class="secondary" id="clinical-qc-record">Record control</button></div>
 <p class="muted">QC gate: ${qualityGate(s.controls).levelsPassed}/3 controls passed. Training result release requires all three controls to pass.</p>
 <p class="muted">Synthetic results recorded: ${s.reports.map(x=>esc(x.sampleId)).join(', ')||'none'}. At least two cases are needed for comparison.</p>
 <button class="primary" id="clinical-run">Run synthetic hematology case</button>`;
 }else if(scenario.kind==='centrifuge'){
 task=`<div class="controls">${item('identity','Verify synthetic tube identity',s.identity)}${item('balance','Balance paired tube masses (training check)',s.balanced)}${item('rotor','Secure rotor (training check)',s.rotorSecured)}${item('lid','Close protective lid',s.lidClosed)}<div class="field"><label for="clinical-rpm">Training rotor speed (500–3000 RPM)</label><input type="number" id="clinical-rpm" min="500" max="3000" step="100" value="1500"></div></div><button class="primary" id="clinical-run">Run simulated spin cycle</button><p class="muted">Completed cycles: ${s.readings.length}</p>`;
 }else{
 task=`<div class="controls">${item('circuit','Connect synthetic airflow circuit',s.circuitConnected)}${item('filter','Inspect the training filter',s.filterInspected)}${item('leak','Perform simulated circuit leak check',s.leakPassed)}</div><button class="primary" id="clinical-run">Perform nonpatient airflow bench test</button><p class="muted">This is not patient ventilation, treatment guidance or a medical device calibration.</p>`;
 }
 return `<section class="panel" id="medical-practical-panel"><h3>Clinical equipment practical — ${esc(scenario.title)}</h3>
 <div class="note safety">Synthetic training data only. Do not enter patient information or use this software for clinical interpretation, physical servicing or therapeutic decisions.</div>
 <div class="controls">${item('ppe','PPE and biosafety orientation completed',s.ppe)}</div>
 ${task}
 <div class="field" style="margin-top:14px"><label for="clinical-notes">Scientific interpretation and reflection</label><textarea id="clinical-notes" rows="3" maxlength="2000" placeholder="Explain procedural checks, results, remaining limitations...">${esc(s.interpretation)}</textarea></div>
 <div class="toolbar"><button id="clinical-save-notes" class="secondary">Record interpretation</button></div>
 <div class="note">Practice score: <b>${grade.score}/100</b> · ${grade.passed?'Training practical passed':'Practical in progress'} · ${s.actions.length} procedure actions</div></section>`;
}
export function bindMedicalPanel(send){
 const panel=document.getElementById('medical-practical-panel');if(!panel)return;
 panel.querySelectorAll('[data-med-action]').forEach(x=>x.onchange=e=>send({kind:x.dataset.medAction,value:e.target.checked}));
 const load=document.getElementById('clinical-load');if(load)load.onclick=()=>send({kind:'load',sampleId:document.getElementById('clinical-case').value});
 const control=document.getElementById('clinical-qc-record');if(control)control.onclick=()=>send({kind:'qc',level:document.getElementById('clinical-qc-level').value,value:Number(document.getElementById('clinical-qc-value').value)});
 const level=document.getElementById('clinical-qc-level');if(level)level.onchange=e=>{document.getElementById('clinical-qc-value').value=QC_LEVELS[e.target.value].target};
 document.getElementById('clinical-run').onclick=()=>send({kind:'run',rpm:Number(document.getElementById('clinical-rpm')?.value||0)});
 document.getElementById('clinical-save-notes').onclick=()=>send({kind:'interpret',text:document.getElementById('clinical-notes').value});
}

export function medicalDemoSummary(s){
 if(!s)return '';
 const scenario=MEDICAL_SCENARIOS[s.equipmentId],score=medicalPracticalAssessment(s);
 const latest=s.readings.length?s.readings[s.readings.length-1]:null;
 return `<section class="panel"><h3>Lecturer's live medical demonstration</h3><p class="muted">${esc(scenario.title)} — the instructor's actions update this view automatically.</p>
 <div class="note"><b>Simulation status:</b> PPE ${s.ppe?'complete':'pending'} · ${s.actions.length} procedural actions · Practice score ${score.score}/100</div>
 <div class="note">Latest result: ${latest?esc(JSON.stringify(latest)):'No synthetic measurement yet'}</div>
 <p class="muted">Observe the instructor's procedure while completing your own independent medical exercise.</p></section>`;
}
