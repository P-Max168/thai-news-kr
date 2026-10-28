# -*- coding: utf-8 -*-
"""제미나이 일일 비용 상한(코드 측 하드캡). 2026-10-28 Max: 하루 200바트.

Google Cloud 예산은 알림만 보내고 끊지 않으므로, 호출 전에 이 모듈이 막는다.
집계 허브: P-Max168/thai-news-kr 의 ops/gemini-spend.json (프로젝트 공용 키 기준).
다른 저장소는 허브를 읽고, 가능하면 Contents API로 갱신(충돌 시 재시도).
로컬에도 같은 형식 파일을 남겨 배포 커밋에 실는다.

가격(확인됨, Standard Paid, USD / 1M 토큰):
  출처: https://ai.google.dev/gemini-api/docs/pricing  (페이지 Last updated 2026-10-27 UTC, 읽은 날 2026-10-28 BKK)
  gemini-3.5-flash-lite: input 0.30, output 2.50 (thinking 포함 output)
  gemini-3.8-flash:      input 0.75, output 3.75  (2026-12-31까지 프로모 가; 이후 1.50/7.50)
환율: USD_THB=34.0 고정(보수적). 근거: Yahoo USDTHB 2026-10-28 ≈33.81, Exa ≈33.83.
  바트가 비싸게(비용을 크게) 잡히면 상한이 더 일찍 걸려 안전하다.
"""
from __future__ import annotations

import json
import os
import pathlib
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta

BKK = timezone(timedelta(hours=7))

# --- 설정(환경 변수로 덮어쓰기 가능) ---
DAILY_CAP_THB = float(os.environ.get("GEMINI_DAILY_CAP_THB", "200"))
USD_THB = float(os.environ.get("GEMINI_USD_THB", "34.0"))
HUB_REPO = os.environ.get("GEMINI_SPEND_HUB_REPO", "P-Max168/thai-news-kr")
HUB_PATH = os.environ.get("GEMINI_SPEND_HUB_PATH", "ops/gemini-spend.json")
PEER_REPOS = [
    "P-Max168/thai-news-kr",
    "P-Max168/thai-news-zh",
    "P-Max168/vn-news-kr",
]
PRICING_SOURCE = "https://ai.google.dev/gemini-api/docs/pricing"
PRICING_READ = "2026-10-28"
# Standard Paid, USD per 1M tokens. output 칸에 thinking 포함(공식 표기).
PRICES_USD_PER_1M = {
    "gemini-3.5-flash-lite": {"input": 0.30, "output": 2.50},
    "gemini-3.8-flash": {"input": 0.75, "output": 3.75},
}
# 다음 호출 예상 출력(토큰). 실제보다 크게 잡아 상한을 일찍 건다.
ASSUMED_OUTPUT_TOKENS = int(os.environ.get("GEMINI_ASSUMED_OUT_TOKENS", "10000"))
# prompt 문자→토큰 대략치(바이트/4). 공식 countTokens 없이 사전 검사용.
CHARS_PER_TOKEN = 4

# 이번 프로세스에서 아직 허브에 안 올라간 추가분
_SESSION_ENTRIES = []
_SESSION_SPENT_THB = 0.0


class SpendCapExceeded(Exception):
    """하루 상한을 넘기면 유료 호출을 하지 않는다."""

    def __init__(self, spent_thb, est_thb, cap_thb, day):
        self.spent_thb = spent_thb
        self.est_thb = est_thb
        self.cap_thb = cap_thb
        self.day = day
        super().__init__(
            "daily_spend_cap: spent=%.4f est_next=%.4f cap=%.2f THB day=%s"
            % (spent_thb, est_thb, cap_thb, day)
        )


def today_bkk(now=None):
    return (now or datetime.now(BKK)).strftime("%Y-%m-%d")


def _norm_model(model):
    m = (model or "").strip()
    if m in PRICES_USD_PER_1M:
        return m
    # 접두·접미 변형 대비
    for k in PRICES_USD_PER_1M:
        if k in m or m in k:
            return k
    return m


def cost_usd(model, prompt_tokens, output_tokens, thinking_tokens=0):
    """thinking 은 공식상 output 에 포함 과금 → output+thinking 합산."""
    p = PRICES_USD_PER_1M.get(_norm_model(model))
    if not p:
        # 모르는 모델: 3.8 요금으로 보수 과대 추정
        p = PRICES_USD_PER_1M["gemini-3.8-flash"]
    inp = max(0, int(prompt_tokens or 0))
    out = max(0, int(output_tokens or 0)) + max(0, int(thinking_tokens or 0))
    return (inp / 1_000_000.0) * p["input"] + (out / 1_000_000.0) * p["output"]


def cost_thb(model, prompt_tokens, output_tokens, thinking_tokens=0, usd_thb=None):
    rate = USD_THB if usd_thb is None else float(usd_thb)
    return cost_usd(model, prompt_tokens, output_tokens, thinking_tokens) * rate


def estimate_prompt_tokens(prompt_text):
    if not prompt_text:
        return 0
    return max(1, len(prompt_text.encode("utf-8")) // CHARS_PER_TOKEN)


def estimate_next_thb(model, prompt_text, assumed_output=None):
    pt = estimate_prompt_tokens(prompt_text)
    ot = ASSUMED_OUTPUT_TOKENS if assumed_output is None else int(assumed_output)
    return cost_thb(model, pt, ot, 0)


def empty_tally(day=None):
    return {
        "day": day or today_bkk(),
        "tz": "Asia/Bangkok",
        "cap_thb": DAILY_CAP_THB,
        "usd_thb": USD_THB,
        "pricing_source": PRICING_SOURCE,
        "pricing_read": PRICING_READ,
        "prices_usd_per_1m": dict(PRICES_USD_PER_1M),
        "spent_thb": 0.0,
        "spent_usd": 0.0,
        "entries": [],
    }


def _recompute(tally):
    day = tally.get("day") or today_bkk()
    entries = [e for e in (tally.get("entries") or []) if (e.get("day") or day) == day]
    # id 로 중복 제거(마지막 것 유지)
    by_id = {}
    for e in entries:
        eid = e.get("id") or "%s|%s|%s|%s" % (e.get("repo"), e.get("edition"), e.get("at"), e.get("call_i"))
        e = dict(e, id=eid, day=day)
        by_id[eid] = e
    merged = sorted(by_id.values(), key=lambda x: x.get("at") or "")
    spent_thb = round(sum(float(e.get("cost_thb") or 0) for e in merged), 6)
    spent_usd = round(sum(float(e.get("cost_usd") or 0) for e in merged), 8)
    out = dict(tally)
    out.update(
        day=day,
        tz="Asia/Bangkok",
        cap_thb=float(tally.get("cap_thb") or DAILY_CAP_THB),
        usd_thb=float(tally.get("usd_thb") or USD_THB),
        pricing_source=tally.get("pricing_source") or PRICING_SOURCE,
        pricing_read=tally.get("pricing_read") or PRICING_READ,
        prices_usd_per_1m=tally.get("prices_usd_per_1m") or dict(PRICES_USD_PER_1M),
        spent_thb=spent_thb,
        spent_usd=spent_usd,
        entries=merged,
    )
    return out


def merge_tallies(*tallies, day=None):
    day = day or today_bkk()
    base = empty_tally(day)
    entries = []
    for t in tallies:
        if not t:
            continue
        if (t.get("day") or day) != day:
            continue
        entries.extend(t.get("entries") or [])
    base["entries"] = entries
    return _recompute(base)


def local_path(root):
    return pathlib.Path(root) / "ops" / "gemini-spend.json"


def load_local(root, day=None):
    day = day or today_bkk()
    p = local_path(root)
    if not p.exists():
        return empty_tally(day)
    try:
        t = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return empty_tally(day)
    if (t.get("day") or "") != day:
        return empty_tally(day)
    return _recompute(t)


def save_local(root, tally):
    p = local_path(root)
    p.parent.mkdir(parents=True, exist_ok=True)
    data = _recompute(tally)
    tmp = p.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(p)
    return data


def _github_headers(token=None):
    h = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "gemini-spend-cap/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        h["Authorization"] = "Bearer %s" % token
    return h


def _http_json(url, method="GET", data=None, token=None, timeout=30):
    body = None if data is None else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method=method, headers=_github_headers(token))
    if body is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8")
            return r.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            j = json.loads(raw) if raw else {}
        except Exception:
            j = {"message": raw[:300]}
        return e.code, j
    except Exception as ex:
        return 0, {"message": "%s:%s" % (type(ex).__name__, ex)}


def fetch_repo_spend(repo, path=HUB_PATH, token=None, day=None):
    """GitHub Contents API로 ops/gemini-spend.json 읽기. 실패하면 None."""
    day = day or today_bkk()
    url = "https://api.github.com/repos/%s/contents/%s" % (repo, path)
    # raw 가 더 단순하지만 private(vn) 대비 Contents API 사용
    code, j = _http_json(url + "?ref=main", token=token)
    if code != 200 or not j.get("content"):
        return None
    import base64
    try:
        text = base64.b64decode(j["content"]).decode("utf-8")
        t = json.loads(text)
    except Exception:
        return None
    if (t.get("day") or "") != day:
        return empty_tally(day)
    t["_sha"] = j.get("sha")
    return _recompute(t)


def spent_from_usage_jsonl(path, day=None, repo="local", usd_thb=None):
    """구형 ops/gemini-usage.jsonl 에서 오늘분 비용을 재구성(허브 없을 때 바닥값)."""
    day = day or today_bkk()
    p = pathlib.Path(path)
    if not p.exists():
        return empty_tally(day)
    entries = []
    try:
        lines = p.read_text(encoding="utf-8").splitlines()
    except Exception:
        return empty_tally(day)
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except Exception:
            continue
        at = str(rec.get("at") or "")
        if not at.startswith(day):
            continue
        # 실패·재시도 중간 줄도 토큰이 있으면 과금됐을 수 있음
        prompt = int(rec.get("prompt") or 0)
        output = int(rec.get("output") or 0)
        thinking = int(rec.get("thinking") or 0)
        # usage.jsonl 은 누적 USAGE 를 적는 줄이 있어 증분만 쓰기 어렵다.
        # 최종 판 요약 줄(edition+published 또는 edition+after_check)만 채택.
        if not rec.get("edition"):
            continue
        # 오늘 판만(다른 날 판을 오늘 재시도한 실패 줄 제외)
        if not str(rec.get("edition")).startswith(day):
            continue
        if "published" not in rec and "after_check" not in rec and not rec.get("error"):
            continue
        # 중간 chunk 실패 줄은 prompt 가 있을 수 있으나 edition 요약과 이중 계산됨.
        # 요약 줄만: published 키 또는 after_check 키.
        if "published" not in rec and "after_check" not in rec:
            continue
        model = rec.get("model") or "gemini-3.5-flash-lite"
        cu = cost_usd(model, prompt, output, thinking)
        ct = cu * (USD_THB if usd_thb is None else float(usd_thb))
        entries.append({
            "id": "usage:%s:%s" % (repo, rec.get("edition")),  # 판당 1줄(마지막·최대 토큰이 남음)
            "at": at,
            "day": day,
            "repo": repo,
            "edition": rec.get("edition"),
            "model": model,
            "prompt": prompt,
            "output": output,
            "thinking": thinking,
            "cost_usd": round(cu, 8),
            "cost_thb": round(ct, 6),
            "source": "usage_jsonl",
            "_total": prompt + output + thinking,
        })
    # 같은 판이 여러 요약 줄이면 토큰 합이 큰 쪽(보통 최종 누적)만
    best = {}
    for e in entries:
        k = e["id"]
        prev = best.get(k)
        if prev is None or e.get("_total", 0) >= prev.get("_total", 0):
            best[k] = e
    entries = []
    for e in best.values():
        e = dict(e)
        e.pop("_total", None)
        entries.append(e)
    return _recompute(dict(empty_tally(day), entries=entries))


def hub_token():
    """허브 쓰기용. SPEND_HUB_TOKEN(교차 저장소 PAT) 우선, 없으면 GITHUB_TOKEN(같은 저장소만)."""
    return (os.environ.get("SPEND_HUB_TOKEN") or os.environ.get("GITHUB_TOKEN") or "").strip()


def this_repo():
    return os.environ.get("GITHUB_REPOSITORY") or ""


def _fetch_usage_jsonl(repo, token=None, day=None):
    """동료 저장소 ops/gemini-usage.jsonl 을 Contents API로 읽어 오늘 비용 바닥값 구성."""
    day = day or today_bkk()
    url = "https://api.github.com/repos/%s/contents/ops/gemini-usage.jsonl" % repo
    code, j = _http_json(url + "?ref=main", token=token)
    if code != 200 or not j.get("content"):
        return None
    import base64, tempfile
    try:
        text = base64.b64decode(j["content"]).decode("utf-8")
    except Exception:
        return None
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".jsonl", delete=False) as f:
        f.write(text)
        path = f.name
    try:
        return spent_from_usage_jsonl(path, day=day, repo=repo)
    finally:
        try:
            pathlib.Path(path).unlink()
        except Exception:
            pass


def load_shared(root, day=None, token=None):
    """로컬 + 허브 + (가능하면) 동료 저장소 집계를 합친다. 높은 쪽을 믿어 과다 지출을 막는다."""
    day = day or today_bkk()
    token = token if token is not None else hub_token()
    parts = [load_local(root, day)]
    # usage.jsonl 바닥값(로컬)
    usage_p = pathlib.Path(root) / "ops" / "gemini-usage.jsonl"
    parts.append(spent_from_usage_jsonl(usage_p, day=day, repo=this_repo() or "local"))
    # 허브
    hub = fetch_repo_spend(HUB_REPO, HUB_PATH, token=token or None, day=day)
    if hub:
        parts.append(hub)
    # 동료 spend + usage.jsonl(허브 반영 전 바닥값)
    for repo in PEER_REPOS:
        if repo == this_repo():
            continue
        if not (repo == HUB_REPO and hub):
            peer = fetch_repo_spend(repo, HUB_PATH, token=token or None, day=day)
            if peer:
                parts.append(peer)
        usage_peer = fetch_repo_spend(repo, "ops/gemini-usage.jsonl", token=token or None, day=day)
        # usage.jsonl 은 JSON 배열이 아니라서 Contents API로 받은 디코드가 실패 → 전용 헬퍼
        peer_usage = _fetch_usage_jsonl(repo, token=token or None, day=day)
        if peer_usage:
            parts.append(peer_usage)
    merged = merge_tallies(*parts, day=day)
    # 세션 추가분
    if _SESSION_ENTRIES:
        merged = merge_tallies(merged, {"day": day, "entries": list(_SESSION_ENTRIES)}, day=day)
    return merged


def current_spent_thb(root, day=None, token=None):
    t = load_shared(root, day=day, token=token)
    return float(t.get("spent_thb") or 0), t


def check_can_call(root, model, prompt_text, assumed_output=None, day=None, token=None):
    """상한 내면 (True, spent, est, cap, tally). 넘으면 SpendCapExceeded."""
    day = day or today_bkk()
    spent, tally = current_spent_thb(root, day=day, token=token)
    est = estimate_next_thb(model, prompt_text, assumed_output=assumed_output)
    cap = float(tally.get("cap_thb") or DAILY_CAP_THB)
    if spent + est > cap + 1e-9:
        raise SpendCapExceeded(spent, est, cap, day)
    return True, spent, est, cap, tally


def make_entry(model, prompt_tokens, output_tokens, thinking_tokens=0, meta=None, repo=None, call_i=None):
    meta = meta or {}
    at = datetime.now(BKK).isoformat(timespec="seconds")
    day = today_bkk()
    cu = cost_usd(model, prompt_tokens, output_tokens, thinking_tokens)
    ct = cu * USD_THB
    repo = repo or this_repo() or "local"
    eid = "%s|%s|%s|%s" % (repo, meta.get("edition") or "", at, call_i if call_i is not None else prompt_tokens)
    return {
        "id": eid,
        "at": at,
        "day": day,
        "repo": repo,
        "edition": meta.get("edition"),
        "chunk": meta.get("chunk"),
        "model": model,
        "prompt": int(prompt_tokens or 0),
        "output": int(output_tokens or 0),
        "thinking": int(thinking_tokens or 0),
        "cost_usd": round(cu, 8),
        "cost_thb": round(ct, 6),
        "source": "live",
    }


def push_hub(tally, token=None, max_tries=6):
    """Contents API로 허브 파일 갱신. 충돌(409/sha) 시 다시 읽어 합치고 재시도.
    성공 시 (True, sha/msg), 실패 시 (False, reason)."""
    token = (token if token is not None else hub_token()).strip()
    if not token:
        return False, "no_token"
    day = tally.get("day") or today_bkk()
    import base64
    url = "https://api.github.com/repos/%s/contents/%s" % (HUB_REPO, HUB_PATH)
    last_reason = ""
    for attempt in range(max_tries):
        code, cur = _http_json(url + "?ref=main", token=token)
        sha = None
        remote = empty_tally(day)
        if code == 200 and cur.get("sha"):
            sha = cur["sha"]
            try:
                remote = _recompute(json.loads(base64.b64decode(cur["content"]).decode("utf-8")))
                if (remote.get("day") or "") != day:
                    remote = empty_tally(day)
            except Exception:
                remote = empty_tally(day)
        elif code not in (200, 404):
            last_reason = "get_http_%s:%s" % (code, (cur.get("message") or "")[:120])
            time.sleep(1 + attempt)
            continue
        merged = merge_tallies(remote, tally, day=day)
        payload = {
            "message": "ops: gemini-spend %s spent=%.4f THB" % (day, merged["spent_thb"]),
            "content": base64.b64encode(
                (json.dumps(merged, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            ).decode("ascii"),
            "branch": "main",
        }
        if sha:
            payload["sha"] = sha
        pcode, pres = _http_json(url, method="PUT", data=payload, token=token)
        if pcode in (200, 201):
            return True, (pres.get("content") or {}).get("sha") or "ok"
        # 충돌·레이스
        last_reason = "put_http_%s:%s" % (pcode, (pres.get("message") or "")[:160])
        if pcode in (409, 422):
            time.sleep(0.5 + attempt)
            continue
        time.sleep(1 + attempt)
    return False, last_reason


def record_usage(root, model, usage_meta, meta=None, call_i=None, token=None, push=True):
    """호출 후 토큰으로 비용 기록. 로컬 저장 + (옵션) 허브 push."""
    global _SESSION_SPENT_THB
    u = usage_meta or {}
    prompt = int(u.get("promptTokenCount") or u.get("prompt") or 0)
    output = int(u.get("candidatesTokenCount") or u.get("output") or 0)
    thinking = int(u.get("thoughtsTokenCount") or u.get("thinking") or 0)
    entry = make_entry(model, prompt, output, thinking, meta=meta, call_i=call_i)
    _SESSION_ENTRIES.append(entry)
    _SESSION_SPENT_THB += float(entry["cost_thb"])
    day = entry["day"]
    local = load_local(root, day=day)
    local = merge_tallies(local, {"day": day, "entries": [entry]}, day=day)
    local = save_local(root, local)
    hub_ok, hub_msg = False, "skipped"
    if push:
        shared = load_shared(root, day=day, token=token)
        shared = merge_tallies(shared, {"day": day, "entries": [entry]}, day=day)
        # 허브 저장소 자신이거나 SPEND_HUB_TOKEN 있을 때만 의미 있는 쓰기
        repo = this_repo()
        tok = token if token is not None else hub_token()
        can_push = bool(tok) and (repo == HUB_REPO or bool(os.environ.get("SPEND_HUB_TOKEN")))
        if can_push:
            hub_ok, hub_msg = push_hub(shared, token=tok)
        else:
            hub_ok, hub_msg = False, "no_cross_repo_token"
    return entry, local, hub_ok, hub_msg


def guard_or_raise(root, model, prompt_text, meta=None, write_fail=None):
    """call_gemini 앞에서 호출. 상한 초과 시 edition-fail 기록 콜백 후 SpendCapExceeded."""
    try:
        return check_can_call(root, model, prompt_text)
    except SpendCapExceeded as ex:
        print(
            "일일 비용 상한 — 유료 호출 중단: spent=%.4f + est=%.4f > cap=%.2f THB (day=%s)"
            % (ex.spent_thb, ex.est_thb, ex.cap_thb, ex.day),
            flush=True,
        )
        if write_fail:
            try:
                write_fail(
                    (meta or {}).get("edition"),
                    "daily_spend_cap",
                    spent_thb=round(ex.spent_thb, 4),
                    est_next_thb=round(ex.est_thb, 4),
                    cap_thb=ex.cap_thb,
                    day=ex.day,
                )
            except Exception:
                pass
        raise
