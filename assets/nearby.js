/* 📍 내 주변 — 헤더 셋째 줄(예전 탭 줄 자리 .subbar)의 카테고리 버튼 + 카테고리 화면(#nearby/<id>)
 * - 줄: '📍 내 주변'(누를 수 없는 이름표) + 카테고리 버튼 5개(🍜 맛집 · 💆 마사지 · 🐶 동물병원 · 💅 피부·뷰티 · 🏍️ 오토바이, 2026-10-03 v2).
 *   휴대폰(≤640px)은 버튼 = 그림 위·글자 아래 두 줄(390·430px 에 다 들어감), 더 좁아 넘치면 옆으로 밀기 + 오른쪽 끝 흐림(.nearby--scroll).
 * - 버튼 → 화면 #nearby/<id>(앱 안 전체 화면, 데스크톱은 가운데 창): 맨 위 광고 1개(data/ads.json 슬롯 nearby-<id>, '광고')
 *   → 큰 버튼 '📍 내 주변 평점 좋은 곳 구글 지도로 보기'(새 탭) → 빠른 찾기 작은 버튼 → 안내.
 * - 위치: 버튼을 누를 때 브라우저 위치 권한을 물음. 허용 → https://www.google.com/maps/search/<검색어>/@위도,경도,15z
 *   거절·실패 → 지역(이 화면에서 고른 지역 > 날씨 칩 지역 > 페르소나 > 파타야) 'restaurants in Pattaya' 같은 검색.
 *   좌표는 지도 주소를 만드는 데만 쓰고 저장하지 않음(이 페이지 메모리에 10분).
 * - ★ 카테고리 설정은 아래 NEARBY 객체 하나. 나중에 Google Places API(New) Nearby Search 로 앱 안 순위 목록을 만들 때
 *   places.includedTypes 를 그대로 쓰고, 화면의 '지도 버튼' 자리(renderPage 의 .nb-go)에 목록을 넣으면 됨. */
(function () {
  "use strict";
  var NEARBY = window.TN_NEARBY = {
    zoom: 15,
    regions: {   // 위치 권한이 없을 때 쓰는 지역(assets/ticker.js REGIONS 와 같은 id)
      pattaya:  { name: "파타야", en: "Pattaya",  lat: 12.9236, lng: 100.8825 },
      sriracha: { name: "시라차", en: "Si Racha", lat: 13.1682, lng: 100.9310 },
      bangkok:  { name: "방콕",   en: "Bangkok",  lat: 13.7563, lng: 100.5018 }
    },
    // id = 주소 #nearby/<id> · label = 화면 제목('내 주변 <label>') · short = 헤더 줄 버튼 글자(없으면 label) · tag = 광고 '이 자리 추천 업종'(data/ads.json target)
    // query/subs[].query = 구글 지도 검색어(영어) · places = 나중에 Places API(New) 로 바꿀 때 쓸 값(includedTypes 는 Table A 만, 없으면 textQuery)
    // 2026-10-03 v2(운영자): 💇 미용실·🛒 마트 빼고 🐶 동물병원·펫샵 · 💅 피부과·성형·에스테틱 · 🏍️ 오토바이 렌탈·판매 추가. 옛 #nearby/hair|mart → 피드로(RETIRED)
    categories: [
      { id: "food", emoji: "🍜", label: "맛집", slot: "nearby-food", query: "restaurants",
        places: { includedTypes: ["restaurant"] },
        subs: [ { label: "한식", query: "korean restaurant", places: { includedTypes: ["korean_restaurant"] } },
                { label: "태국음식", query: "thai restaurant", places: { includedTypes: ["thai_restaurant"] } },
                { label: "카페", query: "cafe", places: { includedTypes: ["cafe"] } } ] },
      { id: "massage", emoji: "💆", label: "마사지", slot: "nearby-massage", query: "massage",
        places: { includedTypes: ["massage", "spa"] },
        subs: [ { label: "타이 마사지", query: "thai massage", places: { includedTypes: ["massage"] } },
                { label: "스파", query: "spa", places: { includedTypes: ["spa"] } } ] },
      { id: "pet", emoji: "🐶", label: "동물병원·펫샵", short: "동물병원", tag: "동물병원·펫샵", slot: "nearby-pet", query: "veterinary clinic",
        places: { includedTypes: ["veterinary_care", "pet_store", "pet_care"] },
        subs: [ { label: "동물병원", query: "veterinary clinic", places: { includedTypes: ["veterinary_care"] } },
                { label: "펫샵", query: "pet shop", places: { includedTypes: ["pet_store"] } },
                { label: "애견미용", query: "pet grooming", places: { includedTypes: ["pet_care"], textQuery: "pet grooming" } } ] },
      { id: "beauty", emoji: "💅", label: "피부과·성형·에스테틱", short: "피부·뷰티", tag: "피부과·성형·에스테틱", slot: "nearby-beauty", query: "skin clinic",
        places: { includedTypes: ["skin_care_clinic", "beauty_salon", "medical_clinic"] },
        subs: [ { label: "피부과", query: "dermatology clinic", places: { includedTypes: ["skin_care_clinic"], textQuery: "dermatology clinic" } },
                { label: "성형외과", query: "plastic surgery clinic", places: { includedTypes: ["medical_clinic"], textQuery: "plastic surgery clinic" } },
                { label: "에스테틱", query: "aesthetic clinic", places: { includedTypes: ["beauty_salon", "beautician"], textQuery: "aesthetic clinic beauty salon" } } ] },
      { id: "moto", emoji: "🏍️", label: "오토바이 렌탈·판매", short: "오토바이", tag: "오토바이 렌탈·판매", slot: "nearby-moto", query: "motorbike rental",
        places: { textQuery: "motorbike rental" },   // Table A 에 오토바이 종류 없음 → Text Search 검색어로
        subs: [ { label: "렌탈", query: "motorbike rental", places: { textQuery: "motorbike rental" } },
                { label: "판매", query: "motorcycle dealer", places: { textQuery: "motorcycle dealer" } },
                { label: "수리", query: "motorcycle repair", places: { textQuery: "motorcycle repair shop" } } ] }
    ],
    retired: ["hair", "mart"]   // 예전 카테고리(10-03 v1). 옛 링크 #nearby/hair|mart 는 화면 없이 피드로(주소에서 #nearby 지움)
  };

  var LS_REGION = "tnk.nearbyRegion", GEO_TTL = 10 * 60 * 1000;
  var geo = { pos: null, at: 0, state: "unknown" };   // state: unknown | granted | denied | error | unsupported
  var cur = null, root = null, lastFocus = null, pushed = false;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var byId = function (id) { return NEARBY.categories.filter(function (c) { return c.id === id; })[0] || null; };
  if (!navigator.geolocation) geo.state = "unsupported";

  function region() {
    var R = NEARBY.regions, r = ls(LS_REGION); if (R[r]) return r;
    r = ls("tnk.wxRegion"); if (R[r]) return r;
    var d = window.TNStore && window.TNStore.get && window.TNStore.get(), p = d && d.persona;
    var rg = d && d.region && window.TNTopics && window.TNTopics.region && window.TNTopics.region(d.region);   // 시작 화면에서 고른 사는 곳
    if (rg && R[rg.nb || rg.wx]) return rg.nb || rg.wx;
    return R[p] ? p : "pattaya";
  }
  function havePos() { return geo.pos && Date.now() - geo.at < GEO_TTL; }
  function mapsUrl(q) {
    if (havePos()) return "https://www.google.com/maps/search/" + encodeURIComponent(q) + "/@" + geo.pos.lat.toFixed(5) + "," + geo.pos.lng.toFixed(5) + "," + NEARBY.zoom + "z";
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q + " in " + NEARBY.regions[region()].en);
  }

  /* ---------- 헤더 줄 ---------- */
  function renderRow() {
    var row = document.getElementById("nearbyRow"); if (!row) return;
    row.innerHTML = '<span class="nb-lab"><span class="nb-lab__e" aria-hidden="true">📍</span> <span class="nb-lab__t">내 주변</span></span>' +
      '<div class="nb-cats">' + NEARBY.categories.map(function (c) {
        var sh = c.short || c.label;
        return '<a class="nb-cat" href="#nearby/' + c.id + '" data-nb-cat="' + c.id + '"' + (sh !== c.label ? ' aria-label="' + esc(c.label) + '"' : "") +
          '><span class="nb-cat__e" aria-hidden="true">' + c.emoji + '</span><span class="nb-cat__t">' + esc(sh) + "</span></a>";
      }).join("") + "</div>";
    row.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-nb-cat]"); if (!a) return;
      e.preventDefault(); open(a.getAttribute("data-nb-cat"), true);
    });
    // 좁은 화면에서 버튼이 넘치면 옆으로 밀기 + 오른쪽 끝 흐림(끝까지 밀면 흐림 없앰)
    var cats = row.querySelector(".nb-cats");
    var fit = function () {
      var over = cats.scrollWidth - cats.clientWidth > 2;
      row.classList.toggle("nearby--scroll", over);
      row.classList.toggle("nearby--end", !over || cats.scrollLeft + cats.clientWidth >= cats.scrollWidth - 2);
    };
    cats.addEventListener("scroll", fit, { passive: true });
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
  }

  /* ---------- 광고(data/ads.json 슬롯 nearby-<id>) — app.js adHTML 과 같은 모양. item.render === "dragon" 이면 드래곤 스웨디시 배너 ---------- */
  function adSlot(id) {
    var A = window.TN_ADS; if (!A || A.enabled === false || !A.slots) return null;
    return A.slots.filter(function (x) { return x.id === id && x.enabled !== false && x.items && x.items.length; })[0] || null;
  }
  function adHTML(sl) {
    var it = sl.items[0], lab = window.TN_ADS.label || "광고";
    var safe = function (u) { return u && /^https:\/\//.test(u) ? u : null; };
    var link = safe(it.link), img = safe(it.image);
    var inner = '<span class="ad__tag">' + esc(lab) + "</span>" + (img ? '<img class="ad__img" src="' + esc(img) + '" alt="" loading="lazy">' : "") +
      '<span class="ad__txt">' + (it.category ? '<span class="ad__cat">' + esc(it.category) + "</span>" : "") +
      '<b class="ad__t">' + esc(it.title || "여기에 광고하세요") + '</b><small class="ad__s">' + esc(it.subtitle || "광고 문의") + "</small></span>";
    var cls = "ad ad--" + esc(sl.size || "medium") + " ad--t" + (it.theme || 1);
    return link ? '<a class="' + cls + '" href="' + esc(link) + '" target="_blank" rel="sponsored noopener" aria-label="' + esc(lab) + '">' + inner + "</a>"
      : '<div class="' + cls + '" role="note" aria-label="' + esc(lab) + ' 자리">' + inner + "</div>";
  }
  function mountAd(el, c) {
    var sl = adSlot(c.slot);
    if (!sl) { el.hidden = true; return; }
    var it = sl.items[0];
    // render:"dragon" = 드래곤 스웨디시 배너 + '이 자리 추천 업종' 꼬리표(data/ads.js 의 TN_ADS.dragon 으로 바로 그림). 못 그리면 일반 카드
    if (it.render === "dragon" && !it.target && c.tag) { it = Object.assign({}, it, { target: c.tag }); }   // 꼬리표 비었으면 NEARBY 의 tag
    var dg = it.render === "dragon" && window.DragonAd && window.DragonAd.slotHTML && window.DragonAd.slotHTML(it);
    el.innerHTML = dg || adHTML(sl);
    if (!dg && it.render === "dragon" && window.DragonAd) {   // 옛 ads.js(TN_ADS.dragon 없음): ad.json 을 받아 그림
      window.DragonAd.mount(document.createElement("div"), { variant: it.variant || "small", target: it.target || "" }).then(function (box) {
        if (box && box.innerHTML && cur === c.id) el.innerHTML = box.innerHTML;
      });
    }
  }

  /* ---------- 카테고리 화면 ---------- */
  function statusHTML() {
    var R = NEARBY.regions, rg = region();
    var line = havePos() ? '<b>📍 내 위치 기준</b>으로 지도를 열어요.'
      : geo.state === "denied" ? "위치 권한이 꺼져 있어 <b>" + R[rg].name + "</b> 기준으로 열어요."
      : geo.state === "error" || geo.state === "unsupported" ? "위치를 확인하지 못해 <b>" + R[rg].name + "</b> 기준으로 열어요."
      : "누르면 위치 권한을 물어요. 허용하면 <b>내 위치</b>, 아니면 <b>" + R[rg].name + "</b> 기준.";
    var pick = havePos() ? "" : '<span class="nb-rg" role="group" aria-label="위치를 못 쓸 때 기준 지역">' + Object.keys(R).map(function (k) {
      return '<button type="button" data-nb-rg="' + k + '" aria-pressed="' + (k === rg) + '">' + R[k].name + "</button>"; }).join("") + "</span>";
    return '<p class="nb-st__t">' + line + "</p>" + pick;
  }
  function renderPage(c) {
    return '<div class="nb-page__panel" role="document">' +
      '<div class="nb-page__bar"><button type="button" class="nb-back" data-nb-back aria-label="뒤로 — 뉴스로 돌아가기">← 뒤로</button>' +
      '<h2 class="nb-page__t" id="nbTitle"><span aria-hidden="true">' + c.emoji + "</span> 내 주변 " + esc(c.label) + "</h2></div>" +
      '<div class="nb-page__body">' +
      '<div class="ad-slot nb-ad" data-nb-ad></div>' +
      '<a class="nb-go" data-nb-q="' + esc(c.query) + '" href="' + esc(mapsUrl(c.query)) + '" target="_blank" rel="noopener">📍 내 주변 평점 좋은 곳<br>구글 지도로 보기</a>' +
      '<div class="nb-st" data-nb-st aria-live="polite">' + statusHTML() + "</div>" +
      '<p class="nb-sec">빠른 찾기</p><div class="nb-subs">' + c.subs.map(function (s) {
        return '<a class="nb-sub" data-nb-q="' + esc(s.query) + '" href="' + esc(mapsUrl(s.query)) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>"; }).join("") + "</div>" +
      '<p class="nb-note">💡 평점 좋은 곳만 보려면 구글 지도 위쪽 필터에서 <b>평점</b>을 눌러 4.0 이상 등을 고르세요.</p>' +
      '<p class="nb-note nb-note--sm">구글 지도가 새 창(앱에서는 앱 안 브라우저)으로 열려요. 위치는 지도 주소를 만드는 데만 쓰고 이 사이트에 저장하지 않아요. 순위·평점은 구글 지도 기준이며 이 사이트의 추천이 아니에요.</p>' +
      "</div></div>";
  }
  function refreshLinks() {
    if (!root) return;
    [].forEach.call(root.querySelectorAll("[data-nb-q]"), function (a) { a.href = mapsUrl(a.getAttribute("data-nb-q")); });
    var st = root.querySelector("[data-nb-st]"); if (st) st.innerHTML = statusHTML();
  }
  function locate(cb) {   // cb(true|false)
    if (!navigator.geolocation) { geo.state = "unsupported"; cb(false); return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      geo.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; geo.at = Date.now(); geo.state = "granted"; refreshLinks(); cb(true);
    }, function (err) {
      geo.state = err && err.code === 1 ? "denied" : "error"; refreshLinks(); cb(false);
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 });
  }
  function peekPermission() {   // 이미 허용돼 있으면 묻지 않고 조용히 좌표를 받아 링크를 바꿔 둠
    try {
      navigator.permissions.query({ name: "geolocation" }).then(function (r) {
        if (r.state === "granted" && !havePos()) locate(function () {});
        else if (r.state === "denied") { geo.state = "denied"; refreshLinks(); }
      }, function () {});
    } catch (e) {}
  }
  function openUrl(url) {
    var w = null;
    try { w = window.open(url, "_blank"); } catch (e) {}
    if (w) { try { w.opener = null; } catch (e) {} return; }
    // 팝업이 막힘(위치 확인이 오래 걸려 '사용자 동작'이 끝난 경우) → 링크는 이미 바뀌었으니 한 번 더 누르면 열림
    var st = root && root.querySelector("[data-nb-st]");
    if (st) st.insertAdjacentHTML("afterbegin", '<p class="nb-st__t nb-st__t--hl">✅ 준비됐어요. 버튼을 한 번 더 눌러 주세요.</p>');
  }
  function onGo(e, a) {
    if (havePos() || geo.state === "denied" || geo.state === "unsupported") return;   // 그냥 링크대로(새 탭)
    e.preventDefault();
    var st = root.querySelector("[data-nb-st]"); if (st) st.innerHTML = '<p class="nb-st__t">📍 위치 확인 중…</p>';
    a.setAttribute("aria-busy", "true");
    locate(function () { a.removeAttribute("aria-busy"); openUrl(mapsUrl(a.getAttribute("data-nb-q"))); });
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.className = "nb-page"; root.id = "nearbyPage"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-labelledby", "nbTitle");
    document.body.appendChild(root);
    root.addEventListener("click", function (e) {
      var t = e.target;
      if (t === root) { back(); return; }   // 데스크톱: 바깥 누르기
      var el;
      if ((el = t.closest("[data-nb-back]"))) { back(); return; }
      if ((el = t.closest("[data-nb-rg]"))) { ls(LS_REGION, el.getAttribute("data-nb-rg")); refreshLinks(); return; }
      if ((el = t.closest("[data-nb-q]"))) { onGo(e, el); return; }
    });
    document.addEventListener("keydown", function (e) {
      if (root.hidden) return;
      if (e.key === "Escape") { back(); return; }
      if (e.key === "Tab") {   // 포커스 가두기
        var f = [].filter.call(root.querySelectorAll("a[href],button"), function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    return root;
  }
  function show(id) {
    var c = byId(id); if (!c) return false;
    ensureRoot();
    if (root.hidden) lastFocus = document.activeElement;
    cur = id;
    try { localStorage.setItem("tnk.nbLast", id); } catch (e) {}   // ☰ 바로가기 '📍 내 주변'이 마지막 종류로 열림
    root.innerHTML = renderPage(c);
    mountAd(root.querySelector("[data-nb-ad]"), c);
    root.hidden = false; root.scrollTop = 0;
    document.body.classList.add("nb-open");
    [].forEach.call(document.querySelectorAll("[data-nb-cat]"), function (a) { if (a.getAttribute("data-nb-cat") === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var b = root.querySelector("[data-nb-back]"); if (b) b.focus({ preventScroll: true });
    peekPermission();
    return true;
  }
  function hide() {
    if (!root || root.hidden) return;
    root.hidden = true; root.innerHTML = ""; cur = null;
    document.body.classList.remove("nb-open");
    [].forEach.call(document.querySelectorAll("[data-nb-cat][aria-current]"), function (a) { a.removeAttribute("aria-current"); });
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function open(id, push) {
    if (!byId(id)) return;
    var h = "#nearby/" + id;
    if (location.hash !== h) {
      if (push && !cur) { history.pushState({ nb: id }, "", h); pushed = true; }
      else history.replaceState(history.state && history.state.nb ? { nb: id } : history.state, "", h);
    }
    show(id);
  }
  function back() {   // 뒤로 = 피드로(우리가 넣은 기록이면 브라우저 뒤로, 아니면 주소에서 #nearby 만 지움)
    if (pushed && history.state && history.state.nb) { pushed = false; history.back(); return; }
    history.replaceState(null, "", location.pathname + location.search);
    hide();
  }
  function fromHash() {
    var m = /^#nearby\/([a-z0-9_-]*)/.exec(location.hash);
    if (m && byId(m[1])) { show(m[1]); return; }
    pushed = false; hide();
    // 없는·옛 카테고리(#nearby/hair · #nearby/mart 등) → 주소에서 #nearby 를 지우고 피드 그대로(헤더 줄에서 다시 고르면 됨)
    if (m) history.replaceState(null, "", location.pathname + location.search);
  }
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);

  renderRow();
  if (/^#nearby\//.test(location.hash)) fromHash();
  window.TNNearby = { open: open, close: back, config: NEARBY, mapsUrl: mapsUrl };
})();
