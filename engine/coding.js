/* Coding mode: block programming of a delivery robot on a Hong Kong street grid */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const SC=GM.scoring,BL=C.blocks,CELL=W.cell,DIRS=[[0,1],[1,0],[0,-1],[-1,0]];
const st={lv:-1,score:0,hints:0,hintLv:0,prog:[],target:null,sel:null,running:false,results:[],yaw:W.camera.yaw,pitch:W.camera.pitch,drag:null,tick:0};
window.__code=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=0;
E.ENV.street={sky:0xA8D0EC,hs:0xF6F2EA,hg:0x6A6A62,hi:.76,sc:0xFFF2DC,si:.8,sp:[12,24,14]};E.setEnv('street',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const R=E.rng(41);
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function panel(g,w,h,t,x,y,z,ry,basic){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map:t}):new THREE.MeshLambertMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}
const N=6,half=(N-1)/2;
const cellPos=(x,y)=>V((x-half)*CELL,0,(half-y)*CELL);

/* ---------- static street ---------- */
(function(){const g=E.scene;
  const asp=tex(256,256,(c,w,h)=>{c.fillStyle='#4A4E54';c.fillRect(0,0,w,h);for(let i=0;i<1200;i++){c.fillStyle=R()<.5?'#42464C':'#54585E';c.fillRect(R()*w,R()*h,2,2);}c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=3;c.strokeRect(2,2,w-4,h-4);});
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(N*CELL,N*CELL),new THREE.MeshLambertMaterial({map:asp}));asp.wrapS=asp.wrapT=THREE.RepeatWrapping;asp.repeat.set(N,N);gr.rotation.x=-Math.PI/2;gr.position.y=.01;g.add(gr);gr.userData.noFade=true;
  const out=mesh(new THREE.PlaneGeometry(120,120),M(0x8A8E86),0,-.02,0,g);out.rotation.x=-Math.PI/2;
  const sw=tex(128,128,(c,w,h)=>{c.fillStyle='#C8C2B4';c.fillRect(0,0,w,h);c.strokeStyle='#B0AA9C';c.lineWidth=2;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*32,0);c.lineTo(i*32,h);c.stroke();c.beginPath();c.moveTo(0,i*32);c.lineTo(w,i*32);c.stroke();}});sw.wrapS=sw.wrapT=THREE.RepeatWrapping;
  const S2=N*CELL+4;[[0,-S2/2+1,S2,2],[0,S2/2-1,S2,2],[-S2/2+1,0,2,S2-4],[S2/2-1,0,2,S2-4]].forEach(([x,z,w,d])=>{const t=sw.clone();t.needsUpdate=true;t.repeat.set(w/2,d/2);const m=new THREE.Mesh(new THREE.BoxGeometry(w,.18,d),new THREE.MeshLambertMaterial({map:t}));m.position.set(x,.09,z);g.add(m);});
  const shops=['金記燒臘','大藥房','茶餐廳','五金','押','涼茶','士多','麵家','鐘錶','髮型屋'];const col=[0xE6D6B4,0xD8C8A8,0xC8D4D8,0xE8C8B8,0xD0D8C0,0xF0E4C8];
  const win=tex(64,128,(c,w,h)=>{c.fillStyle='#D8D2C4';c.fillRect(0,0,w,h);for(let i=0;i<3;i++)for(let j=0;j<6;j++){c.fillStyle=R()<.3?'#6A8AA8':'#3E4A5A';c.fillRect(6+i*20,8+j*20,14,12);c.fillStyle='#A8A49A';c.fillRect(4+i*20,20+j*20,18,2);}});win.wrapS=win.wrapT=THREE.RepeatWrapping;
  let si=0;const ring=S2/2+2.6;for(let k=-3;k<=3;k++)[[k*3.2,-ring,0],[k*3.2,ring,Math.PI],[-ring,k*3.2,Math.PI/2],[ring,k*3.2,-Math.PI/2]].forEach(([x,z,ry],j)=>{if(Math.abs(k)===3&&j>1)return;const h=7+R()*6;const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=ry;g.add(b);
    const t=win.clone();t.needsUpdate=true;t.repeat.set(1,h/6);const bd=new THREE.Mesh(new THREE.BoxGeometry(3.1,h,3),new THREE.MeshLambertMaterial({map:t,color:col[(si)%6]}));bd.position.y=h/2;b.add(bd);box(3.1,2.4,.1,0x3A3E44,0,1.2,1.52,b);
    box(3.2,.3,.6,[0xC8452F,0x2E7D62,0x3A6FB0][si%3],0,2.6,1.8,b);if(si%2===0){const name=shops[si%shops.length];const nt=tex(96,320,(c,w,h)=>{c.fillStyle=['#C8221A','#1A4AA8','#1E7A4A'][si%3];c.fillRect(0,0,w,h);c.fillStyle='#FFE8A0';c.font='bold 60px '+FONT;c.textAlign='center';[...name].slice(0,4).forEach((ch,i)=>c.fillText(ch,w/2,70+i*72));});
      const sg=panel(b,.5,1.7,nt,1.3,4.4,1.75,0,true);sg.rotation.y=Math.PI/2;sg.position.x=1.6;}si++;});
  for(let i=0;i<4;i++){const h=24+R()*14;const t=win.clone();t.needsUpdate=true;t.repeat.set(2,h/6);const b=new THREE.Mesh(new THREE.BoxGeometry(7,h,7),new THREE.MeshLambertMaterial({map:t}));b.position.set(-18+i*12,h/2,-30-R()*6);g.add(b);}
})();

function onFrame(dt,t){if(!st.running&&robot)robot.position.y=Math.sin(t*3)*.03;const a=robot.userData.arrow;if(a){a.visible=robot.userData.edge.visible=!st.running;const k=.5+.5*Math.sin(t*4);a.position.z=.55+k*.18;a.material.opacity=.7+.3*k;}}
/* robot */
const robot=new THREE.Group();E.scene.add(robot);
(function(){box(.9,.55,.8,0xF4F4EF,0,.5,0,robot);box(.92,.12,.82,0x2E7DC8,0,.3,0,robot);const face=tex(128,64,(c,w,h)=>{c.fillStyle='#1A2430';c.fillRect(0,0,w,h);c.fillStyle='#7AE8FF';c.beginPath();c.arc(40,30,10,0,7);c.arc(88,30,10,0,7);c.fill();c.fillRect(46,46,36,4);});
  panel(robot,.7,.35,face,0,.55,.41,0,true);[[-.45,-.28],[.45,-.28],[-.45,.28],[.45,.28]].forEach(([x,z])=>{const w=mesh(new THREE.CylinderGeometry(.16,.16,.12,14),M(0x2A2A2A),x,.16,z,robot);w.rotation.z=Math.PI/2;});
  const pc=box(.55,.35,.5,0xB98A4A,0,.95,-.05,robot);box(.56,.06,.08,0xE8D8A0,0,1.13,-.05,robot);box(.03,.6,.03,0x8A8E92,.3,1.0,-.3,robot);mesh(new THREE.SphereGeometry(.06,8,6),M(0xF2C81A,{emissive:0x8A6A00}),.3,1.32,-.3,robot);robot.userData.lamp=robot.children[robot.children.length-1];
  const sh=new THREE.Shape();sh.moveTo(-.16,0);sh.lineTo(.16,0);sh.lineTo(.16,.45);sh.lineTo(.38,.45);sh.lineTo(0,.85);sh.lineTo(-.38,.45);sh.lineTo(-.16,.45);sh.closePath();
  const arrow=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0xFFD23A,transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false}));arrow.rotation.x=Math.PI/2;arrow.position.set(0,.06,.55);arrow.renderOrder=4;arrow.userData.noFade=true;robot.add(arrow);robot.userData.arrow=arrow;
  const edge=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0x6A4A00,side:THREE.DoubleSide}));edge.rotation.x=Math.PI/2;edge.position.set(0,.05,.53);edge.scale.setScalar(1.12);robot.add(edge);robot.userData.edge=edge;})();
const RB={x:0,y:0,d:0};
function placeRobot(x,y,d){RB.x=x;RB.y=y;RB.d=d;robot.position.copy(cellPos(x,y));robot.rotation.y=Math.PI-d*Math.PI/2;facing();}
const DIRNAME=['北 ↑','東 →','南 ↓','西 ←'];function facing(){const el=$('facing');if(el)el.textContent='機械人面向：'+DIRNAME[RB.d];}
const dirYaw=d=>-d*Math.PI/2;

/* characters on the south pavement */
Object.entries(C.npc_slots).forEach(([s,d],i)=>{const c=E.makeChar(s,d.character_id,d.costume);c.root.position.set(-4.5+i*3,0,N*CELL/2+1.6);c.target.copy(c.root.position);c.root.rotation.y=Math.PI;});
const CH=E.chars;E.lampValue=()=>Math.min(1,.2+st.score/160);

/* camera orbit */
E.cam.idle=()=>{const d=E.portrait?W.camera.dist_portrait:W.camera.dist,cp=Math.cos(st.pitch);E.camera.position.set(Math.sin(st.yaw)*cp*d,Math.sin(st.pitch)*d,Math.cos(st.yaw)*cp*d+(E.portrait?2:0));E.cam.look.set(0,0,E.portrait?2.2:0);};
const cv=E.canvas;cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,yaw:st.yaw,p:st.pitch};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{const d=st.drag;if(!d)return;st.yaw=d.yaw-(e.clientX-d.x)*.006;st.pitch=Math.max(.35,Math.min(1.45,d.p+(e.clientY-d.y)*.004));});
['pointerup','pointercancel'].forEach(k=>cv.addEventListener(k,()=>st.drag=null));

/* ---------- level objects ---------- */
let LG=null,light=null;const goalEls=[];
function obstacle(g,kind,p){const o=new THREE.Group();o.position.copy(p);g.add(o);
  if(kind==='barrier'){for(let i=-1;i<=1;i+=2)box(.08,.9,.08,0x8A8E92,i*.8,.45,0,o);for(let k=0;k<4;k++)box(.4,.4,.06,k%2?0xFFFFFF:0xF27A1A,-.6+k*.4,.7,0,o);mesh(new THREE.ConeGeometry(.22,.6,12),M(0xF27A1A),.5,.3,.5,o);}
  else if(kind==='stall'){box(1.6,.8,1.1,0x7A8088,0,.4,0,o);const aw=box(1.8,.06,1.4,0xD8322A,0,1.7,0,o);aw.rotation.x=.12;[-.8,.8].forEach(x=>box(.06,1.6,.06,0x2A2A2A,x,.85,.6,o));for(let i=0;i<6;i++)mesh(new THREE.SphereGeometry(.12,8,6),M([0xF2A23A,0x6AB84A,0xD8322A][i%3]),-.5+(i%3)*.5,.9,-.2+Math.floor(i/3)*.4,o);}
  else if(kind==='minibus'){box(1.7,1.1,.95,0xF4ECD8,0,.75,0,o);box(1.72,.18,.97,0xC8221A,0,1.35,0,o);box(1.4,.35,.98,0x2A3A4A,.05,1.0,0,o);[[-.55,-.42],[.55,-.42],[-.55,.42],[.55,.42]].forEach(([x,z])=>{const w=mesh(new THREE.CylinderGeometry(.2,.2,.1,12),M(0x1A1A1A),x,.2,z,o);w.rotation.x=Math.PI/2;});}
  else if(kind==='rail'){for(let i=-1;i<=1;i++)box(.07,.9,.07,0x5A8A5A,i*.8,.45,0,o);box(1.8,.06,.06,0x5A8A5A,0,.85,0,o);box(1.8,.06,.06,0x5A8A5A,0,.45,0,o);}
  else{mesh(new THREE.CylinderGeometry(.6,.6,.5,14),M(0x9A9488),0,.25,0,o);mesh(new THREE.IcosahedronGeometry(.55,0),M(0x4E8A3E,{flatShading:true}),0,.8,0,o);}
  o.rotation.y=(R()-.5)*.3;return o;}
function buildLevel(L){if(LG)E.scene.remove(LG);goalEls.forEach(a=>{a.el.remove();E.anchors.splice(E.anchors.indexOf(a),1);});goalEls.length=0;LG=new THREE.Group();E.scene.add(LG);light=null;
  const kinds=L.id==='L3'?['barrier']:L.id==='L4'?['rail']:['stall','minibus','planter','barrier'];
  L.obstacles.forEach((o,i)=>obstacle(LG,kinds[i%kinds.length],cellPos(o[0],o[1])));
  if(L.crossing){const cp=cellPos(...L.crossing);for(let i=0;i<5;i++)box(.3,.02,1.7,0xF4F4EF,cp.x-.8+i*.4,.03,cp.z,LG);const pole=new THREE.Group();pole.position.copy(cp).add(V(1.1,0,.9));LG.add(pole);box(.08,2.4,.08,0x3A3E44,0,1.2,0,pole);box(.34,.7,.26,0x1A1A1A,0,2.5,0,pole);
    const red=mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0x5A1A1A}),0,2.7,.14,pole),grn=mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0x1A3A1A}),0,2.32,.14,pole);light={red,grn};}
  L.goals.forEach((gp,i)=>{const p=cellPos(gp[0],gp[1]);const r=mesh(new THREE.TorusGeometry(.7,.07,8,28),new THREE.MeshBasicMaterial({color:0xF2C14E}),p.x,.08,p.z,LG);r.rotation.x=Math.PI/2;r.userData.noFade=true;
    const el=document.createElement('div');el.className='glabel';el.textContent=L.goals.length>1?(i+1)+' 號點':'收件點';$('spots').appendChild(el);const a={el,pos:p.clone().add(V(0,1.4,0))};E.anchors.push(a);goalEls.push(a);a.ring=r;});
  placeRobot(...L.start);}
function isRed(L,t){const lt=L.light;if(!lt)return false;const per=lt.red+lt.green,p=t%per;return lt.start_red?p<lt.red:p>=lt.green;}
function showLight(L){if(!light)return;const r=isRed(L,st.tick);light.red.material.color.setHex(r?0xFF3A2A:0x4A1A1A);light.grn.material.color.setHex(r?0x1A3A1A:0x3AFF6A);}

/* ---------- editor ---------- */
const count=p=>p.reduce((s,b)=>s+1+(b.t==='repeat'?count(b.body):0),0);
function render(){const L=C.levels[st.lv];const box2=$('prog');box2.innerHTML='';const n=count(st.prog);
  const list=(arr,parent,depth)=>{const ul=document.createElement('ol');ul.className='plist'+(depth?' inner':'');
    if(!arr.length){const li=document.createElement('li');li.className='empty';li.textContent=depth?'（點擊上方積木加入這個重複）':'（點擊上方積木開始編寫）';ul.appendChild(li);}
    arr.forEach((b,i)=>{const li=document.createElement('li');li.className='blk b-'+b.t+(st.sel===b?' sel':'')+(b===st.running&&false?'':'');li.dataset.id=b.id;
      if(b.t==='repeat'){li.innerHTML='<div class="rh"><span>重複</span><button class="nb" data-a="dec" aria-label="減少次數">−</button><b>'+b.n+'</b><button class="nb" data-a="inc" aria-label="增加次數">＋</button><span>次</span></div>';
        li.querySelector('[data-a=dec]').onclick=e=>{e.stopPropagation();b.n=Math.max(2,b.n-1);render();};li.querySelector('[data-a=inc]').onclick=e=>{e.stopPropagation();b.n=Math.min(9,b.n+1);render();};
        const inner=list(b.body,b,depth+1);if(st.target===b)inner.classList.add('target');li.appendChild(inner);}
      else li.innerHTML='<span>'+BL[b.t]+'</span>';
      li.onclick=e=>{e.stopPropagation();if(st.running)return;st.sel=st.sel===b?null:b;if(b.t==='repeat')st.target=st.sel?b:null;render();};ul.appendChild(li);});return ul;};
  box2.appendChild(list(st.prog,null,0));
  $('bcount').textContent='積木：'+n+(L.max_blocks?' / '+L.max_blocks:'');$('bcount').classList.toggle('over',!!(L.max_blocks&&n>L.max_blocks));
  $('tgt').textContent=st.target?'正在加入：重複 '+st.target.n+' 次 之內':'正在加入：主程式';$('outBtn').hidden=!st.target;$('delBtn').disabled=!st.sel||st.running;
  $('runBtn').disabled=st.running||!n||!!(L.max_blocks&&n>L.max_blocks);
  document.querySelectorAll('.pal').forEach(b=>b.disabled=st.running);}
let uid=1;const mk=t=>t==='repeat'?{id:uid++,t,n:3,body:[]}:{id:uid++,t};
function add(t){if(st.running)return;const b=mk(t);(st.target?st.target.body:st.prog).push(b);if(t==='repeat'){st.target=b;st.sel=b;}render();}
function findParent(arr,b){for(const x of arr){if(x===b)return arr;if(x.t==='repeat'){const r=findParent(x.body,b);if(r)return r;}}return null;}
function del(){if(!st.sel)return;const p=findParent(st.prog,st.sel);if(p)p.splice(p.indexOf(st.sel),1);if(st.target===st.sel)st.target=null;st.sel=null;render();}
$('delBtn').onclick=del;$('clrBtn').onclick=()=>{if(st.running)return;st.prog=[];st.sel=null;st.target=null;render();};$('outBtn').onclick=()=>{st.target=null;st.sel=null;render();};
function palette(L){const p=$('pal');p.innerHTML='';L.palette.forEach(t=>{const b=document.createElement('button');b.className='pal p-'+t;b.textContent=BL[t];b.onclick=()=>add(t);p.appendChild(b);});}

/* ---------- execution ---------- */
function sleep(ms){return E.sleep(ms*(window.__fast?.15:1));}
function tween(d,fn){return new Promise(res=>{const t0=performance.now();const D=Math.max(.01,d*(window.__fast?.15:1)*1000);const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
function hl(b,on){const el=document.querySelector('.blk[data-id="'+(b&&b.id)+'"]');if(el)el.classList.toggle('run',on);}
async function exec(L){const obs=new Set(L.obstacles.map(o=>o.join(','))),goals=L.goals.map(g=>g.join(','));let gi=0;st.tick=0;showLight(L);
  const SP=GM.step_sec;
  async function runList(arr){for(const b of arr){if(b.t==='repeat'){hl(b,true);for(let k=0;k<b.n;k++){const r=await runList(b.body);if(r){hl(b,false);return r;}}hl(b,false);continue;}
      hl(b,true);st.tick++;showLight(L);
      if(b.t==='fwd'){const nx=RB.x+DIRS[RB.d][0],ny=RB.y+DIRS[RB.d][1];const from=robot.position.clone();
        if(nx<0||ny<0||nx>=N||ny>=N||obs.has(nx+','+ny)){const to=cellPos(nx,ny);await tween(SP*.5,k=>robot.position.lerpVectors(from,from.clone().lerp(to,.3),Math.sin(k*Math.PI)));hl(b,false);return nx<0||ny<0||nx>=N||ny>=N?'edge':'crash';}
        if(L.crossing&&nx===L.crossing[0]&&ny===L.crossing[1]&&isRed(L,st.tick)){hl(b,false);E.flash(false,0xD8322A);return 'red';}
        const to=cellPos(nx,ny);await tween(SP,k=>{robot.position.lerpVectors(from,to,k);robot.position.y=Math.abs(Math.sin(k*Math.PI*2))*.04;});RB.x=nx;RB.y=ny;
        if(gi<goals.length&&goals[gi]===nx+','+ny){const a=goalEls[gi];a.ring.material.color.setHex(0x5FD08A);a.el.classList.add('done');gi++;E.flash(true);}}
      else if(b.t==='left'||b.t==='right'){const y0=robot.rotation.y;RB.d=(RB.d+(b.t==='left'?3:1))%4;facing();await tween(SP*.7,k=>robot.rotation.y=y0+(b.t==='left'?1:-1)*Math.PI/2*k);}
      else if(b.t==='wait'){let waited=0;while(isRed(L,st.tick)){robot.userData.lamp.material.emissive.setHex(waited%2?0x8A6A00:0xFF3A2A);await sleep(350);st.tick++;showLight(L);waited++;}robot.userData.lamp.material.emissive.setHex(0x8A6A00);}
      await sleep(80);hl(b,false);}return null;}
  const r=await runList(st.prog);return r||(gi===goals.length?'ok':'short');}
const REASON={edge:['撞到街邊了','機械人走出了街道範圍。檢查前進的次數和轉向。'],crash:['撞到障礙物了','前面有障礙物。看看路線，在甚麼地方需要轉彎。'],red:['紅燈不可以過馬路！','機械人在紅燈時走上斑馬線。過馬路前要先「等候綠燈」。'],short:['還未送到','程式執行完了，但機械人還沒到達收件點。']};

/* ---------- flow ---------- */
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
$('assist').onclick=()=>{const L=C.levels[st.lv];if(!L||st.hintLv>=3)return;st.hintLv++;st.hints++;addScore(-SC.hint_penalty);E.bubble('李老師的提示 '+st.hintLv+'/3（扣 '+SC.hint_penalty+' 分）',L.hints[st.hintLv-1],8000);};
function toProg(arr){return arr.map(b=>b[0]==='repeat'?{id:uid++,t:'repeat',n:b[1],body:toProg(b[2])}:{id:uid++,t:b[0]});}
async function level(i){const L=C.levels[i];st.lv=i;st.hintLv=0;st.prog=L.prefill?toProg(L.prefill):[];st.sel=null;st.target=null;buildLevel(L);
  E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'張訂單　'+L.concept+'</small><h2>'+L.title+'</h2></div>',true);await Promise.race([sleep(1700),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  $('chapNo').textContent='第'+E.NUM[i]+'張訂單';$('chapTitle').textContent=L.title;palette(L);render();$('code').hidden=true;
  await E.say('mentor',L.brief);E.emote(CH.rival,'hop');await E.say('rival',L.rival);E.hideDialog();$('code').hidden=false;render();
  let tries=0,skipped=false;
  for(;;){const act=await new Promise(res=>{$('runBtn').onclick=()=>res('run');$('skipBtn').onclick=()=>res('skip');});
    if(act==='skip'){skipped=true;st.prog=toProg(SOL[L.id]);render();}
    st.running=true;render();placeRobot(...L.start);L.goals.forEach((g,k)=>{goalEls[k].ring.material.color.setHex(0xF2C14E);goalEls[k].el.classList.remove('done');});tries++;
    const r=await exec(L);st.running=false;render();
    if(r==='ok'){const n=count(st.prog),stars=skipped?0:(n<=L.ideal?3:n<=L.ideal+2?2:1);if(!skipped){addScore(SC.clear+stars*SC.star);E.emote(CH.companion,'hop');}E.emote(CH.rival,'slump');
      toast(skipped?'這是參考答案':'送到了！'+'★'.repeat(stars),skipped?'看看它怎樣用最少的積木完成。':'用了 '+n+' 個積木'+(n<=L.ideal?'，已是最精簡！':'，最精簡只需 '+L.ideal+' 個。'),'ok');st.results.push({title:L.title,stars,tries,blocks:n,skipped});break;}
    E.emote(CH.companion,'shake');if(tries===1)E.floatBubble(CH.rival,'唔關我事㗎！',2000);toast(...REASON[r],'bad');await sleep(900);placeRobot(...L.start);}
  $('code').hidden=true;await sleep(900);const q=L.check,dis=new Set();let w=0;
  for(;;){const k=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(k===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);break;}
    if(k===q.answer){addScore(Math.max(2,SC.check_first_try-w*SC.check_wrong_penalty));E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);break;}w++;dis.add(k);E.emote(CH.gatekeeper,'shake');}
  E.hideDialog();}
const SOL={L1:[['fwd'],['fwd'],['fwd'],['right'],['fwd'],['fwd']],L2:[['repeat',3,[['fwd'],['right'],['fwd'],['left']]]],L3:[['fwd'],['right'],['repeat',4,[['fwd']]],['left'],['repeat',3,[['fwd']]]],
  L4:[['fwd'],['wait'],['fwd'],['fwd'],['fwd']],L5:[['repeat',2,[['fwd']]],['right'],['repeat',3,[['fwd']]]],L6:[['repeat',4,[['fwd']]],['right'],['repeat',4,[['fwd']]]]};
async function main(){E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);$('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>物流中心</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">點擊右邊的積木編寫程式，再按「執行」。「重複」積木可以把其他積木放進去；點擊程式中的積木可以選取或刪除。拖動畫面可以轉換角度。</p><button class="primary" id="go">開始送貨</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startLv||1)-1);i<C.levels.length;i++)await level(i);
  const total=st.results.reduce((s,r)=>s+r.stars,0);const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));
  E.overlay('<div class="card"><p class="sub" style="margin:0">今日訂單完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+total+'/'+st.results.length*3+'</b>星數</div><div><b>'+st.hints+'</b>提示</div></div><ul class="review">'+
    st.results.map(r=>'<li><b>'+r.title+'</b><p>'+(r.skipped?'已看參考答案':'★'.repeat(r.stars)+'　'+r.blocks+' 個積木，執行 '+r.tries+' 次')+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">李老師：'+C.debrief+'</p><button class="primary" id="again">再送一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
