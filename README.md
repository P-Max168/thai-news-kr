# 태국 뉴스 한눈에 (샘플)

태국 현지 언론(가능하면 태국어 원문)을 자연스러운 한국어로 옮겨 요약한 개인용 정적 뉴스 포털입니다.

## 열어보기
- 그냥 `index.html`을 더블클릭하면 됩니다(file:// 지원, fetch를 쓰지 않음).
- 또는 `python3 -m http.server 8765` 실행 후 http://127.0.0.1:8765/ 접속.
- 기본 화면 = **가장 최신 판**(`data/index.json`의 첫 번째 = `latest`).
- `?date=2026-09-29-am`처럼 판 id로 지정. 예전 형식 `?date=2026-09-29`(날짜만)는 그날의 최신 판으로 연결됩니다.
- `#p1`처럼 기사 id로 바로 열기 가능(예: `?date=2026-09-29-am#l1`).
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
- `tools/newslib.py`  : 판 저장(`write_edition`) + 검증 + index 재생성(`build_index`). 이름 규칙·라벨이 여기 정의돼 있음
- `tools/build_data.py` : 진입점. `python3 tools/build_data.py tools/editions/<id>.py` → json/js 저장 + index 갱신. 인자 없이 실행하면 index만 재생성
- `tools/editions/<id>.py` : 판별 편집 파일(기사 목록·브리핑·주요뉴스·트렌드)
- `tools/screenshot.py` : Playwright 스크린샷(데스크톱 1280, 모바일 390, 이전 판 화면, 판 선택 목록 출력). 로컬 서버(`python3 -m http.server 8765`)를 먼저 띄울 것
- `raw/<id>/`         : 그 판을 만들 때 수집한 RSS·원문 텍스트(출처 확인용). `raw/` 바로 아래 파일들은 새벽판 수집분, `raw/morning/`은 저장에 실패한 07:08 실행이 남긴 RSS(미검증 참고용)
- `archive/legacy/`   : 더 이상 쓰지 않는 옛 파일(사이트에서 읽지 않음)

## 기사 스키마
`id, category(politics|economy|society|local|sns), headline, summary[문단], context(배경 설명), update(이전 판 이후 새로 나온 내용, 후속 기사일 때만), source, url, title_th, published(ISO, +07:00), related[{source,title,url}], tags[], region(지역 기사), highlight`

최상위: `id, date, edition(am|pm|early), edition_label, generated, coverage, previous(직전 판 id), briefing, highlights[id 3개], stories[], trends{items[], source, url, fetched, note}`
(※ `2026-09-29-early`는 옛 형식이라 `id/edition_label` 등이 없지만 index가 파일 이름으로 판을 알아내므로 그대로 동작)

## 정기 실행(07:08 / 18:08) 절차
1. 수집: 태국어 원문 우선(Thairath·Matichon·Khaosod·Prachachat RSS, PPTV·TOP NEWS·MGR·Thai Ch8·The Pattaya News, Google News RSS 태국어 검색: พัทยา ศรีราชา ชลบุรี สัตหีบ แหลมฉบัง บางละมุง จอมเทียน). 원문은 `raw/<id>/`에 저장.
   - Google News 날짜는 믿지 말 것: 며칠 전 기사가 새로 뜨는 경우가 많음 → 원문 페이지의 게재 시각을 확인(최대 48시간).
2. 직전 판(`data/index.json`의 `latest`)과 겹치는 기사는 빼고, 실제 후속 전개가 있을 때만 싣되 `update`에 무엇이 새로운지 적는다.
3. `tools/editions/<id>.py` 작성 (기존 파일 복사 → `id/date/edition/generated/previous/briefing/highlights/stories/trends` 교체). 뉴스·인용·숫자·URL은 절대 지어내지 않는다.
4. `python3 tools/build_data.py tools/editions/<id>.py` (검증 실패 시 예외로 멈춤)
5. `python3 -m http.server 8765 &` → `python3 tools/screenshot.py` → `screenshots/`의 이미지를 직접 보고 문제 수정.
6. **배포(필수)**: `bash tools/deploy.sh` — 아래 'Deploy' 참고. 07:08·18:08 정기 실행은 판을 만든 뒤 **매번** 실행할 것.

## Deploy (GitHub Pages)
- 저장소: https://github.com/P-Max168/thai-news-kr (공개 — 무료 Pages 조건)
- 라이브: https://p-max168.github.io/thai-news-kr/ (휴대폰에서 이 주소로 열기)
- Pages 설정: `main` 브랜치 루트(`/`). `.nojekyll` 로 Jekyll 처리 끔.
- **매 정기 실행(07:08 / 18:08 방콕)은 판을 만든 뒤(위 4~5단계) 반드시 `bash tools/deploy.sh` 를 실행한다.**
  - 사이트 파일(index.html, assets/, data/, tools/, README.md 등)의 새 파일·변경분을 `edition <id>` 메시지로 커밋 → `main` 에 push
  - force-push 금지(스크립트도 하지 않음). push 가 거부되면 `git pull --rebase` 후 일반 push
  - 라이브 `data/index.js` 에 최신 판 id 가 반영될 때까지 대기(최대 15분, `DEPLOY_TIMEOUT`) → `tools/verify_live.py` 로 390px 모바일 화면을 헤드리스 브라우저로 열어 최신 판·기사·오류 여부 확인, `screenshots/live-mobile-390.png` 저장
  - 실패하면 0이 아닌 종료 코드로 끝남 → 원인 확인 후 다시 실행
- **올리지 않는 것**(`.gitignore`): `raw/`(제3자 기사 원문 — 저작권), `archive/`, `screenshots/`, 캐시(`__pycache__` 등), 비밀 파일(`.env`, `*.key`, `*.pem`)
- 검색 노출 방지: `index.html` 에 `<meta name="robots" content="noindex, nofollow">`, `robots.txt` 전부 차단.
  (프로젝트 Pages 라 `robots.txt` 는 도메인 루트가 아니어서 크롤러가 읽지 않을 수 있음 → 실제 효력은 meta 태그. 공개 저장소이므로 주소를 아는 사람은 누구나 볼 수 있음)
