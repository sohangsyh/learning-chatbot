/* Rhythm mode: recite a poem on the beat; each line brings the scene to life */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const RH=C.rhythm,J=GM.judge,SC=GM.scoring;
const st={score:0,combo:0,maxCombo:0,lines:[],playing:false,notes:[],pauses:[],t0:0,res:null,checks:0};
window.__rhy=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=.15;E.setEnv('anc_dusk',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const S=E.kits[W.scene_kit].rhythmBuild(W);
Object.entries(C.npc_slots).forEach(([s,d])=>{const c=E.makeChar(s,d.character_id,d.costume);const l=W.npc_layout[s];c.root.position.set(...l);c.target.copy(c.root.position);});
const P=E.makeChar('player','P',[]);P.root.position.set(...W.npc_layout.player);P.target.copy(P.root.position);P.root.rotation.y=Math.PI;
const CH=E.chars;E.lampValue=()=>Math.min(1,.2+st.combo*.08);
let camHome={p:V(0,5.4,15.5),l:V(0,1.8,-3)};E.camera.position.copy(camHome.p);E.cam.look.copy(camHome.l);

/* audio: plucked-string synthesis */
let AC=null;const PENTA=[261.6,293.7,329.6,392,440,523.3,587.3,659.3];
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}
function pluck(f,vol,dur){if(!AC||!st.sound)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),flt=AC.createBiquadFilter();o.type='triangle';o.frequency.value=f;flt.type='lowpass';flt.frequency.setValueAtTime(f*6,t);flt.frequency.exponentialRampToValueAtTime(f*1.2,t+(dur||1.2));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.25,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+(dur||1.2));o.connect(flt);flt.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+(dur||1.2)+.05);}
function tick(){if(!AC||!st.sound)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=1200;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0005,t+.05);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.06);}
st.sound=true;$('soundBtn').addEventListener('click',()=>{st.sound=!st.sound;$('soundBtn').textContent='聲音：'+(st.sound?'開':'關');});

/* camera & frame */
function onFrame(dt,t){S.update(dt,t);if(E.kits.ancient_town.onFrame)E.kits.ancient_town.onFrame(dt,t);if(st.playing)laneFrame();}
E.cam.idle=()=>{};

/* hud */
function hud(){$('score').textContent=st.score;$('combo').textContent=st.combo;const all=st.lines.filter(l=>l.acc!=null);$('acc').textContent=all.length?Math.round(all.reduce((s,l)=>s+l.acc,0)/all.length*100)+'%':'—';}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3000);}
function pop(txt,cls){const el=document.createElement('div');el.className='jpop '+(cls||'');el.textContent=txt;$('lane').appendChild(el);setTimeout(()=>el.remove(),650);}

/* lane */
const now=()=>performance.now()/1000;
function playLine(line,clozeOK){return new Promise(res=>{
  const spb=60/RH.bpm*(window.__fast?.35:1),chars=[...line.text],lead=RH.lead_beats*spb;st.notes=[];st.pauses=[];const lane=$('lane'),track=$('track');track.innerHTML='';lane.hidden=false;
  $('lineText').innerHTML=chars.map((ch,i)=>'<span data-i="'+i+'">'+(i===chars.length-1&&line.cloze&&!clozeOK?'＿':ch)+'</span>'+(i===RH.pause_after-1?'<i>／</i>':'')).join('');
  let beat=0;chars.forEach((ch,i)=>{const n={i,ch,t:lead+beat*spb,hit:null,el:document.createElement('div'),rhyme:line.rhyme&&i===chars.length-1};n.el.className='note'+(n.rhyme?' gold':'');n.el.textContent=ch;track.appendChild(n.el);st.notes.push(n);beat++;
    if(i===RH.pause_after-1){const p={t:lead+beat*spb,el:document.createElement('div'),rushed:false,done:false};p.el.className='pmark';p.el.innerHTML='<span>停</span>';track.appendChild(p.el);st.pauses.push(p);beat++;}});
  st.spb=spb;st.lead=lead;st.lineEnd=lead+beat*spb+.5;st.t0=now();st.playing=true;st.res=()=>{st.playing=false;lane.hidden=true;res();};
  st.beatIdx=-1;});}
function laneFrame(){const t=now()-st.t0,W0=$('track').clientWidth,hitX=W0*.14,pxs=(W0-hitX)/(RH.lead_beats*st.spb)*.95;
  const b=Math.floor((t-st.lead)/st.spb);if(b>st.beatIdx&&t>=st.lead-.02){st.beatIdx=b;tick();}
  st.notes.forEach(n=>{const x=hitX+(n.t-t)*pxs;n.el.style.transform='translateX('+x+'px)';n.el.style.opacity=x<-40?0:1;
    if(window.__auto&&n.hit==null&&t>=n.t-.02&&t<=n.t+J.good)tap(true);
    if(n.hit==null&&t>n.t+J.good){n.hit='miss';n.el.classList.add('miss');st.combo=0;pop('漏拍','miss');hud();}});
  st.pauses.forEach(p=>{const x=hitX+(p.t-t)*pxs;p.el.style.transform='translateX('+x+'px)';p.el.style.opacity=x<-40?0:1;
    if(!p.done&&t>p.t+J.good){p.done=true;if(!p.rushed){st.score+=SC.pause_bonus;pop('停頓得好','ok');p.el.classList.add('ok');}hud();}});
  if(t>st.lineEnd&&st.res){const r=st.res;st.res=null;r();}}
function tap(auto){if(!st.playing)return;audio();const t=now()-st.t0;
  let best=null,bd=9;st.notes.forEach(n=>{if(n.hit==null){const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}}});
  if(best&&bd<=J.good){const perfect=bd<=J.perfect;best.hit=perfect?'perfect':'good';best.el.classList.add('hit');st.combo++;st.maxCombo=Math.max(st.maxCombo,st.combo);
    st.score+=(perfect?SC.perfect:SC.good)+(best.rhyme?SC.rhyme_bonus:0)+Math.min(10,st.combo);pluck(PENTA[(best.i*2+st.lines.length)%PENTA.length],best.rhyme?.35:.22,best.rhyme?2:1.2);
    const sp=$('lineText').querySelector('span[data-i="'+best.i+'"]');if(sp){sp.classList.add('on');if(best.rhyme)sp.classList.add('gold');}pop(perfect?'完美':'不錯',perfect?'pf':'ok');hud();return;}
  const p=st.pauses.find(p=>!p.done&&Math.abs(p.t-t)<=J.good*1.4);if(p&&!auto){p.rushed=true;p.el.classList.add('bad');st.score=Math.max(0,st.score+SC.rush_penalty);st.combo=0;pop('搶拍！','miss');E.emote(CH.rival,'hop');hud();}}
$('lane').addEventListener('pointerdown',e=>{e.preventDefault();tap();});
addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='KeyJ'||e.code==='KeyF')&&st.playing){e.preventDefault();tap();}});

/* activities */
async function cloze(line){const opts=E.shuffle(line.cloze.options),right=[...line.text].pop();const dis=new Set();let first=true;
  for(;;){const i=await E.ask('companion','下一句的最後一個字是韻腳。「'+line.text.slice(0,-1)+'＿」應該填哪一個字？',opts,dis,{skip:true});
    if(i===-1){await E.say('companion','是「'+right+'」。'+C.rhyme_explain);return false;}
    if(opts[i]===right){if(first)st.score+=SC.cloze;hud();toast('押韻了！','「'+right+'」和前面的韻腳同屬一個韻。','ok');return true;}
    first=false;dis.add(i);E.emote(CH.rival,'hop');toast('讀起來不押韻',C.rhyme_explain,'bad');}}
async function pairs(stz){const P2=stz.pairs;const L=E.shuffle(P2.map(p=>p[0])),R=E.shuffle(P2.map(p=>p[1]));const done=new Set();let sel=null,wrong=0;
  await new Promise(async res=>{E.actions([]);await E.showLine('mentor','這一聯是對仗。把上句和下句相對的詞語配成一對。');const w=document.createElement('div');w.className='pairs';
    const colL=document.createElement('div'),colR=document.createElement('div');colL.className=colR.className='pcol';w.append(colL,colR);
    const draw=()=>{colL.innerHTML='';colR.innerHTML='';L.forEach(x=>{const b=E.btn('pchip'+(done.has(x)?' done':'')+(sel===x?' sel':''),x,()=>{if(done.has(x))return;sel=x;draw();});colL.appendChild(b);});
      R.forEach(y=>{const isDone=[...done].some(x=>P2.find(p=>p[0]===x)[1]===y);const b=E.btn('pchip'+(isDone?' done':''),y,()=>{if(!sel||isDone)return;const ok=P2.find(p=>p[0]===sel)[1]===y;if(ok){done.add(sel);st.score+=SC.pair;pluck(PENTA[done.size+2],.25,1.4);hud();}else{wrong++;toast('不相對',sel+'和'+y+'在句中的位置或詞性不同。','bad');}sel=null;draw();if(done.size===P2.length)setTimeout(res,500);});colR.appendChild(b);});};
    draw();E.actions([w,E.skipBtn(()=>{P2.forEach(p=>done.add(p[0]));draw();setTimeout(res,600);})]);});
  E.actions([]);toast('對仗完成',P2.map(p=>p[0]+'↔'+p[1]).join('　'),'ok');}
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){st.score+=Math.max(2,SC.check_first_try-w*SC.check_wrong_penalty);hud();E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}

/* flow */
async function doLine(line){let clozeOK=true;if(line.cloze)clozeOK=await cloze(line);E.hideDialog();
  const cam=W.line_cams[line.fx];if(cam)await E.camTo(V(...cam[0]),V(...cam[1]),1.6);
  let tries=0,acc=0;for(;;){tries++;$('ready').hidden=false;$('readyLine').textContent='準備：'+line.text.slice(0,RH.pause_after)+'／'+line.text.slice(RH.pause_after);await E.sleep(window.__fast?200:1300);$('ready').hidden=true;
    await playLine(line,clozeOK);const n=st.notes;acc=n.reduce((s,x)=>s+(x.hit==='perfect'?1:x.hit==='good'?.6:0),0)/n.length;const rush=st.pauses.some(p=>p.rushed);if(rush)acc=Math.max(0,acc-.2);
    if(acc>=GM.alive_threshold||tries>=2||!GM.retry_allowed)break;
    const r=await new Promise(async res=>{E.actions([]);await E.showLine('mentor','這句唸得有點亂'+(rush?'，在二三停頓的地方搶拍了':'')+'。要不要再唸一次？');E.actions([E.btn('next','再唸一次',()=>res(1)),E.btn('ghost','繼續',()=>res(0))]);});E.hideDialog();if(!r)break;}
  const q=acc>=GM.alive_threshold?1:.4;st.lines.push({text:line.text,gloss:line.gloss,acc});hud();await S.fx[line.fx](q);
  toast(q===1?'詩句活起來了':'景物淡淡的',line.gloss,q===1?'ok':'');if(q===1)E.flash(true);await E.sleep(window.__fast?200:900);}
async function main(){
  E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');audio();
  E.overlay('<div class="card"><h2>詩社練習</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div>'+
    '<p class="sub">字會從右邊移向左邊的圓圈，在字碰到圓圈時點擊下方的軌道（電腦可按空白鍵）。第二個字之後有一個「停」：那一拍不要按，這就是五言詩的二三停頓。金色的字是韻腳。唸得準，那一句描寫的景物就會在山中出現。</p><button class="primary" id="go">入山</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;hud();
  await E.say('mentor','雨剛停，山裡很靜。跟著拍子，把這首詩唸出來，你會看見詩裡的景色。');
  for(let si=Math.max(0,(window.__startStanza||1)-1);si<C.stanzas.length;si++){const stz=C.stanzas[si];$('chapNo').textContent=stz.name;$('chapTitle').textContent=stz.lines.map(l=>l.text).join('，');
    E.overlay('<div class="chapcard"><small>'+stz.name+'</small><h2>'+stz.lines.map(l=>l.text).join('<br>')+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1800),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    E.emote(CH.rival,'hop');await E.say('rival',stz.rival);
    for(const line of stz.lines)await doLine(line);
    await E.camTo(camHome.p,camHome.l,1.4);if(stz.pairs)await pairs(stz);await check(stz.check);}
  E.hideDialog();const acc=st.lines.reduce((s,l)=>s+l.acc,0)/st.lines.length;const tier=GM.endings.find(e=>acc>=e.min_acc).id,EN=C.endings[tier];
  E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(600);
  E.overlay('<div class="card"><p class="sub" style="margin:0">朗誦完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+Math.round(acc*100)+'%</b>準確度</div><div><b>'+st.score+'</b>分數</div><div><b>'+st.maxCombo+'</b>最高連擊</div></div>'+
    '<div class="poem">'+C.stanzas.map(s=>s.lines.map(l=>{const r=st.lines.find(x=>x.text===l.text);return '<p><b>'+l.text.slice(0,RH.pause_after)+'<i>／</i>'+l.text.slice(RH.pause_after,-1)+(l.rhyme?'<u>'+l.text.slice(-1)+'</u>':l.text.slice(-1))+'</b><span>'+(r?Math.round(r.acc*100)+'%':'')+'</span><small>'+l.gloss+'</small></p>';}).join('')).join('')+'</div>'+
    '<p style="font-family:var(--serif)">王維：'+C.debrief+'</p><button class="primary" id="again">再唸一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
