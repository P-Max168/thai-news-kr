# 디자인 테마 스위치 (2026-10-04 1단계 미리보기 → 2026-10-05 00:26 방콕 2단계: 모던이 기본)

> **되돌리기 한 줄:** `index.html` 의 `<script>window.TN_THEME="modern";</script>` 를 `<script>window.TN_THEME="classic";</script>` 로 바꾸고 배포하면 예전 디자인으로 돌아갑니다(태그 `backup-20261005-0018-modern-on`).

## 한 줄로 켜고 끄기
`index.html` 맨 위(head) 의 이 한 줄만 바꾸면 됩니다.

```html
<script>window.TN_THEME="classic";</script>   <!-- 지금 기본 디자인 -->
<script>window.TN_THEME="modern";</script>    <!-- 모던 디자인(전체 적용) -->
```

- **되돌리기 = 이 값을 `"classic"` 으로 바꾸고 배포(한 줄).** 다른 파일은 안 건드려도 됩니다(모던 파일이 있어도 classic 이면 받지도 않음).
- 비교: 주소 뒤에 `?theme=classic` → 같은 탭에서는 계속 예전 디자인. `?theme=modern` 이면 다시 모던.
  예: https://p-max168.github.io/thai-news-kr/?theme=classic · https://p-max168.github.io/thai-news-kr/?theme=classic#places
- 지금(2단계, 10-05 00:26 방콕부터)은 `"modern"` — 모든 방문자가 모던 디자인.
- 휴대폰 상단 색: index.html 기본값은 모던에 맞춤(`apple-mobile-web-app-status-bar-style` = `default` 진한 글자, `theme-color` = #ffffff). classic 일 때는 스위치 스크립트가 페이지를 열 때 `black-translucent`·#0b2a4a 로 바꿈. manifest.json(theme_color #ffffff, background_color #F2F4F6)은 실행 중 못 바꿔서 기본(모던)을 따름.
- 공유 카드·링크 미리보기 그림(tools/share_kit.py → share/<판>.png, og/<판>.png)도 모던 모양(2026-10-05 00:39~, 태그 `backup-20261005-0039-share-card-modern`): 흰 헤더·#F2F4F6 바탕·흰 카드(모서리 = 16px × 그림 배율 --u)·강조색 #1B64DA 하나·글자 #191F28/#4E5968/#5F6B7A·아이콘 #8B95A1, 주제 칩 글자만, 📍·🔗·› 는 assets/modern-icons.svg 선 아이콘. 스위치와 상관없음(그림이라 classic 으로 못 바꿈). 10-05 아침판 전에 올라간 og/ 그림은 예전 남색 그대로.
- 따로 떨어진 쪽(404.html·offline.html·안내 4쪽 tools/legal_pages.py·판 미리보기 tools/share_kit.py → e/<판>/)은 스위치와 상관없이 모던 모양(파일 안 CSS). 예전 모양이 필요하면 태그 `backup-20261005-0018-modern-on` 에서 그 파일들을 되돌림.

## 모던 테마 파일(따로 떨어진 층)
| 파일 | 하는 일 |
|---|---|
| `tools/modern/modern.src.css` → `assets/modern.css` | 모양(색·글꼴·카드·칩·광고 테두리). **원본은 modern.src.css**, `python3 tools/modern/build_css.py` 가 모든 규칙 앞에 `html.th-modern` 을 붙여 만듦 → 스위치가 켜졌을 때만 적용, 기존 CSS 뒤에서 덮어씀 |
| `assets/modern.js` | 화면 틀(메뉴·서랍·헤더 칸·버튼·제목·광고 버튼)의 이모지 → 선 아이콘. 주제·영향 칩은 아이콘 없이 글자만(📍지역·📅날짜만 작은 선 아이콘). 기사 본문·제목·댓글 글자는 안 건드림 |
| `assets/modern-icons.svg` | 선 아이콘 묶음(Lucide, ISC 라이선스) — `python3 tools/modern/build_icons.py <lucide-static/icons 폴더>` 로 만듦(이모지 → 아이콘 표도 이 파일 안) |
| `assets/fonts/pretendard/` | Pretendard Variable 자체 호스팅(동적 부분 글꼴 92조각, 화면에 쓰인 글자 조각만 받음, font-display:swap, SIL OFL 1.1 = LICENSE.txt). 모던일 때만 씀(classic 은 예전처럼 jsDelivr) |

- `tools/stamp_assets.py` 가 modern.css·modern.js·아이콘 묶음 ?v= 와 sw.js 목록을 자동으로 맞춤(ship.sh 가 실행).
- 글꼴은 예전과 같은 방식(처음 오신 분은 페이지가 다 뜬 뒤 받음, 한 번 받은 기기는 바로) → 첫 기사 카드 시간에 안 걸림.

## 모던 테마 기준(운영자 요청 10-04 23:39, 토스·당근 참고)
- 색: 배경 #F2F4F6 · 카드 #FFFFFF · 강조색 하나 #1B64DA(토스 계열 파랑, 고른 상태·주요 버튼·순위 배지에만 — 예시 #3182F6 은 흰 글자 대비 3.7:1 로 사이트 기준 4.5:1 미달이라 한 단계 진한 색) · 글자 #191F28(제목) / #4E5968(본문) / #5F6B7A(날짜·출처 같은 보조 — 회색 칸 위에서도 글자 대비 4.5:1, 예시 #8B95A1 은 3.0:1 이라 아이콘에만)
- 없앤 것: 진한 테두리·그라데이션(오늘의 주요 뉴스 진한 청록 카드·물결 장식 포함)·여러 색 칩·카드 왼쪽 색 줄·구분선(→ 간격으로)
- 글자 크기: 기존보다 작게 한 곳 없음(제목 몇 곳은 키움)
- 광고: 모양·크기·사진 그대로, 모서리·옅은 그림자·'광고' 표시 말투만 맞춤. 떠 있는 요소·팝업 없음
