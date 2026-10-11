#!/usr/bin/env bash
# 개발 변경 배포: stamp → 커밋 → pull --rebase --autostash → push(force 금지) → 정본 체크아웃 갱신 → 라이브 반영 대기
#   bash tools/dev/ship.sh "커밋 메시지"
set -euo pipefail
cd "$(dirname "$0")/../.."
MSG="$1"
# 시험용 환경 변수가 남아 있으면 배포 안 함(2026-10-05): 08:51 배포 때 부숴 보기에서 export 한 CANON_DIR=/tmp/cg/canon 이 남아
#   정본 검사가 가짜 정본을 봤음. 시험 덮어쓰기(CANON_DIR·TNK_LOGDIR·CANON_NO_FETCH)는 TNK_TEST=1 이 같이 있을 때만(가짜 origin 시험용).
#   진짜 배포는 깨끗한 환경으로: env -u CANON_DIR -u TNK_LOGDIR -u CANON_NO_FETCH bash tools/dev/ship.sh "…"
OVR="$(for v in CANON_DIR TNK_LOGDIR CANON_NO_FETCH; do [ -n "${!v:-}" ] && printf '%s=%s ' "$v" "${!v}"; done; true)"
if [ -n "$OVR" ] && [ "${TNK_TEST:-}" != "1" ]; then
  echo "배포 거부: 시험용 환경 변수가 남아 있음 — ${OVR}(TNK_TEST=1 없음). 'env -u CANON_DIR -u TNK_LOGDIR -u CANON_NO_FETCH' 로 다시" >&2; exit 9
fi
CANON=/workspace/thai-news-portal; [ "${TNK_TEST:-}" = "1" ] && CANON="${CANON_DIR:-$CANON}"
[ "${TNK_TEST:-}" = "1" ] && echo "TNK_TEST=1 — 시험 모드: 정본 $CANON" >&2
# 07:05–08:10(방콕) push 금지(정기 아침판 시간) — 사람이 잊어도 여기서 막음(2026-10-05)
hm=$(TZ=Asia/Bangkok date +%H%M); if [ "$hm" -ge 0705 ] && [ "$hm" -le 0810 ]; then echo "지금 $(TZ=Asia/Bangkok date +%H:%M) — 07:05~08:10 은 push 금지(아침판). 08:10 뒤에 다시" >&2; exit 4; fi
# 정본 체크아웃 검사(2026-10-05): 정본이 rebase/merge 중·앞섬·바뀐/추적 안 된 파일이면 push 전에 멈춤(아무것도 안 고침, canon-alert.txt + automation.log)
#   10-05 08:30: 정본에 직접 커밋된 DEV_LOG 줄 때문에 push 뒤 정본 pull 이 rebase 중간에 멈췄음(ship exit 1) → 이제 push 전에 막음
bash tools/canon_guard.sh ship || { echo "정본 상태가 깨끗하지 않아 배포 안 함(push 전). 정본을 먼저 정리" >&2; exit 7; }
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
  # 2026-10-05: union 병합(.gitattributes) 뒤 DEV_LOG·BACKUPS 에 충돌 표시·같은 줄 두 번·되살아난 옛 줄이 있으면 push 안 함
  python3 tools/dev/log_check.py || { echo "DEV_LOG/BACKUPS 병합 점검 실패 — push 안 함(위 FAIL 줄 고친 뒤 다시)" >&2; exit 8; }
  if git push -q origin main; then ok=1; break; fi
  sleep $((i*5))
done
[ -n "$ok" ] || { echo "push 실패" >&2; exit 3; }
echo "push: $(git log -1 --oneline)"
# 정본 체크아웃 갱신 — 실패하면 크게 알리고 끝에 exit 5(10-05 03:33: 정본에 같은 이름의 추적 안 된 파일이 있어 pull 이 멈췄는데 조용히 넘어감 → 07:08 정기 실행이 옛 코드로 돌 뻔)
CANON_FAIL=""
if ( cd "$CANON" && git pull -q --rebase --autostash ) 2>/tmp/ship-canon.err; then echo "정본 체크아웃 갱신"
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
