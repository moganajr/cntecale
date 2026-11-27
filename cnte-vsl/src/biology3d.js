/** Rotatable teaching model of a compound light microscope: geometry only. */
const faces=(x,y,z,w,h,d)=>{const a=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];return [[a[0],a[1],a[2],a[3]],[a[4],a[5],a[6],a[7]],[a[0],a[1],a[5],a[4]],[a[2],a[3],a[7],a[6]],[a[1],a[2],a[6],a[5]],[a[0],a[3],a[7],a[4]]]};
function shade(color,factor){const value=parseInt(color.slice(1),16);return 'rgb('+[value>>16,(value>>8)&255,value&255].map(v=>Math.min(255,Math.round(v*factor))).join(',')+')'}
function roundCase(x,y,z,radius,depth,axis='y'){
 const point=(a,t)=>axis==='y'?[x+radius*Math.cos(a),y+t,z+radius*Math.sin(a)]:[x+t,y+radius*Math.cos(a),z+radius*Math.sin(a)];
 const sides=[],front=[],back=[];
 for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;front.push(point(a,depth));back.push(point(a,0));sides.push([point(a,0),point(b,0),point(b,depth),point(a,depth)])}
 return [...sides,front,back];
}
export function mountMicroscopeScene(host,{getState}){
 if(!host)return ()=>{};
 const c=document.createElement('canvas');c.style.cssText='width:100%;height:clamp(280px,43vw,420px);display:block;touch-action:none;cursor:grab;border-radius:10px';c.setAttribute('role','img');c.setAttribute('aria-label','Rotatable three-dimensional illustration of a compound microscope with ocular tube, objective turret, stage, knobs, and base.');
 const scene=document.createElement('div');scene.style.cssText='width:100%;min-width:0';
 const controls=document.createElement('div');controls.className='toolbar';controls.setAttribute('aria-label','Workbench camera');controls.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:8px';
 scene.append(c,controls);host.replaceChildren(scene);const ctx=c.getContext('2d');if(!ctx)return ()=>{};
 let angle=-.55,pitch=.25,zoom=1,drag=false,lastX=0,lastY=0,frame=0,alive=true;
 for(const [label,action] of [['Rotate left',()=>angle-=.22],['Rotate right',()=>angle+=.22],['Zoom in',()=>zoom=Math.min(1.8,zoom+.15)],['Zoom out',()=>zoom=Math.max(.65,zoom-.15)],['Reset view',()=>{angle=-.55;pitch=.25;zoom=1}]]){
   const button=document.createElement('button');button.type='button';button.className='ghost';button.textContent=label;button.onclick=()=>{action();scheduleFrame()};controls.append(button);
 }
 function scheduleFrame(){if(alive&&!frame)frame=requestAnimationFrame(()=>{frame=0;paint()})}
 function resize(){const dpr=Math.min(2,window.devicePixelRatio||1),rect=c.getBoundingClientRect();c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scheduleFrame()}
 function project([x,y,z],w,h){const cy=Math.cos(angle),sy=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);const X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp,D=10-(y*sp+Z*cp),scale=Math.min(w*1.55,h*1.85);return [w/2+X*scale*zoom/D,h*.53-Y*scale*zoom/D,D]}
 function paint(){if(!alive)return;const rect=c.getBoundingClientRect(),w=rect.width||520,h=rect.height||300,p=getState();ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#eaf1f5');bg.addColorStop(1,'#c6d5dd');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 let polygons=[],layer=0;const add=(x,y,z,a,b,d,color)=>{const light=[.78,1,.7,1.10,.88,.94];faces(x,y,z,a,b,d).forEach((f,i)=>{const points=f.map(q=>project(q,w,h));polygons.push({points,color:shade(color,light[i]),layer,depth:points.reduce((n,v)=>n+v[2],0)/points.length})})};
 const addRound=(x,y,z,r,d,color,axis)=>roundCase(x,y,z,r,d,axis).forEach((f,i)=>{const points=f.map(q=>project(q,w,h));const lighting=i>=24?1:.84+.16*Math.cos(i*Math.PI/12);polygons.push({points,color:shade(color,lighting),layer,depth:points.reduce((n,v)=>n+v[2],0)/points.length})});
 add(-2.25,-1.54,-1.45,4.50,.14,2.90,'#c5b7a0');
 layer=1;
 add(-1.55,-1.3,-1.1,3.1,.26,2.2,'#456d81');add(-1.48,-1.04,-1.03,2.96,.08,2.06,'#dbe3e6');
 add(.24,-.96,-.94,.46,2.05,.44,'#dce7e9');add(-.20,1.09,-.94,.90,.25,1.10,'#dce7e9');add(-.15,1.18,-.2,.43,.87,.43,'#2a5269');
 addRound(.065,1.98,.015,.28,.12,'#263743');
 add(-.65,.94,-.45,.95,.22,.65,'#7399aa');add(-.48,.30,-.23,.28,.68,.28,'#e4eff1');
 add(-1.12,-.34,-.83,2.25,.18,1.65,'#648c9e');add(-.73,-.16,-.44,1.35,.055,.88,p.prepared?'#b9dbc9':'#e9dfc7');
 addRound(.70,.50,-.70,.32,.18,'#2b566a','x');addRound(.88,.50,-.70,.20,.10,'#83b5c3','x');
 addRound(.70,-.25,-.64,.22,.16,'#59849b','x');add(-.16,-1.0,-.09,.55,.19,.49,p.lightOn?'#8bdbb2':'#a5afb5');
 polygons.sort((a,b)=>a.layer-b.layer||b.depth-a.depth);
 for(const f of polygons){ctx.beginPath();f.points.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='rgba(28,70,88,.28)';ctx.stroke();}
 ctx.fillStyle='#1a5367';ctx.font='600 13px system-ui';ctx.fillText('COMPOUND LIGHT MICROSCOPE',12,23);ctx.font='12px system-ui';ctx.fillText((p.eyepiece*p.objective)+'×  ·  '+(p.lightOn?'Illuminated':'Light off'),12,43);ctx.fillText('Drag to rotate · scroll to zoom',12,h-16)}
 const down=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;c.setPointerCapture?.(e.pointerId);c.style.cursor='grabbing'};
 const move=e=>{if(!drag)return;angle+=(e.clientX-lastX)*.008;pitch=Math.max(.02,Math.min(.7,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;scheduleFrame()};
 const up=()=>{drag=false;c.style.cursor='grab'};const wheel=e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom-e.deltaY*.001));scheduleFrame()};
 c.addEventListener('pointerdown',down);c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);c.addEventListener('wheel',wheel,{passive:false});
 resize();const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(c);
 return ()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect()};
}
