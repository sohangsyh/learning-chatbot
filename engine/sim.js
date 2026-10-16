/* Simulation-lab mode (buoyancy) built on ENG + scene kit */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const KIT=E.kits[W.scene_kit],OB=C.objects,PH=GM.physics;
const st={stage:-1,score:0,pn:0,ph:0,hints:0,records:[],hint:null,busy:false,yaw:0,drag:null,view:null};
window.__sim=st;
E.init({canvas:$('scene'),onResize:()=>{if(st.stage>=0){placeParty(st.stage,true);setView(st.stage,true);}},onFrame});
E.bindDialog();E.setEnv(W.stages[0].environment.time,true);E.parallax=.12;
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const stagePos=W.stages.map(s=>V(...s.position));
KIT.build(W,stagePos);
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const CH=E.chars;E.lampValue=()=>Math.max(0,st.stage)/C.units.length+(st.stage>=0?.1:0);
const fill=s=>(s||'').replace(/\{address\}/g,C.player.address);
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const glassMat=new THREE.MeshPhongMaterial({color:0xDFF4FA,transparent:true,opacity:.18,depthWrite:false,shininess:90});

/* ---------- apparatus ---------- */
const TOP=.92;
function bench(S){const g=new THREE.Group();g.position.copy(S);E.scene.add(g);box(2.9,.86,1.05,0xDCD6C8,0,.43,0,g);box(2.94,.06,1.09,0x2A2D30,0,.89,0,g);return g;}
function waterMat(c){return new THREE.MeshPhongMaterial({color:c||0x4FA8E0,transparent:true,opacity:.38,depthWrite:false,shininess:60});}
function makeTank(S,ox){
  const w=1.5,d=.8,h=.78,cx=S.x+ox,cz=S.z,yb=S.y+TOP+.03;const g=new THREE.Group();g.position.set(cx,yb,cz);E.scene.add(g);
  box(w+.08,.03,d+.08,0xC9D6DC,0,-.015,0,g);
  [[0,h/2,d/2,w,h,.01],[0,h/2,-d/2,w,h,.01],[w/2,h/2,0,.01,h,d],[-w/2,h/2,0,.01,h,d]].forEach(([x,y,z,a,b,c2])=>{const p=new THREE.Mesh(new THREE.BoxGeometry(a,b,c2),glassMat);p.position.set(x,y,z);g.add(p);});
  [[w/2,d/2],[-w/2,d/2],[w/2,-d/2],[-w/2,-d/2]].forEach(([x,z])=>box(.025,h,.025,0x8FA3AC,x,h/2,z,g));box(w+.05,.025,.025,0x8FA3AC,0,h,d/2,g);box(w+.05,.025,.025,0x8FA3AC,0,h,-d/2,g);
  const body=new THREE.Mesh(new THREE.BoxGeometry(w-.02,1,d-.02),waterMat());body.renderOrder=2;g.add(body);
  const sg=new THREE.PlaneGeometry(w-.02,d-.02,22,12);const surf=new THREE.Mesh(sg,new THREE.MeshPhongMaterial({color:0x8FD0F2,transparent:true,opacity:.55,depthWrite:false,shininess:120,side:THREE.DoubleSide}));surf.rotation.x=-Math.PI/2;surf.renderOrder=3;g.add(surf);
  const t={g,cx,cz,yb,w,d,base:yb+.5,level:yb+.5,liquid:1,area:w*d,body,surf,sg,basePos:sg.attributes.position.array.slice(),ripples:[],bodies:[],round:false};
  tanks.push(t);return t;
}
function makeBeaker(S,ox){
  const r=.27,h=.72,cx=S.x+ox,cz=S.z,yb=S.y+TOP+.02;const g=new THREE.Group();g.position.set(cx,yb,cz);E.scene.add(g);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28,1,true),glassMat);wall.position.y=h/2;g.add(wall);
  mesh(new THREE.TorusGeometry(r,.012,6,28),M(0xC9D6DC),0,h,0,g).rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(r,r,.02,28),M(0xC9D6DC),0,0,0,g);
  for(let i=1;i<5;i++)box(.06,.006,.006,0x6A7A82,r-.02,i*.13,.0,g).position.z=r*.98;
  const body=new THREE.Mesh(new THREE.CylinderGeometry(r-.012,r-.012,1,28),waterMat());body.renderOrder=2;g.add(body);
  const sg=new THREE.CircleGeometry(r-.012,28,0,Math.PI*2);const surf=new THREE.Mesh(sg,new THREE.MeshPhongMaterial({color:0x8FD0F2,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}));surf.rotation.x=-Math.PI/2;surf.renderOrder=3;g.add(surf);
  const t={g,cx,cz,yb,w:2*r,d:2*r,base:yb+.46,level:yb+.46,liquid:1,area:Math.PI*r*r,body,surf,sg,basePos:sg.attributes.position.array.slice(),ripples:[],bodies:[],round:true};
  tanks.push(t);return t;
}
const tanks=[],bodies=[],fx=[],anims=[];
function anim(dur,update){return new Promise(res=>anims.push({t:0,dur,update,done:res}));}
function tray(S,ox){const g=new THREE.Group();g.position.set(S.x+ox,S.y+TOP,S.z);E.scene.add(g);box(.95,.03,.72,0xB98A4A,0,.015,0,g);return g.position.clone().setY(S.y+TOP+.03);}

/* objects */
function objModel(id){
  const g=new THREE.Group();let hh=.05,vol=.001;
  switch(id){
    case 'bigwood':box(.36,.22,.24,0xB98A4A,0,0,0,g);box(.362,.02,.242,0x9A6E36,0,.05,0,g);hh=.11;vol=.019;break;
    case 'smallwood':box(.16,.1,.11,0xB98A4A,0,0,0,g);hh=.05;vol=.0018;break;
    case 'ironblock':box(.36,.22,.24,0x7A8088,0,0,0,g);box(.362,.02,.242,0x5A6068,0,.05,0,g);hh=.11;vol=.019;break;
    case 'clip':{const a=mesh(new THREE.TorusGeometry(.05,.007,6,20),M(0xB8BEC6),0,0,0,g);a.rotation.x=Math.PI/2;a.scale.set(1,1.8,1);const b=mesh(new THREE.TorusGeometry(.035,.007,6,20),M(0xB8BEC6),0,.002,.01,g);b.rotation.x=Math.PI/2;b.scale.set(1,1.6,1);hh=.008;vol=.00003;break;}
    case 'pingpong':mesh(new THREE.SphereGeometry(.065,16,12),M(0xFFF6EC),0,0,0,g);hh=.065;vol=.0011;break;
    case 'coin':mesh(new THREE.CylinderGeometry(.06,.06,.016,20),M(0xE0B04B,{emissive:0x3A2800}),0,0,0,g);hh=.008;vol=.0002;break;
    case 'apple':mesh(new THREE.SphereGeometry(.11,16,12),M(0xD8323A),0,0,0,g);box(.012,.05,.012,0x6A4A2A,0,.12,0,g);mesh(new THREE.SphereGeometry(.03,8,6),M(0x4E9A4A),.03,.13,0,g).scale.set(1.4,.4,.8);hh=.11;vol=.0056;break;
    case 'pebble':mesh(new THREE.DodecahedronGeometry(.06,0),M(0x8A8A82,{flatShading:true}),0,0,0,g).scale.set(1.2,.8,1);hh=.05;vol=.0007;break;
    case 'bigstone':mesh(new THREE.DodecahedronGeometry(.15,0),M(0x7E7E76,{flatShading:true}),0,0,0,g).scale.set(1.2,.8,1);hh=.12;vol=.012;break;
    case 'candle':{const c=mesh(new THREE.CylinderGeometry(.04,.04,.24,14),M(0xF6F0E2),0,0,0,g);c.rotation.z=Math.PI/2;box(.02,.006,.006,0x2A2A2A,.13,0,0,g);hh=.04;vol=.0012;break;}
    case 'marble':mesh(new THREE.SphereGeometry(.045,14,10),new THREE.MeshPhongMaterial({color:0x7FD8E8,transparent:true,opacity:.75,shininess:120}),0,0,0,g);hh=.045;vol=.0004;break;
    case 'egg':{const e=mesh(new THREE.SphereGeometry(.07,16,12),M(0xF2E6CE),0,0,0,g);e.scale.set(1,1,1.35);hh=.07;vol=.002;break;}
  }
  return {g,hh,vol};
}
function makeBody(id,pos){const {g,hh,vol}=objModel(id);g.position.copy(pos).setY(pos.y+hh);E.scene.add(g);
  const b={id,name:OB[id]?OB[id].name:id,g,hh,vol,rho:OB[id]?OB[id].rho:1,tank:null,v:0,active:false,state:null,settle:0,tween:null,home:g.position.clone(),onState:null,phase:Math.random()*6};bodies.push(b);return b;}
function flyInto(b,tank,lx,lz){return new Promise(res=>{const to=V(tank.cx+lx,tank.level+.32+b.hh,tank.cz+lz);
  b.tween={from:b.g.position.clone(),to,t:0,dur:E.RM?.05:.65,h:.35,done:()=>{b.tank=tank;tank.bodies.push(b);b.active=true;b.v=-.2;b.state=null;b.settle=0;b.onState=s=>{if(b._res){const r=b._res;b._res=null;r(s);}};b._res=res;}};});}
function lift(b){return new Promise(res=>{if(b.tank){b.tank.bodies.splice(b.tank.bodies.indexOf(b),1);}b.active=false;b.tank=null;b.v=0;
  b.tween={from:b.g.position.clone(),to:b.home.clone(),t:0,dur:E.RM?.05:.7,h:.4,done:res};});}

/* fx */
function splash(t,x,z,sp){t.ripples.push({x,z,t0:clock(),amp:Math.min(.035,.012+sp*.02)});
  if(E.RM)return;for(let i=0;i<Math.min(14,4+sp*10);i++){const d=mesh(new THREE.SphereGeometry(.012,6,4),new THREE.MeshBasicMaterial({color:0xBFE8FA,transparent:true,opacity:.85}),x,t.level+.01,z,E.scene);
    const a=Math.random()*Math.PI*2,s=.3+Math.random()*.6;fx.push({m:d,v:V(Math.cos(a)*s*.5,1+Math.random()*sp*1.2,Math.sin(a)*s*.5),kind:'drop',t:t});}}
function bubble(t,x,y,z){if(E.RM||fx.length>80)return;const b=mesh(new THREE.SphereGeometry(.01+Math.random()*.01,6,4),new THREE.MeshBasicMaterial({color:0xE8F8FF,transparent:true,opacity:.7}),x+(Math.random()-.5)*.06,y,z+(Math.random()-.5)*.06,E.scene);fx.push({m:b,v:V(0,.35+Math.random()*.2,0),kind:'bubble',t});}
const clock=()=>E.clock.elapsedTime;

/* physics + visuals */
function step(dt){
  tanks.forEach(t=>{let disp=0;t.bodies.forEach(b=>{const f=Math.max(0,Math.min(1,(t.level-(b.g.position.y-b.hh))/(2*b.hh)));disp+=f*b.vol;});t.level+=((t.base+disp/t.area)-t.level)*Math.min(1,dt*6);});
  bodies.forEach(b=>{
    if(b.tween){const tw=b.tween;tw.t=Math.min(1,tw.t+dt/tw.dur);b.g.position.lerpVectors(tw.from,tw.to,tw.t);b.g.position.y+=Math.sin(tw.t*Math.PI)*tw.h;if(tw.t>=1){b.tween=null;tw.done&&tw.done();}return;}
    if(!b.active)return;const t=b.tank,p=b.g.position;
    for(let k=0;k<2;k++){const h=dt/2;const bottom=p.y-b.hh,f=Math.max(0,Math.min(1,(t.level-bottom)/(2*b.hh)));
      let a=PH.gravity*((t.liquid*f)/b.rho-1);if(f>.98&&a!==0&&Math.abs(a)<.5)a=Math.sign(a)*.5;const drag=(f>0?PH.water_drag*(.35+f):PH.air_drag)*b.v;const prevB=bottom;
      b.v+=(a-drag)*h;b.v=Math.max(-2.5,Math.min(2.5,b.v));p.y+=b.v*h;const floor=t.yb+b.hh;if(p.y<floor){p.y=floor;if(b.v<0)b.v=0;}
      if(prevB>t.level&&p.y-b.hh<=t.level&&b.v<-.25)splash(t,p.x,p.z,-b.v);
      if(f>.95&&b.v<-.05&&Math.random()<.12)bubble(t,p.x,p.y,p.z);}
    const f=Math.max(0,Math.min(1,(t.level-(p.y-b.hh))/(2*b.hh)));
    if(Math.abs(b.v)<.03)b.settle+=dt;else b.settle=0;
    const atFloor=p.y<=t.yb+b.hh+.004;let s=null;if(atFloor&&b.settle>.25)s='sink';else if(b.settle>PH.settle_sec&&!atFloor&&f<.999)s='float';
    if(s&&s!==b.state){b.state=s;if(b.onState)b.onState(s);}
  });
  for(let i=fx.length-1;i>=0;i--){const q=fx[i];q.m.position.addScaledVector(q.v,dt);
    if(q.kind==='drop'){q.v.y-=6*dt;if(q.m.position.y<q.t.level&&q.v.y<0){E.scene.remove(q.m);fx.splice(i,1);}}
    else if(q.m.position.y>q.t.level){E.scene.remove(q.m);fx.splice(i,1);}}
}
function render(dt,t){
  tanks.forEach(T=>{const h=Math.max(.01,T.level-T.yb);T.body.scale.y=h;T.body.position.y=h/2;T.surf.position.y=h+.002;
    const pa=T.sg.attributes.position,bp=T.basePos,now=clock();T.ripples=T.ripples.filter(r=>now-r.t0<3);
    for(let i=0;i<pa.count;i++){const x=bp[i*3],y=bp[i*3+1];let z=Math.sin(x*9+now*2.2)*.002+Math.sin(y*11-now*1.7)*.002;
      T.ripples.forEach(r=>{const lx=r.x-T.cx,ly=-(r.z-T.cz);const d=Math.hypot(x-lx,y-ly),age=now-r.t0;const fr=age*.55;z+=r.amp*Math.exp(-age*1.3)*Math.exp(-Math.abs(d-fr)*14)*Math.sin(d*40-age*12);});
      pa.array[i*3+2]=z;}
    pa.needsUpdate=true;});
  bodies.forEach(b=>{if(b.active&&b.state==='float'&&!b.tween){b.phase+=dt;b.g.rotation.z=Math.sin(b.phase*1.4)*.04;b.g.rotation.x=Math.cos(b.phase*1.1)*.03;}});
}
function onFrame(dt,t){const sp=window.__simSpeed||1;for(let k=0;k<sp;k++)step(dt);
  for(let i=anims.length-1;i>=0;i--){const q=anims[i];q.t+=dt*sp;const k=Math.min(1,q.t/q.dur);q.update(k);if(k>=1){anims.splice(i,1);q.done();}}render(dt,t);if(KIT.onFrame)KIT.onFrame(dt,t);}

/* camera with drag orbit */
function setView(i,instant){const S=stagePos[i];const look=E.portrait?V(S.x+.05,S.y+.5,S.z):V(S.x+.1,S.y+1.12,S.z);const off=E.portrait?V(0,2.35,6.5):V(0,.78,2.8);st.view={look,off};
  if(instant){E.cam.look.copy(look);}}
E.cam.idle=t=>{if(st.stage<0){const a=t*.06;E.camera.position.set(Math.sin(a)*9,3.6,Math.cos(a)*9);E.cam.look.set(0,1,-1);return;}
  const v=st.view,y=st.yaw;const o=v.off.clone().applyAxisAngle(V(0,1,0),y);E.camera.position.copy(v.look).add(o);E.cam.look.copy(v.look);};
function viewPos(i){setView(i);const v=st.view;return {p:v.look.clone().add(v.off),l:v.look.clone()};}
E.canvas.addEventListener('pointerdown',e=>{if(st.stage<0)return;st.drag={x:e.clientX,y0:st.yaw};E.canvas.setPointerCapture(e.pointerId);});
E.canvas.addEventListener('pointermove',e=>{if(!st.drag)return;const lim=GM.camera.user_orbit_deg*Math.PI/180;st.yaw=Math.max(-lim,Math.min(lim,st.drag.y0-(e.clientX-st.drag.x)*.005));});
['pointerup','pointercancel'].forEach(k=>E.canvas.addEventListener(k,()=>st.drag=null));

/* party */
function slotPos(i,slot){const l=W.npc_layout[slot];const k=E.portrait?.62:1;return stagePos[i].clone().add(V(l[0]*k,0,l[2]));}
function placeParty(i,instant,dur){Object.values(CH).forEach(c=>{const t=slotPos(i,c.slot);c.target.copy(t);if(instant)c.root.position.copy(t);else c.speed=Math.max(2.2,c.root.position.distanceTo(t)/(dur||3)*1.05);});}
function watch(b){Object.values(CH).forEach(c=>c.lookAt=b?b.g.position:null);}

/* ui helpers */
function addScore(n){st.score=Math.max(0,st.score+n);hud();}
function hud(){$('score').textContent=st.score;$('acc').textContent=st.ph+'/'+st.pn;$('assist').disabled=!st.hint;}
function predict(ok){st.pn++;if(ok){st.ph++;addScore(GM.scoring.prediction_hit);}hud();}
let toastT=null;
function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3600);}
async function panel(key,text,nodes){E.actions([]);await E.showLine(key,text);E.actions(nodes);}
function setHint(list){st.hint=list?{list,level:0}:null;hud();}
$('assist').addEventListener('click',()=>{const h=st.hint;if(!h)return;if(h.level>=3){E.bubble('學伴','提示已經用完了，相信自己！',3000);return;}
  E.bubble('學伴提示 '+(h.level+1)+'/3（扣 '+GM.scoring.hint_penalty+' 分）',h.list[h.level],7000);h.level++;st.hints++;addScore(-GM.scoring.hint_penalty);});
$('record').addEventListener('click',async()=>{if(!$('overlay').innerHTML){E.overlay(reportHTML(false)+'<button class="primary" id="closeRec">收起</button></div>',true);await E.waitClick('#closeRec');E.clearOverlay();}});
function reportHTML(final){
  const rows=st.records.map(r=>'<li><b>'+r.title+'</b>'+(r.rows.length?'<table class="dt"><tr><th>物件／做法</th><th>預測</th><th>結果</th></tr>'+r.rows.map(x=>'<tr><td>'+x.name+'</td><td>'+(x.pred||'—')+'</td><td class="'+(x.pred?(x.hit?'hit':'miss'):'')+'">'+x.result+'</td></tr>').join('')+'</table>':'')+(r.note?'<p>'+r.note+'</p>':'')+'</li>').join('');
  return '<div class="card"><p class="sub" style="margin:0">'+(final?'實驗報告':'實驗紀錄')+'</p><h2>'+(final?final:'浮與沉')+'</h2>'+(rows?'<ul class="notes">'+rows+'</ul>':'<p class="sub">還沒有紀錄。</p>');
}
function newRecord(title){const r={title,rows:[],note:''};st.records.push(r);return r;}
async function choose(key,q,opts,answer,cool){const dis=new Set();let first=true,hit=false;
  for(;;){const i=await E.ask(key,q,opts,dis);if(answer==null||i===answer){return {i,first};}first=false;dis.add(i);const d=$('dialog');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');}}

/* ---------- station builders ---------- */
async function gate(u){
  const gk=CH.gatekeeper;gk.target.copy(stagePos[st.stage]).add(V(-.9,0,-1.05));gk.speed=2;await E.sleep(700);setHint(u.hints);let wrong=0;
  const dis=new Set();for(;;){const i=await E.ask('gatekeeper',u.gate.question,u.gate.options,dis,{skip:true});
    if(i===-1){await E.say('gatekeeper','答案是「'+u.gate.options[u.gate.answer]+'」。'+u.gate.explain,{btn:st.stage<C.units.length-1?'前往下一站':'看實驗報告'});break;}
    if(i===u.gate.answer){addScore(Math.max(2,GM.scoring.gate_first_try-wrong*GM.scoring.gate_wrong_penalty));E.emote(gk,'hop');await E.say('gatekeeper','正確。'+u.gate.explain,{btn:st.stage<C.units.length-1?'前往下一站':'看實驗報告'});break;}
    wrong++;dis.add(i);E.emote(gk,'shake');const d=$('dialog');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');
    if(st.hint&&st.hint.level<3){E.bubble('學伴',st.hint.list[st.hint.level],6000);st.hint.level++;}}
  setHint(null);gk.target.copy(slotPos(st.stage,'gatekeeper'));
}
async function intro(u){
  await E.say('companion',fill(u.lines.enter));
  const rv=CH.rival;E.emote(rv,'hop');await E.say('rival',u.lines.hypothesis);
}
const TRAY_SLOTS=[[-.33,-.2],[-.11,-.2],[.11,-.2],[.33,-.2],[-.33,.17],[-.11,.17],[.11,.17],[.33,.17]];
const TANK_SLOTS=[[-.55,-.15],[-.2,.12],[.18,-.14],[.52,.13],[-.48,.16],[-.05,-.18],[.35,.17],[.6,-.12]];

async function stFloatSort(u,S){
  const tk=makeTank(S,.5),tp=tray(S,-.95);const objs=u.objects.map((id,k)=>makeBody(id,tp.clone().add(V(TRAY_SLOTS[k][0]*1.1,0,TRAY_SLOTS[k][1]))));
  await intro(u);
  const pred={};const rec=newRecord('第一站：誰會浮？');
  await new Promise(async res=>{const wrap=document.createElement('div');wrap.className='pgrid';
    const go=E.btn('next','確定預測',()=>res());const draw=()=>{wrap.innerHTML='';objs.forEach(b=>{const v=pred[b.id];const bt=E.btn('pbtn'+(v?' '+v:''),'<span>'+b.name+'</span><b>'+(v==='float'?'浮':v==='sink'?'沉':'？')+'</b>',()=>{pred[b.id]=v==='float'?'sink':'float';draw();});wrap.appendChild(bt);});go.disabled=objs.some(b=>!pred[b.id]);};
    draw();await panel('mentor',u.lines.predict,[wrap,go]);});
  setHint(u.hints);
  const left=objs.slice();let k=0;
  while(left.length){
    const pick=await new Promise(async res=>{const wrap=document.createElement('div');wrap.className='pgrid';left.forEach(b=>wrap.appendChild(E.btn('pbtn','<span>'+b.name+'</span><b>放入</b>',()=>res(b))));await panel('narrator',u.lines.test+'（已測試 '+(objs.length-left.length)+'/'+objs.length+'）',[wrap]);});
    left.splice(left.indexOf(pick),1);E.actions([]);watch(pick);
    const s=await flyInto(pick,tk,TANK_SLOTS[k][0],TANK_SLOTS[k][1]);k++;
    const ok=s===pred[pick.id];predict(ok);const res=s==='float'?'浮':'沉';rec.rows.push({name:pick.name,pred:pred[pick.id]==='float'?'浮':'沉',result:res,hit:ok});
    toast(pick.name+'：'+res,ok?'預測正確 +'+GM.scoring.prediction_hit:'和你的預測不同。',ok?'ok':'bad');
    if(u.surprise[pick.id]){E.emote(CH.rival,'shake');E.floatBubble(CH.companion,u.surprise[pick.id],3000);}
    else if(!ok)E.floatBubble(CH.companion,'咦，跟我們想的不一樣！',2200);
    await E.sleep(500);
  }
  watch(null);setHint(null);E.emote(CH.rival,'slump');
  rec.note='浮：'+rec.rows.filter(r=>r.result==='浮').map(r=>r.name).join('、')+'。沉：'+rec.rows.filter(r=>r.result==='沉').map(r=>r.name).join('、')+'。';
  await E.say('mentor',u.lines.explain);
}
async function stFairTest(u,S){
  const F=u.fair_test,tk=makeTank(S,.5),tp=tray(S,-.95);
  const ids=['bigwood','smallwood','bigstone','ironblock'];const B={};ids.forEach((id,k)=>B[id]=makeBody(id,tp.clone().add(V(TRAY_SLOTS[k][0]*1.1,0,k<2?-.16:.16).setX(tp.x+(k%2?.2:-.2)))));
  await intro(u);setHint(u.hints);const rec=newRecord('第二站：公平測試');
  const dis=new Set();let wrong=0;
  for(;;){const i=await E.ask('mentor',F.question,F.options.map(o=>o.text),dis,{skip:true});if(i===-1){toast('答案','「'+F.options.find(o=>o.correct).text+'」：物料相同，只有大小不同。','');break;}if(F.options[i].correct)break;dis.add(i);wrong++;toast('這不是公平測試',F.options[i].why,'bad');if(wrong>=2&&st.hint.level<1){E.bubble('學伴',st.hint.list[0],6000);st.hint.level=1;}}
  toast('公平測試','大木塊和小木塊：物料相同，只有大小不同。','ok');
  let r=await choose('narrator',F.size_predict.question,F.size_predict.options,null);const okA=r.i===F.size_predict.answer;
  E.actions([]);watch(B.bigwood);const pA=Promise.all([flyInto(B.bigwood,tk,-.35,0),E.sleep(300).then(()=>flyInto(B.smallwood,tk,.25,.05))]);const sA=await pA;
  predict(okA);rec.rows.push({name:'大木塊與小木塊（只改變大小）',pred:F.size_predict.options[r.i],result:sA[0]==='float'&&sA[1]==='float'?'兩塊都浮':'不同',hit:okA});
  toast('兩塊都浮起來了',okA?'預測正確 +'+GM.scoring.prediction_hit:'大小不同，結果卻一樣。',okA?'ok':'bad');E.floatBubble(CH.rival,'小木塊浮……大木塊也浮？',2600);await E.sleep(900);
  r=await choose('narrator',F.material_predict.question,F.material_predict.options,null);const okB=r.i===F.material_predict.answer;
  E.actions([]);watch(B.ironblock);const sB=await flyInto(B.ironblock,tk,.4,-.15);
  predict(okB);rec.rows.push({name:'大木塊與鐵塊（只改變物料）',pred:F.material_predict.options[r.i],result:sB==='sink'?'木塊浮，鐵塊沉':'兩塊都浮',hit:okB});
  toast('鐵塊沉下去了',okB?'預測正確 +'+GM.scoring.prediction_hit:'同樣大小，物料不同，結果就不同。',okB?'ok':'bad');
  watch(null);setHint(null);E.emote(CH.rival,'slump');rec.note='只改變大小：結果相同。只改變物料：結果不同。';
  await E.say('mentor',u.lines.explain);
}
function clayGeo(s){
  const N=18,pts=[],r0=.13,R=.26,hgt=.12,th=.035;
  for(let i=0;i<=N;i++){const t=i/N;let bx,by,sx,sy;
    if(t<=.5){const a=-Math.PI/2+t*2*(Math.PI/2);sx=r0*Math.cos(a);sy=r0*Math.sin(a);const q=t*2;bx=R*Math.sin(q*Math.PI/2);by=-hgt+hgt*(1-Math.cos(q*Math.PI/2));}
    else{const q=(t-.5)*2;const a=q*(Math.PI/2);sx=r0*Math.cos(a);sy=r0*Math.sin(a);bx=(R-th)*Math.cos(q*Math.PI/2);by=-(hgt-th)*Math.sin(q*Math.PI/2);}
    pts.push(new THREE.Vector2(Math.max(.0001,sx*(1-s)+bx*s),sy*(1-s)+by*s));}
  const g=new THREE.LatheGeometry(pts,28);return g;
}
async function stShape(u,S){
  const P=u.shape,tk=makeTank(S,.5),tp=tray(S,-.95);
  const clay=makeBody('clay',tp.clone());const mat=M(0x3FA8E0);const m=new THREE.Mesh(clayGeo(0),mat);clay.g.add(m);clay.mesh=m;clay.hh=.13;clay.vol=.009;clay.rho=P.rho_ball;clay.name='泥膠';clay.g.position.y=tp.y+.13;clay.home=clay.g.position.clone();
  let shapeS=0;const setShape=s=>{shapeS=s;clay.mesh.geometry.dispose();clay.mesh.geometry=clayGeo(s);clay.hh=.13*(1-s)+.065*s;clay.vol=.009*(1-s)+.026*s;clay.rho=P.rho_ball*(1-s)+P.rho_boat*s;clay.mesh.position.y=s*.06;};
  await intro(u);setHint(u.hints);const rec=newRecord('第三站：泥膠變變變');
  let r=await choose('narrator',P.ball_predict.question,P.ball_predict.options,null);const ok1=r.i===P.ball_predict.answer;
  E.actions([]);watch(clay);let s=await flyInto(clay,tk,0,0);predict(ok1);rec.rows.push({name:'球形泥膠',pred:P.ball_predict.options[r.i].replace('會',''),result:s==='float'?'浮':'沉',hit:ok1});
  toast('球形泥膠：沉',ok1?'預測正確 +'+GM.scoring.prediction_hit:'泥膠的物料比水重，搓成球就沉了。',ok1?'ok':'bad');E.floatBubble(CH.rival,'看吧，泥膠就是會沉！',2600);await E.sleep(1100);
  await lift(clay);let tries=0;
  for(;;){
    await new Promise(async res=>{const wrap=document.createElement('div');wrap.className='shaper';
      wrap.innerHTML='<div class="srow"><span>球形</span><input type="range" min="0" max="100" value="'+Math.round(shapeS*100)+'" id="shapeR" aria-label="泥膠形狀"><span>船形</span></div><p class="status" id="shapeT"></p>';
      const go=E.btn('next','放進水中測試',()=>res());await panel('narrator',u.lines.test,[wrap,go]);
      const rg=$('shapeR'),lab=()=>{const v=rg.value/100;$('shapeT').textContent=v<.2?'現在是：球形':v<.5?'現在是：扁圓形':v<.8?'現在是：碗形':'現在是：船形';};lab();
      rg.addEventListener('input',()=>{setShape(rg.value/100);lab();});});
    E.actions([]);tries++;s=await flyInto(clay,tk,0,0);
    if(s==='float'){toast('浮起來了！','重量沒變，形狀變了。','ok');E.emote(CH.companion,'hop');E.emote(CH.rival,'shake');E.floatBubble(CH.rival,'甚麼？泥膠也會浮？',2600);break;}
    toast('還是沉了','試試把泥膠捏得更闊，四邊再拉高一點。','bad');await E.sleep(1000);await lift(clay);
  }
  const testedShape=shapeS<.8?'碗形':'船形';if(shapeS<.95){await E.sleep(700);setShape(1);E.floatBubble(CH.mentor,'我把邊再拉高一點，做成標準的船形。',2600);}
  rec.rows.push({name:'捏成'+testedShape+'的泥膠（試了 '+tries+' 次）',pred:'',result:'浮',hit:true});
  await E.sleep(800);
  r=await choose('narrator',P.load_predict.question,P.load_predict.options,null);
  let n=0,sunkAt=0;const marbles=[];
  await new Promise(async res=>{const cnt=document.createElement('p');cnt.className='status';cnt.style.color='var(--paper)';cnt.textContent='已放 0 粒';
    let lock=false;const add=E.btn('next','放一粒波子',()=>{if(clay.state==='sink'||lock||n>=14)return;lock=true;add.disabled=true;setTimeout(()=>{lock=false;if(clay.state!=='sink')add.disabled=false;},450);n++;cnt.textContent='已放 '+n+' 粒';clay.rho=P.rho_boat+P.marble_add*n;clay.settle=0;clay.v-=.15;if(clay.rho>tk.liquid&&!sunkAt){sunkAt=n;lock=true;add.disabled=true;cnt.textContent='已放 '+n+' 粒，船開始入水了……';}
      const a=n*2.4,rr=.08+((n%3)*.04);const mb=mesh(new THREE.SphereGeometry(.028,10,8),new THREE.MeshPhongMaterial({color:[0xE85A5A,0x5AA8E8,0x5AC88A,0xF2C14E][n%4],shininess:100}),Math.cos(a)*rr,.0,Math.sin(a)*rr,clay.g);marbles.push(mb);
      splash(tk,clay.g.position.x,clay.g.position.z,.3);});
    clay.onState=st2=>{if(st2==='sink'){add.disabled=true;res();}};
    await panel('narrator','一粒一粒放進泥膠船，看看它甚麼時候沉下去。',[cnt,add]);});
  const maxN=(sunkAt||n)-1,ans=P.load_predict.answer;n=sunkAt||n;const ok3=Math.abs([2,6,12][r.i]-maxN)<=1;predict(ok3);
  rec.rows.push({name:'泥膠船載波子',pred:P.load_predict.options[r.i],result:'最多 '+maxN+' 粒',hit:ok3});
  toast('第 '+n+' 粒，船沉了','泥膠船最多可載 '+maxN+' 粒波子。',ok3?'ok':'bad');E.floatBubble(CH.companion,'太重了，水托不住了！',2600);
  watch(null);setHint(null);rec.note='同一團泥膠，球形沉、船形浮；載重太多，船也會沉。';
  await E.sleep(800);await E.say('mentor',u.lines.explain);
}
async function stSalt(u,S){
  const P=u.salt,bk=makeBeaker(S,.35);const egg=makeBody('egg',V(bk.cx,bk.yb+.05,bk.cz));egg.tank=bk;bk.bodies.push(egg);egg.active=true;egg.g.position.y=bk.yb+egg.hh+.02;
  const jar=new THREE.Group();jar.position.set(S.x-.7,S.y+TOP,S.z+.05);E.scene.add(jar);mesh(new THREE.CylinderGeometry(.12,.12,.26,20),M(0xF4F4EF),0,.13,0,jar);box(.2,.08,.01,0x3A6FD0,0,.15,.12,jar);mesh(new THREE.CylinderGeometry(.125,.125,.04,20),M(0x3A6FD0),0,.28,0,jar);
  const spoon=new THREE.Group();spoon.position.set(S.x-.35,S.y+TOP+.02,S.z+.25);E.scene.add(spoon);box(.26,.012,.03,0xB8BEC6,0,0,0,spoon);const bowl=mesh(new THREE.SphereGeometry(.035,10,6,0,Math.PI*2,0,Math.PI/2),M(0xB8BEC6),.15,.0,0,spoon);bowl.rotation.x=Math.PI;
  await intro(u);setHint(u.hints);const rec=newRecord('第四站：鹽水救雞蛋');
  let r=await choose('narrator',P.predict.question,P.predict.options,null);const ok=r.i===P.predict.answer;
  watch(egg);let spoons=0,floatAt=0;const home=spoon.position.clone();
  const scoop=async()=>{const a=home.clone(),b=V(bk.cx-.05,bk.base+.32,bk.cz);
    await anim(E.RM?.05:.5,k=>{spoon.position.lerpVectors(a,b,k);spoon.position.y+=Math.sin(k*Math.PI)*.2;});
    spoon.rotation.x=-.9;if(!E.RM)for(let i=0;i<10;i++){const g=mesh(new THREE.BoxGeometry(.012,.012,.012),new THREE.MeshBasicMaterial({color:0xFFFFFF}),b.x+.15+(Math.random()-.5)*.04,b.y,b.z+(Math.random()-.5)*.04,E.scene);fx.push({m:g,v:V(0,-.6-Math.random()*.4,0),kind:'drop',t:bk});}
    await anim(E.RM?.05:.4,k=>{spoon.rotation.z=Math.sin(k*Math.PI*4)*.15;});
    spoon.rotation.set(0,0,0);await anim(E.RM?.05:.35,k=>{spoon.position.lerpVectors(b,a,k);});};
  await new Promise(async res=>{const cnt=document.createElement('p');cnt.className='status';cnt.style.color='var(--paper)';cnt.textContent='已加 0 匙鹽';let busy=false;
    const add=E.btn('next','加一匙鹽並攪拌',async()=>{if(busy||spoons>=P.max_spoons||egg.state==='float')return;busy=true;add.disabled=true;await scoop();spoons++;bk.liquid=1+P.spoon_add*spoons;if(bk.liquid>egg.rho&&!floatAt){floatAt=spoons;cnt.textContent='已加 '+spoons+' 匙鹽，雞蛋開始上升了！';busy=false;add.disabled=true;E.floatBubble(CH.companion,'快看，雞蛋在動！',2400);return;}
      bk.body.material.color.lerp(new THREE.Color(0xDCEFF6),.12);bk.body.material.opacity=Math.min(.6,bk.body.material.opacity+.025);splash(bk,bk.cx,bk.cz,.4);egg.settle=0;egg.v+=.05;cnt.textContent='已加 '+spoons+' 匙鹽';busy=false;add.disabled=spoons>=P.max_spoons;});
    egg.onState=s=>{if(s==='float'){add.disabled=true;res();}};
    await panel('narrator',u.lines.test,[cnt,add]);});
  predict(ok);rec.rows.push({name:'在清水中的雞蛋',pred:'',result:'沉',hit:true});rec.rows.push({name:'不斷加鹽後的雞蛋',pred:P.predict.options[r.i],result:'加了 '+spoons+' 匙鹽後浮起',hit:ok});
  toast('雞蛋浮起來了！','加了 '+spoons+' 匙鹽。',ok?'ok':'bad');E.emote(CH.companion,'hop');E.emote(CH.rival,'slump');E.floatBubble(CH.rival,'鹽……真的有用？',2400);
  watch(null);setHint(null);rec.note='雞蛋沒有改變，改變的是液體。';await E.sleep(900);await E.say('mentor',u.lines.explain);
}
const RUN={float_sort:stFloatSort,fair_test:stFairTest,shape:stShape,salt:stSalt};

/* ---------- flow ---------- */
async function station(i){
  const u=C.units[i],S=stagePos[i];E.hideDialog();setHint(null);
  E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'站</small><h2>'+u.title+'</h2><p>'+u.key_quote+'</p></div>',true);
  await Promise.race([E.sleep(E.RM?900:2200),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  $('chapNo').textContent='第'+E.NUM[i]+'站';$('chapTitle').textContent=u.title;
  st.stage=i;st.yaw=0;E.setEnv(W.stages[i].environment.time);bench(S);
  const v=viewPos(i);placeParty(i,false,3);await E.camTo(v.p,v.l,i===0?2:3);
  if(i===0)toast('小提示','在畫面上左右拖動，可以轉換觀看角度。','');
  await RUN[u.station](u,S);addScore(GM.scoring.station_complete);
  await gate(u);
}
async function main(){
  E.camera.position.set(0,3.6,9);E.cam.look.set(0,1,-1);placeParty(0,true);E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  const d={mentor:'帶領你們做實驗',companion:'和你同組，一起動手',rival:'總是憑感覺下結論',gatekeeper:'每站最後檢查你的結論'};
  E.overlay('<div class="card"><h2>今天的實驗課</h2><div class="cast">'+Object.entries(C.npc_slots).map(([s,x])=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+d[s]+'</span></p></div>').join('')+
    '</div><p class="sub">四個實驗站，每站都是同一個步驟：先預測，再動手，最後解釋。預測對了有加分，錯了也沒關係，那正是學習的時候。</p><button class="primary" id="go">走進實驗室</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;hud();
  for(let i=0;i<C.units.length;i++)await station(i);
  E.hideDialog();const acc=st.pn?st.ph/st.pn:0;const tier=GM.endings.find(e=>acc>=e.min_accuracy).id,EN=C.endings[tier];
  E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(800);
  const hyp=C.units.map(u=>'<li><b>「'+u.lines.hypothesis.split('！')[0]+'」</b><p>'+u.concept+'</p></li>').join('');
  E.overlay(reportHTML(EN.title)+'<div class="stats"><div><b>'+st.ph+'/'+st.pn+'</b>預測命中</div><div><b>'+st.score+'</b>分數</div><div><b>'+st.hints+'</b>提示</div></div><p>'+EN.text+'</p><p style="margin-top:8px"><b>被實驗推翻的想法</b></p><ul class="review">'+hyp+'</ul><p style="font-family:var(--serif)">陳老師：'+C.debrief+'</p><button class="primary" id="again">再做一次實驗</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
