/* 🛡️ 광고 옆 민감 기사 기준(애드센스 준비, 2026-10-03 v2) — 낱말 목록만이 아니라 '점수 + 이유'
 * 기사는 절대 지우지 않음. 점수가 기준(hide_at) 이상이면 그 기사 바로 옆(앞뒤) 광고만 안 보임. 메인 큰 배너·한국 뉴스 사이 광고·지역 광고도 같은 기준.
 * 기준표(RULES)는 아래 JSON 하나 — 화면(✅ 승인함 '광고 옆 민감 기사 기준')과 tools/adsafe.py 가 같은 표를 읽음. 고칠 때는 여기만 고치면 됨.
 * 점수 = 걸린 낱말 묶음 점수(묶음마다 한 번) + 맥락 점수(제목에 나옴 +1 · 사회·사건사고 주제 +1 · 정책·제도 이야기 −1). 편집자 ad_safe 가 있으면 그것이 우선. */
(function () {
  "use strict";
  var RULES = /*RULES*/{
    "version": "2026-10-03 v2",
    "hide_at": 3,
    "groups": [
      { "id": "sex", "label": "성범죄·성인", "pts": 3, "words": ["성매매", "매춘", "성폭행", "성폭력", "강간", "성추행", "성착취", "음란", "포르노", "나체", "알몸", "불법 촬영", "불법촬영", "아동 학대", "아동학대"] },
      { "id": "suicide", "label": "자살", "pts": 3, "words": ["자살", "극단적 선택", "투신"] },
      { "id": "gore", "label": "잔혹·시신", "pts": 3, "words": ["참수", "토막", "시신", "사체", "훼손된 채"], "except": ["반토막"] },
      { "id": "kill", "label": "살인·총격·흉기", "pts": 2, "words": ["살해", "살인", "총격", "총기 난사", "흉기", "칼부림"], "except": ["살인적", "살해 협박"] },
      { "id": "drug", "label": "마약", "pts": 2, "words": ["마약", "필로폰", "메스암페타민", "야바", "코카인", "헤로인", "케타민"] },
      { "id": "gamble", "label": "도박", "pts": 2, "words": ["도박", "카지노", "불법 베팅"] },
      { "id": "death", "label": "사망 사고", "pts": 1, "words": ["사망", "숨져", "숨진", "목숨을 잃", "익사"] },
      { "id": "weed", "label": "대마", "pts": 1, "words": ["대마"] }
    ],
    "context": [
      { "id": "title", "label": "제목에 나옴", "pts": 1, "strong": true, "how": "2점 이상 낱말이 제목에 있으면 +1 (기사 전체가 그 이야기)" },
      { "id": "crime", "label": "사회·사건사고 주제", "pts": 1, "topics": ["society"], "strong": true, "how": "주제가 🚨 사회·사건사고이고 2점 이상 낱말이 있으면 +1" },
      { "id": "policy", "label": "정책·제도 이야기", "pts": -1, "words": ["법안", "합법화", "규제", "정책", "제도", "입법", "허가제", "캠페인", "예방 교육"], "how": "정책·제도 이야기면 −1 (예: 카지노 합법화 법안 → 사건이 아니라 제도 뉴스)" }
    ],
    "manual": "편집자가 판 데이터 기사에 ad_safe:false 를 넣으면 점수와 관계없이 광고 숨김, ad_safe:true 면 광고 보임"
  }/*END*/;

  function text(s) { return [s.headline || ""].concat(s.summary || [], s.desc ? [s.desc] : [], s.tags || []).join(" "); }
  function strip(t, ex) { (ex || []).forEach(function (w) { t = t.split(w).join(" "); }); return t; }
  function hitWord(t, g) { t = strip(t, g.except); for (var i = 0; i < g.words.length; i++) if (t.indexOf(g.words[i]) >= 0) return g.words[i]; return null; }

  /* 기사 하나 → { pts, hide, why:[{label, pts, word?}], manual } */
  function score(s) {
    if (!s) return { pts: 0, hide: false, why: [] };
    if (s.ad_safe === false) return { pts: RULES.hide_at, hide: true, manual: true, why: [{ label: "편집자가 직접 '광고 숨김'(ad_safe:false)", pts: RULES.hide_at }] };
    if (s.ad_safe === true) return { pts: 0, hide: false, manual: true, why: [{ label: "편집자가 직접 '광고 괜찮음'(ad_safe:true)", pts: 0 }] };
    var all = text(s), title = s.headline || "", why = [], pts = 0, inTitle = false, strong = false;
    RULES.groups.forEach(function (g) {
      var w = hitWord(all, g); if (!w) return;
      pts += g.pts; why.push({ label: g.label, pts: g.pts, word: w });
      if (g.pts >= 2) { strong = true; if (hitWord(title, g)) inTitle = true; }
    });
    if (why.length) {
      RULES.context.forEach(function (c) {
        if (c.strong && !strong) return;   // '제목'·'사건사고 주제' 더하기는 2점 이상 낱말이 있을 때만(사망 사고 1점짜리 재난 뉴스는 안 올림)
        var on = c.id === "title" ? inTitle
          : c.topics ? c.topics.indexOf(s.topic) >= 0 || (s.secondary || []).some(function (x) { return c.topics.indexOf(x) >= 0; })
          : c.words ? !!hitWord(all, c) : false;
        if (on) { pts += c.pts; why.push({ label: c.label, pts: c.pts }); }
      });
    }
    return { pts: pts, hide: pts >= RULES.hide_at, why: why };
  }
  /* 사람이 읽는 한 줄: "마약 +2('야바') · 제목에 나옴 +1 = 3점 → 광고 숨김(기준 3점)" */
  function explain(r) {
    if (!r.why.length) return "걸린 기준 없음 = 0점";
    return r.why.map(function (w) { return w.label + " " + (w.pts > 0 ? "+" : w.pts < 0 ? "−" : "") + Math.abs(w.pts) + (w.word ? "('" + w.word + "')" : ""); }).join(" · ") +
      " = " + r.pts + "점 → " + (r.hide ? "광고 숨김" : "광고 보임") + "(기준 " + RULES.hide_at + "점)";
  }
  window.TNAdSafe = { RULES: RULES, score: score, explain: explain };
})();
