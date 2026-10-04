/* 모던 테마(2026-10-04, 토스·당근 느낌) — 화면 틀의 이모지를 같은 모양 선 아이콘(assets/modern-icons.svg)으로 바꿈.
 * html.th-modern 일 때만 index.html 이 이 파일을 받음(기본 디자인엔 영향 없음). 앱 파일(app.js 등)은 그대로 두고,
 * 새로 그려지는 부분은 MutationObserver 로 그 자리에서(그리기 전에) 바꿈.
 * - ICON: 메뉴·서랍·헤더 칸·버튼·제목 → 이모지를 선 아이콘으로
 * - STRIP: 주제·영향 칩 → 아이콘 없이 글자만(회색 알약). 단 📍지역·📅날짜는 작은 선 아이콘
 * - 기사 본문·제목·댓글 같은 내용 글자는 건드리지 않음(아래 목록에 없는 곳은 그대로) */
(function () {
  "use strict";
  var D = document, SP = "assets/modern-icons.svg?v=3870f482", NS = "http://www.w3.org/2000/svg";
  var MAP = {"📍": "map-pin", "❤": "heart", "🤍": "heart", "♡": "heart", "⭐": "star", "★": "star", "🧩": "sliders-horizontal", "💅": "sparkles", "🐶": "dog", "🍜": "utensils", "🏍": "motorbike", "💆": "hand-heart", "💇": "scissors", "💈": "scissors", "🛒": "shopping-cart", "🚨": "siren", "🌦": "cloud-sun-rain", "🛂": "id-card", "🏖": "tree-palm", "🏝": "tree-palm", "📰": "newspaper", "🏙": "building-2", "⛰": "mountain", "🏛": "landmark", "💬": "message-circle", "📢": "megaphone", "🗣": "megaphone", "📞": "phone", "📅": "calendar", "🗓": "calendar-days", "🙋": "user-round", "💡": "lightbulb", "↗": "arrow-up-right", "🙌": "thumbs-up", "🙅": "thumbs-down", "👍": "thumbs-up", "👎": "thumbs-down", "🆕": "sparkle", "📌": "pin", "📇": "store", "🏪": "store", "🕰": "history", "✈": "plane", "☕": "coffee", "🟢": "dot", "🟠": "dot", "⚪": "dot", "⬜": "square", "💰": "banknote", "🧾": "receipt", "🕒": "clock", "✅": "circle-check", "🗺": "map", "✋": "flag", "🔎": "search", "🔍": "search", "💱": "arrow-left-right", "🚗": "car", "🌧": "cloud-rain", "⚠": "triangle-alert", "🏠": "house", "🏘": "house", "💼": "briefcase", "🧳": "luggage", "👤": "user", "🧑": "user", "🎯": "target", "🏆": "trophy", "📊": "chart-column", "🛡": "shield", "🔒": "lock", "🔗": "link", "📷": "camera", "📲": "smartphone", "📋": "clipboard-list", "📄": "file-text", "🗂": "folder", "😷": "wind", "🙂": "smile", "🙈": "eye-off", "👋": "hand", "✍": "pen-line", "✏": "pencil", "➕": "plus", "🌡": "thermometer", "☀": "sun", "🌤": "cloud-sun", "⛅": "cloud-sun", "☁": "cloud", "⛈": "cloud-lightning", "❄": "snowflake", "🌨": "snowflake", "🌫": "cloud-fog", "🌙": "moon", "☔": "umbrella", "☂": "umbrella", "⛽": "fuel", "⚓": "anchor", "📡": "radio-tower", "🧪": "flask-conical", "📐": "ruler", "✕": "x", "⏸": "pause", "↺": "rotate-ccw"};
  var FILL = { "❤": 1, "🟢": 1, "🟠": 1, "⚪": 1 };
  var KEEP = { "📍": 1, "📅": 1 };
  var ICON = [
    "#heartBtn", ".nb-lab", ".nb-cat", ".dq-btn", ".drawer .tab", ".dr-item", ".drawer__x", ".dm-target", ".dm-btn",
    ".section-title", ".fsec__h", ".pin__h", ".forme__h", ".context > b", ".qr__l", ".vote", ".tool", ".update > b", ".linkbtn",
    ".btn", ".k-card__go", ".card-heart", ".tk-i", ".tk-chip", ".tk-pop", ".korea__more", ".more-btn", ".feed-intro", ".edition-note", ".empty",
    ".nb-page__t", ".nb-back", ".nb-sw", ".nb-go", ".nb-places", ".nb-note", ".nb-how summary", ".nb-sec",
    ".pc-f", ".pc-intro b", ".pc-openonly", ".pc__cat", ".pc__open", ".pc__price", ".pc__info dt", ".pc__btn", ".pc__report", ".pc__old",
    ".pc-empty__e", ".jb-ex", ".hp-n", ".hp-empty__e", ".hp-ic", ".hp-x", ".persona__e", ".tpick__e", ".opt__e", ".int__e", ".setbtn",
    ".sheet__kicker", ".acct-menu", ".ih__icon", ".ihi__ic", ".adm-link", ".ad-h", ".tk-pop__t", ".cmts__h"
  ].join(",");
  var STRIP = [".chip", ".bchip", ".mini", ".impf__c", ".cat-stats .lbl", ".also__m", ".mine__chip"].join(",");
  var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp("(" + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")\uFE0F?( ?)", "g");
  var PICT = /\p{Extended_Pictographic}\uFE0F?(\u200D\p{Extended_Pictographic}\uFE0F?)*( ?)/gu;
  var QUICK = /[\u2190-\u2BFF\u3030\uD83C-\uD83E]/;

  function icon(name, emo, lead) {
    var s = D.createElementNS(NS, "svg"), u = D.createElementNS(NS, "use");
    s.setAttribute("class", "mic mic--" + name + (FILL[emo] ? " mic--fill" : "") + (lead ? " mic--l" : ""));
    s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    u.setAttribute("href", SP + "#i-" + name); s.appendChild(u); return s;
  }
  function fix(t) {
    var v = t.nodeValue; if (!v || !QUICK.test(v)) return;
    var p = t.parentNode; if (!p || p.nodeType !== 1) return;
    var strip = !!p.closest(STRIP), ic = !strip && !!p.closest(ICON); if (!strip && !ic) return;
    var out = [], last = 0, hit = false, m;
    if (strip) {
      PICT.lastIndex = 0;
      while ((m = PICT.exec(v))) {
        var e = m[0].replace(/\uFE0F| $/g, "");
        if (KEEP[e]) continue;
        out.push(v.slice(last, m.index)); last = m.index + m[0].length; hit = true;
      }
    }
    // 아이콘으로 바꿀 것(STRIP 안에서는 📍·📅 만 남아 있음)
    if (hit) { out.push(v.slice(last)); v = out.join(""); out = []; last = 0; }
    RE.lastIndex = 0; var frag = null;
    while ((m = RE.exec(v))) {
      var k = m[1]; if (!MAP[k]) continue;
      if (strip && !KEEP[k]) continue;
      frag = frag || D.createDocumentFragment();
      if (m.index > last) frag.appendChild(D.createTextNode(v.slice(last, m.index)));
      var after = v.slice(m.index + m[0].length);
      frag.appendChild(icon(MAP[k], k, /\S/.test(after) || !!m[2]));
      last = m.index + m[0].length;
    }
    if (frag) { if (last < v.length) frag.appendChild(D.createTextNode(v.slice(last))); p.replaceChild(frag, t); }
    else if (hit) t.nodeValue = v.replace(/^\s+/, "");
  }
  function scan(n) {
    if (n.nodeType === 3) return fix(n);
    if (n.nodeType !== 1 || n.namespaceURI === NS) return;
    var w = D.createTreeWalker(n, NodeFilter.SHOW_TEXT, null), list = [], t;
    while ((t = w.nextNode())) if (QUICK.test(t.nodeValue)) list.push(t);
    for (var i = 0; i < list.length; i++) fix(list[i]);
  }
  var mo = new MutationObserver(function (recs) {
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.type === "characterData") fix(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) scan(r.addedNodes[j]);
    }
  });
  mo.observe(D.documentElement, { childList: true, subtree: true, characterData: true });
  if (D.body) scan(D.body);
  D.addEventListener("DOMContentLoaded", function () {
    scan(D.body);
    var tc = D.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute("content", "#ffffff");
  });
})();
