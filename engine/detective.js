/* Detective mode (source-based investigation) built on ENG */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const EV=C.evidence;
const st={loc:-1,meter:GM.meter.start,shown:GM.meter.start,score:0,hints:0,cards:[],testimony:[],yaw:0,drag:null,fx:[],anims:[],wrongs:0,hint:null};
window.__det=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.parallax=.1;
E.SPK={narrator:{name:'你',col:'#F4EBD6'},card:{name:'證物',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const L=W.locations,LP={};Object.keys(L).forEach(k=>LP[k]=V(...L[k]));
E.setEnv('morning',true);

/* ---------- sets ---------- */
const S={};
(function(){
  const g0=mesh(new THREE.PlaneGeometry(400,120),M(0x86A85E),84,0,-10,E.scene);g0.rotation.x=-Math.PI/2;
  const r=E.rng(5);for(let i=0;i<90;i++){const x=-30+r()*230,z=-50+r()*30;E.tree(E.scene,x,z,1+r(),r()<.4?'pine':'',[0x5E8F4C,0x6FA35A][i%2]);}
  for(let i=0;i<20;i++){const x=-40+i*14,h=14+r()*14;const m=mesh(new THREE.ConeGeometry(12+r()*6,h,5),M(0x7E93A6,{flatShading:true}),x,h/2-1,-75-r()*15,E.scene);}
  // teahouse
  {const g=new THREE.Group();g.position.copy(LP.teahouse);E.scene.add(g);box(12,.25,9,0x9C6A3C,0,.12,-1.5,g);
    [[-5.6,2.8],[5.6,2.8],[-5.6,-5.8],[5.6,-5.8],[-2,-5.8],[2,-5.8]].forEach(([x,z])=>box(.3,3.4,.3,0xA8322A,x,1.85,z,g));
    const rf=mesh(E.roofGeo(),M(0x4D5862),0,4.3,-1.5,g);rf.scale.set(6.8/.707,1.4,5.2/.707);
    box(4,.6,2.2,0x7A4A2A,0,.55,-4.4,g);box(1.4,.8,.7,0x8A5A2B,0,1.25,-4.3,g);box(.3,.08,.14,0x3A2A1A,.3,1.7,-4.1,g);
    [[-3.4,-.6],[3.4,-.4],[-3.2,1.6],[3.6,1.8]].forEach(([x,z])=>{box(1.2,.08,1.2,0x8A5A2B,x,.9,z,g);box(.12,.75,.12,0x6E4A32,x,.5,z,g);for(let k=0;k<2;k++)mesh(new THREE.CylinderGeometry(.07,.05,.1,10),M(0xF2EFE6),x-.25+k*.5,1,z,g);});
    [-4,-1.3,1.3,4].forEach(x=>E.lantern(g,x,3.3,2.6));
    const pst=new THREE.Group();pst.position.set(5,0,-2.2);g.add(pst);box(.1,2.4,.1,0x6E4A32,0,1.2,0,pst);box(1.3,1.7,.06,0xC8452F,0,1.9,.05,pst);box(1,.25,.02,0xF2C14E,0,2.45,.09,pst);
    S.teahouse={g,hot:{poster:V(5,2.6,-2.1),script:V(.3,1.9,-4.1)}};}
  // library
  {const g=new THREE.Group();g.position.copy(LP.library);E.scene.add(g);E.house(g,0,-7,12,4,4.6,0xE6D6B4,0x4D5862,0);box(12,.2,8,0xB89A70,0,.1,-1.5,g);
    const shelf=(x,col)=>{const s=new THREE.Group();s.position.set(x,0,-4);g.add(s);box(2.4,3,.6,0x6E4A32,0,1.5,0,s);for(let row=0;row<4;row++){box(2.3,.05,.55,0x5A3A22,0,.35+row*.7,.02,s);for(let k=0;k<9;k++)box(.18,.5,.4,[0x8A2A2A,0x2A4A6A,0x4A6A3A,0xB8862A][(k+row)%4],-1+k*.25,.62+row*.7,.05,s);}
      box(.5,.6,.42,col,0,1.37+.7,.12,s);return s;};
    shelf(-3.6,0xE04A3A);shelf(0,0xF2C14E);shelf(3.6,0x3FA8E0);
    box(2.2,.1,1.2,0x8A5A2B,0,.85,.6,g);const sc=mesh(new THREE.CylinderGeometry(.08,.08,1,10),M(0xE8DCC0),0,.98,.6,g);sc.rotation.z=Math.PI/2;
    S.library={g,hot:{b1:V(-3.6,2.5,-3.6),b2:V(0,2.5,-3.6),b3:V(3.6,2.5,-3.6)}};}
  // water sets
  const water=(c,w,d)=>{const m=mesh(new THREE.PlaneGeometry(w,d,24,12),new THREE.MeshPhongMaterial({color:0x4F8FB8,transparent:true,opacity:.88,shininess:70}),c.x,.38,c.z-4,E.scene);m.rotation.x=-Math.PI/2;m.userData.base=m.geometry.attributes.position.array.slice();waters.push(m);return m;};
  const waters=[];S.waters=waters;
  {const c=LP.ruxu;water(c,40,22);const b=new THREE.Group();b.position.set(c.x,.55,c.z-3);E.scene.add(b);
    box(4.2,.6,1.6,0x7A4A2A,0,0,0,b);box(1.6,1,1.2,0xA8322A,-.6,.8,0,b);const rf=mesh(E.roofGeo(),M(0x4D5862),-.6,1.55,0,b);rf.scale.set(1.2/.707,.5,.9/.707);box(.08,2.6,.08,0x5A3A22,1.2,1.3,0,b);
    const fl=box(.9,.55,.02,0xF2C14E,1.62,2.2,0,b);S.boat=b;S.boatSides=[0,0];
    const shore=box(40,.6,6,0x9A8E6A,c.x,.2,c.z-15,E.scene);for(let i=0;i<7;i++){const t=new THREE.Group();t.position.set(c.x-10+i*3.3,.5,c.z-14);E.scene.add(t);box(.5,1,.4,0x2F3A4A,0,.7,0,t);mesh(new THREE.SphereGeometry(.22,8,6),M(0xD8B890),0,1.4,0,t);}
    S.ruxu={c};}
  {const c=LP.chibi;water(c,46,24);
    for(let i=0;i<10;i++){const sd=i<5?-1:1,k=i%5;box(3+r()*2,5+r()*4,4,i%2?0xB0402E:0xC0503A,c.x+sd*(17+k*1.2),2.5,c.z+5-k*4.2,E.scene);}
    const fleet=[];for(let i=0;i<7;i++){const s=new THREE.Group();s.position.set(c.x-9+i*3,.6,c.z-9);E.scene.add(s);box(2.6,.6,1.2,0x5A4A3A,0,0,0,s);box(1.2,.9,.9,0x3A3A44,0,.7,0,s);box(.08,2.2,.08,0x3A2A1A,.6,1.2,0,s);box(.7,.5,.02,0x2A2A2A,.92,1.9,0,s);fleet.push(s);if(i)box(.6,.06,.06,0x8A8A8A,-1.6,.2,0,s);}
    const fire=[];for(let i=0;i<5;i++){const s=new THREE.Group();s.position.set(c.x-8+i*4,.5,c.z+3.5);E.scene.add(s);box(1.6,.4,.7,0x8A5A2B,0,0,0,s);box(1.2,.5,.5,0xC9B36A,0,.4,0,s);fire.push(s);}
    const tents=[];for(let i=0;i<5;i++){const t=mesh(new THREE.ConeGeometry(1.1,1.4,4),M(0xD8CCB0),c.x-8+i*4,.7,c.z-15.5,E.scene);tents.push(t);}
    box(46,.6,5,0x9A8E6A,c.x,.2,c.z-15.5,E.scene);
    const vane=new THREE.Group();vane.position.set(c.x+12,0,c.z+5);E.scene.add(vane);box(.1,4,.1,0x5A3A22,0,2,0,vane);const flag=box(1.4,.8,.03,0xE04A3A,.7,3.6,0,vane);S.flag=flag;
    S.chibi={c,fleet,fire,tents,hot:{}};}
  // court
  {const g=new THREE.Group();g.position.copy(LP.court);E.scene.add(g);box(13,.3,10,0xBFB094,0,.15,-1.5,g);
    [[-5.5,-5.5],[5.5,-5.5],[-5.5,2.5],[5.5,2.5]].forEach(([x,z])=>box(.35,4.2,.35,0xA8322A,x,2.3,z,g));const rf=mesh(E.roofGeo(),M(0x4D5862),0,5,-1.5,g);rf.scale.set(7/.707,1.3,5.6/.707);
    box(3.6,1.1,1.1,0x7A2A22,0,.85,-3.4,g);box(3.8,.08,1.2,0xC9962E,0,1.42,-3.4,g);box(3.4,1,.1,0x2A2A33,0,3.4,-5.4,g);box(2.8,.6,.02,0xE0B04B,0,3.4,-5.33,g);
    [-4.6,4.6].forEach(x=>box(.8,.6,3,0x8A5A2B,x,.6,0,g));S.court={g};}
})();

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const CH=E.chars;E.lampValue=()=>st.shown/100;
function place(loc,instant,court){const lay=court?W.court_layout:W.npc_layout;const k=E.portrait?.7:1;
  Object.values(CH).forEach(c=>{const l=lay[c.slot];const t=LP[loc].clone().add(V(l[0]*k,0,l[2]));if(loc==='ruxu'||loc==='chibi')t.z+=8.5;c.target.copy(t);if(instant)c.root.position.copy(t);else c.speed=Math.max(3,c.root.position.distanceTo(t)/3);});}

/* camera */
function view(loc){const p=LP[loc];const water=loc==='ruxu'||loc==='chibi';
  if(E.portrait)return {look:p.clone().add(V(0,water?.4:1.3,water?-2:-1.8)),off:water?V(0,9,20):V(0,1.9,13.5)};
  return {look:p.clone().add(V(0,water?1:1.2,water?-1:-1.6)),off:water?V(0,6,15.5):V(0,3.2,9)};}
let vw=null;E.cam.idle=t=>{if(!vw){const a=t*.05;E.camera.position.set(Math.sin(a)*12,4,Math.cos(a)*12);E.cam.look.set(0,1.2,-1.5);return;}
  E.camera.position.copy(vw.look).add(vw.off.clone().applyAxisAngle(V(0,1,0),st.yaw));E.cam.look.copy(vw.look);};
async function goTo(loc,court){const v=view(loc);const from={p:E.camera.position.clone(),l:E.cam.look.clone()};vw=null;place(loc,false,court);
  await E.camTo(v.look.clone().add(v.off),v.look,st.loc<0?2:3.2);st.yaw=0;vw=v;}
E.canvas.addEventListener('pointerdown',e=>{if(!vw)return;st.drag={x:e.clientX,y0:st.yaw,m:0};E.canvas.setPointerCapture(e.pointerId);});
E.canvas.addEventListener('pointermove',e=>{if(!st.drag)return;st.drag.m=Math.max(st.drag.m,Math.abs(e.clientX-st.drag.x));const lim=GM.camera.user_orbit_deg*Math.PI/180;st.yaw=Math.max(-lim,Math.min(lim,st.drag.y0-(e.clientX-st.drag.x)*.005));});
['pointerup','pointercancel'].forEach(k=>E.canvas.addEventListener(k,()=>st.drag=null));

/* frame */
function anim(dur,update){return new Promise(res=>st.anims.push({t:0,dur:E.RM?.05:dur,update,done:res}));}
function onFrame(dt,t){
  st.shown+=(st.meter-st.shown)*Math.min(1,dt*2.5);meterHud();
  for(let i=st.anims.length-1;i>=0;i--){const a=st.anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.update(k,dt);if(k>=1){st.anims.splice(i,1);a.done();}}
  S.waters.forEach(w=>{const pa=w.geometry.attributes.position,b=w.userData.base;for(let i=0;i<pa.count;i++){pa.array[i*3+2]=Math.sin(b[i*3]*.6+t*1.4)*.06+Math.cos(b[i*3+1]*.8+t)*.05;}pa.needsUpdate=true;});
  for(let i=st.fx.length-1;i>=0;i--){const f=st.fx[i];f.life-=dt;f.m.position.addScaledVector(f.v,dt);f.v.y+=f.g*dt;if(f.m.material.opacity!=null)f.m.material.opacity=Math.max(0,Math.min(1,f.life));f.m.scale.multiplyScalar(f.grow||1);if(f.life<=0){E.scene.remove(f.m);st.fx.splice(i,1);}}
  if(S.boat){S.boat.position.y=.55+Math.sin(t*1.3)*.05;}
  if(S.flag)S.flag.rotation.y=Math.sin(t*3)*.15+(st.windOn?-.6:0);
}
function puff(pos,col,n,spd,g,life,size,grow){for(let i=0;i<n;i++){const m=mesh(new THREE.SphereGeometry(size||.25,6,4),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:1}),pos.x+(Math.random()-.5),pos.y,pos.z+(Math.random()-.5),E.scene);
  st.fx.push({m,v:V((Math.random()-.5)*spd,Math.random()*spd+.5,(Math.random()-.5)*spd),g:g||0,life:life||1.5,grow});}}

/* hud & helpers */
function meterHud(){const v=Math.round(st.shown);$('mStage').textContent=v;$('mBar').style.width=v+'%';$('mBar').style.background=v<40?'var(--cinnabar)':v>=75?'var(--jade)':'var(--gold)';$('mGlow').setAttribute('opacity',(.15+v/100*.85).toFixed(2));}
function meter(n){st.meter=Math.max(0,Math.min(100,st.meter+n));}
function addScore(n){st.score=Math.max(0,st.score+n);$('score').textContent=st.score;}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4000);}
function cardHTML(id){const e=EV[id];return '<div class="ecard"><div class="eh"><b>'+e.name+'</b><span>'+e.kind+'</span></div><dl><dt>作者</dt><dd>'+e.author+'</dd><dt>時間</dt><dd>'+e.date+'</dd><dt>立場</dt><dd>'+e.stance+'</dd></dl><p class="ex">'+e.excerpt+'</p><p class="nt">'+e.note+'</p></div>';}
async function getCard(id,by){const isNew=!st.cards.includes(id);if(isNew)st.cards.push(id);$('nbCount').textContent=st.cards.length;
  E.actions([]);await E.showLine(by||'card',(isNew?'新證物：':'')+EV[id].name);const d=document.createElement('div');d.innerHTML=cardHTML(id);await new Promise(r=>E.actions([d.firstChild,E.btn('next','收入證物冊',r)]));}
$('notebook').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay('<div class="card"><h2>證物冊</h2><p class="sub">每份史料都要問：誰寫的？甚麼時候寫的？是甚麼性質？</p><div class="cards">'+(st.cards.map(cardHTML).join('')||'<p class="sub">還沒有證物。</p>')+(st.testimony.length?'<h3>說書人的證詞</h3><ol class="tst">'+st.testimony.map(t=>'<li>'+t+'</li>').join('')+'</ol>':'')+'</div><button class="primary" id="nbc">收起</button></div>',true);await E.waitClick('#nbc');E.clearOverlay();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;addScore(-GM.scoring.hint_penalty);E.bubble('學伴提示（扣 '+GM.scoring.hint_penalty+' 分）',st.hint,6500);});
function hotspots(loc,list,base){return new Promise(res=>{const left=new Set(list.map(h=>h.id));const els=[];
  list.forEach(h=>{const el=document.createElement('button');el.className='spot';el.textContent=h.label;$('spots').appendChild(el);const pos=(S[loc].hot[h.id]).clone().add(LP[loc]);const a={el,pos};E.anchors.push(a);els.push(a);
    el.addEventListener('click',async()=>{if(st.busy)return;st.busy=true;el.remove();E.anchors.splice(E.anchors.indexOf(a),1);left.delete(h.id);await getCard(h.evidence||h.id);st.busy=false;
      if(!left.size)res();else{E.actions([]);E.showLine('companion','還有 '+left.size+' 處可以查看。');}});});
  E.actions([]);E.showLine('companion',base);});}

/* ---------- locations ---------- */
async function locTeahouse(l){
  await E.say('companion',l.lines.enter);E.emote(CH.rival,'hop');CH.rival.talk=true;await E.say('rival',l.lines.rival);
  await E.say('mentor',l.lines.mentor);st.hint='點擊畫面上的標籤：戲曲海報和說書人的話本。';
  await hotspots('teahouse',l.hotspots,'點擊標籤，查看茶館裡的線索。');
  st.testimony=C.locations.find(x=>x.type==='cross_exam').testimony.map(t=>t.text);toast('已記錄說書人的證詞','共 '+st.testimony.length+' 句，可在「證物冊」查看。','');
  await E.say('mentor',l.testimony_intro);
}
async function locLibrary(l){
  await E.say('companion',l.lines.enter);st.hint='三部書分別放在左、中、右三個書架上，點擊它們的標籤。';
  await hotspots('library',l.hotspots,'點擊三個書架上的書。');
  const T=l.timeline;const items=E.shuffle(T.items.map((x,i)=>({text:x.text,i})));let first=true;st.hint='先發生事件，然後才有人寫史書；注釋要在原書之後；小說最晚。';
  for(;;){const order=[];const ok=await new Promise(async res=>{const wrap=document.createElement('div');const draw=()=>{wrap.innerHTML='';const ol=document.createElement('ol');ol.className='seqlist';for(let k=0;k<items.length;k++){const li=document.createElement('li');li.textContent=order[k]?order[k].text:'……';if(!order[k])li.className='empty';ol.appendChild(li);}wrap.appendChild(ol);
        const ch=document.createElement('div');ch.className='chips';items.forEach(it=>{const used=order.includes(it);ch.appendChild(E.btn('chipb'+(used?' used':''),it.text,()=>{if(used)return;order.push(it);draw();}));});wrap.appendChild(ch);sub.disabled=order.length<items.length;};
      const sub=E.btn('next','確定次序',()=>res(order.every((o,k)=>o.i===k)));const rs=E.btn('ghost','重排',()=>{order.length=0;draw();});draw();E.actions([]);await E.showLine('mentor',T.prompt);E.actions([wrap,sub,rs,E.skipBtn(()=>res('skip'))]);});
    if(ok==='skip'){first=false;break;}if(ok)break;first=false;toast('次序不對',st.hint,'bad');E.emote(CH.companion,'shake');}
  if(first)addScore(GM.scoring.timeline_first_try);meter(8);toast('次序正確','赤壁之戰（208）→《三國志》（約 280 年代）→ 裴注（429）→《三國演義》（約 14 世紀）','ok');
  await E.say('mentor',l.lines.after);
}
async function locRuxu(l){
  await E.say('mentor',l.lines.enter);const b=S.boat;st.hint='先按「曹軍放箭」，船傾側後再按「掉轉船身」。';
  const arrows=[[],[]];let side=0,tilt=0;
  const shoot=async n=>{for(let i=0;i<n;i++){const z=side?-.82:.82;const ar=new THREE.Group();const sh=mesh(new THREE.CylinderGeometry(.025,.025,1.1,5),M(0x6E4A32),0,0,0,ar);sh.rotation.z=Math.PI/2;mesh(new THREE.ConeGeometry(.05,.15,5),M(0x8A8A8A),.6,0,0,ar).rotation.z=-Math.PI/2;
      const from=V(b.position.x-1.6+Math.random()*3.2,4,b.position.z-14);ar.position.copy(from);E.scene.add(ar);const lx=-1.6+Math.random()*3.2,ly=.1+Math.random()*.9;
      anim(.5,k=>{const to=b.localToWorld(V(lx,ly,z*(side?1:1)));ar.position.lerpVectors(from,to,k);ar.position.y+=Math.sin(k*Math.PI)*2;ar.lookAt(to);ar.rotateY(Math.PI/2);}).then(()=>{E.scene.remove(ar);b.add(ar);ar.position.set(lx,ly,side?-.85:.85);ar.rotation.set(0,side?Math.PI/2:-Math.PI/2,(Math.random()-.5)*.4);arrows[side].push(ar);});
      await E.sleep(80);}await E.sleep(600);};
  const setTilt=()=>{const d=arrows[0].length-arrows[1].length;const target=Math.max(-.32,Math.min(.32,d*.018));return anim(.8,k=>{b.rotation.x=tilt+(target-tilt)*k;}).then(()=>tilt=target);};
  await new Promise(res=>{let shots=0;const btn=E.btn('next','曹軍放箭',async()=>{btn.disabled=true;await shoot(6);shots++;await setTilt();if(shots>=3){E.emote(CH.companion,'shake');E.floatBubble(CH.companion,'船要翻了！',2200);res();}else btn.disabled=false;});
    E.actions([]);E.showLine('narrator',l.lines.task).then(()=>E.actions([btn]));});
  await E.say('companion',l.lines.tilt);
  await new Promise(res=>{const btn=E.btn('next','掉轉船身',async()=>{btn.disabled=true;await anim(1.6,k=>{b.rotation.y=Math.PI*k;});side=1;b.rotation.y=0;
      arrows[0].forEach(a=>{a.position.z=-a.position.z;a.rotation.y+=Math.PI;});arrows[1]=arrows[0];arrows[0]=[];tilt=-tilt;b.rotation.x=tilt;side=0;
      const again=E.btn('next','曹軍再放箭',async()=>{again.disabled=true;await shoot(18);await setTilt();res();});E.actions([again]);});
    E.actions([]);E.showLine('narrator',l.lines.task2).then(()=>E.actions([btn]));});
  E.flash(true);await E.say('mentor',l.lines.done);await getCard(l.evidence,'mentor');meter(8);
}
async function locChibi(l){
  await E.say('mentor',l.lines.enter);const X=S.chibi;st.hint='逐一按下面的按鈕，從不同史料的角度重演赤壁之戰。';
  const done=new Set();
  const show={
    fire:async()=>{const tg=X.fleet;await anim(3,k=>{X.fire.forEach((s,i)=>{s.position.z=X.c.z+3.5-k*11.5;s.position.x=X.c.x-8+i*4;});});
      X.fire.forEach(s=>puff(s.position.clone().add(V(0,.8,0)),0xFF8A2A,6,1.2,1,1.2,.35));for(let i=0;i<tg.length;i++){const s=tg[i];setTimeout(()=>{for(let k=0;k<3;k++)puff(s.position.clone().add(V(0,1,0)),k?0xFFB23A:0xFF5A1A,8,1.4,1.2,1.6,.4);s.children.forEach(m=>{if(m.material&&m.material.color)m.material=M(0x2A2420);});},i*260);}
      E.flash(false,0xFF6A2A);await E.sleep(2600);for(let i=0;i<14;i++)puff(V(X.c.x-9+Math.random()*18,1.5,X.c.z-9),0x4A4A4A,2,.8,.6,3,.6,1.01);},
    wind:async()=>{st.windOn=true;for(let i=0;i<30;i++){const m=mesh(new THREE.BoxGeometry(1.4,.03,.03),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.7}),X.c.x+8+Math.random()*6,1+Math.random()*4,X.c.z+4+Math.random()*4,E.scene);m.rotation.y=.8;st.fx.push({m,v:V(-6,0,-6),g:0,life:2.2});}await E.sleep(2200);},
    plague:async()=>{X.tents.forEach(t=>{for(let k=0;k<4;k++)puff(t.position.clone().add(V(0,1,0)),0x9AB86A,3,.5,.3,3,.5,1.005);});E.flash(false,0x5A6A3A);await E.sleep(2500);},
    self:async()=>{for(let i=X.fleet.length-1;i>=0;i--){const s=X.fleet[i];puff(s.position.clone().add(V(0,1,0)),0xFF8A2A,6,1,1,1.4,.35);await E.sleep(180);}E.emote(CH.rival,'shake');await E.sleep(1400);}
  };
  await new Promise(res=>{const draw=()=>{const nodes=l.replays.map(rp=>{const b=E.btn(done.has(rp.id)?'chipb used':'chipb',rp.button,async()=>{if(st.busy||done.has(rp.id))return;st.busy=true;E.actions([]);E.hideDialog();
        await show[rp.show]();toast(rp.button.replace('按','').replace('重演',''),rp.caption,'');await getCard(rp.evidence,'mentor');done.add(rp.id);st.busy=false;if(done.size>=l.replays.length)res();else{E.actions([]);E.showLine('mentor','還有 '+(l.replays.length-done.size)+' 種說法。').then(draw);}});return b;});
      const w=document.createElement('div');w.className='chips';nodes.forEach(n=>w.appendChild(n));E.actions([w]);};
    E.actions([]);E.showLine('mentor','選一份史料，重演當時的情形。').then(draw);});
  meter(6);await E.say('mentor',l.lines.after);
}
async function locCourt(l){
  await E.say('mentor',l.lines.enter);const R=CH.rival;
  for(let i=0;i<l.testimony.length;i++){const t=l.testimony[i];st.hint='這句證詞，和哪一份證物的記載矛盾？打開證物冊對照作者和內容。';
    for(;;){const act=await new Promise(async res=>{E.actions([]);E.emote(R,'hop');await E.showLine('rival','證詞 '+(i+1)+'：'+t.text);E.actions([E.btn('ghost','追問',()=>res('press')),E.btn('next','出示證據',()=>res('present')),E.skipBtn(()=>res('skip'),'跳過這句，看答案')]);});
      if(act==='press'){await E.say('rival',t.press);continue;}
      if(act==='skip'){if(!st.cards.includes(t.answer))st.cards.push(t.answer);await E.say('mentor','應該出示的是'+EV[t.answer].name+'。'+t.reveal);break;}
      const pick=await new Promise(async res=>{E.actions([]);await E.showLine('narrator','出示哪一份證物？');const w=document.createElement('div');w.className='pgrid';st.cards.forEach(id=>w.appendChild(E.btn('pbtn','<span>'+EV[id].name+'</span>',()=>res(id))));E.actions([w,E.btn('ghost','返回',()=>res(null))]);});
      if(!pick)continue;
      if(pick===t.answer){meter(GM.scoring.present_right);addScore(GM.scoring.present_right);E.flash(true);E.emote(R,'shake');E.emote(CH.companion,'hop');
        const o=$('objection');o.hidden=false;o.classList.remove('pop');void o.offsetWidth;o.classList.add('pop');await E.sleep(900);o.hidden=true;
        await E.say('mentor',t.reveal);break;}
      st.wrongs++;meter(GM.scoring.present_wrong);E.emote(R,'hop');E.flash(false);toast('這份證物對不上',EV[pick].name+'的內容和這句證詞沒有直接矛盾。','bad');await E.say('rival','哈！這和我說的有甚麼關係？');}
  }
  E.emote(R,'slump');await E.say('rival',l.lines.win);
}
const RUN={investigate:locTeahouse,timeline:locLibrary,arrow_boat:locRuxu,replay:locChibi,cross_exam:locCourt};

/* final */
async function finale(){
  for(const q of C.deduction){const dis=new Set();let w=0;for(;;){const i=await E.ask('mentor',q.question,q.options,dis,{skip:true});if(i===-1){w=99;break;}if(i===q.answer)break;w++;dis.add(i);meter(-3);E.emote(CH.mentor,'shake');}
    if(w===99)await E.say('mentor','答案是「'+q.options[q.answer]+'」。'+q.explain);else{addScore(Math.max(2,GM.scoring.deduction_first_try-w*GM.scoring.wrong_penalty));await E.say('mentor','沒錯。'+q.explain);}}
  const g=C.gate,dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',g.question,g.options,dis,{skip:true});if(i===-1){w=99;break;}if(i===g.answer)break;w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}
  if(w===99)await E.say('gatekeeper','答案是「'+g.options[g.answer]+'」。'+g.explain);else{addScore(Math.max(2,GM.scoring.gate_first_try-w*GM.scoring.wrong_penalty));meter(5);await E.say('gatekeeper','結案。'+g.explain);}
}
async function main(){
  E.start();E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">接案</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>本案人物</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">你是史館的新任查案官。收集史料、比較說法，最後在公堂上用證據拆穿錯誤的說法。右上角的「真相值」會隨你的判斷升降。</p><button class="primary" id="go">出發</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=0;i<C.locations.length;i++){const l=C.locations[i];st.loc=i;
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'幕</small><h2>'+l.title+'</h2></div>',true);await Promise.race([E.sleep(E.RM?800:1800),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapNo').textContent='第'+E.NUM[i]+'幕';$('chapTitle').textContent=l.title;E.setEnv(l.env);await goTo(l.id,l.type==='cross_exam');
    await RUN[l.type](l);E.hideDialog();st.hint=null;}
  await finale();E.hideDialog();
  const tier=GM.endings.find(e=>st.meter>=e.min_meter).id,EN=C.endings[tier];E.flash(true);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(700);
  E.overlay('<div class="card"><p class="sub" style="margin:0">結案報告</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+Math.round(st.meter)+'</b>真相值</div><div><b>'+st.score+'</b>分數</div><div><b>'+st.wrongs+'</b>出示錯誤</div></div>'+
    '<p style="margin-top:6px"><b>拆穿的說法</b></p><ul class="review">'+C.locations.find(x=>x.type==='cross_exam').testimony.map(t=>'<li><b>'+t.text+'</b><p>'+t.reveal+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">裴松之：'+C.debrief+'</p><button class="primary" id="again">再查一次</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
