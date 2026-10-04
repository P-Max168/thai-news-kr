# 사용: python3 shoot.py BASEURL OUTDIR PREFIX [styles...]  — 각 스타일(?dragon=X)로 360px 화면에서 bar(top)·small(infeed)·large(mid)·strip(footer) 사진 + 넘침 측정
import sys, time, json
from playwright.sync_api import sync_playwright
BASE, OUT, PRE = sys.argv[1], sys.argv[2], sys.argv[3]
STY = sys.argv[4:] or ["A","B","C","D"]
W = int(__import__("os").environ.get("W","360")); THEME=__import__("os").environ.get("THEME","")
SEED="localStorage.setItem('tnk.profile.v1', JSON.stringify({v:1,onboarded:true,persona:'pattaya',topics:['east','visa','life','weather','society'],region:'east',interests:['life']}));localStorage.setItem('tnk.rxon','0');localStorage.setItem('tnk.repon','0')"
MEASURE="""()=>{const r=[];document.querySelectorAll('aside.dm-ad').forEach(a=>{const b=a.getBoundingClientRect(); if(!b.width) return;
 let over=0; a.querySelectorAll('*').forEach(e=>{const c=e.getBoundingClientRect(); if(!c.width) return; if(e.classList.contains('dm-ad__art')||e.classList.contains('dm-ad__cover')) return; if(c.right>b.right+0.5||c.left<b.left-0.5) over++;});
 const nm=a.querySelector('.dm-ad__name'); r.push({v:[...a.classList].find(c=>/^dm-ad--(bar|small|large|strip)$/.test(c)), s:a.getAttribute('data-dm-s')||'', w:Math.round(b.width), h:Math.round(b.height), sw:a.scrollWidth>a.clientWidth+1, over, nameCut: nm? nm.scrollWidth>nm.clientWidth+1:false, slot:(a.closest('[data-ad-slot]')||{}).getAttribute? a.closest('[data-ad-slot]')?.getAttribute('data-ad-slot'):''});});
 return {doc: document.documentElement.scrollWidth>innerWidth+1, ads:r};}"""
res={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for s in STY:
        ctx=b.new_context(viewport={"width":W,"height":800},device_scale_factor=2,is_mobile=True,has_touch=True,locale="ko-KR")
        ctx.add_init_script(SEED)
        ctx.route(__import__("re").compile(r"https://firestore\.googleapis\.com/.*"), lambda r: r.abort())
        pg=ctx.new_page()
        q="?dragon=%s"%s if s!="-" else "?"
        if THEME: q+="&theme="+THEME
        pg.goto(BASE+q+"&_=%d"%time.time(),wait_until="load"); pg.wait_for_timeout(3000)
        pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(1500); pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(500)
        m=pg.evaluate(MEASURE); res[s]=m
        for v in ["bar","small","large","strip"]:
            els=[e for e in pg.locator("aside.dm-ad.dm-ad--"+v).all() if e.is_visible() and (e.bounding_box() or {}).get("x",-1)>=0]
            if els:
                els[0].scroll_into_view_if_needed(); pg.wait_for_timeout(400)
                els[0].screenshot(path="%s/%s-%s-%s-%d.png"%(OUT,PRE,s,v,W))
        ctx.close()
    b.close()
json.dump(res,open("%s/%s-measure-%d.json"%(OUT,PRE,W),"w"),ensure_ascii=False,indent=1)
for s,m in res.items():
    bad=[a for a in m["ads"] if a["sw"] or a["over"] or a["nameCut"]]
    print(s,"doc-overflow",m["doc"],"ads",len(m["ads"]),"bad",bad[:3], "sizes",sorted({(a["v"],a["w"],a["h"]) for a in m["ads"]}))
