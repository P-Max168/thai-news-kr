# 협업 상태판 (Grok ↔ Claude)
> 항상 **최신 상태 1개 표**만 유지한다. 규칙은 `collab/GROK_PROMPT.md`.

| 항목 | 내용 |
|---|---|
| 마지막으로 확인한 사이트 최신 판 | **2026-10-15-pm** (라이브 data/index.json `latest`, 판 generated 2026-10-15T18:21:05+07:00, 22건 · 커밋 37dc8e4·02d2170(공유 키트) · 확인: 2026-10-15 18:25 BKK, Grok — verify_live OK, e/2026-10-15-pm/ 200) |
| 정기 실행(07:08/18:08) | **10-15 18:08 정기 저녁판 도착**: edition 커밋 37dc8e4(18:22 push)·공유 키트 02d2170(18:23 push) · verify_live OK. 직전 10-15 07:08 아침판도 정기(004862c·232acf8) |
| 판 지연 | 10-05-pm ~ 10-10-pm **11판 빠짐**(6일 공백, 목록: Grok 서버 /workspace/logs/edition-gaps.txt). **재생성 안 함**(운영자·Max 결정 10-11: 옛 뉴스를 지금 판처럼 올리지 않음) |
| 진행 중 작업 | 💬 오늘의 질문 2026-10-15-pm 22건 승인 대기(approved false). 10-14-pm·10-15-am 은 10-15 11:47 게시 완료(79c0d2a, ea2 원화 정정 포함) |
| 사이트 주소(10-14) | **https://tnews.pmaxone.com** (GitHub Pages 맞춤 도메인, DNS 는 Cloudflare CNAME tnews→p-max168.github.io DNS only). 옛 주소 p-max168.github.io/thai-news-kr/ 는 301 로 넘어감. Grok 도메인 작업 끝나면 Claude 가 이어받음 — 인계 문서 Grok 서버 /workspace/handoff/TNEWS_DOMAIN_HANDOFF.md |

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
- **갱신(10-12)**: 10-12 07:08 아침판·18:08 저녁판 모두 정기 빌드 성공(automation.log·커밋 근거).

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
| 2026-10-15 18:25 | Grok | 2026-10-15-pm 저녁판 정기 빌드(22건, 문서·판 데이터만) | 💬 초안 22건 승인 대기(approved false). 환율 39.83 = ticker.json fx(39.8254, open.er-api, rate_time 10-15 07:02 BKK, 16:11 조회) + 18:15 직접 조회 같은 값. screenshot ALL OK(👎 거짓 실패 안 남). 후속: 출국세 업계 반대(vi4, issue=None+update)·라용 전자 폐기물 공장 폐쇄(ea1, issue=None+update)·16일 펀찟/MRT 시리킷 통제(bk1). 파타야 한국인 남성 체포(vi1, 274일 오버스테이). 실패 소스 2: Pattaya City(SSL)·Air4Thai(timeout). korea_top 은 data/korea.json(16:11) 6건 GN decode. |
| 2026-10-15 07:30 | Grok | 2026-10-15-am 아침판 정기 빌드(17건, 문서·판 데이터만) | 💬 초안 17건 승인 대기(approved false). 환율 39.83 = open.er-api 직접 조회(공시 10-15 00:02 UTC; ticker.json rate_time 10-14 07:02 이라 미사용). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi1 단독 고정 카드). Google News 날짜만 새것인 옛 기사 4건 제외(The Standard 등). 출국세·전자 폐기물 새 전개 없음. korea_top 은 data/korea.json(06:04) 6건 GN decode. ent 0건. |
| 2026-10-14 18:28 | Grok | 2026-10-14-pm 저녁판 정기 빌드(17건, 문서·판 데이터만) | 💬 초안 17건 승인 대기(approved false). 환율 39.95 = ticker.json fx(rate_time 10-14 07:02 BKK, 조회 16:12). 출국세는 핫야이 육로 면제 요청·한국 매체 후속(issue id 없어 issue=None). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi2). korea_top 은 data/korea.json(16:12) 6건 GN decode. ent 0건(실제 후보 약함). |
| 2026-10-14 07:29 | Grok | 2026-10-14-am 아침판 정기 빌드(14건, 문서·판 데이터만) | 💬 초안 14건 승인 대기(approved false). 환율 39.95 = open.er-api 직접 조회(공시 10-14 00:02 UTC; ticker.json rate_time 10-13 06:57 이라 미사용). 라용 전자 폐기물 후속(ea1)·출국세 재탕은 제외. issues.json 이슈 id 없어 ea1은 issue=None+update. screenshot ALL OK. korea_top 은 data/korea.json(06:04) 6건 GN decode |
| 2026-10-13 18:31 | Grok | 2026-10-13-pm 저녁판 정기 빌드(20건, 문서·판 데이터만) | 💬 초안 20건 승인 대기(approved false). 환율 39.68 = ticker.json fx(공시 06:57, 17:58 조회, 신선). 아침판 후속 2건(출국세 vi3·라용 전자 폐기물 ea4)은 issues.json 에 이슈 id 가 없어 `issue=None`+`update` 로만 연결 → REQUESTS 에 이슈 id 추가 요청. screenshot.py 이번엔 ALL OK(👎 거짓 실패 안 남). fetch_korea 후보 수집은 됐지만 korea_top 은 data/korea.json(17:58) 6건 decode |
| 2026-10-13 07:33 | Grok | 2026-10-13-am 아침판 정기 빌드(19건, 문서·판 데이터만) | 💬 초안 19건 승인 대기(`drafts/discussion/2026-10-13-am.json`, approved false). 판 환율 39.68 — ticker.json(40.0052)이 오래돼 open.er-api 직접 조회값 사용(fx.source 기록). 새 issue id 는 issues.json(Claude 영역)이라 추가 안 함. screenshot 👎 FAIL 1 은 알려진 거짓 실패(vi3 비자 고정 묶음 단독). 10-12-pm ea3 요약에 오타 '다시  Imp대해' 남아 있음(옛 판, 미수정). |
| 2026-10-12 18:25 | Grok | 2026-10-12-pm 저녁판 정기 빌드(18건, 문서·판 데이터만) | 💬 초안 18건 승인 대기(`drafts/discussion/2026-10-12-pm.json`, approved false). fetch_korea TOP RSS 404라 korea_top 은 data/korea.json decode 6건. [Grok→Claude] screenshot 👎 검사 요청은 아침과 동일 대기 |
| 2026-10-12 07:31 | Grok | 2026-10-12-am 아침판 정기 빌드(18건, 문서·판 데이터만) | `tools/screenshot.py` 👎 재정렬 검사가 이번 판에서 FAIL 1 — 원인: 내 피드 첫 카드가 📌 비자 고정 묶음의 **유일한** 카드(vi2)라 👎 해도 순서가 안 바뀜(화면 정상, 검사 가정 문제). REQUESTS 에 [Grok→Claude] 남김 |
| 2026-10-11 09:34 | Grok | `collab/` 인수인계 확인, STATUS 질문 3개 답, REQUESTS Claude 요청 완료 처리 (문서만) | 이제 Grok은 workflows·tools(editions 제외)·화면 코드를 직접 고치지 않고 `REQUESTS.md` 에 [Grok→Claude] 로 남김. GROK_PROMPT 5번 '누락 판을 만든다'는 운영자·Max 결정(재생성 안 함)과 충돌 → Grok은 재생성 안 함 |
| 2026-10-11 08:31 | Grok | **edition-watch 신설**(`.github/workflows/edition-watch.yml` + `tools/edition_watch.py`): 라이브 index.json 의 latest·generated 가 기대 판보다 90분 넘게 늦으면 GitHub 이슈 `edition-gap` 1번(같은 공백은 한 번만). **korea.yml 예비 예약 4번 추가**(Actions 예약 누락 대비). 커밋 30cf391, 백업 `backup-20261011-0827-edition-watch` | **⚠️ 이제 이 둘은 Claude 영역**(workflows·tools). Grok은 직접 안 고침. 미확인: 실제 공백 때 이슈가 열리는지·메일 알림. 같은 날 08:19 regress·ship.sh·edition_stale 수정(cd3b359)도 Claude 영역으로 넘김 |

## 잠금 (지금 누가 어떤 파일을 고치는 중인지)
| 파일 | 누가 | 시작 시각 |
|---|---|---|
| (없음) | | |
