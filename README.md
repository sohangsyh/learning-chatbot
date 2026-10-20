# OpenMAIC-GamePlay

把課程教材轉化為 3D 網頁學習遊戲，對象為香港中小學生，配合教育局課程。
每款遊戲都是一個獨立的 HTML 檔，用手機或電腦瀏覽器打開即玩，無需登入或安裝。

## 快速開始（本機預覽）

根目錄的 `index.html` 就是 OpenMAIC-GamePlay 教師平台（遊戲工作室＋遊戲庫）。

建議用本機伺服器預覽，避免部分瀏覽器限制本機檔案：

```bash
python3 -m http.server 8000
# 然後瀏覽 http://localhost:8000
```

### 用 GitHub Pages 發佈

1. 把整個資料夾推送到 GitHub repo。
2. 在 repo 的 **Settings → Pages**，Source 選 `Deploy from a branch`，分支選 `main`，資料夾選 `/ (root)`。
3. 數分鐘後，入口頁會在 `https://<你的帳號>.github.io/<repo 名稱>/` 上線。

## 遊戲列表（15 款，涵蓋 10 種玩法）

| 資料夾 | 遊戲 | 玩法 | 學科 |
|---|---|---|---|
| `games/fish` | 魚我所欲也 | RPG 冒險 | 中國語文（DSE 範文） |
| `games/xiaoyao` | 逍遙遊：大瓠與大樹 | RPG 冒險 | 中國語文（DSE 範文） |
| `games/labsafety` | 實驗室安全 | RPG 冒險 | 初中科學 |
| `games/lunyu` | 論語：杏壇搬運戰 | 限時搬運 | 中國語文（DSE 範文） |
| `games/floatsink` | 浮與沉 | 模擬實驗室 | 小學科學科 |
| `games/xishan` | 始得西山宴遊記 | 探索漫遊 | 中國語文（DSE 範文） |
| `games/river` | 翠溪考察 | 探索漫遊（實地考察） | 初中地理 |
| `games/chibi` | 赤壁疑案 | 偵探查案 | 初中中國歷史 |
| `games/shop` | 檸檬茶小店 | 經營決策 | 初中經濟、小學人文科 |
| `games/hkbuddy` | HK Buddy | 對話闖關 | 初中英國語文 |
| `games/site` | 地盤三視圖 | 建造工坊 | 初中數學 |
| `games/coding` | 送貨機械人 | 建造工坊（積木編程） | 初中資訊及通訊科技 |
| `games/factcheck` | 謠言查證 | 偵探查案 | 公民與社會發展／資訊素養 |
| `games/shanju` | 山居秋暝 | 節奏表演 | 中國語文（DSE 範文） |
| `games/maiyou` | 賣油翁 | 配對（限時搬運的互動變體） | 初中中國語文 |

第十種玩法「密室逃脫」的模組（`engine/escape.js`、`engine/escape2.js`）仍保留在 repo 中，但目前沒有遊戲使用。

## 部署到 GitHub Pages（Deploying to GitHub Pages）

1. 在 GitHub 建立一個新的 repository，把這個資料夾內的**所有檔案**上傳（`index.html` 要在最上層）。
2. 到 **Settings → Pages**：Source 選 **Deploy from a branch**，Branch 選 **main**、資料夾選 **/ (root)**，按 Save。
3. 約一至兩分鐘後，網站會在以下網址上線（把名稱換成你的）：
   - OpenMAIC-GamePlay 教師平台（網站首頁）：`https://<帳號>.github.io/<repo>/`
   - 單一遊戲（給學生的連結）：`https://<帳號>.github.io/<repo>/games/<遊戲>/`

## 教師平台（portal/）

教師平台分兩部分：**遊戲工作室**（用對話描述課題，系統分析、推薦玩法、生成並自動測試 3D 遊戲）和**遊戲庫**（示範遊戲和自己存入的遊戲）。介面設有中文／English 切換。

目前可自動生成：RPG 冒險（六種舞台，可加入按課題內容配對的互動）、限時搬運（古代）、對話闖關（香港城市，英語或普通話）。

### 場景背景（Scenes）

RPG 冒險可以按課題的文化和地區，選擇六種舞台。系統會先分析課題，自動建議最合適的一種，老師也可以自行更改：

| 舞台 | 四個場景 |
| --- | --- |
| 現代校園 | 科學實驗室、準備室、走廊 |
| 中國古代 | 市集、山亭、村落、府第等 |
| 歐洲 | 木構市鎮、城堡、風車村、港口 |
| 美洲 | 紅磚小鎮、會堂、拓荒村、港口 |
| 日本 | 町家與鳥居、天守閣、稻田、港口 |
| 韓國 | 韓屋、宮殿、村落、港口 |

歐、美、日、韓四種舞台由 `engine/kit_world.js` 生成。

### 按課題內容配對的互動（Topic actions）

互動必須來自課題內容本身，例如《賣油翁》的倒油和射箭、波士頓茶黨把茶葉倒進海裡、石蕊溶液滴進酸和鹼。系統不會為了好玩而加入與課題無關的小遊戲。

| 動作 | 學生做甚麼 | 適合的課題 |
| --- | --- | --- |
| 倒 pour | 把液體倒進容器，看顏色或水位變化 | 化學指示劑、實驗步驟 |
| 擲 throw | 把物件擲向正確的地方 | 歷史事件、分類回收 |
| 秤 weigh | 把東西放上天秤比較 | 密度、價值取捨 |
| 蓋印 stamp | 簽署或反對文件 | 法令、條約、宣言 |
| 航行 steer | 把船駛往正確的港口 | 貿易、航海、鎖國 |
| 種植 plant | 把作物種在正確的田 | 農業、植物 |
| 射箭 shoot | 瞄準射箭 | 只限內容真的涉及射箭 |

運作方式：

1. AI 只會在章節內容真的出現某個動作時才加入互動，並要從教材中逐字抄錄一句作為根據。
2. 系統檢查這句根據是否真的在老師貼上或附加的教材中。
3. 建立遊戲前，老師會看到「動手做計劃」：✓ 在教材中找到（預設勾選）、? 未能核實（只有課題名稱，由老師判斷）、✕ 教材中找不到（預設不勾選）。
4. 沒有合適動作的章節，只保留故事抉擇和問答。

### 附加檔案與清除

- 按 📎 或把檔案拖進對話框，可附加 **Word（.docx）、PowerPoint（.pptx，包括備註）、PDF、文字檔**。檔案在瀏覽器內讀取，文字只會傳送給所選的 AI。舊格式 .doc／.ppt 請先另存為新格式。
- 按 🗑 清除，可清空對話和附件，重新開始。

### 設定 AI 模型（AI Engine）

1. 打開網站首頁（教師平台），在右邊「AI 引擎」選擇供應商：**Claude、GPT、Gemini 或 Qwen（通義千問）**。
2. 選擇模型，或在下方輸入其他模型名稱（供應商推出新模型時用）。
3. 貼上該供應商的 API 金鑰，按 **⚡ 測試連線**。看到「已連接」就可以開始。

| 供應商 | 取得金鑰 | 瀏覽器直接連線 |
| --- | --- | --- |
| Claude（Anthropic） | console.anthropic.com | 可以 |
| GPT（OpenAI） | platform.openai.com | 可以 |
| Gemini（Google） | aistudio.google.com | 可以 |
| Qwen 通義千問（阿里雲） | dashscope.console.aliyun.com（可選國際或中國內地地區） | 未必；如失敗請用代理伺服器 |

**金鑰安全：** 金鑰只保存在老師的瀏覽器，只會傳送給所選的 AI 供應商，不會上傳到 GitHub 或其他地方。預設只保留在目前分頁；勾選「在這部裝置記住金鑰」才會存在該裝置。請勿在公用電腦勾選。

### 代理伺服器（Proxy server，可選）

以下情況建議使用代理伺服器：學校網絡封鎖 AI 服務的網址；Qwen 不接受瀏覽器直接連線；或學校想由伺服器統一保管金鑰，老師無需各自申請。

`proxy/cloudflare-worker.js` 是一個現成的 Cloudflare Worker（免費額度已足夠一般使用）：

1. 在 Cloudflare 建立一個 Worker，貼上 `proxy/cloudflare-worker.js` 的內容。
2. 把檔案頂部 `ALLOWED_ORIGINS` 改成你的 GitHub Pages 網址，例如 `https://your-name.github.io`（只寫到網域，不要加 repo 名稱）。只有這個網址可以使用代理。
3. （可選）在 Worker 的 Settings → Variables 加入 Secret：`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`DASHSCOPE_API_KEY`。設定後，老師可以不填金鑰。
4. 部署後，把 Worker 的網址（例如 `https://gameplay-proxy.your-name.workers.dev`）貼到教師平台「AI 引擎 → 進階設定 → 代理網址」，再按測試連線。

### 遊戲庫的儲存位置

在 GitHub Pages 上，老師存入的遊戲保存在**各自的瀏覽器**（不會共享）。下載的 HTML 遊戲檔可以直接放到學校網站或傳給學生。（在 claude.ai 上發佈的版本，遊戲庫則在機構內共享。）

### 修改後重建

修改引擎、遊戲或平台後：

```bash
python3 build/build.py                 # 重建所有遊戲
python3 portal/src/build_portal.py     # 重建教師平台（輸出到根目錄 index.html）
```

## 專案結構

```
index.html              OpenMAIC-GamePlay 教師平台（網站首頁，由 portal/src/build_portal.py 生成）
games/<遊戲>/
  content.json          內容層：知識單元、盲點、台詞、提示、題目
  world.json            世界層：場景、地點、角色站位
  game.json             玩法層：計分、時間、規則參數
  recommendation.json   玩法推薦器的判斷紀錄
  index.html            建置後的遊戲（由 build.py 生成，可直接打開）
engine/
  engine.js             共用引擎：渲染、角色與程序動畫、鏡頭、對話、提示、跳過
  rpg.js                RPG 冒險（可選：可走動的玩家角色、場景互動掛鈎）
  carry2.js             限時搬運（多場景版；carry.js 為單場景舊版）
  escape.js, escape2.js 密室逃脫（單房間版、多區域版）
  sim.js                模擬實驗室（浮力模型）
  explore.js            探索漫遊（程序生成地形）
  detective.js          偵探查案
  manage.js             經營決策
  dialogue.js           對話闖關（語音朗讀、可選語音辨識）
  building.js           建造工坊（三視圖、起重機）
  rhythm.js             節奏表演（節拍軌道、合成撥弦音）
  fieldtrip.js          實地考察（河流地形、量度工具、數據分析）
  coding.js             積木編程（香港街道送貨機械人）
  factcheck.js          謠言查證（以香港城市場景套件為背景）
  matchgame.js          互動配對（射箭、酌油、對應關係、熟能生巧練習）
  kit_ancient.js        古代場景套件：市集、山亭、村落、府第、杏壇、書院、碑林、江邊、祠堂、莊子寓言場景、山居
  kit_campus.js         現代校園場景套件：實驗室、準備室、走廊、操場集合點
  kit_hk.js             香港城市場景套件：茶餐廳、港鐵月台、天星小輪、街市
  kit_site.js           香港地盤場景套件：塔式起重機、竹棚、圍板
  kit_world.js          世界場景套件：歐洲、美洲、日本、韓國（市鎮、宮殿、村落、港口）
shells/                 各玩法的頁面外殼（版面、樣式、HUD）
build/build.py          建置腳本
games/catalog.json      遊戲庫示範遊戲清單（標題、科目、說明、路徑）
portal/                 教師平台的原始碼（src/）、封面圖（covers/）
proxy/                  可選的 AI 代理伺服器（Cloudflare Worker）
docs/                   項目說明書
```

## 修改內容後重新建置

遊戲的文字、題目和參數都在三份 JSON 中，不需要改程式。修改後執行：

```bash
python3 build/build.py          # 重建全部
python3 build/build.py chibi    # 只重建一款
```

需要 Python 3，不需要安裝任何套件。`build.py` 頂部的 `GAMES` 表列出每款遊戲使用的外殼、玩法模組和場景套件。

## 外部依賴

遊戲在瀏覽器中會從網上載入：

- Three.js r128（cdnjs.cloudflare.com）
- Google Fonts（Noto Serif TC、LXGW WenKai TC）

因此需要連線才能遊玩。如需完全離線使用，可下載 `three.min.js` 放入 repo，並把 shells 中的 `<script src>` 改為相對路徑。

## 使用須知

- **跳過**：所有需要答對才能前進的地方，都有「跳過，看答案」按鈕。
- **語音（HK Buddy）**：「讀出對白」使用瀏覽器內建的語音合成。「開口說話」預設關閉；開啟後使用瀏覽器的語音辨識服務，音訊由 Google 或 Apple 等供應商處理，遊戲本身不儲存錄音。老師可在連結後加 `?speak=1` 預設開啟。語音辨識在桌面版 Chrome、Edge 效果最好，Firefox 不支援。
- **聲音（山居秋暝）**：撥弦音和節拍聲以 Web Audio 即時合成，不需要音訊檔。
- **效能**：場景較豐富的遊戲（例如魚我所欲也、逍遙遊、論語）有約一千個物件，需要有顯示晶片的裝置才流暢。一般電腦和近年的手機、平板都沒有問題；非常舊的裝置可能較慢。
- **實地考察安全（翠溪考察）**：遊戲示範了河流考察的安全守則（留意天氣警告、沿步道排隊前進、只在橋上或河岸量度、不落水）。實際帶學生考察時，請按學校及教育局的戶外活動安全指引安排。
- **內容審核**：課文詮釋與學科內容在正式使用前，應由任教老師審核。
- **授權**：請自行選擇授權條款並加入 `LICENSE` 檔。如日後整合 OpenMAIC 的程式碼，需先確認其授權條款。
