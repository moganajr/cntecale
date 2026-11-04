/** CNTE virtual microscope: synthetic specimens and ideal optical geometry. */
export const SPECIMENS={
 onion:{name:'Onion epidermis',features:['cell wall','nucleus','cytoplasm','vacuole'],sizeUm:300},
 cheek:{name:'Human cheek epithelium (synthetic)',features:['cell membrane','nucleus','cytoplasm'],sizeUm:65},
 leaf:{name:'Leaf epidermis with stomata',features:['guard cells','stoma','epidermal cells'],sizeUm:110}
};
export function totalMagnification(eyepiece,objective){if(!Number.isFinite(eyepiece*objective)||eyepiece<=0||objective<=0)throw Error('Invalid magnification');return eyepiece*objective}
export function fieldDiameterUm(objective,fieldNumberMm=18){if(fieldNumberMm<=0)throw Error('Invalid field number');return fieldNumberMm*1000/totalMagnification(1,objective)}
export function focusQuality(focus,objective){
 if(!Number.isFinite(focus)||focus<0||focus>100||![4,10,40].includes(objective))throw Error('Invalid focus or objective');
 const target={4:44,10:52,40:62}[objective],tolerance={4:20,10:13,40:7}[objective];
 const difference=Math.abs(focus-target);
 return {target,difference,clarity:Math.max(0,1-difference/tolerance),inFocus:difference<=tolerance*.3};
}
export function estimateCellsInField(specimenId,objective){const x=SPECIMENS[specimenId];if(!x)throw Error('Unknown specimen');return Math.max(1,Math.floor((fieldDiameterUm(objective)/x.sizeUm)**2*.7))}
export function assessMicroscopyObservation({specimenId,objective,focus,stageCentered,lightOn,prepared,observedFeatures=[]}){
 const x=SPECIMENS[specimenId];if(!x)throw Error('Unknown specimen');
 const f=focusQuality(focus,objective),unique=[...new Set(observedFeatures)];
 return {focus:f,ready:!!(prepared&&lightOn&&stageCentered&&f.inFocus),correct:unique.filter(z=>x.features.includes(z)),incorrect:unique.filter(z=>!x.features.includes(z)),complete:x.features.every(z=>unique.includes(z))&&unique.every(z=>x.features.includes(z)),expected:x.features};
}
export function gradeMicroscopyPractical({ppe=false,prepared=false,lightOn=false,stageCentered=false,observations=[],notes='',unsafeAction=false}={}){
 const unique=new Set(observations.filter(x=>x.ready&&x.complete).map(x=>x.specimenId));
 const parts={safety:ppe?10:0,preparation:prepared?15:0,illumination:lightOn?10:0,centering:stageCentered?10:0,focus:unique.size?20:0,identification:unique.size>=2?20:unique.size===1?10:0,reporting:notes.trim().length>=30?15:0};
 const score=unsafeAction?0:Object.values(parts).reduce((a,b)=>a+b,0);
 return {score,passed:!unsafeAction&&score>=70&&unique.size>=2,parts,specimensIdentified:unique.size,simulationOnly:true};
}
