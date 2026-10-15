# backup-20261015-0811-design-g — G 그래파이트 테크 디자인 적용 직전

- 민구님 지시(10-15): 시안 G '그래파이트 테크'를 실제 사이트 기본 디자인으로.
- 바꾸기 전: 기본 = 모던(TN_THEME="modern"), 서랍 '화면 디자인' 칸 2개(클래식·모던).
- 바꾼 뒤: 기본 = G(TN_THEME="g" → html.th-modern.th-g, 모던 층 위에 assets/g.css 덮음), 서랍 칸 3개(그래파이트·클래식·모던).
- 구조·기능·데이터·DOM 그대로. 바뀐 파일: index.html, sw.js(VERSION), assets/g.css(새), tools/modern/g.src.css·build_g.py(새), assets/fonts/plexmono/(새, OFL), tools/stamp_assets.py, tools/dev/regress.py(디자인 고르기 칸 3).
- 확인: 로컬 regress 통과 57·실패 0, 콘솔 오류 0(외부 날씨 API 503 1회는 일시적).
- 미확인: 실제 휴대폰 진동(헤드리스는 진동 없음), iOS 사파리 흐림 효과.

## 되돌리기
`git checkout backup-20261015-0811-design-g -- index.html sw.js tools/stamp_assets.py tools/dev/regress.py` → `python3 tools/stamp_assets.py` → 커밋 → push(force 금지). 한 줄만: index.html 의 TN_THEME="g" → "modern".
