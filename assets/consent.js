/* 쿠키 동의 + 구글 애널리틱스(GA4) + 애드센스 불러오기(2026-10-25 Claude, KSTAR 먼저).
 * 판 설정에 ga4("G-…") 나 adsense({"pub":"ca-pub-…"}) 가 있을 때만 tools/site_build.py 가 그 판 index.html 에 붙임(한국판엔 없음).
 * - 처음 온 독자: 고르기 전엔 맞춤 아닌 광고만·통계 없음, 아래쪽에 짧은 안내(읽기를 막지 않음). '모두 허용' = 통계 + 맞춤 광고, '필수만' = 통계 안 씀 + 맞춤 아닌 광고.
 * - 고른 값은 이 기기에만(localStorage tnk.consent.v1). 다시 고르기: TNConsent.open() (개인정보 쪽 링크·설정 창에서 부름)
 * - 전면 광고·팝업 광고는 쓰지 않는다(운영자 규칙) — 자동 광고를 쓰면 애드센스 화면에서 '본문 안 광고'만 켤 것. */
(function () {
  "use strict";
  var SITE = window.TN_SITE || {}, GA = SITE.ga4 || "", AD = (SITE.adsense && SITE.adsense.pub) || "";
  if ((!GA && !AD) || window.TNConsent) return;
  var T = window.TNI || function (k, d) { return d; };
  var KEY = "tnk.consent.v1", loaded = { ga: false, ad: false };
  function get() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function put(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function addScript(src, attrs) {
    var s = document.createElement("script"); s.async = true; s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s); return s;
  }
  function apply(v) {
    // 통계: '모두 허용'일 때만. 허용했다가 '필수만'으로 바꾸면 이미 불러온 GA 도 바로 멈춤(ga-disable + 동의 상태 갱신 — Codex 리뷰 10-25)
    if (GA) window["ga-disable-" + GA] = v !== "all";
    if (loaded.ga && window.gtag) window.gtag("consent", "update", { analytics_storage: v === "all" ? "granted" : "denied" });
    if (GA && v === "all" && !loaded.ga && /^G-[A-Z0-9]+$/.test(GA)) {
      loaded.ga = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", GA, { anonymize_ip: true });
      addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA));
    }
    if (AD) { window.adsbygoogle = window.adsbygoogle || []; window.adsbygoogle.requestNonPersonalizedAds = v === "all" ? 0 : 1; }
    if (AD && !loaded.ad && /^ca-pub-\d+$/.test(AD)) {
      loaded.ad = true;
      addScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(AD), { crossorigin: "anonymous" });
    }
  }
  var css = ".tn-consent{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:1300;max-width:520px;margin:0 auto;" +
    "background:var(--kcard,#fff);color:var(--kink,#1f2937);border:1px solid var(--kline,#e5e7eb);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:14px 14px 12px;font-size:.875rem;line-height:1.5}" +
    "body.has-tabbar .tn-consent{bottom:calc(72px + env(safe-area-inset-bottom))}" +
    ".tn-consent p{margin:0 0 10px}.tn-consent a{color:var(--kac,#0b2a4a)}" +
    ".tn-consent__b{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}" +
    ".tn-consent__b button{font:inherit;font-weight:700;border-radius:999px;padding:8px 14px;cursor:pointer;border:1px solid var(--kline,#d0d5dd);background:var(--kchip,#f3f4f6);color:var(--kink,#1f2937)}" +
    ".tn-consent__b button[data-c=all]{background:var(--kac,#0b2a4a);border-color:var(--kac,#0b2a4a);color:#fff}";
  function open() {
    if (document.getElementById("tnConsent")) return;
    if (!document.getElementById("tnConsentCss")) { var st = document.createElement("style"); st.id = "tnConsentCss"; st.textContent = css; document.head.appendChild(st); }
    var box = document.createElement("div"); box.id = "tnConsent"; box.className = "tn-consent"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", T("consent.aria", "쿠키 사용 안내"));
    box.innerHTML = "<p>" + T("consent.text", "방문 통계와 광고에 쿠키를 써요. 고르지 않아도 기사는 그대로 볼 수 있어요.") +
      ' <a href="privacy.html">' + T("consent.more", "자세히") + "</a></p>" +
      '<div class="tn-consent__b"><button type="button" data-c="min">' + T("consent.min", "필수만") + '</button><button type="button" data-c="all">' + T("consent.all", "모두 허용") + "</button></div>";
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]"); if (!b) return;
      var v = b.getAttribute("data-c"); put(v); box.remove(); apply(v);
    });
    document.body.appendChild(box);
  }
  window.TNConsent = { open: open, value: get };
  var v = get();
  // 고르기 전: 맞춤이 아닌 광고만(통계는 안 씀). 고르면 그대로 바뀜
  apply(v || "min");
  if (!v || /[?&]consent=1(&|$)/.test(location.search)) window.addEventListener("load", function () { setTimeout(open, v ? 300 : 1200); });   // ?consent=1 = 다시 고르기(개인정보 쪽 링크)
})();
