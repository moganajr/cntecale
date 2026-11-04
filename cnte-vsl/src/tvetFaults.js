/** CNTE-VSL TVET low-voltage fault diagnosis. Idealized and simulation-only. */
export const FAULTS=Object.freeze({
 healthy:{label:'Healthy load',resistance:24},
 open:{label:'Open conductor',resistance:Infinity},
 short:{label:'Shorted load',resistance:0},
 high:{label:'High-resistance connection',resistance:120}
});
export function faultReadings({fault='healthy',volts=12,sourceIsolated=true,meter='continuity',currentLimit=.8}={}){
 const f=FAULTS[fault];if(!f)throw Error('Unknown fault');
 if(!Number.isFinite(volts)||volts<0||volts>24)throw Error('Supported DC range 0–24 V');
 if(!Number.isFinite(currentLimit)||currentLimit<=0||currentLimit>10)throw Error('Invalid current limit');
 if(!['continuity','resistance','voltage','current'].includes(meter))throw Error('Unknown meter function');
 const deadTest=meter==='continuity'||meter==='resistance';
 if(deadTest&&!sourceIsolated)return {status:'blocked',reason:'Isolate the source before resistance or continuity measurement.',reading:null,unit:null,hazard:true};
 if(!deadTest&&sourceIsolated)return {status:'blocked',reason:'Voltage/current test requires controlled energization.',reading:null,unit:null,hazard:false};
 const resistance=f.resistance;
 const predictedCurrent=Number.isFinite(resistance)&&resistance>0?volts/resistance:resistance===Infinity?0:Infinity;
 if(!deadTest&&(resistance===0||predictedCurrent>currentLimit))return {status:'blocked',reason:'Overcurrent or short detected: supply protection blocks energization.',reading:null,unit:null,hazard:true};
 if(meter==='continuity')return {status:'measured',reading:resistance<=30?'beep':'no beep',unit:'',hazard:false};
 if(meter==='resistance')return {status:'measured',reading:Number.isFinite(resistance)?resistance:'OL',unit:'Ω',hazard:false};
 if(meter==='voltage')return {status:'measured',reading:volts,unit:'V',hazard:false};
 return {status:'measured',reading:predictedCurrent,unit:'A',hazard:false};
}
export function diagnoseFault({fault,selected,measurements=[]}){
 if(!FAULTS[fault]||!FAULTS[selected])throw Error('Unknown diagnosis');
 const safeEvidence=measurements.some(x=>x.status==='measured'&&x.mode==='resistance'&&x.sourceIsolated);
 return {correct:fault===selected,evidence:safeEvidence,qualified:fault===selected&&safeEvidence};
}
export function gradeTVET({ppe=false,inspected=false,isolatedInitially=false,records=[],diagnoses=[],notes='',unsafeAttempt=false}={}){
 const unique=new Set(diagnoses.filter(x=>x.qualified).map(x=>x.fault));
 const parts={ppe:ppe?15:0,inspection:inspected?10:0,isolation:isolatedInitially?20:0,measurements:records.filter(x=>x.status==='measured').length>=3?20:0,diagnosis:unique.size>=3?20:unique.size===2?12:unique.size===1?6:0,report:notes.trim().length>=30?15:0};
 const score=unsafeAttempt?0:Object.values(parts).reduce((a,b)=>a+b,0);
 return {score,passed:!unsafeAttempt&&score>=70&&unique.size>=3,parts,identifiedFaults:unique.size,simulationOnly:true};
}
