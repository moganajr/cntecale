/**
 * Rotatable, self-contained 3D circuit bench. The accessible circuit controls
 * remain in ordinary form inputs. Educational geometry, not EM field physics.
 */
function shade(color,factor){const value=parseInt(color.slice(1),16);return 'rgb('+[value>>16,(value>>8)&255,value&255].map(v=>Math.min(255,Math.round(v*factor))).join(',')+')'}
function cube(x,y,z,w,h,d){const a=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];return [[a[0],a[1],a[2],a[3]],[a[4],a[5],a[6],a[7]],[a[0],a[1],a[5],a[4]],[a[2],a[3],a[7],a[6]],[a[1],a[2],a[6],a[5]],[a[0],a[3],a[7],a[4]]]}
export function mountPhysicsScene(host,{getState}){
 if(!host)return ()=>{};
 const canvas=document.createElement('canvas');
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Rotatable three-dimensional DC power supply, resistors, ammeter and voltmeter workbench. Use the accessible form controls to wire and measure the circuit.');
 canvas.style.cssText='display:block;width:100%;height:clamp(260px,43vw,420px);touch-action:none;cursor:grab;border-radius:10px';
 const scene=document.createElement('div');scene.style.cssText='width:100%;min-width:0';
 const controls=document.createElement('div');controls.className='toolbar';controls.setAttribute('aria-label','Workbench camera');controls.style.cssText='justify-content:center;margin-top:8px;gap:6px';
 scene.append(canvas,controls);host.replaceChildren(scene);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.replaceWith(document.createTextNode('Use the circuit schematic and controls below.'));return ()=>{}}
 let yaw=-.38,pitch=.38,zoom=1,drag=false,lx=0,ly=0,raf=0,alive=true;
 for(const [label,action] of [['Rotate left',()=>yaw-=.22],['Rotate right',()=>yaw+=.22],['Zoom in',()=>zoom=Math.min(1.75,zoom+.15)],['Zoom out',()=>zoom=Math.max(.65,zoom-.15)],['Reset view',()=>{yaw=-.38;pitch=.38;zoom=1}]]){
   const button=document.createElement('button');button.type='button';button.className='ghost';button.textContent=label;button.onclick=()=>{action();scheduleFrame()};controls.append(button);
 }
 const resize=()=>{const dpr=Math.min(2,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scheduleFrame()};
 function scheduleFrame(){if(alive&&!raf)raf=requestAnimationFrame(()=>{raf=0;frame()})}
 function project(pt,w,h){let [x,y,z]=pt,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp;Z=y*sp+Z*cp;let dist=10-Z;const scale=Math.min(w*1.45,h*1.95);return [w/2+X*zoom*scale/dist,h*.45-Y*zoom*scale/dist,dist]}
 function frame(){if(!alive)return;const rect=canvas.getBoundingClientRect(),w=rect.width||520,h=rect.height||290,p=getState();ctx.clearRect(0,0,w,h);const background=ctx.createLinearGradient(0,0,0,h);background.addColorStop(0,'#e4edf2');background.addColorStop(1,'#becdd5');ctx.fillStyle=background;ctx.fillRect(0,0,w,h);let faces=[];
 let layer=0;
 function add(fs,color){const light=[.78,1,.70,1.15,.88,.94];fs.forEach((vertices,i)=>{let poly=vertices.map(q=>project(q,w,h));faces.push({poly,color:shade(color,light[i]),layer,z:poly.reduce((a,v)=>a+v[2],0)/poly.length})})}
 function caption(x,y,z,text,color,size=.13){if(Math.cos(yaw)<.16)return;const o=project([x,y,z],w,h),r=project([x+1,y,z],w,h),u=project([x,y+1,z],w,h);faces.push({layer,z:o[2]-.025,paint:()=>{ctx.save();ctx.transform(r[0]-o[0],r[1]-o[1],o[0]-u[0],o[1]-u[1],o[0],o[1]);ctx.fillStyle=color;ctx.font='600 '+size+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,0,0);ctx.restore()}})}
 // Bench top, steel frame and legs.
 add(cube(-2.75,-1.25,-1.55,5.5,.20,3.1),'#c5b7a0');
 add(cube(-2.72,-1.44,1.42,5.44,.19,.13),'#536675');
 for(const x of [-2.58,2.41])for(const z of [-1.38,1.35])add(cube(x,-2.05,z,.17,.8,.17),'#61717e');
 layer=1;
 // DC supply: enclosure, faceplate, display, knobs and colored terminals.
 add(cube(-2.35,-1.05,-1.20,1.55,1.15,1.05),'#536d7b');
 add(cube(-2.29,-.99,-.14,1.43,1.03,.055),'#dbe4e7');
 add(cube(-2.19,-.46,-.08,1.23,.39,.035),'#1d3238');
 caption(-1.575,-.265,-.039,p.volts+' V','#b7ebc9',.23);
 caption(-1.575,-.56,-.039,'DC POWER SUPPLY','#243640',.10);
 for(const [x,color] of [[-2.10,'#263743'],[-1.73,'#263743'],[-1.21,'#ac4545'],[-.98,'#263743']])add(cube(x,-.87,-.08,.14,.14,.07),color);
 const resistor=(x,label,value)=>{
   add(cube(x,-1.05,-1.22,.96,.17,.76),'#385a47');
   add(cube(x+.12,-.88,-1.08,.72,.24,.43),'#c7a777');
   add(cube(x+.02,-.98,-.70,.14,.11,.14),'#b4bbc0');add(cube(x+.80,-.98,-.70,.14,.11,.14),'#b4bbc0');
   caption(x+.48,-.76,-.64,label+(value==null?'':' '+value+' Ω'),'#342c24',.11);
 };
 resistor(-.32,'R1',p.r1);resistor(.83,'R2',p.r2);
 const meter=(x,title,connected)=>{
   add(cube(x,-1.05,.43,.96,.88,.72),'#d2a94e');
   add(cube(x+.09,-.97,1.16,.78,.71,.04),'#344752');
   add(cube(x+.16,-.53,1.21,.64,.22,.025),'#9dc2aa');
   caption(x+.48,-.42,1.24,connected?'SET':'—','#183a28',.13);
   caption(x+.48,-.64,1.24,title,'#edf3f5',.10);
   add(cube(x+.38,-.81,1.21,.20,.15,.06),'#172a32');
   for(const [offset,color] of [[.17,'#ae4943'],[.69,'#202e32']])add(cube(x+offset,-.93,1.21,.10,.10,.055),color);
 };
 meter(-.40,'AMMETER',p.ammeter==='series');meter(1.10,'VOLTMETER',p.voltmeter==='parallel');
 // Rectangular cable segments, with separate branches for parallel wiring.
 const wire=p.fault==='short'?'#bf4e44':p.isolated?'#839baa':p.switchClosed?'#15927f':'#d2a950';
 const wireBox=(x,y,z,w,h,d)=>add(cube(x,y,z,w,h,d),wire);
 wireBox(-.75,-.85,-.79,.54,.055,.06);wireBox(.4,-.85,-.79,.38,.055,.06);
 wireBox(1.5,-.87,-.79,.08,.06,1.3);wireBox(-1.4,-.87,-.79,.06,.06,1.8);
 if(p.topology==='parallel'){wireBox(-.38,-.81,.16,1.5,.06,.05);wireBox(-.38,-.81,-.77,.08,.06,.95);wireBox(1.08,-.81,-.77,.08,.06,.95)}
 faces.sort((a,b)=>a.layer-b.layer||b.z-a.z);for(const f of faces){if(f.paint){f.paint();continue}ctx.beginPath();f.poly.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='rgba(34,73,87,.18)';ctx.lineWidth=.6;ctx.stroke()}
 ctx.fillStyle='#1c4e60';ctx.font='600 13px system-ui';ctx.fillText('DC CIRCUIT WORKBENCH',16,23);ctx.font='12px system-ui';ctx.fillText(p.topology.toUpperCase()+' · '+p.volts+' V · '+(p.isolated?'isolated':p.switchClosed?'energized':'switch open'),16,43);ctx.fillText('Drag to rotate · scroll to zoom',16,h-16);
 }
 function down(e){drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'}
 function move(e){if(!drag)return;yaw+=(e.clientX-lx)*.009;pitch=Math.max(.08,Math.min(.7,pitch+(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY;scheduleFrame()}
 function up(){drag=false;canvas.style.cursor='grab'}
 function wheel(e){e.preventDefault();zoom=Math.max(.65,Math.min(1.75,zoom-e.deltaY*.001));scheduleFrame()}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
 resize();const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(canvas);
 return ()=>{alive=false;cancelAnimationFrame(raf);observer?.disconnect()};
}
