/* Scene kit: ancient_town — market street, mountain tea pavilion, famine village, mansion at night */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
E.ENV.anc_morning={sky:0xBFDCEA,hs:0xFFF4E2,hg:0x6A6250,hi:.74,sc:0xFFE8C0,si:.78,sp:[14,20,10]};
E.ENV.anc_dusk={sky:0xE8A878,hs:0xFFD2A8,hg:0x5A4A40,hi:.72,sc:0xFF9A5A,si:.85,sp:[-18,8,6]};
E.ENV.anc_bleak={sky:0xB8AE9A,hs:0xE0D8C8,hg:0x6A5E4A,hi:.8,sc:0xE8D8B8,si:.5,sp:[6,18,8]};
E.ENV.anc_winter={sky:0xC8D4E0,hs:0xF4F8FC,hg:0x8A96A4,hi:.85,sc:0xE8EEF8,si:.5,sp:[6,18,10]};
E.ENV.anc_night={sky:0x1A2240,hs:0x8A9AC8,hg:0x2A2830,hi:.55,sc:0xA8B8E8,si:.3,sp:[-8,18,-6]};
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const FONT='"Noto Serif TC","Songti TC","PMingLiU",serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function panel(g,w,h,t,x,y,z,ry,basic){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map:t,transparent:true}):new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}
const R=E.rng(88);
const tileTex=(c)=>{const t=tex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'rgba(0,0,0,.18)':'rgba(255,255,255,.06)';x.fillRect(i*16,0,8,h);}for(let j=0;j<8;j++){x.fillStyle='rgba(0,0,0,.12)';x.fillRect(0,j*16+14,w,2);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
const TT={grey:tileTex('#4A5258'),green:tileTex('#3E5A52'),gold:tileTex('#B8862A')};
/* curved Chinese roof: concave two-slope profile extruded along width, with upturned eaves */
function roof(g,w,d,h,col,x,y,z,ry){const r=new THREE.Group();r.position.set(x,y,z);r.rotation.y=ry||0;g.add(r);const o=.5,hd=d/2+o;
  const s=new THREE.Shape();s.moveTo(-hd,-.15);s.quadraticCurveTo(-hd*.45,h*.12,0,h);s.quadraticCurveTo(hd*.45,h*.12,hd,-.15);s.lineTo(hd,.05);s.quadraticCurveTo(hd*.42,h*.2,0,h+.18);s.quadraticCurveTo(-hd*.42,h*.2,-hd,.05);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:w+o*2,bevelEnabled:false,curveSegments:16});geo.translate(0,0,-(w+o*2)/2);geo.rotateY(Math.PI/2);
  const t=TT[col]||TT.grey;t.repeat.set(3,2);const mt=new THREE.MeshLambertMaterial({map:t,color:col==='gold'?0xFFE0A0:0xFFFFFF});r.add(new THREE.Mesh(geo,mt));
  box(w+o*2+.3,.22,.32,col==='gold'?0x8A5A1A:0x2E3438,0,h+.12,0,r);
  [-1,1].forEach(sx=>{const e=mesh(new THREE.ConeGeometry(.12,.7,6),M(col==='gold'?0x8A5A1A:0x2E3438),sx*(w/2+o+.15),h+.4,0,r);e.rotation.z=-sx*.5;
    [-1,1].forEach(sz=>{const c=mesh(new THREE.ConeGeometry(.1,.55,6),M(0x2E3438),sx*(w/2+o),.15,sz*hd,r);c.rotation.set(sz*.9,0,-sx*.6);});});return r;}
const wallTex=tex(256,256,(x,w,h)=>{x.fillStyle='#EDE4D0';x.fillRect(0,0,w,h);x.fillStyle='#6A4428';x.fillRect(0,0,w,14);x.fillRect(0,h-20,w,20);x.fillRect(0,0,14,h);x.fillRect(w-14,0,14,h);x.fillRect(w/2-6,0,12,h);for(let i=0;i<200;i++){x.fillStyle='rgba(120,100,70,.08)';x.fillRect(R()*w,R()*h,4,4);}});
const latticeTex=tex(128,128,(x,w,h)=>{x.fillStyle='#F2E6C8';x.fillRect(0,0,w,h);x.strokeStyle='#6A3A1E';x.lineWidth=6;for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16,h);x.stroke();x.beginPath();x.moveTo(0,i*16);x.lineTo(w,i*16);x.stroke();}x.strokeRect(3,3,w-6,h-6);});
function building(g,x,z,w,d,h,o){o=o||{};const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=o.ry||0;g.add(b);
  box(w+.4,.35,d+.4,0x8A8478,0,.17,0,b);const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({map:wallTex}));body.position.y=.35+h/2;b.add(body);
  [-w/2,w/2].forEach(px=>[-d/2,d/2].forEach(pz=>box(.22,h,.22,o.pillar||0x8A2A1E,px,.35+h/2,pz,b)));
  const win=panel(b,w*.32,h*.38,latticeTex,-w*.22,.35+h*.6,d/2+.02,0);panel(b,w*.32,h*.38,latticeTex,w*.22,.35+h*.6,d/2+.02,0);
  if(o.door!==false)box(w*.22,h*.62,.06,0x5A2A16,0,.35+h*.31,d/2+.03,b);
  roof(b,w,d,o.rh||1.5,o.roof||'grey',0,.35+h,0,0);
  if(o.sign){const t=tex(96,320,(c,W,H)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W,H);c.strokeStyle='#C8962E';c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);c.fillStyle='#E8C060';c.font='bold 64px '+FONT;c.textAlign='center';[...o.sign].forEach((ch,i)=>c.fillText(ch,W/2,80+i*76));});panel(b,.42,1.4,t,w*.42,.35+h*.55,d/2+.25,0);}
  if(o.lanterns)[-w*.35,w*.35].forEach(lx=>E.lantern(b,lx,.35+h-.2,d/2+.5));
  return b;}
function pine(g,x,z,s){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s||1);g.add(t);const tr=mesh(new THREE.CylinderGeometry(.12,.2,2.4,6),M(0x5A3A22),0,1.2,0,t);tr.rotation.z=(R()-.5)*.3;
  for(let k=0;k<3;k++){const p=mesh(new THREE.CylinderGeometry(.0,1.2-k*.25,.5,7),M([0x2E5A3E,0x3A6A48,0x2A4E36][k],{flatShading:true}),(R()-.5)*.6,1.8+k*.55,(R()-.5)*.4,t);p.scale.z=.7;}return t;}
function deadTree(g,x,z){const t=new THREE.Group();t.position.set(x,0,z);g.add(t);mesh(new THREE.CylinderGeometry(.08,.16,2.2,6),M(0x4A3A2A),0,1.1,0,t);for(let k=0;k<4;k++){const b=mesh(new THREE.CylinderGeometry(.02,.05,1,5),M(0x4A3A2A),0,1.4+k*.2,0,t);b.rotation.set((R()-.5)*1.4,R()*6,(R()-.5)*1.4);b.position.x=(R()-.5)*.3;}return t;}
/* ancient people */
const SKIN=[0xF0D0A8,0xE0B888,0xC8986A];
function folk(o){o=o||{};const g=new THREE.Group();const robe=o.robe||[0x5A6A8A,0x8A5A3A,0x6A7A5A,0x9A8A6A,0x7A4A5A][Math.floor(R()*5)];
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.1,.5,0);g.add(p);box(.12,.48,.12,0x2A2420,0,-.24,0,p);return p;});
  const body=mesh(new THREE.CylinderGeometry(.18,o.thin?.26:.34,.95,10),M(robe),0,.9,0,g);box(.5,.06,.36,o.sash||0x2A2420,0,1.0,0,g);
  const arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.24,1.28,0);g.add(a);const sl=mesh(new THREE.CylinderGeometry(.07,.12,.5,8),M(robe),0,-.24,0,a);return a;});
  mesh(new THREE.SphereGeometry(.17,12,10),M(SKIN[Math.floor(R()*3)]),0,1.52,0,g);
  if(o.hat==='farmer'){const h=mesh(new THREE.ConeGeometry(.42,.22,14),M(0xC8A85A),0,1.72,0,g);}else{mesh(new THREE.SphereGeometry(.17,12,8,0,Math.PI*2,0,Math.PI/2),M(0x1A1612),0,1.56,0,g);mesh(new THREE.SphereGeometry(.08,8,6),M(0x1A1612),0,1.73,-.02,g);}
  if(o.basket){const b=mesh(new THREE.CylinderGeometry(.18,.14,.2,10),M(0xB8904A),.32,.85,.12,g);}
  if(o.sit){legs.forEach(l=>l.rotation.x=-1.4);g.userData.sit=true;}
  g.scale.setScalar(o.scale||1.12);g.userData={legs,arms};return g;}
E.ancientFolk=folk;E.ancientKit={building,roof,pine:(...a)=>pine(...a),folk,tex,panel,ground,paving,M,mesh,box,get willow(){return willow},get reeds(){return reeds},get bigTree(){return bigTree},get deadTree(){return deadTree},get maple(){return maple}};
const walkers=[],REF={};
function walker(g,o,path,sp){const f=folk(o);g.add(f);f.position.copy(path[0]);walkers.push({g:f,path,i:1,speed:sp||.9,ph:R()*6});return f;}
function ground(g,w,d,col,y,rep,dots){const t=tex(256,256,(x,W,H)=>{x.fillStyle=col;x.fillRect(0,0,W,H);for(let i=0;i<1600;i++){x.fillStyle=dots[i%dots.length];x.fillRect(R()*W,R()*H,2+R()*2,2+R()*2);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=y||0;g.add(m);return m;}
function paving(g,w,d,x,z){const t=tex(256,256,(c,W,H)=>{c.fillStyle='#A8A090';c.fillRect(0,0,W,H);for(let j=0;j<8;j++)for(let i=0;i<4;i++){const ox=(j%2)*32;c.fillStyle=['#B4AC9C','#9C9484','#ACA494'][(i+j)%3];c.fillRect(i*64+ox+2,j*32+2,60,28);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/4,d/4);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(x||0,.02,z||0);g.add(m);return m;}

/* ---------- props for hotspots ---------- */
const P={
  fish_basket(g){mesh(new THREE.CylinderGeometry(.42,.32,.32,12),M(0xB8904A),0,.86,0,g);for(let i=0;i<4;i++){const f=mesh(new THREE.SphereGeometry(.5,10,8),M(0x9FB7C4),-.18+i*.12,1.08,-.05+(i%2)*.1,g);f.scale.set(.42,.1,.13);f.rotation.y=.4-i*.3;mesh(new THREE.ConeGeometry(.06,.12,4),M(0x8AA4B0),-.18+i*.12+.22,1.08,-.05+(i%2)*.1,g).rotation.z=Math.PI/2;}return 1.2;},
  bear_paw(g){mesh(new THREE.CylinderGeometry(.4,.4,.04,16),M(0xE8E0CC),0,.9,0,g);const p=mesh(new THREE.SphereGeometry(.5,10,8),M(0x4A2E1C),0,1.0,0,g);p.scale.set(.5,.18,.42);for(let i=0;i<4;i++)mesh(new THREE.SphereGeometry(.07,8,6),M(0x3A2214),-.17+i*.11,1.04,.2,g);return 1.2;},
  slips(g){for(let i=0;i<9;i++)box(.07,.025,.62,0xD9C089,-.32+i*.08,.92,0,g);box(.74,.03,.04,0x8A5A2B,0,.94,-.22,g);box(.74,.03,.04,0x8A5A2B,0,.94,.22,g);return 1.1;},
  letter(g){const l=box(.42,.01,.55,0xF6F1E3,0,.82,0,g);l.rotation.y=.2;box(.1,.012,.1,0xC8452F,.13,.83,.15,g);mesh(new THREE.CylinderGeometry(.03,.02,.3,6),M(0x2A2A2A),.3,.84,-.1,g).rotation.z=1.2;return 1;},
  tablet(g){box(.8,1.8,.25,0x8E9290,0,.9,0,g);box(1,.16,.4,0x6E716F,0,1.85,0,g);const t=tex(96,256,(c,W,H)=>{c.fillStyle='#8E9290';c.fillRect(0,0,W,H);c.fillStyle='#3A3E40';c.font='bold 40px '+FONT;c.textAlign='center';['生','亦','我','所','欲'].forEach((ch,i)=>c.fillText(ch,W/2,48+i*44));});panel(g,.6,1.5,t,0,.95,.13,0);return 2.1;},
  rock_slips(g){const r=mesh(new THREE.DodecahedronGeometry(.55,0),M(0x9A9A90,{flatShading:true}),0,.3,0,g);r.scale.set(1,.55,.8);for(let i=0;i<7;i++)box(.07,.025,.5,0xD9C089,-.24+i*.08,.6,0,g);return .8;},
  rice_basket(g){mesh(new THREE.CylinderGeometry(.3,.24,.3,12),M(0xC79A5B),0,.15,0,g);mesh(new THREE.SphereGeometry(.26,10,6,0,Math.PI*2,0,Math.PI/2),M(0xF2EEE2),0,.27,0,g);return .6;},
  soup_bowl(g){const b=new THREE.Group();g.add(b);g.userData.bowl=b;mesh(new THREE.CylinderGeometry(.06,.14,.05,10),M(0x8A5A2B),0,.025,0,b);mesh(new THREE.CylinderGeometry(.04,.04,.14,8),M(0x8A5A2B),0,.12,0,b);mesh(new THREE.CylinderGeometry(.22,.12,.13,12),M(0x8A5A2B),0,.25,0,b);mesh(new THREE.CylinderGeometry(.2,.2,.02,12),M(0xB98A4A),0,.31,0,b);return .5;},
  crate_slips(g){box(.8,.6,.6,0x8A6A44,0,.3,0,g);for(let i=0;i<7;i++)box(.07,.025,.5,0xD9C089,-.24+i*.08,.62,0,g);return .9;},
  chest(g){box(.9,.55,.6,0x9A6A1E,0,.28,0,g);const lid=new THREE.Group();lid.position.set(0,.56,-.3);g.add(lid);g.userData.lid=lid;box(.94,.14,.64,0xC9962E,0,.07,.3,lid);[0,1,2,3,4].forEach(i=>mesh(new THREE.SphereGeometry(.07,8,6),M(0xF2D27A,{emissive:0x6A4A00}),-.3+i*.15,.58,0,g));return .9;},
  none(g){return 2.2;},
  friend_letter(g){const s=mesh(new THREE.DodecahedronGeometry(.4,0),M(0x8A8A82,{flatShading:true}),0,.2,0,g);s.scale.set(1,.55,1);const l=box(.36,.01,.48,0xF6F1E3,0,.43,0,g);l.rotation.y=-.3;return .7;},
  scale(g){box(.1,1.4,.1,0x5A3A22,0,.7,0,g);const beam=new THREE.Group();beam.position.y=1.4;g.add(beam);g.userData.beam=beam;box(1.6,.06,.06,0x6A4428,0,0,0,beam);
    g.userData.pans=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.75,-.45,0);beam.add(p);[[-.1,-.1],[.1,-.1],[0,.12]].forEach(([dx,dz])=>{const c=mesh(new THREE.CylinderGeometry(.006,.006,.45,4),M(0x2A2A2A),dx,.22,dz,p);c.rotation.z=dx*.4;});mesh(new THREE.CylinderGeometry(.22,.18,.05,14),M(0xB8904A),0,0,0,p);return p;});return 1.7;}
};


/* ---------- carry-mode locations & drop zones ---------- */
function apricot(g,x,z,s){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s||1);g.add(t);const tr=mesh(new THREE.CylinderGeometry(.14,.24,2.2,7),M(0x4A3226),0,1.1,0,t);tr.rotation.z=(R()-.5)*.3;
  for(let k=0;k<6;k++)mesh(new THREE.IcosahedronGeometry(.7+R()*.4,0),M([0xF4B8C4,0xF8CCD4,0xEFA4B4][k%3],{flatShading:true}),(R()-.5)*1.8,2.2+R()*.9,(R()-.5)*1.4,t);return t;}
function willow(g,x,z){const t=new THREE.Group();t.position.set(x,0,z);g.add(t);mesh(new THREE.CylinderGeometry(.16,.26,2.6,7),M(0x4A3A2A),0,1.3,0,t);for(let k=0;k<14;k++){const a=k/14*6.28;const b=mesh(new THREE.CylinderGeometry(.02,.06,1.8,4),M(0x6A9A4A),Math.cos(a)*.8,2.1,Math.sin(a)*.8,t);b.rotation.z=Math.cos(a)*.2;b.rotation.x=Math.sin(a)*.2;}mesh(new THREE.IcosahedronGeometry(1,0),M(0x7AAA5A,{flatShading:true}),0,3,0,t);return t;}
const CT={};
CT.apricot_court=(g,S)=>{paving(g,22,16,0,-1);building(g,0,-9.2,9,3.6,3.2,{roof:'green',rh:1.9,lanterns:true,sign:'杏壇'});
  box(22,1.4,.4,0xE6DCC4,0,.7,-7.2,g);box(22.4,.2,.6,0x4D5862,0,1.45,-7.2,g);[-11,11].forEach(x=>{box(.4,1.4,14,0xE6DCC4,x,.7,-1,g);box(.6,.2,14.4,0x4D5862,x,1.45,-1,g);});
  [[-8.5,-5.5],[8.5,-5.5],[-9,4],[9,4]].forEach(([x,z])=>apricot(g,x,z,1.3));S.petals=true;
  [-6,-2,2,6].forEach(x=>E.lantern(g,x,1.9,-7));};
CT.academy=(g,S)=>{paving(g,22,16,0,-1);const h=new THREE.Group();h.position.set(0,0,-6.5);g.add(h);box(18,.4,6,0x9A9488,0,.2,0,h);
  for(let i=0;i<6;i++)box(.3,4,.3,0x8A2A1E,-7.5+i*3,2.4,2.8,h);box(18,.3,.4,0x6A3A22,0,4.3,2.8,h);roof(h,18,6,2.2,'grey',0,4.4,0);const back=new THREE.Mesh(new THREE.PlaneGeometry(17.6,4),new THREE.MeshLambertMaterial({map:latticeTex}));back.position.set(0,2.4,-2.8);h.add(back);
  const t=tex(512,96,(c,W,H)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W,H);c.strokeStyle='#C8962E';c.lineWidth=6;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#E8C060';c.font='bold 60px '+FONT;c.textAlign='center';c.fillText('學而時習',W/2,70);});panel(h,3.2,.6,t,0,3.9,2.98,0);
  for(let r=0;r<2;r++)for(let i=0;i<5;i++){const x=-6+i*3,z=-7.6+r*1.4;box(1.1,.35,.5,0x7A4A2A,x,.18,z,g);const f=folk({sit:true,robe:[0x5A6A8A,0x6A7A5A,0x8A6A4A][i%3]});f.position.set(x,.12,z-.5);g.add(f);}
  [-9.5,9.5].forEach(x=>pine(g,x,1,1.2));};
CT.stele_yard=(g,S)=>{paving(g,22,16,0,-1);for(let i=0;i<8;i++){const x=-9+i*2.6;const s=new THREE.Group();s.position.set(x,0,-8.2);g.add(s);box(1,2.4,.3,0x6E726E,0,1.4,0,s);box(1.3,.25,.5,0x5A5E5A,0,.12,0,s);}
  roof(g,22,2.4,1,'grey',0,3.2,-8.2);for(let i=0;i<8;i++)box(.2,3,.2,0x8A2A1E,-10.5+i*3,1.5,-7,g);[[-10,3],[10,2.5],[-10,-3]].forEach(([x,z])=>pine(g,x,z,1.3));};
CT.riverside=(g,S)=>{ground(g,26,18,'#7A8A5A',.01,6,['#6A7A4A','#8A9A6A']);const wt=tex(64,256,(c,W,H)=>{c.fillStyle='#4A8AB8';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,255,.35)';c.fillRect(R()*W,R()*H,14,2);}});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(1,4);S.riverTex=wt;
  const w=new THREE.Mesh(new THREE.PlaneGeometry(4.4,28),new THREE.MeshLambertMaterial({map:wt}));w.rotation.x=-Math.PI/2;w.rotation.z=Math.PI/2;w.position.set(0,.04,-4.2);g.add(w);
  [-6.2,6.2].forEach(z=>{});for(let i=0;i<18;i++){const r=mesh(new THREE.DodecahedronGeometry(.3+R()*.3,0),M(0x8A8A80,{flatShading:true}),-13+i*1.5,.1,-4.2+(i%2?2.3:-2.3),g);r.scale.y=.5;}
  [[-9,-8],[9,-8],[-10,2],[10,1.5]].forEach(([x,z])=>willow(g,x,z));const pv=new THREE.Group();pv.position.set(8,0,-9.5);g.add(pv);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([x,z])=>box(.16,2.2,.16,0xA8322A,x,1.1,z,pv));roof(pv,2,2,1.1,'green',0,2.2,0);};
CT.ancestral_hall=(g,S)=>{paving(g,22,16,0,-1);const h=new THREE.Group();h.position.set(0,0,-7);g.add(h);box(14,.5,5,0x9A9488,0,.25,0,h);box(13,4,.3,0x7A2A1E,0,2.5,-2.2,h);for(let i=0;i<6;i++)box(.3,4,.3,0x7A1E16,-6+i*2.4,2.5,2.2,h);roof(h,13,5,2.2,'grey',0,4.5,0);
  const t=tex(256,96,(c,W,H)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W,H);c.strokeStyle='#C8962E';c.lineWidth=6;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#E8C060';c.font='bold 60px '+FONT;c.textAlign='center';c.fillText('慎終追遠',W/2,70);});panel(h,2.6,.8,t,0,3.9,2.4,0);
  for(let i=0;i<5;i++)E.lantern(h,-4.8+i*2.4,3.7,2.6);[[-9,0],[9,0]].forEach(([x,z])=>pine(g,x,z,1.3));S.incense=true;};
const ZM={
  pad(g,col){mesh(new THREE.CylinderGeometry(1.05,1.15,.3,24),M(0x9A9488),0,.15,0,g);const top=mesh(new THREE.CylinderGeometry(.95,.95,.06,24),M(col),0,.33,0,g);mesh(new THREE.TorusGeometry(1,.05,6,32),M(0xE0B04B),0,.33,0,g).rotation.x=Math.PI/2;return {top:.36,glow:top};},
  lectern(g,col){box(1.8,.12,1,0x6A3A22,0,.8,0,g);[[-.75,-.4],[.75,-.4],[-.75,.4],[.75,.4]].forEach(([x,z])=>box(.1,.8,.1,0x5A2A16,x,.4,z,g));const cl=box(1.6,.03,.9,col,0,.88,0,g);return {top:.92,glow:cl};},
  stele(g,col,label){const b=mesh(new THREE.SphereGeometry(.7,12,8,0,Math.PI*2,0,Math.PI/2),M(0x6E726E),0,0,0,g);b.scale.set(1,.45,1.2);box(.9,2,.28,0x7A7E7A,0,1.25,-.2,g);
    const t=tex(96,256,(c,W,H)=>{c.fillStyle='#7A7E7A';c.fillRect(0,0,W,H);c.fillStyle='#2A2E2E';c.font='bold 54px '+FONT;c.textAlign='center';[...label].slice(0,4).forEach((ch,i)=>c.fillText(ch,W/2,62+i*60));});panel(g,.7,1.8,t,0,1.25,-.05,0);
    const base=mesh(new THREE.CylinderGeometry(.75,.8,.12,20),M(col),0,.32,.55,g);return {top:.4,glow:base,dz:.55};},
  stepstone(g,col,label){const s=mesh(new THREE.CylinderGeometry(.9,1,.35,9),M(0x8A8A80,{flatShading:true}),0,.12,0,g);const t=tex(128,128,(c,W,H)=>{c.fillStyle='rgba(0,0,0,0)';c.clearRect(0,0,W,H);c.fillStyle='#E8D8A0';c.font='bold 70px '+FONT;c.textAlign='center';c.fillText(label.replace('第',''),W/2,90);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:t,transparent:true}));p.rotation.x=-Math.PI/2;p.position.y=.31;g.add(p);const ring=mesh(new THREE.TorusGeometry(.92,.05,6,24),M(col),0,.3,0,g);ring.rotation.x=Math.PI/2;return {top:.32,glow:ring};},
  altar(g,col){box(3.2,1,1.1,0x6A1E16,0,.5,0,g);box(3.4,.1,1.3,0x8A2A1E,0,1.05,0,g);for(let i=0;i<3;i++){box(.28,.7,.08,0x2A1A12,-.6+i*.6,1.45,-.4,g);box(.32,.06,.12,0xC8962E,-.6+i*.6,1.82,-.4,g);}
    mesh(new THREE.CylinderGeometry(.18,.14,.22,12),M(0x8A6A2A),.95,1.2,-.2,g);[-1.3,1.3].forEach(x=>{box(.08,.35,.08,0xE8D8C0,x,1.28,-.3,g);mesh(new THREE.SphereGeometry(.05,6,4),M(0xFFB040,{emissive:0xFF8A20}),x,1.5,-.3,g);});const cl=box(2.6,.02,.9,col,0,1.11,.05,g);return {top:1.12,glow:cl,incense:V(.95,1.4,-.2)};}
};


/* ---------- escape-mode areas (逍遙遊) ---------- */
function bigTree(g,x,z){const t=new THREE.Group();t.position.set(x,0,z);g.add(t);const bark=M(0x5A4432,{flatShading:true});
  for(let i=0;i<4;i++){const c=mesh(new THREE.CylinderGeometry(.35,.6,3.2,7),bark,(R()-.5)*.6,1.6,(R()-.5)*.6,t);c.rotation.set((R()-.5)*.5,R()*3,(R()-.5)*.5);}
  for(let i=0;i<7;i++){const b=mesh(new THREE.SphereGeometry(.35+R()*.3,7,6),bark,(R()-.5)*1.4,.6+R()*2.6,(R()-.5)*1.2,t);b.scale.set(1,1.3,1);}
  for(let i=0;i<7;i++){const br=new THREE.Group();br.position.set(0,2.8+R()*.6,0);br.rotation.y=i/7*6.28;t.add(br);let p=V(0,0,0);for(let s=0;s<3;s++){const q=p.clone().add(V(.8+R()*.4,(R()-.3)*.8,(R()-.5)*.9));const L=q.clone().sub(p);const m=mesh(new THREE.CylinderGeometry(.08,.16-s*.03,L.length(),5),bark,0,0,0,br);m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),L.normalize());p=q;}
    for(let k2=0;k2<3;k2++)mesh(new THREE.IcosahedronGeometry(.8+R()*.5,0),M([0x4E7A3E,0x5E8A48,0x3E6A34][k2],{flatShading:true}),p.x+(R()-.5),p.y+.4,p.z+(R()-.5),br);}
  for(let i=0;i<5;i++)mesh(new THREE.IcosahedronGeometry(1.2+R()*.6,0),M(0x4E7A3E,{flatShading:true}),(R()-.5)*2,4.4+R()*.8,(R()-.5)*2,t);return t;}
function reeds(g,x,z,n){for(let i=0;i<(n||9);i++){const r=mesh(new THREE.CylinderGeometry(.015,.03,1+R()*.6,4),M(0x8A9A4A),x+(R()-.5)*.8,.5,z+(R()-.5)*.6,g);r.rotation.z=(R()-.5)*.4;mesh(new THREE.CylinderGeometry(.05,.05,.25,5),M(0x6A4A2A),r.position.x,1+R()*.3,r.position.z,g);}}
const EZ={};
EZ.store=(g,S)=>{const fl=tex(256,256,(c,W,H)=>{c.fillStyle='#8A6A44';c.fillRect(0,0,W,H);for(let i=0;i<8;i++){c.fillStyle=i%2?'#7E5E3A':'#94744E';c.fillRect(0,i*32,W,30);}for(let i=0;i<300;i++){c.fillStyle='rgba(60,40,20,.2)';c.fillRect(R()*W,R()*H,6,1);}});fl.wrapS=fl.wrapT=THREE.RepeatWrapping;fl.repeat.set(3,3);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(14,12),new THREE.MeshLambertMaterial({map:fl}));f.rotation.x=-Math.PI/2;f.position.set(0,.02,-.5);g.add(f);
  const wl=new THREE.MeshLambertMaterial({map:wallTex});const bw=new THREE.Mesh(new THREE.BoxGeometry(14.4,4.2,.3),wl);bw.position.set(0,2.1,-6.5);g.add(bw);[-7.2,7.2].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.3,2.2,12),wl);s.position.set(x,1.1,-.5);g.add(s);});
  [-4,0,4].forEach(x=>{panel(g,1.6,1.2,latticeTex,x,2.6,-6.33,0);const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.4,5),new THREE.MeshBasicMaterial({color:0xFFE8B0,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));sh.position.set(x,1.6,-4.6);sh.rotation.x=-.75;g.add(sh);});
  for(let i=0;i<7;i++)box(.24,4.2,.24,0x6A3A22,-6.6+i*2.2,2.1,-6.2,g);
  [[-6,0],[6,0]].forEach(([x])=>{box(.6,2,3.6,0x6A4428,x*1.08,1,-3.6,g);for(let r2=0;r2<3;r2++)for(let k2=0;k2<4;k2++)mesh(new THREE.SphereGeometry(.2,8,6),M([0x8A5A3A,0x6A6A5A,0xA88A5A][(r2+k2)%3]),x*1.08+(x<0?.1:-.1),.45+r2*.62,-5+k2*.9,g).scale.y=1.2;});
  for(let i=0;i<5;i++){const s=mesh(new THREE.SphereGeometry(.35,8,6),M(0xC8A870),-1+i*.7,.3,-5.6,g);s.scale.set(1,.8,1);}
  S.room=building;};
EZ.river=(g,S)=>{ground(g,30,18,'#7E8E5A',.01,6,['#6E7E4A','#8E9E6A','#5E6E3E']);const wt=tex(64,256,(c,W,H)=>{c.fillStyle='#3E7EAE';c.fillRect(0,0,W,H);for(let i=0;i<50;i++){c.fillStyle='rgba(255,255,255,.3)';c.fillRect(R()*W,R()*H,16,2);}});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(1,6);S.escRiver=wt;
  const w=new THREE.Mesh(new THREE.PlaneGeometry(6,40),new THREE.MeshLambertMaterial({map:wt}));w.rotation.x=-Math.PI/2;w.rotation.z=Math.PI/2;w.position.set(0,.05,-6.2);g.add(w);
  for(let i=0;i<24;i++){const r=mesh(new THREE.DodecahedronGeometry(.3+R()*.4,0),M(0x8A8A80,{flatShading:true}),-15+i*1.3,.1,-3.1+(R()-.5)*.4,g);r.scale.y=.5;}
  const jt=new THREE.Group();jt.position.set(1,0,-3.4);g.add(jt);box(1.8,.12,3.6,0x8A6A44,0,.35,-1.2,jt);for(let i=0;i<4;i++)box(.14,.8,.14,0x5A3A22,(i%2?.8:-.8),.1,-2.8+Math.floor(i/2)*2.4,jt);
  [[-6,1],[-3.5,2.4],[5.5,2],[7.5,.4]].forEach(([x,z])=>reeds(g,x,z,10));[[-10,-1],[10,-1.5],[-11,4]].forEach(([x,z])=>willow(g,x,z));
  for(let i=0;i<4;i++)mesh(new THREE.ConeGeometry(7+R()*4,9+R()*6,6),M(0x6A7E8A,{flatShading:true}),-15+i*10,4,-18-R()*4,g);S.jetty=V(1,0,-6.4);};
EZ.court=(g,S)=>{paving(g,16,13,0,-.5);const wl=new THREE.MeshLambertMaterial({map:wallTex});[-8,8].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.3,2,12),wl);s.position.set(x,1,-.5);g.add(s);});
  building(g,0,-9.5,10,3.4,3,{roof:'grey',rh:1.7,sign:'惠府'});const gw=new THREE.Group();gw.position.set(0,0,-6.4);g.add(gw);
  box(16,2.6,.4,0xD6C8AA,0,1.3,0,gw);box(3.2,3.6,.6,0x7A7E7A,0,1.8,0,gw);box(2,2.6,.65,0x3A3A3A,0,1.3,0,gw);roof(gw,3.4,.8,.7,'grey',0,3.6,0);
  S.plaques=[];for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.36,.36,.06),new THREE.MeshToonMaterial({color:0x6E6658,gradientMap:E.M(0).gradientMap,emissive:0}));p.position.set(-.6+i*.4,3.05,.34);gw.add(p);S.plaques.push(p);}
  S.bigTree=bigTree(g,-4.6,-3.4);S.treePos=V(-4.6,0,-3.4);[[6.6,-4],[-7,3.8]].forEach(([x,z])=>pine(g,x,z,1.2));};
const EZM={
  gourd(g){box(1.1,.3,1.1,0x6E4A32,0,.15,0,g);const b=mesh(new THREE.SphereGeometry(.68,18,14),M(0xC9B458),0,.92,0,g);b.scale.set(1,.95,1);const n=mesh(new THREE.SphereGeometry(.34,14,10),M(0xC2AE52),0,1.72,0,g);box(.06,.24,.06,0x6E4A32,0,2.1,0,g);g.userData.body=b;g.userData.neck=n;return 2.25;},
  basin(g){for(let i=0;i<5;i++){box(.16,.9,.16,0x5A3A22,-.8+i*.4,.45,.2,g);mesh(new THREE.CylinderGeometry(.1,.1,.06,8),M(0xC8452F),-.8+i*.4,.93,.2,g);}return 1.1;},
  tree(g){return 3.2;},
  river(g){const s=box(.7,1.2,.18,0x8A8E8A,0,.6,0,g);const t=tex(96,192,(c,W,H)=>{c.fillStyle='#8A8E8A';c.fillRect(0,0,W,H);c.fillStyle='#2A2E2E';c.font='bold 40px '+FONT;c.textAlign='center';['浮','於','江','湖'].forEach((ch,i)=>c.fillText(ch,W/2,44+i*42));});panel(g,.5,1,t,0,.65,.1,0);return 1.4;},
  peng(g){reeds(g,0,0,12);return 1.3;}
};


/* ---------- 逍遙遊 RPG scenes ---------- */
function snowGround(g,w,d){return ground(g,w,d,'#E8EEF4',.012,6,['#DCE4EC','#F4F8FC','#CCD6E0']);}
const T2={};
T2.gourd_garden=(g,S)=>{ground(g,30,20,'#7E8E54',.01,6,['#6E7E44','#8E9E64']);paving(g,10,3,0,4);building(g,0,-9.4,9,3.4,3,{roof:'grey',rh:1.7,sign:'惠府',lanterns:true});
  const wl=new THREE.MeshLambertMaterial({map:wallTex});[-9,9].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.3,1.8,14),wl);s.position.set(x,.9,-2);g.add(s);});
  for(let i=0;i<3;i++){const b=new THREE.Group();b.position.set(-6+i*6,0,-6.4);g.add(b);box(3.6,.25,1.2,0x6A4A2A,0,.12,0,b);for(let k2=0;k2<6;k2++)mesh(new THREE.IcosahedronGeometry(.22,0),M(0x5E9A44,{flatShading:true}),-1.4+k2*.55,.38,0,b);}
  const w=new THREE.Group();w.position.set(6.5,0,-2.5);g.add(w);mesh(new THREE.CylinderGeometry(.6,.65,.7,14),M(0x8A8A80),0,.35,0,w);[-.6,.6].forEach(x=>box(.1,1.8,.1,0x5A3A22,x,1.25,0,w));roof(w,1.4,.8,.5,'grey',0,2.1,0);
  [[-7.5,2],[7.5,3]].forEach(([x,z])=>pine(g,x,z,1.2));};
T2.winter_river=(g,S)=>{snowGround(g,32,20);const it=tex(64,256,(c,W,H)=>{c.fillStyle='#8EBAD8';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,255,.4)';c.fillRect(R()*W,R()*H,12,2);}});it.wrapS=it.wrapT=THREE.RepeatWrapping;it.repeat.set(1,6);S.iceRiver=it;
  const wv=new THREE.Mesh(new THREE.PlaneGeometry(9,44),new THREE.MeshLambertMaterial({map:it}));wv.rotation.x=-Math.PI/2;wv.rotation.z=Math.PI/2;wv.position.set(0,.05,-7.6);g.add(wv);
  for(let i=0;i<26;i++){const r=mesh(new THREE.DodecahedronGeometry(.3+R()*.3,0),M(0xDDE6EE,{flatShading:true}),-16+i*1.3,.1,-3.1+(R()-.5)*.4,g);r.scale.y=.5;}
  const hut=building(g,-8,-1,4,3,2.2,{roof:'grey'});const snowRoof=box(5.4,.12,4.2,0xF4F8FC,0,3.35,0,hut);snowRoof.rotation.x=0;
  [[7,1],[9.5,-1],[-11,4]].forEach(([x,z])=>deadTree(g,x,z));
  const wash=folk({robe:0x6A5A4A});wash.position.set(-1.2,0,-2.6);wash.rotation.y=Math.PI;g.add(wash);S.washer=wash;const w2=folk({robe:0x8A6A4A,sit:true});w2.position.set(-3.4,.2,-2.4);w2.rotation.y=Math.PI;g.add(w2);
  for(let i=0;i<4;i++)mesh(new THREE.ConeGeometry(9+R()*5,12+R()*6,6),M(0xC8D4E0,{flatShading:true}),-18+i*12,5,-24-R()*4,g);S.snowAt=g.position.clone();};
T2.great_lake=(g,S)=>{ground(g,30,8,'#9A8E6A',.012,5,['#8A7E5A','#AA9E7A']).position.z=3;const lt=tex(128,128,(c,W,H)=>{c.fillStyle='#4A86B0';c.fillRect(0,0,W,H);for(let i=0;i<60;i++){c.fillStyle='rgba(255,230,190,.25)';c.fillRect(R()*W,R()*H,16,2);}});lt.wrapS=lt.wrapT=THREE.RepeatWrapping;lt.repeat.set(10,10);S.lakeTex=lt;
  const lk=new THREE.Mesh(new THREE.PlaneGeometry(50,40),new THREE.MeshLambertMaterial({map:lt}));lk.rotation.x=-Math.PI/2;lk.position.set(0,.04,-22);g.add(lk);
  [[-7,-1],[-5,0],[6,-.6],[8.5,.6],[-10,.8]].forEach(([x,z])=>reeds(g,x,z,12));[[-12,2],[12,2.5]].forEach(([x,z])=>willow(g,x,z));
  const pr=new THREE.Group();pr.position.set(5,0,-1.6);g.add(pr);box(1.6,.12,4,0x8A6A44,0,.35,-1.6,pr);for(let i=0;i<4;i++)box(.14,.9,.14,0x5A3A22,(i%2?.7:-.7),.05,-3.2+Math.floor(i/2)*2.6,pr);
  for(let i=0;i<6;i++)mesh(new THREE.ConeGeometry(10+R()*6,12+R()*8,6),M(0x7E8EA0,{flatShading:true}),-40+i*16,5,-70-R()*8,g);
  const mt=tex(256,64,(c,W,H)=>{const g2=c.createRadialGradient(W/2,H/2,4,W/2,H/2,W/2);g2.addColorStop(0,'rgba(255,240,225,.7)');g2.addColorStop(1,'rgba(255,240,225,0)');c.fillStyle=g2;c.fillRect(0,0,W,H);});
  S.mist=S.mist||[];for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(40,5),new THREE.MeshBasicMaterial({map:mt,transparent:true,opacity:.6,depthWrite:false}));m.position.set(0,1+i*.6,-16-i*8);g.add(m);S.mist.push(m);}};
T2.roadside_tree=(g,S)=>{ground(g,32,20,'#8E9A5E',.01,6,['#7E8A4E','#9EAA6E']);const rd=new THREE.Mesh(new THREE.PlaneGeometry(40,3),M(0xB8A07A));rd.rotation.x=-Math.PI/2;rd.position.set(0,.02,-.2);g.add(rd);
  S.shu=bigTree(g,-4.2,-3.6);S.shuPos=g.position.clone().add(V(-4.2,0,-3.6));for(let i=0;i<10;i++)box(.05,.4,.05,0xA89A5A,-12+R()*24,.2,-8+R()*2,g);[[8,-5],[10,2],[-11,3]].forEach(([x,z])=>pine(g,x,z,1.1));
  walker(g,{robe:0x6A5A4A,hat:'farmer'},[V(-14,0,.4),V(14,0,.4)],.7);};
const P2={
  seed_sack(g){const s=mesh(new THREE.SphereGeometry(.34,10,8),M(0xA6834F),0,.32,0,g);s.scale.set(1,1.1,.9);mesh(new THREE.ConeGeometry(.14,.22,8),M(0x8A6A3A),0,.72,0,g);for(let i=0;i<8;i++)mesh(new THREE.SphereGeometry(.03,5,4),M(0xE8D8A0),.3+R()*.3,.03,(R()-.5)*.4,g);return .9;},
  gourd_vine(g){[-1.4,1.4].forEach(x=>[-.8,.8].forEach(z=>box(.08,2.6,.08,0x7A6A3A,x,1.3,z,g)));for(let i=0;i<7;i++)box(3,.05,.05,0x7A6A3A,0,2.6,-.8+i*.27,g);
    for(let i=0;i<14;i++)mesh(new THREE.IcosahedronGeometry(.32,0),M([0x5E9A44,0x4E8A3A][i%2],{flatShading:true}),-1.3+R()*2.6,2.7,-.8+R()*1.6,g);
    const gd=new THREE.Group();g.add(gd);g.userData.gourd=gd;const b=mesh(new THREE.SphereGeometry(.68,18,14),M(0xC9B458),0,.75,0,gd);mesh(new THREE.SphereGeometry(.34,14,10),M(0xC2AE52),0,1.55,0,gd);box(.05,.7,.05,0x6A5A2A,0,2.1,0,gd);return 3;},
  ladle(g){const l=mesh(new THREE.SphereGeometry(.55,14,8,0,Math.PI*2,0,Math.PI/2),M(0xC9B458),0,.16,0,g);l.scale.set(1,.22,1);l.rotation.x=Math.PI;return .5;},
  silk_frame(g){[-1,1].forEach(x=>box(.1,1.6,.1,0x6A4A2A,x,.8,0,g));box(2.2,.08,.08,0x6A4A2A,0,1.6,0,g);for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(.55,1.2),new THREE.MeshLambertMaterial({color:0xF8F6F0,side:THREE.DoubleSide}));s.position.set(-.65+i*.65,1,0);g.add(s);}return 1.8;},
  salve_jar(g){box(.6,.5,.5,0x6A4A2A,0,.25,0,g);mesh(new THREE.CylinderGeometry(.14,.18,.3,12),M(0x3E6A8A),0,.65,0,g);mesh(new THREE.CylinderGeometry(.1,.1,.06,12),M(0xC8452F),0,.83,0,g);return 1;},
  gold_bag(g){box(.6,.5,.5,0x6A4A2A,0,.25,0,g);const b=mesh(new THREE.SphereGeometry(.2,10,8),M(0xB8302A),0,.66,0,g);b.scale.y=1.2;for(let i=0;i<3;i++){const ig=mesh(new THREE.SphereGeometry(.09,8,6),M(0xF2D27A,{emissive:0x5A3A00}),-.15+i*.15,.54,.18,g);ig.scale.set(1.4,.6,.8);}return 1;},
  reed_clump(g){reeds(g,0,0,14);return 1.4;},
  stele_lake(g){box(.8,1.6,.24,0x8A8E8A,0,.8,0,g);const t=tex(96,256,(c,W,H)=>{c.fillStyle='#8A8E8A';c.fillRect(0,0,W,H);c.fillStyle='#2A2E2E';c.font='bold 50px '+FONT;c.textAlign='center';['浮','於','江','湖'].forEach((ch,i)=>c.fillText(ch,W/2,56+i*58));});panel(g,.6,1.4,t,0,.85,.13,0);return 1.8;},
  gourd_float(g){const b=mesh(new THREE.SphereGeometry(.68,18,14),M(0xC9B458),0,.5,0,g);b.scale.set(1.2,.75,1);g.userData.body=b;return 1.1;},
  axe_stump(g){mesh(new THREE.CylinderGeometry(.35,.4,.5,12),M(0x7A5A3A),0,.25,0,g);const a=new THREE.Group();a.position.set(0,.5,0);a.rotation.z=.5;g.add(a);box(.05,.9,.05,0x8A6A3A,0,.45,0,a);box(.25,.18,.04,0x8A8E92,.1,.85,0,a);return 1.2;},
  trap(g){[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]].forEach(([x,z])=>box(.05,.5,.05,0x6A4A2A,x,.25,z,g));const n=new THREE.Mesh(new THREE.SphereGeometry(.7,10,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x5A4A3A,wireframe:true}));n.position.y=.05;n.scale.y=.6;g.add(n);g.userData.net=n;return .9;}
};
function catModel(){const c=new THREE.Group();const b=mesh(new THREE.SphereGeometry(.22,10,8),M(0xB8803A),0,.25,0,c);b.scale.set(1.6,.9,.9);mesh(new THREE.SphereGeometry(.14,10,8),M(0xB8803A),.32,.38,0,c);[-.07,.07].forEach(z=>mesh(new THREE.ConeGeometry(.05,.1,4),M(0xB8803A),.36,.52,z,c));const t=box(.35,.04,.04,0xB8803A,-.42,.36,0,c);t.rotation.z=.6;E.scene.add(c);return c;}
function yakModel(){const y=new THREE.Group();const b=mesh(new THREE.SphereGeometry(1,12,10),M(0x3A2E26,{flatShading:true}),0,1.6,0,y);b.scale.set(1.7,1,1);mesh(new THREE.SphereGeometry(.5,10,8),M(0x2E241E,{flatShading:true}),1.7,1.6,0,y);[-.3,.3].forEach(z=>{const h=mesh(new THREE.ConeGeometry(.08,.6,6),M(0xE8E0CC),1.85,2.1,z,y);h.rotation.x=z>0?.6:-.6;});
  [[-.9,-.5],[-.9,.5],[.9,-.5],[.9,.5]].forEach(([x,z])=>box(.25,.9,.25,0x2E241E,x,.45,z,y));E.scene.add(y);return y;}

/* ---------- location templates ---------- */
function template(name,g,S){
  if(T2[name]){T2[name](g,S);return;}
  if(name==='market'){paving(g,26,16,0,-2);
    building(g,-6,-7.5,5,3.2,2.6,{sign:'鮮魚',lanterns:true});building(g,0,-8.2,5,3.4,2.9,{sign:'茶樓',lanterns:true,roof:'green',rh:1.7});building(g,6.2,-7.5,5,3.2,2.6,{sign:'山珍',lanterns:true});
    building(g,-11,-3,4,3,2.4,{ry:Math.PI/2});building(g,11,-3,4,3,2.4,{ry:-Math.PI/2});
    const st=new THREE.Group();st.position.set(0,0,-1.3);g.add(st);box(4.8,.12,1.5,0x9C6A3C,0,.86,0,st);[-2.2,2.2].forEach(x=>box(.12,.86,1.3,0x7C5230,x,.43,0,st));
    [[-2.3,.7],[2.3,.7],[-2.3,-.7],[2.3,-.7]].forEach(([x,z])=>box(.1,2.5,.1,0x7C5230,x,1.25,z,st));const aw=tex(256,128,(c,W,H)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#E8D8B0':'#B8452E';c.fillRect(i*32,0,32,H);}});
    const awm=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.9),new THREE.MeshLambertMaterial({map:aw,side:THREE.DoubleSide}));awm.position.set(0,2.55,0);awm.rotation.x=-Math.PI/2+.25;st.add(awm);
    for(let i=0;i<12;i++){const x=-12+i*2.2;E.lantern(g,x,3.6+Math.sin(i)*.2,-4.6);}for(let i=0;i<11;i++)box(.02,.02,2.2,0x3A2A1A,-12+i*2.2+1.1,3.75,-4.6,g).rotation.y=Math.PI/2;
    walker(g,{basket:true},[V(-13,0,2.6),V(13,0,2.6)],.9);walker(g,{hat:'farmer'},[V(13,0,3.6),V(-13,0,3.6)],.8);walker(g,{},[V(-12,0,-3.2),V(-6,0,-4.4),V(-12,0,-3.2)],.6);
    const v=folk({robe:0x6A4A3A});v.position.set(-3.1,0,-2.1);g.add(v);S.vendor=v;
    const sc=new THREE.Group();P.scale(sc);sc.position.set(-1.5,0,1.0);sc.rotation.y=0;g.add(sc);S.scale=sc;}
  if(name==='pavilion'){ground(g,40,30,'#7A8A5A',.01,8,['#6A7A4A','#8A9A6A','#5E6E40']);
    const pv=new THREE.Group();pv.position.set(0,0,-1.6);g.add(pv);box(4.4,.3,3.6,0xA8A090,0,.15,0,pv);[[-1.8,-1.4],[1.8,-1.4],[-1.8,1.4],[1.8,1.4]].forEach(([x,z])=>box(.22,2.8,.22,0xA8322A,x,1.7,z,pv));
    box(4,.2,.2,0xA8322A,0,3.0,1.4,pv);box(4,.2,.2,0xA8322A,0,3.0,-1.4,pv);roof(pv,3.6,2.8,1.6,'green',0,3.1,0);
    mesh(new THREE.CylinderGeometry(.6,.5,.75,12),M(0x9A9A92),.2,.65,0,pv);[[-.6,.6],[.8,.7],[-.4,-.7]].forEach(([x,z])=>mesh(new THREE.CylinderGeometry(.22,.2,.45,10),M(0x9A9A92),x,.52,z,pv));
    for(let i=0;i<10;i++){const a=R()*6.28,d=7+R()*9;pine(g,Math.cos(a)*d,Math.sin(a)*d-3,1+R()*.8);}
    for(let i=0;i<14;i++){const r=mesh(new THREE.DodecahedronGeometry(.6+R()*1.2,0),M(0x8A8A80,{flatShading:true}),-14+R()*28,.2,-12+R()*6,g);r.scale.y=.5+R();}
    const mt=tex(256,64,(c,W,H)=>{const g2=c.createRadialGradient(W/2,H/2,4,W/2,H/2,W/2);g2.addColorStop(0,'rgba(255,255,255,.75)');g2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g2;c.fillRect(0,0,W,H);});const mist=new THREE.MeshBasicMaterial({map:mt,transparent:true,opacity:.55,depthWrite:false});S.mist=[];for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(30,4),mist);m.position.set(0,1+i*.8,-12-i*3);g.add(m);S.mist.push(m);}
    for(let i=0;i<5;i++){const m=mesh(new THREE.ConeGeometry(8+R()*6,10+R()*8,6),M(0x6A7E8A,{flatShading:true}),-20+i*10,4,-26-R()*6,g);}
    const strm=tex(64,256,(c,W,H)=>{c.fillStyle='#5A9AC8';c.fillRect(0,0,W,H);for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.3)';c.fillRect(R()*W,R()*H,10,2);}});strm.wrapT=THREE.RepeatWrapping;S.streamTex=strm;
    const sm=new THREE.Mesh(new THREE.PlaneGeometry(2,24),new THREE.MeshLambertMaterial({map:strm}));sm.rotation.x=-Math.PI/2;sm.rotation.z=.5;sm.position.set(7,.03,-2);g.add(sm);}
  if(name==='village'){ground(g,40,30,'#A89070',.01,6,['#988060','#B8A080','#8A7254']);
    const cr=tex(256,256,(c,W,H)=>{c.fillStyle='#A88E68';c.fillRect(0,0,W,H);c.strokeStyle='#6A5438';c.lineWidth=2;for(let i=0;i<40;i++){c.beginPath();let x=R()*W,y=R()*H;c.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*50;y+=(R()-.5)*50;c.lineTo(x,y);}c.stroke();}});cr.wrapS=cr.wrapT=THREE.RepeatWrapping;cr.repeat.set(3,2);
    [[-9,-6],[9,-6]].forEach(([x,z])=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(9,7),new THREE.MeshLambertMaterial({map:cr}));f.rotation.x=-Math.PI/2;f.position.set(x,.03,z);g.add(f);for(let i=0;i<20;i++)box(.04,.3,.04,0x9A8A5A,x-4+R()*8,.15,z-3+R()*6,g);});
    const pf=new THREE.Group();pf.position.set(0,0,-3.6);g.add(pf);[-2.4,2.4].forEach(x=>box(.36,3.3,.36,0x7A6A58,x,1.65,0,pf));box(5.6,.4,.42,0x6A5A48,0,3.15,0,pf);roof(pf,5,.6,.6,'grey',0,3.35,0);
    const sign=tex(256,96,(c,W,H)=>{c.fillStyle='#4A3A2A';c.fillRect(0,0,W,H);c.fillStyle='#D8C8A0';c.font='bold 56px '+FONT;c.textAlign='center';c.fillText('安樂村',W/2,70);});panel(pf,1.6,.6,sign,0,2.6,.22,0);
    building(g,-7,-9,4,3,2.2,{door:true,roof:'grey'});building(g,7,-9,4,3,2.2,{roof:'grey'});
    [[-6,-2],[6.5,-1.5],[-8,1],[8.5,1.5]].forEach(([x,z])=>deadTree(g,x,z));
    [[-4.6,-1.4,0],[4.4,-.6,Math.PI],[-5.6,.8,.4]].forEach(([x,z,ry])=>{const f=folk({thin:true,robe:0x8A7A5A,sit:true});f.position.set(x,.2,z);f.rotation.y=ry;g.add(f);});
    for(let i=0;i<4;i++){const j=mesh(new THREE.CylinderGeometry(.3,.22,.6,12),M(0x6A4A2A),-3.6+i*.6,.3,-5.2,g);}walker(g,{thin:true,robe:0x7A6A4A},[V(-12,0,3),V(12,0,3.4)],.5);}
  if(name==='mansion'){paving(g,26,18,0,-3);const mn=new THREE.Group();mn.position.set(0,0,-7);g.add(mn);
    box(14,.5,5,0x9A9890,0,.25,0,mn);box(12,3.6,4.2,0xA8322A,0,2.3,0,mn);for(let i=0;i<7;i++)box(.24,3.6,.24,0x7A1E16,-5.4+i*1.8,2.3,2.15,mn);
    roof(mn,12,4.2,2,'gold',0,4.1,0);roof(mn,7,2.6,1.3,'gold',0,5.6,0);
    const gate=[-1,1].map(s=>{const d=new THREE.Group();d.position.set(s*1.25,0,2.13);mn.add(d);const p=box(1.25,2.8,.1,0x8A1A12,-s*.62,1.9,0,d);for(let i=0;i<4;i++)for(let k=0;k<3;k++)mesh(new THREE.SphereGeometry(.05,6,4),M(0xE0B04B),-s*.62-.4+k*.4,1.0+i*.6,.07,d);return d;});S.gate=gate;
    box(3.4,.25,1.6,0x9A9890,0,.12,3,mn);box(3,.25,1.2,0x9A9890,0,.37,2.8,mn);
    const plaque=tex(256,96,(c,W,H)=>{c.fillStyle='#1E1A16';c.fillRect(0,0,W,H);c.strokeStyle='#C8962E';c.lineWidth=6;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#E8C060';c.font='bold 56px '+FONT;c.textAlign='center';c.fillText('萬鍾府',W/2,68);});panel(mn,1.8,.66,plaque,0,3.75,2.2,0);
    [-2.6,2.6].forEach(x=>{const l=new THREE.Group();l.position.set(x,0,-3.2);g.add(l);box(.8,.6,.8,0x9A9890,0,.3,0,l);mesh(new THREE.SphereGeometry(.42,10,8),M(0xB8B4A8,{flatShading:true}),0,1.0,0,l);mesh(new THREE.SphereGeometry(.28,10,8),M(0xB8B4A8,{flatShading:true}),0,1.55,.15,l);});
    [-4.2,-1.6,1.6,4.2].forEach(x=>E.lantern(mn,x,3.8,2.5));for(let i=0;i<6;i++)E.lantern(g,-11+i*4.4,2.6,-1.2);
    [[-9,-3],[9,-3]].forEach(([x,z])=>{const t=new THREE.Group();t.position.set(x,0,z);g.add(t);mesh(new THREE.CylinderGeometry(.18,.25,2.6,8),M(0x5A3A22),0,1.3,0,t);for(let k=0;k<5;k++)mesh(new THREE.IcosahedronGeometry(.9,0),M(0x2E4A36,{flatShading:true}),(R()-.5)*1.8,2.6+R()*.8,(R()-.5)*1.4,t);});
    walker(g,{robe:0x2A2A3A},[V(-4,0,-4.2),V(4,0,-4.2),V(-4,0,-4.2)],.5);}
}

E.kits.ancient_town={
  carryBuild(W){const S={};const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=50;E.scene.fog.far=260;ground(g,400,200,'#8A9A6A',-.01,50,['#7A8A5A','#9AAA7A','#6E7E50']);
    W.rounds.forEach(r=>{const lg=new THREE.Group();lg.position.set(...r.position);g.add(lg);CT[r.template](lg,S);});
    for(let i=0;i<20;i++){const a=i/20*6.28,d=150+R()*20;mesh(new THREE.ConeGeometry(20+R()*12,26+R()*20,6),M(0x7E93A6,{flatShading:true}),Math.cos(a)*d+80,10,Math.sin(a)*d-30,g);}
    this._S=S;return S;},
  escapeBuild(W){const S={};const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=50;E.scene.fog.far=260;S.ground=ground(g,400,200,'#8A9A6A',-.01,50,['#7A8A5A','#9AAA7A','#6E7E50']);
    W.areas.forEach(a=>{const lg=new THREE.Group();lg.position.set(...a.center);g.add(lg);EZ[a.id](lg,S);if(S.jetty&&!S.jettyW){S.jettyW=S.jetty.clone().add(lg.position);}if(S.treePos&&!S.treeW){S.treeW=S.treePos.clone().add(lg.position);}});
    const cp=V(...W.areas.find(a=>a.id==='court').center);walker(g,{robe:0x6A5A4A,hat:'farmer'},[V(cp.x+7,0,cp.z+3),V(cp.x-3,0,cp.z-1.6),V(cp.x-7,0,cp.z+3)],.6);
    S.models=EZM;this._S=S;return S;},
  zoneModel(style,col,label){const g=new THREE.Group();const info=(ZM[style]||ZM.pad)(g,col,label||'');return Object.assign({g},info);},
  folk(o){return folk(o);},
  build(W,stagePos){const S={};const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=50;E.scene.fog.far=260;
    ground(g,300,260,'#8A9A6A',-.01,40,['#7A8A5A','#9AAA7A','#6E7E50']);
    stagePos.forEach((p,i)=>{const lg=new THREE.Group();lg.position.copy(p);g.add(lg);template(W.stages[i].template,lg,S);});
    for(let i=0;i<stagePos.length;i++){const a=i===0?V(0,0,14):stagePos[i-1],b=stagePos[i];const d=b.clone().sub(a),L=d.length();const gg=new THREE.Group();gg.position.set((a.x+b.x)/2,.015,(a.z+b.z)/2);gg.rotation.y=Math.atan2(d.x,d.z);g.add(gg);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,L),M(0xB8A07A));m.rotation.x=-Math.PI/2;gg.add(m);}
    for(let i=0;i<70;i++){const x=-60+R()*150,z=-120+R()*130;if(stagePos.some(p=>Math.hypot(x-p.x,z-p.z)<16))continue;pine(g,x,z,1+R());}
    for(let i=0;i<20;i++){const a=i/20*6.28,d=150+R()*20;mesh(new THREE.ConeGeometry(20+R()*12,26+R()*20,6),M(0x7E93A6,{flatShading:true}),Math.cos(a)*d+20,10,Math.sin(a)*d-50,g);}
    S.pos=stagePos;this._S=S;this._W=W;return S;},
  prop(type){const g=new THREE.Group();const h=(P[type]||P2[type]||P.slips)(g);REF[type]=g;return {g,h};},
  onFrame(dt,t){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;f.m.rotation.x+=dt*f.spin;f.m.rotation.z+=dt*f.spin;if(f.m.material.opacity!=null)f.m.material.opacity=Math.max(0,Math.min(1,f.life));if(f.life<=0){f.m.parent.remove(f.m);FX.splice(i,1);}}
    walkers.forEach(w=>{const tg=w.path[w.i];const d=tg.clone().sub(w.g.position);d.y=0;const L=d.length();if(L<.05){w.i=(w.i+1)%w.path.length;if(w.i===0&&w.path.length===2){w.g.position.copy(w.path[0]);w.i=1;}return;}
      w.g.position.addScaledVector(d.normalize(),Math.min(L,w.speed*dt));w.g.rotation.y=Math.atan2(d.x,d.z);w.ph+=dt*6;const s=Math.sin(w.ph)*.45;w.g.userData.legs[0].rotation.x=s;w.g.userData.legs[1].rotation.x=-s;});
    const S2=this._S;if(S2){if(S2.riverTex)S2.riverTex.offset.x-=dt*.25;if(S2.escRiver)S2.escRiver.offset.x-=dt*.2;if(S2.iceRiver)S2.iceRiver.offset.x-=dt*.12;if(S2.lakeTex){S2.lakeTex.offset.x+=dt*.01;S2.lakeTex.offset.y+=dt*.006;}
      if(S2.snowAt&&S2.snowOn){S2.sn=(S2.sn||0)+dt;if(S2.sn>.05){S2.sn=0;const o=S2.snowAt;const m=new THREE.Mesh(new THREE.SphereGeometry(.04,5,4),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true}));m.position.set(o.x-12+Math.random()*24,6,o.z-8+Math.random()*12);E.scene.add(m);FX.push({m,v:V(.2,-1.2,0),g:0,life:5,spin:0});}}if(S2.petals&&S2.petalSpawn){S2.pt=(S2.pt||0)+dt;if(S2.pt>.12){S2.pt=0;const o=S2.petalSpawn;const m=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),new THREE.MeshBasicMaterial({color:0xF8C8D2,transparent:true,side:THREE.DoubleSide}));m.position.set(o.x-10+Math.random()*20,4+Math.random()*2,o.z-7+Math.random()*10);E.scene.add(m);FX.push({m,v:V(.3,-.6,.1),g:0,life:7,spin:2});}}
      if(S2.incenseAt){S2.it=(S2.it||0)+dt;if(S2.it>.25){S2.it=0;const m=new THREE.Mesh(new THREE.SphereGeometry(.08,6,4),new THREE.MeshBasicMaterial({color:0xD8D8D0,transparent:true,opacity:.6}));m.position.copy(S2.incenseAt);E.scene.add(m);FX.push({m,v:V((Math.random()-.5)*.1,.45,0),g:0,life:2.6,spin:0});}}}
    if(this._S&&this._S.mist)this._S.mist.forEach((m,i)=>m.position.x=Math.sin(t*.1+i)*3);if(this._S&&this._S.streamTex)this._S.streamTex.offset.y-=dt*.3;}
};

const FX=[];
function burst(pos,col,n,spd,g,life,geo){for(let i=0;i<n;i++){const m=new THREE.Mesh(geo||new THREE.BoxGeometry(.1,.1,.02),new THREE.MeshBasicMaterial({color:col,transparent:true,side:THREE.DoubleSide}));m.position.copy(pos);E.scene.add(m);FX.push({m,v:V((Math.random()-.5)*spd,Math.random()*spd+.6,(Math.random()-.5)*spd),g:g==null?3:g,life:life||1.6,spin:(Math.random()-.5)*8});}}
function tween(d,fn){return new Promise(res=>{const t0=performance.now();const D=Math.max(.01,d*(window.__fast?.15:1)*1000);const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
const ease=k=>k*k*(3-2*k);
const wpos=o=>{const v=V();o.getWorldPosition(v);return v;};
function btnStep(speaker,text,labels){return new Promise(async res=>{E.actions([]);await E.showLine(speaker,text);E.actions(labels.map((l,i)=>E.btn(i?'ghost':'next',l,()=>res(i))));});}
E.kits.ancient_town.interact=async function(name,ctx){const S=this._S,CH=ctx.CH;
  if(name==='scale'){const sc=S.scale,beam=sc.userData.beam,pans=sc.userData.pans;let tilt=0;const cam0=E.camera.position.clone(),look0=E.cam.look.clone(),sw=wpos(sc);await E.camTo(sw.clone().add(V(.4,1.9,3.4)),sw.clone().add(V(0,1.2,0)),1.2);const setTilt=t=>tween(.6,k=>{beam.rotation.z=tilt+(t-tilt)*ease(k);}).then(()=>tilt=t);
    E.chars.player&&(E.chars.player.lookAt=wpos(sc));
    await btnStep('mentor','先別急著聽我說。把魚和熊掌都放上秤，比一比哪一樣更珍貴。',['放上一條魚']);E.actions([]);
    const fish=new THREE.Group();P.fish_basket(new THREE.Group());const f=E.mesh(new THREE.SphereGeometry(.5,10,8),E.M(0x9FB7C4),0,.08,0,fish);f.scale.set(.42,.1,.13);pans[0].add(fish);
    await tween(.5,k=>{fish.position.y=.9*(1-k)+.06;});await setTilt(.08);
    await btnStep('companion','秤向魚這邊斜了一點。再把熊掌放上去看看？',['放上熊掌']);E.actions([]);
    const paw=new THREE.Group();const p=E.mesh(new THREE.SphereGeometry(.5,10,8),E.M(0x4A2E1C),0,.06,0,paw);p.scale.set(.36,.13,.3);pans[1].add(paw);
    await tween(.5,k=>{paw.position.y=.9*(1-k)+.04;});await setTilt(-.32);E.emote(CH.companion,'hop');
    const pick=await btnStep('mentor','熊掌那一邊沉得多：它難得，也珍貴。兩樣都想要，可是只能拿走一樣，你拿哪一樣？',['拿熊掌','拿魚']);E.actions([]);
    const take=pick===0?paw:fish;await tween(.5,k=>{take.position.y=.06+k*1.2;take.scale.setScalar(1-k*.6);});take.parent.remove(take);await setTilt(pick===0?.1:-.4);
    await E.say('mentor',pick===0?'我也會拿熊掌。兩樣都想要時，取更珍貴的那一樣。':'魚也不錯，但熊掌難得得多。換作是我，會捨魚而取熊掌。');if(E.chars.player)E.chars.player.lookAt=null;await E.camTo(cam0,look0,1);return;}
  if(name==='kick'){const bowl=REF.soup_bowl,b=bowl.userData.bowl,R2=CH.rival;const bp=wpos(bowl);R2.speed=2.2;R2.target.copy(bp).add(V(.7,0,.35)).setY(0);
    await new Promise(r=>{R2.onArrive=r;setTimeout(r,4000);});E.emote(R2,'hop');await tween(.45,k=>{b.rotation.z=-1.5*ease(k);b.position.x=1.2*k;b.position.z=.5*k;});burst(wpos(b).add(V(0,.1,0)),0xF2EEE2,14,1.4,4,1.2,new THREE.SphereGeometry(.04,6,4));return;}
  if(name==='letter'){const L=REF.letter,pos=wpos(L).add(V(0,.95,0));
    if(ctx.choice==='correct'){E.emote(E.chars.player||CH.companion,'hop');L.visible=false;burst(pos,0xF6F1E3,26,2.2,1.2,2.2,new THREE.PlaneGeometry(.12,.16));E.flash(true);await tween(1.4,()=>{});await E.say('narrator','你把誣告信撕得粉碎。');}
    else{const seal=E.box(.14,.015,.14,0xC8221A,0,.84,0,L);seal.scale.setScalar(.1);await tween(.6,k=>seal.scale.setScalar(.1+.9*ease(k)));E.emote(CH.rival,'hop');await E.say('narrator','你在信上蓋了印……');}
    return;}
  if(name==='chest_open'){const c=REF.chest,lid=c.userData.lid;S.gate&&await tween(1,k=>{S.gate[0].rotation.y=1.3*ease(k);S.gate[1].rotation.y=-1.3*ease(k);});
    await tween(.8,k=>{lid.rotation.x=-1.7*ease(k);});burst(wpos(c).add(V(0,.7,0)),0xF2D27A,30,1.3,1.5,2,new THREE.CylinderGeometry(.05,.05,.015,10));E.emote(CH.rival,'hop');
    await E.say('rival','看！一箱金銀珠寶，大門也為你打開了！');return;}
  if(name==='chest'){const c=REF.chest,lid=c.userData.lid;
    if(ctx.choice==='correct'){await tween(.5,k=>{lid.rotation.x=-1.7*(1-ease(k));});if(S.gate)await tween(1,k=>{S.gate[0].rotation.y=1.3*(1-ease(k));S.gate[1].rotation.y=-1.3*(1-ease(k));});E.flash(true);await E.say('narrator','你合上箱子。萬鍾府的大門，在你身後關上了。');}
    else{const pl=E.chars.player||CH.companion;burst(wpos(c).add(V(0,.7,0)),0xF2D27A,40,1.8,1,2.2,new THREE.CylinderGeometry(.05,.05,.015,10));E.emote(CH.rival,'hop');E.emote(pl,'hop');await tween(1.2,()=>{});await E.say('narrator','金光閃閃……心燈卻暗了下來。');}
    return;}
};

E.kits.ancient_town.escInteract=async function(name,ctx){const S=this._S,CH=ctx.CH;
  if(name==='pour'){const gd=ctx.obj.g;await btnStep('mentor','惠子說這個大瓠沒有用。不如你親手試試：用它來盛水。',['把水倒進大瓠']);E.actions([]);
    const top=wpos(gd).add(V(0,2.3,0));for(let i=0;i<4;i++){burst(top,0x6FB0E0,10,.3,6,.6,new THREE.SphereGeometry(.05,6,4));await tween(.25,()=>{});}
    const cracks=[];for(let i=0;i<6;i++){const c=E.box(.025,.5+Math.random()*.4,.02,0x3A2A12,0,0,0,gd);const a=Math.random()*6.28;c.position.set(Math.cos(a)*.66,.9+(Math.random()-.5)*.4,Math.sin(a)*.66);c.rotation.set(0,-a,(Math.random()-.5)*.8);cracks.push(c);await tween(.12,()=>{});}
    for(let i=0;i<5;i++){burst(wpos(gd).add(V(.5,.6,.3)),0x6FB0E0,4,.4,4,.8,new THREE.SphereGeometry(.04,6,4));await tween(.2,()=>{});}E.emote(CH.companion,'shake');
    await E.say('companion','裂開了！瓠殼不夠堅固，盛了水就撐不住自己的重量。');await E.say('mentor','這就是「其堅不能自舉」。惠子由此認定它沒用。但真的沒用嗎？');return;}
  if(name==='float'){const jt=S.jettyW;const fl=new THREE.Group();fl.position.copy(jt).add(V(-.2,.7,2.6));E.scene.add(fl);const b=E.mesh(new THREE.SphereGeometry(.68,18,14),E.M(0xC9B458),0,0,0,fl);b.scale.set(1.2,.7,1);
    await btnStep('mentor','大瓠盛水會裂，做瓢又太淺。換個用法吧：把它鑿空、封好，縛在身上，就是一個大樽。',['鑿空大瓠']);E.actions([]);
    for(let i=0;i<6;i++){burst(wpos(fl).add(V(0,.4,0)),0xD8C080,6,1,4,.8);await tween(.18,()=>{});}const rope=E.mesh(new THREE.TorusGeometry(.75,.05,6,24),E.M(0x8A6A3A),0,0,0,fl);rope.rotation.x=Math.PI/2;
    await btnStep('companion','做好了！我們把它推下江去？',['推下江湖']);E.actions([]);const p0=fl.position.clone();
    await tween(1.2,k=>{fl.position.lerpVectors(p0,p0.clone().add(V(0,-.55,-2.6)),k);fl.position.y=p0.y+Math.sin(k*Math.PI)*.4-.55*k;});burst(wpos(fl),0xBFE8FA,20,1.6,4,1);
    const cp=CH.companion,c0=cp.root.position.clone();E.emote(cp,'hop');const p1=fl.position.clone();
    await tween(4,k=>{fl.position.set(p1.x+k*6,p1.y+Math.sin(k*20)*.06,p1.z);fl.rotation.z=Math.sin(k*14)*.08;cp.root.position.set(fl.position.x,fl.position.y+.25,fl.position.z);cp.target.copy(cp.root.position);});
    E.flash(true);await E.say('companion','我浮起來了！大瓠原來可以浮遊江湖！');cp.root.position.copy(c0);cp.target.copy(c0);fl.visible=false;E.scene.remove(fl);return;}
  if(name==='rest'){const P=CH.player,tp=S.treeW;const p0=P.root.position.clone();P.target.copy(tp).add(V(1.4,0,1.2));await new Promise(r=>{P.onArrive=r;setTimeout(r,4000);});
    await btnStep('mentor','大樹不中繩墨，木匠看也不看。正因為無用，斧頭也傷不了它。來，在樹下躺一躺。',['在樹下逍遙寢臥']);E.actions([]);
    await tween(.6,k=>{P.root.rotation.z=k*Math.PI/2;P.root.position.y=.3*k;});
    for(let i=0;i<20;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.14,.1),new THREE.MeshBasicMaterial({color:[0x7AA85A,0xC8B04A][i%2],transparent:true,side:THREE.DoubleSide}));m.position.copy(tp).add(V((Math.random()-.5)*4,4+Math.random()*2,(Math.random()-.5)*4));E.scene.add(m);FX.push({m,v:V(.2,-.5,.1),g:0,life:6,spin:2});}
    E.flash(true,0xFFF0C0);await tween(3,()=>{});await E.say('narrator','風吹過樹葉。無所可用，安所困苦哉？');await tween(.5,k=>{P.root.rotation.z=(1-k)*Math.PI/2;P.root.position.y=.3*(1-k);});return;}
};

const _oldInteract=E.kits.ancient_town.interact;
const XI={
  async gourd_try(ctx){const gd=REF.gourd_vine.userData.gourd;await btnStep('mentor','惠子說這個大瓠沒用。你親手試試：用它來盛水。',['把水倒進大瓠']);E.actions([]);
    const top=wpos(gd).add(V(0,1.9,0));for(let i=0;i<4;i++){burst(top,0x6FB0E0,10,.3,6,.6,new THREE.SphereGeometry(.05,6,4));await tween(.25,()=>{});}
    for(let i=0;i<6;i++){const c=E.box(.025,.5+Math.random()*.4,.02,0x3A2A12,0,0,0,gd);const a=Math.random()*6.28;c.position.set(Math.cos(a)*.66,.75+(Math.random()-.5)*.4,Math.sin(a)*.66);c.rotation.set(0,-a,(Math.random()-.5)*.8);await tween(.12,()=>{});}
    for(let i=0;i<4;i++){burst(wpos(gd).add(V(.5,.4,.3)),0x6FB0E0,4,.4,4,.8,new THREE.SphereGeometry(.04,6,4));await tween(.2,()=>{});}E.emote(ctx.CH.companion,'shake');
    await E.say('companion','裂開了！瓠殼不夠堅固，盛了水就撐不住自己的重量。');},
  async smash_raise(ctx){const rv=ctx.CH.rival,gd=REF.gourd_vine;rv.speed=2.2;rv.target.copy(wpos(gd)).add(V(1.3,0,.6)).setY(0);await new Promise(r=>{rv.onArrive=r;setTimeout(r,3500);});
    const st=new THREE.Group();st.position.set(.35,1.3,0);rv.root.add(st);E.box(.06,1.1,.06,0x6A4A2A,0,.5,0,st);REF._stick=st;await tween(.5,k=>{st.rotation.z=1.2*k;});},
  async smash(ctx){const st=REF._stick,gd=REF.gourd_vine.userData.gourd;
    if(ctx.choice==='correct'){E.emote(ctx.CH.mentor,'hop');await tween(.4,k=>{st.rotation.z=1.2*(1-k);});await E.say('mentor','且慢！夫子固拙於用大矣！');}
    else{await tween(.25,k=>{st.rotation.z=1.2-2.4*k;});burst(wpos(gd).add(V(0,.8,0)),0xC9B458,30,2.2,5,1.6,new THREE.BoxGeometry(.18,.12,.04));gd.visible=false;E.flash(false);await tween(1,()=>{});gd.visible=true;await E.say('narrator','大瓠碎了一地……幸好這只是想像。莊子搖搖頭，又變出一個新的大瓠。');}
    st.parent.remove(st);},
  async medicine(ctx){const S=this._S,w=S.washer;S.snowOn=true;await btnStep('mentor','先看看宋人一家怎樣工作。',['不搽藥，把手伸進冰水']);E.actions([]);
    const marks=[];w.userData.arms.forEach(a=>{for(let i=0;i<3;i++){const m=E.box(.11,.03,.11,0xC8302A,0,-.15-i*.12,0,a);marks.push(m);}});E.emote(w,'shake');E.flash(false,0x8AB0D8);
    await E.say('companion','好凍！他的手凍得裂開了。');await btnStep('mentor','現在試試宋人的藥。',['搽上不龜手之藥']);E.actions([]);burst(wpos(w).add(V(0,1.2,0)),0xBFE0F0,12,.8,1,1.2,new THREE.SphereGeometry(.05,6,4));
    await tween(.6,k=>marks.forEach(m=>m.scale.setScalar(1-k)));marks.forEach(m=>m.parent.remove(m));E.emote(w,'hop');
    await btnStep('companion','手完全沒事！難怪他們世世代代都做這一行。後來有個客人用百金買了藥方……',['看看客人怎樣用']);E.actions([]);
    const c=wpos(w).setY(0).add(V(1.2,0,-5));const mk=(col,x)=>{const s=new THREE.Group();s.position.set(c.x+x,.2,c.z);E.scene.add(s);E.box(2.4,.5,1,0x5A3A22,0,0,0,s);E.box(.08,2,.08,0x3A2A1A,0,1.1,0,s);const sl=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.2),new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}));sl.position.set(.3,1.3,0);s.add(sl);return s;};
    const wu=[mk(0xC8302A,-11),mk(0xC8302A,-13),mk(0xC8302A,-12)],yue=[mk(0x3A7A4A,8),mk(0x3A7A4A,10),mk(0x3A7A4A,9)];wu[1].position.z-=1.2;wu[2].position.z+=1.2;yue[1].position.z-=1.2;yue[2].position.z+=1.2;
    await E.say('narrator','冬天，吳國和越國在水上交戰。吳國士兵搽了不龜手之藥，手不凍裂。');
    const w0=wu.map(s=>s.position.x),y0=yue.map(s=>s.position.x);await tween(3,k=>{wu.forEach((s,i)=>s.position.x=w0[i]+k*13);yue.forEach((s,i)=>{s.position.x=y0[i]+(k>.5?(k-.5)*14:0);s.rotation.z=k>.5?Math.sin(k*30)*.1:0;});});
    yue.forEach(s=>burst(s.position.clone().add(V(0,.6,0)),0xBFE8FA,12,1.6,4,1));E.flash(true);await E.say('narrator','越人大敗。吳王「裂地而封之」，客人因此得到封地。');[...wu,...yue].forEach(s=>E.scene.remove(s));S.snowOn=false;},
  async carve(ctx){const f=REF.gourd_float;await btnStep('mentor','盛水會裂，做瓢太淺，就不要再拿它盛東西。把它鑿空、封好、縛上繩子。',['鑿空大瓠']);E.actions([]);
    for(let i=0;i<6;i++){burst(wpos(f).add(V(0,.7,0)),0xD8C080,6,1,4,.8);await tween(.18,()=>{});}const rope=E.mesh(new THREE.TorusGeometry(.8,.05,6,24),E.M(0x8A6A3A),0,.5,0,f);rope.rotation.x=Math.PI/2;await E.say('companion','變成一個大浮具了！');},
  async voyage(ctx){const f=REF.gourd_float,CH=ctx.CH,P=CH.player,cp=CH.companion;
    if(ctx.choice!=='correct'){const p0=f.position.clone();await tween(1,k=>{f.position.set(p0.x-3*k,p0.y+Math.sin(k*Math.PI)*1.5,p0.z+1*k);});burst(wpos(f),0x8A9A4A,14,1.2,4,1);await E.say('narrator','大瓠被丟進了蓬草叢裡。');f.position.copy(p0);return;}
    const p0=f.position.clone(),pp=P.root.position.clone(),cp0=cp.root.position.clone();await tween(1,k=>{f.position.lerpVectors(p0,p0.clone().add(V(0,0,-3.2)),k);});burst(wpos(f),0xBFE8FA,20,1.6,4,1);
    const cam0=E.camera.position.clone(),look0=E.cam.look.clone();const base=f.position.clone();
    await tween(5,k=>{f.position.set(base.x+Math.sin(k*2)*1.5,base.y+Math.sin(k*25)*.05,base.z-k*14);f.rotation.z=Math.sin(k*12)*.08;const fw=wpos(f);P.root.position.set(fw.x-.3,fw.y+.35,fw.z);P.target.copy(P.root.position);cp.root.position.set(fw.x+.4,fw.y+.35,fw.z+.2);cp.target.copy(cp.root.position);
      E.camera.position.set(fw.x,fw.y+3.5,fw.z+7);E.cam.look.copy(fw);});
    E.flash(true,0xFFE8C8);await E.say('narrator','你們乘著大樽，浮遊在江湖之上，無拘無束。');
    E.camera.position.copy(cam0);E.cam.look.copy(look0);f.position.copy(p0);f.rotation.z=0;P.root.position.copy(pp);P.target.copy(pp);cp.root.position.copy(cp0);cp.target.copy(cp0);},
  async wildcat_yak(ctx){const tr=REF.trap,tp=wpos(tr);await btnStep('mentor','你見過狸狌嗎？牠伏著身子，等候出遊的小動物。',['看狸狌捕獵']);E.actions([]);
    const cat=catModel();cat.position.copy(tp).add(V(-3,0,.6));await tween(.6,k=>cat.scale.set(1,1-.4*k,1));
    const hops=[V(-1.5,0,-.4),V(1.6,0,.8),V(-.6,0,1.0),V(0,0,0)];let from=cat.position.clone();
    for(const h of hops){const to=tp.clone().add(h);await tween(.55,k=>{cat.position.lerpVectors(from,to,k);cat.position.y=Math.sin(k*Math.PI)*1.2;cat.rotation.y=Math.atan2(-(to.z-from.z),to.x-from.x);});from=to.clone();}
    const n=tr.userData.net;await tween(.4,k=>{n.scale.set(1,.6+.4*k,1);});E.emote(ctx.CH.companion,'shake');await E.say('companion','牠東竄西跳，結果「中於機辟，死於罔罟」……');E.scene.remove(cat);n.scale.set(1,.6,1);
    await btnStep('mentor','再看斄牛。牠大得像天邊的雲。',['看斄牛捉老鼠']);E.actions([]);
    const yak=yakModel();yak.position.copy(tp).add(V(-6,0,-1.5));const mouse=E.mesh(new THREE.SphereGeometry(.08,8,6),E.M(0x8A8A8A),0,0,0,E.scene);mouse.position.copy(tp).add(V(1,.08,-1));
    await tween(2.4,k=>{yak.position.x=tp.x-6+k*5;mouse.position.x=tp.x+1+k*4;mouse.position.z=tp.z-1+Math.sin(k*20)*.3;yak.rotation.z=Math.sin(k*30)*.03;});
    await E.say('companion','這麼大，卻捉不到一隻小老鼠！');await tween(1.2,k=>{yak.position.x=tp.x-1+k*-6;});E.scene.remove(yak);E.scene.remove(mouse);},
  async tree_fate(ctx){const S=this._S,CH=ctx.CH,P=CH.player;
    if(ctx.choice!=='correct'){const tp=S.shuPos;const axe=new THREE.Group();axe.position.copy(tp).add(V(1.2,1.2,1));E.scene.add(axe);E.box(.06,1,.06,0x8A6A3A,0,0,0,axe);E.box(.3,.2,.05,0x8A8E92,.12,.45,0,axe);
      for(let i=0;i<3;i++){await tween(.25,k=>{axe.rotation.z=1.2-1.6*k;});burst(tp.clone().add(V(.6,1,.6)),0xC8A060,8,1.2,4,1);await tween(.2,k=>{axe.rotation.z=-.4+1.6*k;});}
      E.scene.remove(axe);await E.say('narrator','斧頭砍向大樹……木匠搖搖頭：這木頭，做甚麼都不成材。');return;}
    const wl=V(...((this._W&&this._W.wilderness)||[-30,0,-150]));if(!S.wild){const g=new THREE.Group();g.position.copy(wl);E.scene.add(g);ground(g,200,200,'#A8B87A',.02,20,['#98A86A','#B8C88A']);bigTree(g,0,0);S.wild=g;}
    const cam0=E.camera.position.clone(),look0=E.cam.look.clone(),pp=P.root.position.clone();
    await E.camTo(wl.clone().add(V(0,18,30)),wl.clone().add(V(0,2,0)),2.5);await E.say('narrator','無何有之鄉，廣莫之野。四野空曠，只有這一棵大樹。');
    P.root.position.copy(wl).add(V(1.6,0,1.4));P.target.copy(P.root.position);await E.camTo(wl.clone().add(V(4,3.5,8)),wl.clone().add(V(1,1,1)),2);
    await tween(.6,k=>{P.root.rotation.z=k*Math.PI/2;P.root.position.y=.3*k;});
    for(let i=0;i<24;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.14,.1),new THREE.MeshBasicMaterial({color:[0x7AA85A,0xC8B04A][i%2],transparent:true,side:THREE.DoubleSide}));m.position.copy(wl).add(V((Math.random()-.5)*5,4+Math.random()*2,(Math.random()-.5)*5));E.scene.add(m);FX.push({m,v:V(.2,-.5,.1),g:0,life:6,spin:2});}
    E.flash(true,0xFFF0C0);await tween(2.5,()=>{});await E.say('narrator','彷徨乎無為其側，逍遙乎寢臥其下。不夭斤斧，物無害者。');
    P.root.rotation.z=0;P.root.position.copy(pp);P.target.copy(pp);await E.camTo(cam0,look0,2);}
};
E.kits.ancient_town.interact=async function(name,ctx){if(XI[name])return XI[name].call(this,ctx);return _oldInteract.call(this,name,ctx);};

/* ---------- 山居秋暝 mountain retreat (rhythm mode) ---------- */
function maple(g,x,z){const t=new THREE.Group();t.position.set(x,0,z);g.add(t);mesh(new THREE.CylinderGeometry(.12,.2,2,7),M(0x5A3A22),0,1,0,t);const leaves=[];for(let k2=0;k2<5;k2++)leaves.push(mesh(new THREE.IcosahedronGeometry(.6+R()*.3,0),new THREE.MeshLambertMaterial({color:0x6A9A4A,flatShading:true}),(R()-.5)*1.3,2+R()*.7,(R()-.5)*1,t));t.userData.leaves=leaves;return t;}
function bamboo(g,x,z,n){const grp=new THREE.Group();grp.position.set(x,0,z);g.add(grp);const st=[];for(let i=0;i<n;i++){const s=new THREE.Group();s.position.set((R()-.5)*3,0,(R()-.5)*2);grp.add(s);const h=3+R()*1.6;mesh(new THREE.CylinderGeometry(.05,.06,h,6),M(0x6A9A3A),0,h/2,0,s);for(let k2=0;k2<4;k2++)box(.02,.02,.02,0x4E7A2A,0,.8+k2*.7,0,s);
  for(let k2=0;k2<3;k2++){const l=mesh(new THREE.ConeGeometry(.18,.6,4),M(0x7AAA4A,{flatShading:true}),(R()-.5)*.3,h-.3+k2*.15,(R()-.5)*.3,s);l.rotation.z=(R()-.5)*1.4;}st.push(s);}return st;}
E.kits.ancient_town.rhythmBuild=function(W){const S={};const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=40;E.scene.fog.far=220;
  ground(g,140,100,'#6E8250',-.01,20,['#5E7240','#7E9260','#667A48']);
  const path=new THREE.Mesh(new THREE.PlaneGeometry(2.2,20),M(0xA8987A));path.rotation.x=-Math.PI/2;path.position.set(0,.012,-1);g.add(path);
  const hut=new THREE.Group();hut.position.set(0,0,-7);g.add(hut);box(5,.3,3.6,0x8A8478,0,.15,0,hut);[[-2.2,-1.5],[2.2,-1.5],[-2.2,1.5],[2.2,1.5]].forEach(([x,z])=>box(.18,2.4,.18,0x6A4428,x,1.5,z,hut));
  const th=tex(128,64,(c,W2,H)=>{c.fillStyle='#B89A5A';c.fillRect(0,0,W2,H);for(let i=0;i<120;i++){c.strokeStyle=R()<.5?'#9A7E44':'#C8AA6A';c.beginPath();const x=R()*W2;c.moveTo(x,0);c.lineTo(x+(R()-.5)*8,H);c.stroke();}});th.wrapS=th.wrapT=THREE.RepeatWrapping;
  const s=new THREE.Shape();s.moveTo(-2.6,0);s.lineTo(0,1.6);s.lineTo(2.6,0);s.lineTo(-2.6,0);const rg=new THREE.ExtrudeGeometry(s,{depth:4.4,bevelEnabled:false});rg.translate(0,0,-2.2);const rf=new THREE.Mesh(rg,new THREE.MeshLambertMaterial({map:th}));rf.position.y=2.6;rf.rotation.y=Math.PI/2;hut.add(rf);
  const lan=new THREE.Group();lan.position.set(1.4,2.2,1.6);hut.add(lan);mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshLambertMaterial({color:0x7A2A20,emissive:0x000000}),0,0,0,lan);S.hutLamp=lan.children[0];
  mesh(new THREE.CylinderGeometry(.55,.5,.5,12),M(0x8A8A82),0,.55,-.2,hut);
  S.pines=[];[[-9,-9],[-7,-11],[-11,-6],[-5,-12.5],[-12.5,-10]].forEach(([x,z])=>S.pines.push(pine(g,x,z,1.6+R()*.5)));
  S.moon=mesh(new THREE.SphereGeometry(2.2,24,16),new THREE.MeshBasicMaterial({color:0xFFF4D0,transparent:true,opacity:.0}),-8,2,-34,g);
  const rays=new THREE.Mesh(new THREE.ConeGeometry(4,14,24,1,true),new THREE.MeshBasicMaterial({color:0xFFF4D0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));rays.position.set(-7,5,-12);rays.rotation.z=.4;g.add(rays);S.rays=rays;
  for(let i=0;i<6;i++)mesh(new THREE.ConeGeometry(14+R()*8,16+R()*10,6),M(0x5A6E78,{flatShading:true}),-40+i*16,6,-44-R()*6,g);
  S.maples=[[-5,-3.5],[-3.6,-5.2],[-6.6,-1.4]].map(([x,z])=>maple(g,x,z));
  const wt=tex(64,256,(c,W2,H)=>{c.fillStyle='#7CC0E8';c.fillRect(0,0,W2,H);for(let i=0;i<70;i++){c.fillStyle='rgba(255,255,255,'+(.3+R()*.5)+')';c.fillRect(R()*W2,R()*H,2+R()*3,10+R()*26);}});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;S.springTex=wt;
  const ft=tex(128,128,(c,W2,H)=>{c.fillStyle='#6AB0DA';c.fillRect(0,0,W2,H);for(let i=0;i<50;i++){c.fillStyle='rgba(255,255,255,.35)';c.fillRect(R()*W2,R()*H,18,2);}});ft.wrapS=ft.wrapT=THREE.RepeatWrapping;S.flowTex=ft;
  S.springMats=[];S.splashPts=[];const cs=new THREE.Group();cs.position.set(6.4,0,-5.2);g.add(cs);const stone=M(0x8E8A80,{flatShading:true});
  const steps=[[0,3.0,0],[.3,2.2,1.5],[-.2,1.4,3.0],[.2,.7,4.4],[0,.12,5.8]];
  for(let s2=0;s2<steps.length;s2++){const [x,y,z]=steps[s2];const sl=mesh(new THREE.BoxGeometry(2.2,.5,1.5),stone,x,y-.25,z,cs);sl.rotation.y=(R()-.5)*.2;
    for(let q=0;q<4;q++){const r=mesh(new THREE.DodecahedronGeometry(.35+R()*.45,0),stone,x+(q<2?-1.3:1.3)+(R()-.5)*.3,y-.1+R()*.3,z+(R()-.5)*1.2,cs);r.scale.y=.8;}
    const fm=new THREE.MeshLambertMaterial({map:ft,transparent:true,opacity:.15,emissive:0x1E5A86});const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),fm);fl.rotation.x=-Math.PI/2;fl.position.set(x,y+.02,z);cs.add(fl);S.springMats.push(fm);
    if(s2<steps.length-1){const nx=steps[s2+1];const drop=y-nx[1];const cm=new THREE.MeshLambertMaterial({map:wt,transparent:true,opacity:.12,side:THREE.DoubleSide,emissive:0x2A6A98});const cu=new THREE.Mesh(new THREE.PlaneGeometry(1,drop+.1),cm);cu.position.set((x+nx[0])/2,(y+nx[1])/2,z+.78);cu.rotation.x=-.18;cs.add(cu);S.springMats.push(cm);S.splashPts.push(cs.position.clone().add(V(nx[0],nx[1]+.1,z+.95)));}}
  for(let q=0;q<10;q++){const r=mesh(new THREE.DodecahedronGeometry(.5+R()*.7,0),stone,(R()-.5)*5,.2+R()*1.2,-1.5-R()*2,cs);r.scale.y=.7;}
  for(let q=0;q<3;q++)mesh(new THREE.IcosahedronGeometry(.45,0),M(0x4E7A3E,{flatShading:true}),-1.6+q*1.6,3.3,-.6,cs);
  S.bamboo=bamboo(g,9.6,-4.6,26);const vill=new THREE.Group();vill.position.set(14,0,-8);g.add(vill);building(vill,0,0,3.6,2.6,2,{roof:'grey'});
  const pond=new THREE.Mesh(new THREE.CircleGeometry(4.2,32),new THREE.MeshLambertMaterial({color:0x4E86A8}));pond.rotation.x=-Math.PI/2;pond.position.set(5.6,.02,3.6);g.add(pond);
  S.lotus=[];for(let i=0;i<14;i++){const a=R()*6.28,d=1+R()*2.8;const l=mesh(new THREE.CylinderGeometry(.35,.35,.02,12),M(0x3E8A4A),5.6+Math.cos(a)*d,.06,3.6+Math.sin(a)*d,g);S.lotus.push(l);if(i%3===0)mesh(new THREE.ConeGeometry(.12,.25,6),M(0xF2A0B8),l.position.x,.2,l.position.z,g);}
  const boat=new THREE.Group();boat.position.set(9.8,.1,1.6);g.add(boat);box(1.6,.25,.5,0x6A4428,0,0,0,boat);box(.06,.9,.06,0x5A3A22,.5,.5,0,boat);const fm=new E.ancientFolk({hat:'farmer',robe:0x5A6A7A});fm.position.set(-.2,.05,0);fm.scale.setScalar(.8);boat.add(fm);S.boat=boat;
  S.washers=[0,1].map(i=>{const f=E.ancientFolk({basket:true,robe:[0x8A6A9A,0x9A7A5A][i]});f.position.set(7.4+i*.7,0,-1+i*.4);f.visible=false;g.add(f);return f;});
  S.petalT=0;S.state={};S.rain=true;
  const T=(d,fn)=>new Promise(res=>{const t0=performance.now();const D=Math.max(.01,d*(window.__fast?.15:1)*1000);const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});
  S.fx={
    rain:q=>{S.rain=false;return T(1.5,k=>{E.scene.children.length;});},
    autumn:q=>T(1.6,k=>S.maples.forEach(m=>m.userData.leaves.forEach((l,i)=>l.material.color.setRGB(.42+(.85-.42)*k*q,.6-(.6-.3)*k*q,.29-(.29-.12)*k*q)))),
    moon:q=>T(2.4,k=>{S.moon.position.y=2+k*10;S.moon.material.opacity=Math.min(1,k*1.4)*(.4+.6*q);S.rays.material.opacity=.14*k*q;}),
    spring:q=>{S.springOn=.3+q*.7;return T(1.6,k=>{S.springMats.forEach(m=>m.opacity=.12+(.3+.55*q)*k);});},
    bamboo:q=>{S.washers.forEach(w=>w.visible=true);S.bambooSway=q;const p0=S.washers.map(w=>w.position.clone());return T(3,k=>{S.washers.forEach((w,i)=>{w.position.set(p0[i].x+k*6,0,p0[i].z-k*5);w.rotation.y=.9;const s=Math.sin(k*30)*.45;w.userData.legs[0].rotation.x=s;w.userData.legs[1].rotation.x=-s;});}).then(()=>S.washers.forEach(w=>w.visible=false));},
    lotus:q=>{const b0=S.boat.position.clone();return T(3,k=>{S.boat.position.set(b0.x-k*6*q-.6,b0.y+Math.sin(k*20)*.03,b0.z+k*2*q);S.lotus.forEach((l,i)=>{const d=l.position.distanceTo(S.boat.position);l.position.y=.06+(d<1.4?Math.sin(k*40+i)*.06*q:0);});});},
    petals:q=>{S.petalsOn=q;return T(2.4,()=>{}).then(()=>S.petalsOn=0);},
    stay:q=>{S.hutLamp.material.emissive.setHex(0xFF9A3A);S.hutLamp.material.emissiveIntensity=q;return T(1.2,k=>{});}
  };
  S.update=(dt,t)=>{if(S.rain&&Math.random()<.9){const m=new THREE.Mesh(new THREE.BoxGeometry(.015,.3,.015),new THREE.MeshBasicMaterial({color:0xBFD8E8,transparent:true,opacity:.6}));m.position.set((Math.random()-.5)*30,8,(Math.random()-.5)*20-2);E.scene.add(m);FX.push({m,v:V(0,-12,0),g:0,life:.7,spin:0});}
    S.springTex.offset.y+=dt*(S.springOn?1.6*S.springOn:.25);S.flowTex.offset.y+=dt*(S.springOn?.5*S.springOn:.08);if(S.springOn&&Math.random()<.6*S.springOn){const sp=S.splashPts[Math.floor(Math.random()*S.splashPts.length)];const m=new THREE.Mesh(new THREE.SphereGeometry(.04,5,4),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.85}));m.position.copy(sp).add(V((Math.random()-.5)*.8,0,0));E.scene.add(m);FX.push({m,v:V((Math.random()-.5)*.8,.8+Math.random()*.8,.4+Math.random()*.6),g:5,life:.6,spin:0});}if(S.bambooSway)S.bamboo.forEach((b,i)=>b.rotation.z=Math.sin(t*3+i)*.06*S.bambooSway);
    if(S.petalsOn&&Math.random()<.3){const m=new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({color:0xF8C0D0,transparent:true,side:THREE.DoubleSide}));m.position.set(-4+Math.random()*8,4,-4+Math.random()*6);E.scene.add(m);FX.push({m,v:V(.3,-.5,0),g:0,life:5,spin:3});}};
  this._S=S;return S;};
})();
