# -*- coding: utf-8 -*-
"""팬 기능 공용(2026-10-25 Claude, KSTAR 먼저) — 아티스트 이름표 붙이기.

등록부(언어판 data/artists.json, 수집기가 만듦): {"artists": [{"id", "n"(영문), "th", "ko", "al":[다른 이름], "t":"g|p|a", "g":[그룹 id], "m":[멤버 id]}]}
tag_story(story, reg) → story["artists"] = [{"id", "n"}] (최대 6). 기사 제목·요약·키워드·원문 제목(한국어)에서 이름을 찾는다.
- 영문 이름: 단어 경계, 3글자 이하(IVE·TWS·V 등)는 대소문자까지 같아야 함
- 한국어 이름: 2글자 이상, 원문 제목·본문 쪽에서(3글자 이하는 앞에 한글이 붙으면 아님). 태국어 이름: 3글자 이상, 음절 경계에서만(10-25 저녁판 오탐)
- 긴 이름부터 찾아 겹침(예: 'NCT 127' 과 'NCT')은 긴 쪽만
"""
import json, pathlib, re

NONLATIN_RE = re.compile(r"[\u0E00-\u0E7F\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FFF]")


def is_latin(s):
    return bool(s) and not NONLATIN_RE.search(s) and bool(re.search(r"[A-Za-z\u00C0-\u024F]", s))


def load_registry(root):
    p = pathlib.Path(root) / "data" / "artists.json"
    if not p.exists():
        return None
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
    except ValueError:
        return None
    return d if isinstance(d, dict) and d.get("artists") else None


def _patterns(reg):
    out = []
    for a in reg.get("artists", []):
        names = [(a.get("n"), "en")] + [(a.get("th"), "th"), (a.get("ko"), "ko")] + [(x, "al") for x in (a.get("al") or [])]
        for nm, kind in names:
            nm = (nm or "").strip()
            if not nm:
                continue
            if is_latin(nm):
                if len(nm) <= 3:
                    rx = re.compile(r"(?<![A-Za-z0-9])" + re.escape(nm) + r"(?![A-Za-z0-9])")
                else:
                    rx = re.compile(r"(?<![A-Za-z0-9])" + re.escape(nm) + r"(?![A-Za-z0-9])", re.I)
            elif re.search(r"[가-힯]", nm):
                if len(nm) < 2:
                    continue
                # 짧은 한국어 이름(멤버 이름 '윤아'·'리사' 등)은 앞에 한글이 붙어 있으면 다른 사람(성+이름 '임윤아' = 소녀시대 윤아 ≠ ILLIT 윤아, 10-25 저녁판)
                rx = re.compile((r"(?<![가-힯])" if len(nm) <= 3 else "") + re.escape(nm))
            else:
                if len(nm) < 3:
                    continue
                # 태국어는 띄어쓰기가 없어 낱말 속에 이름이 숨어 있음('สนใจอย่าง' 안의 'จอย', 10-25 저녁판) → 음절 경계만:
                # 앞 글자가 앞모음(เแโใไ)이면 안 되고, 뒤 글자가 붙는 모음·성조 기호면 안 됨. 3글자 이하는 앞뒤에 태국 자음도 안 됨
                pre, post = r"(?<![\u0E40-\u0E44])", r"(?![\u0E30-\u0E3A\u0E45\u0E47-\u0E4E])"
                if len(nm) <= 3:
                    pre, post = r"(?<![\u0E01-\u0E2E\u0E40-\u0E44])", r"(?![\u0E01-\u0E3A\u0E45\u0E47-\u0E4E])"
                rx = re.compile(pre + re.escape(nm) + post)
            out.append((len(nm), rx, a))
    out.sort(key=lambda x: -x[0])
    return out


_CACHE = {}


def tag_story(s, reg, limit=6):
    if not reg:
        return s
    key = id(reg)
    if key not in _CACHE:
        _CACHE[key] = _patterns(reg)
    text = " \n ".join([s.get("headline") or "", " ".join(s.get("summary") or []), " ".join(s.get("tags") or []), s.get("title_th") or ""])
    taken, found = [], []
    for _, rx, a in _CACHE[key]:
        if a["id"] in [f["id"] for f in found]:
            continue
        m = rx.search(text)
        if not m:
            continue
        if any(m.start() < e and s0 < m.end() for s0, e in taken):   # 더 긴 이름 안에 든 짧은 이름은 건너뜀
            continue
        taken.append((m.start(), m.end()))
        found.append(dict(id=a["id"], n=a.get("n") or a["id"]))
        if len(found) >= limit:
            break
    if found:
        s["artists"] = found
    return s


# 공식 유튜브 영상 붙이기(2026-10-25): data/yt.json(언어판 수집기가 공식 채널 RSS 로 만듦) = {"videos":[{"id","t"(제목),"ch"(채널 이름),"p"(게시 ISO)}]}
# 기사 아티스트(영문 이름·다른 이름) 가 영상 제목에 있고 14일 안에 올라온 것 중 가장 새것. 판 하나에 최대 3개, 같은 영상은 한 번만.
def _no_hangul(t):   # 태국어판 화면엔 한글이 보이면 안 됨 → 영상 제목의 한글 낱말만 뺌('IVE 아이브 'XOXZ' MV' → 'IVE 'XOXZ' MV')
    t = re.sub(r"[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]+", "", str(t or ""))
    t = re.sub(r"\(\s*\)|\[\s*\]", "", t)
    return re.sub(r"\s{2,}", " ", t).strip(" -·|")


def load_videos(root):
    p = pathlib.Path(root) / "data" / "yt.json"
    try:
        d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    except ValueError:
        return []
    return [v for v in d.get("videos", []) if re.fullmatch(r"[\w-]{11}", str(v.get("id", "")))]


def pick_media(stories, reg, videos, eid, limit=3, days=14):
    if not (reg and videos):
        return 0
    from datetime import datetime, timedelta
    cut = (datetime.fromisoformat(eid[:10]) - timedelta(days=days)).strftime("%Y-%m-%d")
    by = {a["id"]: a for a in reg.get("artists", [])}
    vids = sorted([v for v in videos if str(v.get("p", ""))[:10] >= cut], key=lambda v: v.get("p", ""), reverse=True)
    used, n = set(), 0
    for s in stories:
        if n >= limit or s.get("media"):
            continue
        for a in s.get("artists") or []:
            e = by.get(a.get("id"))
            if not e:
                continue
            names = [x for x in [e.get("n")] + list(e.get("al") or []) if is_latin(x)]
            rxs = [re.compile(r"(?<![A-Za-z0-9])" + re.escape(x) + r"(?![A-Za-z0-9])", 0 if len(x) <= 3 else re.I) for x in names]
            hit = next((v for v in vids if v["id"] not in used and any(r.search(v.get("t", "")) for r in rxs)), None)
            if hit:
                s["media"] = dict(yt=hit["id"], yt_title=_no_hangul(hit.get("t", ""))[:90], yt_ch=_no_hangul(hit.get("ch", ""))[:40])
                used.add(hit["id"]); n += 1
                break
    return n
