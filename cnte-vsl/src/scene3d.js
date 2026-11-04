/**
 * CNTE-VSL procedural 3D chemistry workbench.
 * Self-contained CPU-rendered triangle meshes, so 3D is usable without a CDN.
 * The accessible controls outside the canvas remain the canonical interface.
 */
const PI=Math.PI;
function rings(levels,segments=24){const faces=[];for(let j=0;j<levels.length-1;j++){let [y0,r0]=levels[j], [y1,r1]=levels[j+1];for(let i=0;i<segments;i++){const a=2*PI*i/segments,b=2*PI*(i+1)/segments;faces.push([[r0*Math.cos(a),y0,r0*Math.sin(a)],[r0*Math.cos(b),y0,r0*Math.sin(b)],[r1*Math.cos(b),y1,r1*Math.sin(b)],[r1*Math.cos(a),y1,r1*Math.sin(a)]]);}}return faces}
function boxFaces(x,y,z,w,h,d){let v=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];return [[v[0],v[1],v[2],v[3]],[v[4],v[5],v[6],v[7]],[v[0],v[1],v[5],v[4]],[v[2],v[3],v[7],v[6]],[v[1],v[2],v[6],v[5]],[v[0],v[3],v[7],v[4]]]}
function transform(faces,ox,oy,oz){return faces.map(face=>face.map(([x,y,z])=>[x+ox,y+oy,z+oz]))}
export function mountTitrationScene(host,{getState,onDispense,onIndicator}){
  if(!host)return ()=>{};
  const canvas=document.createElement('canvas');
  canvas.setAttribute('aria-label','Rotatable three-dimensional burette, conical flask and reagent workbench. Use the keyboard-accessible buttons for precise titration.');
  canvas.setAttribute('role','img');
  canvas.style.cssText='width:100%;height:330px;display:block;touch-action:none;cursor:grab;border-radius:12px';
  host.replaceChildren(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return ()=>{};
  let yaw=-.42,pitch=.17,zoom=1.05,drag=false,lastX=0,lastY=0,frame=0,alive=true;
  const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);const rect=canvas.getBoundingClientRect();canvas.width=Math.round(Math.max(rect.width,300)*dpr);canvas.height=Math.round(330*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
  function project([x,y,z],w,h){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);let X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cp-Z*sp;Z=y*sp+Z*cp;const distance=9.5-Z;return [w/2+X*zoom*660/distance,h*.58-Y*zoom*660/distance,distance]}
  function render(){if(!alive)return;const rect=canvas.getBoundingClientRect(),w=rect.width||520,h=330;ctx.clearRect(0,0,w,h);
    let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#f1faff');sky.addColorStop(1,'#dfeff2');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    const state=getState(),volume=state.volume||0,indicator=!!state.indicator,endpoint=state.endpoint||25,remaining=Math.max(0,1-volume/50);
    const mesh=[];
    function add(faces,color,alpha=1){for(const f of faces){const v=f.map(pt=>project(pt,w,h));mesh.push({v,color,alpha,depth:v.reduce((a,p)=>a+p[2],0)/v.length});}}
    add(boxFaces(-2.55,-2.35,-1.1,5.1,.14,2.25),'#bdced2');
    add(boxFaces(-.18,-2.20,-.12,.22,4.12,.22),'#466579');
    add(boxFaces(-.20,1.42,-.06,1.05,.10,.18),'#516c80');
    add(transform(rings([[-.30,.105],[1.9,.105]]),.38,0,0),'#8cb5c6',.40);
    add(transform(rings([[1.9,.118],[1.95,.118]]),.38,0,0),'#426777',.8);
    // Titrant volume falls as the learner dispenses from the burette.
    add(transform(rings([[-.26,.081],[-.26+remaining*2.05,.081]]),.38,0,0),'#34a3be',.78);
    add(transform(rings([[-.72,.045],[-.29,.045]]),.38,0,0),'#638e9d');
    add(boxFaces(.09,-.53,-.05,.56,.10,.10),'#2f7088');
    // Conical flask and its contents are separate 3D meshes.
    add(transform(rings([[-2.10,.67],[-1.97,.69],[-.97,.22],[-.66,.22]]),.4,0,0),'#b5dce2',.28);
    add(transform(rings([[-2.08,.64],[-1.99,.65],[-1.80,.56]]),.4,0,0),indicator?(volume>endpoint+.2?'#da6b9c':volume>=endpoint-.2?'#f3a6ce':'#ebdbe6'):'#71cbd9',.74);
    add(transform(rings([[-.66,.23],[-.62,.23]]),.4,0,0),'#4d7c90',.70);
    add(boxFaces(-1.85,-2.12,.6,.85,1.10,.85),'#79adae',.65);
    mesh.sort((a,b)=>b.depth-a.depth);
    for(let i=0;i<mesh.length;i++){const f=mesh[i];ctx.beginPath();f.v.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='rgba(42,83,96,.17)';ctx.lineWidth=.6;ctx.stroke();}
    ctx.globalAlpha=1;ctx.font='600 13px system-ui';ctx.fillStyle='#1b5261';ctx.fillText('BURETTE  •  0.100 mol/L NaOH',16,26);ctx.font='12px system-ui';ctx.fillText('Delivered: '+volume.toFixed(1)+' mL',16,46);ctx.fillText('Expected equivalence: '+endpoint.toFixed(1)+' mL',16,64);
    ctx.font='12px system-ui';ctx.fillStyle='#527081';ctx.fillText('Drag to rotate · scroll to zoom',16,h-19);
    // Live pH can be inspected separately from the equipment geometry.
    frame=requestAnimationFrame(render);
  }
  const down=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'};
  const move=e=>{if(!drag)return; yaw+=(e.clientX-lastX)*.009;pitch=Math.max(-.42,Math.min(.6,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY};
  const up=()=>{drag=false;canvas.style.cursor='grab'};
  const wheel=e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.7,zoom-e.deltaY*.001))};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
  resize();const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(canvas);render();
  return ()=>{alive=false;cancelAnimationFrame(frame);ro?.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('wheel',wheel)};
}
