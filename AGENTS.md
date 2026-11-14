# AGENTS.md - WanderLog 旅遊與城市探索攻略庫開發規範

## 1. 專案目的與核心架構
- **專案定位**：個人模組化旅遊攻略與「IG Reels / YouTube 影音自動爬蟲探店」管理庫。實現從社群短影音自動萃取景點、固定 3 卡智慧遞補推薦，並與「行程時間軸」及「預估花費表」三方即時雙向連動的旅遊規劃工具。
- **技術棧**：純靜態 HTML5 + 原生 CSS3 + Vanilla JavaScript (ES6+)，採用單一資料源（Single Source of Truth）響應式渲染架構，可直接透過 GitHub Pages 靜態託管。
- **狀態持久化機制**：透過 `app.js` 讀取攻略頁 `<body data-guide-id="<slug>">`，將「動態行程時間軸」、「已納入景點清單」與「行前檢查表」獨立儲存於瀏覽器 `localStorage` 中，重新整理網頁仍完整保留自訂行程與預算。

## 2. 檔案命名與目錄結構規範
- `index.html`：首頁探索總覽大廳，負責呈現統計數據、關鍵字搜尋、地區篩選器與所有城市攻略卡片。
- `style.css`：全站唯一樣式表（溫暖雜誌卡片風：米白背景 `#FAF7F2`、赤陶橘 `#E06A4E`、鼠尾草綠 `#4A7C59`、芥末黃 `#D99B26`）。禁止在 HTML 檔案內撰寫 `<style>` 標籤。
- `app.js`：全站共用互動引擎（包含三區即時連動狀態機、影音爬蟲解析器、固定 3 卡淡出遞補系統）。
- `README.md`：專案說明文件。
- `guides/<slug>.html`：所有單篇城市攻略必須放置於 `guides/` 目錄下，檔名採全小寫英文與連字號 `kebab-case`（例如 `bangkok-2026.html`、`jiaoxi-weekend.html`）。

## 3. 單篇攻略頁面標準結構 (`guides/<slug>.html`)
任何由 AI 新增或修改的攻略子頁面，必須嚴格遵守以下五段式結構與 `data-*` 屬性規範：
1. **根節點綁定**：`<body>` 設定唯一的 `data-guide-id="<slug>"` 屬性。
2. **頂部導覽列 (`<nav class="top-nav">`)** 與 **旅程標頭 (`<header class="guide-header">`)**。
3. **區塊一：機動行程時間軸 (`<section class="card-section" id="timeline-section">`)**
   - 包含手動新增表單 `#timeline-add-box` 與時間軸容器 `<div class="timeline" id="main-timeline">`。
   - 每個初始 `<div class="timeline-item">` 必須具備 `data-time="HH:MM"`、`data-transport="交通方式"` 與 `data-cost="數字"` 屬性，由 `app.js` 轉換為可即時改時間（自動依時間先後重新排序）、可編輯內容、可增減節點的互動時間軸。
4. **區塊二：影音爬蟲萃取與固定 3 卡推薦池 (`<section class="card-section" id="candidate-section">`)**
   - **影音爬蟲輸入區 (`#crawler-form`)**：支援貼上 IG Reels / YouTube 網址或上傳本地影音檔，自動爬取並識別影片中的景點供使用者挑選。
   - **已納入行程清單 (`#accepted-spots-bar`)**：即時顯示已納入時間軸的推薦景點，點擊 `✕` 可同步從區塊一時間軸與區塊三花費表中移除。
   - **固定 3 卡推薦池 (`#candidate-pool`)**：畫面始終保持 3 張推薦卡片，每張卡片具備 `data-spot-id`、`data-spot-name`、`data-spot-area` 與 `data-cost`。點擊「✕ 略過」或「＋ 納入行程」時，卡片自動淡出並由後備推薦庫生成新卡片淡入遞補。
5. **區塊三：即時連動花費表 (`<table class="budget-table">`)** 與 **互動式檢查表 (`<ul class="checklist">`)**
   - `<tbody id="budget-tbody">` 會隨區塊一行程增減或金額修改，即時重新計算單日總預算。

## 4. AI 擴充新頁面的標準作業程序 (SOP)
當使用者下達「幫我新增一篇 [城市名稱] 攻略」指令時，AI 必須依序執行：
1. **建立子頁面**：於 `guides/` 建立 `<slug>.html`，完整套用第 3 節五段式結構，為初始時間軸與 3 張推薦卡標註正確的 `data-*` 屬性，並在 `</body>` 前引入 `<script src="../app.js"></script>`。
2. **擴充後備推薦庫**：於 `app.js` 的 `RESERVE_SPOTS_DB` 中註冊該 `<slug>` 的後備推薦景點陣列（至少 6～8 筆），確保 3 卡遞補機制運作順暢。
3. **更新首頁索引**：打開 `index.html`，在 `<main class="guide-grid" id="guide-grid">` 最上方插入對應的 `<a class="guide-card" data-region="overseas 或 taiwan" data-status="狀態" href="guides/<slug>.html">` 卡片。