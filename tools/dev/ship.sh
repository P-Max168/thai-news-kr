#!/usr/bin/env bash
# 개발 변경 배포: stamp → 커밋 → pull --rebase --autostash → push(force 금지) → 정본 체크아웃 갱신 → 라이브 반영 대기
#   bash tools/dev/ship.sh "커밋 메시지"
set -euo pipefail
cd "$(dirname "$0")/../.."
MSG="$1"
KOREA_FILES="data/korea.json data/korea.js data/ticker.json data/ticker.js"
for f in $KOREA_FILES; do git checkout -q -- "$f" 2>/dev/null || true; done
python3 tools/stamp_assets.py
git add -A
git reset -q -- $KOREA_FILES 2>/dev/null || true
git diff --cached --quiet || git commit -q -m "$MSG"
ok=""
for i in 1 2 3 4; do
  if ! git pull --rebase --autostash -q origin main; then
    echo "rebase 충돌 — 수동 해결 필요" >&2; git status --short | head; exit 3
  fi
  python3 tools/stamp_assets.py >/dev/null
  if ! git diff --quiet; then git add index.html sw.js assets/social.js; git commit -q -m "stamp: 앱 셸 버전 다시 맞춤"; fi
  if git push -q origin main; then ok=1; break; fi
  sleep $((i*5))
done
[ -n "$ok" ] || { echo "push 실패" >&2; exit 3; }
echo "push: $(git log -1 --oneline)"
( cd /workspace/thai-news-portal && git pull -q --rebase --autostash ) && echo "정본 체크아웃 갱신"
# 라이브 반영 대기(app.js·sw.js·index.html 이 로컬과 같아질 때까지, 최대 6분)
for i in $(seq 1 36); do
  ts=$(date +%s); same=1
  for f in sw.js assets/app.js index.html; do
    [ "$(curl -fsS "https://p-max168.github.io/thai-news-kr/$f?_=$ts" 2>/dev/null | sha256sum | cut -c1-16)" = "$(sha256sum $f | cut -c1-16)" ] || same=0
  done
  [ $same = 1 ] && { echo "라이브 반영 확인 ($(TZ=Asia/Bangkok date +%H:%M))"; exit 0; }
  sleep 10
done
echo "라이브 반영 확인 못 함(6분 초과)"; exit 2
