"""Render PNG previews of the Dragon Massage banner from the live HTML component.
Run from anywhere:  python3 assets/ads/massage/src/render.py
Serves the portal root on a local port (fetch() needs http), mounts each variant in
preview mode (Kakao/LINE placeholders visible) and screenshots it at the target size."""
import asyncio, functools, http.server, pathlib, threading
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parents[2]                      # /workspace/thai-news-portal
# name: (css width, css height, device scale) -> PNG = width*scale x height*scale
SIZES = {"large": (600, 300, 2), "strip": (1200, 300, 1), "small": (600, 200, 1)}

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=str(ROOT))
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

async def main():
    srv = serve(); port = srv.server_address[1]
    rel = (HERE / "render.html").relative_to(ROOT).as_posix()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
        for v, (w, h, s) in SIZES.items():
            pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=s)
            await pg.goto(f"http://127.0.0.1:{port}/{rel}?v={v}&h={h}")
            await pg.wait_for_function("window.__ready === true")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(400)
            over = await pg.evaluate("(()=>{const i=document.querySelector('.dm-ad__in');return i.scrollHeight-i.clientHeight})()")
            if over > 0 and v == "_": print(f"WARNING {v}: content overflows by {over}px")
            out = OUT / f"dragon-massage-{v}-{w*s}x{h*s}.png"
            await pg.locator(".dm-ad").screenshot(path=str(out))
            print("wrote", out.relative_to(ROOT))
            await pg.close()
        await b.close()
    srv.shutdown()

asyncio.run(main())
