# -*- coding: utf-8 -*-
"""공용 도우미: 판(edition) 데이터 검증·저장 + data/index 재생성.

파일 이름 규칙 (data/ 폴더)
  <YYYY-MM-DD>-am   아침판 (매일 07:08 정기 실행)
  <YYYY-MM-DD>-pm   저녁판 (매일 18:08 정기 실행)
  <YYYY-MM-DD>-early 새벽판 (정기 외 임시판. 2026-09-29-early 한 건만 존재)
날짜만 있는 파일(<YYYY-MM-DD>.json)은 더 이상 만들지 않는다.

기사 형식(2026-10-03 아침판부터 = 새 형식, README '기사 스키마')
  topic      : 주 주제 1개 (TOPICS 의 id: pattaya sriracha bangkok poleco society visa life travel ent weather)
  secondary  : 보조 주제 0~3개 (예: 파타야 침수 기사 = topic "pattaya", secondary ["weather"])
  tags       : 키워드 태그 2~6개(👍👎 취향 학습에 씀) — 반드시 넣는다
  briefing   : [{topic, text("**굵게**" 표시 1곳 이상), story_id}] 5~6줄
옛 형식(category 6종 + 문단 briefing)도 검증을 통과한다(화면은 assets/topics.js 매핑으로 렌더).
"""
import json, re, pathlib, sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
EDITION_LABEL = {"am": "아침판", "pm": "저녁판", "early": "새벽판"}
EDITION_ORDER = {"early": 0, "am": 1, "pm": 2}
ID_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-(am|pm|early)$")
CATS = {"politics", "economy", "society", "local", "visa", "sns"}          # 옛 형식(10월 2일 저녁판까지)
CAT_ORDER = ["politics", "economy", "society", "local", "visa", "sns"]
# 새 형식 주제 10개 (assets/topics.js 와 같은 id·순서)
TOPICS = {
    "pattaya": "파타야(좀티엔·방라뭉·싸따힙·나끌루아)", "sriracha": "시라차(램차방·촌부리 시내·아마타)",
    "bangkok": "방콕", "poleco": "정치·경제", "society": "사회·사건사고", "visa": "외국인·비자",
    "life": "생활·물가·부동산", "travel": "여행·맛집", "ent": "연예·스포츠·SNS", "weather": "날씨·교통",
}
TOPIC_ORDER = list(TOPICS)
# 판마다 맞추려는 구성(경고만 — 실제 뉴스가 없으면 적게 싣는다. 절대 지어내지 않는다)
TARGETS = dict(stories=(20, 25), visa=(2, 4), places=("pattaya", "sriracha", "bangkok"), want=("travel", "life"))
B = lambda topic, text, story_id: dict(topic=topic, text=text, story_id=story_id)   # 브리핑 한 줄
BLOCKLIST = ROOT / "tools" / "trend_blocklist.txt"
_BL = None


def _blocklist():
    """tools/trend_blocklist.txt → [(원문 줄, 컴파일된 정규식)]."""
    global _BL
    if _BL is None:
        _BL = []
        for line in BLOCKLIST.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            pat = line[3:] if line.startswith("re:") else re.escape(line)
            _BL.append((line, re.compile(pat, re.I)))
    return _BL


def blocked(text):
    """성인·선정적 키워드가 있으면 걸린 항목(문자열), 없으면 None."""
    for raw, rx in _blocklist():
        if rx.search(text or ""):
            return raw
    return None


def KR(headline, source, url, published=None, badge=None):
    """korea_top 한 줄: KR("제목", "연합뉴스", "https://…", "2026-10-03T06:10:00+07:00")"""
    d = dict(headline=headline, source=source, url=url)
    if published: d["published"] = published
    if badge: d["badge"] = badge
    return d


def label_for(date, edition):
    m, d = int(date[5:7]), int(date[8:10])
    return "%d월 %d일 %s" % (m, d, EDITION_LABEL[edition])


def validate(data):
    """사람이 실수하기 쉬운 부분만 점검. 문제 있으면 예외."""
    eid = data["id"]
    m = ID_RE.match(eid)
    assert m, "id 형식 오류: %s (YYYY-MM-DD-am|pm|early)" % eid
    assert data["date"] == m.group(1) and data["edition"] == m.group(2), "id/date/edition 불일치"
    ids = [s["id"] for s in data["stories"]]
    assert len(ids) == len(set(ids)), "기사 id 중복"
    new = is_new_format(data)
    for s in data["stories"]:
        if new:
            assert s.get("topic") in TOPICS, (s["id"], "topic 은 %s 중 하나" % "/".join(TOPICS), s.get("topic"))
            sec = s.get("secondary", [])
            assert isinstance(sec, list) and len(sec) <= 3, (s["id"], "secondary 는 0~3개 목록")
            for t in sec:
                assert t in TOPICS and t != s["topic"], (s["id"], "secondary 오류", t)
            tags = s.get("tags") or []
            assert isinstance(tags, list) and 2 <= len(tags) <= 8 and all(isinstance(t, str) and t.strip() and not t.startswith("#") for t in tags), \
                (s["id"], "tags(키워드) 2~8개 필수, '#' 없이")
            if "category" in s:
                assert s["category"] in CATS, (s["id"], s["category"])
        else:
            assert s["category"] in CATS, (s["id"], s["category"])
        for k in ("headline", "summary", "source", "url", "title_th", "published"):
            assert s.get(k), (s["id"], "필수 필드 없음: " + k)
        assert s["url"].startswith("http"), (s["id"], s["url"])
        assert s["published"].endswith("+07:00"), (s["id"], "published 는 +07:00(방콕) ISO")
        datetime.fromisoformat(s["published"])
        for r in s.get("related", []):
            assert r["url"].startswith("http"), (s["id"], r)
    for s in data["stories"]:
        # 성인·선정적 기사 금지(트렌드와 같은 차단 목록). 이미지·영상은 아예 싣지 않는다.
        txt = " ".join([s["headline"], s["title_th"], " ".join(s.get("tags", [])), " ".join(s["summary"])])
        hit = blocked(txt)
        assert not hit, (s["id"], "성인·선정적 키워드(%s) — 기사를 빼거나 표현 확인 (tools/trend_blocklist.txt)" % hit)
        for k in ("image", "images", "img", "media", "video", "embed"):
            assert k not in s, (s["id"], "이미지·미디어 필드 금지: " + k)
        # trends24 해시태그 목록을 기사 카드로 만들지 않는다(트렌드는 trends 상자에만) — TRANSLATION_RULES.md
        assert "trends24" not in (s.get("source", "") + " " + s.get("url", "")).lower(), \
            (s["id"], "trends24 해시태그 목록은 기사 카드 금지 — trends 상자(trends.items)에만 넣을 것")
        dsc = s.get("discussion")
        if dsc is not None:  # 💬 오늘의 질문(정적, tools/discussion.py apply 로만 넣음)
            assert isinstance(dsc, dict) and dsc.get("question") and dsc.get("operator_comment") and isinstance(dsc.get("approved"), bool), \
                (s["id"], "discussion = {question, operator_comment, approved: bool}")
            assert len(dsc["question"]) <= 200 and len(dsc["operator_comment"]) <= 500, (s["id"], "discussion 이 너무 김")
            assert not blocked(dsc["question"] + " " + dsc["operator_comment"]), (s["id"], "discussion 차단 목록 키워드")
        if s.get("category") == "visa" or s.get("topic") == "visa" or "visa" in s.get("secondary", []):
            # 외국인·비자: 저볼륨이라 최대 7일 전 기사 허용(그 이상은 금지)
            age = datetime.fromisoformat(data["generated"]) - datetime.fromisoformat(s["published"])
            assert age.days < 8, (s["id"], "외국인·비자 기사는 7일 이내만")
    t = data.get("trends") or {}
    for it in t.get("items", []):
        tag = it if isinstance(it, str) else it.get("tag", "")
        assert not blocked(tag), ("trends", tag, "차단 목록에 걸린 태그")
        if isinstance(it, dict):
            for k in ("tag", "ko", "desc"):
                assert it.get(k), ("trends", tag, "필수: " + k)
    assert sum(1 for s in data["stories"] if s.get("discussion")) <= 15, "discussion(오늘의 질문)은 판마다 최대 15건"
    kt = data.get("korea_top")
    if kt is not None:   # 🇰🇷 오늘의 한국 주요 뉴스(tools/fetch_korea.py) — 최대 10건, 링크 필수
        assert isinstance(kt, list) and len(kt) <= 10, "korea_top 은 최대 10건 목록"
        for i, k in enumerate(kt):
            assert isinstance(k, dict) and k.get("headline") and k.get("source"), ("korea_top", i, "headline·source 필수")
            assert str(k.get("url", "")).startswith("http"), ("korea_top", i, "url(원문 링크) 필수")
            assert "news.google.com" not in k["url"], ("korea_top", i, "Google News 중계 링크 말고 실제 기사 URL(fetch_korea.py --decode-only)")
            assert len(k["headline"]) <= 80, ("korea_top", i, "제목은 짧게(80자 이하)")
            if k.get("published"):
                assert k["published"].endswith("+07:00"), ("korea_top", i, "published 는 +07:00")
                datetime.fromisoformat(k["published"])
            assert not blocked(k["headline"]), ("korea_top", i, "차단 목록 키워드")
    for h in data["highlights"]:
        assert h in ids, "highlights 에 없는 id: " + h
    assert len(data["highlights"]) == 3, "highlights 는 3개"
    br = data.get("briefing")
    if new:
        assert isinstance(br, list), "새 형식 briefing 은 [{topic, text, story_id}] 목록 (newslib.B 사용)"
    if isinstance(br, list):
        assert 4 <= len(br) <= 7, "briefing 은 5~6줄(4~7 허용)"
        for i, b in enumerate(br):
            assert isinstance(b, dict) and b.get("topic") in TOPICS, ("briefing", i, "topic 오류")
            assert b.get("text") and re.search(r"\*\*[^*]+\*\*", b["text"]), ("briefing", i, "text 에 **굵게** 핵심어/숫자 1곳 이상")
            assert len(b["text"]) <= 120, ("briefing", i, "한 줄은 짧게(120자 이하)")
            assert b.get("story_id") in ids, ("briefing", i, "story_id 가 기사 id 가 아님", b.get("story_id"))
            assert not blocked(b["text"]), ("briefing", i, "차단 목록 키워드")
    else:
        assert isinstance(br, str) and br.strip(), "briefing 없음"


def is_new_format(data):
    """기사에 topic 이 하나라도 있거나 briefing 이 목록이면 새 형식으로 검증."""
    return isinstance(data.get("briefing"), list) or any("topic" in s for s in data["stories"])


def topics_of(s):
    """기사의 주제 목록(새 형식: topic+secondary / 옛 형식: category 를 대략 매핑 — 집계용)."""
    if s.get("topic"):
        return [s["topic"]] + list(s.get("secondary", []))
    return [{"politics": "poleco", "economy": "poleco", "society": "society", "local": "pattaya",
             "visa": "visa", "sns": "ent"}.get(s.get("category"), "society")]


def coverage_report(data):
    """구성 점검(경고만). 반환: 경고 문자열 목록."""
    st, warn = data["stories"], []
    if not is_new_format(data):
        warn.append("옛 형식(category·문단 브리핑) — README '기사 스키마'의 새 형식(topic/secondary/tags, 브리핑 목록)을 쓰세요")
    lo, hi = TARGETS["stories"]
    if not lo <= len(st) <= hi:
        warn.append("기사 %d건 (목표 %d~%d건, 실제 뉴스가 없으면 적어도 됨)" % (len(st), lo, hi))
    any_ = lambda t: sum(1 for s in st if t in topics_of(s))
    v = any_("visa"); lo, hi = TARGETS["visa"]
    if v < lo or v > 8:
        warn.append("외국인·비자 %d건 (목표 %d~%d, 최대 8)" % (v, lo, hi))
    for t in TARGETS["places"] + TARGETS["want"]:
        if not any_(t):
            warn.append("%s 기사 0건 — 실제 뉴스가 있으면 1건 이상" % TOPICS[t])
    return warn

def write_edition(data, merge_discussions=True):
    """data/<id>.json + data/<id>.js 저장 후 index 재생성.
    tools/discussions/<id>.json(운영자가 승인한 💬 오늘의 질문, tools/discussion.py apply)이 있으면 다시 합친다."""
    if merge_discussions:
        f = pathlib.Path(__file__).resolve().parent / "discussions" / (data["id"] + ".json")
        if f.exists():
            by = {s["id"]: s for s in data["stories"]}
            for x in json.loads(f.read_text(encoding="utf-8")):
                if x["id"] in by and x.get("approved") is True:
                    by[x["id"]]["discussion"] = dict(question=x["question"], operator_comment=x["operator_comment"], approved=True)
    validate(data)
    eid = data["id"]
    (DATA / (eid + ".json")).write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    js = "window.NEWS_DATA = window.NEWS_DATA || {};\nwindow.NEWS_DATA[%s] = %s;\n" % (
        json.dumps(eid), json.dumps(data, ensure_ascii=False))
    (DATA / (eid + ".js")).write_text(js, encoding="utf-8")
    build_index()
    print("saved", eid, "stories:", len(data["stories"]),
          {t: sum(1 for s in data["stories"] if t in topics_of(s)) for t in TOPIC_ORDER})
    for w in coverage_report(data):
        print("점검(경고):", w)


def build_index():
    """data/*.json 을 훑어 index.json / index.js 재생성 (최신 판이 맨 앞 = 기본 화면)."""
    eds = []
    for p in sorted(DATA.glob("20*.json")):
        m = ID_RE.match(p.stem)
        if not m:
            print("경고: 규칙에 맞지 않는 파일은 index 에서 제외:", p.name, file=sys.stderr)
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        date, ed = m.group(1), m.group(2)
        eds.append(dict(id=p.stem, date=date, edition=ed, label=label_for(date, ed),
                        generated=d.get("generated", ""), stories=len(d.get("stories", []))))
    eds.sort(key=lambda e: (e["date"], EDITION_ORDER[e["edition"]], e["generated"]), reverse=True)
    idx = {"latest": eds[0]["id"] if eds else None, "editions": eds, "dates": [e["id"] for e in eds]}
    (DATA / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), encoding="utf-8")
    (DATA / "index.js").write_text("window.NEWS_INDEX = %s;\n" % json.dumps(idx, ensure_ascii=False), encoding="utf-8")
    print("index:", [(e["id"], e["label"]) for e in eds])
    build_ads()
    return idx


def build_ads():
    """data/ads.json(광고 자리 설정) → data/ads.js(window.TN_ADS, file:// 용). 없으면 아무것도 안 함."""
    src = DATA / "ads.json"
    if not src.exists():
        return
    ads = json.loads(src.read_text(encoding="utf-8"))
    for sl in ads.get("slots", []):
        assert sl.get("id") in ("top", "mid", "korea-mid", "infeed", "drawer", "footer"), ("ads", sl.get("id"))
        for it in sl.get("items", []):
            for k in ("image", "link"):
                assert not it.get(k) or str(it[k]).startswith("https://"), ("ads", sl["id"], k, "https:// 만")
    (DATA / "ads.js").write_text("window.TN_ADS = %s;\n" % json.dumps(ads, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "check":
        # python3 tools/newslib.py check data/<id>.json … : 저장된 판 검증 + 구성 점검
        for f in sys.argv[2:]:
            d = json.loads(pathlib.Path(f).read_text(encoding="utf-8"))
            if "id" not in d:   # 2026-09-29-early 같은 초기 형식
                print("건너뜀(초기 형식, id 없음):", f); continue
            validate(d)
            print("OK", f, "새 형식" if is_new_format(d) else "옛 형식", "| 경고:", coverage_report(d) or "없음")
    else:
        build_index()
