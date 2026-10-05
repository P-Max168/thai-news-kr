# 로그인이 필요해서 봇이 못 한 일 (민구님 할 일)

한 줄 = **무엇을 / 어디서 / 왜**. 컴퓨터 브라우저에서 로그인만 해 주시면 나머지는 봇이 이어서 합니다.

| 무엇을 | 어디서 | 왜 |
|---|---|---|
| **완료 10-05 03:24** — Firestore 보안 규칙 게시(익명 반응 집계 `rx` + ⚠️ 오류 신고 `reports` 포함 `firestore.rules` 162줄 전체) | Firebase 콘솔 → thai-news-kr → Firestore Database → 규칙 | Max 가 03:24 게시·확인(`match /reports/{id}`·`/rx/`). 예전 콘솔 규칙(45줄) 참고본: backups/firestore-rules-before-publish-20261005/. 03:26 지시로 `RX_ON`·`REP_ON` 켬(서버 저장 확인 기록은 DEV_LOG 10-05) |
| 구글 애드센스 신청(승인함 #3·#4·#5 결정 뒤) — 사이트 주소 등록 → 게시자 ID(pub-…)를 봇에게 알려 주기 | https://adsense.google.com (운영자 구글 계정 로그인, 은행·주소 정보 필요) | 봇은 계정을 만들 수 없음. ID 를 받으면 봇이 ads.txt 줄을 켜고 `data/ads.json` 각 칸의 `adsense_slot` 을 채움(자리 크기는 이미 표준 단위로 맞춰 둠). 자동 광고·팝업은 안 씀 |
| (비용·나중) 앱 가게 등록 — Android: Google Play 개발자 계정(1회 25달러) / iOS: Apple Developer Program(연 99달러, 맥 필요) | play.google.com/console · developer.apple.com (운영자 계정·결제) | 봇은 결제·계정 생성을 못 함. 포장 방법·준비 상태는 `APP_PACKAGING.md`. 주소창 없는 Android 앱은 도메인 맨 위 `/.well-known/assetlinks.json` 필요(승인함 #5 와 같은 문제) |
| **대기** — Firestore 보안 규칙 다시 게시(다음 규칙 게시 때 함께): `firestore.rules` 전체(205줄, 새로 `match /adclicks/{id}` = 광고 자리별 클릭 수 **+ 10-05 06:50 추가: `match /placeflags/{id}` = 🚫 가게별 폐업 신고 숫자(누구나 읽기·운영자만 쓰기·지우기 금지) · reports 의 type 에 'closed'(🚫 폐업·없어짐) 허용**) | Firebase 콘솔 → thai-news-kr → Firestore Database → 규칙 | 광고 자리 id + 날짜 별 숫자만 모으는 칸(사람 정보 없음, 운영자만 읽기). 2026-10-05 저장소에만 추가, **게시 안 함**. 게시해도 사이트 스위치 `AD_CLICK_ON = false` 라 아무것도 안 모임 — 켜기는 따로 승인. 에뮬레이터 시험 24/24: backups/backup-20261005-0453-ad-click-count/rules-emulator-test.txt · placeflags·closed 시험 20/20: backups/backup-20261005-0846-shop-trust/rules-emulator-placeflags-test.txt. 게시 뒤 봇이 할 일 = data/places-flags.json `fs_live: true` + assets/report.js `CLOSED_TYPE_ON = true`(두 줄, 승인 뒤) |
