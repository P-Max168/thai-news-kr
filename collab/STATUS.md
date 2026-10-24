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
| 10-24 13:52 | Claude | 중국어판 비상 발행 2026-10-24-md 10건 (4cdb2b2, Pages 빌드 성공) | 이유: 정기 담당 없음·claim take claude. 처음엔 배포 권한 거부로 멈췄다가 맥스님 승인 후 배포 |
| 2026-10-24T07:14:31+07:00 | Codex | 2026-10-24-am 7건 준비. aa71cb7 최신 Korea/ticker 및 4e46c51 인수인계 확인 | 독립 파일·장소 엔진 보존. 원문 접근 실패·전판 중복 제외. 게시 전 claim 재검사·게시 후 live 검증 |
| 10-23 16:05 | Claude | **'내 주변' 장소 엔진 공개**(맥스님 지시, places-engine 합침): 한국어판 + 중국어판(附近 메뉴 켬, i18n 53개). newslib 언어판 지연 라벨을 공유 코드로 옮김 | 다른 AI: nearby.js·late.css·data/places-curated.json 고칠 땐 ops/places-pilot 원본 → build_curated.py 로. 업주 LINE 은 미정(SYSTEM_PLAN 9절) |
| 2026-10-23T18:19:59+07:00 | Codex | 2026-10-23-pm 8건 준비. 4e46c51 인수인계·장소 엔진 공개 반영 확인 | 기존 장소 엔진·중국어 공유 코드 보존. 게시 전 claim 재검사·게시 후 live 검증 |
| 2026-10-23T13:46+07:00 | Claude | 비상 발행 zh 2026-10-23-md 6건(d3014b9, Pages 빌드 성공) | 이유: 중국어판 정기 담당 없음. 후보는 kr candidates 08:20분(12:20분 없음). zh tools/newslib.py 의 "지연 발행" 라벨이 zh 화면에 한글로 떠 lang_check FAIL → 언어판은 "延迟发布"(site delayed_label) 로 바꿈 — **한국판 공유 코드에도 같은 수정 필요(sync_core 시 덮어씀)** |
| 2026-10-23T07:13:44+07:00 | Codex | 2026-10-23-am 8건 준비. b45c021 인수인계·claim/codex 표시 확인 | 기존 통계 코드·장소 엔진·지연 자동 판정 보존, nearby.js·late.css 미변경. 게시 전 claim 재검사·게시 후 live 검증 |
| 10-23 06:00 | Claude | '내 주변' 장소 엔진 화면을 브랜치 **places-engine** 에 준비(main 미반영). 10-26 12:45 뒤 Claude 가 합침 | **Codex·그록: 10-26 전 assets/nearby.js·late.css 를 고치면 이 브랜치와 겹치니 STATUS 에 먼저 적어 주세요** |
| 10-23 05:30 | Claude | 그록 예약 '태국 뉴스 포털 업데이트' 06:40/17:40 으로 변경(일시 중지 유지). ops/emergency.json act_at_start=true + act_at_start_from 2026-10-26T17:00(그 전엔 Codex 07:08 시작이라 07:00 즉시 발행 안 함). 그록 누락 확인(07:38)·중국어(13:00) 예약도 일시 중지 — 10-26 재개 시 누락 확인은 Claude 07:30 과 겹치지만 claim 표시로 중복 발행은 막힘 |
| 2026-10-23T05:40:00+07:00 | Claude | **Claude 비상 발행 장치**: ops/EMERGENCY_PUBLISH.md(절차)·ops/emergency.json(act_at_start=false — 그록 시각 변경 확인 전). Claude 예약 작업 07:00·07:30·13:30·18:00·18:30 BKK. 07:30·18:30 에 판이 없으면 Claude 가 take 후 비상판. 중국어판 13:30 은 정기 담당이 없어 Claude 가 맡음. zh 저장소도 공유 코드 동기화(d9f53b3) | 클라우드 연습 판(2026-10-23-am 4건)을 실제 검증(build_data)까지 통과 — 배포는 안 함 |
| 2026-10-23T05:05:00+07:00 | Claude | **코드 수집 + 측정 기록**: .github/workflows/collect.yml(06:05·12:20·17:05 BKK collect.py+gnews_scan.py → candidates 브랜치), tools/fetch_candidates.sh(판 담당이 받아 씀, 없으면 exit 3 → 직접 수집), tools/metrics.py(deploy.sh 가 ops/metrics.jsonl 에 판마다 한 줄) | **그록: 1단계 수집은 fetch_candidates.sh 먼저.** README 정기 실행 절 맨 위 안내 참고. candidates 브랜치는 매번 덮어쓰는 브랜치(main 아님) |
| 2026-10-23T05:20:00+07:00 | Claude | **판 담당 표시 추가**: tools/edition_claim.py — preflight(am/pm/md-build)가 원격 브랜치 claim/<판 id>/<누구>(TNK_PUBLISHER, 기본 grok)를 남기고, deploy.sh 는 다른 담당이 가져간 판이면 배포 중단(exit 4). publisher_guard 는 claude(상시 비상 발행자)를 항상 허용. 3일 지난 claim 은 .github/workflows/claim-prune.yml 이 매일 지움 | **그록·Codex: preflight 가 HOLD(exit 4)면 판을 만들지 마세요(Claude 가 비상 발행 중).** main 커밋 없음, Pages 영향 없음. 표시 실패는 판을 막지 않음(CLAIM WARN). 시험용 claim/2026-01-01-am·01-02-am 브랜치는 다음 정리 때 지워짐 |
| 2026-10-23T05:00:00+07:00 | Claude | **"지연 발행" 라벨 자동 판정**: newslib.is_delayed — generated 가 예정 게시+30분(10-26 전 07:08·18:08, 이후 07:00·18:00, 점심판 13:00)을 넘으면 자동. 판 파일의 delayed_publication 손 표시는 이제 무시. 10-20~10-22 판의 잘못 붙은 라벨 제거(index·issues·e 6쪽·홈 링크) | **Codex·그록: 판 파일에 delayed_publication 을 더 적지 마세요(적어도 무시됨).** 실제 지연판은 10-19-am 외에 예전 09-29-am·10-04-am·10-11-am 도 자동으로 지연 표시됨(index 데이터) |
| 2026-10-23T04:20:00+07:00 | Claude | **방문 통계 추가(맥스님 승인)**: Cloudflare Web Analytics 코드(쿠키 없음, 주소별 토큰 tnews/zh)를 index·안내 5쪽·e 30쪽·tools/seo.py 템플릿에 넣음. privacy.html 5번에 한 줄 추가 | e 쪽은 seo.py regen-e 를 돌리지 않고 코드만 직접 넣음(regen-e 는 설명문 지역 순서를 섞어 무관한 변경이 생김). stamp_assets 는 이번 환경에서 모든 ?v= 를 바꿔서 되돌림 — 자산 파일은 안 바뀜 |
| 2026-10-23T04:00:00+07:00 | Claude | **판 시작 시각 06:40/17:40(게시 07:00/18:00)으로 변경**: edition_watch(허용 08:10/19:10), edition_stale(07:30/18:30), korea.yml 대기 06:40–07:40·17:40–18:40, ship.sh push 금지 06:40–08:10·17:40–18:40, site/ko.json, README | **그록: 10-26 12:45부터 정기 실행을 06:40·17:40에 시작.** 10-26까지 Codex 07:08 대행분도 새 금지 구간 안이라 충돌 없음. 중국어판은 하루 1회(13:00) 유지 |
| 2026-10-23T03:55:00+07:00 | Claude | 맥스님과 전체 시스템 설계 확정 → `ops/SYSTEM_PLAN.md` 추가(문서만, 코드·판·설정 변경 없음) | **모든 AI 필독.** 10-26 12:45부터 발행 담당 그록, Claude는 상시 비상 발행자. 그록 시작 06:40/17:40로 변경 예정(아직 미적용). 지연 라벨은 실제 늦은 판만(코드 자동 판정으로 교체 예정). 중국어판 정기 발행 미복구 상태 |
| 2026-10-19T18:16:50+07:00 | Codex | 운영자 요청으로 10-26 12:45 BKK까지 발행 대행, 10-19-am 지연 발행 완료·라이브 확인. 10-19-pm 12건 제작·로컬 검증 통과, 이번 커밋 배포 예정 | Grok 중복 방지: ops/publisher.json·publisher_guard 확인. 한국 뉴스·시세 독립 파일 미변경. 18:08 예약 호출 정상 확인. pm 라이브 검증은 배포 뒤 수행 |
| 2026-10-18 08:40 | Grok | **중국어판 공유 코드(R-zh-1~9, 민구님 08:00 승인으로 Claude 대신)**: site/LANG·site/ko.json·tools/siteconf.py, 화면 TNI(키, 한국어 기본값)·data-i18n, newslib 판 슬롯 md·언어별 검사기, fb.js zh_ 접두사, ticker THB_CNY, share_kit·드래곤 배너 언어 문구, firestore.rules zh 블록(게시 안 함), site_build·sync_core·i18n_scan | 한국판 화면·동작은 그대로(라이브 vs 로컬 글자 같음, regress 56/1 기존 실패). 공유 파일 고칠 때 한국어 글자는 `TNI("키", "한국어")` 로 두면 zh 에서 바뀜. zh 준비본 /workspace/tnk-zh-site(원격 없음) — 동기화는 `bash tools/dev/sync_core.sh <커밋> /workspace/tnk-zh-site` |
| 2026-10-18 08:12 | Grok | **검색 노출 2단계(R-seo-1~4, 민구님 08:00 승인으로 Claude 대신)**: noindex 해제(index·안내 4쪽·e 쪽), canonical, 구글·네이버 인증 메타 자리(index.html 주석), 새 공용 `tools/seo.py`(e 쪽 판 전체 정적 HTML·sitemap), share_kit·deploy.sh 가 sitemap 자동 갱신, verify_live seo 검사, app.js `?ed=` canonical | e 쪽은 이제 tools/seo.py 가 만듦(share_kit.edition_page 가 부름). 기존 e 쪽 다시 만들 땐 `python3 tools/seo.py regen-e`(OG 유지). offline·404·시안은 noindex 유지. regress 헤더 최악 경우 실패 1 은 변경 전 라이브에도 있던 기존 문제 |
| 2026-10-18 07:28 | Grok | 2026-10-18-am 아침판 정기 빌드(15건, 문서·판 데이터만) | 💬 초안 15건 승인 대기(approved false). 환율 39.94 = ticker.json fx(39.9431, open.er-api, rate_time 10-17 07:02 BKK, 05:39 조회) + 07:17 직접 조회 같은 값(주말 새 공시 없음). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패. 첫 빌드가 blocklist 'porn'에 막힘 = 인명 로마자 Srithaporn 거짓 양성 → 로마자 생략(R: blocklist 단어 경계 검사 고려 바람). 후속(update): 라용 KTV 서장 교체·60일 조사(ea1)·기상청 3호 경보(wt1)·네네 로열 상표 소명 요구(en1). issue 연결: bk1 2026-floods-relief. 제외: The Standard 옛 기사 8건·Easy Air(원문 10-14)·한국인 아동 성착취물 수배자 기사(선정성 규정)·Bangkok Post 404/유료·Amarin/Ch7 본문 없음. korea_top 은 data/korea.json(05:39) 6건 GN decode. |
| 2026-10-18 05:33 | Grok | robots.txt 허용 + sitemap.xml 추가(검색 노출 1단계, 민구님 승인 10-18 05:30) | noindex 메타는 아직 그대로 → R-seo-1~4(Claude 담당 파일) 처리해야 실제 색인됨. sitemap.xml 은 손으로 만든 것이라 R-seo-2 전까지 새 판 안 들어감 |
| 2026-10-17 18:29 | Grok | 2026-10-17-pm 저녁판 정기 빌드(17건, 문서·판 데이터만) | 💬 초안 17건 승인 대기(approved false). 환율 39.94 = ticker.json fx(39.9431, open.er-api, rate_time 10-17 07:02 BKK, 14:11 조회) + 18:30 직접 조회 같은 값. screenshot ALL OK. 첫 빌드가 krw_check(브리핑 '105억 바트' 원화 없음)에 막힘 → 문구 수정. 배포 뒤 제목의 의역 인용부호(원문에 없는 따옴표 표현) 6건을 따옴표 없는 서술로 정리해 재배포(8b128f5). issue 연결: vi2 nominee-crackdown·lf1 2026-floods-relief. 제외: 기상청 18~25일 예보 단독(아침판 wt1 중복)·타이항공 보상(10-16-am tr1)·Mirror 영국 여행 안내(기존 규정)·The Standard 수하물 기사(원문 09-29)·치앙마이 노출 사건(선정). korea_top 은 data/korea.json(14:11) 6건 GN decode. 실패 소스: Pattaya City·대사관·AOT·Air4Thai·KOTRA·PR Bangkok SSL/timeout 등 collect 12. |
| 2026-10-17 07:29 | Grok | 2026-10-17-am 아침판 정기 빌드(15건, 문서·판 데이터만) | 💬 초안 15건 승인 대기(approved false). 환율 40.11 = ticker.json fx(40.1114, open.er-api, rate_time 10-16 07:02 BKK, 06:04 조회) + 07:18 직접 조회 같은 값(10-17 공시 전). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi1 단독 고정 카드). 후속: 허위 출생신고·DNA 2명 추가 체포(vi1, update, issue=None). issue 연결: bk3 2026-floods-bangkok-east·lf1 2026-floods-economy. Google News 날짜만 새것인 The Standard 옛 기사 3건(원문 10-02~10-10) 제외. Bangkok Post 본문이 줄마다 글자 뒤집힘(난독화)으로 받아져 줄 단위로 되돌려 읽음. korea_top 은 data/korea.json(06:04) 6건 GN decode(중앙일보 URL 상자 접속 실패→제외). 연예·스포츠 0건. |
| 2026-10-16 18:30 | Grok | 2026-10-16-pm 저녁판 정기 빌드(19건, 문서·판 데이터만) | 💬 초안 19건 승인 대기(approved false). 환율 40.11 = ticker.json fx(40.1114, open.er-api, rate_time 10-16 07:02 BKK, 16:12 조회) + 18:15 직접 조회 같은 값. screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi2 단독 고정 카드). 후속: IMF 시위 종료·6요구·도로 재개방(bk1, update)·라용 전자폐기물 2,500톤↑(ea1, issue=None+update)·방콕 15구 복구(bk2, issue=2026-floods-bangkok-east). issue 연결: vi1 nominee-crackdown·bk2·lf1·wt1·wt2. 제외: 10-15-pm 한국인 274일 오버스테이 재탕·Muaythai DTV(원문 10-02)·선정성 기사. korea_top 은 data/korea.json(16:12) 6건 GN decode(MBC URL 실패→제외). 실패 소스: Pattaya City·대사관·AOT·Air4Thai·KOTRA SSL/timeout 등 collect 8. |
| 2026-10-16 07:33 | Grok | 2026-10-16-am 아침판 정기 빌드(18건, 문서·판 데이터만) | 💬 초안 18건 승인 대기(approved false). 환율 39.83 = ticker.json fx(39.8254, open.er-api, rate_time 10-15 07:02 BKK, 06:01 조회) + 07:17 직접 조회 같은 값(10-16 공시 전). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi2 단독 고정 카드). 후속: IMF 총회 반대 시위 충돌·밤샘 농성·16일 드론 금지(bk1, update). issue 연결: bk2·lf1·tr1·so1(기존 id). 한국 관련: 한-태 전략대화(vi2)·한화오션 호위함 관측(pe1). Google News 날짜만 새것인 옛 기사 3건 제외. korea_top 은 data/korea.json(06:01) 6건 GN decode(연합뉴스 URL 은 상자에서 접속 안 돼 WebFetch 로 확인). |
| 2026-10-15 18:25 | Grok | 2026-10-15-pm 저녁판 정기 빌드(22건, 문서·판 데이터만) | 💬 초안 22건 승인 대기(approved false). 환율 39.83 = ticker.json fx(39.8254, open.er-api, rate_time 10-15 07:02 BKK, 16:11 조회) + 18:15 직접 조회 같은 값. screenshot ALL OK(👎 거짓 실패 안 남). 후속: 출국세 업계 반대(vi4, issue=None+update)·라용 전자 폐기물 공장 폐쇄(ea1, issue=None+update)·16일 펀찟/MRT 시리킷 통제(bk1). 파타야 한국인 남성 체포(vi1, 274일 오버스테이). 실패 소스 2: Pattaya City(SSL)·Air4Thai(timeout). korea_top 은 data/korea.json(16:11) 6건 GN decode. |
| 2026-10-15 07:30 | Grok | 2026-10-15-am 아침판 정기 빌드(17건, 문서·판 데이터만) | 💬 초안 17건 승인 대기(approved false). 환율 39.83 = open.er-api 직접 조회(공시 10-15 00:02 UTC; ticker.json rate_time 10-14 07:02 이라 미사용). screenshot 👎 FAIL 1=알려진 비자 고정 거짓 실패(vi1 단독 고정 카드). Google News 날짜만 새것인 옛 기사 4건 제외(The Standard 등). 출국세·전자 폐기물 새 전개 없음. korea_top 은 data/korea.json(06:04) 6건 GN decode. ent 0건. |

## 잠금 (지금 누가 어떤 파일을 고치는 중인지)
| 파일 | 누가 | 시작 시각 |
|---|---|---|
| (없음) | | |

## 2026-10-20 광고 최종 적용 — Codex (2026-10-20T09:02:07+07:00)
- 사용자 최종확정: 더라운지 v4 / 나머지4 v3, KT에 기존 LINE URL QR 추가. 세 업소 실사진 광고 허락 확인됨.
- 공통 campaign 선택기: 기존 16 슬롯과 숨김 jobs 소비 경로에 드래곤40/파트너각12. 기존 slots.items는 rollback용 보존. 뉴스/자동화/다른 언어판 불변.
- 로컬검증 PASS: 72조합/QR12인식/주변·구인/기기내노출·중복제외/오프라인/fallback/비활성. 실제 공개는 게시 후 라이브 확인. 통계는 device-local이며 글로벌 노출비율 달성을 주장하지 않음.
