/* Building-workshop mode: 3D views & volume on a construction site */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const N=W.grid.size,MAXH=W.grid.max_height,VN=C.views;
const st={lv:-1,score:0,hints:0,mode:'add',busy:false,yaw:.65,pitch:.55,tYaw:.65,tPitch:.55,dist:14,drag:null,h:[],blocks:[],hint:null,hintLv:0,attempts:0,results:[],anims:[]};
window.__bld=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.fade.on=false;E.bindDialog();E.parallax=0;E.setEnv('site_day',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const S=E.kits.construction_site.build(W);
const M=(h,o)=>E.M(h,o);
Object.entries(C.npc_slots).forEach(([s,d])=>{const c=E.makeChar(s,d.character_id,d.costume);const l=W.npc_layout[s];c.root.position.set(l[0],0,l[2]);c.target.copy(c.root.position);});
const CH=E.chars;E.lampValue=()=>Math.min(1,.2+st.score/140);
for(let x=0;x<N;x++){st.h.push(Array(N).fill(0));st.blocks.push([...Array(N)].map(()=>[]));}
const cellPos=(x,z,y)=>V(x-(N-1)/2,S.slabTop+.5+(y||0),(N-1)/2-z);
/* concrete block material */
const ctex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#B8B2A6';x.fillRect(0,0,128,128);for(let i=0;i<500;i++){x.fillStyle=Math.random()<.5?'#A8A296':'#C6C0B4';x.fillRect(Math.random()*128,Math.random()*128,2,2);}x.strokeStyle='#8E887C';x.lineWidth=3;x.strokeRect(2,2,124,124);x.beginPath();x.moveTo(0,64);x.lineTo(128,64);x.stroke();return new THREE.CanvasTexture(c);})();
const blockMat=new THREE.MeshLambertMaterial({map:ctex}),blockGeo=new THREE.BoxGeometry(.97,.97,.97),ghostMat=new THREE.MeshBasicMaterial({color:0xF2C81A,transparent:true,opacity:.35,depthWrite:false});
const ghost=new THREE.Mesh(blockGeo,ghostMat);ghost.visible=false;E.scene.add(ghost);

/* ---------- camera: orbit + preset views ---------- */
const CTR=V(0,1.2,0);
E.cam.idle=t=>{st.yaw+=(st.tYaw-st.yaw)*.12;st.pitch+=(st.tPitch-st.pitch)*.12;const d=E.portrait?st.dist*1.45:st.dist;const cp=Math.cos(st.pitch);
  E.camera.position.set(CTR.x+Math.sin(st.yaw)*cp*d,CTR.y+Math.sin(st.pitch)*d,CTR.z+Math.cos(st.yaw)*cp*d);E.cam.look.copy(CTR);};
const PRESET={front:[0,.12],side:[Math.PI/2,.12],top:[0,1.52],free:[.65,.55]};
function setView(k){const p=PRESET[k];let y=p[0];while(y-st.yaw>Math.PI)y-=Math.PI*2;while(st.yaw-y>Math.PI)y+=Math.PI*2;st.tYaw=y;st.tPitch=p[1];document.querySelectorAll('.vbtn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===k)));}
const cv=E.canvas;
cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,yaw:st.tYaw,pitch:st.tPitch,m:0};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{const d=st.drag;if(!d){hover(e);return;}const dx=e.clientX-d.x,dy=e.clientY-d.y;d.m=Math.max(d.m,Math.hypot(dx,dy));if(d.m>6){st.tYaw=d.yaw-dx*.008;st.tPitch=Math.max(.05,Math.min(1.53,d.pitch+dy*.006));document.querySelectorAll('.vbtn').forEach(b=>b.setAttribute('aria-pressed','false'));}});
cv.addEventListener('pointerup',e=>{const d=st.drag;st.drag=null;if(d&&d.m<=6)tap(e);});
cv.addEventListener('wheel',e=>{st.dist=Math.max(8,Math.min(22,st.dist+e.deltaY*.01));e.preventDefault();},{passive:false});
const ray=new THREE.Raycaster(),pm=new THREE.Vector2();
function pick(e){const r=cv.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pm,E.camera);
  const objs=[];st.blocks.forEach(col=>col.forEach(c=>c.forEach(b=>objs.push(b))));const hit=ray.intersectObjects(objs)[0];if(hit)return hit.object.userData.cell;
  const p=new THREE.Plane(V(0,1,0),-S.slabTop),pt=V();if(!ray.ray.intersectPlane(p,pt))return null;const x=Math.round(pt.x+(N-1)/2),z=Math.round((N-1)/2-pt.z);if(x<0||z<0||x>=N||z>=N)return null;return {x,z};}
function hover(e){if(!st.building||st.busy){ghost.visible=false;return;}const c=pick(e);if(!c){ghost.visible=false;return;}const h=st.h[c.x][c.z];
  if(st.mode==='add'&&h<MAXH){ghost.visible=true;ghost.position.copy(cellPos(c.x,c.z,h));ghostMat.color.setHex(0xF2C81A);}else if(st.mode==='remove'&&h>0){ghost.visible=true;ghost.position.copy(cellPos(c.x,c.z,h-1));ghostMat.color.setHex(0xE0574A);}else ghost.visible=false;}
function tap(e){if(!st.building||st.busy)return;const c=pick(e);if(!c)return;if(st.mode==='add')addBlock(c.x,c.z);else removeBlock(c.x,c.z);}

/* ---------- crane ---------- */
function anim(dur,update){return new Promise(res=>st.anims.push({t:0,dur:E.RM?.01:dur*(window.__fast?.15:1),update,done:res}));}
function onFrame(dt){for(let i=st.anims.length-1;i>=0;i--){const a=st.anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.update(k);if(k>=1){st.anims.splice(i,1);a.done();}}S.update(dt);}
const craneBase=S.crane.position;
function aimCrane(target){const dx=target.x-craneBase.x,dz=target.z-craneBase.z;const ang=Math.atan2(-dz,dx),rad=Math.hypot(dx,dz);const a0=S.slew.rotation.y,r0=S.trolley.position.x;let da=ang-a0;da=Math.atan2(Math.sin(da),Math.cos(da));
  return anim(.55,k=>{const e=k*k*(3-2*k);S.slew.rotation.y=a0+da*e;S.trolley.position.x=r0+(rad-r0)*e;});}
function setCable(worldY){const ty=S.craneH+.45;const L=Math.max(.3,ty-worldY);S.cable.scale.y=L;S.cable.position.y=-L/2;S.hook.position.y=-L;}
setCable(9);
async function addBlock(x,z,silent){const h=st.h[x][z];if(h>=MAXH){if(!silent)toast('太高了','每一格最多疊 '+MAXH+' 層。','bad');return;}st.busy=true;ghost.visible=false;
  const to=cellPos(x,z,h);await aimCrane(to);const b=new THREE.Mesh(blockGeo,blockMat);b.userData.cell={x,z};E.scene.add(b);
  const topY=to.y+5;await anim(.5,k=>{const y=topY+(to.y-topY)*k;b.position.set(to.x,y,to.z);setCable(y+.75);});
  st.h[x][z]++;st.blocks[x][z].push(b);E.emote(CH.companion,'hop');await anim(.3,k=>setCable(to.y+.75+k*4));st.busy=false;refresh();}
async function removeBlock(x,z){const h=st.h[x][z];if(!h)return;st.busy=true;ghost.visible=false;const b=st.blocks[x][z].pop();st.h[x][z]--;const from=b.position.clone();await aimCrane(from);
  await anim(.25,k=>setCable(from.y+4.75-k*4));await anim(.5,k=>{b.position.y=from.y+k*5;setCable(b.position.y+.75);});E.scene.remove(b);st.busy=false;refresh();}
function clearAll(instant){for(let x=0;x<N;x++)for(let z=0;z<N;z++){st.blocks[x][z].forEach(b=>E.scene.remove(b));st.blocks[x][z]=[];st.h[x][z]=0;}refresh();}
function placeInstant(list){list.forEach(([x,z,h])=>{for(let k=0;k<h;k++){const b=new THREE.Mesh(blockGeo,blockMat);b.userData.cell={x,z};b.position.copy(cellPos(x,z,st.h[x][z]));E.scene.add(b);st.blocks[x][z].push(b);st.h[x][z]++;}});refresh();}

/* ---------- views ---------- */
function viewsOf(h){const front=[],side=[],top=[];for(let x=0;x<N;x++)front.push(Math.max(...h[x]));for(let z=0;z<N;z++){let m=0;for(let x=0;x<N;x++)m=Math.max(m,h[x][z]);side.push(m);}
  for(let x=0;x<N;x++)for(let z=0;z<N;z++)if(h[x][z]>0)top.push([x,z]);return {front,side,top};}
function hFromList(list){const h=[...Array(N)].map(()=>Array(N).fill(0));list.forEach(([x,z,k])=>h[x][z]=k);return h;}
const topSet=v=>new Set(v.top.map(([x,z])=>x+','+z));
function sameViews(a,b){if(a.front.join()!==b.front.join()||a.side.join()!==b.side.join())return false;const A=topSet(a),B=topSet(b);if(A.size!==B.size)return false;for(const k of A)if(!B.has(k))return false;return true;}
const count=()=>st.h.flat().reduce((s,v)=>s+v,0);
function grid(kind,v,ref){const c=14,cols=N,rows=kind==='top'?N:MAXH;let s='<svg viewBox="0 0 '+cols*c+' '+rows*c+'" class="vg" aria-hidden="true">';
  const T=ref?topSet(ref):null,V2=topSet(v);
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){let on,refOn;
    if(kind==='top'){on=V2.has(i+','+(N-1-j));refOn=T&&T.has(i+','+(N-1-j));}else{const arr=kind==='front'?v.front:v.side;on=arr[i]>=rows-j;if(ref){const ra=kind==='front'?ref.front:ref.side;refOn=ra[i]>=rows-j;}}
    const fill=on?(ref?(refOn?'#2E9B5E':'#D2553F'):'#3A7FC8'):(ref&&refOn?'none':'none');const stroke=ref&&refOn&&!on?'#D2553F':'#C9D3D8';
    s+='<rect x="'+(i*c+.5)+'" y="'+(j*c+.5)+'" width="'+(c-1)+'" height="'+(c-1)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+(ref&&refOn&&!on?1.6:.6)+'"'+(ref&&refOn&&!on?' stroke-dasharray="2 2"':'')+'/>';}
  return s+'</svg>';}
function refresh(){const bp=$('bp');if(!st.target){bp.hidden=true;return;}bp.hidden=false;const cur=viewsOf(st.h);const T=st.target;
  $('bpViews').innerHTML=['front','side','top'].map(k=>'<div class="vrow"><div class="vlab"><b>'+VN[k].name+'</b><span>'+VN[k].from+'</span></div><div class="pair"><figure>'+grid(k,T)+'<figcaption>藍圖</figcaption></figure><figure>'+grid(k,cur,T)+'<figcaption>你的</figcaption></figure></div></div>').join('');
  $('bpCount').textContent='已用 '+count()+' 塊';}

/* ---------- ui ---------- */
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
function hud(){$('score').textContent=st.score;}
document.querySelectorAll('.vbtn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.v)));
$('bpToggle').addEventListener('click',()=>{const b=$('bp');b.classList.toggle('min');$('bpToggle').textContent=b.classList.contains('min')?'展開藍圖':'收起';});
$('assist').addEventListener('click',()=>{if(!st.hint)return;const lv=Math.min(st.hint.length,st.hintLv+1);st.hintLv=lv;st.hints++;st.score=Math.max(0,st.score-GM.scoring.hint_penalty);hud();E.bubble('陳工程師的提示 '+lv+'/'+st.hint.length+'（扣 '+GM.scoring.hint_penalty+' 分）',st.hint[lv-1],8000);});
function modeBtns(){const w=document.createElement('div');w.className='seg';[['add','放置方塊'],['remove','移除方塊']].forEach(([m,t])=>{const b=E.btn('segb',t,()=>{st.mode=m;w.querySelectorAll('.segb').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});b.setAttribute('aria-pressed',String(st.mode===m));w.appendChild(b);});return w;}

/* ---------- solutions for skip ---------- */
function solve(L){if(L.target)return L.target;const v=L.views,cells=v.top.map(([x,z])=>[x,z,1]);const H=(x,z)=>cells.find(c=>c[0]===x&&c[1]===z);
  if(L.type==='max'){cells.forEach(c=>c[2]=Math.min(v.front[c[0]],v.side[c[1]]));return cells;}
  const needX=new Set(),needZ=new Set();v.front.forEach((f,x)=>{if(f>1)needX.add(x);});v.side.forEach((s,z)=>{if(s>1)needZ.add(z);});
  for(const x of [...needX]){const z=[...needZ].find(z=>v.side[z]===v.front[x]&&H(x,z));if(z!=null){H(x,z)[2]=v.front[x];needX.delete(x);needZ.delete(z);}}
  for(const x of needX){const c=cells.find(c=>c[0]===x&&v.side[c[1]]>=v.front[x]);c[2]=v.front[x];}
  for(const z of needZ){const c=cells.find(c=>c[1]===z&&v.front[c[0]]>=v.side[z]);c[2]=Math.max(c[2],v.side[z]);}return cells;}

/* ---------- levels ---------- */
async function buildLevel(L){
  st.target=L.target?viewsOf(hFromList(L.target)):{front:L.views.front,side:L.views.side,top:L.views.top};refresh();setView('free');
  st.hint=L.hint;st.hintLv=0;st.attempts=0;st.building=true;let skipped=false;
  for(;;){const act=await new Promise(async res=>{E.actions([]);await E.showLine('mentor',L.type==='min'?'砌出符合三視圖的結構，而且要用最少的方塊。':L.type==='max'?'砌出符合三視圖的結構，而且要用最多的方塊。':'砌出符合三個視圖的結構。點擊地台放置方塊，可以拖動畫面轉換角度。');
      E.actions([modeBtns(),E.btn('next','交給驗收主任',()=>res('submit')),E.btn('ghost','全部清除',()=>res('clear')),E.skipBtn(()=>res('skip'),'跳過，看正確砌法')]);});
    if(st.busy){await new Promise(r=>{const iv=setInterval(()=>{if(!st.busy){clearInterval(iv);r();}},50);});}
    if(act==='clear'){clearAll();continue;}
    if(act==='skip'){skipped=true;clearAll();placeInstant(solve(L));E.flash(true);await E.say('mentor','這是其中一個正確砌法。轉動畫面，從三個方向對照藍圖看看。');break;}
    st.attempts++;const cur=viewsOf(st.h);const ok=sameViews(cur,st.target);const n=count();
    const gk=CH.gatekeeper;E.emote(gk,'hop');
    if(!ok){const bad=[];if(cur.front.join()!==st.target.front.join())bad.push(VN.front.name);if(cur.side.join()!==st.target.side.join())bad.push(VN.side.name);if(!sameViews({front:[],side:[],top:cur.top},{front:[],side:[],top:st.target.top}))bad.push(VN.top.name);
      E.emote(CH.rival,'hop');toast('驗收不合格',bad.join('、')+'與藍圖不符。看藍圖面板上紅色的格子。','bad');if(st.attempts===1)E.floatBubble(CH.rival,L.rival,2600);continue;}
    if((L.type==='min'||L.type==='max')&&n!==L.answer_count){toast('三視圖正確，但……','你用了 '+n+' 塊。'+(L.type==='min'?'還可以更少嗎？':'還可以更多嗎？'),'bad');E.emote(gk,'shake');continue;}
    break;}
  st.building=false;ghost.visible=false;
  const pts=skipped?0:(st.attempts<=1?GM.scoring.match_first_try:GM.scoring.match_retry);st.score+=pts;hud();
  st.results.push({title:L.title,ok:!skipped,attempts:st.attempts,count:count()});
  if(!skipped){E.flash(true);Object.values(CH).forEach(c=>{if(c.slot!=='rival')E.emote(c,'hop');});E.emote(CH.rival,'slump');toast('驗收合格 +'+pts,'用了 '+count()+' 塊方塊。','ok');}
  await E.sleep(700);
}
function exposedArea(h){let a=0;for(let x=0;x<N;x++)for(let z=0;z<N;z++){const k=h[x][z];if(!k)continue;a+=1;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>{const nx=x+dx,nz=z+dz;const nh=(nx<0||nz<0||nx>=N||nz>=N)?0:h[nx][nz];a+=Math.max(0,k-nh);});}return a;}
async function measureLevel(L){
  clearAll();st.target=null;refresh();setView('free');
  for(const [x,z,k] of L.target)for(let i=0;i<k;i++)await addBlock(x,z,true);
  const h=hFromList(L.target),vol=L.target.reduce((s,c)=>s+c[2],0),area=exposedArea(h),topN=L.target.length;
  st.hint=L.hint;st.hintLv=0;
  const qs=[{q:C.measure_questions.volume,ans:vol+' m³',opts:[vol+' m³',topN+' m³',(vol+2)+' m³',vol*6+' m³'],ex:'每塊方塊 1 m³，一共 '+vol+' 塊，體積是 '+vol+' m³。'},
            {q:C.measure_questions.area,ans:area+' m²',opts:[area+' m²',vol*6+' m²',(area+topN)+' m²',(area-4)+' m²'],ex:'只計算露在外面的面：一共 '+area+' 個面，即 '+area+' m²。'+vol*6+' m² 是把相貼的面和底部也計算了。'}];
  for(const q of qs){const opts=E.shuffle(q.opts),dis=new Set();let w=0;
    for(;;){const i=await E.ask('mentor',q.q,opts,dis,{skip:true});if(i===-1){await E.say('mentor','答案是 '+q.ans+'。'+q.ex);break;}
      if(opts[i]===q.ans){st.score+=Math.max(2,GM.scoring.measure_first_try-w*3);hud();E.flash(true);await E.say('mentor','正確。'+q.ex);break;}
      w++;dis.add(i);E.emote(CH.rival,opts[i]===vol*6+' m²'?'hop':'shake');toast('再算一次',opts[i]===vol*6+' m²'?L.rival:'仔細數一數。可以轉動畫面，從不同方向看。','bad');}}
  st.results.push({title:L.title,ok:true,attempts:1,count:vol});
}
async function check(L){if(!L.check)return;const q=L.check,dis=new Set();let w=0;
  for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
    if(i===q.answer){st.score+=Math.max(2,GM.scoring.check_first_try-w*GM.scoring.check_wrong_penalty);hud();E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}

window.__bldApi={addBlock:(...a)=>addBlock(...a),clearAll:()=>clearAll(),solve:L=>solve(L),setView:k=>setView(k)};
async function main(){
  E.start();hud();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開工</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>今日開工</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">'+C.meta.unit+'。點擊地台，起重機會把方塊吊過去；拖動畫面可以轉換角度，也可以用「正視、側視、俯視」按鈕對照藍圖。</p><button class="primary" id="go">戴好安全帽</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;$('views').hidden=false;if(E.portrait){$('bp').classList.add('min');$('bpToggle').textContent='展開藍圖';}
  for(let i=Math.max(0,(window.__startLv||1)-1);i<C.levels.length;i++){const L=C.levels[i];st.lv=i;
    E.overlay('<div class="chapcard"><small>第'+E.NUM[i]+'關</small><h2>'+L.title+'</h2></div>',true);await Promise.race([E.sleep(E.RM?700:1600),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapNo').textContent='第'+E.NUM[i]+'關';$('chapTitle').textContent=L.title;clearAll();
    await E.say('mentor',L.brief);E.emote(CH.rival,'hop');await E.say('rival',L.rival);
    if(L.type==='measure')await measureLevel(L);else await buildLevel(L);
    await check(L);}
  E.hideDialog();$('bp').hidden=true;const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];
  E.overlay('<div class="card"><p class="sub" style="margin:0">今日收工</p><h2>'+EN.title+'</h2><p>'+EN.text+'</p><div class="stats"><div><b>'+st.score+'</b>分數</div><div><b>'+st.results.filter(r=>r.ok).length+'/'+st.results.length+'</b>完成關卡</div><div><b>'+st.hints+'</b>提示</div></div><ul class="review">'+
    st.results.map(r=>'<li><b>'+r.title+'</b><p>'+(r.ok?'完成，嘗試 '+r.attempts+' 次，用了 '+r.count+' 塊':'已跳過')+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">陳工程師：'+C.debrief+'</p><button class="primary" id="again">再開一次工</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
