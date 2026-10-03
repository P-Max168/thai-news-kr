# 백업 목록 (되돌리기 지점)

사진을 보고 마음에 드는 시점을 고르면 그때로 되돌릴 수 있어요. 각 줄 = **태그 · 시간(방콕) · 그 시점까지 들어간 것 · 사진 · 되돌리는 법**.
태그는 "그 변경을 하기 **직전**" 라이브 상태예요. (예: `…-speed` = 속도 개선 직전)

## 되돌리는 법 (기록을 지우지 않는 안전한 방법)
```bash
cd /workspace/tnk-dev && git pull --rebase --autostash
git checkout <태그> -- .            # 그 시점 파일로 작업 폴더를 바꿈(기록은 그대로)
git checkout origin/main -- data/   # 뉴스 판·한국 뉴스·시세는 최신 그대로 두기(권장)
git commit -m "되돌리기: <태그> 시점 화면으로" && git push   # force-push 금지
```
- 한 가지 변경만 빼고 싶으면 그 변경 커밋을 `git revert <커밋>` 으로 되돌려도 됩니다.
- 사진은 `backups/<태그>/` 폴더(before = 바꾸기 전, after = 바꾼 뒤).

| 태그 | 시간(BKK) | 그 시점까지 들어간 것 | 사진 | 되돌리는 법 |
|---|---|---|---|---|
| `backup-20261003-1316-start` | 10-03 13:16 | 야간 개발 시작 전 라이브 그대로(헤더 v5, 주제 11개, 내 주변 5개, 드래곤 배너) | (speed 폴더 before 사진과 같음) [보기](backups/backup-20261003-1322-speed/before-home.jpg) | `git checkout backup-20261003-1316-start -- .` 후 커밋 |
| `backup-20261003-1322-speed` | 10-03 13:22 | ① 속도 개선 **직전**(= 시작 상태와 같음). 이 뒤 커밋에서 첫 기사 카드 4.0초 → 2.1초 | [after-home](backups/backup-20261003-1322-speed/after-home.jpg) [before-home](backups/backup-20261003-1322-speed/before-home.jpg) | `git checkout backup-20261003-1322-speed -- .` 후 커밋 |
| `backup-20261003-1336-no-thai` | 10-03 13:36 | 태국 문자 숨김 **직전**(속도 개선까지 들어감) | [after-article](backups/backup-20261003-1336-no-thai/after-article.jpg) [before-article](backups/backup-20261003-1336-no-thai/before-article.jpg) | `git checkout backup-20261003-1336-no-thai -- .` 후 커밋 |
| `backup-20261003-1340-design` | 10-03 13:40 | 디자인 다듬기 v1 **직전**(속도·태국 문자 숨김까지) | [after-feed](backups/backup-20261003-1340-design/after-feed.jpg) [after-nearby](backups/backup-20261003-1340-design/after-nearby.jpg) [before-article](backups/backup-20261003-1340-design/before-article.jpg) [before-feed](backups/backup-20261003-1340-design/before-feed.jpg) [before-nearby](backups/backup-20261003-1340-design/before-nearby.jpg) | `git checkout backup-20261003-1340-design -- .` 후 커밋 |
