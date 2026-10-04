바뀐 것: 자동 점검(tools/dev/regress.py)에 '승인된 질문 기사는 모두 허용된 자리에 있음' 줄 추가 — 피드 카드 · 주요 뉴스 TOP 카드(highlights) · 내 주제 밖이면 주제 탭. TOP·주제 탭 기사는 눌러서 카드가 펼쳐지고 질문 줄이 보여야 통과. 사이트 코드·화면은 그대로.
왜: 10-03 저녁판 승인 20건 중 st1·vi2·wt1 이 피드 카드에 없었음 → 확인 결과 고장 아님: 이 3건 = 판의 highlights(주요 뉴스 TOP 1~3)라 피드에서 일부러 뺌('17건 (주요 뉴스 제외)'), TOP 카드를 누르면 주 주제 탭에서 카드가 펼쳐지고 질문 줄이 보임.
되돌리는 법: `git checkout backup-20261005-0527-approved-places -- tools/dev/regress.py` → 커밋 → push(force 금지)
