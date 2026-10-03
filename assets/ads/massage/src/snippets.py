"""Regenerate the static no-JS snippets banner-{large,strip,small,bar}.html from ad.json via dragon-ad.js.
Run:  python3 assets/ads/massage/src/snippets.py   (needs playwright + /usr/bin/google-chrome)"""
import asyncio, functools, http.server, pathlib, threading
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parents[2]
HEAD = """<!-- 드래곤 스웨디시 (Dragon Swedish) sponsored banner ({v}) — static, no-JS snippet generated from ad.json by dragon-ad.js
     (python3 assets/ads/massage/src/snippets.py). Paths are relative to the site root (index.html).
     The live site does NOT use these files: it renders data/ads.json slots with dragon-ad.js (item render:"dragon").
     Kakao/LINE buttons are omitted because kakao_url / line_url are empty in ad.json. -->
<link rel="stylesheet" href="assets/ads/massage/dragon-ad.css">
"""
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(ROOT)))
    threading.Thread(target=s.serve_forever, daemon=True).start(); return s
async def main():
    srv = serve(); port = srv.server_address[1]
    rel = (HERE / "render.html").relative_to(ROOT).as_posix()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
        pg = await b.new_page()
        await pg.goto(f"http://127.0.0.1:{port}/{rel}?v=large&preview=0")
        await pg.wait_for_function("window.__ready === true")
        for v in ("large", "strip", "small", "bar"):
            h = await pg.evaluate("""(v) => DragonAd.load().then(ad => DragonAd.html(ad, v, {base: 'assets/ads/massage/'}))""", v)
            (OUT / f"banner-{v}.html").write_text(HEAD.format(v=v) + h.replace("><", ">\n<") + "\n", encoding="utf-8")
            print("wrote", f"banner-{v}.html")
        await b.close()
    srv.shutdown()
asyncio.run(main())
