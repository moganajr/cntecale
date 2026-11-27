/** Small deterministic navigation grid for the room's clear aisle and furniture. */
export const ROOM_BOUNDS={minX:-5.8,maxX:5.8,minZ:-2.5,maxZ:4.6};
export const ROOM_OBSTACLES=[{minX:-2.15,maxX:2.15,minZ:-1.95,maxZ:.4},{minX:2.55,maxX:5.45,minZ:.85,maxZ:2.55}];
const blocked=(x,z,obstacles)=>obstacles.some(b=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function clearSegment(a,b,obstacles=ROOM_OBSTACLES){const n=Math.max(1,Math.ceil(distance(a,b)/.08));for(let i=0;i<=n;i++){const t=i/n;if(blocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,obstacles))return false}return true;}
export function planRoomRoute(start,goal,obstacles=ROOM_OBSTACLES,bounds=ROOM_BOUNDS){
 const step=.28,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),nodes=[];
 const desired=[clamp(goal[0],bounds.minX,bounds.maxX),clamp(goal[1],bounds.minZ,bounds.maxZ)];
 for(let x=bounds.minX;x<=bounds.maxX+.001;x+=step)for(let z=bounds.minZ;z<=bounds.maxZ+.001;z+=step)if(!blocked(x,z,obstacles))nodes.push([x,z]);
 const nearest=p=>nodes.reduce((best,n)=>distance(n,p)<distance(best,p)?n:best,nodes[0]);
 const end=blocked(...desired,obstacles)?nearest(desired):desired;
 if(clearSegment(start,end,obstacles))return [end];
 const startNode=nodes.reduce((best,n)=>clearSegment(start,n,obstacles)&&(!best||distance(n,start)<distance(best,start))?n:best,null);
 const endNode=nodes.reduce((best,n)=>clearSegment(end,n,obstacles)&&(!best||distance(n,end)<distance(best,end))?n:best,null);
 if(!startNode||!endNode)return [];
 const key=n=>n.join(','),open=[startNode],cost=new Map([[key(startNode),0]]),parent=new Map(),closed=new Set();
 while(open.length){open.sort((a,b)=>cost.get(key(a))+distance(a,endNode)-cost.get(key(b))-distance(b,endNode));const n=open.shift(),k=key(n);if(k===key(endNode)){const route=[end];let curr=n;while(curr){route.unshift(curr);curr=parent.get(key(curr))}const simplified=[];let anchor=start;for(let i=0;i<route.length;){let j=route.length-1;while(j>i&&!clearSegment(anchor,route[j],obstacles))j--;simplified.push(route[j]);anchor=route[j];i=j+1}return simplified;}
   if(closed.has(k))continue;closed.add(k);for(const next of nodes){const d=distance(n,next);if(d===0||d>step*1.45||closed.has(key(next))||!clearSegment(n,next,obstacles))continue;const c=cost.get(k)+d;if(c<(cost.get(key(next))??Infinity)){cost.set(key(next),c);parent.set(key(next),n);open.push(next);}}
 }
 return [];
}
