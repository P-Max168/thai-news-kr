바뀐 것: 하트 목록·관리자 화면이 옛 판 파일(data/<판>.js)·승인함 목록·반응 통계를 못 받으면 1초·3초(·9초) 뒤 자동으로 2~3번 다시 받음(무한 반복 없음, 그래도 안 되면 예전 버튼). 상자 쪽 tools/edition_stale.py: 라이브 최신 판이 예정보다 30분 넘게 늦으면 /workspace/logs/edition-stale.txt 한 줄(preflight 가 매번 부름). tools/dev/tag.sh 가 잘못된 태그 이름을 거부.
왜: 한 번의 일시적 실패에도 '불러오지 못했어요'가 떠서 사람이 '다시 시도'를 눌러야 했고, 판이 늦어도 상자에 남는 기록이 없었음(10-04 아침판). 태그 이름 중복(0204-backup-…)의 재발 방지.
되돌리는 법: git checkout backup-20261005-0229-edition-retry -- assets/pages.js tools/preflight.sh tools/dev/tag.sh README.md && git rm tools/edition_stale.py && python3 tools/stamp_assets.py && 커밋 → push(force 금지)
