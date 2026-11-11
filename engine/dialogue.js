/* Dialogue-quest mode: listening + responding, optional speaking practice */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const qs=new URLSearchParams(location.search);
const REC=window.SpeechRecognition||window.webkitSpeechRecognition;
const st={scene:-1,score:0,hints:0,phrases:[],tts:GM.tts.enabled_default,speak:qs.get(GM.speaking.url_param)==='1',yaw:0,drag:null,spoken:0,wrongs:0};
window.__dlg=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.resp.allowPan=false;E.parallax=.08;
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const LP={};Object.entries(W.locations).forEach(([k,v])=>LP[k]=V(...v));
E.setEnv('morning',true);

/* ---------- people ---------- */
const SKIN=[0xF2D2B0,0xE0B890,0xC89870];
function person(shirt,extra){const g=new THREE.Group();
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.11,.62,0);g.add(p);box(.13,.6,.14,0x2A3A5A,0,-.3,0,p);return p;});
  mesh(new THREE.CylinderGeometry(.22,.24,.7,10),M(shirt),0,.98,0,g);const head=mesh(new THREE.SphereGeometry(.19,12,10),M(SKIN[extra&&extra.skin||0]),0,1.52,0,g);
  mesh(new THREE.SphereGeometry(.2,12,8,0,Math.PI*2,0,Math.PI/2),M(extra&&extra.hair||0x2A2420),0,1.56,0,g);
  if(extra&&extra.apron)box(.36,.5,.04,extra.apron,0,.85,.22,g);
  if(extra&&extra.bag)box(.3,.4,.18,extra.bag,0,1.05,-.26,g);
  if(extra&&extra.hat){mesh(new THREE.CylinderGeometry(.26,.26,.03,16),M(extra.hat),0,1.7,0,g);mesh(new THREE.CylinderGeometry(.15,.17,.14,14),M(extra.hat),0,1.77,0,g);}
  g.scale.setScalar(1.15);E.scene.add(g);g.userData={legs,talk:false};return g;}

/* ---------- sets (scene kit) ---------- */
const S=E.kits.hk_city.build(LP);
const labels=[];Object.keys(LP).forEach(k=>(S[k].label||[]).forEach(l=>{const el=document.createElement('div');el.className='slabel';el.textContent=l.t;el.hidden=true;$('spots').appendChild(el);const a={el,pos:l.p.clone().add(LP[k])};E.anchors.push(a);labels.push({k,el});}));
const mapBtn=document.createElement('button');mapBtn.className='spot';mapBtn.textContent='路線圖';mapBtn.hidden=true;$('spots').appendChild(mapBtn);E.anchors.push({el:mapBtn,pos:S.mtr.map.clone().add(LP.mtr)});
mapBtn.addEventListener('click',showMap);

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const CH=E.chars;E.lampValue=()=>Math.min(1,.3+st.score/180);
const HP=E.hkPerson;const STR={cafe:HP({shirt:0xF4F4EF,apron:0x2A2D30,pants:0x1A1A1A,skin:0}),mtr:HP({shirt:0x6AB84A,bag:0xC8452F,hat:0xE8D8A8,skin:0,hair:0xC8A060}),market:HP({shirt:0x3A6FB0,apron:0xF2C14E,skin:1})};Object.values(STR).forEach(g=>{E.scene.add(g);g.userData.talk=false;});
Object.entries(STR).forEach(([k,g])=>{g.position.copy(LP[k]).add(V(...W.npc_layout.stranger));g.rotation.y=0;});
function place(k,instant){Object.values(CH).forEach(c=>{const l=W.npc_layout[c.slot];const t=LP[k].clone().add(V(l[0],0,l[2]));c.target.copy(t);c.root.position.y=k==='ferry'?.32:0;if(instant)c.root.position.copy(t).setY(k==='ferry'?.32:0);else c.speed=Math.max(3,c.root.position.distanceTo(t)/2.5);});}

/* camera */
function view(k){const p=LP[k];if(k==='ferry')return E.portrait?{look:p.clone().add(V(0,1.7,-1.2)),off:V(0,1,12.5)}:{look:p.clone().add(V(0,1.6,-1.4)),off:V(0,.9,9.4)};return E.portrait?{look:p.clone().add(V(0,1.5,-.6)),off:V(0,2.4,13)}:{look:p.clone().add(V(0,1.35,-.8)),off:V(0,2.4,8.6)};}
let vw=null;E.cam.idle=t=>{if(!vw){const a=t*.05;E.camera.position.set(Math.sin(a)*10,3.4,Math.cos(a)*10);E.cam.look.set(0,1.4,-1);return;}E.camera.position.copy(vw.look).add(vw.off.clone().applyAxisAngle(V(0,1,0),st.yaw));E.cam.look.copy(vw.look);};
E.canvas.addEventListener('pointerdown',e=>{if(!vw)return;st.drag={x:e.clientX,y0:st.yaw};E.canvas.setPointerCapture(e.pointerId);});
E.canvas.addEventListener('pointermove',e=>{if(!st.drag)return;st.yaw=Math.max(-.55,Math.min(.55,st.drag.y0-(e.clientX-st.drag.x)*.005));});
['pointerup','pointercancel'].forEach(k=>E.canvas.addEventListener(k,()=>st.drag=null));
let talkingStranger=null;
function onFrame(dt,t){
  S.update(dt,t);
  Object.values(STR).forEach(g=>{g.position.y=g.userData.talk?Math.abs(Math.sin(t*10))*.04:0;});
}

/* speech */
function speak(text){if(!st.tts||!('speechSynthesis' in window))return Promise.resolve();return new Promise(res=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=GM.tts.lang;u.rate=GM.tts.rate;
  const vs=speechSynthesis.getVoices();const v=vs.find(x=>x.lang==='en-GB')||vs.find(x=>/^en/.test(x.lang));if(v)u.voice=v;u.onend=res;u.onerror=res;speechSynthesis.speak(u);setTimeout(res,8000);}catch(e){res();}});}
const norm=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);
function lcs(a,b){const dp=Array(a.length+1).fill(0).map(()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return dp[a.length][b.length];}
function f1(said,target){const a=norm(said),b=norm(target);if(!a.length||!b.length)return 0;const m=lcs(a,b);const p=m/a.length,r=m/b.length;return p+r?2*p*r/(p+r):0;}
function similarity(said,target){const a=norm(said),b=norm(target);const dp=Array(a.length+1).fill(0).map(()=>Array(b.length+1).fill(0));
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return b.length?dp[a.length][b.length]/b.length:0;}
function listen(){return new Promise(res=>{if(!REC){res({err:'unsupported'});return;}const r=new REC();r.lang=GM.speaking.lang;r.interimResults=false;r.maxAlternatives=3;let done=false;
  r.onresult=e=>{done=true;const alts=[...e.results[0]].map(a=>a.transcript);res({alts});};r.onerror=e=>{if(!done){done=true;res({err:e.error});}};r.onend=()=>{if(!done){done=true;res({err:'no-speech'});}};
  try{r.start();}catch(e){res({err:'start'});}setTimeout(()=>{try{r.stop();}catch(e){}},GM.speaking.max_seconds*1000);});}

/* ui helpers */
function hud(){$('score').textContent=st.score;$('pbCount').textContent=st.phrases.length;$('speakSt').textContent=st.speak?'開':'關';$('speakBtn').setAttribute('aria-pressed',String(st.speak));$('ttsSt').textContent=st.tts?'開':'關';}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
$('speakBtn').addEventListener('click',()=>{st.speak=!st.speak;if(st.speak&&!REC)toast('此瀏覽器不支援語音辨識','建議使用桌面版 Chrome 或 Edge。仍可繼續用選項作答。','bad');hud();});
$('ttsBtn').addEventListener('click',()=>{st.tts=!st.tts;if(!st.tts&&'speechSynthesis' in window)speechSynthesis.cancel();hud();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;st.score=Math.max(0,st.score-GM.scoring.hint_penalty);hud();E.bubble(C.npc_slots.mentor.display_name+' 的提示（扣 '+GM.scoring.hint_penalty+' 分）',st.hint,7000);});
$('phrasebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;
  E.overlay('<div class="card"><h2>短語簿</h2><p class="sub">一路上學到的得體說法，按播放鍵可以再聽一次。</p><ul class="pb">'+(st.phrases.map((p,i)=>'<li><button class="play" data-i="'+i+'" aria-label="播放">'+PLAY+'</button><div><b lang="en">'+p.en+'</b><span>'+p.where+'</span></div></li>').join('')||'<p class="sub">還沒有短語。</p>')+'</ul><button class="primary" id="pbc">收起</button></div>',true);
  document.querySelectorAll('.pb .play').forEach(b=>b.addEventListener('click',()=>speak(st.phrases[+b.dataset.i].en)));await E.waitClick('#pbc');E.clearOverlay();});
const PLAY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
async function showMap(){if($('overlay').innerHTML)return;
  E.overlay('<div class="card"><h2>港鐵路線圖（部分）</h2><p class="sub">你們在中環站。</p><svg viewBox="0 0 420 200" class="mtrmap" role="img" aria-label="港島綫由堅尼地城經中環、金鐘到灣仔；荃灣綫由中環經金鐘、尖沙咀到佐敦">'+
   '<path d="M20 150 H330" stroke="#1A5FB4" stroke-width="9" stroke-linecap="round"/><path d="M110 150 V60 Q110 40 130 40 H400" stroke="#C8352A" stroke-width="9" stroke-linecap="round" fill="none"/>'+
   '<g font-size="13" fill="#1C2A26"><circle cx="40" cy="150" r="8" fill="#fff" stroke="#1A5FB4" stroke-width="3"/><text x="18" y="178">上環</text>'+
   '<circle cx="110" cy="150" r="11" fill="#fff" stroke="#1C2A26" stroke-width="4"/><text x="92" y="180" font-weight="700">中環（你在這裡）</text>'+
   '<circle cx="200" cy="150" r="8" fill="#fff" stroke="#1A5FB4" stroke-width="3"/><text x="186" y="178">金鐘</text><circle cx="290" cy="150" r="8" fill="#fff" stroke="#1A5FB4" stroke-width="3"/><text x="276" y="178">灣仔</text>'+
   '<circle cx="110" cy="95" r="8" fill="#fff" stroke="#C8352A" stroke-width="3"/><text x="122" y="99">金鐘</text><circle cx="230" cy="40" r="8" fill="#fff" stroke="#C8352A" stroke-width="3"/><text x="212" y="26">尖沙咀</text><circle cx="330" cy="40" r="8" fill="#fff" stroke="#C8352A" stroke-width="3"/><text x="318" y="26">佐敦</text>'+
   '<text x="300" y="80" fill="#C8352A">荃灣綫 Tsuen Wan Line</text><text x="150" y="130" fill="#1A5FB4">港島綫 Island Line</text></g></svg><p class="sub">簡化示意圖，只顯示附近車站。</p><button class="primary" id="mpc">收起</button></div>',true);
  await E.waitClick('#mpc');E.clearOverlay();}

/* ---------- a dialogue turn ---------- */
function spkKey(sc,turn){if(turn.speaker==='stranger'){E.SPK.stranger={name:sc.stranger.name+'（'+sc.stranger.zh+'）',col:'#F2C14E'};return 'stranger';}return turn.speaker;}
async function doTurn(sc,turn,ti){
  const key=spkKey(sc,turn);const sg=STR[sc.id];
  st.hint='這句的意思是：「'+turn.zh+'」。選一個文法正確、語氣又有禮貌的回應。';
  if(turn.kenny){E.emote(CH.rival,'hop');E.floatBubble(CH.rival,turn.kenny,3200);}
  const opts=E.shuffle(turn.options);const dis=new Set();let wrong=0,skipped=false;
  if(sg)sg.userData.talk=true;speak(turn.line).then(()=>{if(sg)sg.userData.talk=false;});
  for(;;){const pick=await new Promise(async res=>{E.actions([]);await E.showLine(key,turn.line);$('line').setAttribute('lang','en');
      const tools=document.createElement('div');tools.className='tools';const zh=document.createElement('p');zh.className='zh';zh.textContent=turn.zh;zh.hidden=true;
      tools.appendChild(E.btn('mini',PLAY+'重聽',()=>speak(turn.line)));tools.appendChild(E.btn('mini','中文意思',()=>{zh.hidden=!zh.hidden;}));
      const nodes=[tools,zh].concat(opts.map((o,i)=>{const b=E.btn('opt','<span class="k">'+'ABCD'[i]+'</span><span lang="en">'+o.text+'</span>',()=>{st.byVoice=false;res(i);});if(dis.has(i))b.disabled=true;return b;}));
      if(st.speak){const vs=document.createElement('p');vs.className='vstat';let busy=false;
        const vb=E.btn('next mic vans',MIC+'讀出你的答案',async()=>{if(busy)return;busy=true;vb.disabled=true;vs.textContent='正在聆聽……請讀出你選擇的句子。';$('dialog').classList.add('listening');
          const r=await listen();$('dialog').classList.remove('listening');busy=false;vb.disabled=false;
          if(r.err){vs.textContent={unsupported:'此瀏覽器不支援語音辨識，請直接點選答案。','not-allowed':'未能使用咪高峰，請在瀏覽器設定中允許，或直接點選答案。','no-speech':'聽不到聲音，請靠近咪高峰再讀一次。'}[r.err]||'語音辨識出錯，請再試一次或直接點選。';return;}
          let best=null;r.alts.forEach(a=>opts.forEach((o,i)=>{if(dis.has(i))return;const sc=f1(a,o.text);if(!best||sc>best.s)best={i,s:sc,a};}));
          const second=Math.max(0,...opts.map((o,i)=>i===best.i||dis.has(i)?0:Math.max(...r.alts.map(a=>f1(a,o.text)))));
          if((best.s>=.95&&best.s-second>=.02)||(best.s>=GM.speaking.choose_min&&best.s-second>=GM.speaking.choose_margin)){vs.textContent='系統聽到：「'+best.a+'」，判斷你選了 '+'ABCD'[best.i]+'。';st.byVoice=true;await E.sleep(900);res(best.i);}
          else vs.textContent='系統聽到：「'+best.a+'」，未能確定是哪一句。請讀得完整一點再試，或直接點選。';});
        nodes.push(vb,vs);}
      nodes.push(E.skipBtn(()=>res(-1)));E.actions(nodes);});
    if(pick===-1){skipped=true;break;}
    const o=opts[pick];if(o.correct)break;
    wrong++;st.wrongs++;dis.add(pick);E.emote(CH.mentor,'shake');if(turn.kenny&&wrong===1)E.emote(CH.rival,'hop');toast('再想想',o.why,'bad');
    const d=$('dialog');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');}
  const right=turn.options.find(o=>o.correct);
  if(skipped){await E.say('mentor','比較好的回應是：「'+right.text+'」');}
  else{const pts=Math.max(2,GM.scoring.choice_first_try-wrong*GM.scoring.choice_wrong_penalty);st.score+=pts;hud();E.emote(CH.companion,'hop');E.flash(true);toast(wrong?'答對了 +'+pts:'說得好 +'+pts,'','ok');}
  if(!st.phrases.find(p=>p.en===right.text))st.phrases.push({en:right.text,where:sc.title});hud();
  await speak(right.text);
  if(!skipped&&st.byVoice&&!wrong){st.spoken++;st.score+=GM.scoring.speak_pass;hud();toast('讀得清楚 +'+GM.scoring.speak_pass,'你用說話選出了正確答案。','ok');st.byVoice=false;return;}
  st.byVoice=false;if(st.speak)await practise(right.text);
}
async function practise(target){
  let tries=0;
  for(;;){const act=await new Promise(async res=>{E.actions([]);await E.showLine('mentor','試試把這句說出來：');
      const t=document.createElement('p');t.className='target';t.setAttribute('lang','en');t.textContent=target;
      const nodes=[t,E.btn('mini',PLAY+'聽示範',()=>speak(target)),E.btn('next mic',MIC+'按下後開始說',()=>res('rec')),E.btn('ghost','略過，繼續對話',()=>res('skip'))];E.actions(nodes);});
    if(act==='skip')return;
    tries++;E.actions([]);E.showLine('mentor','正在聆聽……請說出句子。');$('dialog').classList.add('listening');
    const r=await listen();$('dialog').classList.remove('listening');
    if(r.err){const msg={unsupported:'此瀏覽器不支援語音辨識，建議改用桌面版 Chrome 或 Edge。','not-allowed':'未能使用咪高峰。請在瀏覽器設定中允許使用咪高峰。','no-speech':'聽不到聲音，請靠近咪高峰再試一次。'}[r.err]||'語音辨識出錯（'+r.err+'），請再試一次。';
      toast('未能辨識',msg,'bad');if(r.err==='unsupported'||r.err==='not-allowed')return;if(tries>=3)return;continue;}
    const best=r.alts.map(a=>({a,s:similarity(a,target)})).sort((x,y)=>y.s-x.s)[0];
    if(best.s>=GM.speaking.pass_ratio){st.spoken++;st.score+=GM.speaking.score_pass||GM.scoring.speak_pass;hud();E.emote(CH.companion,'hop');toast('說得很清楚 +'+GM.scoring.speak_pass,'系統聽到：「'+best.a+'」','ok');await E.sleep(600);return;}
    toast('差一點','系統聽到：「'+best.a+'」，和目標句子吻合 '+Math.round(best.s*100)+'%。再慢一點、清楚一點試試。','bad');if(tries>=3){toast('沒關係','已經練習了三次，我們繼續吧。','');return;}}
}
async function check(sc){const q=sc.check,dis=new Set();let w=0;const gk=CH.gatekeeper;gk.target.copy(LP[sc.id]).add(V(-1.2,0,.8));await E.sleep(600);
  for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);break;}
    if(i===q.answer){st.score+=Math.max(2,GM.scoring.check_first_try-w*GM.scoring.check_wrong_penalty);hud();E.emote(gk,'hop');await E.say('gatekeeper','正確。'+q.explain);break;}w++;dis.add(i);E.emote(gk,'shake');}
  place(sc.id,false);}

/* ---------- flow ---------- */
async function scene(i){
  const sc=C.scenes[i];st.scene=i;
  E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'站</small><h2>'+sc.title+'</h2><p lang="en">'+sc.en_title+'</p></div>',true);await Promise.race([E.sleep(E.RM?800:1900),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  $('chapNo').textContent='第'+E.NUM[i]+'站';$('chapTitle').textContent=sc.title;E.setEnv(sc.env);
  labels.forEach(l=>l.el.hidden=l.k!==sc.id);mapBtn.hidden=!sc.map;
  const v=view(sc.id);vw=null;place(sc.id,false);await E.camTo(v.look.clone().add(v.off),v.look,i?3:2);st.yaw=0;vw=v;
  if(sc.id==='mtr')S.trainArrive();
  await E.say('mentor',sc.intro_zh);
  for(let t=0;t<sc.turns.length;t++)await doTurn(sc,sc.turns[t],t);
  await check(sc);
}
async function main(){
  E.start();place('cafe',true);hud();
  E.overlay('<div class="title"><div class="v" lang="en">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>出發前的設定</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div>'+
    '<label class="opt-row"><input type="checkbox" id="ttsChk" '+(st.tts?'checked':'')+'> 讀出對白（聆聽練習）</label>'+
    '<label class="opt-row"><input type="checkbox" id="spkChk" '+(st.speak?'checked':'')+'> 開口說話練習</label>'+
    '<p class="sub privacy">開口說話會使用咪高峰，錄音由瀏覽器供應商（例如 Google 或 Apple）的語音服務即時轉成文字，本遊戲不會儲存任何錄音。如學校政策不允許，請保持關閉；之後也可以在右上角隨時開關。'+(REC?'':'<br><b>此瀏覽器不支援語音辨識。</b>')+'</p><button class="primary" id="go">出發</button></div>',true);
  await E.waitClick('#go');st.tts=$('ttsChk').checked;st.speak=$('spkChk').checked;E.clearOverlay();$('hud').hidden=false;hud();
  for(let i=Math.max(0,(window.__startScene||1)-1);i<C.scenes.length;i++)await scene(i);
  E.hideDialog();labels.forEach(l=>l.el.hidden=true);mapBtn.hidden=true;
  const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(600);
  E.overlay('<div class="card"><p class="sub" style="margin:0">一天結束</p><h2 lang="en">'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.phrases.length+'</b>短語</div><div><b>'+st.spoken+'</b>成功說出</div></div>'+
    '<ul class="pb">'+st.phrases.map((p,i)=>'<li><button class="play" data-i="'+i+'" aria-label="播放">'+PLAY+'</button><div><b lang="en">'+p.en+'</b><span>'+p.where+'</span></div></li>').join('')+'</ul><p style="font-family:var(--serif)">'+C.npc_slots.mentor.display_name+'：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  document.querySelectorAll('.pb .play').forEach(b=>b.addEventListener('click',()=>speak(st.phrases[+b.dataset.i].en)));await E.waitClick('#again');location.reload();
}
main();
})();
