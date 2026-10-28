# -*- coding: utf-8 -*-
"""gemini_spend 일일 상한·집계 단위 검사(2026-10-28).
실행: python3 tools/dev/test_gemini_spend.py
"""
import json, os, pathlib, sys, tempfile
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import gemini_spend as s

FAIL = 0

def eq(label, got, exp):
    global FAIL
    if got != exp:
        FAIL += 1
        print("FAIL", label, "got=%r exp=%r" % (got, exp))
    else:
        print("ok  ", label, "→", got)

def ok(label, cond):
    global FAIL
    if not cond:
        FAIL += 1
        print("FAIL", label)
    else:
        print("ok  ", label)

def near(label, got, exp, eps=1e-6):
    global FAIL
    if abs(got - exp) > eps:
        FAIL += 1
        print("FAIL", label, "got=%r exp=%r" % (got, exp))
    else:
        print("ok  ", label, "→", got)


def test_official_prices():
    # 공식 Standard Paid (페이지 2026-10-28 확인)
    eq("lite in", s.PRICES_USD_PER_1M["gemini-3.5-flash-lite"]["input"], 0.30)
    eq("lite out", s.PRICES_USD_PER_1M["gemini-3.5-flash-lite"]["output"], 2.50)
    eq("38 in", s.PRICES_USD_PER_1M["gemini-3.8-flash"]["input"], 0.75)
    eq("38 out", s.PRICES_USD_PER_1M["gemini-3.8-flash"]["output"], 3.75)
    eq("cap default", s.DAILY_CAP_THB, 200.0)
    eq("usd_thb default", s.USD_THB, 34.0)


def test_cost_math():
    # 1M in + 1M out lite → 0.30+2.50 = 2.80 USD → *34 = 95.2 THB
    near("lite 1M", s.cost_thb("gemini-3.5-flash-lite", 1_000_000, 1_000_000, 0), 2.80 * 34.0)
    # thinking counts as output
    near("thinking as out", s.cost_usd("gemini-3.5-flash-lite", 0, 0, 1_000_000), 2.50)
    # 3.8 flash
    near("38 1M", s.cost_usd("gemini-3.8-flash", 1_000_000, 1_000_000, 0), 0.75 + 3.75)


def test_tally_day_reset_and_merge():
    day = "2026-10-28"
    a = s.empty_tally(day)
    a["entries"].append(s.make_entry("gemini-3.5-flash-lite", 1000, 500, 0,
                                      meta={"edition": "2026-10-28-am"}, repo="P-Max168/thai-news-kr", call_i=1))
    # force day/at
    a["entries"][0]["day"] = day
    a["entries"][0]["at"] = day + "T08:00:00+07:00"
    a["entries"][0]["id"] = "kr-1"
    b = s.empty_tally(day)
    b["entries"].append({
        "id": "zh-1", "at": day + "T09:00:00+07:00", "day": day,
        "repo": "P-Max168/thai-news-zh", "edition": "2026-10-28-am",
        "model": "gemini-3.5-flash-lite", "prompt": 2000, "output": 1000, "thinking": 0,
        "cost_usd": s.cost_usd("gemini-3.5-flash-lite", 2000, 1000, 0),
        "cost_thb": s.cost_thb("gemini-3.5-flash-lite", 2000, 1000, 0),
    })
    # duplicate id ignored (same id different cost → last wins)
    b["entries"].append(dict(b["entries"][0], cost_thb=0.01, cost_usd=0.0001))
    m = s.merge_tallies(a, b, day=day)
    eq("merged count", len(m["entries"]), 2)
    near("merged spent", m["spent_thb"],
         s.cost_thb("gemini-3.5-flash-lite", 1000, 500, 0) + 0.01)
    # other day ignored
    other = s.empty_tally("2026-10-27")
    other["entries"].append(dict(a["entries"][0], day="2026-10-27", id="old"))
    m2 = s.merge_tallies(m, other, day=day)
    eq("day filter", len(m2["entries"]), 2)


def test_cap_blocks():
    day = "2099-01-01"  # isolated
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        (root / "ops").mkdir()
        # pretally near cap
        t = s.empty_tally(day)
        t["cap_thb"] = 200
        # spend 199 THB already
        t["entries"].append({
            "id": "big", "at": day + "T01:00:00+07:00", "day": day,
            "repo": "local", "edition": "x", "model": "gemini-3.5-flash-lite",
            "prompt": 0, "output": 0, "thinking": 0,
            "cost_usd": 199.5 / 34.0, "cost_thb": 199.5,
        })
        s.save_local(root, t)
        # tiny prompt still assumes 10k output → est > 1 THB for lite
        # lite 10k out = 2.50 * 10k/1M * 34 = 0.85 THB; plus prompt
        # 199 + ~0.85 > 200 → should block
        blocked = False
        try:
            s.check_can_call(root, "gemini-3.5-flash-lite", "hello " * 100, day=day, token="")
        except s.SpendCapExceeded as ex:
            blocked = True
            ok("ex has spent", ex.spent_thb >= 199.5)
            ok("ex cap 200", ex.cap_thb == 200)
        ok("blocked near cap", blocked)

        # empty tally allows
        root2 = pathlib.Path(td) / "empty"
        root2.mkdir()
        (root2 / "ops").mkdir()
        ok_call, spent, est, cap, _ = s.check_can_call(
            root2, "gemini-3.5-flash-lite", "hi", day=day, token="")
        ok("allowed on empty", ok_call is True)
        eq("spent0", spent, 0.0)
        ok("est>0", est > 0)
        eq("cap", cap, 200.0)


def test_record_local():
    day = s.today_bkk()
    with tempfile.TemporaryDirectory() as td:
        root = pathlib.Path(td)
        (root / "ops").mkdir()
        # reset session
        s._SESSION_ENTRIES.clear()
        s._SESSION_SPENT_THB = 0.0
        entry, local, hub_ok, hub_msg = s.record_usage(
            root, "gemini-3.5-flash-lite",
            {"promptTokenCount": 1000, "candidatesTokenCount": 500, "thoughtsTokenCount": 0},
            meta={"edition": day + "-am"}, call_i=1, token="", push=False)
        ok("entry cost>0", entry["cost_thb"] > 0)
        eq("local entries", len(local["entries"]), 1)
        near("local spent", local["spent_thb"], entry["cost_thb"])
        # reload
        again = s.load_local(root, day=day)
        eq("reload", len(again["entries"]), 1)
        eq("hub skipped", hub_ok, False)


def test_env_cap_override():
    old = os.environ.get("GEMINI_DAILY_CAP_THB")
    try:
        # module already read DAILY_CAP_THB at import; check_can_call uses tally cap or module default.
        # save_local empty uses module DAILY_CAP_THB — verify empty_tally respects current module attr after monkeypatch
        prev = s.DAILY_CAP_THB
        s.DAILY_CAP_THB = 50.0
        t = s.empty_tally("2099-02-02")
        eq("cap override empty", t["cap_thb"], 50.0)
        s.DAILY_CAP_THB = prev
    finally:
        if old is None:
            os.environ.pop("GEMINI_DAILY_CAP_THB", None)
        else:
            os.environ["GEMINI_DAILY_CAP_THB"] = old


if __name__ == "__main__":
    test_official_prices()
    test_cost_math()
    test_tally_day_reset_and_merge()
    test_cap_blocks()
    test_record_local()
    test_env_cap_override()
    if FAIL:
        print("FAILED", FAIL)
        raise SystemExit(1)
    print("ALL OK")
