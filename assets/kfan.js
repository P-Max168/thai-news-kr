/* 팬 기능(2026-10-25 Claude, KSTAR 먼저): 최애(เมน) 아티스트 · 아티스트 화면 · 일정 캘린더.
 * 판 설정 fan = {"artists": "data/artists.json", "schedule": "data/schedule.json"} 이 있는 판만 tools/site_build.py 가 이 파일을 붙임(한국판엔 없음).
 * 데이터(판 저장소 수집기가 만듦):
 *   artists.json = {updated, artists:[{id, n(영문), th, ko, t:"g"|"p"|"a"(그룹·멤버·배우), g:[그룹 id], m:[멤버 id], b:"MM-DD", thai:bool}],
 *                   news:{id:[{e:판 id, s:기사 id, h:제목, d:"YYYY-MM-DD"}]}}
 *   schedule.json = {updated, events:[{d:"YYYY-MM-DD", tm:"HH:MM", k:종류, a:[아티스트 id], t:제목, p:장소, c:"TH"|"KR"|…, u:출처 주소}]}
 * 최애 목록은 이 기기 TNStore ui.bias(아티스트 id 배열). 페이지: #bias(최애·아티스트 찾기·아티스트 화면), #cal(일정)
 * 기사 카드의 아티스트 칩(data-artist)을 누르면 #bias 아티스트 화면으로. */
(function () {
  "use strict";
  var SITE = window.TN_SITE || {}, CFG = SITE.fan;
  if (!CFG || window.TNFan) return;
  var T = window.TNI || function (k, d) { return d; }, S = window.TNStore;
  var A = null, SCH = null, BY = {}, loading = null, view = { artist: null, q: "", cal: "all" };
  var KIND = {
    concert: ["🎤", T("fan.k_concert", "콘서트")], fanmeet: ["🤝", T("fan.k_fanmeet", "팬미팅")], ticket: ["🎟️", T("fan.k_ticket", "티켓 오픈")],
    comeback: ["💿", T("fan.k_comeback", "컴백")], release: ["🎵", T("fan.k_release", "발매")], award: ["🏆", T("fan.k_award", "시상식")],
    tv: ["📺", T("fan.k_tv", "방송")], drama: ["🎬", T("fan.k_drama", "드라마·영화")], birthday: ["🎂", T("fan.k_birthday", "생일")], other: ["📌", T("fan.k_other", "일정")]
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function bias() { var d = S && S.get(); return (d && d.ui && Array.isArray(d.ui.bias)) ? d.ui.bias : []; }
  function isBias(id) { return bias().indexOf(id) >= 0; }
  function toggleBias(id) {
    if (!S) return;
    S.update(function (d) {
      d.ui = d.ui || {}; var b = Array.isArray(d.ui.bias) ? d.ui.bias.slice() : [], i = b.indexOf(id);
      if (i >= 0) b.splice(i, 1); else b.unshift(id);
      d.ui.bias = b.slice(0, 30);
    });
    if (window.TNApp && TNApp.toast) TNApp.toast(isBias(id) ? T("fan.followed", "최애에 추가했어요 💜") : T("fan.unfollowed", "최애에서 뺐어요"), 1600);
  }
  function getJSON(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function load() {
    if (loading) return loading;
    loading = Promise.all([getJSON(CFG.artists).catch(function () { return { artists: [], news: {} }; }), getJSON(CFG.schedule).catch(function () { return { events: [] }; })])
      .then(function (r) { A = r[0] || { artists: [] }; SCH = r[1] || { events: [] }; BY = {}; (A.artists || []).forEach(function (x) { BY[x.id] = x; }); refresh(); });
    return loading;
  }
  function refresh() { if (window.TNPages && /^(bias|cal)$/.test(TNPages.current() || "")) TNPages.refresh(); }
  function name(x) { return x ? (x.th && x.th !== x.n ? esc(x.n) + ' <small>' + esc(x.th) + "</small>" : esc(x.n)) : ""; }
  function heart(id) {
    var on = isBias(id);
    return '<button type="button" class="kf-heart" data-bias="' + esc(id) + '" aria-pressed="' + on + '" aria-label="' + esc(on ? T("fan.unfollow", "최애에서 빼기") : T("fan.follow", "최애에 추가")) + '">' + (on ? "💜" : "🤍") + "</button>";
  }
  function today() { var o = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; }); return o.year + "-" + o.month + "-" + o.day; }
  function addDays(ymd, n) { var d = new Date(ymd + "T12:00:00+07:00"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function dayLabel(ymd) {
    var d = new Date(ymd + "T12:00:00+07:00");
    return new Intl.DateTimeFormat(T("_locale", "ko-KR"), { timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short" }).format(d);
  }
  // 앞으로 days 일 안의 일정 + 생일(아티스트 목록의 b)
  function upcoming(days, filter) {
    var t0 = today(), t1 = addDays(t0, days), out = [];
    (SCH && SCH.events || []).forEach(function (e) { if (e && e.d >= t0 && e.d <= t1) out.push(e); });
    var y = +t0.slice(0, 4);
    (A && A.artists || []).forEach(function (x) {
      if (!x.b || !/^\d\d-\d\d$/.test(x.b)) return;
      [y, y + 1].forEach(function (yy) { var d = yy + "-" + x.b; if (d >= t0 && d <= t1) out.push({ d: d, k: "birthday", a: [x.id], t: "", bday: true }); });
    });
    if (filter) out = out.filter(filter);
    out.sort(function (a, b) { return (a.d + (a.tm || "")).localeCompare(b.d + (b.tm || "")); });
    return out;
  }
  function evRow(e) {
    var k = KIND[e.k] || KIND.other, names = (e.a || []).map(function (id) { return BY[id] ? esc(BY[id].n) : ""; }).filter(Boolean).join(", ");
    var title = e.bday ? T("fan.bday_of", "{n} 생일").replace("{n}", names) : esc(e.t || names);
    return '<li class="kf-ev' + (e.c === "TH" ? " kf-ev--th" : "") + '"><span class="kf-ev__k" aria-hidden="true">' + k[0] + '</span><div class="kf-ev__b"><b>' + title + "</b>" +
      '<small>' + esc(k[1]) + (e.tm ? " · " + esc(e.tm) : "") + (e.p ? " · " + esc(e.p) : "") + (e.c === "TH" ? ' · <em class="kf-th">' + esc(T("fan.in_th", "태국")) + "</em>" : "") + (e.official ? ' · <em class="kf-off">✔ ' + esc(T("fan.official", "공식 일정")) + "</em>" : "") +
      (names && !e.bday && e.t ? " · " + names : "") + "</small>" +
      (e.u && /^https:\/\//.test(e.u) ? '<a class="kf-ev__src" href="' + esc(e.u) + '" target="_blank" rel="noopener">' + esc(T("fan.source", "출처")) + " ↗</a>" : "") + "</div></li>";
  }
  function evList(list) {
    if (!list.length) return '<p class="kf-empty">' + esc(T("fan.no_events", "아직 등록된 일정이 없어요. 새 일정은 기사에서 자동으로 모아요.")) + "</p>";
    var out = "", last = "";
    list.forEach(function (e) { if (e.d !== last) { if (last) out += "</ul>"; out += '<h3 class="kf-day">' + esc(dayLabel(e.d)) + '</h3><ul class="kf-evs">'; last = e.d; } out += evRow(e); });
    return out + "</ul>";
  }
  function newsList(id) {
    var n = (A && A.news && A.news[id]) || [];
    if (!n.length) return '<p class="kf-empty">' + esc(T("fan.no_news", "최근 기사가 아직 없어요.")) + "</p>";
    return '<ul class="kf-news">' + n.slice(0, 15).map(function (x) {
      return '<li><a href="./?e=' + encodeURIComponent(x.e) + "#" + encodeURIComponent(x.s) + '">' + esc(x.h) + "</a><small>" + esc(x.d ? dayLabel(x.d) : "") + "</small></li>";
    }).join("") + "</ul>";
  }
  function artistView(id) {
    var x = BY[id]; if (!x) return '<p class="kf-empty">' + esc(T("fan.not_found", "아티스트를 찾지 못했어요.")) + "</p>";
    var rel = (x.m || []).concat(x.g || []).map(function (r) { return BY[r]; }).filter(Boolean);
    return '<button type="button" class="kf-back" data-artist-back>← ' + esc(T("fan.all", "전체 아티스트")) + "</button>" +
      '<div class="kf-hero"><div><h3>' + name(x) + "</h3>" + (x.ko ? '<p class="kf-ko" lang="ko">' + esc(x.ko) + "</p>" : "") +
      (x.b ? '<p class="kf-meta">🎂 ' + esc(dayLabel(new Date().getFullYear() + "-" + x.b)) + "</p>" : "") + "</div>" + heart(x.id) + "</div>" +
      (rel.length ? '<div class="kf-chips">' + rel.map(function (r) { return '<button type="button" class="kf-chip" data-artist="' + esc(r.id) + '">' + esc(r.n) + "</button>"; }).join("") + "</div>" : "") +
      '<h4 class="kf-h">' + esc(T("fan.upcoming", "다가오는 일정")) + "</h4>" + evList(upcoming(120, function (e) { return (e.a || []).some(function (a) { return a === id || (x.m || []).indexOf(a) >= 0; }); })) +
      '<h4 class="kf-h">' + esc(T("fan.recent", "최근 기사")) + "</h4>" + newsList(id);
  }
  function biasPage() {
    if (!A) { load(); return '<p class="kf-empty">' + esc(T("fan.loading", "불러오는 중…")) + "</p>"; }
    if (view.artist) return artistView(view.artist);
    var mine = bias().map(function (id) { return BY[id]; }).filter(Boolean), q = view.q.trim().toLowerCase();
    // 찾기: 이름(영문·태국어·한국어) 어디든 / 안 찾을 때: 그룹·솔로·배우만(멤버는 그룹 화면에서)
    var all = (A.artists || []).filter(function (x) { return q ? (x.n + " " + (x.th || "") + " " + (x.ko || "")).toLowerCase().indexOf(q) >= 0 : x.t !== "p" || !(x.g && x.g.length); });
    function row(x) { return '<li class="kf-a"><button type="button" class="kf-a__n" data-artist="' + esc(x.id) + '">' + name(x) + "</button>" + heart(x.id) + "</li>"; }
    return '<div class="kf-search"><input type="search" data-fan-q value="' + esc(view.q) + '" placeholder="' + esc(T("fan.search", "아티스트 찾기 (이름)")) + '" aria-label="' + esc(T("fan.search", "아티스트 찾기 (이름)")) + '"></div>' +
      (mine.length ? '<h4 class="kf-h">' + esc(T("fan.mine", "내 최애")) + '</h4><ul class="kf-as">' + mine.map(row).join("") + "</ul>" +
        '<h4 class="kf-h">' + esc(T("fan.mine_upcoming", "내 최애 일정")) + "</h4>" + evList(upcoming(60, function (e) { var b = bias(); return (e.a || []).some(function (a) { return b.indexOf(a) >= 0; }); }))
        : '<p class="kf-hint">' + esc(T("fan.pick_hint", "🤍 를 눌러 최애를 고르면 그 아티스트 일정과 기사를 모아 보여 드려요.")) + "</p>") +
      '<h4 class="kf-h">' + esc(q ? T("fan.results", "찾은 아티스트") : T("fan.popular", "아티스트")) + '</h4><ul class="kf-as">' + all.slice(0, 80).map(row).join("") + "</ul>";
  }
  function calPage() {
    if (!A) { load(); return '<p class="kf-empty">' + esc(T("fan.loading", "불러오는 중…")) + "</p>"; }
    var f = view.cal, b = bias();
    var list = upcoming(60, f === "th" ? function (e) { return e.c === "TH"; } : f === "mine" ? function (e) { return (e.a || []).some(function (a) { return b.indexOf(a) >= 0; }); } : null);
    function tab(k, l) { return '<button type="button" class="kf-tab" data-cal="' + k + '" aria-pressed="' + (f === k) + '">' + esc(l) + "</button>"; }
    return '<div class="kf-tabs">' + tab("all", T("fan.cal_all", "전체")) + tab("th", T("fan.cal_th", "태국")) + tab("mine", T("fan.cal_mine", "내 최애")) + "</div>" +
      evList(list) + '<p class="kf-note">' + esc(T("fan.cal_note", "일정은 공식 발표·기사에서 모아요. 바뀔 수 있으니 출처를 꼭 확인해 주세요.")) + "</p>";
  }
  function click(e, t) {
    var el;
    if ((el = t.closest("[data-bias]"))) { toggleBias(el.getAttribute("data-bias")); TNPages.refresh(); return true; }
    if ((el = t.closest("[data-artist-back]"))) { view.artist = null; TNPages.refresh(); return true; }
    if ((el = t.closest("[data-artist]"))) { view.artist = el.getAttribute("data-artist"); TNPages.refresh(); var r = document.getElementById("tnPage"); if (r) r.scrollTop = 0; return true; }
    if ((el = t.closest("[data-cal]"))) { view.cal = el.getAttribute("data-cal"); TNPages.refresh(); return true; }
    return false;
  }
  function register() {
    TNPages.register("bias", { title: T("fan.bias_title", "내 최애"), render: biasPage, click: click });
    TNPages.register("cal", { title: T("fan.cal_title", "일정"), render: calPage, click: click });
    if (window.TNTabbar) TNTabbar.mark();
  }
  // 검색 칸: 입력할 때마다 목록만 다시 그림(글자 칸 초점 유지)
  document.addEventListener("input", function (e) {
    var q = e.target.closest && e.target.closest("[data-fan-q]"); if (!q) return;
    view.q = q.value; var pos = q.selectionStart; TNPages.refresh();
    var n = document.querySelector("[data-fan-q]"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
  });
  // 기사 카드의 아티스트 칩 → 아티스트 화면
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest(".card [data-artist]"); if (!el) return;
    e.preventDefault(); e.stopPropagation(); view.artist = el.getAttribute("data-artist");
    function go() { load(); TNPages.open("bias"); }
    if (window.TNPages) go(); else { if (window.TNLate) TNLate(); var n = 0, iv = setInterval(function () { if (window.TNPages || ++n > 50) { clearInterval(iv); if (window.TNPages) go(); } }, 100); }
  }, true);
  var css = ".kf-search input{width:100%;box-sizing:border-box;padding:10px 14px;border-radius:999px;border:1px solid var(--kline,#d0d5dd);background:var(--kchip,#f3f4f6);color:var(--kink,#111);font:inherit}" +
    ".kf-h{margin:18px 0 8px;font-size:.9375rem}.kf-as,.kf-evs,.kf-news{list-style:none;margin:0;padding:0}" +
    ".kf-a{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--kline,#eee)}" +
    ".kf-a__n{flex:1;min-width:0;text-align:left;border:0;background:none;font:inherit;font-weight:700;color:var(--kink,#111);cursor:pointer;padding:4px 0}" +
    ".kf-a__n small,.kf-hero small{font-weight:400;color:var(--kmuted,#6b7280);margin-left:6px}" +
    ".kf-heart{border:0;background:none;font-size:1.375rem;cursor:pointer;padding:4px 6px;line-height:1}" +
    ".kf-hint,.kf-empty,.kf-note{color:var(--kmuted,#6b7280);font-size:.875rem;line-height:1.6}.kf-note{margin-top:16px}" +
    ".kf-tabs{display:flex;gap:6px;margin-bottom:6px}.kf-tab{border:1px solid var(--kline,#d0d5dd);background:var(--kchip,#f3f4f6);color:var(--kink,#111);border-radius:999px;padding:6px 14px;font:inherit;font-size:.875rem;cursor:pointer}" +
    ".kf-tab[aria-pressed=true]{background:var(--kac,#0b2a4a);border-color:var(--kac,#0b2a4a);color:#fff;font-weight:700}" +
    ".kf-day{margin:16px 0 6px;font-size:.8125rem;color:var(--kac,#0b2a4a)}" +
    ".kf-ev{display:flex;gap:10px;padding:10px 12px;margin-bottom:6px;border-radius:12px;background:var(--kcard,#fff);border:1px solid var(--kline,#eee)}" +
    ".kf-ev--th{border-color:var(--kac,#0b2a4a)}.kf-ev__k{font-size:1.25rem;line-height:1.3}.kf-ev__b{min-width:0;display:flex;flex-direction:column;gap:2px}" +
    ".kf-ev__b small{color:var(--kmuted,#6b7280)}.kf-th,.kf-off{font-style:normal;font-weight:700;color:var(--kac,#0b2a4a)}.kf-ev__src{font-size:.75rem;color:var(--kac,#0b2a4a)}" +
    ".kf-back{border:0;background:none;color:var(--kac,#0b2a4a);font:inherit;font-weight:700;padding:4px 0;cursor:pointer}" +
    ".kf-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:8px 0}.kf-hero h3{margin:0;font-size:1.375rem}.kf-ko,.kf-meta{margin:4px 0 0;color:var(--kmuted,#6b7280)}" +
    ".kf-chips{display:flex;flex-wrap:wrap;gap:6px}.kf-chip{border:1px solid var(--kline,#d0d5dd);background:var(--kchip,#f3f4f6);color:var(--kink,#111);border-radius:999px;padding:5px 12px;font:inherit;font-size:.8125rem;cursor:pointer}" +
    ".kf-news li{display:flex;flex-direction:column;padding:8px 0;border-bottom:1px solid var(--kline,#eee)}.kf-news a{color:var(--kink,#111);font-weight:600;text-decoration:none}.kf-news small{color:var(--kmuted,#6b7280)}" +
    ".card .kf-achips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}.card .kf-achip{border:1px solid var(--kline,#d0d5dd);background:var(--kchip,#f3f4f6);color:var(--kac,#0b2a4a);border-radius:999px;padding:3px 10px;font:inherit;font-size:.75rem;font-weight:700;cursor:pointer}";
  var st = document.createElement("style"); st.id = "tnFanCss"; st.textContent = css; document.head.appendChild(st);
  if (window.TNPages) register();
  else { var n = 0, iv = setInterval(function () { if (window.TNPages) { clearInterval(iv); register(); } else if (++n > 200) clearInterval(iv); }, 150); }
  window.TNFan = { load: load, bias: bias, toggle: toggleBias };
})();
