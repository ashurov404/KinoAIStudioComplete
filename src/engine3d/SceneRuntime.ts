import {Software3DEngine,material,vec,add3,sub3,norm3} from './Software3DEngine';

export type RuntimeCharacter={
  skin:string;hair:string;cloth:string;accent:string;height:number;age:number;gender:string;
  face?:string;voice?:string;hairLength?:number;clothWeight?:number;
};

const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

export function buildCharacter(engine:Software3DEngine,c:RuntimeCharacter,time=0){
  const h=c.height||1.72, walk=Math.sin(time*1.65), sway=Math.sin(time*1.7);
  const skin=material(c.skin||'#b97852',.72), hair=material(c.hair||'#17191f',.34),
    cloth=material(c.cloth||'#26334b',.62), accent=material(c.accent||'#d98d4d',.4,.1);
  // Body, head and simple facial landmarks.
  engine.sphere(vec(0,h*.86,0),.16,skin,22,16);
  engine.sphere(vec(0,h*.98,0),.13,hair,22,16);
  engine.capsule(vec(0,h*.58,0),.20,h*.42,cloth);
  engine.sphere(vec(-.052,h*.98,.126),.018,material('#f0eee8',.3),10,8);
  engine.sphere(vec(.052,h*.98,.126),.018,material('#f0eee8',.3),10,8);
  engine.sphere(vec(-.052,h*.98,.142),.009,material('#28333d',.25),8,6);
  engine.sphere(vec(.052,h*.98,.142),.009,material('#28333d',.25),8,6);
  // Lip opening is driven by dialogue phoneme envelope approximation.
  const speech=Math.abs(Math.sin(time*(c.voice?5.4:2.2)))*.018;
  engine.box(vec(0,h*.895,.145),vec(.06,.012+speech,.018),accent);
  // Limbs + walk cycle.
  const armL=Math.sin(time*1.65)*.06, armR=-armL;
  engine.joint(vec(-.12,h*.68,0),vec(-.23,h*.34,armL),.055,skin);
  engine.joint(vec(.12,h*.68,0),vec(.23,h*.34,armR),.055,skin);
  engine.joint(vec(-.09,h*.36,0),vec(-.12,0,walk*.035),.065,cloth);
  engine.joint(vec(.09,h*.36,0),vec(.12,0,-walk*.035),.065,cloth);
  // Hair strands have deterministic wind and gravity response.
  engine.hair(vec(0,h*.96,0),28,clamp(c.hairLength||.18,.08,.35),hair,time);
  // Lightweight cloth secondary motion: two shoulder/hem accents.
  const clothWave=Math.sin(time*2.1)*.025*(1-clamp(c.clothWeight??.65,.1,1));
  engine.joint(vec(-.16,h*.72,0),vec(-.16,h*.42,clothWave),.025,cloth);
  engine.joint(vec(.16,h*.72,0),vec(.16,h*.42,-clothWave),.025,cloth);
  engine.box(vec(0,h*.61,-.205),vec(.06,.045,.025),accent);
}

export function buildEnvironment(engine:Software3DEngine,type:string,time=0){
  const ground=material('#20242b',.9),wall=material('#151a22',.85),neon=material('#d86f2f',.3,.1,.22);
  engine.box(vec(0,-.08,0),vec(14,.15,14),ground);
  if(type==='city'){
    for(let i=-7;i<=7;i++){
      const h=1.4+((i*i*13)%25)/10;
      engine.box(vec(i*1.15,h/2,-2.5),vec(.8,h,.8),wall);
      engine.box(vec(i*1.15,h*.58,-2.08),vec(.55,.08,.03),neon);
    }
  } else if(type==='forest'){
    for(let i=-5;i<=5;i++){
      engine.cylinder(vec(i*1.2,1,-2),.18,2,wall);
      engine.sphere(vec(i*1.2,2.05,-2),.7,material('#263d2a',.9),12,8);
    }
  } else {
    engine.box(vec(0,1,-3),vec(8,2,.2),wall);
  }
  engine.lights=[
    {position:vec(-3,5,4),color:{r:255,g:210,b:180},intensity:1.5,radius:10},
    {position:vec(4,3,2),color:{r:180,g:205,b:255},intensity:.8,radius:8},
    {position:vec(0,2,-4),color:{r:255,g:125,b:65},intensity:.55,radius:7}
  ];
  void time;
}

export type CameraShot={mode?:'orbit'|'push'|'static'|'tracking';progress?:number;fov?:number};

export function animateCamera(engine:Software3DEngine,time:number,mode='orbit',shot:CameraShot={}){
  const t=clamp(shot.progress??(time%1),0,1), fov=shot.fov||48;
  engine.camera.fov=fov;
  const kind=shot.mode||mode;
  if(kind==='orbit'){
    const a=t*Math.PI*2;engine.camera.position=vec(Math.sin(a)*7,2.4,Math.cos(a)*7);
  }else if(kind==='push'){
    engine.camera.position=vec(0,2.2,8-3*t);
  }else if(kind==='tracking'){
    engine.camera.position=vec(-4+8*t,2.1,6);
  }else{
    engine.camera.position=vec(0,2.1,8);
  }
  engine.camera.target=vec(0,1,0);
}

export function simulateSecondaryMotion(time:number,wind=1){
  return {hairWind:Math.sin(time*1.7)*.08*wind,clothWind:Math.sin(time*2.1)*.04*wind,gravity:9.81};
}
