/**
 * Compatibility facade for the own software 3D core.
 * This file intentionally contains no Three.js/WebGL dependency.
 * The real geometry/raster path lives in Software3DEngine + SceneRuntime.
 */
import {Software3DEngine, material, vec} from './Software3DEngine';

export type CharacterSpec={
  id:string; name:string; height?:number; skin?:string; hair?:string; cloth?:string;
  accent?:string; age?:number; gender?:string; face?:string; voice?:string;
};

export type RigBone={name:string;parent?:string;position:{x:number;y:number;z:number};rotation:{x:number;y:number;z:number}};
export type SoftwareRig={bones:Record<string,RigBone>;targets:Record<string,{x:number;y:number;z:number}>};
export type SoftwareCharacter={spec:CharacterSpec;rig:SoftwareRig};

const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

export function createProfessionalCharacter(spec:CharacterSpec):SoftwareCharacter{
  const h=clamp(spec.height||1.72,1.45,2.05), s=h/1.72;
  const bones:Record<string,RigBone>={};
  const add=(name:string,parent?:string,y=0,x=0,z=0)=>{bones[name]={name,parent,position:{x:x*s,y:y*s,z:z*s},rotation:{x:0,y:0,z:0}}};
  add('root'); add('pelvis','root',.88); add('spine','pelvis',.27); add('chest','spine',.30);
  add('neck','chest',.25); add('head','neck',.14);
  for(const side of ['l','r'] as const){
    const x=side==='l'?-1:1;
    add(`upperarm_${side}`,'chest',1.58,x*.35);
    add(`forearm_${side}`,`upperarm_${side}`,1.56,x*.62);
    add(`hand_${side}`,`forearm_${side}`,1.54,x*.86);
    add(`thigh_${side}`,'pelvis',.84,x*.17);
    add(`calf_${side}`,`thigh_${side}`,.41,x*.17);
    add(`foot_${side}`,`calf_${side}`,.02,x*.17,.06);
  }
  return {spec,rig:{bones,targets:{hand_l:{x:-.86*s,y:1.54*s,z:0},hand_r:{x:.86*s,y:1.54*s,z:0},foot_l:{x:-.17*s,y:.02*s,z:.06*s},foot_r:{x:.17*s,y:.02*s,z:.06*s}}}};
}

export function animateProfessionalCharacter(char:SoftwareCharacter,time:number,mode='cinematicWalk'){
  const b=char.rig.bones, speed=mode==='idle'?.7:1.65, walk=Math.sin(time*speed);
  if(b.spine)b.spine.rotation.y=Math.sin(time*.65)*.025;
  if(b.chest){b.chest.rotation.z=Math.sin(time*.8)*.012;b.chest.rotation.y=Math.sin(time*.45)*.018;}
  if(b.head){b.head.rotation.y=Math.sin(time*.55)*.055;b.head.rotation.x=Math.sin(time*.75)*.018;}
  for(const side of ['l','r'] as const){
    const sign=side==='l'?1:-1;
    if(b[`thigh_${side}`])b[`thigh_${side}`].rotation.x=walk*.30*sign;
    if(b[`calf_${side}`])b[`calf_${side}`].rotation.x=Math.max(0,-walk*sign)*.18;
    if(b[`upperarm_${side}`])b[`upperarm_${side}`].rotation.z=.10*sign-walk*.22*sign;
    if(b[`forearm_${side}`])b[`forearm_${side}`].rotation.x=Math.max(0,walk*sign)*.12;
  }
}

export function createCinematicEnvironment(style='city'){
  return {style,kind:'procedural',seed:style.length*7919};
}

/** Render one preview scene with the same own raster core used by the UI. */
export function renderSoftwarePreview(canvas:HTMLCanvasElement,character:CharacterSpec,style='city',time=0){
  const e=new Software3DEngine(canvas);
  e.resize();e.clear('#07090d');
  const h=character.height||1.72;
  e.sphere(vec(0,h*.86,0),.16,material(character.skin||'#b97852',.75));
  e.sphere(vec(0,h*.99,0),.13,material(character.hair||'#17191f',.35));
  e.capsule(vec(0,h*.58,0),.20,h*.42,material(character.cloth||'#26334b',.65));
  e.hair(vec(0,h*.98,0),24,.18,material(character.hair||'#17191f',.35),time);
  e.render();
  return e.renderFrame();
}
