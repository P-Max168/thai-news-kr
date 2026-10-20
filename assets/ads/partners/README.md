# Partner banners — 2026-10-20

Approved existing creatives: Lounge v4, Seven Pocha / Suwon / Dongwon / KT v3.
The user's 08:53 Bangkok instruction finalizes these designs with only the KT LINE QR addition and authorizes publication. At 08:03 the user confirmed advertising permission for all three businesses' photographs. Dongwon and KT retain their generated-image disclosure.

KT QR and full-banner link both encode `https://line.me/ti/p/x_k8FjS5cQ`. No friend request or message is sent by the site.

`data/ads.json.campaign` overrides selection for the preserved 16 legacy slots. Dragon 40; each partner 12. Main/static, Korea, infeed, regional, nearby and the existing hidden jobs preview share the same selector. Slots remain conditional; sensitive-news adjacency rules are unchanged. Selection is held for each page/placement; infeed identity follows edition/article. This is a long-run probability, not a per-screen quota.

Templates live in `creatives.json`; CSS is isolated in Shadow DOM. The original six embedded photographs/backgrounds were resized and encoded as WebP, totaling 730,352 bytes. Source and final byte hashes are in SOURCES.json. The renderer keeps existing DragonAd as a failure fallback.

## Measurement

`TNAds.snapshot()` exposes device-local selected/rendered/viewable/click counts. Viewable means >=50% intersects the viewport for one continuous foreground second, after images load. Logical placement keys prevent rerender duplicates. Seven days of aggregate counters stay in this browser's localStorage under `tnk.ad-diagnostics.v1`. No visitor/account identifier or tracking request is added. These counters are **not global traffic statistics**, and simultaneous tabs may race when updating localStorage. Actual serving failures can bias distribution toward the Dragon fallback. Do not claim the operational population already achieved 40/12 from a synthetic selection test.

## Validation

Node + Playwright, jsqr and pngjs: `node tools/dev/campaign_check.cjs` against a local HTTP server (default localhost:8765). `node tools/dev/campaign_resilience.cjs` additionally checks service-worker offline reading/partners, asset failure fallback and campaign/global disable. Optional `CHROMIUM_EXECUTABLE`, `CHROMIUM_ARGS_JSON`, `PLAYWRIGHT_MODULE` and `KT_SCREENSHOT` configure the test runtime; no production debug override is exposed.

Before release: 72 advertiser/variant/width cases at 320/390/1280; 12 rendered KT QR decodes; news cards, real local viewability event, redraw deduplication, nearby/jobs routes, no page errors. Global cumulative distribution remains unmeasured.

## Rollback

Set `campaign.enabled=false` in data/ads.json and regenerate only ads.js with `newslib.build_ads()` (tools on Python path). Original slots and DragonAd assets are retained. For a full rollback revert the campaign commit, preserving subsequent news/Korea/ticker changes. Do not reset main or replace the entire tree with an older one. After changes run `python3 tools/stamp_assets.py`, publish reviewed files only, verify live hashes and actual rendering. Partner assets are cached on demand; first-ever offline requests use Dragon fallback if unavailable.
