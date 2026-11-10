/* AI 初創公司: run an AI start-up for six months; each client project has a different bottleneck */
(function(){
"use strict";
const E=ENG,$=E.$,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const C=JSON.parse($('d-content').textContent);
/* AI start-up business model: pure functions, shared by the game and the tests */
const SIM={
 start:{cash:400000,labellers:1,gpus:0,rep:50},
 cost:{labeller:15000,gpu:120000,gpuPower:6000,cloud100:30000,sample1000:4000,condition:6000,expert:12000,anonymise:20000},
 labelPerPerson:3000,deposit:.3,gpuHours:100,chance:.33,
 algs:{rule:{name:'簡單規則',cap:.6,need:200,hours:0,phone:true},tree:{name:'決策樹',cap:.82,need:2000,hours:10,phone:true},
       small:{name:'小型神經網絡',cap:.92,need:6000,hours:60,phone:true},large:{name:'大型神經網絡',cap:.985,need:20000,hours:500,phone:false}},
 projects:[
  {id:'recycle',name:'回收站分類 AI',client:'環保署合作伙伴',offer:1,deadline:2,target:.85,conds:['日間','夜間'],deploy:'server',pay:160000,expert:false},
  {id:'minibus',name:'小巴路線 App',client:'交通 App 公司',offer:2,deadline:4,target:.85,conds:['晴天','雨天'],deploy:'phone',pay:200000,expert:false},
  {id:'voice',name:'粵語語音助手',client:'電訊公司',offer:3,deadline:6,target:.88,conds:['男聲','女聲','長者'],deploy:'server',pay:420000,expert:false,lateCond:'長者',lateMonth:5},
  {id:'medical',name:'醫學影像初篩',client:'醫院研究組',offer:4,deadline:6,target:.93,conds:['甲醫院機器','乙醫院機器'],deploy:'server',pay:320000,expert:true,privacy:true}]};
function newProject(P){return {id:P.id,accepted:false,alg:'rule',data:{},backlog:{},quality:.85,expertDone:false,anonymised:false,hours:0,delivered:null};}
function projAcc(P,s){const A=SIM.algs[s.alg],ch=SIM.chance;const conds=P.conds.filter(c=>!(P.lateCond===c&&s._month<P.lateMonth&&!s._final));
  const tot=Object.values(s.data).reduce((a,b)=>a+b,0);const need=A.hours*Math.max(.5,Math.min(2,tot/A.need));const p=need>0?Math.min(1,s.hours/need):1;
  const q=P.expert?(s.expertDone?.985:.85):(s.expertDone?.98:s.quality);const sens=P.expert?1.6:.3;
  const by={};conds.forEach(c=>{const nc=(s.data[c]||0)+.15*(tot-(s.data[c]||0));const learn=1-Math.exp(-3*nc*conds.length/A.need);
    by[c]=Math.max(ch,ch+(A.cap-ch)*learn*Math.pow(p,.7)-(1-q)*sens);});
  const vals=Object.values(by);const ok=P.deploy==='phone'&&!A.phone?false:true;
  return {by,min:vals.length?Math.min(...vals):ch,progress:p,hoursNeeded:need,deployOk:ok,privacyOk:!P.privacy||s.anonymised};}

const st={month:0,cash:SIM.start.cash,labellers:SIM.start.labellers,gpus:SIM.start.gpus,rep:SIM.start.rep,proj:{},score:0,log:[],plan:null};window.__co=st;
SIM.projects.forEach(P=>{st.proj[P.id]=newProject(P);});const PB=Object.fromEntries(SIM.projects.map(P=>[P.id,P]));
E.init({canvas:$('scene'),onResize:()=>{},onFrame});E.bindDialog();E.resp.allowPan=false;
{['acc','score'].forEach(id=>{const el=$(id);if(el){const bx=el.closest('div');if(bx&&bx!==$('hud'))bx.hidden=true;}});const nb=$('notebook');if(nb)nb.hidden=true;}
E.SPK={narrator:{name:'你',col:'#F4EBD6'}};Object.entries(C.npc_slots).forEach(([s,d])=>E.SPK[s]={name:d.display_name,col:E.hex(E.PAL[d.character_id][0])});
const M=(h,o)=>E.M(h,o),mesh=(...a)=>E.mesh(...a),box=(...a)=>E.box(...a);
const money=v=>(v<0?'−':'')+'$'+Math.abs(Math.round(v/1000))+'k',pct=v=>Math.round(v*100)+'%';

/* ---------- office scene ---------- */
E.kits.world.build({stages:[{template:'city_street',style:'china'}]},[V(0,0,-26)]);
E.ENV.office={sky:0xBFD8F0,hs:0xFFFFFF,hg:0x9A9EA6,hi:.9,sc:0xFFFFFF,si:.55,sp:[4,14,10]};
const OF=new THREE.Group();E.scene.add(OF);const people=[],racks=[];
(function(){const fl=mesh(new THREE.PlaneGeometry(22,14),M(0xD8DCE2),0,.02,0,OF);fl.rotation.x=-Math.PI/2;fl.userData.noFade=true;
  box(22,.3,14,0xC8CCD2,0,-.13,0,OF);const glass=new THREE.MeshPhongMaterial({color:0xBFE6FF,transparent:true,opacity:.18});
  const back=new THREE.Mesh(new THREE.BoxGeometry(22,4,.1),glass);back.position.set(0,2,-7);OF.add(back);box(22,.2,.2,0x6A6E74,0,4,-7,OF);for(let x=-10;x<=10;x+=2.5)box(.12,4,.12,0x6A6E74,x,2,-7,OF);
  const sg=document.createElement('canvas');sg.width=512;sg.height=128;const c=sg.getContext('2d');c.fillStyle='#1B2A4A';c.fillRect(0,0,512,128);c.fillStyle='#FFD23F';c.font='bold 54px "Noto Sans TC",sans-serif';c.fillText(C.meta.company,24,84);
  const t=new THREE.CanvasTexture(sg);const p=new THREE.Mesh(new THREE.PlaneGeometry(5,1.25),new THREE.MeshBasicMaterial({map:t}));p.position.set(-5.5,3.2,-6.9);OF.add(p);
  const scr=document.createElement('canvas');scr.width=512;scr.height=256;st.scr=scr;st.scrT=new THREE.CanvasTexture(scr);box(5.2,2.8,.12,0x1A1A1A,4.6,2.2,-6.85,OF);const sp=new THREE.Mesh(new THREE.PlaneGeometry(5,2.6),new THREE.MeshBasicMaterial({map:st.scrT}));sp.position.set(4.6,2.2,-6.78);OF.add(sp);
  for(let i=0;i<8;i++){const x=-8+(i%4)*3.2,z=-3+Math.floor(i/4)*2.6;box(2.2,.08,1,0xB89A6A,x,.76,z,OF);box(.06,.76,.06,0x6A6E74,x-1,.38,z,OF);box(.06,.76,.06,0x6A6E74,x+1,.38,z,OF);box(.7,.45,.04,0x1A1A1A,x,1.05,z-.3,OF);}
  const sr=box(6,.04,4,0x3A3E46,6.8,.04,1.8,OF);sr.userData.noFade=true;})();
function person(i){const x=-8+(i%4)*3.2,z=-3+Math.floor(i/4)*2.6+.7;const g=new THREE.Group();g.position.set(x,0,z);OF.add(g);
  mesh(new THREE.CylinderGeometry(.22,.26,.7,10),M([0x4A6A8A,0x8A4A5A,0x4A8A6A,0x8A7A4A][i%4]),0,.75,0,g);mesh(new THREE.SphereGeometry(.17,12,10),M(0xF0CDA8),0,1.28,0,g);mesh(new THREE.SphereGeometry(.175,12,8,0,Math.PI*2,0,Math.PI/2),M(0x2A2018),0,1.32,0,g);
  g.scale.setScalar(.01);people.push(g);}
function rack(i){const g=new THREE.Group();g.position.set(4.6+i*1.2,0,.6);OF.add(g);box(.9,2.2,.9,0x2A2E36,0,1.1,0,g);const leds=[];for(let j=0;j<6;j++){const l=box(.5,.05,.02,0x3ACB5A,0,.4+j*.3,.46,g);l.material=new THREE.MeshBasicMaterial({color:0x3ACB5A});leds.push(l);}g.userData.leds=leds;g.scale.setScalar(.01);racks.push(g);}
function syncOffice(){while(people.length<st.labellers&&people.length<8)person(people.length);while(racks.length<st.gpus&&racks.length<5)rack(racks.length);}
syncOffice();
Object.entries(C.npc_slots).forEach(([s,d])=>E.makeChar(s,d.character_id,d.costume));const CH=E.chars;
Object.values(CH).forEach(c=>{const l=C.layout[c.slot];if(!l)return;c.target.set(...l);c.root.position.set(...l);});
const VIEW=[V(0,6.6,12.5),V(0,1.2,-1.6)];E.cam.idle=()=>{E.camera.position.lerp(VIEW[0],.08);E.cam.look.lerp(VIEW[1],.1);};E.camera.position.copy(VIEW[0]);E.cam.look.copy(VIEW[1]);E.setEnv('office',true);
let busy=0;function onFrame(dt,t){if(E.kits.world.onFrame)E.kits.world.onFrame(dt,t);people.forEach((g,i)=>{if(g.scale.x<1)g.scale.setScalar(Math.min(1,g.scale.x+dt*2));g.rotation.y=Math.sin(t*(busy?6:1)+i)*.08;});
  racks.forEach((g,i)=>{if(g.scale.x<1)g.scale.setScalar(Math.min(1,g.scale.x+dt*2));g.userData.leds.forEach((l,j)=>l.material.color.setHex(Math.sin(t*(busy?12:2)+j*1.3+i)>0?0x3ACB5A:0x1A4A2A));});}
function screen(){const c=st.scr.getContext('2d');c.fillStyle='#0E1A24';c.fillRect(0,0,512,256);c.fillStyle='#7AE8FF';c.font='bold 30px "Noto Sans TC",sans-serif';c.fillText('第 '+st.month+' 個月　現金 '+money(st.cash),20,42);
  let y=86;SIM.projects.forEach(P=>{const s=st.proj[P.id];if(!s.accepted)return;const r=projAcc(P,s);c.fillStyle='#F4F4F0';c.font='22px "Noto Sans TC",sans-serif';c.fillText(P.name,20,y);c.fillStyle='#2A3A4A';c.fillRect(220,y-18,270,20);
    c.fillStyle=s.delivered==='pass'?'#3ACB5A':s.delivered==='fail'?'#D8322A':r.min>=P.target?'#3ACB5A':'#E8A01A';c.fillRect(220,y-18,270*r.min,20);c.fillStyle='#FFE08A';c.fillRect(220+270*P.target,y-22,3,28);y+=40;});st.scrT.needsUpdate=true;}
function hudSync(){$('cash').textContent=money(st.cash);$('rep').textContent=st.rep;$('lab').textContent=st.labellers;$('gpu').textContent=st.gpus;$('chapNo').textContent='第 '+st.month+' / 6 個月';syncOffice();screen();}

/* ---------- planning ---------- */
function blankPlan(){return {hire:0,buyGpu:0,cloud:0,p:{}};}
function pp(plan,id){return plan.p[id]=plan.p[id]||{buy:{},hours:0};}
function costs(plan){const k=SIM.cost;let c=plan.buyGpu*k.gpu+plan.cloud*k.cloud100;const items=[];
  Object.entries(plan.p).forEach(([id,a])=>{const s=st.proj[id],P=PB[id];Object.entries(a.buy).forEach(([cd,n])=>{if(!n)return;c+=n/1000*k.sample1000;if(!(s.data[cd]||s.backlog[cd]))c+=k.condition;});if(a.expert&&!s.expertDone)c+=k.expert;if(a.anon&&!s.anonymised)c+=k.anonymise;});
  c+=(st.labellers+plan.hire)*k.labeller+(st.gpus+plan.buyGpu)*k.gpuPower*(st.month===C.heatwave?2:1);return c;}
function hoursAvail(plan){return (st.gpus+plan.buyGpu+plan.cloud)*SIM.gpuHours;}
function applyPlan(plan,sim){const S=sim?JSON.parse(JSON.stringify(st.proj)):st.proj;let cap=(st.labellers+plan.hire)*SIM.labelPerPerson;let left=hoursAvail(plan);
  SIM.projects.forEach(P=>{const s=S[P.id],a=plan.p[P.id];if(!s.accepted||s.delivered)return;s._month=st.month;if(a){if(a.alg)s.alg=a.alg;Object.entries(a.buy).forEach(([cd,n])=>{s.backlog[cd]=(s.backlog[cd]||0)+n;});if(a.expert)s.expertDone=true;if(a.anon)s.anonymised=true;}
    Object.keys(s.backlog).forEach(cd=>{const take=Math.min(cap,s.backlog[cd]);s.data[cd]=(s.data[cd]||0)+take;s.backlog[cd]-=take;cap-=take;});if(a){const h=Math.min(left,a.hours||0);s.hours+=h;left-=h;}});return {S,capLeft:cap};}
function board(){return new Promise(res=>{const plan=blankPlan();st.plan=plan;const el=$('board');el.hidden=false;
  const draw=()=>{const sim=applyPlan(plan,true),S=sim.S;const cost=costs(plan),end=st.cash-cost,used=Object.values(plan.p).reduce((a,x)=>a+(x.hours||0),0),avail=hoursAvail(plan);
    const backlogTot=SIM.projects.reduce((a,P)=>a+Object.values(S[P.id].backlog).reduce((x,y)=>x+y,0),0);
    let h='<div class="bh"><h2>第 '+st.month+' 個月計劃</h2><div class="cashline">月初現金 <b>'+money(st.cash)+'</b> → 月底 <b class="'+(end<0?'neg':'')+'">'+money(end)+'</b></div></div>';
    h+='<section class="co"><h3>公司</h3><div class="rows">'+
      row('標註員','👩‍💻 '+(st.labellers+plan.hire)+' 人 · 每月可標註 '+((st.labellers+plan.hire)*SIM.labelPerPerson).toLocaleString()+' 張','hire',plan.hire,'月薪 $15k／人')+
      row('GPU 伺服器','🖥 '+(st.gpus+plan.buyGpu)+' 部 · 每月 '+((st.gpus+plan.buyGpu)*100)+' GPU 小時','buyGpu',plan.buyGpu,'$120k／部，電費 $6k／月'+(st.month===C.heatwave?'（熱浪：電費加倍）':''))+
      row('租用雲端','☁️ '+plan.cloud*100+' 小時（只限本月）','cloud',plan.cloud,'$30k／100 小時')+'</div>'+
      '<p class="meter">GPU 小時：已分配 <b>'+used+'</b> / 可用 <b>'+avail+'</b>'+(backlogTot>0?'　<span class="warn">⚠ 標註員不足：'+backlogTot.toLocaleString()+' 張要留待下月</span>':'')+'</p></section>';
    SIM.projects.forEach(P=>{const s0=st.proj[P.id];if(!s0.accepted||s0.delivered||P.offer>st.month)return;const a=pp(plan,P.id),s=S[P.id],r=projAcc(P,s);const conds=P.conds.filter(c=>!(P.lateCond===c&&st.month<P.lateMonth));
      h+='<section class="pj"><div class="pjh"><h3>'+P.name+'</h3><span>'+P.client+' · 第 '+P.deadline+' 個月交付 · 目標 '+pct(P.target)+' · 尾數 '+money(P.pay*(1-SIM.deposit))+'</span></div>';
      h+='<div class="sub2">演算法</div><div class="algs">'+Object.entries(SIM.algs).map(([k,A])=>'<button data-alg="'+P.id+':'+k+'" class="'+((a.alg||s0.alg)===k?'on':'')+'">'+A.name+(P.deploy==='phone'&&!A.phone?' <em>手機上太慢</em>':'')+'</button>').join('')+'</div>';
      h+='<div class="sub2">數據（每 1,000 張 $4k；新情況首次 $6k）</div>'+conds.map(cd=>'<div class="drow"><span>'+cd+'：<b>'+((s.data[cd]||0)).toLocaleString()+'</b>'+(s.backlog[cd]?' <em>待標註 '+s.backlog[cd].toLocaleString()+'</em>':'')+'</span><button data-buy="'+P.id+':'+cd+':1000">+1,000</button><button data-buy="'+P.id+':'+cd+':3000">+3,000</button>'+((a.buy[cd]||0)>0?'<button data-buy="'+P.id+':'+cd+':-1000">−</button>':'')+'</div>').join('');
      h+='<div class="opts">'+(s0.expertDone?'<span class="okc">✓ 已由專家檢查標籤</span>':'<label><input type="checkbox" data-exp="'+P.id+'"'+(a.expert?' checked':'')+'> 專家檢查標籤 $12k'+(P.expert?'（醫生）':'')+'</label>')+(P.privacy?(s0.anonymised?'<span class="okc">✓ 已匿名化</span>':'<label><input type="checkbox" data-anon="'+P.id+'"'+(a.anon?' checked':'')+'> 病人資料匿名化 $20k</label>'):'')+'</div>';
      h+='<div class="sub2">分配 GPU 小時（本月 '+(a.hours||0)+'）</div><div class="hrow"><button data-hr="'+P.id+':-20">−20</button><button data-hr="'+P.id+':20">+20</button><button data-hr="'+P.id+':100">+100</button><span>訓練進度 <b>'+pct(r.progress)+'</b>（需要約 '+Math.round(r.hoursNeeded)+' 小時，已用 '+Math.round(s.hours)+'）</span></div>';
      h+='<div class="bars">'+Object.entries(r.by).map(([cd,v])=>'<div class="br"><span>'+cd+'</span><span class="bt"><i style="width:'+Math.round(v*100)+'%;background:'+(v>=P.target?'#3ACB5A':'#E8A01A')+'"></i><u style="left:'+Math.round(P.target*100)+'%"></u></span><b>'+pct(v)+'</b></div>').join('')+'</div>';
      const warn=[];if(!r.deployOk)warn.push('大型神經網絡在手機上太慢，無法交付');if(P.privacy&&!r.privacyOk)warn.push('病人資料未匿名化，不能交付');if(P.expert&&!(s.expertDone))warn.push('醫學影像需要醫生檢查標籤');
      if(warn.length)h+='<p class="warn">⚠ '+warn.join('；')+'</p>';h+='</section>';});
    h+='<div class="runbar"><button class="primary" id="runM"'+(end<-200000||used>avail?' disabled':'')+'>執行本月 →</button>'+(used>avail?'<span class="warn">GPU 小時不足</span>':end<0?'<span class="warn">月底現金會變成負數</span>':'')+'</div>';
    el.innerHTML=h;
    el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,d=+b.dataset.d;plan[k]=Math.max(0,plan[k]+d);draw();});
    el.querySelectorAll('[data-alg]').forEach(b=>b.onclick=()=>{const [id,k]=b.dataset.alg.split(':');pp(plan,id).alg=k;draw();});
    el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const [id,cd,n]=b.dataset.buy.split(':');const a=pp(plan,id);a.buy[cd]=Math.max(0,(a.buy[cd]||0)+(+n));draw();});
    el.querySelectorAll('[data-exp]').forEach(b=>b.onchange=()=>{pp(plan,b.dataset.exp).expert=b.checked;draw();});el.querySelectorAll('[data-anon]').forEach(b=>b.onchange=()=>{pp(plan,b.dataset.anon).anon=b.checked;draw();});
    el.querySelectorAll('[data-hr]').forEach(b=>b.onclick=()=>{const [id,d]=b.dataset.hr.split(':');const a=pp(plan,id);a.hours=Math.max(0,(a.hours||0)+(+d));draw();});
    const rb=$('runM');if(rb)rb.onclick=()=>{el.hidden=true;res(plan);};
    if(window.__auto&&!draw._auto){draw._auto=1;const A=C.auto[st.month]||{};plan.hire=A.hire||0;plan.buyGpu=A.buyGpu||0;plan.cloud=A.cloud||0;Object.entries(A.p||{}).forEach(([id,x])=>{plan.p[id]={alg:x.alg,buy:Object.fromEntries((x.buy||[]).map(([c,n])=>[c,n])),hours:x.hours||0,expert:x.expert,anon:x.anon};});draw();setTimeout(()=>{const b=$('runM');if(b){el.hidden=true;res(plan);}},200);}};
  draw();});}
function row(lbl,val,k,v,note){return '<div class="crow"><span><b>'+lbl+'</b>'+val+'<small>'+note+'</small></span><button data-k="'+k+'" data-d="-1"'+(v>0?'':' disabled')+'>−</button><button data-k="'+k+'" data-d="1">＋</button></div>';}

/* ---------- month flow ---------- */
async function offer(P){return new Promise(async res=>{E.actions([]);await E.showLine('gatekeeper',P.client+'想委託你們：「'+P.name+'」。');
  const d=document.createElement('div');d.className='offer';d.innerHTML='<b>'+P.name+'</b><span>條件：'+P.conds.join('、')+(P.lateCond?'（之後可能加入新要求）':'')+'</span><span>目標準確率 '+pct(P.target)+' · 第 '+P.deadline+' 個月交付 · '+(P.deploy==='phone'?'在手機上運行':'在伺服器運行')+'</span><span>報酬 '+money(P.pay)+'（接受時先收訂金 '+money(P.pay*SIM.deposit)+'）</span>'+(P.note?'<span class="note">'+P.note+'</span>':'');
  E.actions([d,E.btn('next','接受',()=>res(true)),E.btn('opt','婉拒',()=>res(false))]);if(window.__auto)setTimeout(()=>res(true),150);});}
async function runMonth(plan){const cost=costs(plan);st.labellers+=plan.hire;st.gpus+=plan.buyGpu;applyPlan(plan,false);st.cash-=cost;hudSync();
  busy=1;E.overlay('<div class="chapcard"><small>第 '+st.month+' 個月</small><h2>團隊工作中…</h2></div>',true);await E.sleep(window.__fast?300:1800);E.clearOverlay();busy=0;}
async function deliveries(){const out=[];for(const P of SIM.projects){const s=st.proj[P.id];if(!s.accepted||s.delivered||P.deadline!==st.month)continue;s._final=true;const r=projAcc(P,s);
    const pass=r.min>=P.target&&r.deployOk&&r.privacyOk;s.delivered=pass?'pass':'fail';
    let why='';if(!pass){const A=SIM.algs[s.alg];const worst=Object.entries(r.by).sort((a,b)=>a[1]-b[1])[0];
      why=!r.deployOk?'演算法：大型神經網絡在手機上運行太慢。':!r.privacyOk?'私隱：病人資料未匿名化。':r.progress<.95?'運算能力：GPU 小時不足，訓練只完成 '+pct(r.progress)+'。':A.cap<P.target+.02?'演算法：'+A.name+'的上限不足以達到目標。':P.expert&&!s.expertDone?'數據質素：標籤未經醫生檢查。':(s.data[worst[0]]||0)<1000?'數據多樣性：缺少「'+worst[0]+'」的數據。':'數據數量：「'+worst[0]+'」的數據不夠多。';}
    if(pass){st.cash+=P.pay*(1-SIM.deposit);st.rep+=15;}else st.rep-=15;st.log.push({id:P.id,pass,min:r.min,why});out.push({P,r,pass,why});}
  hudSync();for(const o of out){E.emote(CH.gatekeeper,o.pass?'hop':'shake');if(o.pass)E.flash(true);
    await E.say('gatekeeper',o.P.name+'驗收：'+Object.entries(o.r.by).map(([c,v])=>c+' '+pct(v)).join('、')+'。'+(o.pass?'全部達標，收到尾數 '+money(o.P.pay*(1-SIM.deposit))+'！':'未能達標。原因：'+o.why));}return out;}
async function check(q){const dis=new Set();let w=0;for(;;){const i=await E.ask('gatekeeper',q.question,q.options,dis,{skip:true});if(i===-1){await E.say('gatekeeper','答案是「'+q.options[q.answer]+'」。'+q.explain);return;}
  if(i===q.answer){st.score+=Math.max(2,10-w*3);E.emote(CH.gatekeeper,'hop');await E.say('gatekeeper','正確。'+q.explain);return;}w++;dis.add(i);E.emote(CH.gatekeeper,'shake');}}
async function main(){E.start();
  E.overlay('<div class="title"><div class="v">'+C.meta.short_title+'</div><div class="v a">'+C.meta.author+'</div><div class="side"><p>'+C.meta.title_lines.join('<br>')+'</p><button class="primary" id="go">開始</button></div></div>',true);await E.waitClick('#go');
  E.overlay('<div class="card"><h2>你的公司</h2><p>'+C.meta.intro+'</p><div class="cast">'+Object.values(C.npc_slots).map(x=>'<div>'+E.glyph(x.character_id)+'<p style="margin:0"><b>'+x.display_name+'</b><br><span>'+x.persona+'</span></p></div>').join('')+'</div><p class="sub">'+C.meta.note+'</p><button class="primary" id="go">開業！</button></div>',true);
  await E.waitClick('#go');E.clearOverlay();$('hud').hidden=false;$('coHud').hidden=false;
  for(let m=1;m<=6;m++){st.month=m;hudSync();const ev=C.months[m-1];E.overlay('<div class="chapcard"><small>第 '+m+' 個月</small><h2>'+ev.title+'</h2></div>',true);await Promise.race([E.sleep(window.__fast?300:1500),new Promise(r=>$('overlay').addEventListener('click',r,{once:true}))]);E.clearOverlay();
    $('chapTitle').textContent=ev.title;for(const [sp,t] of ev.lines){if(sp==='rival')E.emote(CH.rival,'hop');await E.say(sp,t);}
    for(const P of SIM.projects.filter(P=>P.offer===m)){const ok=await offer(P);st.proj[P.id].accepted=ok;if(ok){st.cash+=P.pay*SIM.deposit;hudSync();await E.say('companion','已收訂金 '+money(P.pay*SIM.deposit)+'。');}}
    if(ev.check)await check(ev.check);E.hideDialog();
    const plan=await board();await runMonth(plan);await deliveries();
    const after=C.months[m-1].after;if(after){for(const [sp,t] of after)await E.say(sp,t);}if(ev.checkAfter)await check(ev.checkAfter);
    if(st.cash<-200000){await E.say('mentor','公司現金嚴重透支，投資者要求停業檢討。');break;}E.hideDialog();}
  const passed=st.log.filter(l=>l.pass).length,value=st.cash+st.rep*2000;const tier=passed>=4?C.endings.best:passed>=3?C.endings.good:C.endings.normal;E.flash(true);
  E.overlay('<div class="card"><p class="sub" style="margin:0">六個月之後</p><h2>'+tier.title+'</h2><p>'+tier.text+'</p><div class="stats"><div><b>'+money(st.cash)+'</b>現金</div><div><b>'+passed+' / '+st.log.length+'</b>項目達標</div><div><b>'+st.rep+'</b>聲譽</div></div>'+
    '<table class="dt">'+st.log.map(l=>'<tr><td>'+PB[l.id].name+'</td><td>'+(l.pass?'✓ 達標':'✕ '+l.why)+'</td></tr>').join('')+'</table>'+
    '<div class="three"><div><b>數據</b><span>回收站要夜間數據，醫學影像要醫生標籤</span></div><div><b>演算法</b><span>手機要用小型模型，語音要大型模型</span></div><div><b>運算能力</b><span>大型模型要足夠 GPU 小時</span></div></div><p style="font-family:var(--serif)">'+C.debrief+'</p><button class="primary" id="again">再玩一次</button></div>',true);
  await E.waitClick('#again');location.reload();}
main();
})();
