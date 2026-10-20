/* House campaigns: same selection path for all 16 slot definitions and jobs.
 * Actual viewable events are local diagnostics, never sent to a third party.
 * Disable data/ads.json campaign.enabled to restore the original slot items.
 */
(function () {
  "use strict";
  var chosen = new Map(), seen = new Set(), played = new Set(), nodes = new Map(), payload;
  var session = { selected: {}, rendered: {}, viewable: {}, clicks: {}, fallback: 0 };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  function config() { var a = window.TN_ADS; return a && a.enabled !== false && a.campaign; }
  function active() { var c = config(); return !!(c && c.enabled && window.customElements && window.IntersectionObserver && c.items && c.items.length === 6 && c.items.every(function (x) { return x.approved && x.weight > 0; }) && c.items.reduce(function (s, x) { return s + x.weight; }, 0) === 100); }
  function pick(u, items) {
    if (!(u >= 0 && u < 1)) throw new Error("Invalid random value");
    var total = items.reduce(function (s, x) { return s + x.weight; }, 0), n = u * total;
    for (var i = 0; i < items.length; i++) { if (n < items[i].weight) return items[i]; n -= items[i].weight; }
    return items[items.length - 1];
  }
  function count(kind, brand) {
    session[kind][brand] = (session[kind][brand] || 0) + 1;
    // Bounded per-device, per-day counters; no visitor ID, URLs, location or account.
    try {
      var key = "tnk.ad-diagnostics.v1", day = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Bangkok"}).format(new Date());
      var all = JSON.parse(localStorage.getItem(key) || "{}"), bucket = all[day] || {};
      var metric = kind + ":" + brand; bucket[metric] = (bucket[metric] || 0) + 1; all[day] = bucket;
      Object.keys(all).sort().slice(0, -7).forEach(function (k) { delete all[k]; });
      localStorage.setItem(key, JSON.stringify(all));
    } catch (e) {}
  }
  function renderSlot(sl, key) {
    if (!active() || !sl || sl.enabled === false || !sl.items || !sl.items.length) return null;
    var c = config(), it = chosen.get(key);
    if (!it) {
      it = Object.assign({}, sl.items[0], pick(Math.random(), c.items));
      it.target = ""; it.category = ""; it.preview = false;
      chosen.set(key, it); count("selected", it.id);
    }
    var h = it.render === "dragon" && window.DragonAd && window.DragonAd.slotHTML(it, key);
    if (!h && it.render !== "partner") return null;
    if (!h) h = '<tn-partner-ad brand="' + esc(it.id) + '" variant="' + esc(it.variant || "small") + '"></tn-partner-ad>';
    return { item: it, html: '<div class="tn-campaign" data-tn-key="' + esc(key) + '" data-tn-slot="' + esc(sl.id) + '" data-tn-brand="' + esc(it.id) + '" data-tn-version="' + esc(c.version) + '">' + h + '</div>' };
  }
  function load() {
    if (!payload) {
      var c = config();
      payload = Promise.all([fetch(c.creatives_url).then(function (r) { if (!r.ok) throw new Error("creative HTTP " + r.status); return r.json(); }), fetch(c.css_url).then(function (r) { if (!r.ok) throw new Error("creative CSS HTTP " + r.status); return r.text(); })]);
    }
    return payload;
  }
  function loaded(el) {
    var partner = el.querySelector("tn-partner-ad");
    if (partner) return partner.getAttribute("data-ready") === "1";
    return Array.prototype.every.call(el.querySelectorAll("img"), function (img) { return img.complete && img.naturalWidth > 0; });
  }
  function visible(el) {
    if (!el.isConnected || document.hidden || !loaded(el)) return false;
    var r = el.getBoundingClientRect(), width = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)), height = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    return r.width > 0 && r.height > 0 && width * height / (r.width * r.height) >= .5 && getComputedStyle(el).visibility !== "hidden";
  }
  function check(el) {
    var state = nodes.get(el); if (!state) return;
    if (!state.inView || !visible(el)) { clearTimeout(state.timer); state.timer = null; return; }
    var key = el.getAttribute("data-tn-key");
    if (seen.has(key) || state.timer) return;
    state.timer = setTimeout(function () {
      state.timer = null;
      if (!state.inView || !visible(el) || seen.has(key)) return;
      seen.add(key); var brand = el.getAttribute("data-tn-brand"); count("viewable", brand);
      window.dispatchEvent(new CustomEvent("tn-ad-impression", {detail:{placementKey:key,slotId:el.getAttribute("data-tn-slot"),brandId:brand,creativeVersion:el.getAttribute("data-tn-version"),metric:"50pct-1000ms-foreground-v1",scope:"device-local"}}));
    }, 1000);
  }
  var observer = window.IntersectionObserver && new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { var state = nodes.get(e.target); if (state) { state.inView = e.isIntersecting && e.intersectionRatio >= .5; check(e.target); } });
  }, {threshold:[0,.5,1]});
  function scan() {
    nodes.forEach(function (state, el) { if (!el.isConnected) { clearTimeout(state.timer); observer.unobserve(el); nodes.delete(el); } });
    document.querySelectorAll(".tn-campaign").forEach(function (el) {
      if (!nodes.has(el)) {
        nodes.set(el, {inView:false,timer:null}); observer.observe(el);
        count("rendered", el.getAttribute("data-tn-brand"));
        el.addEventListener("load", function () { check(el); }, true);
      }
      check(el);
    });
  }
  if (window.customElements && !customElements.get("tn-partner-ad")) {
    customElements.define("tn-partner-ad", class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        var host = this, root = host.attachShadow({mode:"open"});
        host.style.display = "block";
        var variant = /^(large|strip|small|bar)$/.test(host.getAttribute("variant")) ? host.getAttribute("variant") : "small";
        // Reserve the same size before the lazy creative payload is ready.
        host.style.minHeight = variant === "bar" ? "100px" : variant === "large" ? "480px" : "230px";
        load().then(async function (values) {
          var templates = values[0], css = values[1], fragment = templates.creatives[host.getAttribute("brand")];
          if (!fragment) throw new Error("Unknown creative");
          root.innerHTML = '<style>' + css + '</style>' + fragment.replace(/\blarge\b/, variant);
          await Promise.all(Array.from(root.querySelectorAll("img")).map(function (img) { return img.decode(); }));
          if (!host.isConnected) return;
          host.style.minHeight = ""; host.setAttribute("data-ready", "1");
          var article = root.querySelector(".ad"), owner = host.closest(".tn-campaign"), motionKey = owner && owner.getAttribute("data-tn-key");
          if (!played.has(motionKey)) {
            var motion = new IntersectionObserver(function (entries) { if (entries.some(function (e) { return e.isIntersecting; })) { if (!played.has(motionKey)) { played.add(motionKey); article.classList.add("is-visible"); } motion.disconnect(); } }, {threshold:.12});
            motion.observe(host); host._motion = motion;
          }
          var wrapper = host.closest(".tn-campaign"); if (wrapper) check(wrapper);
        }).catch(function () {
          if (!host.isConnected) return;
          session.fallback++;
          var wrapper = host.closest(".tn-campaign"), box = document.createElement("div");
          box.innerHTML = window.DragonAd ? DragonAd.slotHTML({variant:variant}, "fallback") || "" : "";
          if (wrapper) { wrapper.setAttribute("data-tn-brand", "dragon"); wrapper.setAttribute("data-tn-fallback", "creative-load"); }
          host.replaceWith(box); scan();
        });
      }
      disconnectedCallback() { if (this._motion) this._motion.disconnect(); }
    });
  }
  if (observer) {
    var queued = false;
    new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; scan(); }); } }).observe(document.documentElement, {childList:true,subtree:true});
    document.addEventListener("visibilitychange", function () { nodes.forEach(function (state, el) { check(el); }); });
    document.addEventListener("click", function (e) {
      var path = e.composedPath(), anchor = path.find(function (n) { return n.tagName === "A"; }), wrapper = path.find(function (n) { return n.classList && n.classList.contains("tn-campaign"); });
      if (anchor && wrapper) count("clicks", wrapper.getAttribute("data-tn-brand"));
    }, true);
  }
  window.TNAds = {active:active, renderSlot:renderSlot, pick:pick, snapshot:function () { return JSON.parse(JSON.stringify({scope:"device-local-not-global",version:config() && config().version,metric:"50pct-1000ms-foreground-v1",counts:session})); }};
})();
