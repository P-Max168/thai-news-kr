/* 태국 뉴스 한눈에 — ⚠️ 오류 신고(2026-10-05). 기사·가게 카드(#places)·임대 카드(#rent)·광고 자리마다 작은 '오류 신고' 버튼.
 * 누르면 버튼 바로 아래가 펼쳐짐(팝업·덮는 시트 없음): 정보 틀림 / 링크 깨짐 / 화면 이상 / 기타 + 한 줄 메모. 로그인 필요 없음.
 * 받는 곳: Firestore reports/{자동 id}(운영자만 읽기, 누구나 추가만 — firestore.rules) → 관리자 승인함 #approve '오류 신고함'. 자동 처리 없음.
 *   ★ REP_ON = true(2026-10-05 03:26 Max — 03:24 규칙 게시 뒤): 먼저 서버(reports)에 저장. 서버 저장이 실패할 때만
 *     이 휴대폰에 저장 + '메일로 보내기'(운영자 메일, 내용 미리 채움). 이 기기만 끄기(시험용): localStorage tnk.repon = "0"
 * 같은 기기 제한: 30초에 1번, 하루 10번, 같은 항목·같은 종류는 하루 1번. 이 파일은 app.js 가 버튼을 처음 누를 때 불러옴. */
(function () {
  "use strict";
  var REP_ON = true;
  try { if (localStorage.getItem("tnk.repon") === "0") REP_ON = false; } catch (e) {}
  var MAIL = "mgisgood1919@gmail.com";
  var QK = "tnk.rep.q", LK = "tnk.rep.log";
  var TYPES = [["wrong", "정보 틀림"], ["link", "링크 깨짐"], ["screen", "화면 이상"], ["etc", "기타"]];
  var KINDS = { article: "기사", place: "가게 카드", rent: "임대 카드", ad: "광고" };
  var seq = 0;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || "[]") || []; } catch (e) { return []; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function typeLabel(t) { var x = TYPES.filter(function (y) { return y[0] === t; })[0]; return x ? x[1] : t; }
  function pageURL() { return String(location.href).split("?_=")[0].slice(0, 300); }

  /* 같은 기기 제한(스팸 막기). 통과면 "" , 아니면 화면에 보일 이유 */
  function limited(id, type) {
    var now = Date.now(), log = rd(LK).filter(function (x) { return x && now - x.t < 864e5; });
    if (log.some(function (x) { return x.id === id && x.k === type; })) return "이 항목은 오늘 같은 내용으로 이미 신고했어요. 고마워요!";
    if (log.length >= 10) return "오늘은 이 휴대폰에서 신고를 10번 했어요. 내일 다시 보내 주세요.";
    var last = log.length ? log[log.length - 1].t : 0;
    if (now - last < 30e3) return "방금 신고했어요. " + Math.ceil((30e3 - (now - last)) / 1000) + "초 뒤에 다시 보내 주세요.";
    return "";
  }
  function logIt(id, type) { var now = Date.now(); var log = rd(LK).filter(function (x) { return x && now - x.t < 864e5; }); log.push({ id: id, k: type, t: now }); wr(LK, log.slice(-20)); }

  function mailHref(r) {
    var body = "사이트 오류 신고\n\n종류: " + (KINDS[r.kind] || r.kind) + "\n항목: " + r.id + "\n문제: " + typeLabel(r.type) + "\n메모: " + (r.memo || "(없음)") +
      "\n페이지: " + r.url + "\n시각(방콕): " + new Date(r.t).toLocaleString("ko-KR", { timeZone: "Asia/Bangkok" }) + "\n";
    return "mailto:" + MAIL + "?subject=" + encodeURIComponent("[태국 뉴스 한눈에] 오류 신고 · " + typeLabel(r.type)) + "&body=" + encodeURIComponent(body);
  }

  function panelHTML(n) {
    return '<div class="rep" id="rep-' + n + '" role="group" aria-label="오류 신고">' +
      '<p class="rep__h">어떤 문제인가요?</p><div class="rep__ks" role="radiogroup" aria-label="문제 종류">' +
      TYPES.map(function (t) { return '<button type="button" class="rep__k" role="radio" aria-checked="false" data-rep-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<input class="rep__m" type="text" maxlength="80" enterkeyhint="send" placeholder="한 줄 메모 (선택, 80자까지)" aria-label="한 줄 메모 (선택)">' +
      '<div class="rep__acts"><button type="button" class="rep__send" data-rep-send disabled>보내기</button><button type="button" class="rep__x" data-rep-x>닫기</button></div>' +
      '<p class="rep__st" role="status" aria-live="polite"></p></div>';
  }
  function close(btn) { var p = btn._rep; if (p && p.parentNode) p.parentNode.removeChild(p); btn._rep = null; btn.setAttribute("aria-expanded", "false"); }
  function toggle(btn) {
    if (btn._rep && btn._rep.parentNode) return close(btn);
    var n = ++seq, w = document.createElement("div");
    w.innerHTML = panelHTML(n); var p = w.firstChild;
    var at = btn.closest(".rep-row") || btn;   // 버튼 줄 바로 아래(같은 줄 옆이 아니라)
    at.parentNode.insertBefore(p, at.nextSibling);
    btn._rep = p; p._btn = btn;
    btn.setAttribute("aria-expanded", "true"); btn.setAttribute("aria-controls", "rep-" + n);
    var why = limited(btn.getAttribute("data-rep-id"), "");
    if (why && !/이미/.test(why)) status(p, why, "warn");
    var f = p.querySelector(".rep__k"); if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
  }
  function status(p, html, cls) { var s = p.querySelector(".rep__st"); s.className = "rep__st" + (cls ? " rep__st--" + cls : ""); s.innerHTML = html; }

  function send(p) {
    var btn = p._btn, k = p.querySelector('.rep__k[aria-checked="true"]');
    if (!btn || !k) return;
    var id = String(btn.getAttribute("data-rep-id") || "").slice(0, 80), type = k.getAttribute("data-rep-k");
    var memo = String(p.querySelector(".rep__m").value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
    var why = limited(id, type);
    if (why) return status(p, esc(why), "warn");
    var ed = (window.TNApp && TNApp.edId && TNApp.edId()) || "";
    var r = { id: id, kind: KINDS[btn.getAttribute("data-rep")] ? btn.getAttribute("data-rep") : "article", type: type, memo: memo, url: pageURL(), ed: String(ed).slice(0, 20), t: Date.now(), sent: false };
    logIt(id, type);
    var q = rd(QK); q.push(r); var saved = wr(QK, q.slice(-30));
    p.querySelector("[data-rep-send]").disabled = true;
    // 메일은 '서버 저장 실패'(또는 이 기기에서 끈 경우)에만 — 정상일 땐 메일 버튼 없음
    var fallback = function () {
      status(p, (REP_ON ? "<b>서버에 저장하지 못했어요</b>(인터넷 연결 등). " : "") + (saved ? "이 휴대폰에 저장했어요. " : "") + "<b>아직 운영자에게 자동으로 전달되지 않았어요.</b> 바로 알리려면 아래 버튼으로 메일을 보내 주세요(내용은 미리 채워져 있어요)." +
        '<a class="rep__mail" href="' + esc(mailHref(r)) + '">메일로 보내기</a>', "info");
    };
    if (!REP_ON || !window.TNSocial || !TNSocial.report) return fallback();
    status(p, "보내는 중…", "");
    // 서버가 12초 안에 답이 없으면(느린·끊긴 연결) 실패로 보고 메일 버튼을 보여 줌
    var tmo = new Promise(function (ok, no) { setTimeout(function () { no(new Error("timeout")); }, 12e3); });
    Promise.race([TNSocial.report(r), tmo]).then(function (docId) {
      // 서버에 들어간 신고는 이 기기 목록에서 뺌(승인함 '이 기기에 저장된 신고' = 서버로 못 보낸 것만)
      r.sent = true; wr(QK, rd(QK).filter(function (x) { return !(x.t === r.t && x.id === r.id); }));
      try { p.setAttribute("data-rep-doc", String(docId || "")); } catch (e) {}
      status(p, "<b>신고가 운영자 승인함에 들어갔어요.</b> 운영자가 직접 확인해요. 고마워요!", "ok");
    }).catch(function () { fallback(); });
  }

  document.addEventListener("click", function (e) {
    var t = e.target; if (!t.closest) return;
    var p = t.closest(".rep"); if (!p) return;
    e.stopPropagation();
    var el;
    if ((el = t.closest("[data-rep-k]"))) {
      [].forEach.call(p.querySelectorAll(".rep__k"), function (b) { b.setAttribute("aria-checked", String(b === el)); });
      p.querySelector("[data-rep-send]").disabled = false; return;
    }
    if (t.closest("[data-rep-send]")) return send(p);
    if (t.closest("[data-rep-x]") && p._btn) { var b = p._btn; close(b); try { b.focus({ preventScroll: true }); } catch (x) {} }
  }, true);
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains("rep__m") || e.key !== "Enter") return;
    e.preventDefault(); var p = t.closest(".rep"); if (p && !p.querySelector("[data-rep-send]").disabled) send(p);
  });

  /* 승인함(#approve)용: 이 기기에 저장된 신고 */
  window.TNReport = { toggle: toggle, local: function () { return rd(QK); }, on: function () { return REP_ON; }, types: TYPES, kinds: KINDS, typeLabel: typeLabel };
})();
