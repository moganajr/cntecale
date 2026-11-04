/** CNTE-VSL: ideal low-voltage DC circuits; not a SPICE simulator. */
const positive=(n,name,min=.1,max=1e5)=>{if(!Number.isFinite(n)||n<min||n>max)throw RangeError(name+' out of range');return n};
export function equivalentResistance(topology,r1,r2){
 positive(r1,'R1');positive(r2,'R2');
 if(topology==='series')return r1+r2;
 if(topology==='parallel')return 1/(1/r1+1/r2);
 throw Error('Unknown topology');
}
export function analyzeCircuit({volts=6,r1=100,r2=200,topology='series',fault='none',switchClosed=true,ammeter='series',voltmeter='parallel',isolated=false,limitAmps=.5}={}){
 positive(volts,'Supply voltage',0,24);positive(limitAmps,'Current limit',.001,10);
 const resistance=equivalentResistance(topology,r1,r2);
 if(!['none','open','short'].includes(fault))throw Error('Unknown fault');
 if(!['series','parallel','absent','across-supply'].includes(ammeter))throw Error('Unknown ammeter placement');
 if(!['parallel','series','absent'].includes(voltmeter))throw Error('Unknown voltmeter placement');
 const wiringCorrect=ammeter==='series'&&voltmeter==='parallel';
 const risk=fault==='short'||ammeter==='across-supply';
 const expectedCurrent=volts/resistance;
 if(risk||expectedCurrent>limitAmps)return {status:'blocked',reason:risk?'Short-circuit or unsafe ammeter connection — do not energize.':'Predicted current exceeds source current limit.',resistance,current:null,voltage:null,branchCurrents:null,watts:null,wiringCorrect,overcurrent:true,canMeasure:false};
 if(isolated||!switchClosed||fault==='open')return {status:'open',reason:isolated?'Power isolated':fault==='open'?'Open-circuit fault':'Switch open',resistance,current:0,voltage:0,branchCurrents:[0,0],watts:0,wiringCorrect,overcurrent:false,canMeasure:false};
 if(!wiringCorrect)return {status:'incorrect',reason:ammeter!=='series'?'Ammeter must be in series.':'Voltmeter must be across the load.',resistance,current:null,voltage:null,branchCurrents:null,watts:null,wiringCorrect:false,overcurrent:false,canMeasure:false};
 const i1=topology==='series'?expectedCurrent:volts/r1;
 const i2=topology==='series'?expectedCurrent:volts/r2;
 return {status:'measured',reason:'Ideal DC measurement',resistance,current:expectedCurrent,voltage:volts,branchCurrents:[i1,i2],watts:volts*expectedCurrent,wiringCorrect:true,overcurrent:false,canMeasure:true};
}
export function gradePhysicsPractical({ppe=false,prepared=false,isolatedDuringWiring=false,correctMeters=false,measurements=[],notes='',unsafeAction=false}={}){
 const different=new Set(measurements.filter(x=>x.status==='measured').map(x=>x.topology)).size;
 const parts={safety:ppe?15:0,preparation:prepared?10:0,isolation:isolatedDuringWiring?15:0,connections:correctMeters?20:0,measurement:measurements.some(x=>x.status==='measured')?15:0,comparison:measurements.length>=2?15:0,interpretation:notes.trim().length>=30?10:0};
 const score=unsafeAction?0:Object.values(parts).reduce((a,b)=>a+b,0);
 return {score,passed:!unsafeAction&&score>=70&&different>=2,parts,topologiesMeasured:different,simulationOnly:true,unsafeAction};
}
