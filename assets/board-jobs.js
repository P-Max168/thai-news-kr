/* 🧑‍💼 구인·구직 게시판(2026-10-25 Claude, KSTAR 먼저) — 판 설정 board.jobs 가 true 인 판만 index.html TNJobs 가 이 파일을 받음.
 *   한국판은 이 파일을 받지 않음(예전 assets/jobs.js 시안 그대로). 화면 = 하단 탭 '구인'(#jobs 페이지).
 * 칸: 구인 공고(ks_jobs) / 구직자(ks_resumes) / 내 글 / 이용 규칙 / (운영자만) 승인.
 * 저장 = Firestore(판 접두사 — KSTAR 는 ks_). 규칙 = firestore.rules 'KSTAR 구인·구직 게시판'(게시 전이면 '준비 중' 안내만, 화면은 그대로).
 *   - 구직: 로그인 회원 1명당 글 1개(문서 id = 내 uid), 바로 게시, 30일 뒤 목록에서 사라짐(exp). 전화·사진·나이·생년월일 칸 없음(PDPA 최소 수집).
 *     LINE ID 는 따로(ks_resume_contacts/{uid}) — 본인이 고를 때만, 운영자가 승인한 회사만 볼 수 있음(기본 꺼짐).
 *   - 회사: 신청(ks_employers/{uid}, 태국 사업자번호 13자리 확인) → 운영자 승인(st=ok) 뒤에만 공고 쓰기(규칙이 서버에서 확인).
 *   - 공고: 태국 안 근무지만, 급여 범위 필수(바트). 금지 낱말(해외·한국 현지 근무, 고수입, 마사지·유흥, 비자 대행, 지원자에게 돈 받기)에 걸리면
 *     바로 안 보이고 '운영자 확인 대기'(vis=pending) — 규칙도 같은 낱말 검사를 함(코드만 고쳐 피해 갈 수 없음).
 *   - 신고: 로그인 회원이 글마다 1번, 3번 쌓이면 자동 숨김(vis=reported) → 운영자 칸.
 * 화면 문구는 모두 TNI("bjobs.…", 한국어 기본) — 판 문구는 i18n/<lang>.json 의 bjobs. */
(function () {
  "use strict";
  var SITE = window.TN_SITE || {}, BOARD = SITE.board || {};
  if (!window.TNPages || !BOARD.jobs || window.TNBoardJobs) return;
  var T = window.TNI || function (k, d) { return d; };
  var esc = TNPages.esc;
  var DAY = 864e5, RES_DAYS = 30, JOB_MAX_DAYS = 60;
  var LOC = T("_locale", "ko-KR");

  var KINDS = [["interp", T("bjobs.kind_interp", "통역·번역")], ["tour", T("bjobs.kind_tour", "관광·가이드")], ["beauty", T("bjobs.kind_beauty", "뷰티·매장")],
    ["office", T("bjobs.kind_office", "사무")], ["content", T("bjobs.kind_content", "콘텐츠·SNS")], ["other", T("bjobs.kind_other", "기타")]];
  var KO = [["none", T("bjobs.ko_none", "한국어 못 함")], ["daily", T("bjobs.ko_daily", "일상 대화")], ["t1", T("bjobs.ko_t1", "TOPIK 1급")], ["t2", T("bjobs.ko_t2", "TOPIK 2급")],
    ["t3", T("bjobs.ko_t3", "TOPIK 3급")], ["t4", T("bjobs.ko_t4", "TOPIK 4급")], ["t5", T("bjobs.ko_t5", "TOPIK 5급")], ["t6", T("bjobs.ko_t6", "TOPIK 6급")]];
  var KO_REQ = { none: T("bjobs.koreq_none", "한국어 필요 없음") };
  var TYPES = [["full", T("bjobs.type_full", "정규직")], ["part", T("bjobs.type_part", "파트타임")], ["contract", T("bjobs.type_contract", "계약직")],
    ["freelance", T("bjobs.type_freelance", "프리랜서")], ["intern", T("bjobs.type_intern", "인턴")]];
  var PAY = [["month", T("bjobs.pay_month", "월")], ["day", T("bjobs.pay_day", "일")], ["hour", T("bjobs.pay_hour", "시간")]];
  // 태국 77개 도(id 는 firestore.rules ksProv() 목록과 같아야 함)
  var PROV = [["bangkok", T("bjobs.pv_bangkok", "방콕")], ["amnatcharoen", T("bjobs.pv_amnatcharoen", "암낫짜런")], ["angthong", T("bjobs.pv_angthong", "앙통")],
    ["buengkan", T("bjobs.pv_buengkan", "븡깐")], ["buriram", T("bjobs.pv_buriram", "부리람")], ["chachoengsao", T("bjobs.pv_chachoengsao", "차청사오")],
    ["chainat", T("bjobs.pv_chainat", "차이낫")], ["chaiyaphum", T("bjobs.pv_chaiyaphum", "차이야품")], ["chanthaburi", T("bjobs.pv_chanthaburi", "짠타부리")],
    ["chiangmai", T("bjobs.pv_chiangmai", "치앙마이")], ["chiangrai", T("bjobs.pv_chiangrai", "치앙라이")], ["chonburi", T("bjobs.pv_chonburi", "촌부리(파타야)")],
    ["chumphon", T("bjobs.pv_chumphon", "춤폰")], ["kalasin", T("bjobs.pv_kalasin", "깔라신")], ["kamphaengphet", T("bjobs.pv_kamphaengphet", "깜팽펫")],
    ["kanchanaburi", T("bjobs.pv_kanchanaburi", "깐짜나부리")], ["khonkaen", T("bjobs.pv_khonkaen", "콘깬")], ["krabi", T("bjobs.pv_krabi", "끄라비")],
    ["lampang", T("bjobs.pv_lampang", "람빵")], ["lamphun", T("bjobs.pv_lamphun", "람푼")], ["loei", T("bjobs.pv_loei", "러이")],
    ["lopburi", T("bjobs.pv_lopburi", "롭부리")], ["maehongson", T("bjobs.pv_maehongson", "매홍손")], ["mahasarakham", T("bjobs.pv_mahasarakham", "마하사라캄")],
    ["mukdahan", T("bjobs.pv_mukdahan", "묵다한")], ["nakhonnayok", T("bjobs.pv_nakhonnayok", "나콘나욕")], ["nakhonpathom", T("bjobs.pv_nakhonpathom", "나콘빠톰")],
    ["nakhonphanom", T("bjobs.pv_nakhonphanom", "나콘파놈")], ["nakhonratchasima", T("bjobs.pv_nakhonratchasima", "나콘랏차시마")], ["nakhonsawan", T("bjobs.pv_nakhonsawan", "나콘사완")],
    ["nakhonsithammarat", T("bjobs.pv_nakhonsithammarat", "나콘시탐마랏")], ["nan", T("bjobs.pv_nan", "난")], ["narathiwat", T("bjobs.pv_narathiwat", "나라티왓")],
    ["nongbualamphu", T("bjobs.pv_nongbualamphu", "농부아람푸")], ["nongkhai", T("bjobs.pv_nongkhai", "농카이")], ["nonthaburi", T("bjobs.pv_nonthaburi", "논타부리")],
    ["pathumthani", T("bjobs.pv_pathumthani", "빠툼타니")], ["pattani", T("bjobs.pv_pattani", "빳따니")], ["phangnga", T("bjobs.pv_phangnga", "팡응아")],
    ["phatthalung", T("bjobs.pv_phatthalung", "팟탈룽")], ["phayao", T("bjobs.pv_phayao", "파야오")], ["phetchabun", T("bjobs.pv_phetchabun", "펫차분")],
    ["phetchaburi", T("bjobs.pv_phetchaburi", "펫차부리")], ["phichit", T("bjobs.pv_phichit", "피찟")], ["phitsanulok", T("bjobs.pv_phitsanulok", "핏사눌록")],
    ["ayutthaya", T("bjobs.pv_ayutthaya", "아유타야")], ["phrae", T("bjobs.pv_phrae", "프래")], ["phuket", T("bjobs.pv_phuket", "푸껫")],
    ["prachinburi", T("bjobs.pv_prachinburi", "쁘라찐부리")], ["prachuapkhirikhan", T("bjobs.pv_prachuapkhirikhan", "쁘라쭈압키리칸")], ["ranong", T("bjobs.pv_ranong", "라농")],
    ["ratchaburi", T("bjobs.pv_ratchaburi", "랏차부리")], ["rayong", T("bjobs.pv_rayong", "라용")], ["roiet", T("bjobs.pv_roiet", "로이엣")],
    ["sakaeo", T("bjobs.pv_sakaeo", "사깨우")], ["sakonnakhon", T("bjobs.pv_sakonnakhon", "사꼰나콘")], ["samutprakan", T("bjobs.pv_samutprakan", "사뭇쁘라깐")],
    ["samutsakhon", T("bjobs.pv_samutsakhon", "사뭇사콘")], ["samutsongkhram", T("bjobs.pv_samutsongkhram", "사뭇송크람")], ["saraburi", T("bjobs.pv_saraburi", "사라부리")],
    ["satun", T("bjobs.pv_satun", "사뚠")], ["singburi", T("bjobs.pv_singburi", "싱부리")], ["sisaket", T("bjobs.pv_sisaket", "시사껫")],
    ["songkhla", T("bjobs.pv_songkhla", "송클라")], ["sukhothai", T("bjobs.pv_sukhothai", "수코타이")], ["suphanburi", T("bjobs.pv_suphanburi", "수판부리")],
    ["suratthani", T("bjobs.pv_suratthani", "수랏타니")], ["surin", T("bjobs.pv_surin", "수린")], ["tak", T("bjobs.pv_tak", "딱")],
    ["trang", T("bjobs.pv_trang", "뜨랑")], ["trat", T("bjobs.pv_trat", "뜨랏")], ["ubonratchathani", T("bjobs.pv_ubonratchathani", "우본랏차타니")],
    ["udonthani", T("bjobs.pv_udonthani", "우돈타니")], ["uthaithani", T("bjobs.pv_uthaithani", "우타이타니")], ["uttaradit", T("bjobs.pv_uttaradit", "우따라딧")],
    ["yala", T("bjobs.pv_yala", "얄라")], ["yasothon", T("bjobs.pv_yasothon", "야소톤")]];
  PROV = [PROV[0]].concat(PROV.slice(1).sort(function (a, b) { return a[1].localeCompare(b[1], LOC); }));   // 방콕 맨 앞, 나머지는 판 언어 가나다순
  var ONLINE = ["online", T("bjobs.pv_online", "온라인(재택)")];

  /* 금지 낱말(공고 → 운영자 확인 대기 / 구직 글 → 올리지 않음). firestore.rules 의 ksBanned() 와 같은 목록 — 바꾸면 두 곳 같이 */
  var BANNED = [   // i18n:data — 걸러 내는 낱말(화면 문구 아님)
    // 해외·한국 현지 근무   // i18n:data
    "ไปทำงาน.{0,12}(เกาหลี|ต่างประเทศ|ญี่ปุ่น|ไต้หวัน|ดูไบ|ยุโรป|อเมริกา|ออสเตรเลีย)", "ทำงาน(ที่|ใน)?(ประเทศ)?เกาหลี", "ทำงานต่างประเทศ", "แรงงานเกาหลี", "ผีน้อย", "บินไปทำงาน",
    "work(ing)? (in|at) korea", "work abroad", "overseas (job|work)", "korea(n)? (work )?visa", "\\be-?9\\b",
    "한국\\s*(현지\\s*)?(근무|취업)", "한국에서\\s*(근무|일)", "해외\\s*(취업|근무)", "불법\\s*체류",   // i18n:data
    // 고수입 미끼   // i18n:data
    "รายได้สูง", "รายได้ดีมาก", "รายได้หลักแสน", "งานง่าย.{0,6}รายได้", "high income", "easy money", "고수입", "고소득",   // i18n:data
    // 마사지·유흥·접대   // i18n:data
    "นวด", "อาบอบนวด", "คาราโอเกะ", "บาร์", "ผับ", "โฮสต์", "ไซด์ไลน์", "นั่งดริงค์", "นั่งดริ้ง", "งานเอ็น", "เด็กเอ็น", "เอ็นเตอร์เทนลูกค้า", "พริตตี้", "เซ็กซี่",
    "massage", "karaoke", "\\bbar\\b", "\\bpub\\b", "\\bhost(ess)?\\b", "escort", "sideline", "night ?life", "sexy",
    "마사지", "유흥", "노래방", "가라오케", "에스코트", "도우미", "룸살롱",   // i18n:data
    // 비자 대행   // i18n:data
    "ทำวีซ่า", "จัดหาวีซ่า", "รับทำวีซ่า", "ดำเนินการวีซ่า", "visa (service|agent|arrang)", "비자\\s*(대행|발급)",   // i18n:data
    // 지원자에게 돈 받기   // i18n:data
    "ค่าสมัคร", "ค่าดำเนินการ", "ค่าเอกสาร", "มัดจำ", "ค่าหัว", "ค่านายหน้า", "เงินประกัน", "โอนเงินก่อน", "โอนค่า", "deposit", "\\bfee\\b", "보증금", "수수료", "선입금"];   // i18n:data
  var BAN_RX = new RegExp(BANNED.join("|"), "i");
  function banned(t) { var m = BAN_RX.exec(String(t || "")); return m ? m[0] : ""; }
  // 구직 글 설명에 전화번호·링크·연락처를 적지 않게(연락은 LINE 칸으로만) — 규칙도 숫자 9개 이상 연속을 막음
  function hasPhone(t) { return /\d{9,}/.test(String(t || "").replace(/[\s.()+\-]/g, "")); }
  function hasLink(t) { return /https?:\/\/|www\.|\.(com|net|co|me|ly|th)\b|line\s*id|@[a-z0-9]/i.test(String(t || "")); }

  function opt(list, v) { return list.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === v ? " selected" : "") + ">" + esc(x[1]) + "</option>"; }).join(""); }
  function lab(list, v) { var x = list.filter(function (y) { return y[0] === v; })[0]; return x ? x[1] : ""; }
  function provLab(v) { return v === "online" ? ONLINE[1] : lab(PROV, v); }
  function koReq(v) { return KO_REQ[v] || lab(KO, v); }
  function num(n) { return (+n || 0).toLocaleString(LOC); }
  function bkParts(ms) { var o = {}; new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; }); return o; }
  function dShort(ms) { var o = bkParts(ms); return window.TNmd ? TNmd(o) : o.month + "/" + o.day; }
  function ymd(ms) { var o = bkParts(ms); return o.year + "-" + ("0" + o.month).slice(-2) + "-" + ("0" + o.day).slice(-2); }
  function endOfDay(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], 23, 59) - 7 * 3600e3 : 0; }   // 방콕 그날 23:59
  // 태국 사업자번호(DBD 법인 13자리, 0 으로 시작) — 마지막 자리 검사(태국 주민번호와 같은 방식)
  function dbdOk(n) {
    if (!/^0\d{12}$/.test(n)) return false;
    var s = 0; for (var i = 0; i < 12; i++) s += (13 - i) * +n.charAt(i);
    return (11 - s % 11) % 10 === +n.charAt(12);
  }
  function toast(m, ms) { if (window.TNApp && TNApp.toast) TNApp.toast(esc(m), ms || 2800); }
  function social() { return window.TNSocial || {}; }
  function signedIn() { return !!(social().signedIn && social().signedIn()); }
  function myUid() { return social().uid ? social().uid() : ""; }
  function isAdmin() { return !!(social().isAdmin && social().isAdmin()); }
  function api() { var s = social(); return s.fb ? s.fb() : Promise.reject(new Error("off")); }
  function why(e) { var c = String((e && (e.code || e.message)) || ""); return /permission/i.test(c) ? "perm" : /^(off|file)$/.test(c) || /import|fetch|module/i.test(c) ? "off" : "net"; }
  function warn(tag, e) { try { console.warn("[jobs] " + tag, (e && (e.code || e.message)) || e); } catch (x) {} }

  /* ---------- 상태·불러오기 ---------- */
  var S = { tab: "jobs", view: "", kind: "", prov: "", skind: "", data: {}, err: {}, busy: {}, contact: {}, edit: null };
  function onPage() { return TNPages.current() === "jobs"; }
  function paint(force) { if (onPage() && (force || !S.view)) TNPages.refresh(); }
  function load(key, fn, force) {
    if (S.busy[key] || (!force && (S.data[key] !== undefined || S.err[key]))) return;
    S.busy[key] = 1; S.err[key] = null;
    api().then(fn).then(function (v) { S.data[key] = v; })
      .catch(function (e) { S.err[key] = why(e); warn(key, e); })
      .then(function () { S.busy[key] = 0; paint(); });
  }
  function live(rows) { var now = Date.now(); return rows.filter(function (r) { return !r.exp || r.exp > now; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); }
  function loadJobs(f) { load("jobs", function (m) { return m.boardList("jobs", "vis", "==", "open", 300).then(live); }, f); }
  function loadSeekers(f) { load("seekers", function (m) { return m.boardList("resumes", "vis", "==", "open", 300).then(live); }, f); }
  function loadMine(f) {
    var uid = myUid(); if (!uid) return;
    load("mine", function (m) {
      return Promise.all([m.boardGet("resumes", uid), m.boardGet("resume_contacts", uid).catch(function () { return null; }), m.boardGet("employers", uid),
        m.boardList("jobs", "uid", "==", uid, 100)])
        .then(function (r) { return { uid: uid, resume: r[0], contact: r[1], emp: r[2], jobs: r[3].sort(function (a, b) { return (b.at || 0) - (a.at || 0); }) }; });
    }, f);
  }
  function loadAdmin(f) {
    load("admin", function (m) {
      return Promise.all([m.boardList("employers", "st", "==", "pending", 200), m.boardList("jobs", "vis", "in", ["pending", "reported"], 200),
        m.boardList("resumes", "vis", "==", "reported", 200), m.boardList("employers", "st", "==", "ok", 300)])
        .then(function (r) { return { emps: r[0], jobs: r[1], resumes: r[2], okEmps: r[3] }; });
    }, f);
  }
  function reset(keys) { (keys || ["jobs", "seekers", "mine", "admin"]).forEach(function (k) { delete S.data[k]; S.err[k] = null; }); }
  function myEmpOk() { var m = S.data.mine; return !!(m && m.emp && m.emp.st === "ok"); }

  /* ---------- 공통 조각 ---------- */
  function errBox(key) {
    var e = S.err[key];
    var msg = e === "perm" ? T("bjobs.err_perm", "게시판을 여는 중이에요. 곧 쓸 수 있어요.")
      : e === "off" ? T("bjobs.err_off", "지금은 게시판에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.")
      : T("bjobs.err_net", "목록을 불러오지 못했어요.");
    return '<div class="bj-empty" role="status"><p>' + esc(msg) + '</p><button type="button" class="bj-btn bj-btn--ghost" data-bj-retry="' + key + '">' + esc(T("bjobs.retry", "다시 시도")) + "</button></div>";
  }
  function skel() { return '<div class="skel-list" aria-busy="true"><div class="skel"></div><div class="skel"></div></div>'; }
  function loginBox(msg) {
    return '<div class="bj-empty"><p>' + esc(msg) + '</p><button type="button" class="bj-btn" data-login>' + esc(T("bjobs.login", "로그인")) + "</button></div>";
  }
  function chips(list, cur, attr) {
    return '<div class="bj-chips" role="group" aria-label="' + esc(T("bjobs.filter_kind", "직종")) + '">' +
      '<button type="button" class="bj-chip" ' + attr + '="" aria-pressed="' + (!cur) + '">' + esc(T("bjobs.all", "전체")) + "</button>" +
      list.map(function (x) { return '<button type="button" class="bj-chip" ' + attr + '="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '">' + esc(x[1]) + "</button>"; }).join("") + "</div>";
  }
  function payText(j) { return "฿" + num(j.smin) + (j.smax > j.smin ? "–" + num(j.smax) : "") + " / " + lab(PAY, j.pay); }
  function reportBtn(col, id, uid) {
    if (uid && uid === myUid()) return "";
    return '<button type="button" class="bj-link" data-bj-report="' + col + "|" + esc(id) + '">⚠ ' + esc(T("bjobs.report", "의심 글 신고")) + "</button>";
  }
  function jobCard(j, mine) {
    var st = mine ? statusTag(j.vis, j.exp) : "";
    return '<article class="bj-card"><div class="bj-top"><span class="bj-tag">' + esc(lab(KINDS, j.job)) + '</span><span class="bj-ok">✓ ' + esc(T("bjobs.verified", "확인된 회사")) + "</span>" + st + "</div>" +
      '<h3 class="bj-t">' + esc(j.title) + '</h3><p class="bj-sub">' + esc(j.co) + " · 📍 " + esc(provLab(j.prov)) + "</p>" +
      '<dl class="bj-info"><div><dt>' + esc(T("bjobs.f_salary", "급여")) + "</dt><dd><b>" + esc(payText(j)) + "</b></dd></div>" +
      "<div><dt>" + esc(T("bjobs.f_type", "고용 형태")) + "</dt><dd>" + esc(lab(TYPES, j.type)) + "</dd></div>" +
      "<div><dt>" + esc(T("bjobs.f_koreq", "한국어")) + "</dt><dd>" + esc(koReq(j.ko)) + "</dd></div>" +
      "<div><dt>" + esc(T("bjobs.f_deadline", "마감")) + "</dt><dd>" + esc(dShort(j.dl)) + "</dd></div></dl>" +
      '<details class="bj-more"><summary>' + esc(T("bjobs.more", "자세히 · 지원 방법")) + '</summary><p class="bj-desc">' + esc(j.desc) + "</p>" +
      '<p class="bj-apply"><b>' + esc(T("bjobs.f_apply", "지원 방법")) + "</b> " + esc(j.apply) + "</p>" +
      '<p class="bj-safe">' + esc(T("bjobs.safe_line", "지원할 때 돈을 내라고 하면 사기예요. 바로 신고해 주세요.")) + "</p></details>" +
      '<div class="bj-acts">' + (mine ? mineJobActs(j) : reportBtn("jobs", j.id, j.uid)) + "</div></article>";
  }
  function seekerCard(r, mine) {
    var c = S.contact[r.id], contact;
    if (r.contact !== "line") contact = '<span class="bj-muted">' + esc(T("bjobs.no_contact", "아직 연락을 받지 않아요")) + "</span>";
    else if (c && c.line) contact = "LINE ID: <b>" + esc(c.line) + "</b>";
    else if (c === "err") contact = '<span class="bj-muted">' + esc(T("bjobs.contact_err", "LINE ID 를 불러오지 못했어요")) + "</span>";
    else if (myEmpOk() || isAdmin()) contact = '<button type="button" class="bj-btn bj-btn--sm" data-bj-contact="' + esc(r.id) + '">' + esc(T("bjobs.show_line", "LINE ID 보기")) + "</button>";
    else contact = '<span class="bj-muted">' + esc(T("bjobs.line_emp_only", "LINE ID 는 확인된 회사만 볼 수 있어요")) + "</span>";
    return '<article class="bj-card"><div class="bj-top"><span class="bj-tag">' + esc(lab(KINDS, r.job)) + "</span>" + (mine ? statusTag(r.vis, r.exp) : "") + "</div>" +
      '<h3 class="bj-t">' + esc(r.nick) + '</h3><p class="bj-sub">📍 ' + esc(provLab(r.area)) + " · " + esc(lab(KO, r.ko)) + "</p>" +
      '<p class="bj-desc">' + esc(r.sum) + "</p>" +
      '<dl class="bj-info"><div><dt>' + esc(T("bjobs.f_from", "시작 가능일")) + "</dt><dd>" + esc(r.from ? dShort(endOfDay(r.from)) : "-") + "</dd></div>" +
      "<div><dt>" + esc(T("bjobs.f_contact", "연락")) + "</dt><dd>" + (mine ? esc(r.contact === "line" ? T("bjobs.contact_line", "확인된 회사에 LINE ID 공개") : T("bjobs.contact_none", "공개 안 함")) : contact) + "</dd></div></dl>" +
      '<div class="bj-acts">' + (mine ? mineResumeActs(r) : reportBtn("resumes", r.id, r.uid)) + "</div></article>";
  }
  function statusTag(vis, exp) {
    var t = exp && exp < Date.now() ? T("bjobs.st_expired", "기간 끝남") : { open: T("bjobs.st_open", "게시 중"), hidden: T("bjobs.st_hidden", "숨김"), pending: T("bjobs.st_pending", "운영자 확인 대기"),
      reported: T("bjobs.st_reported", "신고로 숨김"), no: T("bjobs.st_no", "게시 안 됨") }[vis] || vis;
    return '<span class="bj-st bj-st--' + esc(exp && exp < Date.now() ? "exp" : vis) + '">' + esc(t) + "</span>";
  }

  /* ---------- 칸(탭) ---------- */
  function tabs() {
    var L = [["jobs", T("bjobs.tab_jobs", "구인 공고")], ["seekers", T("bjobs.tab_seekers", "구직자")], ["mine", T("bjobs.tab_mine", "내 글")], ["rules", T("bjobs.tab_rules", "이용 규칙")]];
    if (isAdmin()) L.push(["admin", T("bjobs.tab_admin", "승인")]);
    return '<div class="bj-tabs" role="tablist">' + L.map(function (x) {
      return '<button type="button" class="bj-tab" role="tab" data-bj-tab="' + x[0] + '" aria-selected="' + (S.tab === x[0]) + '">' + esc(x[1]) + "</button>";
    }).join("") + "</div>";
  }
  function safetyNote() {
    return '<p class="bj-note" role="note">🛡️ ' + esc(T("bjobs.note", "태국 안의 일자리만 올라와요. 지원하면서 돈을 내라고 하면 사기예요.")) +
      ' <button type="button" class="bj-link" data-bj-tab="rules">' + esc(T("bjobs.note_more", "안전 수칙 보기")) + "</button></p>";
  }
  function viewJobs() {
    loadJobs();
    var head = safetyNote() + chips(KINDS, S.kind, "data-bj-kind") +
      '<label class="bj-row"><span>📍</span><select class="bj-in bj-in--sm" data-bj-prov aria-label="' + esc(T("bjobs.f_prov", "근무지")) + '"><option value="">' + esc(T("bjobs.all_prov", "모든 지역")) + "</option>" + opt(PROV, S.prov) + "</select></label>" +
      '<button type="button" class="bj-btn bj-btn--wide" data-bj-go="job">＋ ' + esc(T("bjobs.post_job", "공고 올리기(회사)")) + "</button>";
    if (S.err.jobs) return head + errBox("jobs");
    if (!S.data.jobs) return head + skel();
    var list = S.data.jobs.filter(function (j) { return (!S.kind || j.job === S.kind) && (!S.prov || j.prov === S.prov); });
    return head + (list.length ? list.map(function (j) { return jobCard(j); }).join("")
      : '<div class="bj-empty"><p>' + esc(S.data.jobs.length ? T("bjobs.none_filter", "이 조건의 공고가 없어요.") : T("bjobs.none_jobs", "아직 올라온 공고가 없어요.")) + "</p></div>");
  }
  function viewSeekers() {
    var head = '<button type="button" class="bj-btn bj-btn--wide" data-bj-go="seeker">＋ ' + esc(T("bjobs.post_seeker", "구직 글 쓰기")) + "</button>";
    if (!signedIn()) return head + loginBox(T("bjobs.login_seekers", "구직자 목록은 로그인한 회원만 볼 수 있어요(개인 정보 보호)."));
    loadSeekers(); if (signedIn()) loadMine();
    head += chips(KINDS, S.skind, "data-bj-skind");
    if (S.err.seekers) return head + errBox("seekers");
    if (!S.data.seekers) return head + skel();
    var list = S.data.seekers.filter(function (r) { return !S.skind || r.job === S.skind; });
    return head + (list.length ? list.map(function (r) { return seekerCard(r); }).join("") : '<div class="bj-empty"><p>' + esc(T("bjobs.none_seekers", "아직 구직 글이 없어요.")) + "</p></div>");
  }
  function mineResumeActs(r) {
    var b = function (a, t) { return '<button type="button" class="bj-btn bj-btn--sm bj-btn--ghost" data-bj-act="' + a + '">' + esc(t) + "</button>"; };
    var out = "";
    if (r.vis === "open" || r.vis === "hidden") {
      var ended = r.exp && r.exp < Date.now();   // 기간 끝난 글은 연장(=다시 30일)부터
      if (!ended) out += b("r-edit", T("bjobs.edit", "고치기")) + (r.vis === "open" ? b("r-hide", T("bjobs.hide", "숨기기")) : b("r-show", T("bjobs.show", "다시 보이기")));
      out += b("r-renew", T("bjobs.renew", "30일 연장"));
    }
    return out + b("r-del", T("bjobs.delete", "삭제"));
  }
  function mineJobActs(j) {
    var b = function (a, t) { return '<button type="button" class="bj-btn bj-btn--sm bj-btn--ghost" data-bj-act="' + a + '" data-bj-id="' + esc(j.id) + '">' + esc(t) + "</button>"; };
    return (j.vis === "open" ? b("j-hide", T("bjobs.hide", "숨기기")) : j.vis === "hidden" ? b("j-show", T("bjobs.show", "다시 보이기")) : "") + b("j-del", T("bjobs.delete", "삭제"));
  }
  function viewMine() {
    if (!signedIn()) return loginBox(T("bjobs.login_mine", "로그인하면 내 구직 글과 회사 공고를 관리할 수 있어요."));
    loadMine();
    if (S.err.mine) return errBox("mine");
    var m = S.data.mine; if (!m) return skel();
    var out = '<h3 class="bj-h">' + esc(T("bjobs.my_resume", "내 구직 글")) + "</h3>";
    out += m.resume ? seekerCard(m.resume, true) + (m.resume.exp && m.resume.exp > Date.now() ? '<p class="bj-muted bj-small">' + esc(T("bjobs.auto_hide", "목록에서 자동으로 내려가는 날")) + ": " + esc(dShort(m.resume.exp)) + "</p>" : "")
      : '<div class="bj-empty"><p>' + esc(T("bjobs.no_resume", "아직 구직 글이 없어요.")) + '</p><button type="button" class="bj-btn" data-bj-go="seeker">' + esc(T("bjobs.post_seeker", "구직 글 쓰기")) + "</button></div>";
    out += '<h3 class="bj-h">' + esc(T("bjobs.my_company", "회사(구인)")) + "</h3>";
    var e = m.emp;
    if (!e) out += '<div class="bj-empty"><p>' + esc(T("bjobs.emp_intro", "공고를 올리려면 먼저 회사 확인을 신청해 주세요. 운영자가 사업자 정보를 확인한 뒤 열어 드려요.")) + '</p><button type="button" class="bj-btn" data-bj-go="emp">' + esc(T("bjobs.emp_apply", "회사 확인 신청")) + "</button></div>";
    else if (e.st === "pending") out += '<div class="bj-box"><b>' + esc(e.name) + "</b><p>" + esc(T("bjobs.emp_pending", "운영자가 확인하고 있어요. 승인되면 공고를 올릴 수 있어요.")) + '</p><button type="button" class="bj-btn bj-btn--sm bj-btn--ghost" data-bj-go="emp">' + esc(T("bjobs.edit", "고치기")) + "</button></div>";
    else if (e.st === "no") out += '<div class="bj-box"><b>' + esc(e.name) + "</b><p>" + esc(T("bjobs.emp_no", "확인되지 않았어요. 정보를 고쳐 다시 신청할 수 있어요.")) + (e.note ? " (" + esc(e.note) + ")" : "") + '</p><button type="button" class="bj-btn bj-btn--sm" data-bj-go="emp">' + esc(T("bjobs.emp_reapply", "다시 신청")) + "</button></div>";
    else {
      out += '<div class="bj-box"><b>' + esc(e.name) + '</b> <span class="bj-ok">✓ ' + esc(T("bjobs.verified", "확인된 회사")) + '</span><p><button type="button" class="bj-btn" data-bj-go="job">＋ ' + esc(T("bjobs.post_job_short", "공고 올리기")) + "</button></p></div>";
      out += m.jobs.length ? m.jobs.map(function (j) { return jobCard(j, true); }).join("") : '<p class="bj-muted">' + esc(T("bjobs.no_jobs_mine", "올린 공고가 없어요.")) + "</p>";
    }
    return out;
  }
  function viewRules() {
    var li = function (a) { return "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
    return '<div class="bj-rules">' +
      '<section><h3 class="bj-h">' + esc(T("bjobs.r1_h", "이 게시판은")) + "</h3><p>" + esc(T("bjobs.r1", "태국 안에서 일하는, 한국과 관련된 일자리를 모아요. 예: 한국 회사, 통역·번역, K-뷰티 매장, 한국 손님 관광 가이드, 한국 콘텐츠·SNS.")) + "</p></section>" +
      '<section><h3 class="bj-h">' + esc(T("bjobs.r2_h", "올릴 수 없는 글")) + "</h3>" + li([T("bjobs.r2_a", "한국이나 다른 나라에서 일하는 공고"), T("bjobs.r2_b", "마사지·유흥·접대·에스코트 일"),
        T("bjobs.r2_c", "비자 대행·해외 취업 알선"), T("bjobs.r2_d", "지원자에게 돈(지원비·서류비·보증금)을 받는 공고"), T("bjobs.r2_e", "급여를 적지 않은 공고")]) +
      "<p>" + esc(T("bjobs.r2_note", "이런 낱말이 들어간 공고는 바로 보이지 않고 운영자가 먼저 확인해요.")) + "</p></section>" +
      '<section class="bj-warnbox"><h3 class="bj-h">' + esc(T("bjobs.r3_h", "구직자 안전 수칙")) + "</h3>" + li([T("bjobs.r3_a", "일을 시작하기 전에 돈을 내지 마세요(지원비·교육비·보증금 모두)."),
        T("bjobs.r3_b", "한국에서 일하는 공고는 여기 올라오지 않아요. 한국에 가서 일하자는 연락을 받으면 태국 노동부 고용국(전화 1694)에 먼저 확인하세요."),
        T("bjobs.r3_c", "면접 전에는 신분증·여권 사진을 보내지 마세요."), T("bjobs.r3_d", "면접은 회사 사무실이나 사람이 많은 곳에서 보세요."),
        T("bjobs.r3_e", "이상한 글은 '의심 글 신고'를 눌러 주세요. 신고가 3번 쌓이면 자동으로 숨겨져요."), T("bjobs.r3_f", "인신매매가 의심되면 사회개발인간안보부 핫라인 1300 에 알려 주세요.")]) + "</section>" +
      '<section><h3 class="bj-h">' + esc(T("bjobs.r4_h", "개인 정보")) + "</h3>" + li([T("bjobs.r4_a", "꼭 필요한 것만 받아요. 전화번호·사진·나이·생년월일은 받지 않아요."),
        T("bjobs.r4_b", "구직 글은 30일 뒤 목록에서 자동으로 내려가요. '내 글'에서 언제든 지울 수 있어요."), T("bjobs.r4_c", "LINE ID 는 본인이 고를 때만, 운영자가 확인한 회사에만 보여요."),
        T("bjobs.r4_d", "18세 이상만 쓸 수 있어요.")]) + "</section>" +
      '<section><h3 class="bj-h">' + esc(T("bjobs.r5_h", "회사")) + "</h3>" + li([T("bjobs.r5_a", "태국 사업자번호(13자리)로 회사 확인을 신청하면, 운영자가 확인한 뒤 공고를 올릴 수 있어요."),
        T("bjobs.r5_b", "공고에는 근무지(태국 안)와 급여 범위를 꼭 적어요."), T("bjobs.r5_c", "공고는 마감일(최대 60일)에 자동으로 내려가요.")]) + "</section></div>";
  }
  function admBtn(a, id, t, ok) { return '<button type="button" class="bj-btn bj-btn--sm' + (ok ? "" : " bj-btn--ghost") + '" data-bj-act="' + a + '" data-bj-id="' + esc(id) + '">' + esc(t) + "</button>"; }
  function viewAdmin() {
    if (!isAdmin()) return '<div class="bj-empty"><p>' + esc(T("bjobs.admin_only", "운영자만 볼 수 있어요.")) + "</p></div>";
    loadAdmin();
    if (S.err.admin) return errBox("admin");
    var a = S.data.admin; if (!a) return skel();
    var emps = a.emps.map(function (e) {
      return '<article class="bj-card"><h3 class="bj-t">' + esc(e.name) + '</h3><dl class="bj-info bj-info--1">' +
        "<div><dt>DBD</dt><dd><code>" + esc(e.dbd) + "</code> " + (dbdOk(e.dbd) ? "✓" : "⚠") + "</dd></div>" +
        "<div><dt>" + esc(T("bjobs.f_person", "담당자")) + "</dt><dd>" + esc(e.person) + "</dd></div><div><dt>" + esc(T("bjobs.f_ccontact", "연락처")) + "</dt><dd>" + esc(e.contact) + "</dd></div>" +
        "<div><dt>" + esc(T("bjobs.f_prov", "근무지")) + "</dt><dd>" + esc(provLab(e.prov)) + "</dd></div><div><dt>Web</dt><dd>" + esc(e.web || "-") + "</dd></div></dl>" +
        '<p class="bj-small"><a href="https://datawarehouse.dbd.go.th/" target="_blank" rel="noopener">' + esc(T("bjobs.dbd_check", "DBD 에서 사업자 확인 ↗")) + "</a></p>" +
        '<div class="bj-acts">' + admBtn("e-ok", e.id, T("bjobs.approve", "승인"), 1) + admBtn("e-no", e.id, T("bjobs.reject", "거절")) + "</div></article>";
    }).join("");
    var jobs = a.jobs.map(function (j) {
      var hit = banned(j.title + " " + j.desc + " " + j.apply);
      return '<article class="bj-card"><div class="bj-top">' + statusTag(j.vis) + (j.reports ? '<span class="bj-st">⚠ ' + j.reports + "</span>" : "") + "</div>" +
        '<h3 class="bj-t">' + esc(j.title) + '</h3><p class="bj-sub">' + esc(j.co) + " · " + esc(provLab(j.prov)) + " · " + esc(payText(j)) + "</p>" +
        (hit ? '<p class="bj-hit">' + esc(T("bjobs.hit", "걸린 낱말")) + ": <b>" + esc(hit) + "</b></p>" : "") + '<p class="bj-desc">' + esc(j.desc) + '</p><p class="bj-apply">' + esc(j.apply) + "</p>" +
        '<div class="bj-acts">' + admBtn("a-jopen", j.id, T("bjobs.release", "게시 허용"), 1) + admBtn("a-jno", j.id, T("bjobs.keep_hidden", "계속 숨김")) + admBtn("a-jdel", j.id, T("bjobs.delete", "삭제")) + "</div></article>";
    }).join("");
    var res = a.resumes.map(function (r) {
      return '<article class="bj-card"><div class="bj-top">' + statusTag(r.vis) + '<span class="bj-st">⚠ ' + (r.reports || 0) + '</span></div><h3 class="bj-t">' + esc(r.nick) + '</h3><p class="bj-desc">' + esc(r.sum) + "</p>" +
        '<div class="bj-acts">' + admBtn("a-ropen", r.id, T("bjobs.release", "게시 허용"), 1) + admBtn("a-rhide", r.id, T("bjobs.keep_hidden", "계속 숨김")) + admBtn("a-rdel", r.id, T("bjobs.delete", "삭제")) + "</div></article>";
    }).join("");
    var none = '<p class="bj-muted">' + esc(T("bjobs.admin_none", "없음")) + "</p>";
    return '<h3 class="bj-h">' + esc(T("bjobs.adm_emps", "회사 확인 신청")) + " (" + a.emps.length + ")</h3>" + (emps || none) +
      '<h3 class="bj-h">' + esc(T("bjobs.adm_jobs", "확인 대기·신고된 공고")) + " (" + a.jobs.length + ")</h3>" + (jobs || none) +
      '<h3 class="bj-h">' + esc(T("bjobs.adm_res", "신고된 구직 글")) + " (" + a.resumes.length + ")</h3>" + (res || none) +
      '<p class="bj-muted bj-small">' + esc(T("bjobs.adm_ok", "승인된 회사")) + ": " + a.okEmps.length + ' · <button type="button" class="bj-link" data-bj-retry="admin">' + esc(T("bjobs.refresh", "새로고침")) + "</button></p>";
  }

  /* ---------- 글쓰기 화면(구직·회사 신청·공고) — 쓰는 동안은 다시 그리지 않음(입력값 보존) ---------- */
  function fl(label, inner, hint) { return '<label class="bj-fl"><span class="bj-lb">' + esc(label) + "</span>" + inner + (hint ? '<small class="bj-hint">' + esc(hint) + "</small>" : "") + "</label>"; }
  function sel(name, list, v, extra) { return '<select class="bj-in" name="' + name + '" required><option value="">' + esc(T("bjobs.choose", "고르세요")) + "</option>" + (extra || "") + opt(list, v) + "</select>"; }
  function inp(name, v, attrs) { return '<input class="bj-in" name="' + name + '" value="' + esc(v == null ? "" : v) + '" ' + (attrs || "") + ">"; }
  function chk(name, label, on) { return '<label class="bj-ck"><input type="checkbox" name="' + name + '"' + (on ? " checked" : "") + "><span>" + esc(label) + "</span></label>"; }
  function formTop(title) {
    return '<button type="button" class="bj-link bj-back" data-bj-back>← ' + esc(T("bjobs.back", "게시판으로")) + '</button><h3 class="bj-h">' + esc(title) + "</h3>" +
      (signedIn() ? "" : '<p class="bj-note" data-bj-loginnote>' + esc(T("bjobs.login_first", "보내기 전에 로그인이 필요해요.")) + ' <button type="button" class="bj-link" data-login>' + esc(T("bjobs.login", "로그인")) + "</button></p>");
  }
  function formEnd(btn) { return '<p class="bj-msg" role="alert" data-bj-msg></p><button type="submit" class="bj-btn bj-btn--wide">' + esc(btn) + "</button></form>"; }
  function seekerForm() {
    var m = S.data.mine || {}, r = m.resume || {}, c = m.contact || {}, today = ymd(Date.now());
    var nick = r.nick || (social().nick ? social().nick() : "");
    return formTop(r.uid ? T("bjobs.seeker_edit", "구직 글 고치기") : T("bjobs.seeker_new", "구직 글 쓰기")) +
      '<form class="bj-form" data-bj-form="seeker" novalidate>' +
      fl(T("bjobs.f_nick", "표시 이름(닉네임)"), inp("nick", nick, 'maxlength="20" autocomplete="nickname"'), T("bjobs.h_nick", "실명이 아니어도 돼요. 2~20자")) +
      fl(T("bjobs.f_job", "원하는 일"), sel("job", KINDS, r.job)) +
      fl(T("bjobs.f_area", "원하는 지역"), sel("area", PROV, r.area, '<option value="online"' + (r.area === "online" ? " selected" : "") + ">" + esc(ONLINE[1]) + "</option>")) +
      fl(T("bjobs.f_ko", "한국어 수준"), sel("ko", KO, r.ko)) +
      fl(T("bjobs.f_sum", "경력·자기소개"), '<textarea class="bj-in" name="sum" rows="5" maxlength="300" data-bj-count>' + esc(r.sum || "") + "</textarea>",
        T("bjobs.h_sum", "300자까지. 전화번호·링크·주소는 적지 마세요.")) + '<p class="bj-count" data-bj-n>' + (r.sum || "").length + "/300</p>" +
      fl(T("bjobs.f_from", "시작 가능일"), inp("from", r.from || today, 'type="date" min="' + ymd(Date.now() - 365 * DAY) + '"')) +
      '<fieldset class="bj-fs"><legend class="bj-lb">' + esc(T("bjobs.f_contact", "연락")) + "</legend>" +
      chk("useline", T("bjobs.useline", "확인된 회사에 내 LINE ID 보여 주기"), r.contact === "line") +
      inp("line", c.line || "", 'maxlength="40" autocomplete="off" placeholder="LINE ID" aria-label="LINE ID"' + (r.contact === "line" ? "" : " disabled")) +
      '<small class="bj-hint">' + esc(T("bjobs.h_line", "끄면 연락처를 아무에게도 보여 주지 않아요(기본).")) + "</small></fieldset>" +
      chk("adult", T("bjobs.adult", "18세 이상이에요"), !!r.adult) +
      '<p class="bj-pdpa">' + esc(T("bjobs.pdpa", "받는 정보는 위 칸이 전부예요. 전화번호·사진·나이·생년월일은 받지 않아요. 글은 30일 뒤 목록에서 내려가고, '내 글'에서 언제든 지울 수 있어요.")) + "</p>" +
      formEnd(r.uid ? T("bjobs.save", "저장") : T("bjobs.submit_seeker", "구직 글 올리기"));
  }
  function empForm() {
    var e = (S.data.mine || {}).emp || {};
    if (e.st === "ok") return formTop(T("bjobs.emp_form", "회사 확인 신청")) + '<div class="bj-box"><p>' + esc(T("bjobs.emp_done", "이미 확인된 회사예요. 정보를 바꾸려면 운영자에게 연락해 주세요.")) + "</p></div>";
    return formTop(T("bjobs.emp_form", "회사 확인 신청")) + '<p class="bj-muted">' + esc(T("bjobs.emp_form_s", "운영자가 사업자 정보를 확인한 뒤 공고를 올릴 수 있게 열어 드려요.")) + "</p>" +
      '<form class="bj-form" data-bj-form="emp" novalidate>' +
      fl(T("bjobs.f_co", "회사 이름"), inp("name", e.name, 'maxlength="80" autocomplete="organization"')) +
      fl(T("bjobs.f_dbd", "태국 사업자번호(13자리)"), inp("dbd", e.dbd, 'inputmode="numeric" maxlength="17" autocomplete="off" placeholder="0105XXXXXXXXX"'), T("bjobs.h_dbd", "법인 등록번호(DBD) — 0 으로 시작하는 숫자 13자리")) +
      fl(T("bjobs.f_person", "담당자"), inp("person", e.person, 'maxlength="40" autocomplete="name"')) +
      fl(T("bjobs.f_ccontact", "연락처(이메일 또는 LINE)"), inp("contact", e.contact, 'maxlength="80" autocomplete="email"'), T("bjobs.h_ccontact", "운영자 확인용 — 공개되지 않아요")) +
      fl(T("bjobs.f_cprov", "회사 주소(도)"), sel("prov", PROV, e.prov)) +
      fl(T("bjobs.f_web", "웹사이트·페이스북(선택)"), inp("web", e.web, 'type="url" maxlength="120" placeholder="https://"')) +
      chk("pledge", T("bjobs.pledge_emp", "지원자에게 어떤 돈도 받지 않고, 태국 안의 일자리만 올릴게요."), false) +
      formEnd(e.st ? T("bjobs.emp_resend", "다시 신청") : T("bjobs.emp_send", "신청 보내기"));
  }
  function jobForm() {
    if (!signedIn()) return formTop(T("bjobs.job_form", "공고 올리기")) + loginBox(T("bjobs.login_job", "공고는 운영자가 확인한 회사만 올릴 수 있어요. 먼저 로그인해 주세요."));
    if (!S.data.mine) { loadMine(); return formTop(T("bjobs.job_form", "공고 올리기")) + (S.err.mine ? errBox("mine") : skel()); }
    if (!myEmpOk()) return formTop(T("bjobs.job_form", "공고 올리기")) + '<div class="bj-empty"><p>' + esc(T("bjobs.emp_intro", "공고를 올리려면 먼저 회사 확인을 신청해 주세요. 운영자가 사업자 정보를 확인한 뒤 열어 드려요.")) + "</p>" +
      ((S.data.mine.emp) ? '<p class="bj-muted">' + esc(T("bjobs.emp_pending", "운영자가 확인하고 있어요. 승인되면 공고를 올릴 수 있어요.")) + "</p>" : '<button type="button" class="bj-btn" data-bj-go="emp">' + esc(T("bjobs.emp_apply", "회사 확인 신청")) + "</button>") + "</div>";
    var now = Date.now();
    return formTop(T("bjobs.job_form", "공고 올리기")) + '<form class="bj-form" data-bj-form="job" novalidate>' +
      fl(T("bjobs.f_title", "공고 제목"), inp("title", "", 'maxlength="80"')) +
      fl(T("bjobs.f_job", "원하는 일"), sel("job", KINDS)) +
      fl(T("bjobs.f_prov", "근무지"), sel("prov", PROV), T("bjobs.h_prov", "태국 안 근무지만 올릴 수 있어요")) +
      fl(T("bjobs.f_type", "고용 형태"), sel("type", TYPES)) +
      '<div class="bj-grid3">' + fl(T("bjobs.f_smin", "최저 급여(바트)"), inp("smin", "", 'type="number" inputmode="numeric" min="1" max="1000000" step="1"')) +
      fl(T("bjobs.f_smax", "최고 급여(바트)"), inp("smax", "", 'type="number" inputmode="numeric" min="1" max="1000000" step="1"')) +
      fl(T("bjobs.f_pay", "기준"), sel("pay", PAY, "month")) + "</div>" +
      fl(T("bjobs.f_koreq", "한국어"), sel("ko", [["none", KO_REQ.none]].concat(KO.slice(1)))) +
      fl(T("bjobs.f_desc", "하는 일·조건"), '<textarea class="bj-in" name="desc" rows="6" maxlength="800"></textarea>', T("bjobs.h_desc", "800자까지")) +
      fl(T("bjobs.f_apply", "지원 방법"), '<textarea class="bj-in" name="apply" rows="2" maxlength="200"></textarea>', T("bjobs.h_apply", "예: 이메일로 이력서 보내기, 회사 LINE 공식 계정")) +
      fl(T("bjobs.f_deadline", "마감"), inp("dl", ymd(now + 30 * DAY), 'type="date" min="' + ymd(now + DAY) + '" max="' + ymd(now + JOB_MAX_DAYS * DAY) + '"'), T("bjobs.h_deadline", "최대 60일 — 마감일이 지나면 자동으로 내려가요")) +
      chk("pledge", T("bjobs.pledge_job", "이 일은 태국 안에서 하고, 지원자에게 돈을 받지 않아요."), false) +
      formEnd(T("bjobs.submit_job", "공고 올리기"));
  }

  /* ---------- 보내기 ---------- */
  function say(f, t) { var m = f.querySelector("[data-bj-msg]"); if (m) m.textContent = t; }
  function val(f, n) { var el = f.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function on(f, n) { var el = f.elements[n]; return !!(el && el.checked); }
  function saveErr(f, e) { warn("save", e); say(f, why(e) === "perm" ? T("bjobs.save_perm", "게시판을 여는 중이라 아직 저장할 수 없어요. 곧 다시 시도해 주세요.") : T("bjobs.save_net", "저장하지 못했어요. 인터넷 연결을 확인해 주세요.")); }
  function done(f, msg, tab) {
    toast(msg, 3200); reset(); S.view = ""; S.tab = tab || "mine"; paint(true);
  }
  function busy(f, b) { var x = f.querySelector('[type="submit"]'); if (x) x.disabled = b; }
  function submitSeeker(f) {
    var d = { nick: val(f, "nick").replace(/\s+/g, " "), job: val(f, "job"), area: val(f, "area"), ko: val(f, "ko"), sum: val(f, "sum"), from: val(f, "from") }, line = val(f, "line"), useLine = on(f, "useline");
    var flt = social()._filter;
    if (d.nick.length < 2 || d.nick.length > 20) return say(f, T("bjobs.e_nick", "표시 이름은 2~20자로 적어 주세요."));
    if (/admin|official|운영자|관리자/i.test(d.nick)) return say(f, T("bjobs.e_nick2", "다른 표시 이름을 골라 주세요."));   // i18n:data
    if (!d.job || !d.area || !d.ko) return say(f, T("bjobs.e_pick", "고르지 않은 칸이 있어요."));
    if (d.sum.length < 10) return say(f, T("bjobs.e_sum", "경력·자기소개를 10자 이상 적어 주세요."));
    if (hasPhone(d.sum) || hasLink(d.sum)) return say(f, T("bjobs.e_phone", "자기소개에는 전화번호·링크·ID 를 적지 마세요. 연락은 LINE 칸으로만 받아요."));
    if (banned(d.nick + " " + d.sum)) return say(f, T("bjobs.e_banned", "이 게시판에 올릴 수 없는 내용이 있어요(해외 취업·유흥·돈 거래 등). 이용 규칙을 확인해 주세요."));
    if (flt && flt(d.nick + " " + d.sum)) return say(f, T("bjobs.e_bad", "욕설이나 광고성 문구가 들어 있어요. 고쳐 주세요."));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.from)) return say(f, T("bjobs.e_from", "시작 가능일을 골라 주세요."));
    if (useLine && !/^@?[A-Za-z0-9._-]{2,40}$/.test(line)) return say(f, T("bjobs.e_line", "LINE ID 를 확인해 주세요(영문·숫자·. _ - 만)."));
    if (!on(f, "adult")) return say(f, T("bjobs.e_adult", "18세 이상만 쓸 수 있어요."));
    if (!signedIn()) { say(f, T("bjobs.login_first", "보내기 전에 로그인이 필요해요.")); if (social().login) social().login(""); return; }
    var uid = myUid(); busy(f, true); say(f, T("bjobs.sending", "저장 중…"));
    api().then(function (m) {
      return m.boardGet("resumes", uid).then(function (old) {
        var base = { nick: d.nick, job: d.job, area: d.area, ko: d.ko, sum: d.sum, from: d.from, contact: useLine ? "line" : "none", adult: true, at: { __ts: 1 } };
        var ops = [old ? { col: "resumes", id: uid, upd: true, data: base }
          : { col: "resumes", id: uid, data: Object.assign({ uid: uid, vis: "open", exp: { __ms: Date.now() + RES_DAYS * DAY }, reports: 0, reporters: [] }, base) }];
        ops.push(useLine ? { col: "resume_contacts", id: uid, data: { line: line, at: { __ts: 1 } } } : { col: "resume_contacts", id: uid, del: true });
        return m.boardWrite(ops);
      });
    }).then(function () { done(f, T("bjobs.ok_seeker", "구직 글을 올렸어요. 30일 동안 보여요.")); }, function (e) { busy(f, false); saveErr(f, e); });
  }
  function submitEmp(f) {
    var d = { name: val(f, "name"), dbd: val(f, "dbd").replace(/[\s-]/g, ""), person: val(f, "person"), contact: val(f, "contact"), prov: val(f, "prov"), web: val(f, "web") };
    if (d.name.length < 2) return say(f, T("bjobs.e_co", "회사 이름을 적어 주세요."));
    if (!dbdOk(d.dbd)) return say(f, T("bjobs.e_dbd", "사업자번호 13자리를 확인해 주세요(0 으로 시작, 마지막 자리 검사)."));
    if (d.person.length < 2) return say(f, T("bjobs.e_person", "담당자 이름을 적어 주세요."));
    if (d.contact.length < 3) return say(f, T("bjobs.e_ccontact", "연락처(이메일 또는 LINE)를 적어 주세요."));
    if (!d.prov) return say(f, T("bjobs.e_pick", "고르지 않은 칸이 있어요."));
    if (d.web && !/^https?:\/\/\S+$/.test(d.web)) return say(f, T("bjobs.e_web", "웹 주소는 https:// 로 시작해야 해요."));
    if (!on(f, "pledge")) return say(f, T("bjobs.e_pledge", "약속 칸에 체크해 주세요."));
    if (!signedIn()) { say(f, T("bjobs.login_first", "보내기 전에 로그인이 필요해요.")); if (social().login) social().login(""); return; }
    var uid = myUid(), old = (S.data.mine || {}).emp; busy(f, true); say(f, T("bjobs.sending", "저장 중…"));
    var data = Object.assign({ uid: uid, st: "pending", at: { __ts: 1 } }, d);
    if (old && old.note) data.note = old.note;
    api().then(function (m) { return m.boardWrite([{ col: "employers", id: uid, data: data }]); })
      .then(function () { done(f, T("bjobs.ok_emp", "신청했어요. 운영자가 확인하면 공고를 올릴 수 있어요.")); }, function (e) { busy(f, false); saveErr(f, e); });
  }
  function submitJob(f) {
    var d = { title: val(f, "title"), job: val(f, "job"), prov: val(f, "prov"), type: val(f, "type"), pay: val(f, "pay"), ko: val(f, "ko"), desc: val(f, "desc"), apply: val(f, "apply") };
    var smin = parseInt(val(f, "smin"), 10), smax = parseInt(val(f, "smax"), 10), dl = endOfDay(val(f, "dl")), now = Date.now();
    if (d.title.length < 4) return say(f, T("bjobs.e_title", "공고 제목을 4자 이상 적어 주세요."));
    if (!d.job || !d.prov || !d.type || !d.pay || !d.ko) return say(f, T("bjobs.e_pick", "고르지 않은 칸이 있어요."));
    if (!(smin >= 1 && smax >= smin && smax <= 1000000)) return say(f, T("bjobs.e_salary", "급여 범위(바트)를 적어 주세요. 최저 ≤ 최고."));
    if (d.desc.length < 10) return say(f, T("bjobs.e_desc", "하는 일·조건을 10자 이상 적어 주세요."));
    if (d.apply.length < 3) return say(f, T("bjobs.e_apply", "지원 방법을 적어 주세요."));
    if (!(dl > now && dl <= now + (JOB_MAX_DAYS + 1) * DAY)) return say(f, T("bjobs.e_deadline", "마감일은 내일부터 60일 안으로 골라 주세요."));
    if (!on(f, "pledge")) return say(f, T("bjobs.e_pledge", "약속 칸에 체크해 주세요."));
    if (!myEmpOk()) return say(f, T("bjobs.emp_intro", "공고를 올리려면 먼저 회사 확인을 신청해 주세요. 운영자가 사업자 정보를 확인한 뒤 열어 드려요."));
    var hit = banned(d.title + " " + d.desc + " " + d.apply), uid = myUid();
    busy(f, true); say(f, T("bjobs.sending", "저장 중…"));
    var data = Object.assign({ uid: uid, co: S.data.mine.emp.name, smin: smin, smax: smax, dl: { __ms: dl }, exp: { __ms: dl }, vis: hit ? "pending" : "open", at: { __ts: 1 }, reports: 0, reporters: [] }, d);
    api().then(function (m) { return m.boardWrite([{ col: "jobs", data: data }]); })
      .then(function () { done(f, hit ? T("bjobs.ok_job_pending", "공고를 받았어요. 운영자가 확인한 뒤에 보여요.") : T("bjobs.ok_job", "공고를 올렸어요.")); }, function (e) { busy(f, false); saveErr(f, e); });
  }

  /* ---------- 버튼 동작 ---------- */
  function write(ops, msg, keys) {
    return api().then(function (m) { return m.boardWrite(ops); }).then(function () { toast(msg); reset(keys); paint(); }, function (e) {
      warn("act", e); toast(why(e) === "perm" ? T("bjobs.save_perm", "게시판을 여는 중이라 아직 저장할 수 없어요. 곧 다시 시도해 주세요.") : T("bjobs.save_net", "저장하지 못했어요. 인터넷 연결을 확인해 주세요."));
    });
  }
  function act(a, id) {
    var uid = myUid(), done1 = T("bjobs.done", "바꿨어요");
    switch (a) {
      case "r-edit": S.view = "seeker"; paint(true); return;
      case "r-hide": return write([{ col: "resumes", id: uid, upd: true, data: { vis: "hidden", at: { __ts: 1 } } }], done1);
      case "r-show": return write([{ col: "resumes", id: uid, upd: true, data: { vis: "open", at: { __ts: 1 } } }], done1);
      case "r-renew": return write([{ col: "resumes", id: uid, upd: true, data: { exp: { __ms: Date.now() + RES_DAYS * DAY }, at: { __ts: 1 } } }], T("bjobs.renewed", "30일 연장했어요"));
      case "r-del": if (!window.confirm(T("bjobs.confirm_del", "지울까요? 되돌릴 수 없어요."))) return;
        return write([{ col: "resumes", id: uid, del: true }, { col: "resume_contacts", id: uid, del: true }], T("bjobs.deleted", "지웠어요"));
      case "j-hide": return write([{ col: "jobs", id: id, upd: true, data: { vis: "hidden" } }], done1);
      case "j-show": return write([{ col: "jobs", id: id, upd: true, data: { vis: "open" } }], done1);
      case "j-del": if (!window.confirm(T("bjobs.confirm_del", "지울까요? 되돌릴 수 없어요."))) return;
        return write([{ col: "jobs", id: id, del: true }], T("bjobs.deleted", "지웠어요"));
      case "e-ok": return write([{ col: "employers", id: id, upd: true, data: { st: "ok" } }], done1, ["admin", "mine"]);
      case "e-no": var note = window.prompt(T("bjobs.reject_why", "거절 이유(신청한 분에게 보여요, 120자까지)"), ""); if (note == null) return;
        return write([{ col: "employers", id: id, upd: true, data: { st: "no", note: String(note).slice(0, 120) } }], done1, ["admin", "mine"]);
      case "a-jopen": return write([{ col: "jobs", id: id, upd: true, data: { vis: "open" } }], done1);
      case "a-jno": return write([{ col: "jobs", id: id, upd: true, data: { vis: "no" } }], done1);
      case "a-jdel": if (!window.confirm(T("bjobs.confirm_del", "지울까요? 되돌릴 수 없어요."))) return; return write([{ col: "jobs", id: id, del: true }], T("bjobs.deleted", "지웠어요"));
      case "a-ropen": return write([{ col: "resumes", id: id, upd: true, data: { vis: "open" } }], done1);
      case "a-rhide": return write([{ col: "resumes", id: id, upd: true, data: { vis: "hidden" } }], done1);
      case "a-rdel": if (!window.confirm(T("bjobs.confirm_del", "지울까요? 되돌릴 수 없어요."))) return;
        return write([{ col: "resumes", id: id, del: true }, { col: "resume_contacts", id: id, del: true }], T("bjobs.deleted", "지웠어요"));
    }
  }
  function report(col, id) {
    if (!signedIn()) { toast(T("bjobs.login_report", "신고하려면 로그인해 주세요.")); if (social().login) social().login(""); return; }
    if (!window.confirm(T("bjobs.confirm_report", "이 글을 신고할까요? 신고가 3번 쌓이면 자동으로 숨겨지고 운영자가 확인해요."))) return;
    api().then(function (m) { return m.boardReport(col, id); }).then(function (r) {
      toast(r === "already" ? T("bjobs.rep_already", "이미 신고했어요") : r === "hidden" ? T("bjobs.rep_hidden", "신고했어요. 글이 숨겨졌어요") : T("bjobs.rep_ok", "신고했어요. 고마워요"));
      if (r === "hidden") { reset([col === "jobs" ? "jobs" : "seekers"]); paint(); }
    }, function (e) { warn("report", e); toast(T("bjobs.rep_fail", "신고하지 못했어요. 잠시 뒤 다시 시도해 주세요.")); });
  }
  function showContact(id) {
    S.contact[id] = "busy";
    api().then(function (m) { return m.boardGet("resume_contacts", id); }).then(function (c) { S.contact[id] = c && c.line ? c : "err"; }, function (e) { warn("contact", e); S.contact[id] = "err"; }).then(function () { paint(); });
  }

  /* ---------- 그리기·이벤트 ---------- */
  function render() {
    if (S.view === "seeker") return seekerForm();
    if (S.view === "emp") return empForm();
    if (S.view === "job") return jobForm();
    if (S.tab === "admin" && !isAdmin()) S.tab = "jobs";
    var v = S.tab === "seekers" ? viewSeekers() : S.tab === "mine" ? viewMine() : S.tab === "rules" ? viewRules() : S.tab === "admin" ? viewAdmin() : viewJobs();
    return '<div class="bj">' + tabs() + '<div class="bj-body" role="tabpanel">' + v + "</div></div>";
  }
  function go(v) {
    S.view = v;
    if ((v === "seeker" || v === "emp") && signedIn()) loadMine();
    paint(true);
    var r = document.getElementById("tnPage"); if (r) r.scrollTop = 0;
  }
  function click(e, t) {
    var el;
    if ((el = t.closest("[data-bj-tab]"))) { S.tab = el.getAttribute("data-bj-tab"); S.view = ""; paint(true); return true; }
    if ((el = t.closest("[data-bj-kind]"))) { S.kind = el.getAttribute("data-bj-kind"); paint(); return true; }
    if ((el = t.closest("[data-bj-skind]"))) { S.skind = el.getAttribute("data-bj-skind"); paint(); return true; }
    if ((el = t.closest("[data-bj-go]"))) { go(el.getAttribute("data-bj-go")); return true; }
    if (t.closest("[data-bj-back]")) { S.view = ""; paint(true); return true; }
    if ((el = t.closest("[data-bj-retry]"))) { var k = el.getAttribute("data-bj-retry"); reset([k]); paint(true); return true; }
    if ((el = t.closest("[data-bj-report]"))) { var p = el.getAttribute("data-bj-report").split("|"); report(p[0], p[1]); return true; }
    if ((el = t.closest("[data-bj-contact]"))) { showContact(el.getAttribute("data-bj-contact")); return true; }
    if ((el = t.closest("[data-bj-act]"))) { act(el.getAttribute("data-bj-act"), el.getAttribute("data-bj-id")); return true; }
    return false;
  }
  function inPage(el) { return el && el.closest && el.closest("#tnPage"); }
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!inPage(f) || !f.hasAttribute("data-bj-form")) return;
    e.preventDefault();
    var k = f.getAttribute("data-bj-form");
    try { if (k === "seeker") submitSeeker(f); else if (k === "emp") submitEmp(f); else if (k === "job") submitJob(f); } catch (x) { warn("submit", x); say(f, T("bjobs.save_net", "저장하지 못했어요. 인터넷 연결을 확인해 주세요.")); }
  });
  document.addEventListener("input", function (e) {
    var t = e.target; if (!inPage(t)) return;
    if (t.hasAttribute("data-bj-count")) { var n = t.form && t.form.querySelector("[data-bj-n]"); if (n) n.textContent = t.value.length + "/300"; }
  });
  document.addEventListener("change", function (e) {
    var t = e.target; if (!inPage(t)) return;
    if (t.hasAttribute("data-bj-prov")) { S.prov = t.value; paint(); }
    if (t.name === "useline" && t.form && t.form.elements.line) { t.form.elements.line.disabled = !t.checked; if (t.checked) t.form.elements.line.focus(); }
  });
  // 로그인·로그아웃·운영자 확인(social.js 'tn-auth') → 내 글·구직자·승인 목록 다시. 글쓰기 중이면 입력은 그대로 두고 로그인 안내 줄만 지움
  var lastUid = null;
  document.addEventListener("tn-auth", function () {
    var u = myUid();
    if (u !== lastUid) { lastUid = u; reset(["mine", "seekers", "admin"]); S.contact = {}; }
    if (S.view) { var n = document.querySelector("#tnPage [data-bj-loginnote]"); if (n && signedIn()) n.remove(); return; }
    paint();
  });

  var css = ".bj{--bj-ac:var(--kac,#0b2a4a);--bj-card:var(--kcard,#fff);--bj-line:var(--kline,#d7dde6);--bj-ink:var(--kink,#16181d);--bj-mut:var(--kmuted,#5f6672);--bj-chip:var(--kchip,#eef1f5);--bj-chipt:var(--kchipt,#0b2a4a);--bj-tint:var(--ktint,#f4f6fa)}" +
    "#tnPageBody{--bj-ac:var(--kac,#0b2a4a);--bj-card:var(--kcard,#fff);--bj-line:var(--kline,#d7dde6);--bj-ink:var(--kink,#16181d);--bj-mut:var(--kmuted,#5f6672);--bj-chip:var(--kchip,#eef1f5);--bj-chipt:var(--kchipt,#0b2a4a);--bj-tint:var(--ktint,#f4f6fa);color:var(--bj-ink)}" +
    ".bj-tabs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;margin:0 0 12px;background:var(--bj-chip);border-radius:14px}" +
    ".bj-tab{min-width:0;min-height:44px;padding:4px 2px;border:0;border-radius:11px;background:transparent;color:var(--bj-mut);font:inherit;font-size:.8125rem;font-weight:600;line-height:1.2;cursor:pointer;overflow-wrap:anywhere}" +
    ".bj-tab[aria-selected=true]{background:var(--bj-card);color:var(--bj-ac);box-shadow:0 1px 4px rgba(0,0,0,.08)}" +
    ".bj-note{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:var(--bj-tint);font-size:.875rem;line-height:1.55}" +
    ".bj-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}" +
    ".bj-chip{min-height:36px;padding:4px 12px;border:1px solid var(--bj-line);border-radius:999px;background:var(--bj-card);color:var(--bj-ink);font:inherit;font-size:.8125rem;cursor:pointer}" +
    ".bj-chip[aria-pressed=true]{background:var(--bj-ac);border-color:var(--bj-ac);color:#fff}" +
    ".bj-row{display:flex;align-items:center;gap:6px;margin:0 0 10px}.bj-row .bj-in{flex:1 1 auto}" +
    ".bj-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:44px;padding:6px 16px;border:0;border-radius:999px;background:var(--bj-ac);color:#fff;font:inherit;font-size:.9375rem;font-weight:600;cursor:pointer;text-align:center}" +
    ".bj-btn:disabled{opacity:.55;cursor:default}.bj-btn--wide{display:flex;width:100%;margin:0 0 12px}.bj-btn--sm{min-height:36px;padding:4px 12px;font-size:.8125rem}" +
    ".bj-btn--ghost{background:var(--bj-card);color:var(--bj-ac);border:1px solid var(--bj-line)}" +
    ".bj-link{border:0;background:none;padding:4px 0;color:var(--bj-ac);font:inherit;font-size:.8125rem;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px}" +
    ".bj-card{background:var(--bj-card);border:1px solid var(--bj-line);border-radius:18px;padding:14px;margin:0 0 10px;overflow-wrap:anywhere}" +
    ".bj-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 6px}" +
    ".bj-tag{padding:2px 10px;border-radius:999px;background:var(--bj-chip);color:var(--bj-chipt);font-size:.75rem;font-weight:600}" +
    ".bj-ok{color:#0c8f6a;font-size:.75rem;font-weight:600}" +
    ".bj-st{padding:2px 8px;border-radius:999px;border:1px solid var(--bj-line);font-size:.75rem;color:var(--bj-mut)}.bj-st--open{color:#0c8f6a;border-color:#0c8f6a}.bj-st--pending,.bj-st--reported{color:#b35c00;border-color:#e8a24a}" +
    ".bj-t{margin:0 0 2px;font-size:1.0625rem;line-height:1.4;font-weight:600}" +
    ".bj-sub{margin:0 0 8px;color:var(--bj-mut);font-size:.875rem}" +
    ".bj-info{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin:0 0 8px}.bj-info--1{grid-template-columns:1fr}" +
    ".bj-info div{min-width:0}.bj-info dt{font-size:.75rem;color:var(--bj-mut)}.bj-info dd{margin:0;font-size:.875rem}" +
    ".bj-desc{margin:6px 0;font-size:.9062rem;line-height:1.6;white-space:pre-wrap}.bj-apply{margin:6px 0;font-size:.875rem;white-space:pre-wrap}" +
    ".bj-more summary{cursor:pointer;color:var(--bj-ac);font-size:.875rem;font-weight:600;min-height:32px;display:flex;align-items:center}" +
    ".bj-safe{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:#fff4e6;color:#7a3e00;font-size:.8125rem}" +
    ".bj-acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;margin-top:6px}" +
    ".bj-empty{padding:24px 14px;text-align:center;color:var(--bj-mut);background:var(--bj-card);border:1px dashed var(--bj-line);border-radius:16px;margin:0 0 12px;line-height:1.6}.bj-empty p{margin:0 0 10px}" +
    ".bj-box{background:var(--bj-card);border:1px solid var(--bj-line);border-radius:16px;padding:12px 14px;margin:0 0 10px;line-height:1.6}.bj-box p{margin:6px 0 0}" +
    ".bj-h{margin:16px 0 8px;font-size:1rem;font-weight:600;color:var(--bj-ink)}.bj-h:first-child{margin-top:4px}" +
    ".bj-muted{color:var(--bj-mut)}.bj-small{font-size:.8125rem}.bj-hit{margin:4px 0;color:#b35c00;font-size:.8125rem}" +
    ".bj-rules section{background:var(--bj-card);border:1px solid var(--bj-line);border-radius:16px;padding:4px 14px 10px;margin:0 0 10px;line-height:1.65;font-size:.9062rem}" +
    ".bj-rules ul{margin:0;padding-left:1.2em}.bj-rules li{margin:4px 0}.bj-warnbox{border-color:#e8a24a!important}" +
    ".bj-back{display:inline-block;margin:0 0 4px}" +
    ".bj-form{display:flex;flex-direction:column;gap:12px;margin:8px 0 0}" +
    ".bj-fl{display:flex;flex-direction:column;gap:4px;min-width:0}.bj-lb{font-size:.875rem;font-weight:600}.bj-hint{font-size:.75rem;color:var(--bj-mut)}" +
    ".bj-in{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;min-height:44px;padding:8px 12px;border:1px solid var(--bj-line);border-radius:12px;background:var(--bj-card);color:var(--bj-ink);font:inherit;font-size:1rem}" +
    "textarea.bj-in{resize:vertical;line-height:1.55}.bj-in--sm{min-height:40px;font-size:.875rem}.bj-in:disabled{opacity:.5}" +
    "input[type=date].bj-in{-webkit-appearance:none;appearance:none}" +
    ".bj-in:focus-visible,.bj-btn:focus-visible,.bj-tab:focus-visible,.bj-chip:focus-visible{outline:2px solid var(--bj-ac);outline-offset:2px}" +
    ".bj-count{margin:-8px 0 0;text-align:right;font-size:.75rem;color:var(--bj-mut)}" +
    ".bj-fs{border:1px solid var(--bj-line);border-radius:14px;padding:8px 12px 10px;margin:0;display:flex;flex-direction:column;gap:8px;min-width:0}" +
    ".bj-ck{display:flex;align-items:flex-start;gap:8px;font-size:.9062rem;line-height:1.5;cursor:pointer}.bj-ck input{width:20px;height:20px;margin:2px 0 0;flex:0 0 auto;accent-color:var(--bj-ac)}" +
    ".bj-grid3{display:grid;grid-template-columns:1fr 1fr;gap:10px}.bj-grid3 .bj-fl:last-child{grid-column:1/-1}" +
    ".bj-pdpa{margin:0;padding:10px 12px;border-radius:12px;background:var(--bj-tint);font-size:.8125rem;line-height:1.55;color:var(--bj-mut)}" +
    ".bj-msg{margin:0;min-height:1.2em;color:#c92a2a;font-size:.875rem}.bj-msg:empty{display:none}";
  var st = document.createElement("style"); st.id = "bjCss"; st.textContent = css; document.head.appendChild(st);

  window.TNBoardJobs = { _banned: banned, _dbdOk: dbdOk, _state: S };
  lastUid = myUid();
  TNPages.register("jobs", { title: T("bjobs.title", "구인·구직"), render: render, click: click });
  if (TNPages.current() === "jobs") TNPages.refresh();
})();
