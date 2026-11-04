/** CNTE-VSL v1.5 — role-scoped classroom state transitions.
 * This module has no network or third-party dependencies. Only the Node/WebSocket
 * transport broadcasts the resulting, independently validated state.
 */
import {freshBench,applyBenchAction,practiceStatus} from './liveEngine.js';
import {EQUIPMENT} from './equipmentEngine.js';
import {freshServiceBench,serviceAction,serviceAssessment} from './serviceMechanics.js';
import {MEDICAL_SCENARIOS,freshMedicalProcedure,medicalAction,medicalPracticalAssessment} from './medicalProcedure.js';

export function makeClassroomState({mode='titration',equipmentId='electrical-panel',teacherName='Lecturer'}={}){
 if(!['titration','equipment'].includes(mode))throw Error('Unsupported classroom mode');
 if(!EQUIPMENT[equipmentId])throw Error('Unknown equipment model');
 return {mode,equipmentId,teacherName,assignment:mode==='equipment'?'Inspect, service and test the selected training equipment.':'Perform two concordant synthetic titration trials.',
 demo:freshBench('Lecturer demonstration'),serviceDemo:freshServiceBench(equipmentId,'Lecturer demonstration'),
 medicalDemo:MEDICAL_SCENARIOS[equipmentId]?freshMedicalProcedure(equipmentId):null,
 learners:new Map(),revision:0,events:[]};
}
export function enrollLearner(room,id,name){
 if(!id||typeof name!=='string'||name.trim().length<2)throw Error('Valid learner required');
 if(room.learners.has(id))throw Error('Duplicate learner');
 room.learners.set(id,{name,bench:freshBench(name),service:freshServiceBench(room.equipmentId,name),medical:MEDICAL_SCENARIOS[room.equipmentId]?freshMedicalProcedure(room.equipmentId):null,locked:false});
 return room.learners.get(id);
}
function log(room,kind,actor,detail){
 room.revision+=1;room.events.push({sequence:room.revision,kind,actor,detail,at:Date.now()});
 if(room.events.length>250)room.events.shift();
}
export function applyClassroomCommand(room,actor,command){
 if(!command||typeof command.type!=='string')throw Error('Invalid classroom command');
 if(!actor||!['lecturer','student'].includes(actor.role))throw Error('Unknown classroom role');
 const student=actor.role==='student'?room.learners.get(actor.id):null;
 if(actor.role==='student'&&!student)throw Error('Learner is not in this classroom');
 if(actor.role==='student'){
  if(student.locked)throw Error('Lecturer paused this practical');
  if(command.type==='action'&&room.mode==='titration')student.bench=applyBenchAction(student.bench,command.action);
  else if(command.type==='equipment_action'&&room.mode==='equipment')student.service=serviceAction(student.service,command.action);
  else if(command.type==='medical_action'&&room.mode==='equipment'&&student.medical)student.medical=medicalAction(student.medical,command.action);
  else throw Error('Student action is not permitted for this classroom');
  log(room,command.type,actor.id,String(command.action?.kind||''));
  return {updated:true};
 }
 if(command.type==='demo_action'&&room.mode==='titration')room.demo=applyBenchAction(room.demo,command.action);
 else if(command.type==='equipment_demo_action'&&room.mode==='equipment')room.serviceDemo=serviceAction(room.serviceDemo,command.action);
 else if(command.type==='medical_demo_action'&&room.mode==='equipment'&&room.medicalDemo)room.medicalDemo=medicalAction(room.medicalDemo,command.action);
 else if(command.type==='pause'){
  const learner=room.learners.get(command.studentId);if(!learner)throw Error('Unknown learner');
  learner.locked=command.value===true;learner.bench.locked=learner.locked;learner.service.locked=learner.locked;
 }else if(command.type==='reset_learner'){
  const learner=room.learners.get(command.studentId);if(!learner)throw Error('Unknown learner');
  const name=learner.name;
  Object.assign(learner,{bench:freshBench(name),service:freshServiceBench(room.equipmentId,name),medical:MEDICAL_SCENARIOS[room.equipmentId]?freshMedicalProcedure(room.equipmentId):null,locked:false});
 }else if(command.type==='reset_demo'){
  room.demo=freshBench('Lecturer demonstration');room.serviceDemo=freshServiceBench(room.equipmentId,'Lecturer demonstration');
  room.medicalDemo=MEDICAL_SCENARIOS[room.equipmentId]?freshMedicalProcedure(room.equipmentId):null;
 }else if(command.type==='assignment'){
  if(typeof command.text!=='string'||command.text.trim().length<5||command.text.length>500)throw Error('Assignment must be 5–500 characters');
  room.assignment=command.text.trim();
 }else if(command.type==='feedback'){
  if(!room.learners.has(command.studentId)||typeof command.text!=='string'||command.text.trim().length===0||command.text.length>400)throw Error('Invalid feedback target or text');
  log(room,'feedback',actor.role,command.studentId);
  return {updated:true,feedback:{studentId:command.studentId,text:command.text}};
 }else throw Error('Lecturer action not permitted for this classroom');
 log(room,command.type,'lecturer',String(command.studentId||command.action?.kind||''));
 return {updated:true};
}
export function classroomSnapshot(room,{role='lecturer',id=null}={}){
 const selected=role==='lecturer'?[...room.learners.entries()]:room.learners.has(id)?[[id,room.learners.get(id)]]:[];
 return {
  type:'snapshot',mode:room.mode,equipmentId:room.equipmentId,assignment:room.assignment,revision:room.revision,
  demo:room.demo,serviceDemo:room.serviceDemo,medicalDemo:room.medicalDemo,
  participants:selected.map(([learnerId,u])=>({id:learnerId,name:u.name,bench:u.bench,practice:practiceStatus(u.bench)})),
  serviceParticipants:selected.map(([learnerId,u])=>({id:learnerId,name:u.name,service:u.service,assessment:serviceAssessment(u.service)})),
  medicalParticipants:selected.map(([learnerId,u])=>({id:learnerId,name:u.name,procedure:u.medical,assessment:u.medical?medicalPracticalAssessment(u.medical):null}))
 };
}
