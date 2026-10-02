# -*- coding: utf-8 -*-
"""카카오톡 공유 키트 — 판(edition) 하나로 이미지 카드·링크 미리보기(OG)·메시지 문구를 만든다.

    python3 tools/share_kit.py                # data/index.json 의 latest 판
    python3 tools/share_kit.py 2026-10-02-pm  # 특정 판
    옵션: --pick pt1,vi2,...  카드·메시지 기사 순서를 직접 지정(첫 번째가 큰 카드)
          --n 5               카드에 넣을 기사 수(3~5, 기본 5) / 메시지는 앞 3건
          --no-main-link      메시지에서 포털 메인 링크 줄 빼기
          --no-publish        og/·e/ 는 건드리지 않고 share/ 만 만들기

만드는 파일
  share/<id>.png        1080x1350 세로 카드(오픈채팅에 사진으로 올리기)
  share/<id>-og.png     1200x630 링크 미리보기 이미지
  share/<id>.txt        카카오톡 메시지 문구(링크 1~2개)
  share/<id>-card.html, share/<id>-og.html  렌더에 쓴 HTML(확인용)
  og/<id>.png, og/latest.png(최신 판일 때만)  ← 사이트에 올릴 OG 이미지
  e/<id>/index.html     판별 OG 태그를 가진 작은 정적 페이지 → ../../?ed=<id> 로 이동
share/ 는 .gitignore(올리지 않음). og/ e/ 는 사이트에 올릴 파일(배포 스크립트에 경로 추가 필요).

기사 고르기(기본): 🏖️파타야 → ⚓시라차 → 🛂외국인·비자 주제에서 1건씩(주 주제 +2, 제목·지역에 파타야/시라차 지명 +1,
주요 뉴스(highlights) +1, 동점이면 편집 순서) → 나머지는 주요 뉴스 순서 → 편집 순서.
주제는 화면과 똑같이 assets/topics.js(옛 판 매핑 포함)를 node 로 돌려서 구한다(node 없으면 topic/category 로 대충).
문장은 데이터의 headline 을 그대로 쓰고, 짧은 형태는 '…' 앞부분만 자른다(지어내지 않음).
"""
import argparse, asyncio, html, json, pathlib, re, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://p-max168.github.io/thai-news-kr/"
SHORT = "p-max168.github.io/thai-news-kr"
UPDATE_LINE = "매일 아침 7시·저녁 6시 업데이트"

TOPICS = {  # assets/topics.js 와 같은 값(이모지·색)
    "pattaya": ("파타야", "🏖️", "#0b7285"), "sriracha": ("시라차", "⚓", "#1c7ed6"),
    "bangkok": ("방콕", "🏙️", "#495057"), "poleco": ("정치·경제", "🏛️", "#3b5bdb"),
    "society": ("사회·사건사고", "🚨", "#d9480f"), "visa": ("외국인·비자", "🛂", "#6741d9"),
    "life": ("생활·물가·부동산", "🛒", "#0c8f6a"), "travel": ("여행·맛집", "🍜", "#e67700"),
    "ent": ("연예·스포츠·SNS", "💬", "#c2255c"), "weather": ("날씨·교통", "🌦️", "#0ca678"),
}
DECO = {"pattaya": "〰", "sriracha": "⚓", "bangkok": "曼", "poleco": "政", "society": "社", "visa": "✈",
        "life": "฿", "travel": "旅", "ent": "#", "weather": "☂"}
LEGACY = {"politics": "poleco", "economy": "poleco", "society": "society", "visa": "visa", "sns": "ent", "local": "pattaya"}
RX_PLACE = {
    "pattaya": re.compile(r"파타야|좀티엔|쫌티엔|방라뭉|방람웅|싸따힙|사따힙|사타힙|나끌루아|농쁘루|프라탐낙|꼬란"),
    "sriracha": re.compile(r"시라차|스리라차|씨라차|램차방|아마타|촌부리|판통|반븡"),
}
PRIORITY = ["pattaya", "sriracha", "visa"]
ED_NAME = {"am": "아침판", "pm": "저녁판", "early": "새벽판"}
BRIEF_BADGE = {"am": "아침 브리핑", "pm": "저녁 브리핑", "early": "새벽 브리핑"}

e = html.escape


# ---------------------------------------------------------------- 데이터
def load(ed_id):
    idx = json.loads((ROOT / "data/index.json").read_text(encoding="utf-8"))
    if ed_id in (None, "latest"):
        ed_id = idx["latest"]
    meta = next((x for x in idx["editions"] if x["id"] == ed_id), None)
    if not meta:
        sys.exit("data/index.json 에 없는 판: %s" % ed_id)
    data = json.loads((ROOT / "data" / (ed_id + ".json")).read_text(encoding="utf-8"))
    return idx, meta, data


def story_topics(data):
    """화면과 같은 주제(assets/topics.js storyTopics). {id: {topic, secondary[]}}"""
    js = ("const fs=require('fs');global.window={};eval(fs.readFileSync(process.argv[1],'utf8'));"
          "const d=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const o={};"
          "d.stories.forEach(s=>{const r=window.TNTopics.storyTopics(s);o[s.id]={topic:r.topic,secondary:r.secondary}});"
          "process.stdout.write(JSON.stringify(o));")
    node = shutil.which("node")
    if node:
        try:
            out = subprocess.run([node, "-e", js, str(ROOT / "assets/topics.js"), str(ROOT / "data" / (data["id"] + ".json"))],
                                 capture_output=True, text=True, timeout=30, check=True).stdout
            return json.loads(out)
        except Exception as ex:  # noqa
            print("경고: topics.js 실행 실패 → 간단 매핑 사용:", ex, file=sys.stderr)
    return {s["id"]: {"topic": s.get("topic") or LEGACY.get(s.get("category"), "society"),
                      "secondary": s.get("secondary", [])} for s in data["stories"]}


def pick(data, tp, n, manual=None):
    stories = data["stories"]
    by = {s["id"]: s for s in stories}
    hl = data.get("highlights") or []
    if manual:
        bad = [x for x in manual if x not in by]
        if bad:
            sys.exit("없는 기사 id: " + ", ".join(bad))
        return [by[x] for x in manual][:max(n, 3)]
    order = {s["id"]: i for i, s in enumerate(stories)}
    chosen = []

    def place_hit(s):
        txt = " ".join([s["headline"], s.get("region") or ""])
        return any(r.search(txt) for r in RX_PLACE.values())

    for slot in PRIORITY:
        cands = [s for s in stories if s not in chosen and slot in [tp[s["id"]]["topic"]] + tp[s["id"]]["secondary"]]
        if not cands:
            continue
        def score(s):
            return ((2 if tp[s["id"]]["topic"] == slot else 0) + (1 if place_hit(s) else 0)
                    + (1 if s["id"] in hl else 0), -order[s["id"]])
        chosen.append(max(cands, key=score))
    for x in hl:
        if x in by and by[x] not in chosen:
            chosen.append(by[x])
    for s in stories:
        if s not in chosen:
            chosen.append(s)
    return chosen[:n]


def split_head(h):
    """'핵심…부가' → (핵심, 부가). 앞부분이 너무 짧으면 자르지 않음."""
    if "…" in h:
        a, b = h.split("…", 1)
        if len(a.strip()) >= 8:
            return a.strip(), b.strip()
    return h.strip(), ""


def date_label(data, meta):
    m, d = int(data["date"][5:7]), int(data["date"][8:10])
    wd = (data.get("weekday") or "")[:1]
    edn = ED_NAME.get(data.get("edition"), meta.get("label", "").split(" ")[-1])
    return m, d, wd, edn


# ---------------------------------------------------------------- HTML
BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(W)dpx;height:%(H)dpx;overflow:hidden}
body{font-family:"Pretendard","Pretendard Variable","Noto Sans CJK KR","Noto Sans KR","Noto Color Emoji",sans-serif;
  background:#f4f5f7;color:#16181d;word-break:keep-all;overflow-wrap:anywhere;-webkit-font-smoothing:antialiased}
.page{width:%(W)dpx;height:%(H)dpx;display:flex;flex-direction:column}
.mast{background:#0b2a4a;color:#fff;display:flex;align-items:center;gap:calc(var(--u)*12px);box-shadow:0 2px 10px rgba(0,0,0,.12)}
.mark{flex:0 0 auto;border-radius:calc(var(--u)*11px);
  background:linear-gradient(180deg,#ef3340 0 16.6%%,#fff 16.6%% 33.3%%,#2d2a6e 33.3%% 66.6%%,#fff 66.6%% 83.3%%,#ef3340 83.3%%);
  box-shadow:0 0 0 calc(var(--u)*2px) rgba(255,255,255,.18),0 2px 6px rgba(0,0,0,.25)}
.btext{display:flex;flex-direction:column;line-height:1.2}
.btext strong{font-weight:800;letter-spacing:-.02em}
.btext small{opacity:.72}
.dl{margin-left:auto;text-align:right;line-height:1.25}
.dl .d{font-weight:600;opacity:.95;white-space:nowrap}
.dl .t{display:block;opacity:.7;font-weight:400}
.edtag{font-weight:800;color:#f5b700}
.subbar{background:#123a63}
.top-card{position:relative;overflow:hidden;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;
  box-shadow:0 1px 2px rgba(16,24,40,.05),0 4px 14px rgba(16,24,40,.06)}
.top-card .deco{position:absolute;right:-.06em;top:-.1em;line-height:1;opacity:.13;font-weight:900}
.top-card>*:not(.deco){position:relative}
.badges{display:flex;flex-wrap:wrap;gap:.45em;align-items:center}
.rank{font-weight:800;background:#f5b700;color:#3a2a00;border-radius:999px;line-height:1.4}
.chip{display:inline-flex;align-items:center;gap:.3em;font-weight:700;border-radius:999px;line-height:1.4;white-space:nowrap;background:rgba(255,255,255,.22);color:#fff}
.top-card h3{font-weight:800;letter-spacing:-.02em}
.top-card p{opacity:.9;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.top-card .meta{color:rgba(255,255,255,.78)} .top-card .meta b{color:#fff}
.briefing{background:linear-gradient(135deg,#fff 0%%,#fff7e6 100%%);border:1px solid #f3e2b8;
  box-shadow:0 1px 2px rgba(16,24,40,.05),0 4px 14px rgba(16,24,40,.06);display:flex;flex-direction:column;overflow:hidden}
.bhead{display:flex;align-items:center;gap:.6em}
.bbadge{background:#f5b700;color:#3a2a00;font-weight:800;border-radius:999px;white-space:nowrap}
.btitle{font-weight:700;color:#8a6d1f}
ul{list-style:none}
li+li{border-top:1px solid #f1e6c8}
li{display:flex;align-items:flex-start;gap:.5em}
.btx{flex:1;line-height:1.5;color:#3a3f4a}
.btx b{color:#16181d;font-weight:800;background:linear-gradient(transparent 62%%,rgba(245,183,0,.32) 0)}
.bchip{display:inline-flex;align-items:center;gap:.2em;font-weight:800;color:var(--tc);background:#fff;border:2px solid var(--tc);
  border-radius:999px;padding:0 .6em 0 .45em;margin-right:.45em;white-space:nowrap;line-height:1.55;vertical-align:.08em}
.go{color:#c9a64a;font-weight:700;line-height:1.2}
.foot{display:flex;align-items:center;justify-content:space-between;background:#0b2a4a;color:#fff}
.foot .url{font-weight:800;letter-spacing:-.01em}
.foot .url i{font-style:normal;opacity:.6;margin-right:.35em}
.foot .upd{opacity:.8;font-weight:600}
"""


def shade(hexc, f):
    n = int(hexc[1:], 16)
    r, g, b = n >> 16, (n >> 8) & 255, n & 255
    m = (lambda c: round(c * (1 + f))) if f < 0 else (lambda c: round(c + (255 - c) * f))
    return "rgb(%d,%d,%d)" % (m(r), m(g), m(b))


def top_bg(color):
    return "radial-gradient(120%% 90%% at 100%% 0%%,%s 0,%s 55%%,%s 100%%)" % (shade(color, .25), shade(color, -.25), shade(color, -.6))


def fmt_time(iso):
    m = re.match(r"\d{4}-(\d\d)-(\d\d)T(\d\d):(\d\d)", iso or "")
    return "%d월 %d일 %s:%s" % (int(m[1]), int(m[2]), m[3], m[4]) if m else ""


def badge_html(s, i, hl, tp):
    t = TOPICS[tp[s["id"]]["topic"]]
    rank = ("TOP %d" % (hl.index(s["id"]) + 1)) if s["id"] in hl else "이번 판 주목"
    out = '<span class="rank">%s</span><span class="chip">%s %s</span>' % (e(rank), t[1], e(t[0]))
    if s.get("region") and s["region"].strip() != t[0]:
        out += '<span class="chip">📍 %s</span>' % e(s["region"])
    return out


def brief_li(s, tp, show_go=True):
    t = TOPICS[tp[s["id"]]["topic"]]
    a, b = split_head(s["headline"])
    rest = (" " + e(b)) if b else ""
    return ('<li><span class="btx"><span class="bchip" style="--tc:%s"><span>%s</span>%s</span><b>%s</b><span class="rest">%s</span></span>%s</li>'
            % (t[2], t[1], e(t[0]), e(a), rest, '<span class="go">›</span>' if show_go else ""))


FIT_JS = """
async () => {
  await document.fonts.ready;
  const root = document.documentElement;
  const over = () => [...document.querySelectorAll('[data-fit]')].some(el => el.scrollHeight > el.clientHeight + 1);
  const shrink = () => { let k = 1; root.style.setProperty('--k', '1');
    while (over() && k > 0.72) { k -= 0.02; root.style.setProperty('--k', k.toFixed(2)); } return k; };
  let k = shrink();
  // 글자를 0.9 배 아래로 줄여야 들어가면 목록의 부가 설명(… 뒤)을 빼고 다시 맞춤
  if (k < 0.9 && document.querySelector('.rest')) {
    document.querySelectorAll('.rest').forEach(x => x.style.display = 'none'); k = shrink();
  }
  return {k, over: over()};
}
"""


def card_html(data, meta, chosen, tp):
    m, d, wd, edn = date_label(data, meta)
    hl = data.get("highlights") or []
    main, rest = chosen[0], chosen[1:]
    t = TOPICS[tp[main["id"]]["topic"]]
    a, b = split_head(main["headline"])
    css = BASE_CSS % {"W": 1080, "H": 1350} + """
:root{--u:2.4;--k:1}
.mast{padding:46px 56px 40px}
.mark{width:104px;height:104px}
.btext strong{font-size:56px}.btext small{font-size:29px;margin-top:8px}
.dl .d{font-size:36px}.dl .t{font-size:27px;margin-top:6px}
.subbar{height:14px}
.body{flex:1;display:flex;flex-direction:column;gap:30px;padding:36px 48px 34px;min-height:0}
.top-card{border-radius:36px;padding:44px 48px 40px;min-height:430px;flex:0 0 auto;font-size:30px}
.top-card .deco{font-size:430px}
.rank{font-size:28px;padding:5px 20px}.chip{font-size:28px;padding:5px 18px}
.top-card h3{font-size:calc(var(--k)*62px);line-height:1.3;margin:22px 0 16px}
.top-card p{font-size:calc(var(--k)*33px);line-height:1.45;-webkit-line-clamp:2;margin-bottom:18px}
.top-card .meta{font-size:26px}
.briefing{flex:1;min-height:0;border-radius:36px;padding:34px 40px 14px}
.bhead{margin-bottom:10px}
.bbadge{font-size:30px;padding:7px 22px}.btitle{font-size:30px}
ul{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:space-around}
li{padding:18px 0}
.btx{font-size:calc(var(--k)*39px)}
.btx .rest{font-size:.82em;color:#6b7280}
.bchip{font-size:calc(var(--k)*29px)}
.go{font-size:52px}
.foot{padding:30px 56px 34px}
.foot{gap:24px}.foot .url{font-size:31px}.foot .upd{font-size:26px;white-space:nowrap}
"""
    return """<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>%s</style></head><body><div class="page">
<header class="mast"><span class="mark"></span><span class="btext"><strong>태국 뉴스 한눈에</strong><small>파타야에서 읽는 오늘의 태국</small></span>
<span class="dl"><span class="d">%d월 %d일 %s요일</span><span class="t"><b class="edtag">%s</b> · 방콕 시간 기준</span></span></header>
<div class="subbar"></div>
<main class="body">
<article class="top-card" style="background:%s" data-fit><span class="deco">%s</span>
<div class="badges">%s</div><h3>%s</h3>%s<div class="meta"><b>%s</b> · %s</div></article>
<section class="briefing"><div class="bhead"><span class="bbadge">%s</span><span class="btitle">이번 판 주요 소식 %d건</span></div>
<ul data-fit>%s</ul></section>
</main>
<footer class="foot"><span class="url"><i>🔗</i>%s</span><span class="upd">%s</span></footer>
</div></body></html>""" % (
        css, m, d, e(wd), e(edn), top_bg(t[2]), DECO.get(tp[main["id"]]["topic"], ""), badge_html(main, 0, hl, tp),
        e(a), ("<p>%s</p>" % e(b)) if b else ("<p>%s</p>" % e((main.get("summary") or [""])[0])),
        e(main.get("source", "")), e(fmt_time(main.get("published"))),
        BRIEF_BADGE.get(data.get("edition"), "오늘의 브리핑"), len(rest), "".join(brief_li(s, tp) for s in rest),
        SHORT, UPDATE_LINE)


def og_html(data, meta, chosen, tp):
    m, d, wd, edn = date_label(data, meta)
    hl = data.get("highlights") or []
    main, rest = chosen[0], chosen[1:3]
    t = TOPICS[tp[main["id"]]["topic"]]
    a, _ = split_head(main["headline"])
    css = BASE_CSS % {"W": 1200, "H": 630} + """
:root{--u:1.9;--k:1}
.mast{padding:26px 44px 24px}
.mark{width:76px;height:76px}
.btext strong{font-size:44px}.btext small{font-size:22px;margin-top:5px}
.edbig{margin-left:auto;background:#f5b700;color:#3a2a00;font-weight:800;font-size:34px;padding:8px 26px;border-radius:999px;white-space:nowrap}
.subbar{height:8px}
.body{flex:1;display:grid;grid-template-columns:1.08fr 1fr;gap:24px;padding:26px 40px 22px;min-height:0}
.top-card{border-radius:26px;padding:28px 30px 26px;font-size:22px;min-height:0}
.top-card .deco{font-size:300px}
.rank{font-size:21px;padding:3px 14px}.chip{font-size:21px;padding:3px 13px}
.top-card h3{font-size:calc(var(--k)*44px);line-height:1.28;margin-top:14px}
.briefing{border-radius:26px;padding:22px 26px 8px;min-height:0}
.bbadge{font-size:22px;padding:4px 16px}.btitle{font-size:22px}
ul{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-around}
li{padding:10px 0}
.btx{font-size:calc(var(--k)*32px);line-height:1.42}
.bchip{font-size:calc(var(--k)*23px)}
.foot{padding:14px 44px 16px}
.foot .url{font-size:25px}.foot .upd{font-size:22px}
"""
    return """<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>%s</style></head><body><div class="page">
<header class="mast"><span class="mark"></span><span class="btext"><strong>태국 뉴스 한눈에</strong><small>파타야에서 읽는 오늘의 태국</small></span>
<span class="edbig">%d월 %d일(%s) %s</span></header><div class="subbar"></div>
<main class="body">
<article class="top-card" style="background:%s" data-fit><span class="deco">%s</span><div class="badges">%s</div><h3>%s</h3></article>
<section class="briefing"><div class="bhead"><span class="bbadge">%s</span><span class="btitle">한국어로 정리한 현지 소식</span></div>
<ul data-fit>%s</ul></section></main>
<footer class="foot"><span class="url"><i>🔗</i>%s</span><span class="upd">%s</span></footer>
</div></body></html>""" % (
        css, m, d, e(wd), e(edn), top_bg(t[2]), DECO.get(tp[main["id"]]["topic"], ""),
        badge_html(dict(main, region=None), 0, hl, tp), e(a),
        BRIEF_BADGE.get(data.get("edition"), "오늘의 브리핑"),
        "".join(brief_li(dict(s, headline=split_head(s["headline"])[0]), tp, False) for s in rest), SHORT, UPDATE_LINE)


async def render(jobs):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        kw = dict(args=["--no-sandbox"])
        if pathlib.Path("/usr/bin/google-chrome").exists():
            kw["executable_path"] = "/usr/bin/google-chrome"
        b = await p.chromium.launch(**kw)
        for html_path, png, w, h in jobs:
            pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
            await pg.goto(html_path.as_uri())
            res = await pg.evaluate(FIT_JS)
            await pg.screenshot(path=str(png), clip={"x": 0, "y": 0, "width": w, "height": h})
            print("saved %s (%dx%d, 글자 배율 %.2f%s)" % (png.relative_to(ROOT), w, h, res["k"], ", 넘침!" if res["over"] else ""))
            await pg.close()
        await b.close()


# ---------------------------------------------------------------- 메시지·정적 페이지
def message(data, meta, chosen, tp, ed_url, main_link=True):
    m, d, wd, edn = date_label(data, meta)
    lines = ["📰 태국 뉴스 한눈에 %d월 %d일(%s) %s이에요. 현지 보도를 한국어로 정리했어요." % (m, d, wd, edn)]
    for s in chosen[:3]:
        lines.append("%s %s" % (TOPICS[tp[s["id"]]["topic"]][1], split_head(s["headline"])[0]))
    lines.append("")
    lines.append("👉 이번 판 보기: " + ed_url)
    if main_link:
        lines.append("🏠 최신 뉴스(%s): %s" % (UPDATE_LINE.replace(" 업데이트", ""), SITE))
    return "\n".join(lines) + "\n"


def og_tags(title, desc, url, img):
    return "\n".join([
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="태국 뉴스 한눈에">',
        '<meta property="og:locale" content="ko_KR">',
        '<meta property="og:title" content="%s">' % e(title),
        '<meta property="og:description" content="%s">' % e(desc),
        '<meta property="og:url" content="%s">' % e(url),
        '<meta property="og:image" content="%s">' % e(img),
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="%s">' % e(title),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % e(title),
        '<meta name="twitter:description" content="%s">' % e(desc),
        '<meta name="twitter:image" content="%s">' % e(img),
    ])


def edition_page(data, meta, chosen, tp, ed_url, img):
    m, d, wd, edn = date_label(data, meta)
    eid = data["id"]
    title = "태국 뉴스 한눈에 — %d월 %d일(%s) %s" % (m, d, wd, edn)
    desc = " · ".join("%s %s" % (TOPICS[tp[s["id"]]["topic"]][1], split_head(s["headline"])[0]) for s in chosen[:3])
    if len(desc) > 110:
        desc = desc[:108].rstrip() + "…"
    target = "../../?ed=" + eid
    items = "".join("<li>%s %s</li>" % (TOPICS[tp[s["id"]]["topic"]][1], e(split_head(s["headline"])[0])) for s in chosen[:5])
    return """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
%(og)s
<meta name="theme-color" content="#0b2a4a">
<link rel="icon" type="image/png" sizes="32x32" href="../../assets/icons/favicon-32.png">
<!-- 판별 링크 미리보기용 정적 페이지(tools/share_kit.py 가 생성). 사람은 바로 판 화면으로 이동.
     meta refresh 는 일부 미리보기 수집기가 따라가 메인 페이지 태그를 읽을 수 있어 쓰지 않음(JS 이동 + 링크). -->
<script>location.replace(%(target_js)s + location.hash);</script>
<style>body{margin:0;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;background:#f4f5f7;color:#16181d}
header{background:#0b2a4a;color:#fff;padding:18px 20px;font-weight:800;font-size:20px}main{padding:20px;max-width:640px;margin:auto}
a.btn{display:inline-block;margin-top:14px;background:#f5b700;color:#3a2a00;font-weight:800;padding:10px 18px;border-radius:999px;text-decoration:none}
li{margin:6px 0}</style>
</head>
<body>
<header>태국 뉴스 한눈에</header>
<main><p><b>%(label)s</b></p><ul>%(items)s</ul><a class="btn" href="%(target)s">이번 판 열기 →</a></main>
</body>
</html>
""" % {"title": e(title), "desc": e(desc), "og": og_tags(title, desc, ed_url, img), "target_js": json.dumps(target),
       "target": e(target), "label": e(meta.get("label", eid)), "items": items}, title, desc


def ensure_gitignore():
    gi = ROOT / ".gitignore"
    txt = gi.read_text(encoding="utf-8") if gi.exists() else ""
    if not re.search(r"(?m)^/?share/?\s*$", txt):
        gi.write_text(txt.rstrip("\n") + "\n# 카카오톡 공유 키트 출력(tools/share_kit.py)\nshare/\n", encoding="utf-8")
        print(".gitignore 에 share/ 추가")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("edition", nargs="?", default="latest")
    ap.add_argument("--pick", default="")
    ap.add_argument("--n", type=int, default=5)
    ap.add_argument("--no-main-link", action="store_true")
    ap.add_argument("--no-publish", action="store_true")
    a = ap.parse_args()
    n = min(5, max(3, a.n))
    idx, meta, data = load(a.edition)
    eid = data["id"]
    tp = story_topics(data)
    chosen = pick(data, tp, n, [x.strip() for x in a.pick.split(",") if x.strip()] or None)
    ensure_gitignore()
    share = ROOT / "share"
    share.mkdir(exist_ok=True)
    ed_url = SITE + "e/%s/" % eid
    img_url = SITE + "og/%s.png" % eid

    ch, oh = share / (eid + "-card.html"), share / (eid + "-og.html")
    ch.write_text(card_html(data, meta, chosen, tp), encoding="utf-8")
    oh.write_text(og_html(data, meta, chosen, tp), encoding="utf-8")
    card_png, og_png = share / (eid + ".png"), share / (eid + "-og.png")
    asyncio.run(render([(ch, card_png, 1080, 1350), (oh, og_png, 1200, 630)]))

    msg = message(data, meta, chosen, tp, ed_url, not a.no_main_link)
    (share / (eid + ".txt")).write_text(msg, encoding="utf-8")

    page, title, desc = edition_page(data, meta, chosen, tp, ed_url, img_url)
    (share / (eid + "-og-tags.txt")).write_text(og_tags(title, desc, ed_url, img_url) + "\n", encoding="utf-8")
    if not a.no_publish:
        og = ROOT / "og"
        og.mkdir(exist_ok=True)
        shutil.copyfile(og_png, og / (eid + ".png"))
        print("saved og/%s.png" % eid)
        if eid == idx["latest"]:
            shutil.copyfile(og_png, og / "latest.png")
            print("saved og/latest.png")
        ep = ROOT / "e" / eid
        ep.mkdir(parents=True, exist_ok=True)
        (ep / "index.html").write_text(page, encoding="utf-8")
        print("saved e/%s/index.html" % eid)

    print("\n기사:", ", ".join("%s(%s)" % (s["id"], tp[s["id"]]["topic"]) for s in chosen))
    print("\n----- share/%s.txt (%d자) -----\n%s" % (eid, len(msg.rstrip("\n")), msg))


if __name__ == "__main__":
    main()
