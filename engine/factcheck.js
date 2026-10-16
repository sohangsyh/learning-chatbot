/* Fact-check detective mode: verify a viral rumour across Hong Kong locations */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const SC=GM.scoring,EV=C.evidence;
const st={ch:-1,meter:C.meter.start,shown:C.meter.start,score:0,hints:0,cards:[],wrongs:0,hint:null,yaw:0,drag:null};
window.__fc=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=.06;
E.SPK={narrator:{name:'你',col:'#F4EBD6'},card:{name:'證物',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const LP={};Object.entries(W.locations).forEach(([k,v])=>LP[k]=V(...v));
const S=E.kits[W.scene_kit].build(LP);E.setEnv('indoor_warm',true);
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const CH=E.chars;E.lampValue=()=>st.shown/100;
const HP=E.hkPerson;const STR={cafe:HP({shirt:0x8A9AA8,hair:0xC8C8C8,skin:0}),market:HP({shirt:0x3A6FB0,apron:0xF2C14E,skin:1})};
Object.entries(STR).forEach(([k,g])=>{E.scene.add(g);g.position.copy(LP[k]).add(V(...W.npc_layout.stranger));g.userData.talk=false;});
const phoneM=E.box(.08,.14,.01,0x1A1A1A,.26,1.1,.2,STR.cafe);
let mango=null;
function place(k,instant){Object.values(CH).forEach(c=>{const l=W.npc_layout[c.slot];const t=LP[k].clone().add(V(l[0],0,l[2]));c.target.copy(t);if(instant)c.root.position.copy(t);else c.speed=Math.max(3,c.root.position.distanceTo(t)/2.5);});}

/* camera */
function view(k){const p=LP[k];return E.portrait?{look:p.clone().add(V(0,1.5,-.6)),off:V(0,2.4,13)}:{look:p.clone().add(V(0,1.35,-.8)),off:V(0,2.4,8.6)};}
let vw=null;E.cam.idle=t=>{if(!vw){const a=t*.05;E.camera.position.set(Math.sin(a)*10,3.4,Math.cos(a)*10);E.cam.look.set(0,1.4,-1);return;}E.camera.position.copy(vw.look).add(vw.off.clone().applyAxisAngle(V(0,1,0),st.yaw));E.cam.look.copy(vw.look);};
const cv=E.canvas;cv.addEventListener('pointerdown',e=>{if(!vw)return;st.drag={x:e.clientX,y0:st.yaw};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!st.drag)return;st.yaw=Math.max(-.55,Math.min(.55,st.drag.y0-(e.clientX-st.drag.x)*.005));});
['pointerup','pointercancel'].forEach(k=>cv.addEventListener(k,()=>st.drag=null));
async function goTo(k){const env={cafe:'indoor_warm',mtr:'indoor_cool',market:'morning'}[k]||'morning';E.setEnv(env);const v=view(k);vw=null;place(k,false);await E.camTo(v.look.clone().add(v.off),v.look,st.ch<=0?2:2.6);st.yaw=0;vw=v;if(k==='mtr')S.trainArrive();}
function onFrame(dt,t){S.update(dt,t);st.shown+=(st.meter-st.shown)*Math.min(1,dt*2.5);meterHud();Object.values(STR).forEach(g=>{g.position.y=g.userData.talk?Math.abs(Math.sin(t*10))*.04:0;});}

/* hud */
function meterHud(){const v=Math.round(st.shown);$('mStage').textContent=v;$('mBar').style.width=v+'%';$('mBar').style.background=v<40?'var(--cinnabar)':v>=75?'var(--jade)':'var(--gold)';$('mGlow').setAttribute('opacity',(.15+v/100*.85).toFixed(2));}
function meter(n){st.meter=Math.max(0,Math.min(100,st.meter+n));}
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
function cardHTML(id){const e=EV[id];return '<div class="ecard"><div class="eh"><b>'+e.name+'</b><span>'+e.kind+'</span></div><dl><dt>來源</dt><dd>'+e.author+'</dd><dt>時間</dt><dd>'+e.date+'</dd><dt>特點</dt><dd>'+e.stance+'</dd></dl><p class="ex">'+e.excerpt+'</p><p class="nt">'+e.note+'</p></div>';}
async function getCard(id,by){const isNew=!st.cards.includes(id);if(isNew)st.cards.push(id);$('nbCount').textContent=st.cards.length;E.actions([]);await E.showLine(by||'card',(isNew?'新證物：':'')+EV[id].name);const d=document.createElement('div');d.innerHTML=cardHTML(id);await new Promise(r=>E.actions([d.firstChild,E.btn('next','收入證物冊',r)]));}
$('notebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>證物冊</h2><p class="sub">每份資料都問：來源是誰？有沒有日期和出處？可以查證嗎？</p><div class="cards">'+(st.cards.map(cardHTML).join('')||'<p class="sub">還沒有證物。</p>')+'</div><button class="primary" id="nbc">收起</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;addScore(-SC.hint_penalty);E.bubble('黃老師的提示（扣 '+SC.hint_penalty+' 分）',st.hint,6500);});
function phone(inner){return '<div class="phone"><div class="pbar"><span>家庭群組</span><small>'+C.message.sender+'</small></div>'+inner+'</div>';}

/* ---------- chapters ---------- */
async function flags(ch){STR.cafe.userData.talk=true;await E.say('companion',ch.lines.enter);await E.say('narrator','陳伯：'+ch.lines.stranger);STR.cafe.userData.talk=false;E.emote(CH.rival,'hop');await E.say('rival',ch.lines.rival);await E.say('mentor',ch.lines.mentor);
  await getCard('msg');const M=C.message,cats=M.cats;const done={};st.hint='「轉發」的催促屬於製造恐慌；「朋友的朋友」和「已轉發多次」屬於來源含糊。';
  await new Promise(async res=>{let sel=null;const w=document.createElement('div');
    const draw=()=>{let txt=M.text;w.innerHTML=phone('<p class="msg"></p>')+'<div class="chips cats"></div><p class="status"></p>';const mp=w.querySelector('.msg');
      M.flags.forEach((f,i)=>{if(f.text==='已轉發多次')return;txt=txt.replace(f.text,'\u0001'+i+'\u0002');});
      txt.split(/(\u0001\d+\u0002)/).forEach(part=>{const m=part.match(/\u0001(\d+)\u0002/);if(!m){mp.appendChild(document.createTextNode(part));return;}const i=+m[1],f=M.flags[i];
        const b=E.btn('flag'+(done[i]?' done':'')+(sel===i?' sel':''),f.text,()=>{if(done[i])return;sel=i;draw();});mp.appendChild(b);});
      const fw=M.flags.findIndex(f=>f.text==='已轉發多次');const fb=E.btn('flag fwd'+(done[fw]?' done':'')+(sel===fw?' sel':''),'↪ 已轉發多次',()=>{if(done[fw])return;sel=fw;draw();});w.querySelector('.pbar small').replaceWith(fb);
      const cc=w.querySelector('.cats');Object.entries(cats).forEach(([k,v])=>cc.appendChild(E.btn('chipb',v,()=>{if(sel==null){toast('先選一句','點擊訊息中有底線的字句，再選它屬於哪一類可疑之處。','');return;}
        const f=M.flags[sel];if(f.cat===k){done[sel]=1;meter(3);addScore(SC.flag_right);toast('找到了','「'+f.text+'」：'+v,'ok');}else{meter(-2);toast('再想想','「'+f.text+'」不屬於「'+v+'」。','bad');}sel=null;draw();if(Object.keys(done).length===M.flags.length)setTimeout(res,500);})));
      w.querySelector('.status').textContent='已找出 '+Object.keys(done).length+' / '+M.flags.length+' 處可疑之處。先點選字句，再選類別。';};
    draw();E.actions([]);await E.showLine('mentor','點擊訊息中有底線的字句，再選出它屬於哪一類可疑之處。');E.actions([w,E.skipBtn(()=>{M.flags.forEach((f,i)=>done[i]=1);draw();setTimeout(res,600);})]);});
  E.actions([]);await E.say('mentor','這個訊息催促轉發、來源含糊、數字沒有出處，也沒有任何官方連結。這些都是警號，但還不能證明它是假的。我們要查證。');}
async function tools(ch){await E.say('companion',ch.lines.enter);await E.say('mentor',ch.lines.mentor);const done=new Set();st.hint='三個工具都要用：以圖搜圖、追查來源、查官方及傳媒。';
  await new Promise(async res=>{const draw=async()=>{E.actions([]);await E.showLine('companion',done.size?'還有 '+(C.tools.length-done.size)+' 個方法未試。':'選一個查證方法。');
      const w=document.createElement('div');w.innerHTML=phone('<div class="tools"></div>');const tw=w.querySelector('.tools');
      C.tools.forEach(t=>{const b=E.btn('tool2'+(done.has(t.id)?' done':''),'<b>'+t.name+'</b><span>'+t.desc+'</span>',async()=>{if(done.has(t.id))return;E.actions([]);const p=document.createElement('div');p.innerHTML=phone('<div class="loading"><i></i></div><p class="status">'+t.name+'中……</p>');E.actions([p.firstChild]);
          await E.sleep(window.__fast?150:1300);done.add(t.id);meter(6);addScore(SC.tool);await getCard(t.evidence,'companion');if(done.size===C.tools.length)res();else draw();});tw.appendChild(b);});E.actions([w]);};draw();});
  await E.say('mentor','相片是舊相、最早的來源不明、官方和傳媒都沒有消息。網上的線索都指向訊息失實。最後，我們到街市親眼看看。');}
async function field(ch){STR.market.userData.talk=true;await E.say('companion',ch.lines.enter);await E.say('narrator','檔主：'+ch.lines.stranger);STR.market.userData.talk=false;await E.say('mentor',ch.lines.mentor);
  st.hint='先徵得檔主同意，切開一個芒果看看，再看看入貨單據。';const p=LP.market.clone().add(V(1.15,1.12,-2.35));
  mango=new THREE.Group();mango.position.copy(p);E.scene.add(mango);const mm=E.mesh(new THREE.SphereGeometry(.22,16,12),E.M(0xF2A23A),0,0,0,mango);mm.scale.set(1,1.3,.9);
  const cam0=E.camera.position.clone(),look0=E.cam.look.clone();vw=null;await E.camTo(p.clone().add(V(.5,.7,1.5)),p.clone(),1.2);st.yaw=0;vw={look:p.clone(),off:V(.5,.7,1.5)};
  await new Promise(async res=>{E.actions([]);await E.showLine('narrator','「可以切開一個看看嗎？」檔主點點頭。');E.actions([E.btn('next','切開芒果',res)]);});E.actions([]);
  mango.remove(mm);[-1,1].forEach(s=>{const h=new THREE.Group();h.position.x=s*.02;mango.add(h);const sk=E.mesh(new THREE.SphereGeometry(.22,16,12,s>0?0:Math.PI,Math.PI),E.M(0xF2A23A,{side:THREE.DoubleSide}),0,0,0,h);sk.scale.set(1,1.3,.9);
    const fl=E.mesh(new THREE.CircleGeometry(.2,20),E.M(0xFFC83A,{side:THREE.DoubleSide}),0,0,0,h);fl.rotation.y=Math.PI/2;fl.scale.set(1.15,1.25,1);E.mesh(new THREE.CircleGeometry(.07,12),E.M(0xF2E6C0,{side:THREE.DoubleSide}),0,0,s*.001,h).rotation.y=Math.PI/2;});
  await new Promise(r=>{let k=0;const f=()=>{k=Math.min(1,k+.05);mango.children.forEach((h,i)=>h.position.x=(i?1:-1)*(.02+.12*k));if(k<1)requestAnimationFrame(f);else r();};requestAnimationFrame(f);});
  E.emote(CH.companion,'hop');await E.say('companion','果肉顏色很均勻，表皮也沒有針孔。');
  await new Promise(async res=>{E.actions([]);await E.showLine('narrator','檔主遞來一疊入貨單據。');E.actions([E.btn('next','查看單據',res)]);});E.actions([]);meter(8);addScore(SC.field);
  await getCard('field');await E.camTo(cam0,look0,1);st.yaw=0;vw=view('market');await E.say('narrator','檔主：多謝你哋肯過嚟問清楚。');}
async function cross(ch){await E.say('companion',ch.lines.enter);await E.say('mentor',ch.lines.mentor);const G=STR.cafe;
  for(let i=0;i<ch.claims.length;i++){const c=ch.claims[i];st.hint='這句說法，和哪一份證物有關？打開證物冊對照。';
    for(;;){const act=await new Promise(async res=>{E.actions([]);G.userData.talk=true;await E.showLine('narrator','陳伯：「'+c.text+'」');G.userData.talk=false;E.actions([E.btn('next','出示證物',()=>res('present')),E.skipBtn(()=>res('skip'),'跳過這句，看答案')]);});
      if(act==='skip'){if(!st.cards.includes(c.answer))st.cards.push(c.answer);await E.say('mentor','可以出示'+EV[c.answer].name+'：'+c.reveal);break;}
      const pick=await new Promise(async res=>{E.actions([]);await E.showLine('narrator','出示哪一份證物？');const w=document.createElement('div');w.className='pgrid';st.cards.filter(id=>id!=='msg').forEach(id=>w.appendChild(E.btn('pbtn','<span>'+EV[id].name+'</span>',()=>res(id))));E.actions([w,E.btn('ghost','返回',()=>res(null))]);});
      if(!pick)continue;
      if(pick===c.answer){meter(SC.present_right/2);addScore(SC.present_right);E.emote(CH.companion,'hop');toast('有根有據',c.reveal,'ok');await E.say('mentor','陳伯，你看：'+c.reveal);break;}
      st.wrongs++;meter(SC.present_wrong/2);toast('這份證物對不上',EV[pick].name+'和這句說法沒有直接關係。','bad');}}
  G.userData.talk=true;await E.say('narrator','陳伯：'+ch.lines.win);G.userData.talk=false;}
async function reply(ch){await E.say('companion',ch.lines.enter);await E.say('mentor',ch.lines.mentor);st.hint='好的更正要有證據、語氣尊重，也可以提出幫忙。';
  const opts=E.shuffle(ch.options.map((o,i)=>({o,i})));const dis=new Set();let w=0;
  for(;;){const k=await E.ask('companion','你會在家庭群組怎樣回覆？',opts.map(x=>x.o.text),dis,{skip:true});
    if(k===-1){await E.say('mentor','較好的回覆是：「'+ch.options.find(o=>o.best).text+'」');break;}
    const o=opts[k].o;if(o.best){meter(10);addScore(Math.max(4,SC.reply_best-w*5));E.flash(true);E.emote(CH.gatekeeper,'hop');await E.say('mentor','很好。有證據、語氣尊重，還提出幫大家學習查證。');break;}
    w++;dis.add(k);meter(-4);toast('再想想',o.why,'bad');}
  const q=ch.check;await check(q);}
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){addScore(Math.max(2,SC.check_first_try-w*SC.check_wrong_penalty));meter(3);E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}
const RUN={flags,tools,field,cross,reply};
async function main(){E.start();place('cafe',true);
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);$('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>查證小組</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">'+C.meta.note+'</p><button class="primary" id="go">開始查證</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startCh||1)-1);i<C.chapters.length;i++){const ch=C.chapters[i];st.ch=i;
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'章</small><h2>'+ch.title+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1700),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapNo').textContent='第'+E.NUM[i]+'章';$('chapTitle').textContent=ch.title;await goTo(ch.loc);await RUN[ch.type](ch);if(ch.check&&ch.type!=='reply')await check(ch.check);E.hideDialog();st.hint=null;}
  const tier=GM.endings.find(e=>st.meter>=e.min_meter).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(600);
  E.overlay('<div class="card"><p class="sub" style="margin:0">查證報告</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+Math.round(st.meter)+'</b>真相值</div><div><b>'+st.score+'</b>分數</div><div><b>'+st.wrongs+'</b>出示錯誤</div></div>'+
    '<p style="margin-top:6px"><b>查證四步</b></p><ol class="tst"><li>停一停：留意催促轉發、來源含糊、數字沒有出處等警號。</li><li>查出處：以圖搜圖、追查最早的來源。</li><li>橫向查證：比對官方資料和可靠傳媒。</li><li>找第一手資料：親身觀察、查看文件。</li></ol><p style="font-family:var(--serif)">黃老師：'+C.debrief+'</p><button class="primary" id="again">再查一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
