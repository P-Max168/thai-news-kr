# -*- coding: utf-8 -*-
"""검색 노출(SEO) 공용 도구 — 2026-10-18 Grok(민구님 승인: 한국어판 검색 노출, Claude 요청 R-seo-1~4 대행).

    python3 tools/seo.py sitemap        # sitemap.xml 다시 만들기(data/index.json + e/<판>/ 있는 것)
    python3 tools/seo.py regen-e        # 기존 e/<판>/index.html 전부를 '판 기사 전체 정적 HTML'로 다시 만들기
                                        #   (제목·설명·OG 태그는 기존 파일 것을 그대로 유지 → og 이미지·카톡 미리보기 안 바뀜)
    python3 tools/seo.py all            # 둘 다

- e/<판>/index.html = 판의 모든 기사(제목·요약·출처 링크, 기사별 앵커 #<기사id>)를 정적 HTML 로 → 네이버·다음 수집기도 읽음.
  사람(브라우저)은 지금처럼 바로 앱 화면 ../../?ed=<판> 으로 이동. 검색 수집기(UA 에 bot/crawl/spider/Yeti/Daum 등)는 이동하지 않음.
  canonical = 자기 자신(https://tnews.pmaxone.com/e/<판>/). 앱의 ?ed=<판> 주소는 app.js 가 canonical 을 이 쪽으로 바꿈.
- 판 빌드 때: tools/share_kit.py 가 e 쪽을 이 모듈로 만들고, 직후 sitemap 갱신. tools/deploy.sh 도 커밋 전에 sitemap 을 한 번 더 만듦.
- ฿·태국 글자는 넣지 않음(title_th 는 쓰지 않음, 본문에 있으면 생성 거부 — 화면 규칙과 같음).
- 언어판(zh 등)은 site/<lang>.json 의 site_url·brand 를 넘기면 같은 코드로 만듦(시스템 공유·편집 기준 분리).
"""
import html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://tnews.pmaxone.com/"
BRAND = "태국 뉴스 한눈에"
INFO_PAGES = ["about.html", "contact.html", "privacy.html", "terms.html"]
BOT_RX = r"bot|crawl|spider|slurp|yeti|daum|bingpreview|mediapartners|facebookexternalhit|kakaotalk-scrap|lighthouse"
e = html.escape
_THAI = re.compile(r"[\u0E00-\u0E7F]")


def _site():
    """site/<lang>.json 이 있으면 그 값(언어판), 없으면 한국판 기본값."""
    try:
        sys.path.insert(0, str(ROOT / "tools"))
        import siteconf
        c = siteconf.load()
        return c.get("site_url", SITE), c.get("brand", {}).get("name", BRAND), c.get("htmlLang", "ko")
    except Exception:
        return SITE, BRAND, "ko"


def canonical_tag(url):
    return '<link rel="canonical" href="%s">' % e(url)


def _paras(summary):
    if isinstance(summary, str):
        summary = [summary]
    return "".join("<p>%s</p>" % e(p) for p in (summary or []) if p)


def edition_page(data, meta, title, desc, og_block, emoji=None, label=None):
    """판 전체 정적 HTML. emoji = {기사id: '🏖️'} (없으면 생략)."""
    site, brand, lang = _site()
    eid = data["id"]
    url = site + "e/%s/" % eid
    target = "../../?ed=" + eid
    emoji = emoji or {}
    arts = []
    for s in data.get("stories", []):
        src = '<a href="%s" rel="nofollow noopener" target="_blank">%s</a>' % (e(s["url"]), e(s.get("source", "원문"))) if s.get("url") else e(s.get("source", ""))
        also = "".join(' · <a href="%s" rel="nofollow noopener" target="_blank">%s</a>' % (e(a["url"]), e(a.get("source", "")))
                       for a in (s.get("also") or []) if a.get("url"))
        ctx = '<p class="ctx">%s</p>' % e(s["context"]) if s.get("context") else ""
        region = '<span class="rg">%s</span> ' % e(s["region"]) if s.get("region") else ""
        arts.append('<article id="%s"><h2>%s%s</h2>%s%s%s<p class="src">출처: %s%s · <a href="%s#%s">앱에서 보기</a></p></article>'
                    % (e(s["id"]), (emoji.get(s["id"], "") + " ") if emoji.get(s["id"]) else "", e(s["headline"]),
                       ('<p class="meta">%s</p>' % region) if region else "", _paras(s.get("summary")), ctx, src, also,
                       e(target), e(s["id"])))
    brief = data.get("briefing")
    if isinstance(brief, dict):
        brief = brief.get("lines") or brief.get("items") or []
    brief_html = ""
    if isinstance(brief, list) and brief:
        brief_html = '<section class="brief"><h2>브리핑</h2><ul>%s</ul></section>' % "".join(
            "<li>%s</li>" % e((b if isinstance(b, str) else (b.get("text") or b.get("line") or "")).replace("**", "")) for b in brief)
    page = """<!doctype html>
<html lang="%(lang)s">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
%(canon)s
%(og)s
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" sizes="32x32" href="../../assets/icons/favicon-32.png">
<!-- 판 전체 정적 페이지(tools/seo.py 가 생성, tools/share_kit.py 가 판마다 부름). 검색 수집기는 이 글을 읽고,
     사람(브라우저)은 바로 앱 화면으로 이동. meta refresh 는 미리보기 수집기가 따라가 메인 태그를 읽을 수 있어 쓰지 않음(JS 이동 + 링크). -->
<script>if(!/%(botrx)s/i.test(navigator.userAgent||""))location.replace(%(target_js)s + location.hash);</script>
<style>body{margin:0;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;background:#F2F4F6;color:#191F28;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere}
header{background:#fff;color:#191F28;padding:18px 20px;font-weight:800;font-size:20px;box-shadow:0 1px 0 rgba(0,0,0,.05)}header a{color:inherit;text-decoration:none}
main{padding:20px;max-width:720px;margin:auto}h1{font-size:22px;margin:0 0 6px}article,.brief{background:#fff;border-radius:16px;padding:16px 18px;margin:12px 0}
article h2,.brief h2{font-size:18px;margin:0 0 8px;line-height:1.4}.meta,.src{color:#5F6B7A;font-size:14px}.ctx{color:#4E5968;font-size:15px}
a{color:#1B64DA}a.btn{display:inline-block;margin:10px 0;background:#1B64DA;color:#fff;font-weight:700;padding:12px 18px;border-radius:12px;text-decoration:none}
li{margin:6px 0;color:#333D4B}footer{color:#5F6B7A;font-size:14px;padding:10px 20px 30px;max-width:720px;margin:auto}</style>
<link rel="stylesheet" href="/assets/g-pages.css?v=1">
</head>
<body>
<header><a href="../../">%(brand)s</a></header>
<main><h1>%(label)s</h1><a class="btn" href="%(target)s">이번 판 앱에서 열기 →</a>
%(brief)s
%(arts)s
<a class="btn" href="%(target)s">이번 판 앱에서 열기 →</a></main>
<footer><a href="../../">최신 뉴스</a> · <a href="../../about.html">소개</a> · <a href="../../contact.html">연락하기</a> · <a href="../../privacy.html">개인정보 처리방침</a> · <a href="../../terms.html">이용약관</a></footer>
</body>
</html>
""" % {"lang": lang, "title": e(title), "desc": e(desc), "canon": canonical_tag(url), "og": og_block, "botrx": BOT_RX,
       "target_js": json.dumps(target), "target": e(target), "brand": e(brand), "label": e(label or meta.get("label", eid)),
       "brief": brief_html, "arts": "\n".join(arts)}
    if "฿" in page or _THAI.search(page):
        raise SystemExit("e/%s: '฿' 또는 태국 글자가 들어감 — 데이터 문구 확인(TRANSLATION_RULES)" % eid)
    return page


def sitemap(root=ROOT):
    site, _, _ = _site()
    idx = json.loads((root / "data/index.json").read_text(encoding="utf-8"))
    eds = idx.get("editions", [])
    latest = next((x for x in eds if x["id"] == idx.get("latest")), eds[0] if eds else {})
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    lm = lambda g: ("<lastmod>%s</lastmod>" % e(g)) if g else ""
    out.append("  <url><loc>%s</loc>%s<changefreq>hourly</changefreq><priority>1.0</priority></url>" % (site, lm(latest.get("generated"))))
    for p in INFO_PAGES:
        if (root / p).exists():
            out.append("  <url><loc>%s%s</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>" % (site, p))
    for x in sorted(eds, key=lambda x: x["id"], reverse=True):
        if (root / "e" / x["id"] / "index.html").exists():
            out.append("  <url><loc>%se/%s/</loc>%s<changefreq>never</changefreq><priority>0.6</priority></url>" % (site, x["id"], lm(x.get("generated"))))
    out.append("</urlset>")
    txt = "\n".join(out) + "\n"
    (root / "sitemap.xml").write_text(txt, encoding="utf-8")
    return len(out) - 3


def _old_head(path):
    """기존 e 쪽에서 제목·설명·OG 묶음을 그대로 꺼냄(og 이미지·카톡 미리보기 유지)."""
    t = path.read_text(encoding="utf-8")
    title = html.unescape(re.search(r"<title>(.*?)</title>", t, re.S).group(1))
    desc = html.unescape(re.search(r'<meta name="description" content="(.*?)">', t, re.S).group(1))
    og = "\n".join(l for l in t.splitlines() if l.startswith('<meta property="og:') or l.startswith('<meta name="twitter:'))
    return title, desc, og


def regen_e(root=ROOT):
    sys.path.insert(0, str(root / "tools"))
    import share_kit
    idx = json.loads((root / "data/index.json").read_text(encoding="utf-8"))
    n = 0
    for meta in idx.get("editions", []):
        p = root / "e" / meta["id"] / "index.html"
        dp = root / "data" / (meta["id"] + ".json")
        if not p.exists() or not dp.exists():
            continue
        data = json.loads(dp.read_text(encoding="utf-8"))
        title, desc, og = _old_head(p)
        tp = share_kit.story_topics(data)
        emo = {k: share_kit.TOPICS.get(v["topic"], ("", ""))[1] for k, v in tp.items()}
        p.write_text(edition_page(data, meta, title, desc, og, emo), encoding="utf-8")
        n += 1
    return n


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    if cmd in ("regen-e", "all"):
        print("e 쪽 다시 만듦:", regen_e())
    if cmd in ("sitemap", "all"):
        print("sitemap.xml: 판 쪽 %d개 포함" % sitemap())
