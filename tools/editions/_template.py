# -*- coding: utf-8 -*-
"""새 판 편집 파일 템플릿 (2026-10-03 아침판부터의 새 형식).
복사: cp tools/editions/_template.py tools/editions/<YYYY-MM-DD>-am.py  → 아래 ※ 부분을 실제 수집 내용으로 교체
실행: python3 tools/build_data.py tools/editions/<id>.py  (검증 실패 시 멈춤, '점검(경고)'는 구성 안내)
※ 이 템플릿 자체는 id 가 'YYYY-MM-DD-am' 이라 실행해도 검증에서 멈춘다(실수로 가짜 판이 생기지 않음).
※ 뉴스·인용·숫자·URL·시각은 raw/<id>/ 원문에서 확인한 것만. 절대 지어내지 않는다.

주제 id (topic = 주 주제 1개, secondary = 보조 0~3개):
  pattaya  파타야 (좀티엔·방라뭉·싸따힙·나끌루아·농쁘루)     sriracha 시라차 (램차방·촌부리 시내·아마타·반븡)
  bangkok  방콕                                          poleco   정치·경제
  society  사회·사건사고                                  visa     외국인·비자 (2~4건, 최대 8, 7일 이내)
  life     생활·물가·부동산                               travel   여행·맛집
  ent      연예·스포츠·SNS                                weather  날씨·교통
  예) 파타야 침수 → topic="pattaya", secondary=["weather"] / 시라차 달걀값 → topic="life", secondary=["sriracha"]
기사 id: 주제 약어+번호 권장 (pt1 sr1 bk1 pe1 so1 vi1 lf1 tr1 en1 wt1). 판 안에서만 유일하면 됨.
tags: 키워드 2~6개 필수(인물·장소·기관·사건 키워드, '#' 없이) — 👍👎 취향 학습에 쓰임.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR

stories = [
dict(id="pt1", topic="pattaya", secondary=["weather"], region="파타야(좀티엔)",   # ※ 예시 — 실제 기사로 교체
 headline="※ 한국어 제목",
 summary=["※ 문단 1 (원문 확인 내용만)", "※ 문단 2"],
 context="※ 💡 배경 설명(선택). 외국인·비자 기사는 파타야 거주 한국인 기준 실용 팁",
 # update="※ 후속 기사일 때만: 이전 판 이후 새로 나온 내용",
 source="※ 매체 (한국어 표기)", url="https://※원문 URL",
 title_th="※ 원문 제목(태국어/영어)",
 published="2026-01-01T07:00:00+07:00",   # ※ 원문 게재 시각(+07:00)
 related=[],                                # [dict(source=, title=, url=)]
 tags=["※키워드1", "※키워드2", "※키워드3"]),
]

# 브리핑 5~6줄: B(주제, "짧은 한 줄 + **굵게 핵심어/숫자**", 기사 id). 한 줄 120자 이하, 각 줄은 서로 다른 기사.
briefing = [
  B("pattaya", "※ 파타야 **핵심 키워드** 한 줄 요약", "pt1"),
]

# 🇰🇷 오늘의 한국 주요 뉴스(최대 10건, 판 대체용 — 화면은 보통 data/korea.json 을 씀): python3 tools/fetch_korea.py <id> → 한국에서 지금 가장 화제인 전국 뉴스 10개를 골라
#   python3 tools/fetch_korea.py <id> --decode-only "제목 일부" … 로 실제 URL 을 푼 뒤 KR(제목, 매체, URL, 게재시각) 로 적는다.
korea_top = [
  KR("※ 한국 언론 제목(살짝만 다듬기)", "※ 매체", "https://※실제 기사 URL", "2026-01-01T07:00:00+07:00"),
]

# X 트렌드: 상자(trends.items)에만 넣는다. trends24 를 출처로 한 '기사 카드'(SNS 탭)는 만들지 않는다(검증이 막음)
T = lambda tag, ko, desc, verified=True: dict(tag=tag, ko=ko, desc=desc, verified=verified)
trends = dict(
  source="trends24.in (X/트위터 태국 트렌드)", url="https://trends24.in/thailand/",
  fetched="※ raw/<id>/trends/trends.json 의 fetched", block="※ block", filtered=0,
  note="※ 한 줄 요약",
  items=[T("#tag", "※ 한국어", "※ 설명")],
)

data = dict(
  id="YYYY-MM-DD-am", date="YYYY-MM-DD", edition="am", edition_label="아침판",   # ※ 실행한 날(방콕) + am|pm
  weekday="※요일", timezone="Asia/Bangkok (UTC+7)",
  generated="※2026-01-01T07:30:00+07:00",
  coverage="※ 수집 범위 설명",
  previous="※ 직전 판 id (data/index.json 의 latest)",
  briefing=briefing,
  highlights=["pt1", "※", "※"],   # 주요 뉴스 3건(기사 id) — 주제 선택과 관계없이 모든 사용자에게 보임
  stories=stories, trends=trends, korea_top=korea_top)

if __name__ == "__main__":
    write_edition(data)
