/* 태국 뉴스 한눈에 — 서비스 워커
 * - 앱 셸(HTML·CSS·JS·아이콘): 캐시 우선. 파일이 바뀌면 tools/stamp_assets.py 가 VERSION 과 ?v= 를 바꿔
 *   새 캐시로 교체된다(배포 스크립트가 자동 실행).
 * - data/korea.json|js(2시간마다 갱신되는 한국 뉴스)·data/ticker.json|js(헤더 시세 칩): 네트워크 우선 + cache:"no-store"(HTTP 캐시도 안 씀)
 * - Open-Meteo(날씨·미세먼지 칩, 다른 도메인)는 가로채지 않음(assets/ticker.js 가 localStorage 에 캐시)
 * - index.html(페이지 이동)·data/*: 네트워크 우선(온라인이면 항상 새로 받음, HTTP 캐시도 재검증),
 *   실패(오프라인)할 때만 마지막으로 받은 캐시를 보여 준다.
 * - 설치 때 최신 판 데이터를 미리 받아 둬서 첫 방문 뒤 바로 오프라인으로 읽을 수 있다.
 * - Google 로그인·Firestore(firebase / googleapis / gstatic SDK / firebaseapp.com / google.com 계정 창)는
 *   절대 가로채거나 캐시하지 않는다(그냥 브라우저가 직접 요청). 글꼴(fonts.googleapis/gstatic)만 예외로 캐시.
 */
var VERSION = "tnk-8c471c51a3";
var SHELL = "shell-" + VERSION, DATA = "data-v1", EXT = "ext-v1";
var SHELL_FILES = [
  "./", "index.html", "manifest.json",
  "assets/style.css?v=fa4e3008", "assets/topics.js?v=8a0d431d", "assets/prefs.js?v=24912e55", "assets/taste.js?v=76894cb0", "assets/app.js?v=91383eb8", "assets/social.js?v=d3757c8d", "assets/ticker.js?v=0e7ec581",
  "assets/nearby.css?v=997305cd", "assets/nearby.js?v=2fac3c94",
  "assets/ads/massage/dragon-ad.css?v=7a850b03", "assets/ads/massage/dragon-ad.js?v=1961d18e", "assets/ads/massage/dragon.svg",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-512.png",
  "assets/icons/apple-touch-icon.png", "assets/icons/favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil((async function () {
    var c = await caches.open(SHELL);
    await c.addAll(SHELL_FILES.map(function (u) { return new Request(u, { cache: "reload" }); }));
    // 최신 판 데이터 미리 받기(실패해도 설치는 계속)
    try {
      var d = await caches.open(DATA);
      var r = await fetch("data/index.json", { cache: "no-cache" });
      var idx = await r.clone().json();
      await d.put("data/index.json", r);
      var ir = await fetch("data/index.js", { cache: "no-cache" });
      if (ir.ok) await d.put("data/index.js", ir);
      if (idx.latest) { var lr = await fetch("data/" + idx.latest + ".js", { cache: "no-cache" }); if (lr.ok) await d.put("data/" + idx.latest + ".js", lr); }
    } catch (err) {}
    self.skipWaiting();
  })());
});

self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k.indexOf("shell-") === 0 && k !== SHELL; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

function dataKey(url) { // 캐시 키에서 ?_=… 같은 쿼리 제거
  var u = new URL(url); return u.origin + u.pathname;
}

async function networkFirst(req, cacheName, key, mode) {
  var c = await caches.open(cacheName);
  try {
    // navigate 요청에는 RequestInit 을 줄 수 없음 → URL 로 새 요청(HTTP 캐시 재검증)
    var r = await fetch(req.mode === "navigate" ? new Request(req.url, { cache: "no-cache", credentials: "same-origin" }) : new Request(req, { cache: mode || "no-cache" }));
    if (r && r.ok) { c.put(key || req, r.clone()); return r; }
    var hit0 = await c.match(key || req); return hit0 || r;
  } catch (err) {
    var hit = await c.match(key || req, { ignoreSearch: !key });
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  var c = await caches.open(SHELL);
  var hit = await c.match(req);
  if (hit) return hit;
  var r = await fetch(req);
  if (r && r.ok) c.put(req, r.clone());
  return r;
}

async function staleWhileRevalidate(req) {
  var c = await caches.open(EXT);
  var hit = await c.match(req);
  var net = fetch(req).then(function (r) { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(function () { return hit; });
  return hit || net;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // 로그인·DB·SDK: 손대지 않음(respondWith 안 함 → 네트워크 직행)
    if (/(^|\.)(firebaseio\.com|firebaseapp\.com|firebasestorage\.app|web\.app|google\.com|googleusercontent\.com)$/.test(url.host) ||
        /(^|\.)googleapis\.com$/.test(url.host) && url.host !== "fonts.googleapis.com" ||
        /(^|\.)gstatic\.com$/.test(url.host) && url.host !== "fonts.gstatic.com") return;
    // 글꼴(jsDelivr Pretendard, Google Fonts): 있으면 캐시, 뒤에서 갱신
    if (/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host)) e.respondWith(staleWhileRevalidate(req));
    return;
  }
  var scope = new URL(self.registration.scope);
  var path = url.pathname.slice(scope.pathname.length);
  if (req.mode === "navigate") {
    // 앱 셸로 다루는 페이지는 루트(./)·index.html 뿐. e/<판 id>/ 같은 미리보기 페이지 등 다른 페이지는 가로채지 않음
    if (path !== "" && path !== "index.html") return;
    // 페이지: 네트워크 우선, 오프라인이면 캐시한 index.html
    e.respondWith(networkFirst(req, SHELL, scope.href + "index.html").catch(function () { return caches.match(scope.href + "index.html"); }));
    return;
  }
  // 🇰🇷 data/korea.json|js · 💱 data/ticker.json|js: 2시간마다 바뀜 → HTTP 캐시도 거치지 않고(no-store) 항상 새로 받음. 오프라인일 때만 마지막 캐시
  if (/^data\/(korea|ticker)\.(json|js)$/.test(path)) { e.respondWith(networkFirst(req, DATA, dataKey(req.url), "no-store")); return; }
  if (/^data\//.test(path)) { e.respondWith(networkFirst(req, DATA, dataKey(req.url))); return; }
  if (path === "sw.js") return;
  if (/^__\//.test(path)) return;   // (혹시 쓰게 될) Firebase 예약 경로 /__/auth 등은 가로채지 않음
  e.respondWith(cacheFirst(req));
});
