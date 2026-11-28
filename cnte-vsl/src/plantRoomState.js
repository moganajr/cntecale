import {SPECIMENS,focusQuality,totalMagnification,assessMicroscopyObservation} from './biologyMicroscopy.js';
export const PLANT_SLIDES=['onion','leaf'];
export const PLANT_FEATURES=[...new Set(PLANT_SLIDES.flatMap(id=>SPECIMENS[id].features))];
export const newPlantRoom=()=>({ppe:false,scope:'store',held:null,slides:{onion:'store',leaf:'store'},slide:null,lightOn:false,objective:4,focus:20,stageX:28,stageY:72,stageCentered:false,features:[],records:[],events:[],notes:''});
export function plantRoomAction(s,id){const result=apply(s,id);s.events.push({action:id,result,at:new Date().toISOString()});return result;}
function apply(s,id){
 if(id==='safety'){s.ppe=true;return 'Virtual safety check confirmed.';}
 if(!s.ppe)return 'Visit the safety station first.';
 if(id==='scope'){if(s.held||s.scope==='bench')return 'Place held equipment first or use the mounted microscope.';s.held='scope';s.scope='held';return 'Microscope collected.';}
 if(PLANT_SLIDES.includes(id)){if(s.held||s.slides[id]==='stage')return 'Return or place the held slide first.';s.held=id;s.slides[id]='held';return 'Collected '+SPECIMENS[id].name+'.';}
 if(id==='bench'&&s.held==='scope'){s.scope='bench';s.held=null;return 'Microscope placed on the bench.';}
 if(id==='stage'&&s.held&&PLANT_SLIDES.includes(s.held)){if(s.scope!=='bench'||s.slide)return 'The stage requires a mounted microscope and must be empty.';s.slide=s.held;s.slides[s.held]='stage';s.held=null;s.objective=4;s.focus=20;s.stageX=28;s.stageY=72;s.stageCentered=false;s.features=[];return 'Prepared plant slide placed on the stage.';}
 if(id==='unload'){if(!s.slide||s.held)return 'The stage must contain a slide and hands must be empty.';s.held=s.slide;s.slides[s.slide]='held';s.slide=null;s.objective=4;s.features=[];return 'Slide removed from the stage.';}
 if(id==='store'&&s.held){if(s.held==='scope')s.scope='store';else s.slides[s.held]='store';s.held=null;return 'Item returned to storage.';}
 if(s.scope!=='bench')return 'Place the microscope on the workbench first.';
 if(id==='light'){s.lightOn=!s.lightOn;return s.lightOn?'Illumination on.':'Illumination off.';}
 if(!s.slide)return 'Place a prepared plant slide on the stage.';
 if(id==='objective'){if(s.objective===4&&(!s.stageCentered||!focusQuality(s.focus,4).inFocus))return 'Center and focus the low-power field before increasing magnification.';s.objective=s.objective===4?10:s.objective===10?40:4;return 'Objective '+s.objective+'× selected.';}
 if(id.startsWith('focus:')||id.startsWith('x:')||id.startsWith('y:')){const [k,value]=id.split(':'),n=Number(value);if(!Number.isFinite(n)||n<0||n>100)return 'Control out of range.';s[k==='focus'?'focus':k==='x'?'stageX':'stageY']=n;s.stageCentered=Math.abs(s.stageX-50)<=12&&Math.abs(s.stageY-50)<=12;return 'Microscope control adjusted.';}
 if(id.startsWith('feature:')){const f=id.slice(8);if(!PLANT_FEATURES.includes(f))return 'Unknown structure.';s.features=s.features.includes(f)?s.features.filter(x=>x!==f):[...s.features,f];return 'Observation selection updated.';}
 if(id==='record'){const assessment=assessMicroscopyObservation({specimenId:s.slide,objective:s.objective,focus:s.focus,stageCentered:s.stageCentered,lightOn:s.lightOn,prepared:true,observedFeatures:s.features});if(!assessment.ready)return 'Illuminate, center and focus the specimen before recording.';if(!assessment.complete)return 'Review identified structures; selections are incomplete or incorrect.';s.records=s.records.filter(r=>r.specimenId!==s.slide);s.records.push({specimenId:s.slide,magnification:totalMagnification(10,s.objective),features:[...s.features],ready:true,complete:true,at:new Date().toISOString()});return 'Plant observation recorded.';}
 return 'Select an educational microscope control.';
}
export const plantRoomProgress=s=>[s.ppe,s.scope==='bench',s.slide!==null||s.records.length>0,s.lightOn||s.records.length>0,s.records.some(r=>r.specimenId==='onion'),s.records.some(r=>r.specimenId==='leaf')];
export function plantRoomReport(s){const steps=plantRoomProgress(s),score=steps.filter(Boolean).length*15+(s.notes.trim().length>=30?10:0);return {score,passed:steps.every(Boolean)&&score>=90,rubric:{safety:steps[0]?15:0,preparation:steps[1]?15:0,slide:steps[2]?15:0,light:steps[3]?15:0,onion:steps[4]?15:0,leaf:steps[5]?15:0,interpretation:s.notes.trim().length>=30?10:0}};}
export function plantGuide(s){if(!s.ppe)return 'Confirm virtual safety.';if(s.held)return s.held==='scope'?'Place microscope on bench.':'Place the slide on the microscope stage, or return it to storage.';if(s.scope!=='bench')return 'Collect the microscope from storage.';if(!s.slide)return 'Collect a prepared plant slide.';if(!s.lightOn)return 'Turn on the virtual illumination.';if(s.records.some(r=>r.specimenId===s.slide))return s.records.length===2?'Both plant observations recorded; compare and save.':'Remove this slide and collect the other plant slide.';if(!s.stageCentered)return 'Adjust the specimen stage in the eyepiece view.';if(!focusQuality(s.focus,s.objective).inFocus)return 'Adjust focus until the synthetic field is clear.';return 'Identify the visible plant structures and record your observation.';}
