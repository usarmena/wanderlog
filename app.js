document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
   * 1. 首頁大廳：統計自動計算、地區篩選與關鍵字搜尋
   * ========================================================== */
  const guideGrid = document.getElementById("guide-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("guide-search");

  if (guideGrid) {
    const cards = Array.from(guideGrid.querySelectorAll(".guide-card"));
    const totalEl = document.getElementById("stat-total-guides");
    const upcomingEl = document.getElementById("stat-upcoming");

    if (totalEl) totalEl.textContent = cards.length;
    if (upcomingEl) {
      upcomingEl.textContent = cards.filter((c) => c.dataset.status === "即將出發").length;
    }

    let currentRegion = "all";
    let currentKeyword = "";

    const filterCards = () => {
      cards.forEach((card) => {
        const matchRegion = currentRegion === "all" || card.dataset.region === currentRegion;
        const matchKeyword = card.textContent.toLowerCase().includes(currentKeyword);
        card.style.display = matchRegion && matchKeyword ? "flex" : "none";
      });
    };

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentRegion = btn.dataset.filter;
        filterCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentKeyword = e.target.value.trim().toLowerCase();
        filterCards();
      });
    }
  }

  /* ==========================================================
   * 2. 攻略子頁面：IG Reels / YT 候選池互動與前端即時新增
   * ========================================================== */
  const guideId = document.body.dataset.guideId;
  const candidatePool = document.getElementById("candidate-pool");

  if (guideId && candidatePool) {
    const stateKey = `wanderlog_spots_${guideId}`;
    const customSpotsKey = `wanderlog_custom_${guideId}`;
    let spotStates = JSON.parse(localStorage.getItem(stateKey) || "{}");
    let customSpots = JSON.parse(localStorage.getItem(customSpotsKey) || "[]");

    // 載入使用者在網頁端自訂新增的 Reels / YT 卡片
    const createSpotCardElement = (spot) => {
      const article = document.createElement("article");
      article.className = "candidate-card";
      article.dataset.spotId = spot.id;
      article.dataset.spotName = spot.name;
      article.dataset.spotArea = spot.area;

      const badgeClass = spot.source === "YouTube" ? "yt" : "ig";
      const safeUrl = spot.url || "https://www.instagram.com/";
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`;

      article.innerHTML = `
        <div>
          <div class="candidate-top">
            <span class="source-badge ${badgeClass}">${spot.source}</span>
            <a href="${safeUrl}" target="_blank" rel="noopener" class="video-link">查看原片 ↗</a>
          </div>
          <h3>${spot.name}</h3>
          <p class="spot-area-tag">📍 區域：${spot.area}</p>
          <p class="spot-desc">${spot.desc}</p>
        </div>
        <div class="candidate-actions">
          <a href="${mapUrl}" target="_blank" rel="noopener" class="map-btn">🗺️ 地圖</a>
          <button type="button" class="btn-accept">＋ 納入行程</button>
          <button type="button" class="btn-reject">✕ 略過</button>
        </div>
      `;
      return article;
    };

    customSpots.forEach((spot) => {
      candidatePool.prepend(createSpotCardElement(spot));
    });

    const countAcceptedEl = document.getElementById("accepted-count");
    const countPendingEl = document.getElementById("pending-count");

    const bindCardEvents = (card) => {
      const id = card.dataset.spotId;
      const acceptBtn = card.querySelector(".btn-accept");
      const rejectBtn = card.querySelector(".btn-reject");

      acceptBtn.addEventListener("click", () => {
        spotStates[id] = spotStates[id] === "accepted" ? "pending" : "accepted";
        localStorage.setItem(stateKey, JSON.stringify(spotStates));
        renderPool();
      });

      rejectBtn.addEventListener("click", () => {
        spotStates[id] = spotStates[id] === "rejected" ? "pending" : "rejected";
        localStorage.setItem(stateKey, JSON.stringify(spotStates));
        renderPool();
      });
    };

    const renderPool = () => {
      const allCards = candidatePool.querySelectorAll(".candidate-card");
      let accepted = 0;
      let pending = 0;

      allCards.forEach((card) => {
        const id = card.dataset.spotId;
        const acceptBtn = card.querySelector(".btn-accept");
        const rejectBtn = card.querySelector(".btn-reject");
        card.classList.remove("accepted", "rejected");

        if (spotStates[id] === "accepted") {
          card.classList.add("accepted");
          acceptBtn.textContent = "✓ 已納入行程";
          rejectBtn.textContent = "✕ 略過";
          accepted++;
        } else if (spotStates[id] === "rejected") {
          card.classList.add("rejected");
          acceptBtn.textContent = "＋ 納入行程";
          rejectBtn.textContent = "↺ 復原";
        } else {
          acceptBtn.textContent = "＋ 納入行程";
          rejectBtn.textContent = "✕ 略過";
          pending++;
        }
      });

      if (countAcceptedEl) countAcceptedEl.textContent = accepted;
      if (countPendingEl) countPendingEl.textContent = pending;
    };

    candidatePool.querySelectorAll(".candidate-card").forEach(bindCardEvents);
    renderPool();

    // 展開／收合「快速新增影音靈感」表單
    const toggleFormBtn = document.getElementById("toggle-add-form-btn");
    const quickAddBox = document.getElementById("quick-add-box");
    if (toggleFormBtn && quickAddBox) {
      toggleFormBtn.addEventListener("click", () => {
        quickAddBox.classList.toggle("open");
      });
    }

    // 處理前端即時新增 Reels / YT 景點
    const quickAddForm = document.getElementById("quick-add-form");
    if (quickAddForm) {
      quickAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("input-spot-name").value.trim();
        const area = document.getElementById("input-spot-area").value.trim();
        const source = document.getElementById("input-spot-source").value;
        const url = document.getElementById("input-spot-url").value.trim();
        const desc = document.getElementById("input-spot-desc").value.trim();

        if (!name || !desc) return;

        const newSpot = {
          id: `spot-custom-${Date.now()}`,
          name,
          area: area || "市中心區域",
          source,
          url: url || "https://www.instagram.com/",
          desc
        };

        customSpots.push(newSpot);
        localStorage.setItem(customSpotsKey, JSON.stringify(customSpots));

        const cardEl = createSpotCardElement(newSpot);
        candidatePool.prepend(cardEl);
        bindCardEvents(cardEl);
        renderPool();

        quickAddForm.reset();
        quickAddBox.classList.remove("open");
      });
    }

    // 重置所有挑選狀態
    const resetBtn = document.getElementById("reset-spots-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        spotStates = {};
        localStorage.removeItem(stateKey);
        renderPool();
      });
    }

    // 一鍵複製已入選景點（生成符合 AGENTS.md 的排程指令）
    const exportBtn = document.getElementById("export-selected-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const selectedList = [];
        candidatePool.querySelectorAll(".candidate-card").forEach((card) => {
          if (spotStates[card.dataset.spotId] === "accepted") {
            selectedList.push(`- ${card.dataset.spotName}（區域：${card.dataset.spotArea || "未指定"}）`);
          }
        });

        if (selectedList.length === 0) {
          alert("請先在下方候選池點擊「＋ 納入行程」挑選至少 1 個景點！");
          return;
        }

        const prompt = `請依照 AGENTS.md 規範，將以下我在網頁上勾選確認的候選景點，依順路程度排入「guides/${guideId}.html」的區塊一行程時間軸中，並同步更新區塊三的預估花費表：\n${selectedList.join("\n")}`;
        navigator.clipboard.writeText(prompt).then(() => {
          const oldText = exportBtn.textContent;
          exportBtn.textContent = "✓ 已複製 AI 排程指令！";
          setTimeout(() => (exportBtn.textContent = oldText), 2200);
        });
      });
    }
  }

  /* ==========================================================
   * 3. 互動式行前檢查表（支援 localStorage 記憶）
   * ========================================================== */
  const checkboxes = document.querySelectorAll(".checklist input[type='checkbox']");
  if (guideId && checkboxes.length > 0) {
    const checkKey = `wanderlog_checks_${guideId}`;
    const checkStates = JSON.parse(localStorage.getItem(checkKey) || "{}");

    checkboxes.forEach((box) => {
      const id = box.dataset.checkId;
      if (checkStates[id]) box.checked = true;
      box.addEventListener("change", () => {
        checkStates[id] = box.checked;
        localStorage.setItem(checkKey, JSON.stringify(checkStates));
      });
    });
  }

  /* ==========================================================
   * 4. AGENTS.md 規範合規自我檢核測試器 (Self-Diagnostic Runner)
   * ========================================================== */
  const initSelfValidator = () => {
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "validator-fab";
    fab.textContent = "🛠️ 檢核 AGENTS.md 規範";

    const modal = document.createElement("div");
    modal.className = "validator-modal";
    modal.innerHTML = `
      <div class="validator-header">
        <h4>📋 AGENTS.md 結構自我檢核報告</h4>
        <button type="button" class="validator-close" id="validator-close">✕</button>
      </div>
      <ul class="test-list" id="validator-test-list"></ul>
      <div class="validator-summary" id="validator-summary"></div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(modal);

    const runDiagnostics = () => {
      const isIndex = document.body.dataset.pageType === "index";
      const tests = [];

      if (isIndex) {
        tests.push({
          name: "1. 首頁指南網格容器 (#guide-grid)",
          pass: !!document.getElementById("guide-grid")
        });
        tests.push({
          name: "2. 至少包含 1 張有效攻略卡片 (.guide-card)",
          pass: document.querySelectorAll(".guide-card").length > 0
        });
        tests.push({
          name: "3. 卡片具備 data-region 與 data-status 屬性",
          pass: Array.from(document.querySelectorAll(".guide-card")).every(
            (c) => c.dataset.region && c.dataset.status
          )
        });
        tests.push({
          name: "4. 禁止內嵌 <style> 標籤（統一使用 style.css）",
          pass: document.querySelectorAll("style").length === 0
        });
      } else {
        tests.push({
          name: "1. Body 設定唯一 data-guide-id 屬性",
          pass: !!document.body.dataset.guideId
        });
        tests.push({
          name: "2. 頂部導覽列包含返回首頁連結",
          pass: !!document.querySelector(".top-nav a[href*='index.html']")
        });
        tests.push({
          name: "3. 標頭包含狀態標籤 (.status-badge) 與主標題",
          pass: !!document.querySelector(".guide-header .status-badge") && !!document.querySelector(".guide-header h1")
        });
        tests.push({
          name: "4. 區塊一：時間軸節點皆含時間、交通膠囊與地圖連結",
          pass:
            document.querySelectorAll(".timeline-item").length > 0 &&
            Array.from(document.querySelectorAll(".timeline-item")).every(
              (item) =>
                item.querySelector(".time") &&
                item.querySelector(".transport-pill") &&
                item.querySelector(".map-btn")
            )
        });
        tests.push({
          name: "5. 區塊二：影音候選池卡片皆含 data-spot-id 與來源標籤",
          pass:
            document.querySelectorAll(".candidate-card").length > 0 &&
            Array.from(document.querySelectorAll(".candidate-card")).every(
              (c) => c.dataset.spotId && c.dataset.spotName && c.querySelector(".source-badge")
            )
        });
        tests.push({
          name: "6. 區塊三：預算表包含總計列 (tr.total-row)",
          pass: !!document.querySelector(".budget-table tr.total-row")
        });
        tests.push({
          name: "7. 區塊三：檢查表 Checkbox 皆含唯一 data-check-id",
          pass:
            document.querySelectorAll(".checklist input[type='checkbox']").length > 0 &&
            Array.from(document.querySelectorAll(".checklist input[type='checkbox']")).every(
              (b) => !!b.dataset.checkId
            )
        });
        tests.push({
          name: "8. 禁止內嵌 <style> 標籤（符合全站樣式分離原則）",
          pass: document.querySelectorAll("style").length === 0
        });
      }

      const listEl = document.getElementById("validator-test-list");
      const summaryEl = document.getElementById("validator-summary");
      const passedCount = tests.filter((t) => t.pass).length;

      listEl.innerHTML = tests
        .map(
          (t) => `
          <li class="test-item">
            <span>${t.name}</span>
            <span class="${t.pass ? "badge-pass" : "badge-fail"}">${t.pass ? "PASS" : "FAIL"}</span>
          </li>`
        )
        .join("");

      summaryEl.innerHTML = `
        <span>通過率：${passedCount} / ${tests.length}</span>
        <span style="color: ${passedCount === tests.length ? "var(--sage)" : "#B91C1C"}">
          ${passedCount === tests.length ? "✓ 完全符合 AGENTS.md 規範" : "⚠️ 發現結構缺漏"}
        </span>
      `;
    };

    fab.addEventListener("click", () => {
      runDiagnostics();
      modal.classList.toggle("open");
    });

    document.getElementById("validator-close").addEventListener("click", () => {
      modal.classList.remove("open");
    });
  };

  initSelfValidator();
});