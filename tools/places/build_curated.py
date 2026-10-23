# -*- coding: utf-8 -*-
"""📍 내 주변 — 확인한 장소 카드 데이터 만들기(장소 엔진, ops/SYSTEM_PLAN.md 9절, 2026-10-23 Claude).

원본: ops/places-pilot/<분류>.json (food·massage·vet·beauty·moto, 사람이 출처 2곳 이상으로 확인해 적은 것)
결과: data/places-curated.json — assets/nearby.js 가 화면에서 읽음. 분류 이름은 nearby.js 의 id 로 바꿈(vet → pet).

    python3 tools/places/build_curated.py            # 만들기 + 검사
    python3 tools/places/build_curated.py --check    # 검사만(파일 안 씀)

검사: 이름·지역·분류·영업시간·대표 항목·팁이 ko·zh 둘 다 있는지, 출처 2곳 이상, 링크가 http(s).
확인일(checked)은 원본을 다시 확인할 때 CHECKED 를 바꾼다(월 1회 재확인).
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "ops" / "places-pilot"
OUT = ROOT / "data" / "places-curated.json"
CHECKED = "2026-10-23"
REGION = "pattaya"
CATS = [("food", "food"), ("massage", "massage"), ("vet", "pet"), ("beauty", "beauty"), ("moto", "moto")]
LANGS = ("ko", "zh")
# 업주 정보 수정 LINE. 계정이 정해지면 기본 ID("@abc1234" — 대화창에 '[tnews 정보 수정] <가게 id>' 글이 미리 채워짐) 또는
# https 주소를 넣고 다시 만든다. 비어 있으면 화면은 '오류 신고' 버튼만. (번역봇 계정을 쓸 경우 봇이 이 표시를 보고 번역 대신 수정 요청함으로)
OWNER_LINE = None


def check(cat, i, p):
    errs, at = [], "%s[%d] %s" % (cat, i, p.get("thai"))
    for k in ("name", "area", "cat", "dishes", "tip"):
        for L in LANGS:
            if not (p.get(k) or {}).get(L):
                errs.append("%s: %s.%s 없음" % (at, k, L))
    if not (p.get("hours") or {}).get("text"):
        errs.append("%s: hours.text 없음" % at)
    src = p.get("src") or []
    if len(src) < 2:
        errs.append("%s: 출처 %d곳(2곳 이상 필요)" % (at, len(src)))
    for s in src + sum([(p.get("voice", {}).get(L) or {}).get("src", []) for L in LANGS], []):
        if not (isinstance(s, list) and len(s) == 2 and str(s[1]).startswith(("http://", "https://"))):
            errs.append("%s: 출처 형식 이상 %r" % (at, s))
    return errs


def main():
    only_check = "--check" in sys.argv
    if OWNER_LINE and not (str(OWNER_LINE).startswith("https://") or __import__("re").match(r"^@[\w.-]+$", OWNER_LINE)):
        print("OWNER_LINE 형식 이상: @아이디 또는 https:// 주소"); return 1
    out = {"_doc": "자동 생성(tools/places/build_curated.py) — 손으로 고치지 말고 ops/places-pilot/*.json 을 고친 뒤 다시 만들 것",
           "checked": CHECKED, "region": REGION, "owner_line": OWNER_LINE, "cats": {}}
    errs, n = [], 0
    for src_name, cat_id in CATS:
        rows = json.loads((SRC / (src_name + ".json")).read_text(encoding="utf-8"))
        for i, p in enumerate(rows):
            errs += check(src_name, i, p)
            p["id"] = "%s-%d" % (cat_id, i + 1)
        out["cats"][cat_id] = rows
        n += len(rows)
    if errs:
        print("\n".join(errs)); print("검사 실패 %d건" % len(errs)); return 1
    if not only_check:
        OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("OK %d곳 %s" % (n, "" if only_check else "→ " + str(OUT.relative_to(ROOT))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
