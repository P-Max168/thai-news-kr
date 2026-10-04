# 로그인이 필요해서 봇이 못 한 일 (민구님 할 일)

한 줄 = **무엇을 / 어디서 / 왜**. 컴퓨터 브라우저에서 로그인만 해 주시면 나머지는 봇이 이어서 합니다.

| 무엇을 | 어디서 | 왜 |
|---|---|---|
| Firestore 보안 규칙 게시(익명 반응 집계 `rx` + ⚠️ 오류 신고 `reports` 추가, 2026-10-05) — 저장소 `firestore.rules` 전체를 복사해 붙여 넣고 '게시' | Firebase 콘솔 → thai-news-kr → Firestore Database → 규칙 (mgisgood1919@gmail.com 로그인) | 게시하신 뒤 봇에게 '규칙 게시함'이라고만 알려 주시면 `assets/social.js` 의 `RX_ON` 을 켭니다(그 전엔 각 휴대폰에 최대 60개까지 모아 둠). 게시 전에는 하트·🙌·🙅 반응이 서버에 안 모여 📊 반응 통계(운영자)가 비어 있음. 사이트는 그대로 동작(이 기기에서 하루 쉬었다 다시 시도). 이 상자에 firebase 로그인이 없어 봇이 못 함 |
| 구글 애드센스 신청(승인함 #3·#4·#5 결정 뒤) — 사이트 주소 등록 → 게시자 ID(pub-…)를 봇에게 알려 주기 | https://adsense.google.com (운영자 구글 계정 로그인, 은행·주소 정보 필요) | 봇은 계정을 만들 수 없음. ID 를 받으면 봇이 ads.txt 줄을 켜고 `data/ads.json` 각 칸의 `adsense_slot` 을 채움(자리 크기는 이미 표준 단위로 맞춰 둠). 자동 광고·팝업은 안 씀 |
| (비용·나중) 앱 가게 등록 — Android: Google Play 개발자 계정(1회 25달러) / iOS: Apple Developer Program(연 99달러, 맥 필요) | play.google.com/console · developer.apple.com (운영자 계정·결제) | 봇은 결제·계정 생성을 못 함. 포장 방법·준비 상태는 `APP_PACKAGING.md`. 주소창 없는 Android 앱은 도메인 맨 위 `/.well-known/assetlinks.json` 필요(승인함 #5 와 같은 문제) |
