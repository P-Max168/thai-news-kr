# backup-20261015-0824-design-g2 — G 2단계(시안 배치에 가깝게) 직전

- 바꾸기 전(9e9feb1): G 는 색·글꼴만, 배치는 모던과 같음. ▲▼ 없음. 404·안내·e/ 는 모던 모양.
- 바꾼 뒤(G 에서만, 클래식·모던 그대로): 헤더 데이터 3×2 표(PC 6칸 한 줄)·브리핑 01~06 숫자 목록·내 주변 칸 표·둥근 칩/버튼 → 작은 각·▲▼(실제 이전 값만: USDT 전일 종가 대비·금 공시 변동·휘발유 어제 대비·환율 직전 조회값 prev_*)·404/offline/안내 4쪽/e/ 에 assets/g-pages.css.
- tools/fetch_ticker.py: 환율 rate_time 이 바뀌면 이전 값을 prev_THB_KRW·prev_USD_THB 로 저장(workflow 안 건드림). 다음 korea.yml 실행부터 환율 ▲▼ 나옴.
- 되돌리기: `git checkout backup-20261015-0824-design-g2 -- index.html sw.js 404.html offline.html about.html contact.html privacy.html terms.html e/ assets/style.css assets/ticker.js assets/g.css tools/modern/g.src.css tools/fetch_ticker.py tools/share_kit.py tools/legal_pages.py && git rm assets/g-pages.css` → `python3 tools/stamp_assets.py` → 커밋 → push(force 금지)
