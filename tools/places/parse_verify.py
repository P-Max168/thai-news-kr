#!/usr/bin/env python3
"""조사봇 2차 검수 보고서(/workspace/research/업소검증_파타야_2026-10-05.md) 전체 표 → tools/places/pattaya-verify-2026-10-05.json
보고서에 적힌 값만 옮김(지어내지 않음): 등급(영업 확인·폐업 의심·확인 불가), 확인한 쪽(조사봇), 근거 링크(표 근거 칸 첫 링크), 그 링크 확인 시각, Google 쪽 표시 글.
+ 보고서 '1차 Google 읽기 자체의 오류' 줄의 NewKoreaMart·Jin Sung(cid·06:30 확인) — Max 06:55 지시 6번: '확인 불가'로 다시 넣음."""
import json, re, sys, pathlib
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/workspace/research/업소검증_파타야_2026-10-05.md")
OUT = pathlib.Path(__file__).with_name("pattaya-verify-2026-10-05.json")
rows, readd = {}, []
for l in SRC.read_text(encoding="utf-8").splitlines():
    if not re.match(r"^\| \d+ \|", l): continue
    c = [x.strip() for x in l.strip().strip("|").split("|")]
    name, google, grade, ev = c[1], c[4], c[5].replace("*", ""), c[6]
    m = re.search(r"\]\((https?://[^)\s]+)\)", ev)
    t = re.search(r"확인 (2026-\d\d-\d\d \d\d:\d\d)", ev)
    assert grade in ("영업 확인", "폐업 의심", "확인 불가"), (name, grade)
    assert m and t, name
    rows[name] = {"verified_status": grade, "verified_by": "조사봇(2차 검수)", "verified_at": t.group(1), "verified_source_url": m.group(1),
                  "verified_marker": re.sub(r"^Google:\s*", "", google), "verified_report": SRC.name}
txt = SRC.read_text(encoding="utf-8")
assert "NewKoreaMart(cid 12640387334293026116)" in txt and "Jin Sung(cid 433464209049918173)" in txt and "(06:30 확인" in txt
for nm, cid, cat, kind in (("NewKoreaMart", "12640387334293026116", "mart", "한인 마트"), ("Jin Sung Korean Restaurant", "433464209049918173", "food", "한식당")):
    readd.append({"cat": cat, "cid": cid, "name": nm, "kind": kind, "verified_status": "확인 불가", "verified_by": "조사봇(2차 검수)", "verified_at": "2026-10-05 06:30",
                  "verified_source_url": "https://maps.google.com/?cid=" + cid, "verified_marker": "그 가게 쪽(cid)에 폐업 표시 없음(1차의 '폐업'은 검색 결과 목록에서 잘못 읽은 것으로 추정)", "verified_report": SRC.name})
doc = {"_readme": "조사봇 2차 검수(2026-10-05 06:31~06:53 BKK) 등급 — tools/places/parse_verify.py 가 보고서 표에서 그대로 옮김. 가게 이름으로 data 와 맞춤(56곳 모두 같은 이름). build_places.py 가 적용.",
       "by_name": rows, "readd": readd}
OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
import collections
print(len(rows), collections.Counter(r["verified_status"] for r in rows.values()), "readd", len(readd))
