/* 人 vs AI 分類大賽: sort recycling by hand, upgrade your AI's data, algorithm and computing power, then race it */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const MD=GM.model,SH=C.shop;
const st={r:-1,coins:0,score:0,hints:0,owned:{data:0,night:false,clean:false,alg:'rule',hw:'laptop'},log:[],playing:false,human:{ok:0,bad:0,miss:0},ai:{ok:0,bad:0,miss:0},combo:0};window.__race=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});/* leftover sim HUD pieces: not used in the race */{const ac=$('acc');if(ac){const bx=ac.closest('div');if(bx&&bx!==$('hud'))bx.hidden=true;}const sc=$('score');if(sc){const bx=sc.closest('div');if(bx&&bx!==$('hud'))bx.hidden=true;}const nb=$('notebook');if(nb)nb.hidden=true;}E.bindDialog();E.resp.allowPan=false;
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const R=E.rng(5);
const S=V(...W.station);
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}

/* ---------- AI model (same simplified model as before: trends, not a real AI) ---------- */
const DATA=[20,220,2020];
function aiStats(o,night){const A=MD.algs[o.alg],ch=MD.chance,n=DATA[o.data]+(o.night?500:0);const learn=1-Math.exp(-3*n/A.need);const clean=ch+(A.cap-ch)*learn;
  const t=n*A.cost/MD.hw[o.hw].speed,p=t>0?Math.min(1,MD.time_limit/t):1;const a=ch+(clean-ch)*Math.pow(p,.7)-(o.clean?0:MD.raw_noise)*A.noise_sens;
  const day=Math.max(ch,a),ngt=o.night?day:ch+(day-ch)*MD.night_without;const rate=MD.hw[o.hw].rate*(o.alg==='nn'&&o.hw==='laptop'?.5:1);
  return {day,night:ngt,acc:night?ngt:day,time:t,done:p>=1,rate};}

/* ---------- scene ---------- */
E.kits.world.build({stages:[{template:'city_street',style:'china'}]},[S.clone()]);
const BINS={},LANES=[];const KIND=['paper','metal','plastic'];
(function(){const g=new THREE.Group();g.position.copy(S).add(V(0,0,-1.2));E.scene.add(g);st.g=g;
  [[1.6,'你'],[-.4,'AI']].forEach(([z,who],i)=>{box(9,.5,1,0x4A4E56,-1.6,.25,z,g);for(let k=0;k<14;k++)box(.06,.52,1.02,0x2A2E34,-5.9+k*.66,.26,z,g);
    const t=tex(128,64,(c,w,h)=>{c.fillStyle=i?'#7B5CFF':'#FF6B6B';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold 40px "Noto Sans TC",sans-serif';c.textAlign='center';c.fillText(who,w/2,46);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:t}));p.position.set(-6.4,.9,z);g.add(p);LANES.push({z,items:[],who:i?'ai':'human'});});
  C.bins.forEach((b,i)=>{const z=1.6-i*1.25+.6,x=4.6;const bg=new THREE.Group();bg.position.set(x,0,z-.6);g.add(bg);const col=parseInt(b.color.slice(1),16);
    box(1.1,1.3,1,col,0,.65,0,bg);box(1.16,.12,1.06,0x2A2A2A,0,1.32,0,bg);const t=tex(128,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle=b.color;c.font='bold 34px "Noto Sans TC",sans-serif';c.textAlign='center';c.fillText(b.name,w/2,44);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4),new THREE.MeshBasicMaterial({map:t}));p.position.set(-.56,.8,0);p.rotation.y=-Math.PI/2;bg.add(p);BINS[b.id]=bg;});
  const cam=new THREE.Group();cam.position.set(1.2,0,-1.3);g.add(cam);box(.12,2.6,.12,0x4A4E54,0,1.3,0,cam);box(.5,.36,.4,0x1E2228,0,2.5,.4,cam);const l=mesh(new THREE.CylinderGeometry(.11,.11,.14,16),M(0x0A0A0A),0,2.5,.62,cam);l.rotation.x=Math.PI/2;
  st.led=mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0x3ACB5A}),.18,2.66,.6,cam);
  const sg=tex(256,64,(c,w,h)=>{c.fillStyle='#1E7A4A';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold 34px "Noto Sans TC",sans-serif';c.textAlign='center';c.fillText('人 vs AI 分類大賽',w/2,44);});
  const s2=new THREE.Mesh(new THREE.PlaneGeometry(3,.75),new THREE.MeshBasicMaterial({map:sg}));s2.position.set(-1.6,2.9,-1.6);g.add(s2);box(.08,2.6,.08,0x4A4E54,-3,1.3,-1.6,g);box(.08,2.6,.08,0x4A4E54,-.2,1.3,-1.6,g);
  st.lamp=new THREE.PointLight(0xFFE8B0,0,16);st.lamp.position.copy(S).add(V(0,5,1));E.scene.add(st.lamp);})();
const ITEM={paper:()=>{const g=new THREE.Group();box(.55,.06,.42,0xF4F2EC,0,.03,0,g);box(.44,.01,.05,0x5A5A5A,0,.065,-.09,g);box(.44,.01,.05,0x5A5A5A,0,.065,.05,g);return g;},
  metal:()=>{const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.12,.12,.34,14),M(0xC8CCD0),0,.17,0,g);mesh(new THREE.CylinderGeometry(.11,.11,.03,14),M([0xD8322A,0x2A6AD8,0x2E8A4A][Math.floor(R()*3)]),0,.22,0,g);return g;},
  plastic:()=>{const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.11,.11,.38,12),new THREE.MeshPhongMaterial({color:0xBFE6F2,transparent:true,opacity:.75}),0,.19,0,g);mesh(new THREE.CylinderGeometry(.045,.065,.1,10),M(0x2A6AD8),0,.42,0,g);return g;}};

/* ---------- characters, camera ---------- */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));const CH=E.chars;
Object.values(CH).forEach(c=>{const l=W.npc_layout[c.slot];if(!l)return;const t=S.clone().add(V(...l));c.target.copy(t);c.root.position.copy(t);});
const VIEW=[S.clone().add(V(-.6,5.4,9.6)),S.clone().add(V(-.4,.8,-.6))];E.cam.idle=()=>{E.camera.position.lerp(VIEW[0],.08);E.cam.look.lerp(VIEW[1],.1);};E.camera.position.copy(VIEW[0]);E.cam.look.copy(VIEW[1]);

/* ---------- audio ---------- */
let AC=null;function beep(f,d,type){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d);}catch(e){}}

/* ---------- race loop ---------- */
const TRAVEL=6.2,X0=-6,X1=3.6;let race=null;
function spawn(lane,kind){const it=ITEM[kind]();it.position.set(X0,.52,lane.z);st.g.add(it);lane.items.push({m:it,kind,t:0,state:'move',lane});}
function sortItem(o,bin,byAI){o.state='fly';const from=o.m.position.clone(),to=BINS[bin].position.clone().add(V(0,1.5,0));const ok=bin===o.kind;const t0=performance.now(),D=window.__fast?120:420;
  (function f(){const k=Math.min(1,(performance.now()-t0)/D);o.m.position.lerpVectors(from,to,k);o.m.position.y+=Math.sin(k*Math.PI)*1;if(k<1)requestAnimationFrame(f);else{st.g.remove(o.m);}})();
  const who=byAI?st.ai:st.human;if(ok){who.ok++;if(!byAI){st.combo++;st.coins+=1+(st.combo>=5?1:0);beep(660+Math.min(st.combo,8)*40,.12);}else st.coins+=race.aiCoins?1:0;}
  else{who.bad++;if(!byAI){st.combo=0;beep(180,.2,'square');}pop(byAI?'ai':'human',false,o.kind,bin);}
  if(byAI){st.led.material.color.setHex(ok?0x3ACB5A:0xD8322A);}hud();}
function pop(who,ok,kind,bin){const nm=id=>C.bins.find(b=>b.id===id).name;const el=$('flash');el.textContent=(who==='ai'?'AI 錯了：':'放錯了：')+nm(kind)+' 放進了「'+nm(bin)+'」桶';el.className='show '+who;clearTimeout(pop.t);pop.t=setTimeout(()=>el.className='',1400);}
function humanSort(bin){if(!race||!race.human)return;const lane=LANES[0];const o=lane.items.filter(x=>x.state==='move').sort((a,b)=>b.t-a.t)[0];if(!o)return;sortItem(o,bin,false);}
function onFrame(dt,t){if(E.kits.world.onFrame)E.kits.world.onFrame(dt,t);if(!race)return;race.time-=dt;
  race.next-=dt;if(race.next<=0&&race.time>1.2){race.next=race.gap;const kind=KIND[Math.floor(R()*3)];if(race.human)spawn(LANES[0],kind);if(race.aiOn)spawn(LANES[1],kind);}
  LANES.forEach(l=>{l.items.forEach(o=>{if(o.state!=='move')return;o.t+=dt/TRAVEL;o.m.position.x=X0+(X1-X0)*o.t;if(o.t>=1){o.state='gone';st.g.remove(o.m);(l.who==='ai'?st.ai:st.human).miss++;if(l.who==='human'){st.combo=0;beep(140,.15,'triangle');}hud();}});l.items=l.items.filter(o=>o.state==='move');});
  if(race.aiOn){race.aiCd-=dt;const l=LANES[1];if(race.aiCd<=0){const o=l.items.filter(x=>x.state==='move'&&x.t>.35).sort((a,b)=>b.t-a.t)[0];if(o){race.aiCd=1/race.ai.rate;const ok=R()<race.ai.acc;sortItem(o,ok?o.kind:KIND[(KIND.indexOf(o.kind)+1+Math.floor(R()*2))%3],true);}}}
  if(window.__auto&&race.human){race.autoCd=(race.autoCd||0)-dt;const o=LANES[0].items.filter(x=>x.state==='move'&&x.t>.45).sort((a,b)=>b.t-a.t)[0];if(o&&race.autoCd<=0){race.autoCd=.35;humanSort(R()<.88?o.kind:KIND[(KIND.indexOf(o.kind)+1)%3]);}}
  $('timer').textContent=Math.max(0,Math.ceil(race.time));if(race.time<=0&&!LANES.some(l=>l.items.length)){const r=race;race=null;r.done();}}
function runRace(cfg){return new Promise(done=>{st.human={ok:0,bad:0,miss:0};st.ai={ok:0,bad:0,miss:0};st.combo=0;
  const night=!!cfg.night;E.setEnv(night?'world_night':'world_day');st.lamp.intensity=night?1.5:0;const ai=aiStats(st.owned,night);
  race={time:cfg.time,gap:cfg.gap,next:.4,human:cfg.human!==false,aiOn:!!cfg.ai,ai,aiCd:.5,aiCoins:cfg.aiCoins!==false,done};E.hideDialog();$('pad').hidden=!race.human;$('raceHud').hidden=false;$('aiBox').hidden=!cfg.ai;hud();});}
function hud(){$('coins').textContent=st.coins;$('hOk').textContent=st.human.ok;$('aOk').textContent=st.ai.ok;$('combo').textContent=st.combo>=3?'連擊 ×'+st.combo:'';}
C.bins.forEach((b,i)=>{const btn=document.createElement('button');btn.className='padb';btn.style.setProperty('--c',b.color);btn.innerHTML='<b>'+b.name+'</b><small>'+b.item+' · '+(i+1)+'</small>';btn.onclick=()=>humanSort(b.id);$('pad').appendChild(btn);});
addEventListener('keydown',e=>{const k={'1':0,'2':1,'3':2,a:0,s:1,d:2}[e.key.toLowerCase()];if(k!=null&&race)humanSort(C.bins[k].id);});

/* ---------- shop ---------- */
function shop(round){return new Promise(res=>{const own=st.owned;const pv={...own};
  const draw=()=>{const s=aiStats(pv,false),n=aiStats(pv,true);const cost=SH.items.reduce((a,it)=>a+(bought(it,pv)&&!bought(it,own)?it.cost:0),0);const left=st.coins-cost;
    const col=g=>'<div class="sc"><h3>'+SH.groups[g]+'</h3>'+SH.items.filter(i=>i.group===g).map(it=>{const has=bought(it,own),sel=bought(it,pv);return '<button class="si'+(has?' has':sel?' sel':'')+'" data-id="'+it.id+'"'+(has?' disabled':'')+'><b>'+it.name+'</b><small>'+(has?'已擁有':it.cost+' 金幣')+'</small><span>'+it.desc+'</span></button>';}).join('')+'</div>';
    $('overlay').innerHTML='<div class="card shopc"><p class="sub" style="margin:0">第'+E.NUM[round]+'回合之後 · 升級你的 AI</p><h2>AI 升級站</h2><div class="coins">🪙 '+left+' 金幣'+(left<0?'（不夠）':'')+'</div><div class="scg">'+col('data')+col('alg')+col('hw')+'</div>'+
      '<div class="pv"><div><span>日間準確率</span><b>'+Math.round(s.day*100)+'%</b></div><div><span>夜間準確率</span><b class="'+(n.night<.7?'lo':'')+'">'+Math.round(n.night*100)+'%</b></div><div><span>分類速度</span><b>'+s.rate.toFixed(1)+' 件/秒</b></div><div><span>訓練時間</span><b class="'+(s.done?'':'lo')+'">'+(s.time<.05?'即時':s.time.toFixed(0)+' / '+MD.time_limit+' 分鐘')+'</b></div></div>'+
      (s.done?'':'<p class="warn">⚠ 這部電腦未能在 '+MD.time_limit+' 分鐘內完成訓練，AI 只學了一部分。</p>')+'<p class="sub">'+C.meta.note+'</p><button class="primary" id="buy"'+(left<0?' disabled':'')+'>完成升級，開始下一回合</button></div>';
    $('overlay').querySelectorAll('.si').forEach(b=>b.onclick=()=>{const it=SH.items.find(x=>x.id===b.dataset.id);toggle(it,pv,own);draw();});
    $('buy').onclick=()=>{st.coins=left;Object.assign(st.owned,pv);E.clearOverlay();res();};
    if(window.__auto)setTimeout(()=>{if(!$('buy'))return;const plan=SH.auto[round]||[];plan.forEach(id=>{const it=SH.items.find(x=>x.id===id);if(it&&!bought(it,pv))toggle(it,pv,own);});draw();if(!$('buy').disabled)$('buy').click();else{Object.assign(pv,own);draw();$('buy').click();}},250);};
  E.overlay('',true);draw();});}
function bought(it,o){if(it.group==='data')return it.kind==='night'?o.night:it.kind==='clean'?o.clean:o.data>=it.level;if(it.group==='alg')return MD.algs[o.alg].rank>=MD.algs[it.kind].rank;return MD.hw[o.hw].rank>=MD.hw[it.kind].rank;}
function toggle(it,pv,own){if(bought(it,own))return;if(it.group==='data'){if(it.kind==='night')pv.night=!pv.night;else if(it.kind==='clean')pv.clean=!pv.clean;else pv.data=pv.data>=it.level?own.data:it.level;}
  else if(it.group==='alg')pv.alg=pv.alg===it.kind?own.alg:it.kind;else pv.hw=pv.hw===it.kind?own.hw:it.kind;}

/* ---------- flow ---------- */
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){st.score+=Math.max(2,10-w*3);E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}
function summary(title,rows,note){return new Promise(async res=>{$('pad').hidden=true;$('raceHud').hidden=true;E.actions([]);await E.showLine('companion',title);const d=document.createElement('div');d.className='sumt';
  d.innerHTML='<table><tr><th></th><th>正確</th><th>錯誤</th><th>漏掉</th></tr>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1].ok+'</td><td>'+r[1].bad+'</td><td>'+r[1].miss+'</td></tr>').join('')+'</table>'+(note?'<p>'+note+'</p>':'');E.actions([d,E.btn('next','繼續',res)]);});}
const pctx=v=>Math.round(v*100)+'%';
async function main(){E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);await E.waitClick('#go');
  E.overlay('<div class="card"><h2>怎樣玩</h2><p>貨品沿輸送帶送來，在它到達盡頭前按下正確的回收桶：</p><div class="howbins">'+C.bins.map((b,i)=>'<span style="--c:'+b.color+'"><b>'+b.name+'</b>'+b.item+'<small>按鍵 '+(i+1)+'</small></span>').join('')+'</div><p>賺到的金幣可以升級你的 AI：更多數據、更好的演算法、更快的電腦。</p><p class="sub">'+C.meta.note+'</p><button class="primary" id="go">明白了</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startR||1)-1);i<C.rounds.length;i++){const Rr=C.rounds[i];st.r=i;$('chapNo').textContent='第'+E.NUM[i]+'回合';$('chapTitle').textContent=Rr.title;
    if(i>0&&!(window.__startR>1&&i===window.__startR-1))await shop(i);else if(window.__startR>1&&i===window.__startR-1){Object.assign(st.owned,SH.preset[i]||{});}
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'回合</small><h2>'+Rr.title+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1500),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    await E.say('mentor',Rr.intro);if(Rr.rival){E.emote(CH.rival,'hop');await E.say('rival',Rr.rival);}
    if(Rr.ai){const s=aiStats(st.owned,Rr.night);await E.say('companion','你的 AI 現在：'+MD.algs[st.owned.alg].name+' · '+MD.hw[st.owned.hw].name+' · '+(Rr.night?'夜間':'日間')+'準確率 '+pctx(s.acc)+' · 每秒 '+s.rate.toFixed(1)+' 件。');}
    for(let n=3;n>0;n--){$('count').textContent=n;$('count').hidden=false;beep(440,.1);await E.sleep(window.__fast?60:650);}$('count').textContent='開始！';beep(880,.2);setTimeout(()=>$('count').hidden=true,500);
    await runRace({time:Rr.time,gap:Rr.gap,night:Rr.night,ai:Rr.ai,human:Rr.human!==false,aiCoins:!Rr.versus});
    const s=aiStats(st.owned,Rr.night);st.log.push({r:i+1,h:{...st.human},a:Rr.ai?{...st.ai}:null,owned:{...st.owned},acc:s.acc});
    if(Rr.versus){const hw=st.human.ok,aw=st.ai.ok;const win=aw>hw?'AI 勝出':hw>aw?'你勝出':'平手';
      const weak=!s.done?'運算能力：訓練未能及時完成。':s.rate<1?'運算能力：AI 太慢，跟不上輸送帶。':MD.algs[st.owned.alg].cap<.9?'演算法：這個方法的準確率上限太低。':!st.owned.night&&Rr.night?'數據多樣性：缺少夜間照片。':!st.owned.clean?'數據質素：標籤有錯。':DATA[st.owned.data]<2000?'數據數量：照片太少。':'三大要素都已平衡！';
      await summary('決賽結果：'+win+'（你 '+hw+'，AI '+aw+'）',[['你',st.human],['AI',st.ai]],'你的 AI 最弱的一環：'+weak);}
    else await summary(Rr.title+'完成！',[['你',st.human]].concat(Rr.ai?[['AI',st.ai]]:[]),Rr.ai?'AI 準確率 '+pctx(s.acc)+'；它犯的錯都是因為數據、演算法或運算能力不足。':'');
    await check(Rr.check);E.hideDialog();}
  const best=st.log.length?st.log[st.log.length-1]:null;E.flash(true);
  E.overlay('<div class="card"><p class="sub" style="margin:0">比賽完成</p><h2>'+(best&&best.a&&best.a.ok>=best.h.ok?'你訓練出一部出色的 AI！':'再升級一下你的 AI！')+'</h2><div class="stats"><div><b>'+st.coins+'</b>剩餘金幣</div><div><b>'+st.score+'</b>問答分數</div><div><b>'+pctx(aiStats(st.owned,true).night)+'</b>AI 夜間準確率</div></div>'+
    '<div class="three"><div><b>數據</b><span>數量、質素、多樣性</span></div><div><b>演算法</b><span>學習的方法</span></div><div><b>運算能力</b><span>訓練及分類的速度</span></div></div><p style="font-family:var(--serif)">何老師：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
