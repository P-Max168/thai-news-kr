#!/usr/bin/env bash
# 판 빌드 전 점검(2026-10-05) — 정기 실행(07:08·18:08)과 대체 루틴(07:38·18:38)의 **맨 처음**에 실행.
#   bash tools/preflight.sh <작업이름>              예: bash tools/preflight.sh am-build
#   bash tools/preflight.sh end <작업이름> ok|fail [메모]   (작업 끝에 한 줄 — 실행 기록 닫기)
# 왜: 10-04 07:08 아침판이 안 만들어졌을 때 상자(box)에 '실행이 시작은 됐는지' 증거가 하나도 없었음(DEV_LOG 10-05 원인 조사).
#     → 앞으로는 시작·끝을 /workspace/logs/automation.log 에 남기고, 빌드를 막을 수 있는 상자 쪽 문제를 먼저 스스로 고친다.
# 하는 일(정본 체크아웃 = 이 파일이 있는 저장소):
#   1) 실행 기록 START 한 줄          2) 10분 넘은 git 잠금 파일 지움(git 프로세스가 살아 있으면 안 지움)
#   3) 멈춘 rebase/merge/cherry-pick 취소  4) main 브랜치로       5) 올리지 않은 추적 파일 변경 → stash(버리지 않음)
#   6) fetch + pull --rebase(3번 재시도)   7) 디스크 ≥2GB·메모리 여유 ≥500MB·인터넷(github·news.google) 확인
#   8) python3·playwright·node 확인        9) 오늘 판 상태(있는지) 한 줄
# 끝: 문제 없으면 'PREFLIGHT OK'(exit 0), 고칠 수 없는 문제면 'PREFLIGHT FAIL: 이유'(exit 1) — 이때 판 빌드를 하지 말고 Max 에게 알림.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
LOGDIR="${TNK_LOGDIR:-/workspace/logs}"; LOG="$LOGDIR/automation.log"; mkdir -p "$LOGDIR" 2>/dev/null || true
now() { TZ=Asia/Bangkok date '+%m-%d %H:%M:%S'; }
jlog() { echo "$(now) $*" >> "$LOG" 2>/dev/null || true; }

if [ "${1:-}" = "end" ]; then
  jlog "END   ${2:-?} ${3:-?} ${4:-}"; echo "기록: END ${2:-?} ${3:-?}"; exit 0
fi
JOB="${1:-manual}"
jlog "START $JOB pid=$$ head=$(git rev-parse --short HEAD 2>/dev/null)"
FIX=(); FAIL=()
say() { echo "· $*"; }

# 2) 오래된 잠금
if ! pgrep -x git >/dev/null 2>&1; then
  for f in .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock .git/shallow.lock .git/packed-refs.lock; do
    if [ -e "$f" ] && [ -n "$(find "$f" -mmin +10 2>/dev/null)" ]; then rm -f "$f" && FIX+=("오래된 잠금 $f 지움"); fi
  done
fi
# 3) 멈춘 작업
[ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] && { git rebase --abort >/dev/null 2>&1 && FIX+=("멈춘 rebase 취소"); }
[ -f .git/MERGE_HEAD ] && { git merge --abort >/dev/null 2>&1 && FIX+=("멈춘 merge 취소"); }
[ -f .git/CHERRY_PICK_HEAD ] && { git cherry-pick --abort >/dev/null 2>&1 && FIX+=("멈춘 cherry-pick 취소"); }
# 4) main
b=$(git symbolic-ref --short -q HEAD || echo DETACHED)
if [ "$b" != "main" ]; then git checkout -q main 2>/dev/null && FIX+=("브랜치 $b → main") || FAIL+=("main 으로 못 바꿈(지금 $b)"); fi
# 5) 올리지 않은 추적 파일 변경(헤더 시세·한국 뉴스 파일은 원격 것이 정답이라 그냥 되돌림)
for f in data/korea.json data/korea.js data/ticker.json data/ticker.js; do git checkout -q -- "$f" 2>/dev/null || true; done
if ! git diff --quiet || ! git diff --cached --quiet; then
  n=$(git status --porcelain --untracked-files=no | wc -l)
  if git stash push -q -m "preflight $(now) $JOB"; then FIX+=("올리지 않은 변경 ${n}개 → stash('preflight …', git stash list 로 확인)"); else FAIL+=("올리지 않은 변경을 stash 못 함"); fi
fi
# 6) 원격과 맞추기
ok=""
for i in 1 2 3; do
  if git fetch -q origin main 2>/dev/null && git pull -q --rebase --autostash origin main 2>/dev/null; then ok=1; break; fi
  git rebase --abort >/dev/null 2>&1 || true; sleep $((i * 10))
done
[ -n "$ok" ] || FAIL+=("git pull --rebase 3번 실패(인터넷·충돌)")
behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "?")
[ "$behind" = "0" ] || FAIL+=("원격보다 ${behind}개 뒤처짐")
# 7) 자원·인터넷
free_gb=$(df -Pk . | awk 'NR==2{printf "%d", $4/1048576}')
[ "${free_gb:-0}" -ge 2 ] || FAIL+=("디스크 여유 ${free_gb}GB(<2GB)")
mem_mb=$(awk '/MemAvailable/{printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 9999)
[ "${mem_mb:-0}" -ge 500 ] || FAIL+=("메모리 여유 ${mem_mb}MB(<500MB)")
for u in https://github.com https://news.google.com/rss; do
  c=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$u" || echo 000)
  case "$c" in 2*|3*) ;; *) FAIL+=("인터넷 $u → $c");; esac
done
# 8) 도구
command -v python3 >/dev/null || FAIL+=("python3 없음")
python3 -c "import playwright" 2>/dev/null || FAIL+=("python playwright 없음")
command -v node >/dev/null || FIX+=("node 없음(주제 계산은 간단 매핑으로 대체됨)")
# 9) 오늘 판 상태
d=$(TZ=Asia/Bangkok date +%F); h=$(TZ=Asia/Bangkok date +%H)
st="오늘 아침판 ${d}-am: $([ -f data/${d}-am.json ] && echo 있음 || echo 없음)"
[ "$h" -ge 18 ] && st="$st · 저녁판 ${d}-pm: $([ -f data/${d}-pm.json ] && echo 있음 || echo 없음)"

for x in "${FIX[@]}"; do say "고침: $x"; done
say "상태: 브랜치 $(git symbolic-ref --short -q HEAD) · HEAD $(git rev-parse --short HEAD) · 디스크 ${free_gb}GB · 메모리 ${mem_mb}MB · $st"
if [ ${#FAIL[@]} -eq 0 ]; then
  echo "PREFLIGHT OK"; jlog "OK    $JOB $(IFS=';'; echo "${FIX[*]}") | $st"; exit 0
fi
msg=$(IFS=';'; echo "${FAIL[*]}")
echo "PREFLIGHT FAIL: $msg"; jlog "FAIL  $JOB $msg"; exit 1
