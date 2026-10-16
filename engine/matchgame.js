/* Matching mode: each match is an action — shoot an arrow, pour oil through a coin */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const SC=GM.scoring,K=E.ancientKit;
const st={r:-1,score:0,hints:0,hint:null,cam:'idle',results:[],fx:[]};
window.__mg=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=.05;E.setEnv('anc_morning',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'},oilman:{name:'賣油翁',col:'#C8A060'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const FONT='"Noto Serif TC","Songti TC",serif';

/* ---------- 陳府家圃 ---------- */
const S={targets:[],gourds:[]};
(function(){const g=new THREE.Group();E.scene.add(g);K.ground(g,160,120,'#8A9A6A',-.01,20,['#7A8A5A','#9AAA7A']);K.paving(g,20,26,0,-3);
  K.building(g,0,-17,12,4,3.4,{roof:'grey',rh:2,sign:'陳府',lanterns:true});const wl=new THREE.MeshLambertMaterial({color:0xE6DCC4});
  [-10,10].forEach(x=>{const w=new THREE.Mesh(new THREE.BoxGeometry(.4,2.2,26),wl);w.position.set(x,1.1,-3);g.add(w);box(.6,.2,26.4,0x4D5862,x,2.25,-3,g);});
  [[-8,-12],[8,-12],[-8.6,6],[8.6,6],[-8.4,-4],[8.4,-4]].forEach(([x,z])=>K.pine(g,x,z,1.3));
  const rack=new THREE.Group();rack.position.set(-7.4,0,1);g.add(rack);box(.1,1.6,.1,0x6A4428,-.8,.8,0,rack);box(.1,1.6,.1,0x6A4428,.8,.8,0,rack);box(1.8,.08,.1,0x6A4428,0,1.5,0,rack);
  for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.TorusGeometry(.45,.025,6,20,Math.PI),M(0x8A5A2B));b.rotation.z=Math.PI/2;b.position.set(-.6+i*.4,1,.06);rack.add(b);}
  const ring=K.tex(256,256,(c,w,h)=>{const cols=['#F4F0E4','#1E1E1E','#3A6FC8','#D8322A','#F2C81A'];for(let i=0;i<5;i++){c.fillStyle=cols[i];c.beginPath();c.arc(w/2,h/2,w/2-i*24,0,7);c.fill();}});
  for(let i=0;i<5;i++){const t=new THREE.Group();t.position.set(-6+i*3,0,-9);g.add(t);box(.1,1.4,.1,0x6A4428,-.5,.7,-.15,t);box(.1,1.4,.1,0x6A4428,.5,.7,-.15,t);
    const face=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.25,28),new THREE.MeshLambertMaterial({color:0xC8A860}));face.rotation.x=Math.PI/2;face.position.y=1.7;t.add(face);
    const fr=new THREE.Mesh(new THREE.CircleGeometry(.72,28),new THREE.MeshLambertMaterial({map:ring}));fr.position.set(0,1.7,.13);t.add(fr);
    const glow=new THREE.Mesh(new THREE.TorusGeometry(.8,.06,8,28),new THREE.MeshBasicMaterial({color:0xF2C14E,transparent:true,opacity:0}));glow.position.set(0,1.7,.15);t.add(glow);
    const el=document.createElement('button');el.className='tlabel';el.hidden=true;$('spots').appendChild(el);const a={el,pos:V(t.position.x,2.75,-9)};E.anchors.push(a);S.targets.push({g:t,face,glow,el,a,word:null,i});}
  for(let i=0;i<4;i++){const gg=new THREE.Group();gg.position.set(-3+i*2,0,.2);g.add(gg);const b=mesh(new THREE.SphereGeometry(.32,16,12),M(0xC9A050),0,.32,0,gg);b.scale.y=1.05;mesh(new THREE.SphereGeometry(.18,14,10),M(0xC09848),0,.78,0,gg);mesh(new THREE.CylinderGeometry(.07,.09,.12,12),M(0xB08840),0,.98,0,gg);
    const coin=new THREE.Group();coin.position.y=1.05;gg.add(coin);const ct=K.tex(128,128,(c,w,h)=>{c.fillStyle='#C8962E';c.beginPath();c.arc(64,64,62,0,7);c.fill();c.fillStyle='#1A1410';c.fillRect(50,50,28,28);c.strokeStyle='#8A6A1E';c.lineWidth=5;c.beginPath();c.arc(64,64,58,0,7);c.stroke();});
    const cm=new THREE.Mesh(new THREE.CircleGeometry(.16,24),new THREE.MeshLambertMaterial({map:ct,side:THREE.DoubleSide}));cm.rotation.x=-Math.PI/2;coin.add(cm);const stain=new THREE.Mesh(new THREE.CircleGeometry(.17,20),new THREE.MeshBasicMaterial({color:0x8A6A10,transparent:true,opacity:0}));stain.rotation.x=-Math.PI/2;stain.position.y=.005;coin.add(stain);
    const glow=new THREE.Mesh(new THREE.TorusGeometry(.42,.04,8,24),new THREE.MeshBasicMaterial({color:0xF2C14E,transparent:true,opacity:0}));glow.rotation.x=Math.PI/2;glow.position.y=.05;gg.add(glow);
    const el=document.createElement('button');el.className='glabel2';el.hidden=true;$('spots').appendChild(el);const a={el,pos:V(gg.position.x,1.55,.2)};E.anchors.push(a);S.gourds.push({g:gg,coin,stain,glow,el,a,i});}
  const om=E.ancientFolk({hat:'farmer',robe:0x8A6A44});om.position.set(...W.npc_layout.oilman);om.rotation.y=-.5;g.add(om);S.oilman=om;
  const pole=box(2.2,.06,.06,0x8A6A3A,0,1.75,0,om);[-1,1].forEach(s2=>{box(.01,.6,.01,0x3A2A1A,s2*1,1.45,0,om);mesh(new THREE.CylinderGeometry(.22,.18,.45,12),M(0x7A5236),s2*1,1.0,0,om);});
  for(let i=0;i<5;i++){const f=E.ancientFolk({});f.position.set(-7+i*.9,0,6.5+(i%2)*.6);f.rotation.y=Math.PI*.9;g.add(f);}
  S.ladle=new THREE.Group();E.scene.add(S.ladle);S.ladle.visible=false;mesh(new THREE.SphereGeometry(.12,12,8,0,Math.PI*2,Math.PI/2,Math.PI/2),M(0x7A5236,{side:THREE.DoubleSide}),0,0,0,S.ladle);box(.04,.04,.7,0x7A5236,0,.05,.4,S.ladle);
})();

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>{const c=E.makeChar(s,d.character_id,d.costume);c.root.position.set(...W.npc_layout[s]);c.target.copy(c.root.position);});
const P=E.makeChar('player','P',[]);P.root.position.set(...W.npc_layout.player);P.target.copy(P.root.position);P.root.rotation.y=Math.PI;
const CH=E.chars;E.lampValue=()=>Math.min(1,.2+st.score/150);

/* camera */
const CAMS={idle:[V(0,5,13),V(0,1.5,-4)],archery:[V(0,4.4,9.8),V(0,1.6,-6.5)],oil:[V(0,3.4,5.6),V(0,.6,-.2)],parallel:[V(0,6.4,12),V(0,1,-3.5)],practice:[V(.1,1.55,1.9),V(0,.85,.2)]};
E.cam.idle=t=>{const c=CAMS[st.cam];E.camera.position.lerp(c[0],.08);E.cam.look.lerp(c[1],.1);};
E.camera.position.copy(CAMS.idle[0]);E.cam.look.copy(CAMS.idle[1]);
const HOME={};function stage(k){const near=k==='oil'||k==='practice';const pos={player:near?[-4.8,0,3.2]:W.npc_layout.player,rival:near?[-6,0,1.8]:W.npc_layout.rival,companion:near?[5.6,0,3.4]:W.npc_layout.companion,mentor:W.npc_layout.mentor};
  Object.entries(pos).forEach(([s2,p])=>{const c=CH[s2];if(!c)return;c.target.set(...p);c.speed=4;});S.oilman.position.set(...(near?[6.2,0,1.2]:W.npc_layout.oilman));}
function camTo(k){st.cam=k;stage(k);return E.sleep(window.__fast?200:1100);}

/* frame & fx */
const tw=[];function tween(d,fn){return new Promise(res=>tw.push({t:0,d:Math.max(.01,d*(window.__fast?.15:1)),fn,res}));}
function onFrame(dt,t){for(let i=tw.length-1;i>=0;i--){const a=tw[i];a.t+=dt;const k=Math.min(1,a.t/a.d);a.fn(k);if(k>=1){tw.splice(i,1);a.res();}}
  for(let i=st.fx.length-1;i>=0;i--){const f=st.fx[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;if(f.dieY!=null&&f.m.position.y<f.dieY)f.life=0;f.m.material.opacity=Math.max(0,Math.min(1,f.life*2));if(f.life<=0){E.scene.remove(f.m);st.fx.splice(i,1);}}
  S.targets.forEach(x=>{x.glow.material.opacity*=.97;});S.gourds.forEach(x=>{x.glow.material.opacity*=.97;});
  if(st.practice){const pr=st.practice;pr.t+=dt;const x=pr.amp*Math.sin(pr.t*pr.w);S.ladle.position.set(pr.base.x+x,pr.base.y,pr.base.z);pr.x=x;}}
function drops(from,to,col,n,good){for(let i=0;i<n;i++){setTimeout(()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),new THREE.MeshBasicMaterial({color:col,transparent:true}));m.position.copy(from).add(V((Math.random()-.5)*(good?.004:.06),0,(Math.random()-.5)*(good?.004:.06)));E.scene.add(m);
  st.fx.push({m,v:V(good?0:(Math.random()-.5)*.9,-.2,good?0:(Math.random()-.5)*.9),g:7,life:1.4,dieY:good?to.y-.25:to.y-.02});},i*(window.__fast?8:45));}}

/* hud */
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
$('assist').onclick=()=>{if(!st.hint)return;st.hints++;addScore(-SC.hint_penalty);E.bubble('歐陽修的提示（扣 '+SC.hint_penalty+' 分）',st.hint,6500);};
$('textBtn').onclick=async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>賣油翁　<small style="font-size:15px;color:#6F6450">歐陽修</small></h2><div class="orig">'+C.text.map(p=>'<p>'+p+'</p>').join('')+'</div><button class="primary" id="tc">收起</button></div>',true);await E.waitClick('#tc');E.clearOverlay();};

/* ---------- generic pick-then-place matcher ---------- */
function matcher(opts){/* opts: chips[], slots[{el,key,label}], isRight(chip,slot), onTry(chip,slot,ok)=>Promise, prompt */
  return new Promise(async res=>{let sel=null;const done=new Set();let tries=0,firstTry=0,wrongs={};
    const draw=()=>{const w=document.createElement('div');w.className='chips';opts.chips.forEach(c=>{if(done.has(c.key))return;w.appendChild(E.btn('chipb arrow'+(sel===c?' on':''),c.label,()=>{sel=c;draw();}));});
      const st2=document.createElement('p');st2.className='status';st2.textContent=sel?'已選「'+sel.label+'」，'+opts.place:'先選一個意思。';E.actions([w,st2,E.skipBtn(async()=>{for(const sl of opts.slots){if(sl.done)continue;const c=opts.chips.find(c=>opts.isRight(c,sl));sl.done=true;done.add(c.key);await opts.onTry(c,sl,true,true);}res({first:0,total:opts.slots.length,skipped:true});})]);};
    opts.slots.forEach(sl=>{sl.el.hidden=false;sl.el.textContent=sl.label;sl.el.classList.remove('done');sl.el.onclick=async()=>{if(!sel||sl.done||opts.busy)return;opts.busy=true;const c=sel;const ok=opts.isRight(c,sl);sel=null;E.actions([]);
      await opts.onTry(c,sl,ok);opts.busy=false;if(ok){sl.done=true;done.add(c.key);sl.el.classList.add('done');if(!wrongs[sl.key])firstTry++;addScore(wrongs[sl.key]?SC.match_retry:SC.match_first_try);}else{wrongs[sl.key]=1;}
      if(opts.slots.every(s=>s.done)){res({first:firstTry,total:opts.slots.length});return;}draw();};});
    E.actions([]);await E.showLine('mentor',opts.prompt);draw();});}

/* ---------- rounds ---------- */
async function archery(R){await camTo('archery');P.root.rotation.y=Math.PI;let first=0,total=0,skipped=false;
  for(const wv of R.waves){const items=E.shuffle(wv.pairs.map(p=>({key:p[0],word:p[0],label:p[1]}))).concat([{key:'decoy',label:wv.decoy[0],decoy:wv.decoy[1]}]);E.shuffle(items);
    const slots=wv.pairs.map((p,i)=>{const T=S.targets[i];T.word=p[0];return {el:T.el,key:p[0],label:p[0],T};});S.targets.forEach((T,i)=>{T.el.hidden=i>=wv.pairs.length;T.face.material.color.setHex(0xC8A860);});
    st.hint='看清楚每個字在文中的意思：例如「睨」是斜著眼看，「頷」是點頭。';
    const r=await matcher({chips:items,slots,isRight:(c,s)=>c.key===s.key,place:'再點擊寫著相應字詞的箭靶。',prompt:R.intro,
      onTry:async(c,s,ok,quick)=>{const from=V(.35,1.6,2.9),T=s.T,to=T.g.position.clone().add(V(0,1.7,.15));const ar=new THREE.Group();const sh=mesh(new THREE.CylinderGeometry(.018,.018,.9,6),M(0x8A6A3A),0,0,0,ar);sh.rotation.x=Math.PI/2;mesh(new THREE.ConeGeometry(.04,.12,6),M(0x8A8E92),0,0,-.5,ar).rotation.x=-Math.PI/2;
        E.scene.add(ar);E.emote(P,'hop');const end=ok?to:from.clone().lerp(to,.55).setY(.05);await tween(quick?.2:.7,k=>{ar.position.lerpVectors(from,end,k);ar.position.y+=Math.sin(k*Math.PI)*(ok?.9:.5);ar.lookAt(end.x,end.y+(ok?0:-2),end.z);});
        if(ok){ar.position.copy(to).add(V((Math.random()-.5)*.08,(Math.random()-.5)*.08,.25));T.glow.material.opacity=1;T.face.material.color.setHex(0xE8D080);if(!quick)toast('正中紅心','「'+s.label+'」：'+c.label+'。','ok');}
        else{E.emote(CH.rival,'hop');toast('射偏了',c.decoy||('「'+s.label+'」不是「'+c.label+'」的意思。'),'bad');setTimeout(()=>E.scene.remove(ar),1500);}}});
    first+=r.first;total+=r.total;skipped=skipped||r.skipped;S.targets.forEach(T=>T.el.hidden=true);await E.sleep(600);}
  return {first,total,skipped};}
async function oil(R){await camTo('oil');const items=E.shuffle(R.pairs.map(p=>({key:p[0],label:p[1]})).concat([{key:'decoy',label:R.decoy[0],decoy:R.decoy[1]}]));
  const slots=R.pairs.map((p,i)=>{const G=S.gourds[i];G.stain.material.opacity=0;return {el:G.el,key:p[0],label:p[0],G};});st.hint='想想人物說話或做事時的心情：自矜是驕傲，忿然是憤怒。';
  const r=await matcher({chips:items,slots,isRight:(c,s)=>c.key===s.key,place:'再點擊寫著相應句子的葫蘆。',prompt:R.intro,
    onTry:async(c,s,ok,quick)=>{const G=s.G,top=G.g.position.clone().add(V(0,1.06,0));S.ladle.visible=true;S.ladle.position.copy(top).add(V(0,.6,.1));S.ladle.rotation.set(0,0,0);
      await tween(quick?.15:.4,k=>{S.ladle.rotation.x=-.9*k;});drops(top.clone().add(V(0,.5,0)),top,0xE8B030,quick?6:22,ok);await E.sleep(quick?150:1200);S.ladle.rotation.x=0;S.ladle.visible=false;
      if(ok){G.glow.material.opacity=1;if(!quick)toast('錢孔入油，錢不濕','「'+s.label+'」：'+c.label+'。','ok');}else{G.stain.material.opacity=.55;E.emote(CH.rival,'hop');toast('油沾濕了銅錢',c.decoy||('「'+s.label+'」表現的不是「'+c.label+'」。'),'bad');setTimeout(()=>G.stain.material.opacity=0,1800);}}});
  S.gourds.forEach(G=>G.el.hidden=true);await E.say('mentor',R.contrast);return r;}
async function parallel(R){await camTo('parallel');st.hint='左邊是射箭，右邊是酌油：技藝、表現、道理一一對應。';let first=0,wrong=0;const done=new Set();
  await new Promise(async res=>{let sel=null;const L=E.shuffle(R.pairs.map(p=>p[0])),Rr=E.shuffle(R.pairs.map(p=>p[1]));
    const draw=()=>{const w=document.createElement('div');w.className='pairs2';const cl=document.createElement('div'),cr=document.createElement('div');cl.className=cr.className='pcol';cl.innerHTML='<h4>射箭</h4>';cr.innerHTML='<h4>酌油</h4>';w.append(cl,cr);
      L.forEach(x=>cl.appendChild(E.btn('pchip'+(done.has(x)?' done':'')+(sel===x?' sel':''),x,()=>{if(done.has(x))return;sel=x;draw();})));
      Rr.forEach(y=>{const isD=[...done].some(x=>R.pairs.find(p=>p[0]===x)[1]===y);cr.appendChild(E.btn('pchip'+(isD?' done':''),y,()=>{if(!sel||isD)return;const pi=R.pairs.findIndex(p=>p[0]===sel);if(R.pairs[pi][1]===y){done.add(sel);addScore(wrong?SC.match_retry:SC.match_first_try);if(!wrong)first++;
        S.targets[pi].glow.material.opacity=1;S.gourds[pi].glow.material.opacity=1;toast('一一對應',sel+' ↔ '+y,'ok');}else{wrong++;toast('對不上',sel+' 和 '+y+' 不是相對應的部分。','bad');}sel=null;draw();if(done.size===R.pairs.length)setTimeout(res,500);}));});
      E.actions([w,E.skipBtn(()=>{R.pairs.forEach(p=>done.add(p[0]));draw();setTimeout(res,500);})]);};
    E.actions([]);await E.showLine('mentor',R.intro);draw();});
  E.actions([]);await E.say('oilman','我亦無他，惟手熟爾。');return {first,total:R.pairs.length};}
async function practice(R){{const G0=S.gourds[1],t0=G0.g.position.clone().add(V(0,1.06,0));CAMS.practice=[t0.clone().add(V(.15,.6,1.7)),t0.clone().add(V(0,-.12,0))];}await camTo('practice');st.hint='等杓子擺到錢孔正上方（中間）時才按「倒油」。';const G=S.gourds[1],top=G.g.position.clone().add(V(0,1.06,0));
  S.gourds.forEach(g=>g.el.hidden=true);S.ladle.visible=true;S.ladle.rotation.set(0,0,0);const res2=[];
  for(let a=0;a<R.attempts;a++){const amp=.42*Math.pow(.68,a);st.practice={t:Math.random()*3,w:3.2,amp,base:top.clone().add(V(0,.55,.1)),x:0};
    await new Promise(async res=>{E.actions([]);await E.showLine('narrator','第 '+(a+1)+' / '+R.attempts+' 次練習。杓子對準錢孔時，按「倒油」。');const row=document.createElement('p');row.className='tries';row.textContent=res2.map(x=>x?'✓':'✗').join(' ')||'—';
      const bt=E.btn('next','倒油',()=>{res();});E.actions([row,bt]);if(window.__auto)setTimeout(()=>{const pr=st.practice;const wait=()=>{if(Math.abs(pr.x)<.02||pr.amp<.03)res();else requestAnimationFrame(wait);};wait();},50);});
    const pr=st.practice,ok=Math.abs(pr.x)<.06;st.practice=null;E.actions([]);await tween(.25,k=>{S.ladle.rotation.x=-.9*k;});drops(S.ladle.position.clone().add(V(0,-.05,0)),top,0xE8B030,18,ok);await E.sleep(1000);S.ladle.rotation.x=0;
    res2.push(ok);if(ok){addScore(SC.practice_hit);G.glow.material.opacity=1;toast('自錢孔入，錢不濕','','ok');}else{G.stain.material.opacity=.55;toast('沾濕了銅錢','再練一次，手會越來越穩。','bad');setTimeout(()=>G.stain.material.opacity=0,900);}}
  S.ladle.visible=false;const early=res2.slice(0,3).filter(Boolean).length,late=res2.slice(3).filter(Boolean).length;
  await E.say('mentor','你頭三次成功了 '+early+' 次，後三次成功了 '+late+' 次。'+(late>=early?'越練越準，這就是「熟能生巧」。':'多練幾次，手就會越來越穩。'));return {first:late,total:3,practice:res2};}
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){addScore(Math.max(2,SC.check_first_try-w*SC.check_wrong_penalty));E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}
const RUN={archery,oil,parallel,practice};
async function main(){E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);$('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>陳府家圃</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">四輪配對：先選一個答案，再點擊它對應的箭靶或葫蘆。配對正確，箭就會正中紅心，油就會穿過錢孔。隨時可按「原文」重溫課文。</p><button class="primary" id="go">入府</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  await E.say('mentor','陳康肅公善射，當世無雙。這天他在家圃射箭，有個賣油的老翁放下擔子，站在一旁看了很久……');
  for(let i=Math.max(0,(window.__startR||1)-1);i<C.rounds.length;i++){const R=C.rounds[i];st.r=i;
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'輪</small><h2>'+R.title+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1600),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapNo').textContent='第'+E.NUM[i]+'輪';$('chapTitle').textContent=R.title;E.emote(CH.rival,'hop');await E.say('rival',R.rival);
    const r=await RUN[R.type](R);st.results.push(Object.assign({title:R.title},r));await check(R.check);E.hideDialog();st.hint=null;}
  await camTo('idle');const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));
  E.overlay('<div class="card"><p class="sub" style="margin:0">四輪完成</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.hints+'</b>提示</div></div><ul class="review">'+st.results.map(r=>'<li><b>'+r.title+'</b><p>'+(r.practice?'練習：'+r.practice.map(x=>x?'✓':'✗').join(' '):(r.skipped?'看了答案':'一次配對正確 '+r.first+' / '+r.total))+'</p></li>').join('')+'</ul><div class="orig">'+C.text.map(p=>'<p>'+p+'</p>').join('')+'</div><p style="font-family:var(--serif)">歐陽修：'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
