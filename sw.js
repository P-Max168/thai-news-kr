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
var VERSION = "tnk-3d7b2dcc0b";
var SHELL = "shell-" + VERSION, DATA = "data-v1", EXT = "ext-v1";
var SHELL_FILES = [
  "assets/ads/campaign.js?v=467e1a7c",
  "./", "index.html", "manifest.json", "offline.html", "assets/g-pages.css?v=1",
  "assets/style.css?v=831d9243", "assets/topics.js?v=7dc6658a", "assets/prefs.js?v=52dffcb2", "assets/taste.js?v=21428f24", "assets/adsafe.js?v=b097ac0a", "assets/app.js?v=81dd31bd", "assets/social.js?v=2f61e240", "assets/ticker.js?v=dc1181ad",
  "assets/nearby.css?v=9ecf24b1", "assets/late.css?v=cb56c0b2", "assets/nearby.js?v=e4c5961b", "assets/pages.js?v=b4740d3f", "assets/places.js?v=9a9fdd43", "assets/jobs.js?v=aceb2a0c",
  "assets/ads/massage/dragon-ad.css?v=883e8519", "assets/ads/massage/dragon-ad.js?v=55214c68", "assets/ads/massage/dragon.svg",
  "assets/modern.css?v=f5a5e488", "assets/modern.js?v=2b99d07f", "assets/g.css?v=81aaa6eb",
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
    // 안내 4쪽(소개·연락·개인정보·약관): 네트워크 우선, 한 번 연 쪽은 오프라인에서도 보임, 처음이면 오프라인 안내(offline.html)
    if (/^(privacy|terms|about|contact)\.html$/.test(path)) {
      e.respondWith(networkFirst(req, SHELL, scope.href + path).catch(function () { return caches.match(scope.href + "offline.html"); }));
      return;
    }
    if (path !== "" && path !== "index.html") return;
    // 페이지: 네트워크 우선, 오프라인이면 캐시한 index.html(그것도 없으면 오프라인 안내)
    e.respondWith(networkFirst(req, SHELL, scope.href + "index.html").catch(function () {
      return caches.match(scope.href + "index.html").then(function (r) { return r || caches.match(scope.href + "offline.html"); });
    }));
    return;
  }
  // 🇰🇷 data/korea.json|js · 💱 data/ticker.json|js: 2시간마다 바뀜 → HTTP 캐시도 거치지 않고(no-store) 항상 새로 받음. 오프라인일 때만 마지막 캐시
  if (/^data\/(korea|ticker)\.(json|js)$/.test(path)) { e.respondWith(networkFirst(req, DATA, dataKey(req.url), "no-store")); return; }
  if (/^data\//.test(path)) { e.respondWith(networkFirst(req, DATA, dataKey(req.url))); return; }
  if (path === "sw.js") return;
  if (/^__\//.test(path)) return;   // (혹시 쓰게 될) Firebase 예약 경로 /__/auth 등은 가로채지 않음
  e.respondWith(cacheFirst(req));
});
