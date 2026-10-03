/* 태국 뉴스 한눈에 — 주제(11개)·페르소나·옛 판 카테고리 매핑
 * 새 판(2026-10-03~): 기사마다 topic(주 주제 id) + secondary(보조 주제 id 목록) + tags(키워드)
 * 옛 판(category 필드만 있음): legacyTopics()가 category·region·제목·태그로 주제를 추정(데이터 파일은 그대로 둠)
 * 2026-10-03 운영자 결정: 파타야(pattaya)·시라차(sriracha) → '동부(촌부리·라용)'(east) 하나로 통합,
 *   북부(north)·남부(south) 추가. 옛 id 는 ALIAS 로 화면에서 east 로 읽는다(옛 판 데이터·캐시·저장된 설정 모두).
 */
(function (root) {
  "use strict";
  var TOPICS = [
    { id: "east",     label: "동부(촌부리·라용)", emoji: "🏖️", color: "#0b7285", hint: "파타야·좀티엔·싸따힙·시라차·램차방·방센·라용" },
    { id: "bangkok",  label: "방콕",             emoji: "🏙️", color: "#495057", hint: "방콕 도심·수완나품" },
    { id: "north",    label: "북부",             emoji: "⛰️", color: "#5c940d", hint: "치앙마이·치앙라이·람빵·난·핏사눌록" },
    { id: "south",    label: "남부",             emoji: "🏝️", color: "#1971c2", hint: "푸껫·끄라비·사무이·핫야이·남부 국경" },
    { id: "poleco",   label: "정치·경제",        emoji: "🏛️", color: "#3b5bdb", hint: "정부·국회·기업·환율" },
    { id: "society",  label: "사회·사건사고",    emoji: "🚨", color: "#d9480f", hint: "사건·사고·재난·복지" },
    { id: "visa",     label: "외국인·비자",      emoji: "🛂", color: "#6741d9", hint: "비자·이민국·워크퍼밋·교민" },
    { id: "life",     label: "생활·물가·부동산", emoji: "🛒", color: "#0c8f6a", hint: "물가·유가·콘도·생활 정보" },
    { id: "travel",   label: "여행·맛집",        emoji: "🍜", color: "#e67700", hint: "관광·호텔·항공·맛집" },
    { id: "ent",      label: "연예·스포츠·SNS",  emoji: "💬", color: "#c2255c", hint: "드라마·스포츠·바이럴" },
    { id: "weather",  label: "날씨·교통",        emoji: "🌦️", color: "#0ca678", hint: "비·홍수·도로·공항" }
  ];
  var BY_ID = {};
  TOPICS.forEach(function (t) { BY_ID[t.id] = t; });
  /* 옛 주제 id → 새 id (2026-10-03 통합). 옛 판 데이터·서비스 워커 캐시·저장된 내 주제(prefs.js 가 같은 표로 옮김)용 */
  var ALIAS = { pattaya: "east", sriracha: "east" };
  function canon(id) { return ALIAS[id] || id; }

  /* 페르소나별 기본 주제(5개). 사용자가 끄거나 3개까지 더 고를 수 있음(최대 8개) */
  var PERSONAS = [
    { id: "pattaya",  emoji: "🏖️", label: "파타야 거주자", desc: "좀티엔·방라뭉·싸따힙 포함", topics: ["east", "visa", "life", "weather", "society"] },
    { id: "sriracha", emoji: "⚓",  label: "시라차 거주자", desc: "램차방·촌부리 시내 포함",   topics: ["east", "visa", "life", "weather", "society"] },
    { id: "bangkok",  emoji: "🏙️", label: "방콕 거주자",   desc: "방콕·근교",                 topics: ["bangkok", "visa", "life", "weather", "society"] },
    { id: "traveler", emoji: "🧳", label: "여행객",        desc: "단기 방문·여행 계획 중",     topics: ["travel", "weather", "visa", "east", "bangkok"] },
    { id: "business", emoji: "💼", label: "사업·투자",     desc: "주재원·자영업·투자",         topics: ["poleco", "life", "visa", "bangkok", "east"] }
  ];
  var MAX_TOPICS = 8;

  /* ---------- 옛 판(category) → 새 주제 매핑 ---------- */
  var LEGACY_PRIMARY = { politics: "poleco", economy: "poleco", society: "society", visa: "visa", sns: "ent" };
  // 지역 키워드(한국어 표기 흔들림 포함 + 태국어)
  var RX_PATTAYA = /파타야|좀티엔|쫌티엔|방라뭉|방람웅|싸따힙|사따힙|사타힙|나끌루아|농쁘루|농쁘르|프라탐낙|꼬란|후아이야이|따키안띠아|พัทยา|จอมเทียน|บางละมุง|สัตหีบ|นาเกลือ/;
  var RX_SRIRACHA = /시라차|스리라차|씨라차|램차방|램차방|아마타|촌부리|판통|반븡|파난니콤|파나스니콤|ศรีราชา|แหลมฉบัง|ชลบุรี/;
  var RX_RAYONG = /라용|맙따풋|마프타풋|꼬사멧|사멧|끄랭|ระยอง|มาบตาพุด|เสม็ด/;
  var RX_NORTH = /치앙마이|치앙라이|람빵|람푼|매홍손|핏사눌록|수코타이|매솟|매사이|파야오|난 주|เชียงใหม่|เชียงราย|ลำปาง|ลำพูน|แม่ฮ่องสอน|พิษณุโลก|สุโขทัย|แม่สอด|แม่สาย|พะเยา/;
  var RX_SOUTH = /푸껫|푸켓|빠똥|끄라비|피피|팡아|카오락|수랏타니|사무이|팡안|꼬따오|송클라|핫야이|나콘시탐마랏|뜨랑|사뚠|춤폰|라농|빳따니|얄라|나라티왓|남부 국경|ภูเก็ต|กระบี่|พังงา|สุราษฎร์|สมุย|พะงัน|สงขลา|หาดใหญ่|นครศรีธรรมราช|ปัตตานี|ยะลา|นราธิวาส/;
  var RX_BANGKOK = /방콕|차차트|찻찻|수완나품|돈므앙|방까삐|랏끄라방|민부리|께하롬끌라오|븡끔|랏차다|촉차이|กรุงเทพ|กทม/;
  // 날씨·교통: 예보·비·댐·도로·항공 등 직접 관련 / 홍수·침수는 지역(동부·방콕) 기사일 때만
  var RX_WEATHER = /폭우|날씨|기상청|뇌우|우박|비구름|만조|댐|방류|수위|재난문자|도로|고속도로|교통|통행|결항|GPS|M7|M9/;
  var RX_FLOOD = /홍수|침수|배수/;
  var RX_LIFE = /물가|금값|유가|휘발유|경유|달걀|채소|생활비|복지|보험|자동차세|면허|주차|부동산|콘도|임대|월세|할인|재난보험|구호금|탕랏|타이춥타이|타이돕타이/;
  var RX_TRAVEL = /관광|여행|호텔|숙박|맛집|골든위크|해변|공원|축제|바다|타이항공|항공편|결항/;
  var RX_SOCIETY = /사건|사고|사망|체포|기소|흉기|추락|화재|감전|피살|실종|구조|마약|야바|부패|사기/;
  var RX_VISA = /외국인|한국인|비자|이민|이민국|오버스테이|워크퍼밋|노미니|대사관|관광객|영국인|독일인|러시아|중국인|인도계/;

  function textOf(s) { return [s.headline, s.region || "", (s.tags || []).join(" ")].join(" "); }

  function legacyTopics(s) {
    var txt = textOf(s), cat = s.category, primary, sec = [];
    var reg = s.region || "";
    function add(t) { if (t && t !== primary && sec.indexOf(t) < 0) sec.push(t); }
    if (cat === "local") {
      // 지역 기사(옛 판은 파타야·촌부리 중심): 촌부리·라용 = 동부, 그 밖에 북부·남부 지명이 분명하면 그쪽, 나머지는 동부
      var where = reg + " " + s.headline;
      if (RX_PATTAYA.test(where) || RX_SRIRACHA.test(where) || RX_RAYONG.test(where)) primary = "east";
      else if (RX_NORTH.test(where)) primary = "north";
      else if (RX_SOUTH.test(where)) primary = "south";
      else primary = "east";
    } else {
      primary = LEGACY_PRIMARY[cat] || "society";
      // 방콕 한정 사회 기사(방콕 태그 + 방콕 지명)는 방콕을 주 주제로
      if (cat === "society" && RX_BANGKOK.test(txt) && (s.tags || []).indexOf("방콕") >= 0) { primary = "bangkok"; add("society"); }
      // 날씨 예보 기사는 날씨·교통이 주 주제
      else if (cat === "society" && /기상청|날씨|우박/.test((s.tags || []).join(" ") + s.headline) && !/사망|사고/.test(s.headline)) { primary = "weather"; add("society"); }
      if (RX_PATTAYA.test(txt) || /시라차|스리라차|램차방|아마타/.test(txt) || RX_RAYONG.test(txt)) add("east");
      if (RX_NORTH.test(txt)) add("north");
      if (RX_SOUTH.test(txt)) add("south");
      if (RX_BANGKOK.test(txt)) add("bangkok");
    }
    if (RX_WEATHER.test(txt) || (RX_FLOOD.test(txt) && (cat === "local" || primary === "bangkok"))) add("weather");
    if (cat !== "sns" && RX_LIFE.test(txt)) add("life");
    if (cat !== "sns" && RX_TRAVEL.test(txt)) add("travel");
    if ((cat === "local" || cat === "visa") && RX_SOCIETY.test(txt)) add("society");
    if (cat === "local" && RX_VISA.test(txt)) add("visa");
    return { topic: primary, secondary: sec.slice(0, 3) };
  }

  /* 기사 → {topic, secondary[], all[]} (새 판은 데이터 그대로, 옛 판은 매핑) */
  function storyTopics(s) {
    if (s._topics) return s._topics;
    var r;
    var top = s.topic && canon(s.topic);
    if (top && BY_ID[top]) {
      var sec = [];
      (s.secondary || []).forEach(function (t) { t = canon(t); if (BY_ID[t] && t !== top && sec.indexOf(t) < 0) sec.push(t); });
      r = { topic: top, secondary: sec, legacy: false };
    } else {
      r = legacyTopics(s); r.legacy = true;
    }
    r.all = [r.topic].concat(r.secondary);
    // 렌더 중 캐시(데이터 원본에는 저장하지 않음: JSON 직렬화 대상 아님)
    try { Object.defineProperty(s, "_topics", { value: r, enumerable: false }); } catch (e) {}
    return r;
  }

  root.TNTopics = {
    TOPICS: TOPICS, BY_ID: BY_ID, PERSONAS: PERSONAS, MAX_TOPICS: MAX_TOPICS, ALIAS: ALIAS, canon: canon,
    get: function (id) { return BY_ID[canon(id)]; },
    storyTopics: storyTopics, legacyTopics: legacyTopics
  };
})(window);
