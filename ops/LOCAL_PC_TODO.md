# 파타야 로컬 PC(미니PC)로 옮길 일 — 할 일 목록 (2026-10-24 Claude, Gemini 검증 반영)

맥스님이 "PC에 앉았다"고 하면 이 목록부터 같이 본다. 로컬 PC가 연결된 Claude 세션(데스크톱 앱)에서 진행한다.
배경: 클라우드 비상 발행은 ① 뉴스 사이트 직접 접속 불가 ② WebFetch 승인 대기 ③ 배포 승인 ④ GitHub 예약 지연 때문에 느리다.
로컬 PC는 태국 가정용 IP·승인 없음·본문을 공개 저장소에 안 올려도 됨 → 이 셋이 한 번에 풀린다.

## 0. PC 없이도 되는 것 (폰·앱)
- [ ] 비상 발행 예약 작업 설정에서 "Automatically approve" 켜기(조직이 허용할 때만 보임) — 켜야 배포가 자동으로 됨
- [ ] PR #4 (collect RSS 요약문 + 이 문서·절차 보완) 검토 후 합치기

## 1. 확인 (5분, Claude가 직접)
- [ ] 미니PC 기종·OS, 상시 켜짐 여부
- [ ] 두 저장소(thai-news-kr, thai-news-zh) clone 여부·위치, git push 권한
- [ ] `claude` CLI·`gh` 설치·로그인 상태 (로그인은 맥스님 몫)
- [ ] 시간대 `timedatectl` → Asia/Bangkok 인지 (아니면 crontab 시각이 7시간 어긋남)
- [ ] python3·requests·feedparser·googlenewsdecoder

## 2. 수집 정시 깨우기 (가장 먼저, 위험 낮음)
- [ ] crontab: 06:00 · 12:15 · 17:00 에 `gh workflow run collect.yml -R P-Max168/thai-news-kr`
- [ ] collect.yml 의 cron 은 백업으로 그대로 둠

## 3. 본문 추출 (로컬 전용)
- [ ] `tools/fetch_bodies_local.py`: 대상 = 키워드 상위 + 매체 다양성·최신 일반 뉴스(약 45건) 또는 `--urls-file`(Claude가 고른 목록)
- [ ] Google News 링크 풀기는 순차·건당 1.5초 이상(429 방지)
- [ ] 본문·게재 시각(어느 메타에서 읽었는지)·최종 URL·extract_ok 를 로컬(`/tmp/thai-news-bodies/`)에만 저장 — **GitHub 에 절대 올리지 않음(저장소 public)**
- [ ] '관련 기사' 혼입 검사(본문 안 다른 제목·날짜 다발이면 extract_ok=false)
- [ ] 며칠 성공률 측정(매체별) → 태국어 매체가 열리는지 확인

## 4. 비상 발행 로컬 실행
- [ ] `ops/run_local_cron.sh`: PATH 명시, `timeout 900`, 로그 파일, 실패 시 알림
- [ ] `claude -p` 는 `--allowedTools` 로 필요한 것만 허용 — `--dangerously-skip-permissions` 쓰지 않음(뉴스 페이지 속 숨은 지시가 셸 전체·push 권한으로 실행될 위험)
- [ ] 담당 표시(edition_claim.py)로 클라우드 예약 작업과 중복 발행 방지 — 로컬이 먼저, 클라우드는 30분 뒤 백업
- [ ] 정전·인터넷 끊김 시 클라우드 예약 작업이 그대로 이어받는지 한 번 시험

## 5. 하지 않기로 한 것
- 본문 전문을 candidates(공개) 브랜치에 커밋 — 저작권 위험
- 중국어판을 한국어판 기사 번역으로 만들기 — zh 편집 기준(선정은 각자, 방콕 중심)과 충돌. 한국어판의 확인된 사실을 참고 자료로 쓰는 것은 괜찮음
