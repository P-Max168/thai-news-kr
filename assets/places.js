/* 📇 파타야 가게 카드 시험(2026-10-03) — 화면 안 페이지 #places (assets/pages.js 에 등록)
 * 데이터: data/places-pattaya.json (tools/places/build_places.py — OpenStreetMap 에서 실제로 받은 값만, 모르는 값 = null → '확인 안 됨')
 * 카드: 이름·종류·🟢 지금 영업 중(OSM 영업시간으로 방콕 시간 기준 계산)·영업시간(한국어)·가격(바트+원, 모르면 확인 안 됨)·주소·최종 확인일·출처·지도·전화·정보 틀림(카톡)
 * 성인 업종 없음(데이터 만들 때 뺌). 결제·상단 고정 없음(시안은 mockups/places-package.html, 승인함 #6). */
(function () {
  "use strict";
  if (!window.TNPages) return;
  var DATA = null, loading = false, err = false, cat = "all", openOnly = false;
  var CATS = [{ id: "all", e: "📇", t: "전체" }, { id: "korean", e: "🇰🇷", t: "한식·한인" }, { id: "food", e: "🍜", t: "맛집" }, { id: "cafe", e: "☕", t: "카페" }, { id: "mart", e: "🛒", t: "마트" },
    { id: "travel", e: "✈️", t: "여행·비자" }, { id: "beauty", e: "💈", t: "피부·미용" }, { id: "pet", e: "🐶", t: "동물병원·펫샵" }, { id: "moto", e: "🏍️", t: "오토바이" }];
  function inCat(p, id) { return id === "all" || (id === "korean" ? !!p.korean : p.cat === id); }
  var esc = TNPages.esc;
  var KO = { Mo: "월", Tu: "화", We: "수", Th: "목", Fr: "금", Sa: "토", Su: "일", PH: "공휴일" }, ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  var JS_DAY = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };

  /* ---- OSM 영업시간(자주 쓰는 모양만) → 요일별 시간대. 모르는 모양이면 null('확인 안 됨') ---- */
  function hm(s) { var p = s.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function parseOH(s) {
    if (!s) return null;
    s = String(s).trim();
    if (s === "24/7") return { always: true };
    var week = {}, any = false, ok = true;
    s.split(/\s*;\s*/).forEach(function (part) {
      if (!part || !ok) return;
      var m = /^((?:PH|[A-Z][a-z])(?:-[A-Z][a-z])?(?:\s*,\s*(?:PH|[A-Z][a-z])(?:-[A-Z][a-z])?)*)?\s*(off|closed|\d{1,2}:\d\d-\d{1,2}:\d\d\+?(?:\s*,\s*\d{1,2}:\d\d-\d{1,2}:\d\d\+?)*)$/.exec(part.trim());
      if (!m) { ok = false; return; }
      var days = [];
      (m[1] || "Mo-Su").split(/\s*,\s*/).forEach(function (d) {
        if (d === "PH") return;
        var r = d.split("-"), a = ORDER.indexOf(r[0]), b = ORDER.indexOf(r[1] || r[0]);
        if (a < 0 || b < 0) { ok = false; return; }
        for (var i = a; ; i = (i + 1) % 7) { days.push(ORDER[i]); if (i === b) break; }
      });
      if (!days.length && m[1]) return;   // 'PH ...' 만 있는 규칙(공휴일)은 요일 계산에서 뺌
      var iv = /off|closed/.test(m[2]) ? [] : m[2].split(/\s*,\s*/).map(function (t) {
        var x = t.replace("+", "").split("-"), a = hm(x[0]), b = hm(x[1]); if (b <= a) b += 1440; return [a, b];
      });
      days.forEach(function (d) { week[d] = iv; }); any = true;
    });
    return ok && any ? { week: week } : null;
  }
  function nowBkk() { var d = new Date(Date.now() + 7 * 3600e3); return { day: d.getUTCDay(), min: d.getUTCHours() * 60 + d.getUTCMinutes() }; }
  function openState(oh) {   // "open" | "soon"(60분 안에 닫음) | "closed" | null
    if (!oh) return null;
    if (oh.always) return "open";
    var n = nowBkk(), today = ORDER.filter(function (k) { return JS_DAY[k] === n.day; })[0], yest = ORDER.filter(function (k) { return JS_DAY[k] === (n.day + 6) % 7; })[0];
    var hit = null;
    (oh.week[today] || []).forEach(function (iv) { if (n.min >= iv[0] && n.min < iv[1]) hit = iv[1] - n.min; });
    (oh.week[yest] || []).forEach(function (iv) { if (iv[1] > 1440 && n.min < iv[1] - 1440) hit = iv[1] - 1440 - n.min; });
    if (hit == null && oh.week[today] === undefined) return null;   // 그 요일 영업시간을 모름(예: Google 제한된 보기 → 토요일만 확인) → '확인 안 됨'
    return hit == null ? "closed" : hit <= 60 ? "soon" : "open";
  }
  function t2(m) { m = m % 1440; return (m < 600 ? "0" : "") + Math.floor(m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60); }
  function hoursKo(raw, oh) {
    if (!oh) return raw ? "확인 안 됨" : "확인 안 됨";
    if (oh.always) return "24시간 · 매일";
    var groups = [], key = function (iv) { return iv.map(function (x) { return x[0] + "-" + x[1]; }).join(","); };
    ORDER.forEach(function (d) {
      var iv = oh.week[d], k = iv ? key(iv) : "none", g = groups[groups.length - 1];
      if (g && g.k === k) g.d.push(d); else groups.push({ k: k, d: [d], iv: iv });
    });
    var txt = function (iv) { return !iv ? "확인 안 됨" : !iv.length ? "쉬는 날" : iv.map(function (x) { return t2(x[0]) + "~" + (x[1] > 1440 ? "다음 날 " : "") + (x[1] === 1440 ? "24:00" : t2(x[1])); }).join(", "); };
    var known = ORDER.filter(function (d) { return oh.week[d] !== undefined; });
    if (known.length < 7) return known.map(function (d) { return KO[d] + "요일 " + txt(oh.week[d]); }).join(" / ") + " (다른 요일은 확인 안 됨)";
    if (groups.length === 1) return "매일 " + txt(groups[0].iv);
    var s = groups.map(function (g) { var dd = g.d.length > 2 ? KO[g.d[0]] + "~" + KO[g.d[g.d.length - 1]] : g.d.map(function (x) { return KO[x]; }).join("·"); return dd + " " + txt(g.iv); }).join(" / ");
    return s + (/PH/.test(raw) ? " (공휴일은 가게에 확인)" : "");
  }

  /* ---- 가격: 바트 + 원(헤더 환율 data/ticker.json) ---- */
  var FX = null;
  function loadFx() {
    if (FX !== null) return; FX = 0;
    fetch("data/ticker.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { var f = j && j.fx; if (f && f.THB_KRW > 0) { FX = f.THB_KRW; TNPages.refresh(); } }, function () {});
  }
  function priceKo(p) {
    if (p == null) return "확인 안 됨";
    return Number(p).toLocaleString("ko-KR") + "바트" + (FX ? " (약 " + (Math.round(p * FX / 100) * 100).toLocaleString("ko-KR") + "원)" : "");
  }

  function load() {
    if (DATA || loading) return; loading = true; err = false;
    fetch("data/places-pattaya.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { DATA = d; d.places.forEach(function (p) { p._oh = parseOH(p.hours); }); loading = false; TNPages.refresh(); },
            function () { loading = false; err = true; TNPages.refresh(); });
  }
  // 칸마다 출처: p.fsrc[칸] → p.srcs[키] = { by, url, at(확인한 날) }
  function fs(p, f) {
    var k = p.fsrc && p.fsrc[f], s = k && p.srcs && p.srcs[k];
    if (!s) return '<small class="pc__fs">확인한 출처에 없음</small>';
    return '<small class="pc__fs"><a href="' + esc(s.url) + '" target="_blank" rel="noopener nofollow">' + esc(s.by) + " ↗</a> · " + esc(s.at) + " 확인</small>";
  }

  function card(p) {
    var st = openState(p._oh);
    var stHTML = st === "open" ? '<span class="pc__open pc__open--on">🟢 지금 영업 중</span>' : st === "soon" ? '<span class="pc__open pc__open--soon">🟠 곧 닫아요</span>'
      : st === "closed" ? '<span class="pc__open pc__open--off">⚪ 지금 닫힘</span>' : '<span class="pc__open">영업 여부 확인 안 됨</span>';
    var c = CATS.filter(function (x) { return x.id === p.cat; })[0] || CATS[0];
    var kind = [p.kind].concat(p.cuisine || []).filter(Boolean).join(" · ");
    var old = p.old ? '<p class="pc__warn"><span class="pc__old">🕰️ 오래된 정보</span> ' + esc(String(p.info_date).slice(0, 4)) + "년에 마지막으로 확인된 정보예요. 지금과 다를 수 있으니 가기 전에 전화로 확인하세요.</p>" : "";
    var kr = p.korean ? '<p class="pc__kr">🇰🇷 한식·한인 업소 <small>(근거: ' + esc(p.kr || "확인 안 됨") + ")</small></p>" : "";
    var map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.name + " " + p.lat + "," + p.lng);
    var kakao = DATA.report_kakao_url;
    return '<article class="pc" data-pc="' + esc(p.id) + '">' +
      '<div class="pc__top"><span class="pc__cat">' + c.e + " " + esc(p.cat_ko) + "</span>" + stHTML + "</div>" +
      '<h3 class="pc__name">' + esc(p.name) + "</h3>" + (kind ? '<p class="pc__kind">' + esc(kind) + "</p>" : "") + kr + old +
      '<dl class="pc__info">' +
        "<div><dt>🕒 영업시간</dt><dd>" + esc(hoursKo(p.hours, p._oh)) + fs(p, "hours") + "</dd></div>" +
        "<div><dt>💰 가격</dt><dd" + (p.price_thb == null ? ' class="pc__na"' : "") + ">" + esc(priceKo(p.price_thb)) + fs(p, "price") + "</dd></div>" +
        "<div><dt>📍 주소</dt><dd" + (p.address ? "" : ' class="pc__na"') + ">" + esc(p.address || "확인 안 됨(지도 버튼으로 위치 보기)") + fs(p, "address") + "</dd></div>" +
        "<div><dt>📞 전화</dt><dd" + (p.phone ? "" : ' class="pc__na"') + ">" + esc(p.phone || "확인 안 됨") + fs(p, "phone") + "</dd></div>" +
        "<div><dt>🏪 영업 상태</dt><dd>" + esc(p.status) + fs(p, "status") + "</dd></div>" +
        "<div><dt>✅ 최종 확인</dt><dd>" + esc(p.checked) + (p.source === "Google 지도" ? " (Google 지도에서 직접 봄)" : " (지도 데이터 받아 옴)") +
          (p.source === "Google 지도" ? "" : '<small>현장 확인: ' + esc(p.osm_check || "확인 안 됨") + " · 지도 정보 수정: " + esc(p.osm_edit) + "</small>") + "</dd></div>" +
      "</dl>" +
      '<div class="pc__btns"><a class="pc__btn pc__btn--map" href="' + esc(map) + '" target="_blank" rel="noopener">📍 지도</a>' +
        (p.phone ? '<a class="pc__btn" href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '">📞 전화</a>' : '<span class="pc__btn pc__btn--off" aria-disabled="true">📞 번호 확인 안 됨</span>') + "</div>" +
      '<div class="pc__foot"><a href="' + esc(p.source_url) + '" target="_blank" rel="noopener">출처: ' + esc(p.source) + " ↗</a>" +
        (p.website ? ' · <a href="' + esc(p.website) + '" target="_blank" rel="noopener nofollow">가게 사이트 ↗</a>' : "") +
        (kakao ? '<a class="pc__report" href="' + esc(kakao) + '" target="_blank" rel="noopener">✋ 정보 틀림 알리기(카톡)</a>'
               : '<a class="pc__report" href="#" data-placeholder data-pc-report aria-disabled="true" title="카톡 링크 준비 중">✋ 정보 틀림 알리기(카톡)</a>') +
      "</div></article>";
  }

  TNPages.register("places", {
    title: "📇 파타야 가게 카드(시험)",
    render: function () {
      load(); loadFx();
      if (err) return '<div class="empty empty--err pc-empty" role="alert"><b>⚠️ 가게 목록을 불러오지 못했어요.</b><br>인터넷 연결을 확인하고 다시 시도해 주세요.<br><button type="button" class="btn btn--primary btn--sm empty__retry" data-pc-retry>다시 시도</button></div>';
      if (!DATA) return '<div class="skel pc-skel" aria-hidden="true"></div><div class="skel pc-skel" aria-hidden="true"></div><p class="sr-only" role="status">가게 목록을 불러오는 중이에요…</p>';
      var all = DATA.places, n = function (id) { return all.filter(function (p) { return inCat(p, id); }).length; };
      var list = all.filter(function (p) { return inCat(p, cat) && (!openOnly || /open|soon/.test(openState(p._oh) || "")); });
      // 줄 세우기: 오래된 정보(2023년 전)는 맨 뒤 → 그 안에서 영업 중 → 곧 닫음 → 닫힘 → 모름
      list.sort(function (a, b) { var r = function (p) { var s = openState(p._oh); return (p.old ? 10 : 0) + (s === "open" ? 0 : s === "soon" ? 1 : s === "closed" ? 2 : 3); }; return r(a) - r(b); });
      var c = CATS.filter(function (x) { return x.id === cat; })[0];
      var head = '<p class="pc-intro"><b>지도(OpenStreetMap·Google 지도)에서 실제로 확인한 가게 ' + all.length + "곳</b>이에요(한식·한인 업소 " + n("korean") + "곳). 칸마다 출처와 확인한 날을 적었고, 모르는 칸은 <b>확인 안 됨</b>으로 두었어요. <b>🕰️ 오래된 정보</b>(2023년 전)는 맨 뒤에 있어요. 영업시간·가격은 바뀔 수 있으니 가기 전에 꼭 전화·지도로 확인하세요.</p>" +
        '<div class="pc-filter" role="group" aria-label="가게 종류">' + CATS.map(function (x) {
          return '<button type="button" class="pc-f" data-pc-cat="' + x.id + '" aria-pressed="' + (x.id === cat) + '"><span aria-hidden="true">' + x.e + "</span> " + esc(x.t) + " <small>" + n(x.id) + "</small></button>"; }).join("") + "</div>" +
        '<button type="button" class="pc-openonly" data-pc-open aria-pressed="' + openOnly + '">' + (openOnly ? "✅" : "⬜") + " 🟢 지금 영업 중인 곳만 보기</button>";
      var body = list.length ? '<div class="pc-list">' + list.map(card).join("") + "</div>"
        : '<div class="empty pc-empty"><p class="pc-empty__e" aria-hidden="true">🔍</p><p><b>' + (openOnly ? "지금 영업 중인 " + esc(c.t === "전체" ? "" : c.t + " ") + "가게가 없어요" : "이 종류 가게가 아직 없어요") + "</b></p>" +
          "<p>" + (openOnly ? "영업시간이 확인된 곳만 계산해요. 위의 '지금 영업 중인 곳만 보기'를 끄면 모두 보여요." : "다른 종류를 골라 보세요.") + "</p></div>";
      return head + body +
        '<p class="pc-src">지도 데이터 © <a href="' + esc(DATA.license_url) + '" target="_blank" rel="noopener">OpenStreetMap contributors</a> · 한식·한인 업소는 Google 지도(로그인 없이 보이는 화면)에서 본 값 · 받은 날 ' + esc(DATA.fetched) + " · '지금 영업 중'은 방콕 시간과 지도에 적힌 영업시간으로 계산해요(그 요일 시간을 모르면 '확인 안 됨'). 이 목록은 광고가 아니고 돈을 받지 않아요(시험).</p>";
    },
    click: function (e, t) {
      var el;
      if ((el = t.closest("[data-pc-cat]"))) { cat = el.getAttribute("data-pc-cat"); TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-open]"))) { openOnly = !openOnly; TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-retry]"))) { err = false; load(); TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-report]"))) { e.preventDefault(); if (window.TNApp && TNApp.toast) TNApp.toast("카톡 문의 링크를 준비 중이에요", 2000); return true; }
      return false;
    }
  });
  /* ---- 🏠 임대 카드 시험(#rent, 2026-10-03) — data/rentals-pattaya.json(tools/rentals/build_rentals.py). 공개 매물 쪽 값만, 사진 없음, 게시·연락 없음.
   * 사이트 메뉴에 링크 안 함(승인함 #9 결정 전). 월세 = 바트 + 원(헤더 환율), 면적 = ㎡ + 평(1평 = 3.3058㎡), 칸마다 출처·확인일. */
  var RD = null, rLoading = false, rErr = false;
  function rLoad() {
    if (RD || rLoading) return; rLoading = true; rErr = false;
    fetch("data/rentals-pattaya.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { RD = d; rLoading = false; TNPages.refresh(); }, function () { rLoading = false; rErr = true; TNPages.refresh(); });
  }
  function rCard(x) {
    var s = x.src, f = '<small class="pc__fs"><a href="' + esc(s.url) + '" target="_blank" rel="noopener nofollow">' + esc(s.by) + " ↗</a> · " + esc(s.at) + " 확인</small>";
    var na = '<small class="pc__fs">확인한 출처에 없음</small>';
    var room = x.beds === 0 ? "스튜디오(원룸)" : x.beds + "침실";
    var krw = FX ? " (약 " + (Math.round(x.rent_thb * FX / 1000) * 1000).toLocaleString("ko-KR") + "원)" : "";
    var map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(x.name + " Pattaya");
    return '<article class="pc rc" data-rc="' + esc(x.id) + '"><div class="pc__top"><span class="pc__cat">🏠 콘도 임대</span><span class="pc__open">' + esc(room) + "</span></div>" +
      '<h3 class="pc__name">' + esc(x.name) + "</h3>" + (x.old ? '<p class="pc__warn"><span class="pc__old">🕰️ 오래된 정보</span> 2023년 전에 올라온 매물이에요.</p>' : "") +
      '<dl class="pc__info">' +
        "<div><dt>💰 월세</dt><dd><b>" + x.rent_thb.toLocaleString("ko-KR") + "바트</b>" + esc(krw) + f + "</dd></div>" +
        "<div><dt>📐 면적</dt><dd>" + esc(String(x.sqm)) + "㎡ (약 " + esc(String(x.pyeong)) + "평)" + f + "</dd></div>" +
        "<div><dt>📍 지역</dt><dd>" + esc(x.area) + f + "</dd></div>" +
        "<div><dt>🧾 보증금·관리비·계약 기간</dt><dd class=\"pc__na\">확인 안 됨" + na + "</dd></div>" +
        "<div><dt>✅ 올린 날 · 고친 날</dt><dd>" + esc(x.listed || "확인 안 됨") + " · " + esc(x.updated_rel ? x.checked + " 기준 " + x.updated_rel : "확인 안 됨") + f + "</dd></div>" +
      "</dl>" +
      '<div class="pc__btns"><a class="pc__btn pc__btn--map" href="' + esc(map) + '" target="_blank" rel="noopener">📍 지도</a><a class="pc__btn" href="' + esc(s.url) + '" target="_blank" rel="noopener nofollow">🔗 원래 매물 보기</a></div></article>';
  }
  TNPages.register("rent", {
    title: "🏠 파타야 임대 카드(시험)",
    render: function () {
      rLoad(); loadFx();
      if (rErr) return '<div class="empty empty--err pc-empty" role="alert"><b>⚠️ 임대 목록을 불러오지 못했어요.</b><br><button type="button" class="btn btn--primary btn--sm empty__retry" data-rc-retry>다시 시도</button></div>';
      if (!RD) return '<div class="skel pc-skel" aria-hidden="true"></div><p class="sr-only" role="status">불러오는 중이에요…</p>';
      var list = RD.items.slice().sort(function (a, b) { return (a.old ? 1 : 0) - (b.old ? 1 : 0) || a.rent_thb - b.rent_thb; });
      return '<p class="pc-intro"><b>공개된 실제 매물 ' + list.length + "개</b>를 그대로 옮긴 <b>시험</b>이에요(사진 없음). 이 사이트는 중개하지 않고, 문의는 원래 매물 쪽에서 하세요. 칸마다 출처와 확인한 날을 적었고, 모르는 칸은 <b>확인 안 됨</b>이에요. 월세 싼 순.</p>" +
        '<div class="pc-list">' + list.map(rCard).join("") + "</div>" +
        '<p class="pc-src">출처: <a href="' + esc(RD.source_list) + '" target="_blank" rel="noopener nofollow">FazWaz 파타야 콘도 임대 목록</a> · 받은 날 ' + esc(RD.fetched) + " · 원화는 헤더 환율로 계산 · 1평 = 3.3058㎡ · 매물은 이미 나갔을 수 있어요.</p>";
    },
    click: function (e, t) {
      if (t.closest("[data-rc-retry]")) { rErr = false; rLoad(); TNPages.refresh(); return true; }
      return false;
    }
  });
  // 📍 내 주변 화면의 '가게 카드' 버튼: 그 종류로 미리 고르기(페이지 열기 전에)
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-pl-cat]"); if (!el) return;
    var w = el.getAttribute("data-pl-cat"); cat = CATS.some(function (x) { return x.id === w; }) ? w : "all"; openOnly = false;
  }, true);
  window.TNPlaces = { parseOH: parseOH, openState: openState, hoursKo: hoursKo };
})();
