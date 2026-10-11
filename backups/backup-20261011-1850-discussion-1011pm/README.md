# backup-20261011-1850-discussion-1011pm — 10-11 저녁판 '💬 오늘의 질문'·운영자 첫 댓글 20건 게시 직전
1. 바꾼 것: 민구님이 채팅에서 '전부 OK' 한 초안 20건(글 그대로)을 tools/discussion.py apply 로 data/2026-10-11-pm.json|js 기사 20개에 넣고 tools/discussions/2026-10-11-pm.json 에 저장했어요(generated·기사 글은 그대로).
2. 근거: draft-before.json(초안, approved:false) · draft-after.json(approved:true·applied_at) · data-before.json(게시 전 판 데이터).
3. 되돌리기: `python3 tools/discussion.py clear 2026-10-11-pm` → 커밋 → push(force 금지), 또는 `git checkout backup-20261011-1850-discussion-1011pm -- data/2026-10-11-pm.json data/2026-10-11-pm.js` + `git rm tools/discussions/2026-10-11-pm.json`.
