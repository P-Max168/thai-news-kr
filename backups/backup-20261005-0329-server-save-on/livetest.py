import json, time, re
from playwright.sync_api import sync_playwright
OUT="/workspace/tnk-dev/backups/backup-20261005-0329-server-save-on/"
U="https://p-max168.github.io/thai-news-kr/"
log=[]; ev=open(OUT+"live-test-log.txt","w")
def L(*a):
    s=" ".join(str(x) for x in a); print(s); ev.write(s+"\n"); ev.flush()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    ctx=b.new_context(viewport={"width":360,"height":800},device_scale_factor=2)
    reqs=[]
    def onreq(r):
        if "firestore.googleapis.com" in r.url and r.method=="POST":
            reqs.append({"url":r.url.split("?")[0],"body":r.post_data})
    def onresp(r):
        if "firestore.googleapis.com" in r.url and r.request.method=="POST":
            L("  firestore", r.request.method, r.url.split("?")[0].split("/documents")[-1], "→", r.status)
    ctx.on("request",onreq); ctx.on("response",onresp)
    pg=ctx.new_page()
    L("== A. RX 끈 상태(tnk.rxon=0)에서 반응 1개 → 이 기기 대기열", time.strftime("%H:%M:%S"))
    pg.goto(U+"?_=%d"%time.time(),wait_until="load"); pg.evaluate("localStorage.setItem('tnk.rxon','0')")
    pg.reload(wait_until="load"); pg.wait_for_timeout(2500)
    pg.evaluate("TNSocial.react('test',{id:'max-rules-0326',title:'시험',tags:[]},'h',1)")
    pg.wait_for_timeout(9000)
    q=pg.evaluate("localStorage.getItem('tnk.rxq')"); L("  대기열:", q, "· rx commit 요청 수:", sum(1 for r in reqs if "commit" in r["url"]))
    L("== B. RX 켠 상태(기본값 true)로 다시 열기 → 대기열 올라가는지", time.strftime("%H:%M:%S"))
    pg.evaluate("localStorage.removeItem('tnk.rxon')"); n0=len(reqs)
    pg.reload(wait_until="load")
    for i in range(40):
        pg.wait_for_timeout(1000)
        if pg.evaluate("localStorage.getItem('tnk.rx.last')"): break
    L("  tnk.rx.last:", pg.evaluate("localStorage.getItem('tnk.rx.last')"), "· 남은 대기열:", pg.evaluate("localStorage.getItem('tnk.rxq')"))
    for r in reqs[n0:]:
        if "commit" in r["url"]: L("  commit body:", (r["body"] or "")[:900])
    L("== C. 오류 신고 1건(메모 '[테스트] Max 규칙 게시 확인')", time.strftime("%H:%M:%S"))
    n1=len(reqs)
    btn=[e for e in pg.locator("[data-rep]").all() if e.is_visible()][0]
    L("  버튼:", btn.get_attribute("data-rep"), btn.get_attribute("data-rep-id"))
    btn.scroll_into_view_if_needed(); btn.click(); pg.wait_for_timeout(1500)
    pg.locator(".rep .rep__k[data-rep-k=etc]").click(); pg.locator(".rep .rep__m").fill("[테스트] Max 규칙 게시 확인")
    pg.locator(".rep [data-rep-send]").click()
    pg.wait_for_function("()=>{var s=document.querySelector('.rep .rep__st');return s&&s.textContent&&!/보내는 중/.test(s.textContent)}",timeout=20000)
    L("  화면:", pg.locator(".rep .rep__st").inner_text())
    rid=pg.locator(".rep").first.get_attribute("data-rep-doc"); L("  reports 문서 id:", rid)
    for r in reqs[n1:]:
        if "commit" in r["url"]: L("  commit body:", (r["body"] or "")[:900])
    pg.locator(".rep").first.screenshot(path=OUT+"live-report-saved-360.jpg",type="jpeg",quality=80)
    L("  이 기기 신고 목록(tnk.rep.q):", pg.evaluate("localStorage.getItem('tnk.rep.q')"))
    last=json.loads(pg.evaluate("localStorage.getItem('tnk.rx.last')") or "{}"); xid=(last.get("ids") or [""])[0]
    json.dump({"report_id":rid,"rx_id":xid},open("/tmp/srv/ids.json","w"))
    b.close()
