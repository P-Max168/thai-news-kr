/* 태국 뉴스 한눈에 — 헤더 둘째 줄 '빠른 정보' 칩 (☰ 오른쪽, 좁은 화면에서는 옆으로 밀기)
 * 배치(운영자 확정 10-03 07:28 → 10-03 09시 v3): 상자 3개(☰ 버튼과 같은 높이), 맨 아래 작은 줄 = 조회 시각(방콕 'HH:MM 조회')
 *   상자1 = 1바트 = 40.2원 / 1달러 = 33.6฿ / 조회 시각   상자1b(v5) = 1USDT / 33.5฿(구글 파이낸스 기준 — 실패 시 CoinGecko→Bitkub) / 조회 시각
 *   상자2 = 날씨(아이콘·기온·강수확률) / 미세먼지 PM2.5(단계) / 지역 이름 + 조회 시각   상자3 = 금시세(금괴 판매가) / 휘발유(가소홀 95) 가격 / 조회 시각
 *  환율·금시세·휘발유 = data/ticker.json(GitHub Actions korea.yml → tools/fetch_ticker.py, 2시간마다). file:// 에서는 data/ticker.js(window.TN_TICKER)
 *  날씨·미세먼지 = Open-Meteo(무료·키 없음·CORS 허용)를 브라우저에서 직접 — 지역 = 이 기기에서 고른 지역 > 페르소나(파타야/시라차/방콕) > 파타야
 *     날씨 30분, 미세먼지 60분 localStorage 캐시
 * 값이 없거나 24시간 넘게 지난 줄은 숨긴다(두 줄 다 없으면 상자도 숨김)(틀린 숫자를 보여 주지 않음). 칩을 누르면 출처·업데이트 시각·링크가 있는 작은 창.
 * 템플릿 공용: index.html 하나가 모든 판을 렌더하므로 판을 새로 만들어도 그대로 유지된다(README '헤더').
 */
(function () {
  "use strict";
  var TZ = "Asia/Bangkok", DAY = 864e5, $ = function (id) { return document.getElementById(id); };
  var box = $("ticker"); if (!box) return;
  var REGIONS = {
    pattaya:  { name: TNI("ticker.k6a1a0cc", "파타야"), lat: 12.9236, lon: 100.8825 },
    sriracha: { name: TNI("ticker.ka7ba72f", "시라차"), lat: 13.1682, lon: 100.9310 },
    bangkok:  { name: TNI("ticker.k4dc2c29", "방콕"),   lat: 13.7563, lon: 100.5018 }
  };
  // 판 설정(data/site.js wx_coords)으로 같은 지역 키의 좌표만 바꿈 — 예: 베트남판 pattaya=호치민·bangkok=하노이·sriracha=다낭(이름은 i18n). 한국판·중국어판은 설정 없음 = 위 값 그대로(2026-10-25 Claude)
  (function (wc) { if (!wc) return; Object.keys(wc).forEach(function (k) { if (REGIONS[k]) { REGIONS[k].lat = wc[k].lat; REGIONS[k].lon = wc[k].lon; } }); })(window.TN_SITE && window.TN_SITE.wx_coords);
  var LS_REGION = "tnk.wxRegion", LS_WX = "tnk.wx.v1", LS_AQ = "tnk.aq.v1";
  var WX_TTL = 30 * 60e3, AQ_TTL = 60 * 60e3;
  var st = { tk: null, wx: null, aq: null };

  // 화면에 태국 글자 금지(운영자 요청 10-03): 데이터에서 온 글은 알려진 이름을 한국어+로마자로 바꾸고, 남은 태국 글자(괄호째)는 지움
  var TH_KO = [[/태국 금 거래상 협회\s*\(สมาคมค้าทองคำ\)|สมาคมค้าทองคำ/g, TNI("ticker.ka5362e0", "태국 금거래상협회(Gold Traders Association)")],
               [/แก๊สโซฮอล์\s*95\s*S\s*EVO/g, TNI("ticker.k2533340", "가소홀 95 S EVO(Gasohol 95)")], [/แก๊สโซฮอล์/g, TNI("ticker.k8a5bb7c", "가소홀")]];
  function noTh(x) {
    var s = String(x == null ? "" : x); TH_KO.forEach(function (r) { s = s.replace(r[0], r[1]); });
    return s.replace(/\s*\([^)]*[\u0E00-\u0E7F][^)]*\)/g, "").replace(/[\u0E00-\u0E7F]+/g, "").replace(/\s{2,}/g, " ").trim();
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function ms(iso) { var t = iso ? new Date(iso).getTime() : NaN; return isFinite(t) ? t : 0; }
  function fresh(iso, max) { var t = ms(iso); return t > 0 && Date.now() - t <= max && t - Date.now() < 36e5; }
  function n0(x) { return Math.round(x).toLocaleString("ko-KR"); }
  function n1(x) { return x >= 1000 ? n0(x) : x.toFixed(1); }   // 1,000 넘는 현지 값(동·달러당 동)은 소수점 없이 쉼표로(2026-10-25)
  // 휘발유 '전날 값' 날짜(방콕): feed_date 하루 전 → 'M/D ' (모르면 '전날 ')
  function prevDay(iso) {
    var t = ms(iso); if (!t) return TNI("ticker.kf20644d", "전날 ");
    var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric", day: "numeric" }).formatToParts(new Date(t - 864e5)).forEach(function (p) { o[p.type] = p.value; });
    return o.month + "/" + o.day + " ";
  }
  function when(iso) {
    var o = {}; new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date(iso)).forEach(function (p) { o[p.type] = p.value; });
    return o.month + TNI("ticker.k6878518", "월 ") + o.day + TNI("ticker.ka0454e1", "일(") + o.weekday + ") " + o.hour + ":" + o.minute;
  }
  function region() {
    var r = ls(LS_REGION); if (REGIONS[r]) return r;
    var d = window.TNStore && window.TNStore.get(), p = d && d.persona;
    var rg = d && d.region && window.TNTopics && window.TNTopics.region && window.TNTopics.region(d.region);   // 시작 화면에서 고른 사는 곳(동부 → 파타야, 방콕 → 방콕)
    if (rg && REGIONS[rg.wx]) return rg.wx;
    return REGIONS[p] ? p : "pattaya";
  }

  /* ---------- 데이터 ---------- */
  function loadTicker() {
    function done(d) { st.tk = d && d.v ? d : null; render(); }
    if (!/^https?:$/.test(location.protocol)) {
      var sc = document.createElement("script"); sc.src = "data/ticker.js?_=" + Date.now();
      sc.onload = function () { done(window.TN_TICKER); }; sc.onerror = function () { done(null); };
      document.body.appendChild(sc); return;
    }
    fetch("data/ticker.json?_=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(done, function () { done(null); });
  }
  function cached(key, ttl, rg, url, pick) {
    var c = ls(key);
    function withAt(x, at) { return x ? Object.assign({ at: at }, x) : null; }   // at = 브라우저가 받아 온 시각(칩 맨 아래 '조회' 줄)
    if (c && c.rg === rg && Date.now() - c.at < ttl && c.d) return Promise.resolve(withAt(c.d, c.at));
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      var d = pick(j), at = Date.now(); ls(key, { rg: rg, at: at, d: d }); return withAt(d, at);
    }).catch(function () { return c && c.rg === rg ? withAt(c.d, c.at) : null; });   // 실패하면 같은 지역의 이전 캐시(신선도는 render 에서 판단)
  }
  function loadWx() {
    var rg = region(), R = REGIONS[rg], q = "latitude=" + R.lat + "&longitude=" + R.lon + "&timezone=" + encodeURIComponent(TZ);
    cached(LS_WX, WX_TTL, rg, "https://api.open-meteo.com/v1/forecast?" + q + "&current=temperature_2m,weather_code,is_day&hourly=precipitation_probability&forecast_hours=6", function (j) {
      var c = j.current || {}, pp = ((j.hourly || {}).precipitation_probability || []).filter(function (x) { return typeof x === "number"; });
      if (typeof c.temperature_2m !== "number") return null;
      return { t: c.temperature_2m, code: c.weather_code, day: c.is_day, time: c.time + ":00+07:00", rain: pp.length ? Math.max.apply(null, pp) : null };
    }).then(function (d) { st.wx = d ? Object.assign({ rg: rg }, d) : null; render(); });
    cached(LS_AQ, AQ_TTL, rg, "https://air-quality-api.open-meteo.com/v1/air-quality?" + q + "&current=pm2_5", function (j) {
      var c = j.current || {}; return typeof c.pm2_5 === "number" ? { pm: c.pm2_5, time: c.time + ":00+07:00" } : null;
    }).then(function (d) { st.aq = d ? Object.assign({ rg: rg }, d) : null; render(); });
  }

  /* ---------- 표시 ---------- */
  function wmo(code, day) {
    var c = +code;
    if (c === 0) return [day === 0 ? "🌙" : "☀️", TNI("ticker.k9a7f95e", "맑음")];
    if (c === 1) return [day === 0 ? "🌙" : "🌤️", TNI("ticker.kc3e0a4a", "대체로 맑음")];
    if (c === 2) return ["⛅", TNI("ticker.kd77284a", "구름 조금")];
    if (c === 3) return ["☁️", TNI("ticker.k887f182", "흐림")];
    if (c === 45 || c === 48) return ["🌫️", TNI("ticker.k254e8d3", "안개")];
    if (c >= 51 && c <= 57) return ["🌦️", TNI("ticker.k59b3424", "이슬비")];
    if (c >= 61 && c <= 67) return ["🌧️", TNI("ticker.kd3b0e1a", "비")];
    if (c >= 71 && c <= 77) return ["❄️", TNI("ticker.k374a498", "눈")];
    if (c >= 80 && c <= 82) return ["🌦️", TNI("ticker.k5ed2015", "소나기")];
    if (c === 85 || c === 86) return ["🌨️", TNI("ticker.k348e1f6", "눈 소나기")];
    if (c >= 95) return ["⛈️", TNI("ticker.kd60d02b", "뇌우")];
    return ["🌡️", ""];
  }
  // PM2.5 4단계 — 태국 오염관리국(PCD) 2023년 AQI 기준(15/25/37.5/75 µg/m³)을 4단계로 묶음: 좋음(0–25) 보통(25.1–37.5) 나쁨(37.6–75) 매우 나쁨(75.1~)
  function pmLevel(v) {
    var T = window.TNI || function (k, d) { return d; };   // 언어판 문구(R-zh-1, 2026-10-18) — 한국판은 기본값 그대로
    if (v <= 25) return { k: "good", t: T("ticker.pm_good", "좋음") };
    if (v <= 37.5) return { k: "mod", t: T("ticker.pm_mod", "보통") };
    if (v <= 75) return { k: "bad", t: T("ticker.pm_bad", "나쁨") };
    return { k: "vbad", t: T("ticker.pm_vbad", "매우 나쁨") };
  }
  // 언어판 통화(R-zh-3, 2026-10-18): 한국판 THB_KRW·'원'(기본값), zh = THB_CNY·'元' (data/site.js currency.pair·unit). 헤더 ฿ 는 그대로
  var CUR = (window.TN_SITE && window.TN_SITE.currency) || {}, PAIR = CUR.pair || "THB_KRW", UNIT = CUR.unit || TNI("ticker.k21ba070", "원"), I = window.TNI || function (k, d) { return d; };
  // 현지 통화(2026-10-25 Claude, 베트남판): local=현지 통화 코드(기본 THB), per=칩에 보일 현지 금액 단위(기본 1, 베트남판 10000 = '1만 동'), header_symbol=칩의 작은 기호(기본 ฿). hide_price=금·휘발유 칸 숨김
  var LOC = CUR.local || "THB", PER = CUR.per || 1, SYM = CUR.header_symbol || "฿", USDK = "USD_" + LOC, USDTK = "USDT_" + LOC, KRWK = LOC + "_KRW";
  function fxOK() { var f = st.tk && st.tk.fx; return f && f[PAIR] > 0 && fresh(f.fetched_at, DAY) && fresh(f.rate_time, 2 * DAY) ? f : null; }
  function goldOK() { var g = st.tk && st.tk.gold; return g && g.bar_sell > 0 && fresh(g.fetched_at, DAY) && fresh(g.announced_at, 4 * DAY) ? g : null; }
  // 날씨·미세먼지: 브라우저에서 직접 받은 Open-Meteo 값 우선, 실패하면 data/ticker.json 의 서버 값(Actions 가 2시간마다) — 둘 다 3시간 안의 것만
  function srv(key, rg) {
    var s = st.tk && st.tk[key], v = s && s.regions && s.regions[rg];
    return v && fresh(s.fetched_at, DAY) ? Object.assign({ rg: rg, src: s.source, url: s.url, viaServer: true, at: ms(s.fetched_at) }, v) : null;
  }
  function wxOK() {
    var rg = region(), w = st.wx && st.wx.rg === rg && fresh(st.wx.time, 3 * 36e5) ? Object.assign({ src: "Open-Meteo", url: "https://open-meteo.com/" }, st.wx) : null;
    if (!w) { w = srv("wx", rg); if (w && !fresh(w.time, 3 * 36e5)) w = null; }
    return w && typeof w.t === "number" ? w : null;
  }
  function aqOK() {
    var rg = region(), a = st.aq && st.aq.rg === rg && fresh(st.aq.time, 3 * 36e5) ? Object.assign({ src: TNI("ticker.kb64acc5", "Open-Meteo 대기질 (CAMS 예측 모델)"), url: "https://open-meteo.com/en/docs/air-quality-api" }, st.aq) : null;
    if (!a) { a = srv("aq", rg); if (a && !fresh(a.time, 3 * 36e5)) a = null; }
    return a && typeof a.pm === "number" ? a : null;
  }

  function fuelOK() { var o = st.tk && st.tk.fuel; return o && o.gasohol95 > 0 && fresh(o.fetched_at, DAY) && fresh(o.feed_date, 2 * DAY) ? o : null; }
  function usdtOK() { var u = st.tk && st.tk.usdt; return u && u[USDTK] > 0 && fresh(u.fetched_at, DAY) && (!u.price_time || fresh(u.price_time, 2 * DAY)) ? u : null; }
  // 조회 시각(방콕): 언제나 'M/D HH:MM'(2026-10-04 실제 날짜 표시) — 상자 안 항목 중 가장 오래된 것
  function clock(list) {
    var t = list.filter(function (x) { return x > 0; }); if (!t.length) return "";
    var o = {}, f = function (v) { new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date(v)).forEach(function (p) { o[p.type] = p.value; }); return o.month + "/" + o.day; };
    var d = f(Math.min.apply(null, t));
    return d + " " + o.hour.replace(/^24$/, "00") + ":" + o.minute;
  }
  // 화면용 조회 시각 HTML: 'M/D ' 를 span 으로 — 오늘 날짜면 tk-d--today(헤더가 넘칠 때만 숨김, 3단계). 읽어 주기·출처 창엔 그대로 날짜
  function clockHTML(list) {
    var c = clock(list); if (!c) return "";
    var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "numeric", day: "numeric" }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var i = c.indexOf(" "), d = c.slice(0, i);
    return '<span class="tk-d' + (d === o.month + "/" + o.day ? " tk-d--today" : "") + '">' + d + " </span>" + c.slice(i + 1);
  }
  function n2(x) { return Number(x).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // 상자 = 두 줄([라벨용 글, 화면 HTML] 두 개). 한 줄이 없으면 그 줄만 빠지고, 둘 다 없으면 상자를 안 그림
  // foot = [라벨용 글, 화면 HTML] — 맨 아래 작은 '조회 시각' 줄(값 줄이 하나도 없으면 상자째 안 그림)
  function tile(k, lines, foot) {
    lines = lines.filter(Boolean); if (!lines.length) return "";
    if (foot && foot[1]) lines.push(foot.concat("tk-ln tk-ft"));
    return '<button type="button" class="tk-chip tk-tile" data-tk="' + k + '" aria-haspopup="dialog" aria-label="' + esc(lines.map(function (l) { return l[0]; }).join(", ")) + TNI("ticker.ke65170f", " (누르면 출처)\"><span class=\"tk-in\">") +
      lines.map(function (l) { return '<span class="' + (l[2] || "tk-ln") + '">' + l[1] + "</span>"; }).join("") + "</span></button>";
  }
  // 화면 = 'M/D HH:MM'(날짜를 넣으면서 칸이 넓어져 화면 글자 '조회'는 뺌 — 읽어 주기·출처 창엔 그대로 '조회')
  function ft(list) { var c = clock(list); return c ? [c + TNI("ticker.k6b5c246", " 조회"), clockHTML(list)] : null; }
  // ▲▼ 변동(2026-10-15, G 그래파이트): 실제 이전 값이 있을 때만(USDT 전일 종가·금 공시 변동·휘발유 어제 값·환율 직전 조회값 prev_*). 화면 장식만(aria-hidden), G 테마에서만 보임(g.css)
  function chg(d, dig) {
    if (typeof d !== "number" || !isFinite(d) || Math.abs(d) < Math.pow(10, -dig) / 2) return "";
    return '<span class="tk-chg tk-chg--' + (d > 0 ? "up" : "dn") + '" aria-hidden="true">' + (d > 0 ? "▲" : "▼") + Math.abs(d).toLocaleString("en-US", { minimumFractionDigits: dig, maximumFractionDigits: dig }) + "</span>";
  }
  function dif(a, b) { return typeof a === "number" && typeof b === "number" ? a - b : null; }
  var renderLater = false;
  function render() {
    // 속도(2026-10-03 18:25, 검수 지시): 첫 기사 카드가 그려지기 전에는 칩을 채우지 않음 — 자리는 index.html 의 빈 상자 4개가 잡고 있음
    if (!window.__tnLate && window.TNAfterFirst) { if (!renderLater) { renderLater = true; window.TNAfterFirst(function () { renderLater = false; render(); }); } return; }
    var f = fxOK(), u = usdtOK(), w = wxOK(), g = goldOK(), a = aqOK(), o = fuelOK(), h = [];
    h.push(tile("fx", [
      f && [I("ticker.one_baht", "1바트 ") + (f[PAIR] * PER).toFixed(PAIR === "THB_KRW" || PER > 1 ? 1 : 3) + UNIT, I("ticker.one_baht_s", "1바트") + "<i class=\"tk-eq\"> =</i> <b>" + (f[PAIR] * PER).toFixed(PAIR === "THB_KRW" || PER > 1 ? 1 : 3) + UNIT + "</b>" + chg(dif(f[PAIR] * PER, f["prev_" + PAIR] * PER), PAIR === "THB_KRW" || PER > 1 ? 2 : 4)],
      f && f[USDK] > 0 && [I("ticker.one_usd", "1달러 ") + n1(f[USDK]) + I("ticker.baht", "바트"), I("ticker.one_usd_s", "1달러") + "<i class=\"tk-eq\"> =</i> <b>" + n1(f[USDK]) + '<small class="tk-u">' + SYM + '</small></b>' + chg(dif(f[USDK], f["prev_" + USDK]), f[USDK] >= 1000 ? 0 : 2)]
    ], ft([f && ms(f.fetched_at)])));
    // v5(운영자 요청 10-03 10:25): 테더는 환율 바로 옆 자기 상자 — '1USDT' / 큰 글자 '33.5฿' / 조회 시각
    h.push(tile("usdt", [
      u && ["1USDT", '<span class="tk-l">1USDT</span>'],
      u && [TNI("ticker.kb8e2599", "테더(USDT) 1개 ") + n1(u[USDTK]) + TNI("ticker.k891f841", "바트"), '<b class="tk-big">' + n1(u[USDTK]) + '<small class="tk-u">' + SYM + '</small></b>' + chg(u.change, u[USDTK] >= 1000 ? 0 : 2)]
    ].filter(function (x, i, a) { return a[1]; }), ft([u && ms(u.fetched_at)])));
    var ic = w && wmo(w.code, w.day), lv = a && pmLevel(a.pm);
    h.push(tile("env", [
      w && [REGIONS[w.rg].name + " " + Math.round(w.t) + TNI("ticker.kab28e15", "도 ") + ic[1] + (w.rain != null ? TNI("ticker.k4a6fe0f", " 강수확률 ") + w.rain + "%" : ""),
        '<span class="tk-i" aria-hidden="true">' + ic[0] + "</span><b>" + Math.round(w.t) + "°</b>" +
        (w.rain != null ? '<span class="tk-rain">☔' + w.rain + "%</span>" : "")],
      a && [TNI("ticker.k0c6da76", "미세먼지 PM2.5 ") + Math.round(a.pm) + " " + lv.t, '<span class="tk-l tk-pm">PM2.5</span><b>' + Math.round(a.pm) + '</b><span class="tk-lv tk-lv--' + lv.k + '">' + lv.t + "</span>"]
    ], (function () {   // 지역 이름은 맨 아래 조회 줄 앞에(첫 줄 폭 줄이기 — 운영자 요청 10-03: 날씨 상자 잘림)
      var c = clock([w && w.at, a && a.at]), rk = (w || a || {}).rg || region(), rn = I("ticker.rg_" + rk, REGIONS[rk].name);
      return c ? [rn + " " + c + TNI("ticker.k6b5c246", " 조회"), '<span class="tk-rg">' + rn + "</span>" + clockHTML([w && w.at, a && a.at])] : null;
    })()));
    if (!CUR.hide_price) h.push(tile("price", [
      g && [TNI("ticker.kaf13ee1", "금시세 금괴 1바트 ") + n0(g.bar_sell) + TNI("ticker.k891f841", "바트"), '<span class="tk-l">' + I("ticker.gold_s", "금") + '</span><b>' + n0(g.bar_sell) + '<small class="tk-u">฿</small></b>' + chg(g.change, 0)],
      o && [TNI("ticker.k8216c3d", "휘발유(95) 리터당 ") + n2(o.gasohol95) + TNI("ticker.k891f841", "바트"), '<span class="tk-l">' + I("ticker.fuel_s", "휘발유") + '<span class="tk-95">(95)</span></span><b>' + n2(o.gasohol95) + '<small class="tk-u">฿</small></b>' + chg(dif(o.gasohol95, o.yesterday), 2)]
    ], ft([g && ms(g.fetched_at), o && ms(o.fetched_at)])));
    var open = pop && !pop.hidden ? pop.getAttribute("data-k") : null;
    box.innerHTML = h.join("");
    box.classList.toggle("is-empty", !box.children.length);
    if (window.TNAfterFirst) window.TNAfterFirst(fitMark); else fitMark();   // 속도: 재기는 첫 기사 카드 뒤에
    if (open) { var b = box.querySelector('[data-tk="' + open + '"]'); if (b) show(open, b, true); else hide(); }
  }

  // 다 들어가면 오른쪽 흐림 표시 없음, 넘치면(옆으로 밀어야 하면) 흐림 표시
  // 2026-10-05(Max 04:30): 가장 긴 값(PM2.5 '매우 나쁨'·두 자리 월/일·6자리 금값…)이 겹치면 360px 에서 칸 4개가 넘쳐 옆으로 밀어야 했음.
  // 원인 = 칸 폭이 글 길이대로만 정해지고 줄일 장치가 없었음(글자는 이미 11px 바닥). → 넘칠 때만 아래 단계를 하나씩 켜서 들어가면 멈춤(글자 크기는 안 줄임):
  //   1 칸 사이·안쪽 여백 줄이기  2 '1바트 = 40.2원' → '1바트 40.2원'('=' 빼기)  3 조회 시각이 오늘이면 날짜 빼고 시각만(어제 것은 날짜 그대로)
  //   4 날씨 칸의 'PM2.5' 글씨·지역 이름 숨기기(읽어 주기·작은 창엔 그대로)  5 마지막 수단: 칸 4개를 2줄(2×2)로. 그래도 넘치면 예전처럼 옆으로 밀기 + 흐림
  var FIT = ["tk-fit1", "tk-fit2", "tk-fit3", "tk-fit4", "tk-fit5"];
  function fitMark() {
    var row = box.parentElement || box;
    FIT.forEach(function (c) { row.classList.remove(c); });
    box.classList.remove("is-overflow");
    var over = function () { return box.scrollWidth > box.clientWidth; };   // 1px 도 넘침으로(오른쪽 끝 잘림 방지)
    for (var i = 0; i < FIT.length && box.children.length && over(); i++) row.classList.add(FIT[i]);
    box.setAttribute("data-fit", String(i));
    box.classList.toggle("is-overflow", over());
  }
  window.addEventListener("resize", fitMark);
  // 속도(17:45): document.fonts.ready 는 읽기만 해도 스타일 계산을 강제 → 첫 기사 카드 뒤에
  (window.TNAfterFirst || function (f) { f(); })(function () { if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMark); });

  /* ---------- 작은 정보 창 ---------- */
  var pop = document.createElement("div");
  pop.className = "tk-pop"; pop.id = "tickPop"; pop.hidden = true; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", TNI("ticker.k8e93127", "출처·업데이트 시각"));
  document.body.appendChild(pop);
  var lastBtn = null;
  function src(name, url, lines) {
    return '<p class="tk-pop__src">' + lines.map(function (l) { return esc(noTh(l)); }).join("<br>") + TNI("ticker.kddd8bf2", "<br>출처: <a href=\"") + esc(url) + '" target="_blank" rel="noopener">' + esc(noTh(name)) + " ↗</a></p>";
  }
  function part(k) {
    var f = fxOK(), u = usdtOK(), w = wxOK(), g = goldOK(), a = aqOK(), o = fuelOK();
    if (k === "fx" && f) return TNI("ticker.k991b0d1", "<b class=\"tk-pop__t\">환율</b><p>1바트 = <b>") + (PER > 1 ? n1(f[KRWK] * PER) : f[KRWK].toFixed(2)) + TNI("ticker.k87d45c9", "원</b> · 1만 바트 ≈ ") + n0(f[KRWK] * 1e4 * (PER > 1 ? 10 : 1)) + TNI("ticker.k21ba070", "원") +
      (f[USDK] > 0 ? TNI("ticker.kcb3385f", "<br>1달러 = <b>") + (f[USDK] >= 1000 ? n0(f[USDK]) : f[USDK].toFixed(2)) + TNI("ticker.k0db85f2", "바트</b>") + (f.USD_KRW > 0 ? TNI("ticker.ka7b02f2", " · 1달러 = ") + n0(f.USD_KRW) + TNI("ticker.k21ba070", "원") : "") : "") + "</p>" +
      src(f.source, f.url, [TNI("ticker.ka76bfe8", "기준 시각 ") + when(f.rate_time) + TNI("ticker.k9964196", " (방콕)"), TNI("ticker.kf59c814", "받아 온 시각 ") + when(f.fetched_at) + TNI("ticker.kf2a797f", " · 참고용(은행·환전소 실제 환율과 다름)")]);
    if (k === "usdt" && u) {
      var ukrw = f ? Math.round(u[USDTK] * f[KRWK]) : null, chg = typeof u.change_pct === "number" ? u.change_pct : null;
      return TNI("ticker.k0b40892", "<b class=\"tk-pop__t\">테더(USDT) 시세</b><p>1테더 = <b>") + (u[USDTK] >= 1000 ? n0(u[USDTK]) : u[USDTK].toFixed(2)) + TNI("ticker.k0db85f2", "바트</b>") + (ukrw ? TNI("ticker.kf8cbc8d", " (약 ") + n0(ukrw) + TNI("ticker.k92a170b", "원)") : "") +
        (chg ? " · " + (u.google ? TNI("ticker.k8fc1e4a", "전일 대비 ") : TNI("ticker.k6962d18", "24시간 ")) + (chg > 0 ? "▲" : "▼") + Math.abs(chg).toFixed(2) + "%" : "") + "</p>" +
        src(u.google ? TNI("ticker.kd2d043b", "구글 파이낸스 (Google Finance)") : u.source, u.url, [
          u.google ? TNI("ticker.k4503d77", "구글 기준 · 시세 시각 ") + when(u.price_time) + TNI("ticker.k9964196", " (방콕)")
                   : TNI("ticker.ka40aad1", "구글 값을 받지 못해 대신 쓴 값 — 구글 표시값과 조금 다를 수 있음") + (u.price_time ? TNI("ticker.kf110620", " · 시세 시각 ") + when(u.price_time) + TNI("ticker.k9964196", " (방콕)") : ""),
          TNI("ticker.kf59c814", "받아 온 시각 ") + when(u.fetched_at) + TNI("ticker.k83a9851", " · 참고용(거래소·P2P 실제 거래가와 다름)")]);
    }
    if (k === "wx" && w) {
      var ic = wmo(w.code, w.day), cur = region();
      return "<b class=\"tk-pop__t\">" + ic[0] + " " + REGIONS[w.rg].name + TNI("ticker.kaaf9eee", " 지금 날씨</b><p><b>") + w.t.toFixed(1) + "°C</b> " + esc(ic[1]) +
        (w.rain != null ? TNI("ticker.k8d43f64", " · 앞으로 6시간 최고 강수확률 <b>") + w.rain + "%</b>" : (typeof w.rain6_mm === "number" ? TNI("ticker.kb892efa", " · 앞으로 6시간 강수량 ") + w.rain6_mm + "mm" : "")) + "</p>" +
        TNI("ticker.kbdefb5f", "<div class=\"tk-pop__rg\" role=\"group\" aria-label=\"날씨·미세먼지 지역\">") + Object.keys(REGIONS).map(function (r) {
          return '<button type="button" data-rg="' + r + '" aria-pressed="' + (r === cur) + '">' + REGIONS[r].name + "</button>"; }).join("") + "</div>" +
        src(w.src, w.url, [TNI("ticker.k283d2ff", "예보 모델 기준 ") + when(w.time) + TNI("ticker.k01dabf6", " (방콕) · ") + (w.viaServer ? TNI("ticker.k7fa3441", "서버에서 2시간마다 받은 값") : TNI("ticker.k5c79bf4", "30분마다 새로")), TNI("ticker.k7a19edc", "지역 기본값 = '어떤 분이세요?'에서 고른 곳(없으면 파타야)")]);
    }
    if (k === "gold" && g) {
      var krw = f ? Math.round(g.bar_sell * f.THB_KRW) : null;
      return TNI("ticker.k8a67b08", "<b class=\"tk-pop__t\">태국 금시세</b><p class=\"tk-pop__note\">") + esc(noTh(g.unit)) + TNI("ticker.ke89c1f8", " 기준</p><p>판매 <b>") + n0(g.bar_sell) + TNI("ticker.k0db85f2", "바트</b>") + (krw ? TNI("ticker.kf8cbc8d", " (약 ") + n0(krw) + TNI("ticker.k92a170b", "원)") : "") +
        TNI("ticker.k23778b7", " · 매입 ") + n0(g.bar_buy) + TNI("ticker.k891f841", "바트") + (typeof g.change === "number" && g.change ? TNI("ticker.k6ea589e", " · 직전 대비 ") + (g.change > 0 ? "▲" : "▼") + n0(Math.abs(g.change)) : "") + "</p>" +
        src(g.source, g.url, [TNI("ticker.kddd761d", "협회 발표 ") + when(g.announced_at) + (g.round ? TNI("ticker.k46989d6", " · 그날 ") + g.round + TNI("ticker.kbe8a090", "번째 발표") : "") + TNI("ticker.kc4e0ca4", " (주말·공휴일엔 발표 없음)"),
          TNI("ticker.kf59c814", "받아 온 시각 ") + when(g.fetched_at) + (krw ? TNI("ticker.k77486a5", " · 원화는 위 환율로 환산(정수 반올림)") : "")]);
    }
    if (k === "pm" && a) {
      var lv = pmLevel(a.pm);
      return "<b class=\"tk-pop__t\">😷 " + REGIONS[a.rg].name + TNI("ticker.kec6c942", " 미세먼지 PM2.5</b><p><b>") + a.pm.toFixed(1) + ' µg/m³</b> <span class="tk-lv tk-lv--' + lv.k + '">' + lv.t + "</span></p>" +
        TNI("ticker.k1df6db5", "<p class=\"tk-pop__note\">단계: 태국 오염관리국(PCD) 기준을 4단계로 — 좋음 0–25 · 보통 25.1–37.5 · 나쁨 37.6–75 · 매우 나쁨 75 초과</p>") +
        src(a.src, a.url, [TNI("ticker.kf6769a1", "모델 기준 ") + when(a.time) + TNI("ticker.k9964196", " (방콕)") + (a.viaServer ? TNI("ticker.k23fff97", " · 서버에서 2시간마다 받은 값") : TNI("ticker.k79a02c7", " · 1시간마다 새로")), TNI("ticker.k9094238", "측정소 실측값이 아닌 예측 모델 값 — 실측은 Air4Thai(air4thai.pcd.go.th)")]);
    }
    if (k === "fuel" && o) return TNI("ticker.k668c15d", "<b class=\"tk-pop__t\">⛽ 휘발유 가격 — 가소홀 95</b><p>리터당 <b>") + n2(o.gasohol95) + TNI("ticker.k0db85f2", "바트</b>") +
      (f ? TNI("ticker.kf8cbc8d", " (약 ") + n0(o.gasohol95 * f.THB_KRW) + TNI("ticker.k92a170b", "원)") : "") + (typeof o.yesterday === "number" && o.yesterday !== o.gasohol95 ? " · " + prevDay(o.feed_date) + n2(o.yesterday) + TNI("ticker.k891f841", "바트") : "") + "</p>" +
      '<p class="tk-pop__note">' + esc(noTh(o.name)) + " · " + esc(noTh(o.note)) + "</p>" +
      src(o.source, o.url, [TNI("ticker.kea2c54a", "가격 공지 ") + when(o.announced_at) + (o.effective_at ? TNI("ticker.k32a1129", " · 적용 ") + when(o.effective_at) + TNI("ticker.k49e6f46", "부터") : ""), TNI("ticker.kf59c814", "받아 온 시각 ") + when(o.fetched_at) + TNI("ticker.kf202888", " · 주유소·지역마다 조금씩 다름")]);
    return "";
  }
  var TILE = { fx: ["fx"], usdt: ["usdt"], env: ["wx", "pm"], price: ["gold", "fuel"] };
  function body(k) {
    return (TILE[k] || [k]).map(part).filter(Boolean).map(function (x) { return '<div class="tk-pop__sec">' + x + "</div>"; }).join("");
  }
  function place(btn) {
    var r = btn.getBoundingClientRect(), W = document.documentElement.clientWidth, pw = Math.min(320, W - 16);
    pop.style.width = pw + "px";
    pop.style.left = Math.max(8, Math.min(r.left, W - pw - 8)) + "px";
    pop.style.top = (r.bottom + 8) + "px";
    pop.style.maxHeight = Math.max(160, window.innerHeight - r.bottom - 16) + "px";
  }
  function show(k, btn, keep) {
    var html = body(k); if (!html) { hide(); return; }
    pop.innerHTML = TNI("ticker.k6652438", "<button type=\"button\" class=\"tk-pop__x\" aria-label=\"닫기\">✕</button>") + html;
    pop.setAttribute("data-k", k); pop.hidden = false; place(btn); lastBtn = btn;
    box.querySelectorAll(".tk-chip").forEach(function (b) { b.setAttribute("aria-expanded", String(b === btn)); });
    if (!keep) setTimeout(function () { var x = pop.querySelector(".tk-pop__x"); if (x) x.focus({ preventScroll: true }); }, 0);
  }
  function hide(refocus) {
    if (pop.hidden) return; pop.hidden = true;
    box.querySelectorAll(".tk-chip").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (refocus && lastBtn && document.body.contains(lastBtn)) lastBtn.focus({ preventScroll: true });
  }
  box.addEventListener("click", function (e) {
    var b = e.target.closest(".tk-chip"); if (!b) return;
    var k = b.getAttribute("data-tk");
    if (!pop.hidden && pop.getAttribute("data-k") === k) hide(); else show(k, b);
  });
  pop.addEventListener("click", function (e) {
    if (e.target.closest(".tk-pop__x")) { hide(true); return; }
    var r = e.target.closest("[data-rg]");
    if (r) { ls(LS_REGION, r.getAttribute("data-rg")); st.wx = st.aq = null; loadWx(); }
  });
  document.addEventListener("click", function (e) { if (!pop.hidden && !pop.contains(e.target) && !box.contains(e.target)) hide(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) hide(true); });
  window.addEventListener("resize", function () { hide(); });
  window.addEventListener("scroll", function () { if (!pop.hidden && lastBtn) place(lastBtn); }, { passive: true });
  box.addEventListener("scroll", function () {   // 칩 줄을 밀면 창이 칩을 따라가고, 칩이 줄 밖으로 나가면 닫힘
    if (pop.hidden || !lastBtn) return;
    var r = lastBtn.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.right < b.left + 8 || r.left > b.right - 8) hide(); else place(lastBtn);
  }, { passive: true });

  /* ---------- 시작·갱신 ---------- */
  var lastLoad = 0, lastRg = null;
  function loadAll() { lastLoad = Date.now(); lastRg = region(); loadTicker(); loadWx(); }
  loadAll();
  document.addEventListener("visibilitychange", function () { if (!document.hidden && Date.now() - lastLoad > 10 * 60e3) loadAll(); });
  if (window.TNStore && window.TNStore.subscribe) window.TNStore.subscribe(function () { if (region() !== lastRg) { lastRg = region(); st.wx = st.aq = null; loadWx(); } });
  window.TNTicker = { reload: loadAll, state: st, pmLevel: pmLevel };
})();
