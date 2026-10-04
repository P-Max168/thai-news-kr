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
# 오래된 정보 기준(2026-10-05 Max 06:33): 오늘(방콕) − 730일(2년) — 자동 계산(예전엔 2023-01-01 고정이라 README 의 '2년'과 달랐음).
#   기준 날 = OSM check_date(현장 확인 날)가 있으면 그것, 없으면 지도 정보를 마지막으로 고친 날. 화면(assets/places.js)도 같은 규칙으로 매일 다시 계산
OLD_DAYS = 730   # ★ 한 상수: 오래된 정보 + '🟢 지금 영업 중' 자격 창(조사봇 제안 90일 ↔ Max 06:33 지시 730일 → 730, DEV_LOG 10-05)
OLD_BEFORE = (datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).date() - datetime.timedelta(days=OLD_DAYS)).isoformat()
FETCHED = "2026-10-03"
THAI = re.compile(r"[\u0E00-\u0E7F]")
BAD = re.compile(r"massage|\bspa\b|go-?go|\bbar\b|club|lady|soapy|nuru|cabaret|\bshow\b", re.I)
# 빼는 업종(검수 지시 2026-10-03 18:18): 대마·성인·도박 — 이름·업종 태그에 걸리면 카드에서 뺌(빌드 때 이유 출력)
EXCL = re.compile(r"cannabis|marijuana|\bweed\b|\bganja\b|\bkush\b|dispensar|\bhemp\b|\bcbd\b|\bthc\b|\b420\b|대마|"
                  r"casino|gambl|poker|baccarat|betting|bookmaker|lottery|카지노|도박|"
                  r"\badult\b|erotic|\bsex|\bxxx\b|strip ?club|brothel|escort|hostess|love ?hotel|성인", re.I)
EXCL_TAGS = {("shop", "cannabis"), ("shop", "erotic"), ("shop", "lottery"), ("shop", "bookmaker"), ("amenity", "casino"), ("amenity", "gambling"),
             ("leisure", "adult_gaming_centre"), ("amenity", "stripclub"), ("amenity", "brothel"), ("amenity", "love_hotel"), ("amenity", "swingerclub")}
def excluded(name, tags=None):
    tags = tags or {}
    for kv in tags.items():
        if kv in EXCL_TAGS: return "%s=%s" % kv
    m = EXCL.search(" ".join([name or ""] + [tags.get(k, "") for k in ("name", "name:en", "name:ko", "description", "brand", "cuisine")]))
    return m.group(0) if m else None
DROPPED = []

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
        why = excluded(name)
        if why: DROPPED.append(("pattaya", name, why)); continue
        gurl = "https://maps.google.com/?cid=" + cid
        area = ov.get("_area")
        srcs = {"g": {"by": "Google 지도", "url": gurl, "at": at}}
        fsrc = {"name": "g", "area": "g"} if area else {"name": "g"}
        res.append({
            "id": "gmap-" + cid, "cat": cat, "cat_ko": CAT[cat], "name": name, "kind": kind, "cuisine": [],
            "hours": None, "hours_partial": False, "phone": None, "website": None, "address": None,
            "area": area or "파타야(동네 확인 안 됨)", "lat": None, "lng": None,
            "price_thb": None, "vat_extra": None, "status": "영업 확인 안 됨", "checked": at, "osm_check": None, "osm_edit": None,
            "unverified": True,   # 구글 지도에서 이름이 한 번 보인 것뿐 — 영업 여부·정보 날짜 모름(2026-10-05: 받은 날을 정보 날짜로 쓰던 것 고침)
            "status_code": "unknown",
            "verified_status": None, "verified_by": None, "verified_at": None, "verified_source_url": None, "verified_marker": None,
            "source": "Google 지도", "source_url": gurl, "gmaps_only": True,
            "korean": True, "kr": kr, "srcs": srcs, "fsrc": fsrc, "info_date": None, "info_kind": None,
        })
    # 2026-10-05 Max 06:55 지시 6번: 1차에 '폐업'으로 뺀 NewKoreaMart·Jin Sung 은 조사봇 2차에서 그 가게 쪽(cid) 폐업 표시 없음 → '확인 불가'로 다시 넣음(이름·링크만, 동네 모름)
    for r in json.load(open(VERIFY, encoding="utf-8")).get("readd", []):
        gurl = "https://maps.google.com/?cid=" + r["cid"]
        res.append({
            "id": "gmap-" + r["cid"], "cat": r["cat"], "cat_ko": CAT[r["cat"]], "name": r["name"], "kind": r["kind"], "cuisine": [],
            "hours": None, "hours_partial": False, "phone": None, "website": None, "address": None,
            "area": "파타야(동네 확인 안 됨)", "lat": None, "lng": None,
            "price_thb": None, "vat_extra": None, "status": "영업 확인 안 됨", "checked": "2026-10-03", "osm_check": None, "osm_edit": None,
            "unverified": True, "status_code": "unknown", "readded": "2026-10-05 — 1차에 '폐업'으로 뺐다가 2차 검수에서 폐업 표시 없음 확인 → 다시 넣음",
            "verified_status": None, "verified_by": None, "verified_at": None, "verified_source_url": None, "verified_marker": None,
            "source": "Google 지도", "source_url": gurl, "gmaps_only": True,
            "korean": True, "kr": "Google 지도 이름", "srcs": {"g": {"by": "Google 지도", "url": gurl, "at": "2026-10-03"}}, "fsrc": {"name": "g"},
            "info_date": None, "info_kind": None,
        })
    return res

# 조사봇 2차 검수 등급(2026-10-05, 보고서 값 그대로 — tools/places/parse_verify.py). 이름으로 맞춤(파타야만 — 방콕·시라차는 검수 기록 없음 = 전부 '확인 안 됨')
VERIFY = ROOT / "tools/places/pattaya-verify-2026-10-05.json"
def apply_verify(out):
    v = json.load(open(VERIFY, encoding="utf-8"))
    by = v["by_name"]; readd = {"gmap-" + r["cid"]: r for r in v.get("readd", [])}
    n = 0
    for p in out:
        r = by.get(p["name"]) or readd.get(p["id"])
        if not r: continue
        for k in ("verified_status", "verified_by", "verified_at", "verified_source_url", "verified_marker"): p[k] = r[k]
        p["status_code"] = {"영업 확인": "open_verified", "폐업 의심": "closed_suspected"}.get(r["verified_status"], "unknown")
        n += 1
    missing = [p["name"] for p in out if not p.get("verified_status")]
    assert not missing, ("검수 기록 없는 파타야 가게", missing)
    print("검수 등급 적용:", n)

def osm_cards(raw, pick, region_ko):
    by = {(e["type"], e["id"]): e for e in raw["elements"]}
    out = []
    for cat, typ, i, name in pick:
        e = by[(typ, i)]; t = e["tags"]
        why = excluded(name, t)
        if why: DROPPED.append((region_ko, name, why)); continue
        nm = ok(t.get("name:ko")) or ok(t.get("name:en")) or ok(t.get("name")) or ok(name)
        assert nm and not BAD.search(nm + " " + t.get("name", "")), (i, nm)
        kind = next((v for (k, val), v in KIND.items() if t.get(k) == val), None)
        cz = [CUISINE[c] for c in (t.get("cuisine") or "").split(";") if c in CUISINE][:3]
        lat = e.get("lat") or e.get("center", {}).get("lat"); lon = e.get("lon") or e.get("center", {}).get("lon")
        addr = ok(t.get("address")) or (", ".join(x for x in [ok(t.get("addr:housenumber")), ok(t.get("addr:street"))] if x) if ok(t.get("addr:street")) else None)   # 길 이름(영어)이 없으면 번지만으론 안 씀
        phone = (t.get("phone") or t.get("contact:phone") or "").split(";")[0].strip() or None
        web = t.get("website") or t.get("contact:website") or None
        # 폐업 표시 실제 검사(2026-10-05, 조사봇 원인 ① — 예전엔 검사 없이 '폐업 표시 없음'을 박았음): disused:*·was:*·abandoned:*·opening_hours=closed/off
        life = sorted(k for k in t if k.split(":")[0] in ("disused", "was", "abandoned", "demolished", "removed")) + (["opening_hours=" + t["opening_hours"]] if (t.get("opening_hours") or "").strip().lower() in ("closed", "off") else [])
        out.append({
            "id": "osm-%s-%d" % (typ, i), "cat": cat, "cat_ko": CAT[cat], "name": nm, "kind": kind, "cuisine": cz,
            "hours": t.get("opening_hours") or None,           # OSM 영업시간 원문(화면이 한국어로 풀고 '지금 영업 중' 계산)
            "phone": phone, "website": web, "address": addr, "lat": round(lat, 6), "lng": round(lon, 6),
            "price_thb": None, "vat_extra": None,              # vat_extra: 가격 VAT 별도 여부(true/false) — 가게·공식 출처 확인 전엔 null(화면 '확인 안 됨'). OSM 에 가격 없음 → '확인 안 됨'(바트·원은 값이 생기면 같이 표시)
            "status": "지도에 폐업 표시 있음 — 영업 확인 안 됨" if life else "지도에 폐업 표시 없음(현장 확인 아님)",   # 위 검사 결과(실제 영업 확인 아님)
            "status_code": "closed_suspected" if life else "unknown",   # open_verified(근거 있는 확인만) | closed_suspected | unknown — 근거 없으면 무조건 unknown, unknown 은 영업 중으로 안 봄
            "osm_life_tags": life,
            "checked": FETCHED,                                # 지도에서 데이터를 받은 날(확인한 날 아님 — 화면 '지도에서 받은 날')
            "verified_status": None, "verified_by": None, "verified_at": None, "verified_source_url": None, "verified_marker": None,   # 실제 확인 기록 — by·at + 근거(url 또는 how: 전화·방문) 있을 때만 화면 '확인함'. 지어내지 않음
            "osm_check": t.get("check_date:opening_hours") or t.get("check_date") or None,   # OSM 기여자가 현장 확인한 날(있을 때만)
            "osm_edit": e["timestamp"][:10],                   # OSM 에서 마지막으로 고친 날
            "source": "OpenStreetMap", "source_url": "https://www.openstreetmap.org/%s/%d" % (typ, i),
            "korean": cat == "food" and "한식" in cz, "kr": "OSM 음식 종류: 한식" if "한식" in cz else None,
            "srcs": {"o": {"by": "OpenStreetMap", "url": "https://www.openstreetmap.org/%s/%d" % (typ, i), "at": FETCHED}},
            "fsrc": {f: "o" for f, v in (("name", nm), ("hours", t.get("opening_hours")), ("phone", phone), ("address", addr), ("website", web)) if v},
            # 영업 상태 칸 출처: 예전엔 ("status", 1) 로 늘 붙였음(조사봇 원인 ②) → 지금은 위 폐업 태그 검사를 한 OSM 원본에만, 글도 '폐업 표시 검사'로(화면 fs 'status' 아님)
            "info_date": t.get("check_date:opening_hours") or t.get("check_date") or e["timestamp"][:10],   # 오래된 정보 기준 날: 현장 확인 날 > 마지막으로 고친 날
            "info_kind": "check" if (t.get("check_date:opening_hours") or t.get("check_date")) else "edit",
        })
    return out

# 파타야 동네 5곳(검수 지시 2026-10-03 18:18, 대략 나눔) — OSM 좌표가 있으면 좌표로, 구글 지도 가게는 적어 둔 큰 동네(_area)로.
#   동파타야 = 수쿰윗 길 동쪽(경계 경도: 북위 12.93 이남 ≈ 100.896, 이북은 12.93→100.897 · 12.97→100.911 로 비스듬히 — Nominatim 'Sukhumvit, Pattaya' 선 모양으로 어림, 2026-10-03)
#   수쿰윗 서쪽: 북위 12.949 이상 = 북파타야·나끌루아(웡아맛 포함) / 12.927~12.949 = 센트럴(파타야 클랑~파타야 느아 사이) / 12.912~12.927 = 남파타야 / 12.912 미만 = 좀티엔·프라땀낙(텝쁘라싯 포함)
#   경계에서 300m 안쪽 가게는 틀릴 수 있음. 동네를 모르는 곳(sub=null)은 '전체'에서만 보임.
SUBS = {"central": "센트럴", "south": "남파타야", "north": "북파타야·나끌루아", "jomtien": "좀티엔·프라땀낙", "east": "동파타야"}
def suk_lng(lat):
    return 100.896 if lat < 12.93 else 100.897 + (lat - 12.93) * 0.35
def sub_of(p):
    if p.get("lat") is not None:
        la, ln = p["lat"], p["lng"]
        if ln >= suk_lng(la): return "east"
        return "north" if la >= 12.949 else "central" if la >= 12.927 else "south" if la >= 12.912 else "jomtien"
    a = p.get("area") or ""
    if "나끌루아" in a or "북파타야" in a or "웡아맛" in a: return "north"
    if "동쪽" in a or "농쁘루" in a or "동파타야" in a: return "east"
    if "좀티엔" in a or "프라땀낙" in a: return "jomtien"
    if "남파타야" in a: return "south"
    if "센트럴" in a: return "central"
    return None   # '파타야 시내'·'동네 확인 안 됨' — 어림하지 않음

# 시라차·방콕(2026-10-03 18시): OSM 만(구글 지도는 약관 때문에 새로 안 씀). 고른 목록 = tools/places/<지역>-pick-2026-10-03.json(뺀 것·이유 포함)
REGIONS = {"pattaya": "파타야", "sriracha": "시라차", "bangkok": "방콕"}

def write(region, raw, out):
    for p in out: p["old"] = bool(p["info_date"]) and p["info_date"] < OLD_BEFORE   # 빌드한 날 기준(참고) — 화면은 매일 다시 계산
    dst = ROOT / ("data/places-%s.json" % region)
    doc = {"_readme": "📇 %s 가게 카드 시험 — tools/places/build_places.py 가 만듦. 실제 OSM 데이터%s, 모르는 값 = null(화면 '확인 안 됨'). © OpenStreetMap contributors (ODbL)"
                      % (REGIONS[region], " + 한식·한인 업소는 이름·큰 동네·Google 지도 링크만(Google 지도 약관: 내용 복사·업소 목록 만들기 금지)" if region == "pattaya" else "만(OSM 음식 종류 korean 또는 한글 상호)"),
           "region": region, "region_ko": REGIONS[region], "fetched": FETCHED, "osm_base": raw.get("osm3s", {}).get("timestamp_osm_base"),
           "attribution": "© OpenStreetMap contributors", "license_url": "https://www.openstreetmap.org/copyright",
           "report_kakao_url": "",   # '정보 틀림' 카톡 링크(운영자 카톡 채널 주소 — 승인함 #7). 비어 있으면 화면은 '링크 준비 중' 자리표시
           "old_before": OLD_BEFORE, "old_days": OLD_DAYS, "old_rule": "기준 날(현장 확인 날, 없으면 지도 정보 고친 날)이 오늘 − 730일보다 앞 = 오래된 정보(화면이 매일 다시 계산)", "places": out}
    if region == "pattaya":
        doc["subs"] = [{"id": k, "t": v} for k, v in SUBS.items()]
        doc["subs_note"] = "동네는 대략 나눔(OSM 좌표 + 수쿰윗 길 기준 어림, 구글 지도 가게는 적어 둔 큰 동네). 경계 근처는 틀릴 수 있고, 동네를 모르는 곳은 '전체'에서만 보여요."
    dst.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    assert not THAI.search(dst.read_text(encoding="utf-8")), "태국 문자가 남아 있음"
    print("%s places: %d → %s · 한식·한인 %d · 오래된 정보 %d" % (region, len(out), dst.relative_to(ROOT), sum(1 for p in out if p.get("korean")), sum(1 for p in out if p["old"])))

def main():
    raw = json.load(open(RAW, encoding="utf-8"))
    out = osm_cards(raw, json.load(open(PICK, encoding="utf-8")), "파타야")
    out += korean()
    for p in out: p["sub"] = sub_of(p)
    apply_verify(out)
    import collections
    print("파타야 동네:", dict(collections.Counter(p["sub"] for p in out)))
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
    print("대마·성인·도박으로 뺀 곳: %d %s" % (len(DROPPED), DROPPED))

if __name__ == "__main__":
    main()
