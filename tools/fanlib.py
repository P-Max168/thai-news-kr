# -*- coding: utf-8 -*-
"""팬 기능 공용(2026-10-25 Claude, KSTAR 먼저) — 아티스트 이름표 붙이기.

등록부(언어판 data/artists.json, 수집기가 만듦): {"artists": [{"id", "n"(영문), "th", "ko", "al":[다른 이름], "t":"g|p|a", "g":[그룹 id], "m":[멤버 id]}]}
tag_story(story, reg) → story["artists"] = [{"id", "n"}] (최대 6). 기사 제목·요약·키워드·원문 제목(한국어)에서 이름을 찾는다.
- 영문 이름: 단어 경계, 3글자 이하(IVE·TWS·V 등)는 대소문자까지 같아야 함
- 한국어 이름: 2글자 이상, 원문 제목·본문 쪽에서. 태국어 이름: 3글자 이상
- 긴 이름부터 찾아 겹침(예: 'NCT 127' 과 'NCT')은 긴 쪽만
"""
import json, pathlib, re


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
            if re.fullmatch(r"[\x00-\x7f]+", nm):
                if len(nm) <= 3:
                    rx = re.compile(r"(?<![A-Za-z0-9])" + re.escape(nm) + r"(?![A-Za-z0-9])")
                else:
                    rx = re.compile(r"(?<![A-Za-z0-9])" + re.escape(nm) + r"(?![A-Za-z0-9])", re.I)
            elif re.search(r"[가-힯]", nm):
                if len(nm) < 2:
                    continue
                rx = re.compile(re.escape(nm))
            else:
                if len(nm) < 3:
                    continue
                rx = re.compile(re.escape(nm))
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
