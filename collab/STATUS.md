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
| 10-26 13:05 | Claude | 발행 담당 그록 전환 확인(publisher_guard: grok 허용·codex 막힘). collect.yml 판마다 여러 번(예약 지연 대응). 그록 '태국 뉴스 포털 업데이트' 예약 다시 켜기는 크롬 연결 안 돼 대기 | **그록 예약이 꺼져 있는 동안 저녁판은 Claude 18:00 비상 발행(act_at_start_from 10-26 17:00)이 맡음.** 10-26 am 은 Codex 미발행 → Claude 비상 발행 |
| 10-26 07:50 | Claude | 비상 발행 2026-10-26-am 9건(f758fb4) | 이유: 07:30 확인 시 판·담당 표시 없음(take). 06:05 candidates 수집분 없음(마지막 10-25 pm), 클라우드에선 collect.py 소스 전부 프록시 차단 → 웹 읽기로 더 네이션·타이거·파타야 메일 직접 확인 9건 |
| 10-25 18:45 | Claude | 비상 발행 2026-10-25-pm 11건(3d68d6c) | 이유: 18:30 확인 시 판·담당 표시 없음(take). 17:05 수집분 사용, 원문 확인 11건 |
| 10-25 15:20 | Claude | 한국어판·중국어판 고르기 코드화: tools/code_picks.py(원문 주소 후보 → 여러 매체·비자 우선 → 매체 번갈아 최신순 20건) + gemini-edition.yml 예약(06:40·17:40, zh 12:50) — 제미나이가 최대 10건 고름 | 맥스님 14:44 "모든 뉴스판 구조 동일하게" 승인. 그록은 감시만(GROK_HANDOFF v3). 키 등록 전엔 예약 실행이 제미나이 단계에서 실패 → 비상 발행 |
| 10-25 15:00 | Claude | 공유 코드: 태국어판(kstar) 허용 — 태국 글자 검사를 site/<lang>.json validate.forbid_scripts 로('thai' 있으면 지금처럼 막음 = 한국판·중국어판·베트남판 그대로), 원→바트 환산(thb_check), 원문 제목 숨김 글자 설정(origin_hide_rx), 한글 금지 검사에 키워드·매체 이름 추가 | 한국판·중국어판 최근 판 검증 그대로 통과 확인. 다음: kstar 를 sync_core 로 재구축, 이어서 한국어판·중국어판 고르기도 코드+제미나이로 통일(맥스님 14:44 승인 — 그록은 감시만) |
| 10-25 14:20 | Claude | 번역=제미나이 구현: tools/gemini_edition.py·gemini-edition.yml(picks 파일 → 원고·검증·배포). 공유 코드: 시세 칩 현지 통화·날씨 좌표·noindex·현지 국기 설정(한국판 동작 그대로). ops/GROK_HANDOFF.md v2 | **그록은 이제 원고를 안 씀 — ops/picks/<판 id>.json 만.** GEMINI_API_KEY Secret 등록 전엔 gemini-edition 이 실패 → 비상 발행이 메움 |
| 10-25 13:52 | Claude | 비상 발행 중국어판 2026-10-25-md 8건 (zh eed3d36) | 이유: 중국어판 정기 담당 없음. 후보 10-25 07:54 수집분, Google News 링크 디코더 403 → 원문 확인된 8건만 |
| 10-25 10:15 | Claude | 새 그록봇 인수인계 문서 ops/GROK_HANDOFF.md 작성(맥스님 결정: 모든 채널 발행=새 그록, 번역=Gemini API) | Gemini 번역 코드 아직 없음·새 그록 실행 능력(셸·push·예약) 미확인. 판 절차는 기존 그대로 |
| 10-25 07:46 | Claude | 비상 발행 2026-10-25-am 8건 (2e28327, Pages 빌드 성공) | 이유: 07:30 확인 시 판·담당 표시 없음 → claim take claude. 06:05 자동 수집분(candidates) 없음 — collect.yml 확인 필요. 클라우드 직접 수집은 0/262(차단)라 웹 검색·읽기로 원문 확인한 8건만 |
| 10-24 18:49 | Claude | 비상 발행 2026-10-24-pm 9건 (9d71196) | 이유: 18:30 확인 시 판·담당 표시 없음 → claim take claude. 웹 읽기로 원문 확인한 기사만 사용 |
| 10-24 13:52 | Claude | 중국어판 비상 발행 2026-10-24-md 10건 (4cdb2b2, Pages 빌드 성공) | 이유: 정기 담당 없음·claim take claude. 처음엔 배포 권한 거부로 멈췄다가 맥스님 승인 후 배포 |

## 잠금 (지금 누가 어떤 파일을 고치는 중인지)
| 파일 | 누가 | 시작 시각 |
|---|---|---|
| (없음) | | |

## 2026-10-20 광고 최종 적용 — Codex (2026-10-20T09:02:07+07:00)
- 사용자 최종확정: 더라운지 v4 / 나머지4 v3, KT에 기존 LINE URL QR 추가. 세 업소 실사진 광고 허락 확인됨.
- 공통 campaign 선택기: 기존 16 슬롯과 숨김 jobs 소비 경로에 드래곤40/파트너각12. 기존 slots.items는 rollback용 보존. 뉴스/자동화/다른 언어판 불변.
- 로컬검증 PASS: 72조합/QR12인식/주변·구인/기기내노출·중복제외/오프라인/fallback/비활성. 실제 공개는 게시 후 라이브 확인. 통계는 device-local이며 글로벌 노출비율 달성을 주장하지 않음.
