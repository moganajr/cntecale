/** Version 0.9: controlled virtual equipment mechanics; illustrative geometry pending SME review. */
export const EQUIPMENT={
 'electrical-panel':{discipline:'TVET',name:'Low-voltage electrical control panel',fault:'fuse',tools:['insulated-driver','multimeter','fuse-puller'],parts:[
  {id:'housing',label:'Protective enclosure',role:'shield',position:[0,0,0],size:[2.8,2.1,.32],color:'#41647b',fixed:true},
  {id:'cover',label:'Transparent protective cover',role:'shield',position:[0,0,.42],size:[2.8,2.1,.13],color:'#82b9cf',prerequisites:[]},
  {id:'fuse',label:'Replaceable protective fuse',role:'fault',position:[-.75,.25,.57],size:[.55,.35,.24],color:'#dfbb5d',prerequisites:['cover']},
  {id:'relay',label:'Control relay',position:[.20,.20,.60],size:[.6,.65,.31],color:'#58a8a3',prerequisites:['cover']},
  {id:'terminal',label:'Wiring terminal block',position:[.82,-.38,.62],size:[.65,.34,.24],color:'#dc8f75',prerequisites:['cover']}
 ]},
 'car-starter':{discipline:'TVET',name:'Automotive starter motor',fault:'brush',tools:['insulated-driver','spanner','multimeter','brush-tool'],parts:[
  {id:'casing',label:'Motor casing',position:[0,0,0],size:[2.7,1.45,1.2],color:'#587a8c',fixed:true},
  {id:'cap',label:'End cap',position:[1.45,0,0],size:[.25,1.4,1.15],color:'#aec1c6'},
  {id:'brush',label:'Carbon brush assembly',role:'fault',position:[1.25,.10,.15],size:[.35,.45,.32],color:'#d38c56',prerequisites:['cap']},
  {id:'armature',label:'Armature rotor',position:[0,0,.2],size:[1.45,.75,.75],color:'#ddad64',prerequisites:['cap','brush']},
  {id:'solenoid',label:'Starter solenoid',position:[-.5,1.1,.05],size:[1.0,.37,.38],color:'#6aa7b0'}
 ]},
 'chemistry-burette':{discipline:'Chemistry',name:'Burette assembly',fault:'stopcock',tools:['lab-clamp','pipette-check','seal-tool'],parts:[
  {id:'stand',label:'Support stand',position:[-.8,0,-.3],size:[.25,2.7,.25],color:'#7294a5',fixed:true},
  {id:'clamp',label:'Burette clamp',position:[-.1,.4,0],size:[1.2,.17,.2],color:'#e5bd64'},
  {id:'tube',label:'Graduated glass tube',position:[.55,0,.05],size:[.3,2.3,.34],color:'#73b4cc',prerequisites:['clamp']},
  {id:'stopcock',label:'Stopcock valve',role:'fault',position:[.55,-1.3,.1],size:[.60,.25,.4],color:'#d28e66',prerequisites:['tube']},
  {id:'tip',label:'Dispensing tip',position:[.55,-1.6,.1],size:[.15,.52,.16],color:'#a6cdd8',prerequisites:['stopcock']}
 ]},
 'microscope':{discipline:'Biology',name:'Compound light microscope',fault:'lamp',tools:['lens-cleaner','insulated-driver','lamp-tool'],parts:[
  {id:'frame',label:'Microscope frame',position:[0,0,0],size:[.55,2.4,.6],color:'#748fa4',fixed:true},
  {id:'eyepiece',label:'Eyepiece',position:[.15,1.5,.12],size:[.35,.63,.42],color:'#284c63'},
  {id:'objective',label:'Objective turret',position:[.18,.55,.16],size:[.75,.4,.55],color:'#c0a664',prerequisites:['eyepiece']},
  {id:'stage',label:'Mechanical specimen stage',position:[.10,-.23,.42],size:[1.7,.20,1.45],color:'#3e6a78'},
  {id:'lamp',label:'Replaceable illumination module',role:'fault',position:[.1,-.95,.45],size:[.50,.38,.5],color:'#e6be68',prerequisites:['stage']}
 ]},
 'hematology-analyzer':{discipline:'Medical Laboratory',name:'Hematology analyzer (synthetic training)',fault:'sample-probe',tools:['probe-tool','gloves','calibration-kit'],parts:[
  {id:'chassis',label:'Analyzer chassis',position:[0,0,0],size:[2.6,2.0,1.25],color:'#d9e4e8',fixed:true},
  {id:'service-panel',label:'Service panel',position:[0,0,.73],size:[2.15,1.55,.17],color:'#8bbacb'},
  {id:'sample-probe',label:'Synthetic sampling probe',role:'fault',position:[.7,.18,.92],size:[.22,.85,.22],color:'#cf9e53',prerequisites:['service-panel']},
  {id:'reagent-module',label:'Reagent module',position:[-.65,-.40,.95],size:[.65,.75,.45],color:'#7ba9a9',prerequisites:['service-panel']},
  {id:'optical-block',label:'Illustrative sensor block',position:[.1,.28,.94],size:[.70,.5,.39],color:'#627fb0',prerequisites:['service-panel']}
 ]},
 'centrifuge':{discipline:'Medical Laboratory',name:'Bench centrifuge (synthetic training)',fault:'rotor',tools:['rotor-key','balance-check','gloves'],parts:[
  {id:'base',label:'Centrifuge base',position:[0,-.4,0],size:[2.4,.85,1.95],color:'#86a8b4',fixed:true},
  {id:'lid',label:'Safety interlock lid',position:[0,.77,0],size:[2.3,.24,1.94],color:'#c1d8e1'},
  {id:'rotor',label:'Tube rotor',role:'fault',position:[0,.16,.25],size:[1.3,.38,1.3],color:'#c6ab5b',prerequisites:['lid']},
  {id:'bucket',label:'Specimen bucket',position:[.55,.43,.36],size:[.38,.45,.4],color:'#b87e9b',prerequisites:['lid','rotor']},
  {id:'drive',label:'Drive motor',position:[0,-.42,.38],size:[.78,.56,.76],color:'#5c8296',prerequisites:['lid','rotor']}
 ]},
 'field-microscope':{discipline:'Public Health',name:'Field microscope and illumination unit',fault:'light',tools:['lens-cleaner','lamp-tool','gloves'],parts:[
  {id:'frame',label:'Portable microscope body',position:[0,0,0],size:[1.15,1.75,1.1],color:'#6a929c',fixed:true},
  {id:'head',label:'Optics head',position:[.2,1.0,.32],size:[.75,.55,.6],color:'#415d75'},
  {id:'slide-holder',label:'Slide holder',position:[.12,-.18,.65],size:[1.3,.17,.95],color:'#c2a36b'},
  {id:'light',label:'Illumination cartridge',role:'fault',position:[.2,-.63,.60],size:[.52,.33,.5],color:'#e8c077',prerequisites:['slide-holder']},
  {id:'battery',label:'Battery compartment',position:[-.4,-.65,-.28],size:[.55,.48,.45],color:'#9fb4bc'}
 ]}
};
export const TOOLS={
 'insulated-driver':'Insulated screwdriver','multimeter':'Digital multimeter','fuse-puller':'Fuse puller',
 'spanner':'Spanner','brush-tool':'Brush removal tool','lab-clamp':'Laboratory clamp key',
 'pipette-check':'Pipette inspection gauge','seal-tool':'Stopcock seal tool',
 'lens-cleaner':'Lens cleaning kit','lamp-tool':'Lamp servicing tool',
 'probe-tool':'Service probe tool','gloves':'Protective gloves',
 'calibration-kit':'Instrument calibration simulator','rotor-key':'Rotor extraction key',
 'balance-check':'Balance inspection gauge'
};
export const REPAIR_TOOL={'fuse':'fuse-puller','brush':'brush-tool','stopcock':'seal-tool','lamp':'lamp-tool','sample-probe':'probe-tool','rotor':'rotor-key','light':'lamp-tool'};
export function newEquipmentState(id){const model=EQUIPMENT[id];if(!model)throw Error('Unknown equipment');return {equipmentId:id,removed:[],faultDetected:false,repaired:[],safe:true,notes:[],history:[],rotation:0,transparent:false,labels:true,exploded:false}}
function sorted(set){return [...set].sort()}
export function equipmentStatus(state){const m=EQUIPMENT[state.equipmentId];if(!m)throw Error('Unknown equipment');const missing=new Set(state.removed),faulty=!state.repaired.includes(m.fault);return {assembled:missing.size===0,faulty,safe:state.safe,operational:missing.size===0&&!faulty&&state.safe,removed:sorted(missing),progress:Math.round(100*(m.parts.length-missing.size)/m.parts.length)}}
export function actEquipment(state,action){const m=EQUIPMENT[state.equipmentId];if(!m||!action||typeof action!=='object')throw Error('Invalid equipment/action');
 const s={...state,removed:[...state.removed],repaired:[...state.repaired],notes:[...state.notes],history:[...state.history]};
 const part=m.parts.find(p=>p.id===action.part);const removed=new Set(s.removed);
 switch(action.kind){
 case 'isolate':s.safe=!!action.value;break;
 case 'inspect':if(!part)throw Error('Select valid component');s.notes.push('Inspected '+part.label);if(part.id===m.fault)s.faultDetected=true;break;
 case 'remove':
  if(!s.safe)throw Error('Safety lock: isolate the equipment first');
  if(!part||part.fixed)throw Error('Component cannot be removed');
  if(removed.has(part.id))throw Error('Component already removed');
  const blockers=(part.prerequisites||[]).filter(id=>!removed.has(id));
  if(blockers.length)throw Error('Remove protective/cover component first: '+blockers[0]);
  removed.add(part.id);break;
 case 'install':
  if(!s.safe)throw Error('Safety lock: isolate the equipment first');
  if(!part||!removed.has(part.id))throw Error('Component not available for reassembly');
  if(m.parts.some(p=>removed.has(p.id)&&p.prerequisites?.includes(part.id)))throw Error('Reassemble internal parts before closing the outer component');
  removed.delete(part.id);break;
 case 'repair':
  if(!s.safe)throw Error('Safety lock: isolate equipment before repair');
  if(!part||part.id!==m.fault)throw Error('This training scenario contains a different fault');
  if(!removed.has(part.id))throw Error('Dismantle the damaged component before repair');
  if(!s.faultDetected)throw Error('Inspect and identify damage before repair');
  if(REPAIR_TOOL[part.id]!==action.tool)throw Error('Select the appropriate digital repair tool');
  if(!s.repaired.includes(part.id))s.repaired.push(part.id);break;
 case 'rotate':
  if(!Number.isFinite(action.degrees))throw Error('Invalid rotation');
  s.rotation=((action.degrees%360)+360)%360;break;
 case 'transparent':s.transparent=!!action.value;break;
 case 'labels':s.labels=!!action.value;break;
 case 'exploded':s.exploded=!!action.value;break;
 default:throw Error('Unsupported equipment interaction');
 }
 s.removed=sorted(removed);s.history.push({kind:action.kind,part:part?.id||null,time:Date.now()});
 if(s.history.length>100)s.history.shift();
 return s;
}
export function equipmentAssessment(state){const status=equipmentStatus(state),events=state.history.map(e=>e.kind);const score=(events.includes('inspect')?15:0)+(events.includes('remove')?20:0)+(events.includes('repair')?30:0)+(events.includes('install')?20:0)+(status.operational?15:0);return {score,passed:score>=80&&status.operational,simulatedOnly:true,status}}
