import {TEACHING_SLIDES,evaluateSyntheticView} from './diagnosticMicroscopy.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function viewSvg(s){
 const x=evaluateSyntheticView(s),N=s.objective===4?17:s.objective===10?9:5;
 const shapes=Array.from({length:N},(_,i)=>{const a=i*2.3999632,r=20+Math.sqrt(i/N)*102,cx=160+Math.cos(a)*r,cy=160+Math.sin(a)*r;
 if(s.slide==='smear')return `<g><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="16" ry="12" fill="#ce869c" stroke="#9f5278"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="7" ry="5" fill="#f7cad7"/></g>`;
 if(s.slide==='stain')return `<g><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="8" ry="5" fill="${i%2?'#b481be':'#df93a8'}" stroke="#80579b"/></g>`;
 return `<g><rect x="${(cx-19).toFixed(1)}" y="${(cy-13).toFixed(1)}" width="38" height="26" fill="#c4b4d5" fill-opacity=".8" stroke="#86639f"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="4" ry="6" fill="#7c4f9d"/></g>`;
 }).join('');
 const blur=Math.min(12,x.error*.35);return `<svg viewBox="0 0 320 320" role="img" aria-label="Synthetic teaching slide: ${esc(TEACHING_SLIDES[s.slide].label)} at ${x.magnification} times total magnification"><defs><clipPath id="cnte-fov"><circle cx="160" cy="160" r="140"/></clipPath><filter id="cnte-defocus"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><circle cx="160" cy="160" r="143" fill="#273d56"/><g clip-path="url(#cnte-fov)"><rect x="18" y="18" width="284" height="284" fill="${s.illumination&&s.prepared?'#f7e9f2':'#374457'}"/><g opacity="${s.illumination&&s.prepared?'1':'.08'}" filter="url(#cnte-defocus)" transform="translate(${s.centered?0:60},${s.centered?0:-35})">${shapes}</g></g><text x="160" y="307" text-anchor="middle" fill="#fff" font-size="12">${x.magnification}× · ${x.ready?'Focused / centered':'Adjust preparation, stage or focus'}</text></svg>`;
}
export function microscopyPanel(s){
 const m=s.microscopy,x=evaluateSyntheticView(m);
 return `<div class="clinical-microscopy"><h4>Synthetic microscopy field and controls</h4><div class="micro-layout"><div class="micro-field">${viewSvg(m)}</div><div>
 <div class="controls"><div class="field"><label for="micro-slide">Training slide</label><select id="micro-slide">${Object.entries(TEACHING_SLIDES).map(([id,v])=>`<option value="${id}" ${m.slide===id?'selected':''}>${esc(v.label)}</option>`).join('')}</select></div>
 <div class="field"><label for="micro-objective">Objective</label><select id="micro-objective">${[4,10,40].map(o=>`<option value="${o}" ${m.objective===o?'selected':''}>${o}× (total ${o*10}×)</option>`).join('')}</select></div></div>
 <div class="controls"><label class="check"><input type="checkbox" id="micro-prepared" ${m.prepared?'checked':''}> Prepare synthetic slide</label><label class="check"><input type="checkbox" id="micro-light" ${m.illumination?'checked':''}> Light on</label><label class="check"><input type="checkbox" id="micro-center" ${m.centered?'checked':''}> Center stage</label></div>
 <div class="field"><label for="micro-focus">Fine focus: ${m.focus} / 100</label><input type="range" id="micro-focus" min="0" max="100" step="1" value="${m.focus}" style="width:100%"></div><p class="muted">Focus target in this illustrative model: ${x.target}, current error: ${x.error.toFixed(1)}. Identifiable only when preparation, illumination, centering and focus pass.</p></div></div>
 <h4>Record observed structures</h4><div class="micro-features">${TEACHING_SLIDES[m.slide].structures.map(z=>`<label class="check"><input type="checkbox" data-micro-feature="${esc(z)}"> ${esc(z)}</label>`).join('')}</div>
 <button id="micro-observe" class="primary">Record synthetic slide observation</button><p class="muted">Correctly identified slides: ${m.viewed.map(id=>esc(TEACHING_SLIDES[id].label)).join(' · ')||'None yet'}. Observe at least two distinct training slides.</p>
 </div>`;
}
export function bindMicroscopyPanel(send){
 const root=document.querySelector('.clinical-microscopy');if(!root)return;
 const emit=(kind,extras)=>send({kind:'slide-'+kind,...extras});
 document.getElementById('micro-slide').onchange=e=>emit('select',{slide:e.target.value});
 document.getElementById('micro-objective').onchange=e=>emit('objective',{value:Number(e.target.value)});
 for(const [id,k] of [['micro-prepared','prepare'],['micro-light','light'],['micro-center','center']])document.getElementById(id).onchange=e=>emit(k,{value:e.target.checked});
 document.getElementById('micro-focus').onchange=e=>emit('focus',{value:Number(e.target.value)});
 document.getElementById('micro-observe').onclick=()=>emit('observe',{structures:[...root.querySelectorAll('[data-micro-feature]:checked')].map(x=>x.dataset.microFeature)});
}
