/* Scene kit: hk_city — cha chaan teng, MTR platform with PSDs, Star Ferry deck, wet market */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
E.ENV.ferry_day={sky:0x9CCCF0,hs:0xF4F6F8,hg:0x4A6A80,hi:.75,sc:0xFFF4E0,si:.8,sp:[14,22,12]};
E.ENV.indoor_warm={sky:0xC8D4D8,hs:0xFFF4E2,hg:0x6A6058,hi:.85,sc:0xFFF0D8,si:.55,sp:[4,20,10]};
E.ENV.indoor_cool={sky:0xB8C4CC,hs:0xF2F6FA,hg:0x5A6068,hi:.9,sc:0xF4F8FF,si:.5,sp:[4,22,12]};
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",sans-serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function panel(g,w,h,t,x,y,z,ry,emis){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),emis?new THREE.MeshBasicMaterial({map:t}):new THREE.MeshLambertMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}
function floorTex(c1,c2,n,grout){return tex(256,256,(x,w,h)=>{const s=w/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=(i+j)%2?c1:c2;x.fillRect(i*s,j*s,s,s);}if(grout){x.strokeStyle=grout;x.lineWidth=2;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,h);x.stroke();x.beginPath();x.moveTo(0,i*s);x.lineTo(w,i*s);x.stroke();}}});}
function floor(g,w,d,t,rep,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=y||.02;g.add(m);return m;}
const glassM=()=>new THREE.MeshPhongMaterial({color:0xCFEFF8,transparent:true,opacity:.22,depthWrite:false,shininess:100});

/* people */
const SKIN=[0xF2D2B0,0xE0B890,0xC89870],SHIRT=[0x3A6FB0,0xE0574A,0x2E9B5E,0xF2C14E,0x8A5AC8,0xF4F4EF,0x2A2D30,0x9AA4AE,0xD88AA0];
function person(o){o=o||{};const r=o.r||Math.random;const g=new THREE.Group();
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.11,.62,0);g.add(p);box(.13,.6,.14,o.pants||0x2A3A5A,0,-.3,0,p);box(.14,.07,.2,0x1A1A1A,0,-.6,.03,p);return p;});
  const body=mesh(new THREE.CylinderGeometry(.21,.24,.7,10),M(o.shirt||SHIRT[Math.floor(r()*SHIRT.length)]),0,.98,0,g);
  const arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.27,1.28,0);g.add(a);box(.1,.55,.1,o.shirt||body.material.color.getHex(),0,-.26,0,a);return a;});
  mesh(new THREE.SphereGeometry(.18,12,10),M(SKIN[o.skin!=null?o.skin:Math.floor(r()*3)]),0,1.5,0,g);
  mesh(new THREE.SphereGeometry(.19,12,8,0,Math.PI*2,0,Math.PI/2),M(o.hair||[0x1A1612,0x2A2420,0x5A4030,0x9A9A9A][Math.floor(r()*4)]),0,1.54,0,g);
  if(o.apron)box(.36,.52,.04,o.apron,0,.88,.22,g);
  if(o.bag)box(.3,.4,.18,o.bag,0,1.05,-.25,g);
  if(o.hat){mesh(new THREE.CylinderGeometry(.27,.27,.03,16),M(o.hat),0,1.68,0,g);mesh(new THREE.CylinderGeometry(.15,.17,.14,14),M(o.hat),0,1.75,0,g);}
  if(o.tray){const t=new THREE.Group();t.position.set(.32,1.12,.18);g.add(t);box(.42,.03,.3,0x8A8E92,0,0,0,t);[[-.1,0],[.1,.05]].forEach(([x,z])=>mesh(new THREE.CylinderGeometry(.055,.045,.13,10),M(0xF2C850),x,.08,z,t));arms[1].rotation.x=-1.1;}
  if(o.carry){const b=new THREE.Group();b.position.set(-.3,.72,.05);g.add(b);box(.2,.28,.12,o.carry,0,0,0,b);}
  if(o.paper){box(.5,.36,.02,0xEDEAE0,0,1.18,.32,g);arms.forEach(a=>a.rotation.x=-1.2);}
  if(o.sit){legs.forEach(l=>l.rotation.x=-1.45);g.userData.sit=true;}
  g.scale.setScalar(o.scale||1.12);g.userData.legs=legs;g.userData.arms=arms;return g;}
E.hkPerson=person;
const walkers=[];
function walker(parent,o,path,speed){const g=person(o);parent.add(g);g.position.copy(path[0]);walkers.push({g,path,i:1,speed:speed||1.2,ph:Math.random()*6,pause:0,pauseAt:o.pauseAt||null});return g;}

E.kits.hk_city={build(LP){
  const S={};const r=E.rng(31);E.scene.fog.near=90;E.scene.fog.far=460;
  mesh(new THREE.PlaneGeometry(420,140),M(0x7E8A80),75,-3,0,E.scene).rotation.x=-Math.PI/2;

  /* ================= cha chaan teng ================= */
  {const g=new THREE.Group();g.position.copy(LP.cafe);E.scene.add(g);
    floor(g,13,10,floorTex('#E9E4D6','#2F7D62',8,'#CFC8B4'),[3,2.4]);
    const tile=tex(128,128,(x,w,h)=>{x.fillStyle='#F4F2EC';x.fillRect(0,0,w,h);x.strokeStyle='#D8D4CA';x.lineWidth=3;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,h);x.stroke();x.beginPath();x.moveTo(0,i*32);x.lineTo(w,i*32);x.stroke();}});tile.wrapS=tile.wrapT=THREE.RepeatWrapping;tile.repeat.set(10,1.4);
    panel(g,13,1.5,tile,0,.75,-5,0);box(13,5.2,.2,0xEFE6CF,0,4.1,-5.1,g);box(13,.12,.12,0x6A3A22,0,1.52,-4.98,g);
    [-6.5,6.5].forEach(x=>{box(.2,6.6,10,0xEFE6CF,x,3.3,-.5,g);const mr=box(.04,1.2,6,0xBFD8E0,x+(x<0?.12:-.12),2.1,-1,g);mr.material=new THREE.MeshPhongMaterial({color:0xBFD8E0,shininess:120,specular:0xFFFFFF});});
    const menuItems=[['奶茶','$18'],['凍檸茶','$20'],['菠蘿油','$14'],['西多士','$26'],['餐蛋麵','$38'],['火腿通粉','$36'],['鴛鴦','$19'],['咖喱牛腩飯','$58']];
    menuItems.forEach((m,i)=>{const t=tex(96,256,(x,w,h)=>{x.fillStyle='#F7D63A';x.fillRect(0,0,w,h);x.fillStyle='#C8221A';x.font='bold 40px '+FONT;x.textAlign='center';[...m[0]].forEach((ch,k)=>x.fillText(ch,w/2,52+k*44));x.font='bold 30px '+FONT;x.fillText(m[1],w/2,h-18);});
      panel(g,.42,1.12,t,-5.2+i*.62,2.75,-4.99,0);});
    const sign=tex(512,128,(x,w,h)=>{x.fillStyle='#B8221A';x.fillRect(0,0,w,h);x.fillStyle='#FCE6A0';x.font='bold 84px '+FONT;x.textAlign='center';x.fillText('金華冰室',w/2,96);});
    panel(g,3.2,.8,sign,2.6,3.15,-4.99,0);
    for(let i=0;i<3;i++)box(1.2,.05,.08,0xFFFFFF,-4+i*4,3.55,-4.95,g).material=M(0xFFFFFF,{emissive:0xEEEEEE});
    const clk=new THREE.Group();clk.position.set(5.2,2.8,-4.98);g.add(clk);mesh(new THREE.CylinderGeometry(.28,.28,.05,24),M(0xF4F4EF),0,0,0,clk).rotation.x=Math.PI/2;box(.02,.18,.02,0x1A1A1A,0,.07,.04,clk);box(.13,.02,.02,0x1A1A1A,.05,0,.04,clk);
    S.fans=[];[[-3,-1.5],[3,-1.5],[0,1.5]].forEach(([x,z])=>{const f=new THREE.Group();f.position.set(x,3.25,z);g.add(f);box(.04,.5,.04,0x8A8E92,0,.25,0,f);mesh(new THREE.CylinderGeometry(.12,.12,.12,12),M(0xF4F4EF),0,0,0,f);
      const bl=new THREE.Group();f.add(bl);for(let k=0;k<3;k++){const b=box(.8,.02,.16,0xE8E4DC,.45,-.02,0,bl);b.position.set(Math.cos(k*2.094)*.45,-.02,Math.sin(k*2.094)*.45);b.rotation.y=-k*2.094;}S.fans.push(bl);});
    const marble=tex(128,128,(x,w,h)=>{x.fillStyle='#F2F0EA';x.fillRect(0,0,w,h);x.strokeStyle='rgba(150,150,150,.35)';for(let i=0;i<9;i++){x.beginPath();x.moveTo(r()*w,0);x.bezierCurveTo(r()*w,h*.3,r()*w,h*.7,r()*w,h);x.stroke();}});
    const booth=(x,z)=>{const b=new THREE.Group();b.position.set(x,0,z);g.add(b);const top=new THREE.Mesh(new THREE.BoxGeometry(1.5,.06,.8),new THREE.MeshLambertMaterial({map:marble}));top.position.y=.76;b.add(top);box(.12,.73,.12,0x5A5F66,0,.37,0,b);
      [-1,1].forEach(s=>{box(1.6,.42,.5,0x2F6B4A,0,.24,s*.72,b);box(1.6,.95,.14,0x2F6B4A,0,.75,s*1.0,b);box(1.62,.05,.16,0x6A3A22,0,1.24,s*1.0,b);});
      [[-.35,.1],[.3,-.12]].forEach(([cx,cz])=>{mesh(new THREE.CylinderGeometry(.11,.11,.015,16),M(0xF4F4EF),cx,.8,cz,b);mesh(new THREE.CylinderGeometry(.06,.05,.1,12),M(0xFFFFFF),cx,.86,cz,b);});
      const bun=mesh(new THREE.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI/2),M(0xE0A83A),.05,.8,.18,b);bun.scale.y=.6;return b;};
    const b1=booth(-4.6,-2.6),b2=booth(4.6,-2.6),b3=booth(-4.8,1.2),b4=booth(4.8,1.4);
    const sit=(b,side,o)=>{const p=person(Object.assign({sit:true,r},o));p.position.set(b.position.x+(o.dx||0),.22,b.position.z+side*.62);p.rotation.y=side>0?Math.PI:0;g.add(p);return p;};
    sit(b1,-1,{paper:true,dx:-.3});sit(b2,1,{dx:.2});sit(b2,-1,{dx:-.3});sit(b4,1,{dx:.3});
    const ctr=new THREE.Group();ctr.position.set(1.6,0,-4.2);g.add(ctr);box(3.6,1,.7,0x6A3A22,0,.5,0,ctr);box(3.6,.06,.74,0xE8E4DC,0,1.02,0,ctr);
    const disp=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,.6),glassM());disp.position.set(-.9,1.35,0);ctr.add(disp);box(1.38,.04,.58,0xD8D2C6,-.9,1.1,0,ctr);
    for(let i=0;i<8;i++){const bn=mesh(new THREE.SphereGeometry(.09,10,6,0,Math.PI*2,0,Math.PI/2),M(0xE0A83A),-1.45+(i%4)*.3,1.13,-.12+Math.floor(i/4)*.24,ctr);bn.scale.y=.6;}
    [.5,.95,1.4].forEach(x=>{mesh(new THREE.CylinderGeometry(.16,.18,.42,16),new THREE.MeshPhongMaterial({color:0xC8CCD0,shininess:90}),x,1.25,-.05,ctr);box(.06,.12,.04,0x2A2A2A,x+.17,1.3,-.05,ctr);});
    box(.5,.35,.4,0x2A2D30,-.1,1.22,.1,ctr);
    S.cafeWaiter=walker(g,{shirt:0xF4F4EF,apron:0x2A2D30,tray:true,pants:0x1A1A1A,r},[V(-2.6,0,-3.4),V(-2.8,0,-.6),V(-2.6,0,2.4),V(2.6,0,2.6),V(2.8,0,-.4),V(2.6,0,-3.4)],1.05);
    S.cafe={g,label:[]};}

  /* ================= MTR platform with PSDs ================= */
  {const g=new THREE.Group();g.position.copy(LP.mtr);E.scene.add(g);
    floor(g,20,7,tex(256,256,(x,w,h)=>{x.fillStyle='#B4B6B2';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){x.fillStyle=['#9EA09C','#C8CAC4','#8A8C88'][i%3];x.fillRect(r()*w,r()*h,2,2);}x.strokeStyle='#8E908C';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke();}}),[8,3],.02).position.z=-.2;
    const tact=tex(64,64,(x,w,h)=>{x.fillStyle='#F2C81A';x.fillRect(0,0,w,h);x.fillStyle='#D8B000';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(8+i*16,8+j*16,4,0,7);x.fill();}});const tf=floor(g,20,.5,tact,[40,1],.03);tf.position.z=-3.05;
    const PZ=-3.5;S.psd=[];
    for(let k=0;k<5;k++){const x0=-8+k*4;
      box(.12,2.3,.14,0x3A3E44,x0-1.9,1.15,PZ,g);box(.12,2.3,.14,0x3A3E44,x0+1.9,1.15,PZ,g);
      [-1.35,1.35].forEach(dx=>{const p=new THREE.Mesh(new THREE.BoxGeometry(1,2.05,.04),glassM());p.position.set(x0+dx,1.05,PZ);g.add(p);});
      const doors=[-1,1].map(s=>{const d=new THREE.Group();d.position.set(x0+s*.425,0,PZ+.02);g.add(d);const p=new THREE.Mesh(new THREE.BoxGeometry(.85,2.05,.04),glassM());p.position.y=1.05;d.add(p);box(.06,2.05,.06,0x5A5E64,s*.42,1.05,0,d);box(.85,.06,.06,0x5A5E64,0,.04,0,d);return d;});
      S.psd.push({doors,x0});
      const hdr=tex(512,64,(x,w,h)=>{x.fillStyle='#202428';x.fillRect(0,0,w,h);x.fillStyle='#FF9A2A';x.font='bold 30px '+FONT;x.fillText('往荃灣  To Tsuen Wan',16,42);x.textAlign='right';x.fillText('1 分鐘',w-16,42);});
      box(4,.5,.22,0x2A2D30,x0,2.35,PZ,g);panel(g,1.9,.24,hdr,x0,2.34,PZ+.12,0,true);
      box(.12,.04,.01,0xF2C81A,x0,.02,PZ+.6,g);}
    box(20,.6,.24,0x2A2D30,0,2.9,PZ,g);
    const trough=box(20,.1,3.6,0x2A2826,0,-.75,-5.6,g);[-.72,.72].forEach(z=>box(20,.12,.08,0x8A8E92,0,-.62,-5.6+z,g));
    const wallT=tex(256,128,(x,w,h)=>{x.fillStyle='#B5232A';x.fillRect(0,0,w,h);x.strokeStyle='#8E1A20';x.lineWidth=2;for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,h);x.stroke();}for(let j=0;j<=4;j++){x.beginPath();x.moveTo(0,j*32);x.lineTo(w,j*32);x.stroke();}});wallT.wrapS=THREE.RepeatWrapping;wallT.repeat.set(6,1);
    panel(g,22,4.6,wallT,0,1.6,-7.5,0);box(22,5,.2,0x3A3E44,0,6.4,-7.6,g);[-10.5,10.5].forEach(x=>box(.3,9,12,0x3A3E44,x,4,-2,g));
    const nameT=tex(512,160,(x,w,h)=>{x.fillStyle='#FFFFFF';x.fillRect(0,0,w,h);x.fillStyle='#1C1C1C';x.font='bold 86px '+FONT;x.textAlign='center';x.fillText('中環',w/2,90);x.font='bold 40px Helvetica,Arial,sans-serif';x.fillText('Central',w/2,142);});
    [-5,5].forEach(x=>panel(g,2.8,.88,nameT,x,2.3,-7.48,0));
    const adT=(c1,c2,txt)=>tex(256,384,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 46px '+FONT;x.textAlign='center';txt.forEach((t,i)=>x.fillText(t,w/2,150+i*60));});
    panel(g,1.3,1.9,adT('#2A7FC8','#0A3A70',['暑期','優惠']),-.2,1.6,-7.47,0,true);panel(g,1.3,1.9,adT('#F2A23A','#C8452A',['新鮮','果汁']),1.6,1.6,-7.47,0,true);
    [[-6.6,-.6],[6.6,-.6]].forEach(([x,z])=>{box(.7,3.6,.7,0xE8E2D4,x,1.8,z,g);});
    const mapT=tex(256,180,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.lineWidth=10;x.lineCap='round';x.strokeStyle='#1A5FB4';x.beginPath();x.moveTo(20,140);x.lineTo(236,140);x.stroke();x.strokeStyle='#C8352A';x.beginPath();x.moveTo(80,140);x.lineTo(80,50);x.lineTo(236,50);x.stroke();x.fillStyle='#1C1C1C';x.font='bold 18px '+FONT;x.fillText('路線圖',10,24);});
    panel(g,.68,.48,mapT,6.6,1.7,-.24,0);
    const hang=(x,txt,col)=>{box(.04,.5,.04,0x5A5E64,x-.6,3.4,0,g);box(.04,.5,.04,0x5A5E64,x+.6,3.4,0,g);const t=tex(384,64,(c,w,h)=>{c.fillStyle='#1C1E22';c.fillRect(0,0,w,h);c.fillStyle=col;c.fillRect(0,0,14,h);c.fillStyle='#fff';c.font='bold 30px '+FONT;c.fillText(txt,28,42);});box(1.8,.32,.08,0x1C1E22,x,3.06,0,g);panel(g,1.78,.3,t,x,3.06,.045,0,true);};
    hang(-3,'荃灣綫 往荃灣 →','#C8352A');hang(3,'出口 Exit A  ↗','#F2C81A');
    [[-4.6,.9],[4.4,1]].forEach(([x,z])=>{const b=new THREE.Group();b.position.set(x,0,z);g.add(b);for(let k=0;k<3;k++){box(.5,.04,.45,0xA8AEB4,-.55+k*.55,.46,0,b);box(.5,.4,.04,0xA8AEB4,-.55+k*.55,.66,-.22,b);}box(1.7,.44,.06,0x5A5E64,0,.22,0,b);});
    [[-8,-2.5],[-7.4,-2.5],[-4.2,-2.6],[4.3,-2.5],[8.2,-2.5],[7.6,-2.4]].forEach(([x,z],i)=>{const p=person({r,bag:i%2?0x3A3A3A:null});p.position.set(x,0,z);p.rotation.y=Math.PI;g.add(p);});
    walker(g,{r,bag:0xC8452F},[V(-9,0,1.8),V(9,0,1.8)],1.3);walker(g,{r},[V(9,0,2.6),V(-9,0,2.6)],1.1);
    const train=new THREE.Group();train.position.set(-34,0,-5.6);g.add(train);S.train=train;S.trainDoors=[];
    for(let c=0;c<4;c++){const car=new THREE.Group();car.position.x=c*8.2;train.add(car);
      box(8,2.5,2.7,0xD8DCE0,0,1.15,0,car);const roof=mesh(new THREE.CylinderGeometry(1.35,1.35,8,16,1,false,0,Math.PI),M(0xC8CCD0),0,2.4,0,car);roof.rotation.z=Math.PI/2;roof.scale.set(1,1,.35);
      box(8.02,.18,2.72,0xC8352A,0,.55,0,car);box(8.02,.08,2.72,0x1A5FB4,0,.42,0,car);box(8,.55,2.72,0x1C2430,0,1.75,0,car);
      [-3,-1,1,3].forEach(dx=>{const dg=new THREE.Group();dg.position.set(dx,0,1.36);car.add(dg);const L=box(.5,1.9,.04,0xB8BCC0,-.25,1.05,0,dg),R=box(.5,1.9,.04,0xB8BCC0,.25,1.05,0,dg);box(.3,.6,.05,0x1C2430,-.25,1.45,0,dg);box(.3,.6,.05,0x1C2430,.25,1.45,0,dg);S.trainDoors.push({L,R});});
      [-3.4,3.4].forEach(dx=>box(1.6,.6,.3,0x2A2A2A,dx,-.15,0,car));
      if(c===3){const n=new THREE.Group();n.position.x=4.4;car.add(n);box(.9,2.2,2.6,0xD8DCE0,0,1.1,0,n);box(.92,.9,2.2,0x101820,.05,1.65,0,n);box(.94,.18,2.62,0xC8352A,0,.55,0,n);[-.8,.8].forEach(z=>mesh(new THREE.SphereGeometry(.09,8,6),M(0xFFFFFF,{emissive:0xFFFFAA}),.47,.8,z,n));}}
    S.mtr={g,label:[],map:V(6.6,2.15,-.2)};}

  /* ================= Star Ferry ================= */
  {const g=new THREE.Group();g.position.copy(LP.ferry);E.scene.add(g);
    const w=mesh(new THREE.PlaneGeometry(220,140,40,24),new THREE.MeshLambertMaterial({color:0x1A64A8,emissive:0x0A3466}),0,-.35,-30,g);w.rotation.x=-Math.PI/2;w.userData.base=w.geometry.attributes.position.array.slice();S.water=w;
    const boat=new THREE.Group();g.add(boat);S.boat=boat;
    box(12,1.3,7.2,0x2E7D4A,0,-.5,-.6,boat);box(12.1,.18,7.3,0xF4F4EF,0,.18,-.6,boat);
    floor(boat,11.6,6.8,tex(256,64,(x,w,h)=>{x.fillStyle='#B8865A';x.fillRect(0,0,w,h);x.strokeStyle='#8A5E3A';x.lineWidth=2;for(let i=0;i<=8;i++){x.beginPath();x.moveTo(0,i*8);x.lineTo(w,i*8);x.stroke();}}),[3,8],.29).position.z=-.6;
    for(let x=-5.8;x<=5.8;x+=.5)box(.04,.95,.04,0xF4F4EF,x,.75,-3.95,boat);box(11.7,.08,.08,0xF4F4EF,0,1.2,-3.95,boat);box(11.7,.05,.05,0xF4F4EF,0,.8,-3.95,boat);
    [[-5.8,2.6],[5.8,2.6],[-5.8,-3.9],[5.8,-3.9],[0,-3.9],[0,2.6]].forEach(([x,z])=>box(.14,3.3,.14,0xF4F4EF,x,1.9,z,boat));
    box(12,.14,6.9,0xF4F4EF,0,3.55,-.6,boat);for(let i=0;i<4;i++)mesh(new THREE.CylinderGeometry(.14,.14,.05,12),M(0xFFFFFF,{emissive:0xEEEEDD}),-4.2+i*2.8,3.47,-.6,boat);
    [[-5.8,-2],[5.8,-2]].forEach(([x,z])=>{const lb=mesh(new THREE.TorusGeometry(.3,.08,8,20),M(0xE8501A),x+(x<0?.12:-.12),1.6,z,boat);lb.rotation.y=Math.PI/2;});
    const bench=(x,z)=>{const b=new THREE.Group();b.position.set(x,.3,z);boat.add(b);
      [-1,1].forEach(s=>{box(.06,.45,.06,0x2E5A3A,s*.85,.22,-.18,b);box(.06,.45,.06,0x2E5A3A,s*.85,.22,.18,b);box(.06,.7,.06,0x2E5A3A,s*.85,.75,0,b);});
      for(let k=0;k<4;k++)box(1.8,.04,.09,0x9A6A3A,0,.46,-.16+k*.11,b);
      const back=new THREE.Group();back.position.set(0,.85,0);b.add(back);back.rotation.x=.18;for(let k=0;k<3;k++)box(1.8,.09,.035,0x9A6A3A,0,-.15+k*.14,0,back);box(.04,.5,.04,0x2E5A3A,-.86,0,0,back);box(.04,.5,.04,0x2E5A3A,.86,0,0,back);return b;};
    [-4.5,-2.4,2.4,4.5].forEach(x=>[-2.9,-1.7].forEach(z=>bench(x,z)));
    const nb=tex(512,96,(x,w,h)=>{x.fillStyle='#1E5A3A';x.fillRect(0,0,w,h);x.fillStyle='#F4F4EF';x.font='bold 52px '+FONT;x.textAlign='center';x.fillText('天星小輪  STAR FERRY',w/2,66);});panel(boat,4,.75,nb,0,3.05,-3.93,0);
    const sk=new THREE.Group();sk.position.set(0,0,-60);g.add(sk);
    [[-40,26,30],[-10,34,34],[22,30,32],[50,24,28]].forEach(([x,h,rd])=>{const m=mesh(new THREE.SphereGeometry(rd,16,10,0,Math.PI*2,0,Math.PI/2),M(0x4E7A4A,{flatShading:true}),x,-2,-24,sk);m.scale.y=h/rd;});
    const win=tex(64,128,(x,w,h)=>{x.fillStyle='#7A8A9A';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<10;j++){x.fillStyle=r()<.35?'#FFE6A0':'#3A4A5A';x.fillRect(4+i*15,4+j*12,10,7);}});win.wrapS=win.wrapT=THREE.RepeatWrapping;
    for(let i=0;i<46;i++){const x=-70+i*3.1+r()*1.2,h=8+r()*20+(Math.abs(x+8)<10?10:0),wd=2.4+r()*1.4;const t=win.clone();t.needsUpdate=true;t.repeat.set(1,h/10);const b=new THREE.Mesh(new THREE.BoxGeometry(wd,h,wd),new THREE.MeshLambertMaterial({map:t,color:[0xFFFFFF,0xDDE6EE,0xEDE4D6][i%3]}));b.position.set(x,h/2-.3,-r()*10);sk.add(b);}
    const ifc=new THREE.Mesh(new THREE.BoxGeometry(5,42,5),new THREE.MeshLambertMaterial({color:0xB8C8D8}));ifc.position.set(-8,21,-2);sk.add(ifc);mesh(new THREE.ConeGeometry(3,5,4),M(0xC8D4E0),-8,44,-2,sk).rotation.y=Math.PI/4;
    const icc=new THREE.Group();icc.position.set(60,0,30);g.add(icc);const ib=new THREE.Mesh(new THREE.BoxGeometry(6,62,6),new THREE.MeshLambertMaterial({color:0x8EA8C4}));ib.position.y=31;icc.add(ib);for(let k=1;k<24;k++)box(6.06,.4,6.06,0xD8E8F8,0,k*2.6,0,icc);
    const junk=new THREE.Group();junk.position.set(-60,0,-24);g.add(junk);S.junk=junk;box(5,.8,1.4,0x5A3A22,0,.1,0,junk);[[-1,3.2],[1.2,2.6]].forEach(([x,h])=>{box(.1,h+.6,.1,0x3A2A1A,x,h/2+.4,0,junk);const sl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,h),new THREE.MeshLambertMaterial({color:0xC8302A,side:THREE.DoubleSide}));sl.position.set(x+.1,h/2+.6,0);sl.rotation.y=Math.PI/2;junk.add(sl);});
    const f2=new THREE.Group();f2.position.set(40,0,-34);g.add(f2);S.ferry2=f2;box(9,1,4.6,0x2E7D4A,0,-.1,0,f2);box(9,1.6,4.2,0xF4F4EF,0,1.2,0,f2);box(9.2,.2,4.4,0xF4F4EF,0,2.1,0,f2);
    S.ferry={g,label:[{t:'ICC 環球貿易廣場',p:V(60,66,30)}]};}

  /* ================= wet market ================= */
  {const g=new THREE.Group();g.position.copy(LP.market);E.scene.add(g);
    floor(g,18,11,tex(128,128,(x,w,h)=>{x.fillStyle='#7E8482';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){x.fillStyle=r()<.5?'#6E7472':'#8E9492';x.fillRect(r()*w,r()*h,3,3);}}),[6,4]).position.z=-1;
    for(let i=0;i<7;i++){const p=mesh(new THREE.CircleGeometry(.4+r()*.5,16),new THREE.MeshPhongMaterial({color:0x4A5458,shininess:120,specular:0xFFFFFF,transparent:true,opacity:.7}),-6+r()*12,.035,-1.5+r()*4,g);p.rotation.x=-Math.PI/2;p.scale.x=1.6;}
    box(18,7.5,.2,0xC8CCC4,0,3.75,-6.2,g);[-9,9].forEach(x=>box(.2,7.5,10,0xC8CCC4,x,3.75,-1.4,g));
    const shop=(x,name,goods,price)=>{const s=new THREE.Group();s.position.set(x,0,-4.2);g.add(s);
      [-1.6,1.6].forEach(px=>[-.9,.9].forEach(pz=>box(.08,2.9,.08,0x2E6A4A,px,1.45,pz,s)));
      const aw=box(3.6,.06,2.6,0x2E6A4A,0,2.92,.3,s);aw.rotation.x=-.12;
      const st=tex(512,112,(c,w,h)=>{c.fillStyle='#F4E8C8';c.fillRect(0,0,w,h);c.fillStyle='#B8221A';c.font='bold 72px '+FONT;c.textAlign='center';c.fillText(name,w/2,82);});box(3.2,.6,.06,0xF4E8C8,0,3.3,.95,s);panel(s,3.18,.58,st,0,3.3,.99,0);
      box(3.2,.85,1.5,0x8A9096,0,.43,.2,s);box(3.24,.05,1.54,0x5A6066,0,.87,.2,s);
      for(let k=0;k<6;k++){const bx=new THREE.Group();bx.position.set(-1.2+(k%3)*1.2,.9,-.15+Math.floor(k/3)*.65);s.add(bx);box(.95,.16,.55,[0xD8322A,0x2A6FC8][k%2],0,.08,0,bx);
        for(let q=0;q<6;q++){const f=mesh(new THREE.SphereGeometry(.11,10,8),M(goods[(k+q)%goods.length]),-.3+(q%3)*.3,.24,-.1+Math.floor(q/3)*.2,bx);if(goods[0]===0xF2A23A)f.scale.set(1,1.3,.9);}}
      const pt=tex(128,96,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='#C8221A';c.lineWidth=6;c.strokeRect(3,3,w-6,h-6);c.fillStyle='#C8221A';c.font='bold 38px '+FONT;c.textAlign='center';c.fillText(price,w/2,58);});
      const pc=new THREE.Group();pc.position.set(.6,1.1,.75);s.add(pc);box(.02,.4,.02,0x8A6A3A,0,.2,0,pc);panel(pc,.36,.27,pt,0,.48,.01,0);
      [-.8,.8].forEach(lx=>{box(.02,.9,.02,0x2A2A2A,lx,2.45,.3,s);mesh(new THREE.ConeGeometry(.36,.42,18,1,true),M(0xD8222A,{emissive:0x7A0A0A,side:THREE.DoubleSide}),lx,1.85,.3,s);mesh(new THREE.SphereGeometry(.12,10,8),M(0xFFE0A0,{emissive:0xFFA040}),lx,1.72,.3,s);});
      for(let k=0;k<3;k++)box(.6,.3,.4,0xF4F4F4,1.9,.15+k*.31,-.6,s);
      const scale=new THREE.Group();scale.position.set(-.9,.92,.75);s.add(scale);box(.3,.08,.25,0xD8322A,0,0,0,scale);mesh(new THREE.CylinderGeometry(.16,.16,.02,16),M(0xC8CCD0),0,.08,0,scale);
      for(let k=0;k<3;k++)box(.25,.32,.02,k%2?0xFFFFFF:0xD8322A,-1.5+k*.1,2.2,.92,s);return s;};
    shop(-4.4,'陳記果欄',[0x6AB84A,0xD8322A,0xF2C14E],'$10');shop(0,'鮮果之家',[0xF2A23A,0xF2C14E],'$20');shop(4.4,'豐記菜檔',[0x4E9A3A,0x8AC85A,0xE8E0C8],'$8');
    walker(g,{r,carry:0xF4F4F4},[V(-8,0,1.2),V(8,0,1.4)],1);walker(g,{r,carry:0xD8322A},[V(8,0,2.3),V(-8,0,2.2)],.9);walker(g,{r,bag:0x2A6FC8,pauseAt:1},[V(-7,0,-1.6),V(-4.4,0,-2.2),V(-7,0,-1.6)],.8);
    S.market={g,label:[]};}

  /* ---------- per-frame ---------- */
  let trainT=null,doorT=0;
  S.trainArrive=()=>{trainT=0;doorT=0;};
  S.update=(dt,t)=>{
    if(S.fans)S.fans.forEach(f=>f.rotation.y+=dt*4);
    if(S.water){const pa=S.water.geometry.attributes.position,b=S.water.userData.base;for(let i=0;i<pa.count;i++)pa.array[i*3+2]=Math.sin(b[i*3]*.18+t*1.2)*.16+Math.cos(b[i*3+1]*.22+t*.9)*.12;pa.needsUpdate=true;}
    if(S.boat){S.boat.rotation.z=Math.sin(t*.8)*.012;S.boat.rotation.x=Math.sin(t*.6)*.008;}
    if(S.junk){S.junk.position.x=-60+((t*2)%120);S.junk.position.y=Math.sin(t)*.1;}
    if(S.ferry2){S.ferry2.position.x=40-((t*1.2)%110);}
    if(trainT!=null){trainT+=dt;const k=Math.min(1,trainT/4.5);S.train.position.x=-34+(1-Math.pow(1-k,3))*29;
      if(k>=1){doorT=Math.min(1,doorT+dt*.8);S.psd.forEach(p=>{p.doors[0].position.x=p.x0-.425-doorT*.85;p.doors[1].position.x=p.x0+.425+doorT*.85;});S.trainDoors.forEach(d=>{d.L.position.x=-.25-doorT*.48;d.R.position.x=.25+doorT*.48;});}}
    walkers.forEach(w=>{if(w.pause>0){w.pause-=dt;w.g.userData.legs.forEach(l=>l.rotation.x=0);return;}const tg=w.path[w.i];const d=tg.clone().sub(w.g.position);d.y=0;const L=d.length();
      if(L<.05){if(w.pauseAt!=null&&w.i===w.pauseAt)w.pause=2.5;w.i=(w.i+1)%w.path.length;if(w.i===0&&w.path.length===2){w.g.position.copy(w.path[0]);w.i=1;}return;}
      w.g.position.addScaledVector(d.normalize(),Math.min(L,w.speed*dt));w.g.rotation.y=Math.atan2(d.x,d.z);w.ph+=dt*7;const s=Math.sin(w.ph)*.5;w.g.userData.legs[0].rotation.x=s;w.g.userData.legs[1].rotation.x=-s;
      if(!w.g.userData.arms[1].rotation.x)w.g.userData.arms[0].rotation.x=-s*.6;});
  };
  return S;
}};
})();
