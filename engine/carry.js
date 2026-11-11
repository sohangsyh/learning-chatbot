/* Carry mode (3D timed sorting) built on ENG */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const TYPE={sort:'分類',pair:'配對',sequence:'排序',single:'單選'};
const ZCOL=[0x3E9C82,0xC8452F,0x4E6FC4,0xC98E1E];
const st={round:-1,running:false,score:0,combo:0,time:0,items:[],zones:[],carried:null,mistakes:[],stars:[],hint:0,helps:0,pending:[],rivalT:0,kickT:0,rivalBusy:false,endRes:null,unit:null,cfg:null,wrongs:0};
window.__carry=st;

E.init({canvas:$('scene'),onResize:changed=>{setCam();if(changed&&st.round>=0)relayout();},onFrame});
E.bindDialog();E.ENV.courtyard={sky:0xB5D2DE,hs:0xEDE6D8,hg:0x5C6450,hi:.58,sc:0xFFE4BC,si:.58,sp:[10,20,14]};E.setEnv('courtyard',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const scene=E.scene;

/* scene kit: apricot courtyard */
const ground=[];
(function(){
  const g=new THREE.Group();scene.add(g);
  const grass=E.mesh(new THREE.PlaneGeometry(240,240),E.M(0x7FA35C),0,0,0,g);grass.rotation.x=-Math.PI/2;ground.push(grass);
  const pave=E.mesh(new THREE.PlaneGeometry(17.4,15),E.M(0xC2B391),0,.01,-.8,g);pave.rotation.x=-Math.PI/2;ground.push(pave);
  for(let x=-8;x<=8;x+=2)E.box(.04,.004,15,0xAE9F7E,x,.013,-.8,g);
  for(let z=-8;z<=6;z+=2)E.box(17.4,.004,.04,0xAE9F7E,0,.013,z,g);
  const wall=(x,z,len,ry)=>{const w=new THREE.Group();w.position.set(x,0,z);w.rotation.y=ry;g.add(w);E.box(len,1.5,.3,0xE2D6BC,0,.75,0,w);E.box(len+.25,.2,.55,0x4D5862,0,1.6,0,w);};
  wall(0,-8.3,17.8,0);wall(-8.9,-1.6,13.4,Math.PI/2);wall(8.9,-1.6,13.4,Math.PI/2);
  E.house(g,0,-11,10,3.6,3.6,0xA8322A,0x4D5862,0);E.house(g,-9,-11.5,5,3,2.8,0xE6D6B4,0x4D5862,0);E.house(g,9,-11.5,5,3,2.8,0xE6D6B4,0x4D5862,0);
  const pinks=[0xF2A7B5,0xE98FA4,0xF5BFCB];
  [[-7.3,-7],[7.3,-7],[-7.6,4.6],[7.6,4.6],[-11.5,0],[11.5,-2],[-12,-6],[12.5,3]].forEach(([x,z],i)=>E.tree(g,x,z,1.25,'',pinks[i%3]));
  const r=E.rng(5);for(let i=0;i<60;i++){const a=r()*Math.PI*2,d=16+r()*40;E.tree(g,Math.cos(a)*d,Math.sin(a)*d-6,.9+r()*.9,r()<.4?'pine':'',[0x6FA35A,0x7DB062,0x5E9450][i%3]);}
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,d=90+r()*30,h=16+r()*22;const m=E.mesh(new THREE.ConeGeometry(12+r()*10,h,5),E.M(r()<.5?0x7C98A0:0x8FA7A0,{flatShading:true}),Math.cos(a)*d,h/2-1,Math.sin(a)*d-20,g);m.rotation.y=r()*3;}
  E.box(3.6,.28,2,0xBFB094,0,.14,-6.6,g);
  [-6,-2,2,6].forEach(x=>E.lantern(g,x,1.25,-8.05));
})();

/* characters */
const slotKeys=Object.keys(C.npc_slots);
slotKeys.forEach(s=>E.makeChar(s,C.npc_slots[s].character_id,C.npc_slots[s].costume));
const P=E.makeChar('player','P',[]);P.speed=4.8;
const R=E.chars.rival,CP=E.chars.companion,GK=E.chars.gatekeeper,MT=E.chars.mentor;
E.lampValue=()=>Math.min(1,.3+st.combo*.14);
function post(slot){const l=W.npc_layout[slot];const k=E.portrait?.52:1;return V(l[0]*k,0,l[2]);}
function homeNPCs(instant){slotKeys.forEach(s=>{const c=E.chars[s];c.target.copy(post(s));if(instant)c.root.position.copy(c.target);});}
homeNPCs(true);P.root.position.set(...W.arena.player_start);P.target.copy(P.root.position);
$('helpIcon').innerHTML=E.glyph(C.npc_slots.companion.character_id).replace('<svg','<svg style="width:18px;height:18px"');
$('helpLabel').textContent=C.npc_slots.companion.display_name+'幫忙';

/* camera */
function view(){return E.portrait?{p:V(0,16.5,8.6),l:V(0,0,-.5)}:{p:V(0,10.8,10.6),l:V(0,0,-1.3)};}
function setCam(){if(st.round<0)return;const v=view();E.camSet(v.p,v.l);}
E.parallax=.35;
E.cam.idle=t=>{if(st.round>=0)return;const a=t*.07;E.camera.position.set(Math.sin(a)*14,7.5,Math.cos(a)*14-1);E.cam.look.set(0,.8,-1.5);};
E.camera.position.set(0,7.5,13);

/* layout */
function zonePos(i,n){const zr=W.arena.zone_row_z;
  if(E.portrait&&n===4)return {x:(i%2?1.75:-1.75),z:i<2?zr-1.1:zr+.6,up:i<2};
  const sp=E.portrait?2.25:3.3;return {x:(i-(n-1)/2)*sp,z:zr,up:false};}
function slots(){const cols=E.portrait?2:5,sx=E.portrait?3.3:2.4,sz=E.portrait?1.2:1.3,zmax=E.portrait?4.3:2.9,out=[];
  for(let r=0;r<6;r++)for(let c=0;c<cols;c++){const z=-1.7+r*sz;if(z>zmax)continue;out.push(V((c-(cols-1)/2)*sx+(r%2?.3:-.3),0,z));}return out;}
function freeSlot(avoid){const all=E.shuffle(slots());const used=st.items.filter(i=>i.state==='ground'||i.state==='flying').map(i=>i.home);
  let best=null,bd=-1;for(const s of all){const d=Math.min(...used.map(u=>u?u.distanceTo(s):99),99);const da=avoid?s.distanceTo(avoid):5;const sc=Math.min(d,1.8)+Math.min(da,4)*.2;if(sc>bd){bd=sc;best=s;}}return best.clone();}

/* zones */
function buildZones(u){
  const n=u.zones.length,square=st.cfg.round_type==='pair'||st.cfg.round_type==='sequence';
  st.zones=u.zones.map((z,i)=>{
    const zp=zonePos(i,n);const g=new THREE.Group();g.position.set(zp.x,0,zp.z);scene.add(g);
    const col=ZCOL[i%4];const mat=new THREE.MeshToonMaterial({color:col,gradientMap:E.M(0).gradientMap,emissive:0x000000});
    const pad=square?E.mesh(new THREE.BoxGeometry(1.6,.12,1.2),mat,0,.06,0,g):E.mesh(new THREE.CylinderGeometry(1,1,.12,32),mat,0,.06,0,g);
    const rim=square?E.mesh(new THREE.BoxGeometry(1.75,.06,1.35),E.M(0xF4EBD6),0,.03,0,g):E.mesh(new THREE.CylinderGeometry(1.1,1.1,.06,32),E.M(0xF4EBD6),0,.03,0,g);
    pad.userData.zone=rim.userData.zone=null;
    const el=document.createElement('button');el.className='zl';el.style.background=E.hex(col);$('labels').appendChild(el);
    const zo={data:z,i,g,pad,mat,el,count:0,flash:0,square,pos:g.position,anchor:{el,pos:V()},placed:[]};zoneAnchor(zo,zp);
    pad.userData.zone=zo;rim.userData.zone=zo;el.addEventListener('click',()=>clickZone(zo));E.anchors.push(zo.anchor);zoneText(zo);return zo;});
}
function zoneAnchor(zo,zp){const d=zo.square?.75:1.15;zo.anchor.pos.set(zp.x,.1,zp.z+(zp.up?-d:d));zo.el.classList.toggle('up',!!zp.up);}
function zoneText(z){const t=st.cfg.round_type;const total=st.unit.items.filter(i=>i.answer===z.data.id).length;
  z.el.textContent=t==='sort'?z.data.label+' '+z.count+'/'+total:(z.placed[0]?z.data.label+(E.portrait?' ✓':'：'+z.placed[0].data.label):z.data.label);}

/* items */
function makeItem(data,decoy,pos){
  const g=new THREE.Group();scene.add(g);
  E.box(.86,.07,.36,0xE2C98E,0,0,0,g);E.box(.88,.075,.04,0x8A5A2B,0,0,-.11,g);E.box(.88,.075,.04,0x8A5A2B,0,0,.11,g);
  const hit=E.mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshBasicMaterial({visible:false}),0,.2,0,g);
  const el=document.createElement('button');el.className='it';el.textContent=data.label;$('labels').appendChild(el);
  const it={data,decoy,g,hit,el,state:'ground',home:pos.clone(),pos:g.position,fly:null,anchor:{el,pos:V()}};
  g.position.copy(pos).setY(.05);g.rotation.y=(Math.random()-.5)*.6;hit.userData.item=it;
  el.addEventListener('click',()=>clickItem(it));E.anchors.push(it.anchor);st.items.push(it);return it;
}
function flyTo(it,to,h,dur,done){it.state='flying';it.fly={from:it.g.position.clone(),to:to.clone(),t:0,h,dur,done};}

/* round setup */
function clearRound(){
  st.items.forEach(i=>{scene.remove(i.g);i.el.remove();});st.zones.forEach(z=>{scene.remove(z.g);z.el.remove();});
  st.items=[];st.zones=[];E.anchors.length=0;st.carried=null;
}
function relayout(){
  const n=st.zones.length;st.zones.forEach(z=>{const zp=zonePos(z.i,n);z.g.position.set(zp.x,0,zp.z);zoneAnchor(z,zp);zoneText(z);
    z.placed.forEach((it,k)=>{it.g.position.copy(z.g.position).add(placeOff(z,k));});});
  st.items.filter(i=>i.state==='ground').forEach(i=>{const s=freeSlot();i.home=s;i.g.position.set(s.x,.05,s.z);});
  homeNPCs(true);
}
function setupRound(i){
  clearRound();st.unit=C.units[i];st.cfg=GM.rounds[i];
  buildZones(st.unit);
  const sl=E.shuffle(slots());let k=0;
  st.unit.items.forEach(d=>makeItem(d,false,sl[k++]));
  const decoys=E.shuffle(st.unit.decoys);const init=st.cfg.decoys.initial;
  decoys.slice(0,init).forEach(d=>makeItem(d,true,sl[k++]));st.pending=decoys.slice(init);
  st.time=st.cfg.duration_sec;st.combo=0;st.hint=0;st.helps=st.cfg.companion_assist.uses;st.rivalT=0;st.kickT=0;st.rivalBusy=false;st.wrongs=0;
  P.root.position.set(...(E.portrait?W.arena.player_start_portrait:W.arena.player_start));P.target.copy(P.root.position);P.onArrive=null;P.lookAt=null;R.onArrive=null;
  homeNPCs(true);hud();
}

/* interaction */
function clickItem(it){
  if(!st.running||it.state!=='ground')return;E.hideBubble();
  const dir=P.root.position.clone().sub(it.g.position);dir.y=0;if(dir.length()>.01)dir.setLength(.55);
  P.target.copy(it.g.position).add(dir).setY(0);P.lookAt=it.g.position;
  P.onArrive=()=>{if(!st.running||it.state!=='ground')return;
    if(st.carried){const c=st.carried;st.carried=null;c.state='ground';c.home=freeSlot(it.g.position);flyTo(c,c.home,.8,.45,()=>c.state='ground');}
    it.state='carried';st.carried=it;it.el.classList.add('carry');P.lookAt=null;E.emote(P,'hop');};
  if(P.root.position.distanceTo(P.target)<.05){const f=P.onArrive;P.onArrive=null;f();}
}
function clickZone(z){
  if(!st.running)return;
  if(!st.carried){toast('先撿起一片竹簡','點擊地上的竹簡，再點擊答案區。','');return;}
  P.target.copy(z.g.position).add(V(0,0,E.portrait?1.25:1.45));P.lookAt=z.g.position;
  P.onArrive=()=>{if(!st.running||!st.carried)return;P.lookAt=null;drop(st.carried,z);};
}
function placeOff(z,k){return V(((k%3)-1)*.32,.14+Math.floor(k/3)*.08+k*.01,((k%2)?.12:-.12));}
function drop(it,z){
  st.carried=null;it.el.classList.remove('carry');
  const ok=!it.decoy&&it.data.answer===z.data.id;
  if(ok){
    const k=z.placed.length;z.placed.push(it);z.count++;it.el.hidden=true;
    flyTo(it,z.g.position.clone().add(placeOff(z,k)),.6,.4,()=>{it.state='placed';});it.state='placing';
    st.combo++;const pts=GM.scoring.correct+GM.scoring.combo_bonus*(st.combo-1);addScore(pts);
    toast('正確 +'+pts+(st.combo>1?'　連擊 ×'+st.combo:''),it.data.explain,'ok');
    E.emote(GK,'hop');z.flash=1;E.flash(true);zoneText(z);hud();
    if(st.items.filter(i=>!i.decoy).every(i=>i.state==='placed'||i.state==='placing'))setTimeout(()=>end('clear'),700);
  }else{
    st.combo=0;st.wrongs++;addScore(GM.scoring.wrong);
    const right=it.decoy?'不屬於任何位置（小人丟下的誘餌）':'應放在「'+st.unit.zones.find(x=>x.id===it.data.answer).label+'」';
    st.mistakes.push({round:st.round,item:it.data.label,put:z.data.label,right,explain:it.data.explain,miss:false});
    toast('放錯了 '+GM.scoring.wrong,it.data.explain,'bad');
    E.emote(R,'hop');E.emote(GK,'shake');E.flash(false);E.floatBubble(R,st.unit.lines.rival_taunt,2600);
    const s=freeSlot(z.g.position);it.home=s;flyTo(it,z.g.position.clone().setY(.4),.2,.15,()=>flyTo(it,s,1.6,.6,()=>it.state='ground'));hud();
  }
}
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
E.canvas.addEventListener('click',e=>{
  if(!st.running)return;const r=E.canvas.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pm,E.camera);
  const hits=ray.intersectObjects(st.items.filter(i=>i.state==='ground').map(i=>i.hit).concat(st.zones.flatMap(z=>z.g.children)),false);
  for(const h of hits){if(h.object.userData.item){clickItem(h.object.userData.item);return;}if(h.object.userData.zone){clickZone(h.object.userData.zone);return;}}
  const g=ray.intersectObjects(ground)[0];if(g){P.target.set(Math.max(-8,Math.min(8,g.point.x)),0,Math.max(-7.5,Math.min(6.2,g.point.z)));P.onArrive=null;P.lookAt=null;}
});

/* tools */
$('assist').addEventListener('click',()=>{
  if(!st.running)return;const lv=Math.min(3,st.hint+1);if(st.hint>=3){E.bubble('學伴','提示已經用完了，相信自己！',2500);return;}
  st.hint=lv;st.time=Math.max(1,st.time-GM.rounds[st.round].hint_time_cost_sec);
  E.bubble('學伴提示 '+lv+'/3（−5 秒）',st.unit.hints[lv-1],6000);
  if(lv===1){st.zones.forEach(z=>z.el.classList.add('hl'));setTimeout(()=>st.zones.forEach(z=>z.el.classList.remove('hl')),2500);}
  if(lv===2){const c=st.items.find(i=>!i.decoy&&i.state==='ground');if(c){c.el.classList.add('hl');setTimeout(()=>c.el.classList.remove('hl'),4000);}}
  if(lv===3){st.items.filter(i=>i.decoy).forEach(i=>i.el.classList.add('decoy'));st.markDecoys=true;}
  hud();
});
$('help').addEventListener('click',()=>{
  if(!st.running||st.helps<=0)return;const c=E.shuffle(st.items.filter(i=>!i.decoy&&i.state==='ground'))[0];if(!c)return;
  st.helps--;const z=st.zones.find(z=>z.data.id===c.data.answer);E.emote(CP,'hop');E.floatBubble(CP,'這片我來！',1800);
  const k=z.placed.length;z.placed.push(c);z.count++;c.el.hidden=true;
  flyTo(c,z.g.position.clone().add(placeOff(z,k)),2.2,.9,()=>c.state='placed');c.state='placing';zoneText(z);
  toast(C.npc_slots.companion.display_name+'幫你放好了','「'+c.data.label+'」：'+c.data.explain,'ok');hud();
  if(st.items.filter(i=>!i.decoy).every(i=>i.state==='placed'||i.state==='placing'))setTimeout(()=>end('clear'),1000);
});

/* rival */
function rivalAct(dt){
  if(st.rivalBusy)return;st.rivalT+=dt;st.kickT+=dt;const cfg=st.cfg;
  if(st.pending.length&&st.rivalT>=cfg.decoys.rival_drop_interval_sec){
    st.rivalT=0;st.rivalBusy=true;const s=freeSlot(P.root.position);R.speed=3.6;R.target.copy(s).add(V(.7,0,.4));
    R.onArrive=()=>{if(!st.running){st.rivalBusy=false;return;}const d=st.pending.shift();const it=makeItem(d,true,R.root.position.clone().setY(1.6));if(st.markDecoys)it.el.classList.add('decoy');
      flyTo(it,s,.6,.4,()=>it.state='ground');it.home=s;E.emote(R,'hop');E.floatBubble(R,st.unit.lines.rival_interfere,2200);
      setTimeout(()=>{R.target.copy(post('rival'));st.rivalBusy=false;},500);};
    return;}
  if(cfg.rival_kick_interval_sec>0&&st.kickT>=cfg.rival_kick_interval_sec){
    const cand=st.items.filter(i=>i.state==='ground');if(!cand.length)return;
    st.kickT=0;st.rivalBusy=true;const it=cand.sort((a,b)=>a.g.position.distanceTo(P.root.position)-b.g.position.distanceTo(P.root.position))[0];
    R.speed=3.8;R.target.copy(it.g.position).add(V(.6,0,.3));
    R.onArrive=()=>{if(st.running&&it.state==='ground'){const s=freeSlot(it.g.position);it.home=s;flyTo(it,s,1.8,.7,()=>it.state='ground');E.emote(R,'hop');E.floatBubble(R,st.unit.lines.rival_interfere,2200);}
      setTimeout(()=>{R.target.copy(post('rival'));st.rivalBusy=false;},500);};
  }
}

/* frame */
const tv=V();
function onFrame(dt,t){
  if(st.running){st.time-=dt;if(st.time<=0){st.time=0;end('timeout');}timerText();rivalAct(dt);
    tv.copy(P.root.position).add(V(0,1.3,0));[MT,CP,GK].forEach(c=>c.lookAt=tv);}
  st.items.forEach(it=>{
    if(it.fly){const f=it.fly;f.t=Math.min(1,f.t+dt/f.dur);it.g.position.lerpVectors(f.from,f.to,f.t);it.g.position.y=f.from.y+(f.to.y-f.from.y)*f.t+Math.sin(f.t*Math.PI)*f.h;it.g.rotation.y+=dt*6;
      if(f.t>=1){it.fly=null;it.g.position.copy(f.to);if(f.done)f.done();}}
    else if(it.state==='carried'){it.g.position.copy(P.root.position).add(V(0,1.95+Math.sin(t*6)*.04,0));it.g.rotation.y=P.root.rotation.y;}
    it.anchor.pos.copy(it.g.position).add(V(0,it.state==='carried'?.25:.32,0));
  });
  st.zones.forEach(z=>{z.flash*=Math.pow(.15,dt);z.mat.emissive.setRGB(z.flash*.5,z.flash*.45,z.flash*.2);});
}

/* hud */
function hud(){$('score').textContent=st.score;$('combo').textContent=st.combo;
  $('assist').disabled=!st.running||st.hint>=3;$('help').disabled=!st.running||st.helps<=0;$('helpCount').textContent=st.helps+' 次';timerText();}
function timerText(){const s=Math.ceil(st.time);$('timer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');$('timer').classList.toggle('low',st.running&&st.time<10);}
function addScore(n){st.score=Math.max(0,st.score+n);}
let toastT=null;
function toast(title,text,cls){const el=$('toast');el.className=cls||'';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3400);}
function end(reason){if(!st.running)return;st.running=false;[MT,CP,GK].forEach(c=>c.lookAt=null);hud();if(st.endRes){const r=st.endRes;st.endRes=null;r(reason);}}

/* flow */
async function title(){
  E.overlay('<div class="title"><div class="v">論語</div><div class="v a">論仁　論孝　論君子</div><div class="side"><p>杏壇之上，竹簡散落一地。<br>限時之內，把每一片送到正確的位置。</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  const d={mentor:'每回合開始前說明任務',companion:'每回合可以幫你搬一片竹簡',rival:'會丟下誘餌、把竹簡踢走',gatekeeper:'在答案區驗收你搬來的竹簡'};
  E.overlay('<div class="card"><h2>杏壇上的人</h2><div class="cast"><div>'+E.glyph('P')+'<p style="margin:0"><b>你</b><br><span>點擊竹簡撿起，再點擊答案區放下。一次只能搬一片。</span></p></div>'+
    slotKeys.map(s=>'<div>'+E.glyph(C.npc_slots[s].character_id)+'<p style="margin:0"><b>'+C.npc_slots[s].display_name+'</b><br><span>'+d[s]+'</span></p></div>').join('')+
    '</div><p class="sub">連續答對有連擊加分；放錯扣 5 分。「學伴提示」每次扣 5 秒。</p><button class="primary" id="go">進入杏壇</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();
}
async function playRound(i){
  st.round=i;setupRound(i);const u=st.unit;
  const v=view();await E.camTo(v.p,v.l,i===0?1.8:.01);
  $('hud').hidden=false;$('roundNo').textContent='第'+E.NUM[i]+'回合';$('roundTitle').textContent=u.title;hud();
  st.items.forEach(it=>it.el.hidden=true);
  E.overlay('<div class="roundcard"><small>第'+E.NUM[i]+'回合　'+TYPE[st.cfg.round_type]+'</small><h2>'+u.title+'</h2><p>限時 '+st.cfg.duration_sec+' 秒</p></div>',true);
  await Promise.race([E.sleep(E.RM?900:1800),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  await E.say('mentor',u.lines.intro,{btn:'開始'});E.hideDialog();
  st.items.forEach(it=>it.el.hidden=false);st.markDecoys=false;
  st.running=true;hud();
  const reason=await new Promise(r=>st.endRes=r);
  P.onArrive=null;P.target.copy(P.root.position);
  if(st.carried){const c=st.carried;st.carried=null;c.el.classList.remove('carry');c.state='ground';c.g.position.copy(P.root.position).setY(.05);}
  const real=st.items.filter(x=>!x.decoy),placed=real.filter(x=>x.state==='placed'||x.state==='placing').length;
  real.filter(x=>!(x.state==='placed'||x.state==='placing')).forEach(x=>st.mistakes.push({round:i,item:x.data.label,put:'未放置',right:'應放在「'+u.zones.find(z=>z.id===x.data.answer).label+'」',explain:x.data.explain,miss:true}));
  const bonus=reason==='clear'?Math.ceil(st.time)*GM.scoring.time_bonus_per_sec:0;addScore(bonus);hud();
  const stars=placed===real.length?(st.wrongs===0?3:2):(placed>=real.length/2?1:0);st.stars.push(stars);
  E.flash(reason==='clear');if(reason==='clear'){[MT,CP,GK].forEach(c=>E.emote(c,'hop'));E.emote(R,'slump');}
  await E.sleep(700);
  const last=i===C.units.length-1;
  E.overlay('<div class="card"><p class="sub" style="margin:0">'+(reason==='clear'?'全部送達':'時間到')+'</p><h2>'+u.title+'</h2><div class="stars" aria-label="'+stars+' 星">'+'★'.repeat(stars)+'<i>'+'★'.repeat(3-stars)+'</i></div>'+
    '<div class="stats"><div><b>'+placed+'/'+real.length+'</b>完成</div><div><b>'+st.wrongs+'</b>放錯</div><div><b>+'+bonus+'</b>時間獎勵</div><div><b>'+st.score+'</b>總分</div></div>'+
    '<p class="sub">'+u.concept+'</p><button class="primary" id="go">'+(last?'看總結':'下一回合')+'</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();
}
async function summary(){
  clearRound();$('hud').hidden=true;
  const total=st.stars.reduce((a,b)=>a+b,0);
  const rv=st.mistakes.length?'<p style="margin-top:8px"><b>錯題回放</b></p><ul class="review">'+st.mistakes.map(m=>'<li class="'+(m.miss?'miss':'')+'"><b>'+m.item+'</b><p>你'+(m.miss?'沒有放置':'放在「'+m.put+'」')+'，'+m.right+'。</p><p>'+m.explain+'</p></li>').join('')+'</ul>':'<p>零失誤，漂亮！</p>';
  E.overlay('<div class="card"><p class="sub" style="margin:0">總結</p><h2>'+(total>=13?'君子坦蕩蕩':total>=8?'學而時習之':'溫故而知新')+'</h2>'+
    '<div class="stats"><div><b>'+st.score+'</b>總分</div><div><b>'+total+'/'+st.stars.length*3+'</b>星數</div><div><b>'+st.mistakes.filter(m=>!m.miss).length+'</b>放錯</div></div>'+rv+
    '<p style="font-family:var(--serif)">孔子：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
async function main(){E.start();await title();for(let i=0;i<C.units.length;i++)await playRound(i);await summary();}
main();
})();
