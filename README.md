# 태국 뉴스 한눈에

태국 현지 언론(가능하면 태국어 원문)을 자연스러운 한국어로 옮겨 요약한 정적 뉴스 포털입니다. 태국에 사는 한국인(파타야·시라차·방콕)과 여행객에게 공유하는 개인 프로젝트.

> **2026-10-03 개편(새 형식)**: 주제 10개 + 보조 주제 + 키워드 태그, 첫 방문 '어떤 분이세요?' 온보딩, 브리핑 글머리표 목록, 👍👎 취향 학습, PWA(홈 화면 앱·오프라인). **정기 실행은 아래 '기사 스키마'의 새 형식으로 판을 만든다**(템플릿: `tools/editions/_template.py`). 옛 판(10월 2일 저녁판까지)은 그대로 두고 화면에서 매핑해 렌더한다.
> **2026-10-03 X 트렌드 종료**: X 트렌드 상자·메뉴/앵커·렌더링·공유 카드 출력을 모두 제거했다. 새 판은 트렌드를 수집하거나 `trends`를 만들지 않는다. 옛 판의 `trends` 필드는 호환을 위해 데이터에 남아도 검증·화면·공유 키트에서 무시한다. 전용 수집기 `tools/fetch_trends.py`는 비활성화했고 기존 `raw/` 자료는 보존한다.

> **2026-10-03 새벽 추가**: ☰ 왼쪽 서랍 메뉴(주제 탭 줄 대신 — 탭 줄 자리는 일부러 비워 둠), 선택 기능 **Google 로그인**(설정·취향 동기화), **댓글**(Firestore), 💬 오늘의 질문(정적, 운영자 승인 후), 🇰🇷 오늘의 한국 주요 뉴스(`korea_top`), 광고 자리 목업(`data/ads.json`), 홈 화면 추가 안내 개선, 취향 버튼 문구('이런 소식 더 볼래요?' 🙌 더 보여줘 / 🙅 덜 보여줘). **로그인은 선택**: 안 해도(또는 Firebase 를 못 불러와도) 모든 기능이 예전처럼 동작.

> **2026-10-03 아침 추가**: 🇰🇷 한국 주요 뉴스가 **판과 따로 2시간마다(하루 12번) 자동 갱신**된다 — GitHub Actions `.github/workflows/korea.yml` 이 `tools/fetch_korea.py --standalone` 으로 `data/korea.json`(+`data/korea.js`)을 만들어 커밋. 화면은 **순위 TOP 10: 3건 → '펼치기' 5건 → 10건 → '접기'**(같은 날 헤더 개편 때 4+6 에서 바꿈, 5위·6위 사이 작은 광고 `korea-mid`), 제목 옆 '업데이트 HH:MM'(방콕).. 아래 '🇰🇷 한국 주요 뉴스 자동 갱신' 참고.

> **2026-10-03 헤더 개편**: 첫 줄 = **🇹🇭❤️🇰🇷 태국 뉴스 한눈에**(국기·하트는 인라인 SVG — 윈도우 PC 에서도 보임), 둘째 줄 = **☰ 메뉴(왼쪽, 큰 버튼) + 두 줄짜리 빠른 정보 상자 3개**(환율 원·달러 / 날씨·PM2.5 / 금·휘발유(95)), 그 아래 빈 보조 줄은 그대로(→ 같은 날 **📍 내 주변** 줄로 채움). 아래 '헤더(국기·☰·빠른 정보 칩)' 참고.

> **2026-10-03 기능 추가(운영자 승인)**: 기사마다 **한인 영향도 칩**(`impact`, 필터 칩 + 외국인·비자 기사는 피드 맨 위 📌 비자 소식 고정), **🙋 그래서 나는?**(`for_me`), **📰 N개 매체 보도**(`also`), **🗓️ 이슈 타임라인**(`issue` + 등록부 `tools/issues.json` → `data/issues.json`), **💡 추천 댓글 칩**(`quick_replies`, 눌러서 채우기만 — 등록은 사용자가 직접) + 댓글 **↳ 답글**. **정기 실행은 2026-10-03 저녁판(18:08)부터 3번(편집 파일) 단계에서 다섯 필드를 매번 채운다** — 아래 '판마다 채울 필드(2026-10-03 추가)' 참고(안 채우면 build 가 멈춤).

> **2026-10-03 주제 개편(운영자 결정) ★2026-10-03 저녁판(18:08)부터 적용**: **파타야·시라차 주제를 하나로 합쳐 `east` = '🏖️ 동부(촌부리·라용)'**(촌부리 도 전체 + 라용 도), **⛰️ 북부(`north`)·🏝️ 남부(`south`) 주제 추가** → 주제 **11개**(지역 순서: 동부(촌부리·라용) → 방콕 → 북부 → 남부). 옛 id `pattaya`·`sriracha` 는 2026-10-03 저녁판부터 **검증에서 막힌다**(쓰면 build 가 멈춤) — 지역 기사는 `east`/`bangkok`/`north`/`south`. 페르소나 이름(파타야/시라차/방콕 거주자 등)은 그대로, 기본 주제만 동부로. 이용자 기기에 저장된 옛 주제·취향은 화면이 조용히 옮긴다(아래 '주제'). 북부·남부·방콕 수집 소스도 크게 늘림(아래 '수집 소스 목록'). **📍 내 주변 지역 버튼·날씨 칩 지역(파타야/시라차/방콕)은 '위치'라 그대로.**

## 열어보기
- 그냥 `index.html`을 더블클릭하면 됩니다(file:// 지원, fetch를 쓰지 않음).
- 또는 `python3 -m http.server 8765` 실행 후 http://127.0.0.1:8765/ 접속.
- 기본 화면 = **가장 최신 판**(`data/index.json`의 첫 번째 = `latest`).
- `?date=2026-09-29-am`처럼 판 id로 지정. 예전 형식 `?date=2026-09-29`(날짜만)는 그날의 최신 판으로 연결됩니다.
- `#p1`처럼 기사 id로 바로 열기 가능(예: `?date=2026-09-29-am#l1`). `?tab=visa`처럼 주제 탭 지정 가능(`feed`=내 피드, `all`=전체 보기, 옛 주소 `?tab=pattaya`·`?tab=sriracha` 는 동부로).
- 첫 방문: '어떤 분이세요?'(5개 페르소나) → 주제 5개 미리 선택 → 끄거나 3개까지 추가(최대 8개) → 저장. '건너뛰기'면 모든 주제. 나중에 헤더의 **🧩 내 주제**(또는 푸터 링크)에서 변경·'내 취향 초기화'. 설정은 브라우저 `localStorage`(`tnk.profile.v1`)에만 저장.
- **☰ 메뉴(왼쪽 서랍, 헤더 둘째 줄 왼쪽 버튼)** = **⭐ 내 피드**(선택 주제 기사, 취향 순) + 🧩 내 주제 설정 + 선택한 주제들 + **전체 보기** + 다른 주제 + 계정(로그인) + 작은 광고 자리. 바깥 누르기·왼쪽으로 밀기·✕·Esc 로 닫힘(포커스 가둠). 헤더 아래 예전 탭 줄 자리는 **📍 내 주변** 줄(아래 '헤더' 참고). 주요 뉴스 3건은 내 피드·전체 보기에서 주제 선택과 관계없이 항상 보임.
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
- `data/korea.json` / `data/korea.js` : 🇰🇷 한국 주요 뉴스 10건 `{updated_at(+07:00), items:[{title, source, time, url}]}` / `window.KOREA_NEWS = …`(file:// 용). **GitHub Actions 전용 — 손으로 고치거나 deploy.sh 로 올리지 않음**
- `.github/workflows/korea.yml` : 한국 주요 뉴스 + 헤더 시세 칩 데이터 2시간마다 갱신 워크플로(아래 '🇰🇷 한국 주요 뉴스 자동 갱신')
- `data/ticker.json` / `data/ticker.js` : 헤더 빠른 정보 칩 데이터 `{updated_at, fx, gold, fuel, wx, aq}` / `window.TN_TICKER = …`(file:// 용). `tools/fetch_ticker.py` 가 만듦. **GitHub Actions 전용 — 손으로 고치거나 deploy.sh 로 올리지 않음**
- `assets/nearby.js` · `assets/nearby.css` : 헤더 셋째 줄 **📍 내 주변**(카테고리 버튼 4개 + `#nearby/<id>` 화면, 설정 = `NEARBY` 객체 — 아래 '헤더')
- `assets/ticker.js` : 헤더 둘째 줄 빠른 정보 상자 3개(환율 원·달러 / 날씨·PM2.5 / 금·휘발유95) 렌더 + 출처 작은 창(아래 '헤더')
- `data/index.json|js` : 판 목록. `{latest, editions:[{id,date,edition,label,generated,stories}], dates:[id…]}` (최신순). **직접 고치지 말고 스크립트로 재생성**
- `assets/app.js, style.css` : 렌더러/스타일(빌드 과정 없음)
- `assets/topics.js` : **주제 10개·페르소나 5개 정의 + 옛 판 category→주제 매핑**(데이터 파일은 고치지 않음). 주제 id 는 `tools/newslib.py` 의 `TOPICS` 와 같아야 함
- `assets/prefs.js` : 사용자 설정 저장소 `TNStore`(지금은 localStorage. 나중에 Firebase 어댑터를 `TNStore.attach()`로 연결)
- `assets/taste.js` : 👍👎 취향 학습·정렬 `TNTaste`(주제·지역·키워드 가중치) + 로그인 때 합치기 `mergeDocs`
- `assets/social.js` : 선택 기능 UI — 헤더/서랍의 '구글로 로그인'·내 계정 메뉴(사진만, UID 표시)·댓글·닉네임. 필요할 때만 `assets/fb.js` 를 import()
- `assets/fb.js` : Firebase(ES 모듈, gstatic CDN v12.4.0: app·auth·**firestore-lite**) — 로그인·`users/{uid}` 동기화·`profiles`·`comments`. 웹 설정(firebaseConfig)이 들어 있음(웹 API 키는 공개용)
- `firestore.rules` : Firestore 보안 규칙(콘솔에 붙여 넣어 게시 — 아래 'Google 로그인·Firestore')
- `data/ads.json` → `data/ads.js` : 광고 자리 설정(목업). `build_index`(판 저장·`python3 tools/newslib.py`)가 ads.js 를 다시 만듦
- `tools/fetch_korea.py` : 🇰🇷 한국 주요 뉴스 — `--standalone` = 독립 파일 `data/korea.json|js` 생성(Actions 가 2시간마다), `<판 id>` = 판 `korea_top` 후보 수집(Google News KR) / `tools/discussion.py` : 💬 오늘의 질문 초안·적용 / `tools/strip_trend_cards.py` : 옛 판의 trends24 기사 카드 정리(역사 자료용)
- `drafts/` : 운영자 승인 전 초안(올리지 않음, .gitignore)
- `manifest.json`, `sw.js`, `assets/icons/` : PWA(이름·아이콘·서비스 워커). 아이콘은 `python3 tools/make_icons.py` 로 다시 만들 수 있음(헤더 국기 로고 모양)
- `tools/fetch_ticker.py` : 시세 칩 데이터 수집(환율 open.er-api.com → 실패 시 frankfurter, 금시세 goldtraders.or.th, 휘발유(95) 방짝, 날씨·PM2.5 Open-Meteo 대체값) — Actions 가 2시간마다
- `tools/stamp_assets.py` : assets 내용 해시로 `index.html` 의 `?v=` 와 `sw.js` 의 `VERSION` 갱신(서비스 워커 캐시 교체). **deploy.sh 가 자동 실행**
- `tools/test_pwa.py` : 서비스 워커·manifest·설치 가능·오프라인 읽기 점검(헤드리스 Chrome)
- `tools/editions/_template.py` : **새 형식 판 편집 템플릿**
- `tools/newslib.py`  : 판 저장(`write_edition`) + 검증 + index 재생성(`build_index`). 이름 규칙·라벨이 여기 정의돼 있음
- `tools/build_data.py` : 진입점. `python3 tools/build_data.py tools/editions/<id>.py` → json/js 저장 + index 갱신. 인자 없이 실행하면 index만 재생성
- `tools/editions/<id>.py` : 판별 편집 파일(기사 목록·브리핑·주요뉴스)
- `tools/gnews.py` : Google News RSS 검색(태국어/`en:`영어, 기본 최근 8일)·실제 기사 URL 풀기(`--decode`). 결과는 `raw/<id>/` 에 저장
- `tools/fetch_trends.py` : **사용 중지**된 옛 X 트렌드 수집기(기존 원본 보존용; 새 판에서 실행하지 않음)
- `tools/trend_blocklist.txt` : 기사 제목·요약의 성인·선정적 키워드 차단 목록(한 줄 하나, `re:`=정규식, `#`=주석). X 트렌드 수집은 중단됐고 기사 검증에만 씀. **직접 고쳐서 늘리면 됨**
- `tools/screenshot.py` : Playwright 스크린샷 + 동작 점검(첫 방문 온보딩·페르소나·최대 8개·👍👎 재정렬·설정·옛 판 렌더·데스크톱). `FAIL:` 줄이 있으면 exit 1. 로컬 서버(`python3 -m http.server 8765`)를 먼저 띄울 것
- `raw/<id>/`         : 그 판을 만들 때 수집한 RSS·원문 텍스트(출처 확인용). `raw/` 바로 아래 파일들은 새벽판 수집분, `raw/morning/`은 저장에 실패한 07:08 실행이 남긴 RSS(미검증 참고용)
- `archive/legacy/`   : 더 이상 쓰지 않는 옛 파일(사이트에서 읽지 않음)

## 헤더(국기·☰·빠른 정보 칩) — 2026-10-03 운영자 요청 ★판을 새로 만들어도 유지
- **헤더는 판 데이터와 무관한 공용 템플릿**: `index.html`(마크업) + `assets/style.css`(맨 아래 '헤더(2026-10-03)' 블록) + `assets/ticker.js`. 모든 판(`?date=`·`?ed=`·`e/<id>/` → `?ed=` 로 이동)이 이 `index.html` 하나로 렌더되므로 정기 실행(판 빌드·`share_kit.py`)은 헤더를 건드리지 않는다. **정기 실행에서 index.html 헤더를 다시 쓰거나 지우지 말 것.** (`e/<id>/index.html` 은 메인으로 넘기는 미리보기 페이지라 헤더가 따로 있음 — 이번 변경 대상 아님. 공유 카드 PNG(`share_kit.py`)의 헤더 그림도 예전 모양 그대로)
- **첫 줄**: 왼쪽부터 태국 국기 → ❤️ 하트 → 태극기 → '태국 뉴스 한눈에'(데스크톱은 아래 작은 부제). 오른쪽은 예전처럼 날짜·판 선택·로그인. 국기 이모지는 윈도우 PC 브라우저에서 글자로 보이므로 **인라인 SVG**(`index.html` `.brand__flags`). 태극기는 공식 비율(3:2, 태극 지름 = 세로의 1/2, 괘 막대 길이 = 태극 반지름, 두께 1/12·간격 1/24 지름, 태극에서 지름 1/4 띄움)로 그림: **왼쪽 위 건(☰)·오른쪽 아래 곤(☷)·오른쪽 위 감(☵)·왼쪽 아래 리(☲)**, 태극은 위 빨강(#CD2E3A)·아래 파랑(#0047A0). 고칠 때 이 배치를 바꾸지 말 것.
- **둘째 줄**: 왼쪽 **☰ 메뉴 버튼(`#menuBtn`, 왼쪽 서랍 그대로 — 운영자 요청으로 크게: 54×50px(데스크톱 58×52, 최소 44×44 터치 영역), 26px 굵은 세 줄 SVG + 아래 작은 '메뉴' 글자, 밝은 둥근 배경)**, 오른쪽 **빠른 정보 상자**(`#ticker`). 좁은 화면은 옆으로 밀기(스크롤바 안 보임, 오른쪽 끝 흐림 표시). 그 아래 셋째 줄(`.subbar`, 예전 탭 줄 자리)은 **📍 내 주변**(아래).
- **셋째 줄 = 📍 내 주변(2026-10-03 운영자 요청, 예전엔 빈 줄)** ★판을 새로 만들어도 유지 — `index.html` `<div class="subbar subbar--nearby"><nav id="nearbyRow">` + `assets/nearby.js`(줄·화면 렌더) + `assets/nearby.css`(스타일). 정기 실행은 이 줄을 비우거나 지우지 말 것.
  - 줄: 왼쪽 **'📍 내 주변' 이름표(링크 아님, 누를 수 없음)** + 카테고리 버튼 4개 **🍜 맛집 · 💇 미용실 · 💆 마사지 · 🛒 마트**(높이 34px, 줄 높이 약 42px, 390px 폭에 다 들어감 — 더 좁으면 옆으로 밀기).
  - 버튼 → 앱 안 화면 **`#nearby/food|hair|massage|mart`**(모바일 = 전체 화면, 데스크톱 = 가운데 창, 뉴스 피드는 뒤에 그대로). **← 뒤로**·Esc·브라우저 뒤로·데스크톱 바깥 누르기 = 피드로. 주소에 `#nearby/massage` 를 붙여 바로 열 수도 있음.
  - 화면 구성(위→아래): **광고 1개**(`data/ads.json` 슬롯 `nearby-food|nearby-hair|nearby-massage|nearby-mart`, '광고' 표시 — 마사지는 운영자 가게 **드래곤 스웨디시 마사지** 배너(`assets/ads/massage/`, item `render: "dragon"`, `variant: "small"`), 나머지 셋은 '여기에 광고하세요' 자리 표시) → 큰 버튼 **'📍 내 주변 평점 좋은 곳 구글 지도로 보기'**(새 탭) → 기준 안내 + 지역 버튼 → **빠른 찾기**(맛집: 한식·태국음식·카페 / 미용실: 헤어샵·네일 / 마사지: 타이 마사지·스파 / 마트: 마트·한인마트) → 안내 '평점 좋은 곳만 보려면 구글 지도 위쪽 필터에서 **평점**을 눌러 4.0 이상 등을 고르세요'(구글 지도 웹 검색 결과 위 '가격·평점·영업시간' 필터 칩, 10-03 확인).
  - 위치: 지도 버튼을 누를 때 브라우저 위치 권한을 물음 → 허용 = `https://www.google.com/maps/search/<검색어>/@위도,경도,15z`(내 위치 중심), 거절·실패·미지원 = `https://www.google.com/maps/search/?api=1&query=<검색어> in Pattaya|Si Racha|Bangkok`. 지역 = 이 화면에서 고른 지역(`localStorage tnk.nearbyRegion`) > 날씨 칩 지역(`tnk.wxRegion`) > 페르소나 > **파타야**. 이미 허용된 기기는 화면을 열 때 묻지 않고 좌표를 받아 둠. 좌표는 지도 주소를 만드는 데만 쓰고 저장하지 않음(페이지 메모리 10분). 검색어는 영어(`restaurants`·`hair salon`·`massage`·`supermarket`·`korean restaurant`·`korean mart` …), 화면 글자는 한국어만(태국 문자 없음). 위치 확인이 길어 팝업이 막히면 '버튼을 한 번 더 눌러 주세요' 안내(링크는 이미 바뀌어 있음).
  - 링크는 모두 `<a target="_blank" rel="noopener">` → 홈 화면 앱(PWA)에서는 앱 안 브라우저 시트로 열림(아래 '외부 링크는 모두 새 탭').
  - **카테고리 설정은 `assets/nearby.js` 맨 위 `NEARBY` 객체 하나**(`window.TN_NEARBY`): `{id, emoji, label, slot, query, places:{includedTypes}, subs:[{label, query, places}]}` + 지역 좌표. 카테고리·빠른 찾기를 더하거나 바꿀 때 이것만 고치면 줄·화면·링크가 같이 바뀜(새 광고 슬롯 id 는 `data/ads.json` + `tools/newslib.py` `build_ads()` 허용 목록에도). **나중에 Google Places API(New) Nearby Search 로 앱 안 순위 목록으로 바꿀 때**: `places.includedTypes` 와 좌표(`geo.pos`)를 그대로 쓰고 `renderPage()` 의 지도 버튼(`.nb-go`) 아래에 목록을 넣으면 됨(API 키는 HTTP 리퍼러 제한 필요 — 지금은 키 없음, 구글 지도 링크만).
- **빠른 정보 = 두 줄짜리 상자 3개(운영자 확정 10-03 07:28)** — ☰ 버튼과 같은 높이(모바일 50px·데스크톱 52px), 두 줄 같은 글자 크기, 통화 아이콘 없음. 390px 폭에 다 들어가게 맞춤(더 좁으면 옆으로 밀기 + 오른쪽 흐림). 상자를 누르면 작은 창에 두 줄 각각의 자세한 값·출처 링크·기준/받아 온 시각(방콕). 값이 없거나 오래되면 **그 줄을 숨김**(두 줄 다 없으면 상자 숨김, 틀린 숫자를 보여 주지 않음, 절대 지어내지 않음):
  1. **상자1 환율**: `1바트 = 40.4원` / `1달러 = 33.7바트`(둘 다 소수 1자리 — 환율이라서) ← `data/ticker.json` `fx.THB_KRW`·`fx.USD_THB`(open.er-api.com THB 기준, 판 환율과 같은 출처. 실패 시 frankfurter/ECB). 받아 온 지 24시간·기준 시각 48시간 넘으면 숨김.
  2. **상자2 날씨·미세먼지**: `🌤️ 27° ☔79%`(지금 기온 + 날씨 아이콘 + 앞으로 6시간 최고 강수확률, 넓은 화면은 앞에 지역 이름) / `PM2.5 12 좋음`(색 라벨).
     - 지역 = 작은 창에서 고른 지역(`localStorage tnk.wxRegion`) > 페르소나(`tnk.profile.v1` persona 가 pattaya/sriracha/bangkok) > **파타야**(여행객·사업·미선택).
     - 날씨: 브라우저에서 Open-Meteo 직접(키 없음, 30분 캐시 `tnk.wx.v1`). 실패(429 등)하면 `ticker.json` `wx`(Actions 가 받은 값 — Open-Meteo, 막히면 MET Norway: 이때는 강수확률 대신 6시간 강수량). 모델 시각 3시간 넘으면 숨김.
     - PM2.5: 같은 지역, 브라우저에서 Open-Meteo 대기질(CAMS 예측 모델, 60분 캐시 `tnk.aq.v1`, 실패 시 `ticker.json` `aq`). 단계 = **태국 오염관리국(PCD) 2023 기준(15/25/37.5/75 µg/m³)을 4단계로**: 좋음 0–25(초록) · 보통 25.1–37.5(노랑) · 나쁨 37.6–75(주황) · 매우 나쁨 75 초과(빨강). 측정소 실측이 아닌 모델 값(작은 창에 표시).
  3. **상자3 금·휘발유**: `금 66,400฿` / `휘발유(95) 40.69฿`.
     - 금: 태국 금 거래상 협회(goldtraders.or.th) 공식 발표 **금괴 96.5% 1바트(15.244 g) 판매가**(작은 창에 매입가·원화 환산(판매가 × 환율, 정수 반올림)). 협회 사이트가 쓰는 공개 JSON `/api/GoldPrices/Latest`(공식 문서화된 API 아님 — 구조가 바뀌면 줄이 숨겨지고 워크플로가 빨간색). 주말·공휴일엔 발표가 없어 마지막 발표값 그대로(작은 창에 발표 시각). 받아 온 지 24시간·발표 4일 넘으면 숨김.
     - 휘발유(95): **방짝(Bangchak) 공식 유가 JSON**(`oil-price.bangchak.co.th/ApiOilPrice2/th`)의 **가소홀 95**(แก๊สโซฮอล์ 95 S EVO) 오늘 가격, 바트/L, **방콕 소매가(방콕 지방세 미포함, 방짝 표기)**. 작은 창에 원화 환산·어제 가격·가격 공지/적용 시각. 받아 온 지 24시간 넘거나 피드 날짜가 이틀 넘게 지나면 숨김. 경유(디젤)는 운영자 요청으로 쓰지 않음.
- 데이터 갱신: `data/ticker.json|js` 는 `korea.yml` 의 '시세 수집' 단계(`python3 tools/fetch_ticker.py`)가 2시간마다 만들어 한국 뉴스와 같은 커밋으로 올림(시세만 바뀌면 `ticker: 시세 MM-DD HH:MM BKK`). 항목 하나가 실패하면 그 항목은 이전 값(이전 받아 온 시각 그대로 → 오래되면 화면이 숨김). 화면은 `fetch(data/ticker.json?_=…, no-store)`(file:// 은 `data/ticker.js`), 서비스 워커도 no-store, 돌아왔을 때 10분 넘었으면 다시 받음.
- 상자·줄을 더하거나 바꾸려면 `assets/ticker.js` 의 `render()`(상자=`tile(키, [줄1, 줄2])`)·`part()`/`TILE`(작은 창 내용) 만 고치면 됨. 새 assets 파일을 만들면 `tools/stamp_assets.py` 의 `ASSETS` 와 `index.html`·`sw.js` 에 `?v=` 항목을 같이 넣을 것.

## 주제(11개) — 2026-10-03 저녁판부터(아침판은 10개: 파타야·시라차 따로)
| id | 이름 | 내용 |
|---|---|---|
| `east` | 🏖️ 동부(촌부리·라용) | **촌부리 도 전체**(파타야·좀티엔·방라뭉·나끌루아·농쁘루·프라탐낙·꼬란·싸따힙·**시라차·램차방**·아마타시티·반븡·판통·파나니콤·**방센**·촌부리 시내 등) + **라용 도**(라용 시내·맙따풋·반창·끄랭·꼬사멧 등). 라용 소식도 따로 주제를 만들지 않고 여기에. 지명 표기는 기사 `region` 에 그대로('파타야(좀티엔)', '시라차(램차방)', '라용(맙따풋)') |
| `bangkok` | 🏙️ 방콕 | 방콕 도심·구청·수완나품/돈므앙 등 방콕 한정 소식 |
| `north` | ⛰️ 북부 | 북부 지방: 치앙마이·치앙라이·람빵·람푼·매홍손(빠이)·난·프래·파야오·핏사눌록·수코타이·우따라딧·딱(매솟) 등 |
| `south` | 🏝️ 남부 | 남부 지방: 푸껫·끄라비·팡아(카오락)·수랏타니(꼬사무이·꼬팡안·꼬따오)·송클라(핫야이)·나콘시탐마랏·뜨랑·사뚠·춤폰·라농 + 남부 국경 빳따니·얄라·나라티왓 |
| `poleco` | 🏛️ 정치·경제 | 정부·국회·정당, 기업·산업·환율·예산 |
| `society` | 🚨 사회·사건사고 | 전국 사건·사고·재난·복지·보건 |
| `visa` | 🛂 외국인·비자 | **태국에 사는 외국인에게 필요한 소식**: 비자·이민 규정(TM30, 90일 신고, DTV/LTR/은퇴 비자, 오버스테이), 이민경찰 단속, 외국인 관련 법 집행·추방, 워크퍼밋, 해외소득 과세, 노미니 단속, 외국인 사건·사기, 한국 교민·주태국 한국대사관 공지 |
| `life` | 🛒 생활·물가·부동산 | 물가·유가·전기/수도 요금·장보기, 콘도·임대·부동산, 생활 행정(면허·세금·보험) |
| `travel` | 🍜 여행·맛집 | 관광·호텔·항공·축제·명소·맛집·관광객 대상 정보 |
| `ent` | 💬 연예·스포츠·SNS | 드라마·아이돌·스포츠·바이럴·SNS 화제 |
| `weather` | 🌦️ 날씨·교통 | 기상청 예보·비·홍수/침수(생활 영향)·도로·고속도로·대중교통·항공편 |

- 기사마다 **주 주제 1개(`topic`) + 보조 주제 0~3개(`secondary`)**. 예: 파타야 침수 = `east` + `["weather"]`, 시라차 달걀값 = `life` + `["east"]`, 라용 공단 화재 = `east` + `["society"]`, 방콕 침수 = `bangkok` + `["weather"]`, 파타야 외국인 사기 = `visa` + `["east","society"]`, 치앙마이 홍수 = `north` + `["weather"]`, 푸껫 관광객 사고 = `south` + `["travel","society"]`. 주제 탭·내 피드에는 주/보조 어느 쪽이든 해당하면 나온다.
- **지역 주제 고르기**: 촌부리·라용 = `east`, 방콕 = `bangkok`, 북부 = `north`, 남부 = `south`. 그 밖의 지역(이산·중부 등 — 주제 없음)은 성격(사회·날씨·정치 등)을 주 주제로. 같은 기사에 `east` 를 두 번 넣지 않는다(검증이 막음).
- 페르소나별 기본 주제(5개, `assets/topics.js` 의 `PERSONAS`) — 2026-10-03 통합 뒤(페르소나 이름은 그대로):
  - 파타야 거주자: 동부(촌부리·라용), 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고
  - 시라차 거주자: 동부(촌부리·라용), 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고 (파타야 거주자와 같아짐 — 예전엔 파타야/시라차만 달랐음)
  - 방콕 거주자: 방콕, 외국인·비자, 생활·물가·부동산, 날씨·교통, 사회·사건사고
  - 여행객: 여행·맛집, 날씨·교통, 외국인·비자, 동부(촌부리·라용), 방콕 (이미 5개라 북부·남부는 기본에 넣지 않음 — 이용자가 🧩 내 주제에서 추가)
  - 사업·투자: 정치·경제, 생활·물가·부동산, 외국인·비자, 방콕, 동부(촌부리·라용)(EEC·램차방·아마타 산업단지)
  - 북부·남부는 어떤 페르소나 기본에도 없다(직접 추가). 규칙 그대로: 기본 5개 + 3개까지 추가(최대 8개), 주요 뉴스 3건은 항상 보임.
- **옛 주제 id 옮기기(2026-10-03)**: `assets/topics.js` `ALIAS = {pattaya: "east", sriracha: "east"}` — 옛 판 데이터·캐시된 파일·`?tab=` 주소의 옛 id 는 화면에서 동부로 읽는다. `assets/prefs.js` `migrate()` 가 이 기기 `localStorage['tnk.profile.v1']` 와 로그인한 계정의 클라우드 문서(읽을 때·합치기 전)에서 `topics` 의 옛 id → `east`(중복 제거, 순서 유지), 취향 특징 `t:pattaya`·`t:sriracha`·`l:…` → `t:east`·`l:east`(표 `vf` 로 다시 세서 같은 기사가 두 번 세어지지 않게)로 조용히 바꾼다. `persona` 값(pattaya/sriracha)은 그대로(페르소나 이름·📍 내 주변·날씨 칩 지역 기본값). 검증: `newslib.topic_ids_for()` 가 2026-10-03 아침판까지만 옛 id 를 별칭으로 받고, 그 뒤 판은 막는다. 2026-10-03 아침판 데이터(`data/2026-10-03-am.*`·`tools/editions/2026-10-03-am.py`)는 이미 `east` 로 바꿔 둠(기사 id `pt1`·`sr1` 은 그대로).
- **옛 판 매핑**(10월 2일 저녁판까지, `category` 필드): `assets/topics.js` 의 `legacyTopics()`가 화면에서만 변환(데이터·기사 문장은 그대로). politics/economy → 정치·경제, society → 사회·사건사고(방콕 태그 기사는 방콕, 예보 기사는 날씨·교통), local → 동부(촌부리·라용 지명, 또는 지명이 없을 때), 북부·남부 지명이 분명하면 북부/남부, sns → 연예·스포츠·SNS, visa → 외국인·비자. 보조 주제는 지명·키워드(홍수·도로·물가·관광 등)로 붙임. 옛 판 브리핑(문단)은 문장마다 글머리표로 나누고 키워드로 관련 기사·주제를 찾아 연결.
- 외국인·비자 카드와 판 생성 36시간 이전 기사에는 날짜 칩(📅 10월 2일(금))을 표시.

## 👍👎 취향 학습 · 사용자 설정
- 카드마다 `👍 관심 있음` / `👎 관심 없음`. 누르면 그 기사의 **주제(주 1.0, 보조 0.5)·지역·키워드 태그** 가중치를 ±1(같은 버튼 다시 = 취소). 저장: `localStorage['tnk.profile.v1'].taste`.
- 정렬 = 최신성(판 생성 시각 기준 12시간마다 -1, 최대 -6) + 학습 점수(±4 제한) + 직접 누른 표(👍 +1.5 / 👎 -4). **👎 기사는 아래로 내려가고 흐리게 보일 뿐 숨기지 않음.**
- 🧩 내 주제 → '내 취향 초기화'(가중치·표 삭제, 주제 선택은 유지), '모든 주제 보기', '처음 질문 다시 보기'.
- 저장소 인터페이스(`assets/prefs.js` `TNStore`): `get()`, `update(fn)`, `reset()`, `subscribe(fn)`, `attach(adapter)`. 어댑터 = `{name, read(): Promise<doc|null>, write(doc): Promise}`. 문서 하나(`{v, onboarded, persona, topics, taste:{w, votes}, ui, updatedAt}`)라 Firestore `users/{uid}` 문서에 그대로 저장 가능. `attach()`는 `updatedAt`이 더 최신인 쪽을 채택.
- 버튼 문구: '이런 소식 더 볼래요?' **🙌 더 보여줘**(= 👍) / **🙅 덜 보여줘**(= 👎). 같은 표 로직, 다시 누르면 취소.

## Google 로그인 · Firestore (선택 기능)
- Firebase 프로젝트 `thai-news-kr`(Spark 무료). 웹 설정은 `tools/firebase_config.json` 과 `assets/fb.js` 의 `CONFIG`(같은 값). Authentication → Google 사용 + 승인된 도메인 `p-max168.github.io`. Firestore(Standard, asia-southeast1).
- **보안 규칙 게시(필수, 콘솔에서 직접)**: Firebase 콘솔 → Firestore Database → **규칙** 탭 → 저장소의 `firestore.rules` 내용을 통째로 붙여 넣고 **게시**. 게시 전에는 로그인은 되지만 저장·댓글이 거부됨(화면엔 '댓글 기능을 준비 중이에요', 계정 메뉴 '동기화 오류').
- 동작: 헤더 오른쪽 G 버튼(모바일)/'구글로 로그인'(설정 창·서랍) → `signInWithPopup`, 팝업이 막히면·iOS 홈 화면 앱(standalone)이면 `signInWithRedirect`. 로그인한 적 없는 방문자는 페이지가 다 뜬 뒤 쉬는 시간에 로그인 모듈만 미리 받음(실패해도 무시, 버튼 숨김). file:// 에서는 로그인·댓글 없음.
- 동기화: `users/{uid}` = `{v, onboarded, persona, topics, taste:{w, votes, vf}, updatedAt, settingsAt, serverAt, lastCommentAt}` (`ui`=설치 안내 등은 이 기기 전용이라 안 올림). 로그인 때 합치기: 👍👎 표는 **합집합**(같은 기사 표가 다르면 더 최근 문서), 가중치는 합친 표로 다시 계산(`vf`=표마다 기사 특징 이름), 설정(persona·topics)은 `settingsAt` 이 **최근인 쪽** — 단 이 기기가 그 계정과 처음 연결되면 클라우드 설정을 되살림(새 휴대폰의 첫 질문 답이 원래 설정을 덮지 않게). 이후 바뀔 때마다 1.5초 모아서 저장, 다른 기기 변경은 화면으로 돌아올 때·5분마다 다시 읽음(Firestore Lite — 실시간 연결 안 열어 둠). 로그아웃해도 이 기기 설정은 남음.
- 공개 화면엔 구글 실명·이메일을 **절대 표시하지 않음**: 헤더엔 내 사진만, 댓글엔 닉네임만. 계정 메뉴(헤더 사진 누르기)에 **내 UID** 가 작게 보임.
- **댓글** `comments/{id}` = `{articleId(기사 id), edition, uid, nickname, text(≤500), createdAt, isAdmin, hidden, reports, reporters[]}`: 숨김 아닌 것은 누구나 읽기, 로그인한 본인만 작성(**30초에 1번** — 같은 batch 로 `users/{uid}.lastCommentAt` 을 서버 시각으로 갱신, 규칙이 확인), 본인·운영자 삭제, 운영자 숨기기, 다른 사람 '신고' 1인 1회·**3번이면 자동 숨김**. 화면 필터: 한국어·태국어·영어 욕설·링크·광고 문구 차단. 빈 목록 = '첫 댓글을 남겨보세요'. 색인 추가 불필요(같음 조건만 쓰고 정렬은 화면에서).
- **닉네임** `profiles/{uid}` = `{nickname(2~12자), isAdmin, updatedAt}`: 첫 댓글 때 정함(기본 '파타야 회원 ####'). '운영자·관리자·admin' 이 들어간 이름 금지.
- **운영자 지정**: 계정 메뉴에서 내 UID 확인 → 콘솔 Firestore → 컬렉션 `config` → 문서 ID `admins` → 필드 `uids` (배열) 에 UID(문자열) 추가. 클라이언트는 이 문서를 못 고침. 운영자 댓글엔 '운영자' 배지, 다른 사람 댓글 숨기기/삭제 가능. (운영자 지정 뒤 닉네임을 한 번 다시 저장하면 프로필에도 배지 반영)

## 기사 스키마
### 새 형식(2026-10-03 아침판부터 — 정기 실행은 이것만)
기사: `id, topic(주제 id), secondary[보조 주제 id 0~3], tags[키워드 2~6개, 필수], headline, summary[문단], context(배경 설명), update(후속일 때만), source, url, title_th, published(ISO, +07:00), related[{source,title,url}], region(지역 기사: '파타야(좀티엔)' 등)`
- `id`는 주제 약어+번호 권장: `ea1`(동부(촌부리·라용)) `bk1`(방콕) `no1`(북부) `st1`(남부) `pe1`(정치·경제) `so1`(사회) `vi1`(외국인·비자) `lf1`(생활) `tr1`(여행) `en1`(연예·SNS) `wt1`(날씨·교통). (옛 판의 `pt1`·`sr1` 은 그대로 둠)
- `tags` = 인물·장소·기관·사건 키워드(‘#’ 없이). 👍👎 학습에 쓰이므로 **모든 기사에 반드시**(검증에서 2개 미만이면 멈춤).
- `category`는 쓰지 않는다(넣으면 옛 6종 값만 허용).

최상위: `id, date, edition(am|pm), edition_label, generated, updated(선택), coverage, previous, briefing, highlights[id 3개], stories[]` (옛 판의 `trends`는 선택적 레거시 필드)
- **`briefing` = 5~6줄 목록** `[{topic, text, story_id}]` — 편집 파일에서는 `B("visa", "이민국 앱 **THIM** 정식 출시…", "vi2")`. `text`는 짧은 한 줄(120자 이하)에 **`**굵게**` 핵심어/숫자 1곳 이상**, `story_id`는 그 줄의 기사(화면에서 누르면 그 기사로 이동·펼침). 서로 다른 기사 5~6개, 주제가 고르게.
- 검증(`newslib.validate`)은 기사에 `topic`이 있거나 `briefing`이 목록이면 새 형식 규칙을 적용(주제 id, secondary, tags, 브리핑 줄 형식). 구성 점검은 경고만 출력(기사 20~25건, 외국인·비자 2~4건, 동부·방콕·여행·생활 기사 유무 — 북부·남부는 경고 없음) — **참고용일 뿐 최소 건수가 아니다.** 경고를 없애려고 약한 기사를 넣지 않는다. 실제 뉴스가 없으면 적게 싣고 절대 지어내지 않는다(아래 '편집 원칙').
- 저장된 판 점검: `python3 tools/newslib.py check data/<id>.json`

### 옛 형식(10월 2일 저녁판까지 — 고치지 않음)
기사: `id, category(politics|economy|society|local|visa|sns), headline, summary[문단], context(배경 설명), update(이전 판 이후 새로 나온 내용, 후속 기사일 때만), source, url, title_th, published(ISO, +07:00), related[{source,title,url}], tags[], region(지역 기사), highlight`

최상위: `id, date, edition(am|pm|early), edition_label, generated, updated(선택: 같은 판을 나중에 보강했을 때), coverage, previous(직전 판 id), briefing, highlights[id 3개], stories[]`
- 옛 판에 남은 `trends` 필드(`items`, `source` 등)는 레거시 호환용으로 보존할 수 있지만 `newslib.validate`가 검사하지 않고 사이트·`share_kit.py`가 읽거나 출력하지 않는다. 새 판에는 넣지 않는다.
- 이미지·영상 필드(`image`, `media`, `video`, `embed` 등)는 금지(검증에서 멈춤). X 미디어·이미지는 절대 넣지 않고 텍스트만.
(※ `2026-09-29-early`는 옛 형식이라 `id/edition_label` 등이 없지만 index가 파일 이름으로 판을 알아내므로 그대로 동작)

## 수집 소스 목록(2026-10-03 아침판부터 확대 — 운영자 승인)
**기계가 읽는 전체 목록은 `tools/sources.json`**(2026-10-03 box 에서 curl/requests 로 200·최근 항목 확인: RSS 78 · 뉴스 사이트맵 12 · Google News 150 · 손으로 확인(html) 22 · box 에서 안 열려 건너뜀 3, 피드·사이트 도메인 약 77곳 — 같은 날 오전 북부·남부·방콕 소스 추가). 주제 태그는 새 id(`east`·`bangkok`·`north`·`south` …), 묶음(`group`)은 `east-local`(옛 `pattaya-local`)·`bangkok-local`·`north-local`·`south-local`·`official`·`korean` 등. `python3 tools/collect.py` 가 이 목록을 모두 훑는다(아래 '정기 실행' 1단계). 목록을 고치면 `python3 tools/collect.py --verify` 로 다시 확인하고 `verified` 날짜를 바꾼다. 아래 표는 사람이 보는 요약이다.

정기 실행 1단계(수집)에서 기존 소스(Thairath·Matichon·Khaosod·Prachachat RSS, PPTV·TOP NEWS·MGR·Thai Ch8, Google News RSS)에 **아래를 더해** 훑는다. RSS 가 없거나 JS 화면인 곳은 섹션 페이지를 열거나 Google News 검색 `site:<도메인> <키워드>`(`python3 tools/gnews.py raw/<id>/<폴더> "site:pattayamail.com"` 처럼)로 찾는다. 주소는 2026-10-03 06:45 BKK 에 box 에서 `curl -sIL` 로 확인(★ = box 에서 접속 안 됨 → 목록엔 두되 **대체 경로**로: Google News `site:` 검색·다른 매체 보도로 확인, 막히면 보고에 '확인 못 함' 적고 넘어감).

| 묶음 | 소스(확인된 주소) | 주로 쓰는 주제 |
|---|---|---|
| 동부(촌부리·라용) 지역 | Pattaya Mail https://www.pattayamail.com/ · Pattaya People https://www.pattayapeople.com/ · The Pattaya News https://thepattayanews.com/ · 촌부리 도 홍보사무소(PRD Chonburi) https://chonburi.prd.go.th/ | 동부(촌부리·라용), 사회·사건사고, 생활·물가·부동산, 여행·맛집 |
| 공식 기관 | 태국 기상청(TMD) 경보 https://www.tmd.go.th/ ★(box 에서 시간 초과 — 대체: Google News `กรมอุตุนิยมวิทยา ประกาศ`·`เตือนพายุ`, Thai PBS·Thairath 기상 기사) · 이민국(Immigration Bureau) 공지 https://www.immigration.go.th/ ★(box 에서 403 — 대체: Google News `สตม.`·`site:immigration.go.th`, The Pattaya News·Bangkok Post 보도) · 파타야 시청 https://pattaya.go.th/ · 주태국 한국대사관 공지 https://overseas.mofa.go.kr/th-ko/brd/m_3133/list.do ★(box 에서 307 반복 — 브라우저로 열거나 '확인 못 함') · 육상교통국(DLT) https://www.dlt.go.th/ · 도로국(DOH) 교통 안내 https://www.doh.go.th/ | 날씨·교통(TMD·DLT·DOH), 외국인·비자(이민국·대사관), 동부(파타야 시청) |
| TV 뉴스 | Thai PBS https://www.thaipbs.or.th/news · Ch3(Ch3Plus) https://ch3plus.com/news · Amarin TV https://www.amarintv.com/news · Ch7 https://news.ch7.com/ (box 에선 ch7.com 지역 안내로 넘어갈 수 있음 → https://www.ch7.com/th/ 또는 `site:ch7.com` — news.ch7.com 은 Google News 색인 0건) · one31 https://www.one31.net/news (JS 화면 → `site:one31.net`) · Workpoint https://www.workpointtoday.com/ | 정치·경제, 사회·사건사고, 방콕, 날씨·교통 |
| 영어 매체 | Bangkok Post https://www.bangkokpost.com/ · The Nation https://www.nationthailand.com/ · Khaosod English https://www.khaosodenglish.com/ · Thai PBS World https://www.thaipbsworld.com/ | 정치·경제, 외국인·비자, 생활·물가·부동산, 여행·맛집 |
| 연예 | Sanook https://www.sanook.com/news/entertain/ · Kapook https://hilight.kapook.com/ (entertain.kapook.com ★ 접속 안 됨) · TrueID https://entertainment.trueid.net/ · Thairath https://www.thairath.co.th/entertain · Khaosod https://www.khaosod.co.th/entertainment · Daily News https://www.dailynews.co.th/entertainment/ · Matichon https://www.matichon.co.th/entertainment · Ch3 https://ch3plus.com/news/entertainment · Ch7 `site:ch7.com บันเทิง` · one31 `site:one31.net บันเทิง` · Workpoint https://www.workpointtoday.com/category/entertainment · Amarin https://www.amarintv.com/news/entertain · Thai PBS https://www.thaipbs.or.th/news/categories/entertainment | 연예·스포츠·SNS |
| 종합·경제(추가, 피드 확인) | RSS: Daily News `/news/feed/` · Sanook · Thai Post · INN · The Standard(종합·연예·스포츠·비즈니스) · Workpoint · one31 · The Reporters · Ejan · Kaohoon · The Matter · BBC Thai · Prachatai · Hfocus · Thairath Money/라이프 · Khaosod·Matichon 섹션별 피드 / 뉴스 사이트맵: Thai PBS · PPTV · Nation TV · Bangkok Biz News · Thansettakij · Post Today · Spring News · Komchadluek · Siam Rath · MGR / GN `site:`: TNN · Amarin · Ch3 · Ch7 · Thai Ch8 · TOP NEWS · Thairath Plus · Naewna · Nikkei Asia(태국) | 정치·경제, 사회·사건사고, 방콕, 생활·물가 |
| 동부(촌부리·라용)(추가) | The Pattaya News 태국어판 https://thepattayanews.co.th/feed/ · 파타야 시청 RSS https://pattaya.go.th/feed/ · The Thaiger 파타야 RSS · Chonburi Post Online(시라차, 업데이트 드묾) · GN `site:pattayamail.com`(사이트 RSS 403) · GN `site:banmuang.co.th ชลบุรี` · GN `site:prd.go.th ชลบุรี` · GN 태국어 `พัทยา` `บางละมุง` `จอมเทียน` `สัตหีบ` `นาเกลือ` `ศรีราชา` `แหลมฉบัง` `อมตะ ชลบุรี` `ชลบุรี` `บางแสน` · 영어 `Pattaya` · **라용(2026-10-03 추가)** GN `ระยอง`·영어 `Rayong`(Rayong FC 경기 결과 섞임). (Pattaya People 은 사이트 개편 중, Pattaya One·Pattaya Daily News 는 도메인 휴면/다른 사이트로 넘어감 → 제외) | 동부(촌부리·라용) |
| **방콕(2026-10-03 추가)** | RSS: Khaosod English 방콕 `khaosodenglish.com/category/news/bangkok/feed/` (기존: The Thaiger 방콕 RSS, 태국 종합지·TV 피드는 제목 키워드로 방콕 분류) / GN `site:`: **방콕시(BMA) `bangkok.go.th`**(사이트는 box 에서 403) · **JS100**(교통·사건 제보, 피드 없음) · **FM91 교통 `fm91bkk.com`**(피드 0개) · Daily News `กทม.`(방콕 섹션 피드 0개) · Thairath `กทม.`(지역 RSS 404) · Khaosod `กทม.`(방콕 피드 403) · Bangkok Post `Bangkok`(방콕 전용 RSS 없음) / GN 태국어: `ผู้ว่าฯ กทม.` `กรุงเทพมหานคร` `สำนักงานเขต กทม.`(구청) `น้ำท่วม กทม.` `จราจร กรุงเทพ` `บก.จร. OR ตำรวจจราจร กทม.`(교통경찰) `รฟม.·MRT·สายสีม่วง/น้ำเงิน`(BTS 단독 검색은 K-pop BTS 가 섞여 뺌) · 지역 `สุขุมวิท` `สีลม·สาทร` `อโศก·ทองหล่อ·เอกมัย` `รัชดา·ห้วยขวาง·ดินแดง` `ลาดพร้าว·บางนา·บางกะปิ` `ประตูน้ำ·สยาม·ราชประสงค์` `เยาวราช·สำเพ็ง` `จตุจักร·ข้าวสาร` `สุวรรณภูมิ` `ดอนเมือง` / GN 영어: `Sukhumvit` `Silom·Sathorn·Asok·Thonglor` `Khao San·Chatuchak·Ratchada` `Suvarnabhumi·Don Mueang` `Chadchart·Bangkok governor·BMA` `Bangkok traffic·flood` / 한국어 GN `방콕`(도박 스팸 뺌) / 손으로: PR Bangkok(방콕시 홍보) https://www.prbangkok.com/ · JS100 https://www.js100.com/ | 방콕(+날씨·교통·사회) |
| **북부(2026-10-03 추가)** | RSS: **Chiang Mai News(เชียงใหม่นิวส์)** `chiangmainews.co.th/feed/` · **Chiang Rai Times** `chiangraitimes.com/feed/`(전국·외국인 생활 글도 많아 제목 키워드로) · The Thaiger 치앙마이 `thethaiger.com/news/chiang-mai/feed` · Phitsanulok Hotnews `phitsanulokhotnews.com/feed`(드묾) / GN `site:`: PRD 북부 지역 사무소(`prd.go.th` + เชียงใหม่ / เชียงราย·พิษณุโลก) · Daily News 북부 · Chiang Mai Citylife(RSS 2023년에 멈춤) / GN 태국어: `เชียงใหม่` `เชียงราย` `ลำปาง·ลำพูน` `แม่ฮ่องสอน` `จังหวัดน่าน·แพร่·พะเยา` `พิษณุโลก·สุโขทัย·อุตรดิตถ์` `จังหวัดตาก·แม่สอด` / 영어 `"Chiang Mai"` `"Chiang Rai"` `Mae Sot·Mae Hong Son·Lampang·Phitsanulok·Sukhothai` / 한국어 `치앙마이` (지역 검색은 제목에 북부 지명이 있는 것만 — `require`) | 북부 |
| **남부(2026-10-03 추가)** | RSS: **The Phuket News** `thephuketnews.com/rss-xml/news.xml` · **The Phuket Express** `thephuketexpress.com/feed/` · The Thaiger 푸껫·끄라비 RSS / GN `site:`: PRD 남부(`prd.go.th` + ภูเก็ต / สงขลา·สุราษฎร์ธานี) · **Isranews**(남부 국경 취재, RSS 없음) · Hatyai Focus(핫야이, RSS 날짜 없음 — 구인 글 뺌) / GN 태국어: `ภูเก็ต` `กระบี่·พังงา` `สุราษฎร์ธานี` `เกาะสมุย·พะงัน·เต่า` `สงขลา·หาดใหญ่` `นครศรีธรรมราช` `ตรัง·สตูล` `ชุมพร·ระนอง` `ปัตตานี·ยะลา·นราธิวาส` `ชายแดนใต้` / 영어 `Phuket` `Krabi·Phang Nga` `Samui·Phangan·Koh Tao` `Hat Yai·Songkhla` `Pattani·Yala·Narathiwat` `Surat Thani·Nakhon Si Thammarat·Trang·Satun` / 한국어 `푸껫 OR 푸켓` / 손으로: Samui Times https://www.samuitimes.com/ (피드·GN 색인 없음) · BenarNews 태국어 https://www.benarnews.org/thai/ (남부 국경, 피드·GN 색인 없음) | 남부 |
| 연예·스포츠(추가) | RSS: Thairath 연예·스포츠 · Khaosod 연예·스포츠·특집 · Matichon 연예·스포츠 · Sanook 연예 · The Standard 연예·스포츠 · Workpoint 연예 · Ballthai · Mthai 연예 · Bright TV · Bangkok Post 스포츠 · ONE Championship(태국 선수 관련만) / 사이트맵: Goal Thai / GN `site:`: Siamsport · Siamzone · Kapook · TrueID · Daily News 연예 · Dara Daily / GN: `บันเทิง` `กีฬา` `ฟุตบอลทีมชาติไทย` `มวยไทย` `มวยไทย ONE`, GN 태국 연예·스포츠 섹션 | 연예·스포츠·SNS |
| 영어·국제(추가) | Bangkok Post(주요·태국·비즈니스·부동산·라이프·스포츠 RSS) · The Nation(뉴스 사이트맵) · Khaosod English · The Thaiger · Thai Examiner · Thai Enquirer · ThaiThuk · CNA 아시아 RSS(태국 관련 제목만) · GN `site:thaipbsworld.com` | 정치·경제, 외국인·비자 |
| 날씨·교통·재난·물가(공식·데이터) | AOT 공항공사 RSS · TAT News RSS · GN `ปภ.`(DDPM — 사이트 403) · `GISTDA`(사이트 TLS 오류) · `รฟท`(SRT — 사이트 TLS 오류) · `ท่าอากาศยาน` · `site:tmd.go.th` · `กรมอุตุนิยมวิทยา` `น้ำท่วม` `รถไฟฟ้า` `ทางด่วน` · `แบงก์ชาติ` `ตลาดหลักทรัพย์` · `ราคาน้ำมัน` `บางจาก ราคาน้ำมัน`(방짝 사이트는 봇 차단) `ค่าไฟ` `ราคาทองคำ` `ราคาทอง สมาคมค้าทองคำ` `กรมการค้าภายใน` `คอนโด` / 손으로: Air4Thai(PM2.5, 인증서 체인 불완전) · ThaiWater · BOT 환율 · SET · EPPO · 금거래상협회 · DIT · KOTRA 해외시장뉴스(태국) · Michelin Guide Thailand · TNA(MCOT) | 날씨·교통, 생활·물가·부동산, 여행·맛집, 정치·경제 |
| 외국인·비자·한인 관점 | GN 태국어 `ต่างชาติ วีซ่า` `วีซ่า` `สตม.` `ตม. ต่างชาติ` `ตรวจคนเข้าเมือง` `ชาวต่างชาติ พัทยา` `แรงงานต่างด้าว` `ชาวเกาหลี` `เกาหลี` · 영어 `Thailand visa` `Thailand immigration` `Korean Thailand` · **한국어 GN(hl=ko)** `태국` `파타야` `site:yna.co.kr 태국`(연합뉴스) `태국 한국인` `방콕 한국인` | 외국인·비자(한국인 관련 우선) |
| box 에서 확인 실패(목록에서 뺌) | **2026-10-03 북부·남부·방콕 조사**: Lanner News(lannernews.com — SSL 오류, GN 0건) · Chiang Mai Mail(접속 안 됨, GN 0건) · Chiang Mai Citylife RSS(2023년 멈춤 → GN site: 로) · Chiangrai Focus(피드가 광고성 글 위주·40시간 넘게 멈춤) · The Thaiger 치앙라이·사무이·핫야이 섹션 피드(404) · Phuket Gazette(thethaiger.com 으로 넘어감 — 중복) · Phuket Hotnews·Phuket Today·Samui Express(접속 안 됨/SSL) · Deep South Watch(피드 2021년 멈춤, GN 0건) · BenarNews(RSS 404·GN 0건 → 손으로) · Daily News `/regional/`·`/bangkok/` 피드(항목 0개 → GN site:) · Thairath 지역·방콕 RSS(404) · Khaosod `/bangkok/feed`(403) · Matichon `กทม` 태그 피드(최신 항목이 24시간 넘음) · PR Bangkok·bangkok.go.th(피드 없음/403 → GN site:·손으로) · BTS(bts.co.th 404)·BEM MRT(500) 공지 페이지 · GN `site:prbangkok.com`·`site:bts.co.th`·`"Sukhumvit Plaza" OR "Korea Town" Bangkok`·`수쿰빗 OR 코리아타운 방콕`·`สถานทูตเกาหลี กรุงเทพ`·`ถนนข้าวสาร` 단독(최근 0건) · 예전부터: Coconuts Bangkok(2024년 이후 새 글 없음) · Pattaya One(pattayaone.news 휴면 도메인, pattayaone.net 피드 1년 넘게 멈춤) · Pattaya Daily News(도메인이 다른 사이트로 넘어감) · Smmsport(봇 확인 화면 202, GN 0건) · Siamdara(522 오류) · thai8tv.com(접속 안 됨 — Ch8 은 `site:thaich8.com`) · Muay Thai Authority(피드 80일 넘게 멈춤) · DDproperty(403)·Hipflat(401)·FazWaz(GN에는 매물 광고만) · Nine Entertain(휴면 도메인) · Bangchak 유가 페이지(봇 차단) | — |
| **반응 참고 전용(사실 출처 아님)** | Pantip https://pantip.com/ (연예 게시판 https://pantip.com/forum/chalermkrung · 영화/드라마 https://pantip.com/forum/chalermthai) · Wongnai https://www.wongnai.com/ · 태사랑 https://www.thailove.net/ (한국인 여행자 커뮤니티 — 교민·여행자 반응만) | 연예·스포츠·SNS(반응·화제), 여행·맛집(가게 정보), 외국인·비자(교민 반응) |

- **Pantip·태사랑·SNS 글은 '사실'의 출처로 쓰지 않는다.** '온라인에서 이런 반응/화제가 있다'를 설명할 때만 쓰고, 언론·공식 기관이 확인하지 않은 내용은 **'확인 안 됨'** 이라고 밝히며 절대 사실처럼 쓰지 않는다. 기사 `source`/`url`(원문)은 언론·공식 기관 것이어야 한다(Pantip·Wongnai·태사랑 은 `related` 에만).
- Wongnai 는 여행·맛집 기사에서 가게 위치·영업 정보 같은 **보조 정보**로만(평점·후기는 '이용자 후기'로 표시). 새 가게·행사 소식 자체는 언론·공식 발표로 확인.
### 편집 원칙: 최소 건수 없음 — 소스를 넓게 훑고 좋은 기사만(운영자 결정 2026-10-03)
- **주제별·지역별·매체별 최소 건수는 없다.** 숫자를 채우려고 약하거나 부풀린 기사를 넣지 않는다(2026-10-03 07:32 에 잠깐 넣었던 HARD 쿼터 — 연예 3건·파타야+시라차 4건·매체 6곳 등 — 는 폐지).
- 대신 **기사를 고르기 전에 목록의 모든 소스 묶음을 훑는다**(종합·TV·영어·연예·스포츠·동부(촌부리·라용)·방콕·북부·남부 지역·공식 기관·한국어 검색 — `tools/collect.py` 가 한 번에). 그래야 주제마다 실제 후보가 쌓이고 좋은 기사가 자연스럽게 올라온다.
- **방콕은 예전보다 조금 더 싣는다(운영자 요청 2026-10-03, 부드러운 지침 — 최소 건수 아님)**: 방콕은 교민·여행객이 가장 많이 오가는 곳이라, 방콕 후보(위 '방콕(2026-10-03 추가)' 소스 — 방콕시 발표·구청·교통·수완나품/돈므앙·수쿰빗 등)를 꼼꼼히 훑고 **뉴스 가치가 있으면** 예전(보통 1~2건)보다 넉넉히 싣는다. 약한 기사로 채우지는 않는다.
- **북부·남부**도 같은 원칙: 좋은 후보(치앙마이·치앙라이 재난·관광, 푸껫·사무이 관광객·외국인 사건, 남부 국경 치안 등)가 있으면 싣고, 없으면 비우고 `coverage` 에 짧게 적는다(최소 건수 없음).
- **뉴스 가치와 태국 거주 한국인(파타야 4년차 기준)에게 쓸모 있는지**로 고른다. 후보가 약하면 그 주제는 **비워도 된다** — 판의 `coverage` 에 '○○: 오늘은 쓸 만한 새 소식 없음'처럼 짧게 적는다.
- **부드러운 다양성 지침**(규칙 아님): 한 매체가 판을 독차지하지 않게 하고, 같은 사건은 **가장 자세한 원 보도**를 고른다. **정치 기사는 성향이 다른 매체 2~3곳**(예: Matichon·Prachatai·BBC Thai ↔ Thairath·Daily News·Naewna ↔ Bangkok Post·The Standard·Thai PBS)을 견줘 읽고 요약하며, 한쪽 주장만 옮기지 않는다.
- **게시 전 점검(확인용 출력 — 통과 조건 아님)**: 주제별 건수와 매체별 건수를 출력해 본다(예: `python3 -c "import json,collections as c;d=json.load(open('data/<id>.json'));print(c.Counter(s['topic'] for s in d['stories']));print(c.Counter(s['source'] for s in d['stories']))"`). 한 매체가 지나치게 많거나 훑지 않은 묶음이 있으면 다시 보되, **숫자를 맞추려고 기사를 더하지 않는다.**

- **고르는 규칙**
  - 원 보도(1차 보도·공식 발표)를 우선한다.
  - 같은 사건이 여러 매체에 나오면 **가장 자세한 기사**를 골라 `url`(원문)로 연결하고, 나머지는 필요하면 `related` 에.
  - 한 매체가 판을 독차지하지 않게 **여러 소스에 고루** 나눠 고른다(부드러운 지침).
  - 주제를 채우려고 고르지 않는다 — 좋은 후보가 없으면 그 주제는 비우고 `coverage` 에 적는다(절대 지어내지 않음).

## 정기 실행(07:08 / 18:08) 절차
1. 수집: **먼저 `python3 tools/collect.py`** 를 실행한다(`tools/sources.json` 의 RSS·뉴스 사이트맵·Google News 검색 약 240개를 동시에 훑음(24시간 창이면 2~3분), 실패한 소스는 건너뛰고 끝에 표시, 1분 안쪽). 결과 = `drafts/candidates/latest.md`(사람용)·`latest.json`(최근 14시간, 중복 합침, 주제별(동부·방콕·북부·남부 …)·매체별 건수, `also` = 같은 사건을 보도한 다른 매체). 기간은 `--hours 20` 처럼 바꾼다(저녁판은 아침판 이후 ~11시간이면 충분). `drafts/` 는 .gitignore 대상이라 커밋되지 않는다.
   - **후보에서 고른다**: 주제마다 후보를 훑어 뉴스 가치·한국인 관련성 순으로 고르고, 같은 사건은 `also` 를 보고 가장 자세한 원 보도를 원문 `url` 로. Google News 항목(`type: gnews`)은 링크가 news.google.com 이므로 `python3 tools/gnews.py --decode` 또는 원문 검색으로 실제 기사 URL·게재 시각을 확인한다. 주제 분류는 제목 키워드 기반이라 틀릴 수 있다 — `other`(미분류)도 한 번 훑는다.
   - **피드가 없는 곳은 손으로**: `sources.json` 의 `type: html`(Pattaya Mail 홈·PRD Chonburi·주태국 한국대사관 공지·Air4Thai·BOT·KOTRA 등)과 `disabled`(TMD·이민국·Pattaya People — 적힌 대체 경로로) 를 필요할 때 연다. 기존 방식(`python3 tools/gnews.py raw/<id>/<폴더> "검색어"`)으로 더 찾아도 된다. 원문은 `raw/<id>/`에 저장.
   - 고르는 규칙·편집 원칙(**최소 건수 없음**, 원 보도 우선, 가장 자세한 기사, 매체 고루, 정치는 성향 다른 2~3곳 비교)은 위 '수집 소스 목록' 절을 따른다. Pantip·Wongnai·태사랑 은 반응 참고 전용.
   - **구성(참고)**: 보통 20건 안팎. 주제별 건수는 그날 실제 뉴스대로 — 동부(촌부리·라용)·방콕(예전보다 조금 넉넉히, 뉴스 가치 있을 때)·북부·남부, 외국인·비자, 여행·맛집, 생활·물가·부동산, 연예·스포츠·SNS 모두 **좋은 기사가 있으면** 싣고, 없으면 비운다. 정치·경제·사회·날씨/교통은 그날 중요도대로.
   - 지역 검색 추가: 동부 `ศรีราชา` `แหลมฉบัง` `อมตะ ชลบุรี` `เมืองชลบุรี` `ระยอง` `มาบตาพุด`, 방콕 `กทม.` `กรุงเทพ ชัชชาติ` `en:Bangkok`, 북부 `เชียงใหม่` `en:Chiang Mai`, 남부 `ภูเก็ต` `เกาะสมุย` `หาดใหญ่` `en:Phuket`, 생활·물가 `ราคา ไข่` `ราคาน้ำมัน` `ค่าไฟ` `คอนโด` `en:Thailand condo prices`, 여행·맛집 `ท่องเที่ยว พัทยา` `ร้านอาหาร พัทยา` `en:Pattaya tourism` `en:Bangkok restaurant opening`, 날씨·교통 `กรมอุตุนิยมวิทยา` `ทางด่วน` `รถไฟฟ้า` (예: `python3 tools/gnews.py raw/<id>/local "ศรีราชา" "กทม." "en:Pattaya tourism"`).
   - Google News 날짜는 믿지 말 것: 며칠 전 기사가 새로 뜨는 경우가 많음 → 원문 페이지의 게재 시각을 확인(최대 48시간).
2. 직전 판(`data/index.json`의 `latest`)과 겹치는 기사는 빼고, 실제 후속 전개가 있을 때만 싣되 `update`에 무엇이 새로운지 적는다.
   - **외국인·비자(`visa`) 수집(매번)**: Google News RSS 태국어 검색 `ตม. ต่างชาติ`, `สตม.`, `วีซ่า`, `วีซ่า DTV`, `ตรวจคนเข้าเมือง พัทยา`, `ชาวต่างชาติ พัทยา`, `แรงงานต่างด้าว`, `ใบอนุญาตทำงาน ต่างชาติ`, `อยู่เกินกำหนด overstay`, `นอมินี ต่างชาติ`, `ชาวเกาหลี`, `เกาหลี พัทยา` + 영어 `Thailand immigration visa`, `Pattaya foreigner`, `90-day report OR TM30 OR DTV OR LTR`, `site:thethaiger.com visa OR immigration`, `site:thaiexaminer.com visa OR expat` (Bangkok Post·The Thaiger·The Pattaya News·Khaosod English·Thai Examiner). 검색은 `python3 tools/gnews.py raw/<id>/visa "สตม." "en:Pattaya foreigner" …`, URL 풀기는 `--decode`, 원문은 `raw/fetch.py` 방식으로 `raw/<id>/visa/art/`에 저장 + 주태국 한국대사관 공지 `https://overseas.mofa.go.kr/th-ko/brd/m_3133/list.do`(접속 안 되면 기사 배경 설명/보고에 '확인 못 함'이라고 적고 넘어감).
     - 보통 2~4건 정도(많으면 최대 8건) — **최소 건수는 없다**, 쓸 만한 게 없으면 비운다. 48시간 안에 없으면 **최대 7일 전 기사까지 허용**(`newslib.validate`가 8일 이상은 막음). 각 기사 `published`에 원문 게재 시각.
     - **이전 판과 중복 금지**: `grep -l "<키워드>" data/*.json` 등으로 확인하고, 이미 실린 사건은 실제 새 전개가 있을 때만 `update`와 함께.
     - `context`(💡 배경 설명)에는 **태국 거주 외국인(파타야 4년차 한국인 기준) 실용 팁**을 짧게: 무엇을 확인·준비하면 되는지. 기사에 없는 숫자·규정을 단정하지 말 것(확실하지 않으면 '확인하자'로).
     - 한국인·한국 교민 관련(한국인 사건, 대사관 공지, 한-태 관계)은 우선 싣는다.
   - **성인·선정적 기사 금지**: 성범죄·성매매·음란물 위주 기사, 노출 사진이 중심인 기사는 싣지 않는다. 이미지·영상은 어떤 기사에도 넣지 않는다. 검증이 `tools/trend_blocklist.txt` 키워드를 제목·원문 제목·태그·요약에서 찾으면 build 가 멈춤 → 그 기사를 빼거나(원칙), 일반 기사가 우연히 걸린 경우에만 차단 목록 정규식을 다듬는다.
   - **X 트렌드 수집·번역·편집·출력은 중단**했다. 옛 `raw/<id>/trends/` 원본과 옛 판 데이터는 감사·역사 기록으로만 보존하며, 새 판 편집 파일에는 `trends`를 만들지 않는다.
   - **🇰🇷 오늘의 한국 주요 뉴스(판 대체용 `korea_top`, 최대 10건)**: 화면은 보통 2시간마다 갱신되는 `data/korea.json` 을 쓰고, 그 파일이 없거나 6시간 넘게 지났을 때만 판의 `korea_top` 을 보여 준다(그래도 판마다 채워 둘 것). `python3 tools/fetch_korea.py <id>` → 후보 목록(한국 언론, 36시간 이내). **지금 한국에서 가장 화제인 전국 주요 뉴스 10개**(여러 매체 공통 톱·많이 읽힌 것; 교민 관련이라고 우선하지 않음)를 골라 `python3 tools/fetch_korea.py <id> --decode-only "제목 일부" …` 로 실제 기사 URL 을 푼 뒤 편집 파일 `korea_top = [KR(제목, 매체, URL, 게재시각), …]`. 제목은 한국어 원제를 `TRANSLATION_RULES.md` 제목 규칙대로 살짝만 다듬고 지어내지 않는다. 검증: 최대 10건·실제 링크(news.google.com 중계 링크 금지). 없으면 화면에 안 나옴.
3. `tools/editions/<id>.py` 작성: **`cp tools/editions/_template.py tools/editions/<id>.py`** 후 `id/date/edition/generated/previous/briefing/highlights/stories` 를 실제 내용으로 교체(새 형식: 기사마다 `topic` + `secondary` + `tags`, 브리핑은 `B(topic, "**굵게** 한 줄", story_id)` 5~6줄). X 트렌드 수집·번역·필드는 넣지 않는다. 뉴스·인용·숫자·URL은 절대 지어내지 않는다.
   - 주제 고르기: 지역 소식은 지역(`east`=촌부리·라용 / `bangkok` / `north` / `south`)을 주 주제로(**옛 `pattaya`·`sriracha` 는 2026-10-03 저녁판부터 build 가 막음**), 성격(날씨·교통·생활·사건 등)을 보조로. 지역과 무관한 전국 소식은 성격을 주 주제로. 외국인·비자 소식은 `visa` 주 주제 + 지역 보조.
4. `python3 tools/build_data.py tools/editions/<id>.py` (검증 실패 시 예외로 멈춤. `점검(경고):` 줄은 구성 안내 — 실제 뉴스가 있는데 빠진 주제면 보강)
5. `python3 -m http.server 8765 &` → `python3 tools/screenshot.py` (`ALL OK` 확인) → `screenshots/`의 이미지를 직접 보고 문제 수정. 특히 `mobile-390-feed.png`(브리핑 5~6줄·굵게·주제 칩), `mobile-390-tab-visa.png`(외국인·비자 탭), `desktop-1280-top.png`; 390px·1280px에서 X 트렌드 섹션·메뉴 항목이 없는지도 확인한다. 앱 코드(assets·sw.js)를 고쳤으면 `python3 tools/test_pwa.py` 도.
6. **💬 오늘의 질문 초안(매번, 승인 전까지 화면에 안 나옴)**: `python3 tools/discussion.py draft <id>` → `drafts/discussion/<id>.json` 의 **모든 기사(판의 기사 전부 — 건수 제한 없음, 2026-10-03 운영자 결정)**마다 `question`(독자에게 묻는 한 줄)·`operator_comment`(운영자 첫 댓글)를 채운다 — 자연스러운 한국어, 정직한 '운영자' 목소리(“운영자입니다.”), `TRANSLATION_RULES.md` 준수, 기사에 없는 사실·숫자 단정 금지, **절대 독자(사용자)인 척 쓰지 않는다**. `approved` 는 false 그대로. 보고에 `python3 tools/discussion.py show <id>` 결과를 붙여 운영자에게 보여 주고, **채팅에서 OK 받은 항목만** `approved: true` 로 바꾼 파일로 `python3 tools/discussion.py apply <id> <파일>` → 배포. **apply 는 그 판의 질문 전체를 파일 내용으로 바꾸므로, 일부만 새로 승인했으면 이미 적용된 `tools/discussions/<id>.json` 항목도 같은 파일에 넣는다.** (적용분은 `tools/discussions/<id>.json` 에 남아 판을 다시 만들어도 유지)
7. **배포(필수)**: `bash tools/deploy.sh` — 아래 'Deploy' 참고. 07:08·18:08 정기 실행은 판을 만든 뒤 **매번** 실행할 것.
8. **공유 키트(매번, 배포 뒤)**: `python3 tools/share_kit.py <id>` → `share/<id>.png`(카톡 사진 카드)·`share/<id>.txt`(메시지 문구, 올리지 않음) + 사이트용 `og/<id>.png`·`og/latest.png`(링크 미리보기 이미지)·`e/<id>/index.html`(판별 미리보기 페이지 → `?ed=<id>` 로 이동). og/·e/ 가 바뀌었으니 **`bash tools/deploy.sh` 한 번 더**. 그다음 `python3 tools/discussion.py draft <id>`(6번) 초안을 채워 보고에 붙인다.
   - 링크: 메인 `https://p-max168.github.io/thai-news-kr/`(og/latest.png), 판별 `https://p-max168.github.io/thai-news-kr/e/<id>/`. `?e=<id>`·`?ed=<id>`·`?date=<id>` 모두 그 판을 연다. 서비스 워커는 루트·index.html 만 앱 셸로 다루고 e/ 페이지는 가로채지 않는다.

### 사용 환율(TRANSLATION_RULES: 한 판 = 환율 하나, 정수 반올림)
- 판 데이터 최상위 `fx = {THB_KRW, note, source}` 에 기록하고 그 판의 모든 바트 금액에 `(약 N원)` 을 붙인다(편집 파일 `fx=dict(...)`).
- 2026-10-02-pm: **1바트 = 40.44원** (open.er-api.com, 2026-10-02 07:02 BKK). 예: 140바트(약 5,662원), 50만 바트(약 2,022만 원).

## 판마다 채울 필드(2026-10-03 추가) ★정기 실행은 2026-10-03 저녁판(18:08)부터 매번 채울 것
운영자 승인 기능 5가지. 기사(`stories[]`)마다 아래 다섯 필드를 편집 파일(`tools/editions/<id>.py`, 템플릿에 예시 있음)에 적는다. **`2026-10-03-am` 보다 뒤 판은 다섯 키가 모두 있어야 build 가 통과**한다(값은 비어도 됨 — 단 `quick_replies` 는 3~4개 필수). 형식 검증은 `newslib.validate_extras`. 모든 문장은 `tools/TRANSLATION_RULES.md` 를 따른다(인명·지명 한국어 + 괄호 영어 로마자, **바트 금액엔 그 판 `fx` 로 `(약 N원)` 정수**, 태국 문자 금지). 기사에 없는 사실·숫자는 절대 쓰지 않는다.

| 필드 | 형식 | 화면 |
|---|---|---|
| `impact` | `["비자·체류","환율·물가","교통·사고","치안","날씨·재해"]` 중 0~3개 | 카드 위 작은 색 칩(🛂 💱 🚗 🚨 🌧️) + 피드 위 '한인 영향' 필터 칩(누르면 그 태그 기사만) |
| `for_me` | 한 문장 문자열(160자 이하) 또는 `""` | 제목 아래 노란 상자 '🙋 그래서 나는?' (요약 위) |
| `also` | `[{source, url}]` 최대 8개 또는 `[]` | '📰 N개 매체 보도 ▾' → 원문 + 다른 매체 링크 목록(새 탭). N = 원문 1 + also 수 |
| `issue` | `{id, title}` 또는 `None` | '🗓️ 이슈 타임라인 N' → 같은 이슈 기사들을 판·시각 순(오래된 순)으로, 같은 판이면 그 기사 펼침, 옛 판이면 `?date=<판>#<기사>` 이동 |
| `quick_replies` | 짧은 한국어 댓글 제안 3~4개(각 2~40자) | 댓글 칸 위 '💡 추천 문장 · 눌러서 내 댓글로' 칩 |

- **`impact` = 태국 사는/여행하는 한국인 생활에 직접 닿는 것만.** 비자·체류(비자·TM30·90일 신고·이민국·노동허가·체류 단속), 환율·물가(환율·물가·요금·세금·생필품 값), 교통·사고(도로 통제·교통사고·공항·대중교통 운행), 치안(범죄·사기·단속·경찰 비리), 날씨·재해(호우·홍수·폭염·대기질·재난). 해당 없으면 `[]`(정치·연예 등). 많아야 2개가 보통.
- **`for_me` = '그래서 나(한국인 거주자·여행자)는?'** 에 답하는 자연스러운 한 문장. 기사 내용에서 바로 나오는 실용적 의미만(예: '…일대에 사는 분은 배수 소식을 계속 챙겨 보세요', '…로 가는 분은 우회로를 확인하세요'). 기사에 없는 규정·숫자·전망을 단정하지 말고, 의미가 없으면(순수 정치·연예 등) `""`.
- **`also` = 같은 사건을 보도한 다른 매체의 실제 기사 URL 만.** `tools/collect.py` 후보의 `also` 나 `python3 tools/gnews.py raw/<id>/also "검색어"` 로 찾고, Google News 링크는 `python3 tools/gnews.py --decode raw/<id>/also "제목 일부"`(googlenewsdecoder)로 풀어 **`curl` 로 열어 200 + 같은 사건 제목인지 확인한 것만** 넣는다. news.google.com 중계 링크·원문 URL·중복은 검증이 막는다. 확인 못 하면(차단·403·다른 사건) **넣지 말고 `[]`**. `source` 는 한국어 표기(괄호 원어) — 예 `"타이랏 (Thairath)"`.
- **`issue` = 여러 판에 걸쳐 이어지는 이슈**(2026 홍수 지역별, 비자 제도 변경, 명의 대여 단속 등). **`tools/issues.json` 등록부의 `id` 를 다시 쓴다** — 먼저 등록부에서 맞는 이슈를 찾고, 없을 때만 새 항목 `{id: 영문 소문자-숫자-하이픈 slug, title: 한국어 40자 이하, desc, since}` 을 추가한 뒤 기사에 `issue=dict(id=…, title=…)`. 등록부에 없는 id 는 build 가 멈춘다. 한 번 실린 기사 하나뿐인 일회성 사건은 `None`. (`members` 는 이 필드가 생기기 전 옛 판 기사를 이슈에 묶을 때만 쓰고, 새 판은 기사 `issue` 필드만 채우면 된다.)
  - `newslib.build_index()` 가 등록부(`members`)와 모든 판 기사의 `issue` 를 모아 **`data/issues.json`·`data/issues.js`**(`{updated, issues:{id:{title, items:[{edition, label, story, headline, published}]}}}`, 게재 시각 순)를 만든다. 화면은 이 파일로 타임라인을 그리고, 같은 이슈 기사가 **2건 이상일 때만** 버튼을 보인다(옛 판 카드에도 나옴).
- **`quick_replies` = 독자가 눌러서 고쳐 쓸 수 있는 댓글 제안.** 질문·반응·팁 요청 위주의 짧고 자연스러운 한국어(예: '이거 아시는 분 계세요?', '라용 쪽은 지금 괜찮나요?', '피해 없으시길 바라요'). **정직하게**: '저도 거기 살아요'·'제가 가 봤는데'처럼 겪지 않은 경험을 꾸미지 않는다(검증 `FAKE_EXP_RE` 가 막음), 기사에 없는 사실 금지, 링크·욕설·태국 문자 금지. 사망·피해 기사는 조심스러운 위로 표현.
  - 화면 동작: 칩을 누르면 **댓글 칸에 채우기만** 한다(고쳐 쓸 수 있음). 로그인한 사용자가 직접 '등록'을 눌러야 **자기 닉네임으로** 올라간다 — **자동 등록 없음.** 로그인 안 했으면 누를 때 구글 로그인 창을 열고, 로그인·닉네임 뒤 그 문장을 칸에 채워 둔다.
  - **답글**: 댓글(과 📌 운영자 고정 댓글)마다 '↳ 답글'. 답글 칸 위 추천 칩 2~3개는 부모 댓글 내용을 보고 화면에서 간단한 틀로 고른다(`assets/social.js` `replyChips`: 질문이면 '저도 궁금했어요'…, 정보면 '정보 감사해요!'·'혹시 언제 일인가요?'…, 애도면 '삼가 고인의 명복을 빕니다'). 답글은 같은 `comments` 컬렉션에 `articleId = "<기사 id>~<부모 댓글 id>"`(운영자 고정 댓글이면 `"<기사 id>~op"`)로 저장 — **Firestore 규칙 변경 없음**(같은 30초 제한·신고·숨김·욕설 필터 그대로).
- 확인: `python3 tools/newslib.py check data/<id>.json` → `OK`. 화면 점검은 '정기 실행' 5번 그대로(카드 칩·노란 상자·도구 버튼이 접힌 카드에서도 보임).
- **💬 오늘의 질문 접기(2026-10-03 운영자 요청, 모든 판)**: 질문 상자 + 📌 운영자 고정 댓글이 기사마다 너무 커서, 펼친 기사 아래에는 **한 줄 '💬 오늘의 질문: <질문>'(말줄임, 댓글 수 배지)** 만 보인다. 누르면 질문 전문·운영자 댓글(운영자 배지)·💡 추천 문장·댓글 칸·댓글 목록이 펼쳐진다. 질문이 승인 안 된 기사는 예전처럼 댓글 칸이 바로 보인다(`assets/app.js` `talkHTML`).
- **한자·가나 금지**: `newslib.validate` 가 한국어 본문 필드(headline·summary·context·update·region·for_me·quick_replies·issue.title·오늘의 질문·브리핑)에 한자·일본 가나가 있으면 멈춘다(번역 잔재 예: '追いつ었으나', '해양沿岸자원국', '관(棺)' → 한국어로). 원문 제목(`title_th`)·한국 주요 뉴스 제목은 검사하지 않음.
- **화면에 태국 글자 안 보이기**: 원문 제목(`title_th`)에 태국 글자가 있으면 기사 아래 작은 '▸ 원문 제목 보기 (태국어)' 토글 안에만 보인다. 헤더 시세 칩은 '฿' 대신 '바트'.
- 답글 보안 규칙 확인(2026-10-03): Firestore 에뮬레이터 + `@firebase/rules-unit-testing` 로 `firestore.rules` 를 시험 — `<기사>~<부모 id>`(24자)·`<기사>~op` 답글 작성 통과, 30초 제한·40자 초과·가짜 운영자 배지 거부, 비로그인 `in` + `hidden == false` 읽기 통과. 규칙 변경 불필요.
- 2026-10-03 아침판(20건)은 이 필드를 사후에 채웠다(`also` 는 확인된 URL 만 — pt1·vi2·tr2 는 `[]`).

## 🇰🇷 한국 주요 뉴스 자동 갱신(판과 무관)
- **워크플로** `.github/workflows/korea.yml` (`korea-news`): cron `47 */2 * * *`(UTC) = **방콕 01:47 03:47 05:47 07:47 09:47 11:47 13:47 15:47 17:47 19:47 21:47 23:47**(하루 12번) + 수동 실행(`gh workflow run korea.yml`, 같아도 새로 쓰려면 `-f force=true`). GitHub 예약 실행은 늦게 시작할 수 있어서, 시작 시각이 판 빌드 시간대(07:00–07:40·18:00–18:40 BKK)면 :41 까지 기다렸다 실행.
  - 단계: `pip install googlenewsdecoder` → `python3 tools/fetch_korea.py --standalone` → **`python3 tools/fetch_ticker.py`(헤더 시세 칩 `data/ticker.json|js`, 위 '헤더' 참고)** — 두 수집 단계는 서로 독립(한쪽이 실패해도 다른 쪽은 커밋, 끝에 워크플로를 빨간색으로 표시) → `data/korea.json|js`·`data/ticker.json|js` 가 바뀌었을 때만 `github-actions[bot]` 이름으로 커밋(`korea: 한국 주요 뉴스 MM-DD HH:MM BKK`) → `git pull --rebase -X theirs` 후 일반 push(최대 5번 재시도, force 없음) → Pages 는 legacy 브랜치 배포라 **push 만으로 다시 배포됨**(봇 push 도 `pages-build-deployment` 를 시작함을 확인. 90초 안에 그 커밋 빌드가 안 보일 때만 `POST pages/builds` 요청).
  - 권한: 워크플로에 `permissions: contents: write, pages: write`(저장소 기본 권한은 read 그대로 둠).
  - 실패하면(Google News 장애 등) 기존 파일을 그대로 두고 워크플로가 빨간색으로 끝남 → 화면은 6시간이 지나면 판의 `korea_top` 으로 자동 대체.
- **고르는 법**(LLM 없음, 같은 입력이면 같은 결과, 태국·교민 가중치 없음): Google News 한국 **'주요 뉴스'** 상위 15개 + **'대한민국' 주제** 피드 상위 50개. 점수 = 주요 뉴스 순위(50−3×순위) + 대한민국 순위(20−0.4×순위) + 둘 다면 5 + 묶음 매체 수(≤5) − 경과시간×0.5. 주요 뉴스 쪽 세계·IT 기사는 대한민국 피드와 같은 사건이거나 한국 관련 낱말(북한·국회·이 대통령·서울…)이 있을 때만. 36시간 넘은 것·칼럼/사설/포토·보도자료 매체·차단 목록(`trend_blocklist.txt`) 제외, 같은 사건(묶음 기사 id·제목 2-gram 유사도)은 하나만 → 상위 10건(6건 미만이면 실패 처리).
  - 제목은 원제 그대로 + 가벼운 정리(` - 언론사`·` | 언론사` 꼬리, `(종합N보)` 꼬리, 공백)만. 지어내지 않음. URL 은 `googlenewsdecoder` 로 실제 기사 주소(풀기 실패 시에만 Google News 링크). `time` = 피드 게재 시각(+07:00).
  - 10건·주소가 이전과 같고 `updated_at` 이 5시간 안이면 파일을 안 바꿈(커밋 없음). 로컬 시험: `python3 tools/fetch_korea.py --standalone --no-decode --force`(커밋하지 말 것 — deploy.sh 가 되돌림).
- **화면**: 최신 판을 볼 때 `data/korea.json` 을 네트워크 우선으로 받음(`fetch(…?_=시각, {cache:"no-store"})`, 서비스 워커도 이 파일은 `no-store` 로 항상 새로 받고 오프라인일 때만 캐시). file:// 에서는 `data/korea.js`. `updated_at` 이 6시간 안이면 그것, 아니면 판 `korea_top`(지난 판을 볼 땐 그 판 것). 제목 'TOP 10' 배지 옆 **'업데이트 HH:MM'**(방콕), **순위 번호 1~10(1~3위 진한 배지)**, **3건 → '펼치기 (2건 더)' 5건 → '펼치기 (5건 더)' 10건 → '접기 ▴'(3건으로)** — `assets/app.js` `KOREA.STEPS = [3, 5, 10]`. **6~10위가 보일 때(10건 펼침)만 5위와 6위 사이에 작은 광고 자리**(`data/ads.json` 슬롯 `korea-mid`, strip 크기, '광고' 표시). **항목을 누르면 바로 아래 작은 카드**(제목·매체·게재 시각(방콕)·짧은 설명 — `korea.json`/`korea_top` 항목에 `desc`(또는 `summary`)가 있을 때만, 160자까지. **기사 본문은 절대 옮기지 않음**) + **'기사 보러 가기 ↗'** 버튼(새 탭). 다시 누르면 닫힘(한 번에 하나). 제목 줄을 누르면 섹션 전체 접기(이 기기에 기억). 화면으로 돌아왔을 때 10분 넘었으면 다시 받음.
- 판 빌드(deploy.sh)와 충돌 없음: deploy.sh 는 korea 파일을 올리지 않고 push 전 항상 `pull --rebase`.

## 외부 링크는 모두 새 탭
- 사이트 밖으로 나가는 링크(한국 뉴스 '기사 보러 가기', 기사 원문·관련 기사, 시세 칩 출처, 광고 지도·카톡·라인 등)는 **모두 `target="_blank" rel="noopener"`**(광고는 `rel="sponsored noopener"`). 홈 화면 앱(PWA standalone)에서는 안드로이드·iOS 가 앱 안 브라우저 시트(닫기 ✕ → 우리 앱으로 돌아옴)로 연다. **`tel:` 전화 링크만 예외**(같은 창). 새 링크를 만들 때도 이 규칙을 지킬 것.

## 광고 자리(목업)
- `data/ads.json`: `enabled`(false = 전부 숨김), `slots[]` = `{id: top(헤더 아래 띠)|nearby-food|nearby-hair|nearby-massage|nearby-mart(📍 내 주변 카테고리 화면 맨 위 — 마사지는 드래곤 마사지 배너, item `render:"dragon"`)|mid(한국 뉴스·브리핑과 주요 뉴스 사이 큰 배너)|korea-mid(한국 주요 뉴스 TOP 10 의 5위·6위 사이 작은 띠 — 10건 펼쳤을 때만)|infeed(기사 every 건마다 카드)|drawer(서랍 아래 작은 배너)|footer, size: strip|large|medium|small|wide, enabled, items[{category, title, subtitle, image?, link?(https 만), theme 1~5}]}`. 지금은 '여기에 광고하세요 · 광고 문의' 자리 표시만(가짜 업체명·전화·링크 없음). 고친 뒤 `python3 tools/newslib.py` 로 `data/ads.js` 재생성 → 배포. 새 슬롯 id 를 만들면 `tools/newslib.py` `build_ads()` 의 허용 목록에도 넣을 것(안 넣으면 판 빌드가 멈춤).

## 홈 화면 추가 안내
- 안드로이드(Chrome·삼성 인터넷): `beforeinstallprompt` → 아래 안내 바 '홈 화면에 추가할까요? 앱처럼 편하게 볼 수 있어요' [추가하기]/[나중에]. iOS Safari: 2단계 그림 카드(① 아래 도구 막대 공유 버튼 — 아래로 튀는 화살표 ② '홈 화면에 추가') + 닫기. '나중에'/닫기 = **7일** 동안 안 보임(이 기기 `ui.installHintUntil`). 설치 후·홈 화면 앱에서는 안 보임.

## Deploy (GitHub Pages)
- 저장소: https://github.com/P-Max168/thai-news-kr (공개 — 무료 Pages 조건)
- 라이브: https://p-max168.github.io/thai-news-kr/ (휴대폰에서 이 주소로 열기)
- Pages 설정: `main` 브랜치 루트(`/`). `.nojekyll` 로 Jekyll 처리 끔.
- **매 정기 실행(07:08 / 18:08 방콕)은 판을 만든 뒤(위 4~5단계) 반드시 `bash tools/deploy.sh` 를 실행한다.**
  - 먼저 `tools/stamp_assets.py` 로 앱 셸 버전 갱신(assets 가 바뀐 경우만 index.html·sw.js 수정)
  - 사이트 파일(index.html, manifest.json, sw.js, assets/, data/, tools/, README.md 등)의 새 파일·변경분을 `edition <id>` 메시지로 커밋 → `main` 에 push
  - force-push 금지(스크립트도 하지 않음). push 전에 **항상 `git pull --rebase --autostash`**(Actions 의 korea.json 커밋을 받아 옴) → 일반 push, 거부되면 최대 4번 재시도
  - `data/korea.json|js`·`data/ticker.json|js` 는 **절대 커밋하지 않음**(로컬 사본은 HEAD 로 되돌린 뒤 pull — 오래된 한국 뉴스로 덮어쓰지 않게). `.github/` 는 사이트 파일과 함께 올림
  - 라이브 `data/index.js` 에 최신 판 id 가 반영되고 **라이브 `data/<최신 판>.js`·`assets/app.js`·`sw.js` 내용이 로컬과 같아질 때까지** 대기(같은 판을 보강해 다시 올린 경우도 잡음, 최대 15분, `DEPLOY_TIMEOUT`) → `tools/verify_live.py` 로 390px 모바일 화면을 헤드리스 브라우저로 열어 첫 방문 온보딩('파타야 거주자' 선택)·최신 판·내 피드·브리핑·👍👎·오류·외국인·비자 탭 카드 수·X 트렌드 섹션·메뉴가 없음·한국 뉴스(`koreaSrc` live/edition, `koreaUpd`)·서비스 워커·manifest 확인, `screenshots/live-mobile-390.png`·`-onboarding.png`·`-visa.png` 저장
  - 실패하면 0이 아닌 종료 코드로 끝남 → 원인 확인 후 다시 실행
- **올리지 않는 것**(`.gitignore`): `raw/`(제3자 기사 원문 — 저작권), `archive/`, `screenshots/`, 캐시(`__pycache__` 등), 비밀 파일(`.env`, `*.key`, `*.pem`)
- 푸터 고지: '태국 언론 보도를 한국어로 요약·번역한 개인 프로젝트입니다. 원문 링크를 확인하세요.'
- 검색 노출 방지(공유하더라도 당분간 유지): `index.html` 에 `<meta name="robots" content="noindex, nofollow">`, `robots.txt` 전부 차단.
  (프로젝트 Pages 라 `robots.txt` 는 도메인 루트가 아니어서 크롤러가 읽지 않을 수 있음 → 실제 효력은 meta 태그. 공개 저장소이므로 주소를 아는 사람은 누구나 볼 수 있음)

## 번역 규칙
반드시 `tools/TRANSLATION_RULES.md`를 읽고 모든 기사·제목 번역에 적용할 것.
국가가 모호한 주어에는 `태국`(한국 주체는 `한국`)을 붙이는 주체 명시 규칙도 모든 번역 문구에 적용한다.
