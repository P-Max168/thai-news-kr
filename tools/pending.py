# -*- coding: utf-8 -*-
"""관리자 승인함용 목록 만들기: PENDING_APPROVAL.md 표 → data/pending.json (+ data/pending.js)
  python3 tools/pending.py
- PENDING_APPROVAL.md 가 원본(사람이 읽는 곳). 사이트 #approve(운영자만)는 data/pending.json 을 읽어 보여 줄 뿐 — 자동 승인·자동 게시 없음.
- 저장소가 공개라 PENDING_APPROVAL.md 와 같은 내용만 넣는다(개인 정보·비밀번호 금지).
- 뉴스 정기 실행과 무관(판 데이터·index 를 건드리지 않음)."""
import json, pathlib, re, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent


def parse(md):
    items = []
    for line in md.splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 5 or not re.fullmatch(r"\d+", cells[0]):
            continue
        items.append({"id": "p" + cells[0], "no": int(cells[0]), "kind": cells[1], "body": cells[2], "where": cells[3], "status": cells[4]})
    return items


def main():
    md = (ROOT / "PENDING_APPROVAL.md").read_text(encoding="utf-8")
    items = parse(md)
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).strftime("%Y-%m-%dT%H:%M:%S+07:00")
    doc = {"_readme": "관리자 승인함(#approve) 목록 — tools/pending.py 가 PENDING_APPROVAL.md 에서 만듦. 승인은 민구님이 고르고 봇이 다음 실행에 반영(자동 승인 없음)",
           "updated_at": now, "items": items}
    js = json.dumps(doc, ensure_ascii=False, indent=1)
    old = (ROOT / "data/pending.json").read_text(encoding="utf-8") if (ROOT / "data/pending.json").exists() else ""
    if json.loads(old or "{}").get("items") == items:
        print("pending: 그대로 (%d건)" % len(items)); return
    (ROOT / "data/pending.json").write_text(js + "\n", encoding="utf-8")
    (ROOT / "data/pending.js").write_text("window.TN_PENDING = " + json.dumps(doc, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("pending: %d건 → data/pending.json" % len(items))


if __name__ == "__main__":
    main()
