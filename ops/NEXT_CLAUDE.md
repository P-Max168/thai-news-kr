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

## 10-25 15:30 Claude 추가 — 끝난 것
- KSTAR 재구축 완료(브랜치 `claude/kstar-tnews-engine`, PR #1 — **main 병합 대기**: 이 세션에서 kstar main 직접 push·배포가 자동 판정에 막혀 맥스님 승인 필요).
  브랜치 시험: 수집처 점검(Newsis 99·Star News 38, 본문 OK), 실제 판 2026-10-25-md 8건 검증 통과(한글 0, 원→바트). 병합 뒤 `gh api …/dispatches -f ref=main -F inputs[deploy]=true` 로 배포.
  공유 코드: siteconf.forbids()·thb_check·origin_hide_rx·money_pair·빈 impacts 허용·언어판 지난 판 링크 비움(한국판·중국어판 검증 그대로 통과 확인).
- 한국어판·중국어판 고르기도 코드+제미나이(맥스님 14:44 "모든 뉴스판 구조 동일하게"): tools/code_picks.py + gemini-edition.yml 예약(ko 06:40·17:40, zh 12:50). 키 없거나 임시 발행 담당(Codex ~10-26 12:45) 기간이면 담당 표시 없이 건너뜀. GROK_HANDOFF v3(그록 감시만). 모음 페이지 담당 표시도 바꿈.
- 알려진 한계: 태국어판 날짜 조각이 공유 코드 순서상 '10/25'(월/일)로 보임 — 고치려면 app.js·ticker.js·pages.js 날짜 조립을 언어 설정으로.


## 10-25 15:30 맥스님 결정 — KSTAR 다음 작업 (새 대화방에서 이어서)
상태: PR #1(tnews 엔진 재구축) 병합됨 → 다음 예약 실행에서 자동 배포(Claude 의 '실서비스 배포' 실행은 자동 판정에 막힘, 예약이 대신 배포).
PR #2(디자인) 병합 대기: 기본 라일락(B) + 휴대폰 다크 모드면 나이트(C), Prompt 글꼴, 시세판·한국 뉴스 칸 숨김. 공유 코드 site_build skin_css 로 연결(엔진 그대로).

### 만들 것 (맥스님 지시, 세부는 AI 추천으로 먼저 제작 → 맥스님 확인)
1. 로그인: Google(엔진에 Firebase 구글 로그인 있음 — 콘솔에서 켜기·승인 도메인 kstar.pmaxone.com 필요) + LINE 로그인.
   - LINE 은 Firebase 에 바로 안 붙음 → Cloudflare Worker 가 LINE Login(OAuth) 처리 후 Firebase 맞춤 토큰 발급(추천). 맥스님 몫: LINE Developers 에서 LINE Login 채널 만들기(Channel ID·Secret), Firebase 서비스 계정 키 발급 → Worker Secret 등록.
2. 구인·구직 게시판(기존 jobs.js 는 한국판 '예시' 시안 — 실제 게시판으로 새로 만들되 언어판 설정으로 켜고 끄게).
   - 구직(ks_resumes): 회원이면 바로 게시. [AI추천 입력] 표시 이름·희망 직종(통역·번역/관광·가이드/뷰티·매장/사무/콘텐츠·SNS/기타)·희망 지역(태국 도·온라인)·한국어 수준(없음/일상/TOPIK 1~6)·경력 요약 300자·시작 가능일·연락 방법(사이트 메시지 기본, LINE ID 공개는 본인 선택). 전화·사진·나이·생년월일은 받지 않음(PDPA 최소 수집). 30일 뒤 자동 숨김.
   - 구인(ks_jobs): 운영자 승인 회사만. 회사 신청(ks_employers): 회사명·태국 사업자번호(DBD 13자리)·담당자·연락처·주소·웹/페이스북 → 운영자 승인함에서 허가. 공고: 직종·근무지(태국 안)·고용 형태·급여 범위(필수, 바트)·한국어 요구·마감일·지원 방법.
   - 쪽: 구인 목록·상세 / 구직 목록·상세 / 구직 글쓰기 / 회사 신청 / 공고 쓰기 / 내 글 관리 / 운영자 승인함 / 이용 규칙.
   - [AI추천 안전 규칙 — 맥스님 확인 필요] 한국 현지 근무 공고 금지(태국인 불법 취업·인신매매 피해가 실제로 많음), '해외 고수입·마사지·유흥' 류 차단, 급여 미표기 금지, 신고 버튼, 의심 공고는 운영자 확인 전 숨김. 게시판 범위는 '한국 관련 일자리(한국 회사·통역·K-뷰티 매장 등)'로 한정 추천.
3. 이용약관·개인정보 쪽에 게시판·로그인 내용 추가(태국 PDPA: 수집 목적·보관 기간·삭제 요청).

## 남은 것 (순서대로)
1. ~~**KSTAR(`P-Max168/kstar-th`) 재구축**~~ (위: PR #1 병합 대기) — 베트남판과 같은 방식. 맥스님 승인(10-25): 같이 고침, 파타야 전용 내용은 틀만 두고 숨김, 발행은 코드+제미나이 자동 유지.
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
