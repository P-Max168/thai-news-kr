# 새 그록봇 인수인계 (2026-10-25, Claude 작성 · 맥스님 지시)

> 읽는 사람: **방금 로그인한 새 그록봇**(SuperGrok 새 계정). 이전 그록의 서버(`/workspace`)·기억·로그는 없다고 가정한다.
> 이 문서 하나로 시작할 수 있게 썼다. 더 자세한 것은 문서 끝 '더 읽을 것'.

## 0. 맥스님 결정 (2026-10-25)
1. **모든 뉴스 채널의 발행은 새 그록봇이 맡는다.**
2. **모든 채널의 번역은 제미나이(Gemini API)가 한다.** 그록은 번역문을 직접 쓰지 않는다.
3. Claude 는 지금처럼 **비상 발행자**(그록 판이 안 나오면 대신 발행) + 개발을 맡는다.

## 1. 채널 목록
| 채널 | 저장소 (공개) | 주소 | 판 | 발행 시각(방콕) | 상태 |
|---|---|---|---|---|---|
| 한국어판 '태국 뉴스 한눈에' | `P-Max168/thai-news-kr` | https://tnews.pmaxone.com | 아침 `YYYY-MM-DD-am` · 저녁 `-pm` | 07:00 · 18:00 게시 목표 | 운영 중 |
| 중국어판 '泰国新闻一览' | `P-Max168/thai-news-zh` | https://zh.pmaxone.com | 점심 `YYYY-MM-DD-md` | 13:30 무렵 | 운영 중(정기 담당 없음 → 지금은 Claude 13:30 예약) |
| 베트남 뉴스 한국어판 | `P-Max168/vn-news-kr` | 미정 | 미정 | 미정 | 10-24 승인, 구축 상태 **확인 필요**(noindex 유지) |
| KSTAR(태국어) | `P-Max168/kstar-th` | 미정 | 미정 | 미정 | 10-24 승인, 구축 상태 **확인 필요**(noindex 유지) |

## 2. 역할 (새 방식)
| 누가 | 하는 일 |
|---|---|
| 코드(GitHub Actions·tools/) | 뉴스 수집, 중복 제거, 빌드, 형식 검사, 배포, 누락 감시, 환율·한국 뉴스 갱신 |
| **그록** | ① 판 시작 표시(claim) ② 후보에서 기사 고르기 ③ 원문을 열어 사실·숫자·게재 시각 확인 ④ 기사별 '확인 메모'(무엇이 사실인지) 작성 ⑤ 결과 확인 후 발행 |
| **제미나이(API)** | 그록이 고른 기사의 원문 → 한국어 원고, 한국어 원고 → 중국어 등 **모든 언어 번역** |
| Claude | 비상 발행, 코드 개발(제미나이 번역 단계 포함), 점검 |
| 맥스님 | 승인과 결정 |

### ⚠️ 지금 없는 것 (2026-10-25 기준, 숨기지 않고 적음)
- **제미나이 번역 단계는 아직 코드에 없다.** 두 저장소 어디에도 Gemini 호출 코드가 없다. Claude 가 만든다.
  - 맥스님 할 일: Gemini API 키를 두 저장소의 GitHub Secrets 에 `GEMINI_API_KEY` 로 등록(로그인 필요, AI는 못 함).
  - 완성 전까지: 그록이 예전 방식(직접 한국어 작성, `tools/TRANSLATION_RULES.md`)으로 내거나, Claude 비상 발행이 메운다.
- 새 그록이 **코드 실행·git push 를 할 수 있는지 아직 모른다.** 이전 그록은 자기 서버에서 `python3`·`git` 을 돌렸다. 아래 3절 점검부터 한다.

## 3. 시작 전 점검 (그록이 맨 먼저, 결과를 맥스님께 보고)
다음 5가지에 '예/아니요/모름'으로 답한다. 추측하지 말고 실제로 해 보고 답한다.
1. 이 공개 저장소 파일을 읽을 수 있나? (예: https://github.com/P-Max168/thai-news-kr/blob/main/ops/GROK_HANDOFF.md)
2. 셸에서 `python3`, `git` 을 실행할 수 있나?
3. 이 저장소에 **쓰기(push 또는 GitHub API 커밋)** 를 할 수 있나? 할 수 없으면 맥스님이 GitHub 토큰(두 저장소 contents 쓰기)을 줘야 한다.
4. 정해진 시각에 스스로 시작하는 **예약 작업**을 만들 수 있나? (06:40 · 17:40 · 12:50 방콕)
5. 뉴스 사이트(thepattayanews.com, nationthailand.com, thairath.co.th 등) 원문을 직접 열 수 있나?
→ 결과 남기기: 3번이 '예'면 결과를 `collab/STATUS.md` '최근 인수인계' 표 맨 위에 한 줄로 직접 커밋한다(Claude 가 저장소에서 바로 읽음). '아니요'면 맥스님께만 보고한다.
→ 2·3·4 중 하나라도 '아니요'면 혼자 발행할 수 없다. 그 경우 맥스님께 알리고, Claude 가 그록에 맞춘 방식(예: 그록은 고르기 결과만 내고 코드가 나머지)을 만든다.

## 4. 한국어판 판 하나 내는 순서 (점검 통과 후)
작업 폴더에서:
```
git clone https://github.com/P-Max168/thai-news-kr && cd thai-news-kr
git config user.name P-Max168 && git config user.email mgisgood1919@gmail.com
```
1. 이미 판이 있으면 끝: `python3 -c "import json;print(json.load(open('data/index.json'))['latest'])"` 가 오늘 판 id 면 아무것도 안 함.
2. 담당 확인: `python3 tools/publisher_guard.py` (지금 `ops/publisher.json` 담당은 codex, **10-26 12:45 에 grok 으로 바뀜**). 그다음 `python3 tools/edition_claim.py claim grok <판 id>` — `HOLD` 가 나오면 Claude 가 비상 발행 중이니 멈춘다.
3. 후보 받기: `bash tools/fetch_candidates.sh <판 id>`. exit 3 이면 직접 수집 `python3 tools/collect.py && python3 tools/gnews_scan.py`. 결과 `drafts/candidates/latest.md`.
4. 기사 고르기(그록의 핵심 일): 8~12건(좋은 기사가 없으면 더 적어도 됨, 채우려고 약한 기사 넣지 않음). 동부(파타야·시라차·라용)·외국인·비자·치안·날씨 우선. 직전 판과 같은 사건은 새 사실이 있을 때만. 원문을 직접 열어 확인 못 한 기사는 뺀다.
5. 원고: (제미나이 단계 완성 후) 그록은 고른 기사 목록 + 확인 메모만 내고 번역은 제미나이가 한다. (완성 전) `tools/editions/_template.py` 를 복사해 `tools/editions/<판 id>.py` 를 직접 쓴다 — 하이라이트 3개, 브리핑 4~7줄, 금액은 `350바트(약 1만3,738원)`처럼(환율은 `data/ticker.json` 의 `fx.THB_KRW` 하나).
6. 빌드: `python3 tools/build_data.py tools/editions/<판 id>.py` — 검증 통과할 때까지 고친다. '점검(경고)'는 괜찮다.
7. 배포: `TNK_PUBLISHER=grok bash tools/deploy.sh` → 공유 이미지 `python3 tools/share_kit.py <판 id>` → `TNK_PUBLISHER=grok bash tools/deploy.sh` 한 번 더.
8. 기록: `collab/STATUS.md` '최근 인수인계' 표 맨 위에 한 줄(`| 시각 | Grok | 발행 <판 id> N건 | 주의점 |`).

## 5. 중국어판 판 하나 내는 순서
저장소 `P-Max168/thai-news-zh`. 기준 문서: 그 저장소의 `ROUTINE_MD.md`, `tools/TRANSLATION_RULES.zh.md`.
1. 오늘 `-md` 판이 이미 있으면 끝. 2. `python3 tools/edition_claim.py claim grok <판 id>` (HOLD 면 멈춤).
3. 후보는 한국어판 저장소의 `candidates` 브랜치(12:20 수집분): `git fetch https://github.com/P-Max168/thai-news-kr +candidates:refs/remotes/kr/candidates && git show kr/candidates:candidates/latest.md > drafts/candidates/latest.md`
4. 涉华(중국인 관련)·签证·治安 우선, 간체, 한글·태국 문자 금지, 금액 `350泰铢（约69元）`(환율 `data/ticker.json` 의 `THB_CNY`).
5. 빌드 `TNK_TEST=1 bash tools/lang_build.sh build <판 id>` → 'BUILD OK'. 배포 `TNK_PUBLISHER=grok bash tools/deploy.sh`.

## 6. 예약 시각 (방콕) — 겹침 방지 표시(claim)로 중복 발행은 막힘
| 시각 | 누가 | 할 일 |
|---|---|---|
| 06:05 · 12:20 · 17:05 | GitHub Actions | 후보 수집(※ GitHub 예약이 2~4시간 늦게 도는 날이 많음 → 06:05 분이 07:00 전에 없을 수 있음. 그땐 4-3 의 직접 수집) |
| **06:40 · 17:40** | **그록** | 한국어 아침·저녁판 |
| **12:50** | **그록** | 중국어 점심판 |
| 07:00 · 18:00 | Claude | (10-26 17:00 이후) 그록 표시도 판도 없으면 즉시 비상 발행 |
| 07:30 · 18:30 · 13:30 | Claude | 판이 없으면 비상 발행(그록이 표시만 하고 멈춘 경우 포함) |
| 2시간마다 | GitHub Actions | 한국 뉴스·환율(`data/korea.*`, `data/ticker.*`) — **아무도 손대지 않음** |

## 7. 절대 하지 않는 것
- 확인 못 한 사실 쓰기, 기사 지어내기, 옛 뉴스를 오늘 판처럼 올리기.
- force push, `git reset --hard` 로 남의 커밋 지우기, 다른 판 데이터 수정.
- `data/korea.*`, `data/ticker.*` 수정.
- 💬 오늘의 질문·운영자 댓글 공개(초안은 `approved:false` 로만), 광고·검색 노출(noindex·robots)·개인정보 설정 변경 — 맥스님 승인 필요.
- 성범죄·선정적 기사, 이미지 넣기.
- 방콕 07:00~08:10, 18:00~18:40 에 판 빌드 외 push.

## 8. 막혔을 때
- 어느 단계에서 왜 멈췄는지 `collab/STATUS.md` 에 한 줄 쓰고 맥스님께 짧게 보고. Claude 비상 발행이 30분 뒤 이어받는다.
- 같은 방법을 두 번 반복하지 않는다.

## 9. 더 읽을 것 (순서대로)
1. `collab/STATUS.md` '최근 인수인계' 표 — 매번 작업 전에.
2. `tools/TRANSLATION_RULES.md` — 한국어 표기·금액·제목 규칙(제미나이 번역 지시문에도 그대로 쓰임).
3. `README.md` '고르는 규칙'·'정기 실행 절차'.
4. `ops/SYSTEM_PLAN.md` — 전체 설계. `ops/EMERGENCY_PUBLISH.md` — Claude 비상 발행 절차.
5. `collab/GROK_PROMPT.md` — 옛 협업 규칙(충돌 방지 4절은 지금도 유효. 역할 표는 이 문서가 우선).
