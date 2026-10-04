import time,sys
from playwright.sync_api import sync_playwright
U=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    ctx=b.new_context(viewport={"width":360,"height":800},is_mobile=True,has_touch=True,locale="ko-KR")
    ctx.add_init_script("localStorage.setItem('tnk.profile.v1', JSON.stringify({v:1,onboarded:true,persona:'pattaya',topics:['east','visa','life','weather','society'],region:'east',interests:['life']}));localStorage.setItem('tnk.rxon','0');localStorage.setItem('tnk.repon','0')")
    pg=ctx.new_page()
    for q in ["", "?dragon=rotate", "?dragon=rotate"]:
        pg.goto(U+q+("&" if q else "?")+"_=%d"%time.time(),wait_until="load"); pg.wait_for_timeout(2500)
        pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(1200)
        print(q or "(기본 mix)", pg.evaluate("DragonAd.style()"), pg.evaluate("""()=>[...document.querySelectorAll('aside.dm-ad')].map(a=>{const s=a.closest('[data-ad-slot],.ad-slot--feed,.ad-slot--region,.k-ad,#drawer'); return ((s&&(s.getAttribute('data-ad-slot')||s.className||s.id))||'?').slice(0,22)+'/'+[...a.classList].find(c=>/--(bar|small|large|strip)$/.test(c)).slice(8)+'='+(a.getAttribute('data-dm-s')||'-')})"""))
    pg.goto(U+"?_=%d#nearby/massage"%time.time(),wait_until="load"); pg.wait_for_timeout(3000)
    print("#nearby/massage", pg.evaluate("[...document.querySelectorAll('aside.dm-ad')].filter(a=>a.getBoundingClientRect().width>0).map(a=>a.getAttribute('data-dm-s'))"))
    b.close()
