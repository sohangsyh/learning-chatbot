/* Exploration mode: walkable procedural landscape + zone interaction templates */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const T=W.terrain,Z=W.zones,CARD=C.cards;
const st={zone:-1,mood:0,shown:0,score:0,hints:0,notes:[],cam:'idle',yaw:0,pitch:0,drag:null,busy:true,roam:null,clickHandlers:[],sortWrong:0,gateWrong:0};
window.__ex=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});
E.bindDialog();E.parallax=0;
E.ENV.west_gray={sky:0xA9B1B4,hs:0xD9DCDA,hg:0x5E6658,hi:.8,sc:0xD8DCDC,si:.4,sp:[6,20,8]};
E.ENV.west_day={sky:0xA8D2EC,hs:0xF6F2E6,hg:0x6A7A54,hi:.72,sc:0xFFF0D4,si:.72,sp:[14,22,6]};
E.ENV.west_afternoon={sky:0xBFD4E2,hs:0xFFE8C8,hg:0x6A6A50,hi:.72,sc:0xFFD49A,si:.72,sp:[-14,14,4]};
E.ENV.west_sunset={sky:0xF0A878,hs:0xFFD0A8,hg:0x5A4A44,hi:.72,sc:0xFF9050,si:.8,sp:[-30,6,-10]};
E.ENV.west_dusk={sky:0x5A5A7A,hs:0x9A9AC0,hg:0x34303A,hi:.6,sc:0xC08AA0,si:.35,sp:[-30,3,-10]};
E.ENV.west_night={sky:0x141C34,hs:0x7088B8,hg:0x1E2230,hi:.5,sc:0x8AA0D8,si:.25,sp:[-8,18,-6]};
E.setEnv(Z.z1.env,true);E.scene.fog.near=30;E.scene.fog.far=190;
E.SPK={narrator:{name:'你',col:'#F4EBD6'},card:{name:'遊記筆記',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const r=E.rng(17);

/* ---------- terrain ---------- */
const g2=(x,z,cx,cz,h,rad)=>h*Math.exp(-((x-cx)**2+(z-cz)**2)/(2*rad*rad));
const bumps=[];
const pathPts=[].concat(...Object.values(W.paths)).concat(Z.z5.steps).concat([Z.z1.center]);
const segs=[];[W.paths.z1_z2,W.paths.z2_z3,W.paths.z3_z4,W.paths.z4_z5,Z.z5.steps].forEach(pp=>{for(let i=1;i<pp.length;i++)segs.push([pp[i-1],pp[i]]);});segs.push([[2,26],[2,15]]);segs.push([[10,40],[2,52]]);
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz||1;let t=((x-a[0])*dx+(z-a[1])*dz)/L;t=Math.max(0,Math.min(1,t));return Math.hypot(x-(a[0]+t*dx),z-(a[1]+t*dz));}
function nearPath(x,z,d){for(const p of pathPts)if(Math.hypot(x-p[0],z-p[1])<d)return true;for(const s of segs)if(segD(x,z,s[0],s[1])<d)return true;return false;}
for(let i=0;i<T.small_hills*3&&bumps.length<T.small_hills;i++){const x=-80+r()*160,z=-100+r()*170;if(nearPath(x,z,9)||Math.abs(z-T.river.z)<8||Math.hypot(x-T.mountain.pos[0],z-T.mountain.pos[1])<22)continue;bumps.push([x,z,1.4+r()*2.2,2.5+r()*2.5]);}
function H(x,z){
  let h=.6*Math.sin(x*.08)*Math.cos(z*.07)+.4*Math.sin((x+z)*.13);
  const m=T.mountain;let mh=g2(x,z,m.pos[0],m.pos[1],m.height,m.radius);if(mh>m.height-.7)mh=m.height-.7+(mh-(m.height-.7))*.15;h+=mh;
  const p=T.pavilion_hill;h+=g2(x,z,p.pos[0],p.pos[1],p.height,p.radius);
  T.other_hills.forEach(o=>h+=g2(x,z,o[0],o[1],o[2],9));bumps.forEach(b=>h+=g2(x,z,b[0],b[1],b[2],b[3]));
  const dz=z-T.river.z;h-=2.4*Math.exp(-(dz*dz)/(2*2.6*2.6));
  return h;
}
E.H=H;
(function(){
  const S=T.size,N=T.segments,geo=new THREE.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);geo.translate(T.center[0],0,T.center[1]);
  const pa=geo.attributes.position,col=new Float32Array(pa.count*3),c=new THREE.Color();
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=H(x,z);pa.setY(i,h);
    if(h<-.2)c.setHex(0xB8A27A);else if(h<3)c.setHex(0x86A85E);else if(h<9)c.setHex(0x6A9450);else if(h<16)c.setHex(0x7E8A5C);else c.setHex(0x9E907A);
    c.offsetHSL(0,0,(Math.sin(x*1.7)*Math.cos(z*1.3))*.03);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
  E.ground=new THREE.Mesh(geo,new THREE.MeshToonMaterial({vertexColors:true,gradientMap:E.M(0).gradientMap}));E.scene.add(E.ground);
  const rv=mesh(new THREE.PlaneGeometry(S,7.5),new THREE.MeshPhongMaterial({color:0x4F96C8,transparent:true,opacity:.8,shininess:80}),T.center[0],-.45,T.river.z,E.scene);rv.rotation.x=-Math.PI/2;E.river=rv;
  for(let z=14;z>-28;z-=1.1){const x=7+2.5*Math.sin(z*.15);const s=mesh(new THREE.PlaneGeometry(1.3,1.25),new THREE.MeshPhongMaterial({color:0x6FB0D8,transparent:true,opacity:.85}),x,H(x,z)+.06,z,E.scene);s.rotation.x=-Math.PI/2;s.rotation.z=Math.cos(z*.15)*.3;}
  for(let i=0;i<220;i++){const x=-100+r()*200,z=-110+r()*180;const h=H(x,z);if(nearPath(x,z,7.5)||h<.2||h>14||Math.abs(z-T.river.z)<5)continue;
    const K=E.ancientKit;if(K){const t=(r()<.6?K.pine(E.scene,x,z,.9+r()*.9):K.maple(E.scene,x,z));t.position.y=h-.05;if(t.userData.leaves&&h>6)t.userData.leaves.forEach(l=>l.material.color.setHex([0xC8642A,0xD8A03A,0xB84A2A][Math.floor(r()*3)]));}else E.tree(E.scene,x,z,.9+r()*1.1,r()<.45?'pine':'',[0x5E8F4C,0x6FA35A,0x4E7F45,0x7A9A4A][i%4]).position.y=h-.05;}
  if(E.ancientKit){const K=E.ancientKit;for(let i=0;i<70;i++){const x=-60+r()*120,z=-90+r()*150;const h=H(x,z);if(nearPath(x,z,3)||h<.3)continue;const rk=mesh(new THREE.DodecahedronGeometry(.4+r()*1.1,0),M(h>10?0x9E9484:0x8A8A7E,{flatShading:true}),x,h+.1,z,E.scene);rk.scale.y=.5+r()*.5;rk.rotation.y=r()*3;}
    for(let z=12;z<28;z+=1.6){[-1,1].forEach(sd=>{const x=-20+r()*40;if(nearPath(x,z,2.5))return;K.reeds(E.scene,x,T.river.z+sd*(3.6+r()*.6),6);});}
    const mt=K.tex(256,64,(c,W2,H2)=>{const g2=c.createRadialGradient(W2/2,H2/2,4,W2/2,H2/2,W2/2);g2.addColorStop(0,'rgba(255,255,255,.6)');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(0,0,W2,H2);});
    for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(40,6),new THREE.MeshBasicMaterial({map:mt,transparent:true,opacity:.45,depthWrite:false}));m.position.set(-40+r()*80,4+r()*3,-20-r()*70);m.rotation.y=r()-.5;E.scene.add(m);}}
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2,d=125+r()*25,hh=18+r()*22;const m=mesh(new THREE.ConeGeometry(16+r()*10,hh,5),M(0x7E93A6,{flatShading:true}),Math.cos(a)*d,hh/2-2,Math.sin(a)*d-10,E.scene);m.rotation.y=r()*3;}
  for(let i=0;i<16;i++){const g=new THREE.Group();const a=Math.PI*(.75+r()*.6),d=40+r()*50;g.position.set(Math.cos(a)*d,9+r()*6,-57+Math.sin(a)*d*.8);E.scene.add(g);for(let k=0;k<4;k++)mesh(new THREE.SphereGeometry(1.6+r()*1.6,10,8),new THREE.MeshLambertMaterial({color:0xFFFFFF,transparent:true,opacity:.85}),k*1.8-2.7,r()*.6,r()*1.2,g);}
})();
const Y=(x,z)=>H(x,z);
function place(o,x,z,dy){o.position.set(x,Y(x,z)+(dy||0),z);return o;}

/* props */
const P={};
(function(){
  const z1=Z.z1;const K=E.ancientKit;
  if(K){const tg=new THREE.Group();tg.position.y=Y(0,62)-.15;E.scene.add(tg);K.paving(tg,16,14,0,60);
    [[-7,64,0,'客棧'],[7,65,0,'酒'],[0,69,0,null],[-9,57,Math.PI/2,null],[9,57.5,-Math.PI/2,'藥']].forEach(([x,z,ry,sg])=>K.building(tg,x,z,4.2,3,2.6,{ry,sign:sg||undefined,lanterns:!!sg}));
    const wl=new THREE.Group();wl.position.set(0,0,73);tg.add(wl);K.box(30,3.2,1.2,0x8A8478,0,1.6,0,wl);for(let i=-14;i<=14;i+=1.4)K.box(.7,.5,1.2,0x7A746A,i,3.45,0,wl);K.box(4,4.4,1.8,0x7A746A,0,2.2,0,wl);K.box(2,2.6,1.9,0x2A2420,0,1.3,0,wl);K.roof(wl,4.4,2.2,1.2,'grey',0,4.4,0);
    const ps=K.tex(256,96,(c,W2,H2)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W2,H2);c.fillStyle='#E8C060';c.font='bold 56px serif';c.textAlign='center';c.fillText('永州',W2/2,68);});K.panel(wl,1.4,.5,ps,0,3.5,-.95,Math.PI);
    [[-3,58],[3.5,60.5],[-1,63.5]].forEach(([x,z],i)=>{const f=K.folk({hat:i===1?'farmer':undefined,basket:i===0});f.position.set(x,0,z);f.rotation.y=r()*6;tg.add(f);});}
  else [[-7,64,0],[7,65,.2],[0,69,0],[-9,57,.5]].forEach(([x,z,ry],i)=>{const h=E.house(E.scene,x,z,3.6,3,2.4,0xE6D6B4,0x4D5862,ry);h.position.y=Y(x,z)-.1;});
  const nb=new THREE.Group();place(nb,...z1.pois.notice);E.scene.add(nb);box(.1,1.6,.1,0x6E4A32,-.5,.8,0,nb);box(.1,1.6,.1,0x6E4A32,.5,.8,0,nb);box(1.2,.8,.06,0xF0E6CC,0,1.3,0,nb);box(.9,.06,.07,0xC8452F,0,1.55,0,nb);
  const jr=new THREE.Group();place(jr,...z1.pois.jar);E.scene.add(jr);mesh(new THREE.SphereGeometry(.3,12,10),M(0x6E4A32),0,.3,0,jr);mesh(new THREE.CylinderGeometry(.1,.14,.2,10),M(0x6E4A32),0,.62,0,jr);
  const pt=new THREE.Group();place(pt,...z1.pois.path);E.scene.add(pt);for(let i=0;i<4;i++)box(.7,.08,.4,0xA89A80,0,.04+i*.02,-i*.5,pt);
  const rk=new THREE.Group();place(rk,...z1.pois.rock);E.scene.add(rk);mesh(new THREE.DodecahedronGeometry(.9,0),M(0x8A8478,{flatShading:true}),0,.6,0,rk).scale.set(1,1.4,.8);mesh(new THREE.DodecahedronGeometry(.5,0),M(0x9A9488,{flatShading:true}),.7,.3,.3,rk);
  P.notice=nb;P.jar=jr;P.path=pt;P.rock=rk;
  const pv=new THREE.Group();place(pv,Z.z2.center[0],Z.z2.center[1]);E.scene.add(pv);
  if(K){K.box(3.6,.35,3.6,0xA8A090,0,.17,0,pv);[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([x,z])=>K.box(.2,2.5,.2,0xA8322A,x,1.6,z,pv));for(let i=-1;i<=1;i+=2){K.box(2.8,.08,.08,0x8A2A1E,0,.8,i*1.4,pv);K.box(.08,.08,2.8,0x8A2A1E,i*1.4,.8,0,pv);}
    K.roof(pv,2.8,2.8,1.4,'green',0,2.85,0);const ts=K.tex(256,96,(c,W2,H2)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W2,H2);c.fillStyle='#E8C060';c.font='bold 56px serif';c.textAlign='center';c.fillText('西亭',W2/2,68);});K.panel(pv,1,.36,ts,0,2.62,1.52,0);
    const tp=new THREE.Group();tp.position.set(8,0,1);tp.rotation.y=-Math.PI/2;pv.add(tp);K.building(tp,0,0,6,3.4,3,{roof:'gold',rh:1.8,sign:'法華寺',lanterns:true});
    for(let i=0;i<3;i++)K.pine(pv,-6-(i%2),2+i*2.5,1.3);}
  else{[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([x,z])=>box(.18,2.4,.18,0xA8322A,x,1.2,z,pv));}
  const rf=mesh(E.roofGeo(),M(0x3F5A57),0,2.9,0,pv);rf.scale.set(2.3/.707,1.1,2.3/.707);box(3.2,.15,3.2,0xBFB094,0,.07,0,pv);
  const bt=new THREE.Group();bt.position.set(Z.z3.boat[0],-.42,Z.z3.boat[1]);E.scene.add(bt);box(1.3,.3,3,0x8A5A2B,0,.1,0,bt);box(1.1,.32,.25,0x6E4A32,0,.3,1.4,bt);box(1.1,.32,.25,0x6E4A32,0,.3,-1.4,bt);box(.05,1.6,.05,0x6E4A32,.5,.9,1.2,bt);if(K){const cn=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,1.4,12,1,true,0,Math.PI),M(0xA88A4A,{side:THREE.DoubleSide}));cn.rotation.z=Math.PI/2;cn.rotation.y=Math.PI/2;cn.position.set(0,.5,-.4);bt.add(cn);const bm=K.folk({hat:'farmer',robe:0x5A6A7A});bm.position.set(0,.25,1.1);bm.rotation.y=Math.PI;bt.add(bm);const oar=box(.05,.05,2.2,0x6E4A32,.55,.4,1.6,bt);oar.rotation.x=.4;}P.boat=bt;
  P.bushes=Z.z4.bushes.map(([x,z])=>{const g=new THREE.Group();place(g,x,z);E.scene.add(g);for(let k=0;k<7;k++)mesh(new THREE.IcosahedronGeometry(.45+r()*.35,0),M([0x3E6B3E,0x2E5A34,0x4E7A44][k%3],{flatShading:true}),(r()-.5)*1.1,.4+r()*.9,(r()-.5)*.8,g);for(let k=0;k<4;k++){const tw=box(.03,.7,.03,0x5A3A22,(r()-.5)*.8,.6,(r()-.5)*.5,g);tw.rotation.z=(r()-.5)*1.2;}box(.08,.6,.08,0x5A3A22,0,.3,0,g);g.userData.alive=true;return g;});
  const gr=Z.z4.grass;P.grass=new THREE.Group();E.scene.add(P.grass);for(let i=0;i<200;i++){const x=gr.x[0]+r()*(gr.x[1]-gr.x[0]),z=gr.z[0]+r()*(gr.z[1]-gr.z[0]);const c=mesh(new THREE.ConeGeometry(.07,1.3+r()*.7,4),M(r()<.5?0xC9B36A:0xB89E5A),x,Y(x,z)+.65,z,P.grass);c.rotation.z=(r()-.5)*.4;}
})();

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const PL=E.makeChar('player','P',[]);PL.speed=4.2;const CH=E.chars;
E.lampValue=()=>st.shown/100;
const sz=Z.z1.center;PL.root.position.set(sz[0],0,sz[1]+2);PL.target.copy(PL.root.position);
Object.entries(W.npc_follow).forEach(([s,o])=>{CH[s].root.position.set(sz[0]+o[0],0,sz[1]+2+o[2]);CH[s].target.copy(CH[s].root.position);});
const GK=CH.gatekeeper;const sumC=Z.z6.center;GK.root.position.set(sumC[0]+5,0,sumC[1]-5);GK.target.copy(GK.root.position);
let following=true;

/* ---------- camera ---------- */
function camFollow(){const c=GM.camera,pd=E.portrait;const d=pd?c.follow_dist_portrait:c.follow_dist,h=pd?c.follow_height_portrait:c.follow_height;
  const p=PL.root.position,o=V(Math.sin(st.yaw)*d,h,Math.cos(st.yaw)*d);return {p:p.clone().add(o),l:p.clone().add(V(0,1.2,0))};}
function camLook(){const eye=st.eye.clone();const dir=V(Math.sin(st.yaw+Math.PI)*Math.cos(st.pitch),Math.sin(st.pitch),Math.cos(st.yaw+Math.PI)*Math.cos(st.pitch));
  const back=dir.clone().multiplyScalar(-(st.backOff!=null?st.backOff:(E.portrait?2.6:1.6))).add(V(0,.5,0));return {p:eye.clone().add(back),l:eye.clone().add(dir.multiplyScalar(20))};}
E.cam.idle=t=>{let v;if(st.cam==='idle'){const a=t*.05;v={p:V(Math.sin(a)*14,Y(0,58)+8,58+Math.cos(a)*14),l:V(0,Y(0,58)+1.5,58)};}
  else if(st.cam==='follow')v=camFollow();else v=camLook();
  E.camera.position.lerp(v.p,.08);E.cam.look.lerp(v.l,.1);};
E.camera.position.set(0,Y(0,58)+8,72);E.cam.look.set(0,Y(0,58)+1,58);
const cv=E.canvas;
cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,yaw:st.yaw,pitch:st.pitch,moved:0};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{const d=st.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.moved=Math.max(d.moved,Math.hypot(dx,dy));
  if(st.cam==='follow'){const lim=GM.camera.follow_yaw_limit_deg*Math.PI/180;st.yaw=Math.max(-lim,Math.min(lim,d.yaw-dx*.006));}
  else if(st.cam==='look'){st.yaw=d.yaw-dx*.006;st.pitch=Math.max(-.6,Math.min(.35,d.pitch+dy*.004));}});
cv.addEventListener('pointerup',e=>{const d=st.drag;st.drag=null;if(d&&d.moved<8)tap(e);});
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
function tap(e){const rc=cv.getBoundingClientRect();pm.set((e.clientX-rc.left)/rc.width*2-1,-((e.clientY-rc.top)/rc.height)*2+1);ray.setFromCamera(pm,E.camera);
  for(const h of st.clickHandlers){if(h(ray))return;}}

/* follow logic & frame */
function onFrame(dt,t){
  st.shown+=(st.mood-st.shown)*Math.min(1,dt*2);moodHud();
  Object.values(CH).forEach(c=>{const p=c.root.position;p.y+=(Math.max(Y(p.x,p.z),-.2)-p.y)*Math.min(1,dt*12);});
  if(following){const p=PL.root.position;['companion','mentor','rival'].forEach(s=>{const c=CH[s];if(c.onArrive)return;const o=W.npc_follow[s];const want=V(p.x+o[0],0,p.z+o[2]);if(c.root.position.distanceTo(want)>1.4){c.target.copy(want);c.speed=PL.speed*1.05;}});}
  const rs=Math.max(.001,1-st.shown/100*.85);CH.rival.root.scale.setScalar(1.25*rs);
  if(st.fx)st.fx.forEach((f,i)=>{f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;f.m.material.opacity=Math.max(0,f.life);if(f.life<=0){E.scene.remove(f.m);f.dead=true;}});if(st.fx)st.fx=st.fx.filter(f=>!f.dead);
  if(st.fire){st.fire.forEach(f=>{f.scale.y=.6+Math.random()*.8;});}
  if(st.fogTo){const fg=E.scene.fog;fg.far+=(st.fogTo-fg.far)*Math.min(1,dt*.35);fg.near=Math.min(fg.near,fg.far*.4);}
  E.river.position.y=-.45+Math.sin(t*1.2)*.02;
}
function particles(pos,color,n,spd,g,life){st.fx=st.fx||[];for(let i=0;i<n;i++){const m=mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}),pos.x,pos.y,pos.z,E.scene);
  st.fx.push({m,v:V((Math.random()-.5)*spd,Math.random()*spd*1.2,(Math.random()-.5)*spd),g,life:life||1.2});}}

/* ---------- ui helpers ---------- */
function moodHud(){const v=Math.round(st.shown);$('mVal').textContent=v;$('mBar').style.width=v+'%';let nm='';C.meta.mood_stages.forEach(s=>{if(v>=s.min)nm=s.name;});$('mStage').textContent=nm;$('mGlow').setAttribute('opacity',(.15+v/100*.85).toFixed(2));}
function addMood(n){st.mood=Math.min(100,st.mood+n);}
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;
function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3600);}
async function showCard(id,by){const c=CARD[id];if(!st.notes.includes(id))st.notes.push(id);$('nbCount').textContent=st.notes.length;
  E.actions([]);await E.showLine(by||'card',c.quote,true);const p=document.createElement('p');p.className='plain';p.textContent=c.plain;
  await new Promise(res=>E.actions([p,E.btn('next','記下',res)]));}
async function task(text,nodes){E.actions([]);await E.showLine('narrator',text);E.actions(nodes||[]);}
function walkPath(pts){return new Promise(res=>{let i=0;const next=()=>{if(i>=pts.length){res();return;}const p=pts[i++];PL.target.set(p[0],0,p[1]);PL.onArrive=next;};next();});}
function marker(pos,label,onClick){const ring=mesh(new THREE.TorusGeometry(.35,.06,8,24),new THREE.MeshBasicMaterial({color:0xF2C14E}),pos.x,pos.y+2.2,pos.z,E.scene);
  const el=document.createElement('button');el.className='spot';el.textContent=label;$('spots').appendChild(el);const a={el,pos:pos.clone().add(V(0,2.8,0))};E.anchors.push(a);
  const m={ring,el,a,done:false,remove(){E.scene.remove(ring);el.remove();E.anchors.splice(E.anchors.indexOf(a),1);}};el.addEventListener('click',()=>onClick(m));return m;}
$('notebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>遊記筆記</h2><p class="sub">一路上收集到的句子。</p><ul class="notes">'+(st.notes.map(id=>'<li><b>'+CARD[id].quote+'</b><p>'+CARD[id].plain+'</p></li>').join('')||'<p class="sub">還沒有筆記。</p>')+'</ul><button class="primary" id="nbc">收起</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();});
$('assist').addEventListener('click',()=>{if(!st.taskText)return;st.hints++;addScore(-GM.scoring.hint_penalty);E.bubble('學伴（扣 '+GM.scoring.hint_penalty+' 分）',st.hintText||st.taskText,6000);});

/* ---------- zones ---------- */
function zoneCard(i,z){E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'程</small><h2>'+z.title+'</h2></div>',true);
  return Promise.race([E.sleep(E.RM?800:1800),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]).then(()=>E.clearOverlay());}
async function zRoam(z,i){
  st.cam='follow';const cfg=Z[z.id];await E.say('mentor',z.intro_mentor);E.emote(CH.rival,'hop');await E.say('rival',z.rival_line);
  const left=new Set(z.pois.map(p=>p.id));st.taskText='四處走走：點擊地面移動，點擊標籤調查。';st.hintText='畫面上有 '+left.size+' 個金色圓環，點擊它們的標籤。';
  await new Promise(res=>{const ms=z.pois.map(p=>{const pos=V(cfg.pois[p.id][0],Y(...cfg.pois[p.id]),cfg.pois[p.id][1]);
      return marker(pos,p.label,async m=>{if(st.busy||m.done)return;st.busy=true;const d=PL.root.position.clone().sub(pos);d.y=0;d.setLength(1.6);PL.target.copy(pos.clone().add(d));
        await new Promise(r=>PL.onArrive=r);m.done=true;m.remove();left.delete(p.id);await showCard(p.card);addMood(p.mood);E.hideDialog();st.busy=false;
        if(!left.size)res();else task('還有 '+left.size+' 處可以看看。點擊地面走動，點擊標籤調查。');});});
    st.clickHandlers=[ray=>{const hit=ray.intersectObject(E.ground)[0];if(hit&&!st.busy){const c=cfg.center;const p=hit.point;const d=Math.hypot(p.x-c[0],p.z-c[1]);const k=d>cfg.radius?cfg.radius/d:1;PL.target.set(c[0]+(p.x-c[0])*k,0,c[1]+(p.z-c[1])*k);PL.onArrive=null;return true;}return false;}];
    st.busy=false;task('四處走走：點擊地面移動，點擊標籤調查（共 '+left.size+' 處）。');});
  st.clickHandlers=[];await E.say('narrator',z.outro);
}
async function zSpot(z){
  const c=Z.z2.center;st.cam='look';st.eye=V(c[0]-.3,Y(c[0],c[1])+1.9,c[1]-2.5);st.backOff=.25;st.yaw=Math.atan2(5,9);st.pitch=-.02;
  await E.say('mentor',z.intro_mentor);st.taskText=z.task;st.hintText='西山在你的南面偏西，比四周所有的山都高，山頂是岩石。試試向左拖動。';
  const tgt=Z.z2.target,big=mesh(new THREE.SphereGeometry(9,8,6),new THREE.MeshBasicMaterial({visible:false}),tgt[0],Y(tgt[0],tgt[1])-4,tgt[1],E.scene);
  const others=T.other_hills.map(o=>mesh(new THREE.SphereGeometry(8,8,6),new THREE.MeshBasicMaterial({visible:false}),o[0],Y(o[0],o[1])-3,o[1],E.scene));
  E.fade.extra=[V(tgt[0],Y(tgt[0],tgt[1])+6,tgt[1])];
  let wrong=0;await new Promise(res=>{st.clickHandlers=[ray=>{const h=ray.intersectObjects([big].concat(others))[0];if(!h)return false;
      if(h.object===big){res();return true;}wrong++;E.floatBubble(CH.companion,z.wrong_line,2200);if(wrong===1){E.emote(CH.rival,'hop');E.floatBubble(CH.rival,z.rival_line,2400);}return true;}];
    task(z.task,[E.skipBtn(()=>{wrong=99;res();},'跳過，告訴我是哪座山')]);});
  st.clickHandlers=[];E.fade.extra=null;st.backOff=null;if(!wrong)addScore(GM.scoring.spot_first_try);if(wrong===99){st.yaw=.1;st.pitch=0;}E.flash(true);toast('就是它！','西山，比四周的小山都高，與眾不同。','ok');E.emote(CH.mentor,'hop');
  await showCard(z.card,'mentor');addMood(z.mood);st.cam='follow';st.yaw=0;
}
async function zRide(z){
  st.cam='follow';await E.say('mentor',z.intro_mentor);st.taskText=z.task;st.hintText='小船就在江邊，點擊它的標籤或船身。';
  const b=P.boat;await new Promise(res=>{const m=marker(b.position.clone().setY(0),'小船',mm=>{mm.remove();res();});
    st.clickHandlers=[ray=>{if(ray.intersectObject(b,true)[0]){m.remove();res();return true;}return false;}];task(z.task);});
  st.clickHandlers=[];E.actions([]);following=false;const crew=[PL,CH.companion,CH.mentor,CH.rival];const offs=[[0,-.6],[.3,.6],[-.3,0],[.2,1.1]];
  crew.forEach((c,k)=>{c.target.set(b.position.x+offs[k][0],0,b.position.z+offs[k][1]);c.speed=4;});await E.sleep(1400);
  const from=b.position.clone(),to=V(Z.z3.far_bank[0],-.42,Z.z3.far_bank[1]+1.8);
  await new Promise(res=>{let t=0;const iv=setInterval(()=>{t+=.02;const k=Math.min(1,t);const p=from.clone().lerp(to,k);b.position.copy(p);b.rotation.z=Math.sin(t*12)*.03;
      crew.forEach((c,j)=>{c.root.position.x=p.x+offs[j][0];c.root.position.z=p.z+offs[j][1];c.target.copy(c.root.position);});if(k>=1){clearInterval(iv);res();}},40);});
  E.river.material.color.setHex(0x4F96C8);following=true;PL.target.set(Z.z3.far_bank[0],0,Z.z3.far_bank[1]);await new Promise(r=>PL.onArrive=r);
  await showCard(z.card,'mentor');addMood(z.mood);
}
async function zClear(z){
  st.cam='follow';await walkPath(W.paths.z3_z4);await E.say('mentor',z.intro_mentor);E.emote(CH.rival,'hop');E.floatBubble(CH.rival,z.rival_line,2600);
  st.taskText=z.task_chop;st.hintText='擋路的深綠色叢木一共有 '+P.bushes.length+' 叢，逐一點擊它們。';
  let n=P.bushes.length;await new Promise(res=>{const ms=P.bushes.map(bg=>{const m=marker(bg.position.clone(),'叢木',mm=>chop(bg,mm));bg.userData.m=m;return m;});
    function chop(bg,m){if(!bg.userData.alive)return;bg.userData.alive=false;m.remove();E.emote(CH.companion,'hop');particles(bg.position.clone().add(V(0,.8,0)),0x3E6B3E,10,3,6,1);
      let s=1;const iv=setInterval(()=>{s-=.12;bg.scale.setScalar(Math.max(0,s));if(s<=0){clearInterval(iv);E.scene.remove(bg);}},40);n--;
      if(n<=0)res();else task(z.task_chop+'（還有 '+n+' 叢）');}
    st.clickHandlers=[ray=>{for(const bg of P.bushes){if(bg.userData.alive&&ray.intersectObject(bg,true)[0]){chop(bg,bg.userData.m);return true;}}return false;}];task(z.task_chop);});
  st.clickHandlers=[];toast('斫榛莽','叢木都砍掉了。','ok');await walkPath([[4,-13]]);
  st.taskText=z.task_burn;st.hintText='按下面的「點火」按鈕。';
  await new Promise(res=>task(z.task_burn,[E.btn('next','點火',res)]));E.actions([]);
  const gr=Z.z4.grass;st.fire=[];for(let i=0;i<24;i++){const x=gr.x[0]+Math.random()*(gr.x[1]-gr.x[0]),zz=gr.z[0]+Math.random()*(gr.z[1]-gr.z[0]);const f=mesh(new THREE.ConeGeometry(.35,1.3,6),new THREE.MeshBasicMaterial({color:Math.random()<.5?0xFF8A2A:0xFFC23A,transparent:true,opacity:.9}),x,Y(x,zz)+.6,zz,E.scene);st.fire.push(f);}
  E.flash(true,0xFF8A2A);await E.sleep(1600);let s=1;await new Promise(res=>{const iv=setInterval(()=>{s-=.05;P.grass.scale.y=Math.max(.02,s);st.fire.forEach(f=>f.material.opacity=Math.max(0,s));if(s<=0){clearInterval(iv);res();}},50);});
  st.fire.forEach(f=>E.scene.remove(f));st.fire=null;P.grass.children.forEach(c=>c.material=M(0x4A4038));particles(V(4,Y(4,-17)+1,-17),0x8A8A8A,20,2,-.5,2);
  await showCard(z.card,'mentor');addMood(z.mood);await walkPath(W.paths.z4_z5);
}
async function zClimb(z){
  st.cam='follow';await E.say('mentor',z.intro_mentor);st.taskText=z.task;st.hintText='連續按「攀援而登」，每按一次爬一段。';
  const steps=Z.z5.steps;let k=0;
  await new Promise(async res=>{const cnt=document.createElement('p');cnt.className='status';cnt.textContent='0 / '+steps.length;let busy=false;
    const b=E.btn('next','攀援而登',async()=>{if(busy)return;busy=true;b.disabled=true;const s=steps[k++];PL.target.set(s[0],0,s[1]);E.emote(PL,'hop');await new Promise(r=>PL.onArrive=r);
      cnt.textContent=k+' / '+steps.length;busy=false;b.disabled=false;if(k>=steps.length){b.disabled=true;res();}});
    await task(z.task,[cnt,b]);});
  E.actions([]);E.flash(true);await showCard(z.card,'mentor');addMood(z.mood);
}
async function zPanorama(z){
  const c=Z.z6.center;PL.target.set(c[0],0,c[1]);await new Promise(r=>PL.onArrive=r);
  st.cam='look';st.eye=V(c[0],Y(c[0],c[1])+2.1,c[1]);st.yaw=0;st.pitch=-.18;
  await E.say('mentor',z.intro_mentor);st.taskText=z.task;
  const left=new Set(z.sights.map(s=>s.id));
  await new Promise(res=>{z.sights.forEach(s=>{const a=s.dir*Math.PI/180,d=Z.z6.sight_dist[s.id];const x=c[0]+Math.sin(a)*d,zz=c[1]+Math.cos(a)*d;const pos=V(x,Math.max(Y(x,zz),0)+(s.id==='far'?6:1),zz);
      marker(pos,s.label,async m=>{if(st.busy||m.done)return;st.busy=true;m.done=true;m.remove();left.delete(s.id);await showCard(s.card);addMood(z.mood_each);E.hideDialog();st.busy=false;
        st.hintText='還有 '+left.size+' 處：'+z.sights.filter(q=>left.has(q.id)).map(q=>q.label).join('、')+'。向不同方向拖動畫面找找看。';
        if(!left.size)res();else task('還有 '+left.size+' 種景象。拖動畫面環顧四周。');});});
    st.hintText='四種景象分佈在東南西北四個方向，向左或向右拖動畫面。';st.busy=false;task(z.task+'（共 4 處）');});
  for(const id of z.after){await showCard(id,'mentor');addMood(4);}
}
async function zDusk(z){
  await E.say('mentor',z.intro_mentor);st.taskText=z.task;st.hintText='按「引觴滿酌」。';
  await new Promise(res=>task(z.task,[E.btn('next','引觴滿酌',res)]));E.actions([]);E.hideDialog();
  st.pitch=-.05;const seq=Z.z7.env_sequence;for(const e of seq){E.setEnv(e);await E.sleep(2600);}
  st.fogTo=Z.z7.fog_far_to;
  const sg=new THREE.BufferGeometry(),pts=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,b=Math.random()*Math.PI*.45;pts.push(Math.cos(a)*Math.cos(b)*150,Math.sin(b)*150+10,Math.sin(a)*Math.cos(b)*150-57);}
  sg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xFFFFFF,size:.9,fog:false}));E.scene.add(stars);
  await E.sleep(2000);await showCard(z.cards[0]);
  st.mood=z.mood;E.flash(true,0xBFD8FF);E.floatBubble(CH.companion,'先生，天黑了，還不回去嗎？',2600);await E.sleep(800);
  particles(CH.rival.root.position.clone().add(V(0,1,0)),0x9AA0B8,16,2,-.4,1.6);await E.sleep(400);await showCard(z.cards[1],'mentor');
}
const RUN={roam:zRoam,spot:zSpot,ride:zRide,clear:zClear,climb:zClimb,panorama:zPanorama,dusk:zDusk};

/* sorting + gate + ending */
async function sorting(){
  const S=C.sorting,ids=E.shuffle(S.cards);const sel={};let first=true;
  for(;;){const ok=await new Promise(async res=>{const wrap=document.createElement('div');
      const draw=()=>{wrap.innerHTML='';ids.forEach(id=>{const d=document.createElement('div');d.className='pz-row';d.innerHTML='<b>'+CARD[id].quote+'</b>';const ch=document.createElement('div');ch.className='chips';
        S.categories.forEach(cat=>ch.appendChild(E.btn('chipb'+(sel[id]===cat?' on':''),cat,()=>{sel[id]=cat;draw();})));d.appendChild(ch);wrap.appendChild(d);});sub.disabled=ids.some(id=>!sel[id]);};
      const sub=E.btn('next','完成分類',()=>res(ids.every(id=>sel[id]===CARD[id].category)));draw();E.actions([]);await E.showLine('gatekeeper',S.prompt);E.actions([wrap,sub,E.skipBtn(()=>res('skip'))]);});
    if(ok==='skip'){ids.forEach(id=>sel[id]=CARD[id].category);first=false;st.sortWrong=99;E.overlay('<div class="card"><h2>正確分類</h2><ul class="notes">'+S.categories.map(c=>'<li><b>'+c+'</b>'+ids.filter(id=>CARD[id].category===c).map(id=>'<p>'+CARD[id].quote+'</p>').join('')+'</li>').join('')+'</ul><button class="primary" id="nbc">明白了</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();break;}
    if(ok)break;first=false;st.sortWrong++;const bad=ids.filter(id=>sel[id]!==CARD[id].category);bad.forEach(id=>delete sel[id]);E.emote(GK,'shake');
    toast('有 '+bad.length+' 句分錯了','遊蹤寫去了哪裡、做了甚麼；景物寫看到的景色；感受寫心裡的想法。錯的已清空，再試一次。','bad');}
  addScore(first?C.sorting.cards.length*GM.scoring.sort_each:Math.max(4,C.sorting.cards.length*GM.scoring.sort_each-st.sortWrong*6));E.emote(GK,'hop');
}
async function gate(){
  for(const q of C.gate){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){w=99;break;}if(i===q.answer)break;w++;st.gateWrong++;dis.add(i);E.emote(GK,'shake');}
    if(w===99)await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);else{addScore(Math.max(2,GM.scoring.gate_first_try-w*GM.scoring.gate_wrong_penalty));await E.say('gatekeeper','對。'+q.explain);}}
}
async function main(){
  E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  const d={mentor:'被貶永州的文人，你陪他走這一程',companion:'隨行的僕人，負責開路',rival:'作者心中的憂懼。你的心境越開闊，它就越小',gatekeeper:'在山頂等候你'};
  E.overlay('<div class="card"><h2>同遊的人</h2><div class="cast"><div>'+E.glyph('P')+'<p style="margin:0"><b>你</b><br><span>柳宗元的同遊者。點擊地面走動，拖動畫面轉換視角。</span></p></div>'+Object.entries(C.npc_slots).map(([s,x])=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+d[s]+'</span></p></div>').join('')+
    '</div><p class="sub">一路上遇到的句子會記入「遊記筆記」。右上角的「心境」會隨行程變化。</p><button class="primary" id="go">出發</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;moodHud();
  for(let i=0;i<C.zones.length;i++){const z=C.zones[i];st.zone=i;await zoneCard(i,z);$('chapNo').textContent='第'+E.NUM[i]+'程';$('chapTitle').textContent=z.title;
    const env=Z[z.id].env;if(env)E.setEnv(env);
    if(i===1)await walkPath(W.paths.z1_z2);if(i===2){st.cam='follow';await walkPath(W.paths.z2_z3);}
    await RUN[z.type](z,i);E.hideDialog();st.taskText=null;}
  GK.target.copy(PL.root.position).add(V(1.6,0,-1.4));E.emote(GK,'hop');await E.sleep(800);
  await E.say('gatekeeper','你陪他從永州城走到這裡。整理一下你的遊記筆記吧。');await sorting();await gate();
  E.hideDialog();const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];
  E.overlay('<div class="card"><p class="sub" style="margin:0">遊記完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.notes.length+'</b>筆記</div><div><b>'+st.hints+'</b>提示</div></div>'+
    '<p style="margin-top:6px"><b>心境的變化</b></p><ul class="review">'+['exile','pavilion','special','merge'].map(id=>'<li><b>'+CARD[id].quote+'</b><p>'+CARD[id].plain+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">'+C.debrief+'</p><button class="primary" id="again">再遊一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
