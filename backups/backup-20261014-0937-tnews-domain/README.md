# backup-20261014-0937-tnews-domain
맞춤 도메인 tnews.pmaxone.com 연결 직전(10-14 09:37 BKK). 바뀌는 파일의 이전 사본 + `pages-before.json`(Pages 설정: cname null, https_enforced true).
되돌리기: `git rm CNAME` + `git checkout backup-20261014-0937-tnews-domain -- 404.html index.html firestore.rules tools/` → 커밋 → push(force 금지) → `gh api -X PUT repos/P-Max168/thai-news-kr/pages -F cname=` (빈 값) → Cloudflare DNS 에서 tnews CNAME 1개 삭제.
