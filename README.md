# 🌍 WanderLog：城市探索與影音靈感攻略庫

本專案為 **「建立一個自己的 AGENTS.md / CLAUDE.md」** 作業成果。旨在解決平時在 IG Reels 與 YouTube 收藏大量探店影片卻難以整理成行程的痛點，透過 `AGENTS.md` 制定標準化模組與資料連動規則，讓 AI 能持續擴充結構化的旅遊攻略網站。

---

## 🔗 重要連結
- **線上網頁成果 (GitHub Pages)**：[https://usarmena.github.io/wanderlog/](https://usarmena.github.io/wanderlog/)
- **GitHub Repository**：[https://github.com/usarmena/wanderlog](https://github.com/usarmena/wanderlog)
- **核心開發規範檔案**：[`AGENTS.md`](./AGENTS.md)

---

## ✨ 核心功能與互動亮點
1. **🕷️ 影音自動爬蟲萃取（IG Reels / YouTube / 本地影片檔）**
   上傳影片檔或貼上社群短影音連結，系統自動擷取影音 Metadata 並解析出影片內的景點與店家卡片供使用者挑選。
2. **🔄 固定 3 卡智慧推薦池（自動淡出遞補）**
   推薦區始終維持 3 個系統推薦名額；當點擊「✕ 略過」或「＋ 納入行程」時，卡片會播放平滑淡出動畫，並自動從後備推薦庫生成新景點淡入遞補。
3. **⚡ 三區即時雙向連動（時間軸 ↔ 推薦池 ↔ 花費表）**
   - 在區塊二點擊「＋ 納入行程」，景點會立即加入區塊一時間軸，並同步在區塊三花費表新增預算項目。
   - 區塊一時間軸支援**直接修改時間（自動依時間重新排序）**、**手動增減行程**與**行內編輯名稱／交通／花費**，所有變更皆與區塊二及區塊三即時同步，並透過 `localStorage` 自動記憶。

---

## 📂 專案目錄結構
```text
wanderlog/
├── AGENTS.md               # AI 開發、頁面結構與三區連動擴充規範
├── README.md               # 專案介紹與架構說明
├── index.html              # 探索總覽大廳（含統計看板、搜尋與地區篩選）
├── style.css               # 溫暖雜誌卡片風全站樣式表
├── app.js                  # 三區即時連動引擎、影音爬蟲與 3 卡遞補系統
└── guides/                 # 城市攻略子頁面存放區
    └── bangkok-2026.html   # 示範攻略：曼谷舊城區與昭披耶河岸漫遊
```