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
      if (!cur) { if (history.state && history.state.ui) history.replaceState({ pg: name }, "", h); else history.pushState({ pg: name }, "", h); pushed = true; }   // 서랍·설정 창 기록 칸은 이어 씀(app.js Back)
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
  window.TNPages = { register: register, open: open, close: back, refresh: function () { if (cur) paint(); }, current: function () { return cur; }, has: function (n) { return !!pages[n]; }, esc: esc };

  /* ---------- ❤️ 내가 하트한 기사 ---------- */
  var STEPS = [5, 10, 1000], step = 0, loading = {};
  function edLabel(id) {
    var e = ((window.NEWS_INDEX || {}).editions || []).filter(function (x) { return x.id === id; })[0];
    if (e && e.label) return e.label;
    var m = /^(\d{4})-(\d{2})-(\d{2})-(am|pm|early)$/.exec(id || "");
    return m ? (+m[2]) + "월 " + (+m[3]) + "일 " + { am: "아침판", pm: "저녁판", early: "새벽판" }[m[4]] : (id || "");
  }
  /* 다른 기기에서 누른 하트는 제목을 모름 → 그 판 파일(data/<판>.js)을 읽어 채움 */
  /* 판 파일 자동 재시도(2026-10-05): 일시적 네트워크 실패면 1초·3초·9초 뒤 3번까지 다시(주소에 ?r=N — 캐시된 실패를 피함), 그래도 안 되면 예전처럼 'err' 표시. 무한 반복 없음 */
  var RETRY = [1000, 3000, 9000];
  function fill(ed, n) {
    n = n || 0;
    if ((!n && loading[ed]) || !/^\d{4}-\d{2}-\d{2}-(am|pm|early)$/.test(ed)) return;
    loading[ed] = 1;
    var sc = document.createElement("script"); sc.src = "data/" + ed + ".js" + (n ? "?r=" + n : ""); sc.async = true;
    sc.onload = function () { if (cur === "hearts" || cur === "admin") paint(); };
    sc.onerror = function () {
      if (sc.parentNode) sc.parentNode.removeChild(sc);
      if (n < RETRY.length) { setTimeout(function () { fill(ed, n + 1); }, RETRY[n]); return; }
      loading[ed] = "err"; if (cur === "hearts" || cur === "admin") paint();
    };
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
      var upto = Math.min(n, STEPS[step + 1]);   // 다음에 몇 개까지(2026-10-05 — 예전 'N건 더')
      var more = n > show.length ? '<button type="button" class="more-btn" data-hp-more>' + (upto >= n ? "전체 " + n + "개 보기" : upto + "개까지 보기") + " ▾</button>" : "";
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

  /* ---------- 📊 관리자: 반응 통계(운영자 UID 로 로그인했을 때만 숫자가 보임) ----------
   * 데이터 = Firestore rx(익명: 기사·반응 종류·사는 곳·관심·주제). 취소(-1)는 빼고 셈. 읽기는 규칙상 운영자만 */
  var AD = { days: 7, data: {}, err: null, busy: false, topN: 5 };
  var PERIODS = [[1, "오늘"], [7, "7일"], [30, "30일"]];
  function sinceOf(days) {
    if (days === 1) { var d = new Date(Date.now() + 7 * 3600e3); d.setUTCHours(0, 0, 0, 0); return d.getTime() - 7 * 3600e3; }   // 방콕 자정
    return Date.now() - days * 864e5;
  }
  function adLoad(force) {
    var key = AD.days, c = AD.data[key];
    if (AD.busy || (!force && c && Date.now() - c.t < 120e3)) return;
    if (!force && AD.err && AD.errDays === key) return;   // 실패하면 '다시 시도'를 누를 때까지 다시 부르지 않음(무한 재시도 방지)
    if (!window.TNSocial || !TNSocial.adminStats) { AD.err = "load"; return; }
    AD.busy = true; AD.err = null;
    // 일시적 네트워크 실패만 1초·3초 뒤 2번 더(2026-10-05). 권한 거부(규칙 미게시)는 다시 해도 같으니 바로 안내
    var tryStats = function (n) {
      return TNSocial.adminStats(sinceOf(key)).catch(function (e) {
        if (n >= 2 || /permission/i.test((e && (e.code || e.message)) || "")) throw e;
        return new Promise(function (ok) { setTimeout(ok, n ? 3000 : 1000); }).then(function () { return tryStats(n + 1); });
      });
    };
    tryStats(0).then(function (rows) { AD.data[key] = { t: Date.now(), rows: rows }; })
      .catch(function (e) { AD.err = /permission/i.test((e && (e.code || e.message)) || "") ? "perm" : "net"; AD.errDays = key; })
      .then(function () { AD.busy = false; if (cur === "admin") paint(); });
  }
  function agg(rows) {
    var z = function () { return { h: 0, u: 0, d: 0 }; }, tot = z(), byR = {}, byI = {}, byT = {}, byA = {};
    rows.forEach(function (x) {
      if (!/^[hud]$/.test(x.k) || /^test\//.test(String(x.a || ""))) return;   // 'test/…' = 시험 반응(지울 수 없음) → 통계에서 뺌
      var v = x.v === -1 ? -1 : 1;
      tot[x.k] += v;
      (byR[x.r || "none"] = byR[x.r || "none"] || z())[x.k] += v;
      (Array.isArray(x.i) && x.i.length ? x.i : ["none"]).forEach(function (i) { (byI[i] = byI[i] || z())[x.k] += v; });
      (byT[x.tp || "?"] = byT[x.tp || "?"] || z())[x.k] += v;
      (byA[x.a] = byA[x.a] || z())[x.k] += v;
    });
    return { tot: tot, byR: byR, byI: byI, byT: byT, byA: byA };
  }
  function n0(v) { return Math.max(0, v | 0).toLocaleString("ko-KR"); }
  function table(title, map, labelOf, order) {
    var keys = Object.keys(map);
    keys.sort(function (a, b) { var ia = order ? order.indexOf(a) : -1, ib = order ? order.indexOf(b) : -1; if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); var A = map[a], B = map[b]; return (B.h + B.u + B.d) - (A.h + A.u + A.d); });
    if (!keys.length) return "";
    return '<section class="ad-sec"><h3 class="ad-h">' + title + '</h3><div class="ad-tb" role="table"><div class="ad-tr ad-tr--h" role="row"><span role="columnheader">구분</span><span role="columnheader">❤️</span><span role="columnheader">🙌</span><span role="columnheader">🙅</span></div>' +
      keys.map(function (k) { var m = map[k]; return '<div class="ad-tr" role="row"><span role="cell">' + esc(labelOf(k)) + '</span><b role="cell">' + n0(m.h) + '</b><b role="cell">' + n0(m.u) + '</b><b role="cell">' + n0(m.d) + "</b></div>"; }).join("") + "</div></section>";
  }
  function storyTitle(a) {
    var m = /^([^/]+)\/(.+)$/.exec(a) || [], d = (window.NEWS_DATA || {})[m[1]];
    var s = d && (d.stories || []).filter(function (x) { return x.id === m[2]; })[0];
    if (s) return s.headline;
    if (m[1] && !d) fill(m[1]);
    return (m[1] ? edLabel(m[1]) + " · " : "") + (m[2] || a);
  }
  register("admin", {
    title: "📊 반응 통계 (운영자)",
    render: function () {
      var S2 = window.TNSocial, T = window.TNTopics;
      if (!S2 || !S2.isAdmin || !S2.isAdmin()) {
        return '<div class="empty hp-empty"><p class="hp-empty__e" aria-hidden="true">🔒</p><p><b>운영자만 볼 수 있어요</b></p><p>운영자 구글 계정으로 로그인하면 하트·🙌·🙅 반응을 사는 곳·관심·주제별로 볼 수 있어요.</p>' +
          (S2 && S2.signedIn && S2.signedIn() ? "" : '<button type="button" class="cta hp-go" data-login>구글로 로그인</button>') + "</div>";
      }
      adLoad(false);
      var chips = '<div class="ad-per" role="group" aria-label="기간">' + PERIODS.map(function (p) { return '<button type="button" class="ad-pbtn" data-ad-days="' + p[0] + '" aria-pressed="' + (AD.days === p[0]) + '">' + p[1] + "</button>"; }).join("") + "</div>";
      var c = AD.data[AD.days];
      if (AD.err === "perm") return chips + '<div class="empty">통계를 읽을 권한이 아직 없어요. Firestore 보안 규칙(저장소 firestore.rules 의 rx 부분)을 Firebase 콘솔에 게시해야 해요 — LOGIN_TODO.md 참고. <button type="button" class="linkbtn" data-ad-reload>다시 시도</button></div>';
      if (AD.err) return chips + '<div class="empty">통계를 불러오지 못했어요. 인터넷 연결을 확인하고 <button type="button" class="linkbtn" data-ad-reload>다시 시도</button></div>';
      if (!c) return chips + '<div class="skel-list" aria-busy="true"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div><p class="hp-note">불러오는 중…</p>';
      var g = agg(c.rows);
      var sum = '<div class="ad-sum"><div class="ad-cell"><span>❤️ 하트</span><b>' + n0(g.tot.h) + '</b></div><div class="ad-cell"><span>🙌 더 보여줘</span><b>' + n0(g.tot.u) + '</b></div><div class="ad-cell"><span>🙅 덜 보여줘</span><b>' + n0(g.tot.d) + "</b></div></div>";
      if (!c.rows.length) return chips + sum + '<div class="empty">이 기간에 모인 반응이 아직 없어요.</div>';
      var arts = Object.keys(g.byA).map(function (a) { var m = g.byA[a]; return { a: a, m: m, sc: m.h * 2 + m.u - m.d }; }).filter(function (x) { return x.sc > 0 || x.m.h > 0 || x.m.u > 0; }).sort(function (x, y) { return y.sc - x.sc; });
      var top = arts.slice(0, AD.topN).map(function (x, i) {
        return '<li class="ad-art"><span class="ad-rank">' + (i + 1) + '</span><span class="ad-at">' + esc(storyTitle(x.a)) + '</span><span class="ad-an">❤️ <b>' + n0(x.m.h) + "</b> 🙌 <b>" + n0(x.m.u) + "</b> 🙅 <b>" + n0(x.m.d) + "</b></span></li>";
      }).join("");
      var more = arts.length > AD.topN && AD.topN < 10 ? '<button type="button" class="more-btn" data-ad-more>펼치기 (' + Math.min(10, arts.length) + '위까지) ▾</button>' : "";
      var rl = function (k) { var r = T && T.region(k); return r ? r.emoji + " " + r.label : k === "none" ? "미선택" : k; };
      var il = function (k) { var r = T && T.interest(k); return r ? r.emoji + " " + r.label : k === "none" ? "미선택" : k; };
      var tl = function (k) { var t = window.TNApp && TNApp.topicOf(k); return t && t.label ? t.emoji + " " + t.label : k; };
      return chips + sum +
        '<section class="ad-sec"><h3 class="ad-h">🏆 반응 많은 기사</h3><ol class="ad-arts">' + top + "</ol>" + more + "</section>" +
        table("📍 사는 곳별 <small>페르소나·내 주제로 추정</small>", g.byR, rl, ["east", "bangkok", "north", "south", "other", "none"]) +
        table("🎯 관심별 <small>페르소나·내 주제로 추정</small>", g.byI, il, ["life", "travel", "biz", "visa", "none"]) +
        table("🗂️ 주제별", g.byT, tl) +
        '<p class="hp-note">개인 정보 없이 모은 숫자예요(사는 곳·관심·주제만, 성별·이름·기기 정보 없음). 취소한 반응은 빼고 셉니다. 조회 ' +
        hm(c.t) + ' · 반응 ' + c.rows.length.toLocaleString("ko-KR") + '건 <button type="button" class="linkbtn" data-ad-reload>새로고침</button></p>';
    },
    click: function (e, t) {
      var el;
      if ((el = t.closest("[data-ad-days]"))) { AD.days = +el.getAttribute("data-ad-days"); AD.topN = 5; if (AD.errDays !== AD.days) AD.err = null; paint(); return true; }
      if ((el = t.closest("[data-ad-more]"))) { AD.topN = 10; paint(); return true; }
      if ((el = t.closest("[data-ad-reload]"))) { AD.err = null; delete AD.data[AD.days]; adLoad(true); paint(); return true; }
      return false;
    }
  });

  /* ---------- ✅ 관리자 승인함(운영자만) ----------
   * 목록 = data/pending.json(tools/pending.py 가 PENDING_APPROVAL.md 에서 만듦). 여기서 고른 OK/보류는 이 기기에만 기록되고
   * '결정 복사' 문구를 봇에게 보내면 봇이 다음 실행에 반영 — 이 화면은 아무것도 자동으로 승인·게시하지 않는다. */
  var AP = { doc: null, err: null, busy: false, KEY: "tnk.approvals" };
  function apDec() { try { return JSON.parse(localStorage.getItem(AP.KEY) || "{}") || {}; } catch (e) { return {}; } }
  function apSave(d) { try { localStorage.setItem(AP.KEY, JSON.stringify(d)); } catch (e) {} }
  function apLoad(force) {
    if (AP.busy || (AP.doc && !force) || (AP.err && !force)) return;
    AP.busy = true; AP.err = null;
    var tryGet = function (n) {   // 일시 실패면 1초·3초 뒤 2번 더(2026-10-05), 그래도 안 되면 '다시 시도' 버튼
      return fetch("data/pending.json?_=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(function (e) { if (n >= 2) throw e; return new Promise(function (ok) { setTimeout(ok, n ? 3000 : 1000); }).then(function () { return tryGet(n + 1); }); });
    };
    tryGet(0).then(function (d) { AP.doc = d; }).catch(function () { AP.err = "net"; })
      .then(function () { AP.busy = false; if (cur === "approve") paint(); });
  }
  function md(t) {
    return esc(t).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/(backups\/[\w.\-]+\/[\w.\-]+\.jpg)/g, function (m, u) { return '<a class="ap-photo" href="' + u + '" target="_blank" rel="noopener">📷 ' + u.split("/").pop().replace(/\.jpg$/, "") + "</a>"; });
  }
  // 시각은 실제 날짜와 함께 'M/D HH:MM'(방콕) — 2026-10-04 실제 날짜 표시
  function hm(ms) { var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; }); return o.month + "/" + o.day + " " + o.hour.replace(/^24$/, "00") + ":" + o.minute; }
  function apText(items, dec) {
    var ok = [], hold = [];
    items.forEach(function (x) { var d = dec[x.id]; if (d && d.d === "ok") ok.push("#" + x.no); else if (d && d.d === "hold") hold.push("#" + x.no); });
    if (!ok.length && !hold.length) return "";
    return "승인함 결정(" + new Date().toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", timeZone: "Asia/Bangkok" }) + "): " + (ok.length ? "OK " + ok.join(" ") : "") + (ok.length && hold.length ? " / " : "") + (hold.length ? "보류 " + hold.join(" ") : "");
  }
  /* 🛡️ 광고 옆 민감 기사(승인함 아래) — 기준표(assets/adsafe.js RULES) + 이 판에서 광고를 안 둔 기사 목록과 이유. 기사는 지우지 않음 */
  function adsafeHTML() {
    var A = window.TNAdSafe, st = window.TNApp && TNApp.state, d = st && st.data;
    if (!A) return "";
    var R = A.RULES, rows = [], near = [];
    var hl = (d && d.highlights) || [];
    ((d && d.stories) || []).forEach(function (s) {
      var r = A.score(s); if (!r.why.length) return;
      var where = hl[0] === s.id ? "메인 큰 배너 + 기사 사이 광고" : hl.indexOf(s.id) >= 0 ? "주요 뉴스(이 칸엔 광고 없음)" : "기사 사이 광고(앞뒤)";
      (r.hide ? rows : near).push({ s: s, r: r, where: where });
    });
    var by = function (a, b) { return b.r.pts - a.r.pts; };
    rows.sort(by); near.sort(by);
    var li = function (x) { return '<li class="as-item"><b class="as-t">' + esc(x.s.headline) + '</b><span class="as-why">' + esc(A.explain(x.r)) + "</span>" +
      (x.r.hide ? '<span class="as-where">🙈 안 보이는 광고: ' + esc(x.where) + "</span>" : "") + "</li>"; };
    var mid = (document.querySelector('[data-ad-slot="mid"][data-ad-hidden]') ? "🙈 지금 숨김(주요 뉴스 TOP 1 기사가 기준에 걸림)" : "보임(TOP 1 기사가 기준 아래)");
    var rules = '<table class="as-rules"><thead><tr><th>기준</th><th>점수</th><th>예시 낱말</th></tr></thead><tbody>' +
      R.groups.map(function (g) { return "<tr><td>" + esc(g.label) + "</td><td>+" + g.pts + "</td><td>" + esc(g.words.slice(0, 5).join(", ")) + (g.words.length > 5 ? " 등" : "") + (g.except ? "<br><small>빼는 말: " + esc(g.except.join(", ")) + "</small>" : "") + "</td></tr>"; }).join("") +
      R.context.map(function (c) { return "<tr><td>" + esc(c.label) + "</td><td>" + (c.pts > 0 ? "+" : "−") + Math.abs(c.pts) + "</td><td>" + esc(c.how) + "</td></tr>"; }).join("") + "</tbody></table>";
    return '<section class="ad-sec as-sec" id="adsafe" aria-labelledby="asH"><h3 class="ad-h" id="asH">🛡️ 광고 옆 민감 기사 기준 <small>(' + esc(R.version) + ")</small></h3>" +
      '<p class="as-sum">점수가 <b>' + R.hide_at + "점 이상</b>이면 그 기사 <b>바로 옆 광고만</b> 안 보여요. <b>기사는 지우지 않아요.</b> 메인 큰 배너는 바로 아래 주요 뉴스 TOP 1 기사로 판단해요.</p>" +
      '<div class="ad-sum"><div class="ad-cell"><span>이 판 기사</span><b>' + (((d && d.stories) || []).length) + '</b></div><div class="ad-cell"><span>🙈 광고 숨김</span><b>' + rows.length + '</b></div><div class="ad-cell"><span>참고(기준 아래)</span><b>' + near.length + "</b></div></div>" +
      '<p class="as-mid">📢 메인 큰 배너: ' + esc(mid) + "</p>" +
      (rows.length ? '<ol class="as-list">' + rows.map(li).join("") + "</ol>" : '<p class="as-none">이 판에는 광고를 숨긴 기사가 없어요 🙂</p>') +
      (near.length ? '<details class="as-near"><summary>참고: 점수는 있지만 기준 아래라 광고가 보이는 기사 ' + near.length + "건</summary><ol class=\"as-list\">" + near.map(li).join("") + "</ol></details>" : "") +
      '<details class="as-how" open><summary>점수 매기는 법(전부)</summary>' + rules + '<p class="as-man">✍️ ' + esc(R.manual) + "</p></details>" +
      '<p class="hp-note">기준을 바꾸려면 봇에게 \'민감 기사 기준에서 ○○ 빼 줘/넣어 줘\'라고 말해 주세요(파일: assets/adsafe.js). 편집자 점검: <code>python3 tools/adsafe.py</code></p></section>';
  }
  /* ⚠️ 오류 신고함(승인함 안) — 서버(Firestore reports, 운영자만 읽기) + 이 기기에 저장된 신고. 보기만, 자동 처리 없음 */
  var RP = { rows: null, err: null, busy: false, t: 0 };
  var RP_T = { wrong: "정보 틀림", link: "링크 깨짐", screen: "화면 이상", etc: "기타", closed: "🚫 폐업·없어짐" }, RP_K = { article: "기사", place: "가게 카드", rent: "임대 카드", ad: "광고" };
  function rpLoad(force) {
    if (RP.busy || (!force && (RP.rows || RP.err) && Date.now() - RP.t < 120e3)) return;
    if (!window.TNSocial || !TNSocial.adminReports) { RP.err = "load"; return; }
    RP.busy = true; RP.err = null;
    TNSocial.adminReports(Date.now() - 30 * 864e5).then(function (rows) { RP.rows = rows.sort(function (a, b) { return b.at - a.at; }); })
      .catch(function (e) { RP.err = /permission/i.test((e && (e.code || e.message)) || "") ? "perm" : "net"; })
      .then(function () { RP.busy = false; RP.t = Date.now(); if (cur === "approve") paint(); });
  }
  function rpRow(x, at) {
    var u = String(x.url || "");
    return '<li class="rp-item"><div class="ap-top"><span class="ap-kind">' + esc(RP_K[x.kind] || x.kind) + '</span><span class="rp-type">' + esc(RP_T[x.type] || x.type) + '</span><span class="ap-st">' + (at ? esc(hm(at)) : "") + "</span></div>" +
      '<p class="rp-memo">' + (x.memo ? esc(x.memo) : '<span class="rp-none">메모 없음</span>') + "</p>" +
      '<p class="ap-where">항목 <code>' + esc(x.id) + "</code>" + (x.ed ? " · 판 " + esc(x.ed) : "") + "</p>" +
      (/^https:\/\//.test(u) ? '<p class="ap-where"><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https:\/\/[^/]+/, "")) + " ↗</a></p>" : (u ? '<p class="ap-where">' + esc(u) + "</p>" : "")) + "</li>";
  }
  // '[테스트]' 로 시작하는 메모 = 시험 신고(서버에서 지울 수 없음 — 규칙상 삭제 금지) → 진짜 신고와 섞지 않고 맨 아래 접힌 칸에 따로
  function isTestRep(x) { return /^\s*\[테스트\]/.test(String((x && x.memo) || "")); }
  /* 🚫 가게 폐업 신고 집계(2026-10-05 Max 06:33) — 신고 원문은 운영자만 읽으므로 여기(운영자 화면)에서 가게별로 셈 →
   *   ① 공개 숫자 placeflags/{가게 id} 에 n 만 씀(열 때 자동, 바뀐 것만) ② '폐업 확인 → 보관함' 누르면 st=closed(지우지 않음, '되돌리기' 가능)
   *   ③ 규칙 게시 전이라 서버 쓰기가 막히면 '기록 복사' 글을 봇에게 → 봇이 data/places-flags.json 에 올림(같은 효과)
   *   폐업 신고 = type 'closed', 또는 (규칙 게시 전 모양) 가게 카드 신고의 메모가 '[폐업·없어짐]' 으로 시작 */
  var PF = { st: {}, dec: null };
  var PF_TAG = "[폐업·없어짐]";
  function pfIsClosed(x) { return !!x && x.kind === "place" && (x.type === "closed" || String(x.memo || "").indexOf(PF_TAG) === 0); }
  function pfDec() { if (PF.dec) return PF.dec; try { PF.dec = JSON.parse(localStorage.getItem("tnk.pf.dec") || "{}") || {}; } catch (e) { PF.dec = {}; } return PF.dec; }
  function pfSave() { try { localStorage.setItem("tnk.pf.dec", JSON.stringify(PF.dec || {})); } catch (e) {} }
  function pfGroups(rows) {
    var g = {};
    rows.filter(pfIsClosed).forEach(function (x) { var id = String(x.id || "").replace(/^place:/, ""); if (!id) return; var o = g[id] = g[id] || { id: id, n: 0, last: 0 }; o.n++; o.last = Math.max(o.last, x.at || 0); });
    return Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n || b.last - a.last; });
  }
  function pfWrite(id, n, st) {
    var S2 = window.TNSocial, key = id + "|" + n + "|" + st;
    if (!S2 || !S2.adminPlaceFlag || PF.st[id] === key || PF.st[id] === "busy") return;
    PF.st[id] = "busy";
    S2.adminPlaceFlag(id, n, st).then(function () { PF.st[id] = key; }, function (e) { PF.st[id] = /permission/i.test((e && (e.code || e.message)) || "") ? "perm" : "net"; }).then(function () { if (cur === "approve") paint(); });
  }
  function pfHTML(rows) {
    var gs = pfGroups(rows), dec = pfDec();
    if (!gs.length && !Object.keys(dec).length) return '<p class="as-sum">🚫 가게 폐업 신고: 최근 30일 0건</p>';
    gs.forEach(function (o) { pfWrite(o.id, o.n, dec[o.id] === "closed" ? "closed" : ""); });   // 공개 숫자 맞추기(바뀐 것만)
    var li = gs.map(function (o) {
      var c = dec[o.id] === "closed", w = PF.st[o.id], ws = w === "perm" ? "공개 숫자 쓰기 막힘(규칙 게시 전) — 아래 '기록 복사'로" : w === "net" ? "공개 숫자 쓰기 실패(연결)" : w === "busy" ? "공개 숫자 쓰는 중…" : w ? "공개 숫자 반영됨" : "";
      return '<li class="rp-item"><div class="ap-top"><span class="ap-kind">가게 카드</span><span class="rp-type">🚫 폐업 신고 ' + o.n + "건" + (o.n >= 2 ? " · 화면에 '폐업 신고됨'" : "") + '</span><span class="ap-st">' + (c ? "🗄️ 보관함" : "") + "</span></div>" +
        '<p class="ap-where">가게 <code>' + esc(o.id) + "</code>" + (ws ? " · " + esc(ws) : "") + "</p>" +
        '<div class="ap-acts">' + (c ? '<button type="button" class="ap-btn" data-pf-undo="' + esc(o.id) + '" data-pf-n="' + o.n + '">보관함에서 되돌리기</button>'
          : '<button type="button" class="ap-btn ap-btn--ok" data-pf-close="' + esc(o.id) + '" data-pf-n="' + o.n + '">폐업 확인 → 보관함</button>') + "</div></li>";
    }).join("");
    var txt = gs.map(function (o) { return o.id + " n=" + o.n + (dec[o.id] === "closed" ? " st=closed" : ""); }).join("\n");
    return '<details class="as-near pf-sec" open><summary>🚫 가게 폐업 신고 ' + gs.length + "곳(가게별로 셈 — 2건 이상이면 카드에 '폐업 신고됨')</summary>" +
      '<p class="as-sum">신고 원문은 여기서만 보여요. 공개되는 건 가게별 숫자뿐이에요. <b>폐업 확인</b>을 누르면 그 가게는 화면의 \'폐업 보관함\'(기본 숨김)으로 가요 — 지우지 않아요.</p>' +
      '<ol class="ap-list rp-list">' + li + "</ol>" +
      (txt ? '<p class="ap-txt" id="pfTxt">가게 폐업 기록(data/places-flags.json 에 올려 줘):\n' + esc(txt) + '</p><button type="button" class="cta" data-pf-copy>📋 기록 복사</button>' : "") + "</details>";
  }
  function repHTML() {
    rpLoad(false);
    var loc = []; try { loc = JSON.parse(localStorage.getItem("tnk.rep.q") || "[]") || []; } catch (e) {}
    loc = loc.filter(function (x) { return x && !x.sent && !isTestRep(x); });
    var real = (RP.rows || []).filter(function (x) { return !isTestRep(x); }), test = (RP.rows || []).filter(isTestRep);
    var srv = RP.err === "perm" ? '<p class="as-sum">서버 신고함을 읽을 권한이 없어요(운영자 계정이 아니거나 Firestore 규칙 문제). 독자 신고는 서버에 저장되고, 서버 저장이 실패한 경우에만 <b>메일로 보내기</b>로 운영자 메일에 와요.</p>'
      : RP.err ? '<p class="as-sum">서버 신고함을 불러오지 못했어요. <button type="button" class="linkbtn" data-rp-reload>다시 시도</button></p>'
      : !RP.rows ? '<p class="as-sum">불러오는 중…</p>'
      : real.length ? '<ol class="ap-list rp-list">' + real.map(function (x) { return rpRow(x, x.at); }).join("") + "</ol>" : '<p class="as-sum">최근 30일 동안 들어온 신고가 없어요 🙂</p>';
    var tst = test.length ? '<details class="as-near rp-test"><summary>🧪 시험 신고 ' + test.length + "건(메모가 '[테스트]'로 시작 — 진짜 신고 아님, 규칙상 지울 수 없어 따로 모음)</summary><ol class=\"ap-list rp-list\">" + test.map(function (x) { return rpRow(x, x.at); }).join("") + "</ol></details>" : "";
    var mine = loc.length ? '<details class="as-near"><summary>이 기기에 저장된 신고 ' + loc.length + "건(서버 저장 실패 — 메일로 보냈을 수 있음)</summary><ol class=\"ap-list rp-list\">" + loc.slice().reverse().map(function (x) { return rpRow(x, x.t); }).join("") + "</ol></details>" : "";
    return '<section class="ad-sec rp-sec" id="reports" aria-labelledby="rpH"><h3 class="ad-h" id="rpH">⚠️ 오류 신고함 <small>(최근 30일)</small></h3>' +
      '<p class="as-sum">기사·가게 카드·광고의 <b>오류 신고</b>가 여기 모여요. <b>자동으로 고치거나 지우지 않아요</b> — 보고 고칠 것을 봇에게 알려 주세요.</p>' + (RP.rows ? pfHTML(real) : "") + srv + tst + mine + "</section>";
  }
  register("approve", {
    title: "✅ 관리자 승인함",
    render: function () {
      var S2 = window.TNSocial;
      if (!S2 || !S2.isAdmin || !S2.isAdmin()) {
        return '<div class="empty hp-empty"><p class="hp-empty__e" aria-hidden="true">🔒</p><p><b>운영자만 볼 수 있어요</b></p><p>운영자 구글 계정으로 로그인하면 승인 기다리는 글·설정을 한곳에서 볼 수 있어요.</p>' +
          (S2 && S2.signedIn && S2.signedIn() ? "" : '<button type="button" class="cta hp-go" data-login>구글로 로그인</button>') + "</div>";
      }
      apLoad(false);
      if (AP.err) return '<div class="empty">목록을 불러오지 못했어요. <button type="button" class="linkbtn" data-ap-reload>다시 시도</button></div>';
      if (!AP.doc) return '<div class="skel-list" aria-busy="true"><div class="skel"></div><div class="skel"></div></div>';
      var items = AP.doc.items || [], dec = apDec();
      var open = items.filter(function (x) { return !dec[x.id]; }).length;
      var head = '<div class="ad-sum ap-sum"><div class="ad-cell"><span>전체</span><b>' + items.length + '</b></div><div class="ad-cell"><span>안 고름</span><b>' + open + '</b></div><div class="ad-cell"><span>고름</span><b>' + (items.length - open) + "</b></div></div>" +
        '<p class="ap-note">여기서 누른 OK 는 <b>바로 올라가지 않아요</b>. 아래 \'결정 복사\'를 봇에게 보내 주시면 봇이 반영해요.</p>';
      if (!items.length) return head + '<div class="empty">승인 기다리는 항목이 없어요 🙂</div>' + repHTML() + adsafeHTML();
      var all = open ? '<button type="button" class="cta ap-all" data-ap-all>✅ 남은 ' + open + "건 전부 OK</button>" : "";
      var list = items.map(function (x) {
        var d = dec[x.id];
        var acts = d ? '<div class="ap-done ap-done--' + d.d + '"><span>' + (d.d === "ok" ? "✅ OK 고름" : "⏸️ 보류 고름") + " · " + hm(d.at) + '</span><button type="button" class="linkbtn" data-ap-undo="' + esc(x.id) + '">취소</button></div>'
          : '<div class="ap-acts"><button type="button" class="ap-btn ap-btn--ok" data-ap-ok="' + esc(x.id) + '">OK</button><button type="button" class="ap-btn" data-ap-hold="' + esc(x.id) + '">보류</button></div>';
        return '<li class="ap-item"><div class="ap-top"><span class="ad-rank">' + x.no + '</span><span class="ap-kind">' + esc(x.kind) + '</span><span class="ap-st">' + esc(x.status) + "</span></div>" +
          '<p class="ap-body">' + md(x.body) + '</p><p class="ap-where">📍 ' + md(x.where) + "</p>" + acts + "</li>";
      }).join("");
      var txt = apText(items, dec);
      var copy = txt ? '<section class="ad-sec ap-copy"><h3 class="ad-h">봇에게 보낼 결정</h3><p class="ap-txt" id="apTxt">' + esc(txt) + '</p><button type="button" class="cta" data-ap-copy>📋 결정 복사</button></section>' : "";
      return head + all + '<ol class="ap-list">' + list + "</ol>" + copy + '<p class="hp-note">목록 기준 ' + esc(String(AP.doc.updated_at || "").replace("T", " ").slice(5, 16)) + ' (방콕) · 원본 PENDING_APPROVAL.md <button type="button" class="linkbtn" data-ap-reload>새로고침</button></p>' + repHTML() + adsafeHTML();
    },
    click: function (e, t) {
      var el, dec = apDec();
      if ((el = t.closest("[data-ap-ok]"))) { dec[el.getAttribute("data-ap-ok")] = { d: "ok", at: Date.now() }; apSave(dec); paint(); return true; }
      if ((el = t.closest("[data-ap-hold]"))) { dec[el.getAttribute("data-ap-hold")] = { d: "hold", at: Date.now() }; apSave(dec); paint(); return true; }
      if ((el = t.closest("[data-ap-undo]"))) { delete dec[el.getAttribute("data-ap-undo")]; apSave(dec); paint(); return true; }
      if (t.closest("[data-ap-all]")) {
        (AP.doc && AP.doc.items || []).forEach(function (x) { if (!dec[x.id]) dec[x.id] = { d: "ok", at: Date.now() }; });
        apSave(dec); paint(); if (window.TNApp) TNApp.toast("이 기기에 OK 로 표시했어요. '결정 복사'를 봇에게 보내 주세요", 3200); return true;
      }
      if (t.closest("[data-ap-copy]")) {
        var tx = ($("apTxt") || {}).textContent || "";
        var done = function () { if (window.TNApp) TNApp.toast("복사했어요. 봇과의 대화창에 붙여 넣어 주세요", 2600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(done, function () { window.prompt("아래 글을 복사해 주세요", tx); });
        else window.prompt("아래 글을 복사해 주세요", tx);
        return true;
      }
      if (t.closest("[data-rp-reload]")) { rpLoad(true); paint(); return true; }
      if ((el = t.closest("[data-pf-close],[data-pf-undo]"))) {   // 🚫 폐업 확인 → 보관함 / 되돌리기(지우기 없음)
        var pid = el.getAttribute("data-pf-close") || el.getAttribute("data-pf-undo"), pd = pfDec(), cl = el.hasAttribute("data-pf-close");
        if (cl) pd[pid] = "closed"; else delete pd[pid];
        pfSave(); delete PF.st[pid]; pfWrite(pid, +el.getAttribute("data-pf-n") || 0, cl ? "closed" : ""); paint(); return true;
      }
      if (t.closest("[data-pf-copy]")) { var pt = document.getElementById("pfTxt"); if (pt && navigator.clipboard) navigator.clipboard.writeText(pt.textContent).catch(function () {}); return true; }
      if (t.closest("[data-ap-reload]")) { AP.doc = null; AP.err = null; apLoad(true); paint(); return true; }
      return false;
    }
  });
})();
