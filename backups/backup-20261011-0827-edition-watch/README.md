# backup-20261011-0827-edition-watch — 판 공백 감시(GitHub Actions)·한국 뉴스 예비 실행 넣기 직전
1. 바꾼 것: 상자·루틴 실행기와 다른 고장점에서 라이브 latest 를 매시간 보고, 예정(07:08·18:08)+90분 지나도 옛 판이면 GitHub 이슈(edition-gap)를 여는 .github/workflows/edition-watch.yml + tools/edition_watch.py 를 넣고, korea.yml 에 예비 예약 4번(방콕 02:17·08:17·14:17·20:17)을 더했어요.
2. 시험: break-test-fake-late.txt(가짜 옛 latest → 이슈 본문 출력, exit 1) · break-test-live-quiet.txt(진짜 라이브 → 조용, exit 0) · break-test-dedup.txt(같은 공백은 한 번만·복구 때 닫기), 모두 dry-run 이라 진짜 이슈는 안 열었어요.
3. 되돌리기: `git rm .github/workflows/edition-watch.yml tools/edition_watch.py && git checkout backup-20261011-0827-edition-watch -- .github/workflows/korea.yml` → 커밋 → push(force 금지).
