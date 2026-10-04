/* 🧪 시안(Max 디자인 지시 10-03 18:45 5번): 아래 탭 5개 + 주제 칩 한 줄 — 라이브 기본 화면엔 안 나옴.
 * 주소 끝에 ?mock=tabs 를 붙였을 때만 app.js 가 이 파일을 불러옴(메뉴·링크 없음). 승인함 #12 결정 전까지 시안.
 * '+ 글쓰기' 떠 있는 버튼은 넣지 않음(떠 있는 요소 금지·글쓰기 기능 없음). 탭은 지금 있는 화면으로만 이동(일자리 = #jobs 시안, 렌트 = #rent 내림 안내, My = ❤️ 하트 목록). */
(function () {
  "use strict";
  if (!/[?&]mock=tabs\b/.test(location.search) || document.getElementById("mockTabs")) return;
  var css = document.createElement("style");
  css.textContent =
    "body.mock-tabs{padding-bottom:calc(64px + env(safe-area-inset-bottom))}" +
    ".mock-flag{display:block;margin:8px 12px 0;padding:6px 10px;border-radius:10px;background:#fff3bf;border:1px solid #ffd43b;color:#5c3d00;font-size:.8125rem;font-weight:700;text-align:center}" +
    ".mock-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 10px;margin:0 0 4px}" +
    ".mock-chips::-webkit-scrollbar{display:none}" +
    ".mock-chip{flex:0 0 auto;min-height:36px;padding:0 13px;border-radius:999px;border:1px solid #cfd6e0;background:#fff;color:#16181d;font:inherit;font-size:.875rem;font-weight:700;white-space:nowrap;cursor:pointer}" +
    ".mock-chip[aria-pressed=true]{background:#0b2a4a;border-color:#0b2a4a;color:#fff}" +
    ".mock-chip[aria-pressed=true]::before{content:'✓ '}" +
    ".mock-bar{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-template-columns:repeat(5,1fr);background:#fff;border-top:1px solid #e2e6ee;padding:4px 4px calc(4px + env(safe-area-inset-bottom))}" +
    ".mock-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-height:52px;border:0;background:none;color:#5f6672;font:inherit;font-size:min(.75rem,12px);font-weight:700;text-decoration:none;cursor:pointer}" +
    ".mock-tab b{font-size:min(1.375rem,22px);line-height:1.1;font-weight:400}" +
    ".mock-tab[aria-current]{color:#0b2a4a}" +
    ".mock-tab[aria-current] span{border-bottom:2px solid #0b2a4a}";
  document.head.appendChild(css);
  document.body.classList.add("mock-tabs");
  var main = document.querySelector("main") || document.body;
  var flag = document.createElement("p"); flag.className = "mock-flag";
  flag.textContent = "🧪 시안 화면 — 아래 탭·주제 칩은 민구님 결정 전 미리 보기예요(실제 사이트엔 아직 없음)";
  main.parentNode.insertBefore(flag, main);
  var TABS = [["🏠", "홈", "#"], ["📍", "업소", "#places"], ["💼", "일자리", "#jobs"], ["🏘️", "렌트", "#rent"], ["👤", "My", "#hearts"]];
  var bar = document.createElement("nav"); bar.className = "mock-bar"; bar.id = "mockTabs"; bar.setAttribute("aria-label", "아래 탭(시안)");
  bar.innerHTML = TABS.map(function (t, i) { return '<a class="mock-tab" href="' + t[2] + '"' + (i === 0 ? ' aria-current="page"' : "") + '><b aria-hidden="true">' + t[0] + "</b><span>" + t[1] + "</span></a>"; }).join("");
  document.body.appendChild(bar);
  bar.addEventListener("click", function (e) {
    var a = e.target.closest(".mock-tab"); if (!a) return;
    [].forEach.call(bar.children, function (x) { x.removeAttribute("aria-current"); }); a.setAttribute("aria-current", "page");
    if (a.getAttribute("href") === "#") { e.preventDefault(); history.replaceState(null, "", location.pathname + location.search); window.dispatchEvent(new HashChangeEvent("hashchange")); scrollTo(0, 0); }
  });
  // 주제 칩 한 줄(지금 ☰ 서랍의 주제와 같은 칸 — 누르면 그 주제 기사만, data-tab 은 app.js 가 처리)
  var CHIPS = [["all", "전체"], ["east", "동부"], ["bangkok", "방콕"], ["visa", "비자"], ["life", "생활·물가"], ["society", "사건사고"], ["weather", "날씨·교통"], ["poleco", "정치·경제"], ["travel", "여행·맛집"]];
  function chips() {
    var title = document.getElementById("feedTitle"); if (!title) return;
    var row = document.getElementById("mockChips");
    if (!row) { row = document.createElement("div"); row.className = "mock-chips"; row.id = "mockChips"; row.setAttribute("role", "group"); row.setAttribute("aria-label", "주제 골라 보기(시안)"); title.parentNode.insertBefore(row, title.nextSibling); }
    var cur = (document.querySelector("#tabs [aria-selected=true], #tabsOther [aria-selected=true]") || {}).getAttribute ? document.querySelector("#tabs [aria-selected=true], #tabsOther [aria-selected=true]").getAttribute("data-tab") : "all";
    row.innerHTML = CHIPS.map(function (c) { return '<button type="button" class="mock-chip" data-tab="' + c[0] + '" aria-pressed="' + (c[0] === cur || (c[0] === "all" && cur === "feed")) + '">' + c[1] + "</button>"; }).join("");
  }
  chips();
  new MutationObserver(function () { chips(); }).observe(document.getElementById("tabs") || document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected"] });
})();
