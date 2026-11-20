/* Scene kit: container_port — Kwai Tsing style container yard with gantry crane, quay crane, ship and trucks */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
E.ENV.port_day={sky:0x9CC8EA,hs:0xF4F1E8,hg:0x5E646A,hi:.76,sc:0xFFF0D6,si:.8,sp:[14,26,12]};
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",sans-serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function rod(g,a,b,r,col){const d=b.clone().sub(a),L=d.length();const m=mesh(new THREE.CylinderGeometry(r,r,L,6),M(col),0,0,0,g);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
function truss(g,a,b,w,col,n){const d=b.clone().sub(a);const side=V(-d.z,0,d.x).normalize().multiplyScalar(w/2);for(let i=0;i<n;i++){const p=a.clone().add(d.clone().multiplyScalar(i/n)),q=a.clone().add(d.clone().multiplyScalar((i+1)/n));rod(g,p.clone().add(side),q.clone().sub(side),.05,col);rod(g,p.clone().sub(side),q.clone().add(side),.05,col);}
  rod(g,a.clone().add(side),b.clone().add(side),.09,col);rod(g,a.clone().sub(side),b.clone().sub(side),.09,col);}

const CELL=2.2,CW=1.95,CD=1.6,CH=1.62,LAYER=1.72;
const ribTex=tex(256,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=10){x.fillStyle='rgba(0,0,0,.16)';x.fillRect(i,0,3,h);x.fillStyle='rgba(255,255,255,.9)';x.fillRect(i+4,0,2,h);}
  x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,w,7);x.fillRect(0,h-7,w,7);x.fillRect(0,0,6,h);x.fillRect(w-6,0,6,h);});
const doorTex=tex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,7);x.fillRect(0,h-7,w,7);x.fillRect(0,0,6,h);x.fillRect(w-6,0,6,h);x.fillRect(w/2-2,0,4,h);
  x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=3;[30,52,76,98].forEach(px=>{x.beginPath();x.moveTo(px,12);x.lineTo(px,h-12);x.stroke();});});
const cMats={};
function cmat(col){if(!cMats[col]){const side=new THREE.MeshLambertMaterial({map:ribTex,color:col}),end=new THREE.MeshLambertMaterial({map:doorTex,color:col}),top=new THREE.MeshLambertMaterial({color:new THREE.Color(col).multiplyScalar(.85)});cMats[col]=[end,end,top,top,side,side];}return cMats[col];}
const cGeo=new THREE.BoxGeometry(CW,CH,CD);
function container(col,label){const m=new THREE.Mesh(cGeo,cmat(col));m.castShadow=true;
  if(label){const t=tex(128,64,(x,w,h)=>{x.fillStyle='rgba(255,255,255,.92)';x.fillRect(4,4,w-8,h-8);x.fillStyle='#16202A';x.font='bold 40px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(label,w/2,h/2+2);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:t,transparent:true}));p.position.set(0,.2,CD/2+.01);m.add(p);const p2=p.clone();p2.rotation.x=-Math.PI/2;p2.position.set(0,CH/2+.01,0);m.add(p2);}
  return m;}

function truck(cab){const g=new THREE.Group();const b=new THREE.Group();g.add(b);
  box(.9,.28,1.95,0x3A3E44,0,.42,.15,b);box(.86,.75,.62,cab||0xD2553F,0,.92,-.62,b);box(.8,.32,.04,0x9CC6E0,0,1.08,-.94,b);box(.88,.12,.64,0xF4F1E8,0,1.33,-.62,b);
  [[-.42,-.6],[.42,-.6],[-.42,.45],[.42,.45],[-.42,.85],[.42,.85]].forEach(([x,z])=>{const w=mesh(new THREE.CylinderGeometry(.2,.2,.16,12),M(0x1E2226),x,.2,z,b);w.rotation.z=Math.PI/2;});
  box(.1,.1,.04,0xFFE08A,-.3,.7,-.94,b);box(.1,.1,.04,0xFFE08A,.3,.7,-.94,b);
  const arrow=mesh(new THREE.ConeGeometry(.22,.5,4),new THREE.MeshBasicMaterial({color:0xF2C81A}),0,2.3,-.4,g);arrow.rotation.x=-Math.PI/2;g.userData.arrow=arrow;
  return g;}

/* a rail-mounted crane rig: one axis moves the whole crane, the other moves the trolley */
function rig(o){const R={g:new THREE.Group(),trolley:new THREE.Group(),spreader:new THREE.Group(),y:o.top-2,x:0,z:0};o.parent.add(R.g);R.g.add(R.trolley);
  box(1.2,.35,1.0,0x2E3238,0,0,0,R.trolley);
  R.cables=[-.5,.5].map(dx=>mesh(new THREE.CylinderGeometry(.025,.025,1,5),M(0x1E2226),dx,0,0,R.trolley));
  R.trolley.add(R.spreader);box(CW+.1,.16,CD-.2,0xF2C81A,0,0,0,R.spreader);box(.5,.22,.4,0x2E3238,0,.17,0,R.spreader);
  R.load=null;
  R.set=function(x,z,y){R.x=x;R.z=z;R.y=y;o.place(R,x,z);const L=Math.max(.2,o.top-.2-y);R.spreader.position.y=-L-.2+.0;R.cables.forEach(c=>{c.scale.y=L;c.position.y=-L/2-.1;});};
  return R;}

E.kits.container_port={CELL,CW,CD,CH,LAYER,container,truck,build(W){
  const S={CELL,LAYER,container,truck};const r=E.rng(11);const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=70;E.scene.fog.far=300;
  const COLS=W.grid.cols,ROWS=W.grid.rows;S.COLS=COLS;S.ROWS=ROWS;
  const gx=c=>(c-(COLS-1)/2)*CELL,gz=rw=>((ROWS-1)/2-rw)*CELL;S.gx=gx;S.gz=gz;
  S.cellPos=(c,rw,layer)=>V(gx(c),.06+CH/2+(layer||0)*LAYER,gz(rw));
  // ground and sea
  const asph=tex(256,256,(x,w,h)=>{x.fillStyle='#6A6E72';x.fillRect(0,0,w,h);for(let i=0;i<2400;i++){x.fillStyle=['#62666A','#72767A','#5C6064'][i%3];x.fillRect(r()*w,r()*h,2,2);}});asph.wrapS=asph.wrapT=THREE.RepeatWrapping;asph.repeat.set(14,14);
  const quayZ=W.quay_z;S.quayZ=quayZ;
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(120,60),new THREE.MeshLambertMaterial({map:asph}));gr.rotation.x=-Math.PI/2;gr.position.z=quayZ+6+30;g.add(gr);
  box(120,1.2,6,0xB8B4AA,0,-.59,quayZ+3,g);
  const qe=box(120,.12,.4,0xF2C81A,0,.07,quayZ+.2,g);
  for(let x=-50;x<=50;x+=6){mesh(new THREE.CylinderGeometry(.18,.22,.4,8),M(0x2E3238),x,.2,quayZ+.6,g);}
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(400,200),new THREE.MeshLambertMaterial({color:0x2F6E95}));sea.rotation.x=-Math.PI/2;sea.position.set(0,-1.1,quayZ-100);g.add(sea);S.sea=sea;
  // hills and skyline across the harbour
  for(let i=0;i<14;i++){const h=8+r()*14;const m=mesh(new THREE.ConeGeometry(10+r()*12,h,6),M(r()<.5?0x5E8A5C:0x6E9868,{flatShading:true}),-90+i*14+r()*6,h/2-1,quayZ-120-r()*20,g);}
  for(let i=0;i<26;i++){const h=6+r()*20;box(3+r()*3,h,3+r()*3,[0xE8E4DA,0xC8D0D8,0xB8C4CE,0xF0E8D8][i%4],-70+i*5.6,h/2-1,quayZ-92-r()*8,g);}
  // yard surface with painted grid
  const MARG=1.6,YW=COLS*CELL+MARG*2,YD=ROWS*CELL+MARG*2,ppu=48;
  const yt=tex(Math.round(YW*ppu),Math.round(YD*ppu),(x,w,h)=>{x.fillStyle='#4C5056';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){x.fillStyle=r()<.5?'#464A50':'#52565C';x.fillRect(r()*w,r()*h,3,3);}
    const o=MARG*ppu,s=CELL*ppu;x.strokeStyle='#F4F1E8';x.lineWidth=4;
    for(let i=0;i<=COLS;i++){x.beginPath();x.moveTo(o+i*s,o);x.lineTo(o+i*s,o+ROWS*s);x.stroke();}
    for(let j=0;j<=ROWS;j++){x.beginPath();x.moveTo(o,o+j*s);x.lineTo(o+COLS*s,o+j*s);x.stroke();}
    x.fillStyle='#F2C81A';x.font='bold '+Math.round(ppu*.95)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';
    for(let i=0;i<COLS;i++){x.fillText(String.fromCharCode(65+i),o+(i+.5)*s,o+ROWS*s+o*.5);x.fillText(String.fromCharCode(65+i),o+(i+.5)*s,o*.5);}
    for(let j=0;j<ROWS;j++){const n=String(ROWS-j);x.fillText(n,o*.5,o+(j+.5)*s);x.fillText(n,w-o*.5,o+(j+.5)*s);}});
  const yard=new THREE.Mesh(new THREE.PlaneGeometry(YW,YD),new THREE.MeshLambertMaterial({map:yt}));yard.rotation.x=-Math.PI/2;yard.position.y=.03;g.add(yard);S.yard=yard;
  // compass rose on the ground (south-west of the yard)
  const ct=tex(256,256,(x,w,h)=>{x.translate(w/2,h/2);x.fillStyle='rgba(244,241,232,.9)';x.beginPath();x.arc(0,0,92,0,Math.PI*2);x.lineWidth=6;x.strokeStyle='#F4F1E8';x.stroke();
    [[0,'#D2553F'],[Math.PI/2,'#F4F1E8'],[Math.PI,'#F4F1E8'],[-Math.PI/2,'#F4F1E8']].forEach(([a,c])=>{x.save();x.rotate(a);x.fillStyle=c;x.beginPath();x.moveTo(0,-88);x.lineTo(16,0);x.lineTo(-16,0);x.closePath();x.fill();x.restore();});
    x.fillStyle='#F4F1E8';x.font='bold 40px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('N',0,-112+14);});
  const cr=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),new THREE.MeshBasicMaterial({map:ct,transparent:true,depthWrite:false}));cr.rotation.x=-Math.PI/2;cr.position.set(-YW/2-2.2,.05,YD/2-1.2);g.add(cr);
  const nPole=new THREE.Group();nPole.position.set(-YW/2-2.2,0,YD/2-1.2);g.add(nPole);mesh(new THREE.CylinderGeometry(.05,.05,2.4,6),M(0xE8ECEE),0,1.2,0,nPole);
  const nt=tex(128,128,(x,w,h)=>{x.fillStyle='#D2553F';x.beginPath();x.arc(64,64,60,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.font='bold 72px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('N',64,68);});
  const ns=new THREE.Sprite(new THREE.SpriteMaterial({map:nt}));ns.scale.set(.9,.9,1);ns.position.set(0,2.7,0);nPole.add(ns);
  const nArrow=mesh(new THREE.ConeGeometry(.22,.6,8),M(0xD2553F),0,2.1,-.35,nPole);nArrow.rotation.x=-Math.PI/2;
  // yard gantry crane (moves north-south on rails, trolley moves east-west)
  const RX=YW/2+.3,TOP=W.gantry_top;
  [-RX,RX].forEach(x=>box(.35,.12,YD+8,0x8A8E92,x,.06,0,g));
  const gan=new THREE.Group();g.add(gan);S.ganG=gan;
  [-RX,RX].forEach(x=>{[-1.3,1.3].forEach(z=>{box(.45,TOP,.45,0x2C6DB5,x,TOP/2,z,gan);box(.7,.5,.7,0x2E3238,x,.25,z,gan);});box(.5,.6,3.2,0x2C6DB5,x,TOP-.3,0,gan);box(.4,.4,3,0x2C6DB5,x,1.4,0,gan);});
  [-1.3,1.3].forEach(z=>box(RX*2+.6,.55,.28,0x2C6DB5,0,TOP,z,gan));
  box(1.3,1.2,1.1,0xF4F1E8,RX-1.2,TOP-1.1,1.7,gan);box(1.1,.5,.04,0x7AA8C8,RX-1.2,TOP-1,2.26,gan);
  S.gantry=rig({parent:gan,top:TOP,place:(R,x,z)=>{gan.position.z=z;R.trolley.position.set(x,TOP+.05,0);}});
  // quay crane (moves east-west along the quay, trolley moves north-south along the boom)
  const QT=W.quay_crane_top,qc=new THREE.Group();g.add(qc);S.qcG=qc;const L1=quayZ+4,L2=quayZ+.8;
  [-3,3].forEach(x=>{[L1,L2].forEach(z=>{box(.6,QT,.6,0xC8452F,x,QT/2,z,qc);box(1,.6,1,0x2E3238,x,.3,z,qc);});rod(qc,V(x,2,L1),V(x,QT-1,L2),.12,0xC8452F);box(.6,.6,L1-L2+.6,0xC8452F,x,QT*.45,(L1+L2)/2,qc);});
  [L1,L2].forEach(z=>box(6.6,.7,.7,0xC8452F,0,QT,z,qc));
  [-1.2,1.2].forEach(x=>truss(qc,V(x,QT+.4,L1+4),V(x,QT+.4,quayZ-W.boom_reach),.3,0xC8452F,14));
  box(3.2,.3,W.boom_reach+L1-quayZ+4,0xC8452F,0,QT+.15,(L1+4+quayZ-W.boom_reach)/2,qc);
  box(1.8,1.4,1.6,0xF4F1E8,1.6,QT-1,L2-.4,qc);box(4,1.6,3,0x8A8E92,0,QT+1,L1+3,qc);
  [-1.5,1.5].forEach(x=>{rod(qc,V(x,QT+6,L1),V(x,QT+.4,quayZ-W.boom_reach*.8),.06,0x2E3238);rod(qc,V(x,QT+6,L1),V(x,QT+.4,L1+4),.06,0x2E3238);box(.5,6,.5,0xC8452F,x,QT+3,L1,qc);});
  S.quayCrane=rig({parent:qc,top:QT,place:(R,x,z)=>{qc.position.x=x;R.trolley.position.set(0,QT+.05,z);}});
  // static extra quay cranes and background stacks for atmosphere
  [-22,24].forEach((x,k)=>{const c=new THREE.Group();c.position.x=x;g.add(c);[-3,3].forEach(px=>[L1,L2].forEach(z=>box(.6,QT,.6,k?0x2C6DB5:0xC8452F,px,QT/2,z,c)));[L1,L2].forEach(z=>box(6.6,.7,.7,k?0x2C6DB5:0xC8452F,0,QT,z,c));box(2.6,.6,W.boom_reach+10,k?0x2C6DB5:0xC8452F,0,QT+.4,quayZ-W.boom_reach/2+3,c);});
  const PAL=[0xC8452F,0x2C6DB5,0x2E8A5A,0xE0A21A,0x8A8E92,0x7A3A8A,0xD2702A];
  [[-1,1],[1,1]].forEach(([s])=>{for(let i=0;i<5;i++)for(let j=0;j<6;j++){const h=1+Math.floor(r()*3);for(let k=0;k<h;k++){const c=container(PAL[Math.floor(r()*PAL.length)]);c.position.set(s*(YW/2+5+i*CELL),.06+CH/2+k*LAYER,gz(j));g.add(c);}}});
  for(let i=0;i<4;i++){const p=new THREE.Group();p.position.set(i%2?YW/2+2:-YW/2-2,0,i<2?-YD/2:YD/2);g.add(p);mesh(new THREE.CylinderGeometry(.12,.16,14,8),M(0xB8BCC0),0,7,0,p);box(1.4,.3,.6,0xE8ECEE,0,14,0,p);}
  // ship with a resizable hold
  S.ship=null;
  S.makeShip=function(L,Wd,H){if(S.ship)g.remove(S.ship.g);const sg=new THREE.Group();g.add(sg);
    const hz=quayZ-1.6-(Wd*CELL)/2-1.4,floorY=-.9,deckY=floorY+H*LAYER+.25,iw=L*CELL,id=Wd*CELL,wall=1.4,len=iw+14,beam=id+wall*2;
    const hullMat=M(0x22303E),red=M(0xA83A2E);
    const side=(w,d,x,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,deckY+2.5,d),hullMat);m.position.set(x,(deckY-2.5)/2,z);sg.add(m);const s=new THREE.Mesh(new THREE.BoxGeometry(w+.02,1.2,d+.02),red);s.position.set(x,-1.4,z);sg.add(s);};
    side(len,wall,0,hz+id/2+wall/2);side(len,wall,0,hz-id/2-wall/2);side((len-iw)/2,id,-(iw/2+(len-iw)/4),hz);side((len-iw)/2,id,iw/2+(len-iw)/4,hz);
    const bow=mesh(new THREE.CylinderGeometry(beam/2,beam/2,deckY+2.5,3,1),hullMat,-len/2-.6,(deckY-2.5)/2,hz,sg);bow.rotation.y=Math.PI;bow.scale.set(.5,1,1);
    const ft=tex(256,256,(x,w,h)=>{x.fillStyle='#3A2E28';x.fillRect(0,0,w,h);x.strokeStyle='#F2C81A';x.lineWidth=3;const sw=w/L,sh=h/Wd;for(let i=0;i<=L;i++){x.beginPath();x.moveTo(i*sw,0);x.lineTo(i*sw,h);x.stroke();}for(let j=0;j<=Wd;j++){x.beginPath();x.moveTo(0,j*sh);x.lineTo(w,j*sh);x.stroke();}});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(iw,id),new THREE.MeshLambertMaterial({map:ft}));fl.rotation.x=-Math.PI/2;fl.position.set(0,floorY,hz);sg.add(fl);
    const lt=tex(64,256,(x,w,h)=>{x.fillStyle='#4E3A30';x.fillRect(0,0,w,h);x.fillStyle='#F2C81A';for(let k=1;k<H;k++)x.fillRect(0,h-k*h/H-2,w,4);});
    const inner=new THREE.MeshLambertMaterial({map:lt,side:THREE.BackSide});const cav=new THREE.Mesh(new THREE.BoxGeometry(iw-.06,deckY-floorY,id-.06),[inner,inner,new THREE.MeshBasicMaterial({visible:false}),new THREE.MeshBasicMaterial({visible:false}),inner,inner]);cav.position.set(0,(deckY+floorY)/2,hz);sg.add(cav);
    const bridge=new THREE.Group();bridge.position.set(iw/2+4.2,deckY,hz);sg.add(bridge);box(3.6,3.2,beam-1,0xF4F1E8,0,1.6,0,bridge);for(let k=0;k<2;k++)box(3.7,.3,beam-.9,0x2E4A66,0,1.1+k*1.1,0,bridge);box(.9,1.6,.9,0x2E3238,.9,4,0,bridge);
    const sh={g:sg,L,W:Wd,H,hz,floorY,deckY,cellPos:(c,rw,layer)=>V((c-(L-1)/2)*CELL,floorY+CH/2+.02+layer*LAYER,hz+((Wd-1)/2-rw)*CELL)};S.ship=sh;return sh;};
  // ground markers
  const mk=new THREE.MeshBasicMaterial({color:0xF2C81A,transparent:true,opacity:.55,depthWrite:false});
  S.marker=function(col,label){const m=new THREE.Group();const p=new THREE.Mesh(new THREE.PlaneGeometry(CELL*.92,CELL*.92),mk.clone());p.material.color.setHex(col||0xF2C81A);p.rotation.x=-Math.PI/2;p.position.y=.07;m.add(p);
    if(label){const t=tex(128,128,(x,w,h)=>{x.fillStyle='#16202A';x.font='bold 54px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(label,64,68);});const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.1,1.1,1);s.position.y=1.2;m.add(s);}
    g.add(m);return m;};
  return S;}};
})();
