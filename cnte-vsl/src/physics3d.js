/**
 * Rotatable, self-contained 3D circuit bench. The accessible circuit controls
 * remain in ordinary form inputs. Educational geometry, not EM field physics.
 */
const P=Math.PI;
function cube(x,y,z,w,h,d){const a=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];return [[a[0],a[1],a[2],a[3]],[a[4],a[5],a[6],a[7]],[a[0],a[1],a[5],a[4]],[a[2],a[3],a[7],a[6]],[a[1],a[2],a[6],a[5]],[a[0],a[3],a[7],a[4]]]}
export function mountPhysicsScene(host,{getState}){
 if(!host)return ()=>{};
 const canvas=document.createElement('canvas');
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Rotatable three-dimensional DC power supply, resistors, ammeter and voltmeter workbench. Use the accessible form controls to wire and measure the circuit.');
 canvas.style.cssText='display:block;width:100%;height:290px;touch-action:none;cursor:grab;border-radius:10px';
 host.replaceChildren(canvas);const ctx=canvas.getContext('2d');if(!ctx)return ()=>{};
 let yaw=-.5,pitch=.25,zoom=1.1,drag=false,lx=0,ly=0,raf=0,alive=true;
 const resize=()=>{const dpr=Math.min(2,window.devicePixelRatio||1);const width=Math.max(320,canvas.getBoundingClientRect().width);canvas.width=Math.round(width*dpr);canvas.height=Math.round(290*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
 function project(pt,w,h){let [x,y,z]=pt,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp;Z=y*sp+Z*cp;let dist=10-Z;return [w/2+X*zoom*620/dist,h*.6-Y*zoom*620/dist,dist]}
 function frame(){if(!alive)return;const w=canvas.getBoundingClientRect().width||520,h=290,p=getState();ctx.clearRect(0,0,w,h);ctx.fillStyle='#edf6f8';ctx.fillRect(0,0,w,h);let faces=[];
 function add(fs,color){for(const vertices of fs){let poly=vertices.map(q=>project(q,w,h));faces.push({poly,color,z:poly.reduce((a,v)=>a+v[2],0)/poly.length})}}
 add(cube(-2.5,-1.25,-1.4,5,.17,2.8),'#b3cbd1');
 add(cube(-2.05,-1.05,-.95,1.35,.95,.85),'#23617a');
 add(cube(-.32,-1.05,-1.05,.72,.38,.47),'#e8b663');
 add(cube(.78,-1.05,-1.05,.72,.38,.47),'#e8b663');
 add(cube(-.28,-1.05,.65,.74,.74,.5),p.ammeter==='series'?'#64b9a2':'#d1b48b');
 add(cube(1.20,-1.05,.65,.74,.74,.5),p.voltmeter==='parallel'?'#64b9a2':'#d1b48b');
 // Rectangular cable segments, with separate branches for parallel wiring.
 const wire=p.fault==='short'?'#bf4e44':p.isolated?'#839baa':p.switchClosed?'#15927f':'#d2a950';
 const wireBox=(x,y,z,w,h,d)=>add(cube(x,y,z,w,h,d),wire);
 wireBox(-.75,-.85,-.79,.54,.055,.06);wireBox(.4,-.85,-.79,.38,.055,.06);
 wireBox(1.5,-.87,-.79,.08,.06,1.3);wireBox(-1.4,-.87,-.79,.06,.06,1.8);
 if(p.topology==='parallel'){wireBox(-.38,-.81,.16,1.5,.06,.05);wireBox(-.38,-.81,-.77,.08,.06,.95);wireBox(1.08,-.81,-.77,.08,.06,.95)}
 faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx.beginPath();f.poly.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='rgba(34,73,87,.22)';ctx.lineWidth=.7;ctx.stroke()}
 ctx.fillStyle='#1c4e60';ctx.font='600 13px system-ui';ctx.fillText('DC CIRCUIT WORKBENCH',16,23);ctx.font='12px system-ui';ctx.fillText(p.topology.toUpperCase()+' · '+p.volts+' V · '+(p.isolated?'isolated':p.switchClosed?'energized':'switch open'),16,43);ctx.fillText('Drag to rotate · scroll to zoom',16,h-16);
 raf=requestAnimationFrame(frame);
 }
 function down(e){drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'}
 function move(e){if(!drag)return;yaw+=(e.clientX-lx)*.009;pitch=Math.max(-.5,Math.min(.7,pitch+(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY}
 function up(){drag=false;canvas.style.cursor='grab'}
 function wheel(e){e.preventDefault();zoom=Math.max(.65,Math.min(1.75,zoom-e.deltaY*.001))}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
 resize();const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(canvas);frame();
 return ()=>{alive=false;cancelAnimationFrame(raf);observer?.disconnect()};
}
