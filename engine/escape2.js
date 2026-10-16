/* Escape-room mode built on ENG */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const U={};C.units.forEach(u=>U[u.unit_id]=u);
const ST={};GM.stations.forEach(s=>ST[s.unit_id]=s);
const st={started:false,busy:false,score:0,t0:0,elapsed:0,solved:{},unlocked:{},examined:{},inv:{chars:[],items:[]},hints:{},hintsUsed:0,wrongs:0,traps:[],helped:{},objs:{},done:false};
window.__esc=st;
C.units.forEach(u=>{st.unlocked[u.unit_id]=ST[u.unit_id].unlocked_at_start;st.hints[u.unit_id]=0;});

E.init({canvas:$('scene'),onResize:()=>setCam(),onFrame});
E.bindDialog();
E.ENV.room={sky:0x2E3A52,hs:0xFFE3C2,hg:0x4A3A30,hi:.62,sc:0xFFC08A,si:.55,sp:[-10,16,12]};
E.setEnv(W.areas[0].env,true);E.env.dim=.3;
E.SPK={narrator:{name:'你',col:'#F4EBD6'},clue:{name:'線索',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const scene=E.scene;

/* ---------- scene kit: multi-area ---------- */
const ground=[],stationLamps={},plaques=[];
const R0=W.room,AR=W.areas;st.area=0;
const KS=E.kits[W.scene_kit].escapeBuild(W);ground.push(KS.ground);KS.plaques.forEach(p=>plaques.push(p));
const AC=i=>V(...AR[i].center);
const areaOf=p=>{let bi=0,bd=1e9;AR.forEach((a,i)=>{const d=Math.hypot(p.x-a.center[0],p.z-a.center[2]);if(d<bd){bd=d;bi=i;}});return bi;};
const areaOpen=i=>!AR[i].unlock_by||!!st.solved[AR[i].unlock_by];
/* object models */
function model(id){
  if(KS.models[id]){const g=new THREE.Group();const h=KS.models[id](g);return {g,h};}
  const g=new THREE.Group(),M=E.M,mesh=E.mesh,box=E.box;let h=.8;
  const paper=()=>{const p=box(.42,.02,.32,0xF4EFE2,0,.03,0,g);p.rotation.y=.3;box(.3,.022,.03,0x9A8A70,0,.045,-.05,g);box(.22,.022,.03,0x9A8A70,0,.045,.04,g);h=.3;};
  const statue=(fn)=>{box(.7,.36,.5,0x8E8A80,0,.18,0,g);fn();};
  switch(id){
    case 'gourd':{box(1,.3,1,0x6E4A32,0,.15,0);const b=mesh(new THREE.SphereGeometry(.62,16,12),M(0xC9B458),0,.88,0,g);b.scale.set(1,.95,1);mesh(new THREE.SphereGeometry(.32,14,10),M(0xC2AE52),0,1.6,0,g);box(.06,.22,.06,0x6E4A32,0,1.98,0,g);h=2.1;break;}
    case 'cabinet':{box(1.5,1.5,.7,0x7A4A2A,0,.75,0,g);for(let i=0;i<3;i++){box(1.3,.36,.04,0x92603A,0,.35+i*.45,.36,g);box(.16,.05,.05,0xE0B04B,0,.35+i*.45,.4,g);}h=1.6;break;}
    case 'basin':{mesh(new THREE.CylinderGeometry(.9,.75,.4,20),M(0x7A5236),0,.2,0,g);const w=mesh(new THREE.CylinderGeometry(.8,.8,.04,20),M(0x5B8FC4,{emissive:0x0A2A4A}),0,.38,0,g);for(let i=0;i<5;i++){box(.06,.6,.06,0x4D5862,-.8+i*.4,.3,.95,g);mesh(new THREE.SphereGeometry(.07,8,6),M(0xC8452F),-.8+i*.4,.62,.95,g);}h=.9;break;}
    case 'scrollshelf':{box(1.4,1.3,.5,0x7A5236,0,.65,0,g);box(1.3,.05,.45,0x5E3A24,0,.85,.02,g);for(let i=0;i<4;i++){const s=mesh(new THREE.CylinderGeometry(.07,.07,.5,10),M(0xD9C089),-.45+i*.3,.95,0,g);s.rotation.z=Math.PI/2;s.rotation.y=Math.PI/2;}h=1.4;break;}
    case 'seedbag':{const s=mesh(new THREE.SphereGeometry(.3,10,8),M(0xA6834F),0,.28,0,g);s.scale.set(1,1.1,.9);mesh(new THREE.ConeGeometry(.12,.2,8),M(0x8A6A3A),0,.62,0,g);h=.8;break;}
    case 'jar':{mesh(new THREE.CylinderGeometry(.38,.3,.7,14),M(0x8C6B4A),0,.35,0,g);mesh(new THREE.TorusGeometry(.34,.05,6,16),M(0x6E4A32),0,.7,0,g).rotation.x=Math.PI/2;box(.04,.3,.02,0x3A2A22,.2,.45,.33,g);h=.95;break;}
    case 'ladle':{const l=mesh(new THREE.SphereGeometry(.55,14,8,0,Math.PI*2,0,Math.PI/2),M(0xC9B458),0,.14,0,g);l.scale.set(1,.25,1);l.rotation.x=Math.PI;l.position.y=.16;h=.45;break;}
    case 'recipe':{const s=mesh(new THREE.CylinderGeometry(.08,.08,.7,10),M(0x8A5A2B),0,.1,0,g);s.rotation.z=Math.PI/2;box(.62,.02,.42,0xF0E6CC,0,.04,.24,g);h=.35;break;}
    case 'silk':{mesh(new THREE.CylinderGeometry(.42,.34,.38,12),M(0xB98A4A),0,.19,0,g);for(let i=0;i<5;i++)mesh(new THREE.SphereGeometry(.17,8,6),M(0xF7F4EC),Math.cos(i*1.3)*.2,.42,Math.sin(i*1.3)*.2,g);h=.75;break;}
    case 'battlemap':case 'river':{box(.06,1.2,.06,0x5E3A24,-.4,.6,0,g);box(.06,1.2,.06,0x5E3A24,.4,.6,0,g);const p=box(1,.7,.05,id==='river'?0x6FA7C9:0x7C8FA8,0,1.05,.04,g);p.rotation.x=-.12;box(.8,.06,.06,id==='river'?0x3E6B8A:0xC8452F,0,.95,.08,g);h=1.5;break;}
    case 'peng':{for(let i=0;i<7;i++){const c=mesh(new THREE.ConeGeometry(.06,.7+i%3*.15,5),M(0xBFA36A),Math.cos(i)*.16,.35,Math.sin(i)*.16,g);c.rotation.z=(i%2?.35:-.35);c.rotation.x=(i%3-1)*.3;}h=.9;break;}
    case 'tree':{mesh(new THREE.CylinderGeometry(.35,.28,.35,10),M(0x8C4A2A),0,.17,0,g);const t1=box(.16,.6,.16,0x6E4A32,0,.6,0,g);t1.rotation.z=.4;const t2=box(.12,.5,.12,0x6E4A32,.18,.95,0,g);t2.rotation.z=-.6;mesh(new THREE.IcosahedronGeometry(.42,0),M(0x5E8F4C,{flatShading:true}),.35,1.25,0,g);mesh(new THREE.IcosahedronGeometry(.32,0),M(0x6FA35A,{flatShading:true}),-.15,1.15,.1,g);h=1.6;break;}
    case 'wildcat':statue(()=>{mesh(new THREE.SphereGeometry(.2,10,8),M(0x9A7A5A),0,.5,0,g).scale.set(1.3,.8,.8);mesh(new THREE.SphereGeometry(.13,10,8),M(0x9A7A5A),.25,.62,0,g);[-.05,.05].forEach(z=>mesh(new THREE.ConeGeometry(.05,.1,4),M(0x9A7A5A),.28,.76,z,g));});h=.95;break;
    case 'yak':statue(()=>{mesh(new THREE.SphereGeometry(.3,10,8),M(0x4A3A30),0,.6,0,g).scale.set(1.3,.9,.9);mesh(new THREE.SphereGeometry(.17,10,8),M(0x4A3A30),.36,.62,0,g);[-.12,.12].forEach(z=>{const hn=mesh(new THREE.ConeGeometry(.04,.22,5),M(0xE8E0CC),.42,.8,z,g);hn.rotation.x=z>0?.5:-.5;});});h=1.1;break;
    case 'door':{h=2.4;break;}
    default:paper();
  }
  return {g,h};
}

/* objects */
function makeObj(id,kind,pos,label,unit,data){
  const {g,h}=model(kind==='clue'&&id.startsWith('note')?'note':id);g.position.copy(pos);scene.add(g);
  const hit=E.mesh(new THREE.SphereGeometry(.75,8,6),new THREE.MeshBasicMaterial({visible:false}),0,h/2,0,g);
  const el=document.createElement('button');el.className='spot'+(kind==='station'?' st':'');el.textContent=label;$('labels').appendChild(el);
  const o={id,kind,pos:pos.clone(),g,hit,el,unit,data,area:areaOf(pos),anchor:{el,pos:pos.clone().add(V(0,h+.25,0))}};hit.userData.obj=o;
  el.addEventListener('click',()=>clickObj(o));E.anchors.push(o.anchor);st.objs[id]=o;el.hidden=true;return o;
}
C.units.forEach(u=>{
  u.clues.forEach(c=>makeObj(c.id,'clue',V(...W.clues[c.id]),c.label,u,c));
  const s=makeObj(u.station.id,'station',V(...W.stations[u.station.id]),u.station.label,u,u.station);
  const lamp=E.mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshToonMaterial({color:0x8A7A60,gradientMap:E.M(0).gradientMap,emissive:0}),0,s.anchor.pos.y-s.pos.y-.05,0,s.g);stationLamps[u.unit_id]=lamp;
});
const door=makeObj('door','door',V(...R0.door),'石門',null,null);door.anchor.pos.y=2.75;

/* characters */
const slotKeys=Object.keys(C.npc_slots);
slotKeys.forEach(s=>E.makeChar(s,C.npc_slots[s].character_id,C.npc_slots[s].costume));
const P=E.makeChar('player','P',[]);P.speed=4.4;
const MT=E.chars.mentor,CP=E.chars.companion,RV=E.chars.rival,GK=E.chars.gatekeeper;
E.lampValue=()=>Object.keys(st.solved).length/4*.8+.2;
function partyTo(i){const c=AC(i);[['mentor',MT],['rival',RV]].forEach(([k,ch])=>{ch.root.position.copy(c).add(V(...W.npc_layout[k]));ch.target.copy(ch.root.position);});P.root.position.copy(c).add(V(...R0.player_start));P.target.copy(P.root.position);P.onArrive=null;CP.root.position.copy(P.root.position).add(V(...W.npc_layout.companion_follow));CP.target.copy(CP.root.position);}
GK.root.position.copy(V(...W.npc_layout.gatekeeper));GK.target.copy(GK.root.position);
P.root.position.set(...R0.player_start);P.target.copy(P.root.position);
CP.root.position.copy(P.root.position).add(V(...W.npc_layout.companion_follow));CP.target.copy(CP.root.position);
$('helpIcon').innerHTML=E.glyph(C.npc_slots.companion.character_id).replace('<svg','<svg style="width:18px;height:18px"');
$('helpLabel').textContent=C.npc_slots.companion.display_name+'幫忙';

/* camera */
function view(){const c=AC(st.area);return E.portrait?{p:V(0,27.5,11).add(c),l:V(0,0,-.2).add(c)}:{p:V(0,12.5,10.6).add(c),l:V(0,0,-.9).add(c)};}
function setCam(){if(!st.started)return;const v=view();E.camSet(v.p,v.l);}
E.parallax=.3;
E.cam.idle=t=>{if(st.started)return;const a=t*.08;E.camera.position.set(Math.sin(a)*13,7,Math.cos(a)*13);E.cam.look.set(0,.6,-1);};

/* interaction */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function walkTo(pos,cb){const t=pos.clone();const c=AC(st.area);t.x=clamp(t.x,c.x-6.5,c.x+6.5);t.z=clamp(t.z,c.z-4.8,c.z+5.1);t.y=0;P.target.copy(t);P.lookAt=null;P.onArrive=cb||null;
  if(cb&&P.root.position.distanceTo(t)<.06){P.onArrive=null;cb();}}
function approach(o){const d=P.root.position.clone().sub(o.pos);d.y=0;if(d.length()<.01)d.set(0,0,1);d.setLength(o.kind==='station'?1.25:.95);return o.pos.clone().add(d);}
function clickObj(o){if(!st.started||st.busy||st.done)return;E.hideBubble();P.lookAt=o.pos;walkTo(approach(o),()=>{P.lookAt=null;interact(o);});}
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
E.canvas.addEventListener('click',e=>{
  if(!st.started||st.busy||st.done)return;const r=E.canvas.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pm,E.camera);
  const hit=ray.intersectObjects(Object.values(st.objs).map(o=>o.hit))[0];if(hit){clickObj(hit.object.userData.obj);return;}
  const g=ray.intersectObjects(ground)[0];if(g)walkTo(g.point,null);
});
async function interact(o){
  if(o.kind==='clue')return examine(o);
  if(o.kind==='door')return doorInteract();
  const u=o.unit,id=u.unit_id;
  if(st.solved[id]){E.floatBubble(CP,'這個機關已經破解了。',2000);return;}
  if(!st.unlocked[id]){toast('機關還沒有啟動','先破解其他機關，這裡才會有反應。','');E.floatBubble(CP,'好像還打不開……',2000);return;}
  const req=u.clues.filter(c=>c.kind==='required'),seen=req.filter(c=>st.examined[c.id]).length;
  if(seen<req.length){E.floatBubble(CP,'線索還沒找齊（'+seen+'/'+req.length+'），再四處看看。',2600);toast('線索不足','「'+u.station.label+'」附近還有 '+(req.length-seen)+' 條線索沒有調查。','');return;}
  if(ST[id].requires_item&&!st.inv.items.includes(ST[id].requires_item)){toast('缺少物品','這個機關需要「'+ST[id].requires_item+'」。','');return;}
  st.busy=true;if(u.pre&&!st['pre_'+id]){st['pre_'+id]=1;await KS_I(u.pre,{obj:o});}await puzzle(u);st.busy=false;E.hideDialog();hud();
}
async function examine(o,byHelper){
  st.busy=true;const first=!st.examined[o.id];st.examined[o.id]=true;o.el.classList.add('done');
  E.actions([]);await E.showLine('clue',o.data.text,/「/.test(o.data.text));$('whoName').textContent=(byHelper?C.npc_slots.companion.display_name+'找到了：':'')+o.data.label;
  if(o.data.kind==='decoy'&&first){E.emote(RV,'hop');E.floatBubble(RV,'嘻嘻，記住了嗎？',2200);}
  await new Promise(r=>E.actions([E.btn('next','記下',r)]));E.hideDialog();st.busy=false;hud();
  if(first){const u=o.unit;const req=u.clues.filter(c=>c.kind==='required');if(st.unlocked[u.unit_id]&&!st.solved[u.unit_id]&&req.every(c=>st.examined[c.id]))toast('線索齊了','可以挑戰「'+u.station.label+'」的機關了。','ok');}
}

/* puzzles */
function wrongFx(u){st.wrongs++;E.emote(RV,'hop');E.emote(GK,'shake');E.flash(false);E.floatBubble(RV,u?u.lines.rival_taunt:'哈哈，錯了！',2400);const d=$('dialog');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');}
async function cooldown(sec){for(let s=sec;s>0;s--){$('line').dataset.cd='冷卻中（'+s+' 秒）';$('cd').textContent='冷卻中：'+s+' 秒後可再試';await E.sleep(1000);}$('cd').textContent='';}
function trap(opt){if(opt.trap)st.traps.push({clue:opt.trap,text:opt.text,why:opt.why});}
function exitBtn(res){return E.btn('ghost','離開機關',()=>res(null));}
function choose(key,prompt,opts,disabled){return new Promise(async res=>{E.actions([]);await E.showLine(key,prompt);
  const nodes=opts.map((o,i)=>{const b=E.btn('opt','<span class="k">'+'甲乙丙丁戊'[i]+'</span><span>'+o.text+'</span>',()=>res(i));if(disabled.has(i))b.disabled=true;return b;});
  const cd=document.createElement('p');cd.id='cd';cd.className='status';nodes.push(cd);if(key!=='gatekeeper')nodes.push(exitBtn(res));nodes.push(E.skipBtn(()=>res(-2)));E.actions(nodes);});}
async function puzzle(u){
  const id=u.unit_id,pz=u.puzzle;let wrong=0;st.ctx=id;
  for(;;){
    let ok=null;
    if(u.puzzle_type==='clue_combine'||u.puzzle_type==='spot_the_fake'){
      const opts=st._order&&st._order[id]||(st._order=st._order||{},st._order[id]=E.shuffle(pz.options));const dis=st._dis&&st._dis[id]||((st._dis=st._dis||{})[id]=new Set());
      const i=await choose('narrator',pz.prompt,opts,dis);if(i===null)break;if(i===-2){await solved(u,0,true);break;}
      ok=!!opts[i].correct;if(!ok){dis.add(i);trap(opts[i]);toast('不對',opts[i].why,'bad');}
    }else if(u.puzzle_type==='pairing'){const r=await pairing(u);if(r===null)break;if(r==='skip'){await solved(u,0,true);break;}ok=r;}
    else if(u.puzzle_type==='sequence'){const r=await sequence(u);if(r===null)break;if(r==='skip'){await solved(u,0,true);break;}ok=r;}
    if(ok){await solved(u,wrong);break;}
    wrong++;wrongFx(u);
    if(wrong>=ST[id].force_hint_after&&st.hints[id]<1)giveHint(id,true);
    await cooldown(ST[id].wrong_cooldown_sec);
  }
  st.ctx=null;
}
function pairing(u){const pz=u.puzzle;const pool=st._pool=st._pool||E.shuffle(pz.pool.map((p,i)=>Object.assign({i},p)));const sel=pz.rows.map(()=>null);
  return new Promise(async res=>{E.actions([]);await E.showLine('narrator',pz.prompt);
    const wrap=document.createElement('div');const draw=()=>{wrap.innerHTML='';pz.rows.forEach((row,ri)=>{const d=document.createElement('div');d.className='pz-row';d.innerHTML='<b>'+row.label+'</b>';
      const ch=document.createElement('div');ch.className='chips';pool.forEach(p=>{const b=E.btn('chipb'+(sel[ri]===p.i?' on':'')+(sel.includes(p.i)&&sel[ri]!==p.i?' used':''),p.text,()=>{const k=sel.indexOf(p.i);if(k>=0)sel[k]=null;sel[ri]=p.i;draw();});ch.appendChild(b);});d.appendChild(ch);wrap.appendChild(d);});
      sub.disabled=sel.some(s=>s===null);};
    const sub=E.btn('next','確定',()=>{const wrongRows=pz.rows.filter((r,ri)=>sel[ri]!==r.answer);wrongRows.forEach((r,k)=>{const p=pz.pool[sel[pz.rows.indexOf(r)]];if(p){trap(p);}});
      if(wrongRows.length){const p=pz.pool[sel[pz.rows.indexOf(wrongRows[0])]];toast('有 '+wrongRows.length+' 格配錯了',p&&p.why?p.why:'再看看線索中宋人和客人各自怎樣使用藥方。','bad');}res(!wrongRows.length);});
    const cd=document.createElement('p');cd.id='cd';cd.className='status';
    draw();E.actions([wrap,sub,cd,exitBtn(res),E.skipBtn(()=>res('skip'))]);});}
function sequence(u){const pz=u.puzzle;const all=st._seq=st._seq||E.shuffle(pz.steps.map((s,i)=>({text:s.text,i})).concat([Object.assign({i:-1},pz.distractor)]));const order=[];
  return new Promise(async res=>{E.actions([]);await E.showLine('narrator',pz.prompt);
    const wrap=document.createElement('div');const draw=()=>{wrap.innerHTML='';const seq=document.createElement('ol');seq.className='seqlist';
      for(let k=0;k<4;k++){const li=document.createElement('li');li.textContent=order[k]?order[k].text:'（第'+E.NUM[k]+'步）';li.className=order[k]?'':'empty';seq.appendChild(li);}wrap.appendChild(seq);
      const ch=document.createElement('div');ch.className='chips';all.forEach(p=>{const used=order.includes(p);const b=E.btn('chipb'+(used?' used':''),p.text,()=>{if(used||order.length>=4)return;order.push(p);draw();});ch.appendChild(b);});wrap.appendChild(ch);
      sub.disabled=order.length<4;};
    const sub=E.btn('next','撥動',()=>{const ok=order.every((p,k)=>p.i===k);if(!ok){const bad=order.find((p,k)=>p.i!==k);if(bad.i===-1)trap(bad);toast('順序不對',bad.i===-1?bad.why:'莊子是先總評，再舉例，然後提出建議，最後才下結論。','bad');}res(ok);});
    const reset=E.btn('ghost','重新排列',()=>{order.length=0;draw();});const cd=document.createElement('p');cd.id='cd';cd.className='status';
    draw();E.actions([wrap,sub,reset,cd,exitBtn(res),E.skipBtn(()=>res('skip'))]);});}
function ansText(u){const pz=u.puzzle;if(pz.options)return pz.options.find(o=>o.correct).text;if(pz.rows)return pz.rows.map(r=>r.label+'：'+pz.pool[r.answer].text).join('；');return pz.steps.map((x,i)=>(i+1)+'. '+x.text).join('　');}
async function solved(u,wrong,skipped){
  const id=u.unit_id,S=GM.scoring;st.solved[id]=true;const pts=skipped?0:Math.max(S.station_min,S.station_base-wrong*S.wrong_penalty);addScore(pts);if(skipped){st.skipped=(st.skipped||0)+1;await E.say('mentor','正確答案是：'+ansText(u));}
  const rw=u.reward;st.inv.chars.push(rw.char);if(rw.item)st.inv.items.push(rw.item);
  ST[id].unlocks.forEach(k=>st.unlocked[k]=true);
  stationLamps[id].material.color.setHex(0xFFD27A);stationLamps[id].material.emissive.setHex(0xC88A20);
  const p=plaques[st.inv.chars.length-1];if(p){p.material.color.setHex(0xF2C14E);p.material.emissive.setHex(0x8A5A10);}
  E.env.dim=Math.max(0,.55-Object.keys(st.solved).length*.14);E.flash(true);E.emote(MT,'hop');E.emote(CP,'hop');E.emote(RV,'slump');
  st.objs[u.station.id].el.classList.add('solved');
  toast('機關破解 +'+pts,'得到「'+rw.char+'」字'+(rw.item?'，以及物品「'+rw.item+'」':'')+'。','ok');hud();
  await E.say('mentor',u.lines.solved);
  if(u.post)await KS_I(u.post,{});
  AR.forEach((a,i)=>{if(a.unlock_by===id){toast(a.name+'開放了','按上方的「'+a.name+'」前往。','ok');}});areaBtns();
}

/* hints & helper */
function hintCtx(){if(st.ctx)return st.ctx;const c=C.units.find(u=>st.unlocked[u.unit_id]&&!st.solved[u.unit_id]);return c?c.unit_id:null;}
function giveHint(id,auto){id=id||hintCtx();if(!id){E.bubble('學伴','所有機關都破解了，去石門看看吧！',4000);return;}
  const u=U[id],lv=st.hints[id];if(lv>=3){E.bubble('學伴','「'+u.station.label+'」的提示已經用完了。',3000);return;}
  st.hints[id]=lv+1;if(!auto){st.hintsUsed++;addScore(-GM.scoring.hint_penalty);}
  E.bubble('學伴提示：'+u.station.label+' '+(lv+1)+'/3'+(auto?'':'（扣 '+GM.scoring.hint_penalty+' 分）'),u.hints[lv],7000);hud();}
$('assist').addEventListener('click',()=>{if(st.started&&!st.done)giveHint(null,false);});
$('help').addEventListener('click',()=>{
  if(!st.started||st.busy||st.done)return;
  const u=C.units.find(u=>st.unlocked[u.unit_id]&&!st.solved[u.unit_id]&&!st.helped[u.unit_id]&&st.objs[u.station.id].area===st.area&&u.clues.some(c=>c.kind==='required'&&!st.examined[c.id]));
  if(!u){E.floatBubble(CP,'我暫時幫不上忙了。',2000);return;}
  st.helped[u.unit_id]=true;const c=u.clues.find(c=>c.kind==='required'&&!st.examined[c.id]);const o=st.objs[c.id];
  st.busy=true;CP.speed=4.2;CP.target.copy(approach(o));CP.lookAt=o.pos;E.floatBubble(CP,'我去那邊看看！',1600);
  CP.onArrive=async()=>{CP.lookAt=null;E.emote(CP,'hop');st.busy=false;await examine(o,true);};hud();
});
$('notebook').addEventListener('click',()=>{if(!st.started||st.busy)return;notebook();});
async function notebook(){
  const groups=C.units.map(u=>{const cl=u.clues.filter(c=>st.examined[c.id]);return '<li><b>'+u.station.label+(st.solved[u.unit_id]?'（已破解）':'')+'</b>'+(cl.length?cl.map(c=>'<p>'+c.label+'：'+c.text+'</p>').join(''):'<p class="sub">尚未找到線索</p>')+'</li>';}).join('');
  E.overlay('<div class="card"><h2>筆記本</h2><p class="sub">找到的線索會自動記在這裡。小心：其中有些是惠子留下的誤導。</p><ul class="notes">'+groups+'</ul><button class="primary" id="go">收起</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();
}

/* door */
async function doorInteract(){
  if(Object.keys(st.solved).length<4){st.busy=true;E.emote(GK,'shake');await E.say('gatekeeper',C.story.door_hint+'你已集齊 '+st.inv.chars.length+'/4 個字。');E.hideDialog();st.busy=false;return;}
  st.busy=true;GK.lookAt=null;let wrong=0;const F=C.final;
  // arrange chars
  for(;;){const r=await arrange(F);if(r==='skip'){toast('正確次序',F.chars_order.join(''),'ok');break;}if(r)break;wrong++;wrongFx(null);toast('次序不對','想想這間庫房、這篇文章的主題。','bad');if(wrong>=2)E.bubble('學伴','惠子說它們「無用」，莊子卻看見了它們的……',6000);}
  E.flash(true);plaques.forEach(p=>p.material.emissive.setHex(0xD89A20));
  const opts=E.shuffle(F.options),dis=new Set();
  for(;;){const i=await choose('gatekeeper',F.question,opts,dis);if(i===-2){await E.say('gatekeeper','答案是「'+opts.find(o=>o.correct).text+'」。');break;}if(opts[i].correct)break;dis.add(i);wrong++;wrongFx(null);toast('不對',opts[i].why,'bad');await cooldown(3);}
  addScore(Math.max(10,GM.scoring.final_base-wrong*GM.scoring.wrong_penalty));
  await E.say('gatekeeper','答對了。'+F.explain,{btn:'推開石門'});E.hideDialog();
  st.done=true;st.busy=false;hud();await ending();
}
function arrange(F){const tiles=E.shuffle(st.inv.chars.map((c,i)=>({c,i})));const order=[];
  return new Promise(async res=>{E.actions([]);await E.showLine('gatekeeper',F.arrange_prompt);
    const wrap=document.createElement('div');const draw=()=>{wrap.innerHTML='';const row=document.createElement('div');row.className='slots';
      for(let k=0;k<4;k++){const s=document.createElement('span');s.className='slotc'+(order[k]?' on':'');s.textContent=order[k]?order[k].c:'';row.appendChild(s);}wrap.appendChild(row);
      const ch=document.createElement('div');ch.className='chips';tiles.forEach(t=>{const used=order.includes(t);ch.appendChild(E.btn('chipb big'+(used?' used':''),t.c,()=>{if(used||order.length>=4)return;order.push(t);draw();}));});wrap.appendChild(ch);sub.disabled=order.length<4;};
    const sub=E.btn('next','放入凹槽',()=>res(order.map(t=>t.c).join('')===F.chars_order.join('')));const reset=E.btn('ghost','重新排列',()=>{order.length=0;draw();});
    draw();E.actions([wrap,sub,reset,E.skipBtn(()=>res('skip'))]);});}

/* frame & hud */
function onFrame(dt,t){
  if(st.started&&!st.done){st.elapsed=(performance.now()-st.t0)/1000;timerText();}
  if(CP.onArrive==null&&!st.done){const d=CP.root.position.distanceTo(P.root.position);if(d>1.9){const off=V(...W.npc_layout.companion_follow);CP.target.copy(P.root.position).add(off);{const c=AC(st.area);CP.target.x=clamp(CP.target.x,c.x-6.5,c.x+6.5);CP.target.z=clamp(CP.target.z,c.z-4.8,c.z+5.1);}CP.speed=4;}}
  if(st.started)[MT,RV,GK].forEach(c=>{if(!E.lookFocus)c.lookAt=P.root.position.clone().add(V(0,1.2,0));else c.lookAt=null;});
}
function timerText(){const s=Math.floor(st.elapsed);$('timer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function addScore(n){st.score=Math.max(0,st.score+n);}
function hud(){$('score').textContent=st.score;$('solved').textContent=Object.keys(st.solved).length+'/4';$('nbCount').textContent=Object.keys(st.examined).length;
  const id=hintCtx();$('assist').disabled=!st.started||st.done;$('help').disabled=!st.started||st.done;
  $('inv').innerHTML=st.inv.chars.map(c=>'<span class="s">'+c+'</span>').join('')+st.inv.items.map(c=>'<span class="s item">'+c+'</span>').join('');
  door.el.textContent='石門 '+st.inv.chars.length+'/4';
  C.units.forEach(u=>{const o=st.objs[u.station.id];o.el.classList.toggle('locked',!st.unlocked[u.unit_id]);});}
let toastT=null;
function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3800);}


function KS_I(name,ctx){return E.kits[W.scene_kit].escInteract(name,Object.assign({CH:Object.assign({player:P},E.chars)},ctx));}
function showArea(){Object.values(st.objs).forEach(o=>o.el.hidden=!(st.started&&o.area===st.area));}
function areaBtns(){const n=$('areas');n.innerHTML='';AR.forEach((a,i)=>{const b=E.btn('abtn',(areaOpen(i)?'':'🔒 ').replace('🔒 ','')+a.name+(areaOpen(i)?'':'（未開放）'),()=>goArea(i));b.disabled=!areaOpen(i);b.setAttribute('aria-pressed',String(i===st.area));n.appendChild(b);});}
async function goArea(i){if(i===st.area||st.busy||!areaOpen(i))return;st.busy=true;E.hideBubble();st.area=i;showArea();areaBtns();E.setEnv(AR[i].env);partyTo(i);const v=view();await E.camTo(v.p,v.l,1.4);st.busy=false;if(AR[i].intro&&!st['intro'+i]){st['intro'+i]=1;st.busy=true;await E.say('mentor',AR[i].intro);E.hideDialog();st.busy=false;}}

/* flow */
async function ending(){
  E.env.dim=0;E.flash(true);Object.values(E.chars).forEach(c=>E.emote(c,'hop'));
  P.target.set(0,0,-4.6);await E.sleep(1200);
  const s=Math.floor(st.elapsed),tm=Math.floor(s/60)+' 分 '+(s%60)+' 秒';
  const seen={};const traps=st.traps.filter(t=>{if(seen[t.text])return false;seen[t.text]=1;return true;});
  const tr=traps.length?'<p style="margin-top:6px"><b>你被這些誤導線索騙過</b></p><ul class="review">'+traps.map(t=>{const c=C.units.flatMap(u=>u.clues).find(c=>c.id===t.clue);return '<li><b>'+t.text+'</b><p>'+(c?'來源：'+c.text:'')+'</p><p>'+t.why+'</p></li>';}).join('')+'</ul>':'<p>惠子留下的誤導線索，一條都沒有騙到你。</p>';
  E.overlay('<div class="card"><p class="sub" style="margin:0">逃出庫房</p><h2>'+(st.wrongs===0&&st.hintsUsed===0?'逍遙乎寢臥其下':st.wrongs<=3?'浮於江湖':'猶有蓬之心')+'</h2>'+
    '<div class="stats"><div><b>'+tm+'</b>用時</div><div><b>'+st.score+'</b>分數</div><div><b>'+st.wrongs+'</b>答錯</div><div><b>'+st.hintsUsed+'</b>提示</div></div>'+tr+
    '<p style="font-family:var(--serif)">莊子：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
async function main(){
  E.start();
  E.overlay('<div class="title"><div class="v">逍遙遊</div><div class="v a">莊子</div><div class="side"><p>你被鎖在惠子的庫房裡。<br>他說，這裡全是大而無用的東西。</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  const d={mentor:'在窗外指點你，每破解一個機關就會解說',companion:'和你一起被困，每個機關可以幫你找一條線索',rival:'把你們鎖起來的人，還在屋裡留下了誤導的字條',gatekeeper:'守著石門，最後會考問你'};
  E.overlay('<div class="card"><h2>庫房裡外</h2><div class="cast">'+slotKeys.map(s=>'<div>'+E.glyph(C.npc_slots[s].character_id)+'<p style="margin:0"><b>'+C.npc_slots[s].display_name+'</b><br><span>'+d[s]+'</span></p></div>').join('')+
    '</div><p class="sub">點擊物件調查，線索會自動記入筆記本。每個機關都要先找齊附近的線索。答錯要等 5 秒才能再試；學伴提示每次扣 3 分。</p><button class="primary" id="go">環顧四周</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();
  st.started=true;const v=view();await E.camTo(v.p,v.l,1.6);
  $('hud').hidden=false;$('areas').hidden=false;areaBtns();showArea();hud();
  st.busy=true;E.emote(RV,'hop');await E.say('rival',C.story.intro_rival);await E.say('mentor',C.story.intro_mentor);E.hideDialog();st.busy=false;
  st.t0=performance.now();
}
main();
})();
