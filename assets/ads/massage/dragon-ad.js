/* Dragon Massage sponsored banner renderer.
   Usage:  <link rel="stylesheet" href="assets/ads/massage/dragon-ad.css">
           <div data-dragon-ad="large"></div>   (large | strip | small)
           <script src="assets/ads/massage/dragon-ad.js" defer></script>
   Reads ad.json next to this script. Kakao / LINE buttons render only when
   kakao_url / line_url are non-empty (add data-preview to show '#' placeholders). */
(function () {
  "use strict";
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

  /* opt: {preview:bool, fixedHeight:number(px), base:string} */
  function html(ad, variant, opt) {
    opt = opt || {};
    var base = opt.base || BASE;
    var d = ad.display || {};
    var v = /^(large|strip|small)$/.test(variant) ? variant : "large";
    var ext = ' target="_blank" rel="sponsored noopener"';
    var btn = function (kind, href, label, aria, external) {
      if (href === "#") return '<a class="dm-btn dm-btn--' + kind + '" href="#" data-placeholder aria-disabled="true" title="링크 준비 중" aria-label="' +
        esc(aria) + ' (준비 중)">' + I[kind] + "<span>" + esc(label) + "</span></a>";
      return '<a class="dm-btn dm-btn--' + kind + '" href="' + esc(href) + '"' + (external ? ext : ' rel="sponsored"') +
        ' aria-label="' + esc(aria) + '">' + I[kind] + "<span>" + esc(label) + "</span></a>";
    };
    var b = [btn("map", ad.link, "지도 보기", "Google 지도에서 위치 보기", true),
             btn("tel", ad.tel, "예약 문의", "전화로 예약 문의 " + (d.phone_display || ""), false)];
    var kakao = ad.kakao_url || (opt.preview ? "#" : "");
    var line = ad.line_url || (opt.preview ? "#" : "");
    if (kakao) b.push(btn("kakao", kakao, "카톡 문의", "카카오톡으로 문의", true));
    if (line) b.push(btn("line", line, "라인 문의", "LINE으로 문의", true));
    var chips = [["clock", d.hours_short], ["star", d.rating_short], ["pin", d.area_short]]
      .filter(function (c) { return c[1]; })
      .map(function (c) { return '<li class="dm-ad__chip">' + I[c[0]] + esc(c[1]) + "</li>"; }).join("");
    var fixed = opt.fixedHeight ? ' dm-ad--fixed" style="--dm-h:' + (+opt.fixedHeight) + 'px' : "";
    return '<aside class="dm-ad dm-ad--' + v + fixed + '" aria-label="' + esc(ad.label || "광고") + ": " + esc(ad.title) + '">' +
      '<div class="dm-ad__in">' +
      '<a class="dm-ad__cover" href="' + esc(ad.link) + '"' + ext + ' aria-label="' + esc(ad.title) + ' – Google 지도 보기"></a>' +
      '<img class="dm-ad__art" src="' + esc(base + "dragon.svg") + '" alt="" width="760" height="600" aria-hidden="true">' +
      '<span class="dm-ad__tag">' + esc(ad.label || "광고") + "</span>" +
      '<div class="dm-ad__body"><p class="dm-ad__en">' + esc(d.brand_en) + "</p>" +
      '<p class="dm-ad__name">' + esc(d.name_lead) + " <b>" + esc(d.name_main) + "</b></p>" +
      '<p class="dm-ad__copy">' + esc(v === "small" ? d.copy_short || d.copy : d.copy) + "</p></div>" +
      '<ul class="dm-ad__chips">' + chips + "</ul>" +
      '<div class="dm-ad__cta">' + b.join("") + "</div>" +
      "</div></aside>";
  }

  var cache = null;
  function load() {
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
    return (opt.data ? Promise.resolve(opt.data) : load()).then(function (ad) {
      el.innerHTML = html(ad, variant, { preview: preview, fixedHeight: fh, base: opt.base });
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
  window.DragonAd = { html: html, mount: mount, load: load, auto: auto, base: BASE };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
