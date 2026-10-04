import time
from playwright.sync_api import sync_playwright
OUT="/workspace/tnk-dev/backups/backup-20261005-0329-server-save-on/"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    ctx=b.new_context(viewport={"width":360,"height":800},device_scale_factor=2)
    sent=[]
    ctx.route("https://firestore.googleapis.com/**", lambda r: (sent.append(r.request.url), r.abort()))
    pg=ctx.new_page(); pg.goto("https://p-max168.github.io/thai-news-kr/?_=%d"%time.time(),wait_until="load"); pg.wait_for_timeout(2500)
    btn=[e for e in pg.locator("[data-rep]").all() if e.is_visible()][0]
    btn.scroll_into_view_if_needed(); btn.click(); pg.wait_for_timeout(1500)
    pg.locator(".rep .rep__k[data-rep-k=etc]").click(); pg.locator(".rep .rep__m").fill("[테스트] 서버 실패 경로(요청 차단 — 서버에 안 감)")
    t=time.time(); pg.locator(".rep [data-rep-send]").click()
    pg.wait_for_function("()=>{var s=document.querySelector('.rep .rep__st');return s&&s.textContent&&!/보내는 중/.test(s.textContent)}",timeout=20000)
    print("%.1fs"%(time.time()-t), pg.locator(".rep .rep__st").inner_text()); print("mail:", pg.locator(".rep .rep__mail").count(), "blocked requests:", len(sent))
    pg.locator(".rep").first.screenshot(path=OUT+"live-report-fail-path-360.jpg",type="jpeg",quality=80)
    print("queue:", pg.evaluate("JSON.parse(localStorage.getItem('tnk.rep.q')||'[]').length"))
    b.close()
