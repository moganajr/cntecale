import assert from 'node:assert/strict';
import { adoptImageWhenIdle } from '../cloudflare/image-rollover.js';

function fake({running=true,image='old',rooms=0,healthy=true,inspectFails=false}={}) {
  let restarts=0, checks=0;
  const container={running,images:{base:'new'},
    inspect:async()=>{if(inspectFails)throw new Error('inspect unavailable');return {image};},
    getTcpPort:()=>({fetch:async()=>{checks++;return new Response(JSON.stringify({status:'ok',rooms}),{status:healthy?200:503});}}),
    destroy:async()=>{restarts++;container.running=false;}
  };
  return {container,counts:()=>[restarts,checks]};
}
for(const [options,result,expected] of [
  [{running:false},'stopped',[0,0]],
  [{image:'new'},'current-or-unknown',[0,0]],
  [{image:''},'current-or-unknown',[0,0]],
  [{rooms:2},'deferred',[0,1]],
  [{healthy:false},'deferred',[0,1]],
  [{inspectFails:true},'deferred',[0,0]],
  [{rooms:0},'restarted',[1,1]]
]) {const f=fake(options);assert.equal(await adoptImageWhenIdle(f.container,8080),result);assert.deepEqual(f.counts(),expected);}
const one=fake({rooms:1});assert.equal(await adoptImageWhenIdle(one.container,8080),'deferred');assert.deepEqual(one.counts(),[0,1]);
console.log('16 development container image-rollover assertions passed.');
