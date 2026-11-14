# AGENTS.md - WanderLog 旅遊與城市探索攻略庫開發規範

## 1. 專案目的與核心架構
- **專案定位**：個人模組化旅遊攻略與「IG Reels / YouTube 影音自動爬蟲探店」管理庫。實現從社群短影音自動萃取景點、固定 3 卡智慧遞補推薦，並與「行程時間軸」、「在地避雷提示」、「即時花費表」及「行前檢查表」全方位雙向連動的旅遊規劃工具。
- **技術棧**：純靜態 HTML5 + 原生 CSS3 + Vanilla JavaScript (ES6+)，採用單一資料源（Single Source of Truth）響應式渲染架構，可直接透過 GitHub Pages 靜態託管。
- **狀態持久化機制**：透過 `app.js` 讀取攻略頁 `<body data-guide-id="<slug>">`，將「動態行程時間軸（含各景點專屬花費、避雷提示與檢查項）」、「已納入景點清單」與「CheckList 勾選狀態」獨立儲存於瀏覽器 `localStorage` 中。

## 2. 檔案命名與目錄結構規範
- `index.html`：首頁探索總覽大廳，負責呈現統計數據、關鍵字搜尋、地區篩選器與所有城市攻略卡片。
- `style.css`：全站唯一樣式表（溫暖雜誌卡片風：米白背景 `#FAF7F2`、赤陶橘 `#E06A4E`、鼠尾草綠 `#4A7C59`、芥末黃 `#D99B26`）。禁止在 HTML 檔案內撰寫 `<style>` 標籤。
- `app.js`：全站共用互動引擎（包含全域即時連動狀態機、影音爬蟲解析器、固定 3 卡淡出遞補系統）。
- `<slug>.html`：所有單篇城市攻略直接放置於專案根目錄下（例如 `bangkok-2026.html`），避免 GitHub Pages 子目錄相對路徑問題。

## 3. 單篇攻略頁面標準結構與全連動規則 (`<slug>.html`)
任何由 AI 新增或修改的攻略頁面，必須遵守以下結構與全連動資料屬性規範：
1. **根節點綁定**：`<body>` 設定唯一的 `data-guide-id="<slug>"` 屬性。
2. **區塊一：機動行程時間軸 (`#main-timeline`) 與動態避雷提示 (`#dynamic-pro-tips`)**
   - 每個 `.timeline-item` 必須具備 `data-time="HH:MM"`、`data-transport="交通說明"`、`data-cost="預估花費(含門票)"`、`data-tip="該景點專屬避雷提示"` 與 `data-check="該景點專屬行前檢查事項"`。
   - 當使用者新增、修改或刪除時間軸上的任何景點時，`#dynamic-pro-tips` 會即時重新掃描現存行程並動態生成提示列表；若某景點被刪除，其提示文字立即移除。
3. **區塊二：影音爬蟲萃取 (`#crawler-form`) 與固定 3 卡推薦池 (`#candidate-pool`)**
   - 推薦卡片與爬蟲結果皆包含 `data-cost`、`data-tip` 與 `data-check`。點擊「＋ 納入行程」時，自動將景點、避雷提示、預估花費與專屬檢查項同步注入區塊一與區塊三。
4. **區塊三：即時連動花費表 (`#budget-tbody`) 與動態行前檢查表 (`#dynamic-checklist`)**
   - **花費表**：完全依據當前時間軸上的行程動態計算（不寫死任何特定景點門票），若時間軸清空則總計歸零。
   - **檢查表**：由「基礎通用準備項」加上當前時間軸各景點的 `data-check` 動態組合而成。當景點從時間軸移除時，其對應的檢查項（如鄭王廟服裝規定、特定餐廳訂位）會自動從檢查表中移除。

## 4. AI 擴充新頁面的標準作業程序 (SOP)
1. **建立頁面**：於根目錄建立 `<slug>.html`，為初始時間軸與 3 張推薦卡完整標註 `data-time`、`data-transport`、`data-cost`、`data-tip` 與 `data-check`。
2. **擴充後備推薦庫**：於 `app.js` 的 `RESERVE_SPOTS_DB` 中註冊該 `<slug>` 的後備推薦景點陣列（含專屬 `cost`、`tip` 與 `check`）。
3. **更新首頁索引**：打開 `index.html`，在 `#guide-grid` 最上方插入對應的 `<a class="guide-card" href="<slug>.html">` 卡片。