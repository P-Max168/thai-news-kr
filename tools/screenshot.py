# -*- coding: utf-8 -*-
"""Playwright 스크린샷 + 기본 동작 점검(로컬 서버 먼저: python3 -m http.server 8765).
  python3 tools/screenshot.py [BASE_URL] [출력 폴더]
저장(screenshots/): mobile-390-onboarding.png, mobile-390-topics.png, mobile-390-topics-max.png,
  mobile-390-feed.png(새 브리핑), mobile-390-feed-full.png, mobile-390-article.png(👍👎), mobile-390-settings.png,
  mobile-390-tab-visa.png, mobile-390-trends.png, mobile-390-old-edition.png, desktop-1280.png, desktop-1280-top.png, desktop-topic.png
문제(오류·검사 실패)가 있으면 'FAIL:' 줄을 출력하고 exit 1."""
import asyncio, sys, json, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765/"
OUT = (sys.argv[2] if len(sys.argv) > 2 else str(ROOT / "screenshots")).rstrip("/") + "/"
LATEST = json.loads((ROOT / "data/index.json").read_text(encoding="utf-8"))["latest"]
fails = []


def check(cond, msg):
    print(("ok   " if cond else "FAIL: ") + msg)
    if not cond:
        fails.append(msg)


async def main():
    pathlib.Path(OUT).mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        kw = dict(args=["--no-sandbox"])
        if pathlib.Path("/usr/bin/google-chrome").exists():
            kw["executable_path"] = "/usr/bin/google-chrome"
        b = await p.chromium.launch(**kw)
        # ---------- 모바일 390: 첫 방문 ----------
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                  timezone_id="Asia/Bangkok", locale="ko-KR")
        m = await ctx.new_page()
        errs = []
        m.on("pageerror", lambda e: errs.append(str(e)))
        await m.goto(BASE, wait_until="networkidle")
        await m.evaluate("document.fonts.ready")
        await m.wait_for_timeout(500)
        check(await m.is_visible("#sheet"), "첫 방문: '어떤 분이세요?' 표시")
        check(await m.locator("[data-persona]").count() == 5, "페르소나 5개")
        await m.screenshot(path=OUT + "mobile-390-onboarding.png")
        await m.click('[data-persona="sriracha"]')
        await m.wait_for_timeout(300)
        pressed = await m.eval_on_selector_all('[data-pick][aria-pressed="true"]', "bs=>bs.map(b=>b.dataset.pick)")
        print("  시라차 거주자 기본 주제:", pressed)
        check(len(pressed) == 5 and "sriracha" in pressed, "페르소나 선택 → 주제 5개 미리 선택")
        await m.screenshot(path=OUT + "mobile-390-topics.png")
        # 3개 더(최대 8) + 9번째 시도 → 안내 문구
        rest = await m.eval_on_selector_all('[data-pick][aria-pressed="false"]', "bs=>bs.map(b=>b.dataset.pick)")
        for t in rest[:3]:
            await m.click('[data-pick="%s"]' % t)
        await m.click('[data-pick="%s"]' % rest[3])
        await m.wait_for_timeout(200)
        n_on = await m.locator('[data-pick][aria-pressed="true"]').count()
        msg = await m.inner_text("#pickMsg")
        check(n_on == 8 and "최대 8개" in msg, "최대 8개 제한 + 안내(%d개, '%s')" % (n_on, msg))
        await m.screenshot(path=OUT + "mobile-390-topics-max.png")
        # 하나 끄고(8→7) 저장
        await m.click('[data-pick="%s"]' % rest[2])
        await m.click("[data-save]")
        await m.wait_for_timeout(500)
        check(not await m.is_visible("#sheet"), "저장 후 시트 닫힘")
        prof = await m.evaluate("JSON.parse(localStorage.getItem('tnk.profile.v1'))")
        check(prof["onboarded"] and prof["persona"] == "sriracha" and len(prof["topics"]) == 7, "localStorage 저장: %s" % prof["topics"])
        tabs = await m.eval_on_selector_all("#tabs .tab", "ts=>ts.map(t=>t.dataset.tab)")
        print("  탭:", tabs)
        check(tabs[0] == "feed" and tabs[-1] == "all" and len(tabs) == 9, "탭 = 내 피드 + 선택 주제 7 + 전체 보기")
        check(await m.locator("#topGrid .top-card").count() == 3, "주요 뉴스 3건 항상 표시")
        bl = await m.locator("#briefing .brief-line").count()
        check(bl >= 3, "브리핑 글머리표 %d줄" % bl)
        await m.wait_for_timeout(2700)  # 토스트 사라질 때까지
        await m.screenshot(path=OUT + "mobile-390-feed.png")
        await m.screenshot(path=OUT + "mobile-390-feed-full.png", full_page=True)
        sw = await m.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        check(sw[0] <= sw[1], "가로 스크롤 없음 %s" % sw)
        # 내 피드 기사들이 선택 주제에 속하는지
        bad = await m.evaluate("""() => { const sel = JSON.parse(localStorage.getItem('tnk.profile.v1')).topics;
          const st = window.NEWS_DATA[window.TNApp.state.edition.id].stories;
          return [...document.querySelectorAll('#feed .card')].filter(c => { const s = st.find(x=>x.id===c.id);
            return !TNTopics.storyTopics(s).all.some(t=>sel.includes(t)); }).map(c=>c.id); }""")
        check(not bad, "내 피드 = 선택 주제 기사만 %s" % bad)
        # 브리핑 줄 탭 → 기사로 이동·펼침
        first_line = m.locator("#briefing button.brief-line").first
        if await first_line.count():
            target = await first_line.get_attribute("data-open")
            await first_line.click()
            await m.wait_for_timeout(700)
            check(await m.evaluate("id=>{const c=document.getElementById(id);return !!c&&c.classList.contains('is-open')}", target), "브리핑 줄 → 기사 %s 펼침" % target)
            await m.evaluate("window.scrollTo(0,0)")
            await m.click('#tabs [data-tab="feed"]')
            await m.wait_for_timeout(400)
        # ---------- 👍👎 재정렬 ----------
        order0 = await m.eval_on_selector_all("#feed .card", "cs=>cs.map(c=>c.id)")
        first, last = order0[0], order0[-1]
        await m.click('#%s [data-vote="-1"]' % first)
        await m.wait_for_timeout(400)
        order1 = await m.eval_on_selector_all("#feed .card", "cs=>cs.map(c=>c.id)")
        check(order1.index(first) > 0 and first in order1, "👎 기사 아래로(숨기지 않음): %s %d→%d" % (first, 0, order1.index(first)))
        await m.click('#%s [data-vote="1"]' % last)
        await m.wait_for_timeout(400)
        order2 = await m.eval_on_selector_all("#feed .card", "cs=>cs.map(c=>c.id)")
        check(order2.index(last) < len(order2) - 1, "👍 기사 위로: %s %d→%d" % (last, len(order1) - 1, order2.index(last)))
        print("  순서:", order0, "→", order2)
        w = await m.evaluate("Object.keys(JSON.parse(localStorage.getItem('tnk.profile.v1')).taste.w).length")
        check(w > 0, "취향 가중치 저장(%d개 특징)" % w)
        # 기사 펼친 카드(👍👎 보이게)
        await m.click("#%s .card__head" % last)
        await m.wait_for_timeout(300)
        await m.locator("#" + last).scroll_into_view_if_needed()
        await m.wait_for_timeout(2700)
        await (m.locator("#" + last)).screenshot(path=OUT + "mobile-390-article.png")
        # ---------- 설정(🧩 내 주제) ----------
        await m.evaluate("window.scrollTo(0,0)")
        await m.click("#myTopicsBtn")
        await m.wait_for_timeout(400)
        check(await m.is_visible("[data-reset-taste]"), "설정에 '내 취향 초기화'")
        await m.screenshot(path=OUT + "mobile-390-settings.png")
        m.once("dialog", lambda d: asyncio.ensure_future(d.accept()))
        await m.click("[data-reset-taste]")
        await m.wait_for_timeout(400)
        w = await m.evaluate("Object.keys(JSON.parse(localStorage.getItem('tnk.profile.v1')).taste.w).length")
        check(w == 0, "내 취향 초기화")
        await m.click("[data-close]")
        # 외국인·비자 탭
        if await m.locator('#tabs [data-tab="visa"]').count():
            await m.click('#tabs [data-tab="visa"]')
            await m.wait_for_timeout(500)
            await m.screenshot(path=OUT + "mobile-390-tab-visa.png")
        # 트렌드(모바일: 내 피드에서 주요 뉴스 아래)
        await m.click('#tabs [data-tab="feed"]')
        await m.wait_for_timeout(400)
        check(await m.evaluate("!!document.querySelector('.main-col #trendWidget')"), "모바일 트렌드 본문 안")
        await m.evaluate("(()=>{const w=document.getElementById('trendWidget');scrollTo(0,w.getBoundingClientRect().top+scrollY-document.querySelector('.masthead').offsetHeight-8)})()")
        await m.wait_for_timeout(300)
        await m.screenshot(path=OUT + "mobile-390-trends.png")
        # 옛 판(문단 브리핑·category) 렌더
        for ed in ["2026-09-29-early", "2026-10-01-pm"]:
            await m.goto(BASE + "?date=" + ed, wait_until="networkidle")
            await m.wait_for_timeout(500)
            info = await m.evaluate("({b:document.querySelectorAll('#briefing .brief-line').length, c:document.querySelectorAll('#feed .card').length, top:document.querySelectorAll('#topGrid .top-card').length, sel:document.getElementById('datepick').value})")
            check(info["b"] >= 2 and info["c"] > 0 and info["top"] == 3 and info["sel"] == ed, "옛 판 %s 렌더 %s" % (ed, info))
        await m.screenshot(path=OUT + "mobile-390-old-edition.png")
        await m.goto(BASE + "?date=2026-09-29", wait_until="networkidle")
        check(await m.eval_on_selector("#datepick", "s=>s.value") == "2026-09-29-pm", "옛 링크 ?date=2026-09-29 → 그날 최신 판(저녁판)")
        await m.goto(BASE + "?date=2026-09-29-am#p1", wait_until="networkidle")
        await m.wait_for_timeout(500)
        check(await m.evaluate("!!document.querySelector('#p1.is-open')"), "#기사 id 링크로 열기")
        check(not errs, "페이지 오류 없음 %s" % errs)
        await ctx.close()
        # ---------- 건너뛰기 ----------
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, timezone_id="Asia/Bangkok", locale="ko-KR")
        m = await ctx.new_page()
        await m.goto(BASE, wait_until="networkidle")
        await m.click("[data-skip]")
        await m.wait_for_timeout(300)
        tabs = await m.eval_on_selector_all("#tabs .tab", "ts=>ts.map(t=>t.dataset.tab)")
        check(len(tabs) == 12, "건너뛰기 → 모든 주제 탭(%d)" % len(tabs))
        await ctx.close()
        # ---------- 데스크톱 ----------
        ctx = await b.new_context(viewport={"width": 1280, "height": 900}, timezone_id="Asia/Bangkok", locale="ko-KR")
        await ctx.add_init_script("localStorage.setItem('tnk.profile.v1', JSON.stringify({v:1,onboarded:true,persona:'pattaya',topics:['pattaya','society','visa','life','weather'],taste:{w:{},votes:{}},ui:{installHint:'dismissed'},updatedAt:1}))")
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(BASE, wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=OUT + "desktop-1280-top.png")
        await pg.screenshot(path=OUT + "desktop-1280.png", full_page=True)
        await pg.click('#tabs [data-tab="pattaya"]')
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + "desktop-topic.png")
        await ctx.close()
        await b.close()
    print("screenshots:", OUT)
    if fails:
        print("FAIL 개수:", len(fails)); sys.exit(1)
    print("ALL OK")

asyncio.run(main())
