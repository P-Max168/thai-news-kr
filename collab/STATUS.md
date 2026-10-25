# 협업 상태판 (Grok ↔ Claude)
> 항상 **최신 상태 1개 표**만 유지한다. 규칙은 `collab/GROK_PROMPT.md`.

| 항목 | 내용 |
|---|---|
| 마지막으로 확인한 사이트 최신 판 | **2026-10-23-pm** · 18:23 게시 및 18:40 라이브 재검증 완료(0029dba). 2026-10-24-am 7건 준비·검증 중, 게시 후 라이브 확인 예정. |
| 정기 실행(07:08/18:08) | Codex 대행(ops/publisher.json). 10-24 07:09 호출·claim/codex 표시 후 수집. Claude 비상 인수 및 자동 지연 판정 규칙 확인. Grok 내부 로그 직접 확인 불가. |
| 판 지연 | 10-05-pm ~ 10-10-pm **11판 빠짐**(6일 공백, 목록: Grok 서버 /workspace/logs/edition-gaps.txt). **재생성 안 함**(운영자·Max 결정 10-11: 옛 뉴스를 지금 판처럼 올리지 않음) |
| 진행 중 작업 | 💬 오늘의 질문 2026-10-18-am 15건 승인 대기(approved false). 10-17-pm 17건은 게시 완료(95235d9). **민구님 10-18 08:00 승인: Claude 대기 요청 R-seo-1~4·R-zh-1~9 를 Grok 이 직접 처리**(Claude 10-11 이후 커밋 없음). R-seo-1~4 완료(10-18 08:12). R-zh-1~9 공유 코드 완료(10-18 08:40, DEV_LOG zh-shared-1018) — 공개 전 Mingoo 승인 대기: zh 저장소 생성·Cloudflare zh CNAME·Firebase 규칙 게시·zh 광고 문구 |
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
| 10-25 10:15 | Claude | 새 그록봇 인수인계 문서 ops/GROK_HANDOFF.md 작성(맥스님 결정: 모든 채널 발행=새 그록, 번역=Gemini API) | Gemini 번역 코드 아직 없음·새 그록 실행 능력(셸·push·예약) 미확인. 판 절차는 기존 그대로 |
| 10-25 07:46 | Claude | 비상 발행 2026-10-25-am 8건 (2e28327, Pages 빌드 성공) | 이유: 07:30 확인 시 판·담당 표시 없음 → claim take claude. 06:05 자동 수집분(candidates) 없음 — collect.yml 확인 필요. 클라우드 직접 수집은 0/262(차단)라 웹 검색·읽기로 원문 확인한 8건만 |
| 10-24 18:49 | Claude | 비상 발행 2026-10-24-pm 9건 (9d71196) | 이유: 18:30 확인 시 판·담당 표시 없음 → claim take claude. 웹 읽기로 원문 확인한 기사만 사용 |
| 10-24 13:52 | Claude | 중국어판 비상 발행 2026-10-24-md 10건 (4cdb2b2, Pages 빌드 성공) | 이유: 정기 담당 없음·claim take claude. 처음엔 배포 권한 거부로 멈췄다가 맥스님 승인 후 배포 |
| 2026-10-24T07:14:31+07:00 | Codex | 2026-10-24-am 7건 준비. aa71cb7 최신 Korea/ticker 및 4e46c51 인수인계 확인 | 독립 파일·장소 엔진 보존. 원문 접근 실패·전판 중복 제외. 게시 전 claim 재검사·게시 후 live 검증 |
| 10-23 16:05 | Claude | **'내 주변' 장소 엔진 공개**(맥스님 지시, places-engine 합침): 한국어판 + 중국어판(附近 메뉴 켬, i18n 53개). newslib 언어판 지연 라벨을 공유 코드로 옮김 | 다른 AI: nearby.js·late.css·data/places-curated.json 고칠 땐 ops/places-pilot 원본 → build_curated.py 로. 업주 LINE 은 미정(SYSTEM_PLAN 9절) |
| 2026-10-23T18:19:59+07:00 | Codex | 2026-10-23-pm 8건 준비. 4e46c51 인수인계·장소 엔진 공개 반영 확인 | 기존 장소 엔진·중국어 공유 코드 보존. 게시 전 claim 재검사·게시 후 live 검증 |
| 2026-10-23T13:46+07:00 | Claude | 비상 발행 zh 2026-10-23-md 6건(d3014b9, Pages 빌드 성공) | 이유: 중국어판 정기 담당 없음. 후보는 kr candidates 08:20분(12:20분 없음). zh tools/newslib.py 의 "지연 발행" 라벨이 zh 화면에 한글로 떠 lang_check FAIL → 언어판은 "延迟发布"(site delayed_label) 로 바꿈 — **한국판 공유 코드에도 같은 수정 필요(sync_core 시 덮어씀)** |
| 2026-10-23T07:13:44+07:00 | Codex | 2026-10-23-am 8건 준비. b45c021 인수인계·claim/codex 표시 확인 | 기존 통계 코드·장소 엔진·지연 자동 판정 보존, nearby.js·late.css 미변경. 게시 전 claim 재검사·게시 후 live 검증 |
| 10-23 06:00 | Claude | '내 주변' 장소 엔진 화면을 브랜치 **places-engine** 에 준비(main 미반영). 10-26 12:45 뒤 Claude 가 합침 | **Codex·그록: 10-26 전 assets/nearby.js·late.css 를 고치면 이 브랜치와 겹치니 STATUS 에 먼저 적어 주세요** |

## 잠금 (지금 누가 어떤 파일을 고치는 중인지)
| 파일 | 누가 | 시작 시각 |
|---|---|---|
| (없음) | | |

## 2026-10-20 광고 최종 적용 — Codex (2026-10-20T09:02:07+07:00)
- 사용자 최종확정: 더라운지 v4 / 나머지4 v3, KT에 기존 LINE URL QR 추가. 세 업소 실사진 광고 허락 확인됨.
- 공통 campaign 선택기: 기존 16 슬롯과 숨김 jobs 소비 경로에 드래곤40/파트너각12. 기존 slots.items는 rollback용 보존. 뉴스/자동화/다른 언어판 불변.
- 로컬검증 PASS: 72조합/QR12인식/주변·구인/기기내노출·중복제외/오프라인/fallback/비활성. 실제 공개는 게시 후 라이브 확인. 통계는 device-local이며 글로벌 노출비율 달성을 주장하지 않음.
