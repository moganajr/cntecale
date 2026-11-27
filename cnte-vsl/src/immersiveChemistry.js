import {mountTitrationScene} from './scene3d.js';
import {equivalenceVolumeMl,strongAcidBasePH} from './science.js';
import {summarizeTitres} from './titrationPractical.js';

const views=new WeakMap();
const labels={burette:'Burette',flask:'Conical flask',indicator:'Indicator bottle',stand:'Retort stand'};
export function chemistryGuidance(s){
 const p=s.params,endpoint=equivalenceVolumeMl(.1,p.acidVol,p.baseMolarity);
 if(!s.ppe||!s.prepared)return 'Complete the virtual safety and equipment preparation checks.';
 if(!s.calibrated)return 'Inspect the burette scale and confirm calibration.';
 if(!s.indicator)return 'Select the indicator bottle and confirm indicator preparation.';
 if(s.outcome&&!s.outcome.alert)return summarizeTitres(s.trials).concordant?'Explain the results and submit your report.':'Prepare another trial to compare repeatability.';
 if(p.volume>endpoint+.25)return 'The simulated endpoint is overshot. Review the observation and restart this trial.';
 if(p.volume<endpoint-.25)return 'Observe the changing liquid level and color. Record when the endpoint is reached.';
 return 'Inspect the meniscus and record the observed titre.';
}
const rubricMax={safety:15,preparation:10,calibration:15,indicator:5,technique:15,repeatability:20,measurements:10,analysis:10};
export function summarizeChemistryReports(records){
 const rows=records.filter(r=>r.lab==='titration');
 return {attempts:rows.length,passed:rows.filter(r=>r.passed).length,missed:Object.entries(rubricMax).map(([topic,max])=>{const reviewed=rows.filter(r=>Number.isFinite(r.rubric?.[topic]));return {topic,reviewed:reviewed.length,missed:reviewed.filter(r=>r.rubric[topic]<max).length}}).filter(r=>r.missed>0).sort((a,b)=>b.missed-a.missed)};
}
export function mountImmersiveChemistry(host,s){
 if(!host)return ()=>{};
 let disposed=false,cleanup=()=>{};
 const fallback=()=>{const note=document.createElement('p');note.className='muted';note.textContent='WebGL unavailable; illustrated workbench and accessible controls remain active.';const inner=document.createElement('div');host.replaceChildren(note,inner);return mountTitrationScene(inner,{getState:()=>({volume:s.params.volume,indicator:s.indicator,endpoint:equivalenceVolumeMl(.1,s.params.acidVol,s.params.baseMolarity)})});};
 host.textContent='Preparing interactive chemistry laboratory…';
 import('../node_modules/three/build/three.module.js').then(T=>{if(!disposed){try{cleanup=create(T,host,s)}catch{cleanup=fallback()}}}).catch(()=>{if(!disposed)cleanup=fallback()});
 return ()=>{disposed=true;cleanup()};
}

function create(T,host,s){
 const state=views.get(s)||{yaw:.28,pitch:.18,radius:8.9,selected:'burette'};views.set(s,state);
 const root=document.createElement('div');root.className='immersive-lab chemistry-immersive';
 const stage=document.createElement('div');stage.className='immersive-stage';
 const toolbar=document.createElement('div');toolbar.className='immersive-tools';
 const choices=document.createElement('div');choices.className='immersive-equipment';
 const panel=document.createElement('section');panel.className='immersive-controls';
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const canvas=renderer.domElement;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive 3D chemistry workbench with burette, flask, indicator bottle and stand');canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';
 stage.append(canvas);root.append(stage,toolbar,choices,panel);host.replaceChildren(root);
 const scene=new T.Scene();scene.background=new T.Color('#d7e4eb');
 const camera=new T.PerspectiveCamera(41,1,.1,50),target=new T.Vector3(0,1.65,0);
 const geometry=[],materials=[],groups={};
 const mat=(color,options={})=>{const m=new T.MeshStandardMaterial({color,...options});materials.push(m);return m};
 const glass=mat('#b4e7ef',{transparent:true,opacity:.23,roughness:.2,side:T.DoubleSide,depthWrite:false}),liquid=mat('#7abacb',{transparent:true,opacity:.75,depthWrite:false}),metal=mat('#556b73',{metalness:.5,roughness:.36}),dark=mat('#293b46'),white=mat('#f4f5e9'),wood=mat('#c4ad85'),trim=mat('#71808c'),cap=mat('#275d83');
 const mesh=(parent,g,m,x,y,z)=>{geometry.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);return o};
 const box=(parent,w,h,d,m,x,y,z)=>mesh(parent,new T.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(parent,top,bottom,h,m,x,y,z)=>mesh(parent,new T.CylinderGeometry(top,bottom,h,40),m,x,y,z);
 const group=(id,x,y,z)=>{const g=new T.Group();g.position.set(x,y,z);g.userData.equipment=id;scene.add(g);groups[id]=g;return g};
 const shape=(parent,points,m,x,y,z)=>mesh(parent,new T.LatheGeometry(points.map(([r,h])=>new T.Vector2(r,h)),48),m,x,y,z);
 box(scene,12,.18,10,trim,0,-1.62,0);box(scene,6.5,.22,3.5,wood,0,-.11,0);
 for(const x of [-2.75,2.75])for(const z of [-1.35,1.35])box(scene,.15,1.45,.15,metal,x,-.86,z);
 box(scene,11,6,.16,white,0,1.4,-4);box(scene,4.2,1.7,.14,trim,0,2.8,-3.86);box(scene,4,1.5,.16,mat('#a9d1df'),0,2.8,-3.76);box(scene,.08,1.5,.2,white,0,2.8,-3.65);
 const stand=group('stand',-.66,0,-.3);box(stand,1.5,.12,1.18,dark,0,.06,0);cyl(stand,.065,.065,3.9,metal,0,2,0);box(stand,.75,.11,.11,metal,.32,3.2,0);
 const burette=group('burette',0,0,-.3);cyl(burette,.14,.14,2.55,glass,0,2.63,0);cyl(burette,.16,.16,.05,metal,0,3.93,0);
 const remaining=Math.max(0,1-s.params.volume/50);if(remaining>0)cyl(burette,.11,.11,2.5*remaining,liquid,0,1.38+1.25*remaining,0);
 for(let i=0;i<=50;i++)box(burette,i%5===0?.15:.08,.012,.012,dark,.085,3.88-i*.05,.143);
 cyl(burette,.035,.045,.36,glass,0,1.19,0);box(burette,.43,.1,.13,cap,0,1.36,0);cyl(burette,.075,.075,.12,metal,0,1.36,0).rotation.x=Math.PI/2;
 const flask=group('flask',0,0,-.3);shape(flask,[[0,.02],[.6,.02],[.62,.08],[.22,.86],[.22,1],[.25,1]],glass,0,0,0);
 const p=s.params,endpoint=equivalenceVolumeMl(.1,p.acidVol,p.baseMolarity),ph=strongAcidBasePH(.1,p.acidVol,p.baseMolarity,p.volume),solution=mat(s.indicator&&ph>=8.2?'#ed77ac':'#c5e6e8',{transparent:true,opacity:.7,depthWrite:false});
 const level=.2+p.volume*.006;shape(flask,[[0,.04],[.57,.04],[.57-(level-.04)*.48,level],[0,level]],solution,0,0,0);
 const bottle=group('indicator',-1.75,0,.62);cyl(bottle,.28,.29,.66,mat('#996c3d'),0,.37,0);cyl(bottle,.13,.13,.24,cap,0,.82,0);box(bottle,.42,.27,.035,white,0,.38,.28);
 scene.add(new T.HemisphereLight('#e3f4ff','#788490',2.2));const key=new T.DirectionalLight('#fff5dc',3);key.position.set(4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
 const highlight=new T.BoxHelper(burette,0x15978b);scene.add(highlight);
 let frame=0,alive=true;
 function draw(){frame=0;if(!alive)return;const w=stage.clientWidth||600,h=stage.clientHeight||400;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.set(target.x+state.radius*Math.cos(state.pitch)*Math.sin(state.yaw),target.y+state.radius*Math.sin(state.pitch),target.z+state.radius*Math.cos(state.pitch)*Math.cos(state.yaw));camera.lookAt(target);highlight.setFromObject(groups[state.selected]);renderer.render(scene,camera)}
 const schedule=()=>{if(alive&&!frame)frame=requestAnimationFrame(draw)};
 const button=(parent,label,action)=>{const b=document.createElement('button');b.type='button';b.className='ghost';b.textContent=label;b.onclick=action;parent.append(b);return b};
 const click=id=>document.getElementById(id)?.click();
 const check=id=>{const input=document.getElementById(id);if(input&&!input.checked)input.click()};
 for(const [label,action] of [['Rotate left',()=>state.yaw-=.25],['Rotate right',()=>state.yaw+=.25],['Zoom in',()=>state.radius=Math.max(5,state.radius-.6)],['Zoom out',()=>state.radius=Math.min(13,state.radius+.6)],['Reset view',()=>Object.assign(state,{yaw:.28,pitch:.18,radius:8.9})]])button(toolbar,label,()=>{action();schedule()});
 for(const [id,label] of Object.entries(labels)){const b=button(choices,label,()=>select(id));b.dataset.equipment=id;}
 function select(id){state.selected=id;choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.equipment===id)));panel.replaceChildren();const title=document.createElement('h3');title.textContent=labels[id];panel.append(title);const readout=document.createElement('p');readout.textContent=`Burette: ${p.volume.toFixed(1)} mL · Model pH: ${ph.toFixed(2)} · ${s.indicator?'Indicator present':'No indicator'}`;panel.append(readout);const actions=document.createElement('div');actions.className='toolbar';panel.append(actions);
 if(id==='burette'){button(actions,'Confirm scale inspection',()=>check('calibrated'));for(const n of [.1,.5,1])button(actions,`Dispense ${n.toFixed(1)} mL`,()=>document.querySelector(`[data-add="${n}"]`)?.click());}
 if(id==='flask')button(actions,'Record observed titre',()=>click('perform'));
 if(id==='indicator')button(actions,'Confirm indicator preparation',()=>check('indicator'));
 if(id==='stand'){button(actions,'Confirm virtual safety checks',()=>check('ppe'));button(actions,'Confirm equipment inspection',()=>check('prepared'));}
 if(s.outcome?.alert||s.trials.length||p.volume>endpoint+.25)button(actions,'Prepare next trial',()=>click('next-trial'));
 const guide=document.createElement('p');guide.className='learning-coach';guide.setAttribute('role','status');guide.textContent=chemistryGuidance(s);panel.append(guide);schedule();}
 let pointer=null;canvas.onpointerdown=e=>{pointer={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!pointer)return;const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>5)pointer.moved=true;if(pointer.moved){state.yaw-=dx*.008;state.pitch=Math.max(-.08,Math.min(.9,state.pitch+dy*.006));schedule()}pointer.lastX=e.clientX;pointer.lastY=e.clientY};
 canvas.onpointerup=e=>{if(pointer&&!pointer.moved){const rect=canvas.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);let obj=ray.intersectObjects(Object.values(groups),true)[0]?.object;while(obj&&!obj.userData.equipment)obj=obj.parent;if(obj)select(obj.userData.equipment)}pointer=null};canvas.onpointercancel=()=>{pointer=null};canvas.addEventListener('wheel',e=>{e.preventDefault();state.radius=Math.max(5,Math.min(13,state.radius+e.deltaY*.006));schedule()},{passive:false});
 const observer=new ResizeObserver(schedule);observer.observe(stage);select(state.selected);
 return ()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();highlight.geometry.dispose();highlight.material.dispose();geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss()};
}
