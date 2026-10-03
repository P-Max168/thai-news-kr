/* 태국 뉴스 한눈에 — 정적 렌더러 (빌드 불필요, file:// 지원)
 * 의존: assets/topics.js(주제·페르소나·옛 판 매핑) → prefs.js(저장소) → taste.js(👍👎 학습) → 이 파일
 */
(function () {
  "use strict";
  var T = window.TNTopics, S = window.TNStore, L = window.TNTaste;
  var TZ = "Asia/Bangkok";
  var MAX = T.MAX_TOPICS;
  var DECO = { east: "〰", bangkok: "曼", north: "⛰", south: "☀", poleco: "政", society: "社", visa: "✈", life: "%", travel: "旅", ent: "#", weather: "☂" };
  // tab: "feed"(내 피드) | "all"(전체 보기) | 주제 id
  var state = { data: null, tab: "feed", edition: null, impact: null, dqOpen: {}, natStep: 0 };
  var NAT_STEPS = [5, 10, 1000];
  var OB2 = !!T.ONBOARDING_2STEP;   // 2단계 시작 화면·내 피드 묶음 스위치(topics.js — 2026-10-03 운영자 보류로 꺼 둠)   // 내 피드 '전국·다른 지역' 칸: 5건 → 10건 → 전부
  /* 한인 영향도 태그(판 데이터 story.impact — README '판마다 채울 필드(2026-10-03 추가)'). 순서 = 필터 칩 순서 */
  var IMPACT = [
    { k: "비자·체류", e: "🛂", c: "#6741d9" }, { k: "환율·물가", e: "💱", c: "#0c8f6a" }, { k: "교통·사고", e: "🚗", c: "#d9480f" },
    { k: "치안", e: "🚨", c: "#c92a2a" }, { k: "날씨·재해", e: "🌧️", c: "#1971c2" }];
  function impOf(k) { for (var i = 0; i < IMPACT.length; i++) if (IMPACT[i].k === k) return IMPACT[i]; return null; }
  function impacts(s) { return (Array.isArray(s.impact) ? s.impact : []).filter(impOf); }
  var $ = function (id) { return document.getElementById(id); };
  var TH_RX = /[\u0E00-\u0E3E\u0E40-\u0E7F]/;   // 태국 문자(฿ U+0E3F 제외)

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* **굵게** 표시만 허용(나머지는 이스케이프) */
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function shade(hex, f) { // f<0 어둡게, f>0 밝게
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(c) { return Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f); }
    return "rgb(" + m(r) + "," + m(g) + "," + m(b) + ")";
  }
  function topicOf(id) { return T.get(id) || { id: id, label: id, emoji: "📰", color: "#495057" }; }
  function tps(s) { return T.storyTopics(s); }

  function fmtTime(iso) {
    var parts = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso));
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    return o.month + "/" + o.day + " " + o.hour + ":" + o.minute;
  }
  function fmtDay(iso) {
    var p = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric", weekday: "short" }).formatToParts(new Date(iso));
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return o.month + "월 " + o.day + "일(" + o.weekday + ")";
  }
  function relTime(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diff < 0 || diff > 60 * 48) return "";
    if (diff < 60) return Math.max(1, Math.round(diff)) + "분 전";
    return Math.floor(diff / 60) + "시간 전";
  }
  function timeHTML(iso) {
    var r = relTime(iso);
    return '<time datetime="' + esc(iso) + '" title="방콕 시간 기준">' + esc(fmtTime(iso)) + '<span class="tz"> (BKK)</span>' + (r ? " · " + r : "") + "</time>";   // 휴대폰은 (BKK) 숨김 — 사이트 전체가 방콕 시간(헤더에 표시)
  }
  function metaHTML(s) {
    return '<div class="meta"><span class="src">' + esc(s.source) + '</span><span class="dot">' + timeHTML(s.published) + "</span></div>";
  }

  /* ---------- 사용자 설정 ---------- */
  function prof() { return S.get(); }
  function selected() {   // 옛 주제 id(pattaya·sriracha)는 east 로 읽고 중복 제거(prefs.js 가 저장값도 옮김)
    var t = prof().topics; if (!t || !t.length) return null;
    var out = []; t.forEach(function (x) { x = T.canon(x); if (T.get(x) && out.indexOf(x) < 0) out.push(x); });
    return out.length ? out : null;
  }
  function inSelection(s) {
    var sel = selected(); if (!sel) return true;
    return tps(s).all.some(function (t) { return sel.indexOf(t) >= 0; });
  }
  function edId() { return (state.edition && state.edition.id) || state.data.id || state.data.date; }
  function refTime() { return new Date(state.data.generated || (state.data.date + "T12:00:00+07:00")).getTime(); }

  /* ---------- 데이터 로드 ---------- */
  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function loadDate(date) {
    window.NEWS_DATA = window.NEWS_DATA || {};
    if (window.NEWS_DATA[date]) return render(window.NEWS_DATA[date]);
    // index.html head 에서 미리 받기 시작한 판 데이터(#tnkData)가 있으면 그것이 끝나기를 기다림(같은 파일을 두 번 받지 않게)
    var pre = document.getElementById("tnkData");
    if (pre && pre.getAttribute("data-ed") === date && pre.getAttribute("data-done") !== "err") {
      if (pre.getAttribute("data-done") === "1") { if (window.NEWS_DATA[date]) return render(window.NEWS_DATA[date]); }
      else { pre.addEventListener("load", function () { if (window.NEWS_DATA[date]) render(window.NEWS_DATA[date]); else loadDate2(date); }); pre.addEventListener("error", function () { loadDate2(date); }); return; }
    }
    loadDate2(date);
  }
  /* 불러오기 실패 안내(한국어 + 다시 시도). 오프라인이면 그 이유도 */
  function loadFail(msg) {
    var off = navigator.onLine === false;
    $("topGrid") && ($("topGrid").innerHTML = "");
    return '<div class="empty empty--err" role="alert"><b>' + (off ? "📡 " : "⚠️ ") + msg + "</b><br>" +
      (off ? "인터넷에 연결되어 있지 않아요. 한 번 열어 본 판은 연결 없이도 읽을 수 있어요." : "잠시 뒤 다시 시도해 주세요. 계속 안 되면 다른 판(위 날짜 선택)을 골라 보세요.") +
      '<br><button type="button" class="btn btn--primary btn--sm empty__retry" onclick="location.reload()">다시 시도</button></div>';
  }
  function loadDate2(date) {
    var sc = document.createElement("script");
    sc.src = "data/" + date + ".js";
    sc.onload = function () { if (window.NEWS_DATA[date]) render(window.NEWS_DATA[date]); else sc.onerror(); };
    sc.onerror = function () {
      var m = /^(\d{4})-(\d\d)-(\d\d)-(am|pm)$/.exec(date), lbl = m ? (+m[2]) + "월 " + (+m[3]) + "일 " + (m[4] === "am" ? "아침판" : "저녁판") : date;
      $("feed").innerHTML = loadFail(esc(lbl) + " 뉴스를 불러오지 못했어요.");
    };
    document.body.appendChild(sc);
  }

  /* ---------- 렌더 ---------- */
  function render(data) {
    state.data = data;
    var d = new Date(data.date + "T12:00:00+07:00");
    var longDate = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(d);
    var ed = state.edition || {};
    var edName = ed.label ? ed.label.replace(/^\d+월 \d+일 /, "") : "";
    $("dateline").innerHTML = esc(longDate) + "<span>" + (edName ? '<b class="edtag">' + esc(edName) + "</b> · " : "") + "방콕 시간 (UTC+7) 기준</span>";
    document.title = "태국 뉴스 한눈에 — " + (ed.label || longDate);
    $("generated").textContent = (ed.label ? ed.label + " · " : "") + "업데이트: " + fmtTime(data.updated || data.generated) + " (방콕) · 기사 " + data.stories.length + "건";
    renderBriefing(edName);
    if (L.backfill(edId(), data.stories)) S.update(function () {});
    renderAll();
    renderSide();
    if (window.TNLate) setTimeout(window.TNLate, 0);   // 첫 그리기 뒤 쪽 화면 스크립트 받기(index.html)
    if (location.hash.length > 1) openStory(location.hash.slice(1), true);
  }
  function renderAll() { renderTabs(); $("briefing").hidden = !topShown(); renderKorea(); renderTop(); renderFeed(); renderAds(); }

  /* 🇰🇷 오늘의 한국 주요 뉴스 — 내 피드·전체 보기에서 맨 위. 최대 10건, 처음 4건 + '펼치기'(나머지 6건) / '접기'
   * 순위 TOP 10, 처음 3건 → 펼치기 5건 → 10건 → 접기
   * ① data/korea.json(GitHub Actions 가 2시간마다 갱신, 판과 무관): 네트워크 우선(cache: no-store + ?_=시각),
   *    file:// 에서는 data/korea.js(window.KOREA_NEWS). updated_at 이 6시간 안일 때만 사용(최신 판을 볼 때만)
   * ② 없거나 6시간 넘게 지났으면 판의 korea_top 으로 대체(없으면 섹션 숨김) */
  // TOP 10(순위 1~10): 처음 3건 → '펼치기' 5건 → 10건 → '접기'
  var KOREA = { live: null, at: 0, step: 0, open: -1, STEPS: [3, 5, 10], MAX_AGE: 6 * 3600 * 1000, MAX: 10 };
  function loadKorea() {
    KOREA.at = Date.now();
    function done(d) {
      if (d && Array.isArray(d.items) && d.updated_at) KOREA.live = d;
      if (state.data) renderKorea();
    }
    if (!/^https?:$/.test(location.protocol)) {
      var sc = document.createElement("script");
      sc.src = "data/korea.js?_=" + Date.now();
      sc.onload = function () { done(window.KOREA_NEWS); };
      sc.onerror = function () { done(null); };
      document.body.appendChild(sc);
      return;
    }
    fetch("data/korea.json?_=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(done, function () { done(null); });
  }
  function isLatest() { return !EDS.length || !state.edition || state.edition.id === EDS[0].id; }
  function koreaSource() {
    var k = KOREA.live, t = k && new Date(k.updated_at).getTime();
    if (k && k.items.length && isLatest() && t > 0 && Date.now() - t <= KOREA.MAX_AGE) {
      return { at: k.updated_at, live: true, items: k.items.map(function (x) { return { headline: x.title, source: x.source, url: x.url, published: x.time, desc: x.desc || x.summary || x.description }; }) };
    }
    var e = state.data && state.data.korea_top;
    if (Array.isArray(e) && e.length) return { at: state.data.updated || state.data.generated, live: false, items: e };
    return null;
  }
  function hhmm(iso) {
    var o = {}; new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso)).forEach(function (p) { o[p.type] = p.value; });
    return o.hour + ":" + o.minute;
  }
  function renderKorea() {
    var el = $("korea"), src = state.data && koreaSource();
    if (!el) return;
    if (!src || !topShown()) { el.hidden = true; return; }
    var k = src.items.slice(0, KOREA.MAX);
    var closed = !!(prof().ui && prof().ui.koreaClosed);
    var kAd = adSlot("korea-mid");
    var ST = KOREA.STEPS, show = Math.min(k.length, ST[KOREA.step] || k.length), next = Math.min(k.length, ST[KOREA.step + 1] || k.length);
    el.hidden = false;
    el.classList.toggle("is-closed", closed);
    el.setAttribute("data-korea-src", src.live ? "live" : "edition");
    el.innerHTML = '<button type="button" class="korea__head" data-korea-toggle aria-expanded="' + !closed + '" aria-controls="koreaList"><span><span class="korea__title" id="koreaTitle">🇰🇷 오늘의 한국 주요 뉴스 <b class="korea__top">TOP ' + k.length + '</b></span><span class="korea__sub">' +
      (src.at ? '<time class="korea__upd" datetime="' + esc(src.at) + '" title="방콕 시간 기준">업데이트 ' + esc(hhmm(src.at)) + "</time>" : "한국 언론") + "</span></span><span class=\"korea__chev\" aria-hidden=\"true\">▾</span></button>" +
      '<ol class="korea__list" id="koreaList">' + k.map(function (x, i) {
        // 항목을 누르면 바로 아래 작은 카드(제목·매체·시각·짧은 설명이 데이터에 있을 때만 — 기사 본문은 절대 옮기지 않음) + '기사 보러 가기 ↗'(새 탭)
        var op = KOREA.open === i, d = (x.desc || x.summary || "").toString().trim();
        if (d.length > 160) d = d.slice(0, 157) + "…";
        return '<li' + (i >= show ? ' class="k-extra"' : "") + (i < 3 ? ' data-rank-top' : "") + (op ? ' data-open' : "") + '>' +
          '<button type="button" class="k-row" data-korea-item="' + i + '" aria-expanded="' + op + '" aria-controls="kcard' + i + '"><span class="kn" aria-label="' + (i + 1) + '위">' + (i + 1) + '</span><span class="kt">' +
          (x.badge ? '<span class="kp">' + esc(x.badge) + "</span>" : "") + esc(x.headline) +
          '<span class="km">' + esc(x.source) + (x.published ? " · " + esc(fmtTime(x.published)) + " (BKK)" : "") + '</span></span><span class="k-chev" aria-hidden="true">▾</span></button>' +
          '<div class="k-card" id="kcard' + i + '"' + (op ? "" : " hidden") + '><b class="k-card__t">' + esc(x.headline) + '</b>' +
          '<span class="k-card__m">' + esc(x.source) + (x.published ? " · " + esc(fmtDay(x.published)) + " " + esc(hhmm(x.published)) + " (방콕)" : "") + "</span>" +
          (d ? '<p class="k-card__d">' + esc(d) + "</p>" : "") +
          (/^https?:\/\//.test(x.url || "") ? '<a class="k-card__go" href="' + esc(x.url) + '" target="_blank" rel="noopener">기사 보러 가기 ↗</a>' : "") + "</div></li>" +
          (i === 4 && show > 5 && kAd && !adRisk(x) && !adRisk(k[5]) ? '<li class="k-ad">' + adHTML(kAd, 0) + "</li>" : "");   // 5위·6위 사이 작은 광고(6~10위가 보일 때만, data/ads.json 'korea-mid')
      }).join("") + "</ol>" +
      (k.length > ST[0] ? '<button type="button" class="korea__more" data-korea-more aria-controls="koreaList" aria-expanded="' + (show >= k.length) + '">' +
        (show >= k.length ? "접기 ▴" : "펼치기 (" + (next - show) + "건 더) ▾") + "</button>" : "");
  }

  /* 브리핑: 새 형식 [{topic, text(**굵게**), story_id}] / 옛 형식(문단) → 문장별 글머리표 */
  function legacyBriefing(text) {
    var stories = state.data.stories, freq = {};
    stories.forEach(function (s) { (s.tags || []).forEach(function (t) { freq[t] = (freq[t] || 0) + 1; }); });
    var sents = String(text).replace(/([.!?])\s+/g, "$1\n").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    var hl = state.data.highlights || [];
    return sents.map(function (sent) {
      var best = null, bestSc = 0, bestTag = null;
      stories.forEach(function (s) {
        var sc = 0, rare = null;
        (s.tags || []).forEach(function (t) {
          if (t.length >= 2 && sent.indexOf(t) >= 0) { sc += 1 / freq[t]; if (!rare || freq[t] < freq[rare]) rare = t; }
        });
        if (sc && hl.indexOf(s.id) >= 0) sc += 0.05;
        if (sc > bestSc) { bestSc = sc; best = s; bestTag = rare; }
      });
      // 굵게: 연결된 기사의 핵심 키워드 + 단위가 붙은 첫 숫자(원문 문장은 바꾸지 않고 표시만)
      var html = esc(sent);
      if (bestTag) html = html.replace(esc(bestTag), "<b>" + esc(bestTag) + "</b>");
      html = html.replace(/\d[\d,.]*(?:~\d[\d,.]*)?(?:만|억|조)?(?:\d[\d,.]*)?\s?(?:만\s?)?(?:바트|가구|명|㎥|m³|%|개 주|개|곳|건|편|대|일|시간|cm|mm)/, function (m) { return "<b>" + m + "</b>"; });
      return { topic: best ? tps(best).topic : null, html: html, story_id: best ? best.id : null };
    });
  }
  function renderBriefing(edName) {
    var b = state.data.briefing, items;
    if (Array.isArray(b)) items = b.map(function (x) { return { topic: x.topic, html: rich(x.text), story_id: x.story_id }; });
    else items = legacyBriefing(b || "");
    var badge = { "아침판": "아침 브리핑", "저녁판": "저녁 브리핑", "새벽판": "새벽 브리핑" }[edName] || "오늘의 브리핑";
    $("briefing").innerHTML = '<div class="briefing__head"><span class="briefing__badge">' + esc(badge) + '</span><span class="briefing__title">' + items.length + "줄로 보는 이번 판</span></div>" +
      '<ul class="brief-list">' + items.map(function (it) {
        var t = it.topic ? topicOf(it.topic) : null;
        var chip = t ? '<span class="bchip" style="--tc:' + t.color + '"><span aria-hidden="true">' + t.emoji + "</span>" + esc(t.label) + "</span>" : '<span class="bchip bchip--none">📰</span>';
        var inner = '<span class="brief-text">' + chip + it.html + "</span>";
        return "<li>" + (it.story_id ? '<button type="button" class="brief-line" data-open="' + esc(it.story_id) + '">' + inner + '<span class="brief-go" aria-hidden="true">›</span></button>' : '<div class="brief-line">' + inner + "</div>") + "</li>";
      }).join("") + "</ul>";
  }

  function topicCounts() {
    var c = {};
    state.data.stories.forEach(function (s) { tps(s).all.forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    return c;
  }
  function tabList() {
    var sel = selected() || T.TOPICS.map(function (t) { return t.id; });
    var list = ["feed"].concat(sel);
    if (state.tab !== "feed" && state.tab !== "all" && list.indexOf(state.tab) < 0) list.push(state.tab); // 선택 밖 주제를 잠깐 보는 중
    return list.concat(["all"]);
  }
  /* ☰ 서랍 메뉴 안의 세로 목록(#tabs = 내 피드 + 내 주제 + 전체 보기, #tabsOther = 고르지 않은 주제) */
  function tabBtn(k, c, sel) {
    var label, n, cls = "tab";
    if (k === "feed") { label = "⭐ 내 피드"; n = feedList().length + (state.data.highlights || []).length; }
    else if (k === "all") { label = "📰 전체 보기"; n = state.data.stories.length; }
    else { var t = topicOf(k); label = t.emoji + " " + t.label; n = c[k] || 0; if (sel && sel.indexOf(k) < 0) cls += " tab--temp"; }
    return '<button type="button" class="' + cls + '" role="tab" data-tab="' + k + '" aria-selected="' + (state.tab === k) + '"><span class="tab__l">' + esc(label) + '</span><span class="n">' + (n || "–") + "</span></button>";
  }
  /* ☰ 맨 위 바로가기 2칸(같은 크기): ❤️ 하트한 기사 N개 · 📍 내 주변(마지막에 본 가게 종류, 처음엔 맛집) */
  function renderQuick() {
    var q = $("drawerQuick"); if (!q) return;
    var last = null;
    try { last = localStorage.getItem("tnk.nbLast"); } catch (e) {}
    q.innerHTML = '<button type="button" class="dq-btn" data-page="hearts"><span class="dq-e" aria-hidden="true">❤️</span><b>하트한 기사</b><small id="drHeartN">' + L.hearts().length + "개</small></button>" +
      '<button type="button" class="dq-btn" data-quick-nearby="' + esc(last || "") + '"><span class="dq-e" aria-hidden="true">📍</span><b>내 주변</b><small>맛집·마사지·병원</small></button>';
  }
  function renderTabs() {
    renderQuick();
    var c = topicCounts(), sel = selected(), list = tabList();
    $("tabs").innerHTML = list.map(function (k, i) {
      return tabBtn(k, c, sel) + (i === 0 ? (OB2 ? '<button type="button" class="dr-item dr-item--mine" data-ob-edit aria-haspopup="dialog">✏️ 내 피드 바꾸기 <small>사는 곳·관심</small></button>' : "") +
        (OB2 ? '<button type="button" class="dr-item" id="myTopicsBtn" data-open-settings aria-haspopup="dialog">🧩 세부 주제·설정 <small>주제 직접 고르기·취향 초기화</small></button>'
          : '<button type="button" class="dr-item" id="myTopicsBtn" data-open-settings aria-haspopup="dialog">🧩 내 주제 설정</button>') : "");
    }).join("");
    var other = sel ? T.TOPICS.map(function (t) { return t.id; }).filter(function (k) { return list.indexOf(k) < 0; }) : [];
    $("tabsOther").innerHTML = other.map(function (k) { return tabBtn(k, c, null).replace('class="tab', 'class="tab tab--other'); }).join("");
    $("tabsOther").hidden = $("tabsOtherTitle").hidden = !other.length;
  }

  /* ---------- 휴대폰·앱 '뒤로' 버튼(2026-10-03 앱 포장 준비) ----------
     서랍·설정 창을 열 때 기록 1칸(주소 그대로, state.ui)을 넣고 '뒤로' = 닫기(앱이 꺼지지 않게).
     닫기 버튼으로 닫으면 그 칸을 history.back() 으로 지움 — 같은 순간 다른 화면(#hearts·#nearby·설정 창)이 열리면
     그 화면이 이 칸을 이어 쓰므로(replaceState, pages.js·nearby.js 도 같은 규칙) 지우지 않음 */
  var Back = {
    push: function (k) { var st = { ui: k }; if (history.state && history.state.ui) history.replaceState(st, ""); else history.pushState(st, ""); },
    pop: function (k) { setTimeout(function () { if (history.state && history.state.ui === k) history.back(); }, 0); },
    is: function (k) { return !!(history.state && history.state.ui === k); }
  };

  /* ---------- ☰ 서랍 ---------- */
  var Drawer = (function () {
    var dr = $("drawer"), ov = $("drawerOv"), btn = $("menuBtn"), last = null, x0 = null, y0 = null;
    function items() { return [].slice.call(dr.querySelectorAll("button, a[href], input, select, textarea")).filter(function (e) { return !e.disabled && e.offsetParent !== null; }); }
    function open() {
      last = document.activeElement;
      ov.hidden = false; dr.classList.add("is-open"); dr.setAttribute("aria-hidden", "false"); btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("drawer-open");
      Back.push("dr");
      renderQuick();   // 하트 수·마지막 내 주변 종류 최신으로
      if (window.TNSocial && $("drawerAcct")) window.TNSocial.renderAccountBox($("drawerAcct"));
      if (window.TNSocial && window.TNSocial.warm) window.TNSocial.warm();   // 로그인 모듈은 메뉴를 열 때 미리 받음
      var cur = dr.querySelector('[aria-selected="true"]') || items()[0];
      setTimeout(function () { if (cur) cur.focus({ preventScroll: true }); }, 30);
    }
    function close(noFocus, fromPop) {
      if (!dr.classList.contains("is-open")) return;
      if (!fromPop) Back.pop("dr");
      dr.classList.remove("is-open"); dr.setAttribute("aria-hidden", "true"); btn.setAttribute("aria-expanded", "false");
      ov.hidden = true; document.body.classList.remove("drawer-open");
      if (!noFocus && last && last.focus) last.focus({ preventScroll: true });
    }
    btn.addEventListener("click", function () { if (dr.classList.contains("is-open")) close(); else open(); });
    window.addEventListener("popstate", function () { if (dr.classList.contains("is-open") && !Back.is("dr")) close(true, true); });
    ov.addEventListener("click", function () { close(); });
    dr.addEventListener("click", function (e) { if (e.target.closest("[data-drawer-close]")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!dr.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab") {   // 포커스 가두기
        var it = items(); if (!it.length) return;
        var f = it[0], l = it[it.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
        else if (!dr.contains(document.activeElement)) { e.preventDefault(); f.focus(); }
      }
    });
    // 왼쪽으로 밀면 닫힘
    dr.addEventListener("touchstart", function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
    dr.addEventListener("touchmove", function (e) {
      if (x0 == null) return; var t = e.touches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.5) { x0 = null; close(); }
    }, { passive: true });
    dr.addEventListener("touchend", function () { x0 = null; }, { passive: true });
    return { open: open, close: close };
  })();

  function byId(id) { return state.data.stories.filter(function (s) { return s.id === id; })[0]; }

  function topShown() { return state.tab === "feed" || state.tab === "all"; }
  function renderTop() {
    // 주요 뉴스 3건은 주제 선택과 관계없이 항상(내 피드·전체 보기에서) 보인다
    $("topSection").hidden = !topShown();
    if (!topShown()) return;
    $("topGrid").innerHTML = (state.data.highlights || []).map(function (id, i) {
      var s = byId(id); if (!s) return "";
      var t = topicOf(tps(s).topic);
      var bg = "radial-gradient(120% 90% at 100% 0%," + shade(t.color, 0.25) + " 0," + shade(t.color, -0.25) + " 55%," + shade(t.color, -0.6) + " 100%)";
      return '<article class="top-card' + (i === 0 ? " top-card--main" : "") + '" style="--bg:' + bg + '" tabindex="0" data-open="' + esc(s.id) + '">' +
        '<span class="deco" aria-hidden="true">' + (DECO[t.id] || "") + "</span>" +
        '<div class="badges"><span class="rank">TOP ' + (i + 1) + '</span><span class="chip">' + t.emoji + " " + esc(t.label) + "</span>" + (s.region ? '<span class="chip">📍 ' + esc(s.region) + "</span>" : "") + (s.update ? '<span class="chip">후속</span>' : "") + "</div>" +
        "<h3>" + esc(s.headline) + "</h3>" +
        "<p>" + esc(s.summary[0]) + "</p>" + metaHTML(s) + "</article>";
    }).join("");
  }

  function voteHTML(s) {
    var v = L.voteOf(edId(), s);
    return '<div class="card__acts" role="group" aria-label="이런 소식 더 볼래요?">' +
      '<span class="vote-q">이런 소식 더 볼래요?</span><span class="vote-btns">' +
      '<button type="button" class="vote vote--up" data-vote="1" data-id="' + esc(s.id) + '" aria-pressed="' + (v > 0) + '">🙌 더 보여줘</button>' +
      '<button type="button" class="vote vote--down" data-vote="-1" data-id="' + esc(s.id) + '" aria-pressed="' + (v < 0) + '">🙅 덜 보여줘</button></span></div>';
  }

  function cardHTML(s) {
    var tp = tps(s), t = topicOf(tp.topic);
    var chips = '<span class="chip chip--topic" style="--tc:' + t.color + '">' + t.emoji + " " + esc(t.label) + "</span>" +
      tp.secondary.map(function (k) { var x = topicOf(k); return '<span class="chip chip--sec" style="--tc:' + x.color + '">' + esc(x.label) + "</span>"; }).join("");
    if (s.region) chips += '<span class="chip chip--region">📍 ' + esc(s.region) + "</span>";
    var age = refTime() - new Date(s.published).getTime();
    if (tp.all.indexOf("visa") >= 0 || age > 36 * 3600000) chips += '<span class="chip chip--date">📅 ' + esc(fmtDay(s.published)) + "</span>";
    if (s.update) chips += '<span class="chip chip--new">후속</span>';
    impacts(s).forEach(function (k) { var m = impOf(k); chips += '<span class="chip chip--imp" style="--ic:' + m.c + '" title="한인 영향: ' + esc(k) + '"><span aria-hidden="true">' + m.e + "</span>" + esc(k) + "</span>"; });
    var forMe = (typeof s.for_me === "string" && s.for_me.trim()) ? '<p class="forme"><b class="forme__h">🙋 그래서 나는?</b><span class="forme__t">' + esc(s.for_me.trim()) + "</span></p>" : "";
    var paras = s.summary.map(function (p) { return '<p class="para">' + esc(p) + "</p>"; }).join("");
    var ctx = s.context ? '<div class="context"><b>💡 배경 설명</b>' + esc(s.context) + "</div>" : "";
    var upd = s.update ? '<div class="update"><b>🆕 이전 판 이후 새로 나온 내용</b>' + esc(s.update) + "</div>" : "";
    var rel = (s.related && s.related.length) ? '<p class="related-label">관련 기사 · 함께 참고한 원문</p><ul class="related">' + s.related.map(function (r) {
      // 태국 문자 제목은 화면에 내지 않음(운영자 기준: 태국 문자 금지, ฿ 만 허용) → '관련 보도 원문(태국어)'
      var rt = TH_RX.test(r.title || "") ? "관련 보도 원문 (태국어 기사)" : (r.title || "관련 보도 원문");
      return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener"><span class="rs">' + esc(String(r.source || "").replace(/\s*\([^)]*[\u0E00-\u0E7F][^)]*\)/g, "")) + '</span><span class="rt">' + esc(rt) + "</span> ↗</a></li>";
    }).join("") + "</ul>" : "";
    var tags = (s.tags || []).length ? '<div class="tags">' + s.tags.map(function (x) { return "<span>#" + esc(x) + "</span>"; }).join("") + "</div>" : "";
    var v = L.voteOf(edId(), s);
    var hon = L.heartOf(edId(), s);
    return '<article class="card' + (v < 0 ? " is-down" : "") + '" style="--tc:' + t.color + '" data-topic="' + tp.topic + '"' + (adRisk(s) ? ' data-adsafe="0"' : "") + ' id="' + esc(s.id) + '">' +
      '<button type="button" class="card-heart" data-heart data-id="' + esc(s.id) + '" aria-pressed="' + hon + '" aria-label="' + (hon ? "하트 취소" : "하트 — 이런 뉴스 더 보기") + '"><span aria-hidden="true">' + (hon ? "❤️" : "♡") + "</span></button>" +
      '<button class="card__head" aria-expanded="false" aria-controls="body-' + esc(s.id) + '">' +
        '<div class="card__top">' + chips + "</div>" +
        '<h3 class="card__title">' + esc(s.headline) + "</h3>" + forMe +
        '<p class="card__lead">' + esc(s.summary[0]) + "</p>" +
        '<div class="card__foot">' + metaHTML(s) + '<span class="more"><span class="more__t">자세히</span> <i>▾</i></span></div>' +
      "</button>" + toolsHTML(s) +
      '<div class="card__body" id="body-' + esc(s.id) + '">' + upd + paras + ctx +
        '<div class="origin">' + originTitle(s.title_th) +
        '<a class="btn" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.source.replace(/\s*\(.*\)$/, "")) + " 원문 보기 ↗</a>" + rel + tags + "</div>" +
        talkHTML(s) +
      "</div>" + voteHTML(s) + "</article>";
  }

  /* 원문 제목: 태국 글자가 있으면 작은 '원문 제목 보기' 토글 안에만(운영자·독자가 못 읽는 글자를 화면에 바로 내지 않음), 영어 등은 그대로 */
  function originTitle(t) {
    if (!t) return "";
    if (TH_RX.test(t)) return "";   // 태국어 원문 제목은 화면에 내지 않음(2026-10-03 — 펼쳐도 태국 문자가 보이지 않게). 원문은 '원문 보기' 버튼으로
    return '<p class="origin__th"><small>원문 제목</small>' + esc(t) + "</p>";
  }

  /* ---------- 카드 도구 줄(접힌 카드에서도 보임): 📰 N개 매체 보도 · 🗓️ 이슈 타임라인 ---------- */
  function alsoList(s) {
    return (Array.isArray(s.also) ? s.also : []).filter(function (a) { return a && a.source && /^https?:\/\//.test(a.url || "") && a.url !== s.url; });
  }
  function toolsHTML(s) {
    var al = alsoList(s), sid = esc(s.id);
    var a = al.length ? '<button type="button" class="tool" data-also="' + sid + '" aria-expanded="false" aria-controls="also-' + sid + '">📰 <b>' + (al.length + 1) + '개 매체</b> 보도 <i aria-hidden="true">▾</i></button>' : "";
    var panel = al.length ? '<div class="tool-panel also" id="also-' + sid + '" hidden><p class="tool-panel__h">같은 소식을 다룬 매체 · 누르면 새 탭</p><ul class="also__list">' +
      [{ source: s.source, url: s.url, main: true }].concat(al).map(function (x) {
        return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener"><span class="also__s">' + esc(String(x.source).replace(/\s*\(.*\)$/, "")) + "</span>" + (x.main ? '<span class="also__m">이 기사 원문</span>' : "") + '<span class="also__go" aria-hidden="true">↗</span></a></li>';
      }).join("") + "</ul></div>" : "";
    var ib = issueBtnHTML(s);
    return '<div class="card__tools" data-tools="' + sid + '"' + (al.length || ib ? "" : " hidden") + ">" + a + '<span data-issue-slot="' + sid + '">' + ib + "</span></div>" + panel +
      '<div class="tool-panel tl" id="tl-' + sid + '" hidden></div>';
  }
  /* 🗓️ 이슈 타임라인: data/issues.json(newslib.build_index 가 tools/issues.json 등록부 + 판 기사 issue 필드로 만듦) */
  var ISS = { data: null, rev: {}, loading: false };
  function loadIssues() {
    if (ISS.loading || ISS.data) return; ISS.loading = true;
    function done(d) {
      ISS.loading = false;
      if (!d || !d.issues) return;
      ISS.data = d; ISS.rev = {};
      Object.keys(d.issues).forEach(function (k) { d.issues[k].items.forEach(function (it) { ISS.rev[it.edition + "/" + it.story] = k; }); });
      refreshIssueButtons();
    }
    if (!/^https?:$/.test(location.protocol)) {
      var sc = document.createElement("script"); sc.src = "data/issues.js?_=" + Date.now();
      sc.onload = function () { done(window.TN_ISSUES); }; sc.onerror = function () { done(null); };
      document.body.appendChild(sc); return;
    }
    fetch("data/issues.json?_=" + Math.floor(Date.now() / 600000), { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(done, function () { done(null); });
  }
  function issueOf(s) {
    var id = (s.issue && s.issue.id) || ISS.rev[edId() + "/" + s.id];
    if (!id) return null;
    var reg = ISS.data && ISS.data.issues[id];
    return { id: id, title: (reg && reg.title) || (s.issue && s.issue.title) || "", items: reg ? reg.items : null };
  }
  function issueBtnHTML(s) {
    var is = issueOf(s);
    if (!is || (is.items && is.items.length < 2)) return "";   // 같은 이슈 기사가 1건뿐이면 숨김
    return '<button type="button" class="tool tool--tl" data-issue="' + esc(is.id) + '" data-sid="' + esc(s.id) + '" aria-expanded="false" aria-controls="tl-' + esc(s.id) + '">🗓️ 이슈 타임라인' +
      (is.items ? ' <b class="tool__n">' + is.items.length + "</b>" : "") + ' <i aria-hidden="true">▾</i></button>';
  }
  function refreshIssueButtons() {
    if (!state.data) return;
    [].forEach.call(document.querySelectorAll("[data-issue-slot]"), function (sl) {
      var s = byId(sl.getAttribute("data-issue-slot")); if (!s) return;
      sl.innerHTML = issueBtnHTML(s);
      var box = sl.parentNode; box.hidden = !(box.querySelector("[data-also]") || sl.firstChild);
    });
  }
  function timelineHTML(s) {
    var is = issueOf(s);
    if (!is || !is.items) return '<p class="tool-panel__h">타임라인을 불러오는 중…</p>';
    var cur = edId();
    return '<p class="tool-panel__h">🗓️ <b>' + esc(is.title) + "</b> · 판별 " + is.items.length + '건 (오래된 순)</p><ol class="tl__list">' + is.items.map(function (it) {
      var here = it.edition === cur && it.story === s.id, same = it.edition === cur;
      var when = esc(it.label) + (it.published ? " · " + esc(fmtTime(it.published)) : "");
      var go = here ? '<span class="tl__here">지금 보는 기사</span>'
        : same ? '<button type="button" class="tl__go" data-open="' + esc(it.story) + '">이 판에서 보기 ›</button>'
        : '<a class="tl__go" href="?date=' + encodeURIComponent(it.edition) + "#" + encodeURIComponent(it.story) + '">그 판에서 보기 ›</a>';
      return '<li class="tl__i' + (here ? " is-here" : "") + '"><span class="tl__d">' + when + '</span><span class="tl__t">' + esc(it.headline) + "</span>" + go + "</li>";
    }).join("") + "</ol>";
  }
  function togglePanel(btn, panel, fill) {
    var open = panel.hidden;
    if (open && fill) panel.innerHTML = fill();
    panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); btn.classList.toggle("is-on", open);
  }

  /* 💬 오늘의 질문(판 데이터의 정적 내용, approved 일 때만) + 댓글 자리(assets/social.js 가 채움)
   * 2026-10-03 운영자 요청: 질문 상자·고정 운영자 댓글이 기사마다 너무 커서 → 한 줄 '💬 오늘의 질문: …'(말줄임)만 보이고,
   * 누르면 질문 전문 + 📌 운영자 댓글(배지 유지) + 💡 추천 문장 + 댓글 칸·댓글 목록이 펼쳐진다. 질문이 없는 기사는 예전처럼 댓글 칸 그대로. */
  function talkHTML(s) {
    var d = s.discussion, live = /^https?:$/.test(location.protocol), sid = esc(s.id);
    var cm = live ? '<div class="cmts" data-cmts="' + sid + '"><p class="cmts__empty">댓글은 기사를 펼치면 불러와요.</p></div>' : "";
    if (!(d && d.approved === true && d.question)) return '<section class="talk" aria-label="댓글">' + cm + "</section>";
    var op = d.operator_comment ? '<div class="cmt cmt--op cmt--pin"><div class="cmt__h"><b class="cmt__n">운영자</b><span class="badge-op">운영자</span><span class="cmt__pin">📌 고정</span></div><p class="cmt__t">' + esc(d.operator_comment) + "</p>" +
      (live ? '<div class="cmt__a"><button type="button" class="cbtn" data-op-reply>↳ 답글</button></div>' : "") + "</div>" : "";
    var open = !!state.dqOpen[s.id];
    return '<section class="talk talk--dq' + (open ? " is-open" : "") + '" aria-label="댓글">' +
      '<button type="button" class="dq-line" data-dq="' + sid + '" aria-expanded="' + open + '" aria-controls="dqm-' + sid + '">' +
        '<span class="dq-line__h">💬 오늘의 질문:</span><span class="dq-line__q">' + esc(d.question) + '</span><span class="dq-line__n" data-dq-n></span><i aria-hidden="true">▾</i></button>' +
      '<div class="talk__more" id="dqm-' + sid + '"' + (open ? "" : " hidden") + '><p class="dq__q dq__q--full">' + esc(d.question) + "</p>" + op + cm + "</div></section>";
  }
  function toggleTalk(btn) {
    var id = btn.getAttribute("data-dq"), box = $("dqm-" + id); if (!box) return;
    var open = box.hidden; box.hidden = !open; state.dqOpen[id] = open;
    btn.setAttribute("aria-expanded", String(open)); btn.closest(".talk").classList.toggle("is-open", open);
  }

  /* ---------- 광고 자리(목업): data/ads.json → data/ads.js(window.TN_ADS). 없거나 enabled=false 면 아무것도 안 보임 ---------- */
  function adSlot(id) {
    var A = window.TN_ADS;
    if (!A || A.enabled === false || !A.slots) return null;
    var sl = A.slots.filter(function (x) { return x.id === id && x.enabled !== false && x.items && x.items.length; })[0];
    return sl || null;
  }
  function adHTML(sl, n) {
    var it = sl.items[(n || 0) % sl.items.length], lab = (window.TN_ADS.label || "광고");
    // render:"dragon" = 드래곤 스웨디시 배너(assets/ads/massage/dragon-ad.js, variant·'이 자리 추천 업종' 꼬리표). 못 그리면 아래 일반 카드
    var dg = it.render === "dragon" && window.DragonAd && window.DragonAd.slotHTML(it);
    if (dg) return dg;
    var safe = function (u) { return u && /^https:\/\//.test(u) ? u : null; };
    var link = safe(it.link), img = safe(it.image);
    var inner = '<span class="ad__tag">' + esc(lab) + "</span>" + (img ? '<img class="ad__img" src="' + esc(img) + '" alt="" loading="lazy">' : "") +
      '<span class="ad__txt">' + (it.category ? '<span class="ad__cat">' + esc(it.category) + "</span>" : "") +
      '<b class="ad__t">' + esc(it.title || "여기에 광고하세요") + '</b><small class="ad__s">' + esc(it.subtitle || "광고 문의") + "</small></span>";
    var cls = "ad ad--" + esc(sl.size || "medium") + " ad--t" + (it.theme || 1);
    return link ? '<a class="' + cls + '" href="' + esc(link) + '" target="_blank" rel="noopener sponsored" aria-label="' + esc(lab) + '">' + inner + "</a>"
      : '<div class="' + cls + '" role="note" aria-label="' + esc(lab) + ' 자리">' + inner + "</div>";
  }
  function renderAds() {
    [].forEach.call(document.querySelectorAll("[data-ad-slot]"), function (el) {
      var id = el.getAttribute("data-ad-slot"), sl = adSlot(id);
      if (id === "mid" && !topShown()) sl = null;
      // 메인 큰 배너 바로 아래 = 주요 뉴스 TOP 1 → 그 기사가 민감 기준에 걸리면 배너를 안 보임(기사는 그대로)
      if (id === "mid" && sl && state.data && adRisk(byId((state.data.highlights || [])[0]))) { sl = null; el.setAttribute("data-ad-hidden", "risk"); } else el.removeAttribute("data-ad-hidden");
      el.hidden = !sl; el.innerHTML = sl ? adHTML(sl, 0) : "";
      if (sl && sl.unit) el.setAttribute("data-unit", sl.unit);   // 표준 광고 단위 칸(애드센스 준비, data/ads.json unit)
    });
  }
  /* 기사 사이 광고: 'every' 번째 기사 뒤마다. 광고 정책상 민감한 기사(성범죄·마약·잔혹·도박 등, adRisk) 바로 앞뒤에는 넣지 않고 다음 칸으로 미룸 */
  function withInfeed(cards) {
    var sl = adSlot("infeed"); if (!sl) return cards.join("");
    var every = Math.max(3, sl.every || 5), out = [], k = 0, due = false;
    var risky = function (c) { return !!c && c.indexOf('data-adsafe="0"') >= 0; };
    cards.forEach(function (c, i) {
      out.push(c);
      if ((i + 1) % every === 0) due = true;
      if (due && i < cards.length - 1 && !risky(c) && !risky(cards[i + 1])) { out.push('<div class="ad-slot ad-slot--feed" data-unit="' + esc(sl.unit || "300x250") + '">' + adHTML(sl, k++) + "</div>"); due = false; }
    });
    return out.join("");
  }
  /* 애드센스 정책 위험 기사 표시(광고를 옆에 두지 않음 — 기사는 그대로 보임). 판 데이터에 ad_safe:false 가 있으면 그것을 따름 */
  var AD_RISK = /성매매|매춘|성폭행|성폭력|강간|성추행|성착취|음란|포르노|나체|알몸|마약|필로폰|메스암페타민|야바|코카인|헤로인|대마|살해|살인(?!적)|시신|사체|참수|토막|자살|극단적 선택|총격|도박|카지노|불법 ?촬영/;
  function adRisk(s) {
    if (!s) return false;
    if (window.TNAdSafe) return TNAdSafe.score(s).hide;   // 점수 기준(assets/adsafe.js — 낱말 묶음 + 맥락, 승인함에서 기준·숨긴 목록 확인)
    if (s.ad_safe === false) return true;
    if (s.ad_safe === true) return false;
    return AD_RISK.test([s.headline].concat(s.summary || []).join(" "));   // adsafe.js 를 못 읽었을 때만 예전 낱말 목록
  }

  function feedList() {
    var hl = state.data.highlights || [], st = state.data.stories, list;
    if (state.tab === "feed" || state.tab === "all") {
      list = st.filter(function (s) { return hl.indexOf(s.id) < 0 && (OB2 || state.tab === "all" || inSelection(s)); });   // OB2: 내 피드 = 모든 기사를 지역·관심 순으로 묶음(feedGroups) / 꺼짐: 예전처럼 선택 주제 기사만
    } else {
      list = st.filter(function (s) { return tps(s).all.indexOf(state.tab) >= 0; });
    }
    return L.sort(edId(), list, refTime());
  }
  /* ---------- 내 피드(2026-10-03 2단계 시작 화면): 📌 꼭 봐야 할 뉴스 → 📍 내 지역 → 지역 광고 → 전국·다른 지역(낮은 비중) ----------
   * 꼭 봐야 할 뉴스 = 외국인·비자 기사(주 주제) + 한인 영향 '비자·체류' 기사 — 어느 지역이든 한인 생활에 바로 영향(전국 공통)
   * 내 지역 = 사는 곳 주제(주·보조)가 붙은 기사, 취향 순 / 전국 = 나머지: 내 관심 주제 기사 먼저(취향 순), 그다음 나머지(취향 순) */
  function mine() {
    var d = prof(), r = d.region && T.region(d.region);
    return { region: r, ints: T.cleanInterests(d.interests || []) };
  }
  function interestTopics(ints) { var o = []; ints.forEach(function (i) { var x = T.interest(i); if (x) x.topics.forEach(function (t) { if (o.indexOf(t) < 0) o.push(t); }); }); return o; }
  function feedGroups() {
    var hl = state.data.highlights || [], ed = edId(), ref = refTime(), m = mine();
    var list = state.data.stories.filter(function (s) { return hl.indexOf(s.id) < 0; });
    if (state.impact) list = list.filter(function (s) { return impacts(s).indexOf(state.impact) >= 0; });
    var must = list.filter(function (s) { return tps(s).topic === "visa" || impacts(s).indexOf("비자·체류") >= 0; });
    var rest = list.filter(function (s) { return must.indexOf(s) < 0; });
    var rt = m.region && m.region.topic, reg = rt ? rest.filter(function (s) { return tps(s).all.indexOf(rt) >= 0; }) : [];
    var nat = rest.filter(function (s) { return reg.indexOf(s) < 0; });
    var it = interestTopics(m.ints).concat(selected() || []);
    var natA = nat.filter(function (s) { return tps(s).all.some(function (t) { return it.indexOf(t) >= 0; }); });
    var natB = nat.filter(function (s) { return natA.indexOf(s) < 0; });
    return { m: m, must: L.sort(ed, must, ref), reg: L.sort(ed, reg, ref), nat: L.sort(ed, natA, ref).concat(L.sort(ed, natB, ref)) };
  }
  function mineChipHTML() {
    var m = mine(), ints = m.ints.map(function (i) { var x = T.interest(i); return x.emoji + esc(x.label); });
    var txt = m.region ? (m.region.id === "other" ? "🧳 " + esc(m.region.label) : "📍" + esc(m.region.label)) : "📍 사는 곳 고르기";
    if (ints.length) txt += ' <span class="sep">·</span> ' + ints.slice(0, 2).join(" ") + (ints.length > 2 ? " +" + (ints.length - 2) : "");
    return '<p class="mine"><span class="mine__l">내 피드</span><button type="button" class="mine__chip" data-ob-edit aria-label="내 피드 바꾸기(사는 곳·관심)">' + txt + ' <span class="ed" aria-hidden="true">✏️</span></button></p>';
  }
  function renderMyFeed(imp) {
    var g = feedGroups(), m = g.m, n = g.must.length + g.reg.length + g.nat.length;
    $("feedTitleText").textContent = "⭐ 내 피드";
    $("feedCount").textContent = n + "건" + (state.impact ? " · '" + state.impact + "' 영향만" : " (주요 뉴스 제외)") + (L.hasTaste() ? " · 내 취향 반영 순서" : "");
    var html = mineChipHTML() + imp;
    if (!n) { $("feed").innerHTML = html + '<div class="empty">이 판에는 보여 드릴 기사가 없어요. ☰ 메뉴의 \'전체 보기\'를 눌러 보세요.</div>'; return; }
    if (g.must.length) html += '<div class="pin pin--must" aria-label="꼭 봐야 할 뉴스"><p class="pin__h">📌 꼭 봐야 할 뉴스 <small>모든 지역 공통 · 외국인·비자</small></p>' + g.must.map(cardHTML).join("") + "</div>";
    if (m.region && m.region.topic) {
      html += '<section class="fsec fsec--region" aria-label="' + esc(m.region.full) + ' 뉴스"><h3 class="fsec__h">' + m.region.emoji + " " + esc(m.region.full) + ' 뉴스 <em>' + g.reg.length + "건</em></h3>" +
        (g.reg.length ? g.reg.map(cardHTML).join("") : '<div class="empty empty--sm">이 판에는 ' + esc(m.region.full) + " 기사가 없어요. 아래 전국 소식을 보세요.</div>") + "</section>";
    }
    var ra = m.region && adSlot("region-" + m.region.id);
    if (ra && (adRisk(g.reg[g.reg.length - 1]) || adRisk(g.nat[0]))) ra = null;   // 바로 앞뒤 기사가 민감 기준에 걸리면 지역 광고 안 보임
    if (ra) html += '<div class="ad-slot ad-slot--region" data-region-ad="' + esc(m.region.id) + '">' + adHTML(ra, 0) + "</div>";
    if (g.nat.length) {
      var show = Math.min(g.nat.length, NAT_STEPS[state.natStep] || g.nat.length), more = g.nat.length - show;
      var nxt = Math.min(g.nat.length, NAT_STEPS[state.natStep + 1] || g.nat.length) - show;
      html += '<section class="fsec fsec--nat" aria-label="전국·다른 지역 뉴스"><h3 class="fsec__h">🇹🇭 ' + (m.region && m.region.topic ? "전국·다른 지역" : "전국") + ' 뉴스 <em>' + g.nat.length + "건</em></h3>" +
        withInfeed(g.nat.slice(0, show).map(cardHTML)) +
        (g.nat.length > NAT_STEPS[0] ? '<button type="button" class="more-btn" data-nat-more aria-expanded="' + !more + '">' + (more ? "펼치기 (" + nxt + "건 더) ▾" : "접기 ▴") + "</button>" : "") + "</section>";
    }
    $("feed").innerHTML = html;
  }
  function renderFeed() {
    var list = feedList(), tab = state.tab;
    var title = tab === "feed" ? "⭐ 내 피드" : tab === "all" ? "전체 뉴스" : topicOf(tab).emoji + " " + topicOf(tab).label;
    $("feedTitleText").textContent = title;
    $("feedCount").textContent = list.length + "건" + (topShown() ? " (주요 뉴스 제외)" : "") + (L.hasTaste() ? " · 내 취향 반영 순서" : "");
    var sel = selected(), intro = "";
    if (tab === "feed") {
      intro = sel ? '<p class="feed-intro">내 주제: ' + sel.map(function (k) { var t = topicOf(k); return '<span class="mini" style="--tc:' + t.color + '">' + t.emoji + " " + esc(t.label) + "</span>"; }).join("") +
        ' <button type="button" class="linkbtn" data-open-settings>바꾸기</button></p>'
        : '<p class="feed-intro feed-intro--cta">지금은 모든 주제를 보여 드려요. <button type="button" class="linkbtn" data-open-settings>🧩 관심 주제 고르기</button></p>';
    }
    var empty = tab === "feed" ? "이 판에는 내 주제 기사가 없어요. ☰ 메뉴의 '전체 보기'를 눌러 보세요."
      : tab === "all" ? "이 판에는 아직 기사가 없어요." : "이 판에는 " + topicOf(tab).label + " 기사가 없어요. ☰ 메뉴에서 다른 주제를 골라 보세요.";
    // 한인 영향도 필터 칩(이 판에 impact 데이터가 있을 때만) — 누르면 그 영향 태그가 있는 기사만
    var cnt = {}, any = false;
    list.forEach(function (s) { impacts(s).forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; any = true; }); });
    if (state.impact && !cnt[state.impact]) state.impact = null;
    var imp = any ? '<div class="impf" role="group" aria-label="한인 영향도로 골라 보기"><span class="impf__l">한인 영향</span>' +
      '<button type="button" class="impf__c" data-imp="" aria-pressed="' + !state.impact + '">전체</button>' +
      IMPACT.filter(function (m) { return cnt[m.k]; }).map(function (m) {
        return '<button type="button" class="impf__c" data-imp="' + esc(m.k) + '" style="--ic:' + m.c + '" aria-pressed="' + (state.impact === m.k) + '"><span aria-hidden="true">' + m.e + "</span>" + esc(m.k) + " <small>" + cnt[m.k] + "</small></button>";
      }).join("") + "</div>" : "";
    if (tab === "feed" && OB2) { renderMyFeed(imp); return; }
    if (state.impact) {
      list = list.filter(function (s) { return impacts(s).indexOf(state.impact) >= 0; });
      $("feedCount").textContent = list.length + "건 · '" + state.impact + "' 영향만";
    }
    // 📌 비자 소식: 외국인·비자(주 주제) 기사는 피드 맨 위에 고정(이 판에 있을 때만, 외국인·비자 탭 자체에선 안 함)
    var pin = [];
    if (tab !== "visa") { pin = list.filter(function (s) { return tps(s).topic === "visa"; }); list = list.filter(function (s) { return pin.indexOf(s) < 0; }); }
    var pinHTML = pin.length ? '<div class="pin" aria-label="비자 소식 고정"><p class="pin__h">📌 비자 소식 <small>외국인·비자 기사를 맨 위에 모았어요</small></p>' + pin.map(cardHTML).join("") + "</div>" : "";
    $("feed").innerHTML = intro + imp + ((pin.length || list.length) ? pinHTML + withInfeed(list.map(cardHTML)) : '<div class="empty">' + esc(empty) + "</div>");
  }

  function renderSide() {
    var c = topicCounts(), max = 0;
    T.TOPICS.forEach(function (k) { max = Math.max(max, c[k.id] || 0); });
    $("catStats").innerHTML = T.TOPICS.map(function (k) {
      var n = c[k.id] || 0;
      return '<li><span class="lbl" data-tab="' + k.id + '">' + k.emoji + " " + esc(k.label) + '</span><span class="bar"><i style="width:' + (max ? n / max * 100 : 0) + "%;background:" + k.color + '"></i></span><b>' + n + "</b></li>";
    }).join("");
    var srcs = {};
    state.data.stories.forEach(function (s) { srcs[s.source.replace(/\s*\(.*\)$/, "")] = 1; (s.related || []).forEach(function (r) { srcs[r.source.replace(/\s*\(.*\)$/, "")] = 1; }); });
    $("srcList").innerHTML = Object.keys(srcs).sort().map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  }

  /* ---------- 인터랙션 ---------- */
  function setTab(tab, keepScroll) {
    state.tab = tab; state.natStep = 0;
    Drawer.close(true);
    renderAll();
    if (!keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleCard(card, force) {
    var open = force != null ? force : !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    card.querySelector(".card__head").setAttribute("aria-expanded", String(open));
    card.querySelector(".more__t").textContent = open ? "접기" : "자세히";
    if (open && window.TNSocial && window.TNSocial.mountComments) { var c = card.querySelector("[data-cmts]"); if (c) window.TNSocial.mountComments(c, edId(), byId(card.id)); }
  }
  function openStory(id, fromHash) {
    var s = byId(id); if (!s) return;
    if (!document.getElementById(id)) {
      // 주요 뉴스로 빠졌거나 내 주제 밖 기사 → 그 기사의 주 주제 탭으로
      state.tab = tps(s).topic; renderAll();
    }
    var card = document.getElementById(id);
    if (!card) return;
    toggleCard(card, true);
    var y = card.getBoundingClientRect().top + window.pageYOffset - (document.querySelector(".masthead").offsetHeight + 12);
    window.scrollTo({ top: y, behavior: fromHash ? "auto" : "smooth" });
  }

  var toastTimer;
  function toast(msg, ms) {
    var el = $("toast"); el.innerHTML = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove("show"); }, ms || 2600);
  }
  function doVote(btn) {
    var s = byId(btn.getAttribute("data-id")); if (!s) return;
    var dir = +btn.getAttribute("data-vote");
    var prev = L.voteOf(edId(), s);
    var now = L.vote(edId(), s, dir);
    // 익명 반응 집계(운영자 통계): 이전 표 취소 → 새 표
    if (window.TNSocial && TNSocial.react) try {
      if (prev && prev !== now) TNSocial.react(edId(), s, prev > 0 ? "u" : "d", -1);
      if (now && now !== prev) TNSocial.react(edId(), s, now > 0 ? "u" : "d", 1);
    } catch (e) {}
    var t = topicOf(tps(s).topic);
    void t;
    toast(now > 0 ? "알겠어요! 비슷한 소식을 위쪽에 더 올려드릴게요"
      : now < 0 ? "알겠어요! 비슷한 소식은 아래로 내릴게요" : "선택을 취소했어요", 2000);
    // 화면 위치는 그대로 둔 채 목록만 다시 정렬
    var y = window.pageYOffset;
    renderTabs(); renderFeed();
    var card = document.getElementById(s.id);
    window.scrollTo(0, y);
    if (card) { card.classList.add("flash"); setTimeout(function () { card.classList.remove("flash"); }, 900); }
  }

  /* ❤️ 하트: 누르면 ❤️ + 토스트, 취향에 🙌 처럼 반영(taste.js heart). 헤더 '❤️ N' 과 ☰ 메뉴 개수도 같이 */
  function doHeart(btn) {
    var s = byId(btn.getAttribute("data-id")); if (!s) return;
    var on = L.heart(edId(), s);
    toast(on ? "❤️ 다음 판부터 이런 뉴스 더 보여드릴게요" : "하트를 취소했어요", 2200);
    var y = window.pageYOffset;
    renderTabs(); renderFeed(); heartCount();
    window.scrollTo(0, y);
    var nb = document.querySelector('#' + CSS.escape(s.id) + ' [data-heart]'); if (nb) { nb.classList.add("pop"); nb.focus({ preventScroll: true }); }
    if (window.TNSocial && TNSocial.react) try { TNSocial.react(edId(), s, "h", on ? 1 : -1); } catch (e) {}
  }
  function heartCount() {
    var n = L.hearts().length, b = $("heartBtn");
    if (b) { b.innerHTML = '<span aria-hidden="true">' + (n ? "❤️" : "🤍") + '</span><b>' + n + "</b>"; b.setAttribute("aria-label", "내가 하트한 기사 " + n + "개 보기"); }
    var d = $("drHeartN"); if (d) d.textContent = n + "개";
  }
  S.subscribe(function () { heartCount(); });

  document.addEventListener("click", function (e) {
    var el;
    if ((el = e.target.closest("[data-heart]"))) { doHeart(el); return; }
    if ((el = e.target.closest("[data-vote]"))) { doVote(el); return; }
    if ((el = e.target.closest("[data-korea-item]"))) { var ki = +el.getAttribute("data-korea-item"); KOREA.open = KOREA.open === ki ? -1 : ki; renderKorea(); var nb = document.querySelector('[data-korea-item="' + ki + '"]'); if (nb) nb.focus({ preventScroll: true }); return; }
    if ((el = e.target.closest("[data-korea-toggle]"))) { S.update(function (d) { d.ui.koreaClosed = !d.ui.koreaClosed; }); renderKorea(); return; }
    if ((el = e.target.closest("[data-korea-more]"))) {   // 3 → 5 → 10 → 접기(3)
      var kn = $("koreaList") ? $("koreaList").children.length : 0;
      if (Math.min(kn, KOREA.STEPS[KOREA.step]) >= kn || KOREA.step >= KOREA.STEPS.length - 1) { KOREA.step = 0; if (KOREA.open >= KOREA.STEPS[0]) KOREA.open = -1; } else KOREA.step++;
      renderKorea(); if (!KOREA.step) $("korea").scrollIntoView({ block: "nearest" }); return;
    }
    if ((el = e.target.closest("[data-imp]"))) { var ik = el.getAttribute("data-imp") || null; state.impact = state.impact === ik ? null : ik; var fy = window.pageYOffset; renderFeed(); window.scrollTo(0, fy); return; }
    if ((el = e.target.closest("[data-dq]"))) { toggleTalk(el); return; }
    if ((el = e.target.closest("[data-also]"))) { var ap = $("also-" + el.getAttribute("data-also")); if (ap) togglePanel(el, ap); return; }
    if ((el = e.target.closest("[data-issue]"))) {
      var ts = byId(el.getAttribute("data-sid")), tp = $("tl-" + el.getAttribute("data-sid"));
      if (ts && tp) togglePanel(el, tp, function () { return timelineHTML(ts); });
      return;
    }
    if ((el = e.target.closest("[data-quick-nearby]"))) {
      Drawer.close(true);
      if (window.TNNearby) { var cfg = (TNNearby.config && TNNearby.config.categories) || [], want = el.getAttribute("data-quick-nearby"); var id = (cfg.filter(function (c) { return c.id === want; })[0] || cfg[0] || {}).id; if (id) TNNearby.open(id, true); }
      return;
    }
    if ((el = e.target.closest("[data-open-settings]"))) { Drawer.close(true); Onb.open("topics", true); return; }
    if ((el = e.target.closest("[data-ob-edit]"))) { Drawer.close(true); Onb.open("region", true); return; }
    if ((el = e.target.closest("[data-nat-more]"))) {
      var g0 = feedGroups(), sh0 = Math.min(g0.nat.length, NAT_STEPS[state.natStep] || g0.nat.length);
      if (sh0 >= g0.nat.length) { state.natStep = 0; renderFeed(); var ns = document.querySelector(".fsec--nat"); if (ns) ns.scrollIntoView({ block: "start" }); }
      else { state.natStep++; var fy0 = window.pageYOffset; renderFeed(); window.scrollTo(0, fy0); }
      return;
    }
    if ((el = e.target.closest("[data-tab]"))) { setTab(el.getAttribute("data-tab")); return; }
    if ((el = e.target.closest("[data-open]"))) { openStory(el.getAttribute("data-open")); history.replaceState(null, "", location.search + "#" + el.getAttribute("data-open")); return; }
    if ((el = e.target.closest(".card__head"))) toggleCard(el.parentNode);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("article[data-open]")) { e.preventDefault(); e.target.click(); }
    if (e.key === "Escape" && !$("sheet").hidden) Onb.close();
  });
  window.addEventListener("scroll", function () { $("toTop").classList.toggle("show", window.pageYOffset > 600); }, { passive: true });
  $("toTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 온보딩 · 내 주제 설정 ---------- */
  var Onb = (function () {
    var sheet = $("sheet"), pick = [], persona = null, settingsMode = false, lastFocus = null, reg = null, ints = [];
    /* 2단계 시작 화면(2026-10-03 운영자 승인 시안 /workspace/mockups/residence): ① 어디 사세요?(하나) ② 무엇에 관심 있으세요?(여러 개) */
    function obTop(n) {
      var fl = document.querySelector(".brand__flags");
      return '<div class="ob__top"><span class="ob__brand"><span class="ob__flags" aria-hidden="true">' + (fl ? fl.innerHTML : "") + "</span> 태국 뉴스 한눈에</span>" +
        (settingsMode ? '<button type="button" class="ob__x" data-close aria-label="닫기">✕</button>' : "") + '<span class="ob__step">' + n + ' / 2</span></div>' +
        '<div class="ob__bar" role="progressbar" aria-valuemin="1" aria-valuemax="2" aria-valuenow="' + n + '" aria-label="2단계 중 ' + n + '단계"><i class="on"></i><i' + (n === 2 ? ' class="on"' : "") + "></i></div>";
    }
    function stepRegion() {
      return '<div class="ob">' + obTop(1) + '<div class="ob__body"><h2 class="ob__q" id="sheetTitle">📍 어디 사세요?</h2>' +
        '<p class="ob__sub">사는 곳 소식을 <b>맨 위에</b> 보여 드려요. <b>하나만</b> 골라 주세요.</p>' +
        '<div class="opts" role="radiogroup" aria-label="사는 곳">' + T.REGIONS.map(function (r) {
          return '<button type="button" class="opt" role="radio" data-region="' + r.id + '" aria-checked="' + (reg === r.id) + '"><span class="opt__e" aria-hidden="true">' + r.emoji + '</span>' +
            '<span class="opt__t"><b>' + esc(r.label) + (r.sub ? " <span>" + esc(r.sub) + "</span>" : "") + "</b><small>" + esc(r.hint) + '</small></span><span class="opt__r" aria-hidden="true"></span></button>';
        }).join("") + '</div><p class="pick-msg" id="pickMsg" role="status" aria-live="polite"></p></div>' +
        '<div class="ob__foot"><button type="button" class="cta" data-ob-next>다음 <small aria-hidden="true">→</small></button>' +
        (settingsMode ? '<button type="button" class="skip" data-close>닫기</button>' : '<button type="button" class="skip" data-skip>나중에 고를게요</button>') + "</div></div>";
    }
    function stepInterests() {
      var r = T.region(reg);
      return '<div class="ob">' + obTop(2) + '<div class="ob__body">' + (r ? '<span class="picked">📍 사는 곳 <b>' + esc(r.full) + "</b></span>" : "") +
        '<h2 class="ob__q" id="sheetTitle">🙋 무엇에 관심 있으세요?<small>(여러 개 선택)</small></h2><p class="ob__sub">고른 주제의 기사를 <b>먼저</b> 보여 드려요.</p>' +
        '<div class="grid2" role="group" aria-label="관심">' + T.INTERESTS.map(function (x) {
          return '<button type="button" class="int" data-int="' + x.id + '" aria-pressed="' + (ints.indexOf(x.id) >= 0) + '" style="--tc:' + x.color + '"><span class="int__c" aria-hidden="true">✓</span><span class="int__e" aria-hidden="true">' + x.emoji + '</span>' +
            '<span class="int__t">' + esc(x.label) + '</span><span class="int__s">' + esc(x.hint) + "</span></button>";
        }).join("") + '</div><p class="note">💡 <span>언제든 <span class="mi">☰ 메뉴</span>에서 <b>바꿀 수 있어요</b></span></p><p class="pick-msg" id="pickMsg" role="status" aria-live="polite"></p></div>' +
        '<div class="ob__foot"><p class="ob__cnt" id="intCnt"><b>' + ints.length + "개</b> 선택함</p>" +
        '<button type="button" class="cta" data-ob-done>완료 <small aria-hidden="true">✓</small></button><button type="button" class="skip" data-ob-prev>← 이전</button></div></div>';
    }
    function personaHTML(compact) {
      return T.PERSONAS.map(function (p) {
        return '<button type="button" class="persona' + (compact ? " persona--sm" : "") + '" data-persona="' + p.id + '" aria-pressed="' + (persona === p.id) + '">' +
          '<span class="persona__e" aria-hidden="true">' + p.emoji + '</span><span class="persona__t"><b>' + esc(p.label) + "</b>" + (compact ? "" : "<small>" + esc(p.desc) + "</small>") + "</span></button>";
      }).join("");
    }
    function stepPersona() {
      return '<div class="sheet__step">' +
        '<p class="sheet__kicker">태국 뉴스 한눈에 👋 태국 현지 뉴스를 한국어로</p>' +
        '<h2 id="sheetTitle">어떤 분이세요?</h2>' +
        '<p class="sheet__sub">고르시면 관심 주제 5개를 먼저 골라 드려요. 언제든 <b>🧩 내 주제</b>에서 바꿀 수 있어요.</p>' +
        '<div class="persona-grid">' + personaHTML(false) + "</div>" +
        '<button type="button" class="linkbtn sheet__skip" data-skip>건너뛰고 모든 뉴스 보기 ›</button></div>';
    }
    function stepTopics() {
      var p = persona && T.PERSONAS.filter(function (x) { return x.id === persona; })[0];
      return '<div class="sheet__step">' +
        (settingsMode ? '<button type="button" class="sheet__x" data-close aria-label="닫기">✕</button>' : '<button type="button" class="linkbtn sheet__back" data-back>‹ 다시 고르기</button>') +
        '<h2 id="sheetTitle">🧩 내 주제</h2>' +
        '<p class="sheet__sub">' + (p ? "<b>" + esc(p.emoji + " " + p.label) + "</b> 기본 주제 5개를 골라 뒀어요. " : "") + "끄거나 더 고를 수 있어요(<b>최대 " + MAX + "개</b>).</p>" +
        (settingsMode ? '<div class="persona-row"><span>빠르게 고르기</span>' + personaHTML(true) + "</div>" : "") +
        '<div class="topic-grid" id="topicGrid">' + topicGridHTML() + "</div>" +
        '<p class="pick-msg" id="pickMsg" role="status" aria-live="polite"></p>' +
        '<div class="sheet__actions"><span class="pick-count" id="pickCount"></span><button type="button" class="btn btn--primary" data-save>이대로 보기</button></div>' +
        (settingsMode ? '<div class="sheet__settings">' +
          '<button type="button" class="setbtn" data-reset-taste>↺ 내 취향 초기화 <small>👍👎로 배운 순서를 지워요</small></button>' +
          '<button type="button" class="setbtn" data-show-all>모든 주제 보기 <small>주제 선택 없이 전체를 내 피드로</small></button>' +
          (OB2 ? '<button type="button" class="setbtn" data-restart>📍 사는 곳·관심 다시 고르기</button>' : '<button type="button" class="setbtn" data-restart>처음 질문(어떤 분이세요?) 다시 보기</button>') +
          (Install.available() ? '<button type="button" class="setbtn" data-install>📲 홈 화면에 추가</button>' : "") +
          '<div class="acct-box" id="acctBox"></div>' +
          '<p class="sheet__note" id="storeNote">' + (window.TNSocial && window.TNSocial.signedIn() ? "구글 계정에 저장돼 다른 기기에서도 이어져요." : "설정과 취향은 이 기기(브라우저)에만 저장돼요. 구글로 로그인하면 다른 기기에서도 이어져요(선택).") + "</p></div>" : "") +
        "</div>";
    }
    function topicGridHTML() {
      return T.TOPICS.map(function (t) {
        var on = pick.indexOf(t.id) >= 0;
        return '<button type="button" class="tpick" data-pick="' + t.id + '" aria-pressed="' + on + '" style="--tc:' + t.color + '">' +
          '<span class="tpick__e" aria-hidden="true">' + t.emoji + '</span><span class="tpick__t"><b>' + esc(t.label) + "</b><small>" + esc(t.hint) + '</small></span><span class="tpick__c" aria-hidden="true">' + (on ? "✓" : "+") + "</span></button>";
      }).join("");
    }
    function updCount() {
      var c = $("pickCount"); if (c) c.innerHTML = "<b>" + pick.length + "</b> / " + MAX + " 선택";
      var g = $("topicGrid"); if (g) g.innerHTML = topicGridHTML();
    }
    function msg(t, warn) { var m = $("pickMsg"); if (!m) return; m.textContent = t; m.classList.toggle("warn", !!warn); if (warn) { m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake"); } }
    function show(step) {
      var ob = step === "region" || step === "interests";
      sheet.classList.toggle("sheet--ob", ob);
      sheet.innerHTML = '<div class="sheet__panel" role="document">' + (step === "region" ? stepRegion() : step === "interests" ? stepInterests() : step === "persona" ? stepPersona() : stepTopics()) + "</div>";
      sheet.setAttribute("data-step", step);
      updCount();
      if (window.TNSocial && $("acctBox")) window.TNSocial.renderAccountBox($("acctBox"));
      var f = sheet.querySelector("button"); if (f) f.focus({ preventScroll: true });
    }
    function open(step, settings) {
      settingsMode = !!settings; lastFocus = document.activeElement;
      var d = prof();
      persona = d.persona; pick = (selected() || []).slice();
      reg = d.region || null; ints = T.cleanInterests(d.interests || []);
      if (sheet.hidden) Back.push("sh");
      sheet.hidden = false; document.body.classList.add("sheet-open");
      show(step);
    }
    function close(fromPop) {
      if (fromPop !== true && !sheet.hidden) Back.pop("sh");
      sheet.hidden = true; document.body.classList.remove("sheet-open"); sheet.innerHTML = ""; sheet.classList.remove("sheet--ob");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      Install.maybeShow();
    }
    window.addEventListener("popstate", function () { if (!sheet.hidden && !Back.is("sh")) close(true); });
    function finish(topics, per) {
      S.update(function (d) { d.onboarded = true; d.topics = topics; d.persona = per; });
      state.tab = "feed";
      close();
      if (state.data) renderAll();
      window.scrollTo(0, 0);
    }
    function finishMine() {
      var r = reg || "other", it = ints.slice();
      S.update(function (d) { d.onboarded = true; d.region = r; d.interests = it; d.persona = T.encodePersona(r, it); d.topics = T.topicsFor(r, it); });
      state.tab = "feed"; state.natStep = 0;
      close();
      if (state.data) renderAll();
      window.scrollTo(0, 0);
      var rr = T.region(r);
      toast("⭐ 내 피드를 " + (rr && rr.topic ? esc(rr.full) + " 소식 먼저로" : "전국 소식 위주로") + " 맞췄어요");
    }
    sheet.addEventListener("click", function (e) {
      var el = e.target;
      if (el === sheet) { if (settingsMode) close(); return; }
      if ((el = e.target.closest("[data-region]"))) {
        reg = el.getAttribute("data-region");
        sheet.querySelectorAll("[data-region]").forEach(function (b) { b.setAttribute("aria-checked", String(b === el)); });
        msg(""); return;
      }
      if (e.target.closest("[data-ob-next]")) { if (!reg) { msg("사는 곳을 하나 골라 주세요 🙂", true); return; } show("interests"); return; }
      if (e.target.closest("[data-ob-prev]")) { show("region"); return; }
      if ((el = e.target.closest("[data-int]"))) {
        var iid = el.getAttribute("data-int"), ii = ints.indexOf(iid);
        if (ii >= 0) ints.splice(ii, 1); else ints.push(iid);
        el.setAttribute("aria-pressed", String(ii < 0));
        var c = $("intCnt"); if (c) c.innerHTML = "<b>" + ints.length + "개</b> 선택함"; msg(""); return;
      }
      if (e.target.closest("[data-ob-done]")) { if (!ints.length) { msg("관심을 1개 이상 골라 주세요 🙂", true); return; } finishMine(); return; }
      if ((el = e.target.closest("[data-persona]"))) {
        persona = el.getAttribute("data-persona");
        pick = T.PERSONAS.filter(function (p) { return p.id === persona; })[0].topics.slice();
        if (settingsMode) { sheet.querySelectorAll("[data-persona]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-persona") === persona)); }); updCount(); msg("기본 주제 5개로 바꿨어요. 3개까지 더 고를 수 있어요."); }
        else show("topics");
        return;
      }
      if ((el = e.target.closest("[data-pick]"))) {
        var id = el.getAttribute("data-pick"), i = pick.indexOf(id);
        if (i >= 0) { pick.splice(i, 1); updCount(); msg(""); }
        else if (pick.length >= MAX) { msg("주제는 최대 " + MAX + "개까지 고를 수 있어요 🙂 다른 주제를 하나 끈 다음 골라 주세요.", true); }
        else { pick.push(id); updCount(); msg(pick.length === MAX ? "최대 " + MAX + "개를 모두 골랐어요." : ""); }
        var nb = sheet.querySelector('[data-pick="' + id + '"]'); if (nb) nb.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest("[data-save]")) {
        if (!pick.length) { msg("주제를 1개 이상 골라 주세요. 모두 보려면 '모든 주제 보기'를 누르세요.", true); return; }
        // 주제 순서는 화면(주제 목록) 순서로 정리
        var ordered = T.TOPICS.map(function (t) { return t.id; }).filter(function (x) { return pick.indexOf(x) >= 0; });
        finish(ordered, persona); toast("🧩 내 주제 " + ordered.length + "개로 피드를 맞췄어요"); return;
      }
      if (e.target.closest("[data-skip]")) { finish(null, null); return; }
      if (e.target.closest("[data-show-all]")) { finish(null, persona); toast("모든 주제를 내 피드에 보여 드려요"); return; }
      if (e.target.closest("[data-back]")) { show("persona"); return; }
      if (e.target.closest("[data-restart]")) { if (OB2) show("region"); else { settingsMode = false; show("persona"); } return; }
      if (e.target.closest("[data-close]")) { close(); return; }
      if (e.target.closest("[data-install]")) { close(); Install.prompt(); return; }
      if (e.target.closest("[data-reset-taste]")) {
        if (window.confirm("👍👎로 배운 내 취향을 모두 지울까요? (주제 선택은 그대로 둡니다)")) {
          L.reset(); msg("내 취향을 초기화했어요. 기사는 다시 최신순으로 보여요."); if (state.data) renderAll();
        }
      }
    });
    return { open: open, close: close, settings: function () { return settingsMode; } };
  })();

  /* ---------- 홈 화면에 추가(PWA) ----------
   * 안드로이드(Chrome·삼성 인터넷): beforeinstallprompt 를 잡아 안내 바 [추가하기]/[나중에]
   * iOS Safari: 설치 API 가 없음 → 2단계 그림 안내(① 아래 공유 버튼 ② '홈 화면에 추가')
   * '나중에'/닫기 = 7일 동안 다시 안 보임(이 기기 ui.installHintUntil). 홈 화면 앱(standalone)에서는 절대 안 보임 */
  var Install = (function () {
    var deferred = null, WEEK = 7 * 24 * 3600 * 1000;
    var ua = navigator.userAgent || "";
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios|kakaotalk|naver|line\/|instagram|fban|fbav/i.test(ua);
    function standalone() { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; maybeShow(); });
    window.addEventListener("appinstalled", function () { deferred = null; hide(); S.update(function (d) { d.ui.installed = true; }); toast("📲 홈 화면에 추가했어요"); });
    function hide() { var el = $("installHint"); el.hidden = true; el.className = "install-hint"; }
    function dismissed() {
      var ui = prof().ui || {};
      if (ui.installHint === "dismissed") return true;          // 예전(영구) 닫기 기록은 그대로 존중
      return !!(ui.installHintUntil && Date.now() < ui.installHintUntil);
    }
    function snooze() { S.update(function (d) { d.ui.installHintUntil = Date.now() + WEEK; }); hide(); }
    function available() { return !standalone() && (!!deferred || isIOS); }
    function maybeShow(force) {
      var el = $("installHint");
      if (standalone()) { hide(); return; }
      if (!force && (dismissed() || !prof().onboarded || !$("sheet").hidden)) return;
      if (deferred) {
        el.className = "install-hint";
        el.innerHTML = '<span class="ih__icon" aria-hidden="true"><img src="assets/icons/icon-192.png" alt="" width="36" height="36"></span>' +
          '<span class="ih__t"><b>홈 화면에 추가할까요?</b><small>앱처럼 편하게 볼 수 있어요</small></span>' +
          '<span class="ih__btns"><button type="button" class="btn btn--primary btn--sm" data-ih-install>추가하기</button><button type="button" class="ih__later" data-ih-close>나중에</button></span>';
        el.hidden = false;
      } else if (isIOS) {
        el.className = "install-hint install-hint--ios";
        el.innerHTML = '<div class="ihi__head"><b>📲 홈 화면에 추가하면 앱처럼 열려요</b><button type="button" class="ih__x" data-ih-close aria-label="닫기">닫기</button></div>' +
          (isSafari ? "" : '<p class="ihi__warn">먼저 이 페이지를 <b>Safari</b>에서 열어 주세요.</p>') +
          '<ol class="ihi__steps">' +
          '<li><span class="ihi__n">1</span><span class="ihi__ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round"/></svg></span><span>화면 아래 도구 막대의 <b>공유</b> 버튼을 누르세요</span></li>' +
          '<li><span class="ihi__n">2</span><span class="ihi__ic ihi__ic--add" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="#1c1c1e" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="#1c1c1e" stroke-width="1.8" stroke-linecap="round"/></svg></span><span>목록을 올려 <b>홈 화면에 추가</b>를 누르세요</span></li>' +
          "</ol>" + '<div class="ihi__arrow" aria-hidden="true">⬇︎</div>';
        el.hidden = false;
      }
    }
    function prompt() {
      if (deferred) { deferred.prompt(); deferred.userChoice.then(function (c) { deferred = null; hide(); if (c && c.outcome !== "accepted") snooze(); }); }
      else if (isIOS) { maybeShow(true); }
    }
    $("installHint").addEventListener("click", function (e) {
      if (e.target.closest("[data-ih-install]")) prompt();
      if (e.target.closest("[data-ih-close]")) snooze();
    });
    return { maybeShow: maybeShow, prompt: prompt, available: available };
  })();

  /* ---------- 시작 ---------- */
  // index: { latest, editions:[{id,date,edition,label,generated}], dates:[id...] } (최신 판이 맨 앞)
  var NI = window.NEWS_INDEX || {};
  var EDS = NI.editions || (NI.dates || []).map(function (d) { return { id: d, date: d.slice(0, 10), label: d }; });
  function resolve(p) {
    if (!p) return EDS[0];
    for (var i = 0; i < EDS.length; i++) if (EDS[i].id === p) return EDS[i];
    // 예전 링크(?date=YYYY-MM-DD) → 그 날짜의 가장 최신 판
    for (var j = 0; j < EDS.length; j++) if (EDS[j].date === p) return EDS[j];
    return { id: p, date: p.slice(0, 10), label: p, missing: true };
  }
  var cur = resolve(getParam("e") || getParam("ed") || getParam("date"));
  state.edition = cur;
  var tabParam = getParam("tab");
  if (tabParam && (tabParam === "all" || tabParam === "feed" || T.get(tabParam))) state.tab = T.canon(tabParam);   // ?tab=pattaya 같은 옛 주소도 동부로
  if (EDS.length > 1) {
    $("datepickWrap").hidden = false;
    document.body.classList.add("has-editions");
    $("datepick").innerHTML = EDS.map(function (e, i) {
      return '<option value="' + esc(e.id) + '"' + (cur && e.id === cur.id ? " selected" : "") + ">" + esc(e.label) + (i === 0 && innerWidth > 640 ? " (최신)" : "") + "</option>";   // 휴대폰은 칸이 좁아 '(최신)' 생략(잘림 방지)
    }).join("");
    $("datepick").addEventListener("change", function () { location.href = location.pathname + "?date=" + encodeURIComponent(this.value); });
  }
  if (cur && EDS.length && cur.id !== EDS[0].id && !cur.missing) {
    var n = $("editionNote");
    n.hidden = false;
    n.innerHTML = "지금 <b>" + esc(cur.label) + "</b>을(를) 보고 있습니다. " +
      '<a href="' + location.pathname + '?date=' + encodeURIComponent(EDS[0].id) + '">최신 ' + esc(EDS[0].label) + " 보기 →</a>";
  }
  loadKorea();
  loadIssues();
  // 화면으로 돌아왔을 때 10분 넘었으면 한국 뉴스 다시 받기(2시간마다 갱신됨)
  document.addEventListener("visibilitychange", function () { if (!document.hidden && Date.now() - KOREA.at > 10 * 60 * 1000) loadKorea(); });
  if (cur) loadDate(cur.id); else $("feed").innerHTML = loadFail("뉴스 목록을 불러오지 못했어요.");
  // 처음 방문: '어떤 분이세요?' (기사 링크(#id)로 들어온 경우에도 먼저 보여 주되 건너뛰기 가능)
  if (!prof().onboarded) Onb.open(OB2 ? "region" : "persona", false); else Install.maybeShow();   // 첫 방문만 2단계 시작 화면(옛 사용자는 prefs.js 가 조용히 옮김)

  // 서비스 워커(오프라인 읽기·홈 화면 앱). file:// 에서는 쓰지 않음
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (e) { console.warn("SW 등록 실패", e); });
    });
  }
  // 로그인 병합·다른 기기 변경(src="remote") → 다시 그리기. 첫 질문 창이 떠 있는데 계정에 설정이 있으면 닫기
  S.subscribe(function (d, src) {
    if (src !== "remote") return;
    if (d.onboarded && !$("sheet").hidden && /^(persona|region|interests)$/.test($("sheet").getAttribute("data-step")) && !Onb.settings()) Onb.close();
    if (state.data) { L.backfill(edId(), state.data.stories); renderAll(); }
  });
  window.TNApp = { state: state, openSettings: function () { Onb.open("topics", true); }, toast: toast, edId: function () { return state.data ? edId() : null; },
    rerender: function () { if (state.data) renderAll(); },
    openStory: function (id) { openStory(id); }, closeDrawer: function () { Drawer.close(true); }, heartCount: heartCount,
    topicOf: function (id) { return topicOf(id); } };
  heartCount();
})();
