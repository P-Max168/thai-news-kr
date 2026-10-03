#!/usr/bin/env python3
"""📇 파타야 가게 카드 시험(2026-10-03) — OpenStreetMap(OSM) 에서 실제로 받아 온 데이터만으로 카드 30개 만들기.
원본(받아 온 그대로): tools/places/pattaya-osm-2026-10-03.json  (Overpass API `out center meta`, 받은 시각은 파일 안 osm3s.timestamp_osm_base)
고른 목록:            tools/places/pattaya-pick-2026-10-03.json (종류, OSM 종류, id, 이름)
결과:                 data/places-pattaya.json  → 화면 assets/places.js (#places)
규칙: 지어내지 않음 — OSM 에 없는 값(가격·영업시간 등)은 null → 화면에 '확인 안 됨'. 태국 문자가 든 값은 빼고(사이트 규칙) 영어·한국어 값만.
성인 업종 제외: 마사지·스파·바·클럽 등 이름/종류는 고르는 단계에서 뺌(아래 BAD 로 한 번 더 검사).
데이터 저작권: © OpenStreetMap contributors (ODbL) — 화면에 출처 표시 필수.
다시 받기: README '📇 가게 카드 시험' 참고."""
import json, re, pathlib, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
RAW = ROOT / "tools/places/pattaya-osm-2026-10-03.json"
PICK = ROOT / "tools/places/pattaya-pick-2026-10-03.json"
OUT = ROOT / "data/places-pattaya.json"
FETCHED = "2026-10-03"
THAI = re.compile(r"[\u0E00-\u0E7F]")
BAD = re.compile(r"massage|\bspa\b|go-?go|\bbar\b|club|lady|soapy|nuru|cabaret|\bshow\b", re.I)
CAT = {"food": "맛집", "cafe": "카페", "pet": "동물병원·펫샵", "moto": "오토바이", "beauty": "피부·뷰티"}
CUISINE = {"korean": "한식", "thai": "태국 음식", "italian": "이탈리아", "pizza": "피자", "japanese": "일식", "sushi": "초밥", "barbecue": "바비큐",
           "norwegian": "노르웨이", "coffee_shop": "커피", "ice_cream": "아이스크림", "breakfast": "아침 식사", "international": "여러 나라", "asian": "아시아", "seafood": "해산물", "cake": "케이크", "bakery": "빵"}
KIND = {("amenity", "veterinary"): "동물병원", ("shop", "pet"): "펫샵", ("amenity", "motorcycle_rental"): "오토바이 렌탈", ("shop", "motorcycle"): "오토바이 판매·수리",
        ("amenity", "clinic"): "피부과 클리닉", ("shop", "beauty"): "뷰티 숍", ("amenity", "cafe"): "카페", ("amenity", "restaurant"): "식당"}

def ok(v):
    return v if v and not THAI.search(v) else None

def main():
    raw = json.load(open(RAW, encoding="utf-8"))
    by = {(e["type"], e["id"]): e for e in raw["elements"]}
    out = []
    for cat, typ, i, name in json.load(open(PICK, encoding="utf-8")):
        e = by[(typ, i)]; t = e["tags"]
        nm = ok(t.get("name:ko")) or ok(t.get("name:en")) or ok(t.get("name")) or ok(name)
        assert nm and not BAD.search(nm + " " + t.get("name", "")), (i, nm)
        kind = next((v for (k, val), v in KIND.items() if t.get(k) == val), None)
        cz = [CUISINE[c] for c in (t.get("cuisine") or "").split(";") if c in CUISINE][:3]
        lat = e.get("lat") or e.get("center", {}).get("lat"); lon = e.get("lon") or e.get("center", {}).get("lon")
        addr = ok(t.get("address")) or (", ".join(x for x in [ok(t.get("addr:housenumber")), ok(t.get("addr:street"))] if x) if ok(t.get("addr:street")) else None)   # 길 이름(영어)이 없으면 번지만으론 안 씀
        phone = (t.get("phone") or t.get("contact:phone") or "").split(";")[0].strip() or None
        web = t.get("website") or t.get("contact:website") or None
        out.append({
            "id": "osm-%s-%d" % (typ, i), "cat": cat, "cat_ko": CAT[cat], "name": nm, "kind": kind, "cuisine": cz,
            "hours": t.get("opening_hours") or None,           # OSM 영업시간 원문(화면이 한국어로 풀고 '지금 영업 중' 계산)
            "phone": phone, "website": web, "address": addr, "lat": round(lat, 6), "lng": round(lon, 6),
            "price_thb": None,                                 # OSM 에 가격 없음 → '확인 안 됨'(바트·원은 값이 생기면 같이 표시)
            "status": "지도 데이터에 폐업 표시 없음",            # disused/폐업 태그 없는 것만 받음
            "checked": FETCHED,                                # 이 사이트가 데이터를 받아 확인한 날
            "osm_check": t.get("check_date:opening_hours") or t.get("check_date") or None,   # OSM 기여자가 현장 확인한 날(있을 때만)
            "osm_edit": e["timestamp"][:10],                   # OSM 에서 마지막으로 고친 날
            "source": "OpenStreetMap", "source_url": "https://www.openstreetmap.org/%s/%d" % (typ, i),
        })
    doc = {"_readme": "📇 파타야 가게 카드 시험 — tools/places/build_places.py 가 만듦. 실제 OSM 데이터만, 모르는 값 = null(화면 '확인 안 됨'). © OpenStreetMap contributors (ODbL)",
           "region": "pattaya", "fetched": FETCHED, "osm_base": raw.get("osm3s", {}).get("timestamp_osm_base"),
           "attribution": "© OpenStreetMap contributors", "license_url": "https://www.openstreetmap.org/copyright",
           "report_kakao_url": "",   # '정보 틀림' 카톡 링크(운영자 카톡 채널 주소 — 승인함 #7). 비어 있으면 화면은 '링크 준비 중' 자리표시
           "places": out}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("places:", len(out), "→", OUT.relative_to(ROOT))
    assert not THAI.search(OUT.read_text(encoding="utf-8")), "태국 문자가 남아 있음"

if __name__ == "__main__":
    main()
