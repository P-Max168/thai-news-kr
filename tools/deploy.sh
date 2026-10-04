#!/usr/bin/env bash
# 새 판을 만든 뒤 GitHub Pages 에 배포하고 라이브 페이지를 검증한다.
#   bash tools/deploy.sh
# - raw/, archive/, screenshots/, 캐시·비밀 파일은 .gitignore 로 제외(절대 올리지 않음)
# - 커밋 메시지: "edition <최신 판 id>"
# - force-push 하지 않는다. 원격이 앞서 있으면 rebase 후 일반 push.
set -euo pipefail
cd "$(dirname "$0")/.."
# 실행 기록(2026-10-05): 끝나면 /workspace/logs/automation.log 에 deploy ok/fail 한 줄(tools/preflight.sh end) — 실패 원인 추적용, 동작에는 영향 없음
_deploy_end() { local c=$?; bash tools/preflight.sh end deploy "$([ $c -eq 0 ] && echo ok || echo fail)" "exit=$c $(git rev-parse --short HEAD 2>/dev/null)" >/dev/null 2>&1 || true; }
trap _deploy_end EXIT

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
# 🇰🇷 data/korea.json|js · 💱 data/ticker.json|js(헤더 시세 칩)는 GitHub Actions(.github/workflows/korea.yml)가 2시간마다 갱신·커밋하는 파일
# → 이 스크립트는 절대 올리지 않는다. 로컬 사본(오래됐을 수 있음)은 버리고 원격 것을 받는다(pull 때 충돌·덮어쓰기 방지).
KOREA_FILES="data/korea.json data/korea.js data/ticker.json data/ticker.js"
for f in $KOREA_FILES; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then git checkout -q -- "$f"; else rm -f "$f"; fi
done
# 앱 셸 버전 갱신(assets 가 바뀌었으면 index.html ?v= 와 sw.js VERSION 변경 → 서비스 워커가 새 파일을 받음)
python3 tools/stamp_assets.py
# 사이트 파일만 스테이징 (.gitignore 가 제외 대상 차단)
# og/(링크 미리보기 이미지)·e/(판별 미리보기 페이지)는 tools/share_kit.py 가 만듦 — 있는 경로만 추가
PATHS=""
for p in index.html robots.txt .nojekyll .gitignore README.md manifest.json sw.js firestore.rules assets data tools og e .github; do
  [ -e "$p" ] && PATHS="$PATHS $p"
done
git add -A -- $PATHS
git reset -q -- $KOREA_FILES 2>/dev/null || true   # 혹시 스테이징됐어도 빼기
if git diff --cached --quiet; then
  echo "변경 없음 — 커밋 생략"
else
  git commit -q -m "edition $LATEST"
  echo "커밋: $(git log -1 --oneline)"
fi

# push (force 금지). 먼저 원격(Actions 의 korea.json 커밋 등)을 rebase 로 받은 뒤 일반 push, 거부되면 최대 4번 재시도.
ok=""
for i in 1 2 3 4; do
  git pull --rebase --autostash -q origin main || { echo "git pull --rebase 실패(충돌?) — 수동 확인 필요" >&2; git rebase --abort 2>/dev/null || true; exit 3; }
  if git push -q origin main; then ok=1; break; fi
  echo "push 거부($i) → 잠시 뒤 pull --rebase 후 재시도"; sleep $((i * 5))
done
[ -n "$ok" ] || { echo "push 실패" >&2; exit 3; }
echo "push 완료: $(git rev-parse --short HEAD)"

# 라이브 검증: index.js 에 최신 id 가 반영될 때까지 대기 후 헤드리스 브라우저로 렌더 확인
deadline=$(( $(date +%s) + TIMEOUT ))
while :; do
  ts=$(date +%s)
  # 최신 판 id 뿐 아니라 내용(같은 판을 고쳐 다시 올린 경우)과 앱 코드까지 로컬과 같아야 통과
  if curl -fsS "${LIVE_URL}data/index.js?_=$ts" 2>/dev/null | grep -F "\"latest\": \"$LATEST\"" >/dev/null \
     && [ "$(curl -fsS "${LIVE_URL}data/$LATEST.js?_=$ts" 2>/dev/null | sha256sum | cut -d' ' -f1)" = "$(sha256sum "data/$LATEST.js" | cut -d' ' -f1)" ] \
     && [ "$(curl -fsS "${LIVE_URL}assets/app.js?_=$ts" 2>/dev/null | sha256sum | cut -d' ' -f1)" = "$(sha256sum assets/app.js | cut -d' ' -f1)" ] \
     && [ "$(curl -fsS "${LIVE_URL}sw.js?_=$ts" 2>/dev/null | sha256sum | cut -d' ' -f1)" = "$(sha256sum sw.js | cut -d' ' -f1)" ]; then
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
