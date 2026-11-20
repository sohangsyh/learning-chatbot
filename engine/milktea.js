/* Milk-tea mode: pour by hand to fractions, scale recipes, share by division and measure percentages at a cha chaan teng */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
let lang=(()=>{try{const q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='zh')return q;const s=localStorage.getItem('gp_lang');if(s==='en'||s==='zh')return s;}catch(e){}return 'zh';})();
E.lang=lang;document.documentElement.lang=lang==='en'?'en':'zh-Hant';
const L=x=>x==null?'':(typeof x==='object'&&!Array.isArray(x))?(x[lang]!=null?x[lang]:x.zh):String(x);
const U={
 zh:{score:'分數',hint:'師傅提示',hintT:'{who}的提示 {n}/{m}（扣 {p} 分）',lv:'第{n}關',start:'開工',crew:'今日當值',goals:'今日學習目標',goalsSub:'完成五關之後，你會學會：',goalsGo:'明白，下一步',ready:'圍好圍裙',dragTip:'左右拖動畫面可以轉換角度。',
  pour:'按住倒{ing}',empty:'倒掉重做',serve:'出餐',skip:'跳過，看示範',order:'第 {n}/{m} 張單',cup:'杯',ml:'mL',
  perfect:'完美！+{p}',good:'幾好！+{p}',fail:'唔啱飲',more:'{ing}太多：',less:'{ing}太少：',extra:'這杯不應該有{ing}。',approxCup:'你倒了約 {a} 杯，單上要 {w} 杯。',approxMl:'你倒了約 {a} mL，要 {w} mL。',
  bitMore:'多了一點點。',none:'你完全沒有倒，單上要 {w} 杯。',bitLess:'少了一點點。',spill:'滿瀉了！',spillD:'倒掉重做吧。',nothing:'杯裡還是空的。',
  tCup:'這杯用{den}份杯',tMarks:'（只有{m}份的線）',tRecipe:'一杯配方',tCups:'要沖 {n} 杯',tJug:'量杯最多 {c} mL',tNormal:'正常甜 = {b} mL 糖水',tPct:'{label} = 正常的 {p}%',
  shareT:'分淡奶',shareN:'沖 {n} 杯',sharePour:'開始倒奶',shareLeft:'還剩 {n} mL 淡奶',shareLeftD:'還可以多沖幾杯。',shareShort:'第 {k} 杯不夠奶！',shareShortD:'淡奶不夠分。',shareOk:'剛好分完！+{p}',
  timeLeft:'剩餘時間',queue:'第 {n}/{m} 位',timeUp:'夠鐘了！',timeUpD:'未完成的單要取消。',bonus:'時間獎勵 +{p}',
  end:'今日收工',lvDone:'完成關卡',hints:'提示',again:'再開一更',skipped:'已跳過',lvOk:'完成',correct:'正確。',ansIs:'答案是「{a}」。',quit:'收工',taste:['正！','好飲！','唔係呢個味喎……']},
 en:{score:'Score',hint:'Hint',hintT:'Hint from {who} {n}/{m} (−{p} points)',lv:'Level {n}',start:'Start shift',crew:'Today’s crew',goals:"What you'll learn",goalsSub:'By the end of the five levels, you’ll be able to:',goalsGo:'Got it, next',ready:'Put on your apron',dragTip:'Drag left or right to change the view.',
  pour:'Hold to pour {ing}',empty:'Empty and redo',serve:'Serve',skip:'Skip, show me',order:'Order {n}/{m}',cup:'cup',ml:'mL',
  perfect:'Perfect! +{p}',good:'Pretty good! +{p}',fail:'That’s not right',more:'Too much {ing}: ',less:'Not enough {ing}: ',extra:'This drink shouldn’t have any {ing}.',approxCup:'you poured about {a} cup; the order says {w} cup.',approxMl:'you poured about {a} mL; it needs {w} mL.',
  bitMore:'just a little too much.',none:'you didn’t pour any; the order says {w} cup.',bitLess:'just a little short.',spill:'It overflowed!',spillD:'Empty it and start again.',nothing:'The glass is still empty.',
  tCup:'Glass split into {den} parts',tMarks:' (only {m} lines marked)',tRecipe:'One cup',tCups:'Make {n} cups',tJug:'Jug holds up to {c} mL',tNormal:'Normal = {b} mL syrup',tPct:'{label} = {p}% of normal',
  shareT:'Share the milk',shareN:'Make {n} cups',sharePour:'Pour the milk',shareLeft:'{n} mL of milk left over',shareLeftD:'You could make more cups.',shareShort:'Cup {k} doesn’t get enough milk!',shareShortD:'There isn’t enough milk to go round.',shareOk:'Shared exactly! +{p}',
  timeLeft:'Time left',queue:'Customer {n}/{m}',timeUp:'Time’s up!',timeUpD:'Unfinished orders are cancelled.',bonus:'Time bonus +{p}',
  end:'End of shift',lvDone:'Levels',hints:'Hints',again:'Play again',skipped:'Skipped',lvOk:'Done',correct:'Correct. ',ansIs:'The answer is “{a}”. ',quit:'Finish',taste:['Perfect!','Lovely!','That doesn’t taste right…']}};
const T=(k,o)=>{let s=U[lang][k];if(o)for(const a in o)s=s.split('{'+a+'}').join(o[a]);return s;};
const st={lv:-1,score:0,hints:0,hint:null,hintLv:0,results:[],anims:[],busy:false,yaw:0,tYaw:0,pitch:.3,tPitch:.3,dist:1.9,tDist:1.9,ctr:V(0,1.3,1.6),tCtr:V(0,1.3,1.6),drag:null,cur:null,ro:null,pour:null,time:0,rush:false};
window.__tea=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.fade.on=false;E.bindDialog();E.resp.allowPan=false;E.parallax=0;E.setEnv('indoor_warm',true);
const LP={};Object.entries(W.locations).forEach(([k,v])=>LP[k]=V(...v));
const S=E.kits.hk_city.build(LP);if(S.cafeWaiter)S.cafeWaiter.visible=false;
function setNames(){E.SPK={narrator:{name:lang==='en'?'You':'你',col:'#F4EBD6'}};Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:L(d.display_name),col:E.hex(E.PAL[d.character_id][0])});if(E._spk)Object.keys(E._spk).forEach(k=>{if(E.SPK[k])E._spk[k]=Object.assign({},E.SPK[k]);});}
setNames();
Object.entries(C.npc_slots).forEach(([s,d])=>{const c=E.makeChar(s,d.character_id,d.costume);const l=W.npc_layout[s];c.root.position.set(l[0],0,l[2]);c.target.copy(c.root.position);});
const CHR=E.chars;E.lampValue=()=>Math.min(1,.2+st.score/230);
const ING=C.ingredients,ingName=k=>ING[k][lang],ingCol=k=>new THREE.Color(ING[k].hex);
const fr=s=>{if(typeof s==='number')return {v:s};const [n,d]=String(s).split('/').map(Number);return {n,d,v:n/d};};
const frHTML=s=>{const f=fr(s);return f.d?'<span class="fr"><b>'+f.n+'</b><b>'+f.d+'</b></span>':String(s);};
const FONT='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';

/* ---------- station ---------- */
const ST=V(...W.station),TOP=1.02;
const sg=new THREE.Group();sg.scale.set(1,1,1);sg.position.copy(ST);E.scene.add(sg);
E.box(3.8,1,.9,0x6A3A22,0,.5,0,sg);const top=E.box(3.9,.05,.95,0xC8CCD0,0,1,0,sg);top.material=new THREE.MeshPhongMaterial({color:0xC8CCD0,shininess:80,specular:0x888888});
E.box(3.9,.04,.2,0x2F7D62,0,.97,.48,sg);
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;}
function label(text,size,col){const t=tex(256,96,(x,w,h)=>{x.font='bold 60px '+FONT;x.textAlign='center';x.textBaseline='middle';x.lineWidth=12;x.lineJoin='round';x.strokeStyle='rgba(20,28,36,.85)';x.strokeText(text,w/2,h/2+2);x.fillStyle=col||'#16202A';x.fillText(text,w/2,h/2+2);});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(size*2.67,size,1);s.renderOrder=5;return s;}

/* ---------- vessels ---------- */
const glassMat=new THREE.MeshPhongMaterial({color:0xDDEEF4,transparent:true,opacity:.22,shininess:120,specular:0xFFFFFF,side:THREE.DoubleSide,depthWrite:false});
const tickMat=new THREE.MeshBasicMaterial({color:0xFFFFFF}),tickMinor=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.7});
function makeVessel(o){const g=new THREE.Group();const R=o.R,H=o.H;
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(R,R*.94,H,32,1,true),glassMat);wall.position.y=H/2;g.add(wall);wall.renderOrder=3;
  E.mesh(new THREE.CylinderGeometry(R*.94,R*.94,.03,32),glassMat,0,.015,0,g);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R,.012,6,32),tickMat);rim.rotation.x=Math.PI/2;rim.position.y=H;g.add(rim);
  if(o.handle){const h=new THREE.Mesh(new THREE.TorusGeometry(H*.28,.03,8,16,Math.PI),glassMat);h.rotation.z=-Math.PI/2;h.position.set(R+.02,H*.55,0);g.add(h);const sp=E.mesh(new THREE.ConeGeometry(.08,.16,4),glassMat,-R-.03,H-.02,0,g);sp.rotation.z=Math.PI/2;}
  (o.ticks||[]).forEach(t=>{const y=t.v/o.cap*H*.96+.03,arc=t.major?1.1:.55,m=new THREE.Mesh(new THREE.TorusGeometry(R*1.005,t.major?.009:.006,4,24,arc),t.major?tickMat:tickMinor);
    m.rotation.x=Math.PI/2;m.rotation.z=Math.PI/2-arc/2;m.position.y=y;g.add(m);m.renderOrder=4;
    if(t.label){const s=label(t.label,o.labelSize||.09,'#FFFFFF');s.position.set(R*.5+(o.labelSize||.09)*1.4,y,R+.02);g.add(s);}});
  const v={g,R,H,kind:o.kind||'cup',cap:o.cap,layers:[],meshes:[],y0:.03,hmax:H*.96};g.position.copy(o.pos||ST.clone().setY(TOP));E.scene.add(g);return v;}
const liqGeo=new THREE.CylinderGeometry(1,.94,1,32);
function total(v){return v.layers.reduce((s,l)=>s+l.amt,0);}
function liquidTop(v){return v.g.position.y+v.y0+total(v)/v.cap*v.hmax;}
function drawLiquid(v){while(v.meshes.length<v.layers.length){const m=new THREE.Mesh(liqGeo,new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.92}));v.g.add(m);v.meshes.push(m);}
  let y=v.y0;v.layers.forEach((l,i)=>{const m=v.meshes[i],h=Math.max(.0001,l.amt/v.cap*v.hmax);m.visible=true;m.material.color.copy(l.col||ingCol(l.ing));m.scale.set(v.R*.92,h,v.R*.92);m.position.y=y+h/2;y+=h;});
  for(let i=v.layers.length;i<v.meshes.length;i++)v.meshes[i].visible=false;}
function addLiquid(v,ing,amt){const last=v.layers[v.layers.length-1];if(last&&last.ing===ing&&!last.col)last.amt+=amt;else v.layers.push({ing,amt});drawLiquid(v);}
function emptyVessel(v){v.layers.length=0;drawLiquid(v);}
function poured(v){const p={};v.layers.forEach(l=>{if(l.mix)Object.entries(l.mix).forEach(([k,a])=>p[k]=(p[k]||0)+a);else p[l.ing]=(p[l.ing]||0)+l.amt;});return p;}
function stir(v){const p=poured(v),tot=total(v);if(!tot)return;const c=new THREE.Color(0,0,0);Object.entries(p).forEach(([k,a])=>{const ic=ingCol(k);c.r+=ic.r*a/tot;c.g+=ic.g*a/tot;c.b+=ic.b*a/tot;});v.layers=[{ing:'mix',amt:tot,col:c,mix:p}];drawLiquid(v);}
function removeVessel(v){if(v&&v.g.parent)v.g.parent.remove(v.g);}
function cupVessel(den,marks){const m=marks||den,ticks=[];for(let k=1;k<m;k++)ticks.push({v:k/m,major:true});return makeVessel({R:.19,H:.6,cap:1,ticks});}
function jugVessel(cap){const ticks=[];for(let k=50;k<=cap;k+=50)ticks.push({v:k,major:k%100===0,label:k%100===0?String(k):null});return makeVessel({kind:'jug',R:.27,H:.72,cap,ticks,handle:true,labelSize:.055});}
function cylVessel(cap){const ticks=[];for(let k=1;k<=cap;k++)ticks.push({v:k,major:k%5===0,label:k%10===0?String(k):null});return makeVessel({kind:'cyl',R:.085,H:.78,cap,ticks,labelSize:.05});}

/* ---------- ingredient sources ---------- */
const SRC={};
function source(key,build,home,spout){const g=new THREE.Group();build(g);g.scale.setScalar(.72);g.position.copy(home);E.scene.add(g);SRC[key]={g,home:home.clone(),spout,t:0,hold:0};}
const alu=new THREE.MeshPhongMaterial({color:0xC8CCD0,shininess:90,specular:0xFFFFFF});
source('pot',g=>{E.mesh(new THREE.CylinderGeometry(.16,.19,.38,20),alu,0,.19,0,g);const s=E.mesh(new THREE.CylinderGeometry(.025,.04,.32,8),alu,.2,.24,0,g);s.rotation.z=-Math.PI/3.2;E.mesh(new THREE.TorusGeometry(.12,.02,6,12,Math.PI),M2(0x2A2A2A),-.17,.26,0,g).rotation.z=Math.PI/2;},V(-.95,TOP,1.5),V(.33,.36,0));
source('can',g=>{const lt=tex(256,128,(x,w,h)=>{x.fillStyle='#F4F1E8';x.fillRect(0,0,w,h);x.fillStyle='#C8221A';x.fillRect(0,20,w,88);x.fillStyle='#FFF';x.font='bold 48px '+FONT;x.textAlign='center';x.fillText(lang==='en'?'MILK':'淡奶',w/2,82);});
  E.mesh(new THREE.CylinderGeometry(.11,.11,.26,20),[new THREE.MeshLambertMaterial({map:lt}),alu,alu],0,.13,0,g);},V(.8,TOP,1.55),V(.09,.27,0));
source('coffee',g=>{E.mesh(new THREE.CylinderGeometry(.12,.17,.34,20),M2(0x3A3A3E),0,.17,0,g);const s=E.mesh(new THREE.CylinderGeometry(.02,.035,.26,8),M2(0x3A3A3E),.17,.22,0,g);s.rotation.z=-Math.PI/3.2;},V(-.6,TOP,1.85),V(.27,.32,0));
source('bottle',g=>{const gm=new THREE.MeshPhongMaterial({color:0xE8B84A,transparent:true,opacity:.75,shininess:100});E.mesh(new THREE.CylinderGeometry(.08,.08,.3,16),gm,0,.15,0,g);E.mesh(new THREE.CylinderGeometry(.03,.07,.12,12),gm,0,.36,0,g);},V(1.1,TOP,1.8),V(0,.43,0));
function M2(h){return E.M(h);}
const stream=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,1,8),new THREE.MeshLambertMaterial({color:0xffffff}));stream.visible=false;E.scene.add(stream);
const srcOf=ing=>SRC[ING[ing].src];
function pourPose(s,v){const tilt=-1.05,off=s.spout.clone().multiplyScalar(s.g.scale.x).applyEuler(new THREE.Euler(0,0,tilt));const tgt=V(v.g.position.x-v.R*.35,v.g.position.y+v.H+.1,v.g.position.z);return {pos:tgt.sub(off),tilt};}

/* ---------- pouring ---------- */
st.vessel=null;
function startPour(ing){if(st.busy||!st.vessel||st.pour)return;st.pour={ing,t:0};}
function stopPour(){st.pour=null;}
function holdBtn(ing){const b=document.createElement('button');b.className='cmd hold';b.style.setProperty('--ing',ING[ing].hex);b.innerHTML='<i></i>'+T('pour',{ing:ingName(ing)});
  const down=e=>{e.preventDefault();b.classList.add('on');startPour(ing);},up=()=>{b.classList.remove('on');if(st.pour&&st.pour.ing===ing)stopPour();};
  b.addEventListener('pointerdown',down);['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,up));
  b.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){down(e);}});b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')up();});b.addEventListener('contextmenu',e=>e.preventDefault());return b;}
const RATE={cup:1/2.6,jug:1/3.4,cyl:1/3.6};
function onFrame(dt){dt=Math.min(dt,.05);for(let i=st.anims.length-1;i>=0;i--){const a=st.anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.update(k);if(k>=1){st.anims.splice(i,1);a.done();}}
  st.clock=(st.clock||0)+dt;if(S.update)S.update(dt,st.clock);
  const v=st.vessel;let flowing=false;
  Object.entries(SRC).forEach(([k,s])=>{const active=st.pour&&srcOf(st.pour.ing)===s&&v;s.t=Math.max(0,Math.min(1,s.t+(active?dt:-dt)/.16));
    if(v){const p=pourPose(s,v),e=s.t*s.t*(3-2*s.t);s.g.position.lerpVectors(s.home,p.pos,e);s.g.rotation.z=p.tilt*e;}else{s.g.position.copy(s.home);s.g.rotation.z=0;}
    if(active&&s.t>=1){flowing=true;st.pour.t+=dt;const ramp=Math.min(1,.22+st.pour.t*1.25);let amt=v.cap*RATE[v.kind]*ramp*dt*(window.__fast?3:1)*(window.__noflow?0:1);
      const room=v.cap-total(v);if(room<=v.cap*1e-4){amt=0;st.pour=null;toast(T('spill'),T('spillD'),'bad');st.spilled=true;}else amt=Math.min(amt,room);if(amt>0)addLiquid(v,active?(st.pour?st.pour.ing:s.ingLast):null,amt);
      const sp=s.g.localToWorld(s.spout.clone()),ly=liquidTop(v),h=Math.max(.02,sp.y-ly);stream.visible=true;stream.material.color.copy(ingCol(s.ingLast));stream.scale.y=h;stream.position.set(sp.x,ly+h/2,sp.z);}});
  if(st.pour)srcOf(st.pour.ing).ingLast=st.pour.ing;
  if(!flowing)stream.visible=false;
  if(st.rush&&st.time>0){st.time=Math.max(0,st.time-dt);if(Math.floor(st.time*4)!==st._tq){st._tq=Math.floor(st.time*4);readout(st.ro);}if(st.time<=0&&st.onTimeUp)st.onTimeUp();}
}
Object.values(SRC).forEach(s=>s.ingLast='tea');SRC.can.ingLast='milk';SRC.coffee.ingLast='coffee';SRC.bottle.ingLast='syrup';

/* ---------- camera ---------- */
E.cam.idle=()=>{st.yaw+=(st.tYaw-st.yaw)*.1;st.pitch+=(st.tPitch-st.pitch)*.1;st.dist+=(st.tDist-st.dist)*.1;st.ctr.lerp(st.tCtr,.1);const d=E.portrait?st.dist*1.3:st.dist,cp=Math.cos(st.pitch);
  E.camera.position.set(st.ctr.x+Math.sin(st.yaw)*cp*d,st.ctr.y+Math.sin(st.pitch)*d,st.ctr.z+Math.cos(st.yaw)*cp*d);E.cam.look.copy(st.ctr);if(E.portrait)E.cam.look.y-=.12;};
function view(kind){const y={cup:1.3,jug:1.36,cyl:1.38,share:1.16}[kind]||1.3;st.tCtr.set(0,y,ST.z);st.tDist={cup:1.9,jug:2.05,cyl:1.55,share:2.3}[kind]||1.9;st.tPitch={share:.5}[kind]||.3;st.tYaw=0;}
const cv=E.canvas;
cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,yaw:st.tYaw};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(st.drag)st.tYaw=Math.max(-.6,Math.min(.6,st.drag.yaw-(e.clientX-st.drag.x)*.004));});
cv.addEventListener('pointerup',()=>{st.drag=null;});

/* ---------- ui ---------- */
function anim(dur,update){return new Promise(res=>st.anims.push({t:0,dur:E.RM?.01:dur*(window.__fast?.15:1),update,done:res}));}
const ease=k=>k*k*(3-2*k);
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=(cls||'')+' top';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4600);}
function hud(){$('score').textContent=st.score;}
function statics(){$('scoreLab').textContent=T('score');$('assistLab').textContent=T('hint');$('langBtn').innerHTML=lang==='en'?'中文 | <b>EN</b>':'<b>中文</b> | EN';
  if(st.lv>=0){$('chapNo').textContent=T('lv',{n:lang==='en'?st.lv+1:E.NUM[st.lv]});$('chapTitle').textContent=L(C.levels[st.lv].title);}document.title=lang==='en'?C.meta.short_title_en:C.meta.short_title;}
function readout(html){const r=$('readout');st.ro=html;if(html==null){r.hidden=true;return;}r.hidden=false;r.innerHTML=typeof html==='function'?html():html;}
function ticket(html){const t=$('ticket');st.tk=html;if(html==null){t.hidden=true;return;}t.hidden=false;t.style.top=Math.round($('hud').getBoundingClientRect().bottom+10)+'px';t.innerHTML=typeof html==='function'?html():html;}
function show(key,text,nodes){st.cur={key,text,nodes};E.showLine(key,typeof text==='function'?text():L(text));if(nodes)E.actions(nodes());}
function redraw(){if(st.cur){const c=st.cur;E.showLine(c.key,typeof c.text==='function'?c.text():L(c.text));if(c.nodes)E.actions(c.nodes());}if(typeof st.ro==='function')readout(st.ro);if(typeof st.tk==='function')ticket(st.tk);}
$('langBtn').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';E.lang=lang;document.documentElement.lang=lang==='en'?'en':'zh-Hant';try{localStorage.setItem('gp_lang',lang);}catch(e){}stopPour();setNames();statics();redraw();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;const h=L(st.hint),lv=Math.min(h.length,st.hintLv+1);st.hintLv=lv;st.hints++;st.score=Math.max(0,st.score-GM.scoring.hint_penalty);hud();
  E.bubble(T('hintT',{who:L(C.npc_slots.mentor.display_name),n:lv,m:h.length,p:GM.scoring.hint_penalty}),h[lv-1],9000);});
const btn=(cls,html,fn)=>E.btn(cls,html,fn);
function cheer(){E.flash(true);Object.values(CHR).forEach(c=>{if(c.slot!=='rival')E.emote(c,'hop');});}
const fmtMl=(x,step)=>String(Math.round(x/step)*step);

/* ---------- one pour order (cup, jug or cylinder) ---------- */
async function serveAway(v){stopPour();await anim(.5,k=>{v.g.position.z=ST.z-ease(k)*1.1;v.g.position.y=TOP+Math.sin(k*Math.PI)*.15;});removeVessel(v);}
function evaluate(v,want,kind,den){const p=poured(v),keys=new Set([...Object.keys(want),...Object.keys(p)].filter(k=>k!=='_f'));let worst=0;const msgs=[];
  const tol=kind==='cup'?[GM.tolerance.cup_perfect,GM.tolerance.cup_ok]:[GM.tolerance.ml_perfect,GM.tolerance.ml_ok];
  keys.forEach(k=>{const w=want[k]||0,a=p[k]||0,e=Math.abs(a-w)/v.cap;worst=Math.max(worst,e);if(e<=tol[1])return;
    if(!w){msgs.push(T('extra',{ing:ingName(k)}));return;}
    const head=T(a>w?'more':'less',{ing:ingName(k)});
    if(kind==='cup'){const d=den||8,n=Math.round(a*d),approx=n+'/'+d,wf=want._f[k];msgs.push(head+(a<1e-3?T('none',{w:wf}):Math.abs(n/d-w)<1e-6?T(a>w?'bitMore':'bitLess'):T('approxCup',{a:approx,w:wf})));}
    else msgs.push(head+T('approxMl',{a:fmtMl(a,kind==='cyl'?.5:10),w:String(w)}));});
  if(!total(v))msgs.splice(0,msgs.length,T('nothing'));
  return {res:worst<=tol[0]?'perfect':worst<=tol[1]?'good':'fail',msgs};}
async function autoPour(v,want){emptyVessel(v);for(const k of Object.keys(want)){if(k==='_f')continue;const s=srcOf(k);s.ingLast=k;st.pour={ing:k,t:9};const goal=want[k]+(poured(v)[k]?0:0);
    const target=total(v)+want[k];await new Promise(r=>{const iv=setInterval(()=>{if(total(v)>=target-1e-6||!st.pour){clearInterval(iv);r();}},16);});stopPour();
    const over=total(v)-target;if(over>0){const l=v.layers[v.layers.length-1];l.amt-=over;drawLiquid(v);}await anim(.25,()=>{});}}
function pourOrder(o){
  return new Promise(resolve=>{const v=o.vessel;st.vessel=v;st.spilled=false;let redo=0;
    const nodes=()=>{const ings=Object.keys(o.want).filter(k=>k!=='_f');const pal=document.createElement('div');pal.className='pal';o.ings.forEach(k=>pal.appendChild(holdBtn(k)));
      return [pal,btn('next',T('serve'),serve),btn('ghost',T('empty'),()=>{if(st.busy)return;stopPour();emptyVessel(v);}),E.skipBtn(skip,T('skip'))];};
    const serve=async()=>{if(st.busy)return;stopPour();const r=evaluate(v,o.want,o.kind,o.den);
      if(r.res==='fail'){redo++;E.flash(false);E.emote(CHR.gatekeeper,'shake');E.floatBubble(CHR.gatekeeper,T('taste')[2],2200);toast(T('fail'),r.msgs.join(' '),'bad');if(redo===1&&o.rival)E.floatBubble(CHR.rival,L(o.rival),2800);return;}
      st.busy=true;E.actions([]);stir(v);await anim(.35,()=>{});E.floatBubble(CHR.gatekeeper,T('taste')[r.res==='perfect'?0:1],1800);await serveAway(v);st.busy=false;st.vessel=null;resolve({res:r.res,redo});};
    const skip=async()=>{if(st.busy)return;st.busy=true;E.actions([]);await autoPour(v,o.want);stir(v);await anim(.4,()=>{});await serveAway(v);st.busy=false;st.vessel=null;resolve({res:'skip',redo});};
    st.abortOrder=()=>{stopPour();E.actions([]);removeVessel(v);st.vessel=null;resolve({res:'timeout',redo});};
    show(o.who||'companion',o.say,nodes);});}
function scorePour(r,perfect,good){if(r.res==='perfect'||r.res==='good'){const base=r.res==='perfect'?perfect:good,p=Math.max(3,base-r.redo*GM.scoring.redo_penalty);st.score+=p;hud();cheer();toast(T(r.res,{p}),'','ok');return p;}return 0;}

function cupOrder(od,extra){const want={_f:{}};Object.entries(od.want).forEach(([k,s])=>{want[k]=fr(s).v;want._f[k]=s;});
  return Object.assign({kind:'cup',den:od.den,want,ings:Object.keys(od.want),vessel:cupVessel(od.den,od.marks)},extra||{});}
function cupTicket(od,i,n){return ()=>'<small>'+T('order',{n:i+1,m:n})+'</small><b class="tn">'+L(od.name)+'</b><ul>'+Object.entries(od.want).map(([k,s])=>'<li><i style="background:'+ING[k].hex+'"></i><em>'+ingName(k)+'</em><span>'+frHTML(s)+' '+T('cup')+'</span></li>').join('')+'</ul><p>'+T('tCup',{den:od.marks||od.den})+(od.marks&&od.marks!==od.den?'':'')+'</p>';}

async function cupLevel(Lv){view('cup');let anySkip=false;
  for(let i=0;i<Lv.orders.length;i++){const od=Lv.orders[i];ticket(cupTicket(od,i,Lv.orders.length));
    const o=cupOrder(od,{say:od.say||(()=>lang==='en'?'Mrs Chan orders a '+L(od.name)+'. Check the ticket.':'陳太要一杯'+L(od.name)+'，看看單上的份量。'),rival:Lv.rival});
    const r=await pourOrder(o);if(r.res==='skip')anySkip=true;else scorePour(r,GM.scoring.pour_perfect,GM.scoring.pour_good);await E.sleep(window.__fast?100:600);}
  ticket(null);st.cur=null;st.results.push({title:Lv.title,ok:!anySkip});}

async function jugLevel(Lv){view('jug');let anySkip=false;const R=Lv.recipe;
  for(let i=0;i<Lv.orders.length;i++){const od=Lv.orders[i],want={};Object.entries(R).forEach(([k,a])=>want[k]=a*od.cups);
    ticket(()=>'<small>'+T('order',{n:i+1,m:Lv.orders.length})+'</small><b class="tn">'+T('tCups',{n:od.cups})+'</b><p>'+T('tRecipe')+'：</p><ul>'+Object.entries(R).map(([k,a])=>'<li><i style="background:'+ING[k].hex+'"></i><em>'+ingName(k)+'</em><span>'+a+' mL</span></li>').join('')+'</ul><p>'+T('tJug',{c:od.jug})+'</p>');
    const o={kind:'jug',want,ings:Object.keys(R),vessel:jugVessel(od.jug),who:'companion',rival:Lv.rival,
      say:()=>lang==='en'?'The office wants '+od.cups+' cups. Pour the tea first, then the milk, into the jug.':'寫字樓要 '+od.cups+' 杯。先倒茶，再倒淡奶，全部倒入量杯。'};
    o.vessel.kind='jug';const r=await pourOrder(o);if(r.res==='skip')anySkip=true;else scorePour(r,GM.scoring.pour_perfect,GM.scoring.pour_good);await E.sleep(window.__fast?100:600);}
  ticket(null);if(!(await shareTask(Lv)))anySkip=true;st.cur=null;st.results.push({title:Lv.title,ok:!anySkip});}

async function shareTask(Lv){const sh=Lv.share,N=8;view('share');ticket(()=>'<b class="tn">'+T('shareT')+'</b><ul><li><i style="background:'+ING.milk.hex+'"></i>'+ingName('milk')+'<span>'+sh.milk+' mL</span></li><li>'+(lang==='en'?'Per cup':'每杯')+'<span>'+sh.per+' mL</span></li></ul>');
  const cups=[];for(let i=0;i<N;i++){const v=makeVessel({R:.09,H:.28,cap:sh.per,ticks:[],pos:V(ST.x-.98+i*.28,TOP,ST.z)});v.kind='cup';cups.push(v);}
  ['pot','coffee','bottle'].forEach(k=>SRC[k].g.visible=false);let n=1,tries=0,skipped=false;const dim=()=>cups.forEach((v,i)=>v.g.visible=i<n);dim();
  await new Promise(done=>{
    const run=async k=>{st.busy=true;E.actions([]);cups.forEach(emptyVessel);let left=sh.milk,short=0;const can=SRC.can;can.ingLast='milk';
      for(let i=0;i<k;i++){const v=cups[i],amt=Math.min(sh.per,left);st.vessel=v;st.pour={ing:'milk',t:0};await anim(.25,()=>{});stopPour();
        emptyVessel(v);if(amt>0)await anim(.35,q=>{v.layers=[{ing:'milk',amt:amt*q}];drawLiquid(v);});left-=amt;if(amt<sh.per&&!short)short=i+1;}
      st.vessel=null;await anim(.3,()=>{});st.busy=false;
      if(!short&&left===0){done();return;}
      tries++;E.flash(false);E.emote(CHR.companion,'shake');if(short)toast(T('shareShort',{k:short}),T('shareShortD'),'bad');else toast(T('shareLeft',{n:left}),T('shareLeftD'),'bad');redraw();};
    const nodes=()=>{const sp=document.createElement('div');sp.className='stepper';const val=document.createElement('b');val.textContent=n;const go=btn('next',T('shareN',{n}),()=>{if(!st.busy)run(n);});
      const set=d=>{n=Math.max(1,Math.min(N,n+d));val.textContent=n;go.textContent=T('shareN',{n});dim();};
      sp.appendChild(btn('','−',()=>set(-1)));sp.appendChild(val);sp.appendChild(btn('','+',()=>set(1)));
      return [sp,go,E.skipBtn(async()=>{if(st.busy)return;skipped=true;n=sh.milk/sh.per;dim();await run(n);},T('skip'))];};
    show('mentor',sh.say,nodes);});
  cups.forEach(removeVessel);ticket(null);Object.values(SRC).forEach(x=>x.g.visible=true);
  if(!skipped){const p=tries?GM.scoring.share_retry:GM.scoring.share_first_try;st.score+=p;hud();cheer();toast(T('shareOk',{p}),sh.milk+' ÷ '+sh.per+' = '+sh.milk/sh.per,'ok');await E.sleep(900);}
  view('jug');return !skipped;}

async function syrupLevel(Lv){view('cyl');let anySkip=false;
  for(let i=0;i<Lv.orders.length;i++){const od=Lv.orders[i],want={syrup:od.base*od.pct/100},cap=od.base>=60?60:50;
    ticket(()=>'<small>'+T('order',{n:i+1,m:Lv.orders.length})+'</small><b class="tn">'+L(od.label)+'</b><p>'+T('tNormal',{b:od.base})+'</p><p>'+T('tPct',{label:L(od.label),p:od.pct})+'</p>');
    const o={kind:'cyl',want,ings:['syrup'],vessel:cylVessel(cap),who:'companion',rival:Lv.rival,
      say:od.say||(()=>lang==='en'?'An iced lemon tea, '+L(od.label).toLowerCase()+' ('+od.pct+'% of normal). Measure the syrup.':'一杯凍檸茶，'+L(od.label)+'（正常的 '+od.pct+'%）。量好糖水。')};
    o.vessel.kind='cyl';const r=await pourOrder(o);if(r.res==='skip')anySkip=true;else scorePour(r,GM.scoring.pour_perfect,GM.scoring.pour_good);await E.sleep(window.__fast?100:600);}
  ticket(null);st.cur=null;st.results.push({title:Lv.title,ok:!anySkip});}

async function rushLevel(Lv){view('cup');st.time=Lv.seconds;st.rush=true;let idx=0,timedOut=false,ok=0;const n=Lv.orders.length;
  readout(()=>{const s=Math.ceil(st.time);return '<span>'+T('timeLeft')+'<b'+(s<=20?' class="warn"':'')+'>'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</b></span><span>'+T('queue',{n:Math.min(idx+1,n),m:n})+'</span>';});
  st.onTimeUp=()=>{st.onTimeUp=null;timedOut=true;if(st.abortOrder)st.abortOrder();};
  for(idx=0;idx<n&&!timedOut;idx++){const od=Lv.orders[idx];ticket(cupTicket(od,idx,n));readout(st.ro);
    const o=cupOrder(od,{say:()=>(lang==='en'?'Next: ':'下一位：')+L(od.name)+(lang==='en'?'!':'！'),rival:Lv.rival});
    const r=await pourOrder(o);if(r.res==='timeout')break;if(r.res!=='skip'){ok++;scorePour(r,GM.scoring.rush_perfect,GM.scoring.rush_good);}await E.sleep(window.__fast?60:300);}
  st.rush=false;st.onTimeUp=null;st.abortOrder=null;ticket(null);
  if(timedOut){toast(T('timeUp'),T('timeUpD'),'bad');await E.sleep(1200);}
  else{const p=Math.floor(st.time/GM.scoring.rush_seconds_per_bonus);if(p>0){st.score+=p;hud();toast(T('bonus',{p}),'','ok');await E.sleep(1000);}}
  readout(null);st.cur=null;st.results.push({title:Lv.title,ok:!timedOut&&ok===n});}

/* ---------- check question ---------- */
async function check(Lv){if(!Lv.check)return;$('toast').hidden=true;const q=Lv.check,ord=E.shuffle(q.options.map((_,i)=>i)),opts=ord.map(i=>L(q.options[i])),ans=ord.indexOf(q.answer),dis=new Set();let w=0;
  for(;;){const i=await E.ask('gatekeeper',L(q.question),opts,dis,{skip:true});if(i===-1){await E.say('gatekeeper',T('ansIs',{a:opts[ans]})+L(q.explain));return;}
    if(i===ans){st.score+=Math.max(2,GM.scoring.check_first_try-w*GM.scoring.check_wrong_penalty);hud();E.emote(CHR.gatekeeper,'hop');await E.say('gatekeeper',T('correct')+L(q.explain));return;}
    w++;dis.add(i);E.emote(CHR.gatekeeper,'shake');}}

window.__teaApi={st,SRC,fr,frame:onFrame,poured:()=>st.vessel&&poured(st.vessel),empty:()=>st.vessel&&emptyVessel(st.vessel)};
async function main(){
  E.start();hud();statics();
  const title=()=>{E.overlay('<div class="title'+(lang==='en'?' en':'')+'"><div class="v">'+(lang==='en'?C.meta.short_title_en:C.meta.short_title)+'</div><div class="v a">'+L({zh:C.meta.author,en:C.meta.author_en})+'</div><div class="side"><p>'+L(C.meta.title_lines).join('<br>')+'</p><button class="primary" id="go">'+T('start')+'</button><button class="ghost" id="tl">'+(lang==='en'?'中文':'English')+'</button></div></div>',true);
    $('tl').onclick=()=>{$('langBtn').click();title();};$('go').onclick=()=>title.go();$('go').focus();};
  await new Promise(r=>{title.go=r;title();});
  const goals=()=>{E.overlay('<div class="card"><h2>'+T('goals')+'</h2><p class="sub">'+T('goalsSub')+'</p><ol class="goals">'+L(C.meta.objectives).map((g,i)=>'<li><small>'+T('lv',{n:lang==='en'?i+1:E.NUM[i]})+' · '+L(C.levels[i].title)+'</small>'+g+'</li>').join('')+'</ol><div class="goalbtns"><button class="primary" id="go">'+T('goalsGo')+'</button><button class="ghost" id="tl">'+(lang==='en'?'中文':'English')+'</button></div></div>',true);
    $('tl').onclick=()=>{$('langBtn').click();goals();};$('go').onclick=()=>goals.go();$('go').focus();};
  await new Promise(r=>{goals.go=r;goals();});
  E.overlay('<div class="card"><h2>'+T('crew')+'</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+L(x.display_name)+'</b><br><span>'+L(x.persona)+'</span></p></div>').join('')+'</div><p class="sub">'+L(C.meta.unit)+' '+T('dragTip')+'</p><button class="primary" id="go">'+T('ready')+'</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startLv||+new URLSearchParams(location.search).get('lv')||1)-1);i<C.levels.length;i++){const Lv=C.levels[i];st.lv=i;st.hint=Lv.hint;st.hintLv=0;
    E.overlay('<div class="chapcard"><small>'+T('lv',{n:lang==='en'?i+1:E.NUM[i]})+'</small><h2>'+L(Lv.title)+'</h2></div>',true);await Promise.race([E.sleep(E.RM?700:1600),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();statics();
    view(Lv.type==='jug'?'jug':Lv.type==='syrup'?'cyl':'cup');
    await E.say('mentor',L(Lv.brief));E.emote(CHR.rival,'hop');await E.say('rival',L(Lv.rival));
    if(Lv.type==='cup')await cupLevel(Lv);else if(Lv.type==='jug')await jugLevel(Lv);else if(Lv.type==='syrup')await syrupLevel(Lv);else await rushLevel(Lv);
    await check(Lv);}
  E.hideDialog();readout(null);ticket(null);const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];
  E.overlay('<div class="card"><p class="sub" style="margin:0">'+T('end')+'</p><h2>'+L(EN.title)+'</h2><p>'+L(EN.text)+'</p><div class="stats"><div><b>'+st.score+'</b>'+T('score')+'</div><div><b>'+st.results.filter(r=>r.ok).length+'/'+st.results.length+'</b>'+T('lvDone')+'</div><div><b>'+st.hints+'</b>'+T('hints')+'</div></div><ul class="review">'+
    st.results.map(r=>'<li><b>'+L(r.title)+'</b><p>'+(r.ok?T('lvOk'):T('skipped'))+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">'+L(C.npc_slots.mentor.display_name)+(lang==='en'?': ':'：')+L(C.debrief)+'</p><button class="primary" id="again">'+T('again')+'</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
