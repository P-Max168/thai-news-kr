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
    for (var i = 0; i < tp.all.length; i++) if (/^(pattaya|sriracha|bangkok)$/.test(tp.all[i])) return tp.all[i];
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
      if (prev === dir) { delete d.taste.votes[k]; now = 0; }
      else { apply(s, dir); d.taste.votes[k] = dir; now = dir; }
    });
    return now;
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
  function hasTaste() { var t = S.get().taste; return Object.keys(t.votes).length > 0; }
  function reset() { return S.update(function (d) { d.taste = { w: {}, votes: {} }; }); }

  root.TNTaste = { features: features, vote: vote, voteOf: voteOf, learned: learned, score: score, sort: sort, reset: reset, hasTaste: hasTaste };
})(window);
