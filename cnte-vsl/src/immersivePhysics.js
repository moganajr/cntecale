import {analyzeCircuit} from './physicsCircuit.js';
import {mountPhysicsScene} from './physics3d.js';

const cameras=new WeakMap();
const labels={supply:'DC power supply',r1:'Resistor R1',r2:'Resistor R2',ammeter:'Ammeter',voltmeter:'Voltmeter'};
const setControl=(id,value)=>{
 const input=document.getElementById(id);
 if(!input)return;
 if(input.type==='checkbox')input.checked=value;
 else input.value=String(value);
 input.dispatchEvent(new Event('change',{bubbles:true}));
};

/** The scene uses the existing controls as the single source of circuit state. */
export function mountImmersivePhysics(host,state){
 if(!host)return ()=>{};
 let disposed=false,cleanup=()=>{};
 const fallback=()=>{
   const notice=document.createElement('p');notice.className='muted';notice.setAttribute('role','status');
   notice.textContent='WebGL unavailable. Accessible illustrated workbench active; laboratory controls remain available.';
   const illustrated=document.createElement('div');host.replaceChildren(notice,illustrated);
   return mountPhysicsScene(illustrated,{getState:()=>state});
 };
 host.textContent='Preparing interactive 3D laboratory…';
 import('../node_modules/three/build/three.module.js').then(THREE=>{
   if(disposed)return;
   try{cleanup=createScene(THREE,host,state)}
   catch{if(!disposed)cleanup=fallback()}
 }).catch(()=>{if(!disposed)cleanup=fallback()});
 return ()=>{disposed=true;cleanup()};
}

function createScene(T,host,p){
 const state=cameras.get(p)||{yaw:.38,pitch:.48,radius:10,selected:'supply'};
 cameras.set(p,state);
 const root=document.createElement('div');root.className='immersive-lab';
 const stage=document.createElement('div');stage.className='immersive-stage';
 const tools=document.createElement('div');tools.className='immersive-tools';
 const equipment=document.createElement('div');equipment.className='immersive-equipment';
 const panel=document.createElement('section');panel.className='immersive-controls';
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-label','Interactive three-dimensional physics laboratory');
 renderer.domElement.setAttribute('role','img');
 renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;cursor:grab';
 stage.append(renderer.domElement);root.append(stage,tools,equipment,panel);host.replaceChildren(root);
 const scene=new T.Scene();scene.background=new T.Color('#cbdbe6');
 const camera=new T.PerspectiveCamera(43,1,.1,60),target=new T.Vector3(0,.7,0);
 const materials=new Map(),textures=[],geometries=[],pickable=[];
 const material=(color,metalness=0,roughness=.55)=>{
   const key=color+':'+metalness+':'+roughness;
   if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,metalness,roughness}));
   return materials.get(key);
 };
 function mesh(geometry,mat,parent,x,y,z){
   geometries.push(geometry);
   const object=new T.Mesh(geometry,mat);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
 }
 const box=(parent,x,y,z,w,h,d,color,metal=0)=>mesh(new T.BoxGeometry(w,h,d),material(color,metal),parent,x,y,z);
 const cylinder=(parent,x,y,z,r,h,color,rotation=0)=>{const m=mesh(new T.CylinderGeometry(r,r,h,32),material(color,.2),parent,x,y,z);m.rotation.x=rotation;return m};
 function text(parent,words,x,y,z,w,h,color='#e2f2ef',background='#18343b'){
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
   const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 44px system-ui';ctx.fillText(words,256,64,480);
   const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
   const mat=new T.MeshBasicMaterial({map:texture});materials.set(texture,mat);
   return mesh(new T.PlaneGeometry(w,h),mat,parent,x,y,z);
 }
 function equipmentGroup(id,x,y,z){
   const group=new T.Group();group.position.set(x,y,z);group.userData.equipment=id;scene.add(group);pickable.push(group);return group;
 }
 const hemi=new T.HemisphereLight('#ffffff','#70909f',2);scene.add(hemi);
 const light=new T.DirectionalLight('#fff6e4',3);light.position.set(2,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;scene.add(light);
 box(scene,0,-1.11,0,14,.2,14,'#b4c4cd');
 box(scene,0,0,0,6.7,.16,4.1,'#b7a88b');
 box(scene,0,-.11,1.96,6.6,.16,.14,'#536674');
 for(const x of [-3.1,3.1])for(const z of [-1.8,1.8])box(scene,x,-.55,z,.15,.9,.15,'#546775',.25);
 // The surrounding laboratory provides context without introducing unrelated controls.
 box(scene,0,1.15,-3.0,9,4.4,.13,'#dce7ec');
 for(const x of [-3.15,3.15]){
   box(scene,x,-.38,-2.70,1.5,1.30,.43,'#55738a');
   box(scene,x,.30,-2.70,1.56,.10,.48,'#e0e5e4');
   for(const offset of [-.37,.37]){box(scene,x+offset,-.38,-2.46,.66,1.16,.055,'#718b9b');box(scene,x+offset,-.25,-2.41,.17,.045,.055,'#263845')}
 }
 box(scene,0,2.2,-2.91,3.2,1.45,.03,'#7c9eaf');
 for(const x of [-.78,.78])box(scene,x,2.2,-2.88,1.48,1.31,.035,'#b8d6e2');
 box(scene,0,2.2,-2.85,.08,1.45,.06,'#e6eef0');
 box(scene,0,2.2,-2.84,3.2,.08,.06,'#e6eef0');
 const result=analyzeCircuit(p);
 const supply=equipmentGroup('supply',-2.15,.72,-.68);
 box(supply,0,0,0,1.65,1.22,.95,'#536e7f',.15);
 box(supply,0,0,.49,1.53,1.11,.06,'#d7e2e7');
 text(supply,p.volts.toFixed(1)+' V',0,.27,.53,1.18,.31,'#bfeace');
 text(supply,'DC POWER SUPPLY',0,-.03,.53,1.2,.15,'#334c5a','#d7e2e7');
 cylinder(supply,-.48,-.32,.56,.15,.11,'#263845',Math.PI/2);
 cylinder(supply,-.10,-.32,.56,.12,.11,'#263845',Math.PI/2);
 cylinder(supply,.34,-.34,.56,.07,.12,'#a94c42',Math.PI/2);
 cylinder(supply,.57,-.34,.56,.07,.12,'#293c48',Math.PI/2);
 const stateColor=p.isolated?'#718795':result.status==='blocked'?'#ba4c42':p.switchClosed?'#258779':'#b59d68';
 box(supply,.57,.37,.53,.10,.10,.04,stateColor);
 function resistor(id,x,value){
   const r=equipmentGroup(id,x,.17,-.75);
   box(r,0,0,0,1.2,.16,.82,'#385b48');
   box(r,0,.19,0,.92,.23,.5,'#c7aa78');
   text(r,value+' Ω',0,.18,.26,.56,.14,'#302719','#dfcba6');
   cylinder(r,-.45,.05,.29,.07,.09,'#9eaeb4');
   cylinder(r,.45,.05,.29,.07,.09,'#9eaeb4');
   return r;
 }
 resistor('r1',.0,p.r1);resistor('r2',1.65,p.r2);
 function meter(id,x,title,screen){
   const group=equipmentGroup(id,x,.56,.95);
   box(group,0,0,0,1.1,1.02,.65,'#d6a84f');
   box(group,0,0,.34,.94,.89,.045,'#344955');
   text(group,screen,0,.24,.37,.77,.26,'#14382a','#a3c5aa');
   text(group,title,0,-.03,.37,.77,.13,'#ecf2f4','#344955');
   cylinder(group,0,-.22,.39,.12,.07,'#22333e',Math.PI/2);
   cylinder(group,-.28,-.38,.39,.06,.08,'#ad4c42',Math.PI/2);
   cylinder(group,.28,-.38,.39,.06,.08,'#253746',Math.PI/2);
 }
 meter('ammeter',-.55,'AMMETER',result.canMeasure?(result.current*1000).toFixed(1)+' mA':'—');
 meter('voltmeter',1.28,'VOLTMETER',result.canMeasure?result.voltage.toFixed(1)+' V':'—');
 function cable(points,color){
   const path=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));
   mesh(new T.TubeGeometry(path,32,.025,8,false),material(color),scene,0,0,0);
 }
 if(p.ammeter!=='absent')cable([[-1.81,.30,-.08],[-1.32,.13,.36],[-1.08,.12,1.20],[-.83,.18,1.32]],stateColor);
 if(p.voltmeter!=='absent')cable([[1.1,.14,-.47],[2.35,.14,-.28],[2.05,.15,.74],[1.56,.18,1.32]],stateColor);
 cable([[-.45,.19,-.46],[.55,.14,-.40],[1.20,.19,-.46]],stateColor);
 if(p.topology==='parallel')cable([[-.45,.19,-.46],[-.25,.13,.07],[1.85,.13,.10],[2.1,.19,-.46]],stateColor);
 const selection=new T.BoxHelper(pickable[0],0x15978b);selection.visible=false;scene.add(selection);
 let raf=0,disposed=false;
 function draw(){
   if(disposed)return;
   const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
   renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
   camera.position.set(Math.sin(state.yaw)*Math.cos(state.pitch)*state.radius,Math.sin(state.pitch)*state.radius,Math.cos(state.yaw)*Math.cos(state.pitch)*state.radius);camera.lookAt(target);
   const selected=pickable.find(group=>group.userData.equipment===state.selected);if(selected){selection.setFromObject(selected);selection.visible=true}
   renderer.render(scene,camera);
 }
 function schedule(){if(!disposed&&!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})}
 const button=(parent,label,action,primary=false)=>{
   const b=document.createElement('button');b.type='button';b.className=primary?'primary':'ghost';b.textContent=label;b.onclick=action;parent.append(b);return b;
 };
 for(const [label,change] of [['Rotate left',()=>state.yaw-=.25],['Rotate right',()=>state.yaw+=.25],['Zoom in',()=>state.radius=Math.max(6,state.radius-.7)],['Zoom out',()=>state.radius=Math.min(15,state.radius+.7)],['Reset view',()=>Object.assign(state,{yaw:.38,pitch:.48,radius:10})]])button(tools,label,()=>{change();schedule()});
 for(const [id,label] of Object.entries(labels)){
   const b=button(equipment,label,()=>select(id));b.dataset.equipment=id;
 }
 function select(id){
   state.selected=id;
   equipment.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.equipment===id)));
   panel.replaceChildren();
   const heading=document.createElement('h3');heading.textContent=labels[id];panel.append(heading);
   const actions=document.createElement('div');actions.className='toolbar';panel.append(actions);
   if(id==='supply'){
     button(actions,p.isolated?'Enable simulated source':'Isolate source',()=>setControl('phy-isolated',!p.isolated));
     button(actions,p.switchClosed?'Open switch':'Close switch',()=>setControl('phy-switchClosed',!p.switchClosed));
   }else if(id==='ammeter'||id==='voltmeter'){
     const option=id==='ammeter'?'series':'parallel';
     button(actions,id==='ammeter'?'Connect ammeter in series':'Connect voltmeter across load',()=>setControl('phy-'+id,option));
     button(actions,'Disconnect meter',()=>setControl('phy-'+id,'absent'));
   }else{
     button(actions,'Series network',()=>setControl('phy-topology','series'));
     button(actions,'Parallel network',()=>setControl('phy-topology','parallel'));
   }
   button(actions,'Record measurement',()=>document.getElementById('phy-measure')?.click(),true);
   const note=document.createElement('p');note.className='muted';note.textContent='Use the existing laboratory controls for precise values and safety checks.';panel.append(note);
   schedule();
 }
 let start=null;
 renderer.domElement.onpointerdown=e=>{start={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId)};
 renderer.domElement.onpointermove=e=>{if(!start)return;const dx=e.clientX-start.lastX,dy=e.clientY-start.lastY;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)start.moved=true;if(start.moved){state.yaw-=dx*.008;state.pitch=Math.max(.22,Math.min(1.18,state.pitch+dy*.006));schedule()}start.lastX=e.clientX;start.lastY=e.clientY};
 renderer.domElement.onpointerup=e=>{
   if(start&&!start.moved){
     const rect=renderer.domElement.getBoundingClientRect();
     const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
     const hit=ray.intersectObjects(pickable,true)[0];let object=hit?.object;
     while(object&&!object.userData.equipment)object=object.parent;
     if(object?.userData.equipment)select(object.userData.equipment);
   }
   start=null;
 };
 renderer.domElement.onpointercancel=()=>{start=null};
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();state.radius=Math.max(6,Math.min(15,state.radius+e.deltaY*.006));schedule()},{passive:false});
 const observer=new ResizeObserver(schedule);observer.observe(stage);select(state.selected);schedule();
 return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();selection.geometry.dispose();selection.material.dispose();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();renderer.dispose();renderer.forceContextLoss()};
}
