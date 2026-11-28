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
 for(const lab of ['physics','plant','water','chemistry','engineering']){
  const [status,teacher]=await api('/api/rooms',{name:'Test lecturer',mode:'spatial',spatialLab:lab});assert.equal(status,201);assert.equal(teacher.spatialLab,lab);
  const [joinStatus,learner]=await api('/api/rooms/'+teacher.room+'/join',{name:'Test learner',mode:'spatial'});assert.equal(joinStatus,201);const [,second]=await api('/api/rooms/'+teacher.room+'/join',{name:'Second learner',mode:'spatial'});
  const tw=await connect(teacher),sw=await connect(learner),other=await connect(second);
  const initial=lab==='water'?'cylinder':'safety',done=s=>lab==='water'?s.held==='cylinder':lab==='engineering'?s.safe===true:s.ppe===true;
  const demo=next(sw,d=>d.type==='snapshot'&&done(d.spatialDemo));send(tw,'spatial_demo_action',{id:initial});const demoState=await demo;assert.ok(done(demoState.spatialDemo));assert.deepEqual(demoState.spatialDemo.spatialPose,lab==='water'?[-3.45,-2.4]:[4,-2.4]);
  const teacherView=next(tw,d=>d.type==='snapshot'&&d.spatialParticipants.some(p=>p.id===learner.id&&done(p.state)));const peerView=next(other,d=>d.type==='snapshot'&&d.spatialParticipants.length===1);send(sw,'spatial_action',{id:initial});assert.equal((await teacherView).spatialParticipants.length,2);const privateView=await peerView;assert.equal(privateView.spatialParticipants[0].id,second.id);assert.equal(done(privateView.spatialParticipants[0].state),false);
  if(lab==='water'){for(const id of ['bench','beaker','water']){const p=next(sw,d=>d.type==='snapshot'&&d.spatialDemo.events.at(-1)?.action===id);send(tw,'spatial_demo_action',{id});await p;}const filling=await next(sw,d=>d.type==='snapshot'&&d.spatialDemo.beakerMl>0);assert.ok(filling.spatialDemo.flow);const stopped=next(sw,d=>d.type==='snapshot'&&!d.spatialDemo.flow);send(tw,'spatial_demo_action',{id:'stop'});await stopped;}
  if(lab==='chemistry'){for(const id of ['flask','bench','burette','bench','sample','flask','store','reference','burette','store','indicator','flask','store','inspect','valve']){const p=next(sw,d=>d.type==='snapshot'&&d.spatialDemo.events.at(-1)?.action===id);send(tw,'spatial_demo_action',{id});await p;}const flowing=await next(sw,d=>d.type==='snapshot'&&d.spatialDemo.delivered>0);assert.equal(flowing.spatialDemo.flow,'flow');const stopped=next(sw,d=>d.type==='snapshot'&&!d.spatialDemo.flow);send(tw,'spatial_demo_action',{id:'stop'});const result=await stopped;assert.ok(result.spatialDemo.delivered>0);assert.equal(result.spatialParticipants[0].state.delivered,0);}
  let previousRevision=demoState.revision; if(lab==='engineering'){for(const id of ['driver','bench','driven','bench','crank','bench','test','turn','turn','turn','turn','turn','turn','turn','turn','record','stop']){const previous=previousRevision;const p=next(sw,d=>d.type==='snapshot'&&d.revision>previous&&d.spatialDemo.events.at(-1)?.action===id);send(tw,'spatial_demo_action',{id});const update=await p;previousRevision=update.revision;if(id==='record'){assert.equal(update.spatialDemo.records.at(-1).inputTurns,2);assert.equal(update.spatialDemo.records.at(-1).outputTurns,1);assert.equal(update.spatialParticipants[0].state.inputSteps,0);}}}
  const disallowed=next(sw,d=>d.type==='error');send(sw,'spatial_demo_action',{id:'safety'});assert.match((await disallowed).message,/not permitted/);
  const assignment=next(sw,d=>d.type==='snapshot'&&d.assignment==='Compare your results');tw.send(JSON.stringify({type:'assignment',text:'Compare your results'}));await assignment;
  const feedback=next(sw,d=>d.type==='feedback'&&d.text==='Review this observation');tw.send(JSON.stringify({type:'feedback',studentId:learner.id,text:'Review this observation'}));await feedback;
  const paused=next(sw,d=>d.type==='snapshot'&&d.spatialParticipants[0].locked);tw.send(JSON.stringify({type:'pause',studentId:learner.id,value:true}));await paused;const blocked=next(sw,d=>d.type==='error');send(sw,'spatial_action',{id:'safety'});assert.match((await blocked).message,/paused/);
  const reset=next(sw,d=>d.type==='snapshot'&&!d.spatialParticipants[0].locked&&!done(d.spatialParticipants[0].state));tw.send(JSON.stringify({type:'reset_learner',studentId:learner.id}));await reset;
  const resetDemo=next(sw,d=>d.type==='snapshot'&&!done(d.spatialDemo)&&!d.spatialDemo.flow);tw.send(JSON.stringify({type:'reset_demo'}));await resetDemo;
  const ended=next(sw,d=>d.type==='room_ended');tw.send(JSON.stringify({type:'end_spatial_room'}));await ended;const health=await (await fetch(base+'/api/health')).json();assert.equal(health.rooms,0);
  for(const ws of [tw,sw,other])ws.close();
 }
 console.log('Live spatial classroom HTTP/WebSocket tests passed: five modes, demonstration sync, private practice, role restrictions, pause, flow and reset.');
}finally{for(const ws of sockets)ws.close();child.kill()}
