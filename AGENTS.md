# AGENTS.md - WanderLog 旅遊與城市探索攻略庫開發規範

## 1. 專案目的與核心架構
- **專案定位**：個人模組化旅遊攻略與「IG Reels / YouTube 影音探店靈感」管理庫。解決社群平台收藏大量探店影片卻難以整理進正式行程的痛點。
- **技術棧**：純靜態 HTML5 + 原生 CSS3 + Vanilla JavaScript (ES6+)。禁止使用需要編譯打包的框架，確保推上 GitHub Pages 即可直接運行。
- **狀態持久化機制**：透過 `app.js` 自動讀取攻略頁 `<body data-guide-id="<slug>">`，將各城市的「候選景點挑選狀態」、「使用者自訂新增景點」與「行前檢查表勾選狀態」分別獨立儲存於瀏覽器 `localStorage` 中，互不干擾。

## 2. 檔案命名與目錄結構規範
- `index.html`：首頁探索總覽大廳，負責呈現統計數據、地區篩選器與所有攻略卡片。
- `style.css`：全站唯一樣式表（溫暖雜誌卡片風：米白背景 `#FAF7F2`、赤陶橘 `#E06A4E`、鼠尾草綠 `#4A7C59`、芥末黃 `#D99B26`）。**嚴禁**在 HTML 檔案內撰寫 `<style>` 標籤。
- `app.js`：全站共用邏輯與「自我檢核測試器（Self-Test Runner）」。
- `guides/<slug>.html`：所有單篇城市攻略必須放置於 `guides/` 目錄下。
  - **命名規則**：一律使用全小寫英文與連字號（`kebab-case`），例如 `bangkok-2026.html`、`jiaoxi-weekend.html`。

## 3. 單篇攻略頁面五段式標準結構 (`guides/<slug>.html`)
任何由 AI 新增或修改的攻略子頁面，**必須**通過內建自我檢核器的 8 項 DOM 測試，嚴格遵守以下結構：
1. **根節點綁定**：`<body>` 標籤必須具備唯一的 `data-guide-id="<slug>"` 屬性（需與檔名一致）。
2. **頂部導覽列 (`<nav class="top-nav">`)**：必須包含返回首頁連結 `../index.html`。
3. **旅程標頭 (`<header class="guide-header">`)**：包含狀態標籤 `.status-badge`（僅限：`即將出發`、`規劃中`、`已踩點`）、地區標籤 `.region-tag`、主標題 `<h1>` 與行程摘要。
4. **區塊一：已確認行程時間軸 (`<section class="card-section" id="timeline-section">`)**
   - 包含 `<div class="timeline">`，每個節點為 `<div class="timeline-item">`。
   - 每個節點必須包含：時間 `.time`、交通方式膠囊 `.transport-pill`、景點名稱 `<h3>`、說明文字，以及 Google Maps 導航按鈕 `.map-btn`（網址格式：`https://www.google.com/maps/search/?api=1&query=關鍵字`）。
5. **區塊二：影音靈感候選池 (`<section class="card-section" id="candidate-section">`)**
   - 包含狀態統計列、一鍵匯出按鈕 `#export-selected-btn`、快速新增表單 `#quick-add-form`，以及卡片容器 `<div class="candidate-grid" id="candidate-pool">`。
6. **區塊三：預算小計表與互動檢查表 (`<div class="two-col-grid">`)**
   - 預算表 `<table class="budget-table">` 最底部必須包含 `<tr class="total-row">` 總計列。
   - 檢查表 `<ul class="checklist">` 內每個 `<input type="checkbox">` 必須擁有唯一的 `data-check-id` 屬性。

## 4. Media-to-Spot 影音情報萃取規則（IG Reels / YouTube）
當使用者提供 Instagram Reels、YouTube 連結或影片文字敘述，要求整理景點時，AI **必須**遵守以下流程：
1. **禁止直接插入正式時間軸**：新萃取的景點必須先放入 `<div id="candidate-pool">` 候選池中，交由使用者在網頁上點擊「納入行程」或「略過」。
2. **候選卡片標準 HTML 模板**：
```html
<article class="candidate-card" data-spot-id="spot-唯一英文ID" data-spot-name="店家或景點名稱" data-spot-area="所屬商圈或鄰近捷運站">
  <div>
    <div class="candidate-top">
      <span class="source-badge ig">IG Reels</span> <!-- 若為 YouTube 則使用 class="source-badge yt" -->
      <a href="原始影片連結" target="_blank" rel="noopener" class="video-link">查看原片 ↗</a>
    </div>
    <h3>店家或景點名稱</h3>
    <p class="spot-area-tag">📍 區域：所屬商圈或鄰近捷運站</p>
    <p class="spot-desc">必點招牌品項、拍照亮點與排隊注意事項。</p>
  </div>
  <div class="candidate-actions">
    <a href="[https://www.google.com/maps/search/?api=1&query=店家或景點名稱](https://www.google.com/maps/search/?api=1&query=店家或景點名稱)" target="_blank" rel="noopener" class="map-btn">🗺️ 地圖</a>
    <button type="button" class="btn-accept">＋ 納入行程</button>
    <button type="button" class="btn-reject">✕ 略過</button>
  </div>
</article>
```

## 5. AI 擴充新頁面的標準作業程序 (SOP)
當使用者下達「幫我新增一篇 [城市名稱] 攻略」指令時，AI 必須依序執行：
1. **步驟 1**：於 `guides/` 建立 `<slug>.html`，完整套用第 3 節五段式結構與第 4 節候選池卡片，並在 `</body>` 前引入 `<script src="../app.js"></script>`。
2. **步驟 2**：打開 `index.html`，在 `<main class="guide-grid" id="guide-grid">` 最上方插入對應的 `<a class="guide-card" data-region="overseas 或 taiwan" data-status="狀態" href="guides/<slug>.html">` 卡片。
3. **步驟 3**：開啟網頁點擊右下角「🛠️ 檢核 AGENTS.md 規範」按鈕，確認所有自動化檢核項目皆顯示 `PASS`。