/* 태국 뉴스 한눈에 — 정적 렌더러 (빌드 불필요, file:// 지원) */
(function () {
  "use strict";
  var CATS = [
    { key: "all", label: "전체" },
    { key: "politics", label: "정치", icon: "🏛" },
    { key: "economy", label: "경제", icon: "📈" },
    { key: "society", label: "사회", icon: "🏙" },
    { key: "local", label: "파타야·촌부리", icon: "🌊" },
    { key: "sns", label: "SNS 화제", icon: "💬" }
  ];
  var CAT_COLOR = { politics: "#3b5bdb", economy: "#0c8f6a", society: "#d9480f", local: "#0b7285", sns: "#c2255c" };
  var DECO = { politics: "政", economy: "฿", society: "社", local: "〰", sns: "#" };
  var TZ = "Asia/Bangkok";
  var state = { data: null, cat: "all", edition: null };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function catLabel(k) { for (var i = 0; i < CATS.length; i++) if (CATS[i].key === k) return CATS[i].label; return k; }

  function fmtTime(iso) {
    var d = new Date(iso);
    var parts = new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    return o.month + "/" + o.day + " " + o.hour + ":" + o.minute;
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
    sc.onload = function () { render(window.NEWS_DATA[date]); };
    sc.onerror = function () { $("feed").innerHTML = '<div class="empty">' + esc(date) + " 데이터를 찾을 수 없습니다.</div>"; };
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
    var badge = { "아침판": "아침 브리핑", "저녁판": "저녁 브리핑", "새벽판": "새벽 브리핑" }[edName] || "오늘의 브리핑";
    $("briefing").innerHTML = '<span class="briefing__badge">' + esc(badge) + "</span><p>" + esc(data.briefing) + "</p>";
    $("generated").textContent = (ed.label ? ed.label + " · " : "") + "업데이트: " + fmtTime(data.generated) + " (방콕) · 기사 " + data.stories.length + "건";
    renderTabs(); renderTop(); renderFeed(); renderSide();
    if (location.hash.length > 1) openStory(location.hash.slice(1), true);
  }

  function counts() {
    var c = { all: state.data.stories.length };
    state.data.stories.forEach(function (s) { c[s.category] = (c[s.category] || 0) + 1; });
    return c;
  }

  function renderTabs() {
    var c = counts();
    $("tabs").innerHTML = CATS.map(function (t) {
      return '<button class="tab" role="tab" data-cat="' + t.key + '" aria-selected="' + (state.cat === t.key) + '">' +
        esc(t.label) + '<span class="n">' + (c[t.key] || 0) + "</span></button>";
    }).join("");
  }

  function byId(id) { return state.data.stories.filter(function (s) { return s.id === id; })[0]; }

  function renderTop() {
    var show = state.cat === "all";
    $("topSection").hidden = !show;
    if (!show) return;
    $("topGrid").innerHTML = (state.data.highlights || []).map(function (id, i) {
      var s = byId(id); if (!s) return "";
      return '<article class="top-card top-card--' + s.category + (i === 0 ? " top-card--main" : "") + '" tabindex="0" data-open="' + s.id + '">' +
        '<span class="deco" aria-hidden="true">' + DECO[s.category] + "</span>" +
        '<div class="badges"><span class="rank">TOP ' + (i + 1) + '</span><span class="chip">' + esc(catLabel(s.category)) + "</span>" + (s.region ? '<span class="chip">📍 ' + esc(s.region) + "</span>" : "") + (s.update ? '<span class="chip">후속</span>' : "") + "</div>" +
        "<h3>" + esc(s.headline) + "</h3>" +
        "<p>" + esc(s.summary[0]) + "</p>" + metaHTML(s) + "</article>";
    }).join("");
  }

  function cardHTML(s) {
    var region = s.region ? '<span class="chip chip--region">📍 ' + esc(s.region) + "</span>" : "";
    var paras = s.summary.map(function (p) { return '<p class="para">' + esc(p) + "</p>"; }).join("");
    var ctx = s.context ? '<div class="context"><b>💡 배경 설명</b>' + esc(s.context) + "</div>" : "";
    var upd = s.update ? '<div class="update"><b>🆕 이전 판 이후 새로 나온 내용</b>' + esc(s.update) + "</div>" : "";
    var rel = (s.related && s.related.length) ? '<p class="related-label">관련 기사 · 함께 참고한 원문</p><ul class="related">' + s.related.map(function (r) {
      return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener"><span class="rs">' + esc(r.source) + '</span><span class="rt">' + esc(r.title) + "</span> ↗</a></li>";
    }).join("") + "</ul>" : "";
    var tags = (s.tags || []).length ? '<div class="tags">' + s.tags.map(function (t) { return "<span>#" + esc(t) + "</span>"; }).join("") + "</div>" : "";
    return '<article class="card card--' + s.category + '" id="' + esc(s.id) + '">' +
      '<button class="card__head" aria-expanded="false" aria-controls="body-' + esc(s.id) + '">' +
        '<div class="card__top"><span class="chip chip--' + s.category + '">' + esc(catLabel(s.category)) + "</span>" + region + (s.update ? '<span class="chip chip--new">후속</span>' : "") + "</div>" +
        '<h3 class="card__title">' + esc(s.headline) + "</h3>" +
        '<p class="card__lead">' + esc(s.summary[0]) + "</p>" +
        '<div class="card__foot">' + metaHTML(s) + '<span class="more"><span class="more__t">자세히</span> <i>▾</i></span></div>' +
      "</button>" +
      '<div class="card__body" id="body-' + esc(s.id) + '">' + upd + paras + ctx +
        '<div class="origin"><p class="origin__th" lang="th"><small>원문 제목</small>' + esc(s.title_th) + "</p>" +
        '<a class="btn" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.source.replace(/\s*\(.*\)$/, "")) + " 원문 보기 ↗</a>" + rel + tags + "</div>" +
      "</div></article>";
  }

  function renderFeed() {
    var list = state.data.stories.filter(function (s) { return state.cat === "all" || s.category === state.cat; });
    if (state.cat === "all") {
      var hl = state.data.highlights || [];
      list = list.slice().sort(function (a, b) {
        // 전체 탭: 주요 뉴스 제외분을 카테고리 순서 → 최신순
        var order = ["politics", "economy", "society", "local", "sns"];
        var d = order.indexOf(a.category) - order.indexOf(b.category);
        return d || (new Date(b.published) - new Date(a.published));
      }).filter(function (s) { return hl.indexOf(s.id) < 0; });
    } else {
      list = list.slice().sort(function (a, b) { return new Date(b.published) - new Date(a.published); });
    }
    $("feedTitleText").textContent = state.cat === "all" ? "전체 뉴스" : catLabel(state.cat);
    $("feedCount").textContent = list.length + "건" + (state.cat === "all" ? " (주요 뉴스 제외)" : "");
    $("feed").innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty">이 카테고리에는 오늘 기사가 없습니다.</div>';
  }

  function renderSide() {
    var t = state.data.trends;
    if (t && t.items && t.items.length) {
      $("trendList").innerHTML = t.items.map(function (x) {
        var q = "https://x.com/search?q=" + encodeURIComponent(x);
        return '<li><a href="' + q + '" target="_blank" rel="noopener">' + esc(x) + "</a></li>";
      }).join("");
      $("trendNote").innerHTML = esc(t.note) + '<br>출처: <a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.source) + "</a> · " + esc(fmtTime(t.fetched)) + " (BKK) 기준";
    } else { $("trendWidget").hidden = true; }
    var c = counts(), max = 0;
    CATS.slice(1).forEach(function (k) { max = Math.max(max, c[k.key] || 0); });
    $("catStats").innerHTML = CATS.slice(1).map(function (k) {
      var n = c[k.key] || 0;
      return '<li><span class="lbl" data-cat="' + k.key + '">' + k.icon + " " + esc(k.label) + '</span><span class="bar"><i style="width:' + (max ? n / max * 100 : 0) + "%;background:" + CAT_COLOR[k.key] + '"></i></span><b>' + n + "</b></li>";
    }).join("");
    var srcs = {};
    state.data.stories.forEach(function (s) { srcs[s.source.replace(/\s*\(.*\)$/, "")] = 1; (s.related || []).forEach(function (r) { srcs[r.source.replace(/\s*\(.*\)$/, "")] = 1; }); });
    $("srcList").innerHTML = Object.keys(srcs).sort().map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  }

  /* ---------- 인터랙션 ---------- */
  function setCat(cat) {
    state.cat = cat;
    renderTabs(); renderTop(); renderFeed();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleCard(card, force) {
    var open = force != null ? force : !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    var head = card.querySelector(".card__head");
    head.setAttribute("aria-expanded", String(open));
    card.querySelector(".more__t").textContent = open ? "접기" : "자세히";
  }
  function openStory(id, fromHash) {
    var s = byId(id); if (!s) return;
    if (!document.getElementById(id)) {
      // 주요 뉴스로 빠진 카드 → 해당 카테고리 탭으로 이동
      state.cat = s.category; renderTabs(); renderTop(); renderFeed();
    }
    var card = document.getElementById(id);
    if (!card) return;
    toggleCard(card, true);
    var y = card.getBoundingClientRect().top + window.pageYOffset - (document.querySelector(".masthead").offsetHeight + 12);
    window.scrollTo({ top: y, behavior: fromHash ? "auto" : "smooth" });
  }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-cat]");
    if (tab) { setCat(tab.getAttribute("data-cat")); return; }
    var top = e.target.closest("[data-open]");
    if (top) { openStory(top.getAttribute("data-open")); history.replaceState(null, "", "#" + top.getAttribute("data-open")); return; }
    var head = e.target.closest(".card__head");
    if (head) toggleCard(head.parentNode);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-open]")) { e.preventDefault(); e.target.click(); }
  });
  window.addEventListener("scroll", function () { $("toTop").classList.toggle("show", window.pageYOffset > 600); }, { passive: true });
  $("toTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

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
  if (cur) loadDate(cur.id); else $("feed").innerHTML = '<div class="empty">데이터가 없습니다.</div>';
})();
