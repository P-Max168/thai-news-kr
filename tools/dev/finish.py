# -*- coding: utf-8 -*-
"""개발 항목 마무리 기록: backups/<태그>/README.md(3줄) + BACKUPS.md 한 줄 + DEV_LOG.md 한 줄.
  python3 tools/dev/finish.py <태그> "<바뀐 것>" "<왜>" "<그 시점까지 들어간 것(백업 목록용)>" "<확인 여부: 완료(확인됨)… | 미확인…>"
사진 = backups/<태그>/*.jpg 를 자동으로 링크."""
import sys, pathlib, datetime, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
tag, what, why, upto, chk = sys.argv[1:6]
d = ROOT / "backups" / tag; d.mkdir(parents=True, exist_ok=True)
undo = "`git checkout %s -- .` → `git checkout origin/main -- data/` → 커밋 → push (force 금지, BACKUPS.md 맨 위 설명 참고)" % tag
(d / "README.md").write_text("- 바뀐 것: %s\n- 왜: %s\n- 되돌리는 법: %s\n" % (what, why, undo), encoding="utf-8")
pics = sorted(p.name for p in d.glob("*.jpg"))
links = " ".join("[%s](backups/%s/%s)" % (p.replace(".jpg", ""), tag, p) for p in pics) or "—"
now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
t_from_tag = "%s-%s %s:%s" % (tag[11:13], tag[13:15], tag[16:18], tag[18:20])
with open(ROOT / "BACKUPS.md", "a", encoding="utf-8") as f:
    f.write("| `%s` | %s | %s | %s | `git checkout %s -- .` 후 커밋 |\n" % (tag, t_from_tag, upto, links, tag))
with open(ROOT / "DEV_LOG.md", "a", encoding="utf-8") as f:
    f.write("- %s · %s · `%s` · %s\n" % (now.strftime("%H:%M"), what, tag, chk))
print("기록함:", tag, len(pics), "장")
