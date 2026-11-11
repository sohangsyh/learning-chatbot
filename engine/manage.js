/* Management mode (demand & supply shop sim) built on ENG */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent),W=JSON.parse($('d-world').textContent),GM=JSON.parse($('d-game').textContent);
const EC=C.economy,D=C.days;
const st={day:-1,cash:EC.start_cash,ledger:[],score:0,hints:0,price:EC.price_default,stock:EC.stock_default,unit:EC.unit_cost,yaw:0,drag:null,people:[],running:false,hint:null,comp:null,fx:[]};
window.__shop=st;
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.resp.allowPan=false;E.parallax=.08;
E.ENV.st_sunny={sky:0xA8D4EE,hs:0xF6F2E6,hg:0x707A70,hi:.72,sc:0xFFF0D4,si:.72,sp:[12,22,10]};
E.ENV.st_hot={sky:0xF2D8A0,hs:0xFFF0D0,hg:0x8A7A60,hi:.8,sc:0xFFD890,si:.95,sp:[6,26,8]};
E.ENV.st_rain={sky:0x8A949C,hs:0xC8CED2,hg:0x4A5058,hi:.75,sc:0xC8D0D8,si:.3,sp:[4,20,6]};
E.ENV.st_cloudy={sky:0xB4BCC2,hs:0xE0E2E2,hg:0x5E6460,hi:.78,sc:0xE8E8E8,si:.45,sp:[6,20,8]};
E.ENV.st_night={sky:0x1C2440,hs:0x8A9AC8,hg:0x2A2A34,hi:.55,sc:0xFFC890,si:.3,sp:[-4,8,10]};
const WX={sunny:'st_sunny',hot:'st_hot',rain:'st_rain',cloudy:'st_cloudy'};
E.setEnv('st_sunny',true);
E.SPK={narrator:{name:'你',col:'#F4EBD6'},news:{name:'今日新聞',col:'#F2C14E'}};
Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);const LP={street:V(...W.locations.street),market:V(...W.locations.market)};

/* ---------- sets ---------- */
const S={};
(function(){
  const r=E.rng(8);const g=E.scene;
  mesh(new THREE.PlaneGeometry(260,120),M(0x8A9A7A),20,0,0,g).rotation.x=-Math.PI/2;
  const road=mesh(new THREE.PlaneGeometry(W.street.length+30,5.2),M(0x4A4E54),0,.01,1.5,g);road.rotation.x=-Math.PI/2;
  for(let x=-34;x<34;x+=3)box(1.4,.01,.15,0xE8E4D8,x,.02,1.5,g);
  [-1.6,4.8].forEach(z=>{const sw=mesh(new THREE.PlaneGeometry(W.street.length+30,2.4),M(0xB8B0A0),0,.03,z,g);sw.rotation.x=-Math.PI/2;});
  const bcol=[0xE6D6B4,0xD8C8A8,0xC8D4D8,0xE8C8B8,0xD0D8C0];
  for(let i=0;i<14;i++){const x=-30+i*4.6;[[-6.2,0],[9.5,Math.PI]].forEach(([z,ry],k)=>{if(Math.abs(x)<3.2&&k===0)return;if(k===0&&Math.abs(x-W.street.competitor[0])<3.4)return;if(k===1&&Math.abs(x)<13.5)return;const h=7+r()*7;const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=ry;g.add(b);box(4.4,h,4,bcol[(i+k)%5],0,h/2,0,b);
      for(let f=1;f<h/2.2;f++)for(let w=-1;w<=1;w++)box(.8,.9,.06,0x6A8AA8,w*1.3,f*2.2+.4,2.02,b);box(4.4,.8,.3,[0xC8452F,0x2E7D62,0x3A6FB0][i%3],0,2.6,2.1,b);});}
  // our shop
  const sh=new THREE.Group();sh.position.set(...W.street.shop);g.add(sh);
  box(5.6,3.6,3,0xF0E4C8,0,1.8,-1.2,sh);box(5.6,.3,.4,0xC8452F,0,3.5,.5,sh);
  for(let i=0;i<7;i++){const a=box(.8,.08,1.6,i%2?0xFFFFFF:0xE0574A,-2.4+i*.8,3.1,1.1,sh);a.rotation.x=-.35;}
  box(4.6,1.05,.9,0x8A5A2B,0,.52,.9,sh);box(4.8,.08,1,0xE8E4DC,0,1.07,.9,sh);
  box(2.6,.6,.08,0x2E7D62,0,3.95,.55,sh);box(2.2,.35,.02,0xF2C14E,0,3.95,.6,sh);
  for(let i=0;i<5;i++){mesh(new THREE.CylinderGeometry(.09,.07,.24,10),new THREE.MeshPhongMaterial({color:0xF2C850,transparent:true,opacity:.8}),-1.6+i*.35,1.23,.75,sh);}
  for(let i=0;i<6;i++)mesh(new THREE.SphereGeometry(.12,10,8),M(0xF2D24A),1.2+(i%3)*.24,1.2,.7+Math.floor(i/3)*.22,sh);
  S.crates=new THREE.Group();sh.add(S.crates);S.shop=sh;
  // competitor
  const cp=new THREE.Group();cp.position.set(...W.street.competitor);g.add(cp);
  box(4.6,3.4,2.6,0xD8E4F0,0,1.7,-1,cp);box(4,1,.8,0x3A6FB0,0,.5,.8,cp);box(4.2,.08,.9,0xE8E4DC,0,1.02,.8,cp);
  for(let i=0;i<6;i++){const a=box(.75,.08,1.4,i%2?0xFFFFFF:0x3A6FB0,-2.1+i*.75,3,1,cp);a.rotation.x=-.35;}box(2.4,.6,.08,0x3A6FB0,0,3.85,.5,cp);
  cp.scale.setScalar(.001);cp.visible=false;S.comp=cp;
  // market
  const mk=new THREE.Group();mk.position.copy(LP.market);g.add(mk);box(16,.2,10,0xA89A80,0,.1,-2,mk);
  [[-4.5,-3],[0,-3.4],[4.5,-3]].forEach(([x,z],k)=>{const s=new THREE.Group();s.position.set(x,0,z);mk.add(s);box(3.6,.9,1.6,0x7A5236,0,.45,0,s);
    [-1.3,1.3].forEach(px=>box(.1,2.8,.1,0x5A3A22,px,1.4,.75,s));const rf=box(3.9,.1,2,[0xC8452F,0x2E7D62,0x3A6FB0][k],0,2.8,.2,s);rf.rotation.x=-.18;
    for(let c=0;c<3;c++){box(1,.45,.7,0xB98A4A,-1.1+c*1.1,1.12,0,s);for(let q=0;q<4;q++)mesh(new THREE.SphereGeometry(.13,8,6),M(k===0?0xF2D24A:k===1?0x7A4A22:0xF4F4EF),-1.35+c*1.1+(q%2)*.4,1.42,-.15+Math.floor(q/2)*.3,s);}});
  S.cart=new THREE.Group();S.cart.position.set(LP.market.x,0,1.6);g.add(S.cart);box(1.6,.5,1,0x8A5A2B,0,.5,0,S.cart);[-0.6,0.6].forEach(x=>mesh(new THREE.CylinderGeometry(.25,.25,.1,12),M(0x2A2A2A),x,.25,.55,S.cart).rotation.x=Math.PI/2);
  // rain
  const rg=new THREE.BufferGeometry(),rp=[];for(let i=0;i<900;i++)rp.push(-25+Math.random()*50,Math.random()*14,-8+Math.random()*20);rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));
  S.rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0xC8D8E8,size:.12,transparent:true,opacity:.7}));S.rain.visible=false;g.add(S.rain);
})();
function setCrates(n){S.crates.clear();const k=Math.ceil(n/10);for(let i=0;i<k;i++){const b=box(.55,.4,.45,0xB98A4A,-2.2+(i%6)*.6,.2+Math.floor(i/6)*.42,-.3,S.crates);box(.56,.06,.46,0xF2D24A,b.position.x,b.position.y+.22,-.3,S.crates);}}
const priceTag=document.createElement('div');priceTag.className='ptag';$('spots').appendChild(priceTag);const ptA={el:priceTag,pos:V(0,4.6,-3.2)};
const compTag=document.createElement('div');compTag.className='ptag comp';$('spots').appendChild(compTag);const ctA={el:compTag,pos:V(W.street.competitor[0],4.4,W.street.competitor[2]+.6)};compTag.hidden=true;priceTag.hidden=true;
E.anchors.push(ptA,ctA);

/* characters */
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));
const CH=E.chars;E.lampValue=()=>Math.max(0,Math.min(1,.4+(st.cash-EC.start_cash)/800));
function place(loc,instant){const lay=W.npc_layout[loc];Object.values(CH).forEach(c=>{const l=lay[c.slot];const t=LP[loc].clone().add(V(...l));c.target.copy(t);if(instant)c.root.position.copy(t);else c.speed=Math.max(3,c.root.position.distanceTo(t)/2.5);});}

/* people */
const SKIN=[0xF2D2B0,0xE0B890,0xC89870],SHIRT=[0x3A6FB0,0xE0574A,0x2E9B5E,0xF2C14E,0x8A5AC8,0xF4F4EF,0x2A2D30];
function person(r){const g=new THREE.Group();const c=SHIRT[Math.floor(r()*SHIRT.length)];
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.11,.62,0);g.add(p);box(.13,.6,.14,0x2A3A5A,0,-.3,0,p);return p;});
  mesh(new THREE.CylinderGeometry(.22,.24,.7,10),M(c),0,.98,0,g);mesh(new THREE.SphereGeometry(.19,12,10),M(SKIN[Math.floor(r()*3)]),0,1.52,0,g);
  mesh(new THREE.SphereGeometry(.2,12,8,0,Math.PI*2,0,Math.PI/2),M(0x2A2420),0,1.56,0,g);g.userData.legs=legs;E.scene.add(g);return g;}
function cupIn(g){const c=mesh(new THREE.CylinderGeometry(.07,.05,.2,10),new THREE.MeshPhongMaterial({color:0xF2C850,transparent:true,opacity:.85}),.28,1,.12,g);return c;}

/* camera */
function view(loc){const p=LP[loc];if(loc==='night')return {look:V(0,1.5,-3),off:E.portrait?V(0,3.2,11):V(0,2.6,7.5)};
  if(E.portrait)return {look:p.clone().add(V(0,1,loc==='market'?-1:0)),off:V(0,9,22)};return {look:p.clone().add(V(0,1.2,loc==='market'?-1.5:-.5)),off:V(0,5.6,14)};}
let vw=null;E.cam.idle=t=>{if(!vw){const a=t*.05;E.camera.position.set(Math.sin(a)*24,17,Math.cos(a)*24);E.cam.look.set(0,1.5,0);return;}E.camera.position.copy(vw.look).add(vw.off.clone().applyAxisAngle(V(0,1,0),st.yaw));E.cam.look.copy(vw.look);};
async function goTo(loc,dur){const v=view(loc);vw=null;if(loc!=='night')place(loc==='night'?'street':loc,false);await E.camTo(v.look.clone().add(v.off),v.look,dur==null?2.6:dur);st.yaw=0;vw=v;}
E.canvas.addEventListener('pointerdown',e=>{if(!vw)return;st.drag={x:e.clientX,y0:st.yaw};E.canvas.setPointerCapture(e.pointerId);});
E.canvas.addEventListener('pointermove',e=>{if(!st.drag)return;const lim=.5;st.yaw=Math.max(-lim,Math.min(lim,st.drag.y0-(e.clientX-st.drag.x)*.005));});
['pointerup','pointercancel'].forEach(k=>E.canvas.addEventListener(k,()=>st.drag=null));

/* frame: pedestrian state machine */
const QUEUE=V(0,0,-1.25),COUNTER=V(0,0,-2.35);
function onFrame(dtR,t){const dt=dtR*(window.__simSpeed||1);
  if(S.rain.visible){const pa=S.rain.geometry.attributes.position;for(let i=0;i<pa.count;i++){let y=pa.getY(i)-dt*14;if(y<0)y=14;pa.setY(i,y);}pa.needsUpdate=true;}
  if(S.comp.visible&&S.comp.scale.x<1){S.comp.scale.setScalar(Math.min(1,S.comp.scale.x+dtR*.8));}
  for(let i=st.people.length-1;i>=0;i--){const p=st.people[i],g=p.g;
    if(p.wait>0){p.wait-=dt;if(p.wait<=0&&p.after)p.after();continue;}
    const d=p.to.clone().sub(g.position);d.y=0;const L=d.length();
    if(L>.05){const sp=p.speed*dt;g.position.addScaledVector(d.normalize(),Math.min(L,sp));g.rotation.y=Math.atan2(d.x,d.z);p.ph+=dt*10;g.userData.legs[0].rotation.x=Math.sin(p.ph)*.6;g.userData.legs[1].rotation.x=-Math.sin(p.ph)*.6;}
    else{g.userData.legs.forEach(l=>l.rotation.x=0);if(p.arrive){const f=p.arrive;p.arrive=null;f();}}
    if(p.gone){E.scene.remove(g);st.people.splice(i,1);}}
  if(st.running){st.spawnT-=dt;while(st.spawnT<=0&&st.queue.length){spawn(st.queue.shift());st.spawnT+=st.gap;}
    if(!st.queue.length&&!st.people.length){st.running=false;st.dayDone&&st.dayDone();}}
  if(st.focus)Object.values(CH).forEach(c=>c.lookAt=st.focus.position);
}
function spawn(c){const fromLeft=c.side;const g=person(c.r);const z=c.z;g.position.set(fromLeft?-26:26,0,z);const p={g,to:V(fromLeft?26:-26,0,z),speed:2.6+c.r()*1,ph:0,wait:0};
  st.people.push(p);const P=st.price;
  if(c.wantUs){p.to=V(-.4+c.r()*.8,0,QUEUE.z);p.arrive=()=>{st.focus=g;p.to=COUNTER.clone();p.arrive=()=>{if(st.reserved<st.stock){st.reserved++;p.wait=.5;p.after=()=>{st.sold++;liveHud();cupIn(g);if(st.sold%4===1)E.floatBubble({root:g},['好凍好正！','多謝！','解渴！'][st.sold%3],1400);E.emote(CH.companion,'hop');p.to=V(fromLeft?26:-26,0,z);p.arrive=()=>p.gone=true;};}
        else{st.lost++;liveHud();E.floatBubble({root:g},'賣晒？唉……',1400);p.to=V(fromLeft?26:-26,0,z);p.arrive=()=>p.gone=true;}};};}
  else if(c.wantComp){p.to=V(W.street.competitor[0]+c.r()*.8-.4,0,QUEUE.z-.6);p.arrive=()=>{p.wait=.4;p.after=()=>{st.toComp++;liveHud();cupIn(g);if(st.toComp%4===1)E.floatBubble({root:g},'隔壁平啲！',1400);p.to=V(fromLeft?26:-26,0,z);p.arrive=()=>p.gone=true;};};}
  else{if(c.pricey&&c.r()<.25)setTimeout(()=>E.floatBubble({root:g},'太貴喇……',1200),600);p.arrive=()=>p.gone=true;}
}

/* hud */
function money(n){return (n<0?'−$':'$')+Math.abs(Math.round(n));}
function hud(){$('cash').textContent=money(st.cash);$('dayNo').textContent=st.day>=0?'第 '+(st.day+1)+' / '+D.length+' 天':'';}
function liveHud(){$('live').innerHTML='<span>售出<b>'+st.sold+'</b></span><span>存貨<b>'+Math.max(0,st.stock-st.sold)+'</b></span><span>賣晒走失<b>'+st.lost+'</b></span>'+(st.comp?'<span>去了隔壁<b>'+st.toComp+'</b></span>':'');}
let toastT=null;function toast(title,text,cls){const el=$('toast');el.className=cls||'';const dg=$('dialog');el.style.bottom=dg.hidden?'14px':Math.min(innerHeight-120,dg.offsetHeight+24)+'px';$('toastT').textContent=title;$('toastD').textContent=text||'';el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,4000);}
$('assist').addEventListener('click',()=>{if(!st.hint)return;st.hints++;st.score=Math.max(0,st.score-GM.scoring.hint_penalty);E.bubble('梁老闆的提示（扣 '+GM.scoring.hint_penalty+' 分）',st.hint,7000);});
$('ledger').addEventListener('click',async()=>{if($('overlay').innerHTML)return;E.overlay(ledgerHTML(false),true);drawScatter($('scat'));await E.waitClick('#lgc');E.clearOverlay();});
function ledgerHTML(final){const rows=st.ledger.map(l=>'<tr><td>'+l.day+'</td><td>'+l.label+'</td><td>'+l.stock+'</td><td>$'+l.price+'</td><td>'+l.sold+'</td><td>'+money(l.rev)+'</td><td>'+money(l.cost)+'</td><td class="'+(l.profit>=0?'hit':'miss')+'">'+money(l.profit)+'</td></tr>').join('');
  return '<div class="card"><p class="sub" style="margin:0">'+(final?'八天結算':'帳簿')+'</p><h2>'+(final||'經營紀錄')+'</h2>'+(rows?'<div class="tw"><table class="dt"><tr><th>天</th><th>天氣</th><th>入貨</th><th>售價</th><th>售出</th><th>收入</th><th>成本</th><th>利潤</th></tr>'+rows+'</table></div><p class="sub" style="margin:10px 0 4px">價格與銷量（數字代表第幾天）</p><canvas id="scat" width="520" height="240"></canvas>':'<p class="sub">還沒有紀錄。</p>')+(final?'':'<button class="primary" id="lgc">收起</button></div>');}
function drawScatter(cv){if(!cv)return;const x=cv.getContext('2d'),w=cv.width,h=cv.height,pd=36;x.clearRect(0,0,w,h);x.fillStyle='#fff';x.fillRect(0,0,w,h);
  const maxS=Math.max(20,...st.ledger.map(l=>l.sold+l.lost));x.strokeStyle='#C9BC9A';x.lineWidth=1;x.beginPath();x.moveTo(pd,10);x.lineTo(pd,h-pd);x.lineTo(w-10,h-pd);x.stroke();
  x.fillStyle='#6F6450';x.font='12px sans-serif';x.fillText('售價',4,16);x.fillText('銷量（杯）',w-80,h-8);
  for(let p=EC.price_min;p<=EC.price_max;p+=2){const yy=h-pd-(p-EC.price_min)/(EC.price_max-EC.price_min)*(h-pd-14);x.fillText('$'+p,6,yy+4);}
  for(let s=0;s<=maxS;s+=Math.ceil(maxS/5/10)*10){const xx=pd+s/maxS*(w-pd-20);x.fillText(s,xx-6,h-pd+16);}
  st.ledger.forEach(l=>{const xx=pd+l.sold/maxS*(w-pd-20),yy=h-pd-(l.price-EC.price_min)/(EC.price_max-EC.price_min)*(h-pd-14);
    x.fillStyle={sunny:'#E0B04B',hot:'#D2553F',rain:'#4E6FC4',cloudy:'#8A8A8A'}[l.weather]||'#333';x.beginPath();x.arc(xx,yy,9,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.font='bold 11px sans-serif';x.fillText(l.day,xx-3.5,yy+4);});}
function drawBars(cv,l){const x=cv.getContext('2d'),w=cv.width,h=cv.height;x.fillStyle='#16202A';x.fillRect(0,0,w,h);const vals=[['收入',l.rev,'#5FB49C'],['成本',l.cost,'#D2553F'],['利潤',l.profit,l.profit>=0?'#E0B04B':'#F08A74']];
  const mx=Math.max(50,...vals.map(v=>Math.abs(v[1])));const base=h*.62;x.strokeStyle='#5A6470';x.beginPath();x.moveTo(20,base);x.lineTo(w-20,base);x.stroke();
  vals.forEach((v,i)=>{const bw=(w-80)/3,bx=40+i*(bw+10),bh=v[1]/mx*(h*.5);x.fillStyle=v[2];x.fillRect(bx,base-Math.max(0,bh),bw-10,Math.abs(bh));x.fillStyle='#F4EBD6';x.font='13px sans-serif';x.fillText(v[0],bx,h-10);x.font='bold 15px sans-serif';x.fillText(money(v[1]),bx,bh>=0?base-bh-6:base-bh+16);});}

/* ui pieces */
function slider(label,min,max,step,val,fmt,onIn){const d=document.createElement('div');d.className='sl';d.innerHTML='<div class="slh"><span>'+label+'</span><b></b></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" aria-label="'+label+'">';
  const inp=d.querySelector('input'),b=d.querySelector('b');const up=()=>{b.textContent=fmt(+inp.value);onIn&&onIn(+inp.value);};inp.addEventListener('input',up);up();d.input=inp;return d;}
async function ask(q,first){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});
  if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}if(i===q.answer)break;w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}
  st.score+=Math.max(2,GM.scoring.check_first_try-w*GM.scoring.check_wrong_penalty);E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','對。'+q.explain);}

/* ---------- a day ---------- */
async function day(i){
  const d=D[i];st.day=i;hud();st.unit=d.unit_cost||EC.unit_cost;st.comp=d.competitor||null;
  E.overlay('<div class="chapcard"><small>第 '+(i+1)+' 天</small><h2>'+d.label+'</h2><p>'+d.event+'</p></div>',true);await Promise.race([E.sleep(E.RM?800:2000),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
  E.setEnv(WX[d.weather]);S.rain.visible=d.weather==='rain';priceTag.hidden=true;
  if(st.comp&&!S.comp.visible){S.comp.visible=true;compTag.hidden=false;compTag.textContent='隔壁 $'+st.comp;}
  // market: stock
  await goTo('market');await E.say('mentor',d.brief);E.emote(CH.rival,'hop');await E.say('rival',d.rival);
  st.hint=['大約有 '+d.passers+' 人會路過。不是每個人都會買：價錢越高，買的人越少。','凍檸茶賣不完要倒掉，入貨太多會白白浪費成本。',d.weather==='hot'?'天熱，想買的人會比平日多。':d.weather==='rain'||d.weather==='cloudy'?'天氣差，人少，想買的人也少。':'平日大約一半路人會在 $8 左右買一杯。'].join('');
  const maxAff=Math.max(0,Math.min(EC.stock_max,Math.floor(st.cash/st.unit/EC.stock_step)*EC.stock_step));
  st.stock=Math.min(st.stock,maxAff);
  await new Promise(async res=>{const info=document.createElement('p');info.className='status';let go=null;
    const s=slider('入貨（杯）',0,EC.stock_max,EC.stock_step,st.stock,v=>v+' 杯',v=>{const cost=v*st.unit;info.innerHTML='每杯成本 $'+st.unit+'，入貨成本 <b>'+money(cost)+'</b>　|　現金 '+money(st.cash)+(cost>st.cash?'　<span class="warn">現金不足</span>':'');if(go)go.disabled=cost>st.cash;});
    go=E.btn('next','確定入貨',()=>{st.stock=+s.input.value;res();});s.input.dispatchEvent(new Event('input'));
    E.actions([]);await E.showLine('narrator','今天入多少杯的材料？');E.actions([s,info,go]);});
  st.cash-=st.stock*st.unit;hud();setCrates(st.stock);toast('入貨完成',st.stock+' 杯，支出 '+money(st.stock*st.unit),'');
  await E.sleep(400);
  // street: price
  await goTo('street');priceTag.hidden=false;
  await new Promise(async res=>{const s=slider('售價（每杯）',EC.price_min,EC.price_max,1,st.price,v=>'$'+v,v=>{priceTag.textContent='凍檸茶 $'+v;});
    const go=E.btn('next','開門營業',()=>{st.price=+s.input.value;res();});E.actions([]);await E.showLine('companion','今天賣多少錢一杯？'+(st.comp?'隔壁賣 $'+st.comp+'。':''));E.actions([s,go]);});
  // simulate
  E.hideDialog();const rr=E.rng(1000+i*17);st.sold=0;st.reserved=0;st.lost=0;st.toComp=0;$('live').hidden=false;liveHud();
  const P=st.price;st.queue=[];for(let k=0;k<d.passers;k++){const res=EC.reservation_low+rr()*(EC.reservation_high-EC.reservation_low)+d.shift;const want=res>=P;let wantUs=want,wantComp=false;
    if(st.comp){const compOk=res>=st.comp;if(compOk&&P>st.comp){const stay=Math.max(0,.35-(P-st.comp)*.12);if(rr()>stay){wantUs=false;wantComp=true;}}}
    st.queue.push({r:rr,side:rr()<.5,z:-.3+rr()*3.6,wantUs,wantComp,pricey:!want});}
  st.gap=(GM.day_sim_seconds)/d.passers;st.spawnT=0;st.running=true;
  await new Promise(r=>st.dayDone=r);st.focus=null;Object.values(CH).forEach(c=>c.lookAt=null);$('live').hidden=true;
  // evening
  const rev=st.sold*P,cost=st.stock*st.unit+EC.rent,profit=rev-cost;st.cash+=rev-EC.rent;
  st.ledger.push({day:i+1,label:d.label,weather:d.weather,stock:st.stock,price:P,sold:st.sold,lost:st.lost,toComp:st.toComp,rev,cost,profit,waste:Math.max(0,st.stock-st.sold)});hud();
  E.setEnv('st_night');S.rain.visible=false;await goTo('night',1.6);
  await new Promise(async res=>{const cv=document.createElement('canvas');cv.width=520;cv.height=200;cv.className='bars';drawBars(cv,st.ledger[st.ledger.length-1]);
    const p=document.createElement('p');p.className='status';p.innerHTML='售出 <b>'+st.sold+'</b> 杯 × $'+P+' = 收入 '+money(rev)+'　|　入貨 '+st.stock+' 杯 × $'+st.unit+' + 租金 $'+EC.rent+' = 成本 '+money(cost)+(st.stock>st.sold?'　|　倒掉 '+(st.stock-st.sold)+' 杯':'')+(st.lost?'　|　賣晒後走失 '+st.lost+' 位顧客':'')+(st.toComp?'　|　'+st.toComp+' 位去了隔壁':'');
    E.actions([]);await E.showLine('companion','今天收工！'+(profit>=0?'賺了 '+money(profit)+'。':'蝕了 '+money(-profit)+'。'));E.actions([cv,p,E.btn('next','繼續',res)]);});
  if(profit<0)E.emote(CH.rival,'slump');else E.emote(CH.companion,'hop');
  await E.say('mentor',d.lesson);if(d.check)await ask(d.check);
}

/* main */
async function main(){
  E.start();place('street',true);hud();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開店</button></div></div>',true);
  $('go').focus();await E.waitClick('#go');
  E.overlay('<div class="card"><h2>小店的人</h2><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+
    '</div><p class="sub">你有 $'+EC.start_cash+' 本錢，經營八天。每天早上到批發市場入貨，再決定售價，然後看顧客會不會買。凍檸茶不能留到明天，每天租金 $'+EC.rent+'。</p><button class="primary" id="go">出發入貨</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;
  for(let i=Math.max(0,(window.__startDay||1)-1);i<D.length;i++)await day(i);
  await ask(C.final_check);E.hideDialog();
  const total=st.cash-EC.start_cash,tier=GM.endings.find(e=>total>=e.min_profit).id,EN=C.endings[tier];E.flash(total>=0);Object.values(CH).forEach(c=>E.emote(c,'hop'));await E.sleep(600);
  E.overlay(ledgerHTML(EN.title)+'<div class="stats"><div><b>'+money(total)+'</b>八天總利潤</div><div><b>'+money(st.cash)+'</b>最後現金</div><div><b>'+st.score+'</b>概念分</div></div><p>'+EN.text+'</p><p style="font-family:var(--serif)">梁老闆：'+C.debrief+'</p><button class="primary" id="again">再開一次店</button></div>',true);
  drawScatter($('scat'));await E.waitClick('#again');location.reload();
}
main();
})();
