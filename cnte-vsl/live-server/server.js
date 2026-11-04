/** Development-only live collaboration server. Requires an authenticated gateway for production. */
import http from 'node:http';
import {createReadStream,statSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {freshBench,applyBenchAction,practiceStatus} from '../src/liveEngine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||8080),host=process.env.HOST||'127.0.0.1';
const rooms=new Map(),roomTtl=4*60*60*1000,MAX_ROOMS=50,MAX_LEARNERS=40;
const secret=()=>randomBytes(24).toString('base64url');
const code=()=>randomBytes(4).toString('hex').toUpperCase();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
const safeName=s=>typeof s==='string'?s.trim().slice(0,60):'';
function reply(res,status,payload){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload))}
function decodeBody(req){return new Promise((resolve,reject)=>{let data='';req.on('data',b=>{data+=b;if(data.length>8192){reject(Error('Request too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(Error('Invalid JSON'))}});req.on('error',reject)})}
function snapshot(room){return {type:'snapshot',room:room.code,assignment:room.assignment,participants:[...room.learners.entries()].map(([id,u])=>({id,name:u.name,online:u.sockets.size>0,bench:u.bench,practice:practiceStatus(u.bench)})),updated:Date.now()}}
function tell(ws,data){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data))}
function announce(room){const data=snapshot(room);for(const c of room.clients)tell(c.ws,c.role==='lecturer'?data:{type:'snapshot',room:room.code,assignment:room.assignment,participants:data.participants.filter(p=>p.id===c.id),onlineCount:room.clients.size,updated:data.updated})}
const server=http.createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&pathname==='/api/health')return reply(res,200,{status:'ok',prototype:true,rooms:rooms.size});
 if(req.method==='POST'&&pathname==='/api/rooms'){try{if(rooms.size>=MAX_ROOMS)return reply(res,429,{error:'Server room limit reached'});const b=await decodeBody(req),name=safeName(b.name);if(name.length<2)return reply(res,400,{error:'Lecturer display name is required'});let id;do{id=code()}while(rooms.has(id));const token=secret();rooms.set(id,{code:id,teacherToken:token,teacherName:name,assignment:'Acid-base titration: perform two concordant trials, record evidence and explain observations.',learners:new Map(),clients:new Set(),created:Date.now()});return reply(res,201,{room:id,token,role:'lecturer',name})}catch(e){return reply(res,400,{error:e.message})}}
 const join=pathname.match(/^\/api\/rooms\/([A-F0-9]{8})\/join$/);
 if(req.method==='POST'&&join){try{const room=rooms.get(join[1]);if(!room)return reply(res,404,{error:'Classroom not found or expired'});const b=await decodeBody(req),name=safeName(b.name);if(name.length<2)return reply(res,400,{error:'Student display name is required'});if(room.learners.size>=MAX_LEARNERS)return reply(res,429,{error:'Class is full'});const id=secret().slice(0,12),token=secret();room.learners.set(id,{name,token,bench:freshBench(name),sockets:new Set()});return reply(res,201,{room:room.code,token,role:'student',id,name})}catch(e){return reply(res,400,{error:e.message})}}
 if(req.method!=='GET'&&req.method!=='HEAD')return reply(res,405,{error:'Unsupported request'});
 const route=pathname==='/'?'/index.html':pathname;
 const full=path.resolve(root,'.'+route);
 if(!full.startsWith(root+path.sep))return reply(res,403,{error:'Forbidden'});
 try{if(!existsSync(full)||!statSync(full).isFile())return reply(res,404,{error:'Not found'});res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});createReadStream(full).pipe(res)}catch{return reply(res,404,{error:'Not found'})}
});
const wss=new WebSocketServer({server,maxPayload:8192,path:'/live'});
wss.on('connection',(ws,req)=>{const query=new URL(req.url,'http://localhost').searchParams,room=rooms.get(query.get('room')),token=query.get('token');if(!room){ws.close(1008,'Room unavailable');return}
 let person,role,id=null;
 if(token===room.teacherToken){role='lecturer';person={name:room.teacherName}}
 else{const found=[...room.learners.entries()].find(([,v])=>v.token===token);if(!found){ws.close(1008,'Unauthorized');return}[id,person]=found;role='student';person.sockets.add(ws)}
 const client={ws,role,id};room.clients.add(client);tell(ws,{type:'welcome',role,id,room:room.code});announce(room);
 ws.on('message',buffer=>{try{const m=JSON.parse(buffer.toString());if(!m||typeof m!=='object')throw Error('Invalid message');
 if(role==='student'){
   if(m.type!=='action')throw Error('Students may modify only their own workbench');
   const kind=String(m.action?.kind||'');
   const next=applyBenchAction(person.bench,m.action);
   person.bench=next;
 }else if(role==='lecturer'){
   if(m.type==='assignment'){if(typeof m.text!=='string'||m.text.trim().length<5||m.text.length>500)throw Error('Assignment must be 5–500 characters');room.assignment=m.text.trim()}
   else if(m.type==='feedback'){if(typeof m.studentId!=='string'||typeof m.text!=='string'||m.text.trim().length<1||m.text.length>400)throw Error('Invalid feedback');const student=room.learners.get(m.studentId);if(!student)throw Error('Learner not found');for(const socket of student.sockets)tell(socket,{type:'feedback',text:m.text.slice(0,400),lecturer:room.teacherName})}
   else if(m.type==='pause'){const student=room.learners.get(m.studentId);if(!student)throw Error('Learner not found');student.bench.locked=!!m.value}
   else throw Error('Unsupported lecturer action');
 }
 announce(room);
 }catch(e){tell(ws,{type:'error',message:String(e.message||'Invalid action').slice(0,180)})}});
 ws.on('close',()=>{room.clients.delete(client);if(person.sockets)person.sockets.delete(ws);announce(room)});
});
const cleaner=setInterval(()=>{for(const [id,room] of rooms)if(Date.now()-room.created>roomTtl){for(const x of room.clients)x.ws.close(1001,'Classroom expired');rooms.delete(id)}},60000);cleaner.unref();
server.listen(port,host,()=>console.log('CNTE VSL live prototype running on http://'+host+':'+port));
