바뀐 것: 헤더 '빠른 정보' 4칸이 넘칠 때만 줄이기 단계를 하나씩 켬(assets/ticker.js fitMark + style.css 끝 .tk-fit1~5): 1 칸 여백 · 2 '1바트 =' 의 '=' 빼기 · 3 오늘 조회 시각은 날짜 빼고 시각만 · 4 날씨 칸 'PM2.5' 글씨·지역 이름 숨김 · 5 마지막 수단 2줄(2×2). 글자 크기는 안 줄임. 새 점검 도구 tools/dev/header_worst.py + regress 줄
왜: PM2.5 '매우 나쁨'에 가장 긴 값(두 자리 월/일·6자리 금값 등)이 겹치면 360px 에서 23px(모던)·31px(클래식) 넘쳐 옆으로 밀어야 했음(칸 폭이 글 길이대로만 정해지고 줄일 장치가 없었음)
되돌리는 법: `git checkout backup-20261005-0436-header-worst-fit -- assets/ticker.js assets/style.css tools/dev/regress.py` + `git rm tools/dev/header_worst.py` → stamp → 커밋 → push(force 금지)
