import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
import {WebSocket} from 'ws';
const port=20000+Math.floor(Math.random()*20000),base='http://127.0.0.1:'+port,preview='local-integration-1234567890';
const child=spawn(process.execPath,['live-server/server.js'],{cwd:new URL('..',import.meta.url).pathname,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',LIVE_PREVIEW_KEY:preview},stdio:'ignore'}),sockets=[];
const api=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','X-CNTE-Preview-Key':preview},body:JSON.stringify(body)});return [r.status,await r.json()]};
function next(ws,predicate){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.off('message',fn);reject(Error('Snapshot timeout'))},6000);function fn(raw){const d=JSON.parse(raw);if(predicate(d)){clearTimeout(timer);ws.off('message',fn);resolve(d)}}ws.on('message',fn)})}
async function connect(id){const ws=new WebSocket(base.replace('http','ws')+'/live?room='+id.room+'&token='+id.token);sockets.push(ws);const ready=next(ws,d=>d.type==='snapshot');await ready;return ws}
const send=(ws,type,action)=>ws.send(JSON.stringify({type,action}));
try{let up=false;for(let i=0;i<70;i++){try{up=(await fetch(base+'/api/health')).ok;if(up)break}catch{}await pause(100)}assert.ok(up);
 for(const lab of ['physics','plant']){
  const [status,teacher]=await api('/api/rooms',{name:'Test lecturer',mode:'spatial',spatialLab:lab});assert.equal(status,201);assert.equal(teacher.spatialLab,lab);
  const [joinStatus,learner]=await api('/api/rooms/'+teacher.room+'/join',{name:'Test learner',mode:'spatial'});assert.equal(joinStatus,201);const [,second]=await api('/api/rooms/'+teacher.room+'/join',{name:'Second learner',mode:'spatial'});
  const tw=await connect(teacher),sw=await connect(learner),other=await connect(second);
  const demo=next(sw,d=>d.type==='snapshot'&&d.spatialDemo.ppe);send(tw,'spatial_demo_action',{id:'safety'});const demoState=await demo;assert.equal(demoState.spatialDemo.ppe,true);assert.deepEqual(demoState.spatialDemo.spatialPose,[4,-2.4]);
  const teacherView=next(tw,d=>d.type==='snapshot'&&d.spatialParticipants.some(p=>p.id===learner.id&&p.state.ppe));const peerView=next(other,d=>d.type==='snapshot'&&d.spatialParticipants.length===1);send(sw,'spatial_action',{id:'safety'});assert.equal((await teacherView).spatialParticipants.length,2);const privateView=await peerView;assert.equal(privateView.spatialParticipants[0].id,second.id);assert.equal(privateView.spatialParticipants[0].state.ppe,false);
  const disallowed=next(sw,d=>d.type==='error');send(sw,'spatial_demo_action',{id:'safety'});assert.match((await disallowed).message,/not permitted/);
  const assignment=next(sw,d=>d.type==='snapshot'&&d.assignment==='Compare your results');tw.send(JSON.stringify({type:'assignment',text:'Compare your results'}));await assignment;
  const feedback=next(sw,d=>d.type==='feedback'&&d.text==='Review this observation');tw.send(JSON.stringify({type:'feedback',studentId:learner.id,text:'Review this observation'}));await feedback;
  const paused=next(sw,d=>d.type==='snapshot'&&d.spatialParticipants[0].locked);tw.send(JSON.stringify({type:'pause',studentId:learner.id,value:true}));await paused;const blocked=next(sw,d=>d.type==='error');send(sw,'spatial_action',{id:'safety'});assert.match((await blocked).message,/paused/);
  const reset=next(sw,d=>d.type==='snapshot'&&!d.spatialParticipants[0].locked&&!d.spatialParticipants[0].state.ppe);tw.send(JSON.stringify({type:'reset_learner',studentId:learner.id}));await reset;
  const resetDemo=next(sw,d=>d.type==='snapshot'&&!d.spatialDemo.ppe);tw.send(JSON.stringify({type:'reset_demo'}));await resetDemo;
  const ended=next(sw,d=>d.type==='room_ended');tw.send(JSON.stringify({type:'end_spatial_room'}));await ended;const health=await (await fetch(base+'/api/health')).json();assert.equal(health.rooms,0);
  for(const ws of [tw,sw,other])ws.close();
 }
 console.log('Live spatial classroom HTTP/WebSocket tests passed: two lab modes, demonstration sync, private practice, role restrictions, pause and reset.');
}finally{for(const ws of sockets)ws.close();child.kill()}
