# 하루 3판 규칙 (2026-10-27 맥스님)

운영 중·앞으로 추가하는 뉴스 채널 공통:

- 슬롯: `am`(아침) · `md`(점심) · `pm`(저녁)
- 속보: 판과 별도, 한 건씩(설계: ops-handoff/prompts/2026-10-27_breaking_news_plan.md)
- Gemini: 재시도 ~15분, picks>15 청크, 실패는 `ops/gemini-usage.jsonl` + `ops/edition-fail.json`(실패 시에도 워크플로가 이 두 파일만 커밋·push)
- 판 공백: `ops/edition-gap.json`, `ops/LATEST_GAP.md`, `ops/edition-gap.jsonl`

## 시각표 (방콕 Asia/Bangkok)

| 채널 | 정기 고르기/발행 시작 | Actions 대비·재시도 | Claude 비상(판 없을 때) |
|---|---|---|---|
| KR `thai-news-kr` | 그록 picks **06:40 / 11:40 / 17:40** → gemini-edition | 07:05 / 12:05 / 18:05 | **07:30 / 12:30 / 18:30** |
| ZH `thai-news-zh` | 그록 picks **07:20 / 12:20 / 18:20** → gemini-edition | 07:45 / 12:45 / 18:45 | **08:10 / 13:10 / 19:10** |
| VN `vn-news-kr` | **별도 picks 시각 없음** — `publish.yml`이 돌 때 `slot_now`로 고르기+제미나이 | 슬롯 목표 07:30 / 12:30 / 18:30, cron `:35` + 직후 `:40`·`:55`(점심 **12:35**=UTC 05:35 포함) | **08:20 / 13:20 / 19:20** (12:35 cron 추가 후; 점심 첫 기회가 13:35만 있으면 13:50+) |

### 베트남판 주의 (문서 정정 2026-10-27)

베트남은 KR/ZH처럼 `ops/picks`를 정해진 시각에 올리는 방식이 **아니다**.
`pipeline/run_vn.py`가 Actions 실행 시각의 `slot_now`(am 06:30~11:00 / md 11:30~15:30 / pm 17:30~23:59)로 판을 정한 뒤 **그 실행 안에서** 코드 고르기(`SELECT`)→제미나이 원고→배포한다.
안내에 ‘고르기 07:30·12:30·18:30’이라고 적으면 틀리다 — 그 시각은 **발행 목표(site watch_slots.build)** 이고, 실제 고르기는 publish 런 시점이다.

되돌리기: 이 커밋 이전으로 site·workflow·gemini_edition.py 를 되돌리면 됨(force push 없음).
