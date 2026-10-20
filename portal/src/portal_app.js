/* OpenMAIC-GamePlay teacher portal: chat-driven game generation + game library */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const SRC=JSON.parse($('d-src').textContent),DEMOS=JSON.parse($('d-demos').textContent);
const IN_CLAUDE=!!(window.claude&&typeof window.claude.use==='function');
const state={lang:'zh',provider:'claude',model:'claude-sonnet-5-5',keys:{},qwenBase:'intl',chat:[],analysis:null,recs:null,mode:null,theme:null,spec:null,html:null,busy:false,lastModel:null};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ======================= 0. AI providers ======================= */
const PROVIDERS={
  claude:{name:'Claude',maker:'Anthropic',color:'#D97757',mark:'C',models:[['claude-sonnet-5-5','Claude Sonnet 5.5'],['claude-opus-5-5','Claude Opus 5.5'],['claude-haiku-4-5','Claude Haiku 4.5']],tiers:{'claude-haiku-4-5':'quick','claude-sonnet-5-5':'default','claude-opus-5-5':'complex'},keyUrl:'console.anthropic.com'},
  gpt:{name:'GPT',maker:'OpenAI',color:'#10A37F',mark:'G',models:[['gpt-4.1','GPT-4.1'],['gpt-4.1-mini','GPT-4.1 mini'],['gpt-4o','GPT-4o']],keyUrl:'platform.openai.com'},
  gemini:{name:'Gemini',maker:'Google',color:'#4C7BF4',mark:'✦',models:[['gemini-2.5-pro','Gemini 2.5 Pro'],['gemini-2.5-flash','Gemini 2.5 Flash']],keyUrl:'aistudio.google.com'},
  qwen:{name:'Qwen 通義千問',maker:'Alibaba Cloud',color:'#7B5CFF',mark:'Q',models:[['qwen-max','qwen-max'],['qwen-plus','qwen-plus'],['qwen-turbo','qwen-turbo']],keyUrl:'dashscope.console.aliyun.com'}};
const QWEN_BASE={intl:'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',cn:'https://dashscope.aliyuncs.com/compatible-mode/v1'};
const API_ID={'claude-haiku-4-5':'claude-haiku-4-5-20251001'};
const PROXY_PATH={claude:'anthropic',gpt:'openai',gemini:'gemini',qwen:'qwen-'};
function endpoint(p){const px=(state.proxy||'').trim().replace(/\/$/,'');const base={claude:'https://api.anthropic.com',gpt:'https://api.openai.com/v1',gemini:'https://generativelanguage.googleapis.com/v1beta',qwen:QWEN_BASE[state.qwenBase]}[p];
  if(!px)return base;return px+'/'+(p==='qwen'?'qwen-'+state.qwenBase:PROXY_PATH[p]);}
let sampleNS=null;
async function getSample(){if(sampleNS)return sampleNS;if(!IN_CLAUDE)return null;sampleNS=await window.claude.use('sample');return sampleNS;}
const usesBuiltin=()=>IN_CLAUDE&&state.provider==='claude';
async function llm(prompt,opts){try{return await llmRaw(prompt,opts);}catch(e){if(e instanceof TypeError&&/fetch|network|load/i.test(e.message))throw new Error(T('errNet',{p:PROVIDERS[state.provider].name}));throw e;}}
async function llmRaw(prompt,opts){opts=opts||{};const p=state.provider,key=(state.keys[p]||'').trim(),model=state.model,maxT=opts.maxTokens||12000;
  if(usesBuiltin()){const s=await getSample();if(!s)throw new Error(T('errNoBuiltin'));const r=await s(prompt,{model,modelTier:PROVIDERS.claude.tiers[model]||'default',cache:false});
    state.lastModel=r.modelApplied||('Claude（'+r.modelTierApplied+'）');if(r.truncated)throw new Error(T('errTrunc'));return r.text;}
  if(IN_CLAUDE)throw new Error(T('errSandbox',{p:PROVIDERS[p].name}));
  if(!key&&!(state.proxy||'').trim())throw new Error(T('errNoKey',{p:PROVIDERS[p].name}));state.lastModel=PROVIDERS[p].name+' · '+model;
  const fail=async r=>{let m='HTTP '+r.status;try{const j=await r.json();m=(j.error&&(j.error.message||j.error))||m;}catch(e){}throw new Error(m);};
  if(p==='claude'){const r=await fetch(endpoint('claude')+'/v1/messages',{method:'POST',headers:{...(key?{'x-api-key':key}:{}),'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:API_ID[model]||model,max_tokens:maxT,messages:[{role:'user',content:prompt}]})});
    if(!r.ok)await fail(r);const j=await r.json();return j.content.map(c=>c.text||'').join('');}
  if(p==='gpt'||p==='qwen'){const base=endpoint(p);
    const r=await fetch(base+'/chat/completions',{method:'POST',headers:{...(key?{'Authorization':'Bearer '+key}:{}),'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'user',content:prompt}],response_format:{type:'json_object'}})});
    if(!r.ok)await fail(r);const j=await r.json();return j.choices[0].message.content;}
  if(p==='gemini'){const r=await fetch(endpoint('gemini')+'/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json',...(key?{'x-goog-api-key':key}:{})},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}})});
    if(!r.ok)await fail(r);const j=await r.json();return j.candidates[0].content.parts.map(x=>x.text||'').join('');}
  throw new Error('unknown provider');}
function parseJSON(t){let s=String(t).trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw new Error(T('errNoJson'));return JSON.parse(s.slice(a,b+1));}
async function llmJSON(prompt){const t=await llm(prompt);try{return parseJSON(t);}catch(e){const t2=await llm(prompt+'\n\n【重要】上一次的輸出不是有效的 JSON。只輸出一個 JSON 物件，不要任何說明文字或 Markdown。');return parseJSON(t2);}}

/* ======================= 1. Analysis ======================= */
const TAGS=['has_dilemma','has_categories','has_sequence','has_pairs','has_evidence','has_dialogue_language','has_variables','has_imagery','has_sources','has_tradeoffs','has_construction','has_rhythm','short_labels_ok'];
function analysisPrompt(text){return `你是香港中小學課程分析專家。老師描述了一個課題及教材，請分析並只輸出 JSON。
老師的輸入：
"""${text}"""

輸出格式（${state.lang==='en'?'所有文字欄位用英文':'全部用繁體中文'}；布林值只可 true/false）：
{"subject":"學科（例如 中國語文、英國語文、數學、科學、地理、中國歷史、公民與社會發展、資訊及通訊科技、經濟）",
 "level":"級別（例如 小四、中一、DSE）","topic":"課題名稱","summary":"兩句概括教學內容",
 "objectives":["學習目標，3 至 5 項"],"key_points":["學生必須掌握的知識點，4 至 8 項，每項一句"],"misconceptions":["學生常見的錯誤理解，3 至 6 項"],
 "era":"modern 或 ancient（題材屬古代、文言、中國歷史則為 ancient；其他為 modern）",
 "culture":"題材的文化及地區，只可填：chinese_ancient（中國古代、文言）、modern（現代香港、學校、科學等）、europe（歐洲歷史或文化）、america（美洲歷史或文化）、japan（日本歷史或文化）、korea（韓國歷史或文化）",
 "language_target":"若學習目標是練習英語或普通話會話，填 en 或 putonghua；否則填 none",
 "tags":{${TAGS.map(t=>'"'+t+'":布林').join(',')}},
 "tag_notes":"一句說明為何如此標記",
 "enough_info":布林（教材內容是否足夠生成遊戲）,"follow_up":"若不足，向老師提出一個問題；足夠則留空"}
標記說明：has_dilemma=有需要學生判斷取捨的情境；has_categories=知識可分類；has_sequence=有次序或步驟；has_pairs=有字詞與解釋等配對；has_evidence=要從線索推理；has_dialogue_language=以語言會話為學習目標；has_variables=有可操控變數的實驗；has_imagery=以景物空間為重點；has_sources=要比對不同來源；has_tradeoffs=有資源分配取捨；has_construction=要拼砌或編排步驟；has_rhythm=有節奏韻律；short_labels_ok=知識點可寫成 12 字以內的短句。`;}
function validateAnalysis(a){const e=[];['subject','level','topic','summary'].forEach(k=>{if(!a[k]||typeof a[k]!=='string')e.push('缺少 '+k);});if(!Array.isArray(a.key_points)||a.key_points.length<3)e.push('key_points 至少 3 項');if(!a.tags||typeof a.tags!=='object')e.push('缺少 tags');else TAGS.forEach(t=>{if(typeof a.tags[t]!=='boolean')a.tags[t]=!!a.tags[t];});if(!['modern','ancient'].includes(a.era))a.era='modern';if(!['chinese_ancient','modern','europe','america','japan','korea'].includes(a.culture))a.culture=a.era==='ancient'?'chinese_ancient':'modern';if(!['en','putonghua','none'].includes(a.language_target))a.language_target='none';if(!Array.isArray(a.misconceptions))a.misconceptions=[];return e;}

/* ======================= 2. Recommender (rules in code) ======================= */
const MODES={
  rpg:{name:'RPG 冒險',gen:true,what:'情境抉擇：在故事中作出判斷，承擔後果',demo:'魚我所欲也'},
  carry:{name:'限時搬運',gen:true,what:'分類、配對、排序：限時把答案送到正確位置',demo:'論語：杏壇搬運戰'},
  dialogue:{name:'對話闖關',gen:true,what:'在香港生活場景用英語或普通話應對',demo:'HK Buddy'},
  escape:{name:'密室逃脫',gen:false,what:'收集線索、破解機關',demo:null},
  simulation:{name:'模擬實驗室',gen:false,what:'操控變數、觀察結果',demo:'浮與沉'},
  exploration:{name:'探索漫遊',gen:false,what:'走進場景、實地考察',demo:'翠溪考察'},
  detective:{name:'偵探查案',gen:false,what:'比對史料或資訊來源、出示證據',demo:'赤壁疑案'},
  management:{name:'經營決策',gen:false,what:'多回合分配資源、看結果',demo:'檸檬茶小店'},
  building:{name:'建造工坊',gen:false,what:'拼砌、編程、設計',demo:'地盤三視圖'},
  rhythm:{name:'節奏表演',gen:false,what:'跟著節拍朗誦或演奏',demo:'山居秋暝'}};
function recommend(a){const t=a.tags,s={};const lang=a.language_target!=='none';
  s.rpg=(t.has_dilemma?.55:0)+(a.misconceptions.length>=3?.15:0)+(/公民|生活|倫理|宗教|健康|中國語文|歷史/.test(a.subject)?.15:0)+.1;
  s.carry=t.short_labels_ok?((t.has_categories?.35:0)+(t.has_pairs?.25:0)+(t.has_sequence?.2:0)+.15):0;
  s.dialogue=lang&&t.has_dialogue_language?.95:0;
  s.escape=t.has_evidence?.6:.05;s.simulation=t.has_variables?.75:0;s.exploration=t.has_imagery?.65:0;s.detective=t.has_sources?.7:0;
  s.management=t.has_tradeoffs?.7:0;s.building=t.has_construction?.7:0;s.rhythm=t.has_rhythm?.7:0;
  const all=Object.keys(MODES).map(k=>({k,score:Math.min(1,s[k]||0),...MODES[k]})).sort((x,y)=>y.score-x.score);
  const gen=all.filter(m=>m.gen&&m.score>0.2);if(!gen.length)gen.push(all.find(m=>m.k==='rpg'));return {all,gen,best:all[0]};}
function reasonFor(k,a){const t=a.tags;return {rpg:(t.has_dilemma?'課題有需要判斷取捨的情境，適合在故事中作抉擇。':'把常見錯誤變成故事中的抉擇。'),carry:'知識點可以寫成短句'+(t.has_categories?'並分類':'')+(t.has_pairs?'、配對':'')+(t.has_sequence?'、排序':'')+'，適合限時搬運溫習。',dialogue:'學習目標是語言應對，適合在生活場景中對話練習。'}[k]||MODES[k].what;}

/* ======================= 3. Generation prompts & schemas ======================= */
const CAMPUS_TPL=['science_lab','prep_room','corridor'],CAMPUS_PROPS=['poster','safety_card','exit_sign','fire_alarm','reagent_bench','burner_bench','tube_rack','eyewash_station','broken_glass','glass_bin','broom_pan','lift_door'];
const ANCIENT_TPL=['market','pavilion','village','mansion','gourd_garden','winter_river','great_lake','roadside_tree'],ANCIENT_PROPS=['slips','letter','tablet','rock_slips','crate_slips','chest','scale','fish_basket','bear_paw','rice_basket','soup_bowl','seed_sack','silk_frame','salve_jar','gold_bag','reed_clump','stele_lake','axe_stump','friend_letter'];
const WORLD_TPL=['town_square','great_hall','village','harbor'],WORLD_PROPS=['scroll','book','map','chest','crate','statue','flag','lantern','sign','cart','letter'];
const WORLD_THEMES=['europe','america','japan','korea'];
const ACT_VERBS=['pour','throw','weigh','stamp','steer','plant','shoot'],ACT_OBJ=['crate','barrel','chest','jar','bottle','flask','tube','gourd','scroll','document','bag','seed','stone','boat','basket','arrow'],ACT_TGT=['water','jar','gourd','flask','tube','bin','basket','box','port','field','tray','target','pan'];
const ACT_NAMES={pour:'倒',throw:'擲',weigh:'秤',stamp:'蓋印',steer:'航行',plant:'種植',shoot:'射箭'};
const THEME_SET=t=>WORLD_THEMES.includes(t)?{tpl:WORLD_TPL,props:WORLD_PROPS}:t==='ancient'?{tpl:ANCIENT_TPL,props:ANCIENT_PROPS}:{tpl:CAMPUS_TPL,props:CAMPUS_PROPS};
const THEME_LABEL={modern:'現代校園',ancient:'中國古代',europe:'歐洲（中世紀至近代）',america:'美洲（殖民地時期至十九世紀）',japan:'日本（江戶時代風格）',korea:'韓國（朝鮮王朝風格）'};
const PROP_DESC={scroll:'卷軸',book:'書本',map:'地圖桌',chest:'寶箱',crate:'木箱',statue:'雕像',flag:'旗幟',lantern:'燈',sign:'告示板',cart:'手推車',letter:'書信桌',poster:'海報／告示板',safety_card:'小型提示牌',exit_sign:'出口指示牌',fire_alarm:'火警鐘',reagent_bench:'放試劑瓶的實驗桌',burner_bench:'有本生燈的實驗桌',tube_rack:'試管架',eyewash_station:'洗眼器',broken_glass:'地上的碎玻璃',glass_bin:'碎玻璃箱',broom_pan:'掃帚垃圾鏟',lift_door:'升降機門',
  slips:'竹簡',letter:'書信',tablet:'石碑',rock_slips:'石上的竹簡',crate_slips:'木箱與竹簡',chest:'寶箱',scale:'天秤',fish_basket:'魚籃',bear_paw:'熊掌盤',rice_basket:'飯籃',soup_bowl:'湯碗',seed_sack:'種子袋',silk_frame:'晾布架',salve_jar:'藥罐',gold_bag:'錢袋',reed_clump:'蘆葦',stele_lake:'湖邊石碑',axe_stump:'木樁與斧頭',friend_letter:'石上的書信'};
const TPL_DESC={town_square:'市鎮廣場',great_hall:'宮殿／城堡／會堂',village:'鄉村',harbor:'港口',science_lab:'科學實驗室',prep_room:'實驗準備室',corridor:'學校走廊',market:'古代市集',pavilion:'山中涼亭',village:'鄉村',mansion:'府第（夜）',gourd_garden:'庭園',winter_river:'冬日河邊',great_lake:'湖邊',roadside_tree:'路邊大樹'};
function ctx(a){return `課題資料（由分析步驟得出）：
學科：${a.subject}；級別：${a.level}；課題：${a.topic}
概要：${a.summary}
學習目標：${(a.objectives||[]).join('；')}
知識點：${a.key_points.join('；')}
常見錯誤理解：${a.misconceptions.join('；')}
老師原始輸入：
"""${state.chat.filter(m=>m.role==='user').map(m=>m.text).join('\n')}"""`;}
const COMMON_TPL=`規則：只輸出一個 JSON 物件，不要任何說明或 Markdown。%%LANG%%（對話闖關的英語／普通話對白除外）。內容必須準確，符合香港課程；不可虛構史實、數據或引文；不確定的事實寧可不寫。四個固定角色：mentor（導師，講解）、companion（同伴）、rival（對手，負責說出常見錯誤想法，是搗蛋鬼而非壞人）、gatekeeper（守門人，負責考問）；只可為他們改名和寫人設。`;
function common(){return COMMON_TPL.replace('%%LANG%%',state.gameLang==='en'?'全部文字用英文（英式英文，程度適合香港學生；角色名字可以用英文）':'全部文字用香港繁體中文書面語');}
function rpgPrompt(a,theme){const {tpl,props}=THEME_SET(theme);
  return `你是教育遊戲編劇。請為以下課題寫一個「RPG 冒險」遊戲的內容。學生在 4 章故事中探索線索、聽導師講解，然後面對對手提出的兩難，三選一作答，最後回答守門題。
${ctx(a)}
${common()}
場景主題：${THEME_LABEL[theme]||'現代校園'}。每章的 scene 只可從以下選擇：${tpl.map(x=>x+'（'+TPL_DESC[x]+'）').join('、')}。
每個線索的 prop（場景道具）只可從以下選擇：${props.map(x=>x+'（'+PROP_DESC[x]+'）').join('、')}。
輸出格式：
{"meta":{"topic":"課題","short_title":"遊戲名（2至8字）","author":"作者或學科","title_lines":["標題頁第一行","第二行"],"meter_label":"狀態值名稱（2至4字，例如 理解、本心、安全指數）","central_thesis":"一句中心思想"},
 "player_roles":[{"role_id":"r1","display_name":"身份名稱","blurb":"一句介紹","address":"同伴對玩家的稱呼","start_value":55},{"role_id":"r2","display_name":"…","blurb":"…","address":"…","start_value":45}],
 "npc_slots":{"mentor":{"display_name":"名字","persona":"一句人設"},"companion":{…},"rival":{…},"gatekeeper":{…}},
 "units":[ 4 個章節，每個：
  {"unit_id":"u1","title":"章名（2至8字）","scene":"場景","key_quote":"本章金句（可為課文引句）","concept":"本章知識點（一至兩句）","misconceptions":["本章針對的錯誤理解"],
   "lines":{"enter":"同伴進場台詞，可用 {address} 稱呼玩家","guide":"導師講解（兩至三句，必須正確講解知識點）","dilemma":"對手說出錯誤想法，製造兩難","prompt":"向玩家提問，例如：你會怎樣回應？"},
   "hotspots":[3 個，每個 {"id":"英文小寫識別碼","label":"線索名稱（2至6字）","text":"線索內容（一至兩句，提供判斷所需的資料）","prop":"道具"}],
   "choices":[剛好 3 個，type 各一：{"type":"correct","text":"正確做法","feedback":"為何正確"},{"type":"misconception","text":"對應常見錯誤理解","feedback":"錯在哪裡"},{"type":"suboptimal","text":"不完全錯但不夠好","feedback":"不足之處"}],
   "reactions":{"rival_on_correct":"…","rival_on_wrong":"…","companion_on_correct":"…","companion_on_wrong":"…"},
   "gate":{"question":"守門題","options":["4 個不同選項"],"answer":正確選項的索引0至3,"explain":"解釋"},
   "action":（可選）只有當本章內容真的包含一個實際動作時才加入，例如課文中有人倒油、射箭、把茶葉倒進海裡、簽署文件、種植、航行、秤重；沒有就完全不要寫這個欄位。格式：
     {"verb":"pour、throw、weigh、stamp、steer、plant 或 shoot（shoot 只限內容真的涉及射箭）","title":"動作標題（12字內，例如：把茶葉倒進波士頓港）",
      "evidence":"從老師教材中逐字抄錄、證明這個動作出現在內容中的一句（中文 5 至 40 字；英文教材可抄一句英文原句）",
      "prompt":"給學生的一句任務說明","object":{"name":"被操作的物件（例如 茶葉箱、石蕊溶液）","model":"${ACT_OBJ.join('、')} 之一"},
      "targets":[{"id":"英文小寫","name":"目的地或選項名稱（8字內）","model":"${ACT_TGT.join('、')} 之一","color":"可選，#十六進位"}，weigh 剛好 2 個，其他 2 至 3 個],
      "rounds":[{"item":"這一回合處理的東西或情況（16字內）","target":"正確 target 的 id","result":"做對後的說明","why":"做錯時的解釋","color":"pour 時可選：倒入後的顏色"}，1 至 4 回合]},
   "hints":{"dilemma":["3 級提示：指方向","縮小範圍","接近答案"],"gate":["3 級提示…","…","…"]}}],
 （動作規則：寧缺毋濫。動作必須是教材內容本身的一部分，不可為了好玩而加入與課題無關的動作；4 章之中可以只有一兩章有動作，或者完全沒有。）

 "endings":{"best":{"title":"…","text":"…"},"normal":{"title":"…","text":"…"},"fail":{"title":"…","text":"…"}},
 "debrief":"導師的總結（兩句）"}`;}
function carryPrompt(a){return `你是教育遊戲設計師。請為以下課題設計一個「限時搬運」溫習遊戲：學生在 3 至 5 個回合中，限時把寫著短句的竹簡搬到正確的位置。
${ctx(a)}
${common()}
每個回合的 round_type 只可以是：sort（分類：2至4個類別，4至9片竹簡）、pair（配對：3至4個位置，每個位置剛好一片竹簡）、sequence（排序：3至5個位置依次為第一、第二…，每個位置一片竹簡）、single（單選：1個位置，1片正確竹簡，2至3片誘餌）。
所有 label 不可超過 12 個字。誘餌（decoys）必須取材自常見錯誤理解，並附解釋。每片竹簡的 explain 要說明為何放在那裡。
輸出格式：
{"meta":{"topic":"課題","short_title":"遊戲名（2至8字）","author":"作者或學科","title_lines":["標題頁第一行","第二行"]},
 "npc_slots":{"mentor":{"display_name":"名字","persona":"一句人設"},"companion":{…},"rival":{…},"gatekeeper":{…}},
 "units":[3至5個回合：{"unit_id":"u1","title":"回合名","concept":"本回合知識點一句","round_type":"sort","lines":{"intro":"導師說明任務","rival_taunt":"對手放錯時的嘲諷（說出錯誤想法）","rival_interfere":"對手搗亂時說的話"},
   "zones":[{"id":"英文小寫識別碼","label":"位置名稱"}],"items":[{"label":"竹簡短句","answer":"所屬 zone 的 id","explain":"解釋"}],"decoys":[{"label":"誘餌短句","explain":"為何是錯的"}],"hints":["3 級提示","…","…"]}],
 "endings":{"best":{"title":"…","text":"…"},"normal":{"title":"…","text":"…"},"fail":{"title":"…","text":"…"}},
 "debrief":"導師總結（兩句）"}`;}
function dialoguePrompt(a){const lang=a.language_target==='putonghua'?'普通話（用簡體字以外的繁體中文書寫對白，並附漢語拼音不需要）':'英語（英式英語，文法必須完全正確）';
  return `你是語言教學遊戲編劇。請為以下課題寫一個「對話闖關」遊戲：學生帶一位朋友遊香港，在 2 至 4 個生活場景用${lang}應對。每段對話由一個角色說一句話，學生從 4 個回應中選出既正確又得體的一個。
${ctx(a)}
${common()}
場景 id 只可從以下選擇（每個最多用一次）：cafe（茶餐廳，陌生人是侍應）、mtr（港鐵站，陌生人是遊客）、ferry（天星小輪，沒有陌生人，只有同伴）、market（街市，陌生人是檔主）。
每段對話 4 個選項中剛好 1 個 correct:true，其餘 3 個是學生常犯的錯誤（文法、用詞、語氣、文化），各附 why（用繁體中文解釋）。
輸出格式：
{"meta":{"topic":"課題","short_title":"遊戲名","author":"學科及級別","title_lines":["標題頁第一行","第二行"],"language":"${a.language_target==='putonghua'?'zh-CN':'en-GB'}"},
 "npc_slots":{"mentor":{"display_name":"老師名字","persona":"一句"},"companion":{"display_name":"朋友名字","persona":"一句"},"rival":{"display_name":"愛說錯的同學","persona":"一句"},"gatekeeper":{"display_name":"…","persona":"…"}},
 "scenes":[{"id":"cafe","title":"場景中文名","en_title":"英文或拼音小標題","intro_zh":"導師用中文介紹情境","stranger":{"name":"陌生人稱呼（目標語言）","zh":"中文稱呼"},
   "turns":[2至3段：{"speaker":"stranger 或 companion","line":"對白（目標語言）","zh":"中文意思","options":[{"text":"回應","correct":true},{"text":"錯誤回應","why":"錯在哪裡"},…共4個],"kenny":"（可選）對手說的錯誤示範"}],
   "check":{"question":"概念題（中文）","options":["4個選項"],"answer":0,"explain":"解釋"}}],
 "endings":{"best":{"title":"…","text":"…"},"normal":{"title":"…","text":"…"},"fail":{"title":"…","text":"…"}},
 "debrief":"導師總結"}`;}

/* ======================= 4. Validators (quality gates) ======================= */
const isStr=(v,max)=>typeof v==='string'&&v.trim().length>0&&(!max||[...v].length<=(state.gameLang==='en'?max*3:max));
function vCommon(c,e){const lat=c.meta&&/[A-Za-z]/.test(c.meta.short_title||'');if(!c.meta||!isStr(c.meta.short_title,lat?24:12))e.push(lat?'meta.short_title 必須是 1 至 24 個字母':'meta.short_title 必須是 1 至 12 字');if(!c.meta||!Array.isArray(c.meta.title_lines)||c.meta.title_lines.length<1)e.push('meta.title_lines 至少一行');
  ['mentor','companion','rival','gatekeeper'].forEach(k=>{if(!c.npc_slots||!c.npc_slots[k]||!isStr(c.npc_slots[k].display_name,10))e.push('npc_slots.'+k+'.display_name 缺少或過長');});
  if(!c.endings||!['best','normal','fail'].every(k=>c.endings[k]&&isStr(c.endings[k].title)&&isStr(c.endings[k].text)))e.push('endings 必須有 best、normal、fail 的 title 和 text');if(!isStr(c.debrief))e.push('缺少 debrief');}
function vGate(g,where,e){if(!g||!isStr(g.question))e.push(where+'.question 缺少');else{if(!Array.isArray(g.options)||g.options.length!==4)e.push(where+'.options 必須剛好 4 個');else if(new Set(g.options).size!==4)e.push(where+'.options 有重複');if(!Number.isInteger(g.answer)||g.answer<0||g.answer>3)e.push(where+'.answer 必須是 0 至 3');if(!isStr(g.explain))e.push(where+'.explain 缺少');}}
function vChallenge(ch,w,e){if(!ch||typeof ch!=='object'){e.push(w+'.challenge 缺少');return;}if(!isStr(ch.prompt))e.push(w+'.challenge.prompt 缺少');
  if(ch.type==='archery'){const P=Array.isArray(ch.pairs)?ch.pairs:[];if(P.length<3||P.length>4)e.push(w+'.challenge.pairs 必須 3 至 4 對');P.forEach((p,j)=>{if(!Array.isArray(p)||!isStr(p[0],8)||!isStr(p[1],16))e.push(w+'.challenge.pairs['+j+'] 格式錯誤或過長');});if(new Set(P.map(p=>p&&p[0])).size!==P.length)e.push(w+'.challenge.pairs 有重複');if(ch.decoy&&(!isStr(ch.decoy.text,16)||!isStr(ch.decoy.why)))e.push(w+'.challenge.decoy 需要 text 和 why');}
  else if(ch.type==='sort'){const B=Array.isArray(ch.bins)?ch.bins:[],I=Array.isArray(ch.items)?ch.items:[];if(B.length<2||B.length>3)e.push(w+'.challenge.bins 必須 2 至 3 個');B.forEach((b,j)=>{b.id=String(b.id||('b'+j)).toLowerCase().replace(/[^a-z0-9_]/g,'')||('b'+j);if(!isStr(b.label,6))e.push(w+'.challenge.bins['+j+'].label 缺少或過長');});
    const ids=B.map(b=>b.id);if(I.length<4||I.length>6)e.push(w+'.challenge.items 必須 4 至 6 個');I.forEach((it,j)=>{if(!isStr(it.text,14))e.push(w+'.challenge.items['+j+'].text 缺少或過長');if(!ids.includes(it.bin))e.push(w+'.challenge.items['+j+'].bin 無效');});ids.forEach(id=>{if(!I.some(it=>it.bin===id))e.push(w+'.challenge 每個 bin 至少要有一個項目');});}
  else if(ch.type==='catch'){const I=Array.isArray(ch.items)?ch.items:[];if(I.length<6||I.length>8)e.push(w+'.challenge.items 必須 6 至 8 句');I.forEach((it,j)=>{if(!isStr(it.text,16))e.push(w+'.challenge.items['+j+'].text 缺少或過長');if(typeof it.correct!=='boolean')e.push(w+'.challenge.items['+j+'].correct 必須是 true 或 false');if(it.correct===false&&!isStr(it.why))e.push(w+'.challenge.items['+j+'] 錯誤說法要有 why');});
    if(I.filter(x=>x.correct===true).length<3||I.filter(x=>x.correct===false).length<2)e.push(w+'.challenge 至少 3 句正確、2 句錯誤');}
  else if(ch.type==='order'){const S=Array.isArray(ch.steps)?ch.steps:[];if(S.length<3||S.length>5)e.push(w+'.challenge.steps 必須 3 至 5 步');S.forEach((x,j)=>{if(!isStr(x,14))e.push(w+'.challenge.steps['+j+'] 缺少或過長');});if(new Set(S).size!==S.length)e.push(w+'.challenge.steps 有重複');}
  else e.push(w+'.challenge.type 必須是 archery、sort、catch 或 order');}
function vAction(a,w,e){if(!a)return;if(!ACT_VERBS.includes(a.verb)){e.push(w+'.action.verb 必須是 '+ACT_VERBS.join('/'));return;}
  if(!isStr(a.title,12))e.push(w+'.action.title 缺少或過長');if(typeof a.evidence!=='string'||a.evidence.trim().length<4||a.evidence.length>220)e.push(w+'.action.evidence 必須是教材中的一句短句（220 字元內）');if(!isStr(a.prompt))e.push(w+'.action.prompt 缺少');
  if(a.verb!=='weigh'&&(!a.object||!isStr(a.object.name,10)||!ACT_OBJ.includes(a.verb==='shoot'?'arrow':a.object.model))){if(a.verb==='shoot'){a.object={name:'箭',model:'arrow'};}else e.push(w+'.action.object 需要 name 和有效的 model');}
  const T=Array.isArray(a.targets)?a.targets:[];if(a.verb==='weigh'?T.length!==2:(T.length<2||T.length>3))e.push(w+'.action.targets 數量不對（weigh 2 個，其他 2 至 3 個）');
  T.forEach((t,j)=>{t.id=String(t.id||('t'+j)).toLowerCase().replace(/[^a-z0-9_]/g,'')||('t'+j);if(!isStr(t.name,8))e.push(w+'.action.targets['+j+'].name 缺少或過長');if(a.verb==='weigh')t.model='pan';else if(!ACT_TGT.includes(t.model))e.push(w+'.action.targets['+j+'].model 無效');});
  const ids=T.map(t=>t.id);if(new Set(ids).size!==ids.length)e.push(w+'.action.targets id 重複');const Rr=Array.isArray(a.rounds)?a.rounds:[];if(Rr.length<1||Rr.length>4)e.push(w+'.action.rounds 必須 1 至 4 回合');
  Rr.forEach((r,j)=>{if(!isStr(r.item,16))e.push(w+'.action.rounds['+j+'].item 缺少或過長');if(!ids.includes(r.target))e.push(w+'.action.rounds['+j+'].target 無效');});
  if(a.verb==='shoot'&&!/射|箭|弓|arrow|archer|bow/i.test(a.evidence||''))e.push(w+'.action 的 shoot 只限內容真的涉及射箭');}
function validateRPG(c,theme){const e=[];vCommon(c,e);const {tpl,props}=THEME_SET(theme);
  if(!Array.isArray(c.player_roles)||c.player_roles.length!==2)e.push('player_roles 必須剛好 2 個');else c.player_roles.forEach((r,i)=>{if(!isStr(r.display_name,10)||!isStr(r.address,8))e.push('player_roles['+i+'] 名稱或稱呼缺少');r.start_value=Math.max(35,Math.min(65,+r.start_value||50));r.role_id=r.role_id||('r'+(i+1));});
  if(!Array.isArray(c.units)||c.units.length!==4)e.push('units 必須剛好 4 章');else c.units.forEach((u,i)=>{const w='units['+i+']';u.unit_id='u'+(i+1);
    if(!isStr(u.title,10))e.push(w+'.title 缺少或超過 10 字');if(!tpl.includes(u.scene))e.push(w+'.scene 必須是 '+tpl.join('/'));if(!isStr(u.concept))e.push(w+'.concept 缺少');if(!isStr(u.key_quote))u.key_quote=u.title;
    if(!u.lines||!['enter','guide','dilemma','prompt'].every(k=>isStr(u.lines[k])))e.push(w+'.lines 必須有 enter、guide、dilemma、prompt');
    if(!Array.isArray(u.hotspots)||u.hotspots.length!==3)e.push(w+'.hotspots 必須剛好 3 個');else u.hotspots.forEach((h,j)=>{h.id=String(h.id||('h'+j)).toLowerCase().replace(/[^a-z0-9_]/g,'')||('h'+i+j);if(!isStr(h.label,8))e.push(w+'.hotspots['+j+'].label 缺少或超過 8 字');if(!isStr(h.text))e.push(w+'.hotspots['+j+'].text 缺少');if(!props.includes(h.prop))e.push(w+'.hotspots['+j+'].prop 必須是 '+props.join('/'));});
    if(u.hotspots&&new Set(u.hotspots.map(h=>h.id)).size!==u.hotspots.length)u.hotspots.forEach((h,j)=>h.id=h.id+'_'+i+j);
    if(!Array.isArray(u.choices)||u.choices.length!==3)e.push(w+'.choices 必須剛好 3 個');else{const ty=u.choices.map(x=>x.type).sort().join();if(ty!=='correct,misconception,suboptimal')e.push(w+'.choices 的 type 必須各一：correct、misconception、suboptimal');u.choices.forEach((x,j)=>{if(!isStr(x.text)||!isStr(x.feedback))e.push(w+'.choices['+j+'] text 或 feedback 缺少');});}
    if(!u.reactions)u.reactions={rival_on_correct:'哼……',rival_on_wrong:'看吧！',companion_on_correct:'原來如此！',companion_on_wrong:'好像不太對……'};
    if(u.challenge)delete u.challenge;vAction(u.action,w,e);vGate(u.gate,w+'.gate',e);if(!u.hints||!Array.isArray(u.hints.dilemma)||u.hints.dilemma.length!==3||!Array.isArray(u.hints.gate)||u.hints.gate.length!==3)e.push(w+'.hints 的 dilemma 和 gate 各要 3 級提示');});
  if(c.meta&&!isStr(c.meta.meter_label,6))c.meta.meter_label='理解';return e;}
function validateCarry(c){const e=[];vCommon(c,e);if(!Array.isArray(c.units)||c.units.length<3||c.units.length>5)e.push('units 必須是 3 至 5 個回合');else c.units.forEach((u,i)=>{const w='units['+i+']';u.unit_id='u'+(i+1);
    if(!isStr(u.title,10))e.push(w+'.title 缺少或過長');if(!['sort','pair','sequence','single'].includes(u.round_type))e.push(w+'.round_type 無效');if(!isStr(u.concept))e.push(w+'.concept 缺少');
    if(!u.lines||!['intro','rival_taunt','rival_interfere'].every(k=>isStr(u.lines[k])))e.push(w+'.lines 必須有 intro、rival_taunt、rival_interfere');
    const Z=Array.isArray(u.zones)?u.zones:[];Z.forEach((z,j)=>{z.id=String(z.id||('z'+j)).toLowerCase().replace(/[^a-z0-9_]/g,'')||('z'+j);if(!isStr(z.label,8))e.push(w+'.zones['+j+'].label 缺少或超過 8 字');});
    const ids=Z.map(z=>z.id);if(new Set(ids).size!==ids.length)e.push(w+'.zones 的 id 重複');const I=Array.isArray(u.items)?u.items:[];
    I.forEach((it,j)=>{if(!isStr(it.label,12))e.push(w+'.items['+j+'].label 缺少或超過 12 字');if(!ids.includes(it.answer))e.push(w+'.items['+j+'].answer 不是有效的 zone id');if(!isStr(it.explain))e.push(w+'.items['+j+'].explain 缺少');});
    u.decoys=Array.isArray(u.decoys)?u.decoys:[];u.decoys.forEach((d,j)=>{if(!isStr(d.label,12))e.push(w+'.decoys['+j+'].label 缺少或超過 12 字');if(!isStr(d.explain))e.push(w+'.decoys['+j+'].explain 缺少');});
    const t=u.round_type;if(t==='sort'&&(Z.length<2||Z.length>4||I.length<4||I.length>9))e.push(w+'（分類）需要 2 至 4 個類別、4 至 9 片竹簡');
    if(t==='pair'&&(Z.length<3||Z.length>4||I.length!==Z.length||new Set(I.map(x=>x.answer)).size!==Z.length))e.push(w+'（配對）每個位置剛好一片竹簡，3 至 4 對');
    if(t==='sequence'&&(Z.length<3||Z.length>5||I.length!==Z.length||new Set(I.map(x=>x.answer)).size!==Z.length))e.push(w+'（排序）每個位置剛好一片竹簡，3 至 5 步');
    if(t==='single'&&(Z.length!==1||I.length!==1||u.decoys.length<2))e.push(w+'（單選）需要 1 個位置、1 片正確竹簡、至少 2 片誘餌');
    if(!Array.isArray(u.hints)||u.hints.length!==3)e.push(w+'.hints 要有 3 級提示');});return e;}
const DLG_SCENES=['cafe','mtr','ferry','market'];
function validateDialogue(c){const e=[];vCommon(c,e);if(!['en-GB','zh-CN'].includes(c.meta&&c.meta.language))c.meta.language='en-GB';
  if(!Array.isArray(c.scenes)||c.scenes.length<2||c.scenes.length>4)e.push('scenes 必須是 2 至 4 個');else{const used=new Set();c.scenes.forEach((s,i)=>{const w='scenes['+i+']';
    if(!DLG_SCENES.includes(s.id))e.push(w+'.id 必須是 '+DLG_SCENES.join('/'));else if(used.has(s.id))e.push(w+'.id 重複');used.add(s.id);if(!isStr(s.title,8))e.push(w+'.title 缺少');if(!isStr(s.intro_zh))e.push(w+'.intro_zh 缺少');
    if(s.id!=='ferry'&&(!s.stranger||!isStr(s.stranger.name)))e.push(w+'.stranger.name 缺少');if(s.id==='ferry')delete s.stranger;
    if(!Array.isArray(s.turns)||s.turns.length<2||s.turns.length>3)e.push(w+'.turns 必須 2 至 3 段');else s.turns.forEach((t,j)=>{const ww=w+'.turns['+j+']';if(!['stranger','companion'].includes(t.speaker))e.push(ww+'.speaker 必須是 stranger 或 companion');if(s.id==='ferry')t.speaker='companion';
      if(!isStr(t.line)||!isStr(t.zh))e.push(ww+' 的 line 或 zh 缺少');if(!Array.isArray(t.options)||t.options.length!==4)e.push(ww+'.options 必須剛好 4 個');else{if(t.options.filter(o=>o.correct===true).length!==1)e.push(ww+' 必須剛好 1 個正確回應');t.options.forEach((o,k)=>{if(!isStr(o.text))e.push(ww+'.options['+k+'].text 缺少');if(!o.correct&&!isStr(o.why))e.push(ww+'.options['+k+'] 錯誤選項要有 why');});if(new Set(t.options.map(o=>o.text)).size!==4)e.push(ww+'.options 有重複');}});
    vGate(s.check,w+'.check',e);});}return e;}

/* ======================= 5. Assembly from fixed templates ======================= */
const ROLES_FIXED={mentor:'G',companion:'O',rival:'A',gatekeeper:'I'};
function fixSlots(c,costumes){Object.keys(ROLES_FIXED).forEach(k=>{const s=c.npc_slots[k]||{};c.npc_slots[k]={character_id:ROLES_FIXED[k],display_name:s.display_name||k,persona:s.persona||'',costume:costumes[k]||[]};});}
function assembleRPG(c,theme){const anc=theme==='ancient',wld=WORLD_THEMES.includes(theme);fixSlots(c,anc?{mentor:['ru_hat'],companion:[],rival:[],gatekeeper:['lantern']}:wld?{mentor:[],companion:[],rival:[],gatekeeper:['lantern']}:{mentor:['tie'],companion:['cap'],rival:[],gatekeeper:['beacon']});
  c.meta.meter={label:c.meta.meter_label||'理解',icon:anc||wld?'lantern':'flask'};c.meta.language='zh-Hant';
  const POS=wld?[[0,0,0],[34,0,-20],[2,0,-46],[-34,0,-70]]:anc?[[0,0,0],[30,0,-22],[2,0,-48],[-48,0,-80]]:[[0,0,0],[22,0,-14],[2,0,-32],[-20,0,-50]];
  const ENV=wld?{town_square:'world_morning',great_hall:'world_day',village:'world_morning',harbor:'world_dusk'}:anc?{market:'anc_morning',pavilion:'anc_dusk',village:'anc_bleak',mansion:'anc_night',gourd_garden:'anc_morning',winter_river:'anc_winter',great_lake:'anc_dusk',roadside_tree:'anc_morning'}:{science_lab:'campus_morning',prep_room:'campus_afternoon',corridor:'campus_noon'};
  const OFF=[[-2.6,0,-1.0],[0.3,0,-1.4],[2.7,0,-1.0]];
  const world={scene_kit:wld?'world':anc?'ancient_town':'school_campus',style:wld?theme:undefined,player_avatar:true,npc_layout:{mentor:[-3.4,0,1.0],companion:[3.4,0,1.6],rival:[3.2,0,-2.4],gatekeeper:[-3.4,0,-2.6],player:[0,0,2.6]},
    stages:c.units.map((u,i)=>({unit_id:u.unit_id,template:u.scene,position:POS[i],environment:{time:ENV[u.scene]},hotspots:u.hotspots.map((h,j)=>({id:h.id,prop:h.prop,offset:OFF[j]}))}))};
  const delta={correct:15,misconception:-20,suboptimal:-8},sc={correct:10,misconception:0,suboptimal:5};
  const game={mode:'rpg',state:{meter:{label:c.meta.meter.label,min:0,max:100,start_from:'player_role.start_value'}},scoring:{gate_first_try:10,gate_wrong_penalty:3,hint_penalty:2,gate_min:2},wrong_flash:'0x2A2440',
    chapters:c.units.map(u=>({unit_id:u.unit_id,beats:{enter:{speaker:'companion'},explore:{hotspots:u.hotspots.map(h=>h.id),require_all:true,idle_hint_sec:25},guide:{speaker:'mentor'},dilemma:{speaker:'rival'},choices:u.choices.map(ch=>({type:ch.type,meter:delta[ch.type],score:sc[ch.type]})),gate:{speaker:'gatekeeper',mastery:true}}})),
    endings:[{id:'best',min_meter:80},{id:'normal',min_meter:50},{id:'fail',min_meter:0}]};
  return {content:c,world,game,shell:'rpg',kit:wld?'kit_world':anc?'kit_ancient':'kit_campus',mode:'rpg',icon:c.meta.meter.icon};}
function assembleCarry(c){fixSlots(c,{mentor:['ru_hat'],companion:[],rival:[],gatekeeper:['lantern']});c.player={display_name:'你',color:'#E8577E'};
  const W=JSON.parse(JSON.stringify(SRC.templates.carry_world));W.rounds=W.rounds.slice(0,c.units.length);
  const DUR={sort:75,pair:60,sequence:60,single:40},INIT={sort:0,pair:1,sequence:0,single:2};
  const game={mode:'carry',scoring:{correct:10,combo_bonus:2,wrong:-5,time_bonus_per_sec:1},
    rounds:c.units.map(u=>({unit_id:u.unit_id,round_type:u.round_type,duration_sec:DUR[u.round_type]+Math.max(0,u.items.length-6)*6,zones:u.zones.map(z=>z.id),decoys:{source:'misconceptions',initial:Math.min(INIT[u.round_type],u.decoys.length),rival_drop_interval_sec:9},rival_kick_interval_sec:u.round_type==='single'?0:12,hint_time_cost_sec:5,companion_assist:{uses:1},carry_capacity:1})),stars:{}};
  return {content:c,world:W,game,shell:'carry',kit:'kit_ancient',mode:'carry2'};}
function assembleDialogue(c){fixSlots(c,{mentor:['tie'],companion:['cap'],rival:[],gatekeeper:['beacon']});const ENV={cafe:'indoor_warm',mtr:'indoor_cool',ferry:'ferry_day',market:'morning'};
  c.scenes.forEach(s=>{s.env=ENV[s.id];s.map=false;});const lang=c.meta.language;const W=JSON.parse(JSON.stringify(SRC.templates.dialogue_world));
  const game=JSON.parse(JSON.stringify(SRC.templates.dialogue_game));game.tts.lang=lang;game.speaking.lang=lang;const n=c.scenes.reduce((s,x)=>s+x.turns.length,0);
  game.endings=[{id:'best',min_score:Math.round(n*12)},{id:'normal',min_score:Math.round(n*7)},{id:'fail',min_score:0}];return {content:c,world:W,game,shell:'dialogue',kit:'kit_hk',mode:'dialogue'};}
function buildHTML(spec){let s=SRC.shells[spec.shell];const J=o=>JSON.stringify(o).replace(/<\//g,'<\\/');
  s=s.split('%%CONTENT%%').join(J(spec.content)).split('%%WORLD%%').join(J(spec.world)).split('%%GAME%%').join(J(spec.game));
  s=s.split('%%TITLE%%').join(esc(spec.content.meta.short_title)).split('%%ICON%%').join(SRC.icons[spec.icon]||'');
  s=s.replace('<script>%%KIT%%<\/script>',()=>'<script>'+SRC.kits[spec.kit]+'<\/script>');s=s.replace('%%ENGINE%%',()=>SRC.engine).replace('%%MODE%%',()=>SRC.modes[spec.mode]);return s;}
function testHarness(html){const probe='<script>(function(){var errs=[];window.addEventListener("error",function(e){errs.push(String(e.message||e));});setTimeout(function(){var ok=!!(window.ENG&&document.querySelector("canvas"))&&!errs.length,cover=null;try{if(ok&&ENG.renderer){ENG.renderer.render(ENG.scene,ENG.camera);var c=ENG.renderer.domElement,t=document.createElement("canvas");t.width=480;t.height=270;var x=t.getContext("2d"),r=c.width/c.height,sw=c.width,sh=c.height;if(r>16/9){sw=c.height*16/9;}else{sh=c.width*9/16;}x.drawImage(c,(c.width-sw)/2,(c.height-sh)/2,sw,sh,0,0,480,270);cover=t.toDataURL("image/jpeg",.74);}}catch(e){}parent.postMessage({gpTest:1,ok:ok,errs:errs,cover:cover},"*");},6500);})();<\/script>';
  return html.replace('<head>','<head>'+probe);}
function autoTest(html){return new Promise(res=>{const f=document.createElement('iframe');f.style.cssText='position:fixed;left:-2000px;top:0;width:960px;height:540px;opacity:0;pointer-events:none';f.setAttribute('aria-hidden','true');f.setAttribute('tabindex','-1');
  const on=e=>{if(e.data&&e.data.gpTest&&e.source===f.contentWindow){window.removeEventListener('message',on);clearTimeout(to);f.remove();res(e.data);}};window.addEventListener('message',on);
  const to=setTimeout(()=>{window.removeEventListener('message',on);f.remove();res({ok:false,errs:['測試逾時']});},25000);document.body.appendChild(f);f.srcdoc=testHarness(html);});}

/* ======================= 6. Language ======================= */
const I18N={
 zh:{title:'OpenMAIC-GamePlay',tag:'一課書，變成一個 3D 學習遊戲',tabStudio:'遊戲工作室',tabLib:'遊戲庫',engine:'AI 引擎',newChat:'新課題',
  greet:'嗨！我是 <b>G 老師</b>。今天想教哪一課？告訴我<b>學科、級別、課題和學習目標</b>，再貼上教材就更好了。我和小 O、阿 A、I 隊長會一起把它變成遊戲！',
  placeholder:'今天想教甚麼？例如：中二科學，酸和鹼……（Ctrl＋Enter 送出）',send:'出發！',gameLang:'遊戲語言',
  ex1:'中文《木蘭辭》',ex1t:'中一中文科，課題是《木蘭辭》。學習目標：理解木蘭的形象、文中的互文和誇張手法、忠孝兩全的主題。',ex2:'科學：酸和鹼',ex2t:'中二科學，課題是酸和鹼。學習目標：認識常見酸鹼的性質、用指示劑分辨酸鹼、中和作用在日常生活的應用，以及處理酸鹼的安全守則。',ex3:'英文：問路',ex3t:'小五英文，課題是 asking for and giving directions。學生要學會問路和指路的句式，例如 Excuse me, how do I get to…? Go straight… Turn left at…，以及禮貌用語。',
  steps:['讀課題','揀玩法','寫劇本','捉錯處','搭場景','試玩'],thinking:'讓我讀一讀這一課',understood:'這一課我讀懂了！',subject:'學科',topic:'課題',summary:'概要',keypoints:'知識點',mis:'常見錯誤',
  pick:'你想玩哪一種？',best:'最推薦',suggest:'建議',match:'匹配度',bestNotGen:'最匹配的其實是「{m}」，不過這類遊戲需要專屬設計{d}。先試試這些可以馬上做的：',demoHint:'，可以在遊戲庫玩玩示範《{d}》',
  stage:'選一個舞台！',th_modern:'現代校園',th_modernD:'實驗室、準備室、走廊',th_ancient:'中國古代',th_ancientD:'市集、山亭、村落、府第',th_europe:'歐洲',th_europeD:'市鎮、城堡、風車村、港口',th_america:'美洲',th_americaD:'紅磚小鎮、會堂、拓荒村、港口',th_japan:'日本',th_japanD:'町家、天守閣、稻田、港口',th_korea:'韓國',th_koreaD:'韓屋、宮殿、村落、港口',
  planTitle:'動手做計劃',planSub:'以下動作取自課題內容。請勾選要放進遊戲的動作，再建立遊戲。',planNone:'本章沒有動作（只有故事抉擇和問答）',planOk:'已在教材中找到',planUnknown:'未能核實（沒有提供教材全文），請自行判斷',planFail:'教材中找不到這句，建議不要使用',planFrom:'根據：',planBuild:'建立遊戲',
  clear:'清除',attach:'附加檔案',attHint:'可附加 Word、PowerPoint、PDF 或文字檔',reading:'正在讀取 {f}',attOk:'已讀取 {f}（{n} 字）',oldFormat:'舊格式 .doc／.ppt 無法讀取，請另存為 .docx／.pptx 或 PDF。',badType:'不支援這種檔案，請用 Word、PowerPoint、PDF 或文字檔。',attFail:'未能讀取 {f}：{e}',attNote:'（附件 {n} 個）',noText:'這個檔案讀不到文字（可能是掃描圖片）。',modern:'現代校園',modernD:'實驗室、準備室、走廊',ancient:'古代場景',ancientD:'市集、山亭、村落、府第……',carryNote:'小提示：限時搬運暫時只有古代書院場景，現代題材也可以玩，只是會變得古色古香。',
  writing:'我在寫「{m}」的劇本，大約一至兩分鐘',caught:'嘿嘿！我捉到 {n} 個錯處，退回去改（第 {r} 次）',building:'正在搭建 3D 場景',testing:'等我先試玩一下！',
  done:'完成啦！《{t}》',reviewNote:'內容由 AI 生成，請先試玩並核對知識內容。想修改？直接告訴我，例如「第二章的選項太難」。',play:'試玩',save:'存入遊戲庫',dl:'下載',regen:'重新生成',
  fail:'哎呀，這次沒有成功：{e}',retry:'再試一次',needMore:'資料還差一點點：',saved:'已存入遊戲庫！',close:'關閉',
  libTitle:'遊戲庫',libSub:'老師們做的遊戲和所有示範遊戲，都在這裡。',mine:'我的遊戲',mineSub:'在遊戲工作室完成後存入的遊戲',demos:'示範遊戲',all:'全部',start:'開始遊戲',del:'刪除',emptyMine:'還沒有自己的遊戲。到「遊戲工作室」做一個，完成後按「存入遊戲庫」。',
  engTitle:'AI 引擎',engSub:'選擇一個 AI 來幫你寫遊戲',model:'模型',custom:'或輸入其他模型名稱',key:'API 金鑰',keyPh:'在這裡貼上 API 金鑰',remember:'在這部裝置記住金鑰',builtin:'claude.ai 內建：不需要金鑰',getKey:'取得金鑰：',region:'地區',intl:'國際（新加坡）',cn:'中國內地',
  sandbox:'在 claude.ai 內，瀏覽器安全設定只允許內建的 Claude。GPT、Gemini、Qwen 請在學校自行架設的版本使用（例如 GitHub Pages）。',keyNote:'金鑰只保存在你的瀏覽器，不會上傳到我們的伺服器。學校正式使用時，建議經學校伺服器轉發。',qwenNote:'通義千問的 API 未必接受瀏覽器直接連線；如未能連接，請經學校伺服器轉發。',
  errNoBuiltin:'未能連接內建的 Claude（可能未獲授權）。',errTrunc:'模型輸出被截斷，請改用較強的模型或縮短教材。',errSandbox:'在 claude.ai 內不能直接連接 {p}，請改用 Claude，或在自行架設的版本使用。',errNoKey:'請先在「AI 引擎」貼上 {p} 的 API 金鑰。',errNoJson:'模型沒有輸出 JSON',errNet:'瀏覽器未能連接 {p}。可能是網絡封鎖或該服務不接受瀏覽器直接連線：請在「進階設定」填寫代理網址（說明見 README）。',test:'測試連線',testing2:'連線中……',testOk:'已連接！{m} 可以使用。',testFail:'未能連接：{e}',adv:'進階設定',proxy:'代理網址（可選）',proxyPh:'例如 https://my-proxy.workers.dev',proxyNote:'填寫後，所有 AI 請求會經這個網址轉發。設定方法見 README 的「代理伺服器」。',
  parts:{dialogue:'個場景',rpg:'章',carry:'個回合'},rt:{sort:'分類',pair:'配對',sequence:'排序',single:'單選'},turns:'段對話',confirmDel:'刪除《{t}》？',you:'你'},
 en:{title:'OpenMAIC-GamePlay',tag:'Turn any lesson into a 3D learning game',tabStudio:'Game Studio',tabLib:'Game Library',engine:'AI Engine',newChat:'New lesson',
  greet:"Hi! I'm <b>Teacher G</b>. What are we teaching today? Tell me the <b>subject, level, topic and learning goals</b>, and paste in your materials if you can. O, A, Captain I and I will turn it into a game!",
  placeholder:'What are you teaching today? e.g. S2 Science, acids and alkalis… (Ctrl+Enter to send)',send:"Let's go!",gameLang:'Game language',
  ex1:'Chinese: Mulan',ex1t:'S1 Chinese Language. Topic: the Ballad of Mulan (木蘭辭). Goals: understand Mulan as a character, the use of hyperbole and parallel phrasing, and the theme of loyalty and filial piety.',ex2:'Science: acids & alkalis',ex2t:'S2 Science. Topic: acids and alkalis. Goals: properties of common acids and alkalis, using indicators, neutralisation in daily life, and safety when handling acids and alkalis.',ex3:'English: directions',ex3t:'P5 English. Topic: asking for and giving directions. Students learn phrases like "Excuse me, how do I get to…?", "Go straight…", "Turn left at…", and polite expressions.',
  steps:['Read','Pick','Write','Check','Build','Test'],thinking:'Let me read this lesson',understood:'Got it! Here is your lesson',subject:'Subject',topic:'Topic',summary:'Summary',keypoints:'Key points',mis:'Misconceptions',
  pick:'Which game shall we make?',best:'Top pick',suggest:'Suggested',match:'Match',bestNotGen:'The best fit is actually “{m}”, but that kind of game needs a custom build{d}. Try one of these instead:',demoHint:' — try the demo “{d}” in the library',
  stage:'Pick a stage!',th_modern:'Modern school',th_modernD:'Lab, prep room, corridor',th_ancient:'Ancient China',th_ancientD:'Market, pavilion, village, mansion',th_europe:'Europe',th_europeD:'Town, castle, windmill village, harbour',th_america:'America',th_americaD:'Brick town, assembly hall, frontier, harbour',th_japan:'Japan',th_japanD:'Machiya town, castle keep, rice fields, harbour',th_korea:'Korea',th_koreaD:'Hanok town, palace, village, harbour',
  planTitle:'Hands-on plan',planSub:'These actions come from the lesson content. Tick the ones to include, then build the game.',planNone:'No action in this chapter (story choices and questions only)',planOk:'found in your material',planUnknown:'not verified (no full material given): your call',planFail:'not found in your material: not recommended',planFrom:'From: ',planBuild:'Build the game',
  clear:'Clear',attach:'Attach file',attHint:'Attach Word, PowerPoint, PDF or text files',reading:'Reading {f}',attOk:'Read {f} ({n} characters)',oldFormat:'Old .doc/.ppt files cannot be read. Save as .docx/.pptx or PDF.',badType:'Unsupported file. Use Word, PowerPoint, PDF or a text file.',attFail:'Could not read {f}: {e}',attNote:' ({n} attachments)',noText:'No text found in this file (it may be a scanned image).',modern:'Modern school',modernD:'Lab, prep room, corridor',ancient:'Ancient China',ancientD:'Market, pavilion, village, mansion…',carryNote:'Tip: the timed relay only has ancient academy scenes for now, so modern topics get a classical look.',
  writing:'Writing the “{m}” script — about a minute or two',caught:'Ha! I caught {n} mistakes. Sending them back (round {r})',building:'Building the 3D scenes',testing:'Let me test-play it first!',
  done:'Ready! “{t}”',reviewNote:'Made by AI — please play it through and check the facts first. Want changes? Just tell me, e.g. “chapter 2 is too hard”.',play:'Play',save:'Save to library',dl:'Download',regen:'Regenerate',
  fail:'Oops, that did not work: {e}',retry:'Try again',needMore:'I need a little more:',saved:'Saved to the library!',close:'Close',
  libTitle:'Game Library',libSub:'Games made by teachers, plus every demo game.',mine:'My games',mineSub:'Games you saved from the studio',demos:'Demo games',all:'All',start:'Play',del:'Delete',emptyMine:'No games yet. Make one in the Game Studio, then press “Save to library”.',
  engTitle:'AI Engine',engSub:'Choose the AI that writes your game',model:'Model',custom:'Or type another model name',key:'API key',keyPh:'Paste your API key here',remember:'Remember the key on this device',builtin:'Built into claude.ai: no key needed',getKey:'Get a key: ',region:'Region',intl:'International (Singapore)',cn:'Mainland China',
  sandbox:'Inside claude.ai, browser security only allows the built-in Claude. Use GPT, Gemini or Qwen in a self-hosted copy (e.g. GitHub Pages).',keyNote:'Your key stays in your browser and is never sent to our servers. For school-wide use, route requests through a school server.',qwenNote:'Qwen’s API may not accept direct browser connections; if it fails, route requests through a school server.',
  errNoBuiltin:'Could not reach the built-in Claude (permission may be needed).',errTrunc:'The model output was cut off. Try a stronger model or shorter materials.',errSandbox:'{p} cannot be reached from inside claude.ai. Use Claude here, or a self-hosted copy.',errNoKey:'Paste your {p} API key in the AI Engine panel first.',errNoJson:'The model did not return JSON',errNet:'Your browser could not reach {p}. The network may block it, or the service may not accept direct browser calls: set a proxy URL under Advanced (see the README).',test:'Test connection',testing2:'Connecting…',testOk:'Connected! {m} is ready.',testFail:'Could not connect: {e}',adv:'Advanced',proxy:'Proxy URL (optional)',proxyPh:'e.g. https://my-proxy.workers.dev',proxyNote:'When set, all AI requests go through this address. See “Proxy server” in the README.',
  parts:{dialogue:'scenes',rpg:'chapters',carry:'rounds'},rt:{sort:'sort',pair:'match',sequence:'order',single:'pick one'},turns:'dialogues',confirmDel:'Delete “{t}”?',you:'You'}};
const T=(k,v)=>{let s=(I18N[state.lang][k]!=null?I18N[state.lang][k]:I18N.zh[k]);if(typeof s==='string'&&v)Object.keys(v).forEach(x=>s=s.split('{'+x+'}').join(v[x]));return s;};
const MODE_EN={rpg:['RPG Adventure','Make choices inside a story and see the consequences'],carry:['Timed Relay','Sort, match and order answers against the clock'],dialogue:['Dialogue Quest','Hold real conversations in English or Putonghua around Hong Kong'],escape:['Escape Room','Collect clues and crack puzzles'],simulation:['Sim Lab','Change variables and watch what happens'],exploration:['Exploration','Walk into the scene on a field trip'],detective:['Detective','Compare sources and present evidence'],management:['Management','Allocate resources over several rounds'],building:['Builder Workshop','Build, code and design'],rhythm:['Rhythm Stage','Perform on the beat']};
const modeName=k=>state.lang==='en'?MODE_EN[k][0]:MODES[k].name,modeWhat=k=>state.lang==='en'?MODE_EN[k][1]:MODES[k].what;
function reasonText(k,a){if(state.lang!=='en')return reasonFor(k,a);const t=a.tags;return {rpg:(t.has_dilemma?'Judgement calls become choices inside a story.':'Common mistakes become choices in the story.'),carry:'Key points fit on short slips'+(t.has_categories?' and sort into groups':'')+', great for quick revision.',dialogue:'The goal is real conversation, so students practise it in everyday scenes.'}[k]||MODE_EN[k][1];}
const SUBJ_EN={中文:'Chinese',英文:'English',科學:'Science',數學:'Maths',地理:'Geography',中史:'Chinese History',人文:'Humanities',資訊科技:'ICT',公社:'Citizenship',經濟:'Economics'};
const DEMO_EN={'魚我所欲也':['Fish or Bear’s Paw','A poor scholar’s journey through market, pavilion, famine village and mansion: choose between life and righteousness.'],'論語：杏壇搬運戰':['The Analects Relay','Sort, match and order bamboo slips against the clock while the rival plants traps.'],
 '逍遙遊：大瓠與大樹':['The Gourd and the Tree','Watch Zhuangzi’s parables come alive, then answer Huizi for him.'],'始得西山宴遊記':['Discovering West Hill','Travel with Liu Zongyuan from Yongzhou to the summit of West Hill.'],'賣油翁':['The Old Oil Seller','Match by archery and oil-pouring, then practise until practice makes perfect.'],
 '山居秋暝':['Autumn Evening in the Hills','Recite Wang Wei’s poem on the beat and bring the mountain to life line by line.'],'HK Buddy':['HK Buddy','Show exchange student Sam around Hong Kong in English.'],'地盤三視圖':['Site Views','Operate a tower crane to build structures that match the engineer’s three views.'],
 '翠溪考察':['River Field Trip','Walk a Hong Kong river from source to sea, measure it, and analyse your own data.'],'送貨機械人':['Delivery Robot','Program a robot with blocks to deliver parcels through a Hong Kong street.'],'謠言查證':['Rumour Check','Verify a viral family-chat rumour, then correct it kindly.'],
 '實驗室安全':['Lab Safety','Handle four lab accidents the safe way, hands-on.'],'浮與沉':['Float or Sink','Test what floats, change one variable at a time, and float an egg in salt water.'],'赤壁疑案':['The Red Cliffs Case','Cross-examine sources to separate history from legend.'],'檸檬茶小店':['Lemon Tea Stall','Run a drinks stall for a week: prices, stock and the weather.']};
const subjLabel=s=>state.lang==='en'?(SUBJ_EN[s]||s):s;

/* ======================= 7. Art ======================= */
const PAL={G:'#FF8A1C',O:'#10C77A',A:'#1677E8',I:'#F5B800'};
const WHO={zh:{G:'G 老師',O:'小 O',A:'阿 A',I:'I 隊長'},en:{G:'Teacher G',O:'O',A:'A',I:'Captain I'}};
function mascot(id,cls){const c=PAL[id],eye=(x,y)=>'<g class="eye"><circle cx="'+x+'" cy="'+y+'" r="4.2" fill="#fff"/><circle cx="'+x+'" cy="'+y+'" r="2.3" fill="#1B2A4A"/></g>';
  const body={A:'<path d="M17 3 L31 27 H3 Z" fill="'+c+'" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"/>'+eye(13,19)+eye(21,19),I:'<rect x="11" y="2" width="12" height="27" rx="3" fill="'+c+'"/>'+eye(13,11)+eye(21,11),
    G:'<path d="M26 9 A11 11 0 1 0 26 25" stroke="'+c+'" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M20 17 L29 17 L29 26" stroke="'+c+'" stroke-width="4" fill="none" stroke-linecap="round"/>'+eye(12,7)+eye(19,7),
    O:'<circle cx="17" cy="17" r="10" stroke="'+c+'" stroke-width="6" fill="none"/>'+eye(10,8)+eye(17,6)}[id];
  const legs='<g class="legs"><rect x="11" y="28" width="3.4" height="9" rx="1.7" fill="'+c+'"/><rect x="19.6" y="28" width="3.4" height="9" rx="1.7" fill="'+c+'"/><ellipse cx="12.5" cy="38.6" rx="3.8" ry="2.1" fill="'+c+'"/><ellipse cx="21.5" cy="38.6" rx="3.8" ry="2.1" fill="'+c+'"/></g>';
  return '<svg class="mascot '+(cls||'')+'" viewBox="0 0 34 42" aria-hidden="true">'+legs+body+'</svg>';}
const TEACHER='<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="#FFE8A3"/><path d="M9 25 L22 12 L25 15 L12 28 L8 29 Z" fill="#FF6B6B"/><path d="M22 12 L24 10 L27 13 L25 15 Z" fill="#1B2A4A"/><path d="M8 29 L9 25 L12 28 Z" fill="#1B2A4A"/></svg>';
const MODE_ART={rpg:['#5B6CFF','<svg viewBox="0 0 64 64"><path d="M32 6 L52 14 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V14 Z" fill="#FFD23F" stroke="#fff" stroke-width="3"/><path d="M32 18 V44 M24 30 H40" stroke="#5B6CFF" stroke-width="5" stroke-linecap="round"/></svg>'],
  carry:['#FF9F1C','<svg viewBox="0 0 64 64"><g stroke="#fff" stroke-width="2.5"><rect x="12" y="10" width="9" height="44" rx="3" fill="#FFF1C9"/><rect x="23" y="8" width="9" height="46" rx="3" fill="#FFE08A"/><rect x="34" y="10" width="9" height="44" rx="3" fill="#FFF1C9"/><rect x="45" y="12" width="8" height="40" rx="3" fill="#FFE08A"/></g><path d="M8 22 H56 M8 42 H56" stroke="#B85C00" stroke-width="3"/></svg>'],
  dialogue:['#2EC4B6','<svg viewBox="0 0 64 64"><path d="M8 12 H40 a6 6 0 0 1 6 6 V32 a6 6 0 0 1 -6 6 H22 L12 46 V38 H8 a6 6 0 0 1 -6 -6 V18 a6 6 0 0 1 6 -6Z" fill="#fff"/><path d="M28 28 H56 a6 6 0 0 1 6 6 V46 a6 6 0 0 1 -6 6 H54 V60 L44 52 H28 a6 6 0 0 1 -6 -6 V34 a6 6 0 0 1 6 -6Z" fill="#FFD23F"/><circle cx="16" cy="25" r="2.6" fill="#2EC4B6"/><circle cx="24" cy="25" r="2.6" fill="#2EC4B6"/><circle cx="32" cy="25" r="2.6" fill="#2EC4B6"/></svg>'],
  escape:['#8E6CFF','<svg viewBox="0 0 64 64"><circle cx="22" cy="32" r="12" fill="none" stroke="#FFD23F" stroke-width="6"/><path d="M33 32 H58 M50 32 V42 M57 32 V40" stroke="#FFD23F" stroke-width="6" stroke-linecap="round"/></svg>'],
  simulation:['#20A4F3','<svg viewBox="0 0 64 64"><path d="M24 6 H40 V22 L54 52 C56 57 52 60 47 60 H17 C12 60 8 57 10 52 L24 22 Z" fill="#fff"/><path d="M15 44 H49 L54 52 C56 57 52 60 47 60 H17 C12 60 8 57 10 52 Z" fill="#FFD23F"/></svg>'],
  exploration:['#3BB273','<svg viewBox="0 0 64 64"><path d="M2 54 L22 20 L34 38 L44 26 L62 54 Z" fill="#fff"/><path d="M22 20 L28 30 L18 30 Z" fill="#FFD23F"/><path d="M14 58 C24 46 36 52 48 40" stroke="#FFD23F" stroke-width="4" fill="none" stroke-dasharray="5 4"/></svg>'],
  detective:['#E2557B','<svg viewBox="0 0 64 64"><circle cx="26" cy="26" r="16" fill="#fff" stroke="#FFD23F" stroke-width="6"/><path d="M38 38 L56 56" stroke="#FFD23F" stroke-width="8" stroke-linecap="round"/></svg>'],
  management:['#F2A541','<svg viewBox="0 0 64 64"><ellipse cx="32" cy="48" rx="20" ry="7" fill="#FFF1C9"/><ellipse cx="32" cy="38" rx="20" ry="7" fill="#fff"/><ellipse cx="32" cy="28" rx="20" ry="7" fill="#FFF1C9"/><ellipse cx="32" cy="18" rx="20" ry="7" fill="#fff"/></svg>'],
  building:['#F6AE2D','<svg viewBox="0 0 64 64"><path d="M14 58 V10 M14 10 H56 M14 18 L24 10" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M48 10 V24" stroke="#fff" stroke-width="3"/><rect x="40" y="24" width="16" height="12" fill="#1B2A4A"/><rect x="34" y="44" width="24" height="14" fill="#fff"/></svg>'],
  rhythm:['#C65BCF','<svg viewBox="0 0 64 64"><path d="M24 48 V12 L52 6 V42" stroke="#fff" stroke-width="5" fill="none"/><ellipse cx="18" cy="48" rx="8" ry="6" fill="#FFD23F"/><ellipse cx="46" cy="42" rx="8" ry="6" fill="#FFD23F"/></svg>']};
const STAGE_ART={europe:'<svg viewBox="0 0 64 64"><path d="M10 56 V26 L18 18 L26 26 V56 Z M38 56 V20 L46 10 L54 20 V56 Z" fill="#fff"/><rect x="24" y="34" width="16" height="22" fill="#FFD23F"/><path d="M24 34 L32 26 L40 34" fill="#FFD23F"/></svg>',america:'<svg viewBox="0 0 64 64"><rect x="10" y="30" width="44" height="26" fill="#fff"/><path d="M6 30 L32 16 L58 30 Z" fill="#FFD23F"/><rect x="28" y="4" width="8" height="14" fill="#fff"/><rect x="28" y="42" width="8" height="14" fill="#2A4A8A"/></svg>',japan:'<svg viewBox="0 0 64 64"><path d="M6 16 Q32 10 58 16 L56 22 H8 Z" fill="#fff"/><rect x="12" y="24" width="40" height="5" fill="#fff"/><rect x="16" y="22" width="6" height="36" fill="#fff"/><rect x="42" y="22" width="6" height="36" fill="#fff"/><circle cx="32" cy="44" r="8" fill="#FFD23F"/></svg>',korea:'<svg viewBox="0 0 64 64"><path d="M4 26 Q32 8 60 26 L54 30 H10 Z" fill="#fff"/><rect x="14" y="30" width="36" height="20" fill="#FFD23F"/><rect x="18" y="30" width="4" height="20" fill="#fff"/><rect x="42" y="30" width="4" height="20" fill="#fff"/><rect x="8" y="50" width="48" height="6" fill="#fff"/></svg>'};
const MODE_OF_DEMO={'RPG 冒險':'rpg','限時搬運':'carry','密室逃脫':'escape','模擬實驗室':'simulation','探索漫遊':'exploration','偵探查案':'detective','經營決策':'management','對話闖關':'dialogue','建造工坊':'building','節奏表演':'rhythm'};
function modeKeyFromLabel(m){for(const k in MODE_OF_DEMO)if(m.startsWith(k))return MODE_OF_DEMO[k];if(/配對/.test(m))return 'carry';if(/編程|建造/.test(m))return 'building';return 'exploration';}
const SUBJ={中文:'#FF8A1C',英文:'#4C7BF4',科學:'#2EC4B6',數學:'#8E6CFF',地理:'#3BB273',中史:'#E2557B',人文:'#F2A541',資訊科技:'#20A4F3',公社:'#C65BCF',經濟:'#F6AE2D'};
const subjColor=s=>{for(const k in SUBJ)if((s||'').includes(k))return SUBJ[k];if(/英國語文|English/.test(s))return SUBJ.英文;if(/中國語文|Chinese/.test(s))return SUBJ.中文;if(/歷史|History/.test(s))return SUBJ.中史;if(/Science|科學/.test(s))return SUBJ.科學;return '#7A86A8';};
const PLAY='<svg viewBox="0 0 24 24"><path d="M6 4 L20 12 L6 20 Z" fill="#1B2A4A"/></svg>';
function coverHTML(src,label,art){return '<button class="cover" aria-label="'+esc(T('play')+' '+label)+'">'+(src?'<img src="'+src+'" alt="" loading="lazy">':'<span class="nocover" style="background:'+(art?art[0]:'#5B6CFF')+'">'+(art?art[1]:'')+'</span>')+'<span class="pl"><span>'+PLAY+'</span></span></button>';}

/* background confetti shapes */
(function(){const sky=$('sky');const shapes=[['G','#FF8A1C'],['O','#10C77A'],['A','#1677E8'],['I','#F5B800']];
  for(let i=0;i<14;i++){const [k,c]=shapes[i%4];const d=document.createElement('span');d.className='fl fl'+k;d.style.cssText='left:'+(Math.random()*96)+'%;top:'+(Math.random()*90)+'%;--c:'+c+';--s:'+(14+Math.random()*26)+'px;--t:'+(14+Math.random()*16)+'s;--d:-'+(Math.random()*20)+'s;--r:'+(Math.random()*360)+'deg';sky.appendChild(d);}})();
function confetti(){const cv=$('confetti'),x=cv.getContext('2d');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;cv.width=innerWidth;cv.height=innerHeight;const cols=['#FF8A1C','#10C77A','#1677E8','#F5B800','#FF6B6B','#8E6CFF'];
  const P=[...Array(150)].map(()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.45,vx:(Math.random()-.5)*16,vy:-Math.random()*16-6,s:5+Math.random()*7,c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*6,vr:(Math.random()-.5)*.4}));let f=0;
  (function tick(){x.clearRect(0,0,cv.width,cv.height);P.forEach(p=>{p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);x.restore();});if(++f<150)requestAnimationFrame(tick);else x.clearRect(0,0,cv.width,cv.height);})();}

/* ======================= 8. Chat & level track ======================= */
const STEP_IDS=['analyse','recommend','generate','validate','assemble','test'],STEP_WHO=['G','G','O','A','O','I'];
function drawTrack(){$('track').innerHTML=STEP_IDS.map((id,i)=>'<li class="stop" data-id="'+id+'" data-status="idle"><span class="pad"><b>'+(i+1)+'</b></span><span class="lab">'+T('steps')[i]+'</span></li>').join('')+'<li class="runner" id="runner" aria-hidden="true">'+mascot('G','hopper')+'</li>';}
let runAt=0;function moveRunner(){const r=$('runner'),s=document.querySelectorAll('#track .stop')[runAt];if(!r||!s)return;r.style.left=(s.offsetLeft+s.offsetWidth/2-17)+'px';r.innerHTML=mascot(STEP_WHO[runAt],'hopper');}
function setStep(id,status){const el=document.querySelector('.stop[data-id="'+id+'"]');if(!el)return;el.dataset.status=status;const i=STEP_IDS.indexOf(id);if(status!=='idle'){runAt=i;moveRunner();}}
function resetSteps(from){let on=false;STEP_IDS.forEach(id=>{if(id===from)on=true;if(on)setStep(id,'idle');});runAt=Math.max(0,STEP_IDS.indexOf(from));moveRunner();}
addEventListener('resize',moveRunner);
function addMsg(role,html,cls,who){const m=document.createElement('div');m.className='msg '+role+(cls?' '+cls:'');const w=who||'G';
  m.innerHTML='<span class="av" aria-hidden="true">'+(role==='user'?TEACHER:mascot(w,'talk'))+'</span><div class="bub"'+(role==='user'?'':' style="--c:'+PAL[w]+'"')+'>'+(role==='user'?'':'<span class="who">'+WHO[state.lang][w]+'</span>')+html+'</div>';
  $('msgs').appendChild(m);requestAnimationFrame(()=>m.classList.add('in'));$('msgs').scrollTop=1e9;return m;}
const botSay=(html,who)=>addMsg('bot',html,'',who);
function typing(text,who){return addMsg('bot','<span class="typing"><i></i><i></i><i></i></span> <span class="tt">'+text+'</span>','pending',who);}
function setTyping(m,text,who){m.querySelector('.av').innerHTML=mascot(who,'talk');const b=m.querySelector('.bub');b.style.setProperty('--c',PAL[who]);b.querySelector('.who').textContent=WHO[state.lang][who];b.querySelector('.tt').textContent=text;}

/* ======================= 9. Pipeline ======================= */
async function analyse(){const text=state.chat.filter(m=>m.role==='user').map(m=>m.text).join('\n');resetSteps('analyse');setStep('analyse','run');
  const th=typing(T('thinking'),'G');
  try{let a=await llmJSON(analysisPrompt(text));let e=validateAnalysis(a);if(e.length){a=await llmJSON(analysisPrompt(text)+'\n上次輸出的問題：'+e.join('；'));e=validateAnalysis(a);}if(e.length)throw new Error(e.join('；'));
    th.remove();state.analysis=a;setStep('analyse','done');
    if(!a.enough_info&&a.follow_up){botSay(T('needMore')+' '+esc(a.follow_up),'G');return;}showAnalysis(a);}
  catch(err){th.remove();setStep('analyse','fail');failMsg(err,()=>analyse());}}
function failMsg(err,again){const m=botSay(T('fail',{e:esc(err.message)})+'<div class="acts"><button class="gbtn">'+T('retry')+'</button></div>','A');m.querySelector('.gbtn').onclick=again;}
function showAnalysis(a){const r=recommend(a);state.recs=r;setStep('recommend','done');
  botSay('<b class="h">'+T('understood')+'</b><dl class="an"><dt>'+T('subject')+'</dt><dd>'+esc(a.subject)+' · '+esc(a.level)+'</dd><dt>'+T('topic')+'</dt><dd>'+esc(a.topic)+'</dd><dt>'+T('summary')+'</dt><dd>'+esc(a.summary)+'</dd><dt>'+T('keypoints')+'</dt><dd class="kp">'+a.key_points.map(k=>'<span>'+esc(k)+'</span>').join('')+'</dd>'+(a.misconceptions.length?'<dt>'+T('mis')+'</dt><dd class="kp mis">'+a.misconceptions.map(k=>'<span>'+esc(k)+'</span>').join('')+'</dd>':'')+'</dl>','G');
  const best=r.best;const note=best.gen?'':'<p class="warn">'+T('bestNotGen',{m:modeName(best.k),d:best.demo?T('demoHint',{d:best.demo}):''})+'</p>';
  const m=botSay('<b class="h">'+T('pick')+'</b>'+note+'<div class="recs"></div>','G');const box=m.querySelector('.recs');
  r.gen.slice(0,3).forEach((g,i)=>{const art=MODE_ART[g.k];const b=document.createElement('button');b.className='tile';b.style.setProperty('--i',i);
    b.innerHTML='<span class="art" style="background:'+art[0]+'">'+art[1]+(i===0?'<span class="badge">★ '+T('best')+'</span>':'')+'</span><span class="tb"><span class="tn">'+modeName(g.k)+'</span><span class="tw">'+esc(reasonText(g.k,a))+'</span><span class="xp"><i style="--w:'+Math.round(g.score*100)+'%"></i></span><span class="xpl">'+T('match')+' '+Math.round(g.score*100)+'%</span></span>';
    b.onclick=()=>chooseMode(g.k);box.appendChild(b);});}
function chooseMode(k){if(state.busy)return;const a=state.analysis;state.mode=k;
  if(k==='rpg'){const m=botSay('<b class="h">'+T('stage')+'</b><div class="recs"></div>','O');const box=m.querySelector('.recs');const want={chinese_ancient:'ancient',modern:'modern'}[a.culture]||a.culture;
    [['modern','#20A4F3',MODE_ART.simulation[1]],['ancient','#FF9F1C',MODE_ART.exploration[1]],['europe','#B8322A',STAGE_ART.europe],['america','#2A4A8A',STAGE_ART.america],['japan','#C8321E',STAGE_ART.japan],['korea','#2E8A6A',STAGE_ART.korea]].forEach(([t,bg,art],i)=>{const b=document.createElement('button');b.className='tile';b.style.setProperty('--i',i);
      b.innerHTML='<span class="art" style="background:'+bg+'">'+art+(want===t?'<span class="badge">★ '+T('suggest')+'</span>':'')+'</span><span class="tb"><span class="tn">'+T('th_'+t)+'</span><span class="tw">'+T('th_'+t+'D')+'</span></span>';b.onclick=()=>{state.theme=t;generate();};box.appendChild(b);});return;}
  if(k==='carry'&&a.era==='modern')botSay(T('carryNote'),'O');if(k==='dialogue'&&a.language_target==='none')a.language_target='en';
  state.theme=k==='carry'?'ancient':'hk';generate();}
async function generate(feedback){if(state.busy)return;state.busy=true;lock(true);const a=state.analysis,k=state.mode;resetSteps('generate');setStep('generate','run');
  const p=k==='rpg'?rpgPrompt(a,state.theme):k==='carry'?carryPrompt(a):dialoguePrompt(a);const V=c=>k==='rpg'?validateRPG(c,state.theme):k==='carry'?validateCarry(c):validateDialogue(c);
  const prog=typing(T('writing',{m:modeName(k)}),'O');let prog2=null;
  try{let prompt=p;if(feedback&&state.spec)prompt+='\n\n老師對上一版的修改要求：'+feedback+'\n上一版內容（請在此基礎上修改，輸出完整 JSON）：\n'+JSON.stringify(state.spec.content);
    let c=await llmJSON(prompt);setStep('generate','done');setStep('validate','run');let errs=V(c),round=0;
    while(errs.length&&round<2){round++;setTyping(prog,T('caught',{n:errs.length,r:round}),'A');c=await llmJSON(p+'\n\n你上一次的輸出有以下問題，請全部修正，並輸出完整的 JSON：\n- '+errs.slice(0,25).join('\n- ')+'\n\n上一次的輸出：\n'+JSON.stringify(c));errs=V(c);}
    if(errs.length){setStep('validate','fail');throw new Error(errs.slice(0,6).join('；'));}
    setStep('validate','done');if(k==='rpg'&&c.units.some(u=>u.action)){checkEvidence(c);prog.remove();await approvePlan(c);prog2=typing(T('building'),'O');}else setTyping(prog,T('building'),'O');setStep('assemble','run');
    const spec=k==='rpg'?assembleRPG(c,state.theme):k==='carry'?assembleCarry(c):assembleDialogue(c);spec.meta={subject:a.subject,level:a.level,topic:a.topic,modeName:MODES[k].name,modeKey:k,theme:state.theme,model:state.lastModel,created:Date.now()};
    const html=buildHTML(spec);setStep('assemble','done');setStep('test','run');setTyping(prog,T('testing'),'I');const t=await autoTest(html);
    if(!t.ok){setStep('test','fail');throw new Error((t.errs||[]).join('；'));}setStep('test','done');spec.cover=t.cover||null;prog.remove();if(prog2)prog2.remove();state.spec=spec;state.html=html;showResult(spec);confetti();}
  catch(err){prog.remove();if(prog2)prog2.remove();failMsg(err,()=>generate());}finally{state.busy=false;lock(false);}}
const normTxt=x=>String(x||'').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
function checkEvidence(c){const mat=normTxt(state.chat.filter(m=>m.role==='user').map(m=>m.text).join(' '));const rich=mat.length>=150;
  c.units.forEach(u=>{const a=u.action;if(!a)return;const ev=normTxt(a.evidence);a._status=!rich?'unknown':(ev.length>=4&&mat.includes(ev))?'ok':'fail';});}
function approvePlan(c){return new Promise(res=>{const rows=c.units.map((u,i)=>{const a=u.action;if(!a)return '<li class="pl none"><b>'+esc(u.title)+'</b><span>'+T('planNone')+'</span></li>';
    const st={ok:'<em class="ok">✓ '+T('planOk')+'</em>',unknown:'<em class="unk">? '+T('planUnknown')+'</em>',fail:'<em class="bad">✕ '+T('planFail')+'</em>'}[a._status];
    return '<li class="pl"><label><input type="checkbox" data-i="'+i+'"'+(a._status==='fail'?'':' checked')+'> <b>'+esc(u.title)+'：'+esc(a.title)+'</b> <span class="vb">'+(state.lang==='en'?a.verb:ACT_NAMES[a.verb])+'</span></label><small>'+T('planFrom')+'「'+esc(a.evidence)+'」 '+st+'</small></li>';}).join('');
  const m=botSay('<b class="h">'+T('planTitle')+'</b><p class="sub">'+T('planSub')+'</p><ol class="plan">'+rows+'</ol><div class="acts"><button class="gbtn go buildBtn">▶ '+T('planBuild')+'</button></div>','O');
  m.querySelector('.buildBtn').onclick=()=>{m.querySelectorAll('input[type=checkbox]').forEach(cb=>{if(!cb.checked)delete c.units[+cb.dataset.i].action;});c.units.forEach(u=>{if(u.action)delete u.action._status;});m.querySelectorAll('input,button').forEach(x=>x.disabled=true);res();};
  if(window.__autoApprove)setTimeout(()=>m.querySelector('.buildBtn').click(),300);});}
function showResult(spec){const c=spec.content,mk=spec.meta.modeKey;
  const parts=mk==='dialogue'?c.scenes.map(s=>s.title+'（'+s.turns.length+' '+T('turns')+'）'):c.units.map(u=>u.title+(u.round_type?'（'+T('rt')[u.round_type]+'）':''));
  const m=botSay('<b class="h big">🎉 '+T('done',{t:esc(c.meta.short_title)})+'</b><div class="cart">'+coverHTML(spec.cover,c.meta.short_title,MODE_ART[mk])+'<div><div class="chips"><span class="chip" style="background:'+MODE_ART[mk][0]+'">'+modeName(mk)+'</span><span class="chip" style="background:'+subjColor(spec.meta.subject)+'">'+esc(spec.meta.subject)+'</span><span class="chip soft">'+esc(spec.meta.level)+'</span></div><ol class="parts">'+parts.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ol><p class="sub">'+T('reviewNote')+'</p><div class="acts"></div></div></div>','I');
  m.classList.add('result');m.querySelector('.cover').onclick=()=>play(state.html,c.meta.short_title);const acts=m.querySelector('.acts');
  [['▶ '+T('play'),'gbtn go',()=>play(state.html,c.meta.short_title)],['★ '+T('save'),'gbtn',()=>saveGame(spec)],['⬇ '+T('dl'),'gbtn alt',()=>download(state.html,c.meta.short_title)],['↻ '+T('regen'),'gbtn alt',()=>generate()]].forEach(([t,cl,fn])=>{const b=document.createElement('button');b.className=cl;b.textContent=t;b.onclick=fn;acts.appendChild(b);});}
function lock(on){$('send').disabled=on;$('input').disabled=on;document.querySelectorAll('.tile').forEach(b=>b.disabled=on);}

/* ======================= 10. Play, download, library ======================= */
function play(html,title){$('playTitle').textContent=title||T('play');$('player').srcdoc=html;$('playModal').hidden=false;$('closePlay').focus();}
$('closePlay').onclick=()=>{$('playModal').hidden=true;$('player').srcdoc='';};
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('playModal').hidden)$('closePlay').click();});
async function download(html,title){const name=(title||'game').replace(/[\\/:*?"<>|\s]+/g,'_')+'.html';
  if(IN_CLAUDE){const d=await window.claude.use('downloads');if(d){try{await d.save({filename:name,data:html});}catch(e){if(e&&e.code!=='declined')toast((e.message||e.code));}return;}}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
let db=null,me=null,dbTried=false;const LS='gp_library_v1';
async function store(){if(IN_CLAUDE){if(!dbTried){dbTried=true;try{db=await window.claude.use('db');const u=await window.claude.use('user');me=u?await u.id():null;}catch(e){db=null;}}if(db)return 'db';}return 'local';}
function localList(){try{return JSON.parse(localStorage.getItem(LS)||'[]');}catch(e){return [];}}
async function saveGame(spec){const rec={title:spec.content.meta.short_title,subject:spec.meta.subject,level:spec.meta.level,topic:spec.meta.topic,modeName:spec.meta.modeName,modeKey:spec.meta.modeKey,model:spec.meta.model||'',created:Date.now(),cover:spec.cover||'',
    spec:JSON.stringify({content:spec.content,world:spec.world,game:spec.game,shell:spec.shell,kit:spec.kit,mode:spec.mode,icon:spec.icon})};
  const kind=await store();try{if(kind==='db'){rec.owner=me||'';const id='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);await db.collection('games').doc(id).set(rec);}
    else{const l=localList();l.unshift(Object.assign({id:'g'+Date.now()},rec));try{localStorage.setItem(LS,JSON.stringify(l.slice(0,30)));}catch(e){l[0].cover='';localStorage.setItem(LS,JSON.stringify(l.slice(0,30)));}}
    toast('★ '+T('saved'));renderLibrary(true);}catch(e){toast(e.message||e.code||String(e));}}
function gameCard(o,i){const el=document.createElement('article');el.className='gcard';el.style.setProperty('--i',i||0);const art=MODE_ART[o.modeKey]||MODE_ART.exploration;
  el.innerHTML='<span class="ribbon" style="background:'+subjColor(o.subject)+'">'+esc(o.subjectLabel||o.subject||'')+'</span>'+coverHTML(o.cover,o.title,art)+'<div class="gb"><h4>'+esc(o.title)+'</h4><span class="mb"><span class="mi" style="background:'+art[0]+'">'+art[1]+'</span>'+esc(o.mode||'')+'</span><p class="d">'+esc(o.desc||'')+'</p><span class="lvl">'+esc(o.level||'')+'</span><div class="acts"></div></div>';
  el.querySelector('.cover').onclick=o.play;const acts=el.querySelector('.acts');(o.actions||[]).forEach(([t,c,f])=>{const b=document.createElement(f.href?'a':'button');b.className=c;b.textContent=t;if(f.href){b.href=f.href;b.target='_blank';b.rel='noopener';}else b.onclick=f;acts.appendChild(b);});return el;}
let unsub=null,lastRows=[];
async function renderLibrary(force){const kind=await store();const box=$('mine');
  const draw=rows=>{lastRows=rows;box.innerHTML='';if(!rows.length){box.innerHTML='<div class="empty">'+mascot('O','wave')+'<p>'+T('emptyMine')+'</p></div>';return;}
    rows.forEach((r,i)=>{const sp=()=>buildHTML(JSON.parse(r.spec));const acts=[['▶ '+T('play'),'gbtn go',()=>play(sp(),r.title)],['⬇ '+T('dl'),'gbtn alt',()=>download(sp(),r.title)]];
      if(kind!=='db'||!r.owner||r.owner===me)acts.push(['✕','gbtn alt',async()=>{if(!confirm(T('confirmDel',{t:r.title})))return;if(kind==='db')await db.collection('games').doc(r.id).delete();else{localStorage.setItem(LS,JSON.stringify(localList().filter(x=>x.id!==r.id)));renderLibrary(true);}}]);
      box.appendChild(gameCard({title:r.title,subject:r.subject,level:r.level+(r.model?' · '+r.model:''),mode:modeName(r.modeKey||'rpg'),modeKey:r.modeKey,desc:r.topic,cover:r.cover,play:()=>play(sp(),r.title),actions:acts},i));});};
  if(kind==='db'){if(unsub){if(force)draw(lastRows);return;}unsub=db.collection('games').orderBy('created','desc').limit(60).onSnapshot(s=>draw(s.docs.map(d=>Object.assign({id:d.id},d.data()))),e=>{box.innerHTML='<div class="empty"><p>'+esc(e.code)+'</p></div>';});}else draw(localList());}
let subj='';function renderDemos(){const box=$('demos');box.innerHTML='';const local=!IN_CLAUDE,chips=$('subjChips');chips.innerHTML='';
  ['',...new Set(DEMOS.map(d=>d.s))].forEach(s=>{const b=document.createElement('button');b.className='fchip';b.textContent=s?subjLabel(s):T('all');b.setAttribute('aria-pressed',String(s===subj));if(s)b.style.setProperty('--c',subjColor(s));b.onclick=()=>{subj=s;renderDemos();};chips.appendChild(b);});
  DEMOS.filter(d=>!subj||d.s===subj).forEach((d,i)=>{const href=local?d.path:d.u,en=state.lang==='en'&&DEMO_EN[d.t],mk=modeKeyFromLabel(d.m);
    box.appendChild(gameCard({title:en?en[0]:d.t,subject:d.s,subjectLabel:subjLabel(d.s),level:state.lang==='en'?'':d.lv,mode:modeName(mk),modeKey:mk,desc:en?en[1]:d.d,cover:d.cover,play:()=>window.open(href,'_blank','noopener'),actions:[['▶ '+T('start'),'gbtn go',{href}]]},i));});}

/* ======================= 11. AI engine panel ======================= */
const LSK='gp_keys_v1';try{const k=JSON.parse(localStorage.getItem(LSK)||'null');if(k){state.keys=k.keys||{};state.remember=true;}}catch(e){}
function renderEngine(){const P=PROVIDERS[state.provider],box=$('engineBody');
  $('provCards').innerHTML=Object.entries(PROVIDERS).map(([k,p])=>'<button class="prov'+(k===state.provider?' on':'')+'" data-p="'+k+'" aria-pressed="'+(k===state.provider)+'" style="--c:'+p.color+'"><span class="pm">'+p.mark+'</span><span class="pn">'+p.name+'</span><span class="pk">'+(k==='claude'&&IN_CLAUDE?'✓ '+(state.lang==='en'?'built-in':'內建'):(state.keys[k]?'🔑':''))+'</span></button>').join('');
  document.querySelectorAll('.prov').forEach(b=>b.onclick=()=>{state.provider=b.dataset.p;state.model=PROVIDERS[state.provider].models[0][0];renderEngine();updateChip();});
  const needKey=!usesBuiltin(),blocked=IN_CLAUDE&&state.provider!=='claude';
  box.innerHTML='<label class="f" for="model">'+T('model')+'</label><select id="model">'+P.models.map(([id,n])=>'<option value="'+id+'"'+(id===state.model?' selected':'')+'>'+n+'</option>').join('')+'</select>'+
    '<input id="customModel" type="text" placeholder="'+T('custom')+'" aria-label="'+T('custom')+'">'+(state.provider==='qwen'?'<label class="f" for="qbase">'+T('region')+'</label><select id="qbase"><option value="intl"'+(state.qwenBase==='intl'?' selected':'')+'>'+T('intl')+'</option><option value="cn"'+(state.qwenBase==='cn'?' selected':'')+'>'+T('cn')+'</option></select>':'')+
    (needKey?'<label class="f" for="apikey">'+T('key')+'</label><div class="keyrow"><input id="apikey" type="password" autocomplete="off" placeholder="'+T('keyPh')+'" value="'+esc(state.keys[state.provider]||'')+'"><button id="eye" class="iconb" aria-label="show">👁</button></div><label class="chk"><input type="checkbox" id="rem"'+(state.remember?' checked':'')+'> '+T('remember')+'</label><p class="note">'+T('getKey')+'<b>'+P.keyUrl+'</b></p>':'<p class="okline">✓ '+T('builtin')+'</p>')+
    (blocked?'<p class="note warnline">'+T('sandbox')+'</p>':needKey?'<p class="note">'+T('keyNote')+'</p>':'')+(state.provider==='qwen'?'<p class="note">'+T('qwenNote')+'</p>':'')+
    (blocked?'':'<div class="testrow"><button id="testBtn" class="gbtn go">⚡ '+T('test')+'</button><span id="testRes" role="status"></span></div>')+(IN_CLAUDE?'':'<details class="adv"'+(state.proxy?' open':'')+'><summary>'+T('adv')+'</summary><label class="f" for="proxyUrl">'+T('proxy')+'</label><input id="proxyUrl" type="text" placeholder="'+T('proxyPh')+'" value="'+esc(state.proxy||'')+'"><p class="note">'+T('proxyNote')+'</p></details>');
  $('model').onchange=e=>{state.model=e.target.value;updateChip();};$('customModel').onchange=e=>{if(e.target.value.trim()){state.model=e.target.value.trim();updateChip();}};
  if($('qbase'))$('qbase').onchange=e=>state.qwenBase=e.target.value;
  if($('testBtn'))$('testBtn').onclick=testConn;if($('proxyUrl'))$('proxyUrl').oninput=e=>{state.proxy=e.target.value.trim();try{localStorage.setItem('gp_proxy',state.proxy);}catch(x){}};
  if($('apikey')){$('apikey').oninput=e=>{state.keys[state.provider]=e.target.value.trim();saveKeys();};$('eye').onclick=()=>{const i=$('apikey');i.type=i.type==='password'?'text':'password';};$('rem').onchange=e=>{state.remember=e.target.checked;saveKeys();};}}
async function testConn(){const r=$('testRes'),b=$('testBtn');b.disabled=true;r.className='';r.textContent=T('testing2');
  try{const t=await llm('Reply with exactly this JSON and nothing else: {"ok":true}',{maxTokens:50});const j=parseJSON(t);if(!j.ok)throw new Error(t.slice(0,80));r.className='ok';r.textContent='✓ '+T('testOk',{m:state.lastModel||state.model});}
  catch(e){r.className='bad';r.textContent='✕ '+T('testFail',{e:e.message});}finally{b.disabled=false;}}
function saveKeys(){try{if(state.remember)localStorage.setItem(LSK,JSON.stringify({keys:state.keys}));else localStorage.removeItem(LSK);}catch(e){}}
function updateChip(){const P=PROVIDERS[state.provider],m=(P.models.find(x=>x[0]===state.model)||[0,state.model])[1];$('engChip').innerHTML='<span class="dot" style="background:'+P.color+'"></span>'+esc(m);}
$('engChip').onclick=()=>{document.body.classList.toggle('engopen');};

/* ======================= 12. Wiring ======================= */
function toast(t){const el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,3200);}
function applyLang(){document.documentElement.lang=state.lang==='en'?'en':'zh-Hant-HK';document.querySelectorAll('[data-t]').forEach(el=>el.textContent=T(el.dataset.t));$('input').placeholder=T('placeholder');
  document.querySelectorAll('.ex').forEach((b,i)=>{b.querySelector('span').textContent=T('ex'+(i+1));b.dataset.text=T('ex'+(i+1)+'t');});
  document.querySelectorAll('.lang button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.l===state.lang)));$('attachBtn').title=T('attHint');$('attachBtn').setAttribute('aria-label',T('attach'));$('clearBtn').setAttribute('aria-label',T('clear'));$('clearLbl').textContent=T('clear');$('gl').value=state.gameLang||state.lang;
  if(!state.chat.length&&!state.busy){$('msgs').innerHTML='';botSay(T('greet'),'G');}const step=document.querySelectorAll('#track .lab');step.forEach((l,i)=>l.textContent=T('steps')[i]);renderEngine();updateChip();if(!$('lib').hidden)renderDemos(),renderLibrary(true);}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{state.lang=b.dataset.l;if(!state.gameLangSet)state.gameLang=state.lang;try{localStorage.setItem('gp_lang',state.lang);}catch(e){}applyLang();});
$('gl').onchange=e=>{state.gameLang=e.target.value;state.gameLangSet=true;};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x===b)));document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==b.dataset.p);if(b.dataset.p==='lib'){renderDemos();renderLibrary();}else setTimeout(moveRunner,30);});
const ATT=[];const LIBS={jszip:'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',pdf:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',pdfw:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'};
function loadScript(u){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+u+'"]')){res();return;}const sc=document.createElement('script');sc.src=u;sc.onload=()=>res();sc.onerror=()=>rej(new Error('cannot load '+u.split('/').pop()));document.head.appendChild(sc);});}
function xmlText(x,para,run){const d=new DOMParser().parseFromString(x,'application/xml');return [...d.getElementsByTagName(para)].map(p=>[...p.getElementsByTagName(run)].map(r=>r.textContent).join('')).filter(t=>t.trim()).join('\n');}
async function extract(file){const n=file.name.toLowerCase();
  if(/\.(txt|md|csv)$/.test(n))return await file.text();
  if(/\.(doc|ppt)$/.test(n))throw new Error(T('oldFormat'));
  if(/\.(docx|pptx)$/.test(n)){await loadScript(LIBS.jszip);const z=await window.JSZip.loadAsync(await file.arrayBuffer());
    if(n.endsWith('.docx')){const f=z.file('word/document.xml');if(!f)throw new Error('word/document.xml');return xmlText(await f.async('string'),'w:p','w:t');}
    const num=f=>+f.match(/(\d+)\.xml$/)[1];const slides=Object.keys(z.files).filter(f=>/^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a,b)=>num(a)-num(b));const out=[];
    for(const f of slides){const k=num(f);let t=xmlText(await z.file(f).async('string'),'a:p','a:t');const nf=z.file('ppt/notesSlides/notesSlide'+k+'.xml');if(nf){const nt=xmlText(await nf.async('string'),'a:p','a:t').replace(/^\d+$/gm,'').trim();if(nt)t+='\n（備註）'+nt;}out.push('【'+(state.lang==='en'?'Slide ':'第 ')+k+(state.lang==='en'?'':' 頁')+'】\n'+t);}return out.join('\n\n');}
  if(/\.pdf$/.test(n)){await loadScript(LIBS.pdf);const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc=LIBS.pdfw;const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const out=[];
    for(let p=1;p<=Math.min(doc.numPages,80);p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();out.push(tc.items.map(i=>i.str).join(' '));}return out.join('\n');}
  throw new Error(T('badType'));}
function renderAtts(){const box=$('atts');box.innerHTML=ATT.map((a,i)=>'<span class="att"><b>📄 '+esc(a.name)+'</b><small>'+a.text.length.toLocaleString()+'</small><button data-i="'+i+'" aria-label="✕ '+esc(a.name)+'">✕</button></span>').join('');box.hidden=!ATT.length;
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{ATT.splice(+b.dataset.i,1);renderAtts();});}
async function addFiles(files){for(const f of files){const chip=document.createElement('span');chip.className='att busy';chip.textContent=T('reading',{f:f.name});$('atts').hidden=false;$('atts').appendChild(chip);
    try{const t=(await extract(f)).replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();if(!t)throw new Error(T('noText'));ATT.push({name:f.name,text:t});toast(T('attOk',{f:f.name,n:t.length.toLocaleString()}));}
    catch(err){toast(T('attFail',{f:f.name,e:err.message}));}chip.remove();renderAtts();}}
$('attachBtn').onclick=()=>$('fileIn').click();$('fileIn').onchange=async e=>{const fs=[...e.target.files];e.target.value='';await addFiles(fs);};
const chatEl=document.querySelector('.chat');['dragover','dragenter'].forEach(k=>chatEl.addEventListener(k,e=>{e.preventDefault();chatEl.classList.add('drop');}));['dragleave','drop'].forEach(k=>chatEl.addEventListener(k,e=>{e.preventDefault();chatEl.classList.remove('drop');}));
chatEl.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length)addFiles([...e.dataTransfer.files]);});
function send(){const typed=$('input').value.trim();if((!typed&&!ATT.length)||state.busy)return;$('input').value='';
  let full=typed;const per=Math.max(4000,Math.floor(30000/Math.max(1,ATT.length)));ATT.forEach(a=>{full+='\n\n【附件：'+a.name+'】\n'+a.text.slice(0,per)+(a.text.length>per?'\n（以下省略）':'');});
  addMsg('user',esc(typed||'').replace(/\n/g,'<br>')+(ATT.length?'<div class="attline">'+ATT.map(a=>'<span>📄 '+esc(a.name)+'</span>').join('')+'</div>':''));state.chat.push({role:'user',text:full.trim()});ATT.length=0;renderAtts();
  if(state.spec&&state.mode){generate(typed);return;}analyse();}
function clearAll(){if(state.busy)return;state.chat=[];state.analysis=null;state.spec=null;state.mode=null;ATT.length=0;renderAtts();$('input').value='';$('msgs').innerHTML='';resetSteps('analyse');botSay(T('greet'),'G');}
$('clearBtn').onclick=clearAll;
$('send').onclick=send;$('input').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();send();}});
document.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{$('input').value=b.dataset.text;$('input').focus();});
$('newChat').onclick=clearAll;
try{const l=localStorage.getItem('gp_lang');if(l)state.lang=l;state.proxy=localStorage.getItem('gp_proxy')||'';}catch(e){}state.gameLang=state.lang;
['G','O','A','I'].forEach((id,i)=>{$('crew').insertAdjacentHTML('beforeend',mascot(id,'bob b'+i));$('crew2').insertAdjacentHTML('beforeend',mascot(id,'bob b'+i));});
drawTrack();applyLang();setTimeout(moveRunner,80);
window.__portal={state,vChallenge,validateRPG,validateCarry,validateDialogue,assembleRPG,assembleCarry,assembleDialogue,buildHTML,autoTest,recommend,setLLM:f=>{llm=f;}};
})();
