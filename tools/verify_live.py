# -*- coding: utf-8 -*-
"""라이브(GitHub Pages) 페이지가 최신 판을 보여주는지 헤드리스 브라우저로 확인.

  python3 tools/verify_live.py [URL] [기대하는 판 id] [스크린샷 경로]
첫 방문 온보딩('어떤 분이세요?') → '파타야 거주자' 선택 → 내 피드·외국인·비자 탭·X 트렌드 제거·PWA(manifest·서비스 워커) 확인.
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
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True,
                                  has_touch=True, timezone_id="Asia/Bangkok", locale="ko-KR")
        pg = await ctx.new_page()
        errors, failed = [], []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("requestfailed", lambda r: failed.append(r.url))
        pg.on("response", lambda r: failed.append("%s %s" % (r.status, r.url)) if r.status >= 400 else None)
        url = URL + ("&" if "?" in URL else "?") + "_=" + str(int(time.time()))  # CDN 캐시 회피
        resp = await pg.goto(url, wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(800)
        onboarding = await pg.is_visible("#sheet [data-region]")   # 2단계 시작 화면(2026-10-03)
        pathlib.Path(SHOT).parent.mkdir(parents=True, exist_ok=True)
        if onboarding:
            await pg.screenshot(path=SHOT.replace(".png", "-onboarding.png"))
            await pg.click('[data-region="east"]')
            await pg.click("[data-ob-next]")
            await pg.wait_for_timeout(300)
            await pg.click('[data-int="life"]')
            await pg.click("[data-ob-done]")
            await pg.wait_for_timeout(600)
        info = await pg.evaluate("""async () => {
          const st = ((window.NEWS_DATA||{})[(window.NEWS_INDEX||{}).latest]||{stories:[]}).stories;
          let sw = null;
          try { sw = await Promise.race([navigator.serviceWorker.ready.then(r=>!!r.active), new Promise(r=>setTimeout(()=>r(false),8000))]); } catch(e) { sw = 'err '+e; }
          let man = null;
          try { const r = await fetch(document.querySelector('link[rel=manifest]').href); const j = await r.json(); man = {ok:r.ok, name:j.name, icons:j.icons.length, display:j.display}; } catch(e) { man = 'err '+e; }
          return {
          latest: (window.NEWS_INDEX||{}).latest,
          selected: (document.getElementById('datepick')||{}).value || null,
          hasData: !!(window.NEWS_DATA && window.NEWS_INDEX && window.NEWS_DATA[window.NEWS_INDEX.latest]),
          cards: document.querySelectorAll('#feed .card').length,
          top: document.querySelectorAll('#topGrid .top-card').length,
          briefLines: document.querySelectorAll('#briefing .brief-line').length,
          tabs: [...document.querySelectorAll('#tabs .tab')].map(t=>t.dataset.tab),
          votes: document.querySelectorAll('#feed .card [data-vote]').length,
          dateline: (document.getElementById('dateline')||{}).innerText,
          footer: (document.querySelector('.footer__about')||{}).innerText,
          robots: (document.querySelector('meta[name=robots]')||{}).content,
          scroll: [document.documentElement.scrollWidth, window.innerWidth],
          visaStories: st.filter(s=>TNTopics.storyTopics(s).all.includes('visa')).length,
          xtrendGone: !document.querySelector('#trendWidget,#trendBottom,#trendList,#trendMore,#trendNote'),
          loginBtn: !!document.querySelector('#acct [data-login], #acct [data-acct-menu]'),
          korea: document.querySelectorAll('#korea .korea__list li').length,
          koreaShown: [...document.querySelectorAll('#korea .korea__list li')].filter(l=>l.offsetParent!==null).length,
          koreaSrc: (document.getElementById('korea')||{getAttribute:()=>null}).getAttribute('data-korea-src'),
          koreaUpd: (document.querySelector('#korea .korea__upd')||{}).textContent || null,
          ads: document.querySelectorAll('[data-ad-slot]:not([hidden]) .ad, .ad-slot--feed .ad').length,
          sw: sw, manifest: man };
        }""")
        info["onboarding"] = onboarding
        await pg.screenshot(path=SHOT)
        await pg.screenshot(path=SHOT.replace(".png", "-full.png"), full_page=True)
        if "visa" in info["tabs"]:
            await pg.click("#menuBtn")                 # ☰ 서랍 메뉴
            await pg.wait_for_timeout(400)
            info["drawer"] = await pg.evaluate("document.getElementById('drawer').classList.contains('is-open')")
            info["drawerXtrendGone"] = await pg.evaluate("!/X\\s*트렌드|실시간 트렌드/.test(document.getElementById('drawer').innerText)")
            await pg.screenshot(path=SHOT.replace(".png", "-drawer.png"))
            await pg.click('#tabs [data-tab="visa"]')
            await pg.wait_for_timeout(500)
            info["visaCards"] = await pg.evaluate("document.querySelectorAll('#feed .card').length")
            await pg.screenshot(path=SHOT.replace(".png", "-visa.png"))
        await b.close()
    print("status:", resp.status if resp else None)
    print("info:", json.dumps(info, ensure_ascii=False))
    print("errors:", errors, "failed:", failed)
    print("screenshot:", SHOT)
    ok = (resp and resp.status == 200 and info["latest"] == WANT and info["hasData"] and info["cards"] > 0
          and info["top"] == 3 and info["briefLines"] > 0 and info["votes"] > 0
          and info["tabs"][:1] == ["feed"] and info["tabs"][-1:] == ["all"]
          and (info["selected"] in (None, WANT)) and not errors and info["onboarding"]
          and info.get("visaCards", 0) == info["visaStories"]          # 외국인·비자 탭 렌더 확인
          and info["xtrendGone"] and info.get("drawerXtrendGone") and info["loginBtn"] and info.get("drawer")
          and info["sw"] is True and isinstance(info["manifest"], dict) and info["manifest"]["ok"])
    print("OK" if ok else "FAIL (want %s)" % WANT)
    return 0 if ok else 1

sys.exit(asyncio.run(main()))
