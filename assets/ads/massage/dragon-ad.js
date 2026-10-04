/* 드래곤 스웨디시(Dragon Swedish, 파타야) sponsored banner renderer.
   Usage:  <link rel="stylesheet" href="assets/ads/massage/dragon-ad.css">
           <div data-dragon-ad="large" data-target="부동산"></div>   (large | strip | small | bar; data-target = '이 자리 추천 업종' 꼬리표)
           <script src="assets/ads/massage/dragon-ad.js" defer></script>
   Reads ad.json next to this script. Kakao / LINE buttons render only when
   kakao_url / line_url are non-empty (add data-preview to show '#' placeholders). */
(function () {
  "use strict";
  /* ★ 배너 스타일 스위치(2026-10-05 민구님 지시 — 최종 하나 고르면 이 한 줄만 바꾸기)
       "mix"    = 자리마다 다른 스타일(비교용, 기본값): 맨 위 띠 A · 메인 큰 배너 B · 기사 사이 1번째 C · 2번째 D · 3번째 A · 한국 뉴스 사이 B · 메뉴 서랍 C · 맨 아래 띠 D
       "rotate" = 들어올 때마다 A→B→C→D 차례로(한 화면 안 모든 자리는 같은 스타일)
       "A" 검정+금색(호텔 스파) · "B" 짙은 남색+금색 · "C" 와인+크림 · "D" 흰 카드+강한 빨강+큰 버튼  → 그 스타일로 모든 자리 고정
       "off"    = 10-05 02:37 이전 모양(모던 = 흰 카드, 클래식 = 어두운 빨강+금색)
     미리 보기만(저장 안 됨): 주소 끝에 ?dragon=A (B·C·D·rotate·mix·off) */
  var DRAGON_STYLE = "mix";
  var STYLES = ["A", "B", "C", "D"];
  var MIX = { "top:0": "A", "mid:0": "B", "infeed:0": "C", "infeed:1": "D", "infeed:2": "A", "korea-mid:0": "B", "drawer:0": "C", "footer:0": "D" };
  try { var qs = /[?&]dragon=(A|B|C|D|rotate|mix|off)\b/.exec(location.search); if (qs) DRAGON_STYLE = qs[1]; } catch (e) {}
  var ROT = 0;
  if (DRAGON_STYLE === "rotate") { try { ROT = (+localStorage.getItem("tnk.dm.rot") || 0) + 1; localStorage.setItem("tnk.dm.rot", String(ROT % 1000)); } catch (e) {} }
  /* key = "자리 id:몇 번째"(예: infeed:1). 반환 = "A".."D" 또는 ""(예전 모양) */
  function pickStyle(key) {
    if (DRAGON_STYLE === "off") return "";
    if (STYLES.indexOf(DRAGON_STYLE) >= 0) return DRAGON_STYLE;
    if (DRAGON_STYLE === "rotate") return STYLES[ROT % 4];
    key = String(key || "");
    if (MIX[key]) return MIX[key];
    for (var h = 0, i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;   // 내 주변·지역 칸 = 자리 이름으로 고정(새로고침해도 같음)
    return STYLES[h % 4];
  }
  var me = document.currentScript;
  var BASE = me && me.src ? new URL(".", me.src).href : "assets/ads/massage/";
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var I = {
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fee500" d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.6c-.1.4.3.6.6.4l4.2-2.8h1c5 0 9-3.2 9-7.1S17 3.5 12 3.5z"/></svg>',
    line: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#06c755"/><path fill="#fff" d="M12 6.3c-3.6 0-6.4 2.3-6.4 5.2 0 2.6 2.3 4.7 5.4 5.1.5.1.5.5.4 1l-.1.6c0 .3.3.4.6.3 2.3-1.3 6.5-3.9 6.5-7 0-2.9-2.8-5.2-6.4-5.2z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="#e9c46a" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#e9c46a" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="#e9c46a" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>'
  };

  /* 이 자리 추천 업종 꼬리표(광고 바로 위, 광고를 가리지 않음) */
  function targetHTML(target) {
    return target ? '<p class="dm-target"><span aria-hidden="true">📢</span> 이 자리 추천 업종: <b>' + esc(target) + "</b></p>" : "";
  }

  /* variant: large | strip | small | bar
     opt: {preview:bool(카톡·라인 '#' 자리표시), fixedHeight:number(px), base:string, target:string(추천 업종 꼬리표)} */
  function html(ad, variant, opt) {
    opt = opt || {};
    var base = opt.base || BASE;
    var d = ad.display || {};
    var v = /^(large|strip|small|bar)$/.test(variant) ? variant : "large";
    var ext = ' target="_blank" rel="sponsored noopener"';
    var btn = function (kind, href, label, aria, external) {
      var ic = kind === "map" ? '<span class="dm-btn__e" aria-hidden="true">📍</span>' : kind === "tel" ? '<span class="dm-btn__e" aria-hidden="true">📞</span>' : I[kind];
      if (href === "#") return '<a class="dm-btn dm-btn--' + kind + '" href="#" data-placeholder aria-disabled="true" title="링크 준비 중" aria-label="' +
        esc(aria) + ' (준비 중)">' + ic + "<span>" + esc(label) + "</span></a>";
      return '<a class="dm-btn dm-btn--' + kind + '" href="' + esc(href) + '"' + (external ? ext : ' rel="sponsored"') +
        ' aria-label="' + esc(aria) + '">' + ic + "<span>" + esc(label) + "</span></a>";
    };
    var b = [btn("map", ad.link, "지도", "Google 지도에서 위치 보기", true),
             btn("tel", ad.tel, "전화", "전화 걸기 " + (d.phone_display || ""), false)];
    var kakao = ad.kakao_url || (opt.preview ? "#" : "");
    var line = ad.line_url || (opt.preview ? "#" : "");
    if (v !== "bar") {   /* 얇은 띠(bar)는 지도·전화 두 개만 */
      if (kakao) b.push(btn("kakao", kakao, "카톡 문의", "카카오톡으로 문의", true));
      if (line) b.push(btn("line", line, "라인 문의", "LINE으로 문의", true));
    }
    var chips = [["clock", d.hours_short], ["star", d.rating_short], ["pin", d.area_short]]
      .filter(function (c) { return c[1]; })
      .map(function (c) { return '<li class="dm-ad__chip">' + I[c[0]] + esc(c[1]) + "</li>"; }).join("");
    var st = /^[ABCD]$/.test(opt.style || "") ? opt.style : "";
    var sAttr = st ? ' data-dm-s="' + st + '"' : "";
    var fixed = opt.fixedHeight ? ' dm-ad--fixed" style="--dm-h:' + (+opt.fixedHeight) + 'px' : "";
    var tag = '<span class="dm-ad__tag">' + esc(ad.label || "광고") + "</span>";
    var body = v === "bar"
      ? '<div class="dm-ad__body"><p class="dm-ad__name">' + tag + " " + esc(d.name_lead) + " <b>" + esc(d.name_main) + "</b></p>" +
        '<p class="dm-ad__copy"><span>' + esc(d.area_city || d.area_short) + "</span> · <span>" + esc(d.hours_short) + "</span>" +
        '<span class="dm-ad__more"> · ' + [d.rating_short, d.phone_display].filter(Boolean).map(esc).join(" · ") + "</span></p></div>"
      : tag + '<div class="dm-ad__body"><p class="dm-ad__en">' + esc(d.brand_en) + "</p>" +
        '<p class="dm-ad__name">' + esc(d.name_lead) + " <b>" + esc(d.name_main) + "</b></p>" +
        '<p class="dm-ad__copy">' + esc(v === "small" ? d.copy_short || d.copy : d.copy) + "</p></div>" +
        '<ul class="dm-ad__chips">' + chips + "</ul>";
    return targetHTML(opt.target) +
      '<aside class="dm-ad dm-ad--' + v + fixed + '"' + sAttr + ' aria-label="' + esc(ad.label || "광고") + ": " + esc(ad.title) + '">' +
      '<div class="dm-ad__in">' +
      '<a class="dm-ad__cover" href="' + esc(ad.link) + '"' + ext + ' aria-label="' + esc(ad.title) + ' – Google 지도 보기"></a>' +
      '<img class="dm-ad__art" src="' + esc(base + "dragon.svg") + '" alt="" width="760" height="600" loading="lazy" decoding="async" aria-hidden="true">' +
      body +
      '<div class="dm-ad__cta">' + b.join("") + "</div>" +
      "</div></aside>";
  }

  /* 사이트 광고 자리(data/ads.json item.render === "dragon")용: data/ads.js 에 같이 실린 ad.json(window.TN_ADS.dragon)으로 바로(동기) 그린다.
     못 그리면 null → 호출 쪽이 일반 카드로 대신 그림 */
  function slotHTML(item, key) {
    var ad = window.TN_ADS && window.TN_ADS.dragon;
    if (!ad || !item) return null;
    return html(ad, item.variant || "small", { preview: !!item.preview, target: item.target || item.category || "", style: pickStyle(key) });
  }

  var cache = null;
  function load() {
    if (!cache && window.TN_ADS && window.TN_ADS.dragon) cache = Promise.resolve(window.TN_ADS.dragon);
    if (!cache) cache = fetch(BASE + "ad.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("ad.json " + r.status);
      return r.json();
    });
    return cache;
  }

  function mount(el, opt) {
    opt = opt || {};
    var variant = opt.variant || el.getAttribute("data-dragon-ad") || "large";
    var preview = opt.preview != null ? opt.preview : el.hasAttribute("data-preview");
    var fh = opt.fixedHeight || +el.getAttribute("data-fixed-height") || 0;
    var target = opt.target != null ? opt.target : el.getAttribute("data-target") || "";
    return (opt.data ? Promise.resolve(opt.data) : load()).then(function (ad) {
      el.innerHTML = html(ad, variant, { preview: preview, fixedHeight: fh, base: opt.base, target: target, style: opt.style != null ? opt.style : pickStyle(opt.key || el.getAttribute("data-dm-key") || "") });
      el.addEventListener("click", function (e) {           /* '#' placeholders (preview) do nothing */
        var t = e.target.closest && e.target.closest("a[data-placeholder]");
        if (t) e.preventDefault();
      });
      return el;
    }).catch(function (e) { el.hidden = true; if (window.console) console.warn("[dragon-ad]", e); });
  }

  function auto() {
    var els = document.querySelectorAll("[data-dragon-ad]:not([data-dragon-ad-done])");
    for (var i = 0; i < els.length; i++) { els[i].setAttribute("data-dragon-ad-done", ""); mount(els[i]); }
  }
  window.DragonAd = { style: function () { return DRAGON_STYLE; }, pickStyle: pickStyle, html: html, slotHTML: slotHTML, targetHTML: targetHTML, mount: mount, load: load, auto: auto, base: BASE };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
