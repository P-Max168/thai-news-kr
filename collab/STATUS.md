# 협업 상태판 (Grok ↔ Claude)
> 항상 **최신 상태 1개 표**만 유지한다. 규칙은 `collab/GROK_PROMPT.md`.

| 항목 | 내용 |
|---|---|
| 마지막으로 확인한 사이트 최신 판 | **2026-10-11-pm** (라이브 data/index.json `latest`, 판 generated 2026-10-11T18:20:47+07:00, 20건 · 커밋 93cd961·230b3b2(공유 키트) · 확인: 2026-10-11 18:40 BKK, Grok) |
| 정기 실행(07:08/18:08) | **10-11 18:08 정기 저녁판 도착**(automation.log `10-11 18:09:05 START pm-build` → `18:24:32 END pm-build ok`) — 10-05 07:09 이후 첫 정기 실행 도착. 18:38 대체 루틴은 `대체 빌드 불필요`로 끝. 07:08 정기 아침판은 10-11 에도 안 옴(07:38 대체 루틴이 빌드) |
| 판 지연 | 10-05-pm ~ 10-10-pm **11판 빠짐**(6일 공백, 목록: Grok 서버 /workspace/logs/edition-gaps.txt). **재생성 안 함**(운영자·Max 결정 10-11: 옛 뉴스를 지금 판처럼 올리지 않음) |
| 진행 중 작업 | (없음) · 10-11-pm 💬 오늘의 질문 초안 20건 운영자 승인 대기(미적용) · 다음 판: 10-12-am 07:08 정기(안 오면 07:38 대체 루틴) |

## Claude 질문 3개에 대한 Grok 답 (2026-10-11 09:34 BKK)
근거 원본은 Grok 서버 `/workspace/logs/automation.log`(Claude 접근 불가)라 해당 줄을 그대로 옮긴다.

**1. 정기 실행 상태와 마지막 성공**
- 마지막 정기 아침판 빌드(07:08 루틴)의 START·END:
  - `10-05 07:09:56 START am-build pid=1697957 head=285f67b`
  - `10-05 07:26:22 END   deploy ok exit=0 344d7e5` (그 전 `07:24:53 END deploy fail exit=1 716ba5c` 는 점검 도구 오류, 07:26 재배포 성공)
  - `10-05 07:27:03 END   am-build ok`
- 그다음 START 는 6일 뒤 대체 루틴 한 줄뿐(그 사이 START 0줄):
  - `10-11 07:38:49 START backup-check pid=736385 head=f6ac579`
  - `10-11 07:48:38 END   deploy ok exit=0 8127d56`
  - `10-11 07:49:01 END   deploy ok exit=0 8f1fd6a`
- 결론: 마지막 **정기** 성공 = 10-05 07:27(am-build ok). 마지막 **판 배포** 성공 = 10-11 07:49(대체 루틴). 10-11 07:08 정기 아침판은 오늘도 상자에 오지 않음(루틴 실행 기록상 failed, automation.log 에 07:08대 START 없음).

**2. 10-05 이후 정지 원인**
- 확인된 사실: 07:08·18:08 정기 루틴과 07:38·18:38 대체 루틴이 **상자 밖 루틴 실행기에서 시작되지 않아** 상자의 preflight 까지 오지 못함(START 줄 자체가 없음 = 상자 안 스크립트가 실패한 게 아니라 실행이 안 옴). 대체 루틴도 같은 실행기를 써서 같이 멈춤.
- 오늘(10-11) 실행기 일부 복구: 07:38 대체 루틴 도착(판 배포) · 09:28 BKK 댓글 점검 루틴 실행 성공(루틴 실행 기록 기준, automation.log 에는 이 루틴 줄 없음). 단 07:08 정기 아침판은 오늘도 실패.
- **근본 원인(실행기가 왜 안 왔는지): 미확인.** 상자 안 코드 문제 근거는 없음.
- 상자와 다른 고장점의 감시: GitHub Actions `edition-watch.yml`(10-11 08:28 추가) — 예약 실행 2회 성공(10-11 08:54·08:56 BKK, 정상이라 조용).

**3. 진행 중·미반영 변경(stash 포함)**
- `git stash list` 0줄 — 개발 폴더(tnk-dev)·정본(/workspace/thai-news-portal) 둘 다(2026-10-11 09:34 확인).
- 정본: rebase 중 아님, origin 보다 앞선 커밋 0. 미반영 코드 변경 없음.

## 최근 인수인계 (상대 AI가 작업 시작 전에 꼭 읽기 — 새것이 위, 최대 10줄 유지)
| 시각 | 누가 | 무엇을 바꿨나 | 상대가 알아야 할 것 |
|---|---|---|---|
| 2026-10-11 09:34 | Grok | `collab/` 인수인계 확인, STATUS 질문 3개 답, REQUESTS Claude 요청 완료 처리 (문서만) | 이제 Grok은 workflows·tools(editions 제외)·화면 코드를 직접 고치지 않고 `REQUESTS.md` 에 [Grok→Claude] 로 남김. GROK_PROMPT 5번 '누락 판을 만든다'는 운영자·Max 결정(재생성 안 함)과 충돌 → Grok은 재생성 안 함 |
| 2026-10-11 08:31 | Grok | **edition-watch 신설**(`.github/workflows/edition-watch.yml` + `tools/edition_watch.py`): 라이브 index.json 의 latest·generated 가 기대 판보다 90분 넘게 늦으면 GitHub 이슈 `edition-gap` 1번(같은 공백은 한 번만). **korea.yml 예비 예약 4번 추가**(Actions 예약 누락 대비). 커밋 30cf391, 백업 `backup-20261011-0827-edition-watch` | **⚠️ 이제 이 둘은 Claude 영역**(workflows·tools). Grok은 직접 안 고침. 미확인: 실제 공백 때 이슈가 열리는지·메일 알림. 같은 날 08:19 regress·ship.sh·edition_stale 수정(cd3b359)도 Claude 영역으로 넘김 |
| 2026-10-06 | Claude | `collab/` 폴더 신설(지시문·상태판·요청·기록). 코드 변경 없음 | Grok은 작업 전 `GROK_PROMPT.md` 4-0번(인수인계 읽기)과 5번(질문 3개)에 답할 것 |

## 잠금 (지금 누가 어떤 파일을 고치는 중인지)
| 파일 | 누가 | 시작 시각 |
|---|---|---|
| (없음) | | |
