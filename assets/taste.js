/* 태국 뉴스 한눈에 — 👍/👎 취향 학습(이 기기에만 저장, TNStore 사용)
 * 특징(feature): "t:<주제>"(주 주제 1.0, 보조 0.5), "l:<지역>", "k:<키워드 태그>"
 * 👍 = 특징 가중치 +1 / 👎 = -1 (같은 버튼을 다시 누르면 취소, 반대로 바꾸면 되돌린 뒤 반영)
 * 정렬 점수 = 최신성(12시간마다 -1, 최대 -6) + 학습 점수(±4 로 제한) + 그 기사에 직접 누른 표(👍 +1.5 / 👎 -4)
 * → 관심 없는 기사는 아래로 내려갈 뿐, 절대 숨기지 않는다.
 */
(function (root) {
  "use strict";
  var W_MAX = 6, LEARN_MAX = 4;
  var T = root.TNTopics, S = root.TNStore;

  function locOf(s, tp) {
    for (var i = 0; i < tp.all.length; i++) if (/^(east|bangkok|north|south)$/.test(tp.all[i])) return tp.all[i];
    if (s.region) return String(s.region).replace(/\s*\(.*$/, "").trim();
    return null;
  }
  /* 기사 → [[feature, 비중]] */
  function features(s) {
    var tp = T.storyTopics(s), f = [["t:" + tp.topic, 1]];
    tp.secondary.forEach(function (t) { f.push(["t:" + t, 0.5]); });
    var loc = locOf(s, tp); if (loc) f.push(["l:" + loc, 0.7]);
    (s.tags || []).forEach(function (k) { f.push(["k:" + k, 0.6]); });
    return f;
  }
  function key(edition, s) { return edition + "/" + s.id; }

  function apply(s, dir) {
    var w = S.get().taste.w;
    features(s).forEach(function (p) {
      var v = (w[p[0]] || 0) + dir;
      v = Math.max(-W_MAX, Math.min(W_MAX, v));
      if (Math.abs(v) < 1e-9) delete w[p[0]]; else w[p[0]] = v;
    });
  }

  /* 표 주기: dir = 1(👍) | -1(👎). 반환값 = 이 기사의 새 표(1, -1, 0) */
  function vote(edition, s, dir) {
    var k = key(edition, s), now = 0;
    S.update(function (d) {
      var prev = d.taste.votes[k] || 0;
      if (prev) apply(s, -prev);          // 이전 표 되돌리기
      if (prev === dir) { delete d.taste.votes[k]; delete d.taste.vf[k]; now = 0; }
      else { apply(s, dir); d.taste.votes[k] = dir; d.taste.vf[k] = featNames(s); now = dir; }
    });
    return now;
  }
  /* 표마다 그 기사의 특징 이름을 같이 저장(vf) → 다른 기기와 표를 합칠 때 가중치를 다시 계산할 수 있음 */
  function featNames(s) { return features(s).map(function (p) { return p[0]; }).slice(0, 14); }
  /* 화면에 열린 판에서, 예전에 눌러 vf 가 없는 표를 채움(가중치는 그대로) */
  function backfill(edition, stories) {
    var t = S.get().taste, miss = false;
    stories.forEach(function (s) { var k = key(edition, s); if (t.votes[k] && !t.vf[k]) { t.vf[k] = featNames(s); miss = true; } });
    return miss;
  }
  function weightsFrom(votes, vf) {
    var w = {};
    Object.keys(votes).forEach(function (k) { (vf[k] || []).forEach(function (f) { w[f] = (w[f] || 0) + votes[k]; }); });
    Object.keys(w).forEach(function (f) { w[f] = Math.max(-W_MAX, Math.min(W_MAX, w[f])); if (!w[f]) delete w[f]; });
    return w;
  }
  var MAX_VOTES = 1200;
  /* 로그인 때 이 기기 문서와 클라우드 문서 합치기
   * - 👍👎 표: 합집합(같은 기사에 서로 다른 표면 더 최근에 바뀐 쪽)
   * - 가중치: 합친 표로 다시 계산(vf 없는 옛 표의 몫은 최근 쪽 문서에서 그대로 가져옴) — 같은 표가 두 번 더해지지 않음
   * - 설정(persona·topics·onboarded): settingsAt 이 더 최근인 쪽. 단 opts.newDevice(이 기기가 이 계정과 처음 연결)이고
   *   클라우드에 설정이 있으면 클라우드 설정을 되살림(새 휴대폰에서 첫 질문에 답한 것보다 원래 설정이 우선) */
  function mergeDocs(local, remote, opts) {
    opts = opts || {};
    if (!remote) return local;
    var lt = local.taste || { w: {}, votes: {}, vf: {} }, rt = remote.taste || { w: {}, votes: {}, vf: {} };
    lt.vf = lt.vf || {}; rt.vf = rt.vf || {}; lt.votes = lt.votes || {}; rt.votes = rt.votes || {};
    var lNew = (local.updatedAt || 0) >= (remote.updatedAt || 0);
    var newer = lNew ? lt : rt, older = lNew ? rt : lt;
    var votes = {}, vf = {};
    [older, newer].forEach(function (t) { Object.keys(t.votes).forEach(function (k) { if (t.votes[k]) { votes[k] = t.votes[k]; if (t.vf[k]) vf[k] = t.vf[k]; } }); });
    var keys = Object.keys(votes).sort();          // 키 = "<판 id>/<기사 id>" → 이름순 = 날짜순
    if (keys.length > MAX_VOTES) keys.slice(0, keys.length - MAX_VOTES).forEach(function (k) { delete votes[k]; delete vf[k]; });
    // vf 없는 옛 표의 몫(= 최근 문서의 w − 그 문서의 vf 표로 계산한 w)
    var nv = {}; Object.keys(newer.votes).forEach(function (k) { if (newer.vf[k]) nv[k] = newer.votes[k]; });
    var nw = weightsFrom(nv, newer.vf), w = weightsFrom(votes, vf);
    Object.keys(newer.w || {}).forEach(function (f) {
      var rest = (newer.w[f] || 0) - (nw[f] || 0);
      if (Math.abs(rest) > 1e-9) { w[f] = Math.max(-W_MAX, Math.min(W_MAX, (w[f] || 0) + rest)); if (!w[f]) delete w[f]; }
    });
    var lS = local.settingsAt || 0, rS = remote.settingsAt || remote.updatedAt || 0;
    var useRemoteSettings = remote.onboarded && (opts.newDevice || rS > lS);
    var setSrc = useRemoteSettings ? remote : local;
    return {
      v: 1, onboarded: !!(local.onboarded || remote.onboarded), persona: setSrc.persona == null ? null : setSrc.persona,
      topics: setSrc.topics == null ? null : setSrc.topics, taste: { w: w, votes: votes, vf: vf }, ui: local.ui || {},
      updatedAt: Date.now(), settingsAt: Math.max(lS, rS)
    };
  }
  function voteOf(edition, s) { return S.get().taste.votes[key(edition, s)] || 0; }

  function learned(s) {
    var w = S.get().taste.w, sum = 0;
    features(s).forEach(function (p) { sum += (w[p[0]] || 0) * p[1]; });
    return Math.max(-LEARN_MAX, Math.min(LEARN_MAX, sum * 0.5));
  }
  function score(edition, s, nowMs) {
    var hours = Math.max(0, ((nowMs || Date.now()) - new Date(s.published).getTime()) / 3600000); // 판 생성 이후 기사는 0
    var rec = -Math.min(6, hours / 12);
    var v = voteOf(edition, s);
    return rec + learned(s) + (v > 0 ? 1.5 : v < 0 ? -4 : 0);
  }
  /* 안정 정렬(점수 같으면 최신순) */
  /* refMs = 기준 시각(판 생성 시각). 옛 판을 열어도 판 안에서의 최신성으로 비교 */
  function sort(edition, list, refMs) {
    var now = refMs || Date.now();
    return list.map(function (s, i) { return { s: s, sc: score(edition, s, now), t: new Date(s.published).getTime(), i: i }; })
      .sort(function (a, b) { return (b.sc - a.sc) || (b.t - a.t) || (a.i - b.i); })
      .map(function (x) { return x.s; });
  }
  function hasTaste() { var t = S.get().taste; return Object.keys(t.votes).some(function (k) { return k.indexOf("h:") !== 0; }); }
  /* '내 취향 초기화' = 🙌🙅 표·가중치만 지움. ❤️ 하트(h:…)는 그대로(내가 하트한 기사 목록) */
  function reset() {
    return S.update(function (d) {
      var keep = {}; Object.keys(d.taste.votes || {}).forEach(function (k) { if (k.indexOf("h:") === 0) keep[k] = d.taste.votes[k]; });
      d.taste = { w: {}, votes: keep, vf: {} };
    });
  }

  /* ---------- ❤️ 하트(2026-10-03 운영자 승인) ----------
   * 저장: taste.votes["h:<판 id>/<기사 id>"] = 1(하트) | -1(취소 표시 — 다른 기기와 합칠 때 되살아나지 않게). vf 가 없어 가중치 계산엔 안 들어감
   *       → 기존 Firestore 규칙(users/{uid}.taste.votes) 그대로 로그인 동기화. 취향 반영은 하트 = 🙌 더 보여줘 표를 같이 누름.
   * 목록용 제목·매체·주제는 이 기기 ui.hm 에(동기화 안 함 — 다른 기기 하트는 목록 화면이 판 파일을 읽어 채움) */
  function hkey(edition, id) { return "h:" + edition + "/" + id; }
  function heartOf(edition, s) { return S.get().taste.votes[hkey(edition, s.id)] === 1; }
  function heart(edition, s) {
    var k = hkey(edition, s.id), on = !heartOf(edition, s);
    if (on && voteOf(edition, s) <= 0) vote(edition, s, 1);        // 하트 = 🙌 같이
    else if (!on && voteOf(edition, s) > 0) vote(edition, s, 1);   // 하트 취소 = 🙌 도 취소
    S.update(function (d) {
      d.taste.votes[k] = on ? 1 : -1;
      d.ui = d.ui || {}; var hm = d.ui.hm = d.ui.hm || {};
      if (on) hm[k] = { t: String(s.headline || "").slice(0, 120), src: String(s.source || "").replace(/\s*\(.*\)$/, "").slice(0, 40), tp: T.storyTopics(s).topic, at: Date.now() };
      else delete hm[k];
    });
    return on;
  }
  /* 하트한 기사 [{key, ed, id, meta}] — 최근 하트 먼저(시각을 모르면 판 id 역순) */
  function hearts() {
    var d = S.get(), hm = (d.ui && d.ui.hm) || {};
    return Object.keys(d.taste.votes).filter(function (k) { return k.indexOf("h:") === 0 && d.taste.votes[k] === 1; }).map(function (k) {
      var m = /^h:([^/]+)\/(.+)$/.exec(k) || [];
      return { key: k, ed: m[1], id: m[2], meta: hm[k] || null };
    }).sort(function (a, b) { return ((b.meta && b.meta.at) || 0) - ((a.meta && a.meta.at) || 0) || (b.ed > a.ed ? 1 : b.ed < a.ed ? -1 : 0); });
  }

  root.TNTaste = { features: features, vote: vote, voteOf: voteOf, learned: learned, score: score, sort: sort, reset: reset, hasTaste: hasTaste,
    backfill: backfill, mergeDocs: mergeDocs, key: key, heart: heart, heartOf: heartOf, hearts: hearts };
})(window);
