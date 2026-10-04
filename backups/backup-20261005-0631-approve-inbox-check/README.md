바뀐 것: 자동 점검에 '게시된 질문은 승인함 대기에 없음' 줄 추가(tools/dev/regress.py → 새 tools/dev/pending_check.py). 사이트 코드·화면·초안 파일은 그대로.
왜: 06:09 게시 59건 뒤 정본 초안 파일이 approved:false 라 승인함에 59건이 '대기'로 남는지 확인 → 재현 안 됨: 승인함은 data/pending.json(PENDING_APPROVAL.md 13건)만 읽고 초안 파일은 안 읽음(라이브 승인함 시험 화면 13건 · '오늘의 질문' 0). 앞으로 게시된 질문이 대기에 끼면 이 줄이 실패.
되돌리는 법: `git checkout backup-20261005-0631-approve-inbox-check -- tools/dev/regress.py` + `git rm tools/dev/pending_check.py` → 커밋 → push(force 금지)
