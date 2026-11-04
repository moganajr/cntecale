import {SPECIMENS,totalMagnification,fieldDiameterUm,focusQuality,assessMicroscopyObservation,estimateCellsInField} from './biologyMicroscopy.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initialMicroscope(){return {slide:'onion',eyepiece:10,objective:4,focus:44,lightOn:false,prepared:false,stageX:50,stageY:50,stageCentered:false,features:[],observations:[]}}
const allFeatures=[...new Set(Object.values(SPECIMENS).flatMap(s=>s.features))];
export function microscopyView(s){
 const p=s.microscope,slide=SPECIMENS[p.slide],q=focusQuality(p.focus,p.objective),mag=totalMagnification(p.eyepiece,p.objective),seen=p.observations.length;
 return `<div class="labbar"><button id="bio-back">← All laboratories</button><span class="pill">Biology • microscope simulation v0.5</span></div>
 <div class="pagehead"><span class="eyebrow">WASSCE · University · Biological sciences</span><h1>Virtual Microscopy and Cell Identification</h1><p class="muted">Prepare a microscope, select synthetic specimens, adjust objective and focus, center the stage, identify structures, and document two observations.</p></div>
 <div class="split"><div>
 <section class="panel"><h3>3D microscope and specimen viewer</h3><div class="apparatus" id="bio-3d" aria-label="Rotatable 3D microscope illustration"></div><div class="note"><b>Optics:</b> ${mag}× total magnification · approximately ${Math.round(fieldDiameterUm(p.objective))} µm field diameter · estimated ${estimateCellsInField(p.slide,p.objective)} cells in view (simplified model).</div>
 <div id="bio-slide-view" class="apparatus" style="min-height:290px"></div><div class="toolbar"><span class="tag">Focus ${p.focus}%</span><span class="tag">${q.inFocus?'In focus':q.clarity>0?'Adjust focus':'Out of focus'}</span><span class="tag">${p.lightOn?'Light on':'Light off'}</span></div>
 </section>
 <section class="panel"><h3>Microscope controls</h3>
 <div class="controls">
 <label class="check full"><input id="bio-ppe" type="checkbox" ${s.ppe?'checked':''}>Select appropriate PPE and review slide/glass handling safety</label>
 <label class="check full"><input id="bio-prepared" type="checkbox" ${p.prepared?'checked':''}>Inspect lenses, slide, and stage; start at low power</label>
 <label class="check full"><input id="bio-lightOn" type="checkbox" ${p.lightOn?'checked':''}>Switch on simulated illumination</label>
 <div class="field"><label for="bio-slide">Prepared slide</label><select id="bio-slide">${Object.entries(SPECIMENS).map(([id,v])=>`<option value="${id}" ${id===p.slide?'selected':''}>${esc(v.name)}</option>`).join('')}</select></div>
 <div class="field"><label for="bio-objective">Objective lens</label><select id="bio-objective">${[4,10,40].map(n=>`<option value="${n}" ${n===p.objective?'selected':''}>${n}× objective</option>`).join('')}</select></div>
 <div class="field"><label for="bio-focus">Fine focus (0–100)</label><input id="bio-focus" type="range" min="0" max="100" step="1" value="${p.focus}"></div>
 <div class="field"><label for="bio-stageX">Stage X</label><input id="bio-stageX" type="range" min="0" max="100" value="${p.stageX}"></div>
 <div class="field"><label for="bio-stageY">Stage Y</label><input id="bio-stageY" type="range" min="0" max="100" value="${p.stageY}"></div>
 <button class="secondary full" id="bio-center">Center specimen (mechanical stage)</button>
 </div>
 <h4>Identify observed structures</h4><div class="controls">${allFeatures.map(x=>`<label class="check"><input type="checkbox" data-bio-feature="${esc(x)}" ${p.features.includes(x)?'checked':''}>${esc(x)}</label>`).join('')}</div>
 <div class="toolbar" style="margin-top:15px"><button class="primary" id="bio-observe">Record microscopy observation</button><button class="ghost" id="bio-reset">Reset practical</button></div>
 </section>
 <section class="panel"><h3>Laboratory observation log</h3>${seen?`<div class="tablewrap"><table class="records"><thead><tr><th>Specimen</th><th>Magnification</th><th>Focus</th><th>Identification</th></tr></thead><tbody>${p.observations.map(o=>`<tr><td>${esc(SPECIMENS[o.specimenId].name)}</td><td>${o.magnification}×</td><td>${o.ready?'Clear':'Incomplete'}</td><td>${o.complete?'Complete':'Incomplete'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Record at least two different specimens with clear focus and complete identification.</p>'}
 <div class="field"><label for="bio-notes">Interpret cell morphology, microscopy technique and limitations</label><textarea id="bio-notes" placeholder="Describe differences between plant and animal cells...">${esc(s.notes)}</textarea></div><div class="toolbar" style="margin-top:14px"><button class="primary" id="bio-submit">Submit practice report</button><button class="ghost" id="bio-export">Export session JSON</button></div></section>
 </div><div><section class="panel"><h3>Practical procedure</h3><ol class="timeline"><li>Select PPE and inspect microscope and glass slide.</li><li>Place slide on the stage and begin at 4× objective.</li><li>Switch on illumination and center specimen.</li><li>Adjust the simulated focus until structures are clear.</li><li>Increase magnification only after the slide is centered.</li><li>Identify structures relevant to the specimen.</li><li>Record observations for two different specimens.</li><li>Compare findings in the laboratory report.</li></ol></section><section class="panel"><h3>Current synthetic specimen</h3><h4>${esc(slide.name)}</h4><p class="muted">Expected structures: ${slide.features.map(esc).join(', ')}.</p><div class="note safety">Illustrations are synthetic teaching diagrams, not clinical photomicrographs, tissue diagnoses, or verified images from a real microscope.</div></section></div></div>`;
}
export function renderMicroscopeSlide(host,p){
 if(!host)return;
 const q=focusQuality(p.focus,p.objective),level=p.objective,blur=Math.max(0,(1-q.clarity)*10),scale=level===4?.65:level===10?1:2;
 const offsetX=(p.stageX-50)*1.1,offsetY=(p.stageY-50)*1.1,shapes=[];
 const slide=p.slide;
 if(slide==='onion'){
 for(let row=0;row<5;row++)for(let col=0;col<6;col++){const x=col*88+12,y=row*60+5;
 shapes.push(`<rect x="${x}" y="${y}" width="84" height="57" rx="7" fill="${(row+col)%2?'#e5bed9':'#eecce4'}" stroke="#a05e94" stroke-width="4"/><ellipse cx="${x+35}" cy="${y+29}" rx="11" ry="8" fill="#95426e"/><path d="M${x+8} ${y+48}q30-12 64-8" fill="none" stroke="#ad75a3" stroke-width="1"/>`)}
 }else if(slide==='cheek'){
 for(let row=0;row<4;row++)for(let col=0;col<5;col++){const x=col*110+40+(row%2)*25,y=row*80+28;shapes.push(`<path d="M${x-38} ${y-18} Q${x+10} ${y-51},${x+44} ${y-18}Q${x+67} ${y+31},${x+4} ${y+39}Q${x-56} ${y+28},${x-38} ${y-18}" fill="#dfb8d8" stroke="#955d9f" stroke-width="3"/><ellipse cx="${x+9}" cy="${y+2}" rx="12" ry="9" fill="#8554a2"/>`)}
 }else{
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){let x=col*109+8,y=row*66+8;shapes.push(`<path d="M${x} ${y}h101v55h-101z" fill="#b9d8aa" stroke="#6f9d71" stroke-width="3"/>`)}
 for(const [x,y] of [[148,90],[340,185],[250,45],[75,230]]){shapes.push(`<ellipse cx="${x-13}" cy="${y}" rx="11" ry="28" fill="#5da777" stroke="#3b7b56" stroke-width="3"/><ellipse cx="${x+13}" cy="${y}" rx="11" ry="28" fill="#5da777" stroke="#3b7b56" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="4" ry="17" fill="#245d40"/>`)}
 }
 const opacity=p.lightOn?1:.13;const centered=Math.abs(p.stageX-50)<=12&&Math.abs(p.stageY-50)<=12;
 host.innerHTML=`<svg viewBox="0 0 540 310" role="img" aria-label="Synthetic microscope field of ${esc(SPECIMENS[p.slide].name)} at ${p.eyepiece*p.objective} times magnification; ${q.inFocus?'in focus':'blurred'}" style="width:100%;height:auto;max-width:540px"><defs><clipPath id="micro-circle"><circle cx="270" cy="155" r="143"/></clipPath><filter id="micro-blur"><feGaussianBlur stdDeviation="${blur.toFixed(1)}"/></filter></defs><rect width="540" height="310" fill="#eef4f5"/><circle cx="270" cy="155" r="147" fill="#415869"/><g clip-path="url(#micro-circle)" opacity="${opacity}"><rect x="125" y="12" width="290" height="286" fill="#f5e8f0"/><g transform="translate(${offsetX} ${offsetY}) translate(270 155) scale(${scale}) translate(-270 -155)" filter="url(#micro-blur)">${shapes.join('')}</g></g><circle cx="270" cy="155" r="143" fill="none" stroke="#415869" stroke-width="7"/><text x="14" y="27" font-size="12" fill="#28546a">${esc(SPECIMENS[p.slide].name)}</text><text x="14" y="47" font-size="12" fill="#28546a">${p.eyepiece*p.objective}× · ${q.inFocus?'Focused':'Needs focus'} · ${centered?'Centered':'Off-center'}</text></svg>`;
}
export function wireBiology(s,{refresh,back,submit,download}){
 const p=s.microscope;
 document.getElementById('bio-back').onclick=back;
 document.getElementById('bio-ppe').onchange=e=>{s.ppe=e.target.checked;refresh()};
 for(const key of ['prepared','lightOn'])document.getElementById('bio-'+key).onchange=e=>{p[key]=e.target.checked;refresh()};
 document.getElementById('bio-slide').onchange=e=>{p.slide=e.target.value;p.features=[];refresh()};
 document.getElementById('bio-objective').onchange=e=>{p.objective=Number(e.target.value);refresh()};
 for(const key of ['focus','stageX','stageY'])document.getElementById('bio-'+key).oninput=e=>{p[key]=Number(e.target.value);p.stageCentered=Math.abs(p.stageX-50)<=12&&Math.abs(p.stageY-50)<=12;refresh()};
 document.getElementById('bio-center').onclick=()=>{p.stageX=50;p.stageY=50;p.stageCentered=true;refresh()};
 document.querySelectorAll('[data-bio-feature]').forEach(el=>el.onchange=e=>{const v=el.dataset.bioFeature;p.features=e.target.checked?[...new Set([...p.features,v])]:p.features.filter(x=>x!==v);});
 document.getElementById('bio-observe').onclick=()=>{
  if(!s.ppe){alert('Review PPE and slide safety first.');return}
  const observation=assessMicroscopyObservation({specimenId:p.slide,objective:p.objective,focus:p.focus,stageCentered:p.stageCentered,lightOn:p.lightOn,prepared:p.prepared,observedFeatures:p.features});
  if(!observation.ready||!observation.complete){alert(!observation.ready?'Prepare, illuminate, center, and accurately focus the specimen.':'Review the identified structures; some are missing or incorrect.');return}
  const entry={...observation,specimenId:p.slide,magnification:totalMagnification(p.eyepiece,p.objective),time:new Date().toISOString()};
  p.observations=p.observations.filter(x=>x.specimenId!==p.slide);p.observations.push(entry);
  s.readings.push({time:new Date().toLocaleTimeString(),label:SPECIMENS[p.slide].name,value:entry.magnification+'×; '+entry.correct.join(', ')});
  s.outcome={alert:false,text:'Synthetic microscopy observation recorded',detail:SPECIMENS[p.slide].name+' · '+entry.magnification+'×'};
  refresh();
 };
 document.getElementById('bio-notes').oninput=e=>s.notes=e.target.value;
 document.getElementById('bio-reset').onclick=()=>{if(confirm('Reset biology microscope practical?')){s.microscope=initialMicroscope();s.ppe=false;s.notes='';s.readings=[];s.outcome=null;refresh()}};
 document.getElementById('bio-submit').onclick=submit;
 document.getElementById('bio-export').onclick=()=>download('cnte-vsl-microscopy.json',JSON.stringify(s,null,2),'application/json');
}
