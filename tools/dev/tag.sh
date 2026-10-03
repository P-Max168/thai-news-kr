#!/usr/bin/env bash
# 백업 태그: 지금 origin/main 에 backup-YYYYMMDD-HHMM-<이름> 태그를 만들고 push(되돌리기용). 출력 = 태그 이름
set -euo pipefail
cd "$(dirname "$0")/../.."
git fetch -q origin main
T="backup-$(TZ=Asia/Bangkok date +%Y%m%d-%H%M)-$1"
git tag -a "$T" -m "백업: $1 변경 전 라이브 상태" origin/main
git push -q origin "$T"
echo "$T"
