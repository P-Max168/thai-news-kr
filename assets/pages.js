/* 태국 뉴스 한눈에 — 화면 안의 '페이지'(주소 #이름, 뒤로 버튼·휴대폰 뒤로 가기로 닫힘)
 * 지금: #hearts(❤️ 내가 하트한 기사). 다른 화면(관리자 통계·승인함·안내 페이지)은 TNPages.register(name, def) 로 더함.
 * def = { title, render(body) → HTML 문자열(또는 body 를 직접 채우고 ""), click(e, el) → true 면 처리함 }
 * 모양은 📍 내 주변 페이지(nearby.css .nb-page*)와 같음 — 휴대폰은 화면 전체, 데스크톱은 가운데 카드. 떠 있는 상자 없음. */
(function () {
  "use strict";
  var pages = {}, root = null, cur = null, pushed = false, lastFocus = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.className = "nb-page tn-page"; root.id = "tnPage"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-labelledby", "tnPageT");
    document.body.appendChild(root);
    root.addEventListener("click", function (e) {
      var t = e.target, el;
      if (t === root) { back(); return; }
      if ((el = t.closest("[data-pg-back]"))) { back(); return; }
      var d = pages[cur]; if (d && d.click) d.click(e, t);
    });
    document.addEventListener("keydown", function (e) { if (!root.hidden && e.key === "Escape") back(); });
    return root;
  }
  function show(name) {
    var d = pages[name]; if (!d) return false;
    ensureRoot();
    if (root.hidden) lastFocus = document.activeElement;
    cur = name;
    if (window.TNApp && TNApp.closeDrawer) TNApp.closeDrawer();
    root.innerHTML = '<div class="nb-page__panel" role="document"><div class="nb-page__bar"><button type="button" class="nb-back" data-pg-back aria-label="뒤로 — 뉴스로 돌아가기">← 뒤로</button>' +
      '<h2 class="nb-page__t" id="tnPageT">' + esc(d.title) + '</h2></div><div class="nb-page__body tn-page__body" id="tnPageBody"></div></div>';
    paint();
    root.hidden = false; root.scrollTop = 0;
    document.body.classList.add("nb-open");
    var b = root.querySelector("[data-pg-back]"); if (b) b.focus({ preventScroll: true });
    return true;
  }
  function paint() {
    var d = pages[cur], body = $("tnPageBody"); if (!d || !body) return;
    var y = root.scrollTop, h = d.render(body);
    if (typeof h === "string" && h) body.innerHTML = h;
    root.scrollTop = y;
  }
  function hide() {
    if (!root || root.hidden) return;
    root.hidden = true; root.innerHTML = ""; cur = null;
    if (!document.getElementById("nearbyPage") || document.getElementById("nearbyPage").hidden) document.body.classList.remove("nb-open");
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function open(name) {
    if (!pages[name]) return;
    var h = "#" + name;
    if (location.hash !== h) {
      if (!cur) { history.pushState({ pg: name }, "", h); pushed = true; }
      else history.replaceState({ pg: name }, "", h);
    }
    show(name);
  }
  function back() {
    if (pushed && history.state && history.state.pg) { pushed = false; history.back(); return; }
    history.replaceState(null, "", location.pathname + location.search);
    hide();
  }
  function fromHash() {
    var n = location.hash.slice(1);
    if (pages[n]) { if (cur !== n) show(n); return; }
    if (cur) { pushed = false; hide(); }
  }
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-page]");
    if (el && pages[el.getAttribute("data-page")]) { e.preventDefault(); open(el.getAttribute("data-page")); }
  });

  function register(name, def) { pages[name] = def; if (location.hash === "#" + name) show(name); }
  window.TNPages = { register: register, open: open, close: back, refresh: function () { if (cur) paint(); }, current: function () { return cur; }, esc: esc };

  /* ---------- ❤️ 내가 하트한 기사 ---------- */
  var STEPS = [5, 10, 1000], step = 0, loading = {};
  function edLabel(id) {
    var e = ((window.NEWS_INDEX || {}).editions || []).filter(function (x) { return x.id === id; })[0];
    if (e && e.label) return e.label;
    var m = /^(\d{4})-(\d{2})-(\d{2})-(am|pm|early)$/.exec(id || "");
    return m ? (+m[2]) + "월 " + (+m[3]) + "일 " + { am: "아침판", pm: "저녁판", early: "새벽판" }[m[4]] : (id || "");
  }
  /* 다른 기기에서 누른 하트는 제목을 모름 → 그 판 파일(data/<판>.js)을 읽어 채움 */
  function fill(ed) {
    if (loading[ed] || !/^\d{4}-\d{2}-\d{2}-(am|pm|early)$/.test(ed)) return;
    loading[ed] = 1;
    var sc = document.createElement("script"); sc.src = "data/" + ed + ".js"; sc.async = true;
    sc.onload = function () { if (cur === "hearts") paint(); };
    sc.onerror = function () { loading[ed] = "err"; if (cur === "hearts") paint(); };
    document.head.appendChild(sc);
  }
  function metaOf(h) {
    if (h.meta && h.meta.t) return h.meta;
    var d = (window.NEWS_DATA || {})[h.ed];
    var s = d && (d.stories || []).filter(function (x) { return x.id === h.id; })[0];
    if (s) return { t: s.headline, src: String(s.source || "").replace(/\s*\(.*\)$/, ""), tp: window.TNTopics ? TNTopics.storyTopics(s).topic : "" };
    if (!d) fill(h.ed);
    return null;
  }
  register("hearts", {
    title: "❤️ 내가 하트한 기사",
    render: function () {
      var L = window.TNTaste; if (!L) return '<p class="empty">잠시 후 다시 열어 주세요.</p>';
      var list = L.hearts(), n = list.length;
      var head = '<div class="hp-sum"><b class="hp-n">❤️ ' + n + '개</b><span>하트한 기사와 비슷한 뉴스를 다음 판부터 더 위에 보여 드려요</span></div>';
      if (!n) return head + '<div class="empty hp-empty"><p class="hp-empty__e" aria-hidden="true">🤍</p><p><b>아직 하트한 기사가 없어요</b></p><p>기사 카드 오른쪽 위 <b>♡</b> 를 누르면 여기에 모여요.</p><button type="button" class="cta hp-go" data-pg-back>뉴스 보러 가기</button></div>';
      var show = list.slice(0, STEPS[step]);
      var rows = show.map(function (h) {
        var m = metaOf(h), tp = m && m.tp && window.TNApp ? TNApp.topicOf(m.tp) : null;
        var title = m ? esc(m.t) : (loading[h.ed] === "err" ? "기사 정보를 불러오지 못했어요" : "불러오는 중…");
        return '<li class="hp-row"><button type="button" class="hp-open" data-hp-open="' + esc(h.ed) + "|" + esc(h.id) + '">' +
          '<span class="hp-ic" aria-hidden="true">' + (tp ? tp.emoji : "📰") + "</span>" +
          '<span class="hp-tx"><b class="hp-t">' + title + '</b><small>' + (m && m.src ? esc(m.src) + " · " : "") + esc(edLabel(h.ed)) + "</small></span></button>" +
          '<button type="button" class="hp-x" data-hp-del="' + esc(h.ed) + "|" + esc(h.id) + '" aria-label="하트 취소">❤️</button></li>';
      }).join("");
      var more = n > show.length ? '<button type="button" class="more-btn" data-hp-more>더 보기 (' + Math.min(n - show.length, STEPS[step + 1] - show.length) + "건 더) ▾</button>" : "";
      return head + '<ul class="hp-list">' + rows + "</ul>" + more +
        '<p class="hp-note">이 기기에 저장돼요. Google 로그인하면 다른 기기와 같이 보여요.</p>';
    },
    click: function (e, t) {
      var el;
      if ((el = t.closest("[data-hp-more]"))) { step = Math.min(step + 1, STEPS.length - 1); paint(); return true; }
      if ((el = t.closest("[data-hp-del]"))) {
        var p = el.getAttribute("data-hp-del").split("|"), d = (window.NEWS_DATA || {})[p[0]];
        var s = d && (d.stories || []).filter(function (x) { return x.id === p[1]; })[0];
        if (s) { TNTaste.heart(p[0], s); }
        else TNStore.update(function (doc) { doc.taste.votes["h:" + p[0] + "/" + p[1]] = -1; if (doc.ui && doc.ui.hm) delete doc.ui.hm["h:" + p[0] + "/" + p[1]]; });
        if (window.TNApp) { TNApp.rerender(); TNApp.toast("하트를 취소했어요", 1800); }
        paint(); return true;
      }
      if ((el = t.closest("[data-hp-open]"))) {
        var q = el.getAttribute("data-hp-open").split("|");
        if (window.TNApp && TNApp.edId() === q[0]) { back(); setTimeout(function () { TNApp.openStory(q[1]); }, 60); }
        else location.href = "?date=" + encodeURIComponent(q[0]) + "#" + encodeURIComponent(q[1]);
        return true;
      }
      return false;
    }
  });
})();
