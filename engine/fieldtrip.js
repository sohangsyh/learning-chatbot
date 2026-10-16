/* Field-trip mode: walk a river from source to sea, identify landforms, measure, analyse */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const SC=GM.scoring;
const st={site:-1,score:0,hints:0,rec:{},preds:{},cam:'idle',yaw:Math.PI,busy:false,clicks:[],fx:[],notes:[]};
window.__ft=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=0;
E.ENV.hk_day={sky:0xA6D2EE,hs:0xF6F4EA,hg:0x5E6E4A,hi:.74,sc:0xFFF2DC,si:.82,sp:[16,26,-10]};
E.setEnv('hk_day',true);E.scene.fog.near=70;E.scene.fog.far=300;
E.SPK={narrator:{name:'你',col:'#F4EBD6'},card:{name:'考察筆記',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const r=E.rng(23);
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));

/* ---------- river profile ---------- */
const RV=W.river,WFZ=RV.waterfall_z;
function amp(z){return z<-40?2.5:z<20?lerp(2.5,10,(z+40)/60):z<38?lerp(10,0,(z-20)/18):0;}
function rx(z){return amp(z)*Math.sin(z*.09);}
function rw(z){return z<-40?lerp(1.6,2.6,(z+95)/55):z<20?lerp(2.6,8,(z+40)/60):z<60?lerp(8,16,(z-20)/40):lerp(16,44,(z-60)/14);}
function hr(z){return z<WFZ?24-(z-RV.z0)*.18:z<-40?lerp(15,11,(z-WFZ)/22):z<20?lerp(11,3,(z+40)/60):z<60?lerp(3,.4,(z-20)/40):lerp(.4,-.3,(z-60)/12);}
function rdepth(z){return z<-40?.35:z<20?lerp(.35,.8,(z+40)/60):1;}
function side(z,dx){const up=dx*.95,mid=dx*.38,low=dx<22?dx*.04:.9+(dx-22)*.45;return z<-48?up:z<-32?lerp(up,mid,(z+48)/16):z<10?mid:z<26?lerp(mid,low,(z-10)/16):low;}
function H(x,z){const c=rx(z),w=rw(z),d=Math.abs(x-c)-w/2;let h=hr(z);
  if(d<0){const u=Math.abs(x-c)/(w/2);h-=rdepth(z)*(1-u*u)+.1;}else h+=Math.min(32,side(z,d))+(Math.sin(x*.21)*Math.cos(z*.17)+Math.sin((x-z)*.07))*.5*Math.min(1,d/4);
  if(z>66)h=Math.min(h,lerp(.1,-2,(z-66)/10)+(d>0?Math.min(6,d*.05):0));return h;}
E.H=H;
const bankX=(z,s)=>rx(z)+s*(rw(z)/2+2.6);
const trailX=z=>rx(z)-(rw(z)/2+5.5);
const bridges=[];

/* ---------- terrain & water ---------- */
(function(){
  const S0=220,N=170,geo=new THREE.PlaneGeometry(S0,S0,N,N);geo.rotateX(-Math.PI/2);geo.translate(0,0,-10);
  const pa=geo.attributes.position,col=new Float32Array(pa.count*3),c=new THREE.Color();
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=H(x,z);pa.setY(i,h);const d=Math.abs(x-rx(z))-rw(z)/2;
    if(d<.6)c.setHex(z<-40?0x7E7A70:z<20?0x9A8E72:0x8A7E62);else if(z>62&&h<.3)c.setHex(0x7A6650);else if(h-hr(z)>9)c.setHex(0x4E7A3E);else if(z>18&&d<22)c.setHex(0x8AAA5A);else c.setHex(0x5E8A46);
    c.offsetHSL(0,0,(Math.sin(x*1.3)*Math.cos(z*1.1))*.03);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
  E.ground=new THREE.Mesh(geo,new THREE.MeshToonMaterial({vertexColors:true,gradientMap:E.M(0).gradientMap}));E.scene.add(E.ground);
  const wt=tex(64,256,(x,w,h)=>{x.fillStyle='#4A8AB8';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){x.fillStyle='rgba(255,255,255,'+(.15+r()*.3)+')';x.fillRect(r()*w,r()*h,3+r()*10,2);}});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;st.wt=wt;
  const pts=[],uvs=[],idx=[];let k=0;for(let z=RV.z0;z<=66;z+=.5){const c2=rx(z),w=rw(z),y=hr(z)+.02;pts.push(c2-w/2,y,z,c2+w/2,y,z);uvs.push(0,(z-RV.z0)*.12,1,(z-RV.z0)*.12);if(k){const a=(k-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}k++;}
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));wg.setIndex(idx);wg.computeVertexNormals();
  const water=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({map:wt,transparent:true,opacity:.88,emissive:0x0A2A48,side:THREE.DoubleSide}));E.scene.add(water);
  const sea=mesh(new THREE.PlaneGeometry(260,80),new THREE.MeshLambertMaterial({color:0x3A7AA8,emissive:0x0A2A48}),0,-.12,104,E.scene);sea.rotation.x=-Math.PI/2;
  // waterfall: rock step + foam
  const wf=new THREE.Group();wf.position.set(rx(WFZ),0,WFZ);E.scene.add(wf);for(let i=0;i<9;i++){const rk=mesh(new THREE.DodecahedronGeometry(1+r()*.9,0),M(0x6E6A62,{flatShading:true}),(i-4)*1.1,hr(WFZ)-1+r()*.8,-.6,wf);rk.scale.set(1,1.5,1);}
  const fall=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3.2),new THREE.MeshLambertMaterial({map:wt,transparent:true,opacity:.85,emissive:0x3A6A98,side:THREE.DoubleSide}));fall.position.set(0,hr(WFZ)-1.4,.1);wf.add(fall);st.fallTex=wt;st.foam=V(rx(WFZ),hr(WFZ+.5)+.2,WFZ+.8);
  // boulders upper channel, potholes
  for(let i=0;i<40;i++){const z=-92+r()*44;const x=rx(z)+(r()-.5)*rw(z)*1.6;const b=mesh(new THREE.DodecahedronGeometry(.25+r()*.45,0),M(0x7E7A70,{flatShading:true}),x,H(x,z)+.1,z,E.scene);b.scale.y=.7;}
  const ph=new THREE.Group();const phz=-52.6,phx=rx(phz)+.1;ph.position.set(phx,hr(phz)-.02,phz);E.scene.add(ph);const bed=mesh(new THREE.CylinderGeometry(1.15,1.3,.22,10),M(0x77736A,{flatShading:true}),0,0,0,ph);bed.scale.set(1,1,.8);
  [[-.45,-.15,.3],[.4,.2,.24],[.1,-.45,.17]].forEach(([x,z,rr])=>{mesh(new THREE.CylinderGeometry(rr,rr*.85,.06,18),M(0x2E3A40),x,.1,z,ph);const wtr=mesh(new THREE.CircleGeometry(rr*.9,18),new THREE.MeshLambertMaterial({color:0x4A8AB8,emissive:0x0A2A48}),x,.14,z,ph);wtr.rotation.x=-Math.PI/2;for(let k=0;k<3;k++)mesh(new THREE.SphereGeometry(.05+Math.random()*.03,8,6),M(0xA8A496),x+(Math.random()-.5)*rr,.13,z+(Math.random()-.5)*rr,ph);});st.pothole=ph.position.clone();
  // trees
  for(let i=0;i<340;i++){const x=-100+r()*200,z=-110+r()*176;const d=Math.abs(x-rx(z))-rw(z)/2;if(d<4||z>60)continue;if(z>34&&z<60&&d<28)continue;const h=H(x,z);if(h<.3)continue;
    const t=new THREE.Group();t.position.set(x,h-.05,z);E.scene.add(t);const s=.8+r()*.9;t.scale.setScalar(s);mesh(new THREE.CylinderGeometry(.1,.16,1.4,6),M(0x5A3E2A),0,.7,0,t);
    if(r()<.7)for(let k2=0;k2<3;k2++)mesh(new THREE.IcosahedronGeometry(.7+r()*.3,0),M([0x4E8A3E,0x5E9A48,0x3E7A36][k2],{flatShading:true}),(r()-.5)*.8,1.6+r()*.5,(r()-.5)*.8,t);
    else for(let k2=0;k2<3;k2++)mesh(new THREE.ConeGeometry(.8-k2*.2,.9,7),M(0x2E5A3E,{flatShading:true}),0,1.3+k2*.55,0,t);}
  // meander landforms at site 2: river cliff (outer) & slip-off slope (inner)
  const z2=C.sites[1].z,c2=rx(z2),w2=rw(z2),outer=Math.sign(rx(z2+2)-rx(z2-2))||1;const os=Math.sign(c2)||1;
  const cliff=new THREE.Group();cliff.position.set(c2+os*(w2/2+.6),hr(z2)-.6,z2);E.scene.add(cliff);for(let i=0;i<8;i++){const b=box(1.2,2.6+r()*.8,1.2,0x8A6E52,0,1.2,(i-3.5)*1.1,cliff);b.rotation.y=r()*.3;}st.cliff=cliff.position.clone().add(V(0,2.6,0));
  const so=new THREE.Mesh(new THREE.PlaneGeometry(8,4.5),M(0xD8C89A));so.rotation.x=-Math.PI/2;so.rotation.z=os>0?-.12:.12;so.position.set(c2-os*(w2/2+1.6),hr(z2)+.12,z2);E.scene.add(so);for(let i=0;i<30;i++)mesh(new THREE.SphereGeometry(.07+r()*.05,6,4),M(0xB8A88A),so.position.x+(r()-.5)*6,so.position.y+.05,z2+(r()-.5)*3.6,E.scene);st.slip=so.position.clone().add(V(0,.4,0));st.outerSide=os;
  // villages & fields (middle/lower)
  const vh=tex(64,128,(x,w,h)=>{x.fillStyle='#F2EEE6';x.fillRect(0,0,w,h);for(let f=0;f<3;f++){x.fillStyle='#5A7A9A';x.fillRect(10,10+f*40,18,20);x.fillRect(36,10+f*40,18,20);x.fillStyle='#B8B4AC';x.fillRect(0,34+f*40,w,4);}});
  const house=(x,z)=>{const g=new THREE.Group();g.position.set(x,H(x,z)-.05,z);g.rotation.y=r()*.4;E.scene.add(g);const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,6,3.2),new THREE.MeshLambertMaterial({map:vh}));b.position.y=3;g.add(b);box(3.4,.2,3.4,0xC8B8A0,0,6.1,0,g);for(let f=1;f<3;f++)box(3.3,.08,.5,0x8A8E92,0,f*2+.2,1.85,g);};
  [[18,0],[22,6],[-20,-4],[-24,4],[16,24],[21,30],[-17,22],[-22,28],[-16,31]].forEach(([x,z])=>house(rx(z)+x,z));
  for(let i=0;i<10;i++){const z=14+r()*20,x=rx(z)+(r()<.5?-1:1)*(10+r()*8);const f=mesh(new THREE.PlaneGeometry(5,3.5),M([0x9ABA5A,0x7A9A4A,0xB8A86A][i%3]),x,H(x,z)+.05,z,E.scene);f.rotation.x=-Math.PI/2;f.rotation.z=r();}
  // channelised section in new town
  const ch=new THREE.Group();E.scene.add(ch);for(let z=38;z<60;z+=2){const w=rw(z);[-1,1].forEach(s=>{box(.5,1.6,2.1,0xA8A8A0,rx(z)+s*(w/2+.25),hr(z)+.2,z,ch);box(.06,.8,2.1,0x5A5E64,rx(z)+s*(w/2+.6),hr(z)+1.4,z,ch);const ct=box(1.4,.04,2.1,0xB8503A,rx(z)+s*(w/2+1.8),hr(z)+1.02,z,ch);});}
  const tw=tex(64,128,(x,w,h)=>{x.fillStyle='#D8D2C4';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<10;j++){x.fillStyle=r()<.25?'#6A8AA8':'#4A5A6A';x.fillRect(4+i*15,4+j*12,10,7);}});tw.wrapS=tw.wrapT=THREE.RepeatWrapping;
  for(let i=0;i<14;i++){const z=38+(i%7)*3.2,s=i<7?-1:1,x=rx(z)+s*(rw(z)/2+9+r()*6),h=22+r()*16;const t=tw.clone();t.needsUpdate=true;t.repeat.set(1.4,h/8);const b=new THREE.Mesh(new THREE.BoxGeometry(5,h,5),new THREE.MeshLambertMaterial({map:t}));b.position.set(x,H(x,z)+h/2-.2,z);E.scene.add(b);}
  st.channel=V(bankX(46,-1),H(bankX(46,-1),46),46);
  // estuary: mudflat, mangroves, fishponds
  const mud=mesh(new THREE.PlaneGeometry(60,10),M(0x7A6450),0,.0,68,E.scene);mud.rotation.x=-Math.PI/2;st.mudflat=V(-10,.4,69);
  for(let i=0;i<34;i++){const x=6+r()*22,z=63+r()*7;const m=new THREE.Group();m.position.set(x,Math.max(0,H(x,z)),z);E.scene.add(m);for(let k2=0;k2<4;k2++){const rt=mesh(new THREE.CylinderGeometry(.02,.03,.6,4),M(0x6A5A44),(r()-.5)*.4,.25,(r()-.5)*.4,m);rt.rotation.z=(r()-.5)*.8;}mesh(new THREE.IcosahedronGeometry(.6+r()*.3,0),M(0x2E5A34,{flatShading:true}),0,.8,0,m);}
  st.mangrove=V(16,1.4,66);
  for(let i=0;i<6;i++){const p=mesh(new THREE.PlaneGeometry(6,4),M(0x5A8AA0),-30+(i%3)*7,.08,58+Math.floor(i/3)*5,E.scene);p.rotation.x=-Math.PI/2;}
  for(let i=0;i<6;i++)mesh(new THREE.ConeGeometry(18+r()*10,24+r()*16,6),M(0x6E8296,{flatShading:true}),-90+i*36,8,-130-r()*10,E.scene);
  // trail with railings
  {const pts=[],uv=[],idx=[];let k=0;for(let z=-92;z<=60;z+=1){const x=trailX(z);const y=H(x,z)+.06;pts.push(x-.7,y,z,x+.7,y,z);if(k){const a=(k-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}k++;}
   const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));tg.setIndex(idx);tg.computeVertexNormals();const tm=new THREE.Mesh(tg,M(0xB8A07A));tm.userData.noFade=true;E.scene.add(tm);
   for(let z=-90;z<=58;z+=2.2){if(z>-36&&!C.sites.some(s2=>Math.abs(z-s2.z)<7))continue;const x=trailX(z)+.85;const y=H(x,z);box(.07,.9,.07,0x7A5A3A,x,y+.45,z,E.scene);box(.05,.05,2.2,0x8A6A44,x,y+.85,z+1.1,E.scene);box(.05,.05,2.2,0x8A6A44,x,y+.5,z+1.1,E.scene);}}
  // footbridges at measuring sites
  C.sites.filter(s2=>s2.data).forEach(s2=>{const z=s2.z,c=rx(z),w=rw(z),x0=c-w/2-1.6,x1=c+w/2+1.6,y=Math.max(hr(z)+1.1,Math.min(H(x0,z),H(x1,z))-.1);bridges.push({z,x0,x1,y});
    const b=new THREE.Group();b.position.set(0,0,z);E.scene.add(b);box(x1-x0,.12,1.3,0x8A6A44,(x0+x1)/2,y,0,b);[-.62,.62].forEach(dz=>{box(x1-x0,.06,.06,0x6A4A2A,(x0+x1)/2,y+1,dz,b);for(let x=x0;x<=x1;x+=1.2)box(.07,1,.07,0x6A4A2A,x,y+.5,dz,b);});
    [x0+.4,x1-.4,c].forEach(x=>box(.18,y-hr(z)+1,.18,0x6A6A62,x,(y+hr(z)-1)/2,0,b));
    const fl=new THREE.Group();fl.position.set(trailX(z+10)+.6,H(trailX(z+10)+.6,z+10),z+10);E.scene.add(fl);box(.04,1.4,.04,0xEDEDED,0,.7,0,fl);box(.4,.26,.02,0xE04A3A,.2,1.25,0,fl);});
  // estuary boardwalk / viewing deck
  {const z4=C.sites[3].z,x=trailX(z4)+2;const bw=new THREE.Group();bw.position.set(x,.9,z4);E.scene.add(bw);box(4,.12,3,0x8A6A44,0,0,0,bw);[[-2,-1.5],[2,-1.5],[-2,1.5],[2,1.5]].forEach(([a,b2])=>box(.12,1.8,.12,0x6A4A2A,a,-.4,b2,bw));box(4,.06,.06,0x6A4A2A,0,.9,1.5,bw);box(.06,.06,3,0x6A4A2A,2,.9,0,bw);st.deck={x,z:z4,y:1.0};}
  // signboards at sites
  C.sites.forEach((s,i)=>{const x=trailX(s.z)-1.4,z=s.z+1;const g=new THREE.Group();g.position.set(x,H(x,z),z);g.rotation.y=Math.PI;E.scene.add(g);box(.08,1.6,.08,0x5A3E2A,-.5,.8,0,g);box(.08,1.6,.08,0x5A3E2A,.5,.8,0,g);
    const t=tex(256,128,(c,W2,H2)=>{c.fillStyle='#1E5A3A';c.fillRect(0,0,W2,H2);c.fillStyle='#fff';c.font='bold 40px '+FONT;c.textAlign='center';c.fillText('考察點 '+(i+1),W2/2,52);c.font='bold 34px '+FONT;c.fillText(s.name,W2/2,98);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.7),new THREE.MeshLambertMaterial({map:t}));p.position.set(0,1.55,-.05);p.rotation.y=Math.PI;g.add(p);});
})();

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const PL=E.makeChar('player','P',[]);PL.speed=5;const CH=E.chars;E.lampValue=()=>Math.min(1,.25+st.score/220);
const GK=CH.gatekeeper;
function siteSpot(i){const z=C.sites[i].z;return V(trailX(z),0,z);}
const s0=V(trailX(-86),0,-86);PL.root.position.copy(s0);PL.target.copy(s0);
Object.entries(W.npc_follow).forEach(([s,o])=>{CH[s].root.position.set(trailX(s0.z+o[2]),0,s0.z+o[2]);CH[s].target.copy(CH[s].root.position);});GK.root.position.copy(siteSpot(0)).add(V(-1.6,0,2.6));GK.target.copy(GK.root.position);
let following=true;

/* camera */
const CF=W.camera;
E.cam.idle=t=>{let p,l;if(st.cam==='idle'){const a=t*.05,c=s0;p=V(c.x+Math.sin(a)*16,H(c.x,c.z)+9,c.z+Math.cos(a)*16);l=c.clone().setY(H(c.x,c.z)+1.5);}
  else if(st.cam==='follow'){const d=E.portrait?CF.follow_dist_portrait:CF.follow_dist,hh=E.portrait?CF.follow_height_portrait:CF.follow_height;const pp=PL.root.position;p=pp.clone().add(V(Math.sin(st.yaw)*d,hh,Math.cos(st.yaw)*d));l=pp.clone().add(V(0,1.2,0));}
  else{p=st.camP;l=st.camL;}E.camera.position.lerp(p,.08);E.cam.look.lerp(l,.1);};
const cv=E.canvas;cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:st.yaw,m:0};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{const d=st.drag;if(!d)return;d.m=Math.max(d.m,Math.abs(e.clientX-d.x));if(st.cam==='follow'&&d.m>6)st.yaw=d.y-(e.clientX-d.x)*.006;});
cv.addEventListener('pointerup',e=>{const d=st.drag;st.drag=null;if(d&&d.m<6)tap(e);});
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
function tap(e){const rc=cv.getBoundingClientRect();pm.set((e.clientX-rc.left)/rc.width*2-1,-((e.clientY-rc.top)/rc.height)*2+1);ray.setFromCamera(pm,E.camera);for(const h of st.clicks)if(h(ray))return;}
function look(p,l,dur){st.cam='fixed';st.camP=p;st.camL=l;return E.sleep((dur||1.4)*1000*(window.__fast?.2:1));}

/* frame */
function onFrame(dt,t){
  Object.values(CH).forEach(c=>{const p=c.root.position;let gy=Math.max(H(p.x,p.z),hr(p.z)+.05);for(const b of bridges)if(Math.abs(p.z-b.z)<.75&&p.x>b.x0-.3&&p.x<b.x1+.3)gy=b.y+.06;if(st.deck&&Math.abs(p.x-st.deck.x)<2.1&&Math.abs(p.z-st.deck.z)<1.6)gy=Math.max(gy,st.deck.y);p.y+=(gy-p.y)*Math.min(1,dt*12);});
  if(following){const p=PL.root.position;['companion','mentor','rival'].forEach(s=>{const c=CH[s];if(c.onArrive||c.hold)return;const o=W.npc_follow[s];const want=V(trailX(p.z+o[2]),0,p.z+o[2]);if(c.root.position.distanceTo(want)>1.5){c.target.copy(want);c.speed=PL.speed*1.05;}});}
  st.wt.offset.y-=dt*.35;
  if(Math.random()<.5){const f=st.foam;const m=new THREE.Mesh(new THREE.SphereGeometry(.08,5,4),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.8}));m.position.copy(f).add(V((Math.random()-.5)*1.2,0,0));E.scene.add(m);st.fx.push({m,v:V((Math.random()-.5)*.6,1+Math.random(),Math.random()*.8),g:4,life:.8});}
  for(let i=st.fx.length-1;i>=0;i--){const f=st.fx[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;f.m.material.opacity=Math.max(0,f.life);if(f.life<=0){E.scene.remove(f.m);st.fx.splice(i,1);}}
  if(st.floatObj){const o=st.floatObj;o.t+=dt;const k=Math.min(1,o.t/o.dur);const z=o.z0+k*10;o.m.position.set(rx(z),hr(z)+.08,z);if(k>=1&&o.done){const d=o.done;o.done=null;d();}}
}

/* ui helpers */
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
function walkPath(pts){return new Promise(res=>{let i=0;const next=()=>{if(i>=pts.length){res();return;}const p=pts[i++];PL.target.copy(p);PL.onArrive=next;};next();});}
function routeTo(z1){const z0=PL.root.position.z,pts=[];const n=Math.max(2,Math.ceil(Math.abs(z1-z0)/4));for(let i=1;i<=n;i++){const z=z0+(z1-z0)*i/n;pts.push(V(trailX(z),0,z));}return pts;}
async function ask(key,q,opts,answer,explain,pts){const dis=new Set();let w=0;for(;;){const i=await E.ask(key,q,opts,dis,{skip:true});if(i===-1){await E.say(key,'答案是「'+opts[answer]+'」。'+explain);return false;}
  if(i===answer){addScore(Math.max(2,pts-w*SC.check_wrong_penalty));E.emote(CH[key]||GK,'hop');await E.say(key,'正確。'+explain);return w===0;}w++;dis.add(i);E.emote(CH[key]||GK,'shake');}}
function notebookHTML(){const rows=C.sites.filter(s=>s.data).map(s=>{const r0=st.rec[s.id]||{};const f=(v,d)=>v==null?'—':v.toFixed(d);return '<tr><td>'+s.name+'</td><td>'+f(r0.width,1)+'</td><td>'+f(r0.depth,2)+'</td><td>'+f(r0.vel,2)+'</td><td>'+f(r0.q,2)+'</td><td>'+f(r0.peb,1)+'</td><td>'+(r0.round||'—')+'</td></tr>';}).join('');
  return '<div class="tw"><table class="dt"><tr><th>考察點</th><th>河寬 (m)</th><th>平均水深 (m)</th><th>流速 (m/s)</th><th>流量 (m³/s)</th><th>石塊大小 (cm)</th><th>圓度</th></tr>'+rows+'</table></div>';}
$('notebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>考察記錄</h2>'+notebookHTML()+'<p class="sub">流量 = 河寬 × 平均水深 × 流速</p><ul class="notes">'+st.notes.map(n=>'<li><b>'+n.t+'</b><p>'+n.d+'</p></li>').join('')+'</ul><button class="primary" id="nbc">收起</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;addScore(-SC.hint_penalty);E.bubble('王老師的提示（扣 '+SC.hint_penalty+' 分）',st.hint,6500);});

/* ---------- landforms ---------- */
function featurePos(id,s){const z=s.z;switch(id){
  case 'waterfall':return V(rx(WFZ),hr(WFZ)-.4,WFZ);case 'pothole':return st.pothole.clone().add(V(0,.4,0));case 'vvalley':return V(rx(z)+7,H(rx(z)+7,z-4)+1,z-4);
  case 'cliff':return st.cliff.clone();case 'slipoff':return st.slip.clone();case 'floodplain':return V(rx(z)+14,H(rx(z)+14,z)+.8,z+2);
  case 'mudflat':return st.mudflat.clone();case 'mangrove':return st.mangrove.clone();}}
async function landforms(s){const items=s.landforms.map((l,i)=>({l,pos:featurePos(l.id,s),letter:'ABCD'[i]}));
  const els=items.map(it=>{const el=document.createElement('button');el.className='spot';el.textContent=it.letter;$('spots').appendChild(el);const a={el,pos:it.pos};E.anchors.push(a);it.a=a;it.el=el;return el;});
  for(const it of E.shuffle(items.slice())){st.hint='留意每個標記的位置和形狀，對照「'+it.l.name+'」的特徵。';let wrong=0;
    await new Promise(async res=>{E.actions([]);await E.showLine('mentor',it.l.ask+'點擊畫面上的字母標記。');
      items.forEach(x=>{x.el.onclick=async()=>{if(x===it){addScore(wrong?2:SC.landform_first_try);x.el.classList.add('found');x.el.textContent=it.letter+' '+it.l.name;st.notes.push({t:it.l.name,d:it.l.card});await E.say('card',it.l.name+'：'+it.l.card);res();}else{wrong++;toast('不是這一個',x.letter+' 不是'+it.l.name+'。','bad');}};});
      E.actions([E.skipBtn(async()=>{it.el.classList.add('found');it.el.textContent=it.letter+' '+it.l.name;st.notes.push({t:it.l.name,d:it.l.card});await E.say('card',it.l.name+'是 '+it.letter+'：'+it.l.card);res();})]);});}
  await E.sleep(600);items.forEach(it=>{it.el.remove();E.anchors.splice(E.anchors.indexOf(it.a),1);});}

/* ---------- measurement ---------- */
async function measure(s){const d=s.data,z=s.z,c=rx(z),w=rw(z),y=hr(z);const rec=st.rec[s.id]={};const cp=CH.companion,br=bridges.find(b=>b.z===z);const dy=br.y;cp.hold=true;following=false;
  const goTo=(ch,pts)=>new Promise(res=>{let i=0;const nx=()=>{if(i>=pts.length){ch.onArrive=null;res();return;}ch.target.copy(pts[i++]);ch.onArrive=nx;};nx();});
  await look(V(c-2.5,dy+3.4,z+8),V(c,dy-.2,z),1.4);
  await stepBtn('mentor','我們在橋上量度，安全又準確。阿晴經橋走到對岸，你在這邊，把量尺沿水面拉直。','開始');
  await Promise.all([goTo(PL,[V(br.x0+.2,0,z+.15),V(c-w/2,0,z+.15)]),goTo(cp,[V(br.x0+.2,0,z-.2),V(br.x1-.4,0,z-.2),V(c+w/2,0,z-.2)])]);
  await stepBtn('companion','我到了對面河邊的橋頭！','拉直量尺');
  const tape=box(1,.03,.05,0xF2C81A,0,0,0,E.scene);tape.position.set(c-w/2,dy+.95,z);await anim(1,k=>{tape.scale.x=Math.max(.01,w*k);tape.position.x=c-w/2+w*k/2;});
  rec.width=d.width;toast('河寬 '+d.width.toFixed(1)+' m','由一邊水邊量到另一邊水邊，已記入考察記錄。','ok');addScore(SC.measure);
  const depths=[];for(let i=0;i<3;i++){await stepBtn('mentor',i===0?'量水深：在河面平均分佈的三點，從橋上把量尺垂直伸到河床。':'下一點。','量第 '+(i+1)+' 點水深');
    const x=c-w/2+w*(i+1)/4,bed=y-d.depths[i];const L=dy-bed+.3;const ru=box(.05,L,.05,0xE8E4DC,x,dy+.3+L/2,z+.5,E.scene);await anim(.6,k=>{ru.position.y=dy+.3+L/2-L*k*.98;});depths.push(d.depths[i]);toast('第 '+(i+1)+' 點：'+d.depths[i].toFixed(2)+' m','','');await E.sleep(400);E.scene.remove(ru);}
  rec.depth=depths.reduce((a2,b2)=>a2+b2,0)/3;toast('平均水深 '+rec.depth.toFixed(2)+' m',s.depth_note||'三點水深的平均值。','ok');addScore(SC.measure);if(s.depth_note)await E.say('mentor',s.depth_note);
  await stepBtn('mentor','量流速：從橋上把浮標輕輕放到河中央，計算它漂到下游 10 米的紅旗要多少秒。','放下浮標');
  const fm=mesh(new THREE.SphereGeometry(.15,10,8),M(0xF27A1A),0,0,0,E.scene);const tbox=document.createElement('p');tbox.className='timer';E.actions([tbox]);
  await look(V(c-4,dy+4.5,z+12),V(c,y,z+4),.6);await new Promise(res=>{st.floatObj={m:fm,t:0,z0:z,dur:(window.__fast?.25:1)*d.float_time/4,done:res};const iv=setInterval(()=>{if(!st.floatObj){clearInterval(iv);return;}tbox.textContent='計時：'+(st.floatObj.t/st.floatObj.dur*d.float_time).toFixed(1)+' 秒';},50);});
  st.floatObj=null;E.scene.remove(fm);rec.vel=10/d.float_time;E.actions([]);toast('10 m ÷ '+d.float_time+' 秒 = '+rec.vel.toFixed(2)+' m/s','流速已記錄。','ok');addScore(SC.measure);
  if(!st.floatNoted){st.floatNoted=1;await E.say('mentor',C.float_note);}
  const roundIdx=await new Promise(async res=>{E.actions([]);await E.showLine('mentor','最後，我在岸邊淺灘用長柄網撈起五塊石。你在岸上量度它們的大小（中軸長度），再判斷圓度。');
    const svg=d.pebbles.map(sz=>pebbleSVG(sz,d.roundness)).join('');const w2=document.createElement('div');w2.className='pebs';w2.innerHTML=svg+'<p class="status">大小（cm）：'+d.pebbles.join('、')+'　平均 '+(d.pebbles.reduce((a2,b2)=>a2+b2,0)/5).toFixed(1)+' cm</p>';
    const ch=document.createElement('div');ch.className='chips';C.roundness.forEach((rn,i)=>ch.appendChild(E.btn('chipb',rn,()=>res(i))));E.actions([w2,ch]);});
  rec.peb=d.pebbles.reduce((a2,b2)=>a2+b2,0)/5;rec.round=C.roundness[d.roundness];
  if(roundIdx===d.roundness){addScore(SC.measure);toast('判斷正確','這裡的石塊屬「'+rec.round+'」。','ok');}else toast('再看清楚','這些石塊屬「'+rec.round+'」。看看邊角是尖銳還是圓滑。','bad');
  rec.q=rec.width*rec.depth*rec.vel;E.scene.remove(tape);
  await Promise.all([goTo(cp,[V(br.x1-.4,0,z-.2),V(br.x0+.2,0,z-.2),V(trailX(z)-.2,0,z-1.6)]),goTo(PL,[V(br.x0+.2,0,z+.15),V(trailX(z),0,z)])]);cp.hold=false;following=true;
  await E.say('companion','流量 = 河寬 × 平均水深 × 流速 = '+rec.width.toFixed(1)+' × '+rec.depth.toFixed(2)+' × '+rec.vel.toFixed(2)+' ≈ '+rec.q.toFixed(2)+' m³/s。記好了！');}
function pebbleSVG(sz,round){const n=round===0?5:round===1?7:round===2?10:24,rad=14+sz*.6;let p='';for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=rad*(1+(round<2?(Math.sin(i*2.7)*.18):Math.sin(i*1.3)*.05));p+=(i?'L':'M')+(40+Math.cos(a)*rr*.95).toFixed(1)+' '+(40+Math.sin(a)*rr*.7).toFixed(1);}
  return '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="'+p+'Z" fill="#9A9488" stroke="#5A5650" stroke-width="2" stroke-linejoin="'+(round>=2?'round':'miter')+'"/></svg>';}
function anim(d,fn){return new Promise(res=>{const t0=performance.now();const D=Math.max(.01,d*(window.__fast?.15:1)*1000);const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
function stepBtn(sp,text,label){return new Promise(async res=>{E.actions([]);await E.showLine(sp,text);E.actions([E.btn('next',label,()=>{E.actions([]);res();})]);});}

/* ---------- flow ---------- */
async function site(i){const s=C.sites[i];st.site=i;st.cam='follow';st.yaw=Math.PI;
  E.overlay('<div class="chapcard"><small>'+s.title.split('：')[0]+'</small><h2>'+s.name+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1700),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  $('chapNo').textContent=s.title.split('：')[0];$('chapTitle').textContent=s.name;
  await walkPath(routeTo(s.z));GK.target.copy(PL.root.position).add(V(-1.8,0,2.2));
  const z=s.z;await look(V(bankX(z,-1)-5,hr(z)+7.5,z+12),V(rx(z),hr(z)+1,z-3));
  await E.say('mentor',s.intro);
  if(s.unsafe){const rv=CH.rival;rv.hold=true;const p0=rv.root.position.clone();rv.target.set(rx(z)-rw(z)/2-1.4,0,z+1.5);rv.speed=2.4;E.emote(rv,'hop');await E.say('rival',s.unsafe.rival);rv.target.copy(p0);E.emote(CH.mentor,'shake');E.flash(false,0xD8322A);await E.say('mentor',s.unsafe.mentor);rv.hold=false;}
  if(s.id==='s4'&&st.deck){await walkPath([V(trailX(z),0,z),V(st.deck.x,0,st.deck.z)]);}
  if(s.rival){E.emote(CH.rival,'hop');await E.say('rival',s.rival);}
  await landforms(s);
  if(s.predict){const p=s.predict;const i2=await E.ask('companion',p.question,p.options,null);st.preds[s.id]=i2;if(i2===p.answer)addScore(SC.predict_bonus);await E.say('companion','好，量完就知道了。');}
  if(s.data){await measure(s);if(s.predict){const ok=st.preds[s.id]===s.predict.answer;const r0=st.rec[s.id],r1=st.rec[C.sites[0].id];
    E.emote(ok?CH.companion:CH.rival,ok?'hop':'shake');await E.say('mentor','數據顯示：中游流速 '+r0.vel.toFixed(2)+' m/s，上游只有 '+r1.vel.toFixed(2)+' m/s。中游比上游'+(r0.vel>r1.vel?'快':'慢')+'！'+(ok?'你的預測正確。':'和「想當然」的估計剛好相反。'));}}
  await look(V(bankX(z,-1)-3,hr(z)+5.5,z+8),V(rx(z),hr(z)+1,z),.6);
  await ask('gatekeeper',s.check.question,s.check.options,s.check.answer,s.check.explain,SC.check_first_try);st.cam='follow';}
async function channel(){const c=C.channel;st.cam='follow';await walkPath(routeTo(46));await look(V(bankX(46,-1)-2,hr(46)+6,40),V(rx(46),hr(46)+1,48));
  await E.say('mentor',c.card);st.notes.push({t:c.title,d:c.explain});await ask('mentor',c.question,c.options,c.answer,c.explain,SC.check_first_try);}
async function analysis(){const sites=C.sites.filter(s=>s.data);await look(V(rx(30)-30,40,10),V(rx(30),5,20),2.2);
  await new Promise(async res=>{E.actions([]);await E.showLine('mentor','回到課室前，把三個考察點的數據畫成圖表，看看由上游到下游有甚麼規律。');const cvv=document.createElement('canvas');cvv.width=560;cvv.height=250;cvv.className='bars';drawChart(cvv,sites);E.actions([cvv,E.btn('next','分析數據',res)]);});
  for(const q of C.analysis)await ask('mentor',q.question,q.options,q.answer,q.explain,SC.check_first_try);}
function drawChart(cvv,sites){const x=cvv.getContext('2d'),W2=cvv.width,H2=cvv.height;x.fillStyle='#16202A';x.fillRect(0,0,W2,H2);
  const vars=[['河寬 (m)','width','#5FB49C'],['平均水深 (m)','depth','#7AB8FF'],['流速 (m/s)','vel','#F2C14E'],['流量 (m³/s)','q','#F08A74'],['石塊大小 (cm)','peb','#B8A88A']];const gw=(W2-30)/vars.length;
  vars.forEach(([lab,key,col],vi)=>{const vals=sites.map(s=>(st.rec[s.id]||{})[key]||0);const mx=Math.max(...vals,.001);const gx=20+vi*gw;
    vals.forEach((v,si)=>{const bh=v/mx*(H2-80);x.fillStyle=col;x.globalAlpha=.55+si*.2;x.fillRect(gx+si*(gw/3.6),H2-40-bh,gw/4.2,bh);x.globalAlpha=1;x.fillStyle='#F4EBD6';x.font='10px sans-serif';x.fillText(['上','中','下'][si],gx+si*(gw/3.6)+3,H2-28);});
    x.fillStyle='#F4EBD6';x.font='12px sans-serif';x.fillText(lab,gx,H2-10);});}
async function main(){
  E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">出發</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>考察隊</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">沿翠溪由上游走到河口，在四個考察點辨認地貌、量度河流。所有數據會記入「考察記錄」。</p><p class="sub">'+C.meta.river_note+'</p><button class="primary" id="go">開始考察</button></div>',true);
  await E.waitClick('#go');
  E.overlay('<div class="card"><h2>'+C.safety.title+'</h2><ol class="safety">'+C.safety.rules.map(x=>'<li>'+x+'</li>').join('')+'</ol><button class="primary" id="go">明白了，出發</button></div>',true);await E.waitClick('#go');
  E.clearOverlay();$('hud').hidden=false;await E.say('mentor',C.safety.mentor);
  for(let i=Math.max(0,(window.__startSite||1)-1);i<C.sites.length;i++){if(C.sites[i].z>46&&!st.channelDone){st.channelDone=1;await channel();}await site(i);}
  await analysis();E.hideDialog();const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));
  E.overlay('<div class="card"><p class="sub" style="margin:0">考察完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.notes.length+'</b>筆記</div><div><b>'+st.hints+'</b>提示</div></div>'+notebookHTML()+'<p style="font-family:var(--serif)">王老師：'+C.debrief+'</p><button class="primary" id="again">再考察一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
