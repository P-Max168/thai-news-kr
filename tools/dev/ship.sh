#!/usr/bin/env bash
# 개발 변경 배포: stamp → 커밋 → pull --rebase --autostash → push(force 금지) → 정본 체크아웃 갱신 → 라이브 반영 대기
#   bash tools/dev/ship.sh "커밋 메시지"
set -euo pipefail
cd "$(dirname "$0")/../.."
MSG="$1"
# 07:05–08:10(방콕) push 금지(정기 아침판 시간) — 사람이 잊어도 여기서 막음(2026-10-05)
hm=$(TZ=Asia/Bangkok date +%H%M); if [ "$hm" -ge 0705 ] && [ "$hm" -le 0810 ]; then echo "지금 $(TZ=Asia/Bangkok date +%H:%M) — 07:05~08:10 은 push 금지(아침판). 08:10 뒤에 다시" >&2; exit 4; fi
KOREA_FILES="data/korea.json data/korea.js data/ticker.json data/ticker.js"
for f in $KOREA_FILES; do git checkout -q -- "$f" 2>/dev/null || true; done
python3 tools/pending.py >/dev/null 2>&1 || true   # 승인함 목록(PENDING_APPROVAL.md → data/pending.json)
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
# 정본 체크아웃 갱신 — 실패하면 크게 알리고 끝에 exit 5(10-05 03:33: 정본에 같은 이름의 추적 안 된 파일이 있어 pull 이 멈췄는데 조용히 넘어감 → 07:08 정기 실행이 옛 코드로 돌 뻔)
CANON_FAIL=""
if ( cd /workspace/thai-news-portal && git pull -q --rebase --autostash ) 2>/tmp/ship-canon.err; then echo "정본 체크아웃 갱신"
else CANON_FAIL=1; echo "‼️ 정본 체크아웃(/workspace/thai-news-portal) 갱신 실패 — 아래 이유를 고친 뒤 그 폴더에서 git pull --rebase --autostash" >&2; head -5 /tmp/ship-canon.err >&2; fi
# 라이브 반영 대기(app.js·sw.js·index.html 이 로컬과 같아질 때까지, 최대 6분)
# 앱 셸 3개 + 이번 커밋에서 바뀐 파일(최대 5개, data/·backups/ 제외) — stamp 가 안 바뀌는 변경(예: 광고 css 만)도 실제로 확인
CHECK_FILES="sw.js assets/app.js index.html $(git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E '\.(js|css|html|md|sh|py)$' | grep -vE '^(data|backups)/' | head -5 | tr '\n' ' ')"
wait_live() {
  for i in $(seq 1 36); do
    ts=$(date +%s); same=1
    for f in $CHECK_FILES; do
      [ -f "$f" ] || continue
      [ "$(curl -fsS "https://p-max168.github.io/thai-news-kr/$f?_=$ts" 2>/dev/null | sha256sum | cut -c1-16)" = "$(sha256sum $f | cut -c1-16)" ] || same=0
    done
    [ $same = 1 ] && return 0
    sleep 10
  done
  return 1
}
if wait_live; then echo "라이브 반영 확인 ($(TZ=Asia/Bangkok date +%H:%M))"; [ -z "$CANON_FAIL" ] || exit 5; exit 0; fi
# 6분 안에 안 바뀜 = GitHub Pages 배포가 실패했을 수 있음(10-05 02:45: deploy 단계 'Failed to get ID Token' 시간 초과 — GitHub 쪽 일시 오류).
# → 빈 커밋 하나로 Pages 를 한 번만 다시 돌림(force 아님). 그래도 안 되면 exit 2 + 크게 알림(사람·Max 가 Actions 확인)
echo "라이브 반영 확인 못 함(6분 초과) → Pages 다시 배포 1번 시도" >&2
git commit -q --allow-empty -m "재배포: GitHub Pages 배포가 6분 안에 반영 안 돼 한 번 더(ship.sh 자동)" && git pull --rebase --autostash -q origin main && git push -q origin main || { echo "재배포 push 실패" >&2; exit 2; }
if wait_live; then echo "라이브 반영 확인 — 재배포로 ($(TZ=Asia/Bangkok date +%H:%M))"; [ -z "$CANON_FAIL" ] || exit 5; exit 0; fi
echo "‼️ 라이브 반영 확인 못 함(재배포 뒤에도) — GitHub Actions 'pages build and deployment' 확인 필요" >&2; exit 2
