바뀐 것: regress '🛡️ 민감 기사 점수 기준' 줄이 되돌린 뒤 배너 표시를 TOP 1 실제 위험(hl0risk)과 비교 · ship.sh CHECK_FILES 의 grep 0줄을 정상으로(|| true) · edition_stale.py 가 2판 이상 공백이면 /workspace/logs/edition-gaps.txt 에 빠진 판 목록·경보(빌드 안 함). 화면 변화 없음(사진 대신 break-test.txt · before/ · after/ · change.patch).
왜: 10-11 아침판 라이브 regress 거짓 실패 1건(민감 TOP1 vi1 이라 배너 숨김이 정답) · data/ 만 바뀐 커밋에서 push 뒤 ship.sh exit 1(라이브 대기 건너뜀) · 07:38 백업 점검이 6일 공백(11판)을 '1판 늦음'처럼만 적었음.
되돌리는 법: `git checkout backup-20261011-0817-regress-ship-gap -- tools/dev/regress.py tools/dev/ship.sh tools/edition_stale.py` → 커밋 → push(force 금지)
