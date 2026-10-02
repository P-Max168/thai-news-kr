/* 태국 뉴스 한눈에 — 정적 렌더러 (빌드 불필요, file:// 지원)
 * 의존: assets/topics.js(주제·페르소나·옛 판 매핑) → prefs.js(저장소) → taste.js(👍👎 학습) → 이 파일
 */
(function () {
  "use strict";
  var T = window.TNTopics, S = window.TNStore, L = window.TNTaste;
  var TZ = "Asia/Bangkok";
  var MAX = T.MAX_TOPICS;
  var DECO = { pattaya: "〰", sriracha: "⚓", bangkok: "曼", poleco: "政", society: "社", visa: "✈", life: "฿", travel: "旅", ent: "#", weather: "☂" };
  // tab: "feed"(내 피드) | "all"(전체 보기) | 주제 id
  var state = { data: null, tab: "feed", edition: null };
  var $ = function (id) { return document.getElementById(id); };

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
    return '<time datetime="' + esc(iso) + '" title="방콕 시간 기준">' + esc(fmtTime(iso)) + " (BKK)" + (r ? " · " + r : "") + "</time>";
  }
  function metaHTML(s) {
    return '<div class="meta"><span class="src">' + esc(s.source) + '</span><span class="dot">' + timeHTML(s.published) + "</span></div>";
  }

  /* ---------- 사용자 설정 ---------- */
  function prof() { return S.get(); }
  function selected() { var t = prof().topics; return (t && t.length) ? t.filter(function (x) { return T.get(x); }) : null; }
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
    var sc = document.createElement("script");
    sc.src = "data/" + date + ".js";
    sc.onload = function () { if (window.NEWS_DATA[date]) render(window.NEWS_DATA[date]); else sc.onerror(); };
    sc.onerror = function () {
      $("feed").innerHTML = '<div class="empty">' + esc(date) + " 데이터를 불러오지 못했습니다." +
        (navigator.onLine === false ? "<br>오프라인 상태입니다. 한 번 열어 본 판만 오프라인으로 읽을 수 있어요." : "") + "</div>";
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
    renderAll();
    renderSide();
    if (location.hash.length > 1) openStory(location.hash.slice(1), true);
  }
  function renderAll() { renderTabs(); renderTop(); renderFeed(); placeTrends(); }

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
  function renderTabs() {
    var c = topicCounts(), sel = selected();
    $("tabs").innerHTML = tabList().map(function (k) {
      var label, n, cls = "tab";
      if (k === "feed") { label = "⭐ 내 피드"; n = feedList().length + (state.data.highlights || []).length; }
      else if (k === "all") { label = "전체 보기"; n = state.data.stories.length; }
      else { var t = topicOf(k); label = t.emoji + " " + t.label; n = c[k] || 0; if (sel && sel.indexOf(k) < 0) cls += " tab--temp"; }
      return '<button class="' + cls + '" role="tab" data-tab="' + k + '" aria-selected="' + (state.tab === k) + '">' + esc(label) + '<span class="n">' + (n || "–") + "</span></button>";
    }).join("");
    var cur = $("tabs").querySelector('[aria-selected="true"]');
    if (cur && cur.scrollIntoView) { var p = $("tabs"); var x = cur.offsetLeft - 40; if (x < p.scrollLeft || cur.offsetLeft + cur.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollLeft = Math.max(0, x); }
  }

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
    return '<div class="card__acts" role="group" aria-label="이 기사에 대한 관심">' +
      '<button type="button" class="vote vote--up" data-vote="1" data-id="' + esc(s.id) + '" aria-pressed="' + (v > 0) + '">👍 관심 있음</button>' +
      '<button type="button" class="vote vote--down" data-vote="-1" data-id="' + esc(s.id) + '" aria-pressed="' + (v < 0) + '">👎 관심 없음</button>' +
      (v < 0 ? '<span class="vote-note">비슷한 기사는 아래로 내려요</span>' : v > 0 ? '<span class="vote-note">비슷한 기사를 위로 올려요</span>' : "") + "</div>";
  }

  function cardHTML(s) {
    var tp = tps(s), t = topicOf(tp.topic);
    var chips = '<span class="chip chip--topic" style="--tc:' + t.color + '">' + t.emoji + " " + esc(t.label) + "</span>" +
      tp.secondary.map(function (k) { var x = topicOf(k); return '<span class="chip chip--sec" style="--tc:' + x.color + '">' + esc(x.label) + "</span>"; }).join("");
    if (s.region) chips += '<span class="chip chip--region">📍 ' + esc(s.region) + "</span>";
    var age = refTime() - new Date(s.published).getTime();
    if (tp.all.indexOf("visa") >= 0 || age > 36 * 3600000) chips += '<span class="chip chip--date">📅 ' + esc(fmtDay(s.published)) + "</span>";
    if (s.update) chips += '<span class="chip chip--new">후속</span>';
    var paras = s.summary.map(function (p) { return '<p class="para">' + esc(p) + "</p>"; }).join("");
    var ctx = s.context ? '<div class="context"><b>💡 배경 설명</b>' + esc(s.context) + "</div>" : "";
    var upd = s.update ? '<div class="update"><b>🆕 이전 판 이후 새로 나온 내용</b>' + esc(s.update) + "</div>" : "";
    var rel = (s.related && s.related.length) ? '<p class="related-label">관련 기사 · 함께 참고한 원문</p><ul class="related">' + s.related.map(function (r) {
      return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener"><span class="rs">' + esc(r.source) + '</span><span class="rt">' + esc(r.title) + "</span> ↗</a></li>";
    }).join("") + "</ul>" : "";
    var tags = (s.tags || []).length ? '<div class="tags">' + s.tags.map(function (x) { return "<span>#" + esc(x) + "</span>"; }).join("") + "</div>" : "";
    var v = L.voteOf(edId(), s);
    return '<article class="card' + (v < 0 ? " is-down" : "") + '" style="--tc:' + t.color + '" data-topic="' + tp.topic + '" id="' + esc(s.id) + '">' +
      '<button class="card__head" aria-expanded="false" aria-controls="body-' + esc(s.id) + '">' +
        '<div class="card__top">' + chips + "</div>" +
        '<h3 class="card__title">' + esc(s.headline) + "</h3>" +
        '<p class="card__lead">' + esc(s.summary[0]) + "</p>" +
        '<div class="card__foot">' + metaHTML(s) + '<span class="more"><span class="more__t">자세히</span> <i>▾</i></span></div>' +
      "</button>" +
      '<div class="card__body" id="body-' + esc(s.id) + '">' + upd + paras + ctx +
        '<div class="origin"><p class="origin__th" lang="th"><small>원문 제목</small>' + esc(s.title_th) + "</p>" +
        '<a class="btn" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.source.replace(/\s*\(.*\)$/, "")) + " 원문 보기 ↗</a>" + rel + tags + "</div>" +
      "</div>" + voteHTML(s) + "</article>";
  }

  function feedList() {
    var hl = state.data.highlights || [], st = state.data.stories, list;
    if (state.tab === "feed" || state.tab === "all") {
      list = st.filter(function (s) { return hl.indexOf(s.id) < 0 && (state.tab === "all" || inSelection(s)); });
    } else {
      list = st.filter(function (s) { return tps(s).all.indexOf(state.tab) >= 0; });
    }
    return L.sort(edId(), list, refTime());
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
    var empty = tab === "feed" ? "이 판에는 내 주제에 해당하는 기사가 없습니다. '전체 보기'를 눌러 보세요."
      : tab === "all" ? "기사가 없습니다." : "이 판에는 " + topicOf(tab).label + " 기사가 없습니다.";
    $("feed").innerHTML = intro + (list.length ? list.map(cardHTML).join("") : '<div class="empty">' + esc(empty) + "</div>");
  }

  function renderSide() {
    var t = state.data.trends;
    if (t && t.items && t.items.length) {
      $("trendWidget").hidden = false;
      $("trendList").innerHTML = t.items.map(function (x, i) {
        // 옛 판: 문자열(원문 태그만) / 10월 2일 저녁판부터: {tag, ko, desc, verified}
        var o = typeof x === "string" ? { tag: x } : x;
        var q = "https://x.com/search?q=" + encodeURIComponent(o.tag);
        var unv = o.verified === false ? '<span class="tr-unv">확인 안 됨</span>' : "";
        return '<li class="' + (i >= 5 ? "tr-more" : "") + '"><div class="tr-body">' +
          (o.ko ? '<b class="tr-ko">' + esc(o.ko) + "</b>" : "") +
          '<a class="tr-tag" lang="th" href="' + q + '" target="_blank" rel="noopener">' + esc(o.tag) + " ↗</a>" +
          (o.desc ? '<span class="tr-desc">' + unv + esc(o.desc) + "</span>" : "") + "</div></li>";
      }).join("");
      var more = $("trendMore");
      more.hidden = t.items.length <= 5;
      more.textContent = "트렌드 " + t.items.length + "개 모두 보기 ▾";
      $("trendWidget").classList.remove("is-expanded");
      $("trendNote").innerHTML = esc(t.note) + '<br>출처: <a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.source) + "</a> · " + esc(fmtTime(t.fetched)) + " (BKK) 수집" +
        (t.filtered != null ? " · 성인·선정적 태그 필터 적용(" + t.filtered + "개 제외)" : "");
    } else { $("trendWidget").hidden = true; }
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
    state.tab = tab;
    renderAll();
    if (!keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleCard(card, force) {
    var open = force != null ? force : !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    card.querySelector(".card__head").setAttribute("aria-expanded", String(open));
    card.querySelector(".more__t").textContent = open ? "접기" : "자세히";
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
  function toast(msg) {
    var el = $("toast"); el.innerHTML = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }
  function doVote(btn) {
    var s = byId(btn.getAttribute("data-id")); if (!s) return;
    var dir = +btn.getAttribute("data-vote");
    var now = L.vote(edId(), s, dir);
    var t = topicOf(tps(s).topic);
    toast(now > 0 ? "👍 <b>" + esc(t.label) + "</b>·비슷한 키워드 기사를 위로 올릴게요"
      : now < 0 ? "👎 비슷한 기사는 아래로 내릴게요 <small>(숨기지는 않아요)</small>" : "표시를 취소했어요");
    // 화면 위치는 그대로 둔 채 목록만 다시 정렬
    var y = window.pageYOffset;
    renderTabs(); renderFeed();
    var card = document.getElementById(s.id);
    window.scrollTo(0, y);
    if (card) { card.classList.add("flash"); setTimeout(function () { card.classList.remove("flash"); }, 900); }
  }

  $("trendMore").addEventListener("click", function () {
    var w = $("trendWidget"), open = !w.classList.contains("is-expanded");
    w.classList.toggle("is-expanded", open);
    var n = (state.data.trends.items || []).length;
    this.textContent = open ? "접기 ▴" : "트렌드 " + n + "개 모두 보기 ▾";
  });
  // 모바일(≤980px): 트렌드 위젯을 사이드바 대신 본문으로(내 피드·전체·연예/SNS 탭: 주요 뉴스 아래 / 다른 탭: 기사 목록 아래)
  var mq = window.matchMedia("(max-width:980px)");
  function placeTrends() {
    var w = $("trendWidget");
    if (mq.matches) { $((state.tab === "feed" || state.tab === "all" || state.tab === "ent") ? "trendSlot" : "trendSlotEnd").appendChild(w); w.classList.add("widget--inline"); }
    else { document.querySelector(".side-col").insertBefore(w, document.querySelector(".side-col").firstChild); w.classList.remove("widget--inline"); }
  }
  placeTrends();
  if (mq.addEventListener) mq.addEventListener("change", placeTrends); else if (mq.addListener) mq.addListener(placeTrends);

  document.addEventListener("click", function (e) {
    var el;
    if ((el = e.target.closest("[data-vote]"))) { doVote(el); return; }
    if ((el = e.target.closest("[data-open-settings]"))) { Onb.open("topics", true); return; }
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
  $("myTopicsBtn").addEventListener("click", function () { Onb.open("topics", true); });

  /* ---------- 온보딩 · 내 주제 설정 ---------- */
  var Onb = (function () {
    var sheet = $("sheet"), pick = [], persona = null, settingsMode = false, lastFocus = null;
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
          '<button type="button" class="setbtn" data-restart>처음 질문(어떤 분이세요?) 다시 보기</button>' +
          (Install.available() ? '<button type="button" class="setbtn" data-install>📲 홈 화면에 추가</button>' : "") +
          '<p class="sheet__note">설정과 취향은 이 기기(브라우저)에만 저장돼요.</p></div>' : "") +
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
      sheet.innerHTML = '<div class="sheet__panel" role="document">' + (step === "persona" ? stepPersona() : stepTopics()) + "</div>";
      sheet.setAttribute("data-step", step);
      updCount();
      var f = sheet.querySelector("button"); if (f) f.focus({ preventScroll: true });
    }
    function open(step, settings) {
      settingsMode = !!settings; lastFocus = document.activeElement;
      var d = prof();
      persona = d.persona; pick = (selected() || []).slice();
      sheet.hidden = false; document.body.classList.add("sheet-open");
      show(step);
    }
    function close() {
      sheet.hidden = true; document.body.classList.remove("sheet-open"); sheet.innerHTML = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      Install.maybeShow();
    }
    function finish(topics, per) {
      S.update(function (d) { d.onboarded = true; d.topics = topics; d.persona = per; });
      state.tab = "feed";
      close();
      if (state.data) renderAll();
      window.scrollTo(0, 0);
    }
    sheet.addEventListener("click", function (e) {
      var el = e.target;
      if (el === sheet) { if (settingsMode) close(); return; }
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
        // 주제 순서는 화면(10개 목록) 순서로 정리
        var ordered = T.TOPICS.map(function (t) { return t.id; }).filter(function (x) { return pick.indexOf(x) >= 0; });
        finish(ordered, persona); toast("🧩 내 주제 " + ordered.length + "개로 피드를 맞췄어요"); return;
      }
      if (e.target.closest("[data-skip]")) { finish(null, null); return; }
      if (e.target.closest("[data-show-all]")) { finish(null, persona); toast("모든 주제를 내 피드에 보여 드려요"); return; }
      if (e.target.closest("[data-back]")) { show("persona"); return; }
      if (e.target.closest("[data-restart]")) { settingsMode = false; show("persona"); return; }
      if (e.target.closest("[data-close]")) { close(); return; }
      if (e.target.closest("[data-install]")) { close(); Install.prompt(); return; }
      if (e.target.closest("[data-reset-taste]")) {
        if (window.confirm("👍👎로 배운 내 취향을 모두 지울까요? (주제 선택은 그대로 둡니다)")) {
          L.reset(); msg("내 취향을 초기화했어요. 기사는 다시 최신순으로 보여요."); if (state.data) renderAll();
        }
      }
    });
    return { open: open, close: close };
  })();

  /* ---------- 홈 화면에 추가(PWA) ---------- */
  var Install = (function () {
    var deferred = null;
    var ua = navigator.userAgent || "";
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios|kakaotalk|naver|line\//i.test(ua);
    function standalone() { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; maybeShow(); });
    window.addEventListener("appinstalled", function () { deferred = null; hide(); toast("📲 홈 화면에 추가했어요"); });
    function hide() { $("installHint").hidden = true; }
    function dismissed() { return prof().ui && prof().ui.installHint === "dismissed"; }
    function available() { return !standalone() && (!!deferred || isIOS); }
    function maybeShow() {
      var el = $("installHint");
      if (standalone() || dismissed() || !prof().onboarded || !$("sheet").hidden) return;
      if (deferred) {
        el.innerHTML = '<span class="ih__icon" aria-hidden="true">📲</span><span class="ih__t"><b>홈 화면에 추가</b>하면 앱처럼 바로 열려요</span>' +
          '<button type="button" class="btn btn--primary btn--sm" data-ih-install>추가</button><button type="button" class="ih__x" data-ih-close aria-label="닫기">✕</button>';
        el.hidden = false;
      } else if (isIOS) {
        el.innerHTML = '<span class="ih__icon" aria-hidden="true">📲</span><span class="ih__t">' + (isSafari ? "" : "Safari에서 열고, ") + '<b>공유</b> <span class="ios-share" aria-hidden="true">⬆︎</span> 버튼 → <b>홈 화면에 추가</b>를 누르면 앱처럼 쓸 수 있어요</span>' +
          '<button type="button" class="ih__x" data-ih-close aria-label="닫기">✕</button>';
        el.hidden = false;
      }
    }
    function prompt() {
      if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; hide(); }); }
      else if (isIOS) { S.update(function (d) { d.ui.installHint = undefined; }); maybeShow(); }
    }
    $("installHint").addEventListener("click", function (e) {
      if (e.target.closest("[data-ih-install]")) prompt();
      if (e.target.closest("[data-ih-close]")) { S.update(function (d) { d.ui.installHint = "dismissed"; }); hide(); }
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
  var cur = resolve(getParam("ed") || getParam("date"));
  state.edition = cur;
  var tabParam = getParam("tab");
  if (tabParam && (tabParam === "all" || tabParam === "feed" || T.get(tabParam))) state.tab = tabParam;
  if (EDS.length > 1) {
    $("datepickWrap").hidden = false;
    document.body.classList.add("has-editions");
    $("datepick").innerHTML = EDS.map(function (e, i) {
      return '<option value="' + esc(e.id) + '"' + (cur && e.id === cur.id ? " selected" : "") + ">" + esc(e.label) + (i === 0 ? " (최신)" : "") + "</option>";
    }).join("");
    $("datepick").addEventListener("change", function () { location.href = location.pathname + "?date=" + encodeURIComponent(this.value); });
  }
  if (cur && EDS.length && cur.id !== EDS[0].id && !cur.missing) {
    var n = $("editionNote");
    n.hidden = false;
    n.innerHTML = "지금 <b>" + esc(cur.label) + "</b>을(를) 보고 있습니다. " +
      '<a href="' + location.pathname + '?date=' + encodeURIComponent(EDS[0].id) + '">최신 ' + esc(EDS[0].label) + " 보기 →</a>";
  }
  if (cur) loadDate(cur.id); else $("feed").innerHTML = '<div class="empty">데이터가 없습니다.' + (navigator.onLine === false ? " 오프라인 상태입니다." : "") + "</div>";
  // 처음 방문: '어떤 분이세요?' (기사 링크(#id)로 들어온 경우에도 먼저 보여 주되 건너뛰기 가능)
  if (!prof().onboarded) Onb.open("persona", false); else Install.maybeShow();

  // 서비스 워커(오프라인 읽기·홈 화면 앱). file:// 에서는 쓰지 않음
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (e) { console.warn("SW 등록 실패", e); });
    });
  }
  window.TNApp = { state: state, openSettings: function () { Onb.open("topics", true); } };
})();
