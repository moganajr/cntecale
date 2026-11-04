/** Rotatable teaching model of a compound light microscope: geometry only. */
const faces=(x,y,z,w,h,d)=>{const a=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];return [[a[0],a[1],a[2],a[3]],[a[4],a[5],a[6],a[7]],[a[0],a[1],a[5],a[4]],[a[2],a[3],a[7],a[6]],[a[1],a[2],a[6],a[5]],[a[0],a[3],a[7],a[4]]]};
export function mountMicroscopeScene(host,{getState}){
 if(!host)return ()=>{};
 const c=document.createElement('canvas');c.style.cssText='width:100%;height:300px;display:block;touch-action:none;cursor:grab';c.setAttribute('role','img');c.setAttribute('aria-label','Rotatable three-dimensional illustration of a compound microscope with ocular tube, objective turret, stage, knobs, and base.');
 host.replaceChildren(c);const ctx=c.getContext('2d');if(!ctx)return ()=>{};
 let angle=-.55,pitch=.25,zoom=1.12,drag=false,lastX=0,lastY=0,frame=0,alive=true;
 function resize(){const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(300,c.getBoundingClientRect().width);c.width=Math.round(w*dpr);c.height=Math.round(300*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function project([x,y,z],w,h){const cy=Math.cos(angle),sy=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);const X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp,D=10-(y*sp+Z*cp);return [w/2+X*690*zoom/D,h*.67-Y*690*zoom/D,D]}
 function paint(){if(!alive)return;const w=c.getBoundingClientRect().width||520,h=300,p=getState();ctx.clearRect(0,0,w,h);ctx.fillStyle='#ebf6f7';ctx.fillRect(0,0,w,h);
 let polygons=[];const add=(x,y,z,a,b,d,color)=>{for(const f of faces(x,y,z,a,b,d)){const points=f.map(q=>project(q,w,h));polygons.push({points,color,depth:points.reduce((n,v)=>n+v[2],0)/points.length})}};
 add(-1.55,-1.3,-1.1,3.1,.26,2.2,'#456d81');add(-.15,-1.05,-.24,.45,2.4,.48,'#dce7e9');add(-.15,1.18,-.2,.43,.87,.43,'#2a5269');
 add(-.65,.94,-.45,.95,.22,.65,'#7399aa');add(-.48,.30,-.23,.28,.68,.28,'#e4eff1');
 add(-1.12,-.34,-.83,2.25,.18,1.65,'#648c9e');add(-.73,-.16,-.44,1.35,.055,.88,p.prepared?'#b9dbc9':'#e9dfc7');
 add(.76,.38,.15,.48,.20,.48,'#2b566a');add(.91,.23,.27,.28,.20,.30,'#83b5c3');
 add(.76,-.35,.20,.37,.21,.35,'#59849b');add(-.16,-1.0,-.09,.55,.19,.49,p.lightOn?'#8bdbb2':'#a5afb5');
 polygons.sort((a,b)=>b.depth-a.depth);
 for(const f of polygons){ctx.beginPath();f.points.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='rgba(28,70,88,.28)';ctx.stroke();}
 ctx.fillStyle='#1a5367';ctx.font='600 13px system-ui';ctx.fillText('COMPOUND LIGHT MICROSCOPE',16,24);ctx.font='12px system-ui';ctx.fillText((p.eyepiece*p.objective)+'×  ·  '+(p.lightOn?'Illuminated':'Light off'),16,44);ctx.fillText('Drag to rotate · scroll to zoom',16,h-16);frame=requestAnimationFrame(paint)}
 const down=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;c.setPointerCapture?.(e.pointerId);c.style.cursor='grabbing'};
 const move=e=>{if(!drag)return;angle+=(e.clientX-lastX)*.008;pitch=Math.max(-.5,Math.min(.7,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY};
 const up=()=>{drag=false;c.style.cursor='grab'};const wheel=e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom-e.deltaY*.001))};
 c.addEventListener('pointerdown',down);c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);c.addEventListener('wheel',wheel,{passive:false});
 resize();const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(c);paint();
 return ()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect()};
}
