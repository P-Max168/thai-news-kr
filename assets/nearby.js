/* 📍 내 주변 — 헤더 셋째 줄(예전 탭 줄 자리 .subbar)의 카테고리 버튼 + 카테고리 화면(#nearby/<id>)
 * - 줄: '📍 내 주변'(누를 수 없는 이름표) + 카테고리 버튼 5개(🍜 맛집 · 💆 마사지 · 🐶 동물병원 · 💅 뷰티(=피부과·성형·에스테틱, 좁은 화면에서 안 잘리게 짧게 10-03) · 🏍️ 오토바이, 2026-10-03 v2).
 *   휴대폰(≤640px)은 버튼 = 그림 위·글자 아래 두 줄(390·430px 에 다 들어감), 더 좁아 넘치면 옆으로 밀기 + 오른쪽 끝 흐림(.nearby--scroll).
 * - 버튼 → 화면 #nearby/<id>(앱 안 전체 화면, 데스크톱은 가운데 창): 맨 위 광고 1개(data/ads.json 슬롯 nearby-<id>, '광고')
 *   → 큰 버튼 '📍 내 주변 평점 좋은 곳 구글 지도로 보기'(새 탭) → 빠른 찾기 작은 버튼 → 안내.
 * - 위치: 버튼을 누를 때 브라우저 위치 권한을 물음. 허용 → https://www.google.com/maps/search/<검색어>/@위도,경도,15z
 *   거절·실패 → 지역(이 화면에서 고른 지역 > 날씨 칩 지역 > 페르소나 > 파타야) 'restaurants in Pattaya' 같은 검색.
 *   좌표는 지도 주소를 만드는 데만 쓰고 저장하지 않음(이 페이지 메모리에 10분).
 * - ★ 2026-10-26 장소 엔진(ops/SYSTEM_PLAN.md 9절): 화면 맨 위가 '확인한 곳' 카드(data/places-curated.json, tools/places/build_curated.py).
 *   출처 2곳 이상으로 영업 확인한 파타야 가게만. 표시 안내는 카드 목록 위에 한 번, 카드에는 작은 표시만. 구글 지도 버튼은 아래 '더 찾기'로 내림.
 *   업주 수정: data 의 owner_line(LINE 공식 계정)이 있으면 그 링크, 없으면 ⚠️ 오류 신고 버튼(kind=place).
 * - ★ 카테고리 설정은 아래 NEARBY 객체 하나. 나중에 Google Places API(New) Nearby Search 로 앱 안 순위 목록을 만들 때
 *   places.includedTypes 를 그대로 쓰고, 화면의 '지도 버튼' 자리(renderPage 의 .nb-go)에 목록을 넣으면 됨. */
(function () {
  "use strict";
  if (window.TNSite && TNSite.hidden("places")) return;   // 언어판에서 숨긴 코너(R-zh-9, site/<lang>.json hidden_sections) — 한국판은 그대로
  var NEARBY = window.TN_NEARBY = {
    zoom: 15,
    regions: {   // 위치 권한이 없을 때 쓰는 지역(assets/ticker.js REGIONS 와 같은 id)
      pattaya:  { name: TNI("nearby.k6a1a0cc", "파타야"), en: "Pattaya",  lat: 12.9236, lng: 100.8825 },
      sriracha: { name: TNI("nearby.ka7ba72f", "시라차"), en: "Si Racha", lat: 13.1682, lng: 100.9310 },
      bangkok:  { name: TNI("nearby.k4dc2c29", "방콕"),   en: "Bangkok",  lat: 13.7563, lng: 100.5018 }
    },
    // id = 주소 #nearby/<id> · label = 화면 제목('내 주변 <label>') · short = 헤더 줄 버튼 글자(없으면 label) · tag = 광고 '이 자리 추천 업종'(data/ads.json target)
    // query/subs[].query = 구글 지도 검색어(영어) · places = 나중에 Places API(New) 로 바꿀 때 쓸 값(includedTypes 는 Table A 만, 없으면 textQuery)
    // 2026-10-03 v2(운영자): 💇 미용실·🛒 마트 빼고 🐶 동물병원·펫샵 · 💅 피부과·성형·에스테틱 · 🏍️ 오토바이 렌탈·판매 추가. 옛 #nearby/hair|mart → 피드로(RETIRED)
    categories: [
      { id: "food", emoji: "🍜", label: TNI("nearby.k65428f4", "맛집"), slot: "nearby-food", query: "restaurants",
        places: { includedTypes: ["restaurant"] },
        subs: [ { label: TNI("nearby.ke493ea6", "한식"), query: "korean restaurant", places: { includedTypes: ["korean_restaurant"] } },
                { label: TNI("nearby.k57054cf", "태국음식"), query: "thai restaurant", places: { includedTypes: ["thai_restaurant"] } },
                { label: TNI("nearby.k6daadb8", "카페"), query: "cafe", places: { includedTypes: ["cafe"] } } ] },
      { id: "massage", emoji: "💆", label: TNI("nearby.kb8cee4f", "마사지"), slot: "nearby-massage", query: "massage",
        places: { includedTypes: ["massage", "spa"] },
        subs: [ { label: TNI("nearby.kf704341", "타이 마사지"), query: "thai massage", places: { includedTypes: ["massage"] } },
                { label: TNI("nearby.kc95e600", "스파"), query: "spa", places: { includedTypes: ["spa"] } } ] },
      { id: "pet", emoji: "🐶", label: TNI("nearby.k112a086", "동물병원·펫샵"), short: TNI("nearby.k252f77c", "동물병원"), tag: TNI("nearby.k112a086", "동물병원·펫샵"), slot: "nearby-pet", query: "veterinary clinic",
        places: { includedTypes: ["veterinary_care", "pet_store", "pet_care"] },
        subs: [ { label: TNI("nearby.k252f77c", "동물병원"), query: "veterinary clinic", places: { includedTypes: ["veterinary_care"] } },
                { label: TNI("nearby.kf7ba209", "펫샵"), query: "pet shop", places: { includedTypes: ["pet_store"] } },
                { label: TNI("nearby.ke1f1578", "애견미용"), query: "pet grooming", places: { includedTypes: ["pet_care"], textQuery: "pet grooming" } } ] },
      { id: "beauty", emoji: "💅", label: TNI("nearby.k6bbefd7", "피부과·성형·에스테틱"), short: TNI("nearby.k5b22ad1", "뷰티"), tag: TNI("nearby.k6bbefd7", "피부과·성형·에스테틱"), slot: "nearby-beauty", query: "skin clinic",
        places: { includedTypes: ["skin_care_clinic", "beauty_salon", "medical_clinic"] },
        subs: [ { label: TNI("nearby.k464414a", "피부과"), query: "dermatology clinic", places: { includedTypes: ["skin_care_clinic"], textQuery: "dermatology clinic" } },
                { label: TNI("nearby.k8ad05f2", "성형외과"), query: "plastic surgery clinic", places: { includedTypes: ["medical_clinic"], textQuery: "plastic surgery clinic" } },
                { label: TNI("nearby.ked6706a", "에스테틱"), query: "aesthetic clinic", places: { includedTypes: ["beauty_salon", "beautician"], textQuery: "aesthetic clinic beauty salon" } } ] },
      { id: "moto", emoji: "🏍️", label: TNI("nearby.kc05dfc9", "오토바이 렌탈·판매"), short: TNI("nearby.k8bf0166", "오토바이"), tag: TNI("nearby.kc05dfc9", "오토바이 렌탈·판매"), slot: "nearby-moto", query: "motorbike rental",
        places: { textQuery: "motorbike rental" },   // Table A 에 오토바이 종류 없음 → Text Search 검색어로
        subs: [ { label: TNI("nearby.k50e6c53", "렌탈"), query: "motorbike rental", places: { textQuery: "motorbike rental" } },
                { label: TNI("nearby.k509b5ca", "판매"), query: "motorcycle dealer", places: { textQuery: "motorcycle dealer" } },
                { label: TNI("nearby.kb007e3d", "수리"), query: "motorcycle repair", places: { textQuery: "motorcycle repair shop" } } ] }
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
    row.innerHTML = TNI("nearby.k0baec7c", "<span class=\"nb-lab\"><span class=\"nb-lab__e\" aria-hidden=\"true\">📍</span> <span class=\"nb-lab__t\">내 주변</span></span>") +
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
    // 속도(17:45): 재기와 document.fonts.ready(읽기만 해도 스타일 계산을 강제, CPU×4 에서 약 90ms)는 첫 기사 카드 뒤에
    var fit2 = function () { fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); };
    if (window.TNAfterFirst) window.TNAfterFirst(fit2); else fit2();
  }

  /* ---------- 광고(data/ads.json 슬롯 nearby-<id>) — app.js adHTML 과 같은 모양. item.render === "dragon" 이면 드래곤 스웨디시 배너 ---------- */
  function adSlot(id) {
    var A = window.TN_ADS; if (!A || A.enabled === false || !A.slots) return null;
    return A.slots.filter(function (x) { return x.id === id && x.enabled !== false && x.items && x.items.length; })[0] || null;
  }
  function adHTML(sl) {
    var it = sl.items[0], lab = window.TN_ADS.label || TNI("nearby.keb18928", "광고");
    var safe = function (u) { return u && /^https:\/\//.test(u) ? u : null; };
    var link = safe(it.link), img = safe(it.image);
    var inner = '<span class="ad__tag">' + esc(lab) + "</span>" + (img ? '<img class="ad__img" src="' + esc(img) + '" alt="" loading="lazy">' : "") +
      '<span class="ad__txt">' + (it.category ? '<span class="ad__cat">' + esc(it.category) + "</span>" : "") +
      '<b class="ad__t">' + esc(it.title || TNI("nearby.k413ad63", "여기에 광고하세요")) + '</b><small class="ad__s">' + esc(it.subtitle || TNI("nearby.kf89f72f", "광고 문의")) + "</small></span>";
    var cls = "ad ad--" + esc(sl.size || "medium") + " ad--t" + (it.theme || 1);
    return link ? '<a class="' + cls + '" href="' + esc(link) + '" target="_blank" rel="sponsored noopener" aria-label="' + esc(lab) + '">' + inner + "</a>"
      : '<div class="' + cls + '" role="note" aria-label="' + esc(lab) + TNI("nearby.kd18e540", " 자리\">") + inner + "</div>";
  }
  function mountAd(el, c) {
    var sl = adSlot(c.slot);
    if (!sl) { el.hidden = true; return; }
    var mixed = window.TNAds && TNAds.renderSlot(sl, c.slot + ":0");
    if (mixed) { el.hidden = false; el.innerHTML = mixed.html + (window.TNAdRep ? TNAdRep(c.slot, mixed.item) : ""); return; }
    var it = sl.items[0];
    // render:"dragon" = 드래곤 스웨디시 배너 + '이 자리 추천 업종' 꼬리표(data/ads.js 의 TN_ADS.dragon 으로 바로 그림). 못 그리면 일반 카드
    if (it.render === "dragon" && !it.target && c.tag) { it = Object.assign({}, it, { target: c.tag }); }   // 꼬리표 비었으면 NEARBY 의 tag
    var dg = it.render === "dragon" && window.DragonAd && window.DragonAd.slotHTML && window.DragonAd.slotHTML(it, c.slot);
    el.innerHTML = (dg || adHTML(sl)) + (window.TNAdRep ? TNAdRep(c.slot, it) : "");
    if (!dg && it.render === "dragon" && window.DragonAd) {   // 옛 ads.js(TN_ADS.dragon 없음): ad.json 을 받아 그림
      window.DragonAd.mount(document.createElement("div"), { variant: it.variant || "small", target: it.target || "", key: c.slot }).then(function (box) {
        if (box && box.innerHTML && cur === c.id) el.innerHTML = box.innerHTML + (window.TNAdRep ? TNAdRep(c.slot, it) : "");
      });
    }
  }


  /* ---------- ✅ 확인한 곳 카드(장소 엔진, 2026-10-23 준비 · 10-26 공개) ---------- */
  var CUR_DATA = null, curLoading = null;
  var LANG = (window.TNSite && TNSite.lang === "zh") ? "zh" : "ko";
  var U = {   // 화면 문구 — 데이터가 ko·zh 를 같이 갖고 있어 TNI 대신 언어별 표를 씀
    ko: { title: "확인한 곳", sub: "출처 2곳 이상에서 영업을 확인하고 고른 곳이에요.", only: "지금은 파타야만 있어요.",   // i18n:data
      legend: "표시 안내", lg: ["출처 2곳 이상 영업 확인", "업주가 직접 확인", "출처끼리 정보가 다름"],   // i18n:data
      hours: "영업시간", price: "가격", dish: { food: "대표 메뉴", massage: "대표 코스", pet: "주요 진료", beauty: "대표 시술", moto: "주요 서비스" },   // i18n:data
      priceBy: { food: "1인 예산" }, pay: "결제", tel: "전화", unknown: "확인 안 됨",   // i18n:data
      voice: "한국 사람들의 평", n: "후기 ", none: "아직 한국어 후기가 없어요.", more: "좋은 점·아쉬운 점",   // i18n:data
      src: "확인한 출처", owner: "사장님이세요? 정보 수정", ownerHint: "사장님이세요? 틀린 정보는 오류 신고로 알려 주시면 확인 후 고쳐요.",   // i18n:data
      loading: "불러오는 중…", fail: "카드를 불러오지 못했어요. 아래 구글 지도로 찾아 주세요.", baht: "바트", checked: "확인" },   // i18n:data
    zh: { title: "核实过的店", sub: "每家都用两个以上来源确认仍在营业。", only: "目前只有芭提雅。",
      legend: "标记说明", lg: ["两个以上来源确认营业", "店主亲自确认", "来源之间信息不一致"],
      hours: "营业时间", price: "价格", dish: { food: "招牌菜", massage: "招牌项目", pet: "主要诊疗", beauty: "招牌项目", moto: "主要服务" },
      priceBy: { food: "人均" }, pay: "付款", tel: "电话", unknown: "未确认",
      voice: "中文游客怎么说", n: "来源 ", none: "暂无中文评价。", more: "优点与不足",
      src: "核对的来源", owner: "您是店主？修改信息", ownerHint: "您是店主？信息有误请点“报错”，核实后修改。",
      loading: "加载中…", fail: "无法加载，请用下方谷歌地图查找。", baht: "泰铢", checked: "核实" }
  }[LANG];
  function loadCurated() {
    if (CUR_DATA) return Promise.resolve(CUR_DATA);
    if (curLoading) return curLoading;
    curLoading = fetch("data/places-curated.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { CUR_DATA = d; return d; }, function () { curLoading = null; return null; });
    return curLoading;
  }
  function baht(t) { return String(t).replace(/฿\s?([\d,]+)(\s?[–-]\s?(?:฿\s?)?[\d,]+)?/g, function (m, a, b) { return a + (b ? b.replace(/฿\s?/, "") : "") + U.baht; }); }   // '฿' 기호는 헤더 시세 칸에만(TRANSLATION_RULES) → '200바트'
  function lvlHTML(l) { if (!l) return ""; var s = ""; for (var i = 1; i <= 4; i++) s += i <= l ? "●" : "<i>●</i>"; return '<span class="nbc-lvl" title="' + esc(U.price) + '">' + s + "</span>"; }
  function cardHTML(p, cid, checked) {
    var L = LANG, v = (p.voice || {})[L] || {}, t = function (o) { return o ? (o[L] || o.ko || "") : ""; };
    var hours = (L === "zh" && p.hours.text_zh) || p.hours.text;
    var price = (L === "zh" && p.price_zh) || p.price;
    var badges = '<span class="nbc-mk nbc-mk--ok" title="' + esc(U.lg[0]) + '">✓</span><span class="nbc-when">' + esc(U.checked) + " " + esc(checked.slice(5).replace("-", ".")) + "</span>" +
      (p.owner_ok ? '<span class="nbc-mk nbc-mk--star" title="' + esc(U.lg[1]) + '">★</span>' : "") +
      (p.badges || []).map(function (b) { return '<span class="nbc-badge' + (b.k === "gold" ? " nbc-badge--gold" : b.k === "warn" ? " nbc-badge--warn" : "") + '">' + esc(b[L] || b.ko) + "</span>"; }).join("");
    var facts = "<dt>" + esc(U.hours) + "</dt><dd>" + esc(hours) + "</dd>" +
      "<dt>" + esc(U.priceBy[cid] || U.price) + "</dt><dd>" + esc(price ? baht(price) : U.unknown) + "</dd>" +
      "<dt>" + esc(U.dish[cid] || U.dish.food) + "</dt><dd>" + esc((p.dishes[L] || p.dishes.ko).join(" · ")) + "</dd>" +
      (p.pay ? "<dt>" + esc(U.pay) + "</dt><dd>" + esc(t(p.pay)) + "</dd>" : "") +
      (p.tel ? "<dt>" + esc(U.tel) + '</dt><dd><a href="tel:' + esc(String(p.tel).replace(/[^\d+]/g, "")) + '">' + esc(p.tel) + "</a></dd>" : "");
    var voice = !v.n ? '<p class="nbc-empty">' + esc(U.none) + "</p>"
      : '<p class="nbc-one">' + esc(v.one) + "</p>" + ((v.g && v.g.length) || (v.w && v.w.length) ?
        '<details class="nbc-more"><summary>' + esc(U.more) + '</summary><ul class="nbc-pc">' + (v.g || []).map(function (x) { return '<li class="g">' + esc(x) + "</li>"; }).join("") +
        (v.w || []).map(function (x) { return '<li class="w">' + esc(x) + "</li>"; }).join("") + "</ul>" + (v.tip ? '<p class="nbc-tip">' + esc(baht(v.tip)) + "</p>" : "") + "</details>" : "");
    var srcs = (p.src || []).concat(v.src || []);
    var line = CUR_DATA && CUR_DATA.owner_line && /^https:\/\//.test(CUR_DATA.owner_line) ? CUR_DATA.owner_line : null;
    var owner = line ? '<a class="nbc-owner" href="' + esc(line) + '" target="_blank" rel="noopener">' + esc(U.owner) + "</a>"
      : '<p class="nbc-ownhint">' + esc(U.ownerHint) + "</p>" + (window.TNRepBtn ? TNRepBtn("place", "curated:" + p.id) : "");
    return '<article class="nbc-card" aria-labelledby="nbc-' + esc(p.id) + '">' +
      '<div class="nbc-tile"><div class="nbc-thai" lang="th">' + esc(p.thai) + "</div>" +
        '<h3 class="nbc-name" id="nbc-' + esc(p.id) + '">' + esc(t(p.name)) + "</h3>" + lvlHTML(p.lvl) +
        '<div class="nbc-where"><span>' + esc(t(p.area)) + "</span><span>" + esc(t(p.cat)) + "</span></div></div>" +
      '<div class="nbc-body"><div class="nbc-badges">' + badges + "</div>" +
        '<dl class="nbc-facts">' + facts + "</dl>" +
        '<p class="nbc-tip">' + esc(baht(t(p.tip))) + "</p>" +
        '<section class="nbc-voice"><h4>' + esc(U.voice) + (v.n ? "<small>" + esc(U.n + v.n) + "</small>" : "") + "</h4>" + voice + "</section>" +
        '<details class="nbc-src"><summary>' + esc(U.src) + " (" + srcs.length + ")</summary><ul>" + srcs.map(function (x) {
          return /^https?:\/\//.test(x[1]) ? '<li><a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a></li>" : ""; }).join("") + "</ul></details>" +
        '<div class="nbc-own">' + owner + "</div>" +
      "</div></article>";
  }
  function mountCurated(el, c) {
    if (!el) return;
    el.innerHTML = '<p class="nbc-load">' + esc(U.loading) + "</p>";
    loadCurated().then(function (d) {
      if (cur !== c.id || !root || !root.contains(el)) return;
      var list = d && d.cats && d.cats[c.id];
      if (!list || !list.length) { el.innerHTML = '<p class="nbc-load">' + esc(U.fail) + "</p>"; return; }
      var far = d.region && region() !== d.region && !havePos();
      el.innerHTML = '<div class="nbc-head"><h3 class="nbc-h">✅ ' + esc(NEARBY.regions[d.region] ? NEARBY.regions[d.region].name : "") + " · " + esc(U.title) + " <small>" + list.length + "</small></h3>" +
        '<p class="nbc-sub">' + esc(U.sub) + (far ? " " + esc(U.only) : "") + "</p>" +
        '<p class="nbc-legend"><b>' + esc(U.legend) + '</b><span><span class="nbc-mk nbc-mk--ok">✓</span>' + esc(U.lg[0]) + '</span><span><span class="nbc-mk nbc-mk--star">★</span>' + esc(U.lg[1]) + '</span><span><span class="nbc-mk nbc-mk--diff">!</span>' + esc(U.lg[2]) + "</span></p></div>" +
        '<div class="nbc-list">' + list.map(function (p) { return cardHTML(p, c.id, d.checked || ""); }).join("") + "</div>";
    });
  }

  /* ---------- 카테고리 화면 ---------- */
  function statusHTML() {
    var R = NEARBY.regions, rg = region();
    var line = havePos() ? TNI("nearby.k5267909", "<b>📍 내 위치 기준</b>으로 지도를 열어요.")
      : geo.state === "denied" ? TNI("nearby.k82be22b", "위치 권한이 꺼져 있어 <b>") + R[rg].name + TNI("nearby.k17a8ca6", "</b> 기준으로 열어요.")
      : geo.state === "error" || geo.state === "unsupported" ? TNI("nearby.kcad0155", "위치를 확인하지 못해 <b>") + R[rg].name + TNI("nearby.k17a8ca6", "</b> 기준으로 열어요.")
      : TNI("nearby.ka910df9", "누르면 위치 권한을 물어요. 허용하면 <b>내 위치</b>, 아니면 <b>") + R[rg].name + TNI("nearby.k69e9b1e", "</b> 기준.");
    var pick = havePos() ? "" : TNI("nearby.k4f9106e", "<span class=\"nb-rg\" role=\"group\" aria-label=\"위치를 못 쓸 때 기준 지역\">") + Object.keys(R).map(function (k) {
      return '<button type="button" data-nb-rg="' + k + '" aria-pressed="' + (k === rg) + '">' + R[k].name + "</button>"; }).join("") + "</span>";
    return '<p class="nb-st__t">' + line + "</p>" + pick;
  }
  function renderPage(c) {
    return '<div class="nb-page__panel" role="document">' +
      TNI("nearby.kaf57351", "<div class=\"nb-page__bar\"><button type=\"button\" class=\"nb-back\" data-nb-back aria-label=\"뒤로 — 뉴스로 돌아가기\">← 뒤로</button>") +
      '<h2 class="nb-page__t" id="nbTitle"><span aria-hidden="true">' + c.emoji + TNI("nearby.k2d70f8c", "</span> 내 주변 ") + esc(c.label) + "</h2></div>" +
      '<div class="nb-page__body">' +
      // 종류 바꾸기(뒤로 가지 않고 바로, 같은 크기 5칸) — 2026-10-03 ③d
      TNI("nearby.k1d42bae", "<nav class=\"nb-switch\" aria-label=\"가게 종류 바꾸기\">") + NEARBY.categories.map(function (k) {
        return '<button type="button" class="nb-sw" data-nb-sw="' + k.id + '"' + (k.id === c.id ? ' aria-current="page"' : "") + ' aria-label="' + esc(k.label) + '"><span class="nb-sw__e" aria-hidden="true">' + k.emoji + '</span><span class="nb-sw__t">' + esc(k.short || k.label) + "</span></button>"; }).join("") + "</nav>" +
      '<div class="ad-slot nb-ad" data-nb-ad></div>' +
      '<div class="nbc" data-nbc aria-live="polite"></div>' +
      TNI("nearby.k3b864ba", "<p class=\"nb-sec nb-sec--more\">구글 지도에서 더 찾기</p>") +
      '<a class="nb-go nb-go--sm" data-nb-q="' + esc(c.query) + '" href="' + esc(mapsUrl(c.query)) + TNI("nearby.k8fea946", "\" target=\"_blank\" rel=\"noopener\">📍 내 주변 평점 좋은 곳<br>구글 지도로 보기</a>") +
      '<div class="nb-st" data-nb-st aria-live="polite">' + statusHTML() + "</div>" +
      TNI("nearby.kf154112", "<p class=\"nb-sec\">빠른 찾기</p><div class=\"nb-subs\">") + c.subs.map(function (s) {
        return '<a class="nb-sub" data-nb-q="' + esc(s.query) + '" href="' + esc(mapsUrl(s.query)) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>"; }).join("") + "</div>" +
      // 이 화면의 기준(운영자·이용자 모두 '무엇으로 찾는지' 알 수 있게) — 2026-10-03 ③d
      TNI("nearby.k4190370", "<details class=\"nb-how\"><summary>🔎 이 화면은 이렇게 찾아요</summary><ul>") +
        TNI("nearby.k4626a54", "<li>큰 버튼은 구글 지도에서 영어 검색어 <code>") + esc(c.query) + TNI("nearby.k1bd4c91", "</code> 로 찾아요. 빠른 찾기는 버튼마다 검색어가 달라요") + (c.subs[0] ? TNI("nearby.ka2f3a73", "(예: ") + esc(c.subs[0].label) + " = <code>" + esc(c.subs[0].query) + "</code>)" : "") + ".</li>" +
        TNI("nearby.ka459306", "<li>위치: 허용하면 <b>지금 내 위치</b> 둘레, 아니면 위에서 고른 지역(파타야·시라차·방콕) 이름으로 찾아요.</li>") +
        TNI("nearby.k27eaea9", "<li>맨 위 <b>확인한 곳</b>은 출처 2곳 이상(공식 사이트·리뷰 사이트 등)에서 영업을 확인한 가게예요. 돈을 받고 넣거나 순서를 바꾸지 않아요.</li>") +
        TNI("nearby.ke3c4017", "<li>순서·평점·영업 여부는 <b>구글 지도</b>가 정해요. 이 사이트가 돈을 받고 순서를 바꾸지 않아요.</li>") +
        TNI("nearby.k079e695", "<li>맨 위 <b>광고</b> 칸만 이 사이트가 직접 소개하는 가게예요('광고' 표시).</li></ul></details>") +
      TNI("nearby.k5fac8bc", "<p class=\"nb-note nb-note--sm\">구글 지도가 새 창(앱에서는 앱 안 브라우저)으로 열려요. 위치는 지도 주소를 만드는 데만 쓰고 이 사이트에 저장하지 않아요. 순위·평점은 구글 지도 기준이며 이 사이트의 추천이 아니에요.</p>") +
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
    if (st) st.insertAdjacentHTML("afterbegin", TNI("nearby.k6b54022", "<p class=\"nb-st__t nb-st__t--hl\">✅ 준비됐어요. 버튼을 한 번 더 눌러 주세요.</p>"));
  }
  function onGo(e, a) {
    if (havePos() || geo.state === "denied" || geo.state === "unsupported") return;   // 그냥 링크대로(새 탭)
    e.preventDefault();
    var st = root.querySelector("[data-nb-st]"); if (st) st.innerHTML = TNI("nearby.ke657a78", "<p class=\"nb-st__t\">📍 위치 확인 중…</p>");
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
      if ((el = t.closest("[data-nb-sw]"))) { if (el.getAttribute("data-nb-sw") !== cur) open(el.getAttribute("data-nb-sw")); return; }
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
    mountCurated(root.querySelector("[data-nbc]"), c);
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
      if (push && !cur) { if (history.state && history.state.ui) history.replaceState({ nb: id }, "", h); else history.pushState({ nb: id }, "", h); pushed = true; }   // 서랍 기록 칸은 이어 씀(app.js Back)
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

  // 속도(2026-10-03 18:25, 검수 지시): 헤더 5칸은 첫 기사 카드 뒤에 채움(자리는 index.html 의 빈 칸 5개). 주소가 #nearby/… 면 바로
  if (window.TNAfterFirst && !/^#nearby\//.test(location.hash)) window.TNAfterFirst(renderRow); else renderRow();
  if (/^#nearby\//.test(location.hash)) fromHash();
  window.TNNearby = { open: open, close: back, config: NEARBY, mapsUrl: mapsUrl };
})();
