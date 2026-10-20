/* RPG mode built on ENG + scene kit */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const KIT=E.kits[W.scene_kit];
const game={stage:-1,role:null,meter:50,shown:50,score:0,hints:0,history:[],hint:null,exploreCb:null};
window.__rpg=game;
const meterCfg=GM.state.meter;

E.init({canvas:$('scene'),onResize:changed=>{if(changed&&game.stage>=0){placeParty(game.stage,true);const v=stageView(game.stage);E.camSet(v.pos,v.look);}},onFrame});
E.bindDialog();
E.setEnv(W.stages[0].environment.time,true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'},clue:{name:'線索',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
$('meterLabel').textContent=meterCfg.label;

/* world from kit */
const stagePos=W.stages.map(s=>V(...s.position));
KIT.build(W,stagePos);
const hotspots=[];
W.stages.forEach((s,si)=>s.hotspots.forEach(h=>{
  const pos=stagePos[si].clone().add(V(...h.offset));const {g,h:ht}=KIT.prop(h.prop);g.position.copy(pos);
  const toCenter=stagePos[si].clone().add(V(0,0,4)).sub(pos);g.rotation.y=Math.atan2(toCenter.x,toCenter.z);E.scene.add(g);
  const ring=E.mesh(new THREE.TorusGeometry(.2,.04,8,24),new THREE.MeshBasicMaterial({color:0xF2C14E}),pos.x,ht+.55,pos.z,E.scene);ring.visible=false;
  const hit=E.mesh(new THREE.SphereGeometry(.7,8,6),new THREE.MeshBasicMaterial({visible:false}),pos.x,ht*.6,pos.z,E.scene);
  const data=C.units[si].hotspots.find(x=>x.id===h.id);
  const el=document.createElement('button');el.className='spot';el.textContent=data.label;el.hidden=true;$('spots').appendChild(el);
  const hs={si,id:h.id,data,ring,hit,el,baseY:ht+.55,done:false,anchor:{el,pos:V(pos.x,ht+.85,pos.z)}};E.anchors.push(hs.anchor);
  el.addEventListener('click',()=>{if(game.exploreCb)game.exploreCb(hs);});hit.userData.hs=hs;hotspots.push(hs);
}));

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
if(W.player_avatar){const p=E.makeChar('player','P',[]);p.speed=3.6;}
const CH=E.chars;
E.lampValue=()=>game.shown/100;
function slotPos(i,slot){const l=W.npc_layout[slot];const s=E.portrait?.66:1;return stagePos[i].clone().add(V(l[0]*s,0,l[2]+(E.portrait&&slot==='companion'?.6:0)));}
function placeParty(i,instant,dur){Object.values(CH).forEach(c=>{const t=slotPos(i,c.slot);c.target.copy(t);c.face=null;
  if(instant)c.root.position.copy(t);else c.speed=Math.max(2.2,c.root.position.distanceTo(t)/(dur||3)*1.05);});}

/* camera */
function stageView(i){const p=stagePos[i];const d=E.portrait?15:10.5,h=E.portrait?4.8:3.7;return {pos:V(p.x,h,p.z+d),look:V(p.x,E.portrait?-.35:.55,p.z-1.6)};}
E.cam.idle=t=>{if(game.stage>=0)return;const a=t*.06;E.camera.position.set(Math.sin(a)*11,4.2,Math.cos(a)*11-1);E.cam.look.set(0,1,-1.2);};

/* frame */
function onFrame(dt,t){
  if(KIT.onFrame)KIT.onFrame(dt,t);
  game.shown+=(game.meter-game.shown)*Math.min(1,dt*2.5);E.env.dim=1-game.shown/100;
  hotspots.forEach(h=>{if(h.ring.visible){h.ring.rotation.y+=dt*2;h.ring.position.y=h.baseY+Math.sin(t*3+h.anchor.pos.x)*.06;}});
}

/* meter & score */
function setMeter(v){game.meter=Math.max(0,Math.min(100,v));$('mVal').textContent=Math.round(game.meter);
  const b=$('mBar');b.style.width=game.meter+'%';b.style.background=game.meter<40?'var(--cinnabar)':game.meter>=75?'var(--jade)':'var(--gold)';
  $('mGlow').setAttribute('opacity',(.15+game.meter/100*.85).toFixed(2));}
function addScore(n){game.score=Math.max(0,game.score+n);$('scoreVal').textContent=game.score;}
const fill=s=>s.replace(/\{address\}/g,game.role?game.role.address:'');

/* assistant */
function setHint(list){game.hint=list?{list,level:0}:null;const a=$('assist');a.disabled=!list;a.classList.toggle('ready',!!list);}
function giveHint(auto){const h=game.hint;if(!h)return;if(h.level>=h.list.length){E.bubble('學伴','提示已經用完了，相信自己的判斷吧！',3000);return;}
  const txt=h.list[h.level];h.level++;if(!auto){game.hints++;addScore(-GM.scoring.hint_penalty);}
  E.bubble('學伴提示 '+h.level+'/'+h.list.length+(auto?'':'（扣 '+GM.scoring.hint_penalty+' 分）'),txt);if(h.level>=h.list.length)$('assist').classList.remove('ready');}
$('assist').addEventListener('click',()=>giveHint(false));

/* explore */
function explore(si){
  const list=hotspots.filter(h=>h.si===si);let idle;
  const status=()=>{const n=list.filter(h=>h.done).length;$('whoName').textContent='調查';$('whoDot').style.background='#F2C14E';$('line').classList.remove('quote');
    $('line').textContent=n<list.length?'四處看看：點擊場景中發亮的地方調查線索（'+n+'/'+list.length+'）':'線索都調查過了。';};
  return new Promise(res=>{
    const arm=()=>{clearTimeout(idle);idle=setTimeout(()=>E.bubble('學伴','試試點擊金色圓環，或畫面上的標籤。',4000),GM.chapters[si].beats.explore.idle_hint_sec*1000);};
    list.forEach(h=>{h.ring.visible=true;h.el.hidden=false;});
    const back=()=>{status();const n=list.filter(h=>h.done).length;
      if(n>=list.length){clearTimeout(idle);E.actions([E.btn('next','繼續',()=>{list.forEach(h=>{h.ring.visible=false;h.el.hidden=true;});game.exploreCb=null;res();})]);}else{E.actions([]);arm();}};
    game.exploreCb=async h=>{if(h.si!==si||game.walking||h.busy)return;h.busy=true;clearTimeout(idle);E.hideBubble();await walkTo(h.anchor.pos.clone().setY(0));h.busy=false;h.done=true;h.el.classList.add('done');h.ring.material=new THREE.MeshBasicMaterial({color:0x5FB49C});
      E.actions([]);await E.showLine('clue',h.data.text,/「/.test(h.data.text));$('whoName').textContent=h.data.label;E.actions([E.btn('next','收起',back)]);};
    $('dialog').hidden=false;E.setTalker('');back();});
}
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
E.canvas.addEventListener('click',e=>{if(!game.exploreCb)return;const r=E.canvas.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(pm,E.camera);const hit=ray.intersectObjects(hotspots.filter(h=>h.ring.visible).map(h=>h.hit))[0];if(hit){game.exploreCb(hit.object.userData.hs);return;}
  const PL=CH.player;if(PL&&!game.walking){const pt=V();if(ray.ray.intersectPlane(new THREE.Plane(V(0,1,0),0),pt)){const c=stagePos[game.stage];const d=pt.clone().sub(c);d.y=0;if(d.length()>6)d.setLength(6);PL.target.copy(c).add(d);PL.onArrive=null;}}});
function walkTo(pos){const PL=CH.player;if(!PL)return Promise.resolve();game.walking=true;const d=PL.root.position.clone().sub(pos);d.y=0;if(d.length()<.01)d.set(0,0,1);d.setLength(1.1);PL.target.copy(pos).add(d).setY(0);PL.lookAt=pos;
  return new Promise(r=>{PL.onArrive=()=>{PL.lookAt=null;game.walking=false;r();};if(PL.root.position.distanceTo(PL.target)<.06){PL.onArrive=null;PL.lookAt=null;game.walking=false;r();}});}

/* chapter */
async function chapterCard(i,u){
  E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'章</small><h2>'+u.title+'</h2><p>'+u.key_quote+'</p></div>',true);
  await Promise.race([E.sleep(E.RM?1200:2600),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
}
/* ---------- topic actions: the chapter's own action from the lesson (pour, throw, weigh, stamp, steer, plant, shoot) ---------- */
function mgLabel(text,pos,cls){const el=document.createElement('button');el.className='mglabel '+(cls||'');el.textContent=text;$('spots').appendChild(el);const a={el,pos:pos.clone()};E.anchors.push(a);return a;}
function mgClear(list){list.forEach(a=>{a.el.remove();const k=E.anchors.indexOf(a);if(k>=0)E.anchors.splice(k,1);});list.length=0;}
function mgTw(d,fn){return new Promise(res=>{const t0=performance.now(),D=Math.max(10,d*1000*(window.__fast?.15:1));const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}
function mgToast(title,text,ok){E.bubble(title,text||'',ok?2400:3800);}
const hexc=(c,d)=>{try{return c?parseInt(String(c).replace('#',''),16):d;}catch(e){return d;}};
function actModel(model,color){const g=new THREE.Group(),c=hexc(color,null);const B=(...a)=>E.box(...a);const Ms=(geo,col,x,y,z)=>E.mesh(geo,E.M(col),x,y,z,g);
  switch(model){
    case 'crate':B(.6,.5,.5,c||0x9A7A4A,0,.25,0,g);B(.62,.06,.52,0x6A4A2A,0,.38,0,g);break;
    case 'barrel':{const b=Ms(new THREE.CylinderGeometry(.26,.26,.6,14),c||0x7A5236,0,.3,0);Ms(new THREE.TorusGeometry(.27,.025,6,16),0x3A3A3A,0,.15,0).rotation.x=Math.PI/2;Ms(new THREE.TorusGeometry(.27,.025,6,16),0x3A3A3A,0,.45,0).rotation.x=Math.PI/2;break;}
    case 'chest':B(.6,.35,.4,c||0x7A4A22,0,.18,0,g);B(.62,.12,.42,0xC8A040,0,.38,0,g);break;
    case 'jar':Ms(new THREE.CylinderGeometry(.22,.26,.5,14),c||0xB8A07A,0,.25,0);Ms(new THREE.CylinderGeometry(.12,.14,.14,12),c||0xB8A07A,0,.56,0);break;
    case 'bottle':Ms(new THREE.CylinderGeometry(.14,.14,.4,12),c||0x5A8A6A,0,.2,0);Ms(new THREE.CylinderGeometry(.05,.07,.18,10),c||0x5A8A6A,0,.49,0);break;
    case 'flask':Ms(new THREE.ConeGeometry(.26,.42,16),c||0xCFEFF8,0,.21,0);Ms(new THREE.CylinderGeometry(.06,.06,.22,10),c||0xCFEFF8,0,.52,0);break;
    case 'tube':Ms(new THREE.CylinderGeometry(.07,.07,.5,12),c||0xDCF0F6,0,.25,0);break;
    case 'gourd':Ms(new THREE.SphereGeometry(.24,14,10),c||0xC9A050,0,.24,0);Ms(new THREE.SphereGeometry(.14,12,10),c||0xC09848,0,.54,0);break;
    case 'scroll':{const r=Ms(new THREE.CylinderGeometry(.07,.07,.5,10),c||0xF2E8C8,0,.1,0);r.rotation.z=Math.PI/2;break;}
    case 'ballot':case 'document':B(.42,.02,.56,c||0xF8F6EE,0,.02,0,g);B(.3,.005,.04,0x5A5A5A,0,.035,-.12,g);B(.3,.005,.04,0x5A5A5A,0,.035,0,g);break;
    case 'bag':{const b=Ms(new THREE.SphereGeometry(.24,12,10),c||0xC8B48A,0,.22,0);b.scale.y=1.2;break;}
    case 'seed':Ms(new THREE.SphereGeometry(.09,10,8),c||0x8A6A3A,0,.09,0);break;
    case 'stone':Ms(new THREE.DodecahedronGeometry(.2,0),c||0x8A8A80,0,.2,0);break;
    case 'boat':B(.9,.22,.36,c||0x6A4428,0,.11,0,g);B(.04,.7,.04,0x5A3A22,0,.55,0,g);{const s=new THREE.Mesh(new THREE.PlaneGeometry(.45,.5),new THREE.MeshLambertMaterial({color:0xF4F0E4,side:THREE.DoubleSide}));s.position.set(0,.6,0);s.rotation.y=Math.PI/2;g.add(s);}break;
    case 'basket':Ms(new THREE.CylinderGeometry(.3,.22,.3,14,1,true),c||0xB98A4A,0,.15,0);break;
    case 'arrow':{const sh=Ms(new THREE.CylinderGeometry(.02,.02,.8,6),0x8A6A3A,0,0,0);sh.rotation.x=Math.PI/2;Ms(new THREE.ConeGeometry(.045,.12,6),0x8A8E92,0,0,-.46).rotation.x=-Math.PI/2;break;}
    default:B(.4,.4,.4,c||0xC8A060,0,.2,0,g);}
  return g;}
function actTarget(model,color){const g=new THREE.Group(),c=hexc(color,null);const T={g,entry:V(0,.5,0)};const B=(...a)=>E.box(...a);
  switch(model){
    case 'water':{const w=E.mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshLambertMaterial({color:c||0x3E7AA8,emissive:0x0A2A48}),0,.03,0,g);w.rotation.x=-Math.PI/2;E.mesh(new THREE.TorusGeometry(.92,.08,6,24),E.M(0x8A8478),0,.04,0,g).rotation.x=Math.PI/2;T.entry=V(0,.05,0);T.splash=true;break;}
    case 'jar':case 'gourd':case 'flask':case 'tube':case 'bin':case 'basket':case 'box':{const glass=model==='flask'||model==='tube';const r=model==='tube'?.18:.42,h=model==='tube'?.9:.8;
      E.mesh(new THREE.CylinderGeometry(r,r*.9,h,18,1,true),glass?new THREE.MeshPhongMaterial({color:0xE8F6FF,transparent:true,opacity:.35,side:THREE.DoubleSide}):E.M(c||(model==='bin'?0x4C7BF4:0xB8A07A),{side:THREE.DoubleSide}),0,h/2,0,g);
      E.mesh(new THREE.CylinderGeometry(r*.9,r*.9,.04,18),E.M(0x5A4A3A),0,.02,0,g);const liq=E.mesh(new THREE.CylinderGeometry(r*.86,r*.86,1,18),new THREE.MeshLambertMaterial({color:c||0x8FC8E8,transparent:true,opacity:.85}),0,.02,0,g);liq.scale.y=.01;liq.visible=false;
      T.liq=liq;T.h=h;T.level=0;T.entry=V(0,h+.05,0);break;}
    case 'port':B(1.4,.12,.9,0x8A6A44,0,.06,0,g);[[-.6,-.35],[.6,-.35],[-.6,.35],[.6,.35]].forEach(([x,z])=>B(.08,.4,.08,0x5A3A22,x,-.1,z,g));B(.05,1.2,.05,0xD8D8D0,.55,.6,-.3,g);B(.4,.26,.02,c||0xC8321E,.76,1.05,-.3,g);T.entry=V(-.2,.1,0);break;
    case 'field':B(1.4,.12,1,0x6A4A2A,0,.06,0,g);for(let i=0;i<4;i++)B(1.3,.04,.08,0x5A3A22,0,.13,-.36+i*.24,g);T.entry=V(0,.14,0);T.field=true;break;
    case 'tray':B(1,.08,.7,c||0x8A6A44,0,.3,0,g);B(1,.2,.05,c||0x8A6A44,0,.4,.35,g);B(1,.2,.05,c||0x8A6A44,0,.4,-.35,g);[[-.45,-.3],[.45,-.3],[-.45,.3],[.45,.3]].forEach(([x,z])=>B(.06,.3,.06,0x5A3A22,x,.15,z,g));T.entry=V(0,.36,0);T.tray=0;break;
    case 'target':B(.08,1.5,.08,0x7A5A3A,-.45,.75,-.1,g);B(.08,1.5,.08,0x7A5A3A,.45,.75,-.1,g);[.62,.48,.34,.2,.08].forEach((rr,j)=>E.mesh(new THREE.CircleGeometry(rr,28),new THREE.MeshBasicMaterial({color:[0xF4F0E4,0x1E1E1E,0x3A6FC8,0xD8322A,0xF2C81A][j]}),0,1.65,.02*j,g));T.entry=V(0,1.65,.12);break;
    default:B(.8,.4,.8,c||0x9A9488,0,.2,0,g);T.entry=V(0,.45,0);}
  return T;}
async function runAction(i,u){const A=u.action,base=stagePos[i].clone().add(V(0,0,1.3));const fade0=E.fade.on;E.fade.on=false;if(E.fade.list){E.fade.list.forEach((rec,m)=>{m.material=rec.src;});E.fade.list.clear();}
  const g=new THREE.Group();g.position.copy(base);E.scene.add(g);const labels=[],tmp=[];
  const saved={};['mentor','companion','rival','gatekeeper','player'].forEach((k,j)=>{const ch=CH[k];if(!ch)return;saved[k]=ch.root.position.clone();ch.target.copy(stagePos[i]).add(V(j%2?6.6:-6.6,0,-1.2-j*.4));ch.speed=4;});
  const cam0=E.camera.position.clone(),look0=E.cam.look.clone();await E.camTo(base.clone().add(V(0,3.5,6.8)),base.clone().add(V(0,1.1,-.3)),1.2);
  E.hideDialog();E.overlay('<div class="chapcard"><small>動手做</small><h2>'+A.title+'</h2></div>',true);await E.sleep(window.__fast?250:1400);E.clearOverlay();
  const verb=A.verb,TG={};let right=0,wrong=0;const n=A.targets.length;
  let scale=null;
  if(verb==='weigh'){scale=new THREE.Group();g.add(scale);E.box(.14,1.6,.14,0x6A4A2A,0,.8,-.2,scale);E.box(1.2,.1,.6,0x5A3A22,0,.05,-.2,scale);const beam=new THREE.Group();beam.position.set(0,1.62,-.2);scale.add(beam);E.box(3,.08,.08,0x8A6A3A,0,0,0,beam);
    A.targets.forEach((t,k)=>{const s=k?1:-1;const pan=new THREE.Group();g.add(pan);E.mesh(new THREE.CylinderGeometry(.42,.32,.08,18),E.M(0xC8A040),0,0,0,pan);[0,1,2].forEach(q=>{const a=q*2.1;E.box(.01,.75,.01,0x5A5A5A,Math.cos(a)*.3,.38,Math.sin(a)*.3,pan);});
      TG[t.id]={t,pan,side:s,entry:V(0,.06,0)};const lb=mgLabel(t.name,base.clone().add(V(s*1.5,2.5,-.2)),'tgt');labels.push(lb);TG[t.id].a=lb;});
    scale.userData.beam=beam;const place=()=>A.targets.forEach(t=>{const T=TG[t.id];const ang=beam.rotation.z;T.pan.position.set(T.side*1.5*Math.cos(ang),1.62+T.side*1.5*Math.sin(ang)-.8,-.2);});place();scale.userData.place=place;}
  else A.targets.forEach((t,k)=>{const x=(k-(n-1)/2)*(n>2?2.3:2.8);const T=actTarget(t.model,t.color);T.g.position.set(x,0,-.3);g.add(T.g);TG[t.id]=Object.assign(T,{t});const lb=mgLabel(t.name,base.clone().add(V(x,(t.model==='target'?2.6:1.9),-.3)),'tgt');labels.push(lb);T.a=lb;});
  const actor=verb==='weigh'?null:actModel(verb==='shoot'?'arrow':A.object.model,A.object.color);
  const start=verb==='pour'?V(0,2.6,-.3):verb==='steer'?V(0,.05,2.2):V(0,1.2,2.4);
  if(actor){actor.position.copy(start);g.add(actor);}
  for(let r=0;r<A.rounds.length;r++){const R=A.rounds[r];
    const choice=await new Promise(async res=>{E.actions([]);await E.showLine('gatekeeper',(A.prompt?A.prompt+'　':'')+'「'+R.item+'」');Object.values(TG).forEach(T=>{T.a.el.classList.add('pick');T.a.el.onclick=()=>res(T.t.id);});
      const w=document.createElement('div');w.className='mgchips';A.targets.forEach(t=>w.appendChild(E.btn('mgchip',t.name,()=>res(t.id))));E.actions([w]);
      if(window.__auto)setTimeout(()=>{const w=!A._triedWrong&&n>1;if(w)A._triedWrong=true;res(w?A.targets.find(t=>t.id!==R.target).id:R.target);},80);});
    Object.values(TG).forEach(T=>{T.a.el.classList.remove('pick');T.a.el.onclick=null;});E.actions([]);const T=TG[choice],ok=choice===R.target;
    if(verb==='weigh'){const beam=scale.userData.beam,goal=T.side*-.32;await mgTw(.8,k=>{beam.rotation.z=goal*k;scale.userData.place();});await E.sleep(window.__fast?100:500);}
    else{const proj=verb==='pour'?null:actModel(verb==='shoot'?'arrow':A.object.model,R.color||A.object.color);const tgtW=T.g.position.clone().add(T.entry);
      if(verb==='pour'){await mgTw(.5,k=>{actor.position.x=start.x+(tgtW.x-start.x)*k;actor.rotation.z=-1.1*k;});
        for(let q=0;q<14;q++){const d=E.mesh(new THREE.SphereGeometry(.05,6,4),new THREE.MeshBasicMaterial({color:hexc(R.color,0x8FC8E8)}),actor.position.x+.2,actor.position.y-.1,actor.position.z,g);tmp.push(d);const y0=d.position.y;mgTw(.45,k=>{d.position.y=y0-(y0-tgtW.y)*k;}).then(()=>{g.remove(d);});await E.sleep(window.__fast?8:40);}
        await E.sleep(window.__fast?60:400);if(T.liq){T.liq.visible=true;T.level=Math.min(T.h*.9,T.level+T.h*.3);T.liq.scale.y=T.level;T.liq.position.y=.02+T.level/2;if(R.color)T.liq.material.color.setHex(hexc(R.color,0x8FC8E8));}
        await mgTw(.4,k=>{actor.rotation.z=-1.1*(1-k);actor.position.x=tgtW.x*(1-k);});}
      else{g.add(proj);const from=start.clone(),to=ok||verb==='steer'?tgtW:tgtW.clone().lerp(from,.35).setY(.1);
        await mgTw(verb==='steer'?1.4:.8,k=>{proj.position.lerpVectors(from,to,k);if(verb!=='steer')proj.position.y+=Math.sin(k*Math.PI)*(verb==='shoot'?.6:1.4);else{proj.position.x=from.x+(to.x-from.x)*(1-Math.cos(k*Math.PI))/2;proj.position.y=.05+Math.sin(k*20)*.02;}
          if(verb==='shoot')proj.lookAt(g.localToWorld(to.clone()));else if(verb!=='steer')proj.rotation.x+=.08;});tmp.push(proj);
        if(T.splash&&ok){for(let q=0;q<12;q++){const d=E.mesh(new THREE.SphereGeometry(.05,6,4),new THREE.MeshBasicMaterial({color:0xBFE8FA}),to.x,.1,to.z,g);tmp.push(d);const vx=(Math.random()-.5)*1.2,vz=(Math.random()-.5)*1.2;mgTw(.6,k=>{d.position.set(to.x+vx*k,.1+Math.sin(k*Math.PI)*.6,to.z+vz*k);});}await mgTw(.6,k=>{proj.position.y=to.y-.4*k;});}
        if(T.field&&ok){const sp=E.mesh(new THREE.ConeGeometry(.08,.4,6),E.M(0x5E9A3E),to.x+(Math.random()-.5)*.6,.14,to.z+(Math.random()-.5)*.4,g);tmp.push(sp);sp.scale.setScalar(.01);await mgTw(.6,k=>sp.scale.setScalar(Math.max(.01,k)));}
        if(T.tray!=null&&ok){proj.position.y=to.y+T.tray*.02;T.tray++;const st=E.mesh(new THREE.CircleGeometry(.1,16),new THREE.MeshBasicMaterial({color:0xC8321E}),0,.03,.15,proj);st.rotation.x=-Math.PI/2;}
        if(!ok&&verb!=='steer')setTimeout(()=>g.remove(proj),900);}}
    if(ok){right++;addScore(6);setMeter(game.meter+2);T.a.el.classList.add('ok');mgToast('✓ '+(R.result?'':'正確'),R.result||('「'+R.item+'」→「'+T.t.name+'」'),true);}
    else{wrong++;setMeter(game.meter-2);E.emote(CH.rival,'hop');mgToast('✕ 再想想',R.why||('「'+R.item+'」不應該去「'+T.t.name+'」'),false);r--;
      if(verb==='weigh')await mgTw(.5,k=>{scale.userData.beam.rotation.z*=(1-k);scale.userData.place();});if(verb==='steer'&&tmp.length){g.remove(tmp.pop());}}
    if(verb==='weigh'&&ok){await E.sleep(window.__fast?100:700);await mgTw(.5,k=>{scale.userData.beam.rotation.z*=(1-k);scale.userData.place();});}
    await E.sleep(window.__fast?80:500);Object.values(TG).forEach(T2=>T2.a.el.classList.remove('ok'));}
  mgClear(labels);E.scene.remove(g);await E.say('gatekeeper','完成！'+A.rounds.length+' 項全部處理好'+(wrong?'（中途錯了 '+wrong+' 次）':'')+'。');
  Object.entries(saved).forEach(([k,p])=>{CH[k].target.copy(p);});await E.camTo(cam0,look0,1);E.fade.on=fade0;}
window.__rpgTest={runAction:(i)=>runAction(i,C.units[i]),units:()=>C.units.length};
async function playChapter(i){
  const u=C.units[i],ch=GM.chapters[i],st=W.stages[i];
  E.hideDialog();setHint(null);E.hideBubble();
  await chapterCard(i,u);
  $('chapNo').textContent='第'+E.NUM[i]+'章';$('chapTitle').textContent=u.title;
  game.stage=i;E.setEnv(st.environment.time);
  const v=stageView(i);placeParty(i,false,3.2);await E.camTo(v.pos,v.look,i===0?2.4:3.4);
  await E.say('companion',fill(u.lines.enter));
  await explore(i);
  const ix=u.interactions||{};const ctx={i,u,pos:stagePos[i],CH,game};
  if(ix.after_explore&&KIT.interact)await KIT.interact(ix.after_explore,ctx);
  await E.say('mentor',u.lines.guide);
  const rv=CH.rival;rv.target.copy(slotPos(i,'rival')).add(V(0,0,1.2));rv.speed=2;
  if(ix.before_dilemma&&KIT.interact)await KIT.interact(ix.before_dilemma,ctx);
  await E.say('rival',u.lines.dilemma);
  setHint(u.hints.dilemma);
  const order=E.shuffle([0,1,2]);
  const pick=await E.ask('narrator',u.lines.prompt,order.map(k=>u.choices[k].text));
  const choice=u.choices[order[pick]],rule=ch.beats.choices.find(c=>c.type===choice.type);
  setHint(null);E.hideBubble();setMeter(game.meter+rule.meter);addScore(rule.score);game.history.push({unit:u,choice});
  const good=choice.type==='correct';E.flash(good,good?null:parseInt(GM.wrong_flash||'0x2A2440'));
  if(ix.after_choice&&KIT.interact){E.hideDialog();await KIT.interact(ix.after_choice,Object.assign({choice:choice.type},ctx));}
  if(good){E.emote(CH.rival,'slump');E.emote(CH.companion,'hop');}else{E.emote(CH.rival,'hop');E.emote(CH.companion,'shake');E.emote(CH.gatekeeper,'shake');}
  E.floatBubble(CH.companion,good?u.reactions.companion_on_correct:u.reactions.companion_on_wrong,3600);
  await E.say('rival',good?u.reactions.rival_on_correct:u.reactions.rival_on_wrong);
  rv.target.copy(slotPos(i,'rival'));if(!good)E.emote(CH.mentor,'shake');
  await E.say('mentor',choice.feedback);
  if(u.action)await runAction(i,u);
  await gate(i,u);
}
async function gate(i,u){
  const gk=CH.gatekeeper;gk.target.copy(stagePos[i]).add(V(0,0,E.portrait?.6:1));gk.speed=2.2;await E.sleep(900);
  setHint(u.hints.gate);const wrong=new Set(),h0=game.hints;
  for(;;){const idx=await E.ask('gatekeeper',u.gate.question,u.gate.options,wrong,{skip:true});
    if(idx===-1){setHint(null);E.hideBubble();game.history[game.history.length-1].gate={wrong:wrong.size,hints:game.hints-h0,skipped:true};await E.say('gatekeeper','答案是「'+u.gate.options[u.gate.answer]+'」。'+u.gate.explain,{btn:i<C.units.length-1?'前往下一章':'看結局'});break;}
    if(idx===u.gate.answer){const pts=Math.max(GM.scoring.gate_min,GM.scoring.gate_first_try-wrong.size*GM.scoring.gate_wrong_penalty);addScore(pts);setHint(null);E.hideBubble();E.emote(gk,'hop');
      game.history[game.history.length-1].gate={wrong:wrong.size,hints:game.hints-h0};
      await E.say('gatekeeper','答對了。'+u.gate.explain,{btn:i<C.units.length-1?'前往下一章':'看結局'});break;}
    wrong.add(idx);E.emote(gk,'shake');const d=$('dialog');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');giveHint(true);}
  gk.target.copy(slotPos(i,'gatekeeper'));
}

/* screens */
async function title(){
  const tl=C.meta.title_lines||[];
  E.overlay('<div class="title"><div class="v">'+(C.meta.short_title||C.meta.topic)+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+tl.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>你是誰？</h2><p class="sub">不同身份的起始'+meterCfg.label+'不同，旁人對你的稱呼也不同。</p><div class="roles">'+
    C.player_roles.map((r,i)=>'<button class="role" data-i="'+i+'"><b>'+r.display_name+'</b><span>'+r.blurb+'</span><em>起始'+meterCfg.label+' '+r.start_value+'</em></button>').join('')+'</div></div>',true);
  const b=await E.waitClick('.role');game.role=C.player_roles[+b.dataset.i];
  const desc={mentor:'你的導師，會為你點破道理',companion:'和你一起經歷每個場景',rival:'會化身不同角色考驗你',gatekeeper:'每章結束時考問你'};
  E.overlay('<div class="card"><h2>登場人物</h2><div class="cast">'+Object.entries(C.npc_slots).map(([s,d])=>'<div>'+E.glyph(d.character_id)+'<p style="margin:0"><b>'+d.display_name+'</b><br><span>'+(d.persona||desc[s])+'</span></p></div>').join('')+
    '</div><p class="sub">右上角是你的「'+meterCfg.label+'」，每個選擇都會讓它升或降。卡住時可以按「學伴提示」，每次扣 '+GM.scoring.hint_penalty+' 分。</p><button class="primary" id="go">出發</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();
}
async function ending(){
  setHint(null);E.hideDialog();
  const b=game.meter,tier=GM.endings.find(e=>b>=e.min_meter).id,EN=C.endings[tier];
  E.flash(tier==='best');if(tier==='best')Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(900);
  const lab={correct:['做對了','ok'],misconception:['落入盲點','bad'],suboptimal:['未盡完善','mid']};
  const tl=game.history.map((h,i)=>{const [t,cls]=lab[h.choice.type];const right=h.unit.choices.find(c=>c.type==='correct');
    return '<li class="'+cls+'"><b>第'+E.NUM[i]+'章 '+h.unit.title+'</b><span class="tag">'+t+(h.gate&&(h.gate.wrong||h.gate.hints)?'，考問答錯 '+h.gate.wrong+' 次、提示 '+h.gate.hints+' 次':'')+'</span><p>你的選擇：'+h.choice.text+'</p>'+(h.choice.type==='correct'?'':'<p>正確做法：'+right.text+'</p>')+'</li>';}).join('');
  E.overlay('<div class="card"><p class="sub" style="margin:0">結局</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+Math.round(b)+'</b>'+meterCfg.label+'</div><div><b>'+game.score+'</b>分數</div><div><b>'+game.hints+'</b>提示次數</div></div>'+
    '<ol class="tl">'+tl+'</ol><p style="font-family:var(--serif)">'+C.npc_slots.mentor.display_name+'：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
async function main(){
  setMeter(50);placeParty(0,true);E.camera.position.set(0,4.2,10);E.cam.look.set(0,1,-1.2);E.start();
  await title();
  game.meter=game.shown=game.role.start_value;setMeter(game.meter);$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startCh||1)-1);i<C.units.length;i++)await playChapter(i);
  await ending();
}
main();
})();
