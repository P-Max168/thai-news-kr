# 태국 뉴스 한눈에

태국 현지 언론(가능하면 태국어 원문)을 자연스러운 한국어로 옮겨 요약한 정적 뉴스 포털입니다. 태국에 사는 한국인(파타야·시라차·방콕)과 여행객에게 공유하는 개인 프로젝트.

> **2026-10-03 개편(새 형식)**: 주제 10개 + 보조 주제 + 키워드 태그, 첫 방문 '어떤 분이세요?' 온보딩, 브리핑 글머리표 목록, 👍👎 취향 학습, PWA(홈 화면 앱·오프라인). **정기 실행은 아래 '기사 스키마'의 새 형식으로 판을 만든다**(템플릿: `tools/editions/_template.py`). 옛 판(10월 2일 저녁판까지)은 그대로 두고 화면에서 매핑해 렌더한다.

## 열어보기
- 그냥 `index.html`을 더블클릭하면 됩니다(file:// 지원, fetch를 쓰지 않음).
- 또는 `python3 -m http.server 8765` 실행 후 http://127.0.0.1:8765/ 접속.
- 기본 화면 = **가장 최신 판**(`data/index.json`의 첫 번째 = `latest`).
- `?date=2026-09-29-am`처럼 판 id로 지정. 예전 형식 `?date=2026-09-29`(날짜만)는 그날의 최신 판으로 연결됩니다.
- `#p1`처럼 기사 id로 바로 열기 가능(예: `?date=2026-09-29-am#l1`). `?tab=visa`처럼 주제 탭 지정 가능(`feed`=내 피드, `all`=전체 보기).
- 첫 방문: '어떤 분이세요?'(5개 페르소나) → 주제 5개 미리 선택 → 끄거나 3개까지 추가(최대 8개) → 저장. '건너뛰기'면 모든 주제. 나중에 헤더의 **🧩 내 주제**(또는 푸터 링크)에서 변경·'내 취향 초기화'. 설정은 브라우저 `localStorage`(`tnk.profile.v1`)에만 저장.
- 탭 = **⭐ 내 피드**(선택 주제 기사, 취향 순) + 선택한 주제들 + **전체 보기**. 주요 뉴스 3건은 내 피드·전체 보기에서 주제 선택과 관계없이 항상 보임.
- http(s)로 열면 PWA: 홈 화면에 추가(안드로이드: 안내 바의 '추가' 버튼 / iOS Safari: 공유 → 홈 화면에 추가), 한 번 열어 본 뒤엔 오프라인으로 최신 판 읽기. file:// 에서는 서비스 워커 없이 그냥 동작.
- 판이 2개 이상이면 헤더에 **날짜·판 선택 드롭다운**('9월 29일 아침판 (최신)', '9월 29일 새벽판' …)이 나타나고, 이전 판을 보는 중엔 상단에 "최신 판 보기" 안내가 뜹니다.

## 판(edition) 파일 이름 규칙 ★정기 실행은 반드시 이 규칙을 따를 것
| 실행 | 파일 id | 화면 라벨 | 수집 범위(대략) |
|---|---|---|---|
| 매일 07:08 (방콕) | `<YYYY-MM-DD>-am` | `M월 D일 아침판` | 전날 저녁판 이후 ~ 아침 |
| 매일 18:08 (방콕) | `<YYYY-MM-DD>-pm` | `M월 D일 저녁판` | 그날 아침판 이후 ~ 저녁 |
| (예외) 정기 외 임시판 | `<YYYY-MM-DD>-early` | `M월 D일 새벽판` | 현재 `2026-09-29-early`(01:10 작성) 한 건뿐 |

- 날짜 = 방콕 시간 기준 **실행한 날**. 예: 9월 30일 07:08 실행 → `2026-09-30-am`.
- **날짜만 있는 파일(`data/2026-09-29.json`)은 만들지 않습니다.** (예전 중복 파일은 `archive/legacy/`로 옮겨 둠)
- 같은 판을 다시 만들면 같은 id로 덮어씁니다. 다른 판(특히 이전 판)은 건드리지 않습니다.
- 정기 실행이 실패해 늦게 만들더라도 id는 원래 슬롯(-am / -pm)을 씁니다. (예: 2026-09-29 07:08 실행이 셸 장애로 저장 실패 → 07:55경 재작성했지만 `2026-09-29-am`)

## 구조
- `data/<id>.json` : 판 데이터(원본). `<id>` = `YYYY-MM-DD-am|pm|early`
- `data/<id>.js`   : 같은 데이터를 `window.NEWS_DATA["<id>"]`에 등록하는 JS(file:// 용)
- `data/index.json|js` : 판 목록. `{latest, editions:[{id,date,edition,label,generated,stories}], dates:[id…]}` (최신순). **직접 고치지 말고 스크립트로 재생성**
- `assets/app.js, style.css` : 렌더러/스타일(빌드 과정 없음)
- `assets/topics.js` : **주제 10개·페르소나 5개 정의 + 옛 판 category→주제 매핑**(데이터 파일은 고치지 않음). 주제 id 는 `tools/newslib.py` 의 `TOPICS` 와 같아야 함
- `assets/prefs.js` : 사용자 설정 저장소 `TNStore`(지금은 localStorage. 나중에 Firebase 어댑터를 `TNStore.attach()`로 연결)
- `assets/taste.js` : 👍👎 취향 학습·정렬 `TNTaste`(주제·지역·키워드 가중치)
- `manifest.json`, `sw.js`, `assets/icons/` : PWA(이름·아이콘·서비스 워커). 아이콘은 `python3 tools/make_icons.py` 로 다시 만들 수 있음(헤더 국기 로고 모양)
- `tools/stamp_assets.py` : assets 내용 해시로 `index.html` 의 `?v=` 와 `sw.js` 의 `VERSION` 갱신(서비스 워커 캐시 교체). **deploy.sh 가 자동 실행**
- `tools/test_pwa.py` : 서비스 워커·manifest·설치 가능·오프라인 읽기 점검(헤드리스 Chrome)
- `tools/editions/_template.py` : **새 형식 판 편집 템플릿**
- `tools/newslib.py`  : 판 저장(`write_edition`) + 검증 + index 재생성(`build_index`). 이름 규칙·라벨이 여기 정의돼 있음
- `tools/build_data.py` : 진입점. `python3 tools/build_data.py tools/editions/<id>.py` → json/js 저장 + index 갱신. 인자 없이 실행하면 index만 재생성
- `tools/editions/<id>.py` : 판별 편집 파일(기사 목록·브리핑·주요뉴스·트렌드)
- `tools/gnews.py` : Google News RSS 검색(태국어/`en:`영어, 기본 최근 8일)·실제 기사 URL 풀기(`--decode`). 결과는 `raw/<id>/` 에 저장
- `tools/fetch_trends.py` : trends24.in(태국) X 트렌드 수집 + 성인·선정적 태그 필터 → `raw/<id>/trends/trends.json`
- `tools/trend_blocklist.txt` : 성인·선정적 키워드 차단 목록(한 줄 하나, `re:`=정규식, `#`=주석). 트렌드 수집과 기사 검증(`newslib.validate`)이 같이 씀. **직접 고쳐서 늘리면 됨**
- `tools/screenshot.py` : Playwright 스크린샷 + 동작 점검(첫 방문 온보딩·페르소나·최대 8개·👍👎 재정렬·설정·옛 판 렌더·데스크톱). `FAIL:` 줄이 있으면 exit 1. 로컬 서버(`python3 -m http.server 8765`)를 먼저 띄울 것
- `raw/<id>/`         : 그 판을 만들 때 수집한 RSS·원문 텍스트(출처 확인용). `raw/` 바로 아래 파일들은 새벽판 수집분, `raw/morning/`은 저장에 실패한 07:08 실행이 남긴 RSS(미검증 참고용)
- `archive/legacy/`   : 더 이상 쓰지 않는 옛 파일(사이트에서 읽지 않음)

## 주제(10개) — 2026-10-03 아침판부터
| id | 이름 | 내용 |
|---|---|---|
| `pattaya` | 🏖️ 파타야 | 파타야·좀티엔·방라뭉·싸따힙·나끌루아·농쁘루 지역 소식 (라용 등 동부 해안도 가까우면 여기) |
| `sriracha` | ⚓ 시라차 | 시라차·램차방·촌부리 시내·아마타시티·반븡·판통 등 촌부리 북부 |
| `bangkok` | 🏙️ 방콕 | 방콕 도심·구청·수완나품/돈므앙 등 방콕 한정 소식 |
| `poleco` | 🏛️ 정치·경제 | 정부·국회·정당, 기업·산업·환율·예산 |
| `society` | 🚨 사회·사건사고 | 전국 사건·사고·재난·복지·보건 |
| `visa` | 🛂 외국인·비자 | **태국에 사는 외국인에게 필요한 소식**: 비자·이민 규정(TM30, 90일 신고, DTV/LTR/은퇴 비자, 오버스테이), 이민경찰 단속, 외국인 관련 법 집행·추방, 워크퍼밋, 해외소득 과세, 노미니 단속, 외국인 사건·사기, 한국 교민·주태국 한국대사관 공지 |
| `life` | 🛒 생활·물가·부동산 | 물가·유가·전기/수도 요금·장보기, 콘도·임대·부동산, 생활 행정(면허·세금·보험) |
| `travel` | 🍜 여행·맛집 | 관광·호텔·항공·축제·명소·맛집·관광객 대상 정보 |
| `ent` | 💬 연예·스포츠·SNS | 드라마·아이돌·스포츠·바이럴·SNS 화제 |
| `weather` | 🌦️ 날씨·교통 | 기상청 예보·비·홍수/침수(생활 영향)·도로·고속도로·대중교통·항공편 |

- 기사마다 **주 주제 1개(`topic`) + 보조 주제 0~3개(`secondary`)**. 예: 파타야 침수 = `pattaya` + `["weather"]`, 시라차 달걀값 = `life` + `["sriracha"]`, 방콕 침수 = `bangkok` + `["weather"]`, 파타야 외국인 사기 = `visa` + `["pattaya","society"]`. 주제 탭·내 피드에는 주/보조 어느 쪽이든 해당하면 나온다.
- 페르소나별 기본 주제(5개, `assets/topics.js` 의 `PERSONAS`):
  - 파타야 거주자: 파타야, 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고
  - 시라차 거주자: 시라차, 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고
  - 방콕 거주자: 방콕, 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고
  - 여행객: 여행·맛집, 날씨·교통, 외국인·비자, 파타야, 방콕
  - 사업·투자: 정치·경제, 생활·물가·부동산, 외국인·비자, 방콕, 시라차(EEC·램차방·아마타 산업단지)
- **옛 판 매핑**(10월 2일 저녁판까지, `category` 필드): `assets/topics.js` 의 `legacyTopics()`가 화면에서만 변환(데이터·기사 문장은 그대로). politics/economy → 정치·경제, society → 사회·사건사고(방콕 태그 기사는 방콕, 예보 기사는 날씨·교통), local → 지명으로 파타야/시라차(라용·동부는 파타야), sns → 연예·스포츠·SNS, visa → 외국인·비자. 보조 주제는 지명·키워드(홍수·도로·물가·관광 등)로 붙임. 옛 판 브리핑(문단)은 문장마다 글머리표로 나누고 키워드로 관련 기사·주제를 찾아 연결.
- 외국인·비자 카드와 판 생성 36시간 이전 기사에는 날짜 칩(📅 10월 2일(금))을 표시.

## 👍👎 취향 학습 · 사용자 설정
- 카드마다 `👍 관심 있음` / `👎 관심 없음`. 누르면 그 기사의 **주제(주 1.0, 보조 0.5)·지역·키워드 태그** 가중치를 ±1(같은 버튼 다시 = 취소). 저장: `localStorage['tnk.profile.v1'].taste`.
- 정렬 = 최신성(판 생성 시각 기준 12시간마다 -1, 최대 -6) + 학습 점수(±4 제한) + 직접 누른 표(👍 +1.5 / 👎 -4). **👎 기사는 아래로 내려가고 흐리게 보일 뿐 숨기지 않음.**
- 🧩 내 주제 → '내 취향 초기화'(가중치·표 삭제, 주제 선택은 유지), '모든 주제 보기', '처음 질문 다시 보기'.
- 저장소 인터페이스(`assets/prefs.js` `TNStore`): `get()`, `update(fn)`, `reset()`, `subscribe(fn)`, `attach(adapter)`. 어댑터 = `{name, read(): Promise<doc|null>, write(doc): Promise}`. 문서 하나(`{v, onboarded, persona, topics, taste:{w, votes}, ui, updatedAt}`)라 Firestore `users/{uid}` 문서에 그대로 저장 가능. `attach()`는 `updatedAt`이 더 최신인 쪽을 채택.
- **Google 로그인(다음 단계, 아직 없음)**: Firebase 프로젝트 생성 → 웹 앱 등록 → `firebaseConfig`(`apiKey, authDomain, projectId, appId`, 선택 `storageBucket, messagingSenderId`) 받기 → Authentication 에서 Google 제공업체 켜기 + 승인된 도메인에 `p-max168.github.io` 추가 → Firestore 생성(규칙: `users/{uid}` 는 본인만 읽기/쓰기) → `assets/firebase-sync.js`에서 로그인 후 `TNStore.attach({name:"firebase", read, write})`.

## 기사 스키마
### 새 형식(2026-10-03 아침판부터 — 정기 실행은 이것만)
기사: `id, topic(주제 id), secondary[보조 주제 id 0~3], tags[키워드 2~6개, 필수], headline, summary[문단], context(배경 설명), update(후속일 때만), source, url, title_th, published(ISO, +07:00), related[{source,title,url}], region(지역 기사: '파타야(좀티엔)' 등)`
- `id`는 주제 약어+번호 권장: `pt1`(파타야) `sr1`(시라차) `bk1`(방콕) `pe1`(정치·경제) `so1`(사회) `vi1`(외국인·비자) `lf1`(생활) `tr1`(여행) `en1`(연예·SNS) `wt1`(날씨·교통).
- `tags` = 인물·장소·기관·사건 키워드(‘#’ 없이). 👍👎 학습에 쓰이므로 **모든 기사에 반드시**(검증에서 2개 미만이면 멈춤).
- `category`는 쓰지 않는다(넣으면 옛 6종 값만 허용).

최상위: `id, date, edition(am|pm), edition_label, generated, updated(선택), coverage, previous, briefing, highlights[id 3개], stories[], trends{…}`
- **`briefing` = 5~6줄 목록** `[{topic, text, story_id}]` — 편집 파일에서는 `B("visa", "이민국 앱 **THIM** 정식 출시…", "vi2")`. `text`는 짧은 한 줄(120자 이하)에 **`**굵게**` 핵심어/숫자 1곳 이상**, `story_id`는 그 줄의 기사(화면에서 누르면 그 기사로 이동·펼침). 서로 다른 기사 5~6개, 주제가 고르게.
- 검증(`newslib.validate`)은 기사에 `topic`이 있거나 `briefing`이 목록이면 새 형식 규칙을 적용(주제 id, secondary, tags, 브리핑 줄 형식). 구성 점검은 경고만 출력: 기사 20~25건, 외국인·비자 2~4건, 파타야·시라차·방콕 각 1건 이상, 여행·맛집·생활·물가·부동산 1건 이상 — **실제 뉴스가 없으면 적게 싣고 절대 지어내지 않는다.**
- 저장된 판 점검: `python3 tools/newslib.py check data/<id>.json`

### 옛 형식(10월 2일 저녁판까지 — 고치지 않음)
기사: `id, category(politics|economy|society|local|visa|sns), headline, summary[문단], context(배경 설명), update(이전 판 이후 새로 나온 내용, 후속 기사일 때만), source, url, title_th, published(ISO, +07:00), related[{source,title,url}], tags[], region(지역 기사), highlight`

최상위: `id, date, edition(am|pm|early), edition_label, generated, updated(선택: 같은 판을 나중에 보강했을 때), coverage, previous(직전 판 id), briefing, highlights[id 3개], stories[], trends{items[], source, url, fetched, block, filtered, note}`
- `trends.items[]` (10월 2일 저녁판부터) = `{tag: 원문 태그, ko: 한국어 번역/음역, desc: 한 줄 설명(무슨 드라마·아이돌·행사인지, 왜 뜨는지), verified: false 이면 화면에 '확인 안 됨' 표시}`. 옛 판은 문자열 목록이며 그대로 렌더됨(원문만).
- `trends.fetched` = 수집 시각(+07:00), `block` = trends24 의 집계 블록 시각, `filtered` = 차단 목록으로 뺀 태그 수.
- 이미지·영상 필드(`image`, `media`, `video`, `embed` 등)는 금지(검증에서 멈춤). X 미디어·이미지는 절대 넣지 않고 텍스트만.
(※ `2026-09-29-early`는 옛 형식이라 `id/edition_label` 등이 없지만 index가 파일 이름으로 판을 알아내므로 그대로 동작)

## 정기 실행(07:08 / 18:08) 절차
1. 수집: 태국어 원문 우선(Thairath·Matichon·Khaosod·Prachachat RSS, PPTV·TOP NEWS·MGR·Thai Ch8·The Pattaya News, Google News RSS 태국어 검색: พัทยา ศรีราชา ชลบุรี สัตหีบ แหลมฉบัง บางละมุง จอมเทียน). 원문은 `raw/<id>/`에 저장.
   - **목표 구성(약 20~25건)**: 주제 10개를 고르게. 지역은 **파타야·시라차·방콕 각 1건 이상**(실제 소식이 없으면 적게), 외국인·비자 2~4건, 실제 뉴스가 있으면 **여행·맛집**·**생활·물가·부동산**도 몇 건. 정치·경제·사회·연예/스포츠/SNS·날씨/교통은 그날 중요도대로.
   - 지역 검색 추가: 시라차 `ศรีราชา` `แหลมฉบัง` `อมตะ ชลบุรี` `เมืองชลบุรี`, 방콕 `กทม.` `กรุงเทพ ชัชชาติ` `en:Bangkok`, 생활·물가 `ราคา ไข่` `ราคาน้ำมัน` `ค่าไฟ` `คอนโด` `en:Thailand condo prices`, 여행·맛집 `ท่องเที่ยว พัทยา` `ร้านอาหาร พัทยา` `en:Pattaya tourism` `en:Bangkok restaurant opening`, 날씨·교통 `กรมอุตุนิยมวิทยา` `ทางด่วน` `รถไฟฟ้า` (예: `python3 tools/gnews.py raw/<id>/local "ศรีราชา" "กทม." "en:Pattaya tourism"`).
   - Google News 날짜는 믿지 말 것: 며칠 전 기사가 새로 뜨는 경우가 많음 → 원문 페이지의 게재 시각을 확인(최대 48시간).
2. 직전 판(`data/index.json`의 `latest`)과 겹치는 기사는 빼고, 실제 후속 전개가 있을 때만 싣되 `update`에 무엇이 새로운지 적는다.
   - **외국인·비자(`visa`) 수집(매번)**: Google News RSS 태국어 검색 `ตม. ต่างชาติ`, `สตม.`, `วีซ่า`, `วีซ่า DTV`, `ตรวจคนเข้าเมือง พัทยา`, `ชาวต่างชาติ พัทยา`, `แรงงานต่างด้าว`, `ใบอนุญาตทำงาน ต่างชาติ`, `อยู่เกินกำหนด overstay`, `นอมินี ต่างชาติ`, `ชาวเกาหลี`, `เกาหลี พัทยา` + 영어 `Thailand immigration visa`, `Pattaya foreigner`, `90-day report OR TM30 OR DTV OR LTR`, `site:thethaiger.com visa OR immigration`, `site:thaiexaminer.com visa OR expat` (Bangkok Post·The Thaiger·The Pattaya News·Khaosod English·Thai Examiner). 검색은 `python3 tools/gnews.py raw/<id>/visa "สตม." "en:Pattaya foreigner" …`, URL 풀기는 `--decode`, 원문은 `raw/fetch.py` 방식으로 `raw/<id>/visa/art/`에 저장 + 주태국 한국대사관 공지 `https://overseas.mofa.go.kr/th-ko/brd/m_3133/list.do`(접속 안 되면 기사 배경 설명/보고에 '확인 못 함'이라고 적고 넘어감).
     - **목표 2~4건**(많으면 최대 8건). 48시간 안에 없으면 **최대 7일 전 기사까지 허용**(`newslib.validate`가 8일 이상은 막음). 각 기사 `published`에 원문 게재 시각.
     - **이전 판과 중복 금지**: `grep -l "<키워드>" data/*.json` 등으로 확인하고, 이미 실린 사건은 실제 새 전개가 있을 때만 `update`와 함께.
     - `context`(💡 배경 설명)에는 **태국 거주 외국인(파타야 4년차 한국인 기준) 실용 팁**을 짧게: 무엇을 확인·준비하면 되는지. 기사에 없는 숫자·규정을 단정하지 말 것(확실하지 않으면 '확인하자'로).
     - 한국인·한국 교민 관련(한국인 사건, 대사관 공지, 한-태 관계)은 우선 싣는다.
   - **성인·선정적 기사 금지**: 성범죄·성매매·음란물 위주 기사, 노출 사진이 중심인 기사는 싣지 않는다. 이미지·영상은 어떤 기사에도 넣지 않는다. 검증이 `tools/trend_blocklist.txt` 키워드를 제목·원문 제목·태그·요약에서 찾으면 build 가 멈춤 → 그 기사를 빼거나(원칙), 일반 기사가 우연히 걸린 경우에만 차단 목록 정규식을 다듬는다.
   - **X 트렌드(매번 새로)**: `python3 tools/fetch_trends.py <id> 15` → trends24.in 태국 최신 블록에서 상위 15개(차단 목록에 걸린 성인·선정적 태그는 자동으로 빼고 `필터됨` 개수 출력). 걸리지 않았어도 **보고 판단해 성적인 느낌의 정체불명 태그는 직접 뺀다**(뺀 수는 `filtered`에 더함).
     - 남은 태그마다 웹 검색(태그 그대로 + 'series/EP', 배우 이름, 'Paris Fashion Week' 등)으로 무엇인지 확인 → `T(tag, ko, desc)`로 적는다: `ko`=한국어 번역·음역(예: `#PlsLoveรักได้ไหมEP4` → '플리즈 러브(사랑해도 될까) 4화'), `desc`=어떤 드라마·아이돌·행사인지, 왜 뜨는지 한 줄.
     - **확인이 안 되면 추측하지 말고** `T(tag, ko, "…찾지 못함", False)` → 화면에 '확인 안 됨' 표시.
     - `trends.fetched`·`block`·`filtered`는 `raw/<id>/trends/trends.json` 값 그대로.
3. `tools/editions/<id>.py` 작성: **`cp tools/editions/_template.py tools/editions/<id>.py`** 후 `id/date/edition/generated/previous/briefing/highlights/stories/trends` 를 실제 내용으로 교체(새 형식: 기사마다 `topic` + `secondary` + `tags`, 브리핑은 `B(topic, "**굵게** 한 줄", story_id)` 5~6줄). 트렌드 `T(...)` 형식·외국인·비자 기사 쓰는 법은 `tools/editions/2026-10-02-pm.py` 참고(이 파일은 옛 형식 `category`이므로 기사 형식은 따라 하지 말 것). 뉴스·인용·숫자·URL은 절대 지어내지 않는다.
   - 주제 고르기: 지역 소식은 지역(`pattaya`/`sriracha`/`bangkok`)을 주 주제로, 성격(날씨·교통·생활·사건 등)을 보조로. 지역과 무관한 전국 소식은 성격을 주 주제로. 외국인·비자 소식은 `visa` 주 주제 + 지역 보조.
4. `python3 tools/build_data.py tools/editions/<id>.py` (검증 실패 시 예외로 멈춤. `점검(경고):` 줄은 구성 안내 — 실제 뉴스가 있는데 빠진 주제면 보강)
5. `python3 -m http.server 8765 &` → `python3 tools/screenshot.py` (`ALL OK` 확인) → `screenshots/`의 이미지를 직접 보고 문제 수정. 특히 `mobile-390-feed.png`(브리핑 5~6줄·굵게·주제 칩), `mobile-390-tab-visa.png`(외국인·비자 탭), `mobile-390-trends.png`(모바일 트렌드: 내 피드에선 주요 뉴스 바로 아래, 처음 5개 + '모두 보기'), `desktop-1280-top.png`. 앱 코드(assets·sw.js)를 고쳤으면 `python3 tools/test_pwa.py` 도.
6. **배포(필수)**: `bash tools/deploy.sh` — 아래 'Deploy' 참고. 07:08·18:08 정기 실행은 판을 만든 뒤 **매번** 실행할 것.

## Deploy (GitHub Pages)
- 저장소: https://github.com/P-Max168/thai-news-kr (공개 — 무료 Pages 조건)
- 라이브: https://p-max168.github.io/thai-news-kr/ (휴대폰에서 이 주소로 열기)
- Pages 설정: `main` 브랜치 루트(`/`). `.nojekyll` 로 Jekyll 처리 끔.
- **매 정기 실행(07:08 / 18:08 방콕)은 판을 만든 뒤(위 4~5단계) 반드시 `bash tools/deploy.sh` 를 실행한다.**
  - 먼저 `tools/stamp_assets.py` 로 앱 셸 버전 갱신(assets 가 바뀐 경우만 index.html·sw.js 수정)
  - 사이트 파일(index.html, manifest.json, sw.js, assets/, data/, tools/, README.md 등)의 새 파일·변경분을 `edition <id>` 메시지로 커밋 → `main` 에 push
  - force-push 금지(스크립트도 하지 않음). push 가 거부되면 `git pull --rebase` 후 일반 push
  - 라이브 `data/index.js` 에 최신 판 id 가 반영되고 **라이브 `data/<최신 판>.js`·`assets/app.js`·`sw.js` 내용이 로컬과 같아질 때까지** 대기(같은 판을 보강해 다시 올린 경우도 잡음, 최대 15분, `DEPLOY_TIMEOUT`) → `tools/verify_live.py` 로 390px 모바일 화면을 헤드리스 브라우저로 열어 첫 방문 온보딩('파타야 거주자' 선택)·최신 판·내 피드·브리핑·👍👎·오류·외국인·비자 탭 카드 수·모바일 트렌드 위치·서비스 워커·manifest 확인, `screenshots/live-mobile-390.png`·`-onboarding.png`·`-visa.png` 저장
  - 실패하면 0이 아닌 종료 코드로 끝남 → 원인 확인 후 다시 실행
- **올리지 않는 것**(`.gitignore`): `raw/`(제3자 기사 원문 — 저작권), `archive/`, `screenshots/`, 캐시(`__pycache__` 등), 비밀 파일(`.env`, `*.key`, `*.pem`)
- 푸터 고지: '태국 언론 보도를 한국어로 요약·번역한 개인 프로젝트입니다. 원문 링크를 확인하세요.'
- 검색 노출 방지(공유하더라도 당분간 유지): `index.html` 에 `<meta name="robots" content="noindex, nofollow">`, `robots.txt` 전부 차단.
  (프로젝트 Pages 라 `robots.txt` 는 도메인 루트가 아니어서 크롤러가 읽지 않을 수 있음 → 실제 효력은 meta 태그. 공개 저장소이므로 주소를 아는 사람은 누구나 볼 수 있음)

## 번역 규칙
반드시 `tools/TRANSLATION_RULES.md`를 읽고 모든 기사·제목·트렌드 번역에 적용할 것.
