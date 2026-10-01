export type V3={x:number;y:number;z:number};
export type Color={r:number;g:number;b:number};
export type Material={color:Color;roughness:number;metalness:number;emission:number;opacity?:number};
export type Camera={position:V3;target:V3;fov:number;near:number;far:number};
export type Light={position:V3;color:Color;intensity:number;radius:number};
export type Tri={a:V3;b:V3;c:V3;material:Material;normal?:V3};
export type Joint={name:string;position:V3;rotation:V3;parent?:string};
export type EngineFrame={width:number;height:number;pixels:Uint8ClampedArray};
const v=(x:number,y:number,z:number):V3=>({x,y,z});
const add=(a:V3,b:V3)=>v(a.x+b.x,a.y+b.y,a.z+b.z), sub=(a:V3,b:V3)=>v(a.x-b.x,a.y-b.y,a.z-b.z), mul=(a:V3,s:number)=>v(a.x*s,a.y*s,a.z*s);
const dot=(a:V3,b:V3)=>a.x*b.x+a.y*b.y+a.z*b.z, cross=(a:V3,b:V3)=>v(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
const len=(a:V3)=>Math.hypot(a.x,a.y,a.z), norm=(a:V3)=>{const n=len(a)||1;return mul(a,1/n)};
const clamp=(x:number,min=0,max=255)=>Math.max(min,Math.min(max,x));
const rotY=(p:V3,a:number)=>{const c=Math.cos(a),s=Math.sin(a);return v(p.x*c-p.z*s,p.y,p.x*s+p.z*c)};
const rotX=(p:V3,a:number)=>{const c=Math.cos(a),s=Math.sin(a);return v(p.x,p.y*c-p.z*s,p.y*s+p.z*c)};
const rotZ=(p:V3,a:number)=>{const c=Math.cos(a),s=Math.sin(a);return v(p.x*c-p.y*s,p.x*s+p.y*c,p.z)};
const transform=(p:V3,r:V3)=>rotZ(rotX(rotY(p,r.y),r.x),r.z);
const hex=(h:string):Color=>{const x=h.replace('#','');return x.length===3?{r:parseInt(x[0]+x[0],16),g:parseInt(x[1]+x[1],16),b:parseInt(x[2]+x[2],16)}:{r:parseInt(x.slice(0,2),16)||0,g:parseInt(x.slice(2,4),16)||0,b:parseInt(x.slice(4,6),16)||0}};

export class Software3DEngine{
 canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;tris:Tri[]=[];lights:Light[]=[];camera:Camera={position:v(0,2.1,8),target:v(0,1,0),fov:48,near:.05,far:100};
 width=640;height=360;zbuf:Float32Array;pixels:Uint8ClampedArray;
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;const c=canvas.getContext('2d');if(!c)throw Error('Canvas 2D unavailable');this.ctx=c;this.resize();this.zbuf=new Float32Array(this.width*this.height);this.pixels=new Uint8ClampedArray(this.width*this.height*4);}
 resize(){const r=this.canvas.getBoundingClientRect();this.width=Math.max(320,Math.floor(r.width||640));this.height=Math.max(180,Math.floor(r.height||360));this.canvas.width=this.width;this.canvas.height=this.height;this.zbuf=new Float32Array(this.width*this.height);this.pixels=new Uint8ClampedArray(this.width*this.height*4);}
 clear(bg='#07090d'){this.tris=[];this.ctx.fillStyle=bg;this.ctx.fillRect(0,0,this.width,this.height);this.zbuf.fill(Infinity);}
 tri(a:V3,b:V3,c:V3,m:Material){this.tris.push({a,b,c,material:m});}
 box(center:V3,size:V3,m:Material,ry=0,rx=0,rz=0){const [sx,sy,sz]=[size.x/2,size.y/2,size.z/2];const p=[v(-sx,-sy,-sz),v(sx,-sy,-sz),v(sx,sy,-sz),v(-sx,sy,-sz),v(-sx,-sy,sz),v(sx,-sy,sz),v(sx,sy,sz),v(-sx,sy,sz)].map(q=>add(transform(q,{x:rx,y:ry,z:rz}),center));const f=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]];for(const q of f){this.tri(p[q[0]],p[q[1]],p[q[2]],m);this.tri(p[q[0]],p[q[2]],p[q[3]],m)}}
 sphere(center:V3,r:number,m:Material,segments=20,rings=14){for(let j=0;j<rings;j++){const t0=Math.PI*j/rings-Math.PI/2,t1=Math.PI*(j+1)/rings-Math.PI/2;for(let i=0;i<segments;i++){const a0=2*Math.PI*i/segments,a1=2*Math.PI*(i+1)/segments;const p=(t:number,a:number)=>add(center,v(r*Math.cos(t)*Math.cos(a),r*Math.sin(t),r*Math.cos(t)*Math.sin(a)));const A=p(t0,a0),B=p(t0,a1),C=p(t1,a1),D=p(t1,a0);this.tri(A,B,C,m);this.tri(A,C,D,m)}}}
 cylinder(center:V3,r:number,h:number,m:Material,segments=18){for(let i=0;i<segments;i++){const a0=i*Math.PI*2/segments,a1=(i+1)*Math.PI*2/segments;const A=add(center,v(Math.cos(a0)*r,-h/2,Math.sin(a0)*r)),B=add(center,v(Math.cos(a1)*r,-h/2,Math.sin(a1)*r)),C=add(center,v(Math.cos(a1)*r,h/2,Math.sin(a1)*r)),D=add(center,v(Math.cos(a0)*r,h/2,Math.sin(a0)*r));this.tri(A,B,C,m);this.tri(A,C,D,m)}}
 capsule(center:V3,r:number,h:number,m:Material,ry=0){this.cylinder(center,r,h,m,18);this.sphere(add(center,v(0,h/2,0)),r,m,18,8);this.sphere(add(center,v(0,-h/2,0)),r,m,18,8);}
 joint(a:V3,b:V3,r:number,m:Material){const d=sub(b,a),h=len(d);if(h<.001)return;const mid=mul(add(a,b),.5);this.capsule(mid,r,h,m)}
 hair(center:V3,count:number,length:number,m:Material,time=0){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const sway=Math.sin(time*1.7+i*.7)*.025;const top=add(center,v(Math.cos(a)*.14,.02,Math.sin(a)*.14));const end=add(top,v(Math.cos(a)*(.12+sway),-length,Math.sin(a)*(.12+sway)));this.joint(top,end,.018,m)}}
 lookBasis(){const f=norm(sub(this.camera.target,this.camera.position)),r=norm(cross(f,v(0,1,0))),u=cross(r,f);return{f,r,u}}
 project(p:V3){const {f,r,u}=this.lookBasis();const q=sub(p,this.camera.position),z=dot(q,f);if(z<this.camera.near||z>this.camera.far)return null;const x=dot(q,r),y=dot(q,u),s=1/Math.tan(this.camera.fov*Math.PI/360),aspect=this.width/Math.max(1,this.height);return{x:(x*s/(z*aspect)*.5+.5)*this.width,y:(-.5-y*s/z*.5)*this.height,z}}
 shade(t:Tri){const n=norm(t.normal||cross(sub(t.b,t.a),sub(t.c,t.a)));const center=mul(add(add(t.a,t.b),t.c),1/3);let rr=.035,gg=.035,bb=.045;for(const l of this.lights){const d=sub(l.position,center),dist=Math.max(.2,len(d)),dir=mul(d,1/dist),nd=Math.max(0,dot(n,dir)),fall=l.intensity/(1+(dist*dist)/(l.radius*l.radius));rr+=nd*fall*l.color.r/255;gg+=nd*fall*l.color.g/255;bb+=nd*fall*l.color.b/255}const m=t.material;const view=norm(sub(this.camera.position,center));const fres=Math.pow(1-Math.max(0,dot(n,view)),5)*m.metalness*.4;return{r:clamp(m.color.r*(rr+fres)+m.emission*255),g:clamp(m.color.g*(gg+fres)+m.emission*255),b:clamp(m.color.b*(bb+fres)+m.emission*255)}}
 raster(t:Tri){const A=this.project(t.a),B=this.project(t.b),C=this.project(t.c);if(!A||!B||!C)return;const minX=Math.max(0,Math.floor(Math.min(A.x,B.x,C.x))),maxX=Math.min(this.width-1,Math.ceil(Math.max(A.x,B.x,C.x))),minY=Math.max(0,Math.floor(Math.min(A.y,B.y,C.y))),maxY=Math.min(this.height-1,Math.ceil(Math.max(A.y,B.y,C.y)));const area=(B.x-A.x)*(C.y-A.y)-(C.x-A.x)*(B.y-A.y);if(Math.abs(area)<.001)return;const n=norm(cross(sub(t.b,t.a),sub(t.c,t.a)));if(dot(n,sub(this.camera.position,t.a))<=0)return;const col=this.shade({...t,normal:n});for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const w0=((B.x-A.x)*(y-A.y)-(B.y-A.y)*(x-A.x))/area,w1=((C.x-B.x)*(y-B.y)-(C.y-B.y)*(x-B.x))/area,w2=1-w0-w1;if(w0>=0&&w1>=0&&w2>=0){const z=w0*A.z+w1*B.z+w2*C.z,idx=y*this.width+x;if(z<this.zbuf[idx]){this.zbuf[idx]=z;const o=idx*4;this.pixels[o]=col.r;this.pixels[o+1]=col.g;this.pixels[o+2]=col.b;this.pixels[o+3]=255}}}}
 render(){for(const t of this.tris)this.raster(t);const img=new ImageData(this.pixels,this.width,this.height);this.ctx.putImageData(img,0,0)}
 renderFrame(){this.render();return{width:this.width,height:this.height,pixels:new Uint8ClampedArray(this.pixels)}}
 drawGrid(size=14,step=1){this.ctx.save();this.ctx.globalAlpha=.12;this.ctx.strokeStyle='#7d8798';this.ctx.lineWidth=1;for(let x=-size;x<=size;x+=step){const a=this.project(v(x,0,-size)),b=this.project(v(x,0,size));if(a&&b){this.ctx.beginPath();this.ctx.moveTo(a.x,a.y);this.ctx.lineTo(b.x,b.y);this.ctx.stroke()}}for(let z=-size;z<=size;z+=step){const a=this.project(v(-size,0,z)),b=this.project(v(size,0,z));if(a&&b){this.ctx.beginPath();this.ctx.moveTo(a.x,a.y);this.ctx.lineTo(b.x,b.y);this.ctx.stroke()}}this.ctx.restore()}
}
export const material=(color:string,roughness=.55,metalness=0,emission=0):Material=>({color:hex(color),roughness,metalness,emission});
export const vec=v,add3=add,sub3=sub,mul3=mul,rotY3=rotY,rotX3=rotX,rotZ3=rotZ,norm3=norm;

export type RenderSequenceOptions={frames:number;fps:number;draw:(engine:Software3DEngine,frame:number,time:number)=>void};
export function renderSequence(canvas:HTMLCanvasElement,options:RenderSequenceOptions){
  const engine=new Software3DEngine(canvas),out:EngineFrame[]=[];
  const count=Math.max(1,Math.floor(options.frames)),fps=Math.max(1,options.fps||24);
  for(let i=0;i<count;i++){
    engine.resize();engine.clear('#07090d');options.draw(engine,i,i/fps);engine.render();
    out.push(engine.renderFrame());
  }
  return {fps,frames:out,width:engine.width,height:engine.height};
}
