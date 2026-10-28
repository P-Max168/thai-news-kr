# GPT lane (`ops/gpt/`)

Max 승인(2026-10-28): GPT가 내 검수 없이 올릴 수 있는 **유일한** 경로.
사이트 UI는 아직 이 폴더를 읽지 않는다(데이터만 쌓음). GitHub Pages가 repo 루트를
그대로 배포하므로 파일 URL은 공개된다 — 비밀·개인정보를 넣지 말 것.

## 브랜치 규칙
- 이름: `gpt/<task>-<YYYY-MM-DD>` (예: `gpt/tags-2026-10-28`, `gpt/newsletter-2026-10-28`)
- `claim/*`, `shadow/*` 는 쓰지 말 것(다른 용도).

## 허용 경로(이 밖은 자동 거절 → main 병합 안 함)
- `ops/gpt/tags/**` — 기사 태그·카테고리·관련 기사 id (JSON)
- `ops/gpt/newsletter/**` — 뉴스레터 **초안** 마크다운(발송·게시 금지)
- `ops/gpt/research/youtube/**` — 유튜브 리서치 메모 (마크다운 `YYYY-MM-DD_*.md`) — **thai-news-kr 전용** 홈(중복 방지)
- `ops/gpt/research/marketing/**` — 마케팅 리서치 메모 (마크다운 `YYYY-MM-DD_*.md`) — **thai-news-kr 전용** 홈
- `ops/gpt/README.md`, `ops/gpt/schema/**` — 스키마·설명(보통 GPT가 손대지 않음)

> zh / vn 저장소에는 `research/` 레인을 두지 않는다. 리서치는 kr 한곳에만.

## 태그 JSON
- 파일: `ops/gpt/tags/<YYYY-MM-DD>.json` (하루 1파일 권장)
- 스키마: `ops/gpt/schema/tags.schema.json`
- 검증: `python3 tools/gpt_lane_check.py --work . --base origin/main`

예시:
```json
{
  "date": "2026-10-28",
  "articles": [
    {
      "id": "2026-10-28-am-01",
      "tags": ["pattaya", "tourism"],
      "category": "local",
      "related": ["2026-10-27-pm-03"]
    }
  ]
}
```

## 뉴스레터 초안
- 파일: `ops/gpt/newsletter/<YYYY-MM-DD>.md`
- 제목·요약만. **독자에게 보내지 말 것.** 발송 채널은 Max가 따로 정함.


## 리서치 메모 (kr만)
- 유튜브: `ops/gpt/research/youtube/<YYYY-MM-DD>_<slug>.md`
- 마케팅: `ops/gpt/research/marketing/<YYYY-MM-DD>_<slug>.md`
- 예: `ops/gpt/research/youtube/2026-10-28_shorts-length.md`
- 사이트에 렌더하지 않음. 공개 URL로 열릴 수 있으니 비밀·개인정보 금지.

## 자동 병합 방식(보안)
- 워크플로 `.github/workflows/gpt-lane.yml` 은 **`schedule` + `workflow_dispatch` 만** 쓴다.
  이 두 트리거는 GitHub가 **항상 default branch(main)의 워크플로 파일**을 실행한다.
  (`push` 트리거를 쓰지 않음 — push면 브랜치에 실린 워크플로가 실행되어 약화될 수 있음.)
- 검사는 main에 있는 `tools/gpt_lane_check.py` 로 한다.
- 통과하면 해당 `gpt/*` 브랜치를 main에 merge(강제 push 없음). 경로/스키마 실패면 브랜치만 남기고 Actions **경고**(스케줄이 계속 빨갛게 되지 않게). merge 충돌만 job 실패.
- main 브랜치 보호/규칙셋은 **넣지 않음**(판 발행 파이프라인이 main에 직접 push).

## 되돌리기
- 설정 전 태그: `backup-20261028-gpt-lane-pre`
- 잘못 병합된 GPT 커밋: 일반 `git revert` (force 금지)
