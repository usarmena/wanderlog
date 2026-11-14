# 🌍 WanderLog：城市探索與影音靈感攻略庫

本專案為 **「建立一個自己的 AGENTS.md / CLAUDE.md」** 作業成果。旨在解決平時在 IG Reels 與 YouTube 收藏大量探店影片卻難以整理成行程的痛點，透過 `AGENTS.md` 規範 AI 持續擴充結構化的旅遊攻略。

---

## 🔗 重要連結
- **線上網頁成果 (GitHub Pages)**：[https://usarmena.github.io/wanderlog/](https://usarmena.github.io/wanderlog/)
- **核心開發規範檔案**：[`AGENTS.md`](./AGENTS.md)

---

## 🛠️ 專案特色與架構
1. **五段式標準頁面架構**：所有城市攻略子頁面皆嚴格遵循導覽列、標頭、行程時間軸、影音候選池、預算表與檢查表的統一結構。
2. **Media-to-Spot 影音情報萃取**：結合 IG Reels 與 YouTube 來源標記，支援在網頁端點擊「納入行程」與一鍵複製 AI 排程 Prompt。
3. **前端狀態持久化**：透過 `localStorage` 獨立隔離各城市的景點挑選狀態與行前 CheckList 打勾進度。
4. **內建 AGENTS.md 自我檢核器**：網頁右下角內建自動化 DOM 檢核面板，可即時驗證頁面結構是否符合規範。

---

## 📂 目錄結構
```text
wanderlog/
├── AGENTS.md          # AI 開發、擴充與檢核規範
├── index.html         # 探索總覽大廳（含篩選與統計）
├── style.css          # 溫暖雜誌卡片風樣式表
├── app.js             # 全站互動引擎與自我檢核測試器
└── guides/            # 城市攻略子頁面存放區
    └── bangkok-2026.html