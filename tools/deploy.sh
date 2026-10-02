#!/usr/bin/env bash
# 새 판을 만든 뒤 GitHub Pages 에 배포하고 라이브 페이지를 검증한다.
#   bash tools/deploy.sh
# - raw/, archive/, screenshots/, 캐시·비밀 파일은 .gitignore 로 제외(절대 올리지 않음)
# - 커밋 메시지: "edition <최신 판 id>"
# - force-push 하지 않는다. 원격이 앞서 있으면 rebase 후 일반 push.
set -euo pipefail
cd "$(dirname "$0")/.."

LIVE_URL="${LIVE_URL:-https://p-max168.github.io/thai-news-kr/}"
TIMEOUT="${DEPLOY_TIMEOUT:-900}"   # 라이브 반영 대기(초)

LATEST=$(python3 -c 'import json;print(json.load(open("data/index.json",encoding="utf-8"))["latest"])')
[ -n "$LATEST" ] || { echo "data/index.json 에 latest 없음" >&2; exit 1; }
[ -f "data/$LATEST.json" ] && [ -f "data/$LATEST.js" ] || { echo "data/$LATEST.json|js 없음" >&2; exit 1; }
echo "최신 판: $LATEST"

# 안전장치: 제외 대상이 실수로 추적되고 있으면 중단
if git ls-files | grep -qE '^(raw|archive|screenshots)/'; then
  echo "오류: raw/ archive/ screenshots/ 가 git 에 추적되고 있음. 배포 중단." >&2; exit 1
fi

git checkout -q main
# 사이트 파일만 스테이징 (.gitignore 가 제외 대상 차단)
git add -A -- index.html robots.txt .nojekyll .gitignore README.md assets data tools
if git diff --cached --quiet; then
  echo "변경 없음 — 커밋 생략"
else
  git commit -q -m "edition $LATEST"
  echo "커밋: $(git log -1 --oneline)"
fi

# push (force 금지). 거부되면 rebase 후 한 번 더.
if ! git push -q origin main; then
  echo "push 거부 → git pull --rebase 후 재시도"
  git pull --rebase -q origin main
  git push -q origin main
fi
echo "push 완료: $(git rev-parse --short HEAD)"

# 라이브 검증: index.js 에 최신 id 가 반영될 때까지 대기 후 헤드리스 브라우저로 렌더 확인
deadline=$(( $(date +%s) + TIMEOUT ))
while :; do
  ts=$(date +%s)
  # 최신 판 id 뿐 아니라 내용(같은 판을 고쳐 다시 올린 경우)과 앱 코드까지 로컬과 같아야 통과
  if curl -fsS "${LIVE_URL}data/index.js?_=$ts" 2>/dev/null | grep -F "\"latest\": \"$LATEST\"" >/dev/null \
     && [ "$(curl -fsS "${LIVE_URL}data/$LATEST.js?_=$ts" 2>/dev/null | sha256sum | cut -d' ' -f1)" = "$(sha256sum "data/$LATEST.js" | cut -d' ' -f1)" ] \
     && [ "$(curl -fsS "${LIVE_URL}assets/app.js?_=$ts" 2>/dev/null | sha256sum | cut -d' ' -f1)" = "$(sha256sum assets/app.js | cut -d' ' -f1)" ]; then
    echo "라이브 데이터·앱 코드에 $LATEST (현재 커밋 내용) 반영됨"; break
  fi
  [ "$ts" -ge "$deadline" ] && { echo "실패: ${TIMEOUT}s 안에 라이브에 $LATEST 가 반영되지 않음 ($LIVE_URL)" >&2; exit 2; }
  sleep 20
done

if python3 -c 'import playwright' 2>/dev/null; then
  python3 tools/verify_live.py "$LIVE_URL" "$LATEST" "screenshots/live-mobile-390.png"
else
  echo "playwright 없음 — 브라우저 렌더 검증 생략(데이터 검증은 통과)"
fi
echo "배포 완료: $LIVE_URL (판 $LATEST)"
