바뀐 것: 모던 화면에서만 드래곤 스웨디시 배너를 흰 카드 톤으로 — 흰 바탕+옅은 테두리, 모서리 16px, 글자 진한 회색, 가게 이름 굵게+빨강 강조, 용 그림 그대로 선명하게, '광고' 회색 알약, 지도 = 사이트 파랑, 전화·카톡·라인 = 흰 바탕 테두리. 그림·카피·크기·자리·'광고' 표시 그대로, 클래식은 픽셀 그대로(dragon-ad.css 에 html.th-modern 규칙만 추가).
왜: 흰 모던 화면에서 어두운 빨강+금색 배너가 무겁고 옛날 느낌(Max 02:25 지시, 사진 교체는 승인함 #10 대기라 안 함).
되돌리는 법: git checkout backup-20261005-0237-dragon-modern-tone -- assets/ads/massage/dragon-ad.css && python3 tools/stamp_assets.py && 커밋 → push(force 금지)
