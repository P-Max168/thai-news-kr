# -*- coding: utf-8 -*-
"""2026-10-12 저녁판 (18:08 정기 루틴).
아침판(2026-10-12-am, 약 07:28 BKK) 이후 ~ 10-12 18:15 BKK 보도. tools/collect.py --hours 12.
모든 내용은 raw/2026-10-12-pm/art/ 에 저장한 원문에서 확인한 것만 사용. trends 없음."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR, krw_for

FX = 40.01
def T(n):
    return "%s바트(%s)" % (n, krw_for(n, FX))

stories = [
# ───────────── 외국인·비자 ─────────────
dict(id="vi1", topic="visa", secondary=["bangkok", "society"], region="방콕(통로)",
 headline="한국서 미성년 대상 불법 영상 유포 혐의 수배된 한국인, 방콕 통로 콘도에서 체포…송환 절차",
 summary=[
  "태국 이민국은 12일, 한국에서 16세 미만 소녀가 등장하는 불법 영상을 온라인에 올린 혐의로 인터폴 적색수배가 내려진 한국인 기문(Ki Moon, 42)을 방콕 통로(Thong Lor)의 고급 콘도에서 체포했다고 밝혔다. 방콕포스트에 따르면 이민국장 놉파실프 풀사왓(Noppasilp Poolsawat) 경찰중장은 그가 한국에서 체포 직전인 올해 초 태국으로 도피했다고 전했다.",
  "용의자는 한국에 기반을 둔 불법 영상 사이트 관리자였다고 자백했으며, 이민국은 체류 허가를 취소하고 한국으로 돌려보내는 절차에 들어갔다고 방콕포스트·카오솟 잉글리시가 보도했다. 카오솟 잉글리시는 용의자 표기를 'Lee'로 전했고, 방콕포스트는 'Ki Moon'으로 전했다."
 ],
 context="미성년 대상 성범죄 혐의 사건이라 자극적으로 다루지 않았습니다. 한국 교민·체류자에게는 이민국·인터폴 공조 단속이 이어지고 있다는 점만 참고하면 됩니다.",
 source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/thailand/general/3335690/korean-wanted-for-child-porn-distribution-arrested-in-bangkok",
 title_th="Korean wanted for CSAM distribution arrested in Bangkok",
 published="2026-10-12T16:48:00+07:00",
 tags=["이민국","한국인","인터폴","통로","송환"],
 impact=["비자·체류", "치안"], for_me="한국 수배자가 방콕에서 잡혀 송환 절차에 들어갔습니다. 혐의와 무관한 교민도, 체류 허가·비자가 유효한지 평소처럼 확인해 두세요.",
 also=[dict(source="Khaosod English (카오솟 잉글리시)", url="https://www.khaosodenglish.com/news/2026/10/12/thai-immigration-arrests-south-korean-man-wanted-over-child-sexual-abuse-material/")],
 issue=None,
 quick_replies=["송환되면 한국에서 재판받겠네요", "이름 표기가 매체마다 다르네요", "이런 뉴스는 마음이 무겁습니다"]),

dict(id="vi2", topic="visa", secondary=["north"], region="치앙마이(시내)",
 headline="치앙마이 이민국, 무비자 기간 넘긴 중국인 숙소에서 체포…오버스테이 단속",
 summary=[
  "치앙마이 이민국은 12일 시내 하이야(Haiya) 구역 스리핑므앙(Si Ping Mueang) 도로 일대에서 중국인 남성 1명을 '허가 기간이 끝난 뒤에도 체류' 혐의로 붙잡았다. 이민국 5국 수사팀과 합동으로 점검했다고 치앙마이 뉴스가 전했다.",
  "해당 남성은 무비자(면제 입국)로 들어왔으나 허용 기간이 끝난 뒤에도 출국하거나 체류 연장을 하지 않았다고 진술했다. 이민국은 혐의와 권리를 고지한 뒤 치앙마이 시내 경찰서로 넘겼다."
 ],
 context="무비자·관광 비자로 들어온 뒤 기간을 넘기면 벌금·추방·재입국 제한이 따를 수 있습니다. 출국 전 남은 체류 일수를 꼭 확인하세요.",
 source="Chiang Mai News (치앙마이 뉴스)", url="https://www.chiangmainews.co.th/social/4181681/",
 title_th="หนุ่มแดนมังกร ติดใจเชียงใหม่ ไม่ยอมกลับอยู่จน OVERSTAY สุดท้ายเจอ ตม.ตามคุมตัวถึงที่พัก",
 published="2026-10-12T16:07:00+07:00",
 tags=["치앙마이","오버스테이","이민국","중국인","무비자"],
 impact=["비자·체류"], for_me="치앙마이에서도 오버스테이 단속이 이어지고 있습니다. 입국 도장·비자 만료일을 달력에 적어 두고, 연장·출국을 미루지 마세요.",
 also=[],
 issue=None,
 quick_replies=["기간 넘기면 정말 위험하죠", "치앙마이도 단속이 있군요", "출국 전에 날짜 꼭 확인하세요"]),

dict(id="vi3", topic="visa", secondary=["travel"], region="",
 headline="태국 항공당국, 수하물 개봉 검사 절차 안내…16일부터 승객 없어도 가능",
 summary=[
  "태국 민간항공국(CAAT)은 검색대에서 수상한 물건이 감지되면 위탁 수하물을 승객이 없는 상태에서도 열어볼 수 있다고 절차를 명확히 했다. 조치는 2026년 10월 16일부터 적용된다.",
  "더 타이거에 따르면 개봉은 기록해야 하고, 가방 안에 검사 안내문을 넣으며, 이후 승객에게도 알린다. 사전에 알리지 않고 여는 경우는 검색에서 수상한 물체가 확인된 때로 한정된다고 강조했다."
 ],
 context="공항에서 위탁 가방이 따로 검사될 수 있습니다. 귀중품·서류는 기내 반입 가방에 두는 편이 안전합니다.",
 source="The Thaiger (더 타이거)", url="https://thethaiger.com/news/thailand-clarifies-rules-for-opening-checked-bags-without-passengers-present",
 title_th="Thailand clarifies rules for opening checked bags without passengers present",
 published="2026-10-12T11:58:00+07:00",
 tags=["CAAT","수하물","공항검색","항공","16일"],
 impact=["비자·체류", "교통·사고"], for_me="10월 16일부터 위탁 수하물이 승객 없이도 개봉 검사될 수 있습니다. 귀중품은 기내에 챙기세요.",
 also=[],
 issue=None,
 quick_replies=["귀중품은 기내에 넣어야겠어요", "검사 안내문이 가방에 들어오겠네요", "16일부터라 곧이네요"]),

# ───────────── 동부 ─────────────
dict(id="ea1", topic="east", secondary=["weather", "life"], region="파타야(방라뭉)",
 headline="방라뭉 침수 구호, 총리 승인 138건…카오마이깨오·농쁠라라이 14건은 보류",
 summary=[
  "촌부리 방라뭉군은 12일 재해 피해자 지원 위원회 3차 회의에서, 침수 피해 주민 138명에 대한 구호금이 태국 총리 승인을 받았다고 밝혔다. 파타야 뉴스가 전한 내용이다.",
  "카오마이깨오(Khao Mai Kaeo)·농쁠라라이(Nong Pla Lai) 시정 관할 14건은 등록·신분 확인 불일치로 아직 보류 중이다. 농쁘루·램차방·파타야에서 올라온 추가 신청도 요건을 검토한 뒤 넘기고 있다고 군수는 설명했다."
 ],
 context="",
 source="The Pattaya News (파타야 뉴스)", url="https://thepattayanews.com/2026/10/12/banglamung-district-advances-flood-relief-138-applications-approved-and-14-still-pending/",
 title_th="Banglamung District Advances Flood Relief, 138 Applications Approved and 14 Still Pending",
 published="2026-10-12T16:18:00+07:00",
 tags=["방라뭉","침수","구호금","파타야","총리 승인"],
 impact=["날씨·재해"], for_me="방라뭉·파타야 쪽에서 침수 구호 신청을 했다면 승인·보류 여부를 군청·시정에 확인해 보세요.",
 also=[],
 issue=dict(id="2026-floods-pattaya", title="파타야·방라뭉 침수 피해·구호"),
 quick_replies=["138건이면 많이 진행됐네요", "보류 14건은 서류 문제인가 봐요", "신청하신 분 결과 받으셨나요?"]),

dict(id="ea2", topic="east", secondary=["weather"], region="파타야",
 headline="파타야, 연말 앞두고 파니아창 도로 약 3.5㎞ 재포장 착수",
 summary=[
  "파타야시는 파니아창(Phaniad Chang) 도로 약 3,477ｍ(폭 6~8ｍ)에 아스팔트 콘크리트를 덮고 배수구 뚜껑을 교체하는 공사를 시작했다. 더 타이거에 따르면 계약 기간은 10월 1일~내년 1월 18일이지만, 본포장은 연말 연휴 전에 끝내겠다는 목표다.",
  "부시장 마놋 농야이(Manoch Nongyai)가 9일 시청에서 시 토목·시공사와 회의를 열었고, 공사는 북부·중앙 파타야를 잇는 네 구간으로 나뉜다."
 ],
 context="",
 source="The Thaiger (더 타이거)", url="https://thethaiger.com/news/pattaya/pattaya-phaniad-chang-road-resurfacing-2026",
 title_th="Pattaya begins 3.5km road upgrade ahead of New Year",
 published="2026-10-12T10:22:00+07:00",
 tags=["파타야","도로공사","파니아창","연말"],
 impact=["교통·사고"], for_me="파니아창 도로를 자주 다니면 구간별 공사·우회를 염두에 두세요. 연말 전 본포장 완료가 목표입니다.",
 also=[],
 issue=None,
 quick_replies=["이 도로 막히면 우회가 어렵죠", "연말 전에 끝나길", "어느 구간부터 하나요?"]),

dict(id="ea3", topic="east", secondary=["life", "poleco"], region="파타야",
 headline="CPN리츠, 힐튼 파타야 3년 재임대 안건…최대 임차료 " + T("13억2,300만"),
 summary=[
  "CPN 리테일 그로스 리츠(CPNREIT) 이사회는 12일, 힐튼 파타야 호텔을 CPN 자회사 '시피엔 파타야 호텔'에 다시  Imp대해 주는 안을 11월 19일 수익자총회에 올리기로 했다. 카오후이 보도다.",
  "현 계약은 2026년 12월에 끝나고, 새 계약은 3년(불기 2570~2572년, 서기 2027~2029년)이다. 임차료는 최대 " + T("13억2,300만") + "으로 이전보다 높은 조건이라고 리츠 운용사가 밝혔다. 공개입찰에서 제안자는 이 회사 한 곳뿐이었다."
 ],
 context="",
 source="Kaohoon (카오후이)", url="https://www.kaohoon.com/finance/871507",
 title_th="CPNREIT ชงผู้ถือหน่วยไฟเขียว ปล่อยเช่าฮิลตันพัทยา 3 ปี รับทรัพย์ 1.3 พันลบ.",
 published="2026-10-12T17:39:00+07:00",
 tags=["힐튼 파타야","CPNREIT","임대","호텔","리츠"],
 impact=[], for_me="파타야 대표급 호텔의 운영·임대 계약이 2027년 이후로 이어질 전망입니다. 투숙·연회 계획에는 당장 큰 변화 소식은 없습니다.",
 also=[],
 issue=None,
 quick_replies=["힐튼은 그대로 운영되나 보네요", "리츠 투자 이야기군요", "파타야 호텔 시장이 회복 중인가요?"]),

dict(id="ea4", topic="east", secondary=["society", "visa"], region="촌부리·논타부리",
 headline="투자 사기 가담 혐의 법인 이사 3명 체포…전국 46건·피해 약 " + T("6,000만"),
 summary=[
  "태국 사이버경찰은 촌부리·논타부리에서 스캠 조직에 '바지' 이사로 이름을 빌려준 혐의로 법인 이사 3명을 붙잡았다. 방콕비즈뉴스는 체포영장 12장, 전국 46건, 피해액 약 " + T("6,000만") + "에 이른다고 전했다.",
  "피해자는 페이스북 '단기 투자' 홍보를 보고 라인으로 유도된 뒤, 가짜 투자 앱에 돈을 넣었다가 출금이 막혀 신고했다. 한 피해 사례만 " + T("60만") + "이었다."
 ],
 context="고수익을 약속하는 투자 앱·코인 거래 권유는 사기일 가능성이 큽니다. 모르는 링크·앱 설치를 요구하면 거절하세요.",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1255969",
 title_th="หลอกลงทุน จับ 3 กรรมการบริษัท ชลบุรี-นนทบุรี โยง 46 คดีทั่วไทย เสียหาย 60 ล้าน",
 published="2026-10-12T11:36:00+07:00",
 tags=["투자사기","사이버경찰","촌부리","스캠","법인"],
 impact=["치안"], for_me="태국에서 '짧은 기간 고수익' 투자 권유·모르는 앱 설치를 요구받으면 일단 의심하세요. 피해를 봤다면 사이버경찰·대사관 안내를 받으세요.",
 also=[],
 issue=None,
 quick_replies=["이런 사기 아직도 많네요", "앱 설치 요구하면 거절하세요", "피해 금액이 상당하군요"]),

# ───────────── 방콕 ─────────────
dict(id="bk1", topic="bangkok", secondary=["weather", "life"], region="방콕",
 headline="방콕시, 침수 구호금 " + T("6억4,941만8,000") + " 승인…8만8,198가구",
 summary=[
  "방콕시 부시장 타위다 까몬웻(Thawida Kamonwet)은 12일, 8~11일 사이 '탕랏(Thang Rat)' 앱을 통해 재난방지청(DDPM)에 넘겨 승인된 침수 구호가 8만8,198가구·합계 " + T("6억4,941만8,000") + "이라고 밝혔다. 타이 PBS 보도다.",
  "거주 주택이 물에 잠긴 경우는 가구당 " + T("9,000") + "(5만2,107가구), 물이 둘러싼 경우는 " + T("5,000") + "(3만6,091가구)이다. 방콕시 규정에 따른 별도 신청(claim.bangkok.go.th)도 8만6,088건이 들어왔고, 라드끄라방·방까삐·사이마이·끌롱삼와·민부리 순으로 많았다."
 ],
 context="탕랏 앱·claim.bangkok.go.th·관할 구청에서 상태를 확인할 수 있습니다. 구청은 평일 08:30~18:00, 주말·공휴일 08:30~16:00에 접수한다.",
 source="Thai PBS (타이 PBS)", url="https://www.thaipbs.or.th/news/content/570902",
 title_th="กทม.ส่งอนุมัติเงินช่วยน้ำท่วมแล้ว 88,198 ครัวเรือน วงเงิน 649 ล้านบาท",
 published="2026-10-12T17:40:00+07:00",
 tags=["방콕","구호금","탕랏","침수","DDPM"],
 impact=["날씨·재해"], for_me="방콕에서 침수 피해를 입었다면 탕랏 앱이나 claim.bangkok.go.th에서 승인·이체 상태를 확인해 보세요.",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["승인 금액이 상당하네요", "탕랏 앱으로 확인해야겠어요", "우리 구는 얼마나 신청됐을까요?"]),

dict(id="bk2", topic="bangkok", secondary=["weather"], region="방콕(라드끄라방)",
 headline="방콕 침수 뒤 쓰레기 1만 톤 치움…롬끌라오 단지 대형 폐기물 90% 정리",
 summary=[
  "방콕포스트에 따르면 시 당국은 침수 뒤 길에 쌓인 쓰레기·폐기물 약 1만 톤을 치웠다. 부시장 폰프롬 위낏셋(Phonphrom Vikitsreth)은 12일 오전 라드끄라방 케하 롬끌라오 주택단지의 대형 잔여 폐기물 제거가 약 90% 끝났다고 밝혔다.",
  "사판숭의 선수촌(Athletes' Village)도 약 90% 정리됐고, 방까삐는 잔여 폐기물 제거를 우선하며, 농족·민부리는 수위를 계속 감시 중이라고 전했다."
 ],
 context="",
 source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/thailand/general/3335713/10000-tonnes-of-floodtrash-cleared-from-bangkok-streets",
 title_th="10,000 tonnes of flood-trash cleared from Bangkok streets",
 published="2026-10-12T17:12:00+07:00",
 tags=["방콕","침수쓰레기","롬끌라오","라드끄라방","복구"],
 impact=["날씨·재해"], for_me="라드끄라방·롬끌라오 쪽에 사신다면 대형 폐기물 정리는 상당 부분 진행됐습니다. 냄새·위생은 아직 주의가 필요합니다.",
 also=[],
 issue=dict(id="2026-floods-bangkok-east", title="방콕 동부(라드끄라방·롬끌라오) 침수"),
 quick_replies=["1만 톤이면 어마어마하네요", "롬끌라오 쪽 사시는 분 계신가요?", "복구가 빠르면 좋겠어요"]),

dict(id="bk3", topic="bangkok", secondary=["poleco", "weather"], region="방콕",
 headline="IMF·세계은행 연차총회 방콕 개막…라차다·수쿰윗 등 5개 권역 교통 혼잡 주의",
 summary=[
  "IMF·세계은행그룹 2026 연차총회가 12일 방콕 퀸시리킷 국립컨벤션센터에서 열렸다. 파타야 뉴스에 따르면 18일까지 약 190개국·대표단 1만5,000명 이상이 모인다.",
  "경찰은 라차다피섹·수쿰윗·라마4·벤자키띠 공원·공항~도심 축 등 다섯 권역의 일시 통제·차량 행렬을 예상한다고 알렸다. 방콕 공무원은 12·14·15일 재택, 13일은 전국 공휴일, 16일은 방콕만 특별 휴무이다."
 ],
 context="회의장 인근이라면 MRT·공식 셔틀을 쓰고 여유 시간을 두세요. 아침판에 실린 IMF 교통 예고의 후속입니다.",
 source="The Pattaya News (파타야 뉴스)", url="https://thepattayanews.com/2026/10/12/imf-world-bank-meetings-open-in-bangkok-as-police-flag-five-areas-for-traffic-disruption/",
 title_th="IMF–World Bank Meetings Open in Bangkok as Police Flag Five Areas for Traffic Disruption",
 published="2026-10-12T13:48:00+07:00",
 tags=["IMF","세계은행","방콕","교통","퀸시리킷"],
 impact=["교통·사고"], for_me="이번 주 라차다·수쿰윗·라마4 인근을 지날 계획이 있으면 평소보다 시간이 더 걸릴 수 있습니다. 가능하면 전철을 이용하세요.",
 also=[dict(source="The Thaiger (더 타이거)", url="https://thethaiger.com/news/bangkok/imf-world-bank-meetings-start-as-police-flag-five-roads")],
 issue=None,
 quick_replies=["이번 주 방콕 도심 피해야겠어요", "MRT가 답이겠네요", "대표단 1만5천이면 대단하죠"]),

# ───────────── 날씨·전국 홍수 ─────────────
dict(id="wt1", topic="weather", secondary=["bangkok", "east", "south"], region="",
 headline="태국 기상청 경보 12호…13일 방콕·동부·중부·남부 등 폭우·침수 주의",
 summary=[
  "태국 기상청은 12일 오후 경보 12호를 내고, 12~13일에도 곳곳에 강한 비가 이어진다고 밝혔다. 타이포스트에 따르면 12일은 남부, 13일은 북부 남단·이산 남부·중부(방콕·인근 포함)·동부·남부가 해당한다.",
  "오후 6시께 기상청은 남부 예상 지역을 12개 도로 늘렸고, 13일 예상도 여러 권을 조정했다. 뇌우·돌풍·누적 비로 산지·저지대 급류·침수에 주의하고, 안다만·타이만 뇌우 해역은 파고 2ｍ 초과 가능성이 있다고 했다."
 ],
 context="13일은 공휴일이다. 외출·이동 계획을 짜 두었다면 실시간 경보를 한 번 더 확인하세요.",
 source="Thai Post (타이포스트)", url="https://www.thaipost.net/general-news/1087054/",
 title_th="อุตุฯ อัปเดต เตือน 32 จังหวัด กทม.-ปริมณฑล รับมือฝนตกหนักเสี่ยงน้ำท่วม 13 ต.ค.",
 published="2026-10-12T18:10:00+07:00",
 tags=["기상청","폭우","13일","방콕","동부"],
 impact=["날씨·재해"], for_me="내일(13일) 방콕·동부·남부 쪽은 강한 비·침수 가능성이 있습니다. 이동 전 기상청·교통 안내를 확인하세요.",
 also=[dict(source="Thansettakij (탄셋따낏)", url="https://www.thansettakij.com/general-news/671253")],
 issue=None,
 quick_replies=["내일 비 또 오나요?", "공휴일인데 날씨가 걱정이네요", "동부도 포함이군요"]),

dict(id="wt2", topic="weather", secondary=["society", "north"], region="",
 headline="전국 홍수 피해 가구 90만8,595…인구 약 246만, 핏사눌록·펫차부리 수위 상승",
 summary=[
  "태국 재난방지청(DDPM)은 12일 오전 6시 기준으로 방콕을 포함한 20개 도에서 90만8,595가구·약 245만8,895명이 홍수 영향을 받고 있다고 더 네이션이 전했다. 100개 군·804개 땀본·5,947개 마을이다.",
  "많은 지역은 수위가 내리거나 멈췄지만 핏사눌록·펫차부리는 아직 오르는 중이라고 했다. 방콕 약 32만9,000가구, 빠툼타니 24만8,818가구가 피해 집계에 포함됐다."
 ],
 context="",
 source="The Nation (더 네이션)", url="https://www.nationthailand.com/news/general/40072167",
 title_th="Floods still affect 2.46 million people in 20 provinces and Bangkok as of October 12",
 published="2026-10-12T17:12:00+07:00",
 tags=["DDPM","홍수","핏사눌록","전국","피해가구"],
 impact=["날씨·재해"], for_me="전국적으로 아직 많은 가구가 물에 영향을 받고 있습니다. 친지가 중부·북부 침수 지역에 있다면 연락을 확인해 보세요.",
 also=[],
 issue=dict(id="2026-floods-chaophraya", title="짜오프라야 댐 방류·강변 침수"),
 quick_replies=["피해 규모가 여전히 크네요", "핏사눌록은 아직 위험한가 봐요", "복구가 하루빨리 이뤄지길"]),

# ───────────── 정치·경제 ─────────────
dict(id="pe1", topic="poleco", secondary=["east", "life"], region="동부(EEC)",
 headline="EEC, 2028~2032 개발계획 초안…데이터센터 대비 전력·물·인프라 비중 확대",
 summary=[
  "동부경제회랑사무국(EECO)은 차층사오·촌부리·라용을 대상으로 하는 다음 종합개발계획(2028~2032)에서 전력·물·공공 인프라 비중을 키우겠다고 12일 밝혔다. 더 네이션이 EECO 사무총장 출라 숙마놉(Chula Sukmanop) 발언을 전했다.",
  "데이터센터 등 첨단 산업이 전력·물을 많이 쓰기 때문이라고 설명했다. 토지이용·인프라·사무국 운영·원스톱 서비스 등 네 축으로 짜고, 현 계획(2027년까지) 진척은 당초 목표의 절반 수준이라고 했다."
 ],
 context="",
 source="The Nation (더 네이션)", url="https://www.nationthailand.com/business/economy/40072168",
 title_th="EEC shifts focus to power, water and infrastructure for digital future",
 published="2026-10-12T17:36:00+07:00",
 tags=["EEC","데이터센터","전력","인프라","촌부리"],
 impact=["환율·물가"], for_me="시라차·램차방·라용 일대에 데이터센터·공단이 늘어나면 전력·용수·교통 수요도 같이 커집니다. 장기 거주·사업 계획이 있다면 인프라 소식을 지켜보세요.",
 also=[],
 issue=None,
 quick_replies=["데이터센터 때문에 전기가 중요하군요", "EEC 계획이 길어지네요", "전력·물이 병목이었나 봐요"]),

dict(id="pe2", topic="poleco", secondary=["bangkok", "visa"], region="방콕",
 headline="태국 중앙은행, IMF 무대서 '방콕 블루프린트'…국경 넘는 금융사기 대응 제안",
 summary=[
  "태국 중앙은행(BOT) 대변인 차야와디 차이아난(Chayawadee Chai-anant)은 12일, IMF·세계은행 연차총회에서 디지털 금융 범죄 대응 틀인 '방콕 블루프린트(Bangkok Blueprint)'를 핵심으로 소개한다고 밝혔다. 더 스탠더드 보도다.",
  "디지털 금융이 빨라질수록 사기꾼도 그 속도를 이용한다며, 사이버 위협보다 상대적으로 늦게 논의되던 사기·스캠에 대해 국가 간 정보 교환과 규제 조율을 촉구한다고 설명했다."
 ],
 context="",
 source="The Standard (더 스탠더드)", url="https://thestandard.co/bot-bangkok-blueprint-imf-world-bank/",
 title_th="แบงก์ชาติดัน ‘Bangkok Blueprint’ บนเวที IMF-World Bank Annual Meeting 2026 สกัดสแกมเมอร์ข้ามพรมแดน",
 published="2026-10-12T17:55:00+07:00",
 tags=["중앙은행","방콕 블루프린트","IMF","스캠","디지털금융"],
 impact=["치안"], for_me="태국이 국제 무대에서 메신저·투자 사기 공조를 공식 의제로 올렸습니다. 교민 대상 스캠도 비슷한 수법이니 송금·앱 설치 요구에 조심하세요.",
 also=[],
 issue=None,
 quick_replies=["스캠 국제 공조가 필요하죠", "블루프린트 내용이 궁금하네요", "교민 사기도 줄어들까요?"]),

# ───────────── 북부·남부 ─────────────
dict(id="no1", topic="north", secondary=["society"], region="치앙라이(판)",
 headline="치앙라이 생수 트럭 비밀칸에서 필로폰 350㎏…운전자 '이전 3번·회당 " + T("30만") + "' 진술",
 summary=[
  "치앙라이 판(Phan) 경찰은 11일 오전 10시께 푸깽 검문소에서 생수 트럭 밑 비밀칸에 숨긴 필로폰(아이스) 약 350㎏을 적발하고 남녀 2명을 붙잡았다. 더 타이거 보도다.",
  "용의자 워라웃(Worawut, 32)과 파팟사라(Phapatsara, 33)는 농카이 출신으로, 매사이 국경 쪽에서 사뭇쁘라깐으로 옮기던 중이었다고 한다. 운전자는 이전에도 세 번 운반했고 회당 " + T("30만") + "을 받았다고 진술했다."
 ],
 context="",
 source="The Thaiger (더 타이거)", url="https://thethaiger.com/news/northern-thailand/chiang-rai-police-finds-350kg-meth-hidden-in-water-truck",
 title_th="Chiang Rai police finds 350kg meth hidden in water truck",
 published="2026-10-12T16:02:00+07:00",
 tags=["치앙라이","필로폰","매사이","마약","검문"],
 impact=["치안"], for_me="북부 국경~중부 화물 이동 경로에서 대규모 마약 적발이 있었습니다. 일반 여행객과 직접 관련은 적지만, 검문이 잦아질 수 있습니다.",
 also=[],
 issue=None,
 quick_replies=["350㎏이면 초대형이네요", "생수 트럭에 숨기다니", "국경 단속이 강화되나 봐요"]),

dict(id="st1", topic="south", secondary=["weather", "travel"], region="꼬사무이(라마이)",
 headline="꼬사무이 라마이 산 빌라에 산사태…인명 피해 없이 담장·건물 일부 파손",
 summary=[
  "수랏타니 꼬사무이 마렛(Maret) 땀본 반라마이 마을 산중턱 빌라가 12일 오전 9시 20분께 산사태 피해를 입었다. 방콕포스트에 따르면 콘크리트 담장과 건물 일부가 파손됐으나 다친 사람은 없었다.",
  "지방 당국은 계속된 비로 지반이 약해진 탓으로 보고, 고지대·최근 성토한 신축 현장에서 비슷한 사고가 늘 수 있다고 경고했다. 기상청은 화~일 남부 일부에 강한 비를 예보했다."
 ],
 context="",
 source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/thailand/general/3335724/koh-samui-villa-hit-by-landslide",
 title_th="Koh Samui villa hit by landslide",
 published="2026-10-12T16:58:00+07:00",
 tags=["꼬사무이","산사태","라마이","폭우","남부"],
 impact=["날씨·재해", "교통·사고"], for_me="사무이·남부 고지대·언덕 숙소에 있다면 연속 비 뒤 지반·배수 상태를 살피고, 경보 시 낮은 곳으로 대피할 준비를 하세요.",
 also=[],
 issue=None,
 quick_replies=["인명 피해가 없어 다행이에요", "남부 비 소식 계속 나오네요", "언덕 숙소는 조심해야겠어요"]),

dict(id="st2", topic="south", secondary=["weather"], region="푸껫",
 headline="내무부 차관, 푸껫 배수·홍수 대비 점검…시간당 7만㎥ 이상 양수 능력",
 summary=[
  "내무부 차관 워라싯 리앙쁘라싯(Worasit Liangprasit)은 12일 푸껫도청을 찾아 홍수 대비를 점검했다. 푸껫 뉴스에 따르면 주요 배수 지점 두 곳의 양수 능력이 시간당 7만㎥를 넘는다고 당국이 보고했다.",
  "총리 겸 내무부장관 주재 전국 재난회의 뒤 현장 브리핑이 이어졌고, 수로 장애물 제거·강우·산사태 감시·주민·관광객 안내가 지시됐다. 남부 기상센터는 라농·팡아·푸껫·끄라비·뜨랑·사툰 일부에 강한 비를 예보했다."
 ],
 context="",
 source="The Phuket News (푸껫 뉴스)", url="https://www.thephuketnews.com/deputy-interior-minister-inspects-phuket-flood-defences-101898.php",
 title_th="Deputy Interior Minister inspects Phuket flood defences",
 published="2026-10-12T16:09:00+07:00",
 tags=["푸껫","홍수","배수","내무부","양수"],
 impact=["날씨·재해"], for_me="푸껫에 계시거나 여행 예정이면 기상 경보와 저지대·배수로 상태를 확인하세요. 당국이 관광객 안내도 강조했습니다.",
 also=[],
 issue=None,
 quick_replies=["푸켓도 비 대비 중인가 봐요", "관광객 안내가 중요하다죠", "양수 능력이 핵심이겠네요"]),

# ───────────── 여행 ─────────────
dict(id="tr1", topic="travel", secondary=["poleco"], region="",
 headline="외국인 관광객 1~10월 10일 2,394만 명…전년 대비 4% 감소, 중국 주간 급감",
 summary=[
  "태국 관광체육부는 1월 1일~10월 10일 외국인 관광객이 2,393만6,270명으로 전년 같은 기간보다 4.04% 줄었고, 지출은 약 1.16조 바트(약 46조4,116억 원)라고 12일 밝혔다. 카오솟 보도다.",
  "최근 한 주 입국은 48만3,375명으로 전주 대비 7.49% 감소했다. 중국 골든위크·홍콩·한국 연휴가 끝나며 근거리 시장이 꺾였고, 중국은 전주 대비 41.56% 줄었다. 러시아·대만은 늘었고 대만은 주간 5위로 올랐다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/economics/news_10434694",
 title_th="นักท่องเที่ยวต่างชาติ 9 เดือนกว่า 23.9 ล้านคน ลด 4% จีนหดตัวแรง",
 published="2026-10-12T15:09:00+07:00",
 tags=["관광객","중국","관광부","방콕","통계"],
 impact=["환율·물가"], for_me="연휴 직후 근거리 관광객이 줄었습니다. 관광·서비스업에 계시다면 주간 흐름을, 여행객이라면 성수기 전 항공·호텔을 비교해 볼 만합니다.",
 also=[dict(source="Thai PBS (타이 PBS)", url="https://www.thaipbs.or.th/news/content/570884")],
 issue=None,
 quick_replies=["중국 관광객 감소가 크네요", "러시아·대만은 늘었군요", "연말 성수기는 어떨까요?"]),
]

briefing = [
  B("visa", "한국 수배 한국인, 방콕 통로 콘도에서 체포…**송환** 절차", "vi1"),
  B("weather", "기상청 경보 12호, **13일** 방콕·동부·남부 폭우 주의", "wt1"),
  B("bangkok", "방콕 침수 구호 **8만8,198가구**·약 6억4,942만 바트(약 259억8,329만 원) 승인", "bk1"),
  B("bangkok", "IMF·세계은행 연차총회 개막…**5개 권역** 교통 혼잡", "bk3"),
  B("east", "방라뭉 침수 구호 총리 승인 **138건**(14건 보류)", "ea1"),
  B("visa", "위탁 수하물 개봉 검사 안내, **16일**부터 적용", "vi3"),
]

korea_top = [
  KR("민주, 한동훈 딸 봉사활동 '대필 서명' 의혹 제기‥재수사 촉구", "MBC 뉴스", "https://imnews.imbc.com/news/2026/politics/article/6857312_36911.html", "2026-10-12T15:01:42+07:00"),
  KR("[속보] 국회 과방위, 방미통위 국감서 이진숙 제척안 상정", "조선일보", "https://www.chosun.com/politics/assembly/2026/10/12/O33OZTVKOFBC3M4U2425XYBZE4/", "2026-10-12T14:26:00+07:00"),
  KR("[속보] 중수청, 임은정 감찰 착수…윤호중 장관 '감찰 지시' 발언 하루 만", "한겨레", "https://www.hani.co.kr/arti/society/society_general/1281960.html", "2026-10-12T14:11:00+07:00"),
  KR("LH 사장 \"집값 급락 가능성 커…2021년 정점도 고금리로 내려와\"", "한겨레", "https://www.hani.co.kr/arti/economy/property/1281984.html", "2026-10-12T15:58:00+07:00"),
  KR("[단독]이화영은 '이 대통령의 아킬레스건'… 연말 연초 '정치적 결단' 여부 촉각", "문화일보", "https://www.munhwa.com/article/11622844", "2026-10-12T10:11:30+07:00"),
  KR("우리 극초음속 성공 4일 만에…북 \"항의성 무력 시위\" 미사일 발사", "KBS 뉴스", "https://news.kbs.co.kr/news/view.do?ncd=8683389", "2026-10-12T17:02:00+07:00"),
]

data = dict(
  id="2026-10-12-pm", date="2026-10-12", edition="pm", edition_label="저녁판",
  weekday="월요일", timezone="Asia/Bangkok (UTC+7)",
  coverage="10-12 아침판(약 07:28 BKK) 이후 ~ 10-12 18:15 BKK 보도. tools/collect.py --hours 12. 원문 확인: Bangkok Post·Khaosod English·Chiang Mai News·The Thaiger·The Pattaya News·Kaohoon·Bangkok Biz News·Thai PBS·Thai Post·The Nation·The Standard·The Phuket News·Khaosod. 아침판에 실린 기상 경보·EEC 공장 재가동·아시아나 회항 등은 후속·신규만 실음. 북부 1건·남부 2건·외국인·비자 3건. 한국 주요 뉴스는 data/korea.json(17:57 BKK)에서 고른 대체용 6건(GN URL decode). X 트렌드 없음. 환율 1바트=40.01원.",
  previous="2026-10-12-am",
  briefing=briefing,
  highlights=["vi1", "wt1", "bk1"],
  stories=stories, korea_top=korea_top,
  fx=dict(THB_KRW=FX, note="1바트 = 40.01원(이 판의 모든 원화 환산에 사용, 정수로 반올림)",
          source="open.er-api.com (ticker.json 2026-10-12 17:57 BKK 조회, 공시 40.0052 → 판 환율 40.01, 아침판과 동일)"),
)

if __name__ == "__main__":
    write_edition(data)
