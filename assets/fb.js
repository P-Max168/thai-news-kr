/* 태국 뉴스 한눈에 — Firebase(선택 기능: Google 로그인·설정 동기화·댓글). ES 모듈, 빌드 없음.
 * assets/social.js 가 필요할 때만 import() 한다. 이 파일이나 gstatic 을 못 불러오면(오프라인 등)
 * 사이트는 로그인 없이 예전과 똑같이 동작한다.
 * Firestore(Lite, REST): users/{uid}(본인 설정·취향), profiles/{uid}(공개 닉네임), comments/{id}, config/admins(운영자 uid 목록 — 콘솔에서만 수정)
 * 보안 규칙: 저장소 루트 firestore.rules (콘솔 → Firestore → 규칙 에 붙여 넣고 게시)
 */
const V = "12.4.0";
const BASE = "https://www.gstatic.com/firebasejs/" + V + "/";
const { initializeApp } = await import(BASE + "firebase-app.js");
const A = await import(BASE + "firebase-auth.js");

const CONFIG = {
  apiKey: "AIzaSyDYzK-rOfLVJxZnxTZCeNiY2QEC-UZl20w",
  authDomain: "thai-news-kr.firebaseapp.com",
  projectId: "thai-news-kr",
  storageBucket: "thai-news-kr.firebasestorage.app",
  messagingSenderId: "530200877261",
  appId: "1:530200877261:web:19f0e3815116fe43fb7184"
};
const app = initializeApp(CONFIG);
const auth = A.getAuth(app);
auth.languageCode = "ko";

let F = null, db = null;
async function fs() {
  if (!F) {
    // Firestore Lite(REST): 실시간 연결을 열어 두지 않음 → 가볍고 배터리·데이터 절약. 다른 기기 변경은 화면으로 돌아올 때 다시 읽음
    F = await import(BASE + "firebase-firestore-lite.js");
    db = F.getFirestore(app);
  }
  return F;
}

const PENDING = "tnk.auth.pending";
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
function standalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }

/* ---------- 로그인 ---------- */
export function onUser(cb) { return A.onAuthStateChanged(auth, cb); }
export function currentUser() { return auth.currentUser; }
export async function redirectResult() {
  if (!localStorage.getItem(PENDING)) return null;
  localStorage.removeItem(PENDING);
  try { const r = await A.getRedirectResult(auth); return r ? r.user : (auth.currentUser || { failed: true }); }
  catch (e) { return { failed: true, code: e.code }; }
}
async function viaRedirect(p) { localStorage.setItem(PENDING, String(Date.now())); await A.signInWithRedirect(auth, p); return null; }
export async function signIn() {
  const p = new A.GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  // iOS 홈 화면 앱(standalone)은 팝업이 돌아오지 못함 → 리디렉션
  if (isIOS() && standalone()) return viaRedirect(p);
  try { return (await A.signInWithPopup(auth, p)).user; }
  catch (e) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/web-storage-unsupported"].includes(e.code)) return viaRedirect(p);
    throw e;
  }
}
export function signOutNow() { stopSync(); return A.signOut(auth); }

/* ---------- 설정·취향 동기화: users/{uid} ---------- */
const FIELDS = ["v", "onboarded", "persona", "topics", "taste", "updatedAt", "settingsAt", "serverAt"];
let sync = null;
function payload(d) {
  const c = JSON.parse(JSON.stringify(d));        // undefined 제거·복사
  return { v: 1, onboarded: !!c.onboarded, persona: c.persona == null ? null : String(c.persona), topics: Array.isArray(c.topics) ? c.topics : null,
    taste: { w: (c.taste && c.taste.w) || {}, votes: (c.taste && c.taste.votes) || {}, vf: (c.taste && c.taste.vf) || {} },
    updatedAt: c.updatedAt || Date.now(), settingsAt: c.settingsAt || 0, serverAt: F.serverTimestamp() };
}
/* store = TNStore, merge(local, remote, opts) = TNTaste.mergeDocs. onStatus("ok"|"saving"|"error", err) */
export async function startSync(user, store, merge, opts, onStatus) {
  await fs();
  stopSync();
  const ref = F.doc(db, "users", user.uid);
  let timer = null, last = null, s = { stopped: false };
  sync = s;
  const status = onStatus || function () {};
  async function flush() {
    timer = null; if (!last || s.stopped) return;
    const d = last; last = null;
    status("saving");
    try { await F.setDoc(ref, payload(d), { mergeFields: FIELDS }); status("ok"); }   // lastCommentAt 등 다른 필드는 건드리지 않음
    catch (e) { console.warn("[sync] 저장 실패", e); status("error", e); }
  }
  s.flush = flush;
  const adapter = {
    name: "firebase",
    read: async function () {
      const snap = await F.getDoc(ref);
      if (!snap.exists()) return null;
      const r = snap.data(); delete r.serverAt; delete r.lastCommentAt; return r;
    },
    write: function (d) { last = d; clearTimeout(timer); timer = setTimeout(flush, 1500); return Promise.resolve(); }
  };
  await store.attach(adapter, function (l, r) { return merge(l, r, opts); });
  clearTimeout(timer); await flush();                   // 합친 결과는 바로 저장
  // 다른 기기에서 바뀐 내용: 이 화면으로 돌아오거나(visibility) 5분마다 다시 읽어 더 최근이면 반영
  async function pull() {
    if (s.stopped || timer || document.visibilityState === "hidden") return;
    try { const r = await adapter.read(); if (r && !s.stopped && !timer) store.applyRemote(r); } catch (e) { console.warn("[sync] 읽기 실패", e); }
  }
  s.onVis = function () { if (document.visibilityState === "visible") pull(); };
  document.addEventListener("visibilitychange", s.onVis);
  s.iv = setInterval(pull, 5 * 60 * 1000);
  s.store = store;
  addEventListener("pagehide", function () { if (timer) flush(); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden" && timer) { clearTimeout(timer); flush(); } });
}
export function stopSync() {
  if (!sync) return;
  sync.stopped = true;
  if (sync.onVis) document.removeEventListener("visibilitychange", sync.onVis);
  if (sync.iv) clearInterval(sync.iv);
  if (sync.store) sync.store.detach("firebase");
  sync = null;
}

/* ---------- 공개 프로필·운영자 ---------- */
let adminCache = null;
export async function isAdmin(uid) {
  await fs();
  if (!adminCache) adminCache = F.getDoc(F.doc(db, "config", "admins")).then(function (s) { return s.exists() ? (s.data().uids || []) : []; }).catch(function () { return []; });
  return (await adminCache).includes(uid);
}
export async function getProfile(uid) {
  await fs();
  const s = await F.getDoc(F.doc(db, "profiles", uid));
  return s.exists() ? s.data() : null;
}
export async function saveProfile(uid, nickname) {
  await fs();
  const adm = await isAdmin(uid);
  await F.setDoc(F.doc(db, "profiles", uid), { nickname, isAdmin: adm, updatedAt: F.serverTimestamp() });
  return { nickname, isAdmin: adm };
}

/* ---------- 댓글: comments/{id} ---------- */
function cmt(d) { const x = d.data(); return Object.assign({ id: d.id }, x, { createdAt: x.createdAt && x.createdAt.toMillis ? x.createdAt.toMillis() : Date.now() }); }
export async function listComments(edition, articleId) {
  await fs();
  // 같음(==) 조건만 → 복합 색인 불필요. 정렬은 화면에서
  const q = F.query(F.collection(db, "comments"), F.where("edition", "==", edition), F.where("articleId", "==", articleId), F.where("hidden", "==", false), F.limit(200));
  const snap = await F.getDocs(q);
  return snap.docs.map(cmt).sort(function (a, b) { return a.createdAt - b.createdAt; });
}
/* 답글: 같은 comments 컬렉션, articleId = "<기사 id>~<부모 댓글 id>"(운영자 고정 댓글은 "~op") — 보안 규칙 변경 없이 동작(articleId ≤ 40자).
 * 부모 여러 개를 'in'(30개씩) 한 번에 읽음. 같음/in 조건만 → 복합 색인 불필요 */
export async function listReplies(edition, articleId, parentIds) {
  await fs();
  const ids = parentIds.map(function (p) { return articleId + "~" + p; }).filter(function (x) { return x.length <= 40; });
  const out = [];
  for (let i = 0; i < ids.length; i += 30) {
    const q = F.query(F.collection(db, "comments"), F.where("edition", "==", edition), F.where("articleId", "in", ids.slice(i, i + 30)), F.where("hidden", "==", false), F.limit(300));
    const snap = await F.getDocs(q);
    snap.docs.forEach(function (d) { out.push(cmt(d)); });
  }
  return out.sort(function (a, b) { return a.createdAt - b.createdAt; });
}
export async function addComment(edition, articleId, text, profile) {
  await fs();
  const u = auth.currentUser; if (!u) throw new Error("not-signed-in");
  const b = F.writeBatch(db);
  const ref = F.doc(F.collection(db, "comments"));
  b.set(ref, { articleId, edition, uid: u.uid, nickname: profile.nickname, text, createdAt: F.serverTimestamp(), isAdmin: !!profile.isAdmin, hidden: false, reports: 0, reporters: [] });
  b.set(F.doc(db, "users", u.uid), { lastCommentAt: F.serverTimestamp() }, { merge: true });   // 30초 제한(규칙에서 확인)
  await b.commit();
  return ref.id;
}
export async function deleteComment(id) { await fs(); await F.deleteDoc(F.doc(db, "comments", id)); }
export async function hideComment(id) { await fs(); await F.updateDoc(F.doc(db, "comments", id), { hidden: true }); }
export async function reportComment(id) {
  await fs();
  const u = auth.currentUser; if (!u) throw new Error("not-signed-in");
  const ref = F.doc(db, "comments", id);
  return F.runTransaction(db, async function (tx) {
    const s = await tx.get(ref); if (!s.exists()) return "gone";
    const d = s.data(), rs = d.reporters || [];
    if (rs.includes(u.uid)) return "already";
    const n = (d.reports || 0) + 1;
    tx.update(ref, { reports: n, reporters: rs.concat([u.uid]), hidden: !!d.hidden || n >= 3 });
    return n >= 3 ? "hidden" : "ok";
  });
}

/* ---------- 익명 반응 집계: rx/{자동 id} (2026-10-03 야간) ----------
 * 하트·🙌·🙅 를 기사별로 모아 운영자 통계에 씀. 사람 정보 없음(uid·이름·성별·기기 정보 저장 안 함):
 * {a:"<판 id>/<기사 id>", k:"h"|"u"|"d", v:1|-1(취소), r:사는 곳, i:[관심…], tp:주 주제, at:서버 시각}
 * 쓰기 = 누구나 '추가'만(규칙이 모양 검사), 읽기 = 운영자만. 규칙이 아직 게시 전이면 permission-denied → 화면은 조용히 무시 */
export async function addReactions(list) {
  await fs();
  const b = F.writeBatch(db), ids = [];
  list.slice(0, 20).forEach(function (x) { const ref = F.doc(F.collection(db, "rx")); ids.push(ref.id); b.set(ref, Object.assign({}, x, { at: F.serverTimestamp() })); });
  await b.commit();
  return ids;   // 저장된 문서 id(확인·기록용)
}
export async function listReactions(sinceMs, max) {
  await fs();
  const q = F.query(F.collection(db, "rx"), F.where("at", ">=", F.Timestamp.fromMillis(sinceMs)), F.limit(max || 5000));
  const snap = await F.getDocs(q);
  return snap.docs.map(function (d) { const x = d.data(); return Object.assign({}, x, { at: x.at && x.at.toMillis ? x.at.toMillis() : 0 }); });
}

/* ---------- ⚠️ 오류 신고: reports/{자동 id} (2026-10-05) ----------
 * 기사·가게·임대·광고의 '오류 신고' → 운영자 승인함(#approve). 로그인 필요 없음, 사람 정보 없음(uid·기기 정보 저장 안 함).
 * {id:항목, kind:article|place|rent|ad, type:wrong|link|screen|etc, memo:≤80자, url:페이지 주소, ed:판 id, at:서버 시각}
 * 쓰기 = 누구나 '추가'만(규칙이 모양 검사), 읽기 = 운영자만, 고치기·지우기 금지(자동 처리 없음) */
export async function addReport(r) {
  await fs();
  const d = { id: String(r.id).slice(0, 80), kind: r.kind, type: r.type, memo: String(r.memo || "").slice(0, 80), url: String(r.url).slice(0, 300), ed: String(r.ed || "").slice(0, 20), at: F.serverTimestamp() };
  const ref = await F.addDoc(F.collection(db, "reports"), d);
  return ref.id;   // 저장된 문서 id(확인·기록용)
}
export async function listReports(sinceMs, max) {
  await fs();
  const q = F.query(F.collection(db, "reports"), F.where("at", ">=", F.Timestamp.fromMillis(sinceMs)), F.limit(max || 300));
  const snap = await F.getDocs(q);
  return snap.docs.map(function (d) { const x = d.data(); return Object.assign({}, x, { at: x.at && x.at.toMillis ? x.at.toMillis() : 0 }); });
}

/* ---------- 광고 자리별 클릭 수(익명): adclicks/{자리_날짜} (2026-10-05, 준비만 — social.js AD_CLICK_ON=false) ----------
 * {s:자리 id, d:방콕 날짜 YYYYMMDD(정수), n:클릭 수}. 사람·기기·시각 정보 없음. 문서 id = s + "_" + d.
 * 쓰기 = n 을 1~20 만 올리기(규칙이 모양·날짜·증가 폭 검사), 읽기 = 운영자만. 규칙(firestore.rules adclicks)은 아직 게시 전 → 지금 보내면 거부됨 */
export async function addAdClicks(list) {
  await fs();
  const b = F.writeBatch(db);
  list.slice(0, 20).forEach(function (x) { b.set(F.doc(db, "adclicks", x.s + "_" + x.d), { s: x.s, d: x.d, n: F.increment(x.n) }, { merge: true }); });
  await b.commit();
  return list.length;
}
export async function listAdClicks(sinceDay) {
  await fs();
  const q = F.query(F.collection(db, "adclicks"), F.where("d", ">=", sinceDay), F.limit(2000));
  const snap = await F.getDocs(q);
  return snap.docs.map(function (d) { return d.data(); });
}

/* ---------- 🚫 가게 폐업 신고 숫자(공개): placeflags/{가게 id} (2026-10-05, 운영자만 씀 — 규칙 게시 전엔 거부됨) ----------
 * {id: 가게 id, n: 폐업 신고 수, st: ""|"closed"(운영자 폐업 확인 = 폐업 보관함), at: 서버 시각}. 신고 원문·사람 정보 없음(숫자만).
 * 읽기 = 누구나(화면 assets/places.js 가 REST 로 읽음 — data/places-flags.json 의 fs_live 가 true 일 때만), 쓰기 = 운영자만, 지우기 금지 */
export async function setPlaceFlag(id, n, st) {
  await fs();
  await F.setDoc(F.doc(db, "placeflags", String(id)), { id: String(id), n: Math.max(0, Math.min(9999, n | 0)), st: st === "closed" ? "closed" : "", at: F.serverTimestamp() });
  return true;
}
