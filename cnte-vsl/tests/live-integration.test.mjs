/** End-to-end development integration: HTTP room setup and WebSocket classroom exchange. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
import {WebSocket} from 'ws';
const PORT=20000+Math.floor(Math.random()*20000);
const base='http://127.0.0.1:'+PORT,wsBase='ws://127.0.0.1:'+PORT,PREVIEW_KEY='integration-test-access-key-123456';
const child=spawn(process.execPath,['live-server/server.js'],{cwd:new URL('..',import.meta.url).pathname,env:{...process.env,PORT:String(PORT),HOST:'127.0.0.1',LIVE_PREVIEW_KEY:PREVIEW_KEY},stdio:['ignore','pipe','pipe']});
let stderr='';child.stderr.on('data',d=>stderr+=d.toString());
let teacher,student,equipmentTeacher,equipmentStudent,passed=0;
const check=(condition,label)=>{assert.ok(condition,label);passed++};
const api=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','X-CNTE-Preview-Key':PREVIEW_KEY},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}};
function onOpen(socket){return new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject);setTimeout(()=>reject(Error('WebSocket connection timed out')),5000)})}
function nextMessage(socket,predicate,timeout=6000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.off('message',handler);reject(Error('Timed out waiting for live update'))},timeout);
 function handler(raw){let message;try{message=JSON.parse(raw.toString())}catch{return}if(predicate(message)){clearTimeout(timer);socket.off('message',handler);resolve(message)}}
 socket.on('message',handler)})}
try{
 let available=false;
 for(let i=0;i<70;i++){if(child.exitCode!==null)throw Error('Live server exited early: '+stderr);try{const r=await fetch(base+'/api/health');if(r.ok){available=true;break}}catch{}await pause(100)}
 check(available,'server starts');
 const forbidden=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Unauthorized'})});check(forbidden.status===403,'preview access code is required');
 const created=await api('/api/rooms',{name:'Demonstrating Lecturer'});
 check(created.status===201&&/^[A-F0-9]{8}$/.test(created.data.room),'lecturer creates room');
 const joined=await api('/api/rooms/'+created.data.room+'/join',{name:'Laboratory Learner'});
 check(joined.status===201&&joined.data.role==='student','student joins by code');
 teacher=new WebSocket(wsBase+'/live?room='+created.data.room+'&token='+created.data.token);
 await onOpen(teacher);
 student=new WebSocket(wsBase+'/live?room='+created.data.room+'&token='+joined.data.token);
 await onOpen(student);
 const update=nextMessage(teacher,d=>d.type==='snapshot'&&d.participants.some(p=>p.bench.ppe===true));
 student.send(JSON.stringify({type:'action',action:{kind:'ppe',value:true}}));
 const teacherData=await update;
 check(teacherData.participants.some(p=>p.bench.ppe===true),'instructor sees learner actions');
 const demonstration=nextMessage(student,d=>d.type==='snapshot'&&d.demo?.ppe===true);
 teacher.send(JSON.stringify({type:'demo_action',action:{kind:'ppe',value:true}}));
 const studentData=await demonstration;
 check(studentData.demo.ppe===true,'student sees instructor demonstration');
 const feedback=nextMessage(student,d=>d.type==='feedback'&&d.text==='Check the meniscus');
 teacher.send(JSON.stringify({type:'feedback',studentId:joined.data.id,text:'Check the meniscus'}));
 await feedback;check(true,'private lecturer feedback delivered');
 const lock=nextMessage(student,d=>d.type==='snapshot'&&d.participants[0]?.bench.locked);
 teacher.send(JSON.stringify({type:'pause',studentId:joined.data.id,value:true}));
 await lock;check(true,'instructor can pause learner');
 const rejected=nextMessage(student,d=>d.type==='error'&&/paused/i.test(d.message));
 student.send(JSON.stringify({type:'action',action:{kind:'place',item:'burette'}}));
 await rejected;check(true,'paused workbench cannot be manipulated');
 const resetSnapshot=nextMessage(student,d=>d.type==='snapshot'&&d.participants[0]?.bench.locked===false&&d.participants[0]?.bench.ppe===false);
 teacher.send(JSON.stringify({type:'reset_learner',studentId:joined.data.id}));
 await resetSnapshot;check(true,'lecturer resets a learner workbench');
 const safetySnapshot=nextMessage(teacher,d=>d.type==='snapshot'&&d.participants.some(p=>p.id===joined.data.id&&p.bench.safetyStops===1));
 student.send(JSON.stringify({type:'action',action:{kind:'place',item:'flask'}}));
 await safetySnapshot;check(true,'unsafe equipment handling is visible to lecturer');
 const demoReset=nextMessage(student,d=>d.type==='snapshot'&&d.demo?.ppe===false);
 teacher.send(JSON.stringify({type:'reset_demo'}));
 await demoReset;check(true,'lecturer resets shared demonstration');
 const equipmentRoom=await api('/api/rooms',{name:'TVET Instructor',mode:'equipment',equipmentId:'electrical-panel'});
 check(equipmentRoom.status===201,'lecturer creates an equipment workshop');
 const equipmentJoin=await api('/api/rooms/'+equipmentRoom.data.room+'/join',{name:'TVET Apprentice'});
 check(equipmentJoin.status===201,'student joins equipment workshop');
 equipmentTeacher=new WebSocket(wsBase+'/live?room='+equipmentRoom.data.room+'&token='+equipmentRoom.data.token);
 await onOpen(equipmentTeacher);
 equipmentStudent=new WebSocket(wsBase+'/live?room='+equipmentRoom.data.room+'&token='+equipmentJoin.data.token);
 await onOpen(equipmentStudent);
 const equipmentChange=nextMessage(equipmentTeacher,d=>d.type==='snapshot'&&d.serviceParticipants.some(p=>p.id===equipmentJoin.data.id&&p.service.operations.length===1));
 equipmentStudent.send(JSON.stringify({type:'equipment_action',action:{kind:'inspect',part:'fuse'}}));
 const changed=await equipmentChange;
 check(changed.serviceParticipants[0].service.state.faultDetected===true,'instructor sees student equipment diagnostic action');
 const instructorDemo=nextMessage(equipmentStudent,d=>d.type==='snapshot'&&d.serviceDemo?.operations.length===1);
 equipmentTeacher.send(JSON.stringify({type:'equipment_demo_action',action:{kind:'inspect',part:'fuse'}}));
 await instructorDemo;
 check(true,'student receives live lecturer equipment demonstration');
 const pauseEquipment=nextMessage(equipmentStudent,d=>d.type==='snapshot'&&d.serviceParticipants[0]?.service.locked===true);
 equipmentTeacher.send(JSON.stringify({type:'pause',studentId:equipmentJoin.data.id,value:true}));
 await pauseEquipment;
 const prevented=nextMessage(equipmentStudent,d=>d.type==='error'&&/paused/.test(d.message));
 equipmentStudent.send(JSON.stringify({type:'equipment_action',action:{kind:'inspect',part:'cover'}}));
 await prevented;
 check(true,'paused student cannot change equipment');
 const resetEquip=nextMessage(equipmentTeacher,d=>d.type==='snapshot'&&d.serviceParticipants.some(p=>p.service.operations.length===0&&!p.service.locked));
 equipmentTeacher.send(JSON.stringify({type:'reset_learner',studentId:equipmentJoin.data.id}));
 await resetEquip;
 check(true,'lecturer can reset equipment for repeated training');
 console.log(passed+' chemistry and equipment HTTP/WebSocket integration assertions passed.');
}finally{
 teacher?.close();student?.close();equipmentTeacher?.close();equipmentStudent?.close();child.kill('SIGTERM');
}
