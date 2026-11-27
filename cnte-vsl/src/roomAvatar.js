/** Procedural articulated demonstrator shared by spatial laboratory rooms. */
export function createDemonstrator(T,scene){
 const root=new T.Group();scene.add(root);
 const m=(color,roughness=.74)=>new T.MeshStandardMaterial({color,roughness});
 const coat=m('#f2f3ec'),trim=m('#d4e0dd'),skin=m('#a96f4d'),hair=m('#29292c'),pants=m('#293e53'),sole=m('#182a37'),shirt=m('#267b82'),lens=new T.MeshStandardMaterial({color:'#83b8d4',transparent:true,opacity:.45,roughness:.1,depthWrite:false});
 function mesh(parent,g,material,x=0,y=0,z=0){const a=new T.Mesh(g,material);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a}
 const sphere=(p,r,material,x,y,z,sx=1,sy=1,sz=1)=>{const o=mesh(p,new T.SphereGeometry(r,24,16),material,x,y,z);o.scale.set(sx,sy,sz);return o};
 const capsule=(p,r,length,material,x,y,z)=>mesh(p,new T.CapsuleGeometry(r,length,6,14),material,x,y,z);
 const torso=new T.Group();root.add(torso);torso.position.y=.96;
 sphere(torso,.33,coat,0,.25,0,.77,1.13,.47);
 sphere(torso,.26,coat,0,.05,0,.88,1.12,.58);
 mesh(torso,new T.BoxGeometry(.055,.54,.02),shirt,0,.28,.159);
 const leftLap=mesh(torso,new T.BoxGeometry(.088,.27,.026),trim,-.095,.46,.16);leftLap.rotation.z=.36;
 const rightLap=mesh(torso,new T.BoxGeometry(.088,.27,.026),trim,.095,.46,.16);rightLap.rotation.z=-.36;
 mesh(torso,new T.BoxGeometry(.13,.115,.022),trim,.13,.24,.162);
 for(let y=.16;y<=.34;y+=.085)sphere(torso,.012,sole,.022,y,.176);
 capsule(root,.085,.06,skin,0,1.46,0);
 const head=new T.Group();root.add(head);head.position.set(0,1.65,0);
 sphere(head,.18,skin,0,.01,0,.88,1.12,.86);sphere(head,.171,hair,0,.085,-.036,.96,.79,.92);
 for(const side of [-1,1]){sphere(head,.045,skin,side*.153,.006,0,.62,1,.79);sphere(head,.019,sole,side*.064,.035,.143,1,.55,.45);sphere(head,.033,lens,side*.064,.035,.15,1.62,1.06,.38)}
 sphere(head,.035,skin,0,-.015,.15,.55,1,.85);mesh(head,new T.BoxGeometry(.05,.008,.012),sole,0,-.071,.139);
 mesh(head,new T.BoxGeometry(.044,.012,.02),sole,0,.035,.164);
 const legs=[],arms=[];
 for(const side of [-1,1]){const hip=new T.Group();root.add(hip);hip.position.set(side*.133,.89,0);capsule(hip,.091,.25,pants,0,-.175,0);const knee=new T.Group();hip.add(knee);knee.position.y=-.36;capsule(knee,.078,.25,pants,0,-.155,0);sphere(knee,.111,sole,0,-.40,.063,.85,.51,1.44);legs.push({hip,knee});
 const shoulder=new T.Group();torso.add(shoulder);shoulder.position.set(side*.273,.44,0);sphere(shoulder,.099,coat);capsule(shoulder,.076,.19,coat,0,-.142,0);const elbow=new T.Group();shoulder.add(elbow);elbow.position.y=-.30;capsule(elbow,.063,.165,coat,0,-.117,0);sphere(elbow,.071,skin,0,-.245,0,.74,1,.77);const grip=new T.Group();elbow.add(grip);grip.position.set(0,-.25,.075);arms.push({shoulder,elbow,grip});}
 const hand=new T.Group();root.add(hand);
 function pose(time,{walking=false,holding=false,gesture='idle',progress=0}={}){
   const swing=walking?Math.sin(time*10):0;torso.position.y=.96+(walking?Math.abs(swing)*.025:0);head.rotation.z=walking?swing*.025:0;
   for(let i=0;i<2;i++){const {hip,knee}=legs[i],sign=i?1:-1;hip.rotation.x=swing*.46*sign;knee.rotation.x=Math.max(0,-swing*sign)*.40;
     const {shoulder,elbow}=arms[i];shoulder.rotation.x=walking?swing*-.32*sign:0;shoulder.rotation.z=sign*.10;elbow.rotation.x=-.12;}
   const right=arms[1];if(holding){right.shoulder.rotation.x=-.66;right.elbow.rotation.x=-.94;right.shoulder.rotation.z=.04;}
   if(gesture==='reach'){const a=Math.sin(Math.PI*Math.max(0,Math.min(1,progress)));right.shoulder.rotation.x=-1.32*a;right.elbow.rotation.x=-.18-.3*a;right.shoulder.rotation.z=.02;}
   if(gesture==='pour'){right.shoulder.rotation.x=-2.06;right.elbow.rotation.x=-.50;right.shoulder.rotation.z=.15;}
   if(gesture==='fill'){right.shoulder.rotation.x=-1.00;right.elbow.rotation.x=-.65;right.shoulder.rotation.z=.12;}
   root.updateMatrixWorld(true);const world=right.grip.getWorldPosition(new T.Vector3());hand.position.copy(root.worldToLocal(world));
 }
 pose(0);return {root,hand,pose};
}
