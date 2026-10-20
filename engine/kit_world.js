/* World scene kit: Europe, America, Japan and Korea, each with four stage types.
   Stage types: town_square, great_hall, village, harbor.  Style comes from W.style. */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const R=E.rng(77);
E.ENV.world_morning={sky:0xBFE3F7,hs:0xFFF6E8,hg:0x6E7A5A,hi:.78,sc:0xFFF0D8,si:.8,sp:[10,18,12]};
E.ENV.world_day={sky:0xA9D8F5,hs:0xFFFFFF,hg:0x6A7A5A,hi:.8,sc:0xFFF6E6,si:.85,sp:[8,20,10]};
E.ENV.world_dusk={sky:0xF2B98A,hs:0xFFE2C4,hg:0x5A4A4A,hi:.7,sc:0xFFC890,si:.75,sp:[-14,10,8]};
E.ENV.world_night={sky:0x2A3460,hs:0x8A9AC8,hg:0x1E2440,hi:.55,sc:0xB8C8FF,si:.4,sp:[6,16,8]};
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
const STYLE={
  europe:{ground:'#9C968A',paveLines:'#7E786C',grass:0x7FA060,roof:0x9A4A32,roof2:0x5A5E66,trim:0x4A3424,accent:0xB8322A,tree:'round'},
  america:{ground:'#A89A82',paveLines:'#8A7E68',grass:0x88A85E,roof:0x3E4650,roof2:0x2E3440,trim:0xF4F2EC,accent:0x2A4A8A,tree:'round'},
  japan:{ground:'#B8AE98',paveLines:'#9A9078',grass:0x7A9A5A,roof:0x3A3E44,roof2:0x2E3236,trim:0x3A2A1E,accent:0xC8321E,tree:'sakura'},
  korea:{ground:'#C8BEA8',paveLines:'#A89E88',grass:0x86A066,roof:0x4A4E54,roof2:0x3A3E44,trim:0x5A3A26,accent:0x2E8A6A,tree:'persimmon'}};
let ST=STYLE.europe,styleName='europe';const WALK=[],WAVE=[],WATER=[];
function wallTex(kind){return tex(128,128,(c,w,h)=>{
  if(kind==='timber'){c.fillStyle='#EFE6D2';c.fillRect(0,0,w,h);c.fillStyle='#4A3424';[0,62,124].forEach(x=>c.fillRect(x,0,6,h));c.fillRect(0,0,w,6);c.fillRect(0,62,w,6);c.fillRect(0,122,w,6);c.save();c.lineWidth=5;c.strokeStyle='#4A3424';c.beginPath();c.moveTo(6,68);c.lineTo(62,122);c.moveTo(68,122);c.lineTo(124,68);c.stroke();c.restore();c.fillStyle='#5A7A9A';c.fillRect(20,18,24,30);c.fillRect(84,18,24,30);}
  else if(kind==='brick'){c.fillStyle='#A8483A';c.fillRect(0,0,w,h);c.strokeStyle='#8A3A2E';c.lineWidth=1;for(let y=0;y<h;y+=8){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();for(let x=(y/8)%2?0:8;x<w;x+=16){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+8);c.stroke();}}
    c.fillStyle='#F4F2EC';[[18,16],[78,16],[18,70],[78,70]].forEach(([x,y])=>{c.fillRect(x-3,y-3,38,46);c.fillStyle='#3E5A7A';c.fillRect(x,y,32,40);c.fillStyle='#F4F2EC';c.fillRect(x+15,y,2,40);c.fillRect(x,y+19,32,2);});}
  else if(kind==='machiya'){c.fillStyle='#F2EEE4';c.fillRect(0,0,w,h*.45);c.fillStyle='#5A3E2A';c.fillRect(0,h*.45,w,h*.55);c.strokeStyle='#3A2A1E';c.lineWidth=2;for(let x=4;x<w;x+=7){c.beginPath();c.moveTo(x,h*.5);c.lineTo(x,h);c.stroke();}c.fillStyle='#3A2A1E';c.fillRect(0,h*.43,w,5);c.fillRect(30,12,68,30);c.fillStyle='#EDE6D4';for(let i=0;i<4;i++)c.fillRect(33+i*17,15,14,24);}
  else{c.fillStyle='#F4F0E6';c.fillRect(0,0,w,h);c.fillStyle='#6A4A30';[0,60,122].forEach(x=>c.fillRect(x,0,6,h));c.fillRect(0,0,w,8);c.fillRect(0,120,w,8);c.fillStyle='#8A6A48';c.fillRect(14,22,38,70);c.fillRect(74,22,38,70);c.strokeStyle='#F4F0E6';c.lineWidth=2;for(let x=0;x<3;x++)for(let y=0;y<5;y++){c.strokeRect(16+x*12,24+y*13,10,11);c.strokeRect(76+x*12,24+y*13,10,11);}}});}
function gable(g,w,d,h,col,x,y,z){const s=new THREE.Shape();s.moveTo(-w/2-.25,0);s.lineTo(0,h);s.lineTo(w/2+.25,0);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:d+.5,bevelEnabled:false});geo.translate(0,0,-(d+.5)/2);const m=new THREE.Mesh(geo,M(col,{flatShading:true}));m.position.set(x,y,z);g.add(m);return m;}
function hip(g,w,d,h,col,x,y,z,curve){const r=mesh(new THREE.ConeGeometry(.71,1,4),M(col,{flatShading:true}),x,y+h/2,z,g);r.rotation.y=Math.PI/4;r.scale.set(w*1.12,h,d*1.12);
  const eave=box(w+.9,.12,d+.9,col,x,y+.02,z,g);if(curve){[-1,1].forEach(sx=>[-1,1].forEach(sz=>{const tip=box(.5,.1,.5,col,x+sx*(w/2+.35),y+.16,z+sz*(d/2+.35),g);tip.rotation.set(sz*.35,0,-sx*.35);}));}return r;}
function house(g,x,z,w,d,h,opt){opt=opt||{};const grp=new THREE.Group();grp.position.set(x,0,z);grp.rotation.y=opt.ry||0;g.add(grp);
  const kind={europe:'timber',america:'brick',japan:'machiya',korea:'hanok'}[styleName];const t=wallTex(kind);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(Math.max(1,Math.round(w/2.6)),Math.max(1,Math.round(h/2.6)));
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({map:t}));body.position.y=h/2;grp.add(body);
  if(styleName==='europe'){gable(grp,w,d,h*.7,ST.roof,0,h,0);box(.6,1.2,.6,0x8A7E70,w*.3,h+h*.45,0,grp);}
  else if(styleName==='america'){gable(grp,w,d,h*.42,ST.roof,0,h,0);box(w+.1,.16,d+.1,ST.trim,0,h,0,grp);box(.5,1,.5,0x8A3A2E,-w*.3,h+.5,0,grp);}
  else{if(styleName==='korea')box(w+.3,.5,d+.3,0x9A9488,0,.25,0,grp);hip(grp,w,d,h*.55,ST.roof,0,h,0,true);box(w*.75,.18,.18,styleName==='korea'?0xE8E4DA:ST.roof2,0,h+h*.55,0,grp);}
  if(opt.door!==false)box(1,1.7,.06,styleName==='america'?0x2A4A8A:ST.trim,0,.85,d/2+.03,grp);return grp;}
function tree(g,x,z,s){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s||1);g.add(t);mesh(new THREE.CylinderGeometry(.14,.2,1.6,7),M(0x5A3E2A),0,.8,0,t);
  const col=ST.tree==='sakura'?[0xF6B8C8,0xF2A0B8]:ST.tree==='persimmon'?[0x5E8A3E,0x4E7A34]:[0x5E9A48,0x4E8A3E];for(let i=0;i<4;i++)mesh(new THREE.IcosahedronGeometry(.75+R()*.3,0),M(col[i%2],{flatShading:true}),(R()-.5)*1,1.9+R()*.6,(R()-.5)*1,t);
  if(ST.tree==='persimmon')for(let i=0;i<8;i++)mesh(new THREE.SphereGeometry(.09,6,5),M(0xF27A1A),(R()-.5)*1.4,1.7+R()*.9,(R()-.5)*1.4,t);return t;}
function person(g,x,z,col,path,speed){const p=new THREE.Group();p.position.set(x,0,z);g.add(p);const legs=[-1,1].map(s=>{const l=new THREE.Group();l.position.set(s*.1,.55,0);p.add(l);box(.12,.55,.12,0x3A3A40,0,-.27,0,l);return l;});
  mesh(new THREE.CylinderGeometry(.2,.26,.75,10),M(col),0,.93,0,p);mesh(new THREE.SphereGeometry(.17,12,10),M(0xF0CDA8),0,1.45,0,p);
  if(styleName==='europe')mesh(new THREE.CylinderGeometry(.19,.2,.08,12),M(0x3A3A40),0,1.6,0,p);
  else if(styleName==='america'){const h=mesh(new THREE.CylinderGeometry(.3,.3,.06,3),M(0x2A2A2E),0,1.6,0,p);mesh(new THREE.CylinderGeometry(.13,.16,.14,10),M(0x2A2A2E),0,1.68,0,p);}
  else if(styleName==='japan')mesh(new THREE.ConeGeometry(.42,.22,14),M(0xC8A868),0,1.68,0,p);
  else{mesh(new THREE.CylinderGeometry(.42,.42,.02,16),M(0x1A1A1A),0,1.6,0,p);mesh(new THREE.CylinderGeometry(.12,.14,.24,10),M(0x1A1A1A),0,1.73,0,p);}
  if(path)WALK.push({p,legs,path,i:0,speed:speed||.7});return p;}
function ground(g,size){const t=tex(128,128,(c,w,h)=>{c.fillStyle=ST.ground;c.fillRect(0,0,w,h);c.strokeStyle=ST.paveLines;c.lineWidth=2;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(0,i*32);c.lineTo(w,i*32);c.stroke();for(let j=0;j<4;j++){c.beginPath();c.moveTo(j*32+(i%2)*16,i*32);c.lineTo(j*32+(i%2)*16,i*32+32);c.stroke();}}});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(size/3,size/3);const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=.01;g.add(m);m.userData.noFade=true;
  const gr=mesh(new THREE.CircleGeometry(size*1.6,32),M(ST.grass),0,-.01,0,g);gr.rotation.x=-Math.PI/2;gr.userData.noFade=true;}
function flag(g,x,z,h){const f=new THREE.Group();f.position.set(x,0,z);g.add(f);box(.08,h,.08,0xD8D8D0,0,h/2,0,f);const ft=tex(96,64,(c,w,hh)=>{if(styleName==='america'){for(let i=0;i<7;i++){c.fillStyle=i%2?'#F4F2EC':'#B8322A';c.fillRect(0,i*hh/7,w,hh/7);}c.fillStyle='#2A4A8A';c.fillRect(0,0,40,30);}
  else if(styleName==='japan'){c.fillStyle='#F4F2EC';c.fillRect(0,0,w,hh);c.fillStyle='#3A2A1E';c.font='bold 40px serif';c.textAlign='center';c.fillText('祭',w/2,hh*.7);}
  else if(styleName==='korea'){c.fillStyle='#F4F2EC';c.fillRect(0,0,w,hh);c.fillStyle='#C8321E';c.beginPath();c.arc(w/2,hh/2,16,Math.PI,0);c.fill();c.fillStyle='#2A4A8A';c.beginPath();c.arc(w/2,hh/2,16,0,Math.PI);c.fill();}
  else{c.fillStyle='#B8322A';c.fillRect(0,0,w,hh);c.fillStyle='#F2C14E';c.fillRect(w*.42,0,w*.16,hh);}});
  const cl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9,8,1),new THREE.MeshLambertMaterial({map:ft,side:THREE.DoubleSide}));cl.position.set(.72,h-.5,0);f.add(cl);WAVE.push(cl);return f;}
function water(g,x,z,w,d){const t=tex(64,64,(c,W,H)=>{c.fillStyle='#3E7AA8';c.fillRect(0,0,W,H);for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.3)';c.fillRect(R()*W,R()*H,10,2);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/4,d/4);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(x,.02,z);g.add(m);m.userData.noFade=true;WATER.push(t);}
function ship(g,x,z,big){const s=new THREE.Group();s.position.set(x,0,z);g.add(s);const hull=box(big?5:3,.9,big?1.4:1.1,0x6A4428,0,.35,0,s);box(big?4.6:2.6,.1,big?1.2:.9,0x8A6A44,0,.85,0,s);
  const masts=big?[-1.4,0,1.4]:[0];masts.forEach(mx=>{box(.1,big?4:2.6,.1,0x5A3A22,mx,big?2.8:2,0,s);const sail=new THREE.Mesh(new THREE.PlaneGeometry(big?1.5:1.6,big?2:1.6),new THREE.MeshLambertMaterial({color:styleName==='japan'||styleName==='korea'?0xE8D8B0:0xF4F0E4,side:THREE.DoubleSide}));sail.position.set(mx,big?2.8:2.2,0);sail.rotation.y=Math.PI/2;s.add(sail);});
  s.userData.bob=true;WAVE.push(s);return s;}
/* ---------- stage templates ---------- */
const TPL={
  town_square(g){ground(g,26);
    [[-6,-8,4.4,3.4,4],[-1.2,-9,4,3.2,4.6],[3.6,-8.4,4.2,3.4,4.2],[-9.4,-2.5,3.6,3,3.6,Math.PI/2],[9.4,-2.5,3.6,3,3.6,-Math.PI/2]].forEach(([x,z,w,d,h,ry])=>house(g,x,z,w,d,h,{ry:ry||0}));
    if(styleName==='europe'||styleName==='america'){const tw=new THREE.Group();tw.position.set(8.4,0,-9);g.add(tw);box(2.2,7,2.2,styleName==='america'?0xF4F2EC:0xA8A090,0,3.5,0,tw);mesh(new THREE.ConeGeometry(1.4,3.4,4),M(styleName==='america'?0xF4F2EC:0x5A5E66),0,8.7,0,tw).rotation.y=Math.PI/4;
      const ck=mesh(new THREE.CircleGeometry(.55,24),M(0xF4F0E4),0,5.6,1.12,tw);box(.04,.4,.02,0x1A1A1A,0,5.75,1.14,tw);}
    else{const tor=new THREE.Group();tor.position.set(0,0,-5.4);g.add(tor);if(styleName==='japan'){[-1.6,1.6].forEach(x=>mesh(new THREE.CylinderGeometry(.16,.18,3.2,10),M(0xC8321E),x,1.6,0,tor));box(4.4,.24,.3,0x2A2A2A,0,3.3,0,tor);box(3.8,.18,.24,0xC8321E,0,2.8,0,tor);}
      else{[-1.6,1.6].forEach(x=>box(.3,3.2,.3,0xC8321E,x,1.6,0,tor));hip(tor,3.6,.8,.7,ST.roof,0,3.2,0,true);}}
    const ft=new THREE.Group();ft.position.set(-4.6,0,-4.6);g.add(ft);mesh(new THREE.CylinderGeometry(1,1.1,.5,16),M(0xA8A090),0,.25,0,ft);const wt=mesh(new THREE.CircleGeometry(.85,16),M(0x5A9AC8),0,.51,0,ft);wt.rotation.x=-Math.PI/2;mesh(new THREE.CylinderGeometry(.12,.16,1.3,8),M(0xA8A090),0,.9,0,ft);
    [[-7,3],[7,3.4]].forEach(([x,z])=>tree(g,x,z,1.1));flag(g,6.2,-4.5,4.2);
    person(g,-8,1,0x8A5A3A,[V(-8,0,1),V(6,0,1.6)],.8);person(g,6,-6,0x3A5A8A,[V(6,0,-6),V(-5,0,-6.4)],.6);},
  great_hall(g){ground(g,26);const hall=new THREE.Group();hall.position.set(0,0,-10);g.add(hall);
    if(styleName==='europe'){box(12,6,4,0x9C968A,0,3,0,hall);for(let i=-6;i<=6;i+=1.2)box(.6,.7,4.2,0x8A8478,i,6.3,0,hall);[-6.4,6.4].forEach(x=>{mesh(new THREE.CylinderGeometry(1.3,1.4,8.4,14),M(0x9C968A),x,4.2,0,hall);mesh(new THREE.ConeGeometry(1.6,2.6,14),M(ST.roof2),x,9.7,0,hall);});
      box(2.4,3.6,.2,0x3A2A1E,0,1.8,2.05,hall);mesh(new THREE.CircleGeometry(1.2,16,0,Math.PI),M(0x3A2A1E),0,3.6,2.06,hall);[-3.4,3.4].forEach(x=>box(.9,2.6,.05,ST.accent,x,3.6,2.05,hall));}
    else if(styleName==='america'){box(11,4.4,4,0xA8483A,0,2.2,0,hall);box(11.2,.3,4.2,0xF4F2EC,0,4.5,0,hall);gable(hall,11,4,1.6,ST.roof,0,4.6,0);const tw=new THREE.Group();tw.position.set(0,4.4,0);hall.add(tw);box(2.4,3.4,2.4,0xA8483A,0,1.7,0,tw);box(2,2.2,2,0xF4F2EC,0,4.5,0,tw);mesh(new THREE.ConeGeometry(.9,2.2,8),M(0xF4F2EC),0,6.7,0,tw);mesh(new THREE.CircleGeometry(.6,20),M(0xF4F0E4),0,2,1.22,tw);
      for(let i=-4;i<=4;i+=2)box(1,1.8,.06,0xF4F2EC,i,2.4,2.03,hall);box(1.4,2.4,.06,0x2A4A8A,0,1.2,2.04,hall);}
    else if(styleName==='japan'){box(9,1.6,6,0x8A8478,0,.8,0,hall);[[7,2.6,5,1.6],[5.4,2.2,3.8,4.4],[3.8,1.9,2.8,6.8]].forEach(([w,h,d,y],i)=>{box(w,h,d,0xF4F2EC,0,y+h/2,0,hall);hip(hall,w,d,1.1,ST.roof,0,y+h,0,true);});mesh(new THREE.ConeGeometry(.3,.5,4),M(0xC8A040),0,10.2,0,hall);}
    else{box(13,1,6.4,0xA8A090,0,.5,0,hall);box(11,.8,5,0xA8A090,0,1.4,0,hall);for(let i=-4.5;i<=4.5;i+=1.5)mesh(new THREE.CylinderGeometry(.18,.2,3.4,10),M(0xA8321E),i,3.5,2,hall);box(10,3.4,3.6,0xF4F0E6,0,3.5,-.2,hall);box(11,.4,4.4,0x2E8A6A,0,5.3,0,hall);hip(hall,10,4,1.8,ST.roof,0,5.5,0,true);box(9,.2,.2,0xE8E4DA,0,7.3,0,hall);
      for(let i=0;i<6;i++)[-1,1].forEach(s=>box(.3,.6,.3,0x9A9488,s*(1.4+(i%3)*1.4),.3,-4+Math.floor(i/3)*2.2,g));}
    [-1,1].forEach(s=>{for(let i=0;i<3;i++){box(.7,1.4,10,0x9C968A,s*10,.7,-4,g);}flag(g,s*5.4,-5.6,5);});[[-8,4],[8,4]].forEach(([x,z])=>tree(g,x,z,1.2));
    person(g,-4,-4,ST.accent,[V(-4,0,-4),V(4,0,-4)],.5);person(g,7,1,0x5A5A70,null);},
  village(g){const gr=mesh(new THREE.PlaneGeometry(40,40),M(ST.grass),0,.005,0,g);gr.rotation.x=-Math.PI/2;gr.userData.noFade=true;const path=mesh(new THREE.PlaneGeometry(3,30),M(0xB8A07A),0,.012,-4,g);path.rotation.x=-Math.PI/2;path.userData.noFade=true;
    if(styleName==='america'){[[-6,-8],[5,-9]].forEach(([x,z])=>{const c=new THREE.Group();c.position.set(x,0,z);g.add(c);for(let i=0;i<7;i++){const lg=mesh(new THREE.CylinderGeometry(.22,.22,4.2,8),M(i%2?0x7A5236:0x6A4428),0,.22+i*.42,0,c);lg.rotation.z=Math.PI/2;}gable(c,4.2,3,1.4,0x5A4A3A,0,2.9,0);});
      const wg=new THREE.Group();wg.position.set(6.4,0,-2.4);g.add(wg);box(2.6,.5,1.2,0x7A5236,0,.7,0,wg);const cv=mesh(new THREE.CylinderGeometry(.75,.75,2.4,14,1,true,0,Math.PI),M(0xF0EAD8,{side:THREE.DoubleSide}),0,1,0,wg);cv.rotation.z=Math.PI/2;cv.rotation.y=Math.PI/2;[[-1,-.65],[1,-.65],[-1,.65],[1,.65]].forEach(([x,z])=>{const w=mesh(new THREE.TorusGeometry(.4,.06,6,16),M(0x3A2A1A),x,.42,z,wg);});}
    else{[[-6.4,-8,4,3,3],[4.6,-9,4,3.2,3.2],[-9,-1,3.4,3,3,Math.PI/2]].forEach(([x,z,w,d,h,ry])=>house(g,x,z,w,d,h,{ry:ry||0}));}
    if(styleName==='europe'){const wm=new THREE.Group();wm.position.set(8,0,-6);g.add(wm);mesh(new THREE.CylinderGeometry(1,1.4,5,10),M(0xE8E0CC),0,2.5,0,wm);mesh(new THREE.ConeGeometry(1.2,1.4,10),M(ST.roof),0,5.7,0,wm);const bl=new THREE.Group();bl.position.set(0,4.6,1.2);wm.add(bl);for(let i=0;i<4;i++){const b=box(.5,3.2,.05,0xF4F0E4,0,1.6,0,new THREE.Group());const a=new THREE.Group();a.rotation.z=i*Math.PI/2;a.add(b);bl.add(a);}WAVE.push(bl);bl.userData.spin=true;}
    if(styleName==='japan'){for(let i=0;i<4;i++){const p=mesh(new THREE.PlaneGeometry(4,3),M(0x6AA8B8),-6+(i%2)*4.4,.03,4+Math.floor(i/2)*3.4,g);p.rotation.x=-Math.PI/2;for(let k=0;k<20;k++)mesh(new THREE.ConeGeometry(.05,.4,4),M(0x6A9A3A),p.position.x+(R()-.5)*3.4,.2,p.position.z+(R()-.5)*2.4,g);}}
    if(styleName==='korea'){for(let i=0;i<9;i++)mesh(new THREE.SphereGeometry(.32+R()*.15,10,8),M(0x6A3A22),6+(i%3)*.8,.3,-3+Math.floor(i/3)*.8,g);for(let i=0;i<10;i++)box(.6,.8,.6,0x9A9488,-10+i*.62,.4,-4.6,g);}
    for(let i=0;i<10;i++){const x=-11+R()*22,z=-12+R()*6;if(Math.abs(x)<3)continue;tree(g,x,z,.9+R()*.4);}[[-8,4],[8,5]].forEach(([x,z])=>tree(g,x,z,1));
    for(let i=0;i<8;i++){box(.08,.8,.08,0x7A5A3A,-9+i*1.2,.4,2.6,g);}box(9,.06,.06,0x7A5A3A,-4.8,.7,2.6,g);
    person(g,-2,-7,0x7A5A3A,[V(-2,0,-7),V(-2,0,2)],.5);},
  harbor(g){ground(g,14);water(g,0,-14,60,24);const dk=new THREE.Group();g.add(dk);box(6,.3,8,0x7A5A3A,6,.15,-7,dk);for(let i=0;i<6;i++){mesh(new THREE.CylinderGeometry(.15,.15,1.4,8),M(0x5A3A22),3.2+(i%2)*5.6,-.3,-4-Math.floor(i/2)*3,g);}
    ship(g,-3,-10,styleName==='europe'||styleName==='america');ship(g,9,-14,false);
    for(let i=0;i<6;i++){box(.8,.8,.8,i%2?0x9A7A4A:0x8A6A3A,-6+(i%3)*.9,.4+Math.floor(i/3)*.8,-4.5,g);}for(let i=0;i<4;i++)mesh(new THREE.CylinderGeometry(.35,.35,.9,12),M(0x6A4A2A),5+i*.8,.45,-4,g);
    house(g,-8.6,-1.5,3.6,3,3.4,{ry:Math.PI/2});house(g,8.8,1,3.4,3,3.2,{ry:-Math.PI/2});flag(g,3,-6.5,4);
    person(g,-5,-3,0x4A6A8A,[V(-5,0,-3),V(5,0,-3)],.6);person(g,6,-8,0x8A6A4A,null);}};
/* ---------- props ---------- */
const P={
  scroll(g){box(.5,.7,.4,0x6A4428,0,.35,0,g);const r=mesh(new THREE.CylinderGeometry(.08,.08,.7,10),M(0xF2E8C8),0,.8,0,g);r.rotation.z=Math.PI/2;box(.6,.02,.35,0xF2E8C8,0,.76,.18,g);return 1.1;},
  book(g){box(.12,.9,.12,0x5A3A22,0,.45,0,g);box(.6,.05,.45,0x5A3A22,0,.92,0,g);const b1=box(.28,.04,.38,0xF4F0E4,-.14,.96,0,g);b1.rotation.z=.12;const b2=box(.28,.04,.38,0xF4F0E4,.14,.96,0,g);b2.rotation.z=-.12;box(.6,.05,.42,0x8A2A1E,0,.93,0,g);return 1.2;},
  map(g){box(1.2,.08,.8,0x6A4428,0,.8,0,g);[[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]].forEach(([x,z])=>box(.08,.8,.08,0x5A3A22,x,.4,z,g));const t=tex(128,96,(c,w,h)=>{c.fillStyle='#EADCB0';c.fillRect(0,0,w,h);c.strokeStyle='#7A5A3A';c.lineWidth=3;c.beginPath();c.moveTo(20,60);c.bezierCurveTo(40,20,80,80,110,30);c.stroke();c.fillStyle='#5A8A6A';c.beginPath();c.arc(40,40,12,0,7);c.fill();c.fillStyle='#B8322A';c.beginPath();c.arc(96,40,5,0,7);c.fill();});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.y=.85;g.add(m);return 1.1;},
  chest(g){box(.9,.5,.6,0x7A4A22,0,.25,0,g);const l=mesh(new THREE.CylinderGeometry(.3,.3,.9,12,1,false,0,Math.PI),M(0x6A3A1A),0,.5,0,g);l.rotation.z=Math.PI/2;box(.92,.06,.62,0xC8A040,0,.48,0,g);return .9;},
  crate(g){box(.8,.8,.8,0x9A7A4A,0,.4,0,g);box(.7,.7,.7,0x8A6A3A,.2,1.15,0,g);return 1.6;},
  statue(g){box(.8,1,.8,0xA8A090,0,.5,0,g);mesh(new THREE.SphereGeometry(.3,12,10),M(0xB8B0A0),0,1.4,0,g);box(.6,.4,.3,0xB8B0A0,0,1.05,0,g);return 1.8;},
  flag(g){box(.06,2,.06,0xD8D8D0,0,1,0,g);const f=new THREE.Mesh(new THREE.PlaneGeometry(.8,.5),M(ST.accent,{side:THREE.DoubleSide}));f.position.set(.42,1.7,0);g.add(f);return 2.1;},
  lantern(g){if(styleName==='japan'||styleName==='korea'){box(.5,.3,.5,0x9A9488,0,.15,0,g);box(.2,.7,.2,0x9A9488,0,.65,0,g);box(.5,.4,.5,0xA8A090,0,1.2,0,g);mesh(new THREE.ConeGeometry(.45,.35,4),M(0x8A8478),0,1.57,0,g).rotation.y=Math.PI/4;}
    else{box(.08,1.8,.08,0x2A2A2A,0,.9,0,g);box(.3,.4,.3,0xF2D27A,0,1.95,0,g);box(.36,.06,.36,0x2A2A2A,0,2.18,0,g);}return 2;},
  sign(g){[-.5,.5].forEach(x=>box(.08,1.4,.08,0x5A3A22,x,.7,0,g));box(1.3,.8,.06,0x8A6A44,0,1.25,0,g);for(let i=0;i<3;i++)box(.3,.38,.01,0xF4F0E4,-.4+i*.4,1.25,.04,g);return 1.7;},
  cart(g){box(1.2,.4,.7,0x8A6A44,0,.6,0,g);[-1,1].forEach(s=>{const w=mesh(new THREE.TorusGeometry(.32,.05,6,16),M(0x3A2A1A),0,.35,s*.4,g);});box(.06,.06,1,0x5A3A22,.9,.55,0,g).rotation.y=Math.PI/2;for(let i=0;i<3;i++)mesh(new THREE.SphereGeometry(.16,8,6),M([0xC8321E,0xF2A23A,0x6AB84A][i]),-.3+i*.3,.92,0,g);return 1.1;},
  letter(g){box(.9,.75,.6,0x6A4428,0,.375,0,g);box(.35,.01,.25,0xF4F0E4,0,.76,0,g);mesh(new THREE.CylinderGeometry(.06,.06,.02,10),M(0xB8322A),.08,.77,.05,g);return .9;}};
E.kits.world={
  build(W,stagePos){styleName=STYLE[W.style]?W.style:'europe';ST=STYLE[styleName];W.stages.forEach((s,i)=>{const g=new THREE.Group();g.position.copy(stagePos[i]);E.scene.add(g);(TPL[s.template]||TPL.town_square)(g);});},
  prop(type){const g=new THREE.Group();const h=(P[type]||P.scroll)(g);return {g,h};},
  onFrame(dt,t){WALK.forEach(w=>{const tgt=w.path[w.i],p=w.p.position,d=V(tgt.x,0,tgt.z).add(w.p.parent.position.clone().multiplyScalar(0)).sub(p);const dist=Math.hypot(d.x,d.z);if(dist<.2){w.i=(w.i+1)%w.path.length;return;}
      p.x+=d.x/dist*w.speed*dt;p.z+=d.z/dist*w.speed*dt;w.p.rotation.y=Math.atan2(d.x,d.z);const s=Math.sin(t*8)*.5;w.legs[0].rotation.x=s;w.legs[1].rotation.x=-s;});
    WAVE.forEach((o,i)=>{if(o.userData.bob){o.position.y=Math.sin(t*1.2+i)*.06;o.rotation.z=Math.sin(t+i)*.03;}else if(o.userData.spin)o.rotation.z+=dt*.8;else if(o.geometry){const pa=o.geometry.attributes.position;for(let k=0;k<pa.count;k++){const x=pa.getX(k);pa.setZ(k,Math.sin(t*3+x*3)*.08*(x+.7));}pa.needsUpdate=true;}});
    WATER.forEach(t2=>{t2.offset.x+=dt*.02;t2.offset.y+=dt*.01;});}};
})();
