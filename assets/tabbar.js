/* 하단 탭바(2026-10-25 Claude, KSTAR 먼저) — 판 설정 tabbar 가 있는 판만. tools/site_build.py 가 그 판 index.html 에만 이 파일을 붙임(한국판엔 없음).
 * 설정 예: "tabbar": ["home", "bias", "cal", "jobs", "me"]
 *   home = 뉴스 맨 위(열린 페이지 닫기) · me = 설정 창 · 나머지 = TNPages 페이지(#bias·#cal·#jobs …)
 *   링크 탭(2026-10-26): 판 설정 "tablinks": {"survey": {"href": "survey.html"}} — 누르면 그 주소로 이동. 아이콘은 ICON 에 있으면 그것, 없으면 icon 값(svg 안쪽) 또는 기본 말풍선.
 * 페이지가 아직 없는 탭은 '준비 중' 페이지를 대신 등록(진짜 모듈이 같은 이름으로 register 하면 덮어씀).
 * 색은 판 겉모습 변수(--kac·--kcard·--kline·--kink·--kmuted)를 쓰고, 없으면 기본색. */
(function () {
  "use strict";
  var SITE = window.TN_SITE || {}, LIST = SITE.tabbar, LINKS = SITE.tablinks || {};
  if (!Array.isArray(LIST) || !LIST.length || document.getElementById("tnTabbar")) return;
  var T = window.TNI || function (k, d) { return d; };
  var ICON = {
    home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"/>',
    bias: '<path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/>',
    cal: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    jobs: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17"/>',
    me: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c.6-4 3.8-6 7.5-6s6.9 2 7.5 6"/>',
    hearts: '<path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/>',
    survey: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8.5h6M9 12.5h6M9 16.5h3.5"/>'
  };
  Object.keys(LINKS).forEach(function (k) {
    if (!ICON[k]) ICON[k] = LINKS[k].icon || '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/>';
  });
  var LABEL = {
    home: T("tabbar.home", "홈"), bias: T("tabbar.bias", "최애"), cal: T("tabbar.cal", "일정"),
    jobs: T("tabbar.jobs", "구인"), me: T("tabbar.me", "내 정보"), hearts: T("tabbar.hearts", "저장"),
    survey: T("tabbar.survey", "설문")
  };
  Object.keys(LINKS).forEach(function (k) { if (!LABEL[k]) LABEL[k] = T("tabbar." + k, k); });
  var SOON = {
    bias: { t: T("tabbar.bias_t", "내 최애"), b: T("tabbar.bias_b", "좋아하는 아티스트를 고르면 그 아티스트 기사와 일정만 모아 보여 드려요. 곧 열려요.") },
    cal: { t: T("tabbar.cal_t", "일정"), b: T("tabbar.cal_b", "태국 공연·팬미팅·티켓 오픈·컴백·생일 일정을 한곳에 모아요. 곧 열려요.") },
    jobs: { t: T("tabbar.jobs_t", "구인·구직"), b: T("tabbar.jobs_b", "태국 안의 한국 관련 일자리를 모아요. 곧 열려요.") }
  };

  var css = "body.has-tabbar{padding-bottom:calc(64px + env(safe-area-inset-bottom))}" +
    ".tn-tabbar{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;justify-content:space-around;align-items:stretch;" +
    "height:calc(60px + env(safe-area-inset-bottom));padding:0 4px env(safe-area-inset-bottom);" +
    "background:var(--kcard,#fff);border-top:1px solid var(--kline,rgba(0,0,0,.1));box-shadow:0 -4px 18px rgba(0,0,0,.06)}" +
    ".tn-tabbar__b{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;" +
    "border:0;background:none;font:inherit;font-size:.6875rem;line-height:1.1;color:var(--kmuted,#6b7280);cursor:pointer;padding:6px 2px;-webkit-tap-highlight-color:transparent}" +
    ".tn-tabbar__b svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
    ".tn-tabbar__b span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".tn-tabbar__b[aria-current=page]{color:var(--kac,#0b2a4a);font-weight:700}" +
    ".tn-tabbar__b[aria-current=page] svg{stroke-width:2.2}" +
    ".tn-tabbar__b:focus-visible{outline:2px solid var(--kac,#0b2a4a);outline-offset:-4px;border-radius:10px}" +
    "body.has-tabbar .to-top{bottom:calc(74px + env(safe-area-inset-bottom))}" +
    "body.has-tabbar .nb-page,body.has-tabbar .tn-page{bottom:calc(60px + env(safe-area-inset-bottom))}" +
    ".tn-soon{padding:28px 6px;text-align:center;color:var(--kmuted,#6b7280);line-height:1.7}" +
    ".tn-soon svg{width:44px;height:44px;fill:none;stroke:var(--kac,#0b2a4a);stroke-width:1.6;margin-bottom:10px}" +
    "@media (min-width:900px){.tn-tabbar{left:50%;right:auto;transform:translateX(-50%);width:520px;border:1px solid var(--kline,rgba(0,0,0,.1));border-bottom:0;border-radius:18px 18px 0 0}}" +
    "@media print{.tn-tabbar{display:none}}";
  var st = document.createElement("style"); st.id = "tnTabbarCss"; st.textContent = css; document.head.appendChild(st);

  var nav = document.createElement("nav");
  nav.className = "tn-tabbar"; nav.id = "tnTabbar"; nav.setAttribute("aria-label", T("tabbar.aria", "주요 메뉴"));
  nav.innerHTML = LIST.filter(function (k) { return ICON[k]; }).map(function (k) {
    return '<button type="button" class="tn-tabbar__b" data-tab="' + k + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + "</svg><span>" + LABEL[k] + "</span></button>";
  }).join("");
  document.body.appendChild(nav);
  document.body.classList.add("has-tabbar");

  function current() {
    var p = window.TNPages && TNPages.current();
    if (p && LIST.indexOf(p) >= 0) return p;
    return p ? "" : "home";
  }
  function mark() {
    var c = current();
    nav.querySelectorAll("[data-tab]").forEach(function (b) {
      if (b.getAttribute("data-tab") === c) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  function soonPages() {
    if (!window.TNPages) return;
    Object.keys(SOON).forEach(function (k) {
      if (LIST.indexOf(k) < 0 || TNPages.has(k)) return;
      TNPages.register(k, {
        title: SOON[k].t, soon: true,
        render: function () { return '<div class="tn-soon"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + "</svg><p>" + TNPages.esc(SOON[k].b) + "</p></div>"; }
      });
    });
    mark();
  }
  function withPages(f) {
    if (window.TNPages) { soonPages(); f(); return; }
    if (window.TNLate) window.TNLate();
    var n = 0, iv = setInterval(function () { if (window.TNPages || ++n > 50) { clearInterval(iv); if (window.TNPages) { soonPages(); f(); } } }, 100);
  }
  function go(k) {
    if (LINKS[k] && LINKS[k].href) { location.href = LINKS[k].href; return; }
    if (k === "home") {
      if (window.TNPages && TNPages.current()) TNPages.close();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(mark, 50); return;
    }
    if (k === "me") {
      if (window.TNPages && TNPages.current()) TNPages.close();
      var s = document.querySelector("[data-open-settings]"); if (s) s.click();
      return;
    }
    withPages(function () { if (TNPages.current() === k) { TNPages.refresh(); return; } TNPages.open(k); setTimeout(mark, 50); });
  }
  nav.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) go(b.getAttribute("data-tab")); });
  window.addEventListener("hashchange", function () { setTimeout(mark, 30); });
  window.addEventListener("popstate", function () { setTimeout(mark, 30); });
  // pages.js 는 늦게 불러옴 — 오면 준비 중 페이지 등록(주소가 #cal 등으로 열렸을 때도)
  var tries = 0, w = setInterval(function () { if (window.TNPages) { clearInterval(w); soonPages(); } else if (++tries > 100) clearInterval(w); }, 150);
  mark();
  window.TNTabbar = { mark: mark };
})();
