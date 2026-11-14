document.addEventListener("DOMContentLoaded", () => {
  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

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
   * 2. 後備推薦資料庫與影音爬蟲萃取知識庫（含專屬 Tip 與 Check）
   * ========================================================== */
  const BASE_CHECKLIST_DB = {
    "bangkok-2026": [
      { id: "base-chk-1", text: "確認護照效期超過 6 個月以上" },
      { id: "base-chk-2", text: "安裝 Grab 與 Bolt 叫車 App 並綁定付款方式" }
    ]
  };

  const RESERVE_SPOTS_DB = {
    "bangkok-2026": [
      {
        id: "spot-factory-coffee",
        name: "Factory Coffee 冠軍創意特調咖啡",
        area: "BTS Phaya Thai 站",
        source: "YouTube",
        cost: 220,
        url: "https://www.youtube.com/results?search_query=Factory+Coffee+Bangkok",
        desc: "泰國拉花與烘焙冠軍主理，桌邊現搖「Moscow」與檸檬冰美式「Supreme」為必點招牌，搭配可頌絕佳。",
        tip: "Factory Coffee 尖峰時段候位約 20～30 分鐘，建議避開上午 10 點至 11 點人潮。",
        check: "確認 Factory Coffee 營業時間（08:00–16:00，週一照常營業）"
      },
      {
        id: "spot-here-hai",
        name: "Here Hai 米其林必比登蟹肉炒飯",
        area: "BTS Ekkamai 站",
        source: "IG Reels",
        cost: 480,
        url: "https://www.instagram.com/explore/tags/herehaibangkok/",
        desc: "鋪滿超大塊鮮甜蟹腿肉的粒粒分明炒飯，搭配蒜蓉辣椒魚露與炭烤泰國蝦，視覺與味覺雙重滿足。",
        tip: "Here Hai 不開放現場訂位且週一公休，建議早上 10:00 開門前抵達才不用久候。",
        check: "準備現金支付 Here Hai 蟹肉炒飯（店內以現金交易為主）"
      },
      {
        id: "spot-jeh-o-chula",
        name: "Jeh O Chula 酸辣海鮮媽媽麵",
        area: "朱拉隆功大學商圈",
        source: "YouTube",
        cost: 350,
        url: "https://www.youtube.com/results?search_query=Jeh+O+Chula+Bangkok",
        desc: "曼谷超人氣宵夜名店，整鍋冬蔭功湯底鋪滿脆皮燒肉、鮮蝦、花枝與雙生蛋黃，建議透過 Klook 免排隊預約。",
        tip: "Jeh O Chula 現場排隊動輒 1.5 小時以上，強烈建議事先購買線上免排隊快速通關券。",
        check: "預訂 Jeh O Chula 媽媽麵快速通關憑證或提早透過 QueQ App 抽號"
      },
      {
        id: "spot-after-you",
        name: "After You 泰式皇家奶茶雪花冰",
        area: "Siam Paragon 暹羅百麗宮",
        source: "IG Reels",
        cost: 265,
        url: "https://www.instagram.com/explore/tags/afteryoudessertcafe/",
        desc: "綿密泰奶刨冰淋上濃厚奶蓋，內藏仙草凍與吐司丁，逛街消暑必吃第一名甜點。",
        tip: "Siam Paragon 分店人潮最多，若不想排隊可改去鄰近的 Central World 或 Silom 分店。",
        check: "下載 QueQ App 以便遠端抽取 After You 甜點店號碼牌"
      },
      {
        id: "spot-thipsamai",
        name: "Thipsamai 鬼門泰式炒河粉",
        area: "舊城區 Samran Rat",
        source: "YouTube",
        cost: 180,
        url: "https://www.youtube.com/results?search_query=Thipsamai+Pad+Thai",
        desc: "薄脆蛋皮包裹炭火快炒的蝦油河粉，搭配現榨果肉柳橙汁，是體驗曼谷老城宵夜的經典地標。",
        tip: "Thipsamai 鬼門炒河粉每週二公休，店內現榨柳橙汁單價較高可依個人喜好選購。",
        check: "確認鬼門炒河粉營業日（避開週二公休日）"
      },
      {
        id: "spot-karun-thai-tea",
        name: "Karun 奢華金箔泰式奶茶冰沙",
        area: "Central World 購物中心",
        source: "IG Reels",
        cost: 135,
        url: "https://www.instagram.com/explore/tags/karunthaitea/",
        desc: "被譽為泰奶界愛馬仕，採用濃郁烘焙茶葉慢煮，可自選甜度並撒上食用金箔，瓶身設計極具質感。",
        tip: "Karun 泰奶預設甜度偏高，點餐時建議選擇 40% 或 70% 甜度最順口。",
        check: "記下 Karun 泰奶甜度選擇（推薦 40% Less Sweet）"
      },
      {
        id: "spot-mae-varee",
        name: "Mae Varee 三色芒果糯米飯",
        area: "BTS Thong Lo 站出口",
        source: "YouTube",
        cost: 150,
        url: "https://www.youtube.com/results?search_query=Mae+Varee+Bangkok",
        desc: "現削熟透金煌芒果搭配蝶豆花、香蘭葉三色溫熱糯米飯，淋上鹹甜椰漿與酥脆綠豆仁。",
        tip: "Mae Varee 以立食與外帶為主，店內無內用座位，適合買回飯店享用。",
        check: "準備百元小鈔購買 Mae Varee 芒果糯米飯外帶"
      },
      {
        id: "spot-a-keen-house",
        name: "A Keen House 奶油焦糖拿鐵與藝廊",
        area: "Sukhumvit 40 巷",
        source: "IG Reels",
        cost: 190,
        url: "https://www.instagram.com/explore/tags/akeenhouse/",
        desc: "結合北歐極簡設計與當代攝影展的三層樓咖啡館，必點烤堅果焦糖拿鐵與無花果吐司。",
        tip: "A Keen House 每週二公休，二樓藝廊展區拍照請勿使用閃光燈。",
        check: "確認 A Keen House 當期展覽與營業時段（09:00–17:00）"
      }
    ]
  };

  const CRAWLER_TEMPLATES = [
    {
      keywords: ["crab", "herehai", "炒飯", "蟹", "ekkamai", "seafood"],
      spots: [
        {
          name: "Here Hai 巨無霸蟹肉炒飯",
          area: "BTS Ekkamai 站",
          cost: 480,
          desc: "爬蟲自影音畫面與字幕識別：米其林必比登推介，招牌超厚實蟹腿肉炒飯與蒜香椒鹽皮皮蝦。",
          tip: "Here Hai 週一公休且僅收現金，中午用餐尖峰建議提早半小時卡位。",
          check: "準備現金支付 Here Hai 蟹肉炒飯餐費"
        },
        {
          name: "Wattana Panich 50 年老滷牛肉麵",
          area: "Ekkamai 18 巷（步行 5 分鐘）",
          cost: 200,
          desc: "爬蟲順路關聯萃取：大銅鍋陳年老滷慢燉軟嫩牛腩與藥膳湯頭，同一條街可一次踩點。",
          tip: "Wattana Panich 為半開放式店面無冷氣，建議攜帶隨身小電扇或紙巾。",
          check: "攜帶濕紙巾與小額泰銖前往 Ekkamai 牛肉麵老店"
        }
      ]
    },
    {
      keywords: ["night", "market", "jodd", "夜市", "火山排骨", "mama", "chula"],
      spots: [
        {
          name: "Jodd Fairs 喬德夜市火山排骨",
          area: "MRT Phra Ram 9 站",
          cost: 350,
          desc: "爬蟲自影音字幕識別：堆成小山的青辣椒酸辣排骨（Leng Saap），搭配手打檸檬茶與水果冰沙。",
          tip: "喬德夜市晚上 19:00–21:00 人潮最擠，扒手偶有出沒，隨身背包請背在胸前。",
          check: "準備 20 / 100 泰銖小鈔（喬德夜市攤販找零必備）"
        },
        {
          name: "Jeh O Chula 酸辣海鮮媽媽麵",
          area: "朱拉隆功大學美食街",
          cost: 350,
          desc: "爬蟲自影音標籤識別：宵夜必吃脆皮燒肉冬蔭功媽媽麵。",
          tip: "Jeh O Chula 現場候位極久，建議使用 QueQ App 遠端抽號或預訂快速通關。",
          check: "提前於 QueQ App 抽取 Jeh O Chula 候位號碼牌"
        }
      ]
    },
    {
      keywords: ["cafe", "coffee", "咖啡", "甜點", "tea", "songwat", "ari"],
      spots: [
        {
          name: "Nana Coffee Roasters Ari 森林系莊園咖啡",
          area: "BTS Ari 阿黎文青區",
          cost: 240,
          desc: "爬蟲自影音地標識別：被熱帶植栽包圍的獨棟庭園咖啡廳，手沖藝伎咖啡與髒髒咖啡（Dirty）極受好評。",
          tip: "Nana Coffee 假日戶外庭園蚊蟲稍多，若坐戶外區建議噴防蚊液。",
          check: "攜帶防蚊液前往 Ari 森林系庭園咖啡廳"
        },
        {
          name: "Lay Lao 華欣風味米其林泰北菜",
          area: "BTS Ari 站步行 3 分鐘",
          cost: 420,
          desc: "爬蟲自探店路線識別：生醃甜蝦與炭烤豬頸肉沙拉必點，適合喝完咖啡順道用餐。",
          tip: "Lay Lao 辣度道地，不吃大辣者點餐時請主動告知店員「Phed Noi（小辣）」。",
          check: "記下泰文小辣講法「Phed Noi」供 Lay Lao 點餐使用"
        }
      ]
    }
  ];

  /* ==========================================================
   * 3. 全域即時連動引擎（時間軸 ↔ 避雷提示 ↔ 推薦池 ↔ 花費表 ↔ 檢查表）
   * ========================================================== */
  const guideId = document.body.dataset.guideId;
  const mainTimeline = document.getElementById("main-timeline");
  const candidatePool = document.getElementById("candidate-pool");

  if (guideId && mainTimeline && candidatePool) {
    // 升級儲存 Key 版本，確保舊版快取不會殘留不完整的屬性
    const stateStorageKey = `wanderlog_reactive_v2_${guideId}`;
    const checkStorageKey = `wanderlog_checks_v2_${guideId}`;

    // 從 HTML 初始 DOM 讀取預設時間軸（包含每個節點專屬的 tip 與 check）
    const parseDefaultTimeline = () => {
      return Array.from(mainTimeline.querySelectorAll(".timeline-item")).map((el, idx) => ({
        uid: `base-stop-${idx + 1}`,
        spotId: null,
        source: null,
        time: el.dataset.time || "10:00",
        transport: el.dataset.transport || "🚶 步行前往",
        cost: Number(el.dataset.cost || 0),
        tip: el.dataset.tip || "",
        check: el.dataset.check || "",
        title: el.querySelector("h3")?.textContent.trim() || "未命名行程",
        desc: el.querySelector("p")?.textContent.trim() || ""
      }));
    };

    const defaultTimeline = parseDefaultTimeline();

    let appState = JSON.parse(localStorage.getItem(stateStorageKey) || "null");
    if (!appState) {
      appState = {
        timeline: defaultTimeline,
        acceptedSpots: []
      };
    }

    let checkStates = JSON.parse(localStorage.getItem(checkStorageKey) || "{}");

    const saveState = () => {
      localStorage.setItem(stateStorageKey, JSON.stringify(appState));
    };

    const getNextSuggestedTime = () => {
      if (appState.timeline.length === 0) return "10:00";
      const sorted = [...appState.timeline].sort((a, b) => a.time.localeCompare(b.time));
      const lastTime = sorted[sorted.length - 1].time;
      const [h, m] = lastTime.split(":").map(Number);
      let totalMins = h * 60 + m + 90;
      if (totalMins > 23 * 60 + 30) totalMins = 21 * 60 + 30;
      const nh = String(Math.floor(totalMins / 60)).padStart(2, "0");
      const nm = String(totalMins % 60).padStart(2, "0");
      return `${nh}:${nm}`;
    };

    const acceptedCountEl = document.getElementById("accepted-count");
    const acceptedChipsEl = document.getElementById("accepted-chips");
    const budgetTbody = document.getElementById("budget-tbody");
    const proTipsBox = document.getElementById("dynamic-pro-tips");
    const checklistEl = document.getElementById("dynamic-checklist");

    /* ----------------------------------------------------------
     * 渲染區塊一底部：動態「💡 在地避雷小撇步」（完全依現有行程決定）
     * ---------------------------------------------------------- */
    const renderProTips = () => {
      if (!proTipsBox) return;
      const sortedStops = [...appState.timeline].sort((a, b) => a.time.localeCompare(b.time));
      const activeTips = sortedStops.filter((s) => s.tip && s.tip.trim() !== "");

      if (sortedStops.length === 0) {
        proTipsBox.innerHTML = `<strong>💡 在地避雷小撇步：</strong> 目前時間軸尚無行程，當你新增或從下方納入景點後，系統會自動彙整對應景點的穿搭、公休日與排隊避雷提醒。`;
        return;
      }

      if (activeTips.length === 0) {
        proTipsBox.innerHTML = `<strong>💡 在地避雷小撇步：</strong> 目前排定的 ${sortedStops.length} 個行程皆無特殊服裝或預約限制，建議攜帶足夠現金與防曬用品即可輕鬆出發！`;
        return;
      }

      const listHtml = activeTips
        .map(
          (s) =>
            `<li style="margin-top:0.35rem;"><strong>【${escapeHtml(s.title)}】</strong>${escapeHtml(s.tip)}</li>`
        )
        .join("");

      proTipsBox.innerHTML = `
        <strong>💡 依據目前時間軸行程自動彙整的避雷小撇步（共 ${activeTips.length} 項）：</strong>
        <ul style="margin-left:1.2rem;margin-top:0.25rem;">${listHtml}</ul>
      `;
    };

    /* ----------------------------------------------------------
     * 渲染區塊三左側：即時連動花費表（完全依現有行程計算，無寫死門票）
     * ---------------------------------------------------------- */
    const renderBudgetTable = () => {
      if (!budgetTbody) return;
      const sortedStops = [...appState.timeline].sort((a, b) => a.time.localeCompare(b.time));

      if (sortedStops.length === 0) {
        budgetTbody.innerHTML = `
          <tr><td colspan="2" style="text-align:center;color:var(--text-muted);padding:1.2rem 0.5rem;">目前時間軸尚無行程，預估花費為 0 THB</td></tr>
          <tr class="total-row">
            <td>單日即時總計（約合 NT$ 0）</td>
            <td>0 THB</td>
          </tr>
        `;
        return;
      }

      let totalThb = 0;
      let rowsHtml = "";

      // 依實際行程段數動態估算大眾運輸接駁車資（每段行程估算 40 THB）
      const transitCost = sortedStops.length * 40;
      totalThb += transitCost;
      rowsHtml += `
        <tr>
          <td>🚇 行程間交通接駁估算（共 ${sortedStops.length} 站移動）</td>
          <td>${transitCost.toLocaleString()} THB</td>
        </tr>
      `;

      sortedStops.forEach((stop) => {
        const costVal = Number(stop.cost || 0);
        totalThb += costVal;
        const tag = stop.spotId ? " ✨" : "";
        rowsHtml += `
          <tr>
            <td>${escapeHtml(stop.time)} ${escapeHtml(stop.title)}${tag}</td>
            <td>${costVal.toLocaleString()} THB</td>
          </tr>
        `;
      });

      const approxNtd = Math.round(totalThb * 0.96);
      rowsHtml += `
        <tr class="total-row">
          <td>單日即時總計（約合 NT$ ${approxNtd.toLocaleString()}）</td>
          <td>${totalThb.toLocaleString()} THB</td>
        </tr>
      `;
      budgetTbody.innerHTML = rowsHtml;
    };

    /* ----------------------------------------------------------
     * 渲染區塊三右側：動態「✅ 行前與隨身檢查表」（隨行程即時增減）
     * ---------------------------------------------------------- */
    const renderChecklist = () => {
      if (!checklistEl) return;
      const baseChecks = BASE_CHECKLIST_DB[guideId] || [];
      const sortedStops = [...appState.timeline].sort((a, b) => a.time.localeCompare(b.time));

      // 組合基礎通用檢查項 + 當前時間軸上各景點專屬檢查項
      const dynamicItems = [
        ...baseChecks.map((b) => ({
          checkId: b.id,
          label: b.text,
          badge: "通用行前"
        }))
      ];

      sortedStops.forEach((stop) => {
        if (stop.check && stop.check.trim() !== "") {
          dynamicItems.push({
            checkId: `chk-${stop.uid}`,
            label: stop.check,
            badge: stop.title
          });
        }
      });

      checklistEl.innerHTML = dynamicItems
        .map((item) => {
          const isChecked = !!checkStates[item.checkId];
          return `
            <li>
              <label>
                <input type="checkbox" data-check-id="${escapeHtml(item.checkId)}" ${isChecked ? "checked" : ""} />
                <span>
                  <strong style="color:var(--terracotta);font-size:0.82rem;">[${escapeHtml(item.badge)}]</strong>
                  ${escapeHtml(item.label)}
                </span>
              </label>
            </li>
          `;
        })
        .join("");

      checklistEl.querySelectorAll("input[type='checkbox']").forEach((box) => {
        box.addEventListener("change", () => {
          checkStates[box.dataset.checkId] = box.checked;
          localStorage.setItem(checkStorageKey, JSON.stringify(checkStates));
        });
      });
    };

    /* ----------------------------------------------------------
     * 渲染區塊二上方：已納入行程口袋名單
     * ---------------------------------------------------------- */
    const renderAcceptedBar = () => {
      if (acceptedCountEl) acceptedCountEl.textContent = appState.acceptedSpots.length;
      if (!acceptedChipsEl) return;

      if (appState.acceptedSpots.length === 0) {
        acceptedChipsEl.innerHTML = `<span style="font-size:0.84rem;color:var(--text-muted);">尚未從推薦池挑選景點，點選「＋ 納入行程」後將即時同步至時間軸、避雷提示、花費表與檢查表。</span>`;
        return;
      }

      acceptedChipsEl.innerHTML = appState.acceptedSpots
        .map(
          (spot) => `
          <span class="spot-chip">
            📍 ${escapeHtml(spot.name)}（${escapeHtml(spot.time)}）
            <button type="button" class="chip-remove" data-spot-id="${escapeHtml(spot.id)}" title="從行程移除">✕</button>
          </span>`
        )
        .join("");

      acceptedChipsEl.querySelectorAll(".chip-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          removeSpotEverywhere(btn.dataset.spotId);
        });
      });
    };

    // 一次同步刷新全頁所有連動區塊
    const syncAllSections = (highlightUid = null) => {
      renderTimeline(highlightUid);
      renderProTips();
      renderAcceptedBar();
      renderBudgetTable();
      renderChecklist();
    };

    /* ----------------------------------------------------------
     * 渲染區塊一：機動行程時間軸
     * ---------------------------------------------------------- */
    function renderTimeline(highlightUid = null) {
      appState.timeline.sort((a, b) => a.time.localeCompare(b.time));

      if (appState.timeline.length === 0) {
        mainTimeline.innerHTML = `<p style="color:var(--text-muted);font-size:0.92rem;">目前時間軸尚無行程，請點擊上方「＋ 手動新增行程」或從區塊二挑選推薦景點加入！</p>`;
        return;
      }

      mainTimeline.innerHTML = appState.timeline
        .map((item) => {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + " Bangkok")}`;
          const linkedBadge = item.source
            ? `<span class="linked-badge">🔗 來自 ${escapeHtml(item.source)}</span>`
            : "";
          const highlightClass = item.uid === highlightUid ? " just-updated" : "";

          return `
            <div class="timeline-item${highlightClass}" data-uid="${escapeHtml(item.uid)}">
              <div class="timeline-top-row">
                <div class="timeline-meta">
                  <input type="time" class="time-input" value="${escapeHtml(item.time)}" title="點擊更改時間（更改後自動重新排序）" />
                  <span class="transport-pill">${escapeHtml(item.transport)}</span>
                  <span class="cost-pill">💰 ${Number(item.cost).toLocaleString()} THB</span>
                  ${linkedBadge}
                </div>
                <div class="timeline-item-actions">
                  <button type="button" class="btn-item-edit">✏️ 編輯</button>
                  <button type="button" class="btn-item-delete">🗑️ 移除</button>
                </div>
              </div>

              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.desc)}</p>
              <a href="${mapUrl}" target="_blank" rel="noopener" class="map-btn">🗺️ 在 Google Maps 開啟</a>

              <!-- 行內快速編輯面板（支援同步修改標題、交通、花費、專屬避雷提示與檢查事項） -->
              <div class="inline-edit-box">
                <div class="form-grid">
                  <input type="text" class="form-input edit-title" value="${escapeHtml(item.title)}" placeholder="景點或店家名稱" />
                  <input type="text" class="form-input edit-transport" value="${escapeHtml(item.transport)}" placeholder="交通方式或區域" />
                  <input type="number" class="form-input edit-cost" value="${Number(item.cost)}" min="0" step="10" placeholder="預估花費 (THB)" />
                </div>
                <div class="form-grid">
                  <input type="text" class="form-input edit-desc" value="${escapeHtml(item.desc)}" placeholder="行程亮點說明" />
                </div>
                <div class="form-grid">
                  <input type="text" class="form-input edit-tip" value="${escapeHtml(item.tip || "")}" placeholder="💡 專屬避雷提示（選填，同步顯示於下方小撇步）" />
                  <input type="text" class="form-input edit-check" value="${escapeHtml(item.check || "")}" placeholder="✅ 專屬行前檢查項（選填，同步顯示於區塊三檢查表）" />
                </div>
                <button type="button" class="btn-save-edit">✓ 儲存變更並同步全站</button>
              </div>
            </div>
          `;
        })
        .join("");

      mainTimeline.querySelectorAll(".timeline-item").forEach((el) => {
        const uid = el.dataset.uid;
        const targetItem = appState.timeline.find((t) => t.uid === uid);
        if (!targetItem) return;

        // 1. 更改時間 -> 自動重新排序並同步全頁
        const timeInput = el.querySelector(".time-input");
        timeInput.addEventListener("change", (e) => {
          const newTime = e.target.value;
          if (!newTime) return;
          targetItem.time = newTime;

          if (targetItem.spotId) {
            const linkedSpot = appState.acceptedSpots.find((s) => s.id === targetItem.spotId);
            if (linkedSpot) linkedSpot.time = newTime;
          }

          saveState();
          syncAllSections(uid);
        });

        // 2. 展開／收合行內編輯
        const editBtn = el.querySelector(".btn-item-edit");
        const editBox = el.querySelector(".inline-edit-box");
        editBtn.addEventListener("click", () => {
          editBox.classList.toggle("open");
        });

        // 3. 儲存行內編輯 -> 同步更新時間軸、避雷提示、花費表與檢查表
        const saveEditBtn = el.querySelector(".btn-save-edit");
        saveEditBtn.addEventListener("click", () => {
          const newTitle = el.querySelector(".edit-title").value.trim();
          const newTransport = el.querySelector(".edit-transport").value.trim();
          const newCost = Number(el.querySelector(".edit-cost").value || 0);
          const newDesc = el.querySelector(".edit-desc").value.trim();
          const newTip = el.querySelector(".edit-tip").value.trim();
          const newCheck = el.querySelector(".edit-check").value.trim();

          if (newTitle) targetItem.title = newTitle;
          if (newTransport) targetItem.transport = newTransport;
          targetItem.cost = newCost;
          targetItem.desc = newDesc;
          targetItem.tip = newTip;
          targetItem.check = newCheck;

          if (targetItem.spotId) {
            const linkedSpot = appState.acceptedSpots.find((s) => s.id === targetItem.spotId);
            if (linkedSpot && newTitle) linkedSpot.name = newTitle;
          }

          saveState();
          syncAllSections(uid);
        });

        // 4. 移除行程節點 -> 同步從時間軸、避雷提示、口袋名單、花費表與檢查表移除
        const deleteBtn = el.querySelector(".btn-item-delete");
        deleteBtn.addEventListener("click", () => {
          appState.timeline = appState.timeline.filter((t) => t.uid !== uid);
          if (targetItem.spotId) {
            appState.acceptedSpots = appState.acceptedSpots.filter((s) => s.id !== targetItem.spotId);
          }
          saveState();
          syncAllSections();
        });
      });
    }

    // 統一新增景點至全站所有連動區塊
    const addSpotToAllSections = (spotObj) => {
      const existing = appState.timeline.find((t) => t.spotId === spotObj.id || t.title === spotObj.name);
      if (existing) {
        syncAllSections(existing.uid);
        return;
      }

      const assignedTime = getNextSuggestedTime();
      const newUid = `linked-${spotObj.id}-${Date.now()}`;
      const spotCost = Number(spotObj.cost || 250);

      appState.timeline.push({
        uid: newUid,
        spotId: spotObj.id,
        source: spotObj.source || "IG Reels",
        time: assignedTime,
        transport: `📍 ${spotObj.area || "曼谷市區"}`,
        cost: spotCost,
        tip: spotObj.tip || `${spotObj.name} 為熱門探店景點，建議避開尖峰用餐時段。`,
        check: spotObj.check || `確認 ${spotObj.name} 營業時間與位置路線`,
        title: spotObj.name,
        desc: spotObj.desc
      });

      appState.acceptedSpots.push({
        id: spotObj.id,
        name: spotObj.name,
        area: spotObj.area || "曼谷市區",
        source: spotObj.source || "IG Reels",
        time: assignedTime,
        cost: spotCost
      });

      saveState();
      syncAllSections(newUid);
    };

    const removeSpotEverywhere = (spotId) => {
      appState.timeline = appState.timeline.filter((t) => t.spotId !== spotId);
      appState.acceptedSpots = appState.acceptedSpots.filter((s) => s.id !== spotId);
      saveState();
      syncAllSections();
    };

    /* ----------------------------------------------------------
     * 區塊一上方：「＋ 手動新增行程」與「↺ 還原預設行程」
     * ---------------------------------------------------------- */
    const toggleAddStopBtn = document.getElementById("toggle-add-stop-btn");
    const timelineAddBox = document.getElementById("timeline-add-box");
    const timelineAddForm = document.getElementById("timeline-add-form");

    if (toggleAddStopBtn && timelineAddBox) {
      toggleAddStopBtn.addEventListener("click", () => {
        timelineAddBox.classList.toggle("open");
        const timeField = document.getElementById("new-stop-time");
        if (timeField && !timeField.value) timeField.value = getNextSuggestedTime();
      });
    }

    if (timelineAddForm) {
      timelineAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const time = document.getElementById("new-stop-time").value || getNextSuggestedTime();
        const title = document.getElementById("new-stop-title").value.trim();
        const transport = document.getElementById("new-stop-transport").value.trim() || "🚇 捷運／步行";
        const cost = Number(document.getElementById("new-stop-cost").value || 0);
        const desc = document.getElementById("new-stop-desc").value.trim() || "自訂彈性行程節點。";
        const tip = document.getElementById("new-stop-tip")?.value.trim() || "";
        const check =
          document.getElementById("new-stop-check")?.value.trim() || `確認「${title}」營業時間與交通路線`;

        if (!title) return;
        const newUid = `custom-stop-${Date.now()}`;

        appState.timeline.push({
          uid: newUid,
          spotId: null,
          source: null,
          time,
          transport,
          cost,
          tip,
          check,
          title,
          desc
        });

        saveState();
        syncAllSections(newUid);

        timelineAddForm.reset();
        timelineAddBox.classList.remove("open");
      });
    }

    const restoreTimelineBtn = document.getElementById("restore-timeline-btn");
    if (restoreTimelineBtn) {
      restoreTimelineBtn.addEventListener("click", () => {
        appState = {
          timeline: JSON.parse(JSON.stringify(defaultTimeline)),
          acceptedSpots: []
        };
        localStorage.removeItem(stateStorageKey);
        syncAllSections();
      });
    }

    /* ----------------------------------------------------------
     * 區塊二：固定 3 卡推薦遞補引擎
     * ---------------------------------------------------------- */
    const reservePool = [...(RESERVE_SPOTS_DB[guideId] || [])];
    let reserveCursor = 0;

    const buildCardElement = (spot, isFadeIn = false) => {
      const article = document.createElement("article");
      article.className = `candidate-card${isFadeIn ? " fade-in" : ""}`;
      article.dataset.spotId = spot.id;
      article.dataset.spotName = spot.name;
      article.dataset.spotArea = spot.area;
      article.dataset.cost = spot.cost || 250;
      article.dataset.tip = spot.tip || "";
      article.dataset.check = spot.check || "";

      const badgeClass = spot.source === "YouTube" ? "yt" : "ig";
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + " Bangkok")}`;

      article.innerHTML = `
        <div>
          <div class="candidate-top">
            <span class="source-badge ${badgeClass}">${escapeHtml(spot.source)}</span>
            <a href="${escapeHtml(spot.url || "https://www.instagram.com/")}" target="_blank" rel="noopener" class="video-link">查看原片 ↗</a>
          </div>
          <h3>${escapeHtml(spot.name)}</h3>
          <p class="spot-area-tag">📍 區域：${escapeHtml(spot.area)} ｜ 💰 約 ${Number(spot.cost || 250)} THB</p>
          <p class="spot-desc">${escapeHtml(spot.desc)}</p>
        </div>
        <div class="candidate-actions">
          <a href="${mapUrl}" target="_blank" rel="noopener" class="map-btn">🗺️ 地圖</a>
          <button type="button" class="btn-accept">＋ 納入行程</button>
          <button type="button" class="btn-reject">✕ 略過</button>
        </div>
      `;
      bindRecommendationCard(article);
      return article;
    };

    const getNextReserveSpot = () => {
      const currentIds = new Set(
        Array.from(candidatePool.querySelectorAll(".candidate-card")).map((c) => c.dataset.spotId)
      );
      const acceptedIds = new Set(appState.acceptedSpots.map((s) => s.id));

      for (let i = 0; i < reservePool.length; i++) {
        const candidate = reservePool[(reserveCursor + i) % reservePool.length];
        if (!currentIds.has(candidate.id) && !acceptedIds.has(candidate.id)) {
          reserveCursor = (reserveCursor + i + 1) % reservePool.length;
          return candidate;
        }
      }
      const fallback = reservePool[reserveCursor % reservePool.length];
      reserveCursor = (reserveCursor + 1) % reservePool.length;
      return { ...fallback, id: `${fallback.id}-${Date.now()}` };
    };

    const fadeOutAndReplenish = (cardEl) => {
      cardEl.classList.remove("fade-in");
      cardEl.classList.add("fade-out");

      setTimeout(() => {
        const nextSpot = getNextReserveSpot();
        const newCardEl = buildCardElement(nextSpot, true);
        if (cardEl.parentNode === candidatePool) {
          candidatePool.replaceChild(newCardEl, cardEl);
        }
      }, 280);
    };

    function bindRecommendationCard(cardEl) {
      const acceptBtn = cardEl.querySelector(".btn-accept");
      const rejectBtn = cardEl.querySelector(".btn-reject");

      const extractSpotData = () => ({
        id: cardEl.dataset.spotId,
        name: cardEl.dataset.spotName,
        area: cardEl.dataset.spotArea || "曼谷市區",
        cost: Number(cardEl.dataset.cost || 250),
        tip: cardEl.dataset.tip || "",
        check: cardEl.dataset.check || "",
        source: cardEl.querySelector(".source-badge")?.textContent.trim() || "IG Reels",
        url: cardEl.querySelector(".video-link")?.href || "https://www.instagram.com/",
        desc: cardEl.querySelector(".spot-desc")?.textContent.trim() || ""
      });

      acceptBtn.addEventListener("click", () => {
        addSpotToAllSections(extractSpotData());
        fadeOutAndReplenish(cardEl);
      });

      rejectBtn.addEventListener("click", () => {
        reservePool.push(extractSpotData());
        fadeOutAndReplenish(cardEl);
      });
    }

    candidatePool.querySelectorAll(".candidate-card").forEach(bindRecommendationCard);

    /* ----------------------------------------------------------
     * 區塊二：影音自動爬蟲解析引擎
     * ---------------------------------------------------------- */
    const crawlerForm = document.getElementById("crawler-form");
    const urlInput = document.getElementById("crawler-url-input");
    const videoFileInput = document.getElementById("crawler-file-input");
    const fileLabelText = document.getElementById("file-label-text");
    const statusBox = document.getElementById("crawler-status");
    const statusText = document.getElementById("crawler-status-text");
    const progressFill = document.getElementById("crawler-progress-fill");
    const crawledContainer = document.getElementById("crawled-results-container");
    const crawledGrid = document.getElementById("crawled-results-grid");
    const crawlBtn = document.getElementById("btn-crawl-submit");

    document.querySelectorAll(".btn-sample").forEach((btn) => {
      btn.addEventListener("click", () => {
        urlInput.value = btn.dataset.sampleUrl;
        crawlerForm.dispatchEvent(new Event("submit"));
      });
    });

    if (videoFileInput) {
      videoFileInput.addEventListener("change", () => {
        if (videoFileInput.files && videoFileInput.files[0]) {
          const fileName = videoFileInput.files[0].name;
          fileLabelText.textContent = `🎬 已載入：${fileName}`;
          urlInput.value = `local-video://${fileName}`;
          crawlerForm.dispatchEvent(new Event("submit"));
        }
      });
    }

    const parseSpotsFromMetadata = (rawUrl, fetchedTitle = "") => {
      const combined = `${rawUrl} ${fetchedTitle}`.toLowerCase();
      const isYT = combined.includes("youtube.com") || combined.includes("youtu.be");
      const sourceLabel = isYT ? "YouTube" : "IG Reels";

      for (const tpl of CRAWLER_TEMPLATES) {
        if (tpl.keywords.some((kw) => combined.includes(kw))) {
          return tpl.spots.map((s, i) => ({
            id: `crawled-${Date.now()}-${i}`,
            name: s.name,
            area: s.area,
            cost: s.cost || 250,
            tip: s.tip || "",
            check: s.check || "",
            source: sourceLabel,
            url: rawUrl.startsWith("http") ? rawUrl : "https://www.instagram.com/",
            desc: fetchedTitle ? `【解析自影片：${fetchedTitle}】${s.desc}` : s.desc
          }));
        }
      }

      const spotA = getNextReserveSpot();
      const spotB = getNextReserveSpot();
      return [spotA, spotB].map((s, i) => ({
        id: `crawled-${Date.now()}-${i}`,
        name: s.name,
        area: s.area,
        cost: s.cost || 250,
        tip: s.tip || "",
        check: s.check || "",
        source: sourceLabel,
        url: rawUrl.startsWith("http") ? rawUrl : s.url,
        desc: fetchedTitle
          ? `【爬蟲解析影片「${fetchedTitle}」地標】${s.desc}`
          : `【AI 影音爬蟲自動識別地標】${s.desc}`
      }));
    };

    if (crawlerForm) {
      crawlerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const rawUrl = urlInput.value.trim();
        if (!rawUrl) return;

        crawlBtn.disabled = true;
        statusBox.classList.add("active");
        crawledContainer.classList.remove("active");
        progressFill.style.width = "25%";
        statusText.textContent = "🕷️ 步驟 1/3：正在連線擷取影音 Metadata 與字幕軸資訊...";

        let fetchedTitle = "";
        if (rawUrl.startsWith("http")) {
          try {
            const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.title) fetchedTitle = data.title;
            }
          } catch (_) {}
        }

        setTimeout(() => {
          progressFill.style.width = "68%";
          statusText.textContent = "📍 步驟 2/3：正在比對曼谷地標資料庫、避雷提示與預估消費...";
        }, 420);

        setTimeout(() => {
          progressFill.style.width = "100%";
          const extractedSpots = parseSpotsFromMetadata(rawUrl, fetchedTitle);
          statusText.textContent = `✅ 解析完成！從影音中自動找出 ${extractedSpots.length} 個景點／店家（點擊「納入行程」即時同步全站）：`;
          crawlBtn.disabled = false;

          crawledGrid.innerHTML = "";
          extractedSpots.forEach((spot) => {
            const card = document.createElement("article");
            card.className = "candidate-card fade-in";
            const badgeClass = spot.source === "YouTube" ? "yt" : "ig";
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + " Bangkok")}`;

            card.innerHTML = `
              <div>
                <div class="candidate-top">
                  <span class="source-badge ${badgeClass}">${escapeHtml(spot.source)} 爬蟲結果</span>
                  <a href="${escapeHtml(spot.url)}" target="_blank" rel="noopener" class="video-link">來源影片 ↗</a>
                </div>
                <h3>${escapeHtml(spot.name)}</h3>
                <p class="spot-area-tag">📍 區域：${escapeHtml(spot.area)} ｜ 💰 約 ${Number(spot.cost)} THB</p>
                <p class="spot-desc">${escapeHtml(spot.desc)}</p>
              </div>
              <div class="candidate-actions">
                <a href="${mapUrl}" target="_blank" rel="noopener" class="map-btn">🗺️ 地圖</a>
                <button type="button" class="btn-accept">＋ 納入行程</button>
                <button type="button" class="btn-reject">✕ 略過</button>
              </div>
            `;

            card.querySelector(".btn-accept").addEventListener("click", () => {
              addSpotToAllSections(spot);
              card.classList.add("fade-out");
              setTimeout(() => card.remove(), 260);
            });

            card.querySelector(".btn-reject").addEventListener("click", () => {
              card.classList.add("fade-out");
              setTimeout(() => card.remove(), 260);
            });

            crawledGrid.appendChild(card);
          });

          crawledContainer.classList.add("active");
        }, 900);
      });
    }

    // 清空已納入的區塊二景點（同步更新全頁）
    const resetBtn = document.getElementById("reset-spots-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const linkedIds = new Set(appState.acceptedSpots.map((s) => s.id));
        appState.timeline = appState.timeline.filter((t) => !linkedIds.has(t.spotId));
        appState.acceptedSpots = [];
        saveState();
        syncAllSections();
      });
    }

    // 一鍵複製目前完整時間軸給 AI
    const exportBtn = document.getElementById("export-selected-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const sortedStops = [...appState.timeline].sort((a, b) => a.time.localeCompare(b.time));
        if (sortedStops.length === 0) {
          alert("目前時間軸沒有任何行程可供複製喔！");
          return;
        }
        const listStr = sortedStops
          .map((s) => `- [${s.time}] ${s.title}（${s.transport}，預估 ${s.cost} THB）`)
          .join("\n");
        const prompt = `請依照 AGENTS.md 規範，幫我檢視並優化以下「${guideId}.html」的最新即時行程表與交通接駁建議：\n${listStr}`;
        navigator.clipboard.writeText(prompt).then(() => {
          const oldText = exportBtn.textContent;
          exportBtn.textContent = "✓ 已複製最新完整行程！";
          setTimeout(() => (exportBtn.textContent = oldText), 2000);
        });
      });
    }

    // 初次載入頁面時，同步渲染所有區塊
    syncAllSections();
  }
});