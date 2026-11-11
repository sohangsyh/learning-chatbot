/* Scene kit: school_campus */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
E.ENV.campus_morning={sky:0xBFE0F2,hs:0xFFF6E6,hg:0x6E7C64,hi:.64,sc:0xFFEBC8,si:.64,sp:[14,20,10]};
E.ENV.campus_noon={sky:0xA9D4EE,hs:0xFAFBF6,hg:0x6E7C64,hi:.68,sc:0xFFFFFF,si:.68,sp:[4,26,6]};
E.ENV.campus_afternoon={sky:0xF0C89A,hs:0xFFE4C4,hg:0x6A5E50,hi:.74,sc:0xFFB878,si:.74,sp:[-16,12,8]};
E.ENV.campus_alarm={sky:0x6A3A3A,hs:0xFFC8B8,hg:0x4A3434,hi:.6,sc:0xFF8A6A,si:.5,sp:[-6,18,6]};
const M=(h,o)=>E.M(h,o),box=(...a)=>E.box(...a),mesh=(...a)=>E.mesh(...a),cyl=(rt,rb,h,c,x,y,z,g,seg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg||12),M(c),x,y,z,g);
const glass=(c)=>M(c||0xBFE8F2,{transparent:true,opacity:.45});
function bench(g,w,d){box(w,.86,d,0xDCD6C8,0,.43,0,g);box(w+.04,.05,d+.04,0x2A2D30,0,.88,0,g);}
function stool(g,x,z){const s=new THREE.Group();s.position.set(x,0,z);g.add(s);cyl(.17,.17,.05,0x3A6FB0,0,.62,0,s);cyl(.03,.03,.6,0x8A9098,0,.31,0,s);cyl(.16,.16,.02,0x8A9098,0,.01,0,s);}
function wallSeg(g,w,z,col){box(w,2.8,.2,col||0xF0E8D6,0,1.4,z,g);for(let x=-w/2+1.2;x<w/2-.6;x+=2.4){const wn=box(1.6,1,.05,0x9FC8E0,x,1.85,z+.11,g);wn.material=glass(0x9FC8E0);box(1.7,.06,.08,0xFFFFFF,x,1.33,z+.12,g);}box(w,.12,.24,0x5B7FA6,0,.06,z+.02,g);}
function plant(g,x,z,s){const p=new THREE.Group();p.position.set(x,0,z);p.scale.setScalar(s||1);g.add(p);cyl(.22,.17,.4,0xE7E2D8,0,.2,0,p);mesh(new THREE.IcosahedronGeometry(.36,0),M(0x4E8F5A,{flatShading:true}),0,.7,0,p);}
const props={
  eyewash_station(g){cyl(.05,.05,1,0x9AA0A6,0,.5,0,g);const b=mesh(new THREE.SphereGeometry(.28,14,8,0,Math.PI*2,0,Math.PI/2),M(0xE8ECEE),0,1.02,0,g);b.rotation.x=Math.PI;cyl(.03,.03,.12,0x9AA0A6,-.1,1.08,0,g);cyl(.03,.03,.12,0x9AA0A6,.1,1.08,0,g);
    box(.05,1.7,.05,0x9AA0A6,.45,.85,-.2,g);box(.5,.5,.03,0x2E9B5E,.45,1.6,-.18,g).material=M(0x2E9B5E,{emissive:0x0E3A20});box(.22,.1,.01,0xFFFFFF,.45,1.6,-.16,g);return 1.9;},
  reagent_bench(g){bench(g,1.6,.8);[[-.45,0x7A4A22],[-.15,0xDCE8EE],[.15,0x7A4A22],[.45,0xDCE8EE]].forEach(([x,c])=>{cyl(.07,.08,.26,c,x,1.04,0,g);cyl(.035,.035,.05,0x2A2D30,x,1.2,0,g);});
    const hz=box(.16,.16,.01,0xF2A23A,-.15,1.04,.085,g);hz.rotation.z=Math.PI/4;stool(g,0,.7);return 1.35;},
  poster(g){box(.05,1.6,.05,0x8A9098,0,.8,0,g);box(.9,1.2,.04,0xFFFFFF,0,1.3,.03,g);box(.7,.16,.01,0x2E9B5E,0,1.66,.055,g);for(let i=0;i<3;i++)box(.6,.05,.01,0x3A3F46,0,1.38-i*.14,.055,g);box(.2,.2,.01,0xF2A23A,0,.9,.055,g);return 1.95;},
  burner_bench(g){bench(g,1.4,.8);cyl(.1,.12,.04,0x3A3F46,0,.92,0,g);cyl(.04,.04,.26,0x8A9098,0,1.06,0,g);g.userData.collar=cyl(.05,.05,.06,0xC8A040,0,.98,0,g,8);const f=mesh(new THREE.ConeGeometry(.05,.22,10),new THREE.MeshBasicMaterial({color:0x4A8AFF,transparent:true,opacity:.85}),0,1.3,0,g);g.userData.blue=f;const fy=mesh(new THREE.ConeGeometry(.07,.36,10),new THREE.MeshBasicMaterial({color:0xFFB030,transparent:true,opacity:0}),0,1.38,0,g);g.userData.yellow=fy;
    [0,2.1,4.2].forEach(a=>{const l=box(.02,.42,.02,0x2A2D30,Math.cos(a)*.16,1.1,Math.sin(a)*.16,g);});cyl(.2,.2,.02,0x6A7078,0,1.32,0,g,6);stool(g,0,.7);return 1.55;},
  tube_rack(g){box(.8,.06,.5,0xD9D4CB,0,.72,0,g);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>box(.05,.72,.05,0x5A5F66,a*.32,.36,b*.2,g));
    box(.5,.06,.16,0xB98A4A,0,.84,0,g);box(.5,.06,.16,0xB98A4A,0,.98,0,g);for(let i=0;i<4;i++){const t=cyl(.03,.03,.32,0xDCF0F6,-.18+i*.12,.98,0,g,8);t.material=glass(0xDCF0F6);}
    const cl=box(.04,.04,.36,0xC9A06A,.32,.82,.1,g);cl.rotation.y=.6;return 1.25;},
  safety_card(g){const a=box(.5,.6,.03,0xF2D24A,0,.34,.08,g);a.rotation.x=-.28;const b=box(.5,.6,.03,0xF2D24A,0,.34,-.08,g);b.rotation.x=.28;box(.36,.08,.01,0xC8452F,0,.52,.15,g).rotation.x=-.28;return .75;},
  broken_glass(g){const r=E.rng(4);for(let i=0;i<9;i++){const s=mesh(new THREE.TetrahedronGeometry(.06+r()*.06,0),glass(0xCDEFF8),(r()-.5)*.9,.03,(r()-.5)*.7,g);s.rotation.set(r()*3,r()*3,r()*3);}
    const bk=cyl(.14,.12,.24,0xCDEFF8,.3,.12,.15,g);bk.material=glass(0xCDEFF8);bk.rotation.z=Math.PI/2;const w=mesh(new THREE.CircleGeometry(.4,16),M(0x9FC8E0,{transparent:true,opacity:.35}),-.1,.012,0,g);w.rotation.x=-Math.PI/2;return .45;},
  glass_bin(g){box(.6,.7,.5,0xC49A62,0,.35,0,g);box(.62,.14,.52,0xC8452F,0,.5,0,g);box(.5,.02,.4,0x8A6A44,0,.71,0,g);return .9;},
  broom_pan(g){const st=box(.04,1.4,.04,0xB98A4A,0,.72,0,g);st.rotation.z=.22;box(.4,.18,.08,0xD9B84A,-.15,.09,0,g);box(.34,.03,.3,0x3A6FB0,.45,.02,.1,g);box(.04,.28,.04,0x3A6FB0,.45,.15,-.05,g).rotation.x=-.5;return 1.5;},
  fire_alarm(g){box(.08,1.8,.08,0x8A9098,0,.9,0,g);box(.34,.42,.12,0xD23A2E,0,1.6,.04,g).material=M(0xD23A2E,{emissive:0x5A0E08});cyl(.12,.12,.06,0xE8C24A,0,1.95,.04,g,16).rotation.x=Math.PI/2;return 2.15;},
  exit_sign(g){box(.06,2,.06,0x8A9098,0,1,0,g);box(.8,.34,.08,0x1E9A55,0,2,.04,g).material=M(0x1E9A55,{emissive:0x0E6A30});const ar=mesh(new THREE.ConeGeometry(.08,.16,3),M(0xFFFFFF,{emissive:0x888888}),.22,2,.09,g);ar.rotation.z=-Math.PI/2;box(.22,.05,.01,0xFFFFFF,-.08,2,.09,g);return 2.25;},
  lift_door(g){box(1.6,2.4,.2,0xD9D4CB,0,1.2,0,g);g.userData.doors=[box(.6,2,.04,0xB8BEC6,-.31,1,.11,g),box(.6,2,.04,0xB8BEC6,.31,1,.11,g)];box(.12,.3,.04,0x3A3F46,.95,1.2,.11,g);box(.4,.12,.01,0xC8452F,0,2.25,.11,g);return 2.5;}
};
function lockers(g,x,z,n){for(let i=0;i<n;i++){box(.5,1.7,.45,[0x3A6FB0,0x4E86C6][i%2],x+i*.52,.85,z,g);box(.05,.2,.02,0xE8ECEE,x+i*.52+.15,1,z+.23,g);}}
function template(name,g){
  if(name==='science_lab'){wallSeg(g,13,-7.2);[-3.6,0,3.6].forEach(x=>{[-4.6,-6.1].forEach(z=>{const b=new THREE.Group();b.position.set(x,0,z);g.add(b);bench(b,2.8,.9);cyl(.18,.18,.04,0x8A9098,0,.9,0,b);box(.04,.3,.04,0x8A9098,0,1.05,-.25,b);stool(b,-.7,.7);stool(b,.7,.7);});});
    box(1.6,2.2,.8,0xE8E4DC,-5.6,1.1,-5.4,g);box(1.4,.9,.05,0xBFE8F2,-5.6,1.4,-4.98,g).material=glass();
    const pt=new THREE.Group();pt.position.set(3.6,1.9,-7.05);g.add(pt);for(let r=0;r<4;r++)for(let c=0;c<9;c++)if(!(r===0&&c>0&&c<8))box(.18,.16,.02,[0xF2A23A,0x5AA8E0,0x7ACB7A,0xE87A8A][(r+c)%4],(c-4)*.2,-r*.18,0,pt);plant(g,6,-4,1.1);}
  if(name==='prep_room'){wallSeg(g,13,-7,0xEDE6D4);[-4.2,-1.4,1.4].forEach(x=>{box(2.4,2.2,.5,0xDCD6C8,x,1.1,-6.5,g);for(let s=0;s<3;s++){box(2.3,.04,.48,0xB9B2A2,x,.5+s*.62,-6.45,g);for(let k=0;k<5;k++){const c=cyl(.07,.07,.2+((k+s)%2)*.08,0xCDEFF8,x-.9+k*.45,.62+s*.62,-6.4,g,10);c.material=glass(0xCDEFF8);}}});
    const sk=new THREE.Group();sk.position.set(4.6,0,-6.2);g.add(sk);bench(sk,2,.8);cyl(.25,.25,.04,0x8A9098,0,.9,0,sk);plant(g,-6,-4,1);}
  if(name==='corridor'){wallSeg(g,14,-7.2,0xEFE4D0);lockers(g,-6.4,-6.8,6);lockers(g,3.4,-6.8,6);box(1.2,2.2,.1,0x8A5A36,-.4,1.1,-7.05,g);box(1.6,1,.05,0xC9A06A,-3.2,1.6,-7.05,g);
    for(let i=0;i<5;i++)box(.3,.2,.01,[0xF2D24A,0xFFFFFF,0x9FD9C6][i%3],-3.6+i*.2,1.6+(i%2)*.2,-7.02,g);box(1.6,.45,.4,0x8A5A36,5.6,.25,-4.4,g);}
}
let alarmT=0;

/* ---------- upgrades: people, richer lab, interactions ---------- */
const FONT2='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
function ctex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function cpanel(g,w,h,t,x,y,z,ry,basic){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map:t}):new THREE.MeshLambertMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}
function student(o){o=o||{};const g=new THREE.Group();const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.11,.62,0);g.add(p);box(.13,.6,.14,0x5A5E66,0,-.3,0,p);box(.14,.07,.2,0x1A1A1A,0,-.6,.03,p);return p;});
  mesh(new THREE.CylinderGeometry(.21,.24,.7,10),M(0xF4F4F0),0,.98,0,g);box(.06,.3,.02,0x1E3A6A,0,1.08,.22,g);if(o.coat)mesh(new THREE.CylinderGeometry(.23,.28,.82,10,1,true),M(0xFFFFFF,{side:THREE.DoubleSide}),0,.92,0,g);
  const arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.27,1.28,0);g.add(a);box(.1,.55,.1,o.coat?0xFFFFFF:0xF4F4F0,0,-.26,0,a);return a;});
  mesh(new THREE.SphereGeometry(.18,12,10),M([0xF2D2B0,0xE0B890][o.skin||0]),0,1.5,0,g);mesh(new THREE.SphereGeometry(.19,12,8,0,Math.PI*2,0,Math.PI/2),M(0x1A1612),0,1.54,0,g);
  if(o.goggles){box(.3,.08,.06,0x9FE8FF,0,1.53,.17,g).material=new THREE.MeshBasicMaterial({color:0x9FE8FF,transparent:true,opacity:.6});}
  g.scale.setScalar(1.1);g.userData={legs,arms};return g;}
const REF={},CFX=[];
function cburst(pos,col,n,spd,grav,life,geo,parent){for(let i=0;i<n;i++){const m=new THREE.Mesh(geo||new THREE.SphereGeometry(.04,6,4),new THREE.MeshBasicMaterial({color:col,transparent:true}));m.position.copy(pos);(parent||E.scene).add(m);CFX.push({m,v:V((Math.random()-.5)*spd,Math.random()*spd+.4,(Math.random()-.5)*spd),g:grav==null?4:grav,life:life||1.2});}}
function ctween(d,fn){return new Promise(res=>{const t0=performance.now();const D=Math.max(.01,d*(window.__fast?.15:1)*1000);const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requentAF(f);});}
const requentAF=f=>requestAnimationFrame(f);
const cwpos=o=>{const v=V();o.getWorldPosition(v);return v;};
function cstep(sp,text,labels){return new Promise(async res=>{E.actions([]);await E.showLine(sp,text);E.actions(labels.map((l,i)=>E.btn(i?'ghost':'next',l,()=>res(i))));});}
function labExtras(g){
  const fl=ctex(128,128,(c,W,H)=>{c.fillStyle='#C8CCC4';c.fillRect(0,0,W,H);c.strokeStyle='#B0B4AC';c.lineWidth=2;c.strokeRect(1,1,W-2,H-2);for(let i=0;i<80;i++){c.fillStyle='rgba(120,120,110,.15)';c.fillRect(Math.random()*W,Math.random()*H,3,3);}});fl.wrapS=fl.wrapT=THREE.RepeatWrapping;fl.repeat.set(13,10);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(13,10),new THREE.MeshLambertMaterial({map:fl}));f.rotation.x=-Math.PI/2;f.position.set(0,.018,-1.2);g.add(f);
  const wb=ctex(512,256,(c,W,H)=>{c.fillStyle='#F8F8F4';c.fillRect(0,0,W,H);c.strokeStyle='#8A9098';c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);c.fillStyle='#1A4AA8';c.font='bold 34px '+FONT2;c.fillText('實驗：加熱與觀察',24,56);c.font='28px '+FONT2;c.fillStyle='#2A2A2A';c.fillText('1. 戴上護目鏡',24,108);c.fillText('2. 試管口不可對著人',24,150);c.fillStyle='#C8221A';c.fillText('NaOH(aq) 有腐蝕性 ⚠',24,198);});
  cpanel(g,2.6,1.3,wb,-1.2,2,-7.08,0);
  const fc=new THREE.Group();fc.position.set(-5.4,0,-6.3);g.add(fc);box(1.8,.9,.9,0xD8D4CC,0,.45,0,fc);box(1.8,1.6,.9,0xE8E6E0,0,1.75,-.1,fc);const sash=new THREE.Mesh(new THREE.BoxGeometry(1.6,.9,.03),new THREE.MeshPhongMaterial({color:0xCFEFF8,transparent:true,opacity:.35}));sash.position.set(0,1.5,.36);fc.add(sash);box(1.82,.2,.92,0x3A6FB0,0,2.62,-.1,fc);
  const sh=new THREE.Group();sh.position.set(6.1,0,-3.6);g.add(sh);box(.08,2.6,.08,0x2E9B5E,0,1.3,0,sh);box(.5,.06,.06,0x2E9B5E,.25,2.6,0,sh);mesh(new THREE.CylinderGeometry(.22,.08,.12,14),M(0x2E9B5E),.5,2.5,0,sh);box(.04,.6,.04,0x2E9B5E,.5,2.1,0,sh);mesh(new THREE.TorusGeometry(.06,.015,6,12),M(0x2E9B5E),.5,1.8,0,sh);
  const st=ctex(128,128,(c,W,H)=>{c.fillStyle='#1E9A55';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 22px '+FONT2;c.textAlign='center';c.fillText('緊急淋浴',W/2,70);c.fillText('SHOWER',W/2,100);});cpanel(sh,.5,.5,st,-.05,2.2,.05,0);
  const gc=new THREE.Group();gc.position.set(4.6,0,-6.9);g.add(gc);box(1.2,1.5,.4,0x8A6AC8,0,1.6,0,gc);const gl=new THREE.Mesh(new THREE.BoxGeometry(1,1.2,.02),new THREE.MeshPhongMaterial({color:0xB8A0F8,transparent:true,opacity:.5}));gl.position.set(0,1.6,.21);gc.add(gl);for(let i=0;i<6;i++)box(.24,.08,.12,0x2A4A6A,-.35+(i%3)*.35,1.3+Math.floor(i/3)*.5,.05,gc);
  const ex=new THREE.Group();ex.position.set(-6.3,0,-2);g.add(ex);mesh(new THREE.CylinderGeometry(.13,.13,.6,12),M(0xD2322A),0,.45,0,ex);box(.12,.12,.12,0x2A2A2A,0,.82,0,ex);box(.5,.6,.1,0xD2322A,0,1.5,0,ex);
  for(let i=0;i<4;i++){const c=mesh(new THREE.CylinderGeometry(.18,.24,1,10,1,true),M(0xFFFFFF,{side:THREE.DoubleSide}),-6.35,1.7,1+i*.55,g);box(.04,.1,.1,0x8A8E92,-6.4,2.2,1+i*.55,g);}
  [[-3.6,-4.6],[3.6,-4.6]].forEach(([x,z])=>{[-.7,.7].forEach(d=>{box(.12,.18,.06,0xF2C81A,x+d,.98,z+.25,g);box(.03,.12,.03,0x8A8E92,x+d+.15,1.0,z+.2,g);});});
  [[-3.6,-6.1,0],[3.6,-6.1,1]].forEach(([x,z,i])=>{const s=student({coat:true,goggles:true,skin:i});s.position.set(x+(i?.5:-.4),0,z+.75);s.rotation.y=Math.PI;g.add(s);});}
const _tpl=template;
template=function(name,g){_tpl(name,g);if(name==='science_lab')labExtras(g);if(name==='corridor'){const sg=new THREE.Group();g.add(sg);const t=ctex(256,64,(c,W,H)=>{c.fillStyle='#F4F4EF';c.fillRect(0,0,W,H);c.fillStyle='#1A4AA8';c.font='bold 40px '+FONT2;c.textAlign='center';c.fillText('科學實驗室 2',W/2,46);});cpanel(g,1.4,.35,t,-.4,2.5,-7.1,0);}};

E.kits.school_campus={
  build(W,stagePos){
    const g=new THREE.Group();E.scene.add(g);const r=E.rng(31);
    const gr=mesh(new THREE.PlaneGeometry(260,260),M(0x7DAE5E),0,0,-25,g);gr.rotation.x=-Math.PI/2;
    stagePos.forEach((p,i)=>{const fl=mesh(new THREE.PlaneGeometry(14,13),M(0xA3AE9C),p.x,.012,p.z-1.2,g);fl.rotation.x=-Math.PI/2;
      for(let k=-6;k<=6;k+=1.2)box(.02,.004,13,0x8E9A88,p.x+k,.016,p.z-1.2,g);
      const lg=new THREE.Group();lg.position.copy(p);g.add(lg);template(W.stages[i].template,lg);});
    for(let i=0;i<stagePos.length;i++){const a=i===0?new THREE.Vector3(0,0,14):stagePos[i-1],b=stagePos[i];const d=b.clone().sub(a),len=d.length();
      const gg=new THREE.Group();gg.position.set((a.x+b.x)/2,.01,(a.z+b.z)/2);gg.rotation.y=Math.atan2(d.x,d.z);g.add(gg);mesh(new THREE.PlaneGeometry(3,len),M(0xB0A894),0,0,0,gg).rotation.x=-Math.PI/2;}
    const near=(x,z)=>{for(let i=0;i<stagePos.length;i++){const p=stagePos[i];if(Math.abs(x-p.x)<9&&Math.abs(z-p.z+1)<9)return true;const a=i===0?{x:0,z:14}:stagePos[i-1],b=p;const dx=b.x-a.x,dz=b.z-a.z,L=dx*dx+dz*dz;let t=((x-a.x)*dx+(z-a.z)*dz)/L;t=Math.max(0,Math.min(1,t));if(Math.hypot(x-(a.x+t*dx),z-(a.z+t*dz))<4)return true;}return false;};
    let n=0;while(n<70){const x=-50+r()*100,z=-80+r()*100;if(near(x,z))continue;const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(.9+r()*.8);g.add(t);cyl(.13,.18,1.1,0x7A5236,0,.55,0,t,6);mesh(new THREE.IcosahedronGeometry(.95,0),M([0x5FA34E,0x6FB35A,0x4E9348][n%3],{flatShading:true}),0,1.75,0,t);n++;}
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2,d=64+r()*16,h=8+r()*8,w=12+r()*10;const bd=new THREE.Group();bd.position.set(Math.cos(a)*d,0,Math.sin(a)*d-28);bd.rotation.y=-a+Math.PI/2;g.add(bd);
      box(w,h,6,0xF0E4C8,0,h/2,0,bd);for(let k=1;k<h/2.6;k++)box(w-.6,.7,6.06,0x7FB0D6,0,k*2.6,0,bd);box(w+.4,.4,6.4,0xC8452F,0,h+.2,0,bd);}
    const tr=mesh(new THREE.TorusGeometry(22,1.4,4,40),M(0xC8573A),30,.02,26,g);tr.rotation.x=-Math.PI/2;tr.scale.set(1.4,1,.04);
    const pole=cyl(.08,.1,9,0xD9DDE0,-12,4.5,10,g);box(1.6,1,.03,0xC8452F,-11.2,8.3,10,g);
    const ap=V(30,0,30);this._assembly=ap;const ag=new THREE.Group();ag.position.copy(ap);E.scene.add(ag);const ct=new THREE.Mesh(new THREE.PlaneGeometry(22,14),M(0xC8573A));ct.rotation.x=-Math.PI/2;ct.position.y=.02;ag.add(ct);for(let i=-1;i<=1;i+=2){box(.1,3,.1,0xD9DDE0,i*9,1.5,0,ag);box(1.2,.8,.05,0xF4F4EF,i*8.6,3,0,ag);}
    const as=ctex(256,128,(c,W,H)=>{c.fillStyle='#1E9A55';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 44px '+FONT2;c.textAlign='center';c.fillText('集合點',W/2,60);c.font='bold 26px '+FONT2;c.fillText('ASSEMBLY POINT',W/2,104);});const sp=new THREE.Group();sp.position.set(0,0,-3);ag.add(sp);box(.08,2.2,.08,0x8A9098,0,1.1,0,sp);cpanel(sp,1.4,.7,as,0,2.2,.05,0);
    for(let r=0;r<2;r++)for(let i=0;i<6;i++){const s=student({skin:i%2});s.position.set(-4+i*1.4,0,-1+r*1.2);ag.add(s);}
    this._smoke=stagePos[3]?stagePos[3].clone():null;
    if(W.stages[0].hotspots&&W.stages[0].hotspots.some(h=>h.prop==='eyewash_station')){const vp=stagePos[0].clone().add(V(-2.4,0,-1.6));const v=student({skin:1});v.position.copy(vp);v.rotation.y=.6;E.scene.add(v);REF._victim=v;}
    return {};
  },

  interact:async function(name,ctx){const CH=ctx.CH,P=CH.player;
    if(name==='eyewash'){const ew=REF.eyewash_station;const victim=REF._victim;
      if(ctx.choice!=='correct'){E.emote(CH.companion,'shake');await E.say('companion','他痛得更厲害了！陳老師快過來！');E.emote(CH.mentor,'hop');}
      await cstep(ctx.choice==='correct'?'mentor':'mentor','扶同學到洗眼器前，用掌心按下推板。',['按下推板']);E.actions([]);
      const nz=cwpos(ew).add(V(0,1.12,0));let on=true;const spray=()=>{if(!on)return;[-.1,.1].forEach(dx=>cburst(nz.clone().add(V(dx,0,0)),0x8FD0F2,3,.25,3,.7));setTimeout(spray,60);};spray();
      E.emote(CH.companion,'hop');E.floatBubble(CH.companion,'我去找老師！',2200);const ck=document.createElement('p');ck.className='status';ck.style.fontSize='24px';ck.style.color='var(--paper)';E.actions([ck]);
      await ctween(5,k=>{const s=Math.round(900*(1-k));ck.textContent='持續沖洗　'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');});on=false;
      await E.say('mentor','沖足十五分鐘，眼睛裡的溶液就沖乾淨了。做得好。');return;}
    if(name==='bunsen'){const bn=REF.burner_bench;const y=bn.userData.yellow,b=bn.userData.blue,col=bn.userData.collar;const bw=cwpos(col);
      const cam0=E.camera.position.clone(),look0=E.cam.look.clone();await E.camTo(bw.clone().add(V(.75,1.05,1.75)),bw.clone().add(V(0,-.12,0)),1.4);
      const hole=E.box(.03,.035,.02,0x111111,0,0,.052,col);let air=0,arrowsOn=true;
      const set=a=>{air=a;y.material.opacity=Math.max(0,1-a*1.3);y.scale.set(1+.1*(1-a),1.15-a*.55,1);b.material.opacity=Math.max(0,a*1.25-.25);b.scale.set(1,.6+a*.7,1);col.rotation.y=a*2.4;hole.scale.x=.2+a*2.2;};set(0);
      const spawn=()=>{if(!arrowsOn)return;if(Math.random()<air*1.4){const m=new THREE.Mesh(new THREE.ConeGeometry(.012,.05,6),new THREE.MeshBasicMaterial({color:0x8FD8FF,transparent:true}));const a2=Math.random()*6.28;m.position.copy(bw).add(V(Math.cos(a2)*.35,(Math.random()-.5)*.1,Math.sin(a2)*.35));m.lookAt(bw);m.rotateX(Math.PI/2);E.scene.add(m);
        CFX.push({m,v:bw.clone().sub(m.position).multiplyScalar(2.2),g:0,life:.45});}setTimeout(spawn,60);};spawn();
      const dish=new THREE.Group();const dm=new THREE.MeshLambertMaterial({color:0xF4F4F0});const dsh=new THREE.Mesh(new THREE.SphereGeometry(.12,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),dm);dish.add(dsh);dish.position.copy(bw).add(V(0,.62,0));dish.visible=false;E.scene.add(dish);
      const info=a=>'<div class="bn"><div><span>空氣孔</span><b>'+(a<.3?'關閉':a<.7?'半開':'全開')+'</b></div><div><span>進入的空氣（氧氣）</span><b>'+(a<.3?'少':a<.7?'中':'充足')+'</b></div><div><span>燃燒</span><b>'+(a<.7?'不完全':'完全')+'</b></div><div><span>火焰</span><b style="color:'+(a<.7?'#F2B040':'#7AB8FF')+'">'+(a<.3?'黃色、搖晃、明亮':a<.7?'黃藍混合':'藍色、穩定、有內焰')+'</b></div><div><span>溫度</span><b>'+(a<.7?'較低':'較高')+'</b></div><div><span>煙灰（碳粒）</span><b>'+(a<.7?'會產生':'沒有')+'</b></div></div>';
      const sootTest=async()=>{dish.visible=true;dm.color.setHex(0xF4F4F0);await ctween(1.4,k2=>{if(air<.7)dm.color.setRGB(.96-.8*k2*(1-air),.96-.8*k2*(1-air),.94-.8*k2*(1-air));});};
      // step 1: closed air hole, soot test
      await new Promise(async res=>{E.actions([]);await E.showLine('mentor','本生燈的關鍵在底部的「空氣孔」。現在空氣孔是關上的，看看火焰，再把蒸發皿放在火焰上方。');const d=document.createElement('div');d.innerHTML=info(0);E.actions([d.firstChild,E.btn('next','放上蒸發皿',async()=>{E.actions([]);await sootTest();res();})]);});
      E.emote(CH.companion,'shake');await E.say('companion','蒸發皿底黑了！是煙灰。');await E.say('mentor','空氣孔關上，進入的氧氣不足，煤氣燃燒不完全，產生碳粒，就是煙灰。黃色火焰溫度也較低。');dish.visible=false;
      // step 2: open the air hole
      await new Promise(async res=>{E.actions([]);await E.showLine('mentor','慢慢轉動套環，打開空氣孔。留意空氣怎樣被吸進去，火焰又有甚麼變化。');const w=document.createElement('div');
        w.innerHTML='<div class="sl"><div class="slh"><span>轉動套環：空氣孔開合</span><b>關閉</b></div><input type="range" min="0" max="100" value="0" aria-label="空氣孔開合"></div><div class="bnw"></div>';
        const inp=w.querySelector('input'),lab=w.querySelector('.slh b'),pan=w.querySelector('.bnw');pan.innerHTML=info(0);const ok=E.btn('next','再放上蒸發皿測試',async()=>{E.actions([]);await sootTest();res();});ok.disabled=true;
        inp.addEventListener('input',()=>{const a=inp.value/100;set(a);lab.textContent=a<.3?'關閉':a<.7?'半開':'全開';pan.innerHTML=info(a);ok.disabled=a<.7;});E.actions([w,ok]);});
      E.emote(CH.companion,'hop');await E.say('companion','這次蒸發皿乾乾淨淨！火焰也變成藍色了。');dish.visible=false;
      await E.say('mentor','空氣孔打開，吸入的空氣多了，氧氣充足，煤氣完全燃燒：火焰變藍、溫度較高、不產生煙灰，最適合加熱。');
      const q={question:'為甚麼打開空氣孔後，火焰會變成藍色？',options:['吸入的空氣（氧氣）較多，煤氣燃燒完全','煤氣的供應增加了','火焰的溫度降低了','空氣孔把火焰的黃色過濾掉了'],answer:0};const dis=new Set();
      for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1||i===q.answer){await E.say('gatekeeper',(i===-1?'答案是：吸入的空氣（氧氣）較多，煤氣燃燒完全。':'正確。')+'影響火焰的核心因素，是進入燈管的空氣（氧氣）多少。');break;}dis.add(i);E.emote(CH.gatekeeper,'shake');}
      arrowsOn=false;E.scene.remove(dish);await E.camTo(cam0,look0,1.2);return;}
    if(name==='heat'){const tr=REF.tube_rack,bn=REF.burner_bench;const t=new THREE.Group();t.position.copy(cwpos(bn.userData.blue)).add(V(0,.25,0));E.scene.add(t);
      const tube=mesh(new THREE.CylinderGeometry(.04,.04,.42,10),new THREE.MeshPhongMaterial({color:0xDCF0F6,transparent:true,opacity:.5}),0,0,0,t);const liq=mesh(new THREE.CylinderGeometry(.035,.035,.12,10),M(0x9FD8F2),0,-.14,0,t);
      if(ctx.choice==='correct'){await ctween(.6,k=>{t.rotation.z=-.6*k;});for(let i=0;i<10;i++){cburst(cwpos(liq).add(V(0,.06,0)),0xFFFFFF,2,.05,-1,.4,new THREE.SphereGeometry(.012,5,4));t.rotation.z=-.6+Math.sin(i)*.12;await ctween(.15,()=>{});}await E.say('narrator','試管傾斜、輕輕搖動，溶液均勻受熱，平穩地沸騰。');}
      else{await ctween(.5,k=>{t.rotation.x=-.4*k;});await ctween(1,()=>{});cburst(cwpos(liq).add(V(0,.2,0)),0x9FD8F2,26,2.4,3,1);E.flash(false,0x8A3A1E);E.emote(CH.companion,'shake');await E.say('narrator','嘭！溶液突然暴沸，從試管口噴了出來！');}
      E.scene.remove(t);return;}
    if(name==='sweep'){const gl=REF.broken_glass,bp=REF.broom_pan,bin=REF.glass_bin;const shards=gl.children.filter(c=>c.geometry&&c.geometry.type==='TetrahedronGeometry');
      if(ctx.choice!=='correct'){E.emote(CH.companion,'shake');await E.say('companion','小心！手指被割傷了……還是用掃帚吧。');}
      const pan=cwpos(bp).add(V(.4,.05,.1));const groups=[shards.filter((s,i)=>i%3===0),shards.filter((s,i)=>i%3===1),shards.filter((s,i)=>i%3===2)];
      for(let r=0;r<3;r++){await cstep('mentor',r===0?'用掃帚把碎玻璃掃進垃圾鏟，一下一下來。':'繼續掃。',['掃一下']);E.actions([]);const br=bp.children[0];await ctween(.35,k=>{br.rotation.z=.22+Math.sin(k*Math.PI)*.5;});
        await ctween(.4,k=>groups[r].forEach(s=>{if(!s.userData.p0)s.userData.p0=cwpos(s);const w=s.userData.p0.clone().lerp(pan,k);s.parent.worldToLocal(w);s.position.copy(w);}));}
      await cstep('companion','全部掃好了！倒進哪裡？',['倒進碎玻璃箱']);E.actions([]);const bt=cwpos(bin).add(V(0,.8,0));await ctween(.6,k=>shards.forEach(s=>{const w=pan.clone().lerp(bt,k);w.y+=Math.sin(k*Math.PI)*.6;s.parent.worldToLocal(w);s.position.copy(w);}));shards.forEach(s=>s.visible=false);
      E.emote(CH.gatekeeper,'hop');await E.say('mentor','碎玻璃放進專用箱，倒垃圾的工友就不會被割傷。');return;}
    if(name==='evacuate'){const ex=REF.exit_sign,lift=REF.lift_door;
      if(ctx.choice!=='correct'){const d=lift.userData.doors;E.env.dim=.8;await E.say('narrator','升降機門關上……燈突然熄滅了！');E.env.dim=0;E.emote(CH.mentor,'hop');await E.say('mentor','快出來！火警時升降機可能停電，把人困住。我們走樓梯！');}
      const ep=cwpos(ex).setY(0).add(V(0,0,1));P.target.copy(ep);await new Promise(r=>{P.onArrive=r;setTimeout(r,4000);});
      await cstep('mentor','跟著綠色的走火通道指示，沿樓梯落到操場集合點。',['往集合點出發']);E.actions([]);
      const ap=this._assembly;const cam0=E.camera.position.clone(),look0=E.cam.look.clone();
      const party=[P,CH.mentor,CH.companion,CH.rival,CH.gatekeeper];const saved=party.map(c=>c.root.position.clone());
      party.forEach((c,i)=>{c.root.position.copy(ap).add(V(-2+i*1,0,1.5));c.target.copy(c.root.position);});E.setEnv('campus_noon');await E.camTo(ap.clone().add(V(0,6,12)),ap.clone().add(V(0,1,0)),2.2);
      for(const c of [P,CH.companion,CH.rival]){E.emote(CH.gatekeeper,'hop');await ctween(.5,()=>{});E.emote(c,'hop');await ctween(.4,()=>{});}
      await E.say('gatekeeper','點名完畢，全班都安全到達集合點。');party.forEach((c,i)=>{c.root.position.copy(saved[i]);c.target.copy(saved[i]);});E.setEnv('campus_alarm');await E.camTo(cam0,look0,1.6);return;}
  },
  prop(type){const g=new THREE.Group();const h=(props[type]||props.poster)(g);REF[type]=g;return {g,h};},
  onFrame(dt){for(let i=CFX.length-1;i>=0;i--){const f=CFX[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;f.m.material.opacity=Math.max(0,Math.min(1,f.life*2));if(f.life<=0){f.m.parent.remove(f.m);CFX.splice(i,1);}}
    if(E.env.tgt===E.ENV.campus_alarm&&this._smoke){this._st=(this._st||0)+dt;if(this._st>.15){this._st=0;cburst(this._smoke.clone().add(V((Math.random()-.5)*12,2.8,-5)),0x6A6A6A,1,.2,-.3,2.5,new THREE.SphereGeometry(.25,6,4));}}
    if(E.env.tgt===E.ENV.campus_alarm){alarmT+=dt;if(alarmT>1.1){alarmT=0;E.flash(false,0xD8322A);E.env.pulse=.55;}}}
};
})();
