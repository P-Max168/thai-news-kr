# -*- coding: utf-8 -*-
"""회귀 점검(REGRESSION_CHECKLIST.md 항목) — 라이브 사이트를 390px 휴대폰 화면으로 열어 핵심 기능을 하나씩 확인.
  python3 tools/dev/regress.py [URL] [--json out.json]
결과: 항목마다 '통과/실패/참고' 한 줄(한국어). 실패가 있으면 exit 1.
뉴스 정기 실행과 무관(개발 점검용). 첫 방문 시작 화면은 저장값을 미리 넣어 건너뜀(온보딩 자체는 따로 점검)."""
import asyncio, json, re, sys, time, pathlib
from playwright.async_api import async_playwright

URL = next((a for a in sys.argv[1:] if a.startswith("http")), "https://p-max168.github.io/thai-news-kr/")
OUT = sys.argv[sys.argv.index("--json") + 1] if "--json" in sys.argv else None
THAI = re.compile(r"[\u0E00-\u0E3E\u0E40-\u0E7F]")   # ฿(U+0E3F)는 허용
SEED = """(()=>{ if(!localStorage.getItem('tnk.profile.v1')) localStorage.setItem('tnk.profile.v1', JSON.stringify({v:1,onboarded:true,persona:'pattaya',topics:['east','visa','life','weather','society'],region:'east',interests:['life'],taste:{w:{},votes:{},vf:{}},ui:{installHintUntil:Date.now()+864e5},updatedAt:1,settingsAt:1})); })()"""
res = []
def rec(ok, name, detail=""):
    res.append({"ok": ok, "name": name, "detail": detail})
    print(("통과" if ok is True else "실패" if ok is False else "참고") + " · " + name + (" — " + str(detail) if detail != "" else ""), flush=True)

async def main():
    async with async_playwright() as p:
        kw = dict(args=["--no-sandbox"])
        if pathlib.Path("/usr/bin/google-chrome").exists(): kw["executable_path"] = "/usr/bin/google-chrome"
        b = await p.chromium.launch(**kw)
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                  timezone_id="Asia/Bangkok", locale="ko-KR")
        await ctx.add_init_script(SEED)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:160]))
        pg.on("console", lambda m: errs.append("console.error: " + m.text[:160]) if m.type == "error" else None)
        t0 = time.time()
        r = await pg.goto(URL + ("&" if "?" in URL else "?") + "_=" + str(int(t0)), wait_until="networkidle")
        await pg.wait_for_timeout(1200)
        rec(r and r.status == 200, "페이지 열림", "HTTP %s, %.1f초" % (r.status if r else None, time.time() - t0))
        # 헤더
        h = await pg.evaluate("""()=>{const t=document.getElementById('ticker'); const tiles=[...t.querySelectorAll('.tk-tile')].filter(e=>e.offsetParent!==null);
          return {menu: !!document.getElementById('menuBtn') && document.getElementById('menuBtn').offsetParent!==null, n: tiles.length, txt: tiles.map(e=>e.innerText.replace(/\\s+/g,' ')),
            over: document.documentElement.scrollWidth > innerWidth + 1, hearts: (document.getElementById('heartBtn')||{}).innerText||null}}""")
        txt = " | ".join(h["txt"])
        need = ["1바트", "원", "1달러", "฿", "USDT", "PM2.5", "금", "휘발유"]
        miss = [k for k in need if k not in txt]
        rec(h["menu"] and h["n"] == 4 and not miss and txt.count("조회") >= 4, "헤더 ☰ + 상자 4개(환율·USDT·날씨/PM2.5·금/휘발유, 조회 시각)", txt[:200] + ((" 빠짐:" + ",".join(miss)) if miss else ""))
        rec(not h["over"], "가로 넘침 없음(390px)")
        if h["hearts"] is not None: rec(True, "헤더 ❤️ 개수 표시", h["hearts"])
        # 한국 뉴스
        k = await pg.evaluate("[...document.querySelectorAll('#korea .korea__list > li:not(.k-ad)')].filter(l=>l.offsetParent!==null).length")
        rec(k >= 3, "🇰🇷 한국 주요 뉴스", "보이는 항목 %d" % k)
        # 브리핑 → 기사 열림
        n_brief = await pg.locator("#briefing .brief-line[data-open]").count()
        if n_brief:
            await pg.locator("#briefing .brief-line[data-open]").first.click(); await pg.wait_for_timeout(900)
            opened = await pg.locator(".card.is-open").count()
            rec(opened > 0, "브리핑 줄 누르면 기사 펼침", "브리핑 %d줄" % n_brief)
        else: rec(False, "브리핑 줄 누르면 기사 펼침", "브리핑 줄 없음")
        # 오늘의 질문·댓글
        dq = await pg.locator(".dq-line").count(); cm = await pg.locator("[data-cmts]").count()
        rec(dq > 0 and cm > 0, "💬 오늘의 질문·댓글 자리", "질문 %d · 댓글 칸 %d" % (dq, cm))
        if dq:
            await pg.locator(".dq-line").first.click(); await pg.wait_for_timeout(500)
            rec(await pg.locator(".talk.is-open").count() > 0, "오늘의 질문 펼치기")
        # 🙌/🙅
        up = pg.locator("#feed .card [data-vote='1']").first
        if await up.count():
            await up.click(); await pg.wait_for_timeout(400)
            toast = await pg.locator("#toast").inner_text()
            st = await pg.locator("#feed .card [data-vote='1'][aria-pressed='true']").count()
            rec(st > 0 and bool(toast.strip()), "🙌 더 보여줘 / 🙅 덜 보여줘", toast.strip()[:40])
            await pg.locator("#feed .card [data-vote='1'][aria-pressed='true']").first.click(); await pg.wait_for_timeout(300)   # 취소(원상복구)
        else: rec(False, "🙌 더 보여줘 / 🙅 덜 보여줘", "버튼 없음")
        # 광고
        ads = await pg.evaluate("""()=>[...document.querySelectorAll('[data-ad-slot]:not([hidden]), .ad-slot--feed')].filter(e=>e.offsetParent!==null||e.closest('#drawer')).map(e=>({id:e.getAttribute('data-ad-slot')||'infeed', dm: !!e.querySelector('.dm-ad'), img: !!e.querySelector('img, picture'), tag: !!e.querySelector('.dm-target') && /이 자리 추천 업종/.test(e.querySelector('.dm-target').textContent), tel: !!e.querySelector('a[href="tel:+66807365211"]')}))""")
        bad = [a["id"] for a in ads if not (a["dm"] and a["img"] and a["tag"])]
        rec(len(ads) >= 4 and not bad, "광고 자리 = 드래곤 배너 + 사진 + 📢 추천 업종", "%d자리, 문제: %s" % (len(ads), bad or "없음"))
        rec(any(a["tel"] for a in ads), "전화 링크 tel:+66807365211")
        # 태국 문자·원화
        await pg.goto(URL + ("&" if "?" in URL else "?") + "tab=all&_=" + str(int(time.time())), wait_until="networkidle"); await pg.wait_for_timeout(600)
        await pg.evaluate("document.querySelectorAll('#feed .card:not(.is-open) .card__head').forEach(b=>b.click())"); await pg.wait_for_timeout(400)
        th = await pg.evaluate("document.body.innerText")   # 모든 기사를 펼친 상태
        found = THAI.findall(th)
        rec(not found, "화면에 태국 문자 없음(메인, 기사 전부 펼침)", "".join(found[:20]))
        krw = await pg.evaluate(r"""()=>{const d=(window.NEWS_DATA||{})[(window.NEWS_INDEX||{}).latest]; if(!d) return null; let miss=[], n=0;
          const txt=d.stories.map(s=>[s.headline].concat(s.summary||[], s.for_me||'', s.context||'').join(' ')).join(' \n ');
          const re=/(\d[\d,.]*\s?(?:만|억)?\s?(?:바트|฿))/g; let m; while((m=re.exec(txt))){ n++; const after=txt.slice(m.index, m.index+m[0].length+30); if(!/원/.test(after.slice(m[0].length))) miss.push(after.slice(0,40)); }
          return {n, miss: miss.slice(0,5), nmiss: miss.length}}""")
        if krw: rec(krw["nmiss"] == 0 if krw["n"] else None, "바트 금액 옆 원화 병기(최신 판 기사)", "%d건 중 원화 없음 %d %s" % (krw["n"], krw["nmiss"], krw["miss"]))
        # 서랍 + 주제 11개
        await pg.click("#menuBtn"); await pg.wait_for_timeout(500)
        dr = await pg.evaluate("""()=>({open: document.getElementById('drawer').classList.contains('is-open'), items: [...document.querySelectorAll('#drawer button, #drawer a')].filter(e=>e.offsetParent!==null).length, txt: document.getElementById('drawer').innerText,
            topics: [...document.querySelectorAll('#drawer [data-tab]')].map(e=>e.dataset.tab)})""")
        rec(dr["open"] and dr["items"] >= 8, "☰ 서랍 열림·메뉴", "보이는 버튼 %d" % dr["items"])
        rec(not THAI.findall(dr["txt"]), "서랍에 태국 문자 없음")
        T = ["east", "bangkok", "north", "south", "poleco", "society", "visa", "life", "travel", "ent", "weather"]
        miss = [t for t in T if t not in dr["topics"]]
        rec(not miss, "주제 11개 서랍에 있음", "빠짐: %s" % miss if miss else "11개")
        fails = []
        for t in T:
            if not await pg.evaluate("document.getElementById('drawer').classList.contains('is-open')"):
                await pg.click("#menuBtn"); await pg.wait_for_timeout(350)
            await pg.locator('#drawer [data-tab="%s"]' % t).first.click(); await pg.wait_for_timeout(350)
            ok = await pg.evaluate("""(t)=>{const title=document.getElementById('feedTitleText').innerText; const cards=[...document.querySelectorAll('#feed .card')];
                return {title, n: cards.length, okc: cards.every(c=>{const s=(window.TNApp&&window.TNApp.state.data.stories||[]).find(x=>x.id===c.id); return !s || TNTopics.storyTopics(s).all.includes(t);})}}""", t)
            if not ok["okc"]: fails.append(t)
        rec(not fails, "주제 필터 11개 동작", "잘못 걸러진 주제: %s" % fails if fails else "11개 모두 해당 주제 기사만")
        await pg.goto(URL + "?tab=feed&_=" + str(int(time.time())), wait_until="networkidle"); await pg.wait_for_timeout(800)
        # 내 주변
        for cid in ["food", "massage", "pet", "beauty", "moto"]:
            await pg.evaluate("location.hash='#nearby/%s'" % cid); await pg.wait_for_timeout(700)
            nb = await pg.evaluate("""()=>{const p=document.querySelector('.nb-page:not([hidden]), #nbPage:not([hidden])')||document.querySelector('[class*=nb-page]'); if(!p) return null;
                return {subs: p.querySelectorAll('.nb-sub').length, go: !!p.querySelector('.nb-go'), dm: !!p.querySelector('.dm-ad'), img: !!p.querySelector('.dm-ad img'), tag: !!p.querySelector('.dm-target'), th: (p.innerText.match(/[\\u0E00-\\u0E3E\\u0E40-\\u0E7F]/g)||[]).length}}""")
            rec(bool(nb) and nb["subs"] >= 2 and nb["go"] and nb["dm"] and nb["img"] and nb["tag"] and nb["th"] == 0, "📍 내 주변 %s 화면(빠른 찾기·지도·광고)" % cid, nb)
            await pg.evaluate("history.back()"); await pg.wait_for_timeout(400)
        # PWA·공유
        pw = await pg.evaluate("""async()=>{let sw=false; try{sw=await Promise.race([navigator.serviceWorker.ready.then(r=>!!r.active), new Promise(r=>setTimeout(()=>r(false),8000))]);}catch(e){}
            let man=null; try{const r=await fetch(document.querySelector('link[rel=manifest]').href); const j=await r.json(); man={icons:j.icons.map(i=>i.sizes+'/'+(i.purpose||'any')), display:j.display, start:j.start_url};}catch(e){man=String(e)}
            const og=(document.querySelector('meta[property="og:image"]')||{}).content; let ogok=null; try{const r=await fetch(og,{method:'GET',cache:'no-store'}); ogok=r.ok+' '+r.headers.get('content-type');}catch(e){ogok='cors/err'}
            return {sw, man, og, ogok, install: !!(window.TNApp)}}""")
        rec(pw["sw"] is True, "서비스 워커(오프라인·앱)")
        rec(isinstance(pw["man"], dict) and any("512" in i for i in pw["man"]["icons"]) and pw["man"]["display"] == "standalone", "manifest(아이콘 192/512·standalone)", pw["man"])
        rec(None, "홈 화면 추가 안내(설치 프롬프트)", "헤드리스에서는 설치 이벤트가 안 와서 manifest·SW 조건으로 대신 확인")
        rec(bool(pw["og"]) and ("true" in str(pw["ogok"]) or pw["ogok"] == "cors/err"), "카톡 미리보기 이미지(og:image)", "%s %s" % (pw["og"], pw["ogok"]))
        known = [e for e in errs if "429" in e]   # Open-Meteo 날씨 API 요청 제한(같은 IP 에서 점검을 자주 돌릴 때) → 화면은 ticker.json 대체값
        real = [e for e in errs if "favicon" not in e and e not in known]
        rec(not real, "콘솔 오류 없음", real[:5])
        if known: rec(None, "날씨 API 429(요청 제한) — 대체값으로 표시", len(known))
        # 내 피드 구조 — 2단계 시작 화면 스위치(topics.js ONBOARDING_2STEP)가 켜졌을 때만: 칩 → 📌 → 내 지역 → 지역 광고 → 전국
        ob2 = await pg.evaluate("!!(window.TNTopics && TNTopics.ONBOARDING_2STEP)")
        if ob2:
            fs = await pg.evaluate("""()=>({chip:(document.querySelector('#feed .mine__chip')||{}).innerText||'', nat:!!document.querySelector('#feed .fsec--nat'),
              ad:!!document.querySelector('#feed .ad-slot--region .ad, #feed .ad-slot--region a, #feed .ad-slot--region img')})""")
            rec(fs["nat"] and fs["ad"], "내 피드: 칩·내 지역·지역 광고·전국 묶음(2단계 켜짐)", fs)
        else:
            fs = await pg.evaluate("({fsec:document.querySelectorAll('#feed .fsec').length, edit:document.querySelectorAll('[data-ob-edit]').length, cards:document.querySelectorAll('#feed .card').length})")
            rec(fs["fsec"] == 0 and fs["edit"] == 0 and fs["cards"] > 0, "내 피드 = 예전 방식(2단계 시작 화면 보류 중, 묶음·'내 피드 바꾸기' 없음)", fs)
        # ❤️ 하트: 카드 ♡ → ❤️ + 토스트, 헤더 '❤️ N' → 내가 하트한 기사 페이지
        hz = {}
        try:
            cid = await pg.eval_on_selector("#feed .card", "c=>c.id")
            n0 = int(re.sub(r"\D", "", await pg.inner_text("#heartBtn")) or 0)
            await pg.click("#%s [data-heart]" % cid); await pg.wait_for_timeout(300)
            hz["toast"] = "더 보여드릴게요" in await pg.inner_text("#toast")
            hz["n"] = int(re.sub(r"\D", "", await pg.inner_text("#heartBtn")) or 0) - n0
            await pg.click("#heartBtn"); await pg.wait_for_timeout(500)
            hz["rows"] = await pg.locator("#tnPage .hp-row").count()
            await pg.go_back(); await pg.wait_for_timeout(300)
            hz["closed"] = await pg.evaluate("!document.getElementById('tnPage') || document.getElementById('tnPage').hidden")
            await pg.click("#%s [data-heart]" % cid)   # 되돌려 놓기
        except Exception as e:
            hz["err"] = str(e)[:120]
        rec(hz.get("toast") and hz.get("n") == 1 and hz.get("rows", 0) >= 1 and hz.get("closed"), "❤️ 하트 → 헤더 개수·내가 하트한 기사 페이지·뒤로 가기", hz)
        # 📊 반응 통계: 운영자가 아니면 잠금 안내
        try:
            await pg.evaluate("TNPages.open('admin')"); await pg.wait_for_timeout(400)
            lock = "운영자만" in await pg.inner_text("#tnPageBody")
            await pg.evaluate("TNPages.close()"); await pg.wait_for_timeout(300)
        except Exception as e:
            lock = False
        rec(lock, "📊 반응 통계 페이지 — 운영자 아니면 잠금 안내")
        try:
            await pg.evaluate("TNPages.open('approve')"); await pg.wait_for_timeout(400)
            lock2 = "운영자만" in await pg.inner_text("#tnPageBody")
            await pg.evaluate("TNPages.close()"); await pg.wait_for_timeout(300)
            pj = await pg.evaluate("fetch('data/pending.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>d?d.items.length:-1)")
        except Exception as e:
            lock2, pj = False, str(e)[:80]
        rec(lock2 and isinstance(pj, int) and pj >= 0, "✅ 승인함 — 운영자 아니면 잠금 안내, 목록 파일(data/pending.json) 읽힘", "항목 %s건" % pj)
        # 애드센스 준비: 광고 칸 표준 단위·민감 기사 옆 광고 없음·안내 4쪽·ads.txt
        try:
            au = await pg.evaluate("""()=>{const f=[...document.querySelectorAll('#feed .ad-slot--feed')];
              const bad=f.filter(a=>[a.previousElementSibling,a.nextElementSibling].some(x=>x&&x.dataset&&x.dataset.adsafe==='0')).length;
              const shown=[...document.querySelectorAll('.ad-slot[data-ad-slot]:not([hidden])')];
              return {units:shown.filter(e=>e.dataset.unit).length, shown:shown.length, feedAds:f.length, nextToRisky:bad,
                      popups:document.querySelectorAll('ins.adsbygoogle,script[src*="adsbygoogle"]').length}}""")
        except Exception as e:
            au = {"err": str(e)[:80]}
        rec(au.get("shown", 0) > 0 and au.get("units") == au.get("shown") and au.get("nextToRisky") == 0 and au.get("popups") == 0,
            "광고 칸 — 모두 표준 단위(data-unit), 민감 기사 바로 옆 광고 없음, 애드센스 코드·자동 광고 없음", au)
        lg = {}
        for f in ["privacy.html", "terms.html", "about.html", "contact.html", "ads.txt"]:
            lg[f] = await pg.evaluate("f=>fetch(f,{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>t.length).catch(()=>-1)", f)
        links = await pg.locator(".footer__links a").count()
        rec(all(v > 100 for v in lg.values()) and links == 4, "안내 4쪽(개인정보·약관·소개·연락) + ads.txt 열림, 푸터 링크 4개", dict(lg, footerLinks=links))
        # ③d 내 주변: 화면 안 종류 바꾸기 5칸(같은 크기) + '이렇게 찾아요' 기준, 뒤로 = 피드
        try:
            await pg.evaluate("window.scrollTo(0,0)")
            await pg.click('#nearbyRow [data-nb-cat="food"]'); await pg.wait_for_timeout(600)
            await pg.click('[data-nb-sw="moto"]'); await pg.wait_for_timeout(500)
            sw = await pg.evaluate("({t:document.getElementById('nbTitle').textContent,h:location.hash,ws:[...new Set([...document.querySelectorAll('.nb-sw')].map(e=>Math.round(e.getBoundingClientRect().width)))].length,n:document.querySelectorAll('.nb-sw').length,how:!!document.querySelector('.nb-how summary')})")
            await pg.go_back(wait_until="commit"); await pg.wait_for_timeout(500)
            sw["back"] = await pg.evaluate("!document.querySelector('#nearbyPage:not([hidden])') && history.state === null")
        except Exception as e:
            sw = {"err": str(e)[:100]}
        rec(sw.get("h") == "#nearby/moto" and sw.get("n") == 5 and sw.get("ws") == 1 and sw.get("how") and sw.get("back"), "📍 내 주변 — 화면 안에서 종류 바꾸기(같은 크기 5칸)·'이렇게 찾아요'·뒤로 = 피드", sw)
        # ⑦ 가게 카드 시험(#places): 실제 OSM 데이터 30곳, 필터, 태국 문자 없음
        try:
            await pg.evaluate("TNPages.open('places')"); await pg.wait_for_timeout(1200)
            pc = {"n": await pg.locator("#tnPage .pc").count()}
            await pg.click('[data-pc-cat="pet"]'); await pg.wait_for_timeout(300); pc["pet"] = await pg.locator("#tnPage .pc").count()
            await pg.click('[data-pc-cat="all"]'); await pg.wait_for_timeout(300); pc["all"] = await pg.locator("#tnPage .pc").count()
            pc["thai"] = await pg.evaluate("/[\\u0E00-\\u0E7F]/.test(document.getElementById('tnPage').innerText)")
            pc["src"] = await pg.evaluate("document.getElementById('tnPage').innerText.indexOf('OpenStreetMap contributors')>=0")
            await pg.evaluate("TNPages.close()"); await pg.wait_for_timeout(400)
        except Exception as e:
            pc = {"err": str(e)[:100]}
        rec(pc.get("all") == 30 and 0 < pc.get("pet", 0) < 30 and pc.get("thai") is False and pc.get("src"), "📇 가게 카드 30곳 — 종류 필터·출처 표시·태국 문자 없음", pc)
        # 다듬기: 글자 대비(WCAG AA) — 첫 화면(주요 뉴스 사진 카드는 계산 불가라 뺌)
        try:
            await pg.evaluate("window.scrollTo(0,0)")
            low = await pg.evaluate(pathlib.Path(__file__).with_name("contrast.js").read_text(encoding="utf-8"))
        except Exception as e:
            low = [{"err": str(e)[:80]}]
        rec(not low, "글자 대비 4.5:1(큰 글자 3:1) 미달 없음 — 첫 화면", ("%d곳: " % len(low) + ", ".join("%s %s(%s)" % (x.get("cls"), x.get("t"), x.get("cr")) for x in low[:4])) if low else "")
        # 앱 포장 준비: 휴대폰 뒤로 버튼 = 서랍·설정 창·페이지·내 주변 닫기, 기록 칸 안 남음
        bk = {}
        try:
            async def stt():
                return await pg.evaluate("({dr:document.getElementById('drawer').classList.contains('is-open'),sh:!document.getElementById('sheet').hidden,pg:!!(window.TNPages&&TNPages.current()),nb:!!document.querySelector('#nearbyPage:not([hidden])'),hs:history.state})")
            async def gb():
                await pg.go_back(wait_until="commit"); await pg.wait_for_timeout(400)
            await pg.evaluate("window.scrollTo(0,0)")
            await pg.click("#menuBtn"); await pg.wait_for_timeout(400); await gb(); x = await stt(); bk["서랍"] = not x["dr"] and x["hs"] is None
            await pg.click("#menuBtn"); await pg.wait_for_timeout(400); await pg.click("#drawerQuick [data-page=hearts]"); await pg.wait_for_timeout(500); await gb(); x = await stt(); bk["서랍→하트"] = not x["pg"] and not x["dr"] and x["hs"] is None
            await pg.click("#menuBtn"); await pg.wait_for_timeout(400); await pg.click("#drawerQuick [data-quick-nearby]"); await pg.wait_for_timeout(600); await gb(); x = await stt(); bk["서랍→내 주변"] = not x["nb"] and x["hs"] is None
            await pg.click("#menuBtn"); await pg.wait_for_timeout(400); await pg.click("#drawer [data-open-settings]"); await pg.wait_for_timeout(500); await gb(); x = await stt(); bk["서랍→설정 창"] = not x["sh"] and x["hs"] is None
            await pg.click("#menuBtn"); await pg.wait_for_timeout(400); await pg.click("[data-drawer-close]"); await pg.wait_for_timeout(400); x = await stt(); bk["✕ 닫기 뒤 기록 칸"] = x["hs"] is None
        except Exception as e:
            bk["err"] = str(e)[:100]
        rec(bool(bk) and all(v is True for v in bk.values()), "휴대폰 뒤로 버튼 = 서랍·하트·내 주변·설정 창 닫기(피드에 남음, 기록 칸 안 남음)", bk)
        try:
            mf = await pg.evaluate("fetch('manifest.json',{cache:'no-store'}).then(r=>r.json()).then(d=>({icons:d.icons.map(i=>i.sizes+'/'+(i.purpose||'any')).join(' '),shortcuts:(d.shortcuts||[]).length}))")
            off = await pg.evaluate("fetch('offline.html',{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>t.indexOf('연결되어 있지 않아요')>0)")
        except Exception as e:
            mf, off = {"err": str(e)[:80]}, False
        rec(isinstance(mf, dict) and "512x512/maskable" in mf.get("icons", "") and "192x192/any" in mf.get("icons", "") and mf.get("shortcuts") == 2 and off,
            "앱 포장 준비 — manifest 아이콘(192·512·maskable)·바로가기 2개, 오프라인 안내 쪽", dict(mf, offline=off) if isinstance(mf, dict) else mf)
        # 다듬기: 없는 주소 = 한국어 404(라이브 GitHub Pages 만), 첫 화면 뼈대 자리
        if "github.io" in URL:
            try:
                r404 = await pg.evaluate("u=>fetch(u,{cache:'no-store'}).then(async r=>({st:r.status,ko:(await r.text()).indexOf('찾을 수 없어요')>0}))", URL + "no-such-page-" + str(int(time.time())))
            except Exception as e:
                r404 = {"err": str(e)[:80]}
            rec(r404.get("st") == 404 and r404.get("ko"), "없는 주소 = 한국어 404 쪽('페이지를 찾을 수 없어요' + 오늘의 뉴스 버튼)", r404)
        # 첫 방문 시작 화면(새 방문자): 보류 중엔 예전 '어떤 분이세요?'(페르소나 5개), 켜지면 2단계
        c2 = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, timezone_id="Asia/Bangkok", locale="ko-KR")
        p2 = await c2.new_page()
        await p2.goto(URL, wait_until="networkidle"); await p2.wait_for_timeout(800)
        ob = {"personas": await p2.locator("#sheet [data-persona]").count(), "regions": await p2.locator("#sheet [data-region]").count()}
        try:
            if ob["regions"]:
                await p2.click('[data-region="bangkok"]'); await p2.click("[data-ob-next]"); await p2.wait_for_timeout(300)
                await p2.click('[data-int="biz"]'); await p2.click("[data-ob-done]")
            else:
                await p2.click('[data-persona="pattaya"]'); await p2.wait_for_timeout(300); await p2.click("[data-save]")
            await p2.wait_for_timeout(600)
            ob["closed"] = not await p2.is_visible("#sheet")
            ob["cards"] = await p2.locator("#feed .card").count()
        except Exception as e:
            ob["err"] = str(e)[:120]
        ok_ob = ob.get("closed") and ob.get("cards", 0) > 0 and (ob["personas"] == 5 if not ob2 else ob["regions"] == 5)
        rec(ok_ob, "첫 방문 시작 화면(%s)" % ("2단계" if ob2 else "예전 '어떤 분이세요?' — 2단계는 보류"), ob)
        await c2.close()
        await b.close()
    if OUT: pathlib.Path(OUT).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    nf = sum(1 for x in res if x["ok"] is False)
    print("== 결과: 통과 %d · 실패 %d · 참고 %d" % (sum(1 for x in res if x["ok"] is True), nf, sum(1 for x in res if x["ok"] is None)))
    return 1 if nf else 0

sys.exit(asyncio.run(main()))
