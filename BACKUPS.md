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
| `backup-20261003-1345-onboarding` | 10-03 13:45 | ③a 시작 화면 바꾸기 직전(페르소나 5개 '어떤 분이세요?' 온보딩, 내 피드 = 선택 주제만) | [after-home](backups/backup-20261003-1345-onboarding/after-home.jpg) [after-myfeed](backups/backup-20261003-1345-onboarding/after-myfeed.jpg) [after-onboarding](backups/backup-20261003-1345-onboarding/after-onboarding.jpg) [after-onboarding2](backups/backup-20261003-1345-onboarding/after-onboarding2.jpg) [after-regionad](backups/backup-20261003-1345-onboarding/after-regionad.jpg) [before-home](backups/backup-20261003-1345-onboarding/before-home.jpg) [before-onboarding](backups/backup-20261003-1345-onboarding/before-onboarding.jpg) | `git checkout backup-20261003-1345-onboarding -- .` 후 커밋 |
| `backup-20261003-1354-hearts` | 10-03 13:54 | ③b 하트 넣기 직전(2단계 시작 화면·내 피드 묶음까지) | [after-heart-card](backups/backup-20261003-1354-hearts/after-heart-card.jpg) [after-hearts-list](backups/backup-20261003-1354-hearts/after-hearts-list.jpg) [after-hearts](backups/backup-20261003-1354-hearts/after-hearts.jpg) [after-home](backups/backup-20261003-1354-hearts/after-home.jpg) [before-article](backups/backup-20261003-1354-hearts/before-article.jpg) [before-home](backups/backup-20261003-1354-hearts/before-home.jpg) | `git checkout backup-20261003-1354-hearts -- .` 후 커밋 |
| `backup-20261003-1403-rx-stats` | 10-03 14:03 | 반응 통계 1차 시작 시점 = 하트까지 + 2단계 시작 화면 **켜진** 상태(이 태그에선 작업 안 함 — 보류 지시로 멈추고 rx-stats2 에서 다시 시작) | [before-home](backups/backup-20261003-1403-rx-stats/before-home.jpg) [before-onboarding](backups/backup-20261003-1403-rx-stats/before-onboarding.jpg) | `git checkout backup-20261003-1403-rx-stats -- .` 후 커밋 (시작 화면이 다시 켜지니 주의) |
| `backup-20261003-1406-onboarding-hold` | 10-03 14:06 | 보류 직전(2단계 시작 화면 켜짐 + 하트) | [after-feed](backups/backup-20261003-1406-onboarding-hold/after-feed.jpg) [after-onboarding](backups/backup-20261003-1406-onboarding-hold/after-onboarding.jpg) [before-myfeed](backups/backup-20261003-1406-onboarding-hold/before-myfeed.jpg) [before-onboarding](backups/backup-20261003-1406-onboarding-hold/before-onboarding.jpg) | `git checkout backup-20261003-1406-onboarding-hold -- .` 후 커밋 |
| `backup-20261003-1412-rx-stats2` | 10-03 14:12 | ③c 반응 통계 넣기 직전(보류 처리 끝난 상태: 예전 시작 화면 + 하트) | [after-admin-empty](backups/backup-20261003-1412-rx-stats2/after-admin-empty.jpg) [after-admin-locked](backups/backup-20261003-1412-rx-stats2/after-admin-locked.jpg) [after-admin-no-permission](backups/backup-20261003-1412-rx-stats2/after-admin-no-permission.jpg) [after-admin-sample-2](backups/backup-20261003-1412-rx-stats2/after-admin-sample-2.jpg) [after-admin-sample](backups/backup-20261003-1412-rx-stats2/after-admin-sample.jpg) [before-drawer](backups/backup-20261003-1412-rx-stats2/before-drawer.jpg) | `git checkout backup-20261003-1412-rx-stats2 -- .` 후 커밋 |
| `backup-20261003-1416-nearby` | 10-03 14:16 | 반응 통계(1차)까지(이 태그에선 작업 안 함 — 순서 변경) | [before-nearby](backups/backup-20261003-1416-nearby/before-nearby.jpg) | `git checkout backup-20261003-1416-nearby -- .` 후 커밋 |
| `backup-20261003-1430-drawer-quick` | 10-03 14:30 | ☰ 바로가기 넣기 직전(반응 통계 마무리까지) | [after-drawer](backups/backup-20261003-1430-drawer-quick/after-drawer.jpg) [before-drawer](backups/backup-20261003-1430-drawer-quick/before-drawer.jpg) | `git checkout backup-20261003-1430-drawer-quick -- .` 후 커밋 |
