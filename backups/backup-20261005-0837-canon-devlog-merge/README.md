바뀐 것: 정본(/workspace/thai-news-portal) rebase 충돌 정리 — DEV_LOG.md 는 HEAD(07:22·07:26 고친 줄) + 03fcb13 의 아침판 확인 줄만(07:50 → 07:49, 커밋 03fcb13 07:49:59 근거) → 7a9b8b3 push(force 없음).
왜: 07:49 일회성 점검이 정본에 직접 커밋(push 안 함) → 08:30 ship.sh 뒤 정본 pull 이 DEV_LOG 충돌로 멈춤(ship exit 1). 글 차이 = DEV_LOG 1줄(git show 7a9b8b3).
되돌리는 법: `git checkout backup-20261005-0837-canon-devlog-merge -- DEV_LOG.md` → 커밋 → push(force 금지). 사진 없음(화면 변화 없음 — DEV_LOG 1줄).
