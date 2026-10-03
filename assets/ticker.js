/* 태국 뉴스 한눈에 — 헤더 둘째 줄 '빠른 정보' 칩 (☰ 오른쪽, 좁은 화면에서는 옆으로 밀기)
 * 순서(운영자 확정): ① 바트↔원 환율 ② 날씨 ③ 금시세 ④ 미세먼지 PM2.5
 *  ①③ data/ticker.json(GitHub Actions korea.yml → tools/fetch_ticker.py, 2시간마다). file:// 에서는 data/ticker.js(window.TN_TICKER)
 *  ②④ Open-Meteo(무료·키 없음·CORS 허용)를 브라우저에서 직접 — 지역 = 이 기기에서 고른 지역 > 페르소나(파타야/시라차/방콕) > 파타야
 *     날씨 30분, 미세먼지 60분 localStorage 캐시
 * 값이 없거나 24시간 넘게 지난 칩은 숨긴다(틀린 숫자를 보여 주지 않음). 칩을 누르면 출처·업데이트 시각·링크가 있는 작은 창.
 * 템플릿 공용: index.html 하나가 모든 판을 렌더하므로 판을 새로 만들어도 그대로 유지된다(README '헤더').
 */
(function () {
  "use strict";
  var TZ = "Asia/Bangkok", DAY = 864e5, $ = function (id) { return document.getElementById(id); };
  var box = $("ticker"); if (!box) return;
  var REGIONS = {
    pattaya:  { name: "파타야", lat: 12.9236, lon: 100.8825 },
    sriracha: { name: "시라차", lat: 13.1682, lon: 100.9310 },
    bangkok:  { name: "방콕",   lat: 13.7563, lon: 100.5018 }
  };
  var LS_REGION = "tnk.wxRegion", LS_WX = "tnk.wx.v1", LS_AQ = "tnk.aq.v1";
  var WX_TTL = 30 * 60e3, AQ_TTL = 60 * 60e3;
  var st = { tk: null, wx: null, aq: null };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function ms(iso) { var t = iso ? new Date(iso).getTime() : NaN; return isFinite(t) ? t : 0; }
  function fresh(iso, max) { var t = ms(iso); return t > 0 && Date.now() - t <= max && t - Date.now() < 36e5; }
  function n0(x) { return Math.round(x).toLocaleString("ko-KR"); }
  function when(iso) {
    var o = {}; new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date(iso)).forEach(function (p) { o[p.type] = p.value; });
    return o.month + "월 " + o.day + "일(" + o.weekday + ") " + o.hour + ":" + o.minute;
  }
  function region() {
    var r = ls(LS_REGION); if (REGIONS[r]) return r;
    var p = window.TNStore && window.TNStore.get() && window.TNStore.get().persona;
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
    if (c && c.rg === rg && Date.now() - c.at < ttl && c.d) return Promise.resolve(c.d);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      var d = pick(j); ls(key, { rg: rg, at: Date.now(), d: d }); return d;
    }).catch(function () { return c && c.rg === rg ? c.d : null; });   // 실패하면 같은 지역의 이전 캐시(신선도는 render 에서 판단)
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
    if (c === 0) return [day === 0 ? "🌙" : "☀️", "맑음"];
    if (c === 1) return [day === 0 ? "🌙" : "🌤️", "대체로 맑음"];
    if (c === 2) return ["⛅", "구름 조금"];
    if (c === 3) return ["☁️", "흐림"];
    if (c === 45 || c === 48) return ["🌫️", "안개"];
    if (c >= 51 && c <= 57) return ["🌦️", "이슬비"];
    if (c >= 61 && c <= 67) return ["🌧️", "비"];
    if (c >= 71 && c <= 77) return ["❄️", "눈"];
    if (c >= 80 && c <= 82) return ["🌦️", "소나기"];
    if (c === 85 || c === 86) return ["🌨️", "눈 소나기"];
    if (c >= 95) return ["⛈️", "뇌우"];
    return ["🌡️", ""];
  }
  // PM2.5 4단계 — 태국 오염관리국(PCD) 2023년 AQI 기준(15/25/37.5/75 µg/m³)을 4단계로 묶음: 좋음(0–25) 보통(25.1–37.5) 나쁨(37.6–75) 매우 나쁨(75.1~)
  function pmLevel(v) {
    if (v <= 25) return { k: "good", t: "좋음" };
    if (v <= 37.5) return { k: "mod", t: "보통" };
    if (v <= 75) return { k: "bad", t: "나쁨" };
    return { k: "vbad", t: "매우 나쁨" };
  }
  function fxOK() { var f = st.tk && st.tk.fx; return f && f.THB_KRW > 0 && fresh(f.fetched_at, DAY) && fresh(f.rate_time, 2 * DAY) ? f : null; }
  function goldOK() { var g = st.tk && st.tk.gold; return g && g.bar_sell > 0 && fresh(g.fetched_at, DAY) && fresh(g.announced_at, 4 * DAY) ? g : null; }
  // 날씨·미세먼지: 브라우저에서 직접 받은 Open-Meteo 값 우선, 실패하면 data/ticker.json 의 서버 값(Actions 가 2시간마다) — 둘 다 3시간 안의 것만
  function srv(key, rg) {
    var s = st.tk && st.tk[key], v = s && s.regions && s.regions[rg];
    return v && fresh(s.fetched_at, DAY) ? Object.assign({ rg: rg, src: s.source, url: s.url, viaServer: true }, v) : null;
  }
  function wxOK() {
    var rg = region(), w = st.wx && st.wx.rg === rg && fresh(st.wx.time, 3 * 36e5) ? Object.assign({ src: "Open-Meteo", url: "https://open-meteo.com/" }, st.wx) : null;
    if (!w) { w = srv("wx", rg); if (w && !fresh(w.time, 3 * 36e5)) w = null; }
    return w && typeof w.t === "number" ? w : null;
  }
  function aqOK() {
    var rg = region(), a = st.aq && st.aq.rg === rg && fresh(st.aq.time, 3 * 36e5) ? Object.assign({ src: "Open-Meteo 대기질 (CAMS 예측 모델)", url: "https://open-meteo.com/en/docs/air-quality-api" }, st.aq) : null;
    if (!a) { a = srv("aq", rg); if (a && !fresh(a.time, 3 * 36e5)) a = null; }
    return a && typeof a.pm === "number" ? a : null;
  }

  function chip(k, label, inner, extra) {
    return '<button type="button" class="tk-chip' + (extra || "") + '" data-tk="' + k + '" aria-haspopup="dialog" aria-label="' + esc(label) + '">' + inner + "</button>";
  }
  function render() {
    var h = [], f = fxOK(), w = wxOK(), g = goldOK(), a = aqOK();
    if (f) h.push(chip("fx", "바트→원 환율 1바트 " + f.THB_KRW.toFixed(1) + "원", '<span class="tk-i" aria-hidden="true">💱</span>1฿ = <b>' + f.THB_KRW.toFixed(1) + "원</b>"));
    if (w) {
      var ic = wmo(w.code, w.day);
      h.push(chip("wx", REGIONS[w.rg].name + " 날씨 " + Math.round(w.t) + "도 " + ic[1] + (w.rain != null ? " 강수확률 " + w.rain + "%" : ""),
        '<span class="tk-l">' + REGIONS[w.rg].name + '</span><span class="tk-i" aria-hidden="true">' + ic[0] + "</span><b>" + Math.round(w.t) + "°</b>" +
        (w.rain != null ? '<span class="tk-rain">☔' + w.rain + "%</span>" : "")));
    }
    if (g) {
      var krw = f ? Math.round(g.bar_sell * f.THB_KRW) : null;
      h.push(chip("gold", "태국 금시세 금괴 1바트 " + n0(g.bar_sell) + "바트" + (krw ? " 약 " + n0(krw) + "원" : ""),
        '<span class="tk-i" aria-hidden="true">🪙</span><span class="tk-l">금 1바트</span><b>' + n0(g.bar_sell) + "฿</b>" + (krw ? '<span class="tk-sub">≈' + n0(krw) + "원</span>" : "")));
    }
    if (a) {
      var lv = pmLevel(a.pm);
      h.push(chip("pm", "미세먼지 PM2.5 " + Math.round(a.pm) + " " + lv.t,
        '<span class="tk-l">PM2.5</span><b>' + Math.round(a.pm) + '</b><span class="tk-lv tk-lv--' + lv.k + '">' + lv.t + "</span>"));
    }
    var open = pop && !pop.hidden ? pop.getAttribute("data-k") : null;
    box.innerHTML = h.join("");
    box.classList.toggle("is-empty", !h.length);
    if (open) { var b = box.querySelector('[data-tk="' + open + '"]'); if (b) show(open, b, true); else hide(); }
  }

  /* ---------- 작은 정보 창 ---------- */
  var pop = document.createElement("div");
  pop.className = "tk-pop"; pop.id = "tickPop"; pop.hidden = true; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "출처·업데이트 시각");
  document.body.appendChild(pop);
  var lastBtn = null;
  function src(name, url, lines) {
    return '<p class="tk-pop__src">' + lines.map(esc).join("<br>") + '<br>출처: <a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(name) + " ↗</a></p>";
  }
  function body(k) {
    var f = fxOK(), w = wxOK(), g = goldOK(), a = aqOK();
    if (k === "fx" && f) return "<b class=\"tk-pop__t\">💱 바트 → 원 환율</b><p>1바트 = <b>" + f.THB_KRW.toFixed(2) + "원</b> · 1만 바트 ≈ " + n0(f.THB_KRW * 1e4) + "원</p>" +
      src(f.source, f.url, ["기준 시각 " + when(f.rate_time) + " (방콕)", "받아 온 시각 " + when(f.fetched_at) + " · 참고용(은행·환전소 실제 환율과 다름)"]);
    if (k === "wx" && w) {
      var ic = wmo(w.code, w.day), cur = region();
      return "<b class=\"tk-pop__t\">" + ic[0] + " " + REGIONS[w.rg].name + " 지금 날씨</b><p><b>" + w.t.toFixed(1) + "°C</b> " + esc(ic[1]) +
        (w.rain != null ? " · 앞으로 6시간 최고 강수확률 <b>" + w.rain + "%</b>" : (typeof w.rain6_mm === "number" ? " · 앞으로 6시간 강수량 " + w.rain6_mm + "mm" : "")) + "</p>" +
        '<div class="tk-pop__rg" role="group" aria-label="날씨·미세먼지 지역">' + Object.keys(REGIONS).map(function (r) {
          return '<button type="button" data-rg="' + r + '" aria-pressed="' + (r === cur) + '">' + REGIONS[r].name + "</button>"; }).join("") + "</div>" +
        src(w.src, w.url, ["예보 모델 기준 " + when(w.time) + " (방콕) · " + (w.viaServer ? "서버에서 2시간마다 받은 값" : "30분마다 새로"), "지역 기본값 = '어떤 분이세요?'에서 고른 곳(없으면 파타야)"]);
    }
    if (k === "gold" && g) {
      var krw = f ? Math.round(g.bar_sell * f.THB_KRW) : null;
      return "<b class=\"tk-pop__t\">🪙 태국 금시세</b><p class=\"tk-pop__note\">" + esc(g.unit) + " 기준</p><p>판매 <b>" + n0(g.bar_sell) + "바트</b>" + (krw ? " (약 " + n0(krw) + "원)" : "") +
        " · 매입 " + n0(g.bar_buy) + "바트" + (typeof g.change === "number" && g.change ? " · 직전 대비 " + (g.change > 0 ? "▲" : "▼") + n0(Math.abs(g.change)) : "") + "</p>" +
        src(g.source, g.url, ["협회 발표 " + when(g.announced_at) + (g.round ? " · 그날 " + g.round + "번째 발표" : "") + " (주말·공휴일엔 발표 없음)",
          "받아 온 시각 " + when(g.fetched_at) + (krw ? " · 원화는 위 환율로 환산(정수 반올림)" : "")]);
    }
    if (k === "pm" && a) {
      var lv = pmLevel(a.pm);
      return "<b class=\"tk-pop__t\">😷 " + REGIONS[a.rg].name + " 미세먼지 PM2.5</b><p><b>" + a.pm.toFixed(1) + ' µg/m³</b> <span class="tk-lv tk-lv--' + lv.k + '">' + lv.t + "</span></p>" +
        '<p class="tk-pop__note">단계: 태국 오염관리국(PCD) 기준을 4단계로 — 좋음 0–25 · 보통 25.1–37.5 · 나쁨 37.6–75 · 매우 나쁨 75 초과</p>' +
        src(a.src, a.url, ["모델 기준 " + when(a.time) + " (방콕)" + (a.viaServer ? " · 서버에서 2시간마다 받은 값" : " · 1시간마다 새로"), "측정소 실측값이 아닌 예측 모델 값 — 실측은 Air4Thai(air4thai.pcd.go.th)"]);
    }
    return "";
  }
  function place(btn) {
    var r = btn.getBoundingClientRect(), W = document.documentElement.clientWidth, pw = Math.min(320, W - 16);
    pop.style.width = pw + "px";
    pop.style.left = Math.max(8, Math.min(r.left, W - pw - 8)) + "px";
    pop.style.top = (r.bottom + 8) + "px";
  }
  function show(k, btn, keep) {
    var html = body(k); if (!html) { hide(); return; }
    pop.innerHTML = '<button type="button" class="tk-pop__x" aria-label="닫기">✕</button>' + html;
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
