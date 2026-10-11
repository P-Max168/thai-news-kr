# -*- coding: utf-8 -*-
"""최신 판 늦음 검사(2026-10-05) — 라이브 사이트의 최신 판이 예정보다 30분 넘게 늦으면 /workspace/logs/edition-stale.txt 에 한 줄.
  python3 tools/edition_stale.py            # 상태 출력 + 늦으면 한 줄 기록(같은 판은 한 번만)
  python3 tools/edition_stale.py --now "2026-10-05 07:45"   # 시험(방콕 시각 흉내)
예정: 아침판 07:08, 저녁판 18:08 (방콕). 30분 지나도(= 07:38 / 18:38) 라이브 data/index.js 의 latest 가 그 판이 아니면 '늦음'.
읽기만 함(사이트·저장소를 바꾸지 않음), 휴대폰 알림 없음 — Max 가 다음 검수에서 이 파일을 봄. tools/preflight.sh 가 매번 부름.
종료 코드: 0 = 정상, 1 = 늦음(기록함), 2 = 라이브를 못 읽음(기록함)."""
import datetime as dt, json, os, random, re, sys, urllib.request

BKK = dt.timezone(dt.timedelta(hours=7))
SITE = os.environ.get("TNK_SITE", "https://p-max168.github.io/thai-news-kr/")
LOG = os.path.join(os.environ.get("TNK_LOGDIR", "/workspace/logs") if os.environ.get("TNK_TEST") == "1" else "/workspace/logs", "edition-stale.txt")   # 덮어쓰기는 TNK_TEST=1 일 때만(2026-10-05)
SLOTS = [("am", 7, 8), ("pm", 18, 8)]
GRACE = 30


def expected(now):
    """지금 라이브에 있어야 할 가장 최근 판 id 와 그 판의 '늦음 기준 시각'"""
    cands = []
    for back in (0, 1):
        d = (now - dt.timedelta(days=back)).date()
        for slot, h, m in SLOTS:
            due = dt.datetime(d.year, d.month, d.day, h, m, tzinfo=BKK) + dt.timedelta(minutes=GRACE)
            if due <= now:
                cands.append((due, "%s-%s" % (d.isoformat(), slot)))
    due, ed = max(cands)
    return ed, due


def live_latest():
    url = SITE + "data/index.js?_=%d" % random.randrange(10**9)
    last = None
    for i in range(3):   # 일시 실패면 다시(2초·4초)
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"Cache-Control": "no-cache"}), timeout=15) as r:
                txt = r.read().decode("utf-8", "replace")
            m = re.search(r'"latest"\s*:\s*"([^"]+)"', txt)
            if m:
                return m.group(1), None
            last = "index.js 에 latest 없음"
        except Exception as e:   # noqa
            last = "%s: %s" % (type(e).__name__, e)
        if i < 2:
            import time; time.sleep(2 * (i + 1))
    return None, last


def already(key):
    try:
        with open(LOG, encoding="utf-8") as f:
            return any(key in line for line in f)
    except FileNotFoundError:
        return False


def write(line, key):
    if already(key):
        return False
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    return True


def main():
    now = dt.datetime.now(BKK)
    if "--now" in sys.argv:
        now = dt.datetime.strptime(sys.argv[sys.argv.index("--now") + 1], "%Y-%m-%d %H:%M").replace(tzinfo=BKK)
    ed, due = expected(now)
    latest, err = live_latest()
    stamp = now.strftime("%m-%d %H:%M")
    if latest is None:
        key = "[읽기실패 %s]" % ed
        w = write("%s 최신 판 확인 못 함 %s — 라이브 data/index.js 를 3번 못 읽음(%s). 기대 판 %s" % (stamp, key, err, ed), key)
        print("확인 못 함:", err, "(기록함)" if w else "(이미 기록됨)"); return 2
    if latest >= ed:
        print("정상: 라이브 최신 판 %s (기대 %s 이상)" % (latest, ed)); return 0
    late = int((now - due).total_seconds() // 60) + GRACE
    key = "[늦음 %s]" % ed
    w = write("%s 최신 판 늦음 %s — 예정보다 %d분 지남, 라이브 최신 = %s. 07:38·18:38 대체 루틴이 다시 만들어야 함(이유는 /workspace/logs/automation.log 의 START/FAIL 줄 참고 — START 가 없으면 예약 실행이 상자에 안 온 것)" % (stamp, key, late, latest), key)
    print("늦음: 기대 %s, 라이브 %s, %d분 지남 %s" % (ed, latest, late, "(기록함)" if w else "(이미 기록됨)")); return 1


if __name__ == "__main__":
    sys.exit(main())
