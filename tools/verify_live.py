# -*- coding: utf-8 -*-
"""라이브(GitHub Pages) 페이지가 최신 판을 보여주는지 헤드리스 브라우저로 확인.

  python3 tools/verify_live.py [URL] [기대하는 판 id] [스크린샷 경로]
성공 시 exit 0, 실패 시 exit 1.
"""
import asyncio, sys, json, pathlib, time
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else "https://p-max168.github.io/thai-news-kr/"
WANT = sys.argv[2] if len(sys.argv) > 2 else json.loads((ROOT / "data/index.json").read_text(encoding="utf-8"))["latest"]
SHOT = sys.argv[3] if len(sys.argv) > 3 else str(ROOT / "screenshots/live-mobile-390.png")


async def main():
    async with async_playwright() as p:
        kw = dict(args=["--no-sandbox"])
        if pathlib.Path("/usr/bin/google-chrome").exists():
            kw["executable_path"] = "/usr/bin/google-chrome"
        b = await p.chromium.launch(**kw)
        pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True,
                              has_touch=True, timezone_id="Asia/Bangkok", locale="ko-KR")
        errors, failed = [], []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("requestfailed", lambda r: failed.append(r.url))
        pg.on("response", lambda r: failed.append("%s %s" % (r.status, r.url)) if r.status >= 400 else None)
        url = URL + ("&" if "?" in URL else "?") + "_=" + str(int(time.time()))  # CDN 캐시 회피
        resp = await pg.goto(url, wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(800)
        info = await pg.evaluate("""() => ({
          latest: (window.NEWS_INDEX||{}).latest,
          selected: (document.getElementById('datepick')||{}).value || null,
          hasData: !!(window.NEWS_DATA && window.NEWS_INDEX && window.NEWS_DATA[window.NEWS_INDEX.latest]),
          stories: document.querySelectorAll('#feed > *').length,
          dateline: (document.getElementById('dateline')||{}).innerText,
          fonts: Array.from(document.fonts).filter(f=>f.status=='loaded').map(f=>f.family).filter((v,i,a)=>a.indexOf(v)==i),
          sw: [document.documentElement.scrollWidth, window.innerWidth],
          visaTab: !!document.querySelector('button.tab[data-cat=visa]'),
          visaStories: ((window.NEWS_DATA||{})[(window.NEWS_INDEX||{}).latest]||{stories:[]}).stories.filter(s=>s.category==='visa').length,
          trendItems: document.querySelectorAll('#trendList li').length,
          trendKo: document.querySelectorAll('#trendList .tr-ko').length,
          trendTitle: (document.getElementById('trendTitle')||{}).innerText,
          trendInMain: !!document.querySelector('.main-col #trendWidget')
        })""")
        # 외국인·비자 탭 화면도 저장
        if info["visaTab"]:
            await pg.click("button.tab[data-cat=visa]")
            await pg.wait_for_timeout(500)
            info["visaCards"] = await pg.evaluate("document.querySelectorAll('#feed .card--visa').length")
            await pg.screenshot(path=SHOT.replace(".png", "-visa.png"))
        pathlib.Path(SHOT).parent.mkdir(parents=True, exist_ok=True)
        await pg.screenshot(path=SHOT)
        await pg.screenshot(path=SHOT.replace(".png", "-full.png"), full_page=True)
        await b.close()
    print("status:", resp.status if resp else None)
    print("info:", json.dumps(info, ensure_ascii=False))
    print("errors:", errors, "failed:", failed)
    print("screenshot:", SHOT)
    ok = (resp and resp.status == 200 and info["latest"] == WANT and info["hasData"] and info["stories"] > 0
          and (info["selected"] in (None, WANT)) and not errors
          and info["visaTab"] and info.get("visaCards", 0) == info["visaStories"]   # 외국인·비자 탭 렌더 확인
          and info["trendInMain"])                                                # 모바일에서 트렌드가 본문에 보임
    if info["trendItems"] and not info["trendKo"]:
        print("경고: 트렌드에 한국어 풀이가 없음(옛 형식 문자열 목록) — README '트렌드' 절차 확인")
    print("OK" if ok else "FAIL (want %s)" % WANT)
    return 0 if ok else 1

sys.exit(asyncio.run(main()))
