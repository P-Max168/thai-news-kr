/* 🧑‍💼 구인판 시안(2026-10-03) — 화면 안 페이지 #jobs. **주소로만 열림(메뉴·링크 없음)**. 진짜 공고 아님: 모든 카드 = (예시).
 * 올리기·지원·연락 기능 없음(버튼은 '준비 중' 자리표시). 급여·시간 같은 값은 지어내지 않고 '[사장님 입력]' 칸으로만 보여 줌.
 * 광고: data/ads.json 'infeed' 자리 설정 그대로(다른 쪽과 같은 드래곤 배너, 📢 추천 업종만 '인력·비자 대행·통역'). 공개 여부·규칙은 승인함 #11. */
(function () {
  "use strict";
  if (!window.TNPages) return;
  var esc = TNPages.esc, region = "all", kind = "all";
  var REGS = [{ id: "all", t: "전체" }, { id: "pattaya", t: "파타야" }, { id: "sriracha", t: "시라차" }, { id: "bangkok", t: "방콕" }];
  var KINDS = [{ id: "all", e: "🧑‍💼", t: "전체" }, { id: "food", e: "🍜", t: "식당·서비스" }, { id: "office", e: "💼", t: "사무·통역" }, { id: "tour", e: "✈️", t: "여행·가이드" }];
  // 예시 공고 — 실제 가게·회사 아님. 값 칸은 비워 두고 '[사장님 입력]'(무엇을 적는 칸인지만 보여 줌)
  var JOBS = [
    { id: "ex1", region: "pattaya", kind: "food", title: "한식당 홀 직원", who: "(예시) 파타야 한식당 A", type: "정규직", ko: "한국어 필요", wp: "회사가 워크퍼밋 해 줌 [사장님 선택]" },
    { id: "ex2", region: "bangkok", kind: "office", title: "한국어·태국어 통역(사무실)", who: "(예시) 방콕 무역 회사 B", type: "정규직", ko: "한국어·태국어", wp: "[사장님 입력]" },
    { id: "ex3", region: "pattaya", kind: "tour", title: "골프 투어 가이드", who: "(예시) 파타야 여행사 C", type: "파트타임", ko: "한국어 필요", wp: "[사장님 입력]" },
    { id: "ex4", region: "sriracha", kind: "office", title: "공장 사무 보조(한국어)", who: "(예시) 시라차 제조 회사 D", type: "정규직", ko: "한국어 필요", wp: "[사장님 입력]" },
    { id: "ex5", region: "bangkok", kind: "food", title: "한인 마트 매장 직원", who: "(예시) 방콕 한인 마트 E", type: "파트타임", ko: "한국어 조금", wp: "[사장님 입력]" },
    { id: "ex6", region: "pattaya", kind: "office", title: "콘도 임대 상담(한국 손님)", who: "(예시) 파타야 부동산 F", type: "정규직", ko: "한국어 필요", wp: "[사장님 입력]" }
  ];
  function adBox() {
    // 기사 사이 광고(infeed) 자리 설정을 그대로 씀(같은 드래곤 배너·같은 크기) — 추천 업종 꼬리표만 이 쪽에 맞게
    var A = window.TN_ADS, sl = A && A.enabled !== false && A.slots && A.slots.filter(function (x) { return x.id === "infeed" && x.enabled !== false && x.items && x.items.length; })[0];
    var it = sl && Object.assign({}, sl.items[0], { target: "인력·비자 대행·통역" });
    var h = it && window.DragonAd && window.DragonAd.slotHTML && window.DragonAd.slotHTML(it);
    return h ? '<div class="ad-slot jb-ad" data-unit="' + esc(sl.unit || "300x250") + '">' + h + (window.TNAdRep ? TNAdRep("jobs", it) : "") + "</div>" : "";
  }
  function card(j) {
    var r = REGS.filter(function (x) { return x.id === j.region; })[0], k = KINDS.filter(function (x) { return x.id === j.kind; })[0];
    var na = function (t) { return '<dd class="pc__na">' + esc(t) + "</dd>"; };
    return '<article class="pc jb" data-jb="' + j.id + '"><div class="pc__top"><span class="pc__cat">' + k.e + " " + esc(k.t) + '</span><span class="jb-ex">예시</span></div>' +
      '<h3 class="pc__name">' + esc(j.title) + '</h3><p class="pc__kind">' + esc(j.who) + " · 📍 " + esc(r.t) + "</p>" +
      '<dl class="pc__info">' +
        "<div><dt>🧾 형태</dt><dd>" + esc(j.type) + "</dd></div>" +
        "<div><dt>💰 급여</dt>" + na("[사장님 입력] — 바트 + 원으로 같이 보여 줄 칸") + "</div>" +
        "<div><dt>🕒 근무 시간</dt>" + na("[사장님 입력]") + "</div>" +
        "<div><dt>🗣️ 언어</dt><dd>" + esc(j.ko) + "</dd></div>" +
        "<div><dt>📄 워크퍼밋</dt>" + na(j.wp) + "</div>" +
        "<div><dt>✅ 올린 날</dt>" + na("[올린 날 자동] · 30일 지나면 자동 내림") + "</div>" +
      "</dl>" +
      '<div class="pc__btns"><span class="pc__btn pc__btn--off" aria-disabled="true">📞 예시라 연락 안 됨</span><span class="pc__btn pc__btn--off" aria-disabled="true">✋ 신고(준비 중)</span></div></article>';
  }
  TNPages.register("jobs", {
    title: "🧑‍💼 구인판(시안 · 예시)",
    render: function () {
      var list = JOBS.filter(function (j) { return (region === "all" || j.region === region) && (kind === "all" || j.kind === kind); });
      var cards = list.map(card), out = [];
      cards.forEach(function (c, i) { out.push(c); if (i === 2) out.push(adBox()); });
      if (cards.length && cards.length <= 2) out.push(adBox());
      return '<p class="jb-warn" role="note"><b>⚠️ 시안이에요 — 아래 공고는 모두 예시(가짜)예요.</b> 진짜 회사·가게가 아니고, 올리기·지원·연락 기능도 없어요. 화면 모양을 보려고 만든 쪽이에요.</p>' +
        '<p class="pc-intro">태국에 사는 한국 분들을 위한 <b>한인 구인판</b> 모양 시안이에요. 급여·근무 시간처럼 공고마다 다른 값은 <b>[사장님 입력]</b> 칸으로만 보여 줘요(지어내지 않음).</p>' +
        '<div class="pc-filter pc-region" role="group" aria-label="지역">' + REGS.slice(1).map(function (x) {
          return '<button type="button" class="pc-f" data-jb-region="' + x.id + '" aria-pressed="' + (region === x.id) + '">📍 ' + esc(x.t) + "</button>"; }).join("") + "</div>" +
        '<div class="pc-filter jb-kinds" role="group" aria-label="일 종류">' + KINDS.slice(1).map(function (x) {
          return '<button type="button" class="pc-f" data-jb-kind="' + x.id + '" aria-pressed="' + (kind === x.id) + '"><span aria-hidden="true">' + x.e + "</span> " + esc(x.t) + "</button>"; }).join("") + "</div>" +
        '<span class="pc-openonly jb-post" aria-disabled="true">➕ 공고 올리기 — 준비 중(승인함 #11)</span>' +
        (out.length ? '<div class="pc-list">' + out.join("") + "</div>" : '<div class="empty pc-empty"><p class="pc-empty__e" aria-hidden="true">🔍</p><p><b>이 조건의 예시 공고가 없어요</b></p><p>위 버튼을 한 번 더 누르면 조건이 풀려요.</p></div>') +
        '<p class="pc-src">📄 태국에서 외국인이 일하려면 보통 워크퍼밋이 필요해요 — 자세한 건 <a href="https://www.doe.go.th/" target="_blank" rel="noopener">태국 노동부 고용국</a> 안내를 확인하세요. 이 시안은 공고를 받거나 보여 주지 않아요.</p>';
    },
    click: function (e, t) {
      var el;
      if ((el = t.closest("[data-jb-region]"))) { var r = el.getAttribute("data-jb-region"); region = region === r ? "all" : r; TNPages.refresh(); return true; }
      if ((el = t.closest("[data-jb-kind]"))) { var k = el.getAttribute("data-jb-kind"); kind = kind === k ? "all" : k; TNPages.refresh(); return true; }
      return false;
    }
  });
})();
