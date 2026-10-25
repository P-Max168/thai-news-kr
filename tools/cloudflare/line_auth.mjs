// LINE 로그인 → Firebase 로그인 (Cloudflare Worker 에서 쓰는 공유 모듈, 2026-10-25 Claude)
//
// 언어판 Worker(예: kstar-th 의 cloudflare/worker.mjs)가 /auth/line/ 로 오는 요청을 이 모듈에 넘긴다.
// 한국판(tnews)은 GitHub Pages 라 Worker 가 없음 → 이 파일을 쓰지 않고, 화면에도 LINE 버튼이 안 나온다.
//
// 흐름
//   1) GET  /auth/line/start?r=/지금/주소  → LINE 로그인 화면으로 보냄(state·nonce·PKCE, 10분짜리 서명 쿠키)
//   2) GET  /auth/line/callback           → LINE 이 돌려준 code 확인 → 토큰 교환 → ID 토큰 검증
//                                           → Firebase 맞춤 토큰 만들어 2분짜리 HttpOnly 쿠키에 담고 r#line=1 로 돌려보냄
//   3) POST /auth/line/token              → 같은 사이트 화면(social.js)이 쿠키의 맞춤 토큰을 한 번 받아 감(받으면 쿠키 지움)
//   4) GET  /auth/line/status             → {on:true|false} — 비밀값이 다 들어 있어야 화면에 LINE 버튼이 나옴
//
// 받는 정보: LINE 사용자 ID(sub)만(scope=openid). 이름·사진·이메일은 받지 않음(PDPA 최소 수집).
// Firebase 사용자 ID = "L" + LINE 사용자 ID(34자, 맞춤 토큰 uid 상한 36자 안).
//
// Worker 비밀값(Cloudflare 대시보드 → Workers → 이 Worker → 설정 → 변수 및 비밀, '비밀' 로):
//   LINE_CHANNEL_ID      LINE Developers 의 LINE Login 채널 ID
//   LINE_CHANNEL_SECRET  같은 채널의 Channel secret (쿠키 서명에도 씀)
//   FIREBASE_SA_JSON     Firebase 서비스 계정 키 JSON 파일 내용 전체
// 선택: LINE_SCOPE (기본 "openid")

const AUTHZ = "https://access.line.me/oauth2/v2.1/authorize";
const TOKEN = "https://api.line.me/oauth2/v2.1/token";
const VERIFY = "https://api.line.me/oauth2/v2.1/verify";
const AUD = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
const PATH = "/auth/line";
const STATE_COOKIE = "kln";
const TOKEN_COOKIE = "klt";
const STATE_TTL = 600;   // 초 — LINE 화면에서 머무를 수 있는 시간
const TOKEN_TTL = 120;   // 초 — 돌아온 화면이 맞춤 토큰을 받아 갈 시간

const enc = new TextEncoder();

export function lineAuthOn(env) {
  return !!(env && env.LINE_CHANNEL_ID && env.LINE_CHANNEL_SECRET && env.FIREBASE_SA_JSON);
}

function b64url(bytes) {
  let s = "";
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlText(t) { return b64url(enc.encode(t)); }
function fromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function rand(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }

async function hmac(secret, text) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(text)));
}
function same(a, b) {   // 길이가 같은 문자열을 시간 차 없이 비교
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// 돌아갈 주소는 같은 사이트 안의 경로만(다른 사이트로 빼돌리기 방지)
export function safeReturn(r) {
  r = String(r || "/").split("#")[0];
  if (r.length > 300 || !/^\/(?![\/\\])/.test(r) || /[\u0000-\u001f]/.test(r)) return "/";
  return r;
}

function cookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach(function (p) {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}
function setCookie(name, value, maxAge) {
  return name + "=" + value + "; Path=" + PATH + "; Max-Age=" + maxAge + "; HttpOnly; Secure; SameSite=Lax";
}
function noStore(h) {
  h.set("Cache-Control", "no-store");
  h.set("Referrer-Policy", "no-referrer");
  return h;
}
function back(origin, r, frag, setCookies) {
  const h = noStore(new Headers({ Location: origin + safeReturn(r) + "#" + frag }));
  (setCookies || []).forEach(function (c) { h.append("Set-Cookie", c); });
  return new Response(null, { status: 303, headers: h });
}
function json(obj, status, extra) {
  const h = noStore(new Headers({ "Content-Type": "application/json; charset=utf-8" }));
  (extra || []).forEach(function (c) { h.append("Set-Cookie", c); });
  return new Response(JSON.stringify(obj), { status: status || 200, headers: h });
}

// Firebase 맞춤 토큰(RS256) — 서비스 계정 키로 직접 서명
async function firebaseToken(saJson, uid, nowSec) {
  const sa = typeof saJson === "string" ? JSON.parse(saJson) : saJson;
  if (!sa || !sa.client_email || !sa.private_key) throw new Error("FIREBASE_SA_JSON 형식 오류");
  const pem = String(sa.private_key).replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", fromB64url(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = nowSec || Math.floor(Date.now() / 1000);
  const head = b64urlText(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64urlText(JSON.stringify({ iss: sa.client_email, sub: sa.client_email, aud: AUD, iat: now, exp: now + 3600, uid: uid, claims: { prov: "line" } }));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(head + "." + body));
  return head + "." + body + "." + b64url(sig);
}

export function lineUid(sub) {
  const u = "L" + String(sub || "");
  if (!/^LU[0-9a-f]{32}$/i.test(u) && (u.length < 2 || u.length > 36)) throw new Error("LINE 사용자 ID 형식 오류");
  return u;
}

async function start(request, env, url) {
  const r = safeReturn(url.searchParams.get("r"));
  if (!lineAuthOn(env)) return back(url.origin, r, "lerr=off");
  const n = rand(16), v = rand(32), ts = Math.floor(Date.now() / 1000);
  const payload = [n, v, b64urlText(r), String(ts)].join(".");
  const cookie = payload + "." + await hmac(env.LINE_CHANNEL_SECRET, payload);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", enc.encode(v)));
  const q = new URLSearchParams({
    response_type: "code", client_id: env.LINE_CHANNEL_ID, redirect_uri: url.origin + PATH + "/callback",
    state: n, scope: env.LINE_SCOPE || "openid", nonce: n, code_challenge: challenge, code_challenge_method: "S256"
  });
  const h = noStore(new Headers({ Location: AUTHZ + "?" + q.toString() }));
  h.append("Set-Cookie", setCookie(STATE_COOKIE, cookie, STATE_TTL));
  return new Response(null, { status: 302, headers: h });
}

async function readState(request, env) {
  const raw = cookies(request)[STATE_COOKIE] || "";
  const p = raw.split(".");
  if (p.length !== 5) return null;
  const payload = p.slice(0, 4).join(".");
  if (!same(p[4], await hmac(env.LINE_CHANNEL_SECRET, payload))) return null;
  const ts = parseInt(p[3], 10);
  if (!(ts > 0) || Math.floor(Date.now() / 1000) - ts > STATE_TTL) return null;
  let r = "/";
  try { r = new TextDecoder().decode(fromB64url(p[2])); } catch (e) { r = "/"; }
  return { n: p[0], v: p[1], r: safeReturn(r) };
}

async function callback(request, env, url, fetchImpl) {
  const clear = setCookie(STATE_COOKIE, "", 0);
  if (!lineAuthOn(env)) return back(url.origin, "/", "lerr=off", [clear]);
  const st = await readState(request, env);
  if (!st) return back(url.origin, "/", "lerr=expired", [clear]);
  const err = url.searchParams.get("error");
  if (err) return back(url.origin, st.r, err === "access_denied" ? "lerr=cancel" : "lerr=fail", [clear]);
  const code = url.searchParams.get("code"), state = url.searchParams.get("state");
  if (!code || !same(state || "", st.n)) return back(url.origin, st.r, "lerr=fail", [clear]);
  const f = fetchImpl || fetch;
  try {
    const form = { "Content-Type": "application/x-www-form-urlencoded" };
    const tr = await f(TOKEN, { method: "POST", headers: form, body: new URLSearchParams({
      grant_type: "authorization_code", code: code, redirect_uri: url.origin + PATH + "/callback",
      client_id: env.LINE_CHANNEL_ID, client_secret: env.LINE_CHANNEL_SECRET, code_verifier: st.v }) });
    const tj = await tr.json();
    if (!tr.ok || !tj.id_token) throw new Error("token " + tr.status + " " + (tj.error || ""));
    const vr = await f(VERIFY, { method: "POST", headers: form, body: new URLSearchParams({
      id_token: tj.id_token, client_id: env.LINE_CHANNEL_ID, nonce: st.n }) });
    const vj = await vr.json();
    if (!vr.ok || !vj.sub || String(vj.aud) !== String(env.LINE_CHANNEL_ID)) throw new Error("verify " + vr.status + " " + (vj.error || ""));
    const tok = await firebaseToken(env.FIREBASE_SA_JSON, lineUid(vj.sub));
    return back(url.origin, st.r, "line=1", [clear, setCookie(TOKEN_COOKIE, tok, TOKEN_TTL)]);
  } catch (e) {
    console.log("[line-auth] 실패:", String(e && e.message || e).slice(0, 200));   // 비밀값·토큰은 찍지 않음
    return back(url.origin, st.r, "lerr=fail", [clear]);
  }
}

function tokenOut(request, url) {
  const o = request.headers.get("Origin");
  if (o && o !== url.origin) return json({ error: "origin" }, 403);
  const t = cookies(request)[TOKEN_COOKIE] || "";
  const clear = setCookie(TOKEN_COOKIE, "", 0);
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(t)) return json({ error: "none" }, 404, [clear]);
  return json({ t: t }, 200, [clear]);
}

// 언어판 Worker 에서: const r = await handleLineAuth(request, env); if (r) return r;
// /auth/line/ 경로가 아니면 null(=사이트 파일로 넘김)
export async function handleLineAuth(request, env, fetchImpl) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(PATH + "/")) return null;
  const p = url.pathname.slice(PATH.length);
  if (p === "/status" && request.method === "GET") {
    const h = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" });
    return new Response(JSON.stringify({ on: lineAuthOn(env) }), { headers: h });
  }
  if (p === "/start" && request.method === "GET") return start(request, env, url);
  if (p === "/callback" && request.method === "GET") return callback(request, env, url, fetchImpl);
  if (p === "/token" && request.method === "POST") return tokenOut(request, url);
  return json({ error: "not_found" }, 404);
}

export const _test = { firebaseToken, readState, safeReturn, lineUid, AUD };
