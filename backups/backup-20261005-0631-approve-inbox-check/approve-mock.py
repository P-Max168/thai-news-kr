import asyncio, json, time, sys
from playwright.async_api import async_playwright
OUT=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        c = await b.new_context(viewport={"width":360,"height":780}, device_scale_factor=2, is_mobile=True, locale="ko-KR")
        await c.add_init_script("""(()=>{ if(!localStorage.getItem('tnk.profile.v1')) localStorage.setItem('tnk.profile.v1', JSON.stringify({v:1,onboarded:true,persona:'pattaya',topics:['east','visa','life','weather','society'],region:'east',interests:['life']})); try{localStorage.setItem('tnk.rxon','0');localStorage.setItem('tnk.repon','0');localStorage.setItem('tnk.adclick','0')}catch(e){} })()""")
        w={"n":0}
        async def h(route):
            r=route.request
            if r.method in ("PATCH","DELETE","POST") and ("commit" in r.url or r.method!="POST"): w["n"]+=1; await route.abort()
            else: await route.continue_()
        await c.route("https://firestore.googleapis.com/**", h)
        pg = await c.new_page()
        await pg.goto("https://p-max168.github.io/thai-news-kr/?_=%d"%time.time(), wait_until="load"); await pg.wait_for_timeout(2500)
        # 테스트 전용: 이 헤드리스 창 안에서만 isAdmin 을 true 로(로그인·서버 권한 없음 — 승인함은 data/pending.json 을 읽어 그리기만 함)
        await pg.evaluate("()=>{window.TNSocial.isAdmin=()=>true; location.hash='#approve';}"); await pg.wait_for_timeout(3500)
        info = await pg.evaluate("()=>{const t=document.body.innerText; return {hasTitle:t.includes('관리자 승인함'), dq:(t.match(/오늘의 질문/g)||[]).length, items:(window.TN_PENDING||null)&&0, text:t.slice(t.indexOf('관리자 승인함'), t.indexOf('관리자 승인함')+400)}}")
        n = await pg.evaluate("()=>fetch('data/pending.json?_='+Date.now()).then(r=>r.json()).then(d=>d.items.length)")
        info["pending_json_items"]=n
        print(json.dumps(info, ensure_ascii=False)); print("writes", w["n"])
        await pg.screenshot(path=OUT, type="jpeg", quality=72)
        await b.close()
asyncio.run(main())
