# 다음 Claude 작업 메모 (2026-10-25 14:30, Claude 작성)

> 새 대화방의 Claude 가 이어받을 일. 먼저 `collab/STATUS.md` '최근 인수인계', `ops/GROK_HANDOFF.md`(v2), 이 파일을 읽는다.

## 끝난 것 (10-25)
- 베트남판(`P-Max168/vn-news-kr`)을 tnews 엔진으로 재구축 — 화면·기능은 tnews 그대로, 내용만 베트남.
  - 공유 코드는 이 저장소에서 `python3 tools/dev/sync_core.py <커밋> /path/to/vn-news-kr` 로만 가져감(`.core-version`). vn 저장소에서 assets/·tools/(공유분)·index.html 을 직접 고치지 않는다.
  - 내용 파일: `site/vn.json`(브랜드·통화 VND·국기·날씨 좌표·noindex·숨길 메뉴), `site/topics.vn.json`(지역 id 는 공유 코드 호환용으로 east=호치민·bangkok=하노이·north=북부 공업지대·south=중부), `i18n/vn.json`(태국 문구만 덮어쓰기), `tools/TRANSLATION_RULES.vn.md`.
  - 발행: `pipeline/run_vn.py`(2시간마다 Actions) = 시세·한국 뉴스(tnews 것 복사) → 판 시각이면 코드 수집 20건(매체 섞기) → `tools/gemini_edition.py --select 10` → 공유 카드 → `dist/` → Cloudflare Worker 배포.
- 번역=제미나이: `tools/gemini_edition.py`(공유 도구) + `.github/workflows/gemini-edition.yml`(tnews·zh). 그록은 `ops/picks/<판 id>.json` 만 올림.
- 공유 코드 확장(한국판·중국어판 동작은 그대로): 시세 칩 현지 통화(`currency.local/per/header_symbol/hide_price`), 날씨 좌표(`wx_coords`), `noindex`, 현지 국기(`local_flag`), 공유 카드 국기(`share.text.mark_bg`), JSON-LD `area`.
- `firestore.rules` 에 vn_ 블록 추가(게시 전).

## 남은 것 (순서대로)
1. **KSTAR(`P-Max168/kstar-th`) 재구축** — 베트남판과 같은 방식. 맥스님 승인(10-25): 같이 고침, 파타야 전용 내용은 틀만 두고 숨김, 발행은 코드+제미나이 자동 유지.
   - 다른 점: 화면 언어가 **태국어**. `i18n/th.json` 을 새로 만들어야 함(중국어판 `i18n/zh.json` 범위와 같게 약 630개 문구 — jobs·places·관리자 pages 는 숨김이라 제외 가능).
   - 공유 코드에 태국 글자 금지 검사가 여러 곳 있음 → 언어판 설정으로 끄게 바꿔야 함: `tools/site_build.py`(태국 글자 들어가면 중단), `tools/newslib.py` 의 `thai_check`·`validate_extras`(for_me·quick_replies·issue.title 의 THAI_RE), `tools/dev/lang_check.py`. 기준: `site/th.json validate.forbid_scripts` 에 "thai" 가 없으면 허용.
   - 시세 칩: 독자가 태국 거주 태국인 → tnews 의 `data/ticker.*` 를 그대로 복사해 쓰면 됨(바트·금·휘발유·날씨 모두 맞음). 단위 문구만 태국어(i18n).
   - '오늘의 한국 주요 뉴스' 칸: 한국어 제목이라 태국 독자에게 안 맞음 → 데이터를 넣지 않아 칸이 안 보이게(또는 맥스님께 여쭙기).
   - 주제: 케이팝·드라마·영화·예능·스타 근황·여행(한국) 등 새 id(중국어판 'cn' 처럼 topics 파일에 추가하면 검증 통과).
   - 예전 kstar 의 Netflix 태국 시청처·태국 팬 반응 줄은 근거가 있을 때만(지어내기 금지) — 10-24 작업지시서 기준 유지.
2. **새 그록 점검 결과 확인** — `collab/STATUS.md` 에 그록이 남긴 줄. 파일 올리기 못 하면 맥스님 토큰 필요.
3. **GEMINI_API_KEY** 가 thai-news-kr·thai-news-zh Secret 에 등록됐는지: 그록 첫 picks 뒤 `ops/gemini-usage.jsonl` 이 생기면 등록된 것.
4. Firebase 규칙 게시(맥스님, LOGIN_TODO) + 승인된 도메인에 `vn.pmaxone.com` 추가 + `config/admins_vn` — 그 전까지 베트남판 댓글·로그인은 안 됨.
5. 베트남판 '민감 기사' 기준(자살·성범죄·아동 학대만 자동 제외 — Claude 판단) 맥스님 확인.

## 맥스님이 '맥미니에 앉았을 때' 결정하기로 미룬 것 (10-25 14:20 맥스님)
> 그 전에는 묻지 않는다. 맥스님이 맥미니 접속을 알리면 이 목록을 한 번에 꺼내 결정받는다.
1. GEMINI_API_KEY 를 thai-news-kr·thai-news-zh Secret 에 등록(맥스님 로그인·키 붙여넣기). 등록 전엔 그록 판이 제미나이 단계에서 실패 → Claude 비상 발행이 메움.
2. 새 그록이 저장소에 파일을 올릴 수 없을 때 GitHub 토큰을 줄지.
3. Firebase 규칙 게시 + 승인된 도메인 vn.pmaxone.com + config/admins_vn (베트남판 댓글·로그인).
4. 베트남판 민감 기사 기준(자살·성범죄·아동 학대만 자동 제외 — Claude 판단) 그대로 둘지.
5. 10-25 보고서의 'AI 가 스스로 정한 것'(구글 API=제미나이 해석, 베트남판 주제 이름, 자동 고르기 20건→8~10건, picks 때 담당 표시 대리) 확인.

## 실패 기록 (반복 금지)
- 10-24 Claude 가 vn·kstar 작업지시서에 "tnews 디자인 단순화판"이라고 적어 GPT 가 다른 사이트를 만듦 → 맥스님 원칙 위반. **새 판은 언제나 sync_core + 판 설정으로만.**
- 이 클라우드에서는 GitHub Actions 로그·Secret 목록·Pages API 를 못 읽음(프록시 403). 실행 결과는 커밋되는 `ops/last-run.json`·`ops/gemini-usage.jsonl` 로 확인. 실행 목록(`gh run list`)·작업 단계 결과(`gh api …/runs/<id>/jobs`)는 읽힘.
- 워크플로에서 `git pull --rebase` 를 `--autostash` 없이 쓰면, 빌드가 고친 파일 때문에 조용히 실패해 기록이 안 올라감(10-25 첫 시험). 실패를 실패로 보이게 `ok` 검사 넣음.
- 이 클라우드 샌드박스는 뉴스·시세 사이트에 직접 못 붙음 → 로컬 시험은 가짜 응답으로, 실제 시험은 브랜치에서 `gh workflow run … -f deploy=false`.
