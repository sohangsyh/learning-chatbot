/* AI 訓練營: train a recycling-station AI camera; data, algorithm and computing power as the variables */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const MD=GM.model,SC=GM.scoring;
const st={r:-1,score:0,hints:0,hint:null,view:'station',log:[],training:null,checks:[]};window.__ai=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});{const ac=$('acc');if(ac){const box=ac.closest('div');if(box&&box!==$('hud'))box.hidden=true;else ac.hidden=true;}}E.bindDialog();E.resp.allowPan=true;E.parallax=0;
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const R=E.rng(9);
const SPOS=V(...W.station),LPOS=V(...W.lab);
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.userData={c,x};return t;}

/* ---------- model ---------- */
function acc(alg,n,noise,night,hw){const A=MD.algs[alg],ch=MD.chance;const learn=1-Math.exp(-3*n/A.need);const clean=ch+(A.cap-ch)*learn;
  const t=n*A.cost/MD.hw[hw].speed;const p=t>0?Math.min(1,MD.time_limit/t):1;const a=ch+(clean-ch)*Math.pow(p,.7)-noise*A.noise_sens;
  const day=Math.max(ch,a),ngt=night?day:ch+(day-ch)*MD.night_without;return {day,night:ngt,time:t,done:p>=1,progress:p};}

/* ---------- scene: street + recycling station ---------- */
E.kits.world.build({stages:[{template:'city_street',style:'china'}]},[SPOS.clone()]);
E.ENV.lab_room={sky:0xD8E4F0,hs:0xFFFFFF,hg:0x8A8E96,hi:.85,sc:0xFFFFFF,si:.6,sp:[4,12,8]};
const bins={};
(function(){const g=new THREE.Group();g.position.copy(SPOS).add(V(0,0,-1.6));E.scene.add(g);
  box(6.6,.5,1,0x4A4E56,-.6,.25,1.4,g);for(let i=0;i<10;i++)box(.08,.52,1.02,0x2A2E34,-3.6+i*.66,.26,1.4,g);
  C.bins.forEach((b,i)=>{const x=1.6+i*1.4;const bg=new THREE.Group();bg.position.set(x,0,0);g.add(bg);const col=parseInt(b.color.slice(1),16);
    box(1.1,1.4,1,col,0,.7,0,bg);box(1.16,.12,1.06,0x2A2A2A,0,1.42,0,bg);box(.6,.08,.05,0x1A1A1A,0,1.2,.51,bg);
    const t=tex(128,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle=b.color;c.font='bold 34px "Noto Sans TC",sans-serif';c.textAlign='center';c.fillText(b.name,w/2,44);});
    const p=new THREE.Mesh(new THREE.PlaneGeometry(.8,.4),new THREE.MeshBasicMaterial({map:t}));p.position.set(0,.85,.51);bg.add(p);bins[b.id]=bg;});
  const cam=new THREE.Group();cam.position.set(-.4,0,1.4);g.add(cam);box(.12,2.8,.12,0x4A4E54,0,1.4,-.6,cam);box(.12,.12,.8,0x4A4E54,0,2.8,-.25,cam);box(.5,.36,.4,0x1E2228,0,2.62,.1,cam);
  const lens=mesh(new THREE.CylinderGeometry(.12,.12,.14,16),M(0x0A0A0A),0,2.62,.32,cam);lens.rotation.x=Math.PI/2;st.led=mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x3ACB5A}),.18,2.76,.31,cam);
  const sc=tex(256,128,(c,w,h)=>{c.fillStyle='#0E1A24';c.fillRect(0,0,w,h);});st.camScreen=sc;const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.55),new THREE.MeshBasicMaterial({map:sc}));sp.position.set(0,3.3,-.25);cam.add(sp);
  st.camPos=g.localToWorld(V(-.4,2.62,1.6));st.conveyor={g,y:.52,z:1.4};
  const sg=tex(256,64,(c,w,h)=>{c.fillStyle='#1E7A4A';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold 34px "Noto Sans TC",sans-serif';c.textAlign='center';c.fillText('AI 智能回收站',w/2,44);});
  const s2=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshBasicMaterial({map:sg}));s2.position.set(3,2.4,0);g.add(s2);box(.08,2.1,.08,0x4A4E54,1.8,1.05,-.1,g);box(.08,2.1,.08,0x4A4E54,4.2,1.05,-.1,g);
  st.nightLight=new THREE.PointLight(0xFFE8B0,0,14);st.nightLight.position.copy(SPOS).add(V(.5,4,1));E.scene.add(st.nightLight);})();
function screen(lines,col){const t=st.camScreen,c=t.userData.x;c.fillStyle='#0E1A24';c.fillRect(0,0,256,128);c.fillStyle=col||'#7AE8FF';c.font='bold 26px "Noto Sans TC",sans-serif';c.textAlign='center';lines.forEach((l,i)=>c.fillText(l,128,44+i*38));t.needsUpdate=true;}
screen(['AI 鏡頭','未訓練']);
/* ---------- scene: computer room ---------- */
const HW={};
(function(){const g=new THREE.Group();g.position.copy(LPOS);E.scene.add(g);const fl=mesh(new THREE.PlaneGeometry(16,12),M(0xC8CCD4),0,.01,-1,g);fl.rotation.x=-Math.PI/2;
  box(16,4.4,.2,0xE8ECF2,0,2.2,-7,g);box(.2,4.4,12,0xE8ECF2,-8,2.2,-1,g);box(.2,4.4,12,0xE8ECF2,8,2.2,-1,g);
  const wb=tex(512,160,(c,w,h)=>{c.fillStyle='#F8F8F4';c.fillRect(0,0,w,h);c.fillStyle='#1A4AA8';c.font='bold 46px "Noto Sans TC",sans-serif';c.fillText('AI 學會',24,62);c.fillStyle='#2A2A2A';c.font='30px "Noto Sans TC",sans-serif';c.fillText('數據 · 演算法 · 運算能力',24,118);});
  const w=new THREE.Mesh(new THREE.PlaneGeometry(4,1.25),new THREE.MeshLambertMaterial({map:wb}));w.position.set(-4.6,2.6,-6.88);g.add(w);
  const mon=tex(512,256,(c,w2,h)=>{c.fillStyle='#0E1A24';c.fillRect(0,0,w2,h);});st.mon=mon;box(3.4,2,.12,0x1A1A1A,1.6,2.4,-6.8,g);const mp=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.8),new THREE.MeshBasicMaterial({map:mon}));mp.position.set(1.6,2.4,-6.73);g.add(mp);
  const desk=(x,z)=>{box(2.4,.08,1.1,0xB89A6A,x,.78,z,g);[[-1.1,-.45],[1.1,-.45],[-1.1,.45],[1.1,.45]].forEach(([a,b])=>box(.06,.78,.06,0x6A6E74,x+a,.39,z+b,g));};
  desk(-4,-1.6);desk(0,-1.6);desk(4,-1.6);
  const lp=new THREE.Group();lp.position.set(-4,.82,-1.6);g.add(lp);box(.9,.04,.6,0x8A8E96,0,0,0,lp);const scr=box(.9,.55,.03,0x8A8E96,0,.28,-.3,lp);scr.rotation.x=-.25;box(.82,.47,.01,0x2A4A6A,0,.3,-.27,lp).rotation.x=-.25;HW.laptop=lp;
  const pc=new THREE.Group();pc.position.set(0,.82,-1.6);g.add(pc);box(.5,1,.9,0x1E2228,.7,.5,0,pc);const rgb=box(.04,.8,.04,0xFF4FD8,.95,.5,.3,pc);rgb.material=new THREE.MeshBasicMaterial({color:0xFF4FD8});st.rgb=rgb;
  box(1,.6,.04,0x1A1A1A,-.3,.6,-.2,pc);box(.92,.52,.01,0x2A4A6A,-.3,.6,-.17,pc);HW.gpu=pc;
  const rk=new THREE.Group();rk.position.set(4,0,-2);g.add(rk);st.leds=[];for(let k=0;k<3;k++){box(.9,2.4,.9,0x2A2E36,-.95+k*.95,1.2,-.4,rk);for(let j=0;j<6;j++){const l=box(.06,.04,.02,0x3ACB5A,-1.2+k*.95,.4+j*.35,.06,rk);l.material=new THREE.MeshBasicMaterial({color:0x3ACB5A});st.leds.push(l);}}HW.cloud=rk;
  st.hwGlow=mesh(new THREE.RingGeometry(.9,1.05,32),new THREE.MeshBasicMaterial({color:0xFFC931,side:THREE.DoubleSide,transparent:true,opacity:0}),0,.03,0,E.scene);st.hwGlow.rotation.x=-Math.PI/2;})();
function monitor(title,pct,lines,col){const t=st.mon,c=t.userData.x;c.fillStyle='#0E1A24';c.fillRect(0,0,512,256);c.fillStyle='#7AE8FF';c.font='bold 30px "Noto Sans TC",sans-serif';c.fillText(title,24,46);
  c.fillStyle='#2A3A4A';c.fillRect(24,70,464,34);c.fillStyle=col||'#3ACB5A';c.fillRect(24,70,464*Math.max(0,Math.min(1,pct)),34);c.fillStyle='#F4F4F0';c.font='24px "Noto Sans TC",sans-serif';(lines||[]).forEach((l,i)=>c.fillText(l,24,146+i*36));t.needsUpdate=true;}
monitor('等待訓練',0,['選擇數據、演算法和電腦']);

/* ---------- characters & camera ---------- */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));const CH=E.chars;
function place(at,instant){const base=at==='lab'?LPOS:SPOS;Object.values(CH).forEach(c=>{const l=W.npc_layout[c.slot];if(!l)return;const t=at==='lab'?base.clone().add(V(l[0]*.75+2.2,0,l[2]+1.8)):base.clone().add(V(l[0],0,l[2]+1.4));c.target.copy(t);if(instant)c.root.position.copy(t);});}
const VIEWS={station:()=>[SPOS.clone().add(V(.4,4.2,10.5)),SPOS.clone().add(V(.6,1.4,-1.2))],lab:()=>[LPOS.clone().add(V(0,3.6,8.4)),LPOS.clone().add(V(0,1.6,-2.6))]};
E.cam.idle=()=>{const [p,l]=VIEWS[st.view]();E.camera.position.lerp(p,.08);E.cam.look.lerp(l,.1);};
{const [p,l]=VIEWS.station();E.camera.position.copy(p);E.cam.look.copy(l);}place('station',true);
async function go(v){if(st.view===v)return;st.view=v;E.setEnv(v==='lab'?'lab_room':(st.isNight?'world_night':'world_day'));place(v,false);await E.sleep(window.__fast?150:1200);}
function onFrame(dt,t){if(E.kits.world.onFrame)E.kits.world.onFrame(dt,t);st.leds.forEach((l,i)=>{l.material.color.setHex(Math.sin(t*(st.training?9:2)+i*1.7)>0?0x3ACB5A:0x1A4A2A);});
  if(st.rgb)st.rgb.material.color.setHSL((t*.2)%1,.9,.6);if(st.hwGlow&&st.hwGlow.material.opacity>0)st.hwGlow.rotation.z+=dt;
  st.fx=st.fx||[];for(let i=st.fx.length-1;i>=0;i--){const f=st.fx[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.m.material.opacity=Math.max(0,f.life*2);if(f.life<=0){E.scene.remove(f.m);st.fx.splice(i,1);}}}
function tween(d,fn){return new Promise(res=>{const t0=performance.now(),D=Math.max(10,d*1000*(window.__fast?.15:1));const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);fn(k);if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});}

/* ---------- HUD helpers ---------- */
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;function toast(t,d,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=t;$('toastD').textContent=d||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
const pct=v=>Math.round(v*100)+'%';
function logRun(label,r,cfg){st.log.push({round:st.r+1,label,day:r.day,night:r.night,time:r.time,cfg});$('nbCount').textContent=st.log.length;}
$('notebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>實驗記錄</h2><p class="sub">'+C.meta.note+'</p><div class="tw"><table class="dt"><tr><th>回合</th><th>設定</th><th>日間</th><th>夜間</th><th>訓練時間</th></tr>'+
  (st.log.map(l=>'<tr><td>'+l.round+'</td><td>'+l.label+'</td><td>'+pct(l.day)+'</td><td>'+(l.night==null?'—':pct(l.night))+'</td><td>'+(l.time<.05?'即時':l.time.toFixed(1)+' 分鐘')+'</td></tr>').join('')||'<tr><td colspan="5">還沒有實驗。</td></tr>')+'</table></div><button class="primary" id="nbc">收起</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;addScore(-SC.hint_penalty);E.bubble('何老師的提示（扣 '+SC.hint_penalty+' 分）',st.hint,6500);});
function bars(rows){const d=document.createElement('div');d.className='bars';d.innerHTML=rows.map(r=>'<div class="br"><span class="bl">'+r.label+'</span><span class="bt"><i style="width:'+Math.round(r.v*100)+'%;background:'+(r.col||'#3ACB5A')+'"></i></span><b>'+pct(r.v)+'</b></div>').join('');return d;}
function choice(prompt,opts,sp){return new Promise(async res=>{E.actions([]);await E.showLine(sp||'mentor',prompt);const w=document.createElement('div');w.className='seg';opts.forEach(o=>{const b=E.btn('segb'+(o.done?' done':''),o.label+(o.done?' ✓':''),()=>res(o.v));w.appendChild(b);});E.actions([w]);});}

/* ---------- actions: photograph, label, train, test ---------- */
const ITEM={paper:()=>{const g=new THREE.Group();box(.5,.05,.38,0xF4F2EC,0,.03,0,g);box(.4,.01,.04,0x5A5A5A,0,.06,-.08,g);box(.4,.01,.04,0x5A5A5A,0,.06,.05,g);return g;},
  metal:()=>{const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.11,.11,.32,14),M(0xC8CCD0),0,.16,0,g);mesh(new THREE.CylinderGeometry(.1,.1,.02,14),M(0xD8322A),0,.2,0,g);return g;},
  plastic:()=>{const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.1,.1,.34,12),new THREE.MeshPhongMaterial({color:0xBFE6F2,transparent:true,opacity:.7}),0,.17,0,g);mesh(new THREE.CylinderGeometry(.04,.06,.1,10),M(0x2A6AD8),0,.38,0,g);return g;}};
async function photograph(n,night){await go('station');E.actions([]);const t=document.createElement('p');t.className='status big';E.actions([t]);const kinds=['paper','metal','plastic'];
  for(let k=0;k<6;k++){const kind=kinds[k%3],it=ITEM[kind]();it.position.copy(st.camPos).add(V((k-2.5)*.35,-2.1,.3));E.scene.add(it);
    const fl=mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true}),st.camPos.x,st.camPos.y,st.camPos.z+.2,E.scene);st.fx.push({m:fl,v:V(0,0,0),life:.3});
    await tween(.35,q=>{t.textContent='📷 已拍攝 '+Math.round(n*(k+q)/6).toLocaleString()+' 張'+(night?'（夜間）':'');});setTimeout(()=>E.scene.remove(it),900);}
  t.textContent='📷 已拍攝 '+n.toLocaleString()+' 張'+(night?'（夜間）':'');screen(['已收集',n.toLocaleString()+' 張照片']);await E.sleep(window.__fast?80:500);}
async function train(alg,hw,n,noise,night){await go('lab');const g=HW[hw];st.hwGlow.position.copy(g.getWorldPosition(V())).setY(.03);st.hwGlow.material.opacity=.9;
  const r=acc(alg,n,noise,night,hw);const total=r.time,lim=MD.time_limit;const shown=Math.min(total,lim);st.training=true;
  const p=document.createElement('p');p.className='status big';E.actions([p]);
  await tween(Math.min(4,1+shown/10),k=>{const m=shown*k;const prog=total>0?Math.min(1,m/total):1;monitor('訓練中：'+MD.algs[alg].name+' · '+MD.hw[hw].name,prog,['照片 '+n.toLocaleString()+' 張','已用時間 '+m.toFixed(1)+' / '+lim+' 分鐘'],prog<1&&m>=lim-.01?'#E8A01A':'#3ACB5A');p.textContent='⏱ 訓練時間 '+m.toFixed(1)+' 分鐘　進度 '+Math.round(prog*100)+'%';});
  st.training=false;st.hwGlow.material.opacity=0;
  if(!r.done){monitor('時間到！',r.progress,['只完成 '+Math.round(r.progress*100)+'% 的訓練','需要 '+total.toFixed(0)+' 分鐘'],'#E8A01A');toast('時間到，訓練未完成','這部電腦需要 '+total.toFixed(0)+' 分鐘，但一節課只有 '+lim+' 分鐘。','bad');}
  else monitor('訓練完成',1,['用了 '+(total<.05?'不到 0.1':total.toFixed(1))+' 分鐘'],'#3ACB5A');await E.sleep(window.__fast?80:700);return r;}
async function test(r,night){st.isNight=!!night;await go('station');E.setEnv(night?'world_night':'world_day');st.nightLight.intensity=night?1.4:0;const a=night?r.night:r.day;const kinds=['paper','metal','plastic'];
  const n=10,right=Math.round(a*n);const order=[];for(let i=0;i<n;i++)order.push(i<right);for(let i=order.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const p=document.createElement('p');p.className='status big';E.actions([p]);let ok=0;
  for(let i=0;i<n;i++){const kind=kinds[i%3],it=ITEM[kind]();const cv=st.conveyor.g;const start=cv.localToWorld(V(-3.6,st.conveyor.y,st.conveyor.z)),mid=cv.localToWorld(V(-.4,st.conveyor.y,st.conveyor.z));it.position.copy(start);E.scene.add(it);
    await tween(.35,k=>it.position.lerpVectors(start,mid,k));const good=order[i];if(good)ok++;const guess=good?kind:kinds[(i+1+Math.floor(R()*2))%3];
    const nm=C.bins.find(b=>b.id===guess).name;screen(['判斷：'+nm,good?'✓ 正確':'✕ 錯誤'],good?'#7AF0A8':'#FF8A7A');st.led.material.color.setHex(good?0x3ACB5A:0xD8322A);
    const binW=bins[guess].getWorldPosition(V()).add(V(0,1.5,0));await tween(.35,k=>{it.position.lerpVectors(mid,binW,k);it.position.y+=Math.sin(k*Math.PI)*.8;});E.scene.remove(it);p.textContent=(night?'🌙 夜間':'☀️ 日間')+'測試：'+(i+1)+' / '+n+'　答對 '+ok;}
  st.nightLight.intensity=0;return a;}
async function cycle(cfg,label,both){const r=await train(cfg.alg,cfg.hw,cfg.n,cfg.noise,cfg.night);const day=await test(r,false);let night=null;if(both)night=await test(r,true);if(both)E.setEnv('world_day');st.isNight=false;
  logRun(label,{day:r.day,night:both?r.night:null,time:r.time},cfg);addScore(SC.run);return r;}
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){addScore(Math.max(2,SC.check_first_try-w*SC.check_wrong_penalty));E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}
function results(title,rows,note){return new Promise(async res=>{E.actions([]);await E.showLine('companion',title);const els=[bars(rows)];if(note){const p=document.createElement('p');p.className='sub';p.textContent=note;els.push(p);}els.push(E.btn('next','繼續',res));E.actions(els);});}

/* ---------- rounds ---------- */
async function r1(R1){st.hint='三種數量都試一次，比較準確率的變化。';const done={};const res={};
  while(Object.keys(done).length<3){const n=await choice('選擇要拍攝的照片數量（演算法：決策樹；電腦：遊戲電腦）。三種都試試。',[20,200,2000].map(v=>({v,label:v.toLocaleString()+' 張',done:done[v]})));
    await photograph(n,false);const r=await cycle({alg:'tree',hw:'gpu',n,noise:0,night:true},'決策樹 · '+n+' 張',false);done[n]=1;res[n]=r.day;
    await results(n.toLocaleString()+' 張照片：日間準確率 '+pct(r.day),Object.keys(res).sort((a,b)=>a-b).map(k=>({label:(+k).toLocaleString()+' 張',v:res[k]})));}
  E.emote(CH.rival,'shake');await E.say('mentor','二十張只有 '+pct(res[20])+'，二百張大幅升到 '+pct(res[200])+'，但二千張只是 '+pct(res[2000])+'：數據多了有幫助，但升幅會越來越小。');}
async function r2(){st.hint='先修正貼錯標籤的照片，再想想日間和夜間有甚麼不同。';
  await E.say('companion','我們已拍了二千張照片，用決策樹訓練。先看看結果。');await photograph(2000,false);const a=await cycle({alg:'tree',hw:'gpu',n:2000,noise:MD.raw_noise,night:false},'未檢查標籤 · 只有日間照片',false);
  await results('日間準確率只有 '+pct(a.day)+'，比預期低。',[{label:'未檢查標籤',v:a.day,col:'#E8A01A'}]);
  await E.say('mentor','打開照片看看：有些照片的標籤貼錯了。把貼錯的找出來，點擊改成正確的類別。');await labelTask();
  const b=await cycle({alg:'tree',hw:'gpu',n:2000,noise:0,night:false},'已修正標籤 · 只有日間照片',false);
  await results('修正標籤後，日間準確率升到 '+pct(b.day)+'。',[{label:'未檢查標籤',v:a.day,col:'#E8A01A'},{label:'已修正標籤',v:b.day}]);
  await E.say('companion','晚上回收站也會開放。我們在晚上測試一下。');const nightA=await test(b,true);E.setEnv('world_day');st.isNight=false;logRun('夜間測試（只有日間照片）',{day:b.day,night:b.night,time:b.time},{});
  E.emote(CH.companion,'shake');await results('晚上準確率只有 '+pct(nightA)+'！',[{label:'日間',v:b.day},{label:'夜間',v:nightA,col:'#D8322A'}],'所有訓練照片都在日間拍攝，AI 從沒見過夜間的樣子。');
  await choice('怎樣改善？',[{v:1,label:'在晚上拍攝更多照片，加入訓練數據'}]);await photograph(500,true);
  const c=await cycle({alg:'tree',hw:'gpu',n:2000,noise:0,night:true},'已修正標籤 · 日間＋夜間照片',true);
  await results('加入夜間照片後：',[{label:'日間',v:c.day},{label:'夜間',v:c.night}],'數據要正確，也要涵蓋實際會遇到的各種情況。');}
function labelTask(){return new Promise(async res=>{const kinds=['paper','metal','plastic'],nm={paper:'廢紙',metal:'金屬',plastic:'塑膠'},icon={paper:'📰',metal:'🥫',plastic:'🧴'};
  const cards=[];for(let i=0;i<12;i++){const k=kinds[i%3];cards.push({k,lab:k});}[2,5,9].forEach((i,j)=>{cards[i].lab=kinds[(kinds.indexOf(cards[i].k)+1+j%2)%3];});
  const draw=async()=>{E.actions([]);await E.showLine('companion','點擊標籤貼錯的照片，改成正確類別。（還有 '+cards.filter(c=>c.lab!==c.k).length+' 張貼錯）');const g=document.createElement('div');g.className='photos';
    cards.forEach((c,i)=>{const b=E.btn('ph'+(c.fixed?' ok':''),'<span class="pi">'+icon[c.k]+'</span><span class="pl">'+nm[c.lab]+'</span>',()=>{if(c.lab===c.k){toast('這張標籤正確','',' ');return;}c.lab=c.k;c.fixed=true;addScore(SC.fix_label);if(cards.every(x=>x.lab===x.k)){E.actions([]);E.say('companion','全部修正了！其餘照片我用同樣方法檢查好了。').then(res);}else draw();});g.appendChild(b);});
    E.actions([g,E.skipBtn(()=>{cards.forEach(c=>c.lab=c.k);res();})]);if(window.__auto)setTimeout(()=>{cards.forEach(c=>c.lab=c.k);E.actions([]);res();},300);};draw();});}
async function r3(){st.hint='三種演算法都試，再比較只有二十張照片時的表現。';const done={},res={};const names={rule:'簡單規則',tree:'決策樹',nn:'神經網絡'};
  while(Object.keys(done).length<3){const alg=await choice('選擇演算法（二千張照片、遊戲電腦）。三種都試試。',['rule','tree','nn'].map(v=>({v,label:names[v],done:done[v]})));
    if(alg==='rule')await E.say('mentor','簡單規則：例如「藍色的就是廢紙、有金屬光澤的就是金屬」。');
    const r=await cycle({alg,hw:'gpu',n:2000,noise:0,night:true},names[alg]+' · 2000 張',false);done[alg]=1;res[alg]=r.day;await results(names[alg]+'：'+pct(r.day),Object.keys(res).map(k=>({label:names[k],v:res[k]})));}
  await E.say('mentor','神經網絡最好。不過，如果只有二十張照片呢？');const a=await cycle({alg:'nn',hw:'gpu',n:20,noise:0,night:true},'神經網絡 · 20 張',false);const b=acc('tree',20,0,true,'gpu');logRun('決策樹 · 20 張',b,{});
  await results('只有二十張照片時：',[{label:'神經網絡',v:a.day,col:'#E8A01A'},{label:'決策樹',v:b.day}],'複雜的演算法需要更多數據才能學好；演算法要配合數據。');}
async function r4(){st.hint='三種電腦都試，留意訓練能否在三十分鐘內完成。';const done={},res={};
  while(Object.keys(done).length<3){const hw=await choice('選擇電腦（神經網絡、二千張照片，限時三十分鐘）。三種都試試。',['laptop','gpu','cloud'].map(v=>({v,label:MD.hw[v].name,done:done[v]})));
    const r=await cycle({alg:'nn',hw,n:2000,noise:0,night:true},MD.hw[hw].name,false);done[hw]=1;res[hw]=r;await results(MD.hw[hw].name+'：'+pct(r.day)+'（需要 '+(r.time<.05?'即時':r.time.toFixed(1)+' 分鐘')+'）',Object.keys(res).map(k=>({label:MD.hw[k].name,v:res[k].day})));}
  E.emote(CH.rival,'hop');await E.say('rival','咁用雲端，唔使檢查標籤都得啦？');const r=await cycle({alg:'nn',hw:'cloud',n:2000,noise:MD.raw_noise,night:true},'雲端 · 未檢查標籤',false);
  await results('雲端運算 + 未檢查標籤：'+pct(r.day),[{label:'雲端＋正確標籤',v:res.cloud.day},{label:'雲端＋錯誤標籤',v:r.day,col:'#E8A01A'}],'運算能力決定能否及時完成訓練，但不能修正數據的錯誤。');}
async function r5(){const B=C.budget,I=Object.fromEntries(B.items.map(i=>[i.id,i]));const sel={data:'d200',night:false,clean:false,alg:'tree',hw:'laptop'};st.hint='日夜都要 90%：想想數據的數量、質素和多樣性，演算法的上限，以及訓練時間。';
  for(let attempt=1;;attempt++){const cfg=await new Promise(async res=>{E.actions([]);await E.showLine('mentor','分配 100 點預算，然後開始訓練。目標：日間和夜間都達到 90%，並在三十分鐘內完成。');
      const w=document.createElement('div');w.className='shop';const draw=()=>{const cost=I[sel.data].cost+(sel.night?I.night.cost:0)+(sel.clean?I.clean.cost:0)+I[sel.alg].cost+I[sel.hw].cost;
        w.innerHTML='<div class="grp"><b>數據</b>'+['d200','d2000'].map(k=>'<button data-g="data" data-k="'+k+'" class="opt2'+(sel.data===k?' on':'')+'">'+I[k].name+' <small>'+I[k].cost+'</small></button>').join('')+'<button data-t="night" class="opt2'+(sel.night?' on':'')+'">'+I.night.name+' <small>'+I.night.cost+'</small></button><button data-t="clean" class="opt2'+(sel.clean?' on':'')+'">'+I.clean.name+' <small>'+I.clean.cost+'</small></button></div>'+
          '<div class="grp"><b>演算法</b>'+['rule','tree','nn'].map(k=>'<button data-g="alg" data-k="'+k+'" class="opt2'+(sel.alg===k?' on':'')+'">'+I[k].name+' <small>'+I[k].cost+'</small></button>').join('')+'</div>'+
          '<div class="grp"><b>運算能力</b>'+['laptop','gpu','cloud'].map(k=>'<button data-g="hw" data-k="'+k+'" class="opt2'+(sel.hw===k?' on':'')+'">'+I[k].name+' <small>'+I[k].cost+'</small></button>').join('')+'</div>'+
          '<div class="budget'+(cost>B.total?' over':'')+'"><span>已用 '+cost+' / '+B.total+' 點</span><i style="width:'+Math.min(100,cost)+'%"></i></div>';
        w.querySelectorAll('button[data-g]').forEach(b=>b.onclick=()=>{sel[b.dataset.g]=b.dataset.k;draw();});w.querySelectorAll('button[data-t]').forEach(b=>b.onclick=()=>{sel[b.dataset.t]=!sel[b.dataset.t];draw();});
        go2.disabled=cost>B.total;};const go2=E.btn('next','開始訓練',()=>res({...sel}));draw();E.actions([w,go2,E.skipBtn(()=>{Object.assign(sel,{data:'d2000',night:true,clean:true,alg:'nn',hw:'gpu'});res({...sel});})]);
      if(window.__auto)setTimeout(()=>{if(attempt===1)res({data:'d2000',night:false,clean:true,alg:'nn',hw:'cloud',_over:true});else{Object.assign(sel,{data:'d2000',night:true,clean:true,alg:'nn',hw:'gpu'});res({...sel});}},200);});
    const n=I[cfg.data].n;const label=[I[cfg.data].name,cfg.night?'夜間照片':'',cfg.clean?'檢查標籤':'',I[cfg.alg].name,I[cfg.hw].name].filter(Boolean).join(' · ');
    await photograph(n,false);if(cfg.night)await photograph(500,true);const r=await cycle({alg:cfg.alg,hw:cfg.hw,n,noise:cfg.clean?0:MD.raw_noise,night:cfg.night},label,true);
    const win=r.day>=B.target&&r.night>=B.target&&r.done;
    if(win){addScore(SC.mission);E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await results('任務完成！日間 '+pct(r.day)+'，夜間 '+pct(r.night)+'，用了 '+r.time.toFixed(1)+' 分鐘。',[{label:'日間',v:r.day},{label:'夜間',v:r.night}],'你平衡了數據、演算法和運算能力。');return;}
    const why=!r.done?'訓練未能在三十分鐘內完成：運算能力不足。':MD.algs[cfg.alg].cap<B.target?'這個演算法的上限低於 90%：要選更合適的演算法。':!cfg.night?'夜間準確率太低：數據缺少夜間照片。':!cfg.clean?'標籤錯誤拖低了準確率：要檢查數據質素。':'照片太少，神經網絡未學好：要更多數據。';
    E.emote(CH.rival,'shake');await results('未達標：日間 '+pct(r.day)+'，夜間 '+pct(r.night)+'。',[{label:'日間',v:r.day,col:r.day>=.9?'#3ACB5A':'#E8A01A'},{label:'夜間',v:r.night,col:r.night>=.9?'#3ACB5A':'#E8A01A'}],why);}}
const RUN=[r1,r2,r3,r4,r5];
async function main(){E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);$('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>AI 學會</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">'+C.meta.note+'</p><button class="primary" id="go">開始訓練</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;await E.say('mentor','學校的智能回收站要裝一部 AI 鏡頭，自動分辨廢紙、金屬和塑膠。AI 要先從大量例子中學習。我們一步步找出甚麼會影響它的表現。');
  for(let i=Math.max(0,(window.__startR||1)-1);i<C.rounds.length;i++){const Rr=C.rounds[i];st.r=i;
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'回合</small><h2>'+Rr.title+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1600),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapNo').textContent='第'+E.NUM[i]+'回合';$('chapTitle').textContent=Rr.title;await go('station');await E.say('mentor',Rr.intro);E.emote(CH.rival,'hop');await E.say('rival',Rr.rival);
    await RUN[i](Rr);await check(Rr.check);E.hideDialog();st.hint=null;}
  const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];E.flash(true);
  E.overlay('<div class="card"><p class="sub" style="margin:0">訓練營完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.log.length+'</b>次實驗</div><div><b>'+st.hints+'</b>提示</div></div>'+
    '<div class="three"><div><b>數據</b><span>數量、質素、多樣性</span></div><div><b>演算法</b><span>學習的方法，要配合數據</span></div><div><b>運算能力</b><span>決定能否及時學完</span></div></div><p style="font-family:var(--serif)">何老師：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
