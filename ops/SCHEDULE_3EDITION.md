# 하루 3판 규칙 (2026-10-27 맥스님)

운영 중·앞으로 추가하는 뉴스 채널 공통:

- 슬롯: `am`(아침) · `md`(점심) · `pm`(저녁)
- 속보: 판과 별도, 한 건씩(설계: ops-handoff/prompts/2026-10-27_breaking_news_plan.md)
- Gemini: 재시도 ~15분, picks>15 청크, 실패는 `ops/gemini-usage.jsonl` + `ops/edition-fail.json`
- 판 공백: `ops/edition-gap.json`, `ops/LATEST_GAP.md`, `ops/edition-gap.jsonl`

되돌리기: 이 커밋 이전으로 site·workflow·gemini_edition.py 를 되돌리면 됨(force push 없음).
