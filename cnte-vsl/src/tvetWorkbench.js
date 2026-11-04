import {FAULTS,faultReadings,diagnoseFault} from './tvetFaults.js';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initialTVET(){return {fault:'open',selected:'open',volts:12,sourceIsolated:true,isolatedInitially:false,inspected:false,meter:'resistance',records:[],diagnoses:[],unsafeAttempt:false}}
export function tvetView(s){const p=s.tvet;return `
<div class="labbar"><button id="tvet-back">← All laboratories</button><span class="pill">TVET fault diagnosis · v0.7</span></div><div class="pagehead"><span class="eyebrow">Vocational training / Competency-based</span><h1>Electrical Fault Diagnosis Workshop</h1><p class="muted">Inspect an isolated 12–24 V educational circuit, choose multimeter functions, diagnose faults, and document safe test evidence.</p></div>
<div class="split"><div>
<section class="panel"><h3>Rotatable 3D virtual workbench</h3><div class="apparatus" id="tvet-3d"></div><p class="muted">Drag to rotate. Configure the simulated equipment using the accessible controls below.</p>
<div class="note safety"><b>Safety:</b> Low-voltage training simulation only. Never apply these steps to mains or energized installations without appropriately qualified supervision. Resistance and continuity checks require isolation.</div>
<div class="controls">
<label class="check full"><input id="tvet-ppe" type="checkbox" ${s.ppe?'checked':''}>Select PPE and complete the electrical hazard orientation</label>
<label class="check full"><input id="tvet-inspected" type="checkbox" ${p.inspected?'checked':''}>Inspect simulated meter, test leads and source protection</label>
<label class="check full"><input id="tvet-isolated" type="checkbox" ${p.sourceIsolated?'checked':''}>Source isolated / switch open</label>
<div class="field"><label for="tvet-fault">Instructor fault scenario</label><select id="tvet-fault">${Object.entries(FAULTS).map(([id,f])=>`<option value="${id}" ${p.fault===id?'selected':''}>${e(f.label)}</option>`).join('')}</select></div>
<div class="field"><label for="tvet-meter">Digital multimeter mode</label><select id="tvet-meter">${[['resistance','Resistance (Ω)'],['continuity','Continuity'],['voltage','DC voltage'],['current','DC current']].map(([id,l])=>`<option value="${id}" ${p.meter===id?'selected':''}>${l}</option>`).join('')}</select></div>
<div class="field"><label for="tvet-volts">DC supply</label><select id="tvet-volts">${[6,12,24].map(n=>`<option value="${n}" ${p.volts===n?'selected':''}>${n} V</option>`).join('')}</select></div>
<div class="field"><label for="tvet-selected">Your diagnosis</label><select id="tvet-selected">${Object.entries(FAULTS).map(([id,f])=>`<option value="${id}" ${p.selected===id?'selected':''}>${e(f.label)}</option>`).join('')}</select></div>
</div><div class="toolbar" style="margin-top:14px"><button class="primary" id="tvet-measure">Take multimeter reading</button><button class="secondary" id="tvet-diagnose">Submit fault diagnosis</button><button class="ghost" id="tvet-reset">Reset workshop</button></div>
<div class="note">Resistive load approximation: V = IR. Fault readings are deterministic training outputs, not real instrument readings.</div></section>
<section class="panel"><h3>Diagnostic evidence log</h3>${p.records.length?`<div class="tablewrap"><table class="records"><thead><tr><th>Scenario</th><th>Mode</th><th>Reading</th><th>Status</th></tr></thead><tbody>${p.records.map(x=>`<tr><td>${e(FAULTS[x.fault].label)}</td><td>${e(x.mode)}</td><td>${e(x.reading??'—')} ${e(x.unit??'')}</td><td>${e(x.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No instrument readings recorded yet.</p>'}
<p class="muted">Validated fault diagnoses: ${new Set(p.diagnoses.filter(x=>x.qualified).map(x=>x.fault)).size} / 3 required distinct fault scenarios.</p>
<div class="field"><label for="tvet-notes">Explain the fault evidence, risk controls and corrective action</label><textarea id="tvet-notes">${e(s.notes)}</textarea></div>
<div class="toolbar" style="margin-top:13px"><button class="primary" id="tvet-submit">Submit TVET practice report</button><button class="ghost" id="tvet-export">Export training JSON</button></div></section>
</div><div><section class="panel"><h3>Training procedure</h3><ol class="timeline"><li>Review safety and select PPE</li><li>Inspect simulated source, meter and leads</li><li>Isolate the source before changing faults or taking resistance readings</li><li>Select an appropriate multimeter range</li><li>Record measurements and document evidence</li><li>Submit a diagnosis and explain the cause</li><li>Repeat for three different fault scenarios</li><li>Complete the competency report</li></ol></section>
<section class="panel"><h3>Competency requirements</h3><p class="muted">Safety (15), inspection (10), isolation (20), instrument readings (20), diagnoses (20), and reporting (15). Three distinct evidence-based diagnoses are required for a practice pass.</p><span class="badge provisional">Not a license or physical trade certification</span></section></div></div>`;}
export function wireTVET(s,{refresh,back,submit,download}){
 const p=s.tvet;document.getElementById('tvet-back').onclick=back;
 document.getElementById('tvet-ppe').onchange=x=>{s.ppe=x.target.checked;refresh()};
 document.getElementById('tvet-inspected').onchange=x=>{p.inspected=x.target.checked;refresh()};
 document.getElementById('tvet-isolated').onchange=x=>{p.sourceIsolated=x.target.checked;if(x.target.checked)p.isolatedInitially=true;refresh()};
 for(const k of ['fault','selected','volts','meter'])document.getElementById('tvet-'+k).onchange=x=>{
   if(k==='fault'&&!p.sourceIsolated){alert('Isolate the simulated source before changing fault wiring.');refresh();return}
   p[k]=k==='volts'?Number(x.target.value):x.target.value;refresh()
 };
 document.getElementById('tvet-measure').onclick=()=>{
   if(!s.ppe||!p.inspected){alert('Complete PPE and instrument inspection.');return}
   const r=faultReadings({fault:p.fault,volts:p.volts,sourceIsolated:p.sourceIsolated,meter:p.meter});
   const item={...r,mode:p.meter,sourceIsolated:p.sourceIsolated,fault:p.fault,time:new Date().toISOString()};
   p.records.push(item);
   if(r.hazard){p.unsafeAttempt=true}
   if(r.status==='blocked'){alert('Safety gate: '+r.reason);refresh();return}
   s.readings.push({time:new Date().toLocaleTimeString(),label:FAULTS[p.fault].label,value:p.meter+': '+r.reading+' '+r.unit});refresh()
 };
 document.getElementById('tvet-diagnose').onclick=()=>{
   const evidence=p.records.filter(x=>x.fault===p.fault);
   const d=diagnoseFault({fault:p.fault,selected:p.selected,measurements:evidence});
   p.diagnoses=p.diagnoses.filter(x=>x.fault!==p.fault);p.diagnoses.push({...d,fault:p.fault});
   alert(d.qualified?'Diagnosis accepted with safe measurement evidence.':'Diagnosis not accepted: verify the fault and collect isolated resistance evidence.');refresh()
 };
 document.getElementById('tvet-notes').oninput=x=>s.notes=x.target.value;
 document.getElementById('tvet-reset').onclick=()=>{if(confirm('Reset workshop evidence?')){s.tvet=initialTVET();s.ppe=false;s.notes='';s.readings=[];refresh()}};
 document.getElementById('tvet-submit').onclick=submit;
 document.getElementById('tvet-export').onclick=()=>download('cnte-vsl-tvet.json',JSON.stringify(s,null,2),'application/json')
}
