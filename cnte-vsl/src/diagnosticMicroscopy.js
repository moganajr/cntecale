/** CNTE-VSL v1.4 synthetic microscopy teaching — NOT clinical microscopy or diagnosis. */
export const TEACHING_SLIDES=Object.freeze({
 smear:{label:'Synthetic peripheral smear',structures:['erythrocytes','leukocyte','platelet fragments'],focusTargets:{4:43,10:51,40:62}},
 stain:{label:'Synthetic stained teaching slide',structures:['purple-stained forms','pink-stained forms','field artifact'],focusTargets:{4:46,10:54,40:63}},
 tissue:{label:'Synthetic epithelial section',structures:['nuclei','cell borders','extracellular space'],focusTargets:{4:45,10:53,40:61}}
});
export function newMicroscopyStation(){return {prepared:false,slide:'smear',objective:4,focus:0,illumination:false,centered:false,viewed:[],annotations:{},measurements:[]}}
export function evaluateSyntheticView(state){
 const slide=TEACHING_SLIDES[state.slide];
 if(!slide||![4,10,40].includes(state.objective)||!Number.isFinite(state.focus)||state.focus<0||state.focus>100)throw Error('Invalid synthetic microscopy settings');
 const target=slide.focusTargets[state.objective],error=Math.abs(state.focus-target),limit={4:6,10:4,40:2}[state.objective];
 return {target,error,focused:error<=limit,ready:!!(state.prepared&&state.illumination&&state.centered&&error<=limit),magnification:10*state.objective,structures:slide.structures,simulationOnly:true};
}
export function microscopyAction(st,action,{ppe=false}={}){
 if(!st||!action||typeof action.kind!=='string')throw Error('Missing microscopy action');
 const s={...st,viewed:[...st.viewed],annotations:{...st.annotations},measurements:[...st.measurements]};
 if(action.kind!=='select'&&!ppe)throw Error('Complete laboratory PPE orientation before microscopy');
 switch(action.kind){
 case 'select':if(!TEACHING_SLIDES[action.slide])throw Error('Unknown synthetic teaching slide');s.slide=action.slide;s.prepared=false;s.centered=false;break;
 case 'prepare':s.prepared=!!action.value;break;
 case 'light':s.illumination=!!action.value;break;
 case 'center':if(!s.prepared)throw Error('Prepare slide before centering');s.centered=!!action.value;break;
 case 'objective':if(![4,10,40].includes(action.value))throw Error('Invalid objective');s.objective=action.value;break;
 case 'focus':if(!Number.isFinite(action.value)||action.value<0||action.value>100)throw Error('Focus out of range');s.focus=action.value;break;
 case 'observe':{
   const x=evaluateSyntheticView(s);if(!x.ready)throw Error('Prepare, illuminate, center and focus the synthetic slide');
   if(!Array.isArray(action.structures)||action.structures.length===0||action.structures.length>8||action.structures.some(v=>typeof v!=='string'))throw Error('Select structures visible in the teaching field');
   const selected=[...new Set(action.structures)],accurate=selected.length===x.structures.length&&selected.every(v=>x.structures.includes(v));
   s.annotations[s.slide]=selected;
   s.measurements.push({slide:s.slide,magnification:x.magnification,focus:s.focus,structures:selected,accurate});
   if(accurate&&!s.viewed.includes(s.slide))s.viewed.push(s.slide);
   break;
 }
 default:throw Error('Unsupported microscopy operation');
 }
 return s;
}
export function microscopyGrade(st,{ppe=false,interpretation=''}={}){
 const viewed=new Set(st.viewed),identified=[...viewed].filter(id=>st.measurements.some(m=>m.slide===id&&m.accurate));
 const parts={ppe:ppe?15:0,preparation:st.prepared?10:0,illumination:st.illumination?10:0,stage:st.centered?10:0,focus:evaluateSyntheticView(st).focused?15:0,identification:identified.length>=2?25:identified.length===1?10:0,interpretation:interpretation.trim().length>=30?15:0};
 const score=Object.values(parts).reduce((a,b)=>a+b,0);
 return {score,passed:ppe&&identified.length>=2&&score>=70&&parts.interpretation===15,parts,observations:identified.length,simulationOnly:true};
}
