바뀐 것: tools/dev/perf.py 에 '받은 양 쪼개기'(글꼴 제외 KB · 창 안에 들어온 글꼴 조각 회마다) 줄 추가 + 새 도구 tools/dev/perf_breakdown.py(요청별 종류·크기) + regress '받은 양 정상 범위 — 글꼴 제외 150~240KB' 줄. 사이트 코드·화면은 그대로.
왜: 클래식 받은 양 197KB(04:23)→241KB(05:19) — 원인 = 글꼴 조각(Pretendard, 화면 글자에 따라 받는 조각, 클래식은 jsdelivr)이 perf 창(load 뒤 2.5초) 끝에 걸렸다 안 걸렸다 함. 글꼴 제외는 5회 모두 199KB로 같음(코드 변화 아님).
되돌리는 법: `git checkout backup-20261005-0536-bytes-range -- tools/dev/perf.py tools/dev/regress.py` + `git rm tools/dev/perf_breakdown.py` → 커밋 → push(force 금지)
