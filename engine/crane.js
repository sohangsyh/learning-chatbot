/* Container-crane mode: grid positions, directions, turning and cuboid volume at a container terminal */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
let lang=(()=>{try{const q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='zh')return q;const s=localStorage.getItem('gp_lang');if(s==='en'||s==='zh')return s;}catch(e){}return 'zh';})();
E.lang=lang;document.documentElement.lang=lang==='en'?'en':'zh-Hant';
const L=x=>x==null?'':(typeof x==='object'&&!Array.isArray(x))?(x[lang]!=null?x[lang]:x.zh):String(x);
const U={
 zh:{score:'分數',hint:'主管提示',hintT:'{who}的提示 {n}/{m}（扣 {p} 分）',lv:'第{n}關',start:'開工',crew:'今日當值',ready:'戴好安全帽',goals:'今日學習目標',goalsSub:'完成五關之後，你會學會：',goalsGo:'明白，下一步',dragTip:'拖動畫面可以轉換角度。',
  at:'吊機位置',truckAt:'拖頭位置',facing:'面向',holding:'吊著',none:'—',dirs:['北','東','南','西'],dirsS:['北','東','南','西'],grab:'吊起',drop:'放下',
  order:'工作單 {n}/{m}',driveTask:'把{col}貨櫃由 {a} 吊到 {b}。',wrongPick:'這裡是 {at}，要吊的貨櫃在 {want}。',noBox:'{at} 沒有貨櫃。',wrongDrop:'這裡是 {at}，要放在 {want}。',
  edge:'已經到堆場邊了',edgeD:'再向{d}就出界了。',full:'吊機已經吊著貨櫃。',empty:'吊機沒有吊著貨櫃。',done:'完成 +{p}',wrong:'位置不對',
  run:'執行指令',clear:'清除',progEmpty:'按上面的按鈕加入指令',progRun:'執行中……',fwd:'前進',left:'左轉 90°',right:'右轉 90°',uturn:'掉頭 180°',
  cL:'左轉',cR:'右轉',cU:'掉頭',crash:'撞到了！',crashD:'拖頭前面的 {at} 有貨櫃擋住。重新規劃路線。',offGrid:'駛出堆場了！',offGridD:'拖頭在 {at} 再前進就出界了。',
  notThere:'未到目的地',notThereD:'拖頭停在 {at}，面向{f}。目的地是 {g}。',progNoBox:'第 {i} 個指令：{at} 沒有貨櫃可以吊。',progFull:'第 {i} 個指令：吊機已經吊著貨櫃，不能再吊。',progEmptyDrop:'第 {i} 個指令：吊機沒有吊著貨櫃，不能放下。',
  progEdge:'第 {i} 個指令會令吊機駛出堆場。',progWrongBox:'吊錯了貨櫃！{at} 的貨櫃不是工作單上那一個。',progNotDone:'指令完成了，但{col}貨櫃還未放到 {b}。',fail:'未成功',hidden:'定位故障',
  holdA:'先鋪滿最底一層：點擊船艙底的格子，岸邊吊機會把貨櫃放進去。',cellFull:'這一格已經有貨櫃了。',layer:'這一層',loaded:'已裝',copy:'照樣再疊一層',
  totalQ:'船艙裝滿了。一共有多少個貨櫃？',orderQ:'第二個船艙：長 {l} 格、闊 {w} 格、高 {h} 層。要訂多少個貨櫃，才能剛好裝滿？',orderBtn:'訂購 {n} 個',
  short:'還有 {n} 個空位',shortD:'船艙未裝滿，船長不肯開船。',over:'多了 {n} 個貨櫃',overD:'多出來的貨櫃要運回堆場，浪費時間和運費。',exact:'剛好裝滿！',
  baseL:'長',baseW:'闊',layers:'層數',stackBtn:'開始疊',reset:'重選',dragBase:'在堆場地上拖出長方形底面',need:'要剛好 {t} 個',
  blocked:'底面壓到維修區了。',notN:'{n} 個不等於 {t} 個。',second:'再找一個不同的疊法嗎？',secondYes:'再試一個',secondNo:'不用了',same:'這個和剛才的尺寸一樣，試試不同的長、闊、高。',repair:'維修',
  end:'今日收工',lvDone:'完成關卡',hints:'提示',again:'再開一更',skipped:'已跳過',lvOk:'完成',skip:'跳過，看示範',correct:'正確。',ansIs:'答案是「{a}」。',tryAgain:'再試一次',
  load:'裝船',gate:'閘口',stackOk:'疊好了！{eq}',quit:'收工'},
 en:{score:'Score',hint:'Hint',hintT:'Hint from {who} {n}/{m} (−{p} points)',lv:'Level {n}',start:'Start shift',crew:'Today’s crew',ready:'Put on your hard hat',goals:"What you'll learn",goalsSub:'By the end of the five levels, you’ll be able to:',goalsGo:'Got it, next',dragTip:'Drag the scene to change the view.',
  at:'Crane at',truckAt:'Truck at',facing:'Facing',holding:'Holding',none:'—',dirs:['north','east','south','west'],dirsS:['N','E','S','W'],grab:'Pick up',drop:'Put down',
  order:'Order {n}/{m}',driveTask:'Move the {col} container from {a} to {b}.',wrongPick:'This is {at}. The container you need is at {want}.',noBox:'There’s no container at {at}.',wrongDrop:'This is {at}. It goes to {want}.',
  edge:'Edge of the yard',edgeD:'One more step {d} would leave the yard.',full:'The crane is already holding a container.',empty:'The crane isn’t holding anything.',done:'Done +{p}',wrong:'Wrong square',
  run:'Run',clear:'Clear',progEmpty:'Add commands with the buttons above',progRun:'Running…',fwd:'Forward',left:'Left 90°',right:'Right 90°',uturn:'Turn 180°',
  cL:'Left',cR:'Right',cU:'U-turn',crash:'Crash!',crashD:'A container blocks the way at {at}. Plan a new route.',offGrid:'Out of the yard!',offGridD:'Driving forward from {at} leaves the yard.',
  notThere:'Not there yet',notThereD:'The truck stopped at {at}, facing {f}. The goal is {g}.',progNoBox:'Command {i}: there’s no container to pick up at {at}.',progFull:'Command {i}: the crane is already holding a container.',progEmptyDrop:'Command {i}: the crane has nothing to put down.',
  progEdge:'Command {i} would drive the crane out of the yard.',progWrongBox:'Wrong container! The one at {at} isn’t the one on the order.',progNotDone:'The commands finished, but the {col} container isn’t at {b} yet.',fail:'Not quite',hidden:'Position screen down',
  holdA:'First fill the bottom layer: tap squares on the floor of the hold and the quay crane will lower a container there.',cellFull:'That square already has a container.',layer:'This layer',loaded:'Loaded',copy:'Stack another layer the same',
  totalQ:'The hold is full. How many containers are there altogether?',orderQ:'Second hold: {l} squares long, {w} squares wide, {h} layers high. How many containers should you order to fill it exactly?',orderBtn:'Order {n}',
  short:'{n} spaces still empty',shortD:'The hold isn’t full, so the Captain won’t sail.',over:'{n} containers too many',overD:'The extras have to go back to the yard, wasting time and money.',exact:'Filled exactly!',
  baseL:'Length',baseW:'Width',layers:'Layers',stackBtn:'Stack them',reset:'Reset',dragBase:'Drag on the yard floor to draw the base',need:'Must be exactly {t}',
  blocked:'The base covers the repair zone.',notN:'{n} isn’t {t}.',second:'Want to find a different way to stack them?',secondYes:'Try another',secondNo:'No thanks',same:'Those are the same measurements as before. Try a different length, width or height.',repair:'Repair',
  end:'End of shift',lvDone:'Levels',hints:'Hints',again:'Play again',skipped:'Skipped',lvOk:'Done',skip:'Skip, show me',correct:'Correct. ',ansIs:'The answer is “{a}”. ',tryAgain:'Try again',
  load:'Load',gate:'Gate',stackOk:'Stacked! {eq}',quit:'Finish'}};
const T=(k,o)=>{let s=U[lang][k];if(o)for(const a in o)s=s.split('{'+a+'}').join(o[a]);return s;};
const st={lv:-1,score:0,hints:0,hint:null,hintLv:0,results:[],anims:[],busy:false,yaw:0,pitch:1.2,tYaw:0,tPitch:1.2,dist:27,ctr:V(0,0,.2),tCtr:V(0,0,.2),drag:null,pick:null,cur:null,ro:null};
window.__crane=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.fade.on=false;E.bindDialog();E.resp.allowPan=false;E.parallax=0;E.setEnv('port_day',true);
const S=E.kits.container_port.build(W),K=E.kits.container_port,CELL=K.CELL,LAYER=K.LAYER,CH=K.CH;
const COLS=S.COLS,ROWS=S.ROWS;
function setNames(){E.SPK={narrator:{name:lang==='en'?'You':'你',col:'#F4EBD6'}};Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:L(d.display_name),col:E.hex(E.PAL[d.character_id][0])});if(E._spk)Object.keys(E._spk).forEach(k=>{if(E.SPK[k])E._spk[k]=Object.assign({},E.SPK[k]);});}
setNames();
Object.entries(C.npc_slots).forEach(([s,d])=>{const c=E.makeChar(s,d.character_id,d.costume);const l=W.npc_layout[s];c.root.position.set(l[0],0,l[2]);c.target.copy(c.root.position);});
const CHR=E.chars;E.lampValue=()=>Math.min(1,.2+st.score/180);
const ref=(c,r)=>String.fromCharCode(65+c)+(r+1),pr=s=>({c:s.charCodeAt(0)-65,r:parseInt(s.slice(1),10)-1});
const colHex=k=>parseInt(C.colors[k].hex.slice(1),16),colName=k=>C.colors[k][lang];
const DV=[[0,1],[1,0],[0,-1],[-1,0]],ARW=['↑','→','↓','←'];
const inGrid=(c,r)=>c>=0&&r>=0&&c<COLS&&r<ROWS;

/* ---------- camera ---------- */
E.cam.idle=()=>{st.yaw+=(st.tYaw-st.yaw)*.1;st.pitch+=(st.tPitch-st.pitch)*.1;st.ctr.lerp(st.tCtr,.08);const d=E.portrait?st.dist*1.55:st.dist,cp=Math.cos(st.pitch);
  E.camera.position.set(st.ctr.x+Math.sin(st.yaw)*cp*d,st.ctr.y+Math.sin(st.pitch)*d,st.ctr.z+Math.cos(st.yaw)*cp*d);E.cam.look.copy(st.ctr);};
function view(k){if(k==='ship'){const h=S.ship;st.tCtr.set(0,0,h.hz+2.2);st.tYaw=.1;st.tPitch=1.3;st.dist=27;}else{st.tCtr.set(0,0,.2);st.tYaw=0;st.tPitch=1.2;st.dist=27;}}
const cv=E.canvas,ray=new THREE.Raycaster(),pm=new THREE.Vector2();
function rayAt(e,y){const r=cv.getBoundingClientRect();pm.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pm,E.camera);const p=V();return ray.ray.intersectPlane(new THREE.Plane(V(0,1,0),-y),p)?p:null;}
function pickYard(e){const p=rayAt(e,.05);if(!p)return null;const c=Math.round(p.x/CELL+(COLS-1)/2),r=Math.round((ROWS-1)/2-p.z/CELL);return inGrid(c,r)?{c,r}:null;}
function pickHold(e){const h=S.ship;if(!h)return null;const p=rayAt(e,h.floorY);if(!p)return null;const c=Math.round(p.x/CELL+(h.L-1)/2),r=Math.round((h.W-1)/2-(p.z-h.hz)/CELL);return c>=0&&r>=0&&c<h.L&&r<h.W?{c,r}:null;}
cv.addEventListener('pointerdown',e=>{if(st.pick==='stack'&&!st.busy){const c=pickYard(e);if(c){st.sel={c0:c.c,r0:c.r,c1:c.c,r1:c.r};st.selecting=true;cv.setPointerCapture(e.pointerId);stackPreview();return;}}
  st.drag={x:e.clientX,y:e.clientY,yaw:st.tYaw,pitch:st.tPitch,m:0};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(st.selecting){const c=pickYard(e);if(c&&(c.c!==st.sel.c1||c.r!==st.sel.r1)){st.sel.c1=c.c;st.sel.r1=c.r;stackPreview();}return;}
  const d=st.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.m=Math.max(d.m,Math.hypot(dx,dy));if(d.m>6){st.tYaw=Math.max(-1.3,Math.min(1.3,d.yaw-dx*.006));st.tPitch=Math.max(.35,Math.min(1.45,d.pitch+dy*.005));}});
cv.addEventListener('pointerup',e=>{if(st.selecting){st.selecting=false;stackPreview();return;}const d=st.drag;st.drag=null;if(d&&d.m<=6&&st.pick==='hold'&&st.onHold){const c=pickHold(e);if(c)st.onHold(c);}});
cv.addEventListener('wheel',e=>{st.dist=Math.max(14,Math.min(36,st.dist+e.deltaY*.01));e.preventDefault();},{passive:false});

/* ---------- animation ---------- */
function anim(dur,update){return new Promise(res=>st.anims.push({t:0,dur:E.RM?.01:dur*(window.__fast?.15:1),update,done:res}));}
function onFrame(dt){for(let i=st.anims.length-1;i>=0;i--){const a=st.anims[i];a.t+=dt;const k=Math.min(1,a.t/a.dur);a.update(k);if(k>=1){st.anims.splice(i,1);a.done();}}if(under.visible)under.position.set(G.x,0,G.z);if(st.truck)st.truck.userData.arrow.position.y=2.3+Math.sin(performance.now()/260)*.12;}
const ease=k=>k*k*(3-2*k);
function rigTo(R,x,z,y,dur){const x0=R.x,z0=R.z,y0=R.y;return anim(dur,k=>{const e=ease(k);R.set(x0+(x-x0)*e,z0+(z-z0)*e,y0+(y-y0)*e);});}
function attach(R,o){R.load=o;R.spreader.add(o.m);o.m.position.set(0,-CH/2-.05,0);}
const G=S.gantry,Q=S.quayCrane,TRAVEL=3*LAYER+CH+.55;
G.set(S.gx(0),S.gz(0),TRAVEL);Q.set(14,S.quayZ+2.6,9);
const under=S.marker(0xF2C81A);under.visible=false;

/* ---------- yard ---------- */
const yard=new Map();let uid=0;const extras=[];
const stk=(c,r)=>{const k=c+','+r;if(!yard.has(k))yard.set(k,[]);return yard.get(k);};
function addBox(c,r,col){const s=stk(c,r);const m=K.container(colHex(col));m.position.copy(S.cellPos(c,r,s.length));S.g.add(m);const o={m,col,id:++uid};s.push(o);return o;}
function clearYard(){yard.forEach(s=>s.forEach(o=>o.m.parent&&o.m.parent.remove(o.m)));yard.clear();if(G.load){G.spreader.remove(G.load.m);G.load=null;}extras.forEach(m=>m.parent&&m.parent.remove(m));extras.length=0;}
function layout(list){list.forEach(([rf,col])=>{const p=pr(rf);addBox(p.c,p.r,col);});}
const topY=n=>.06+(n?(n-1)*LAYER+CH:0);
async function gGrab(c,r){const s=stk(c,r);const o=s.pop();await rigTo(G,G.x,G.z,topY(s.length+1)+.05,.4);attach(G,o);await rigTo(G,G.x,G.z,TRAVEL,.35);return o;}
async function gDrop(c,r){const s=stk(c,r),o=G.load,p=S.cellPos(c,r,s.length);await rigTo(G,G.x,G.z,p.y+CH/2+.05,.4);S.g.add(o.m);o.m.position.copy(p);s.push(o);G.load=null;await rigTo(G,G.x,G.z,TRAVEL,.3);}
const gMove=(c,r,dur)=>rigTo(G,S.gx(c),S.gz(r),TRAVEL,dur||.38);

/* ---------- ui ---------- */
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4200);}
function hud(){$('score').textContent=st.score;}
function statics(){$('scoreLab').textContent=T('score');$('assistLab').textContent=T('hint');$('langBtn').innerHTML=lang==='en'?'中文 | <b>EN</b>':'<b>中文</b> | EN';
  if(st.lv>=0){$('chapNo').textContent=T('lv',{n:lang==='en'?st.lv+1:E.NUM[st.lv]});$('chapTitle').textContent=L(C.levels[st.lv].title);}document.title=lang==='en'?C.meta.short_title_en:C.meta.short_title;}
function readout(html){const r=$('readout');st.ro=html;if(html==null){r.hidden=true;return;}r.hidden=false;r.innerHTML=typeof html==='function'?html():html;}
const cmpSVG=h=>'<svg class="cmp" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="none" stroke="#B8AD94" stroke-width="1.5"/><text x="15" y="8.5" font-size="7" text-anchor="middle" fill="#D2553F" font-weight="700">N</text><g transform="rotate('+h*90+' 15 15)"><path d="M15 6 L19 18 L15 15.5 L11 18 Z" fill="#E0B04B"/></g></svg>';
function show(key,text,nodes){st.cur={key,text,nodes};E.showLine(key,typeof text==='function'?text():L(text));if(nodes)E.actions(nodes());}
function redraw(){if(st.cur){const c=st.cur;E.showLine(c.key,typeof c.text==='function'?c.text():L(c.text));if(c.nodes)E.actions(c.nodes());}if(typeof st.ro==='function')readout(st.ro);}
$('langBtn').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';E.lang=lang;document.documentElement.lang=lang==='en'?'en':'zh-Hant';try{localStorage.setItem('gp_lang',lang);}catch(e){}setNames();statics();redraw();});
$('assist').addEventListener('click',()=>{if(!st.hint)return;const h=L(st.hint),lv=Math.min(h.length,st.hintLv+1);st.hintLv=lv;st.hints++;st.score=Math.max(0,st.score-GM.scoring.hint_penalty);hud();
  E.bubble(T('hintT',{who:L(C.npc_slots.mentor.display_name),n:lv,m:h.length,p:GM.scoring.hint_penalty}),h[lv-1],9000);});
const btn=(cls,html,fn)=>E.btn(cls,html,fn);
function waitIdle(){return new Promise(r=>{const iv=setInterval(()=>{if(!st.busy){clearInterval(iv);r();}},40);});}
function cheer(){E.flash(true);Object.values(CHR).forEach(c=>{if(c.slot!=='rival')E.emote(c,'hop');});}

/* ---------- level 1: drive with arrow keys ---------- */
async function driveLevel(Lv){
  clearYard();layout(Lv.yard);const s0=pr(Lv.start);st.cell={...s0};G.set(S.gx(s0.c),S.gz(s0.r),TRAVEL);view('yard');under.visible=true;
  const ro=()=>'<span>'+T('at')+'<b>'+ref(st.cell.c,st.cell.r)+'</b></span><span>'+T('holding')+'<b>'+(G.load?colName(G.load.col):T('none'))+'</b></span>';readout(ro);
  let skipped=false,ok=0;
  for(let ti=0;ti<Lv.tasks.length;ti++){const t=Lv.tasks[ti],P=pr(t.pick),D=pr(t.drop);let miss=0;
    await new Promise(done=>{
      const move=async h=>{if(st.busy)return;const n={c:st.cell.c+DV[h][0],r:st.cell.r+DV[h][1]};if(!inGrid(n.c,n.r)){toast(T('edge'),T('edgeD',{d:T('dirs')[h]}),'bad');return;}st.busy=true;st.cell=n;await gMove(n.c,n.r);readout(ro);st.busy=false;};
      const grab=async()=>{if(st.busy)return;const {c,r}=st.cell;if(G.load){toast(T('wrong'),T('full'),'bad');return;}
        if(c!==P.c||r!==P.r){miss++;E.emote(CHR.rival,'hop');toast(T('wrong'),stk(c,r).length?T('wrongPick',{at:ref(c,r),want:t.pick}):T('noBox',{at:ref(c,r)}),'bad');return;}
        st.busy=true;await gGrab(c,r);readout(ro);st.busy=false;};
      const drop=async()=>{if(st.busy)return;const {c,r}=st.cell;if(!G.load){toast(T('wrong'),T('empty'),'bad');return;}
        if(c!==D.c||r!==D.r){miss++;E.emote(CHR.rival,'hop');toast(T('wrong'),T('wrongDrop',{at:ref(c,r),want:t.drop}),'bad');return;}
        st.busy=true;await gDrop(c,r);readout(ro);st.busy=false;done();};
      const skip=async()=>{if(st.busy)return;skipped=true;st.busy=true;E.actions([]);if(G.load){await gMove(D.c,D.r,.6);st.cell={...D};await gDrop(D.c,D.r);}else{await gMove(P.c,P.r,.7);st.cell={...P};readout(ro);await gGrab(P.c,P.r);readout(ro);await gMove(D.c,D.r,.7);st.cell={...D};await gDrop(D.c,D.r);}readout(ro);st.busy=false;done();};
      show('mentor',()=>T('order',{n:ti+1,m:Lv.tasks.length})+(lang==='en'?': ':'：')+T('driveTask',{col:colName(t.color),a:t.pick,b:t.drop}),()=>{
        const pal=document.createElement('div');pal.className='pal';[0,3,1,2].forEach(h=>pal.appendChild(btn('cmd','<span class="ar">'+ARW[h]+'</span>'+T('dirsS')[h],()=>move(h))));
        pal.appendChild(btn('cmd act','⤓ '+T('grab'),grab));pal.appendChild(btn('cmd act','⤒ '+T('drop'),drop));return [pal,E.skipBtn(skip,T('skip'))];});
    });
    if(!skipped){const p=Math.max(4,GM.scoring.drive_task-miss*GM.scoring.drive_wrong_penalty);st.score+=p;ok++;hud();cheer();toast(T('done',{p}),'','ok');await E.sleep(600);}
  }
  st.cur=null;under.visible=false;readout(null);st.results.push({title:Lv.title,ok:!skipped});
}

/* ---------- command programs (crane and truck) ---------- */
function progUI(o){const pal=document.createElement('div');pal.className='pal';const strip=document.createElement('div');strip.className='prog';
  const draw=()=>{strip.innerHTML='';if(!o.prog.length){strip.innerHTML='<span class="empty">'+T('progEmpty')+'</span>';return;}
    o.prog.forEach((c,i)=>{const ch=document.createElement('span');ch.className='chip'+(c.t==='grab'||c.t==='drop'?' g':'')+(o.runIdx===i?' run':'')+(o.badIdx===i?' bad':'');ch.innerHTML=o.label(c);
      if(o.runIdx==null){const x=document.createElement('button');x.textContent='✕';x.setAttribute('aria-label','✕');x.onclick=()=>{o.prog.splice(i,1);draw();};ch.appendChild(x);}strip.appendChild(ch);});};
  o.cmds().forEach(([html,cmd,merge])=>pal.appendChild(btn('cmd'+(cmd.t==='grab'||cmd.t==='drop'?' act':''),html,()=>{if(o.runIdx!=null)return;const last=o.prog[o.prog.length-1];o.badIdx=null;
    if(merge&&last&&last.t===cmd.t&&last.h===cmd.h&&last.n<9)last.n++;else o.prog.push(Object.assign({},cmd,merge?{n:1}:{}));draw();})));
  o.draw=draw;draw();
  const run=btn('next',T('run'),()=>{if(o.runIdx==null&&o.prog.length)o.onRun();}),clr=btn('ghost',T('clear'),()=>{if(o.runIdx!=null)return;o.prog.length=0;o.badIdx=null;draw();});
  return [pal,strip,run,clr,E.skipBtn(()=>{if(o.runIdx==null)o.onSkip();},T('skip'))];}
const dirCmds=()=>[0,3,1,2].map(h=>['<span class="ar">'+ARW[h]+'</span>'+T('dirsS')[h],{t:'D',h},true]);
const craneLabel=c=>c.t==='D'?ARW[c.h]+' '+T('dirsS')[c.h]+' '+c.n:c.t==='grab'?'⤓ '+T('grab'):'⤒ '+T('drop');
function snapshot(){const a=[];yard.forEach((s,k)=>s.forEach(o=>a.push([k,o.col,o.id])));return a;}
function restore(a){yard.forEach(s=>s.forEach(o=>o.m.parent&&o.m.parent.remove(o.m)));yard.clear();if(G.load){G.spreader.remove(G.load.m);G.load=null;}
  a.forEach(([k,col,id])=>{const [c,r]=k.split(',').map(Number);const o=addBox(c,r,col);o.id=id;});}
function routeTo(from,to){const p=[];const dx=to.c-from.c,dy=to.r-from.r;if(dx)p.push({t:'D',h:dx>0?1:3,n:Math.abs(dx)});if(dy)p.push({t:'D',h:dy>0?0:2,n:Math.abs(dy)});return p;}

async function programLevel(Lv){
  clearYard();layout(Lv.yard);const s0=pr(Lv.start);st.cell={...s0};G.set(S.gx(s0.c),S.gz(s0.r),TRAVEL);view('yard');under.visible=true;let anySkip=false;
  for(let ti=0;ti<Lv.tasks.length;ti++){const t=Lv.tasks[ti],P=pr(t.pick),D=pr(t.drop),targetId=stk(P.c,P.r)[stk(P.c,P.r).length-1].id;
    const snap=snapshot(),cell0={...st.cell};let tries=0,skipped=false;
    const ro=()=>'<span>'+T('at')+(t.hide_ref?'<b class="warn">??</b>':'<b>'+ref(st.cell.c,st.cell.r)+'</b>')+'</span><span>'+T('holding')+'<b>'+(G.load?colName(G.load.col):T('none'))+'</b></span>'+(t.hide_ref?'<span class="warn">'+T('hidden')+'</span>':'');readout(ro);
    const o={prog:[],runIdx:null,badIdx:null,label:craneLabel,cmds:()=>dirCmds().concat([['⤓ '+T('grab'),{t:'grab'}],['⤒ '+T('drop'),{t:'drop'}]])};
    await new Promise(done=>{
      const exec=async()=>{o.runIdx=0;st.busy=true;o.draw();let err=null;
        for(let i=0;i<o.prog.length&&!err;i++){o.runIdx=i;o.draw();const c=o.prog[i];
          if(c.t==='D'){for(let k=0;k<c.n;k++){const n={c:st.cell.c+DV[c.h][0],r:st.cell.r+DV[c.h][1]};if(!inGrid(n.c,n.r)){err=T('progEdge',{i:i+1});break;}st.cell=n;await gMove(n.c,n.r,.3);readout(ro);}}
          else if(c.t==='grab'){if(G.load)err=T('progFull',{i:i+1});else if(!stk(st.cell.c,st.cell.r).length)err=T('progNoBox',{i:i+1,at:t.hide_ref?'??':ref(st.cell.c,st.cell.r)});else{await gGrab(st.cell.c,st.cell.r);readout(ro);if(G.load.id!==targetId)err=T('progWrongBox',{at:ref(st.cell.c,st.cell.r)});}}
          else{if(!G.load)err=T('progEmptyDrop',{i:i+1});else{await gDrop(st.cell.c,st.cell.r);readout(ro);}}
          if(err)o.badIdx=i;}
        const s=stk(D.c,D.r),okk=!err&&s.length&&s[s.length-1].id===targetId;
        if(!err&&!okk)err=T('progNotDone',{col:colName(t.color),b:t.hide_ref?'??':t.drop});
        o.runIdx=null;o.draw();
        if(okk){st.busy=false;done();return;}
        tries++;E.emote(CHR.rival,'hop');E.flash(false);toast(T('fail'),err,'bad');if(tries===1)E.floatBubble(CHR.rival,L(Lv.rival),2800);
        await E.sleep(window.__fast?100:1300);restore(snap);st.cell={...cell0};G.set(S.gx(cell0.c),S.gz(cell0.r),TRAVEL);readout(ro);st.busy=false;};
      o.onRun=exec;
      o.onSkip=()=>{skipped=true;restore(snap);st.cell={...cell0};G.set(S.gx(cell0.c),S.gz(cell0.r),TRAVEL);o.prog=routeTo(cell0,P).concat([{t:'grab'}],routeTo(P,D),[{t:'drop'}]);o.badIdx=null;exec();};
      show('mentor',t.say,()=>progUI(o));
    });
    if(skipped)anySkip=true;else{const p=tries?GM.scoring.program_retry:GM.scoring.program_first_try;st.score+=p;hud();cheer();toast(T('done',{p}),'','ok');await E.sleep(700);}
  }
  st.cur=null;under.visible=false;readout(null);st.results.push({title:Lv.title,ok:!anySkip});
}

/* ---------- level 3: truck with turns ---------- */
function truckSolve(s,h0,g,free){const key=(c,r,h)=>c+','+r+','+h,q=[[s.c,s.r,h0]],prev=new Map([[key(s.c,s.r,h0),null]]);
  while(q.length){const [c,r,h]=q.shift();if(c===g.c&&r===g.r){const path=[];let k=key(c,r,h);while(prev.get(k)){const [pk,m]=prev.get(k);path.unshift(m);k=pk;}
      const out=[];path.forEach(m=>{const l=out[out.length-1];if(m==='F'&&l&&l.t==='F')l.n++;else out.push(m==='F'?{t:'F',n:1}:{t:m});});return out;}
    [[c+DV[h][0],r+DV[h][1],h,'F'],[c,r,(h+3)%4,'L'],[c,r,(h+1)%4,'R'],[c,r,(h+2)%4,'U']].forEach(([a,b,hh,m])=>{if(!free(a,b))return;const k=key(a,b,hh);if(prev.has(k))return;prev.set(k,[key(c,r,h),m]);q.push([a,b,hh]);});}
  return [];}
async function truckLevel(Lv){
  clearYard();Lv.obstacles.forEach(rf=>{const p=pr(rf);addBox(p.c,p.r,'grey');});
  G.set(0,-(ROWS*CELL/2+1.4),TRAVEL);view('yard');
  const free=(c,r)=>inGrid(c,r)&&!stk(c,r).length;
  const tr=K.truck(0xD2553F);S.g.add(tr);st.truck=tr;let anySkip=false;
  for(let ti=0;ti<Lv.tasks.length;ti++){const t=Lv.tasks[ti],s0=pr(t.start),g=pr(t.goal);let tries=0,skipped=false;
    const mk=S.marker(0xF2C81A,L(t.goal_label));mk.position.set(S.gx(g.c),0,S.gz(g.r));
    const T0={c:s0.c,r:s0.r,h:t.face};const put=()=>{st.tk={...T0};st.trot=-T0.h*Math.PI/2;tr.rotation.y=st.trot;tr.position.set(S.gx(T0.c),.02,S.gz(T0.r));};put();
    const ro=()=>'<span>'+T('truckAt')+'<b>'+ref(st.tk.c,st.tk.r)+'</b></span>'+cmpSVG(st.tk.h)+'<span>'+T('facing')+'<b>'+T('dirs')[st.tk.h]+'</b></span>';readout(ro);
    const o={prog:[],runIdx:null,badIdx:null,label:c=>c.t==='F'?'⬆ '+T('fwd')+' '+c.n:c.t==='L'?'↰ '+T('cL'):c.t==='R'?'↱ '+T('cR'):'⟲ '+T('cU'),
      cmds:()=>[['⬆ '+T('fwd'),{t:'F'},true],['↰ '+T('left'),{t:'L'}],['↱ '+T('right'),{t:'R'}],['⟲ '+T('uturn'),{t:'U'}]]};
    await new Promise(done=>{
      const exec=async()=>{o.runIdx=0;st.busy=true;o.draw();let err=null;
        for(let i=0;i<o.prog.length&&!err;i++){o.runIdx=i;o.draw();const c=o.prog[i];
          if(c.t==='F'){for(let k=0;k<c.n;k++){const n={c:st.tk.c+DV[st.tk.h][0],r:st.tk.r+DV[st.tk.h][1]};const from=tr.position.clone();
              if(!free(n.c,n.r)){const to=inGrid(n.c,n.r)?V(S.gx(n.c),.02,S.gz(n.r)):from.clone().add(V(DV[st.tk.h][0]*CELL,0,-DV[st.tk.h][1]*CELL));
                await anim(.22,k2=>tr.position.lerpVectors(from,to,.32*Math.sin(k2*Math.PI)));err=inGrid(n.c,n.r)?[T('crash'),T('crashD',{at:ref(n.c,n.r)})]:[T('offGrid'),T('offGridD',{at:ref(st.tk.c,st.tk.r)})];break;}
              const to=V(S.gx(n.c),.02,S.gz(n.r));await anim(.34,k2=>tr.position.lerpVectors(from,to,ease(k2)));st.tk.c=n.c;st.tk.r=n.r;readout(ro);}}
          else{const d=c.t==='L'?3:c.t==='R'?1:2,a0=st.trot,a1=a0+(c.t==='L'?1:c.t==='R'?-1:-2)*Math.PI/2;await anim(c.t==='U'?.5:.32,k2=>tr.rotation.y=a0+(a1-a0)*ease(k2));st.trot=a1;st.tk.h=(st.tk.h+d)%4;readout(ro);}
          if(err)o.badIdx=i;}
        o.runIdx=null;o.draw();
        if(!err&&st.tk.c===g.c&&st.tk.r===g.r){st.busy=false;done();return;}
        if(!err)err=[T('notThere'),T('notThereD',{at:ref(st.tk.c,st.tk.r),f:T('dirs')[st.tk.h],g:t.goal})];
        tries++;E.flash(false);E.emote(CHR.companion,'shake');E.emote(CHR.rival,'hop');toast(err[0],err[1],'bad');if(tries===1)E.floatBubble(CHR.rival,L(Lv.rival),2800);
        await E.sleep(window.__fast?100:1300);put();readout(ro);st.busy=false;};
      o.onRun=exec;o.onSkip=()=>{skipped=true;put();o.prog=truckSolve(T0,T0.h,g,free);o.badIdx=null;exec();};
      show('mentor',t.say,()=>progUI(o));
    });
    mk.parent&&mk.parent.remove(mk);
    if(skipped)anySkip=true;else{const p=tries?GM.scoring.truck_retry:GM.scoring.truck_first_try;st.score+=p;hud();cheer();E.emote(CHR.companion,'hop');toast(T('done',{p}),'','ok');await E.sleep(700);}
  }
  S.g.remove(tr);st.truck=null;st.cur=null;readout(null);st.results.push({title:Lv.title,ok:!anySkip});
}

/* ---------- level 4: fill the ship's hold ---------- */
const QTRAVEL=()=>S.ship.deckY+CH+1.3;
const holdBoxes=[];
function clearHold(){holdBoxes.forEach(m=>m.parent&&m.parent.remove(m));holdBoxes.length=0;extras.forEach(m=>m.parent&&m.parent.remove(m));extras.length=0;}
const PALK=['red','blue','green','yellow','purple'];
async function dropLayer(h,cells,layer,from){const grp=new THREE.Group();S.g.add(grp);const ms=cells.map(([c,r],i)=>{const m=K.container(colHex(PALK[(c*3+r*2+layer+i)%PALK.length]));m.position.copy(h.cellPos(c,r,layer));grp.add(m);holdBoxes.push(m);return m;});
  const y0=from||7;await anim(.55,k=>{grp.position.y=y0*(1-ease(k));});ms.forEach(m=>{const p=m.getWorldPosition(V());S.g.add(m);m.position.copy(p);});S.g.remove(grp);}
async function holdLevel(Lv){
  clearYard();G.set(0,ROWS*CELL/2+1.4,TRAVEL);
  // part A: build the first layer by hand, then copy it upwards
  const A=Lv.partA;let h=S.makeShip(A.L,A.W,A.H);view('ship');Q.set(-(A.L*CELL/2+9),S.quayZ+2.6,QTRAVEL());
  await E.say('mentor',L(Lv.brief));
  const filled=new Set();let anySkip=false;
  const ro=()=>'<span>'+T('layer')+'<b>'+filled.size+'</b></span><span>'+T('loaded')+'<b>'+holdBoxes.length+'</b></span>';readout(ro);
  await new Promise(done=>{
    const place=async cell=>{if(st.busy)return;const k=cell.c+','+cell.r;if(filled.has(k)){toast(T('cellFull'),'','bad');return;}st.busy=true;filled.add(k);
      const p=h.cellPos(cell.c,cell.r,0),col=PALK[(cell.c*3+cell.r*2)%PALK.length];await rigTo(Q,p.x,S.quayZ+2.6,QTRAVEL(),.25);const o={m:K.container(colHex(col)),col};attach(Q,o);
      await rigTo(Q,p.x,p.z,QTRAVEL(),.35);await rigTo(Q,p.x,p.z,p.y+CH/2+.05,.3);S.g.add(o.m);o.m.position.copy(p);Q.load=null;holdBoxes.push(o.m);readout(ro);await rigTo(Q,p.x,p.z,QTRAVEL(),.2);await rigTo(Q,-(A.L*CELL/2+9),S.quayZ+2.6,QTRAVEL(),.4);st.busy=false;
      if(filled.size===A.L*A.W){st.pick=null;done();}};
    st.onHold=place;st.pick='hold';
    show('gatekeeper',()=>T('holdA'),()=>[E.skipBtn(async()=>{if(st.busy)return;anySkip=true;st.pick=null;const rest=[];for(let c=0;c<A.L;c++)for(let r=0;r<A.W;r++)if(!filled.has(c+','+r)){rest.push([c,r]);filled.add(c+','+r);}st.busy=true;await dropLayer(h,rest,0);readout(ro);st.busy=false;done();},T('skip'))]);
  });
  if(!anySkip){st.score+=GM.scoring.hold_layer;hud();cheer();}
  await new Promise(done=>show('mentor',()=>lang==='en'?'One layer: '+A.L+' in a row × '+A.W+' rows = '+A.L*A.W+'. Now stack the same layer on top.':'一層：每行 '+A.L+' 個 × '+A.W+' 行 = '+A.L*A.W+' 個。現在照樣再疊一層上去。',()=>[btn('next',T('copy'),async()=>{if(st.busy)return;st.busy=true;E.actions([]);
    const all=[];for(let c=0;c<A.L;c++)for(let r=0;r<A.W;r++)all.push([c,r]);for(let l=1;l<A.H;l++)await dropLayer(h,all,l);readout(ro);st.busy=false;done();})]));
  st.cur=null;
  {const cap=A.L*A.W*A.H,cands=[cap,A.L*A.W+A.H,A.L*A.W,A.L+A.W+A.H].filter((v,i,a)=>a.indexOf(v)===i),opts=E.shuffle(cands.map(String)),dis=new Set();let w=0;
    for(;;){const i=await E.ask('gatekeeper',T('totalQ'),opts,dis,{skip:true});if(i===-1){await E.say('gatekeeper',T('ansIs',{a:cap})+(lang==='en'?A.L+' × '+A.W+' × '+A.H+' = '+cap+'.':A.L+' × '+A.W+' × '+A.H+' = '+cap+'。'));break;}
      if(opts[i]===String(cap)){st.score+=Math.max(2,GM.scoring.hold_total-w*3);hud();cheer();await E.say('gatekeeper',T('correct')+(lang==='en'?A.L*A.W+' in each layer × '+A.H+' layers = '+cap+'.':'每層 '+A.L*A.W+' 個 × '+A.H+' 層 = '+cap+' 個。'));break;}
      w++;dis.add(i);E.emote(CHR.rival,'hop');}}
  // part B: order the right number for a bigger hold
  clearHold();const B=Lv.partB,cap=B.L*B.W*B.H;h=S.makeShip(B.L,B.W,B.H);view('ship');Q.set(-(B.L*CELL/2+9),S.quayZ+2.6,QTRAVEL());
  E.emote(CHR.rival,'hop');await E.say('rival',L(Lv.rival));
  let n=0,tries=0,skippedB=false;readout(()=>'<span>'+T('loaded')+'<b>'+holdBoxes.length+'</b></span>');
  await new Promise(done=>{
    const fill=async(k)=>{st.busy=true;E.actions([]);clearHold();let left=k;
      for(let l=0;l<B.H&&left>0;l++){const cells=[];for(let r=0;r<B.W;r++)for(let c=0;c<B.L;c++)if(cells.length<Math.min(left,B.L*B.W))cells.push([c,r]);left-=cells.length;await dropLayer(h,cells,l);readout(st.ro);}
      for(let i=0;i<left;i++){const m=K.container(colHex('grey'));m.position.set(-B.L*CELL/2+(i%8)*CELL,CH/2+.02+Math.floor(i/40)*LAYER,S.quayZ+1.6+Math.floor(i/8)%5*CELL);S.g.add(m);extras.push(m);}
      st.busy=false;return left;};
    const order=async()=>{if(st.busy)return;const left=await fill(n);
      if(n===cap){done();return;}tries++;E.flash(false);E.emote(CHR.gatekeeper,'shake');
      if(n<cap)toast(T('short',{n:cap-n}),T('shortD'),'bad');else toast(T('over',{n:left}),T('overD'),'bad');if(tries===1)E.floatBubble(CHR.rival,L(Lv.rival),2600);redraw();};
    const nodes=()=>{const sp=document.createElement('div');sp.className='stepper';const val=document.createElement('b');val.textContent=n;
      [['−10',-10],['−1',-1]].forEach(([t2,d])=>sp.appendChild(btn('',t2,()=>{n=Math.max(0,n+d);val.textContent=n;ob.textContent=T('orderBtn',{n});})));sp.appendChild(val);
      [['+1',1],['+10',10]].forEach(([t2,d])=>sp.appendChild(btn('',t2,()=>{n=Math.min(200,n+d);val.textContent=n;ob.textContent=T('orderBtn',{n});})));
      const ob=btn('next',T('orderBtn',{n}),order);return [sp,ob,E.skipBtn(async()=>{if(st.busy)return;skippedB=true;n=cap;await fill(cap);done();},T('skip'))];};
    show('gatekeeper',()=>T('orderQ',{l:B.L,w:B.W,h:B.H}),nodes);
  });
  st.cur=null;
  if(!skippedB){const p=tries?GM.scoring.hold_order_retry:GM.scoring.hold_order_first_try;st.score+=p;hud();cheer();toast(T('exact')+' +'+p,B.L+' × '+B.W+' × '+B.H+' = '+cap,'ok');await E.sleep(800);}
  readout(null);st.results.push({title:Lv.title,ok:!anySkip&&!skippedB});
}

/* ---------- level 5: design a cuboid stack ---------- */
const ghostGeo=new THREE.BoxGeometry(K.CW,CH,K.CD),ghostOk=new THREE.MeshBasicMaterial({color:0x5FD0A0,transparent:true,opacity:.35,depthWrite:false}),ghostBad=new THREE.MeshBasicMaterial({color:0xE0574A,transparent:true,opacity:.35,depthWrite:false});
const ghosts=[];
function stackDims(){const s=st.sel;if(!s)return null;const c0=Math.min(s.c0,s.c1),c1=Math.max(s.c0,s.c1),r0=Math.min(s.r0,s.r1),r1=Math.max(s.r0,s.r1);return {c0,c1,r0,r1,l:c1-c0+1,w:r1-r0+1,h:st.sh};}
function stackValid(d){const Lv=st.stackLv;if(!d)return false;for(let c=d.c0;c<=d.c1;c++)for(let r=d.r0;r<=d.r1;r++)if(Lv.blocked.includes(ref(c,r)))return false;return true;}
function stackPreview(){ghosts.forEach(m=>S.g.remove(m));ghosts.length=0;const d=stackDims();if(!d){st.redrawEq&&st.redrawEq();return;}const ok=stackValid(d)&&d.l*d.w*d.h===st.stackLv.total;
  for(let c=d.c0;c<=d.c1;c++)for(let r=d.r0;r<=d.r1;r++)for(let k=0;k<d.h;k++){const m=new THREE.Mesh(ghostGeo,stackValid(d)?ghostOk:ghostBad);m.position.copy(S.cellPos(c,r,k));S.g.add(m);ghosts.push(m);}
  if(st.redrawEq)st.redrawEq();}
const eqText=d=>d?(lang==='en'?'L ':'長 ')+d.l+(lang==='en'?' × W ':' × 闊 ')+d.w+(lang==='en'?' × H ':' × 高 ')+d.h+' = '+d.l*d.w*d.h:'';
async function stackLevel(Lv){
  clearYard();clearHold();if(S.ship){S.g.remove(S.ship.g);S.ship=null;}G.set(0,-(ROWS*CELL/2+1.4),TRAVEL);view('yard');st.stackLv=Lv;st.sh=2;st.sel=null;
  const reps=Lv.blocked.map(rf=>{const p=pr(rf),m=S.marker(0xE0574A,T('repair'));m.position.set(S.gx(p.c),0,S.gz(p.r));return m;});
  const found=[];let anySkip=false,tries=0;
  const placed=[];const clearPlaced=()=>{placed.forEach(m=>m.parent&&m.parent.remove(m));placed.length=0;};
  readout(()=>'<span>'+T('need',{t:Lv.total})+'</span>'+(stackDims()?'<b>'+eqText(stackDims())+'</b>':''));
  for(let round=0;round<2;round++){
    if(round===1){const go=await new Promise(r=>show('mentor',()=>T('second'),()=>[btn('next',T('secondYes'),()=>r(true)),btn('ghost',T('secondNo'),()=>r(false))]));if(!go)break;clearPlaced();st.sel=null;stackPreview();}
    let skipped=false;
    await new Promise(done=>{
      const eq=document.createElement('div');eq.className='eq';
      st.redrawEq=()=>{const d=stackDims();eq.textContent=d?eqText(d):T('dragBase');eq.className='eq'+(d?(stackValid(d)&&d.l*d.w*d.h===Lv.total?' ok':' bad'):'');readout(st.ro);};
      const submit=async()=>{if(st.busy)return;const d=stackDims();if(!d){toast(T('dragBase'),'','bad');return;}
        if(!stackValid(d)){tries++;toast(T('fail'),T('blocked'),'bad');E.emote(CHR.gatekeeper,'shake');return;}
        const n=d.l*d.w*d.h;if(n!==Lv.total){tries++;toast(T('fail'),T('notN',{n,t:Lv.total}),'bad');E.emote(CHR.rival,'hop');if(tries===1)E.floatBubble(CHR.rival,L(Lv.rival),2600);return;}
        const key=[Math.min(d.l,d.w),Math.max(d.l,d.w),d.h].join('x');if(found.includes(key)){toast(T('fail'),T('same'),'bad');return;}
        await build(d);found.push(key);done();};
      const build=async d=>{st.busy=true;st.pick=null;E.actions([]);ghosts.forEach(m=>S.g.remove(m));ghosts.length=0;
        await rigTo(G,(S.gx(d.c0)+S.gx(d.c1))/2,(S.gz(d.r0)+S.gz(d.r1))/2,TRAVEL,.5);
        for(let k=0;k<d.h;k++){const grp=new THREE.Group();S.g.add(grp);const ms=[];for(let c=d.c0;c<=d.c1;c++)for(let r=d.r0;r<=d.r1;r++){const m=K.container(colHex(PALK[(c*2+r+k)%PALK.length]));m.position.copy(S.cellPos(c,r,k));grp.add(m);ms.push(m);}
          await anim(.5,q=>grp.position.y=6*(1-ease(q)));ms.forEach(m=>{const p=m.getWorldPosition(V());S.g.add(m);m.position.copy(p);placed.push(m);});S.g.remove(grp);}
        st.busy=false;};
      const hs=document.createElement('div');hs.className='seg';
      for(let k=1;k<=Lv.max_h;k++){const b=btn('segb',T('layers')+' '+k,()=>{st.sh=k;hs.querySelectorAll('.segb').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stackPreview();});b.setAttribute('aria-pressed',String(st.sh===k));hs.appendChild(b);}
      st.pick='stack';
      show('mentor',round?()=>T('second'):Lv.brief,()=>{st.redrawEq();return [eq,hs,btn('next',T('stackBtn'),submit),btn('ghost',T('reset'),()=>{st.sel=null;stackPreview();}),E.skipBtn(async()=>{if(st.busy)return;skipped=true;
        const sols=[[0,3,0,2,2],[0,5,1,2,2],[0,3,1,2,3]];const sol=sols.find(s=>!found.includes([Math.min(s[1]-s[0]+1,s[3]-s[2]+1),Math.max(s[1]-s[0]+1,s[3]-s[2]+1),s[4]].join('x')));
        st.sel={c0:sol[0],c1:sol[1],r0:sol[2],r1:sol[3]};st.sh=sol[4];const d=stackDims();await build(d);found.push([Math.min(d.l,d.w),Math.max(d.l,d.w),d.h].join('x'));done();},T('skip'))];});
    });
    st.redrawEq=null;st.pick=null;
    if(skipped)anySkip=anySkip||round===0;else{const p=round?GM.scoring.stack_second:GM.scoring.stack_first;st.score+=p;hud();cheer();toast(T('stackOk',{eq:eqText(stackDims())})+' +'+p,'','ok');await E.sleep(900);}
  }
  st.cur=null;reps.forEach(m=>m.parent&&m.parent.remove(m));readout(null);st.results.push({title:Lv.title,ok:!anySkip});
}

/* ---------- check question ---------- */
async function check(Lv){if(!Lv.check)return;$('toast').hidden=true;const q=Lv.check,ord=E.shuffle(q.options.map((_,i)=>i)),opts=ord.map(i=>L(q.options[i])),ans=ord.indexOf(q.answer),dis=new Set();let w=0;
  for(;;){const i=await E.ask('gatekeeper',L(q.question),opts,dis,{skip:true});if(i===-1){await E.say('gatekeeper',T('ansIs',{a:opts[ans]})+L(q.explain));return;}
    if(i===ans){st.score+=Math.max(2,GM.scoring.check_first_try-w*GM.scoring.check_wrong_penalty);hud();E.emote(CHR.gatekeeper,'hop');await E.say('gatekeeper',T('correct')+L(q.explain));return;}
    w++;dis.add(i);E.emote(CHR.gatekeeper,'shake');}}

window.__craneApi={truckSolve,st,S,ref,pr};
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
    if(Lv.type!=='hold'){view('yard');await E.say('mentor',L(Lv.brief));E.emote(CHR.rival,'hop');await E.say('rival',L(Lv.rival));}
    if(Lv.type==='drive')await driveLevel(Lv);else if(Lv.type==='program')await programLevel(Lv);else if(Lv.type==='truck')await truckLevel(Lv);else if(Lv.type==='hold')await holdLevel(Lv);else await stackLevel(Lv);
    await check(Lv);}
  E.hideDialog();readout(null);const tier=GM.endings.find(e=>st.score>=e.min_score).id,EN=C.endings[tier];
  E.overlay('<div class="card"><p class="sub" style="margin:0">'+T('end')+'</p><h2>'+L(EN.title)+'</h2><p>'+L(EN.text)+'</p><div class="stats"><div><b>'+st.score+'</b>'+T('score')+'</div><div><b>'+st.results.filter(r=>r.ok).length+'/'+st.results.length+'</b>'+T('lvDone')+'</div><div><b>'+st.hints+'</b>'+T('hints')+'</div></div><ul class="review">'+
    st.results.map(r=>'<li><b>'+L(r.title)+'</b><p>'+(r.ok?T('lvOk'):T('skipped'))+'</p></li>').join('')+'</ul><p style="font-family:var(--serif)">'+L(C.npc_slots.mentor.display_name)+(lang==='en'?': ':'：')+L(C.debrief)+'</p><button class="primary" id="again">'+T('again')+'</button></div>',true);
  await E.waitClick('#again');location.reload();
}
main();
})();
