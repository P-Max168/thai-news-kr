# -*- coding: utf-8 -*-
"""공용 도우미: 판(edition) 데이터 검증·저장 + data/index 재생성.

파일 이름 규칙 (data/ 폴더)
  <YYYY-MM-DD>-am   아침판 (매일 07:08 정기 실행)
  <YYYY-MM-DD>-pm   저녁판 (매일 18:08 정기 실행)
  <YYYY-MM-DD>-early 새벽판 (정기 외 임시판. 2026-09-29-early 한 건만 존재)
날짜만 있는 파일(<YYYY-MM-DD>.json)은 더 이상 만들지 않는다.
"""
import json, re, pathlib, sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
EDITION_LABEL = {"am": "아침판", "pm": "저녁판", "early": "새벽판"}
EDITION_ORDER = {"early": 0, "am": 1, "pm": 2}
ID_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-(am|pm|early)$")
CATS = {"politics", "economy", "society", "local", "sns"}


def label_for(date, edition):
    m, d = int(date[5:7]), int(date[8:10])
    return "%d월 %d일 %s" % (m, d, EDITION_LABEL[edition])


def validate(data):
    """사람이 실수하기 쉬운 부분만 점검. 문제 있으면 예외."""
    eid = data["id"]
    m = ID_RE.match(eid)
    assert m, "id 형식 오류: %s (YYYY-MM-DD-am|pm|early)" % eid
    assert data["date"] == m.group(1) and data["edition"] == m.group(2), "id/date/edition 불일치"
    ids = [s["id"] for s in data["stories"]]
    assert len(ids) == len(set(ids)), "기사 id 중복"
    for s in data["stories"]:
        assert s["category"] in CATS, (s["id"], s["category"])
        for k in ("headline", "summary", "source", "url", "title_th", "published"):
            assert s.get(k), (s["id"], "필수 필드 없음: " + k)
        assert s["url"].startswith("http"), (s["id"], s["url"])
        assert s["published"].endswith("+07:00"), (s["id"], "published 는 +07:00(방콕) ISO")
        datetime.fromisoformat(s["published"])
        for r in s.get("related", []):
            assert r["url"].startswith("http"), (s["id"], r)
    for h in data["highlights"]:
        assert h in ids, "highlights 에 없는 id: " + h
    assert len(data["highlights"]) == 3, "highlights 는 3개"


def write_edition(data):
    """data/<id>.json + data/<id>.js 저장 후 index 재생성."""
    validate(data)
    eid = data["id"]
    (DATA / (eid + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    js = "window.NEWS_DATA = window.NEWS_DATA || {};\nwindow.NEWS_DATA[%s] = %s;\n" % (
        json.dumps(eid), json.dumps(data, ensure_ascii=False))
    (DATA / (eid + ".js")).write_text(js, encoding="utf-8")
    build_index()
    print("saved", eid, "stories:", len(data["stories"]),
          {c: sum(1 for s in data["stories"] if s["category"] == c) for c in ["politics", "economy", "society", "local", "sns"]})


def build_index():
    """data/*.json 을 훑어 index.json / index.js 재생성 (최신 판이 맨 앞 = 기본 화면)."""
    eds = []
    for p in sorted(DATA.glob("20*.json")):
        m = ID_RE.match(p.stem)
        if not m:
            print("경고: 규칙에 맞지 않는 파일은 index 에서 제외:", p.name, file=sys.stderr)
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        date, ed = m.group(1), m.group(2)
        eds.append(dict(id=p.stem, date=date, edition=ed, label=label_for(date, ed),
                        generated=d.get("generated", ""), stories=len(d.get("stories", []))))
    eds.sort(key=lambda e: (e["date"], EDITION_ORDER[e["edition"]], e["generated"]), reverse=True)
    idx = {"latest": eds[0]["id"] if eds else None, "editions": eds, "dates": [e["id"] for e in eds]}
    (DATA / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), encoding="utf-8")
    (DATA / "index.js").write_text("window.NEWS_INDEX = %s;\n" % json.dumps(idx, ensure_ascii=False), encoding="utf-8")
    print("index:", [(e["id"], e["label"]) for e in eds])
    return idx


if __name__ == "__main__":
    build_index()
