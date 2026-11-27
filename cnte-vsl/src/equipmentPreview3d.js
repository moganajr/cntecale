/** Exterior equipment illustrations for the standalone teaching workspaces. */
function cuboid(x,y,z,w,h,d){
 const a=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],
          [x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
 return [[a[0],a[1],a[2],a[3]],[a[4],a[5],a[6],a[7]],
         [a[0],a[1],a[5],a[4]],[a[2],a[3],a[7],a[6]],
         [a[1],a[2],a[6],a[5]],[a[0],a[3],a[7],a[4]]];
}
function cylinder(x,y,z,r,h){
 const faces=[],top=[];
 const point=(a,t)=>[x+r*Math.cos(a),y+t,z+r*Math.sin(a)];
 for(let i=0;i<32;i++){
   const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
   faces.push([point(a,0),point(b,0),point(b,h),point(a,h)]);
   top.push(point(a,h));
 }
 return {sides:faces,top};
}
function shade(color,factor){
 const n=parseInt(color.slice(1),16);
 return 'rgb('+[n>>16,(n>>8)&255,n&255].map(v=>Math.min(255,Math.round(v*factor))).join(',')+')';
}
export function mountEquipmentPreview(host,kind){
 if(!host)return ()=>{};
 const plant=kind==='osmosis';
 const canvas=document.createElement('canvas');
 canvas.setAttribute('role','img');
 canvas.setAttribute('aria-label',plant?'Rotatable illustration of a laboratory balance and glassware.':'Rotatable exterior illustration of a synthetic teaching instrument.');
 canvas.style.cssText='display:block;width:100%;height:clamp(280px,43vw,420px);touch-action:none;cursor:grab;border-radius:10px';
 const toolbar=document.createElement('div');
 toolbar.className='toolbar';toolbar.setAttribute('aria-label','Equipment camera');
 toolbar.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:8px';
 const view=document.createElement('div');view.style.cssText='width:100%;min-width:0';
 view.append(canvas,toolbar);host.replaceChildren(view);
 const ctx=canvas.getContext('2d');
 if(!ctx){host.textContent='Use the equipment diagram below.';return ()=>{}}
 let yaw=-.38,pitch=.32,zoom=1,drag=false,lastX=0,lastY=0,raf=0,alive=true;
 for(const [name,action] of [['Rotate left',()=>yaw-=.22],['Rotate right',()=>yaw+=.22],['Zoom in',()=>zoom=Math.min(1.7,zoom+.15)],['Zoom out',()=>zoom=Math.max(.65,zoom-.15)],['Reset view',()=>{yaw=-.38;pitch=.32;zoom=1}]]){
   const button=document.createElement('button');button.type='button';button.className='ghost';button.textContent=name;button.onclick=()=>{action();schedule()};toolbar.append(button);
 }
 function schedule(){if(alive&&!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})}
 function resize(){
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
   canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);schedule();
 }
 function draw(){
   if(!alive)return;
   const {width:w,height:h}=canvas.getBoundingClientRect();
   const bg=ctx.createLinearGradient(0,0,0,h);
   bg.addColorStop(0,'#eaf1f5');bg.addColorStop(1,'#c6d5dd');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
   const project=([x,y,z])=>{
     const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
     const X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp,dist=10-y*sp-Z*cp;
     const scale=Math.min(w*1.55,h*1.85)*zoom/dist;
     return [w/2+X*scale,h*.49-Y*scale,dist];
   };
   const queue=[];let layer=0;
   function poly(vertices,color,alpha=1){
     const points=vertices.map(project);
     queue.push({points,color,alpha,layer,depth:points.reduce((n,p)=>n+p[2],0)/points.length});
   }
   function box(x,y,z,w,h,d,color){
     const factors=[.78,1,.70,1.12,.88,.94];
     cuboid(x,y,z,w,h,d).forEach((f,i)=>poly(f,shade(color,factors[i])));
   }
   function round(x,y,z,r,h,color,alpha=1,cap=true){
     const shape=cylinder(x,y,z,r,h);
     shape.sides.forEach((f,i)=>poly(f,shade(color,.87+.13*Math.cos(i*Math.PI/16)),alpha));
     if(cap)poly(shape.top,color,alpha);
   }
   function label(x,y,z,words,color,size=.14){
     if(Math.cos(yaw)<.15)return;
     const o=project([x,y,z]),right=project([x+1,y,z]),up=project([x,y+1,z]);
     queue.push({layer,depth:o[2]-.025,paint:()=>{
       ctx.save();ctx.transform(right[0]-o[0],right[1]-o[1],o[0]-up[0],o[1]-up[1],o[0],o[1]);
       ctx.fillStyle=color;ctx.font='600 '+size+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(words,0,0);ctx.restore();
     }});
   }
   box(-2.6,-1.25,-1.45,5.2,.2,2.9,'#c5b7a0');
   box(-2.55,-1.43,1.30,5.1,.18,.15,'#536675');layer=1;
   if(plant){
     box(-2.1,-1.05,-.85,1.7,.50,1.45,'#617887');
     box(-2.04,-.55,-.78,1.58,.10,1.29,'#dce4e7');
     round(-1.25,-.45,-.20,.54,.09,'#bcc8cc');
     box(-1.85,-.91,.61,1.22,.25,.035,'#263943');
     label(-1.24,-.79,.652,'BALANCE','#d2e9e0',.14);
     round(.48,-1.05,-.47,.57,1.24,'#a6cdd4',.40,false);
     round(1.84,-1.05,-.26,.48,1.04,'#9bbfc7',.38,false);
     round(.48,-1.05,-.47,.57,.035,'#a6cdd4',.58);
     round(1.84,-1.05,-.26,.48,.035,'#9bbfc7',.58);
     box(-.20,-1.04,.70,.85,.12,.48,'#e4e6dc');
   }else{
     box(-1.48,-1.05,-.90,2.96,2.22,1.85,'#617887');
     box(-1.40,-.97,.96,2.8,2.06,.06,'#dce4e7');
     box(-1.17,.02,1.03,1.65,.70,.04,'#253d49');
     label(-.345,.40,1.08,'TRAINING MODEL','#bdded0',.13);
     label(-.345,.22,1.08,'CNTE-VSL','#d8e8ec',.14);
     box(.71,-.75,1.03,.42,.25,.08,'#728d9a');
     box(-1.05,-.81,1.03,.55,.10,.04,'#839aa5');
     for(let i=0;i<4;i++)box(1.49,-.48+i*.23,-.59,.025,.09,.82,'#455c68');
   }
   queue.sort((a,b)=>a.layer-b.layer||b.depth-a.depth);
   for(const f of queue){
     if(f.paint){f.paint();continue}
     ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
     ctx.closePath();ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.fill();
     if(f.alpha>=.95){ctx.strokeStyle='rgba(24,45,54,.16)';ctx.lineWidth=.6;ctx.stroke()}
     ctx.globalAlpha=1;
   }
   ctx.fillStyle='#183f52';ctx.font='600 13px system-ui';ctx.fillText(plant?'LABORATORY EQUIPMENT':'SYNTHETIC TRAINING INSTRUMENT',12,23);
   ctx.font='12px system-ui';ctx.fillText('Illustrative equipment view',12,43);
   ctx.fillText('Drag to rotate · scroll to zoom',12,h-16);
 }
 canvas.onpointerdown=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'};
 canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-lastX)*.009;pitch=Math.max(.02,Math.min(.7,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;schedule()};
 canvas.onpointerup=canvas.onpointercancel=()=>{drag=false;canvas.style.cursor='grab'};
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.7,zoom-e.deltaY*.001));schedule()},{passive:false});
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(canvas);resize();
 return ()=>{alive=false;cancelAnimationFrame(raf);observer?.disconnect()};
}
