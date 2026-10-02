# -*- coding: utf-8 -*-
"""'🇰🇷 오늘의 한국 주요 뉴스'(판 필드 korea_top, 6건) 후보 수집 — 한국 언론(한국어) Google News KR RSS.

  python3 tools/fetch_korea.py <판 id> [--decode]
    → raw/<id>/korea/top.xml, q_*.xml(원본 RSS), raw/<id>/korea/korea.json(후보 목록) 저장 + 후보 출력
    --decode : 후보의 실제 기사 URL 풀기(googlenewsdecoder, 느림 — 고른 6건만 쓰려면 생략하고 아래 decode 사용)
  python3 tools/fetch_korea.py <판 id> --decode-only "제목 일부" …   # 고른 항목만 실제 URL 풀기

수집 순서(우선순위): ① 태국 사는 한국인에게 직접 영향(태국 비자·입국, 인천↔방콕 항공, 원·바트 환율,
한-태 관계, 외교부·대사관 안전 공지) ② 그날 한국 전체 주요 뉴스(Google News 한국 '주요 뉴스').
편집 파일에서 KR(headline, source, url, published, badge) 6개로 적는다(headline 은 한국어 원제를 TRANSLATION_RULES
제목 규칙대로 짧게만 다듬고, 없는 내용을 지어내지 않는다). 최근 36시간 안의 기사만.
"""
import sys, re, json, pathlib, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone, timedelta

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
BKK = timezone(timedelta(hours=7))
TOP = "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko"
# 교민 관련 검색(우선) — 결과가 없으면 넘어감
QUERIES = ["태국 비자 when:2d", "태국 한국인 when:2d", "원 바트 환율 when:2d", "방콕 항공편 when:2d",
           "한국 태국 외교 when:2d", "외교부 태국 when:3d", "원달러 환율 when:1d"]


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


def items(data, kind):
    out = []
    for it in ET.fromstring(data).iter("item"):
        t = (it.findtext("title") or "").strip()
        src = (it.findtext("source") or "").strip()
        if src and t.endswith(" - " + src):
            t = t[: -len(" - " + src)]
        d = parsedate_to_datetime(it.findtext("pubDate")).astimezone(BKK)
        out.append(dict(kind=kind, title=t, source=src, gn_url=it.findtext("link"), published=d.isoformat(timespec="seconds")))
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    eid = sys.argv[1]
    out = ROOT / "raw" / eid / "korea"
    out.mkdir(parents=True, exist_ok=True)
    fn = out / "korea.json"
    if "--decode-only" in sys.argv:
        pats = sys.argv[sys.argv.index("--decode-only") + 1:]
        cands = json.loads(fn.read_text(encoding="utf-8"))
        decode([c for c in cands if any(p in c["title"] for p in pats)])
        fn.write_text(json.dumps(cands, ensure_ascii=False, indent=1), encoding="utf-8")
        return
    cands = []
    for i, q in enumerate(QUERIES):
        try:
            data = fetch("https://news.google.com/rss/search?q=" + urllib.parse.quote(q) + "&hl=ko&gl=KR&ceid=KR:ko")
            (out / ("q_%d.xml" % i)).write_bytes(data)
            cands += items(data, "교민:" + q.replace(" when:", " ~"))[:8]
        except Exception as e:
            print("검색 실패:", q, e, file=sys.stderr)
    data = fetch(TOP)
    (out / "top.xml").write_bytes(data)
    cands += items(data, "주요")
    now = datetime.now(BKK)
    seen, res = set(), []
    for c in cands:
        if c["title"] in seen or now - datetime.fromisoformat(c["published"]) > timedelta(hours=36):
            continue
        seen.add(c["title"]); res.append(c)
    if "--decode" in sys.argv:
        decode(res)
    fn.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    for c in res:
        print("%s | %-14s | %s | %s" % (c["published"][5:16], c["kind"][:14], c["source"], c["title"]))
    print("저장:", fn, len(res), "건")


def decode(cs):
    try:
        from googlenewsdecoder import gnewsdecoder
    except ImportError:
        print("googlenewsdecoder 없음(pip install googlenewsdecoder) — gn_url 그대로 사용 가능", file=sys.stderr); return
    for c in cs:
        if c.get("url"):
            continue
        try:
            r = gnewsdecoder(c["gn_url"], interval=1)
            if r.get("status") or r.get("success"):
                c["url"] = r["decoded_url"]; print("URL:", c["title"][:40], "→", c["url"])
        except Exception as e:
            print("decode 실패:", c["title"][:40], e, file=sys.stderr)


if __name__ == "__main__":
    main()
