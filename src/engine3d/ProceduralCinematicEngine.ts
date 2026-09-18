import * as THREE from 'three';

export type CharacterSpec={
  id:string; name:string; height?:number; skin?:string; hair?:string; cloth?:string; accent?:string;
};

type Rig={root:THREE.Group;bones:Record<string,THREE.Bone>;targets:Record<string,THREE.Object3D>};

const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const mat=(color:string,roughness=.55,metalness=.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const skinMat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.52,metalness:0});

function bone(r:THREE.Object3D,name:string,parent:string,rig:Rig){const b=new THREE.Bone();b.name=name;rig.bones[name]=b;rig.bones[parent].add(b);return b;}

export function createProfessionalCharacter(spec:CharacterSpec):{group:THREE.Group;rig:Rig}{
  const h=clamp(spec.height||1.72,1.45,2.05), s=h/1.72;
  const group=new THREE.Group(); group.name=`CHARACTER_${spec.id}`;
  const rig:Rig={root:group,bones:{},targets:{}};
  const root=new THREE.Bone();root.name='root';rig.bones.root=root;group.add(root);
  const pelvis=bone(root,'pelvis','root',rig); pelvis.position.y=.88*s;
  const spine=bone(pelvis,'spine','pelvis',rig); spine.position.y=.27*s;
  const chest=bone(spine,'chest','spine',rig); chest.position.y=.30*s;
  const neck=bone(chest,'neck','chest',rig); neck.position.y=.25*s;
  const headB=bone(neck,'head','neck',rig); headB.position.y=.14*s;
  for(const side of ['l','r'] as const){const x=side==='l'?-1:1;
    const clav=bone(chest,`clavicle_${side}`,'chest',rig);clav.position.set(x*.16*s,.16*s,0);
    const ua=bone(clav,`upperarm_${side}`,`clavicle_${side}`,rig);ua.position.set(x*.23*s,-.01*s,0);
    const fa=bone(ua,`forearm_${side}`,`upperarm_${side}`,rig);fa.position.set(x*.29*s,-.02*s,0);
    const hand=bone(fa,`hand_${side}`,`forearm_${side}`,rig);hand.position.set(x*.25*s,0,0);
    for(const f of ['thumb','index','middle','ring','little']){const fb=bone(hand,`${f}_${side}`,`hand_${side}`,rig);fb.position.set(x*.04*s,.01*s,(f==='thumb'?.09:0));}
    const thigh=bone(pelvis,`thigh_${side}`,'pelvis',rig);thigh.position.set(x*.17*s,-.02*s,0);
    const calf=bone(thigh,`calf_${side}`,`thigh_${side}`,rig);calf.position.y=-.43*s;
    const foot=bone(calf,`foot_${side}`,`calf_${side}`,rig);foot.position.set(0,-.40*s,.04*s);
    const toe=bone(foot,`toe_${side}`,`foot_${side}`,rig);toe.position.set(0,-.02*s,.16*s);
  }

  const body=new THREE.Group();body.name='BODY_MESH';group.add(body);
  const clothing=mat(spec.cloth||'#26334b',.64,.04), skin=skinMat(spec.skin||'#b97852'), hair=mat(spec.hair||'#17191f',.82,0), accent=mat(spec.accent||'#d98d4d',.42,.08);
  const pelvisMesh=new THREE.Mesh(new THREE.SphereGeometry(.34*s,32,20),clothing);pelvisMesh.scale.set(1,.68,.72);pelvisMesh.position.y=.88*s;body.add(pelvisMesh);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34*s,.57*s,12,32),clothing);torso.position.y=1.20*s;torso.scale.set(1.03,1,0.78);body.add(torso);
  const neckMesh=new THREE.Mesh(new THREE.CylinderGeometry(.105*s,.12*s,.20*s,24),skin);neckMesh.position.y=1.61*s;body.add(neckMesh);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.30*s,40,28),skin);head.name='FACE';head.scale.set(.92,1.08,.92);head.position.y=1.88*s;body.add(head);
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(.245*s,32,20),skin);jaw.scale.set(1.05,.58,.82);jaw.position.set(0,1.76*s,.035*s);body.add(jaw);
  const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.315*s,40,20,0,Math.PI*2,0,Math.PI*.52),hair);hairCap.position.set(0,2.00*s,.005*s);body.add(hairCap);
  const eyeWhite=mat('#f3f0ea',.28,0), iris=mat('#4c6474',.3,.05), dark=mat('#17191f',.55,0);
  for(const x of[-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.052*s,20,14),eyeWhite);eye.name=`eye_${x<0?'l':'r'}`;eye.scale.z=.55;eye.position.set(x*.105*s,1.91*s,.276*s);body.add(eye);const ir=new THREE.Mesh(new THREE.SphereGeometry(.023*s,16,10),iris);ir.name=`iris_${x<0?'l':'r'}`;ir.position.set(x*.105*s,1.91*s,.302*s);body.add(ir);const brow=new THREE.Mesh(new THREE.CapsuleGeometry(.012*s,.09*s,5,10),dark);brow.name=`brow_${x<0?'l':'r'}`;brow.rotation.z=x*.22;brow.position.set(x*.105*s,2.005*s,.274*s);body.add(brow);}
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.055*s,.14*s,20),skin);nose.rotation.x=Math.PI/2;nose.position.set(0,1.83*s,.29*s);body.add(nose);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.075*s,.012*s,8,24,Math.PI),accent);mouth.name='mouthMesh';mouth.rotation.x=Math.PI/2;mouth.position.set(0,1.735*s,.292*s);body.add(mouth);
  for(const side of[-1,1]){for(const limb of['arm','forearm','thigh','calf'] as const){const isArm=limb==='arm'||limb==='forearm';const len=isArm?(limb==='arm'?.30:.27):(limb==='thigh'?.42:.40);const radius=isArm?.095:.12;const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius*s,len*s,10,20),clothing);mesh.name=`${limb}_${side<0?'l':'r'}`;mesh.position.set(side*(isArm?.55:.17)*s,(isArm?(limb==='arm'?1.27:1.02):(limb==='thigh'?.55:.16))*s,0);mesh.rotation.z=side*(isArm?.10:0);body.add(mesh);}}
  for(const side of[-1,1]){const shoe=new THREE.Mesh(new THREE.SphereGeometry(.15*s,20,12),dark);shoe.name=`shoe_${side<0?'l':'r'}`;shoe.scale.set(1.1,.45,1.5);shoe.position.set(side*.17*s,.05*s,.10*s);body.add(shoe);}
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.30*s,.018*s,8,32),accent);belt.rotation.x=Math.PI/2;belt.position.y=.92*s;body.add(belt);

  const skinnedAnchor=new THREE.Object3D();skinnedAnchor.name='RIG_ANCHOR';group.add(skinnedAnchor);skinnedAnchor.add(root);
  for(const name of ['hand_l','hand_r','foot_l','foot_r']){const t=new THREE.Object3D();t.name=`IK_${name}`;rig.targets[name]=t;group.add(t);}
  return {group,rig};
}

export function animateProfessionalCharacter(char:{group:THREE.Group;rig:Rig},time:number,mode='cinematicWalk'){
  const b=char.rig.bones;
  const speed=mode==='idle'?.7:1.65;
  const walk=Math.sin(time*speed);
  if(b.spine)b.spine.rotation.y=Math.sin(time*.65)*.025;
  if(b.chest){b.chest.rotation.z=Math.sin(time*.8)*.012;b.chest.rotation.y=Math.sin(time*.45)*.018;}
  if(b.head){b.head.rotation.y=Math.sin(time*.55)*.055;b.head.rotation.x=Math.sin(time*.75)*.018;}
  const q=(name:string)=>char.group.getObjectByName(name) as THREE.Object3D|null;
  const armL=q('arm_l'),armR=q('arm_r'),foreL=q('forearm_l'),foreR=q('forearm_r'),thighL=q('thigh_l'),thighR=q('thigh_r'),calfL=q('calf_l'),calfR=q('calf_r'),head=q('FACE'),mouth=q('mouthMesh');
  if(thighL&&thighR){thighL.rotation.x=walk*.30;thighR.rotation.x=-walk*.30;}
  if(calfL&&calfR){calfL.rotation.x=Math.max(0,-walk)*.18;calfR.rotation.x=Math.max(0,walk)*.18;}
  if(armL&&armR){armL.rotation.z=.10-walk*.22;armR.rotation.z=-.10+walk*.22;}
  if(foreL&&foreR){foreL.rotation.x=Math.max(0,walk)*.12;foreR.rotation.x=Math.max(0,-walk)*.12;}
  if(head)head.rotation.z=Math.sin(time*.7)*.01;
  if(mouth)mouth.scale.y=1+Math.abs(Math.sin(time*4.5))*.18;
}

export function createCinematicEnvironment(style='city'){
  const root=new THREE.Group();root.name='PROCEDURAL_ENVIRONMENT';
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(32,32),mat('#11161d',.92,0));floor.rotation.x=-Math.PI/2;root.add(floor);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(8,30),mat('#171b20',.88,0));road.rotation.x=-Math.PI/2;road.position.y=.004;root.add(road);
  const buildingMat=mat(style.includes('night')?'#151b25':'#252a32',.78,.03);
  for(let i=0;i<24;i++){const h=.7+(i*37%17)/10;const b=new THREE.Mesh(new THREE.BoxGeometry(.9+(i%3)*.18,h,.8),buildingMat);const lane=i%2?-1:1; b.position.set(lane*(2.2+(i%6)*.8),h/2,-8+Math.floor(i/3)*1.8);root.add(b);}
  for(let i=0;i<10;i++){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,1.9,10),mat('#333942',.45,.35));pole.position.set((i%2?-1:1)*1.65, .95,-7+i*1.5);root.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.075,12,8),mat('#ffd8a8',.28,.05));lamp.position.set((i%2?-1:1)*1.65,1.9,-7+i*1.5);root.add(lamp);}
  return root;
}

export function setupCinematicLighting(scene:THREE.Scene){
  scene.add(new THREE.HemisphereLight(0x9fb7d8,0x10131a,1.15));
  const key=new THREE.DirectionalLight(0xffd6b0,3.0);key.position.set(4,6,4);scene.add(key);
  const fill=new THREE.DirectionalLight(0x7fa4d8,1.0);fill.position.set(-4,3,1);scene.add(fill);
  const rim=new THREE.PointLight(0xff8b52,2.2,9);rim.position.set(-2,2.7,-2);scene.add(rim);
}

export function runCinematicPreview(el:HTMLDivElement,character?:CharacterSpec){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#070a0f');
  const camera=new THREE.PerspectiveCamera(42,Math.max(1,el.clientWidth)/Math.max(1,el.clientHeight),.05,100);camera.position.set(3.9,2.25,5.2);camera.lookAt(0,1.25,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;el.replaceChildren(renderer.domElement);
  setupCinematicLighting(scene);scene.add(createCinematicEnvironment('city-night'));
  let actor:ReturnType<typeof createProfessionalCharacter>|null=null;if(character){actor=createProfessionalCharacter(character);scene.add(actor.group);}
  const clock=new THREE.Clock();let alive=true;
  const resize=()=>{if(!alive)return;const w=el.clientWidth,h=el.clientHeight||1;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};window.addEventListener('resize',resize);
  const tick=()=>{if(!alive)return;const t=clock.getElapsedTime();if(actor){animateProfessionalCharacter(actor,t);actor.group.rotation.y=Math.sin(t*.22)*.08;}camera.position.x=3.9+Math.sin(t*.16)*.55;camera.position.z=5.2+Math.cos(t*.13)*.25;camera.lookAt(0,1.25,0);renderer.render(scene,camera);requestAnimationFrame(tick);};tick();
  return ()=>{alive=false;window.removeEventListener('resize',resize);renderer.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(m.material){const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>x.dispose());}});el.replaceChildren();};
}
