import {analyzeCircuit,equivalentResistance} from './physicsCircuit.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(x,n=3)=>Number(x).toFixed(n);
export function initialPhysics(){return {volts:6,r1:100,r2:200,topology:'series',fault:'none',switchClosed:false,ammeter:'absent',voltmeter:'absent',isolated:true,limitAmps:.5,isolatedDuringWiring:false,unsafeAction:false,measurements:[]}}
export function physicsView(s){
 const p=s.physics,res=analyzeCircuit(p);const measured=p.measurements||[];
 const wires=p.topology==='series'
 ?'<path d="M125 105 H205 M275 105 H335 M405 105 H480 V237 H125 V105" />'
 :'<path d="M125 105 H220 V75 H355 V105 H480 V237 H125 V105 M220 105 V160 H355 V105" />';
 return `<div class="labbar"><button id="physics-back">← All laboratories</button><span class="pill">Physics practical · v0.4</span></div>
 <div class="pagehead"><span class="eyebrow">Physics / WASSCE · University · TVET</span><h1>DC Circuit Builder & Ohm's Law</h1><p class="muted">Assemble simulated series and parallel resistor circuits, place meters, check safety, run measurements and compare theoretical values. Ideal DC education model.</p></div>
 <div class="split"><div>
 <section class="panel"><h3>Rotatable 3D circuit workbench</h3><div class="apparatus" id="physics-3d"></div><p class="muted">Drag to rotate and scroll to zoom. The schematic and controls below define the actual simulated circuit.</p></section><section class="panel"><h3>Interactive circuit schematic</h3>
 <div class="apparatus"><svg viewBox="0 0 580 300" role="img" aria-label="Circuit with DC supply, two resistors, current meter and voltmeter; wire connections depend on topology" style="max-height:330px">
 <rect x="5" y="5" width="570" height="290" rx="12" fill="#eaf5f7"/>
 <g stroke="${res.status==='measured'?'#189786':'#648594'}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">${wires}</g>
 <rect x="72" y="127" width="105" height="80" rx="13" fill="#fff" stroke="#557e90" stroke-width="2"/>
 <text x="125" y="153" font-size="13" fill="#194b62" text-anchor="middle">DC SUPPLY</text><text x="125" y="183" font-size="24" fill="#147968" text-anchor="middle">${esc(p.volts)} V</text>
 <rect x="204" y="82" width="72" height="45" rx="8" fill="#fff1ce" stroke="#b78f43" stroke-width="2"/><text x="240" y="111" fill="#534725" text-anchor="middle" font-size="14">R1 ${esc(p.r1)}Ω</text>
 <rect x="${p.topology==='series'?334:290}" y="${p.topology==='series'?82:141}" width="90" height="45" rx="8" fill="#fff1ce" stroke="#b78f43" stroke-width="2"/><text x="${p.topology==='series'?379:335}" y="${p.topology==='series'?111:169}" fill="#534725" text-anchor="middle" font-size="14">R2 ${esc(p.r2)}Ω</text>
 <circle cx="480" cy="170" r="29" fill="${p.ammeter==='series'?'#d9f2e9':'#fff0e1'}" stroke="#558b91" stroke-width="2"/><text x="480" y="175" font-size="19" fill="#1b6675" text-anchor="middle">A</text>
 <circle cx="310" cy="237" r="25" fill="${p.voltmeter==='parallel'?'#d9f2e9':'#fff0e1'}" stroke="#558b91" stroke-width="2"/><text x="310" y="243" font-size="19" fill="#1b6675" text-anchor="middle">V</text>
 <text x="25" y="27" fill="#315b70" font-size="13">${esc(p.topology.toUpperCase())} · ${esc(p.fault)} fault</text>
 <text x="25" y="282" fill="#315b70" font-size="12">${p.isolated?'SUPPLY ISOLATED':p.switchClosed?'SWITCH CLOSED':'SWITCH OPEN'} · ${esc(res.status.toUpperCase())}</text></svg></div>
 <div class="note safety"><b>Safety:</b> This is a low-voltage educational simulation. De-energize before wiring or continuity checks. Ammeter placement across supply and short circuits are blocked.</div>
 <div class="controls">
 <label class="check full"><input type="checkbox" id="phy-ppe" ${s.ppe?'checked':''}>Select virtual PPE and review electrical hazards</label>
 <label class="check full"><input type="checkbox" id="phy-prepared" ${s.prepared?'checked':''}>Inspect leads, resistor ratings, and source current limit</label>
 <label class="check full"><input type="checkbox" id="phy-isolated" ${p.isolated?'checked':''}>Source isolated for assembly (required before changing wiring)</label>
 <div class="field"><label for="phy-topology">Network</label><select id="phy-topology"><option value="series" ${p.topology==='series'?'selected':''}>Series</option><option value="parallel" ${p.topology==='parallel'?'selected':''}>Parallel</option></select></div>
 <div class="field"><label for="phy-fault">Fault insertion</label><select id="phy-fault"><option value="none" ${p.fault==='none'?'selected':''}>Healthy</option><option value="open" ${p.fault==='open'?'selected':''}>Open</option><option value="short" ${p.fault==='short'?'selected':''}>Short (blocked)</option></select></div>
 <div class="field"><label for="phy-volts">Supply (V)</label><input id="phy-volts" type="number" min="0" max="24" step=".5" value="${p.volts}"></div>
 <div class="field"><label for="phy-r1">Resistor R1 (Ω)</label><input id="phy-r1" type="number" min=".1" max="100000" value="${p.r1}"></div>
 <div class="field"><label for="phy-r2">Resistor R2 (Ω)</label><input id="phy-r2" type="number" min=".1" max="100000" value="${p.r2}"></div>
 <div class="field"><label for="phy-ammeter">Ammeter placement</label><select id="phy-ammeter"><option value="absent" ${p.ammeter==='absent'?'selected':''}>Not connected</option><option value="series" ${p.ammeter==='series'?'selected':''}>Series (correct)</option><option value="across-supply" ${p.ammeter==='across-supply'?'selected':''}>Across source (unsafe)</option></select></div>
 <div class="field"><label for="phy-voltmeter">Voltmeter placement</label><select id="phy-voltmeter"><option value="absent" ${p.voltmeter==='absent'?'selected':''}>Not connected</option><option value="parallel" ${p.voltmeter==='parallel'?'selected':''}>Parallel across load</option><option value="series" ${p.voltmeter==='series'?'selected':''}>Series (incorrect)</option></select></div>
 <label class="check full"><input type="checkbox" id="phy-switchClosed" ${p.switchClosed?'checked':''}>Close supply switch (only after isolation is removed)</label>
 </div><div class="toolbar" style="margin-top:16px"><button class="primary" id="phy-measure">Run instrument measurement</button><button class="ghost" id="phy-reset">Reset circuit</button></div>
 <div class="result ${res.status==='blocked'?'alert':''}"><h4>${res.status==='measured'?'Ready for measurement':esc(res.status.toUpperCase())}</h4><p>${esc(res.reason)}</p><p>R equivalent = <b>${fmt(res.resistance,2)} Ω</b> · Predicted current ${res.current===null?'—':fmt(res.current*1000,2)+' mA'}</p></div>
 </section>
 <section class="panel"><h3>Electronic measurements</h3>${measured.length?'<div class="tablewrap"><table class="records"><thead><tr><th>Network</th><th>Resistance</th><th>Current</th><th>Power</th></tr></thead><tbody>'+measured.map(m=>`<tr><td>${esc(m.topology)}</td><td>${fmt(m.resistance,2)} Ω</td><td>${fmt(m.current*1000,2)} mA</td><td>${fmt(m.watts,3)} W</td></tr>`).join('')+'</tbody></table></div>':'<p class="muted">No successful measurements yet. Record both series and parallel circuits.</p>'}
 <div class="field"><label for="phy-notes">Compare predictions and measurements; explain meter connections</label><textarea id="phy-notes">${esc(s.notes||'')}</textarea></div><div class="toolbar" style="margin-top:13px"><button class="primary" id="phy-submit">Submit physics practice report</button><button class="ghost" id="phy-export">Export session JSON</button></div></section>
 </div><div><section class="panel"><h3>Guided practical procedure</h3><ol class="timeline"><li>Review electrical safety and instrument function</li><li>Isolate source, select components and assemble circuit</li><li>Install ammeter in series, voltmeter across load</li><li>Inspect fault state and current limit</li><li>Close switch and run simulated measurement</li><li>Record series and parallel data</li><li>Compare with Ohm's law and calculate power</li><li>Explain observations in your report</li></ol><div class="note"><b>Equations:</b> I = V/R, P = VI; series R = R1 + R2; parallel 1/R = 1/R1 + 1/R2.</div></section><section class="panel"><h3>Assessment objectives</h3><p class="muted">Safety (15), preparation (10), isolated wiring (15), meters (20), first measurement (15), comparisons (15), analysis (10). Both network topologies must be successfully measured for a practice pass.</p><span class="badge provisional">Scientific and curriculum review pending</span></section></div></div>`;
}
export function wirePhysics(s,{refresh,back,submit,download}){
 const p=s.physics;
 document.getElementById('physics-back').onclick=back;
 for(const [id,prop] of [['phy-ppe','ppe'],['phy-prepared','prepared']]){
   document.getElementById(id).onchange=e=>{s[prop]=e.target.checked;refresh()};
 }
 document.getElementById('phy-isolated').onchange=e=>{p.isolated=e.target.checked;if(p.isolated)p.switchClosed=false;refresh()};
 const keys=['topology','fault','volts','r1','r2','ammeter','voltmeter'];
 for(const key of keys){const el=document.getElementById('phy-'+key);el.onchange=e=>{
   if(!p.isolated){alert('Isolate power before changing connections or components.');refresh();return;}
   const raw=e.target.value;const val=['volts','r1','r2'].includes(key)?Number(raw):raw;
   const copy={...p,[key]:val};try{analyzeCircuit(copy)}catch(err){alert(err.message);refresh();return}
   p[key]=val;p.isolatedDuringWiring=true;refresh();
 }}
 document.getElementById('phy-switchClosed').onchange=e=>{if(e.target.checked&&p.isolated){alert('Remove source isolation before closing the switch.');refresh();return;}p.switchClosed=e.target.checked;refresh()};
 document.getElementById('phy-measure').onclick=()=>{
   if(!s.ppe||!s.prepared){alert('Complete PPE and equipment checks.');return}
   const result=analyzeCircuit(p);
   if(result.status==='blocked'){p.unsafeAction=true;alert(result.reason);refresh();return}
   if(!result.canMeasure){alert(result.reason+'; correct the circuit and try again.');return}
   s.outcome={alert:false,text:'Physics measurements completed',detail:`I = ${fmt(result.current*1000,2)} mA, R = ${fmt(result.resistance,2)} Ω`};
   const observation={...result,topology:p.topology,volts:p.volts,r1:p.r1,r2:p.r2,time:new Date().toISOString()};
   p.measurements.push(observation);
   s.readings.push({time:new Date().toLocaleTimeString(),label:'Physics '+p.topology,value:s.outcome.detail});
   refresh();
 };
 document.getElementById('phy-notes').oninput=e=>{s.notes=e.target.value};
 document.getElementById('phy-reset').onclick=()=>{if(confirm('Reset the circuit and measurements?')){s.physics=initialPhysics();s.ppe=false;s.prepared=false;s.notes='';s.outcome=null;s.readings=[];refresh()}};
 document.getElementById('phy-submit').onclick=submit;
 document.getElementById('phy-export').onclick=()=>download('cnte-vsl-physics-session.json',JSON.stringify(s,null,2),'application/json');
}
