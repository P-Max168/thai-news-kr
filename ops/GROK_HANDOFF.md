# 새 그록봇 인수인계 v2 (2026-10-25 오후, Claude 작성 · 맥스님 지시)

> 읽는 사람: **새 그록봇**(SuperGrok 새 계정). 이전 그록의 서버(`/workspace`)·기억·로그는 없다고 가정한다.
> v1(같은 날 오전)과 달라진 점: **그록은 원고를 쓰지 않는다. 기사 고르기 + 고른 목록 파일 1개 올리기**까지만. 원고·번역·빌드·배포는 코드(GitHub Actions)+제미나이가 한다.

## 0. 맥스님 결정 (2026-10-25)
1. 모든 뉴스 채널의 발행은 새 그록봇이 맡는다.
2. **모든 채널의 번역은 제미나이(Gemini API)가 한다.** 그록 토큰을 아끼기 위해 그록은 번역문·원고를 쓰지 않는다.
3. 베트남판·KSTAR 는 **코드+제미나이 완전 자동 발행을 유지**하고, 그록은 **감시만** 한다(토큰 0 유지).
4. Claude 는 상시 **비상 발행자**(판이 안 나오면 대신 발행) + 개발.
5. 모든 판은 **디자인+기능은 tnews 그대로, 내용만 변경**(맥스님 기본 원칙).

## 1. 채널 목록
| 채널 | 저장소 | 주소 | 판 | 발행 | 그록 할 일 |
|---|---|---|---|---|---|
| 한국어판 '태국 뉴스 한눈에' | `P-Max168/thai-news-kr` | https://tnews.pmaxone.com | `YYYY-MM-DD-am` · `-pm` | 07:00 · 18:00 게시 목표 | **고르기** (4절) |
| 중국어판 '泰国新闻速览' | `P-Max168/thai-news-zh` | https://zh.pmaxone.com | `YYYY-MM-DD-md` | 13:30 무렵 | **고르기** (5절) |
| 베트남판 '베트남 뉴스 한눈에' | `P-Max168/vn-news-kr`(비공개) | https://vn.pmaxone.com (검색 차단) | `-am` · `-pm` | 2시간마다 자동(판 창 06:30~12:00 · 17:30~24:00) | **감시만** (6절) |
| KSTAR(태국어 연예) | `P-Max168/kstar-th`(비공개) | https://kstar.pmaxone.com (검색 차단) | 자동 | 자동 | **감시만** (6절) · 화면을 tnews 엔진으로 다시 만드는 작업 남음(Claude) |
| 채널 모음(관제) | `vn-news-kr/hub` | https://news.pmaxone.com | — | 15분마다 | 문제 확인용으로 보기만 |

## 2. 역할
| 누가 | 하는 일 |
|---|---|
| 코드(GitHub Actions) | 후보 수집(06:05·12:20·17:05), 담당 표시(claim), 원문 본문 가져오기, **제미나이 호출**, 금액 환산(바트→원·위안), 형식 검사, 공유 카드, 배포, 누락 감시, 시세·한국 뉴스 갱신 |
| **그록** | ① 후보 읽기 ② 기사 8~12건 고르기 ③ 원문을 열어 사실 확인 + 한두 줄 확인 메모 ④ **고른 목록 파일 1개를 저장소에 올리기** ⑤ 10~15분 뒤 사이트에 판이 떴는지 확인 |
| 제미나이(API, 코드가 부름) | 그록이 고른 기사 → 제목·요약·주제·브리핑·추천 댓글(한국어판=한국어, 중국어판=간체) |
| Claude | 비상 발행, 개발·점검 |
| 맥스님 | 승인과 결정 |

## 3. 시작 전 점검 (그록이 맨 먼저, 결과를 맥스님께 보고)
'예/아니요/모름'으로 — 추측하지 말고 실제로 해 보고.
1. 공개 파일을 읽을 수 있나? 예: https://raw.githubusercontent.com/P-Max168/thai-news-kr/candidates/candidates/latest.md (후보 목록)
2. 저장소 `P-Max168/thai-news-kr`·`P-Max168/thai-news-zh` 에 **파일 1개를 올릴 수(커밋) 있나?** (git push, GitHub API `PUT /repos/{owner}/{repo}/contents/{path}`, GitHub 연결 기능 중 아무거나)
   - 못 하면: 맥스님이 두 저장소 'Contents: Read and write' 만 있는 fine-grained 토큰을 줘야 한다(맥스님 로그인 필요).
3. 정해진 시각에 스스로 시작하는 **예약 작업**을 만들 수 있나? (06:40 · 17:40 · 12:50 방콕)
4. 뉴스 원문(thepattayanews.com, nationthailand.com, khaosod.co.th 등)을 직접 열 수 있나?
→ 셸(python3·git)은 **이제 없어도 된다**(v1 과 다름). 2·3 이 '예'면 혼자 발행 가능.
→ 결과는 2번이 '예'면 `collab/STATUS.md` '최근 인수인계' 표 맨 위에 한 줄 커밋, 아니면 맥스님께만 보고.

## 4. 한국어판 판 하나 (06:40 · 17:40 시작)
1. 이미 판이 있으면 끝: https://tnews.pmaxone.com/data/index.json 의 `latest` 가 오늘 판 id(`2026-10-26-am` 형식)면 아무것도 안 함.
2. 후보 읽기: https://raw.githubusercontent.com/P-Max168/thai-news-kr/candidates/candidates/latest.md (06:05·17:05 수집. GitHub 예약이 늦어 옛 시각이면 X·웹 검색으로 보충).
3. 고르기(그록의 핵심 일): 8~12건. 동부(파타야·시라차·라용)·외국인·비자·치안·날씨 우선. 직전 판과 같은 사건은 새 사실이 있을 때만. **원문을 직접 열어 확인 못 한 기사는 뺀다.** 채우려고 약한 기사 넣지 않음. 성인·선정적 기사 금지.
4. 파일 1개 올리기: `ops/picks/<판 id>.json` (main 브랜치)
```json
{"edition": "2026-10-26-am",
 "picks": [
   {"url": "https://www.nationthailand.com/news/…", "memo": "원문에서 확인한 핵심 사실·숫자 한두 줄"},
   {"url": "https://thepattayanews.com/2026/10/26/…", "memo": "…"}
 ]}
```
   - 후보 목록에 있는 기사는 `url` + `memo` 만 쓰면 된다(제목·매체·시각은 코드가 후보 목록에서 채움).
   - 후보 목록에 없는 기사(X·검색으로 찾은 것)는 `"title"`(원제목), `"source"`(매체 이름), `"published"`(`2026-10-26T05:10:00+07:00`) 도 적는다.
   - **Google News 주소(news.google.com/…)는 쓰지 말고 원문 주소로.** 같은 사건 다른 매체는 `"also": [{"source": "매체", "url": "https://…"}]`.
   - 커밋 메시지: `picks <판 id> (Grok)`.
5. 끝. 파일이 올라가면 `.github/workflows/gemini-edition.yml` 이 자동으로: 담당 표시(claim grok) → 원문 본문 → 제미나이 원고 → 바트 금액마다 (약 N원) 자동 → 검사 → 공유 카드 → 배포.
6. 10~15분 뒤 확인: `data/index.json` 의 `latest` 가 그 판이면 성공. 아니면 https://github.com/P-Max168/thai-news-kr/actions 의 'gemini-edition' 실행이 빨간색인지 보고, 맥스님께 "몇 시 판, 어느 단계 실패"만 짧게 보고(Claude 비상 발행이 07:30·18:30 에 이어받음).
7. 기록(쓸 수 있으면): `collab/STATUS.md` '최근 인수인계' 표 맨 위에 `| 시각 | Grok | picks <판 id> N건 | 주의점 |`.

※ 10-26 12:45 까지는 `ops/publisher.json` 담당이 codex 라 그록 판은 배포 단계에서 막힌다(정상). 그록 판은 **10-26 저녁판(17:40)부터**.

## 5. 중국어판 판 하나 (12:50 시작)
저장소 `P-Max168/thai-news-zh`, 파일 `ops/picks/<YYYY-MM-DD-md>.json`, 형식은 4절과 같다.
- 후보: 한국어판 후보 목록과 같다(12:20 수집분) — https://raw.githubusercontent.com/P-Max168/thai-news-kr/candidates/candidates/latest.md
- 우선: 涉华(중국인·중국 관광객·중국 기업 관련)·签证·治安·曼谷·芭提雅. 6~10건.
- memo 는 한국어든 영어든 괜찮다(제미나이가 `tools/TRANSLATION_RULES.zh.md` 규칙으로 간체 원고를 씀, 금액 `350泰铢（约69元）` 자동).
- 확인: https://zh.pmaxone.com/data/index.json `latest`.

## 6. 베트남판·KSTAR 감시 (토큰 아끼기 — 하루 2번, 짧게)
- 보는 곳 하나: https://news.pmaxone.com (채널 모음 — 마지막 발행 시각·다음 예정·실패 표시).
- 베트남판: 아침판이 12:00 까지, 저녁판이 24:00 까지 안 나오면 맥스님께 "vn 판 없음" 한 줄. 고치지 않는다(Claude 가 고침).
- KSTAR: 같은 방식. 지금 화면은 tnews 엔진이 아닌 임시 화면(Claude 가 다시 만들 예정).

## 7. 예약 시각 (방콕) — 담당 표시(claim)로 중복 발행은 막힘
| 시각 | 누가 | 할 일 |
|---|---|---|
| 06:05 · 12:20 · 17:05 | GitHub Actions | 후보 수집(※ 2~4시간 늦게 도는 날이 있음) |
| **06:40 · 17:40** | **그록** | 한국어판 고르기 → picks 올리기 |
| **12:50** | **그록** | 중국어판 고르기 → picks 올리기 |
| picks 올라온 직후 | GitHub Actions | 제미나이 원고·검사·배포(5~10분) |
| 07:00 · 18:00 | Claude | (10-26 17:00 이후) 담당 표시도 판도 없으면 즉시 비상 발행 |
| 07:30 · 18:30 · 13:30 | Claude | 판이 없으면 비상 발행 |
| 2시간마다 | GitHub Actions | 시세·한국 뉴스(`data/korea.*`, `data/ticker.*`), 베트남판 자동 판 — **아무도 손대지 않음** |

## 8. 절대 하지 않는 것
- 확인 못 한 기사 고르기, 옛 뉴스를 오늘 판처럼, 기사 지어내기.
- `data/` 의 판 파일·`data/korea.*`·`data/ticker.*` 직접 수정. 코드·화면 수정(필요하면 `collab/REQUESTS.md` 에 요청만).
- force push, 남의 커밋 지우기.
- 광고·검색 노출(noindex·robots)·개인정보 설정 변경, 💬 오늘의 질문 공개 — 맥스님 승인 필요.

## 9. 막혔을 때
- 어느 단계에서 왜 멈췄는지 맥스님께 짧게 보고(쓸 수 있으면 `collab/STATUS.md` 에도). 같은 방법을 두 번 반복하지 않는다. Claude 비상 발행이 이어받는다.

## 10. 실패 기록 (반복 금지) — 2026-10-25
- **베트남판·KSTAR 를 tnews 와 다른 한 장짜리 화면으로 만든 일**: 10-24 Claude 작업지시서에 "tnews 디자인 단순화판, 댓글·로그인·광고·장소 엔진 뺌"이라고 적었고 GPT(Codex)가 그대로 만듦 → 맥스님 원칙(디자인+기능 그대로, 내용만 변경) 위반. 10-25 Claude 가 베트남판을 tnews 엔진(공유 코드 `tools/dev/sync_core.sh` + 판 설정 `site/vn.json`)으로 다시 세움. **새 판은 언제나 이 방식으로만 만든다.**
- 예전 베트남판 자동 발행은 '민감 기사' 거르개가 사고·학생·체포까지 막아 하루 5건 안팎만 나왔음 → 자살·성범죄·아동 학대만 자동 제외로 바꿈(Claude 판단, 맥스님 확인 필요).
- 제미나이 무료 등급은 입력을 학습에 쓸 수 있음 → 공개 기사 본문 외(개인정보·비밀값)는 지시문에 넣지 않는다. 키는 GitHub Secret 으로만.
- Claude 는 이 클라우드에서 GitHub Actions **실행 로그를 읽을 수 없다**(프록시 403). 실행 결과는 저장소에 커밋되는 `ops/last-run.json`·`ops/gemini-usage.jsonl` 로 확인한다.

## 11. 더 읽을 것
1. `collab/STATUS.md` '최근 인수인계' — 매번 작업 전에.
2. `tools/TRANSLATION_RULES.md`(한국어판)·`thai-news-zh/tools/TRANSLATION_RULES.zh.md` — 제미나이 지시문에 그대로 들어감. 고르기 기준은 `README.md` '고르는 규칙'.
3. `tools/gemini_edition.py` 맨 위 설명 — picks 형식·실패 처리.
4. `ops/SYSTEM_PLAN.md`(전체 설계), `ops/EMERGENCY_PUBLISH.md`(Claude 비상 발행).
