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
    return re.sub(r"[?&](mibextid|igshid|igsh|ref|_r|_t)=[^&]*", "", u).replace("&", "?", 1) if u and "?" not in re.sub(r"[?&](mibextid|igshid|igsh|ref|_r|_t)=[^&]*", "", u) else (re.sub(r"[?&](mibextid|igshid|igsh|ref|_r|_t)=[^&]*", "", u) if u else None)
CUISINE = {"korean": "한식", "thai": "태국 음식", "italian": "이탈리아", "pizza": "피자", "japanese": "일식", "sushi": "초밥", "barbecue": "바비큐",
           "norwegian": "노르웨이", "coffee_shop": "커피", "ice_cream": "아이스크림", "breakfast": "아침 식사", "international": "여러 나라", "asian": "아시아", "seafood": "해산물", "cake": "케이크", "bakery": "빵"}
KIND = {("amenity", "veterinary"): "동물병원", ("shop", "pet"): "펫샵", ("amenity", "motorcycle_rental"): "오토바이 렌탈", ("shop", "motorcycle"): "오토바이 판매·수리",
        ("amenity", "clinic"): "피부과 클리닉", ("shop", "beauty"): "뷰티 숍", ("amenity", "cafe"): "카페", ("amenity", "restaurant"): "식당"}

def ok(v):
    return v if v and not THAI.search(v) else None

def korean():
    """한식·한인 업소 — 2026-10-03 17:25 방콕부터 **가게 이름 · 큰 동네 · 구글 지도 링크만**.
    Google 지도 추가 약관(https://www.google.com/help/terms_maps/): 내용 복사 금지, 대량 내려받기 금지,
    'Google 지도로 업소 목록(business listings database) 만들기·늘리기' 금지 → 전화·영업시간·주소·좌표·평점·사이트는 안 씀('확인 안 됨').
    빈칸은 OSM 이나 가게 공식 출처로 확인될 때만 채움. 원본(pattaya-korean-gmaps-*.json)은 지금 트리에서 지움(지난 git 기록은 안 고침)."""
    pk = json.load(open(GPICK, encoding="utf-8"))
    at = "2026-10-03"
    res = []
    for row in pk["pick"]:
        cat, cid, name, kind, kr = row[:5]
        ov = row[5] if len(row) > 5 else {}
        assert not BAD.search(name), name
        gurl = "https://maps.google.com/?cid=" + cid
        area = ov.get("_area")
        srcs = {"g": {"by": "Google 지도", "url": gurl, "at": at}}
        fsrc = {"name": "g", "area": "g"} if area else {"name": "g"}
        res.append({
            "id": "gmap-" + cid, "cat": cat, "cat_ko": CAT[cat], "name": name, "kind": kind, "cuisine": [],
            "hours": None, "hours_partial": False, "phone": None, "website": None, "address": None,
            "area": area or "파타야(동네 확인 안 됨)", "lat": None, "lng": None,
            "price_thb": None, "status": "확인 안 됨", "checked": at, "osm_check": None, "osm_edit": None,
            "source": "Google 지도", "source_url": gurl, "gmaps_only": True,
            "korean": True, "kr": kr, "srcs": srcs, "fsrc": fsrc, "info_date": at,
        })
    return res

def osm_cards(raw, pick, region_ko):
    by = {(e["type"], e["id"]): e for e in raw["elements"]}
    out = []
    for cat, typ, i, name in pick:
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
    return out

# 시라차·방콕(2026-10-03 18시): OSM 만(구글 지도는 약관 때문에 새로 안 씀). 고른 목록 = tools/places/<지역>-pick-2026-10-03.json(뺀 것·이유 포함)
REGIONS = {"pattaya": "파타야", "sriracha": "시라차", "bangkok": "방콕"}

def write(region, raw, out):
    for p in out: p["old"] = p["info_date"] < OLD_BEFORE
    dst = ROOT / ("data/places-%s.json" % region)
    doc = {"_readme": "📇 %s 가게 카드 시험 — tools/places/build_places.py 가 만듦. 실제 OSM 데이터%s, 모르는 값 = null(화면 '확인 안 됨'). © OpenStreetMap contributors (ODbL)"
                      % (REGIONS[region], " + 한식·한인 업소는 이름·큰 동네·Google 지도 링크만(Google 지도 약관: 내용 복사·업소 목록 만들기 금지)" if region == "pattaya" else "만(OSM 음식 종류 korean 또는 한글 상호)"),
           "region": region, "region_ko": REGIONS[region], "fetched": FETCHED, "osm_base": raw.get("osm3s", {}).get("timestamp_osm_base"),
           "attribution": "© OpenStreetMap contributors", "license_url": "https://www.openstreetmap.org/copyright",
           "report_kakao_url": "",   # '정보 틀림' 카톡 링크(운영자 카톡 채널 주소 — 승인함 #7). 비어 있으면 화면은 '링크 준비 중' 자리표시
           "old_before": OLD_BEFORE, "places": out}
    dst.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    assert not THAI.search(dst.read_text(encoding="utf-8")), "태국 문자가 남아 있음"
    print("%s places: %d → %s · 한식·한인 %d · 오래된 정보 %d" % (region, len(out), dst.relative_to(ROOT), sum(1 for p in out if p.get("korean")), sum(1 for p in out if p["old"])))

def main():
    raw = json.load(open(RAW, encoding="utf-8"))
    out = osm_cards(raw, json.load(open(PICK, encoding="utf-8")), "파타야")
    out += korean()
    write("pattaya", raw, out)
    for r in ("sriracha", "bangkok"):
        rraw = json.load(open(ROOT / ("tools/places/%s-osm-2026-10-03.json" % r), encoding="utf-8"))
        pk = json.load(open(ROOT / ("tools/places/%s-pick-2026-10-03.json" % r), encoding="utf-8"))["pick"]
        cards = osm_cards(rraw, pk, REGIONS[r])
        nm = {"osm-%s-%d" % (x[1], x[2]): x[3] for x in pk}
        for c in cards:   # 이 두 지역은 한식·한인만 골랐음 → 근거 표시. 이름은 고른 목록 것(이름 안 옛 가격 표시 등 뺀 것)
            c["name"] = nm[c["id"]]
            c["korean"] = True
            c["kr"] = "OSM 음식 종류: 한식" if "한식" in c["cuisine"] else "한글 상호"
        write(r, rraw, cards)

if __name__ == "__main__":
    main()
