/* 📇 파타야 가게 카드 시험(2026-10-03) — 화면 안 페이지 #places (assets/pages.js 에 등록)
 * 데이터: data/places-pattaya.json (tools/places/build_places.py — OpenStreetMap 에서 실제로 받은 값만, 모르는 값 = null → '확인 안 됨')
 * 카드: 이름·종류·🟢 지금 영업 중(OSM 영업시간으로 방콕 시간 기준 계산)·영업시간(한국어)·가격(바트+원, 모르면 확인 안 됨)·주소·최종 확인일·출처·지도·전화·정보 틀림(카톡)
 * 성인 업종 없음(데이터 만들 때 뺌). 결제·상단 고정 없음(시안은 mockups/places-package.html, 승인함 #6). */
(function () {
  "use strict";
  if (!window.TNPages) return;
  var DATA = null, loading = false, err = false, cat = "all", openOnly = false;
  var CATS = [{ id: "all", e: "📇", t: "전체" }, { id: "food", e: "🍜", t: "맛집" }, { id: "cafe", e: "☕", t: "카페" }, { id: "pet", e: "🐶", t: "동물병원·펫샵" }, { id: "moto", e: "🏍️", t: "오토바이" }, { id: "beauty", e: "💅", t: "피부·뷰티" }];
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
  function yearsOld(p) { var d = p.osm_check || p.osm_edit; return d ? (Date.now() - Date.parse(d)) / (365.25 * 864e5) : 99; }

  function card(p) {
    var st = openState(p._oh);
    var stHTML = st === "open" ? '<span class="pc__open pc__open--on">🟢 지금 영업 중</span>' : st === "soon" ? '<span class="pc__open pc__open--soon">🟠 곧 닫아요</span>'
      : st === "closed" ? '<span class="pc__open pc__open--off">⚪ 지금 닫힘</span>' : '<span class="pc__open">영업 여부 확인 안 됨</span>';
    var c = CATS.filter(function (x) { return x.id === p.cat; })[0] || CATS[0];
    var kind = [p.kind].concat(p.cuisine || []).filter(Boolean).join(" · ");
    var old = yearsOld(p) >= 2 ? '<p class="pc__warn">⚠️ ' + (p.osm_check || p.osm_edit).slice(0, 4) + "년 정보예요. 지금과 다를 수 있으니 가기 전에 전화로 확인하세요.</p>" : "";
    var map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.name + " " + p.lat + "," + p.lng);
    var kakao = DATA.report_kakao_url;
    return '<article class="pc" data-pc="' + esc(p.id) + '">' +
      '<div class="pc__top"><span class="pc__cat">' + c.e + " " + esc(p.cat_ko) + "</span>" + stHTML + "</div>" +
      '<h3 class="pc__name">' + esc(p.name) + "</h3>" + (kind ? '<p class="pc__kind">' + esc(kind) + "</p>" : "") + old +
      '<dl class="pc__info">' +
        "<div><dt>🕒 영업시간</dt><dd>" + esc(hoursKo(p.hours, p._oh)) + "</dd></div>" +
        "<div><dt>💰 가격</dt><dd" + (p.price_thb == null ? ' class="pc__na"' : "") + ">" + esc(priceKo(p.price_thb)) + "</dd></div>" +
        "<div><dt>📍 주소</dt><dd" + (p.address ? "" : ' class="pc__na"') + ">" + esc(p.address || "확인 안 됨(지도 버튼으로 위치 보기)") + "</dd></div>" +
        "<div><dt>🏪 영업 상태</dt><dd>" + esc(p.status) + "</dd></div>" +
        "<div><dt>✅ 최종 확인</dt><dd>" + esc(p.checked) + " (지도 데이터 받아 옴)" +
          '<small>현장 확인: ' + esc(p.osm_check || "확인 안 됨") + " · 지도 정보 수정: " + esc(p.osm_edit) + "</small></dd></div>" +
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
      var all = DATA.places, n = function (id) { return all.filter(function (p) { return id === "all" || p.cat === id; }).length; };
      var list = all.filter(function (p) { return (cat === "all" || p.cat === cat) && (!openOnly || /open|soon/.test(openState(p._oh) || "")); });
      list.sort(function (a, b) { var r = function (p) { var s = openState(p._oh); return s === "open" ? 0 : s === "soon" ? 1 : s === "closed" ? 2 : 3; }; return r(a) - r(b); });
      var c = CATS.filter(function (x) { return x.id === cat; })[0];
      var head = '<p class="pc-intro"><b>지도 데이터(OpenStreetMap)에서 받아 온 실제 가게 ' + all.length + "곳</b>이에요. 모르는 칸은 <b>확인 안 됨</b>으로 두었어요. 영업시간·가격은 바뀔 수 있으니 가기 전에 꼭 전화·지도로 확인하세요.</p>" +
        '<div class="pc-filter" role="group" aria-label="가게 종류">' + CATS.map(function (x) {
          return '<button type="button" class="pc-f" data-pc-cat="' + x.id + '" aria-pressed="' + (x.id === cat) + '"><span aria-hidden="true">' + x.e + "</span> " + esc(x.t) + " <small>" + n(x.id) + "</small></button>"; }).join("") + "</div>" +
        '<button type="button" class="pc-openonly" data-pc-open aria-pressed="' + openOnly + '">' + (openOnly ? "✅" : "⬜") + " 🟢 지금 영업 중인 곳만 보기</button>";
      var body = list.length ? '<div class="pc-list">' + list.map(card).join("") + "</div>"
        : '<div class="empty pc-empty"><p class="pc-empty__e" aria-hidden="true">🔍</p><p><b>' + (openOnly ? "지금 영업 중인 " + esc(c.t === "전체" ? "" : c.t + " ") + "가게가 없어요" : "이 종류 가게가 아직 없어요") + "</b></p>" +
          "<p>" + (openOnly ? "영업시간이 확인된 곳만 계산해요. 위의 '지금 영업 중인 곳만 보기'를 끄면 모두 보여요." : "다른 종류를 골라 보세요.") + "</p></div>";
      return head + body +
        '<p class="pc-src">지도 데이터 © <a href="' + esc(DATA.license_url) + '" target="_blank" rel="noopener">OpenStreetMap contributors</a> · 받은 날 ' + esc(DATA.fetched) + " · '지금 영업 중'은 방콕 시간과 지도에 적힌 영업시간으로 계산해요. 이 목록은 광고가 아니고 돈을 받지 않아요(시험).</p>";
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
  // 📍 내 주변 화면의 '가게 카드' 버튼: 그 종류로 미리 고르기(페이지 열기 전에)
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-pl-cat]"); if (!el) return;
    var w = el.getAttribute("data-pl-cat"); cat = CATS.some(function (x) { return x.id === w; }) ? w : "all"; openOnly = false;
  }, true);
  window.TNPlaces = { parseOH: parseOH, openState: openState, hoursKo: hoursKo };
})();
