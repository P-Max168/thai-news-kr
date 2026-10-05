# backup-20261005-0846-shop-trust — 가게 카드 믿음 규칙 + 조사봇 2차 검수 등급 넣기 직전 라이브(10-05 Max 06:33·06:55 지시, 사장님 06:26 '폐업한 곳이 너무 많다, 확인했다고 적어 놓고')
1. 이 태그 = 라이브에서 '실제로 확인한 가게 56곳'·'✅ 최종 확인(=지도 받은 날)'·오래된 정보 2023-01-01 고정·영업시간만 보고 '🟢 지금 영업 중'(Google 폐업 Chibing 포함)이던 때. 사진 before-live-*-360.jpg / 바꾼 뒤 after-*-360.jpg(가게 지운 것 0곳, 파타야 56→58 = 2곳 다시 넣음, Chibing 은 보관함).
2. 되돌리기(기록 안 지움): `cd /workspace/thai-news-portal && git pull --rebase --autostash && git revert --no-edit 76b1cf7^..2b6dba1 && bash tools/dev/ship.sh "되돌리기: 가게 카드 믿음 규칙"` (07:05~08:10 금지, force-push 금지).
3. firestore.rules 의 placeflags·'closed' 는 저장소에만 있고 게시 안 했으니 되돌릴 때 콘솔은 손대지 않아도 됨(게시했다면 콘솔 → 규칙 → 버전 기록에서 이전 버전).
