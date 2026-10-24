# Claude 비상 발행 절차 (2026-10-23 맥스님 승인)

Claude 예약 작업이 이 문서를 그대로 따른다. 사람도 읽을 수 있게 짧게 쓴다.
설계 배경: `ops/SYSTEM_PLAN.md` 2절. 판 담당 표시: `tools/edition_claim.py`. 후보: `candidates` 브랜치(코드 수집).

## 0. 언제 무엇을 하나
| 방콕 시각 | 판 | 할 일 |
|---|---|---|
| 07:00 · 18:00 | 한국어 am · pm | `ops/emergency.json` 의 `act_at_start` 가 true 이고, 담당 표시(claim)가 없고, 판도 없으면 → 비상 발행. 아니면 아무것도 안 함 |
| 07:30 · 18:30 | 한국어 am · pm | 판이 main 의 `data/index.json` latest 에 없으면 → 비상 발행(다른 담당이 표시만 하고 멈춘 경우 포함, `take`) |
| 13:30 | 중국어 md | 중국어판 저장소 `data/index.json` latest 가 오늘 md 가 아니면 → 중국어판 발행 |

판이 이미 있으면 그 자리에서 끝낸다(토큰 쓰지 않음). 확인만 하고 끝난 실행은 기록도 남기지 않는다.

## 1. 확인 (판이 있는지)
- 판 id: `YYYY-MM-DD-am|pm|md` (방콕 날짜).
- 저장소를 받는다: `git clone --depth 30 https://github.com/P-Max168/thai-news-kr` (중국어판은 `thai-news-zh`).
- `python3 -c "import json;print(json.load(open('data/index.json'))['latest'])"` 가 오늘 판이면 끝.
- `python3 tools/edition_claim.py status <판 id>` 로 담당 표시 확인.
- 07:00·18:00 실행에서는 `ops/emergency.json` 을 먼저 본다. `act_at_start=false` 이거나, 지금(방콕)이 `act_at_start_from` 보다 이르면 끝(그 전엔 Codex 가 07:08·18:08 시작). 그록 예약은 10-23 에 06:40·17:40 으로 바뀜(일시 중지 상태, 10-26 재개).

## 2. 비상 발행 (한국어판)
1. 담당 표시: 07:00·18:00 이면 `python3 tools/edition_claim.py claim claude <판 id>`, 07:30·18:30 이면 `take`. HOLD 면 끝.
2. 후보: `bash tools/fetch_candidates.sh <판 id>` (am 은 06:05, pm 은 17:05 수집분). exit 3 이면 `bash tools/fetch_candidates.sh` (판 id 없이 — 가장 최근 수집분) 로 받고 coverage 에 적는다.
3. 기사 고르기: `drafts/candidates/latest.md` 와 `drafts/gnews/latest.md` 에서 **8~12건**(비상판은 적어도 됨). README '고르는 규칙'·`tools/TRANSLATION_RULES.md` 를 따른다. 동부(파타야)·외국인·비자·치안·날씨 우선.
4. 원문 확인: 사이트에 직접 붙지 못하므로 **웹 읽기 도구(WebFetch)** 로 원문을 열어 사실·숫자·게재 시각을 확인한다. Google News 링크는 원 매체 페이지를 검색해 찾는다. 확인 못 한 기사는 빼다.
5. 편집 파일: `tools/editions/_template.py` 를 복사해 `tools/editions/<판 id>.py`. highlights 3개, briefing 4~7줄 필수. 금액은 "바트(약 N원)" — 환율은 `data/ticker.json` 의 fx.THB_KRW 하나.
6. 빌드: `python3 tools/build_data.py tools/editions/<판 id>.py` — 검증 통과할 때까지 고친다(점검 경고는 괜찮음).
7. 배포: `TNK_PUBLISHER=claude TNK_LIVE_CHECK=pages bash tools/deploy.sh` (사이트 직접 확인 대신 GitHub Pages 빌드 성공으로 확인). 공유 이미지(share_kit)는 시간이 되면 `python3 tools/share_kit.py <판 id>` 후 한 번 더 deploy.
8. 기록: `collab/STATUS.md` '최근 인수인계' 표 맨 위에 한 줄 — `| 시각 | Claude | 비상 발행 <판 id> N건 | 이유: (담당 표시 없음 / 그록 멈춤 등) |`. `DEV_LOG.md` 맨 아래에 한 줄. 커밋·push(`git pull --rebase` 후 일반 push, force 금지).

## 3. 중국어판 (13:30)
1. 판 id `YYYY-MM-DD-md`. 중국어판 저장소에서 `python3 tools/edition_claim.py take claude <판 id>` (중국어판은 지금 정기 담당이 없어 Claude 가 맡음).
2. 후보: **먼저 중국어판 저장소 자체 수집**(`git fetch origin candidates && git show origin/candidates:candidates/latest.md > drafts/candidates/latest.md`, 11:47·12:37 수집 — 2026-10-24 분리). 없거나 오늘 것이 아니면 중국어판 collect.yml 을 workflow_dispatch 로 실행하고 4분 뒤 다시 받는다. 그래도 없으면 한국어판 저장소의 `candidates` 브랜치(12:20 수집분)를 같은 방법으로 받는다 — 중국어판 폴더 안에서 `git fetch https://github.com/P-Max168/thai-news-kr +candidates:refs/remotes/kr/candidates` 후 `git show kr/candidates:candidates/latest.md > drafts/candidates/latest.md`.
   - **수집이 낡았으면 먼저 깨운다(2026-10-24 추가):** GitHub 예약은 늦거나 빠진다(10-23·24 이틀 모두 12:20 수집 없음, 06:05 수집은 08:20 대에 돎). `git show kr/candidates:meta.json` 의 `collected_at` 이 2시간보다 오래됐으면 GitHub 도구(actions_run_trigger, workflow collect.yml, ref main)로 수집을 직접 실행하고 4분쯤 뒤 다시 받는다. 실패하면 있는 수집분으로 진행하고 coverage 에 적는다.
3. 편집 기준은 중국어판 저장소의 `tools/TRANSLATION_RULES.zh.md`·`ROUTINE_MD.md` 2~3번(涉华·签证·治安 우선, 간체, 한글·태국 문자 금지, 금액 '350泰铢（约70元）' — 환율은 data/ticker.json 의 THB_CNY).
4. 빌드: `TNK_TEST=1 bash tools/lang_build.sh build <판 id>` 가 'BUILD OK' 가 될 때까지.
5. 배포: `TNK_PUBLISHER=claude TNK_LIVE_CHECK=pages bash tools/deploy.sh`.
6. 기록: 한국어판 저장소 `collab/STATUS.md` 에 한 줄.

## 3-1. 지난 실행에서 배운 것 (시간 아끼기, 2026-10-24)
- **원문 열기:** 클라우드 세션은 뉴스 사이트에 직접 못 붙는다(curl 차단). WebFetch 는 대화에 나온 적 없는 URL 이면 승인을 기다리다 실패한다. 순서: ① WebSearch 로 기사 제목을 검색해 주소를 대화에 올린 뒤 WebFetch ② 매체 첫 화면(예: https://www.pattayamail.com/)을 열어 최신 기사 주소 목록을 받은 뒤 WebFetch. 후보 파일의 news.google.com 링크를 바로 열지 않는다.
- **WebFetch 는 요약 답을 준다:** 숫자·이름·시각은 프롬프트에 "exact numbers, publish time" 을 꼭 넣어 받고, 애매하면 쓰지 않는다.
- **RSS 요약문:** candidates json/md 의 `summary`(있으면)로 1차 판단 — 원문 확인을 대신하지는 않는다.
- **편집 파일 검증에 자주 걸리는 것:** `related` 는 dict 목록(기사 id 문자열 아님, 모르면 `[]`) · `quick_replies` 는 3~4개 필수 · 제목·브리핑의 泰铢 금액에도 `（约N元）` · 이미 전 판에 실은 사건은 빼거나 update 로.
- **배포 권한:** 예약 실행에서 deploy.sh 가 '실서비스 배포'로 거부되면, 예약 작업의 자동 승인(Automatically approve)이 꺼져 있는 것 — 편집·빌드까지 하고 STATUS 에 남긴 뒤 맥스님께 알린다.

## 4. 하지 않는 것
- 질문·운영자 댓글 공개, 광고·검색·개인정보 설정 변경(맥스님 승인 필요).
- force push, 이번 판이 아닌 다른 판의 데이터 수정.
- 확인 못 한 사실 쓰기. 기사 수를 채우려고 약한 기사 넣기.

## 5. 실패하면
- 어느 단계에서 왜 멈췄는지 `collab/STATUS.md` 에 한 줄 남기고 끝낸다(다음 확인 시각에 다시 본다).
