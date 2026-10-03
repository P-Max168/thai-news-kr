#!/usr/bin/env python3
"""🏠 파타야 임대 카드 시험(2026-10-03) — 공개된 실제 매물 10개만, 지어내지 않음.
원본: tools/rentals/pattaya-fazwaz-2026-10-03.json — FazWaz 공개 목록 쪽(https://www.fazwaz.com/condo-for-rent/thailand/chon-buri/pattaya)의
      구조화 데이터(이름·방·면적·좌표·주소) + 각 매물 쪽의 가격(쪽 데이터 price/currency THB, 화면 제목의 달러 가격과 맞춰 봄)·'Date Listed'·'Updated' 글을 그대로 받음(2026-10-03 16:45~ 방콕).
사진은 받지 않음(저작권). 게시·문의·연락 없음. 매물 링크는 원래 쪽으로.
⛔ 2026-10-03 17:20 방콕 내림: FazWaz 이용 약관이 내용 복사·추출·모으기를 금지(https://www.lifullconnect.com/legal-notice-fazwaz/).
   원본 파일은 지금 트리에서 지움(지난 기록은 git 안에 그대로 — 고쳐 쓰지 않음). 이 스크립트는 허락받은 출처가 생기기 전엔 돌리지 말 것.
결과: data/rentals-pattaya.json → assets/places.js 의 #rent 쪽(사이트 메뉴에 링크 안 함 — 승인함 #9)."""
import json, re, pathlib, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
RAW = ROOT / "tools/rentals/pattaya-fazwaz-2026-10-03.json"
OUT = ROOT / "data/rentals-pattaya.json"
AT = "2026-10-03"
PICK = ["u6809669", "u1896256", "u6167917", "u6817015", "u6828948", "u6802298", "u5632202", "u6828845", "u1410502", "u6821062"]
AREA = {"nong-prue": "농쁘루 면(Nong Prue)", "na-kluea": "나끄루아 면(Na Kluea)"}   # 매물 주소에 적힌 면(구역) 그대로 — 더 자세한 동네는 짐작하지 않음
PYEONG = 3.3058
def ko_rel(t):   # "2 weeks" → "2주 전"(받은 날 기준)
    n, u = t.split()
    return n + {"day": "일", "week": "주", "month": "개월", "year": "년", "hour": "시간"}[u.rstrip("s")] + " 전"
def main():
    raise SystemExit("⛔ 내림(약관) — 허락받은 출처 전에는 안 돌림. 위 설명 참고")
    raw = {re.search(r"-(u\d+)$", x["url"]).group(1): x for x in json.load(open(RAW, encoding="utf-8"))}
    out = []
    for k in PICK:
        x = raw[k]
        assert x["price"] and x["cur"] == "THB" and x["type"] == "rent" and x["sqm"], k
        usd = re.search(r"for \$([\d,]+)/mo", x["title"] or "")
        m = re.search(r"Date Listed (\w{3} \d{1,2}, \d{4})", " ".join(x["upd"]))
        listed = datetime.datetime.strptime(m.group(1), "%b %d, %Y").date().isoformat() if m else None
        um = re.search(r"Updated ([^,]+?)(?: ag|$| )", " ".join(x["upd"]))
        upd_rel = re.search(r"Updated (\d+ \w+)", " ".join(x["upd"]))
        area_key = next((a for a in AREA if "-in-" + a + "-" in x["url"]), None)
        src = {"by": "FazWaz 매물 쪽", "url": x["url"], "at": AT}
        out.append({
            "id": "fazwaz-" + k, "name": x["name"], "beds": x["beds"],
            "sqm": x["sqm"], "pyeong": round(x["sqm"] / PYEONG, 1),
            "rent_thb": x["price"], "rent_usd_shown": int(usd.group(1).replace(",", "")) if usd else None,
            "area": AREA.get(area_key) or "확인 안 됨", "lat": x["lat"], "lng": x["lng"],
            "listed": listed, "updated_rel": ko_rel(upd_rel.group(1)) if upd_rel else None,
            "deposit": None, "fees": None, "contract": None,   # 쪽에서 안 읽음 → '확인 안 됨'
            "old": bool(listed and listed < "2023-01-01"),
            "src": src, "checked": AT,
        })
    doc = {"_readme": "🏠 파타야 임대 카드 시험 — tools/rentals/build_rentals.py. 공개 매물 쪽에서 본 값만(사진 없음). 모르는 값 null = '확인 안 됨'. 게시·연락 안 함.",
           "region": "pattaya", "fetched": AT, "source_list": "https://www.fazwaz.com/condo-for-rent/thailand/chon-buri/pattaya", "pyeong_sqm": PYEONG, "items": out}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    assert not re.search(r"[\u0E00-\u0E7F]", OUT.read_text(encoding="utf-8"))
    print("rentals:", len(out), "→", OUT.relative_to(ROOT))
if __name__ == "__main__":
    main()
