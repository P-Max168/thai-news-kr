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
GRAW = ROOT / "tools/places/pattaya-korean-gmaps-2026-10-03.json"   # 한식·한인 업소: Google 지도(로그인 없이) 원본
GPICK = ROOT / "tools/places/pattaya-korean-pick-2026-10-03.json"
OLD_BEFORE = "2023-01-01"   # 이보다 오래된 정보 = '오래된 정보' 표시 + 목록 뒤로
FETCHED = "2026-10-03"
THAI = re.compile(r"[\u0E00-\u0E7F]")
BAD = re.compile(r"massage|\bspa\b|go-?go|\bbar\b|club|lady|soapy|nuru|cabaret|\bshow\b", re.I)
CAT = {"food": "맛집", "cafe": "카페", "mart": "마트", "travel": "여행·비자", "pet": "동물병원·펫샵", "moto": "오토바이", "beauty": "피부·미용"}
NONLATIN = re.compile(r"[\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF]")   # 태국·일본·한자 → 주소에서 그 조각 뺌
PLUS = re.compile(r"^[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2,3}\s*")

def g_time(t):   # "4:30 PM" → "16:30"
    m = re.match(r"(\d{1,2})(?::(\d\d))?\s*([AP]M)", t.strip())
    h = int(m.group(1)) % 12 + (12 if m.group(3) == "PM" else 0)
    return "%02d:%s" % (h, m.group(2) or "00")

def g_hours(rows):   # Google 지도 '그날' 줄 → OSM 모양(아는 요일만). 예 "Sa 11:00-22:00"
    D = {"Monday": "Mo", "Tuesday": "Tu", "Wednesday": "We", "Thursday": "Th", "Friday": "Fr", "Saturday": "Sa", "Sunday": "Su"}
    out = []
    for r in rows or []:
        r = r.replace("\ue14d", "").replace("\u202f", " ").replace("\u2009", " ").strip()
        m = re.match(r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(.*)$", r)
        if not m: return None
        d, v = D[m.group(1)], m.group(2).strip()
        if v == "Open 24 hours": out.append(d + " 00:00-24:00")
        elif v == "Closed": out.append(d + " off")
        else:
            a, b = re.split(r"\s*[\u2013-]\s*", v)
            if not re.search(r"[AP]M", a): a += " " + re.search(r"[AP]M", b).group(0)   # "11–10 PM" 같은 모양
            out.append("%s %s-%s" % (d, g_time(a), g_time(b)))
    return "; ".join(out) or None

def g_addr(a):
    if not a: return None
    a = a.replace("Address:", "").strip()
    parts = [PLUS.sub("", x.strip()) for x in a.split(",")]
    parts = [x for x in parts if x and not NONLATIN.search(x) and x not in ("Thailand", "Chang Wat")]
    return ", ".join(parts) or None

def clean_url(u):
    return re.sub(r"[?&](mibextid|igsh|ref|_r|_t)=[^&]*", "", u).replace("&", "?", 1) if u and "?" not in re.sub(r"[?&](mibextid|igsh|ref|_r|_t)=[^&]*", "", u) else (re.sub(r"[?&](mibextid|igsh|ref|_r|_t)=[^&]*", "", u) if u else None)
CUISINE = {"korean": "한식", "thai": "태국 음식", "italian": "이탈리아", "pizza": "피자", "japanese": "일식", "sushi": "초밥", "barbecue": "바비큐",
           "norwegian": "노르웨이", "coffee_shop": "커피", "ice_cream": "아이스크림", "breakfast": "아침 식사", "international": "여러 나라", "asian": "아시아", "seafood": "해산물", "cake": "케이크", "bakery": "빵"}
KIND = {("amenity", "veterinary"): "동물병원", ("shop", "pet"): "펫샵", ("amenity", "motorcycle_rental"): "오토바이 렌탈", ("shop", "motorcycle"): "오토바이 판매·수리",
        ("amenity", "clinic"): "피부과 클리닉", ("shop", "beauty"): "뷰티 숍", ("amenity", "cafe"): "카페", ("amenity", "restaurant"): "식당"}

def ok(v):
    return v if v and not THAI.search(v) else None

def korean():
    """한식·한인 업소 — Google 지도(로그인 없이 보이는 화면)에서 2026-10-03 에 읽은 값만. 칸마다 출처(fsrc → srcs) 기록."""
    g = {x["cid"]: x for x in json.load(open(GRAW, encoding="utf-8"))["items"] if x.get("cid")}
    at = json.load(open(GRAW, encoding="utf-8"))["checked"]
    res = []
    for cat, cid, name, kind, kr in json.load(open(GPICK, encoding="utf-8"))["pick"]:
        x = g[cid]
        assert not x.get("closed"), (name, "폐업 표시")
        assert not BAD.search(name), name
        gurl = "https://maps.google.com/?cid=" + cid
        hours = g_hours(x.get("rows"))
        phone = (x.get("phone") or "").replace("Phone:", "").strip() or None
        web = clean_url(x.get("web"))
        addr = g_addr(x.get("addr"))
        srcs = {"g": {"by": "Google 지도", "url": gurl, "at": at}}
        fsrc = {f: "g" for f, v in (("name", 1), ("hours", hours), ("phone", phone), ("address", addr), ("website", web), ("status", 1)) if v}
        if web:
            srcs["w"] = {"by": "가게 공식 " + ("페이스북" if "facebook" in web else "인스타그램" if "instagram" in web else "틱톡" if "tiktok" in web else "네이버 카페" if "naver" in web else "사이트"), "url": web, "at": at}
        res.append({
            "id": "gmap-" + cid, "cat": cat, "cat_ko": CAT[cat], "name": name, "kind": kind, "cuisine": [],
            "hours": hours, "hours_partial": True,     # 제한된 보기라 확인한 요일(토)만 — 다른 요일은 '확인 안 됨'
            "phone": phone, "website": web, "address": addr, "lat": round(x["lat"], 6), "lng": round(x["lng"], 6),
            "price_thb": None, "status": "Google 지도에 폐업 표시 없음", "checked": at, "osm_check": None, "osm_edit": None,
            "source": "Google 지도", "source_url": gurl, "rating": x.get("rating"),
            "korean": True, "kr": kr, "srcs": srcs, "fsrc": fsrc, "info_date": at,
        })
    return res

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
            "korean": cat == "food" and "한식" in cz, "kr": "OSM 음식 종류: 한식" if "한식" in cz else None,
            "srcs": {"o": {"by": "OpenStreetMap", "url": "https://www.openstreetmap.org/%s/%d" % (typ, i), "at": FETCHED}},
            "fsrc": {f: "o" for f, v in (("name", nm), ("hours", t.get("opening_hours")), ("phone", phone), ("address", addr), ("website", web), ("status", 1)) if v},
            "info_date": t.get("check_date:opening_hours") or t.get("check_date") or e["timestamp"][:10],   # 정보가 마지막으로 확인·수정된 날
        })
    out += korean()
    for p in out: p["old"] = p["info_date"] < OLD_BEFORE
    doc = {"_readme": "📇 파타야 가게 카드 시험 — tools/places/build_places.py 가 만듦. 실제 OSM 데이터만, 모르는 값 = null(화면 '확인 안 됨'). © OpenStreetMap contributors (ODbL)",
           "region": "pattaya", "fetched": FETCHED, "osm_base": raw.get("osm3s", {}).get("timestamp_osm_base"),
           "attribution": "© OpenStreetMap contributors", "license_url": "https://www.openstreetmap.org/copyright",
           "report_kakao_url": "",   # '정보 틀림' 카톡 링크(운영자 카톡 채널 주소 — 승인함 #7). 비어 있으면 화면은 '링크 준비 중' 자리표시
           "old_before": OLD_BEFORE, "places": out}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("places:", len(out), "→", OUT.relative_to(ROOT))
    assert not THAI.search(OUT.read_text(encoding="utf-8")), "태국 문자가 남아 있음"
    print("한식·한인:", sum(1 for p in out if p.get("korean")), "· 오래된 정보:", sum(1 for p in out if p["old"]))

if __name__ == "__main__":
    main()
