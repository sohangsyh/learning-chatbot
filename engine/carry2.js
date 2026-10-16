/* Carry mode v2: each round in its own scene, themed drop zones */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const KIT=E.kits[W.scene_kit];
const TYPE={sort:'分類',pair:'配對',sequence:'排序',single:'單選'};
const ZCOL=[0x3E9C82,0xC8452F,0x4E6FC4,0xC98E1E];
const st={round:-1,running:false,score:0,combo:0,time:0,items:[],zones:[],carried:null,mistakes:[],stars:[],hint:0,helps:0,pending:[],rivalT:0,kickT:0,rivalBusy:false,endRes:null,unit:null,cfg:null,wrongs:0,O:V()};
window.__carry=st;
E.init({canvas:$('scene'),onResize:()=>{setCam();if(st.round>=0)relayout();},onFrame});
E.bindDialog();E.setEnv(W.rounds[0].env,true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const KS=KIT.carryBuild(W);
const slotKeys=Object.keys(C.npc_slots);
slotKeys.forEach(s=>E.makeChar(s,C.npc_slots[s].character_id,C.npc_slots[s].costume));
const P=E.makeChar('player','P',[]);P.speed=4.8;
const R=E.chars.rival,CP=E.chars.companion,GK=E.chars.gatekeeper,MT=E.chars.mentor;
E.lampValue=()=>Math.min(1,.3+st.combo*.14);
const O=()=>st.O;
function post(slot){const l=W.npc_layout[slot];const k=E.portrait?.52:1;return V(l[0]*k,0,l[2]).add(O());}
function homeNPCs(instant){slotKeys.forEach(s=>{const c=E.chars[s];c.target.copy(post(s));if(instant)c.root.position.copy(c.target);});}
$('helpIcon').innerHTML=E.glyph(C.npc_slots.companion.character_id).replace('<svg','<svg style="width:18px;height:18px"');
$('helpLabel').textContent=C.npc_slots.companion.display_name+'幫忙';

/* camera */
function view(){return E.portrait?{p:V(0,16.5,8.6).add(O()),l:V(0,0,-.5).add(O())}:{p:V(0,10.2,10.4).add(O()),l:V(0,0,-1.5).add(O())};}
function setCam(){if(st.round<0)return;const v=view();E.camSet(v.p,v.l);}
E.parallax=.3;E.cam.idle=t=>{if(st.round>=0)return;const a=t*.07;const c=V(...W.rounds[0].position);E.camera.position.set(c.x+Math.sin(a)*14,7.5,c.z+Math.cos(a)*14-1);E.cam.look.set(c.x,.8,c.z-1.5);};
E.camera.position.set(0,7.5,13);

/* layout */
function zonePos(i,n){const zr=W.arena.zone_row_z;if(E.portrait&&n===4)return {x:(i%2?1.75:-1.75),z:i<2?zr-1.2:zr+.7,up:i<2};const sp=E.portrait?2.25:3.4;return {x:(i-(n-1)/2)*sp,z:zr,up:false};}
function slots(){const cols=E.portrait?2:5,sx=E.portrait?3.3:2.4,sz=E.portrait?1.2:1.3,zmax=E.portrait?4.3:2.9,out=[];
  for(let r=0;r<6;r++)for(let c=0;c<cols;c++){const z=-1.6+r*sz;if(z>zmax)continue;out.push(V((c-(cols-1)/2)*sx+(r%2?.3:-.3),0,z).add(O()));}return out;}
function freeSlot(avoid){const all=E.shuffle(slots());const used=st.items.filter(i=>i.state==='ground'||i.state==='flying').map(i=>i.home);
  let best=null,bd=-1;for(const s of all){const d=Math.min(...used.map(u=>u?u.distanceTo(s):99),99);const da=avoid?s.distanceTo(avoid):5;const sc=Math.min(d,1.8)+Math.min(da,4)*.2;if(sc>bd){bd=sc;best=s;}}return best.clone();}

/* zones */
function buildZones(u){const n=u.zones.length,style=W.rounds[st.round].zone_style;
  st.zones=u.zones.map((z,i)=>{const zp=zonePos(i,n);const col=ZCOL[i%4];const m=KIT.zoneModel(style,col,z.label);const g=m.g;g.position.set(zp.x,0,zp.z).add(O());E.scene.add(g);
    if(m.incense){KS.incenseAt=m.incense.clone().add(g.position);}
    const el=document.createElement('button');el.className='zl';el.style.background=E.hex(col);$('labels').appendChild(el);
    const zo={data:z,i,g,model:m,el,count:0,flash:0,pos:g.position,anchor:{el,pos:V()},placed:[]};
    g.traverse(o=>{if(o.isMesh)o.userData.zone=zo;});el.addEventListener('click',()=>clickZone(zo));E.anchors.push(zo.anchor);zoneAnchor(zo,zp);zoneText(zo);return zo;});}
function zoneAnchor(zo,zp){zo.anchor.pos.set(zo.g.position.x,.1,zo.g.position.z+(zp.up?-1.2:1.25));zo.el.classList.toggle('up',!!zp.up);}
function zoneText(z){const t=st.cfg.round_type;const total=st.unit.items.filter(i=>i.answer===z.data.id).length;
  z.el.textContent=t==='sort'?z.data.label+' '+z.count+'/'+total:(z.placed[0]?z.data.label+(E.portrait?' ✓':'：'+z.placed[0].data.label):z.data.label);}

/* items: bamboo slips */
function makeItem(data,decoy,pos){const g=new THREE.Group();E.scene.add(g);
  for(let i=0;i<6;i++)E.box(.13,.06,.5,0xE2C98E,-.33+i*.135,0,0,g);E.box(.86,.065,.04,0x8A5A2B,0,0,-.15,g);E.box(.86,.065,.04,0x8A5A2B,0,0,.15,g);
  const hit=E.mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshBasicMaterial({visible:false}),0,.2,0,g);
  const el=document.createElement('button');el.className='it';el.textContent=data.label;$('labels').appendChild(el);
  const it={data,decoy,g,hit,el,state:'ground',home:pos.clone(),fly:null,anchor:{el,pos:V()}};g.position.copy(pos).setY(.05);g.rotation.y=(Math.random()-.5)*.6;hit.userData.item=it;
  el.addEventListener('click',()=>clickItem(it));E.anchors.push(it.anchor);st.items.push(it);return it;}
function flyTo(it,to,h,dur,done){it.state='flying';it.fly={from:it.g.position.clone(),to:to.clone(),t:0,h,dur,done};}
function clearRound(){st.items.forEach(i=>{E.scene.remove(i.g);i.el.remove();});st.zones.forEach(z=>{E.scene.remove(z.g);z.el.remove();});st.items=[];st.zones=[];E.anchors.length=0;st.carried=null;KS.incenseAt=null;}
function placeOff(z,k){const m=z.model;return V(((k%3)-1)*.3,m.top+.06+Math.floor(k/3)*.08+k*.01,(m.dz||0)+((k%2)?.1:-.1));}
function relayout(){const n=st.zones.length;st.zones.forEach(z=>{const zp=zonePos(z.i,n);z.g.position.set(zp.x,0,zp.z).add(O());zoneAnchor(z,zp);zoneText(z);z.placed.forEach((it,k)=>it.g.position.copy(z.g.position).add(placeOff(z,k)));});
  st.items.filter(i=>i.state==='ground').forEach(i=>{const s=freeSlot();i.home=s;i.g.position.set(s.x,.05,s.z);});homeNPCs(true);}
function setupRound(i){clearRound();st.unit=C.units[i];st.cfg=GM.rounds[i];st.O=V(...W.rounds[i].position);KS.petalSpawn=W.rounds[i].template==='apricot_court'?st.O:null;
  buildZones(st.unit);const sl=E.shuffle(slots());let k=0;st.unit.items.forEach(d=>makeItem(d,false,sl[k++]));
  const decoys=E.shuffle(st.unit.decoys);const init=st.cfg.decoys.initial;decoys.slice(0,init).forEach(d=>makeItem(d,true,sl[k++]));st.pending=decoys.slice(init);
  st.time=st.cfg.duration_sec;st.combo=0;st.hint=0;st.helps=st.cfg.companion_assist.uses;st.rivalT=0;st.kickT=0;st.rivalBusy=false;st.wrongs=0;
  P.root.position.copy(V(...(E.portrait?W.arena.player_start_portrait:W.arena.player_start)).add(O()));P.target.copy(P.root.position);P.onArrive=null;P.lookAt=null;R.onArrive=null;homeNPCs(true);hud();}

/* interaction */
function clickItem(it){if(!st.running||it.state!=='ground')return;E.hideBubble();const dir=P.root.position.clone().sub(it.g.position);dir.y=0;if(dir.length()>.01)dir.setLength(.55);
  P.target.copy(it.g.position).add(dir).setY(0);P.lookAt=it.g.position;
  P.onArrive=()=>{if(!st.running||it.state!=='ground')return;if(st.carried){const c=st.carried;st.carried=null;c.el.classList.remove('carry');c.home=freeSlot(it.g.position);flyTo(c,c.home,.8,.45,()=>c.state='ground');}
    it.state='carried';st.carried=it;it.el.classList.add('carry');P.lookAt=null;E.emote(P,'hop');};
  if(P.root.position.distanceTo(P.target)<.05){const f=P.onArrive;P.onArrive=null;f();}}
function clickZone(z){if(!st.running)return;if(!st.carried){toast('先撿起一片竹簡','點擊地上的竹簡，再點擊目的地。','');return;}
  P.target.copy(z.g.position).add(V(0,0,(z.model.dz||0)+(E.portrait?1.35:1.55))).setY(0);P.lookAt=z.g.position;P.onArrive=()=>{if(!st.running||!st.carried)return;P.lookAt=null;drop(st.carried,z);};}
function drop(it,z){st.carried=null;it.el.classList.remove('carry');const ok=!it.decoy&&it.data.answer===z.data.id;
  if(ok){const k=z.placed.length;z.placed.push(it);z.count++;it.el.hidden=true;flyTo(it,z.g.position.clone().add(placeOff(z,k)),.6,.4,()=>{it.state='placed';});it.state='placing';
    st.combo++;const pts=GM.scoring.correct+GM.scoring.combo_bonus*(st.combo-1);addScore(pts);toast('正確 +'+pts+(st.combo>1?'　連擊 ×'+st.combo:''),it.data.explain,'ok');
    E.emote(GK,'hop');z.flash=1;E.flash(true);zoneText(z);hud();sparkle(z.g.position.clone().add(V(0,z.model.top+.4,z.model.dz||0)));
    if(st.items.filter(i=>!i.decoy).every(i=>i.state==='placed'||i.state==='placing'))setTimeout(()=>end('clear'),700);}
  else{st.combo=0;st.wrongs++;addScore(GM.scoring.wrong);const right=it.decoy?'不屬於任何位置（小人丟下的誘餌）':'應放在「'+st.unit.zones.find(x=>x.id===it.data.answer).label+'」';
    st.mistakes.push({round:st.round,item:it.data.label,put:z.data.label,right,explain:it.data.explain,miss:false});toast('放錯了 '+GM.scoring.wrong,it.data.explain,'bad');
    E.emote(R,'hop');E.emote(GK,'shake');E.flash(false);E.floatBubble(R,st.unit.lines.rival_taunt,2600);
    const s=freeSlot(z.g.position);it.home=s;flyTo(it,z.g.position.clone().setY(.6),.2,.15,()=>flyTo(it,s,1.6,.6,()=>it.state='ground'));hud();}}
const sparks=[];function sparkle(p){for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.05,6,4),new THREE.MeshBasicMaterial({color:0xFFE08A,transparent:true}));m.position.copy(p);E.scene.add(m);sparks.push({m,v:V((Math.random()-.5)*2,Math.random()*2+1,(Math.random()-.5)*2),life:.9});}}
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
E.canvas.addEventListener('click',e=>{if(!st.running)return;const r=E.canvas.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pm,E.camera);
  const zm=[];st.zones.forEach(z=>z.g.traverse(o=>{if(o.isMesh)zm.push(o);}));const hits=ray.intersectObjects(st.items.filter(i=>i.state==='ground').map(i=>i.hit).concat(zm),false);
  for(const h of hits){if(h.object.userData.item){clickItem(h.object.userData.item);return;}if(h.object.userData.zone){clickZone(h.object.userData.zone);return;}}
  const pt=V();if(ray.ray.intersectPlane(new THREE.Plane(V(0,1,0),0),pt)){const d=pt.sub(O());P.target.set(Math.max(-8,Math.min(8,d.x)),0,Math.max(-6,Math.min(6,d.z))).add(O());P.onArrive=null;P.lookAt=null;}});

/* tools */
$('assist').addEventListener('click',()=>{if(!st.running)return;if(st.hint>=3){E.bubble('學伴','提示已經用完了，相信自己！',2500);return;}const lv=++st.hint;st.time=Math.max(1,st.time-GM.rounds[st.round].hint_time_cost_sec);
  E.bubble('學伴提示 '+lv+'/3（−5 秒）',st.unit.hints[lv-1],6000);if(lv===1){st.zones.forEach(z=>z.el.classList.add('hl'));setTimeout(()=>st.zones.forEach(z=>z.el.classList.remove('hl')),2500);}
  if(lv===2){const c=st.items.find(i=>!i.decoy&&i.state==='ground');if(c){c.el.classList.add('hl');setTimeout(()=>c.el.classList.remove('hl'),4000);}}
  if(lv===3){st.items.filter(i=>i.decoy).forEach(i=>i.el.classList.add('decoy'));st.markDecoys=true;}hud();});
$('help').addEventListener('click',()=>{if(!st.running||st.helps<=0)return;const c=E.shuffle(st.items.filter(i=>!i.decoy&&i.state==='ground'))[0];if(!c)return;st.helps--;const z=st.zones.find(z=>z.data.id===c.data.answer);
  E.emote(CP,'hop');E.floatBubble(CP,'這片我來！',1800);const k=z.placed.length;z.placed.push(c);z.count++;c.el.hidden=true;flyTo(c,z.g.position.clone().add(placeOff(z,k)),2.2,.9,()=>c.state='placed');c.state='placing';zoneText(z);
  toast(C.npc_slots.companion.display_name+'幫你放好了','「'+c.data.label+'」：'+c.data.explain,'ok');hud();if(st.items.filter(i=>!i.decoy).every(i=>i.state==='placed'||i.state==='placing'))setTimeout(()=>end('clear'),1000);});

/* rival */
function rivalAct(dt){if(st.rivalBusy)return;st.rivalT+=dt;st.kickT+=dt;const cfg=st.cfg;
  if(st.pending.length&&st.rivalT>=cfg.decoys.rival_drop_interval_sec){st.rivalT=0;st.rivalBusy=true;const s=freeSlot(P.root.position);R.speed=3.6;R.target.copy(s).add(V(.7,0,.4));
    R.onArrive=()=>{if(!st.running){st.rivalBusy=false;return;}const d=st.pending.shift();const it=makeItem(d,true,R.root.position.clone().setY(1.6));if(st.markDecoys)it.el.classList.add('decoy');flyTo(it,s,.6,.4,()=>it.state='ground');it.home=s;E.emote(R,'hop');E.floatBubble(R,st.unit.lines.rival_interfere,2200);setTimeout(()=>{R.target.copy(post('rival'));st.rivalBusy=false;},500);};return;}
  if(cfg.rival_kick_interval_sec>0&&st.kickT>=cfg.rival_kick_interval_sec){const cand=st.items.filter(i=>i.state==='ground');if(!cand.length)return;st.kickT=0;st.rivalBusy=true;
    const it=cand.sort((a,b)=>a.g.position.distanceTo(P.root.position)-b.g.position.distanceTo(P.root.position))[0];R.speed=3.8;R.target.copy(it.g.position).add(V(.6,0,.3));
    R.onArrive=()=>{if(st.running&&it.state==='ground'){const s=freeSlot(it.g.position);it.home=s;flyTo(it,s,1.8,.7,()=>it.state='ground');E.emote(R,'hop');E.floatBubble(R,st.unit.lines.rival_interfere,2200);}setTimeout(()=>{R.target.copy(post('rival'));st.rivalBusy=false;},500);};}}

/* frame */
const tv=V();
function onFrame(dt,t){
  if(st.running){st.time-=dt;if(st.time<=0){st.time=0;end('timeout');}timerText();rivalAct(dt);tv.copy(P.root.position).add(V(0,1.3,0));[MT,CP,GK].forEach(c=>c.lookAt=tv);}
  st.items.forEach(it=>{if(it.fly){const f=it.fly;f.t=Math.min(1,f.t+dt/f.dur);it.g.position.lerpVectors(f.from,f.to,f.t);it.g.position.y=f.from.y+(f.to.y-f.from.y)*f.t+Math.sin(f.t*Math.PI)*f.h;it.g.rotation.y+=dt*6;if(f.t>=1){it.fly=null;it.g.position.copy(f.to);if(f.done)f.done();}}
    else if(it.state==='carried'){it.g.position.copy(P.root.position).add(V(0,1.95+Math.sin(t*6)*.04,0));it.g.rotation.y=P.root.rotation.y;}it.anchor.pos.copy(it.g.position).add(V(0,it.state==='carried'?.25:.32,0));});
  st.zones.forEach(z=>{z.flash*=Math.pow(.15,dt);if(z.model.glow&&z.model.glow.material.emissive)z.model.glow.material.emissive.setRGB(z.flash*.5,z.flash*.45,z.flash*.2);});
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.life-=dt;s.m.position.addScaledVector(s.v,dt);s.v.y-=4*dt;s.m.material.opacity=Math.max(0,s.life);if(s.life<=0){E.scene.remove(s.m);sparks.splice(i,1);}}
  if(KIT.onFrame)KIT.onFrame(dt,t);}
function hud(){$('score').textContent=st.score;$('combo').textContent=st.combo;$('assist').disabled=!st.running||st.hint>=3;$('help').disabled=!st.running||st.helps<=0;$('helpCount').textContent=st.helps+' 次';timerText();}
function timerText(){const s=Math.ceil(st.time);$('timer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');$('timer').classList.toggle('low',st.running&&st.time<10);}
function addScore(n){st.score=Math.max(0,st.score+n);}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3400);}
function end(reason){if(!st.running)return;st.running=false;[MT,CP,GK].forEach(c=>c.lookAt=null);hud();if(st.endRes){const r=st.endRes;st.endRes=null;r(reason);}}

/* flow */
async function title(){
  E.overlay('<div class="title"><div class="v">'+(C.meta.short_title||C.meta.topic)+'</div><div class="v a">'+(C.meta.author||"")+'</div><div class="side"><p>'+((C.meta.title_lines||["限時之內，把每一片竹簡","送到正確的位置。"]).join("<br>"))+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');const d={mentor:'每回合開始前說明任務',companion:'每回合可以幫你搬一片竹簡',rival:'會丟下誘餌、把竹簡踢走',gatekeeper:'在目的地驗收你搬來的竹簡'};
  E.overlay('<div class="card"><h2>同行的人</h2><div class="cast"><div>'+E.glyph('P')+'<p style="margin:0"><b>你</b><br><span>點擊竹簡撿起，再點擊目的地放下。一次只能搬一片。</span></p></div>'+slotKeys.map(s=>'<div>'+E.glyph(C.npc_slots[s].character_id)+'<p style="margin:0"><b>'+C.npc_slots[s].display_name+'</b><br><span>'+d[s]+'</span></p></div>').join('')+
    '</div><p class="sub">連續答對有連擊加分；放錯扣 5 分。「學伴提示」每次扣 5 秒。</p><button class="primary" id="go">出發</button></div>',true);await E.waitClick('#go');E.clearOverlay();}
async function playRound(i){const R0=W.rounds[i];st.round=i;setupRound(i);const u=st.unit;E.setEnv(R0.env);
  st.items.forEach(it=>it.el.hidden=true);st.zones.forEach(z=>z.el.hidden=true);
  E.overlay('<div class="roundcard"><small>第'+E.NUM[i]+'回合　'+TYPE[st.cfg.round_type]+'</small><h2>'+u.title+'</h2><p>'+R0.place+'　限時 '+st.cfg.duration_sec+' 秒</p></div>',true);
  const v=view();await Promise.all([E.camTo(v.p,v.l,i===0?1.8:2.6),Promise.race([E.sleep(E.RM?900:2200),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))])]);E.clearOverlay();
  $('hud').hidden=false;$('roundNo').textContent='第'+E.NUM[i]+'回合';$('roundTitle').textContent=u.title;hud();st.zones.forEach(z=>z.el.hidden=false);
  await E.say('mentor',u.lines.intro,{btn:'開始'});E.hideDialog();st.items.forEach(it=>it.el.hidden=false);st.markDecoys=false;st.running=true;hud();
  const reason=await new Promise(r=>st.endRes=r);P.onArrive=null;P.target.copy(P.root.position);
  if(st.carried){const c=st.carried;st.carried=null;c.el.classList.remove('carry');c.state='ground';c.g.position.copy(P.root.position).setY(.05);}
  const real=st.items.filter(x=>!x.decoy),placed=real.filter(x=>x.state==='placed'||x.state==='placing').length;
  real.filter(x=>!(x.state==='placed'||x.state==='placing')).forEach(x=>st.mistakes.push({round:i,item:x.data.label,put:'未放置',right:'應放在「'+u.zones.find(z=>z.id===x.data.answer).label+'」',explain:x.data.explain,miss:true}));
  const bonus=reason==='clear'?Math.ceil(st.time)*GM.scoring.time_bonus_per_sec:0;addScore(bonus);hud();const stars=placed===real.length?(st.wrongs===0?3:2):(placed>=real.length/2?1:0);st.stars.push(stars);
  E.flash(reason==='clear');if(reason==='clear'){[MT,CP,GK].forEach(c=>E.emote(c,'hop'));E.emote(R,'slump');}await E.sleep(700);const last=i===C.units.length-1;
  E.overlay('<div class="card"><p class="sub" style="margin:0">'+(reason==='clear'?'全部送達':'時間到')+'</p><h2>'+u.title+'</h2><div class="stars" aria-label="'+stars+' 星">'+'★'.repeat(stars)+'<i>'+'★'.repeat(3-stars)+'</i></div><div class="stats"><div><b>'+placed+'/'+real.length+'</b>完成</div><div><b>'+st.wrongs+'</b>放錯</div><div><b>+'+bonus+'</b>時間獎勵</div><div><b>'+st.score+'</b>總分</div></div><p class="sub">'+u.concept+'</p><button class="primary" id="go">'+(last?'看總結':'前往下一處')+'</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();}
async function summary(){clearRound();$('hud').hidden=true;const total=st.stars.reduce((a,b)=>a+b,0);
  const rv=st.mistakes.length?'<p style="margin-top:8px"><b>錯題回放</b></p><ul class="review">'+st.mistakes.map(m=>'<li class="'+(m.miss?'miss':'')+'"><b>'+m.item+'</b><p>你'+(m.miss?'沒有放置':'放在「'+m.put+'」')+'，'+m.right+'。</p><p>'+m.explain+'</p></li>').join('')+'</ul>':'<p>零失誤，漂亮！</p>';
  E.overlay('<div class="card"><p class="sub" style="margin:0">總結</p><h2>'+(C.endings?(total>=st.stars.length*3*.8?C.endings.best.title:total>=st.stars.length*3*.5?C.endings.normal.title:C.endings.fail.title):(total>=13?'君子坦蕩蕩':total>=8?'學而時習之':'溫故而知新'))+'</h2><div class="stats"><div><b>'+st.score+'</b>總分</div><div><b>'+total+'/'+st.stars.length*3+'</b>星數</div><div><b>'+st.mistakes.filter(m=>!m.miss).length+'</b>放錯</div></div>'+rv+'<p style="font-family:var(--serif)">'+(C.npc_slots.mentor.display_name)+'：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
async function main(){E.start();homeNPCs(true);await title();for(let i=Math.max(0,(window.__startRound||1)-1);i<C.units.length;i++)await playRound(i);await summary();}
main();
})();
