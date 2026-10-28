# Claude 비상 발행 절차 (2026-10-23 맥스님 승인)

Claude 예약 작업이 이 문서를 그대로 따른다. 사람도 읽을 수 있게 짧게 쓴다.
설계 배경: `ops/SYSTEM_PLAN.md` 2절. 판 담당 표시: `tools/edition_claim.py`. 후보: `candidates` 브랜치(코드 수집).

## 0. 언제 무엇을 하나
시각은 `ops/SCHEDULE_3EDITION.md` 표의 Claude 비상 열과 같다(2026-10-28 맥스: 사이트별 표 시각 유지).

| 방콕 시각 | 판 | 할 일 |
|---|---|---|
| 07:00 · 18:00 | 한국어 am · pm | `ops/emergency.json` 의 `act_at_start` 가 true 이고, 담당 표시(claim)가 없고, 판도 없으면 → 비상 발행. 아니면 아무것도 안 함 |
| **07:30 · 12:30 · 18:30** | 한국어 am · md · pm | 판이 main 의 `data/index.json` 에 오늘 해당 슬롯이 없으면 → 비상 발행(다른 담당이 표시만 하고 멈춘 경우 포함, `take`) |
| **08:10 · 13:10 · 19:10** | 중국어 am · md · pm | 중국어판 저장소에서 오늘 해당 슬롯이 없으면 → 비상 발행. 절차는 `thai-news-zh/ops/EMERGENCY_PUBLISH.md` |

판이 이미 있으면 그 자리에서 끝낸다(토큰 쓰지 않음). 확인만 하고 끝난 실행은 기록도 남기지 않는다.

## 1. 확인 (판이 있는지)
- 판 id: `YYYY-MM-DD-am|pm|md` (방콕 날짜).
- 저장소를 받는다: `git clone --depth 30 https://github.com/P-Max168/thai-news-kr` (중국어판은 `thai-news-zh`).
- `python3 -c "import json;print(json.load(open('data/index.json'))['latest'])"` 가 오늘 판이면 끝.
- `python3 tools/edition_claim.py status <판 id>` 로 담당 표시 확인.
- 07:00·18:00 실행에서는 `ops/emergency.json` 을 먼저 본다. `act_at_start=false` 이거나, 지금(방콕)이 `act_at_start_from` 보다 이르면 끝(그 전엔 Codex 가 07:08·18:08 시작). 그록 예약은 10-23 에 06:40·17:40 으로 바뀜(일시 중지 상태, 10-26 재개).

## 2. 비상 발행 (한국어판)
0. (10-26 추가) 이어받기(take) 전에 제미나이 실행 확인: `gh run list -R P-Max168/thai-news-kr --workflow gemini-edition.yml -L 3 --json status,createdAt,headSha` (중국어판은 thai-news-zh). 오늘 이 판 회차에 queued·in_progress 실행이 있으면 take 하지 말고 1분 간격으로 최대 15분(07:45·13:45·18:45) 기다렸다가 판이 나왔는지 다시 본다. 실행이 실패로 끝났거나 15분이 지나도 판이 없을 때만 take.
1. 담당 표시: 07:00·18:00 이면 `python3 tools/edition_claim.py claim claude <판 id>`, 07:30·12:30·18:30 이면 `take`(위 0번 확인 뒤). HOLD 면 끝.
2. 후보: `bash tools/fetch_candidates.sh <판 id>` (am 은 03:37~05:37, pm 은 14:37~16:37 수집분 — GitHub 예약이 늦을 수 있음). exit 3 이면 `bash tools/fetch_candidates.sh` (판 id 없이 — 가장 최근 수집분) 로 받고 coverage 에 적는다.
3. 기사 고르기: `drafts/candidates/latest.md` 와 `drafts/gnews/latest.md` 에서 **8~12건**(비상판은 적어도 됨). README '고르는 규칙'·`tools/TRANSLATION_RULES.md` 를 따른다. 동부(파타야)·외국인·비자·치안·날씨 우선.
4. 원문 확인: 사이트에 직접 붙지 못하므로 **웹 읽기 도구(WebFetch)** 로 원문을 열어 사실·숫자·게재 시각을 확인한다. Google News 링크는 원 매체 페이지를 검색해 찾는다. 확인 못 한 기사는 빼다.
5. 편집 파일: `tools/editions/_template.py` 를 복사해 `tools/editions/<판 id>.py`. highlights 3개, briefing 4~7줄 필수. 금액은 "바트(약 N원)" — 환율은 `data/ticker.json` 의 fx.THB_KRW 하나.
6. 빌드: `python3 tools/build_data.py tools/editions/<판 id>.py` — 검증 통과할 때까지 고친다(점검 경고는 괜찮음).
7. 배포: `TNK_PUBLISHER=claude TNK_LIVE_CHECK=pages bash tools/deploy.sh` (사이트 직접 확인 대신 GitHub Pages 빌드 성공으로 확인). 공유 이미지(share_kit)는 시간이 되면 `python3 tools/share_kit.py <판 id>` 후 한 번 더 deploy.
8. 기록: `collab/STATUS.md` '최근 인수인계' 표 맨 위에 한 줄 — `| 시각 | Claude | 비상 발행 <판 id> N건 | 이유: (담당 표시 없음 / 그록 멈춤 등) |`. `DEV_LOG.md` 맨 아래에 한 줄. 커밋·push(`git pull --rebase` 후 일반 push, force 금지).

## 3. 중국어판 (08:10 am · 13:10 md · 19:10 pm)
자세한 절차는 중국어판 저장소 `ops/EMERGENCY_PUBLISH.md` 를 따른다(2026-10-28 표 시각과 맞춤). 요약:
1. 판 id `YYYY-MM-DD-am|md|pm`. thai-news-zh 의 gemini-edition 실행을 먼저 확인한 뒤 `python3 tools/edition_claim.py take claude <판 id>`.
2. 후보: 한국어판 `candidates` 브랜치(슬롯별 07:20·12:20·18:20 수집분).
3. 편집·빌드·배포·기록: `thai-news-zh/ops/EMERGENCY_PUBLISH.md` 3절.

## 4. 하지 않는 것
- 질문·운영자 댓글 공개, 광고·검색·개인정보 설정 변경(맥스님 승인 필요).
- force push, 이번 판이 아닌 다른 판의 데이터 수정.
- 확인 못 한 사실 쓰기. 기사 수를 채우려고 약한 기사 넣기.

## 5. 실패하면
- 어느 단계에서 왜 멈췄는지 `collab/STATUS.md` 에 한 줄 남기고 끝낸다(다음 확인 시각에 다시 본다).
