바뀐 것: tools/dev/ship.sh — ① 6분 안에 라이브가 안 바뀌면 빈 커밋으로 Pages 한 번 자동 재배포(force 아님) ② 07:05~08:10 push 거부 ③ 라이브 확인에 '이번 커밋에서 바뀐 파일(최대 5개)'도 포함(02:59 추가분). 화면 변화 없음
왜: 10-05 02:45 드래곤 배너 push 가 GitHub Pages deploy 단계 'Failed to get ID Token' 시간 초과로 라이브에 안 올라갔는데 ship.sh 는 '확인 못 함'만 찍고 끝남. 또 앱 셸(sw/app/index)만 비교해서 css·문서만 바뀐 변경은 바뀌기 전에도 '확인'으로 나올 수 있었음
되돌리는 법: 전부 = `git checkout backup-20261005-0237-dragon-modern-tone -- tools/dev/ship.sh` · ③만 = `git checkout backup-20261005-0259-ship-redeploy -- tools/dev/ship.sh` → 커밋 → push(force 금지)
