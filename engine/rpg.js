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
