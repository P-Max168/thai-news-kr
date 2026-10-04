/* 태국 뉴스 한눈에 — 선택 기능: Google 로그인 · 설정 동기화 · 댓글 (UI)
 * Firebase 코드는 assets/fb.js(ES 모듈)에 있고 여기서 필요할 때만 import() 한다.
 * - 로그인한 적 없으면: 페이지가 다 뜬 뒤 쉬는 시간에 로그인 모듈만 미리 받아 둔다(팝업이 막히지 않게). 실패해도 아무 일 없음.
 * - file:// 이거나 Firebase 를 못 불러오면 로그인 버튼·댓글은 조용히 숨고 사이트는 예전과 똑같이 동작.
 * - 공개 화면에는 구글 실명·이메일을 절대 표시하지 않는다(헤더엔 내 사진만, 댓글엔 닉네임만).
 */
(function () {
  "use strict";
  var FB_URL = "assets/fb.js?v=05834eb7";       // tools/stamp_assets.py 가 ?v= 갱신
  var AUTH_KEY = "tnk.auth.v1";                  // 이 기기: {uid, linked:[uid…]} (계정 정보는 저장 안 함)
  var S = window.TNStore, L = window.TNTaste;
  var live = /^https?:$/.test(location.protocol);
  var $ = function (id) { return document.getElementById(id); };
  var failed = false;   // Firebase 를 못 불러옴(오프라인·차단) → 로그인 버튼 숨김, 사이트는 그대로
  var fbP = null, fb = null, user = null, profile = null, admin = false, syncState = "", ready = false;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(m, ms) { if (window.TNApp && window.TNApp.toast) window.TNApp.toast(m, ms); }
  function rd() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function wr(o) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(o)); } catch (e) {} }

  function load() {
    if (!live) return Promise.reject(new Error("file"));
    if (!fbP) {
      fbP = import(new URL(FB_URL, document.baseURI).href).then(function (m) { fb = m; return m; });
      fbP.catch(function (e) { console.warn("[로그인] Firebase 를 불러오지 못함(로그인 없이 계속):", e); fbP = null; failed = true; refreshUI(); });
    }
    return fbP;
  }

  /* ---------- 헤더 계정 버튼 ---------- */
  var G = '<svg class="g" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  function avatar(cls) {
    var p = user && user.photoURL;
    return p ? '<img class="' + cls + '" src="' + esc(p) + '" alt="" referrerpolicy="no-referrer" width="30" height="30">' : '<span class="' + cls + ' ' + cls + '--none" aria-hidden="true">🙂</span>';
  }
  function renderHeader() {
    var el = $("acct"); if (!el) return;
    if (!live || (failed && !user)) { el.hidden = true; return; }
    el.hidden = false;
    if (user) el.innerHTML = '<button type="button" class="acct__me" data-acct-menu aria-haspopup="true" aria-label="내 계정">' + avatar("acct__av") + "</button>";
    else el.innerHTML = '<button type="button" class="gbtn" data-login>' + G + '<span class="gbtn__t">구글로 로그인</span><span class="gbtn__s">로그인</span></button>';
  }
  function statusText() {
    return syncState === "error" ? "⚠️ 동기화 오류 — 잠시 뒤 다시 시도해요" : syncState === "saving" ? "저장 중…" : "✓ 구글 계정에 저장됨";
  }
  function menuHTML() {
    return '<div class="acct-menu__in">' +
      '<div class="acct-menu__top">' + avatar("acct-menu__av") + '<div><b>' + (profile ? esc(profile.nickname) : "구글 계정으로 로그인됨") + "</b>" + (admin ? ' <span class="badge-op">운영자</span>' : "") +
      '<small class="acct-sync">' + statusText() + "</small></div></div>" +
      '<p class="acct-menu__note">내 주제·취향이 다른 기기에서도 이어져요. 댓글에는 닉네임만 보여요.</p>' +
      (profile ? '<button type="button" class="setbtn setbtn--sm" data-nick-edit>닉네임 바꾸기</button>' : "") +
      '<button type="button" class="btn btn--sm acct-out" data-logout>로그아웃</button>' +
      '<p class="acct-uid">내 사용자 ID(UID): <code>' + esc(user.uid) + "</code></p></div>";
  }
  function closeMenu() { var m = $("acctMenu"); if (m) m.remove(); }
  function openMenu() {
    closeMenu();
    var m = document.createElement("div"); m.id = "acctMenu"; m.className = "acct-menu"; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "내 계정");
    m.innerHTML = menuHTML(); document.body.appendChild(m);
  }
  /* 🧩 설정 창 안의 계정 칸 */
  function renderAccountBox(el) {
    if (!el) return;
    if (!live || (failed && !user)) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = user
      ? '<div class="acct-box__row">' + avatar("acct__av") + '<span><b>구글 계정으로 로그인됨</b><small>' + statusText() + '</small></span><button type="button" class="btn btn--sm acct-out" data-logout>로그아웃</button></div>' +
        (admin ? '<div class="adm-links"><button type="button" class="adm-link" data-page="admin">📊 반응 통계</button>' + (window.TNPages && TNPages.has("approve") ? '<button type="button" class="adm-link" data-page="approve">✅ 승인함</button>' : "") + '</div>' : "")
      : '<div class="acct-box__row"><span><b>다른 기기에서도 이어 보기</b><small>로그인은 선택이에요. 안 해도 모든 기능을 쓸 수 있어요.</small></span><button type="button" class="gbtn gbtn--light" data-login>' + G + '<span>구글로 로그인</span></button></div>';
  }
  function refreshUI() {
    renderHeader();
    if ($("acctBox")) renderAccountBox($("acctBox"));
    if ($("drawerAcct")) renderAccountBox($("drawerAcct"));
    var n = $("storeNote"); if (n) n.textContent = user ? "구글 계정에 저장돼 다른 기기에서도 이어져요." : "설정과 취향은 이 기기(브라우저)에만 저장돼요. 구글로 로그인하면 다른 기기에서도 이어져요(선택).";
    if ($("acctMenu")) $("acctMenu").innerHTML = menuHTML();
    document.querySelectorAll("[data-cmts].is-mounted").forEach(function (c) { renderComments(c); });
    if (window.TNPages && /^(admin|approve)$/.test(TNPages.current() || "")) TNPages.refresh();
  }

  /* ---------- 로그인 · 동기화 ---------- */
  function onUser(u) {
    var was = user && user.uid;
    user = u || null;
    if (!user) { profile = null; admin = false; syncState = ""; if (fb) fb.stopSync(); var a = rd(); delete a.uid; wr(a); refreshUI(); return; }
    if (was === user.uid) { refreshUI(); return; }
    var a = rd(), linked = a.linked || [], newDevice = linked.indexOf(user.uid) < 0;
    a.uid = user.uid; wr(a);
    refreshUI();
    fb.startSync(user, S, L.mergeDocs, { newDevice: newDevice }, function (st) { syncState = st; refreshUI(); })
      .then(function () {
        var b = rd(); b.linked = (b.linked || []).filter(function (x) { return x !== user.uid; }).concat([user.uid]).slice(-5); wr(b);
        syncState = syncState || "ok"; refreshUI();
      })
      .catch(function (e) { console.warn("[sync]", e); syncState = "error"; refreshUI(); });
    fb.getProfile(user.uid).then(function (p) { profile = p; return fb.isAdmin(user.uid); }).then(function (x) { admin = x; refreshUI(); }).catch(function () {});
  }
  function start(m) {
    if (ready) return;
    ready = true;
    setTimeout(rxFlush, 2000);   // 지난번에 못 보낸 반응
    m.onUser(onUser);
    m.redirectResult().then(function (r) {
      if (r && r.failed && !m.currentUser()) toast("로그인이 끝나지 않았어요. Safari(또는 Chrome) 브라우저에서 열어 다시 시도해 주세요.", 5000);
    });
  }
  function login() {
    toast("구글 로그인 창을 여는 중…", 1500);
    load().then(function (m) { start(m); return m.signIn(); }).then(function (u) {
      if (u) toast("로그인했어요. 내 주제·취향을 계정에 저장할게요 🙂");
    }).catch(function (e) {
      var c = e && e.code;
      if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return;
      console.warn("[로그인]", e);
      toast(c === "auth/network-request-failed" || !fb ? "인터넷 연결을 확인해 주세요. 로그인 없이도 그대로 볼 수 있어요." : "로그인하지 못했어요(" + esc(c || "오류") + "). 잠시 뒤 다시 시도해 주세요.", 4000);
    });
  }
  function logout() {
    if (!fb) return;
    closeMenu();
    fb.signOutNow().then(function () { toast("로그아웃했어요. 이 기기의 설정은 그대로 남아 있어요."); });
  }

  /* ---------- 댓글 ---------- */
  var BAD = ["씨발", "시발", "ㅅㅂ", "ㅆㅂ", "씹", "병신", "ㅂㅅ", "좆", "존나", "개새", "개색", "지랄", "ㅈㄹ", "미친놈", "미친년", "닥쳐", "꺼져", "느금", "니미", "엠창", "썅", "보지", "자지", "섹스", "야동", "창녀", "걸레년",
    "เหี้ย", "สัส", "ควย", "หี", "เย็ด", "แม่ง", "ไอ้สัตว์", "อีดอก", "ส้นตีน", "กะหรี่",
    "fuck", "fck", "shit", "bitch", "cunt", "asshole", "pussy", "dick", "nigg", "fag", "porn", "whore", "slut"];
  var SPAM = [/https?:\/\//i, /www\./i, /\b[a-z0-9-]+\.(com|net|org|io|xyz|top|co|me|ly|gg|th)\b/i, /카지노|바카라|토토|슬롯|대출|도박|텔레그램|텔레|카톡\s*아이디|라인\s*아이디/, /casino|baccarat|slot|viagra|crypto|telegram|whatsapp|line\s*id|bit\.ly/i, /บาคาร่า|สล็อต|คาสิโน|เว็บพนัน/, /(.)\1{7,}/];
  function norm(t) { return String(t).toLowerCase().replace(/[\s.,_\-*~!?·ㆍ'"`^]+/g, ""); }
  function badText(t) {
    var n = norm(t);
    for (var i = 0; i < BAD.length; i++) if (n.indexOf(BAD[i]) >= 0) return "bad";
    for (var j = 0; j < SPAM.length; j++) if (SPAM[j].test(t)) return "spam";
    return null;
  }
  function nickOk(n) {
    n = String(n || "").trim();
    if (n.length < 2 || n.length > 12) return "닉네임은 2~12자로 정해 주세요.";
    if (!/^[0-9A-Za-z가-힣ㄱ-ㅎ\u0E00-\u0E7F _-]+$/.test(n)) return "한글·영문·숫자·태국어·띄어쓰기·_ - 만 쓸 수 있어요.";
    if (/운영자|관리자|운영진|admin|관리인|official/i.test(n.replace(/\s/g, ""))) return "'운영자' 같은 이름은 쓸 수 없어요.";
    if (badText(n)) return "다른 닉네임을 골라 주세요.";
    return null;
  }
  function defaultNick() { return "파타야 회원 " + String(Math.floor(1000 + Math.random() * 9000)); }
  function fmt(ms) {
    var p = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Bangkok", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ms));
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; }); return o.month + "/" + o.day + " " + o.hour + ":" + o.minute;
  }
  var cache = {};   // key "<판>/<기사>" → {list, replies:{부모 id: [...]}, err, loading}
  var pendingQR = null;   // 로그인 전에 누른 추천 문장 {key, parent, text} → 로그인 후 댓글 칸에 채움(자동 등록 안 함)
  /* 💡 추천 문장(판 데이터 story.quick_replies — 편집 때 작성) / 답글 추천(부모 댓글 내용으로 화면에서 간단한 틀 고르기).
   * 누르면 댓글 칸에 채우기만 하고, 등록은 로그인한 사용자가 직접 '등록'을 눌러 자기 닉네임으로 올린다(자동 등록 없음). */
  var QR_LABEL = "추천 문장 · 눌러서 내 댓글로";
  function replyChips(t) {
    t = String(t || "").trim();
    if (/명복|조의|애도|숨지|숨진|사망|별세/.test(t)) return ["삼가 고인의 명복을 빕니다", "마음이 아프네요"];
    if (/[?？]\s*$|(나요|까요|가요|는지|을까|있나|어때|어떤가|아시는 분|계세요)[\s?？.!~]*$/.test(t)) return ["저도 궁금했어요", "아시는 분 답 부탁드려요", "좋은 질문이에요"];
    if (/^운영자입니다/.test(t)) return ["좋은 정보 감사해요!", "저도 궁금했어요", "혹시 더 자세한 소식 있나요?"];
    if (/\d|있어요|했어요|입니다|래요|더라고요|대요|됐어요|돼요/.test(t)) return ["정보 감사해요!", "혹시 언제 일인가요?", "어느 쪽 얘기인가요?"];
    return ["공감해요", "정보 감사해요!", "저도 궁금했어요"];
  }
  function chipsHTML(list, parent) {
    list = (list || []).filter(function (x) { return typeof x === "string" && x.trim(); }).slice(0, 4);
    if (!list.length) return "";
    return '<div class="qr"' + (parent ? ' data-qr-parent="' + esc(parent) + '"' : "") + '><span class="qr__l">💡 ' + QR_LABEL + '</span><div class="qr__chips">' +
      list.map(function (x) { return '<button type="button" class="qr__c" data-qr="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div></div>";
  }
  function cKey(el) { return el.getAttribute("data-ed") + "/" + el.getAttribute("data-cmts"); }

  function mountComments(el, edition, story) {
    if (!live || !story) return;
    el.setAttribute("data-ed", edition);
    el._qr = Array.isArray(story.quick_replies) ? story.quick_replies : [];
    el._op = story.discussion && story.discussion.approved === true && story.discussion.operator_comment ? story.discussion.operator_comment : "";
    if (!el.classList.contains("is-mounted")) el.classList.add("is-mounted");
    var k = cKey(el);
    if (!cache[k] || cache[k].err) fetchComments(el); else renderComments(el);
  }
  function fetchComments(el) {
    var k = cKey(el); cache[k] = { loading: true, list: [] }; renderComments(el);
    var ed = el.getAttribute("data-ed"), aid = el.getAttribute("data-cmts");
    load().then(function (m) { start(m); return m.listComments(ed, aid).then(function (list) {
        // 답글(articleId "<기사>~<부모>") — 실패해도 댓글은 그대로 보여 줌
        var parents = ["op"].concat(list.map(function (c) { return c.id; }));
        return (m.listReplies ? m.listReplies(ed, aid, parents) : Promise.resolve([])).catch(function (e) { console.warn("[답글]", e); return []; })
          .then(function (rs) { return { list: list, rs: rs }; });
      }); })
      .then(function (r) {
        var by = {};
        r.rs.forEach(function (c) { var p = String(c.articleId || "").split("~")[1]; if (p) (by[p] = by[p] || []).push(c); });
        cache[k] = { list: r.list, replies: by };
      })
      .catch(function (e) { console.warn("[댓글]", e); cache[k] = { err: true, denied: e && e.code === "permission-denied", list: [] }; })
      .then(function () { document.querySelectorAll('[data-cmts="' + el.getAttribute("data-cmts") + '"]').forEach(renderComments); });
  }
  function cHTML(c, reply) {
    var mine = user && c.uid === user.uid;
    var acts = reply ? "" : '<button type="button" class="cbtn" data-c-reply="' + esc(c.id) + '">↳ 답글</button>';
    if (user && (mine || admin)) acts += '<button type="button" class="cbtn" data-c-del="' + esc(c.id) + '">삭제</button>';
    if (user && admin && !mine) acts += '<button type="button" class="cbtn" data-c-hide="' + esc(c.id) + '">숨기기</button>';
    if (user && !mine) acts += '<button type="button" class="cbtn" data-c-report="' + esc(c.id) + '">신고</button>';
    return '<div class="cmt' + (c.isAdmin ? " cmt--op" : "") + (reply ? " cmt--reply" : "") + '" data-cid="' + esc(c.id) + '"><div class="cmt__h"><b class="cmt__n">' + esc(c.nickname) + "</b>" + (c.isAdmin ? '<span class="badge-op">운영자</span>' : "") +
      '<span class="cmt__d">' + esc(fmt(c.createdAt)) + "</span>" + (mine ? '<span class="cmt__me">내 댓글</span>' : "") + "</div>" +
      '<p class="cmt__t">' + esc(c.text) + "</p>" + (acts ? '<div class="cmt__a">' + acts + "</div>" : "") + "</div>";
  }
  function replyFormHTML(el, parent, ptext) {
    return '<div class="rform" data-rform="' + esc(parent) + '">' + chipsHTML(replyChips(ptext), parent) +
      '<textarea maxlength="500" rows="2" placeholder="답글을 남겨 주세요 (500자까지)" data-r-text></textarea>' +
      '<div class="cform__foot"><span class="cform__msg" data-r-msg></span><button type="button" class="linkbtn" data-r-cancel>취소</button><button type="button" class="btn btn--primary btn--sm" data-r-send>등록</button></div></div>';
  }
  function repliesHTML(el, c, parent, ptext) {
    var rs = (c.replies && c.replies[parent]) || [];
    var open = el._replyTo === parent && user && profile;
    if (!rs.length && !open) return "";
    return '<div class="replies">' + rs.map(function (r) { return cHTML(r, true); }).join("") + (open ? replyFormHTML(el, parent, ptext) : "") + "</div>";
  }
  function formHTML(el) {
    if (!fb && !fbP) return "";
    var qr = chipsHTML(el && el._qr);
    if (!user) return qr + '<div class="cform cform--out"><span>댓글을 쓰려면 로그인해 주세요. <small>(댓글엔 닉네임만 보여요)</small></span><button type="button" class="gbtn gbtn--light" data-login>' + G + "<span>구글로 로그인</span></button></div>";
    if (!profile) return '<div class="cform cform--nick"><label><b>댓글에 쓸 닉네임을 정해 주세요</b><small>2~12자 · 구글 이름·이메일은 보이지 않아요</small>' +
      '<input type="text" maxlength="12" data-nick-input value="' + esc(defaultNick()) + '"></label><p class="cform__msg" data-c-msg></p><button type="button" class="btn btn--primary btn--sm" data-nick-save>이 닉네임으로 시작</button></div>';
    return qr + '<div class="cform"><div class="cform__who">' + esc(profile.nickname) + (admin ? ' <span class="badge-op">운영자</span>' : "") + '</div><textarea maxlength="500" rows="2" placeholder="생각을 남겨 주세요 (500자까지)" data-c-text></textarea>' +
      '<div class="cform__foot"><span class="cform__msg" data-c-msg></span><span class="cform__n" data-c-n>0/500</span><button type="button" class="btn btn--primary btn--sm" data-c-send>등록</button></div></div>';
  }
  function renderComments(el) {
    var c = cache[cKey(el)] || { list: [] };
    var body = c.loading ? '<p class="cmts__empty">댓글 불러오는 중…</p>'
      : c.err && c.denied ? '<p class="cmts__empty">댓글 기능을 준비 중이에요.</p>'
      : c.err ? '<p class="cmts__empty">댓글을 불러오지 못했어요. <button type="button" class="linkbtn" data-c-retry>다시 시도</button></p>'
      : c.list.length ? c.list.map(function (x) { return cHTML(x) + repliesHTML(el, c, x.id, x.text); }).join("") : '<p class="cmts__empty">첫 댓글을 남겨보세요</p>';
    var keep = el.querySelector("[data-c-text]"), draft = keep ? keep.value : "";
    var rk = el.querySelector("[data-r-text]"), rdraft = rk ? rk.value : "";
    var nrep = 0; Object.keys(c.replies || {}).forEach(function (p) { nrep += c.replies[p].length; });
    var opRep = el._op && !c.loading && !c.err ? repliesHTML(el, c, "op", el._op) : "";
    var tk = el.closest(".talk"), dn = tk && tk.querySelector("[data-dq-n]"); if (dn) dn.textContent = (c.list.length + nrep) ? "댓글 " + (c.list.length + nrep) : "";   // 접힌 '오늘의 질문' 줄에 댓글 수
    el.innerHTML = (opRep ? '<div class="replies--op">' + opRep + "</div>" : "") + '<h4 class="cmts__h">댓글 <em>' + ((c.list.length + nrep) || "") + "</em></h4>" + body + (c.err ? "" : formHTML(el));
    var ta = el.querySelector("[data-c-text]"); if (ta && draft) { ta.value = draft; }
    var ra = el.querySelector("[data-r-text]"); if (ra && rdraft) { ra.value = rdraft; }
    // 로그인 전에 눌렀던 추천 문장 → 로그인·닉네임 뒤 그 칸에 채움(직접 '등록'을 눌러야 올라감)
    if (pendingQR && user && profile && pendingQR.key === cKey(el)) {
      var tgt = pendingQR.parent ? el.querySelector("[data-r-text]") : ta;
      if (tgt && !tgt.value) { fillBox(tgt, pendingQR.text); pendingQR = null; }
    }
  }
  function fillBox(box, text) {
    box.value = text; box.focus();
    try { box.setSelectionRange(text.length, text.length); } catch (e) {}
    var n = box.closest("[data-cmts]") && box.closest(".cform") && box.closest(".cform").querySelector("[data-c-n]"); if (n) n.textContent = text.length + "/500";
  }
  function tapChip(el, chip) {
    var text = chip.getAttribute("data-qr"), wrap = chip.closest(".qr"), parent = wrap && wrap.getAttribute("data-qr-parent");
    if (!user) {   // 로그인 안 함 → 구글 로그인 안내. 로그인 뒤 이 문장을 칸에 채워 둠(자동 등록 안 함)
      pendingQR = { key: cKey(el), parent: parent || null, text: text };
      if (parent) el._replyTo = parent;
      toast("로그인하면 이 문장이 댓글 칸에 들어가요. 고쳐 쓴 뒤 '등록'을 눌러 주세요.", 3500);
      login(); return;
    }
    if (!profile) { pendingQR = { key: cKey(el), parent: parent || null, text: text }; var ni = el.querySelector("[data-nick-input]"); if (ni) ni.focus(); toast("먼저 댓글에 쓸 닉네임을 정해 주세요."); return; }
    var box = parent ? el.querySelector('[data-rform="' + parent + '"] [data-r-text]') : el.querySelector("[data-c-text]");
    if (box) fillBox(box, text);
  }
  function openReply(el, parent) {
    if (!user) { toast("답글을 쓰려면 구글로 로그인해 주세요. (댓글엔 닉네임만 보여요)", 3000); el._replyTo = parent; login(); return; }
    if (!profile) { toast("먼저 아래에서 댓글에 쓸 닉네임을 정해 주세요."); var ni = el.querySelector("[data-nick-input]"); if (ni) ni.focus(); return; }
    el._replyTo = el._replyTo === parent ? null : parent;
    renderComments(el);
    var ra = el.querySelector("[data-r-text]"); if (ra) ra.focus({ preventScroll: false });
  }
  function sendReply(el) {
    var f = el.querySelector("[data-rform]"); if (!f) return;
    var parent = f.getAttribute("data-rform"), ta = f.querySelector("[data-r-text]"), t = (ta.value || "").trim();
    var say = function (x) { var m = f.querySelector("[data-r-msg]"); if (m) m.textContent = x; };
    if (!t) return say("내용을 적어 주세요.");
    var b = badText(t);
    if (b) return say(b === "spam" ? "링크·광고성 문구는 쓸 수 없어요." : "욕설·비속어가 들어 있어요. 고쳐서 다시 올려 주세요.");
    var a = rd(); if (a.lastC && Date.now() - a.lastC < 30000) return say("댓글은 30초에 한 번만 쓸 수 있어요. 잠시만 기다려 주세요.");
    var btn = f.querySelector("[data-r-send]"); btn.disabled = true; say("올리는 중…");
    fb.addComment(el.getAttribute("data-ed"), el.getAttribute("data-cmts") + "~" + parent, t, { nickname: profile.nickname, isAdmin: admin }).then(function () {
      var x = rd(); x.lastC = Date.now(); wr(x); ta.value = ""; el._replyTo = null;
      toast("답글을 올렸어요"); fetchComments(el);
    }).catch(function (e) {
      console.warn("[답글 등록]", e); btn.disabled = false;
      say(e && e.code === "permission-denied" ? "지금은 올릴 수 없어요(30초에 한 번 · 닉네임 확인). 잠시 뒤 다시 시도해 주세요." : "올리지 못했어요. 인터넷 연결을 확인해 주세요.");
    });
  }
  function msg(el, t) { var m = el.querySelector("[data-c-msg]"); if (m) m.textContent = t; }
  function send(el) {
    var ta = el.querySelector("[data-c-text]"), t = (ta.value || "").trim();
    if (!t) return msg(el, "내용을 적어 주세요.");
    if (t.length > 500) return msg(el, "500자까지 쓸 수 있어요.");
    var b = badText(t);
    if (b) return msg(el, b === "spam" ? "링크·광고성 문구는 쓸 수 없어요." : "욕설·비속어가 들어 있어요. 고쳐서 다시 올려 주세요.");
    var a = rd(); if (a.lastC && Date.now() - a.lastC < 30000) return msg(el, "댓글은 30초에 한 번만 쓸 수 있어요. 잠시만 기다려 주세요.");
    var btn = el.querySelector("[data-c-send]"); btn.disabled = true; msg(el, "올리는 중…");
    fb.addComment(el.getAttribute("data-ed"), el.getAttribute("data-cmts"), t, { nickname: profile.nickname, isAdmin: admin }).then(function () {
      var x = rd(); x.lastC = Date.now(); wr(x); ta.value = "";
      toast("댓글을 올렸어요"); fetchComments(el);
    }).catch(function (e) {
      console.warn("[댓글 등록]", e); btn.disabled = false;
      msg(el, e && e.code === "permission-denied" ? "지금은 올릴 수 없어요(30초에 한 번 · 닉네임 확인). 잠시 뒤 다시 시도해 주세요." : "올리지 못했어요. 인터넷 연결을 확인해 주세요.");
    });
  }
  function saveNick(el) {
    var inp = el.querySelector("[data-nick-input]"), n = (inp.value || "").trim().replace(/\s+/g, " "), bad = nickOk(n);
    if (bad) return msg(el, bad);
    msg(el, "저장 중…");
    fb.saveProfile(user.uid, n).then(function (p) { profile = p; refreshUI(); setTimeout(function () { var t = el.querySelector("[data-c-text]"); if (t) t.focus(); }, 50); })
      .catch(function (e) { console.warn(e); msg(el, "저장하지 못했어요. 잠시 뒤 다시 시도해 주세요."); });
  }
  function reload(id) {
    document.querySelectorAll("[data-cmts].is-mounted").forEach(function (el) {
      var c = cache[cKey(el)] || { list: [] }, all = c.list.slice();
      Object.keys(c.replies || {}).forEach(function (p) { all = all.concat(c.replies[p]); });
      if (all.some(function (x) { return x.id === id; })) fetchComments(el);
    });
  }

  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if (t.closest("[data-login]")) { login(); return; }
    if (t.closest("[data-acct-menu]")) { if ($("acctMenu")) closeMenu(); else openMenu(); return; }
    if (t.closest("[data-logout]")) { logout(); return; }
    if (t.closest("[data-nick-edit]")) { closeMenu(); var nn = window.prompt("새 닉네임(2~12자)", profile ? profile.nickname : ""); if (nn == null) return; var bad = nickOk(nn.trim()); if (bad) { toast(bad); return; } fb.saveProfile(user.uid, nn.trim()).then(function (p) { profile = p; refreshUI(); toast("닉네임을 바꿨어요(새 댓글부터 적용)"); }); return; }
    if ($("acctMenu") && !t.closest("#acctMenu")) closeMenu();
    if (t.closest("[data-op-reply]")) { var tk = t.closest(".talk"), ce = tk && tk.querySelector("[data-cmts].is-mounted"); if (ce) openReply(ce, "op"); return; }
    if ((el = t.closest("[data-cmts]"))) {
      var qc = t.closest("[data-qr]"), rp = t.closest("[data-c-reply]");
      if (qc) { tapChip(el, qc); return; }
      if (rp) { openReply(el, rp.getAttribute("data-c-reply")); return; }
      if (t.closest("[data-r-cancel]")) { el._replyTo = null; renderComments(el); return; }
      if (t.closest("[data-r-send]")) { sendReply(el); return; }
      if (t.closest("[data-c-retry]")) fetchComments(el);
      else if (t.closest("[data-c-send]")) send(el);
      else if (t.closest("[data-nick-save]")) saveNick(el);
      else if ((t = t.closest("[data-c-del],[data-c-hide],[data-c-report]"))) {
        var id = t.getAttribute("data-c-del") || t.getAttribute("data-c-hide") || t.getAttribute("data-c-report");
        if (t.hasAttribute("data-c-del")) { if (!window.confirm("이 댓글을 삭제할까요?")) return; fb.deleteComment(id).then(function () { toast("삭제했어요"); reload(id); }).catch(function () { toast("삭제하지 못했어요"); }); }
        else if (t.hasAttribute("data-c-hide")) { fb.hideComment(id).then(function () { toast("숨겼어요"); reload(id); }).catch(function () { toast("숨기지 못했어요"); }); }
        else { if (!window.confirm("이 댓글을 신고할까요? 신고가 3번 쌓이면 자동으로 숨겨져요.")) return; fb.reportComment(id).then(function (r) { toast(r === "already" ? "이미 신고했어요" : r === "hidden" ? "신고했어요. 댓글이 숨겨졌어요" : "신고했어요. 고마워요"); if (r === "hidden") reload(id); }).catch(function () { toast("신고하지 못했어요"); }); }
      }
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.matches && e.target.matches("[data-c-text]")) { var n = e.target.closest("[data-cmts]").querySelector("[data-c-n]"); if (n) n.textContent = e.target.value.length + "/500"; }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- 익명 반응 보내기(하트·🙌·🙅 → Firestore rx, 운영자 통계용) ----------
   * 이 기기 대기열(localStorage tnk.rxq, 최대 60개)에 모았다가 Firebase 가 준비되면 20개씩 보냄. 개인 정보 없음.
   * 규칙 미게시·오프라인 등으로 실패: permission-denied 면 하루 동안 보내지 않음(tnk.rxoff), 그 밖엔 다음 기회에 다시 */
  var RXQ = "tnk.rxq", RXOFF = "tnk.rxoff", rxTimer = null, rxBusy = false;
  // ★ 서버로 보내기 스위치: 2026-10-05 03:24 Firestore 규칙(rx·reports 포함 162줄) 게시 → 03:26 Max 지시로 켬.
  //   이 기기 대기열(그동안 모인 것 포함)을 Firebase 가 준비되면 보냄. 이 기기만 끄기(시험용): localStorage tnk.rxon = "0"
  var RX_ON = true;
  try { if (localStorage.getItem("tnk.rxon") === "0") RX_ON = false; } catch (e) {}
  function rxRead() { try { return JSON.parse(localStorage.getItem(RXQ) || "[]") || []; } catch (e) { return []; } }
  function rxWrite(q) { try { localStorage.setItem(RXQ, JSON.stringify(q.slice(-60))); } catch (e) {} }
  function rxOff() { try { return Date.now() - (+localStorage.getItem(RXOFF) || 0) < 864e5; } catch (e) { return true; } }
  function react(edition, s, kind, v) {
    if (!live || !s || !/^[hud]$/.test(kind)) return;
    var d = S.get(), T = window.TNTopics;
    // 사는 곳·관심: 2단계 시작 화면이 보류 중이라 대부분 비어 있음 → 페르소나·내 주제에서 추정(topics.js fromLegacy). 설정 없음 = none
    var ri = d.region ? { region: d.region, interests: d.interests || [] } : (d.onboarded && (d.persona || (d.topics || []).length) && T && T.fromLegacy ? T.fromLegacy(d.persona, d.topics) : { region: "none", interests: [] });
    var ev = { a: String(edition + "/" + s.id).slice(0, 48), k: kind, v: v > 0 ? 1 : -1, r: ri.region || "none",
      i: (ri.interests || []).filter(function (x) { return /^(life|travel|biz|visa)$/.test(x); }).slice(0, 4), tp: T ? String(T.storyTopics(s).topic).slice(0, 16) : "" };
    var q = rxRead(); q.push(ev); rxWrite(q);
    clearTimeout(rxTimer); rxTimer = setTimeout(rxFlush, 3000);
  }
  function rxFlush() {
    if (!RX_ON || rxBusy || rxOff() || !live || failed) return;
    var q = rxRead(); if (!q.length) return;
    if (!fb) { if (!fbP) load().then(start).then(function () { setTimeout(rxFlush, 500); }).catch(function () {}); return; }
    if (!fb.addReactions) return;
    var batch = q.slice(0, 20); rxBusy = true;
    fb.addReactions(batch).then(function (ids) {
      rxWrite(rxRead().slice(batch.length)); rxBusy = false;
      try { localStorage.setItem("tnk.rx.last", JSON.stringify({ t: Date.now(), n: batch.length, ids: (ids || []).slice(0, 20) })); } catch (x) {}
      if (rxRead().length) setTimeout(rxFlush, 1000);
    }).catch(function (e) {
      rxBusy = false;
      if (e && /permission/i.test(e.code || e.message || "")) { try { localStorage.setItem(RXOFF, String(Date.now())); } catch (x) {} }
    });
  }
  /* ---------- 광고 자리별 클릭 수(익명, 준비만 — 2026-10-05 Max 04:30) ----------
   * 모으는 것 = 광고 자리 id + 날짜(방콕 기준 YYYYMMDD) 별 숫자 하나뿐. 사람·기기·시각·기사 정보 없음.
   * Firestore adclicks/{자리_날짜} = {s:자리 id, d:20261005, n:클릭 수} — 이 기기에서 모았다가 3초 뒤 한 번에 n 을 올림(increment).
   * ★ AD_CLICK_ON = false: 꺼 둠. 꺼져 있으면 클릭을 듣지도 않음(화면·동작 변화 0). firestore.rules 의 adclicks 부분은 아직 게시 전
   *   (LOGIN_TODO '대기') — 켜기 = 민구님 규칙 게시 + 승인 뒤 이 한 줄. 시험용 켜기(tnk.adclick="1")는 localhost 에서만 먹음, "0" = 이 기기 끄기 */
  var AD_CLICK_ON = false;
  try { var acv = localStorage.getItem("tnk.adclick"); if (acv === "0") AD_CLICK_ON = false; else if (acv === "1" && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) AD_CLICK_ON = true; } catch (e) {}
  var ACQ = "tnk.adq", acTimer = null, acBusy = false;
  function bkDay(ms) { var d = new Date((ms || Date.now()) + 7 * 3600e3); return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(); }
  function acRead() { try { return JSON.parse(localStorage.getItem(ACQ) || "{}") || {}; } catch (e) { return {}; } }
  function acWrite(q) { try { localStorage.setItem(ACQ, JSON.stringify(q)); } catch (e) {} }
  var AC_SLOT = /^(top|mid|korea-mid|infeed|drawer|footer|nearby-[a-z]{2,12}|region-[a-z]{2,12})$/;
  function adSlotOf(a) {   // 누른 링크가 어느 광고 자리인지(자리 id 만)
    var el;
    if ((el = a.closest("[data-ad-slot]"))) return el.getAttribute("data-ad-slot");
    if (a.closest(".ad-slot--feed")) return "infeed";
    if (a.closest(".k-ad")) return "korea-mid";
    if ((el = a.closest("[data-region-ad]"))) return "region-" + el.getAttribute("data-region-ad");
    if (a.closest("[data-nb-ad]")) { var m = /^#nearby\/([a-z]+)/.exec(location.hash); return m ? "nearby-" + m[1] : ""; }
    return "";
  }
  function acClick(e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a || a.hasAttribute("data-placeholder")) return;
    var s = adSlotOf(a); if (!AC_SLOT.test(s)) return;
    var q = acRead(), k = s + "_" + bkDay(); q[k] = Math.min(20, (q[k] || 0) + 1); acWrite(q);
    clearTimeout(acTimer); acTimer = setTimeout(acFlush, 3000);
  }
  function acFlush() {
    if (!AD_CLICK_ON || acBusy || !live || failed) return;
    var q = acRead(), today = bkDay(), yday = bkDay(Date.now() - 864e5), list = [];
    Object.keys(q).forEach(function (k) { var i = k.lastIndexOf("_"), s = k.slice(0, i), d = +k.slice(i + 1); if (AC_SLOT.test(s) && (d === today || d === yday) && q[k] > 0) list.push({ s: s, d: d, n: Math.min(20, q[k]) }); });
    if (!list.length) { acWrite({}); return; }   // 그제 이전 것은 버림(규칙도 오늘·어제만 받음)
    if (!fb) { if (!fbP) load().then(start).then(function () { setTimeout(acFlush, 500); }).catch(function () {}); return; }
    if (!fb.addAdClicks) return;
    list = list.slice(0, 20); acBusy = true;
    fb.addAdClicks(list).then(function () {
      var cur = acRead(); list.forEach(function (x) { var k = x.s + "_" + x.d; cur[k] = Math.max(0, (cur[k] || 0) - x.n); if (!cur[k]) delete cur[k]; }); acWrite(cur); acBusy = false;
    }).catch(function () { acBusy = false; });   // 규칙 미게시(permission-denied)·오프라인 = 이 기기에 남겨 둠(자리·날짜별 최대 20)
  }
  if (AD_CLICK_ON && live) { document.addEventListener("click", acClick, true); addEventListener("pagehide", function () { if (acTimer) { clearTimeout(acTimer); acFlush(); } }); }
  function adminAdClicks(sinceDay) { return load().then(function (m) { start(m); return m.listAdClicks(sinceDay); }); }
  function adminStats(sinceMs) { return load().then(function (m) { start(m); return m.listReactions(sinceMs, 5000); }); }
  // ⚠️ 오류 신고(assets/report.js): 로그인 없이 reports 에 추가만 / 운영자 승인함에서 읽기
  function report(r) { if (!live || failed) return Promise.reject(new Error("off")); return load().then(function (m) { start(m); return m.addReport(r); }); }
  function adminReports(sinceMs) { return load().then(function (m) { start(m); return m.listReports(sinceMs, 300); }); }

  window.TNSocial = { react: react, report: report, adClickOn: function () { return AD_CLICK_ON; }, adminAdClicks: adminAdClicks, adminReports: adminReports, isAdmin: function () { return !!(user && admin); }, adminStats: adminStats, warm: function () { if (live && !fbP && !failed) load().then(start).catch(function () {}); }, mountComments: mountComments, renderAccountBox: renderAccountBox, signedIn: function () { return !!user; }, _filter: badText, _nick: nickOk, _replyChips: replyChips };

  renderHeader();
  if (!live) return;
  // 로그인한 적이 있거나 리디렉션 로그인에서 돌아온 경우: 바로 불러와 세션 복원. 아니면 쉬는 시간에 미리 받기만
  var a = rd(), pending = false;
  try { pending = !!localStorage.getItem("tnk.auth.pending"); } catch (e) {}
  function go() { load().then(start).catch(function () {}); }
  if (a.uid || pending) go();
  else window.addEventListener("load", function () {
    // 속도(2026-10-03): 첫 화면과 겹치지 않게 4초 뒤 쉬는 시간에, 데이터 절약 모드·2G 에서는 미리 받지 않음(☰ 메뉴·설정을 열 때 받음)
    var c = navigator.connection || {};
    if (c.saveData || /(^|-)2g$/.test(c.effectiveType || "")) return;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 2500); };
    setTimeout(function () { idle(go, { timeout: 8000 }); }, 4000);
  });
})();
