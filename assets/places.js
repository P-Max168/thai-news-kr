/* 📇 파타야 가게 카드 시험(2026-10-03) — 화면 안 페이지 #places (assets/pages.js 에 등록)
 * 데이터: data/places-pattaya.json (tools/places/build_places.py — OpenStreetMap 에서 실제로 받은 값만, 모르는 값 = null → '확인 안 됨')
 * 카드: 이름·종류·🟢 지금 영업 중(최근 2년 안 현장 확인된 곳·운영자 확인한 곳만)·영업시간(지도 기준, 한국어)·가격(바트+원, 모르면 확인 안 됨)·주소·지도에서 받은 날·출처·지도·전화·⚠️ 오류 신고(assets/report.js, 카톡 링크가 정해지면 카톡도)
 * ★ 믿음 규칙(2026-10-05 Max 06:33 — 사장님 '폐업한 곳이 너무 많다, 확인했다고 적어 놓고'):
 *   · '확인함' = verified_by 와 verified_at 이 둘 다 있을 때만. 지도에서 받은 날은 '지도에서 받은 날'(확인한 날 아님)
 *   · 오래된 정보 = 기준 날(현장 확인 날 osm_check, 없으면 지도 정보 고친 날 osm_edit)이 오늘(방콕) − 730일보다 앞 → 🕰️ 배지 + 맨 아래 접힌 칸. 매일 다시 계산
 *   · 구글 지도 가게(gmaps_only) = 이름만 본 곳 → '영업 확인 안 됨', 확인된 곳 뒤로
 *   · 폐업 신고(⚠️ 오류 신고의 '🚫 폐업·없어짐') 2건 이상 = '폐업 신고됨' + 아래로. 운영자가 승인함에서 폐업 확인 = '폐업 보관함'(기본 숨김, 지우지 않음)
 *     숫자는 운영자 쪽에서만 셈(신고 원문은 운영자만 읽음) → data/places-flags.json(저장소에 올린 기록) + Firestore placeflags(공개 읽기, 운영자만 쓰기 — 규칙 게시 뒤, 파일의 fs_live 가 true 일 때만 읽음)
 * 성인 업종 없음(데이터 만들 때 뺌). 결제·상단 고정 없음(시안은 mockups/places-package.html, 승인함 #6). */
(function () {
  "use strict";
  if (!window.TNPages) return;
  var DATA = null, loading = false, err = false, cat = "all", openOnly = false, sub = "", fold = { old: false, arch: false };   // sub: 파타야 동네(빈칸 = 전체)
  // 지역(2026-10-03 18시): 파타야(OSM+구글 이름·동네) · 시라차·방콕(OSM 한식·한인만). 지역마다 data/places-<id>.json, 고른 지역은 이 기기에 기억
  var REGS = [{ id: "pattaya", t: "파타야" }, { id: "sriracha", t: "시라차" }, { id: "bangkok", t: "방콕" }], CACHE = {};
  var region = (function () { try { var r = localStorage.getItem("tnk.pcRegion"); return REGS.some(function (x) { return x.id === r; }) ? r : "pattaya"; } catch (e) { return "pattaya"; } })();
  var CATS = [{ id: "all", e: "📇", t: "전체" }, { id: "korean", e: "🇰🇷", t: "한식·한인" }, { id: "food", e: "🍜", t: "맛집" }, { id: "cafe", e: "☕", t: "카페" }, { id: "mart", e: "🛒", t: "마트" },
    { id: "travel", e: "✈️", t: "여행·비자" }, { id: "beauty", e: "💈", t: "피부·미용" }, { id: "pet", e: "🐶", t: "동물병원·펫샵" }, { id: "moto", e: "🏍️", t: "오토바이" }];
  function inCat(p, id) { return id === "all" || (id === "korean" ? !!p.korean : p.cat === id); }
  var esc = TNPages.esc;
  var KO = { Mo: "월", Tu: "화", We: "수", Th: "목", Fr: "금", Sa: "토", Su: "일", PH: "공휴일" }, ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  var JS_DAY = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
  /* ---- 믿음 규칙(위 머리말) ---- */
  var OLD_DAYS = 730, CLOSED_MIN = 2;
  function bkDate(ms) { return new Date(ms + 7 * 3600e3).toISOString().slice(0, 10); }
  function oldBefore() { return bkDate(Date.now() - OLD_DAYS * 864e5); }
  function verified(p) { return !!(p && p.verified_by && p.verified_at); }
  function basis(p) {   // 오래된 정보 기준 날: 운영자 확인 날 · 현장 확인 날 · 지도 정보 고친 날 중 가장 늦은 것(구글 지도 가게 = 모름 → null)
    var d = [verified(p) ? String(p.verified_at).slice(0, 10) : "", p.osm_check || (p.gmaps_only ? "" : p.osm_edit) || ""].sort().pop();
    return d || null;
  }
  function isOld(p) { var b = basis(p); return !!b && b < oldBefore(); }
  function openOK(p) { return verified(p) || (!!p.osm_check && p.osm_check >= oldBefore()); }   // '🟢 지금 영업 중' 보여도 되는 곳
  var FLAGS = null;   // { 가게 id: { n: 폐업 신고 수, st: "closed"(운영자 폐업 확인) | "", at } }
  function flag(p) { return (FLAGS && FLAGS[p.id]) || {}; }
  function archived(p) { return flag(p).st === "closed"; }
  function reported(p) { return (+flag(p).n || 0) >= CLOSED_MIN; }
  function mergeFlags(m) {
    if (!m) return;
    Object.keys(m).forEach(function (k) { var a = FLAGS[k] || {}, b = m[k] || {}; FLAGS[k] = { n: Math.max(+a.n || 0, +b.n || 0), st: a.st === "closed" || b.st === "closed" ? "closed" : "", at: b.at || a.at || "" }; });
  }
  function loadFlags() {
    if (FLAGS) return; FLAGS = {};
    fetch("data/places-flags.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return; mergeFlags(j.flags); TNPages.refresh();
      // Firestore placeflags/{id} = {n, st, at} — 공개 읽기·운영자만 쓰기(firestore.rules). 규칙 게시 전엔 403 이라 fs_live=false 면 안 읽음
      if (j.fs_live === true) fetch("https://firestore.googleapis.com/v1/projects/thai-news-kr/databases/(default)/documents/placeflags?pageSize=300&key=AIzaSyDYzK-rOfLVJxZnxTZCeNiY2QEC-UZl20w")
        .then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
          var m = {}; ((x && x.documents) || []).forEach(function (d) { var f = d.fields || {}, id = f.id && f.id.stringValue; if (id) m[id] = { n: +((f.n && f.n.integerValue) || 0), st: (f.st && f.st.stringValue) || "", at: (f.at && f.at.timestampValue || "").slice(0, 10) }; });
          mergeFlags(m); TNPages.refresh();
        }, function () {});
    }, function () {});
  }

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
  // 가격 먼저(2026-10-04 Max 디자인 지시 4번): 카드 맨 위 굵은 바트 + 원화(헤더와 같은 환율 data/ticker.json fx.THB_KRW, 원 단위 반올림). 모르면 '가격 확인 안 됨' — 지어내지 않음
  function krw(thb) { return FX ? Math.round(thb * FX).toLocaleString("ko-KR") + "원" : ""; }
  function priceTop(thb, label, srcHTML) {
    if (thb == null || !(Number(thb) >= 0)) return '<p class="pc__price pc__price--na">💰 가격 확인 안 됨' + (srcHTML || "") + "</p>";
    var k = krw(Number(thb));
    return '<p class="pc__price">' + (label ? '<span class="pc__price-l">' + esc(label) + "</span> " : "") + "<b>" + Number(thb).toLocaleString("ko-KR") + "바트</b>" +
      (k ? ' <span class="pc__krw">약 ' + k + "</span>" : "") + (srcHTML || "") + "</p>";
  }

  function load() {
    if (CACHE[region]) { DATA = CACHE[region]; return; }
    if (loading) return; loading = true; err = false; DATA = null;
    var want = region;
    fetch("data/places-" + want + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { d.places.forEach(function (p) { p._oh = parseOH(p.hours); }); CACHE[want] = d; if (want === region) DATA = d; loading = false; TNPages.refresh(); },
            function () { loading = false; err = true; TNPages.refresh(); });
  }
  // 칸마다 출처: p.fsrc[칸] → p.srcs[키] = { by, url, at(확인한 날) }
  function fs(p, f) {
    var k = p.fsrc && p.fsrc[f], s = k && p.srcs && p.srcs[k];
    if (!s) return '<small class="pc__fs">받은 출처에 없음</small>';
    return '<small class="pc__fs"><a href="' + esc(s.url) + '" target="_blank" rel="noopener nofollow">' + esc(s.by) + " ↗</a> · " + esc(s.at) + " 받음</small>";
  }

  // ⚠️ 오류 신고(assets/report.js — 카드 안에서 펼침). 카톡 링크(report_kakao_url, 승인함 #7)가 생기면 그 링크도 함께 보임
  function rep(kind, id) { return window.TNRepBtn ? '<div class="rep-row rep-row--pc">' + TNRepBtn(kind, id) + "</div>" : ""; }
  function card(p) {
    var ok = openOK(p), st = ok ? openState(p._oh) : null, old = isOld(p), arch = archived(p), repd = reported(p), ver = verified(p);
    var stHTML = !ok ? '<span class="pc__open">' + (p.gmaps_only ? "영업 확인 안 됨" : "영업시간(지도 기준)") + "</span>" : st === "open" ? '<span class="pc__open pc__open--on">🟢 지금 영업 중</span>' : st === "soon" ? '<span class="pc__open pc__open--soon">🟠 곧 닫아요</span>'
      : st === "closed" ? '<span class="pc__open pc__open--off">⚪ 지금 닫힘</span>' : '<span class="pc__open">영업 여부 확인 안 됨</span>';
    var c = CATS.filter(function (x) { return x.id === p.cat; })[0] || CATS[0];
    var kind = [p.kind].concat(p.cuisine || []).filter(Boolean).join(" · ");
    var b = basis(p), warn = "";
    if (arch) warn += '<p class="pc__warn pc__warn--x"><span class="pc__closed">🗄️ 폐업 보관함</span> 운영자가 폐업으로 확인했어요' + (flag(p).at ? "(" + esc(flag(p).at) + ")" : "") + ". 기록으로만 남겨 둬요.</p>";
    else if (repd) warn += '<p class="pc__warn pc__warn--x"><span class="pc__closed">🚫 폐업 신고됨</span> 독자 폐업 신고 ' + (+flag(p).n) + "건 — 운영자가 아직 확인 안 했어요. 가기 전에 꼭 전화로 확인하세요.</p>";
    if (old) warn += '<p class="pc__warn"><span class="pc__old">🕰️ 오래된 정보</span> 지도 정보가 ' + esc(b) + (p.osm_check ? "에 현장 확인된 뒤" : "에 고쳐진 뒤") + " 2년 넘게 바뀐 기록이 없어요. 문을 닫았을 수 있으니 가기 전에 전화로 확인하세요.</p>";
    else if (p.gmaps_only && !ver) warn += '<p class="pc__warn pc__warn--unv"><span class="pc__unv">❔ 영업 확인 안 됨</span> 구글 지도에서 이름만 본 곳이에요. 지금 영업하는지는 확인 안 됐어요.</p>';
    var vline = ver ? "<div><dt>✅ 확인함</dt><dd>" + esc(String(p.verified_at).slice(0, 10)) + "<small>" + esc(p.verified_by) + "</small></dd></div>" : "";
    var kr = p.korean ? '<p class="pc__kr">🇰🇷 한식·한인 업소 <small>(근거: ' + esc(p.kr || "확인 안 됨") + ")</small></p>" : "";
    // Google 지도에서 온 가게(gmaps_only): 약관 때문에 이름·동네만 — 위치·전화·시간은 구글 지도 링크로(2026-10-03 17:25)
    var go = !!p.gmaps_only;
    var map = go ? p.source_url : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.name + " " + p.lat + "," + p.lng);
    var kakao = DATA.report_kakao_url;
    return '<article class="pc' + (old ? " pc--old" : "") + (repd || arch ? " pc--closed" : "") + '" data-pc="' + esc(p.id) + '"' + (old ? ' data-pc-old="' + esc(b) + '"' : "") + (ver ? " data-pc-ver" : "") + ">" +
      '<div class="pc__top"><span class="pc__cat">' + c.e + " " + esc(p.cat_ko) + "</span>" + stHTML + "</div>" +
      priceTop(p.price_thb, p.price_label || "", fs(p, "price")) +
      '<h3 class="pc__name">' + esc(p.name) + "</h3>" + (kind ? '<p class="pc__kind">' + esc(kind) + "</p>" : "") + kr + warn +
      '<dl class="pc__info">' +
        "<div><dt>🕒 영업시간 <small>(지도 기준)</small></dt><dd>" + esc(hoursKo(p.hours, p._oh)) + fs(p, "hours") + "</dd></div>" +
        "<div><dt>🧾 가격 VAT 별도</dt><dd" + (p.vat_extra == null ? ' class="pc__na"' : "") + ">" + (p.vat_extra === true ? "별도(가격에 VAT 안 들어 있음)" : p.vat_extra === false ? "포함" : "확인 안 됨") + fs(p, "vat") + "</dd></div>" +
        (go ? "<div><dt>📍 동네</dt><dd>" + esc(p.area) + "<small>정확한 위치·주소는 아래 '구글 지도에서 보기'</small>" + fs(p, "area") + "</dd></div>"
            : "<div><dt>📍 주소</dt><dd" + (p.address ? "" : ' class="pc__na"') + ">" + esc(p.address || "확인 안 됨(지도 버튼으로 위치 보기)") + fs(p, "address") + "</dd></div>") +
        "<div><dt>📞 전화</dt><dd" + (p.phone ? "" : ' class="pc__na"') + ">" + esc(p.phone || "확인 안 됨") + fs(p, "phone") + "</dd></div>" +
        "<div><dt>🏪 영업 상태</dt><dd>" + esc(p.status) + fs(p, "status") + "</dd></div>" +
        vline +
        "<div><dt>🗂️ 지도에서 받은 날</dt><dd>" + esc(p.checked) + (go ? "<small>가게 이름·동네만 받았어요 — 전화·영업시간은 구글 지도에서 보세요</small>" :
          '<small>현장 확인 날(지도 기록): ' + esc(p.osm_check || "없음") + " · 지도 정보 고친 날: " + esc(p.osm_edit) + "</small>") + "</dd></div>" +
      "</dl>" +
      '<div class="pc__btns"><a class="pc__btn pc__btn--map" href="' + esc(map) + '" target="_blank" rel="noopener">' + (go ? "🗺️ 구글 지도에서 보기" : "📍 지도") + "</a>" +
        (p.phone ? '<a class="pc__btn" href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '">📞 전화</a>' : '<span class="pc__btn pc__btn--off" aria-disabled="true">📞 번호 확인 안 됨</span>') + "</div>" +
      '<div class="pc__foot"><a href="' + esc(p.source_url) + '" target="_blank" rel="noopener">출처: ' + esc(p.source) + " ↗</a>" +
        (p.website ? ' · <a href="' + esc(p.website) + '" target="_blank" rel="noopener nofollow">가게 사이트 ↗</a>' : "") +
        (kakao ? '<a class="pc__report" href="' + esc(kakao) + '" target="_blank" rel="noopener">✋ 정보 틀림 알리기(카톡)</a>' : "") +
      "</div>" + rep("place", "place:" + p.id) + "</article>";
  }

  TNPages.register("places", {
    title: "📇 가게 카드(시험)",
    render: function () {
      load(); loadFx(); loadFlags();
      if (err) return '<div class="empty empty--err pc-empty" role="alert"><b>⚠️ 가게 목록을 불러오지 못했어요.</b><br>인터넷 연결을 확인하고 다시 시도해 주세요.<br><button type="button" class="btn btn--primary btn--sm empty__retry" data-pc-retry>다시 시도</button></div>';
      if (!DATA) return '<div class="skel pc-skel" aria-hidden="true"></div><div class="skel pc-skel" aria-hidden="true"></div><p class="sr-only" role="status">가게 목록을 불러오는 중이에요…</p>';
      var subs = region === "pattaya" && DATA.subs ? DATA.subs : null;
      if (!subs) sub = "";
      var all1 = sub ? DATA.places.filter(function (p) { return p.sub === sub; }) : DATA.places;
      var all0 = DATA.places.filter(function (p) { return !archived(p); }), all = all1.filter(function (p) { return !archived(p); }), n = function (id) { return all.filter(function (p) { return inCat(p, id); }).length; };
      var arch = all1.filter(function (p) { return archived(p) && inCat(p, cat); });   // 폐업 보관함(운영자 확인) — 기본 숨김, 지우지 않음
      var list = all.filter(function (p) { return inCat(p, cat) && (!openOnly || (openOK(p) && /open|soon/.test(openState(p._oh) || ""))); });
      // 줄 세우기(2026-10-05): 운영자 확인 → 최근 지도 정보(OSM) → 영업 확인 안 됨(구글 지도 이름만) → 폐업 신고됨 / 그 안에서 영업 중 → 곧 닫음 → 닫힘 → 모름
      //   오래된 정보(기준 날이 2년 넘음)는 맨 아래 접힌 칸으로 따로
      var rank = function (p) { var s = openOK(p) ? openState(p._oh) : null; return (reported(p) ? 30 : 0) + (verified(p) ? 0 : p.gmaps_only ? 20 : 10) + (s === "open" ? 0 : s === "soon" ? 1 : s === "closed" ? 2 : 3); };
      list.sort(function (a, b) { return rank(a) - rank(b); });
      var olds = list.filter(isOld); list = list.filter(function (p) { return !isOld(p); });
      var c = CATS.filter(function (x) { return x.id === cat; })[0];
      var rg = REGS.filter(function (x) { return x.id === region; })[0];
      var head = '<div class="pc-filter pc-region" role="group" aria-label="지역">' + REGS.map(function (x) {
          return '<button type="button" class="pc-f" data-pc-region="' + x.id + '" aria-pressed="' + (x.id === region) + '">📍 ' + esc(x.t) + (CACHE[x.id] ? " <small>" + CACHE[x.id].places.length + "</small>" : "") + "</button>"; }).join("") + "</div>" +
        (subs ? '<div class="pc-filter pc-subs" role="group" aria-label="파타야 동네">' + subs.map(function (x) {
          var parts = x.t.split("·"), k = all0.filter(function (p) { return p.sub === x.id; }).length;
          return '<button type="button" class="pc-f" data-pc-sub="' + x.id + '" aria-pressed="' + (x.id === sub) + '" title="' + esc(x.t) + '">' + esc(parts[0]) + (parts[1] ? "<small class=\"pc-subs__2\">" + esc(parts[1]) + "</small>" : "") + " <small>" + k + "</small></button>"; }).join("") + "</div>" +
          '<p class="pc-subnote">' + (sub ? "🔎 <b>" + esc(subs.filter(function (x) { return x.id === sub; })[0].t) + "</b>만 보는 중 — 같은 버튼을 한 번 더 누르면 전체. " : "") + "동네는 대략 나눔이에요(경계 근처는 틀릴 수 있고, 동네를 모르는 " + all0.filter(function (p) { return !p.sub; }).length + "곳은 전체에서만 보여요).</p>" : "") +
        '<p class="pc-intro"><b>' + esc(rg.t) + (sub ? " " + esc(subs.filter(function (x) { return x.id === sub; })[0].t) : "") + " — 지도에 등록된 가게 " + all.length + "곳, 영업 여부는 확인 안 됨(가기 전에 전화로 확인)</b>" +
          '<small class="pc-intro__s">지도(' + (region === "pattaya" ? "OpenStreetMap·Google 지도" : "OpenStreetMap") + ")에서 받은 목록이에요(한식·한인 업소 " + n("korean") + "곳). 칸마다 출처와 지도에서 받은 날을 적었고, 모르는 칸은 <b>확인 안 됨</b>이에요. 지도 정보가 2년 넘게 그대로인 " +
          all.filter(isOld).length + "곳은 <b>🕰️ 오래된 정보</b>로 맨 아래에 접어 두었어요.</small></p>" +
        '<div class="pc-filter" role="group" aria-label="가게 종류">' + CATS.map(function (x) {
          return '<button type="button" class="pc-f" data-pc-cat="' + x.id + '" aria-pressed="' + (x.id === cat) + '"><span aria-hidden="true">' + x.e + "</span> " + esc(x.t) + " <small>" + n(x.id) + "</small></button>"; }).join("") + "</div>" +
        '<button type="button" class="pc-openonly" data-pc-open aria-pressed="' + openOnly + '">' + (openOnly ? "✅" : "⬜") + " 🟢 지금 영업 중인 곳만 보기</button>";
      // 접힌 칸 2개(기본 닫힘): 🕰️ 오래된 정보(맨 아래) · 🗄️ 폐업 보관함(운영자 폐업 확인, 있을 때만). 다시 그려도 연 상태는 기억(fold)
      var oldSec = olds.length ? '<details class="pc-fold pc-fold--old" data-pc-fold="old"' + (fold.old ? " open" : "") + '><summary>🕰️ 오래된 정보 ' + olds.length + "곳 <small>지도 정보가 2년 넘게 그대로예요 — 문 닫았을 수 있어요</small></summary>" +
          '<div class="pc-list">' + olds.map(card).join("") + "</div></details>" : "";
      var archSec = arch.length ? '<details class="pc-fold pc-fold--arch" data-pc-fold="arch"' + (fold.arch ? " open" : "") + '><summary>🗄️ 폐업 보관함 ' + arch.length + "곳 <small>운영자가 폐업으로 확인한 곳 — 기록으로만 남겨 둬요</small></summary>" +
          '<div class="pc-list">' + arch.map(card).join("") + "</div></details>" : "";
      var body = list.length || olds.length ? (list.length ? '<div class="pc-list">' + list.map(card).join("") + "</div>" : "") + oldSec + archSec
        : '<div class="empty pc-empty"><p class="pc-empty__e" aria-hidden="true">🔍</p><p><b>' + (openOnly ? "지금 영업 중인 " + esc(c.t === "전체" ? "" : c.t + " ") + "가게가 없어요" : "이 종류 가게가 아직 없어요") + "</b></p>" +
          "<p>" + (openOnly ? "최근 2년 안에 현장 확인된 곳만 계산해요. 위의 '지금 영업 중인 곳만 보기'를 끄면 모두 보여요." : "다른 종류를 골라 보세요.") + "</p></div>";
      return head + body + (!(list.length || olds.length) ? archSec : "") +
        '<p class="pc-src">지도 데이터 © <a href="' + esc(DATA.license_url) + '" target="_blank" rel="noopener">OpenStreetMap contributors</a> ' + (region === "pattaya" ? " · 한식·한인 업소 일부는 가게 이름·동네만 적고 나머지는 구글 지도 링크로(Google 지도 이용 약관)" : " · " + esc(rg.t) + "는 OSM 에 한식(음식 종류)이나 한글 상호로 올라온 곳만") + ' · 받은 날 ' + esc(DATA.fetched) + " · '🟢 지금 영업 중'은 지도에 최근 2년 안 현장 확인 날이 있는 곳만 방콕 시간과 지도 영업시간으로 계산해요(나머지는 '영업시간(지도 기준)'만). 이 목록은 광고가 아니고 돈을 받지 않아요(시험).</p>";
    },
    click: function (e, t) {
      var el;
      if ((el = t.closest("[data-pc-region]"))) { region = el.getAttribute("data-pc-region"); try { localStorage.setItem("tnk.pcRegion", region); } catch (x) {} DATA = CACHE[region] || null; load(); TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-sub]"))) { var s2 = el.getAttribute("data-pc-sub"); sub = sub === s2 ? "" : s2; TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-cat]"))) { cat = el.getAttribute("data-pc-cat"); TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-open]"))) { openOnly = !openOnly; TNPages.refresh(); return true; }
      if ((el = t.closest("[data-pc-fold] > summary"))) { var d = el.parentNode; fold[d.getAttribute("data-pc-fold")] = !d.open; return false; }   // 기본 동작(펼치기)은 그대로
      if ((el = t.closest("[data-pc-retry]"))) { err = false; load(); TNPages.refresh(); return true; }
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
    var map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(x.name + " Pattaya");
    return '<article class="pc rc" data-rc="' + esc(x.id) + '"><div class="pc__top"><span class="pc__cat">🏠 콘도 임대</span><span class="pc__open">' + esc(room) + "</span></div>" +
      priceTop(x.rent_thb, "월세", f) +
      '<h3 class="pc__name">' + esc(x.name) + "</h3>" + (x.old ? '<p class="pc__warn"><span class="pc__old">🕰️ 오래된 정보</span> 2023년 전에 올라온 매물이에요.</p>' : "") +
      '<dl class="pc__info">' +
        "<div><dt>📐 면적</dt><dd>" + esc(String(x.sqm)) + "㎡ (약 " + esc(String(x.pyeong)) + "평)" + f + "</dd></div>" +
        "<div><dt>📍 지역</dt><dd>" + esc(x.area) + f + "</dd></div>" +
        "<div><dt>🧾 보증금·관리비·계약 기간</dt><dd class=\"pc__na\">확인 안 됨" + na + "</dd></div>" +
        "<div><dt>✅ 올린 날 · 고친 날</dt><dd>" + esc(x.listed || "확인 안 됨") + " · " + esc(x.updated || "확인 안 됨") + f + "</dd></div>" +
      "</dl>" +
      '<div class="pc__btns"><a class="pc__btn pc__btn--map" href="' + esc(map) + '" target="_blank" rel="noopener">📍 지도</a><a class="pc__btn" href="' + esc(s.url) + '" target="_blank" rel="noopener nofollow">🔗 원래 매물 보기</a></div>' + rep("rent", "rent:" + x.id) + "</article>";
  }
  TNPages.register("rent", {
    title: "🏠 파타야 임대 카드(시험)",
    render: function () {
      rLoad(); loadFx();
      if (rErr) return '<div class="empty empty--err pc-empty" role="alert"><b>⚠️ 임대 목록을 불러오지 못했어요.</b><br><button type="button" class="btn btn--primary btn--sm empty__retry" data-rc-retry>다시 시도</button></div>';
      if (!RD) return '<div class="skel pc-skel" aria-hidden="true"></div><p class="sr-only" role="status">불러오는 중이에요…</p>';
      if (RD.withdrawn) return '<div class="empty pc-empty" role="status"><b>🏠 임대 카드 시험은 내렸어요.</b><br>' + esc(RD.withdrawn.why) + ' (' + esc(RD.withdrawn.at) + ')<br><a href="' + esc(RD.withdrawn.terms) + '" target="_blank" rel="noopener nofollow">출처 사이트 이용 약관 ↗</a></div>';
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
  window.TNPlaces = { parseOH: parseOH, openState: openState, hoursKo: hoursKo, oldBefore: oldBefore, basis: basis, isOld: isOld, openOK: openOK, verified: verified, CLOSED_MIN: CLOSED_MIN };
})();
