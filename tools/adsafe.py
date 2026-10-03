#!/usr/bin/env python3
"""광고 정책 점검(애드센스 준비, 2026-10-03) — 판의 기사 중 광고를 옆에 두면 안 되는 민감한 기사 찾기.
사용: python3 tools/adsafe.py [판 id ...]   (없으면 최신 판)
- 화면(assets/app.js adRisk)과 같은 낱말 목록으로 제목·요약을 검사. 걸린 기사는 그대로 보이고, 기사 사이 광고만 그 앞뒤를 건너뜀.
- 판 데이터 기사에 "ad_safe": false/true 를 넣으면 낱말 검사보다 우선(편집자가 직접 정함).
- 함께 점검: 요약이 너무 길지 않은지(원문 통째 옮기기 방지 — 저작권), 원문 링크가 있는지.
끝 상태 0 = 문제 없음(민감 기사·긴 요약은 '참고'로만 알림), 1 = 원문 링크 없는 기사가 있음."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AD_RISK = re.compile(r"성매매|매춘|성폭행|성폭력|강간|성추행|성착취|음란|포르노|나체|알몸|마약|필로폰|메스암페타민|야바|코카인|헤로인|대마|살해|살인(?!적)|시신|사체|참수|토막|자살|극단적 선택|총격|도박|카지노|불법 ?촬영")
MAX_SUMMARY = 700   # 요약 글자 수(합) — 넘으면 '참고'로 알림(원문 통째 옮기기처럼 보이지 않게 줄일지 편집자가 판단). 지금까지 188개 기사 중앙값 322자

def check(ed):
    d = json.load(open(os.path.join(ROOT, "data", ed + ".json"), encoding="utf-8"))
    stories = d.get("stories") or d.get("articles") or []
    risky, fix, long_ = [], [], []
    for s in stories:
        text = " ".join([s.get("headline", "")] + list(s.get("summary") or []))
        m = AD_RISK.search(text)
        flag = s.get("ad_safe") is False or (s.get("ad_safe") is not True and m)
        if flag: risky.append((s.get("id"), (m.group(0) if m else "ad_safe:false"), s.get("headline", "")[:60]))
        n = len("".join(s.get("summary") or []))
        if n > MAX_SUMMARY: long_.append((s.get("id"), "요약 %d자(>%d) — 줄일지 검토" % (n, MAX_SUMMARY)))
        if not str(s.get("url") or "").startswith("http"):
            fix.append((s.get("id"), "원문 링크 없음"))
    print("[%s] 기사 %d개 · 광고 건너뜀(민감) %d개 · 고칠 것 %d개" % (ed, len(stories), len(risky), len(fix)))
    for i, w, h in risky: print("  참고 %-6s '%s' — %s" % (i, w, h))
    for i, w in long_: print("  참고 %-6s %s" % (i, w))
    for i, w in fix: print("  고칠 것 %-6s %s" % (i, w))
    return not fix

if __name__ == "__main__":
    eds = sys.argv[1:] or [json.load(open(os.path.join(ROOT, "data", "index.json"), encoding="utf-8"))["latest"]]
    ok = all([check(e) for e in eds])
    sys.exit(0 if ok else 1)
