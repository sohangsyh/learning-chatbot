/* Scene kit: construction_site — Hong Kong building site with tower crane and bamboo scaffolding */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};const V=(x,y,z)=>new THREE.Vector3(x,y,z);
E.ENV.site_day={sky:0xA6CDEB,hs:0xF6F2E8,hg:0x6A6250,hi:.74,sc:0xFFF0D8,si:.82,sp:[10,24,14]};
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",sans-serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function panel(g,w,h,t,x,y,z,ry,basic){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map:t}):new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}
function rod(g,a,b,r,col){const d=b.clone().sub(a),L=d.length();const m=mesh(new THREE.CylinderGeometry(r,r,L,6),M(col),0,0,0,g);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
const SKIN=[0xF2D2B0,0xE0B890,0xC89870];
function worker(o){o=o||{};const g=new THREE.Group();
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.11,.62,0);g.add(p);box(.13,.6,.14,0x3A4A6A,0,-.3,0,p);box(.15,.1,.22,0x5A3A1A,0,-.6,.03,p);return p;});
  mesh(new THREE.CylinderGeometry(.21,.24,.7,10),M(o.shirt||0x3A6FB0),0,.98,0,g);box(.44,.5,.05,0xF2A81A,0,1.0,.2,g);box(.44,.06,.06,0xD8E0E8,0,1.0,.23,g);
  const arms=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.27,1.28,0);g.add(a);box(.1,.55,.1,o.shirt||0x3A6FB0,0,-.26,0,a);return a;});
  mesh(new THREE.SphereGeometry(.18,12,10),M(SKIN[Math.floor(Math.random()*3)]),0,1.5,0,g);
  const hc=o.hat||0xF2C81A;const d=mesh(new THREE.SphereGeometry(.2,14,8,0,Math.PI*2,0,Math.PI/2),M(hc),0,1.57,0,g);d.scale.y=.85;mesh(new THREE.CylinderGeometry(.25,.25,.02,16),M(hc),0,1.57,0,g);
  if(o.carry)box(.9,.08,.08,0x8A8E92,.1,1.5,.25,g);
  g.scale.setScalar(1.12);g.userData={legs,arms};return g;}
const walkers=[];

E.kits.construction_site={build(W){
  const S={};const r=E.rng(7);const g=new THREE.Group();E.scene.add(g);S.g=g;E.scene.fog.near=60;E.scene.fog.far=320;
  const dirt=tex(256,256,(x,w,h)=>{x.fillStyle='#A08A6A';x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){x.fillStyle=['#8A765A','#B49C7A','#7A6A50','#C4AE8C'][i%4];x.fillRect(r()*w,r()*h,2+r()*3,2+r()*3);}});dirt.wrapS=dirt.wrapT=THREE.RepeatWrapping;dirt.repeat.set(12,12);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshLambertMaterial({map:dirt}));gr.rotation.x=-Math.PI/2;g.add(gr);S.ground=gr;
  // slab with grid
  const N=W.grid.size;const slab=tex(512,512,(x,w,h)=>{x.fillStyle='#C8C4BC';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=r()<.5?'#BEBAB2':'#D2CEC6';x.fillRect(r()*w,r()*h,3,3);}
    const s=w/(N+2);x.strokeStyle='#E8A81A';x.lineWidth=5;for(let i=0;i<=N;i++){x.beginPath();x.moveTo(s+i*s,s);x.lineTo(s+i*s,s+N*s);x.stroke();x.beginPath();x.moveTo(s,s+i*s);x.lineTo(s+N*s,s+i*s);x.stroke();}
    x.fillStyle='#5A5650';x.font='bold 28px '+FONT;x.textAlign='center';x.fillText('前 FRONT',w/2,h-14);});
  const sl=new THREE.Mesh(new THREE.BoxGeometry(N+2,.3,N+2),[M(0xB8B4AC),M(0xB8B4AC),new THREE.MeshLambertMaterial({map:slab}),M(0xB8B4AC),M(0xB8B4AC),M(0xB8B4AC)]);sl.position.y=.15;g.add(sl);S.slabTop=.3;
  // rebar starter bars at slab edge
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const x=Math.round(Math.cos(a)*3.3*10)/10,z=Math.round(Math.sin(a)*3.3*10)/10;if(Math.abs(x)<3.4&&Math.abs(z)<3.4)rod(g,V(x*1.08,.3,z*1.08),V(x*1.08,1.1,z*1.08),.025,0x8A4A2A);}
  // tower crane
  const cr=new THREE.Group();cr.position.set(-6.5,0,-6.5);g.add(cr);S.crane=cr;
  box(2.2,.6,2.2,0x8A8E92,0,.3,0,cr);const H=8.5;S.craneH=H;
  [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]].forEach(([x,z])=>rod(cr,V(x,.6,z),V(x,H,z),.06,0xF2C81A));
  for(let y=1;y<H;y+=1.2){[[[-.6,-.6],[.6,-.6]],[[.6,-.6],[.6,.6]],[[.6,.6],[-.6,.6]],[[-.6,.6],[-.6,-.6]]].forEach(([a,b])=>{rod(cr,V(a[0],y,a[1]),V(b[0],y+1.2,b[1]),.03,0xF2C81A);rod(cr,V(a[0],y,a[1]),V(b[0],y,b[1]),.03,0xF2C81A);});}
  const slew=new THREE.Group();slew.position.y=H;cr.add(slew);S.slew=slew;
  box(1.6,.5,1.6,0xF2C81A,0,.25,0,slew);box(1,.9,1,0xE8ECEE,.9,.9,.6,slew);box(.8,.5,.02,0x7AA8C8,.9,1,1.11,slew);
  const JL=14;[[-.35,0],[.35,0]].forEach(([z])=>{rod(slew,V(0,.6,z),V(JL,.6,z),.05,0xF2C81A);});rod(slew,V(0,1.3,0),V(JL,.6,0),.05,0xF2C81A);
  for(let x=0;x<JL;x+=1){rod(slew,V(x,.6,-.35),V(x+1,1.3-(x+1)/JL*.7,0),.025,0xF2C81A);rod(slew,V(x,.6,.35),V(x+1,1.3-(x+1)/JL*.7,0),.025,0xF2C81A);}
  [[-.35],[.35]].forEach(([z])=>rod(slew,V(0,.6,z),V(-5,.6,z),.05,0xF2C81A));box(1.4,1,1.2,0x8A8E92,-4.4,.2,0,slew);rod(slew,V(0,2.6,0),V(-4.6,.8,0),.02,0x5A5E64);rod(slew,V(0,2.6,0),V(JL*.7,1.1,0),.02,0x5A5E64);box(.3,2,.3,0xF2C81A,0,1.6,0,slew);
  const trolley=new THREE.Group();trolley.position.set(6,.45,0);slew.add(trolley);box(.6,.25,.8,0x3A3E44,0,0,0,trolley);S.trolley=trolley;
  const cable=mesh(new THREE.CylinderGeometry(.02,.02,1,6),M(0x2A2A2A),0,-.5,0,trolley);S.cable=cable;
  const hook=new THREE.Group();trolley.add(hook);box(.3,.25,.2,0xF2C81A,0,0,0,hook);mesh(new THREE.TorusGeometry(.1,.025,6,12,Math.PI*1.4),M(0x5A5E64),0,-.2,0,hook);S.hook=hook;
  // bamboo scaffolding on half-built tower
  const tw=new THREE.Group();tw.position.set(8.5,0,-8.5);g.add(tw);
  box(7,13,6,0xBDB8AE,0,6.5,0,tw);for(let f=1;f<6;f++)box(7.1,.3,6.1,0xA8A49A,0,f*2.6,0,tw);
  const bam=0xC8A85A;for(let x=-3.8;x<=3.8;x+=.8)rod(tw,V(x,0,3.3),V(x,14,3.3),.04,bam);for(let y=.6;y<14;y+=1.1)rod(tw,V(-3.9,y,3.3),V(3.9,y,3.3),.035,bam);
  for(let z=-3;z<=3.3;z+=.8)rod(tw,V(-3.8,0,z),V(-3.8,14,z),.04,bam);for(let y=.6;y<14;y+=1.1)rod(tw,V(-3.8,y,-3.1),V(-3.8,y,3.3),.035,bam);
  const net=new THREE.MeshLambertMaterial({color:0x2E9A5A,transparent:true,opacity:.42,side:THREE.DoubleSide});const n1=new THREE.Mesh(new THREE.PlaneGeometry(7.8,9),net);n1.position.set(0,9.3,3.36);tw.add(n1);const n2=new THREE.Mesh(new THREE.PlaneGeometry(6.4,9),net);n2.position.set(-3.86,9.3,.1);n2.rotation.y=Math.PI/2;tw.add(n2);
  // hoarding
  const hd=tex(512,128,(x,w,h)=>{x.fillStyle='#2E6A9A';x.fillRect(0,0,w,h);x.fillStyle='#F4F4EF';x.fillRect(0,h-22,w,22);x.fillStyle='#fff';x.font='bold 44px '+FONT;x.fillText('建築工程進行中',22,60);x.font='bold 26px '+FONT;x.fillText('安全第一  SAFETY FIRST',22,98);x.fillStyle='#2E6A9A';x.font='bold 16px '+FONT;x.fillText('宏基建築有限公司  承建',22,h-6);});
  const hz=[[0,-13,0],[-13,0,Math.PI/2],[13,0,-Math.PI/2]];hz.forEach(([x,z,ry])=>{for(let k=-2;k<=2;k++){const off=k*5.2;panel(g,5,2.4,hd,x+(ry?0:off),1.2,z+(ry?off:0),ry);}});
  // site office container + props
  const co=new THREE.Group();co.position.set(-8.5,0,3.5);co.rotation.y=Math.PI/2;g.add(co);box(6,2.6,2.4,0x2E6AB0,0,1.3,0,co);for(let i=0;i<10;i++)box(.04,2.5,2.42,0x2A5A98,-2.8+i*.6,1.3,0,co);box(1.2,.8,.03,0x9CC6EE,-1.2,1.5,1.21,co);box(1.2,.8,.03,0x9CC6EE,1.4,1.5,1.21,co);box(.8,1.9,.04,0xE8ECEE,.2,.95,1.22,co);
  const sign=tex(256,320,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1A5FB4';x.beginPath();x.arc(w/2,110,82,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(w/2,118,46,Math.PI,0);x.fill();x.fillRect(w/2-58,116,116,12);x.fillStyle='#1A5FB4';x.font='bold 40px '+FONT;x.textAlign='center';x.fillText('必須佩戴',w/2,240);x.fillText('安全帽',w/2,290);});
  panel(co,.9,1.1,sign,2.4,1.6,1.22,0);
  for(let i=0;i<6;i++)box(.9,.25,.6,0xE8E0C8,-8,.13+i*.26,-2+((i%2)?.05:0),g);
  for(let i=0;i<10;i++)rod(g,V(5.5,.12+(i%3)*.08,1.5+i*.12),V(10.5,.12+(i%3)*.08,1.5+i*.12),.04,0x8A4A2A);
  [[4.6,4.6],[-4.6,4.8],[4.8,-4.4]].forEach(([x,z])=>{const c=new THREE.Group();c.position.set(x,0,z);g.add(c);mesh(new THREE.ConeGeometry(.22,.7,14),M(0xF27A1A),0,.35,0,c);mesh(new THREE.CylinderGeometry(.13,.16,.12,14),M(0xFFFFFF),0,.38,0,c);box(.5,.04,.5,0x2A2A2A,0,.02,0,c);});
  // surrounding HK towers
  const win=tex(64,128,(x,w,h)=>{x.fillStyle='#D8D2C4';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<10;j++){x.fillStyle=r()<.25?'#6A8AA8':'#4A5A6A';x.fillRect(4+i*15,4+j*12,10,7);x.fillStyle='#E8E4DA';x.fillRect(4+i*15,11+j*12,10,2);}});win.wrapS=win.wrapT=THREE.RepeatWrapping;
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2+.1,d=26+r()*10,h=18+r()*22,w=5+r()*3;const t=win.clone();t.needsUpdate=true;t.repeat.set(1.4,h/9);const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshLambertMaterial({map:t,color:[0xFFFFFF,0xF0E6D8,0xE4ECF2][i%3]}));b.position.set(Math.cos(a)*d,h/2,Math.sin(a)*d);g.add(b);}
  // workers
  const wk=(path,o,sp)=>{const w=worker(o);g.add(w);w.position.copy(path[0]);walkers.push({g:w,path,i:1,speed:sp||1});};
  wk([V(-9,0,6.5),V(9,0,6.5)],{shirt:0x3A6FB0},1.1);wk([V(7,0,4.5),V(7,0,-4),V(7,0,4.5)],{shirt:0xE0574A,carry:true,hat:0xF4F4EF},.8);wk([V(-7,0,-4),V(-3,0,-6),V(-7,0,-4)],{shirt:0x2E9B5E},.7);
  // per-frame
  S.update=(dt)=>{walkers.forEach(w=>{const tg=w.path[w.i];const d=tg.clone().sub(w.g.position);d.y=0;const L=d.length();
    if(L<.05){w.i=(w.i+1)%w.path.length;if(w.i===0&&w.path.length===2){w.g.position.copy(w.path[0]);w.i=1;}return;}
    w.g.position.addScaledVector(d.normalize(),Math.min(L,w.speed*dt));w.g.rotation.y=Math.atan2(d.x,d.z);w.ph=(w.ph||0)+dt*7;const s=Math.sin(w.ph)*.5;w.g.userData.legs[0].rotation.x=s;w.g.userData.legs[1].rotation.x=-s;});};
  return S;
}};
})();
