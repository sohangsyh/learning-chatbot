/* OpenMAIC-GamePlay shared engine v0.2
   Renderer, toon materials, scene-kit helpers, environment presets,
   character factory with procedural animation, camera, 3D-anchored UI,
   dialog, assistant bubble and overlays. Game modes build on window.ENG. */
(function(){
"use strict";
const E={};window.ENG=E;
const RM=E.RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=E.$=id=>document.getElementById(id);
E.sleep=ms=>new Promise(r=>setTimeout(r,ms));
E.NUM=['一','二','三','四','五','六','七','八'];

/* renderer */
let canvas,renderer,scene,camera;
E.portrait=false;
E.init=function(opts){
  const sk=document.createElement('style');sk.textContent='.skipbtn{align-self:flex-start;background:none;border:1px dashed rgba(244,235,214,.4);border-radius:10px;padding:6px 12px;font-size:13px;color:#B8AD94;cursor:pointer}.skipbtn:hover{color:#F4EBD6;border-color:#E0B04B}';document.head.appendChild(sk);
  canvas=E.canvas=opts.canvas;
  renderer=E.renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  scene=E.scene=new THREE.Scene();
  camera=E.camera=new THREE.PerspectiveCamera(46,1,.1,500);
  E.hemi=new THREE.HemisphereLight(0xffffff,0x556644,.9);scene.add(E.hemi);
  E.sun=new THREE.DirectionalLight(0xffffff,.9);E.sun.position.set(12,22,10);scene.add(E.sun);
  scene.fog=new THREE.Fog(0xBFDDE8,40,170);scene.background=new THREE.Color(0xBFDDE8);
  E.onResize=opts.onResize||null;E.onFrame=opts.onFrame||null;
  addEventListener('resize',resize);resize();
};
function resize(){
  const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=camera.aspect<.85?54:46;camera.updateProjectionMatrix();
  const p=camera.aspect<.85;const changed=p!==E.portrait;E.portrait=p;if(E.onResize)E.onResize(changed);
}

/* materials & primitives */
let gm=null;const mats={};
E.M=function(hex,o){
  if(!gm){gm=new THREE.DataTexture(new Uint8Array([92,165,232]),3,1,THREE.LuminanceFormat);gm.minFilter=gm.magFilter=THREE.NearestFilter;gm.generateMipmaps=false;gm.needsUpdate=true;}
  const k=hex+(o?JSON.stringify(o):'');if(!mats[k])mats[k]=new THREE.MeshToonMaterial(Object.assign({color:hex,gradientMap:gm},o||{}));return mats[k];
};
E.mesh=function(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(parent)parent.add(m);return m;};
E.box=function(w,h,d,c,x,y,z,p){return E.mesh(new THREE.BoxGeometry(w,h,d),E.M(c),x,y,z,p);};
E.rng=function(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
E.shuffle=function(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
let RG=null;E.roofGeo=()=>{if(!RG){RG=new THREE.ConeGeometry(1,1,4);RG.rotateY(Math.PI/4);}return RG;};
E.house=function(parent,x,z,w,d,h,wall,roof,ry){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry||0;parent.add(g);
  E.box(w,h,d,wall,0,h/2,0,g);E.box(w+.12,.18,d+.12,0x6E4A32,0,h+.05,0,g);
  const rf=E.mesh(E.roofGeo(),E.M(roof),0,h+.62,0,g);rf.scale.set((w/2+.45)/.707,1.15,(d/2+.45)/.707);
  E.box(.7,1.3,.06,0x3B2A22,0,.65,d/2+.03,g);return g;
};
E.tree=function(parent,x,z,s,kind,canopy){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);
  E.mesh(new THREE.CylinderGeometry(.13,.18,1.1,6),E.M(0x7A5236),0,.55,0,g);
  if(kind==='pine'){E.mesh(new THREE.ConeGeometry(.9,1.5,7),E.M(0x3E6B4E,{flatShading:true}),0,1.5,0,g);E.mesh(new THREE.ConeGeometry(.65,1.2,7),E.M(0x4A7C59,{flatShading:true}),0,2.2,0,g);}
  else E.mesh(new THREE.IcosahedronGeometry(.95,0),E.M(canopy||0x6FA35A,{flatShading:true}),0,1.75,0,g);
  return g;
};
E.lanterns=[];
E.lantern=function(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  const b=E.mesh(new THREE.SphereGeometry(.5,12,10),E.M(0xC8452F,{emissive:0x7A1E10}),0,0,0,g);b.scale.set(.28,.34,.28);
  E.mesh(new THREE.CylinderGeometry(.09,.09,.06,8),E.M(0xE0B04B),0,.19,0,g);E.mesh(new THREE.CylinderGeometry(.09,.09,.06,8),E.M(0xE0B04B),0,-.19,0,g);E.lanterns.push(b);return g;};

/* environment */
E.ENV={
  morning:{sky:0xB9D6E2,hs:0xF4ECDC,hg:0x5C6E4C,hi:.72,sc:0xFFE2B0,si:.75,sp:[12,22,10]},
  dusk:{sky:0xE6B08A,hs:0xFFD2A8,hg:0x6A5A4A,hi:.78,sc:0xFF9E5E,si:.9,sp:[-18,9,6]},
  overcast:{sky:0xA7B0AE,hs:0xD9DED9,hg:0x5E6658,hi:.85,sc:0xDDE3E0,si:.45,sp:[4,20,6]},
  night:{sky:0x1D2A44,hs:0x8EA2CC,hg:0x2B2E3A,hi:.55,sc:0xA9BCEB,si:.38,sp:[-8,18,-6]}
};
const env=E.env={cur:{sky:new THREE.Color(),hs:new THREE.Color(),hg:new THREE.Color(),sc:new THREE.Color(),hi:1,si:1},tgt:null,pulse:0,pulseColor:new THREE.Color(0xFFD27A),dim:0};
E.setEnv=function(name,instant){const e=E.ENV[name];env.tgt=e;if(instant){env.cur.sky.set(e.sky);env.cur.hs.set(e.hs);env.cur.hg.set(e.hg);env.cur.sc.set(e.sc);env.cur.hi=e.hi;env.cur.si=e.si;}};
E.flash=function(good,color){env.pulse=1;env.pulseColor.set(color!=null?color:(good?0xFFD27A:0x2A2440));};
const dimColor=new THREE.Color(0x4E4A58),tmpC=new THREE.Color(),sunT=new THREE.Vector3();
function updateEnv(dt){
  const e=env.tgt;if(!e)return;const k=Math.min(1,dt*1.4);
  env.cur.sky.lerp(tmpC.set(e.sky),k);env.cur.hs.lerp(tmpC.set(e.hs),k);env.cur.hg.lerp(tmpC.set(e.hg),k);env.cur.sc.lerp(tmpC.set(e.sc),k);
  env.cur.hi+=(e.hi-env.cur.hi)*k;env.cur.si+=(e.si-env.cur.si)*k;sunT.set(e.sp[0],e.sp[1],e.sp[2]);E.sun.position.lerp(sunT,k);
  const dim=env.dim*.38;const sky=env.cur.sky.clone().lerp(dimColor,dim);
  env.pulse*=Math.pow(.25,dt);if(env.pulse>.01)sky.lerp(env.pulseColor,env.pulse*.35);
  scene.background.copy(sky);scene.fog.color.copy(sky);
  E.hemi.color.copy(env.cur.hs);E.hemi.groundColor.copy(env.cur.hg);E.hemi.intensity=env.cur.hi*(1-dim*.5)+env.pulse*.25;
  E.sun.color.copy(env.cur.sc);E.sun.intensity=env.cur.si*(1-dim*.6);
  const night=env.tgt===E.ENV.night;E.lanterns.forEach(l=>l.material.emissive.setHex(night?0xD8501E:0x7A1E10));
}

/* characters: slot + skin; every skin follows the character spec (body, 2 eyes, 2 legs) */
E.PAL={G:[0xFF8A1C,0xD9631A],O:[0x10C77A,0x0A9E5E],A:[0x1677E8,0x0F55B8],I:[0xFDD015,0xE5A80E],P:[0xE8577E,0xC23E63]};
E.hex=n=>'#'+n.toString(16).padStart(6,'0');
const NAVY=0x0B1F5E;
function rrect(w,h,r){const s=new THREE.Shape();s.moveTo(-w+r,0);s.lineTo(w-r,0);s.quadraticCurveTo(w,0,w,r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,r);s.quadraticCurveTo(-w,0,-w+r,0);return s;}
function shapeFor(id){
  const S=[];let eyes;
  if(id==='A'){const s=new THREE.Shape();s.moveTo(-.54,0);s.lineTo(.54,0);s.lineTo(0,.95);s.closePath();S.push(s);eyes=[[-.14,.3,.13],[.14,.3,.13]];}
  if(id==='I'){S.push(rrect(.27,.96,.05));eyes=[[-.15,.64,.15],[.15,.64,.15]];}
  if(id==='P'){S.push(rrect(.3,.8,.28));eyes=[[-.12,.56,.12],[.12,.56,.12]];}
  if(id==='G'){const s=new THREE.Shape(),R=.46,r=.26,cy=.47,a0=.62,a1=Math.PI*2-.72;s.absarc(0,cy,R,a0,a1,false);s.absarc(0,cy,r,a1,a0,true);S.push(s);
    const t=new THREE.Shape();const P=[[.14,.62],[.62,.62],[.62,.14],[.5,.14],[.5,.42],[.27,.19],[.18,.28],[.41,.5],[.14,.5]];t.moveTo(P[0][0],P[0][1]);P.slice(1).forEach(p=>t.lineTo(p[0],p[1]));t.closePath();S.push(t);
    eyes=[[-.16,.88,.13],[.1,.88,.13]];}
  if(id==='O'){const s=new THREE.Shape(),cy=.46;s.absarc(0,cy,.44,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,cy,.25,0,Math.PI*2,true);s.holes.push(hole);S.push(s);eyes=[[-.3,.78,.13],[-.05,.88,.13]];}
  return {S,eyes};
}
E.chars={};
E.makeChar=function(slot,id,costume){
  const [col,dk]=E.PAL[id];const {S,eyes}=shapeFor(id);const M=E.M,mesh=E.mesh,box=E.box;
  const root=new THREE.Group();scene.add(root);
  const hip=new THREE.Group();hip.position.y=.47;root.add(hip);const body=new THREE.Group();hip.add(body);
  S.forEach(s=>{const g=new THREE.ExtrudeGeometry(s,{depth:.26,bevelEnabled:true,bevelThickness:.05,bevelSize:.035,bevelSegments:3,curveSegments:28});g.translate(0,0,-.13);mesh(g,M(col),0,0,0,body);});
  const eyeObjs=eyes.map(([x,y,r])=>{const g=new THREE.Group();g.position.set(x,y,.2);body.add(g);
    const o=mesh(new THREE.CylinderGeometry(r+.03,r+.03,.03,28),M(col),0,0,-.012,g);o.rotation.x=Math.PI/2;
    const w=mesh(new THREE.CylinderGeometry(r,r,.035,28),new THREE.MeshBasicMaterial({color:0xffffff}),0,0,.006,g);w.rotation.x=Math.PI/2;
    const p=mesh(new THREE.CylinderGeometry(r*.56,r*.56,.03,24),new THREE.MeshBasicMaterial({color:NAVY}),0,0,.03,g);p.rotation.x=Math.PI/2;return {g,p,x,y,r};});
  const legs=[-1,1].map(sd=>{const piv=new THREE.Group();piv.position.set(sd*.13,.47,0);root.add(piv);
    box(.115,.44,.125,col,0,-.22,0,piv);box(.118,.07,.128,dk,0,-.06,0,piv);
    const f=mesh(new THREE.SphereGeometry(.5,14,10),M(col),sd*.07,-.44,.04,piv);f.scale.set(.34,.2,.3);return piv;});
  const sh=mesh(new THREE.CircleGeometry(.48,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.2,depthWrite:false}),0,.02,0,root);sh.rotation.x=-Math.PI/2;
  const c={slot,id,root,hip,body,eyes:eyeObjs,legs,target:new THREE.Vector3(),speed:3,phase:Math.random()*6,blinkAt:1+Math.random()*3,blinkT:0,emote:null,emoteT:0,talk:false,face:null,lookAt:null,onArrive:null};
  root.scale.setScalar(1.25);
  const bb=new THREE.Box3().setFromObject(body);const topY=bb.max.y;
  (costume||[]).forEach(k=>{
    if(k==='goggles'){const lensM=new THREE.MeshPhongMaterial({color:0xE8FAFF,transparent:true,opacity:.1,depthWrite:false,shininess:120,specular:0xFFFFFF});eyeObjs.forEach(e=>{mesh(new THREE.TorusGeometry(e.r+.05,.012,6,28),new THREE.MeshPhongMaterial({color:0xD8E6EE,transparent:true,opacity:.85}),e.x,e.y,.27,body);const l=mesh(new THREE.CircleGeometry(e.r+.045,28),lensM,e.x,e.y,.285,body);l.renderOrder=5;});
      const y=eyeObjs[0].y;box(Math.abs(eyeObjs[1].x-eyeObjs[0].x)-.1,.018,.012,0xD8E6EE,(eyeObjs[0].x+eyeObjs[1].x)/2,y,.27,body);}
    if(k==='hardhat'||k==='hardhat_o'){const hc=k==='hardhat'?0xF2C81A:0xF27A1A;const d=mesh(new THREE.SphereGeometry(.2,16,10,0,Math.PI*2,0,Math.PI/2),M(hc),0,topY-.05,0,body);d.scale.set(1,.85,1);mesh(new THREE.CylinderGeometry(.27,.27,.025,20),M(hc),0,topY-.05,0,body);box(.04,.08,.36,hc,0,topY+.08,0,body);}
    if(k==='cap'){const d=mesh(new THREE.SphereGeometry(.17,14,8,0,Math.PI*2,0,Math.PI/2),M(0xE0574A),0,topY-.04,0,body);d.scale.set(1,.8,1);box(.3,.025,.18,0xC23E33,0,topY-.03,.17,body);}
    if(k==='ru_hat'){box(.5,.04,.28,0x2A2A33,-.03,1.06,0,body);box(.22,.13,.2,0x2A2A33,-.03,1.14,0,body);}
    if(k==='coin'){const cn=mesh(new THREE.CylinderGeometry(.09,.09,.03,20),M(0xE8B93A,{emissive:0x4A3000}),0,.12,.205,body);cn.rotation.x=Math.PI/2;box(.04,.04,.035,0x3A2A10,0,.12,.225,body);}
    if(k==='tie'){box(.1,.05,.03,0x1E2A44,0,.36,.21,body);const t=box(.08,.22,.03,0x2F4A8A,0,.22,.21,body);}
    if(k==='hood'){const hd=mesh(new THREE.ConeGeometry(.32,.36,4),M(0x2A2F3A,{flatShading:true}),0,1.05,0,body);hd.rotation.y=Math.PI/4;}
    if(k==='beacon'){const lg=new THREE.Group();lg.position.set(0,1.32,0);body.add(lg);E.mesh(new THREE.CylinderGeometry(.12,.14,.07,12),M(0x4A4F58),0,-.04,0,lg);
      const dome=mesh(new THREE.SphereGeometry(.12,14,8,0,Math.PI*2,0,Math.PI/2),M(0x3FD08A,{emissive:0x1AA060}),0,0,0,lg);
      const pl=new THREE.PointLight(0x7CFFC0,1,8,1.5);lg.add(pl);c.lamp={g:lg,mat:dome.material.clone(),light:pl,beacon:true,baseY:1.32};dome.material=c.lamp.mat;}
    if(k==='lantern'){const lg=new THREE.Group();lg.position.set(.55,1.35,0);root.add(lg);
      const lb=mesh(new THREE.SphereGeometry(.5,14,10),M(0xC8452F,{emissive:0xFF7A2A}),0,0,0,lg);lb.scale.set(.3,.36,.3);
      mesh(new THREE.CylinderGeometry(.1,.1,.06,10),M(0xE0B04B),0,.2,0,lg);mesh(new THREE.CylinderGeometry(.1,.1,.06,10),M(0xE0B04B),0,-.2,0,lg);
      const pl=new THREE.PointLight(0xFFB050,1,9,1.5);lg.add(pl);c.lamp={g:lg,mat:lb.material.clone(),light:pl};lb.material=c.lamp.mat;}
  });
  E.chars[slot]=c;return c;
};
E.emote=function(c,type){c.emote=type;c.emoteT=0;};
E.lookFocus=null;E.lampValue=()=>.6;
const tv=new THREE.Vector3(),tv2=new THREE.Vector3(),tv3=new THREE.Vector3();
function updateChar(c,dt,t){
  const p=c.root.position;tv.copy(c.target).sub(p);tv.y=0;const dist=tv.length();let moving=false;
  if(dist>.04){moving=true;p.addScaledVector(tv.normalize(),Math.min(dist,c.speed*dt));}
  else if(c.onArrive){const f=c.onArrive;c.onArrive=null;f();}
  const yawT=moving?Math.atan2(tv.x,tv.z):(c.face!=null?c.face:Math.atan2(camera.position.x-p.x,camera.position.z-p.z));
  let dy=yawT-c.root.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.root.rotation.y+=dy*Math.min(1,dt*8);
  if(moving)c.phase+=dt*11;else c.phase+=(Math.round(c.phase/Math.PI)*Math.PI-c.phase)*Math.min(1,dt*10);
  const sw=Math.sin(c.phase)*(moving?.6:0);c.legs[0].rotation.x=sw;c.legs[1].rotation.x=-sw;
  let by=moving?Math.abs(Math.sin(c.phase))*.06:Math.sin(t*2+c.phase)*.008,sx=1,sy=1,rz=0;
  if(c.talk){const k=Math.sin(t*15)*.045;sy+=k;sx-=k*.6;}
  if(c.emote){c.emoteT+=dt;const e=c.emoteT;
    if(c.emote==='hop')by+=Math.max(0,Math.sin(e*9))*.35*Math.max(0,1-e/1.1);
    if(c.emote==='shake')rz=Math.sin(e*28)*.12*Math.max(0,1-e/.8);
    if(c.emote==='slump'){const f=Math.max(0,1-Math.max(0,e-1.2)/.6);sy-=.12*Math.sin(Math.min(1,e/.5)*Math.PI/2)*f;sx+=.06*f;}
    if(e>1.9)c.emote=null;}
  c.hip.position.y=.47+by;c.body.scale.set(sx,sy,1);c.body.rotation.z=rz;
  c.blinkAt-=dt;if(c.blinkAt<0){c.blinkT=.14;c.blinkAt=2+Math.random()*3.5;}
  let bl=1;if(c.blinkT>0){c.blinkT-=dt;bl=Math.max(.08,Math.abs(c.blinkT/.07-1));}
  let look;if(c.lookAt)look=tv2.copy(c.lookAt);else if(E.lookFocus&&E.lookFocus!==c)look=tv2.copy(E.lookFocus.root.position).add(tv3.set(0,1.3,0));else look=tv2.copy(camera.position);
  c.root.updateMatrixWorld();const loc=c.body.worldToLocal(look.clone());
  c.eyes.forEach(e=>{e.g.scale.y=bl;const v=tv3.set(loc.x-e.x,loc.y-e.y,loc.z-.2).normalize();e.p.position.x=v.x*e.r*.42;e.p.position.y=v.y*e.r*.42;});
  if(c.lamp){const b=E.lampValue();c.lamp.light.intensity=.25+b*1.9;if(c.lamp.beacon){c.lamp.mat.emissive.setRGB(.9-b*.8,.15+b*.6,.1+b*.3);c.lamp.light.color.setRGB(1-b*.5,.3+b*.7,.3+b*.45);}else{c.lamp.mat.emissive.setRGB(.25+b*.75,.12+b*.36,.04);c.lamp.g.position.y=1.35+Math.sin(t*1.6)*.06;c.lamp.g.rotation.z=Math.sin(t*1.3)*.08;}}
}

/* camera */
const cam=E.cam={p0:new THREE.Vector3(),p1:new THREE.Vector3(),l0:new THREE.Vector3(),l1:new THREE.Vector3(),look:new THREE.Vector3(),t:1,dur:1,res:null,idle:null};
const par={x:0,y:0,cx:0,cy:0};E.parallax=1;
addEventListener('pointermove',e=>{par.x=e.clientX/innerWidth-.5;par.y=e.clientY/innerHeight-.5;});
E.camTo=function(pos,look,dur){cam.p0.copy(camera.position);cam.l0.copy(cam.look);cam.p1.copy(pos);cam.l1.copy(look);cam.t=0;cam.dur=RM?.01:dur;return new Promise(r=>cam.res=r);};
E.camSet=function(pos,look){camera.position.copy(pos);cam.look.copy(look);cam.t=1;};
function updateCam(dt,t){
  if(cam.t<1){cam.t=Math.min(1,cam.t+dt/cam.dur);const k=cam.t*cam.t*(3-2*cam.t);camera.position.lerpVectors(cam.p0,cam.p1,k);cam.look.lerpVectors(cam.l0,cam.l1,k);if(cam.t>=1&&cam.res){const r=cam.res;cam.res=null;r();}}
  else if(cam.idle)cam.idle(t);
  par.cx+=(par.x-par.cx)*Math.min(1,dt*3);par.cy+=(par.y-par.cy)*Math.min(1,dt*3);const pk=RM?0:E.parallax;
  camera.lookAt(cam.look.x+par.cx*.6*pk,cam.look.y-par.cy*.3*pk,cam.look.z);
}

/* 3D-anchored UI */
const pv=new THREE.Vector3();
E.project=function(v,el){pv.copy(v).project(camera);if(pv.z>1||Math.abs(pv.x)>1.15||Math.abs(pv.y)>1.15){el.style.visibility='hidden';return;}
  el.style.visibility='';el.style.left=((pv.x+1)/2*canvas.clientWidth)+'px';el.style.top=((1-pv.y)/2*canvas.clientHeight)+'px';};
const bubbles=[];
E.floatBubble=function(c,text,ms){const el=document.createElement('div');el.className='bub';el.textContent=text;$('bubbles').appendChild(el);const b={c,el};bubbles.push(b);
  setTimeout(()=>{el.remove();const i=bubbles.indexOf(b);if(i>=0)bubbles.splice(i,1);},ms||3000);};
E.anchors=[];


/* occlusion fade: anything between the camera and what it looks at becomes see-through */
E.fade={on:true,extra:null,list:new Map(),tick:0};
const fray=new THREE.Raycaster(),fdir=new THREE.Vector3();
function occlusion(dt){const F=E.fade;if(!F.on||!scene)return;const now=performance.now();F.tick++;
  for(const k in E.chars){const c=E.chars[k];if(c&&c.root)c.root.userData.isChar=true;}
  if(F.tick%4===0){const tg=[cam.look].concat(F.extra||[]);
    for(const t of tg){fdir.copy(t).sub(camera.position);const dist=fdir.length();if(dist<1)continue;fdir.normalize();fray.set(camera.position,fdir);fray.near=.2;fray.far=Math.max(.5,dist-.9);
      const hits=fray.intersectObjects(scene.children,true);
      for(const h of hits){const m=h.object;if(!m.isMesh||m.userData.noFade||m===E.ground||Array.isArray(m.material)||m.material.visible===false)continue;
        let o=m,isChar=false;while(o){if(o.userData&&o.userData.isChar){isChar=true;break;}o=o.parent;}if(isChar)continue;const g=m.geometry,p=g&&g.parameters;
        if(p&&((p.width&&p.width>30)||(p.radius&&p.radius>30)))continue;
        let rec=F.list.get(m);if(!rec){const src=m.material,cl=src.clone();cl.transparent=true;cl.depthWrite=false;rec={src,cl,base:src.transparent?src.opacity:1};cl.opacity=rec.base;m.material=cl;F.list.set(m,rec);}rec.seen=now;}}}
  F.list.forEach((rec,m)=>{const hid=now-rec.seen<450;const want=hid?Math.min(rec.base,.22):rec.base;rec.cl.opacity+=(want-rec.cl.opacity)*Math.min(1,dt*9);
    if(!hid&&Math.abs(rec.cl.opacity-rec.base)<.03){m.material=rec.src;rec.cl.dispose();F.list.delete(m);}});}
/* loop */
const clock=E.clock=new THREE.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  updateEnv(dt);updateCam(dt,t);
  Object.values(E.chars).forEach(c=>updateChar(c,dt,t));
  if(E.onFrame)E.onFrame(dt,t);
  occlusion(dt);
  bubbles.forEach(b=>E.project(tv.copy(b.c.root.position).add(tv2.set(0,2.35,0)),b.el));
  E.anchors.forEach(a=>{if(!a.el.hidden)E.project(a.pos,a.el);});
  renderer.render(scene,camera);requestAnimationFrame(frame);
}
E.start=()=>requestAnimationFrame(frame);

/* dialog */
E.SPK={};let typing=null;
E.setTalker=function(key){Object.values(E.chars).forEach(c=>c.talk=false);E.lookFocus=null;const c=E.chars[key];if(c){c.talk=true;E.lookFocus=c;}};
E.showLine=function(key,text,quote){
  const d=$('dialog');d.hidden=false;const s=E.SPK[key]||{name:key,col:'#F4EBD6'};$('whoName').textContent=s.name;$('whoDot').style.background=s.col;
  const line=$('line');line.classList.toggle('quote',!!quote);E.setTalker(key);
  if(typing){clearInterval(typing.id);typing=null;}
  const done=()=>{const c=E.chars[key];if(c)c.talk=false;};
  if(RM){line.textContent=text;done();return Promise.resolve();}
  line.textContent='';let i=0;
  return new Promise(res=>{typing={id:setInterval(()=>{i++;line.textContent=text.slice(0,i);if(i>=text.length){clearInterval(typing.id);typing=null;done();res();}},24),
    finish:()=>{clearInterval(typing.id);typing=null;line.textContent=text;done();res();}};});
};
E.actions=function(nodes){const a=$('actions');a.innerHTML='';nodes.forEach(n=>a.appendChild(n));};
E.btn=function(cls,html,on){const b=document.createElement('button');b.className=cls;b.innerHTML=html;b.addEventListener('click',on);return b;};
E.say=async function(key,text,opt){opt=opt||{};E.actions([]);await E.showLine(key,text,opt.quote);E.setTalker('');
  return new Promise(res=>{const b=E.btn('next',opt.btn||'繼續',()=>res());E.actions([b]);b.focus({preventScroll:true});});};
E.ask=async function(key,text,options,disabled,opts){E.actions([]);await E.showLine(key,text);
  return new Promise(res=>{const n=options.map((o,i)=>{const b=E.btn('opt','<span class="k">'+'甲乙丙丁戊'[i]+'</span><span>'+o+'</span>',()=>res(i));if(disabled&&disabled.has(i))b.disabled=true;return b;});if(opts&&opts.skip)n.push(E.skipBtn(()=>res(-1)));E.actions(n);});};
E.skipBtn=(fn,label)=>E.btn('skipbtn',label||'跳過，看答案',fn);
E.hideDialog=()=>{$('dialog').hidden=true;E.setTalker('');};
E.bindDialog=()=>$('dialog').addEventListener('click',e=>{if(typing&&!e.target.closest('button'))typing.finish();});

/* assistant bubble */
E.bubble=function(title,text,ms){const b=$('assistBubble');b.innerHTML='';const t=document.createElement('div');t.className='t';const s=document.createElement('span');s.textContent=title;
  const x=document.createElement('button');x.textContent='收起';x.onclick=()=>b.hidden=true;t.append(s,x);const p=document.createElement('div');p.textContent=text;b.append(t,p);b.hidden=false;
  clearTimeout(E._bt);if(ms)E._bt=setTimeout(()=>b.hidden=true,ms);};
E.hideBubble=()=>{$('assistBubble').hidden=true;};

/* overlays */
E.overlay=function(html,dim){const o=$('overlay');o.className=dim?'dim':'';o.innerHTML=html;return o;};
E.clearOverlay=function(){const o=$('overlay');o.innerHTML='';o.className='';};
E.waitClick=sel=>new Promise(r=>document.querySelectorAll(sel).forEach(b=>b.addEventListener('click',()=>r(b))));
E.glyph=function(id){const col=E.hex(E.PAL[id][0]);const eye='<circle cx="CX" cy="CY" r="4.2" fill="#fff"/><circle cx="CX" cy="CY" r="2.3" fill="#0B1F5E"/>';
  const e=pts=>pts.map(([x,y])=>eye.replace(/CX/g,x).replace(/CY/g,y)).join('');
  const sh={A:'<path d="M17 3 L31 27 H3 Z" fill="'+col+'" stroke="'+col+'" stroke-width="2" stroke-linejoin="round"/>'+e([[13,19],[21,19]]),
    I:'<rect x="11" y="2" width="12" height="27" rx="2" fill="'+col+'"/>'+e([[13,11],[21,11]]),
    G:'<path d="M26 9 A11 11 0 1 0 26 25" stroke="'+col+'" stroke-width="6" fill="none"/><path d="M20 17 L29 17 L29 26" stroke="'+col+'" stroke-width="4" fill="none"/>'+e([[12,7],[19,7]]),
    O:'<circle cx="17" cy="17" r="10" stroke="'+col+'" stroke-width="6" fill="none"/>'+e([[10,8],[17,6]]),
    P:'<rect x="9" y="5" width="16" height="24" rx="8" fill="'+col+'"/>'+e([[14,14],[20,14]])}[id];
  return '<svg viewBox="0 0 34 34" aria-hidden="true">'+sh+'</svg>';};
})();
