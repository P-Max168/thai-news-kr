바뀐 것: 광고 자리별 클릭 수(익명 — 자리 id + 방콕 날짜 별 숫자만) 준비: assets/social.js(AD_CLICK_ON = false, 꺼지면 클릭을 듣지도 않음)·assets/fb.js(addAdClicks·listAdClicks)·firestore.rules adclicks 칸(저장소에만, 게시 안 함)·regress '꺼짐' 줄·LOGIN_TODO '대기' 한 줄·승인함 통계 칸 시안(mockup-approve-adclicks.html, 사이트엔 안 붙임). 화면 변화 없음.
왜: Max 04:30 ③ — 광고 자리별 반응을 개인 정보 없이 셀 준비(켜기·규칙 게시는 민구님 승인 뒤).
되돌리는 법: `git checkout backup-20261005-0453-ad-click-count -- assets/social.js assets/fb.js firestore.rules tools/dev/regress.py LOGIN_TODO.md README.md` → stamp → 커밋 → push(force 금지). 규칙은 게시 전이라 콘솔에서 할 일 없음
