# -*- coding: utf-8 -*-
"""2026-10-16 저녁판 (18:08 정기 루틴).
아침판(2026-10-16-am) 이후 ~ 10-16 18:15 BKK 보도. tools/collect.py --hours 14.
모든 내용은 raw/2026-10-16-pm/art/ 에 저장한 원문에서 확인한 것만 사용. trends 없음."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR, krw_for

FX = 40.11
def T(n):
    return "%s바트(%s)" % (n, krw_for(n, FX))

stories = [
# ───────────── 외국인·비자 ─────────────
dict(id="vi1", topic="visa", secondary=["poleco"], region="방콕",
 headline="상무부 사업개발국·이민국, 노미니 특별대응팀…법인 DB·법률 자문 연계",
 summary=[
  "태국 상무부 사업개발국(DBD)이 이민국과 함께 외국인 명의 대여(노미니)와 불법 사업 차단을 위한 특별 실무·법률 지원 체계를 마련했다고 타이포스트가 16일 전했다.",
  "키띠왓 팟찜난 DBD 국장과 이민국 3국 수사 관계자가 회의를 열어, ① DBD가 관할하는 민상법·외국인사업법 등 노미니 관련 법률에 대한 전담 자문 인력 지원 ② DBD DataWarehouse+(법인 정보 창고)의 심층 데이터를 이민국이 조회해 수사에 쓰도록 하는 방안을 추진하기로 했다.",
  "키띠왓 국장은 노미니·불법 사업이 공정한 사업 환경을 해치는 국가적 과제라며, 상무부와 정부가 우선 과제로 단속에 협력하겠다고 밝혔다."
 ],
 context="태국에서 회사를 차리거나 인수할 때 태국인 명의만 빌리는 방식은 외국인사업법 위반이 될 수 있습니다. 정식 업종·지분 구조를 확인하세요.",
 source="Thai Post (타이포스트)", url="https://www.thaipost.net/economy-news/1089897/",
 title_th="กรมพัฒนาธุรกิจการค้า จับมือ สตม.ตั้งคณะทำงานงานเฉพาะกิจปราบนอมินี",
 published="2026-10-16T16:37:54+07:00",
 tags=["노미니","이민국","사업개발국","외국인사업","단속"],
 impact=["비자·체류"], for_me="태국에서 법인·가게를 운영하거나 인수할 계획이면, 명의만 빌리는 구조는 단속 대상이 될 수 있으니 업종·지분을 정식으로 맞추세요.",
 also=[],
 issue=dict(id="nominee-crackdown", title="외국인 노미니(차명) 단속"),
 quick_replies=["노미니 단속이 세지겠네요", "법인 구조 다시 점검해야겠어요", "교민 사업자도 참고할 소식"]),

dict(id="vi2", topic="visa", secondary=["south"], region="푸껫(까론)",
 headline="푸껫서 중국인 남성 체포…Privilege 비자로 들어와 약 5년(1,793일) 오버스테이",
 summary=[
  "푸껫 이민국이 14일 오전 까론 인근 한적한 단층 임대 주택에서 55세 중국인 왕(가명) 씨를 붙잡았다고 더타이거가 더푸껫뉴스를 인용해 16일 전했다. 오버스테이는 1,793일(약 5년)로 집계됐다.",
  "입국은 2019년 4월 2일 태국 Privilege Card 비자로 했고, 체류 허가는 2020년 3월 31일에 만료된 뒤 2021년 11월 16일까지 연장된 기록이 있으나 그 이후 연장·출국 기록은 없었다.",
  "압수품에는 태국 은행 통장, 여권·중국 신분증(타인 명의 포함), 휴대전화 5대, 칼 4자루가 포함됐다. 이민국은 중국에서 불법 도박장 운영 혐의로 도피했다는 주장도 적었으나, 영장 등 세부 내용은 공개되지 않았다. 신원 확인 뒤 수사 단계로 넘겨졌다."
 ],
 context="장기 체류 비자·Privilege도 연장 기한을 넘기면 오버스테이 벌금·입국 금지 대상이 됩니다. 만료일 전에 연장·출국을 확인하세요.",
 source="The Thaiger (더타이거)", url="https://thethaiger.com/news/phuket/chinese-man-held-in-phuket-over-nearly-five-year-visa-overstay",
 title_th="Chinese man held in Phuket over nearly five-year visa overstay",
 published="2026-10-16T10:54:00+07:00",
 tags=["푸껫","오버스테이","Privilege","중국인","이민국"],
 impact=["비자·체류", "치안"], for_me="푸껫·전국 어디든 체류 만료일을 넘기면 단속 때 바로 적발될 수 있으니, Privilege·장기 비자도 연장 기록을 꼭 챙기세요.",
 also=[],
 issue=None,
 quick_replies=["5년이면 너무 길어요", "Privilege도 예외가 없네요", "만료일 알람 맞춰 둬야겠어요"]),

# ───────────── 동부 ─────────────
dict(id="ea1", topic="east", secondary=["society"], region="라용(니콤파타나)",
 headline="라용 창고 15동 전자폐기물 추가 점검…2,500톤 이상 압류·DSI·AML 연계 검토",
 update="아침판 이후 새로 나온 내용: 환경부 장관 지시로 오염 특별팀이 라용 창고 15동을 재점검해 전자폐기물 2,500톤 이상을 확인하고 압류·입건을 진행 중이며, 초국경 조직과 연결되면 DSI·자금세탁방지기구(AML)로 확대한다는 방침이 나왔다.",
 summary=[
  "수찻 촘클린 천연자원환경부 장관 지시로 오염 특별대응팀이 라용 도와 합동해 니콤파타나 일대 창고 15동을 점검했다고 마티촌이 16일 전했다. 전자·전기 폐기물로 보이는 자재가 2,500톤 이상 확인돼 압류·입건에 들어갔다.",
  "12일 1차 점검에서는 공장 유형 105·106에 해당하는 6동과 무허가 9동이 확인됐고, 5동에서 분쇄 기계와 콘크리트 바닥·빅백에 쌓인 자재(약 3,000㎥)가 나왔다. XRF 휴대 분석으로 위험 물질 가능성이 있다고 봤다.",
  "같은 날 후속 브리핑에서는 15동 중 13동에 기계가 있고 자재 규모를 약 1만 톤으로 추산했으며, 폐수 처리 시설이 없고 벽 파손 구간으로 공공 수로에 물이 흘렀다는 점도도 나왔다. 계근실 기록에 중국어 메모가 있었으나 정전으로 PC는 열지 못했다."
 ],
 context="",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/local/news_5935693",
 title_th="ฉก.ควบคุมมลพิษ บุกตรวจโกดังระยอง พบขยะอิเล็กทรอนิกส์กว่า 2,500 ตัน สั่งยึดอายัดดำเนินคดี",
 published="2026-10-16T15:52:31+07:00",
 tags=["라용","전자폐기물","환경부","압류","니콤파타나"],
 impact=["날씨·재해"], for_me="라용·EEC 공단 인근에 사시면 악취·폐수 민원은 관할 도청·환경 당국에 남기고, 미신고 창고 인근은 가까이 가지 않는 편이 안전합니다.",
 also=[dict(source="Matichon (마티촌)", url="https://www.matichon.co.th/region/news_5935871")],
 issue=None,
 quick_replies=["계속 압수가 나오네요", "수질 오염이 걱정돼요", "단속이 제대로 이어지길"]),

dict(id="ea2", topic="east", secondary=["poleco", "society"], region="싸따힙",
 headline="NACC, 싸따힙 전 군수 등 7명 기소 의견…'마운틴 B' 무허가 영업 방치 혐의(화재 26명 사망)",
 summary=[
  "국가반부패위원회(NACC)가 전 싸따힙 군수 차차이 스리포온(예비 소령) 등 관련자 7명에 대해, 유흥업소 '마운틴 B(Mountain B)'가 허가 없이 영업하도록 방치한 혐의로 형사 기소 의견(가치 인정)을 냈다고 탄셋타낏·카오솟이 16일 전했다.",
  "조사에 따르면 건물은 2022년 5월 건축 허가·신고 없이 지어졌고, 같은 해 6월부터 유흥업소법상 영업장 허가를 받지 않은 채 영업했다. 싸따힙은 유흥업소 설치가 허용되지 않는 구역이라는 점도도 나왔다.",
  "2022년 8월 5일 새벽 1시경 매장에서 전기 설비 부실로 추정되는 화재가 나 손님·연주자 등 26명이 숨졌다. NACC는 허가·감독 책임을 물은 뒤 검찰로 넘기는 절차를 진행한다."
 ],
 context="",
 source="Thansettakij (탄셋타낏)", url="https://www.thansettakij.com/politics/671604",
 title_th="ป.ป.ช.เชือดอดีตนายอำเภอสัตหีบ-พวก ปล่อยเมาท์เท่นบีเปิดเถื่อน ไฟไหม้ 26 ศพ",
 published="2026-10-16T14:25:00+07:00",
 tags=["마운틴B","싸따힙","NACC","화재","유흥업소"],
 impact=["치안"], for_me="동부 유흥·공연장을 갈 때는 비상구·소화 설비·허가 여부를 한번 더 확인하고, 과밀·불법 개조가 보이면 피하는 편이 낫습니다.",
 also=[dict(source="Khaosod (카오솟)", url="https://www.khaosod.co.th/breaking-news/news_10439544")],
 issue=None,
 quick_replies=["26명 참사가 다시 떠오르네요", "책임 추궁이 이어지길", "안전 점검이 우선이에요"]),

dict(id="ea3", topic="east", secondary=["society"], region="촌부리(보텅·탓통)",
 headline="촌부리 보텅 공장 영업정지…주물용 폐모래 등 위험폐기물 약 800~1,000톤 무단 보관",
 summary=[
  "촌부리 도 산업사무소가 16일 보텅군 탓통 면의 한 회사에 대해 공장법상 영업 전면 정지 명령을 내렸다고 톱뉴스가 전했다. 내부안보사령부(ISOC)와 합동 점검에서 허가 없이 들여온 주물용 폐모래(위험물질 3류로 분류) 등이 확인됐다.",
  "산업과장 르삭 꾼라티안은 폐기물 약 800~1,000톤을 법적 절차에 따라 신속히 반출·처리하라고 지시했고, 담당 엔지니어를 현장 총괄로 지정했다. 보텅 군수와 탓통 면장은 유출·오염을 막기 위해 행정·보건 인력이 반출 과정을 감시하도록 했다."
 ],
 context="아침판 보텅 트럭 전복 사고와는 별건입니다. 같은 보텅군에서 나온 산업폐기물 단속 소식입니다.",
 source="TOP NEWS (톱뉴스)", url="https://www.topnews.co.th/news/1721210",
 title_th="อุตสาหกรรมชลบุรีลุยโรงงานบ่อทอง! สั่งหยุดกิจการ พบกากอุตสาหกรรมอันตราย 1,000 ตัน ไร้ใบอนุญาต",
 published="2026-10-16T15:24:00+07:00",
 tags=["보텅","산업폐기물","영업정지","촌부리","ISOC"],
 impact=["날씨·재해"], for_me="보텅·탓통 인근에 사시면 폐기물 반출 트럭·먼지가 늘 수 있으니, 이상 냄새가 나면 군청·보건소에 신고하세요.",
 also=[],
 issue=None,
 quick_replies=["보텅에 단속이 이어지네요", "주민 건강이 걱정돼요", "반출 감시가 중요하겠어요"]),

dict(id="ea4", topic="east", secondary=["society"], region="파타야(3로)",
 headline="파타야 3로 식당 전기실 화재…새벽 '변압기 폭발' 소리, 인명 피해 없음",
 summary=[
  "16일 새벽 5시 6분께 파타야 3로(찰름프라끼앗)의 한 태국 식당 전기 제어실에서 불이 났다고 더파타야뉴스가 전했다. 목격자는 변압기가 터지는 듯한 큰 소리를 들었다고 했다.",
  "소방·구조대가 출동해 짧은 시간에 불을 껐고, 전기실과 내부 설비가 손상됐으나 사상자는 없었다. 소방 측은 합선 가능성을 보고 있으며, 경찰과 촌부리 도 감식팀이 원인을 조사 중이다."
 ],
 context="",
 source="The Pattaya News (더파타야뉴스)", url="https://thepattayanews.com/2026/10/16/fire-damages-electrical-room-at-pattaya-restaurant-no-injuries/",
 title_th="Fire Damages Electrical Room at Pattaya Restaurant, No Injuries",
 published="2026-10-16T17:56:31+07:00",
 tags=["파타야","화재","전기실","3로","합선"],
 impact=["치안"], for_me="오래된 상가·식당은 전기 과부하가 잦으니, 타는 냄새나 차단기 이상이 있으면 바로 대피·신고하세요.",
 also=[dict(source="The Thaiger (더타이거)", url="https://thethaiger.com/news/pattaya/pattaya-restaurant-fire-loud-bang-no-casualties")],
 issue=None,
 quick_replies=["인명 피해 없어 다행", "전기 설비 점검이 필요해요", "3로 쪽 가시는 분 참고"]),

dict(id="ea5", topic="east", secondary=["travel"], region="파타야(발리하이 부두)",
 headline="파타야, 발리하이 부두에 관광객 지원센터 검토…꼬란 출항지 안전·안내 강화",
 summary=[
  "파타야시가 꼬란(코란) 등 해양 관광 출항 거점인 발리하이 부두에 관광객 지원센터 설치를 검토 중이라고 더파타야뉴스가 16일 전했다. 포라멧 응암피쳇 시장 주재로 촌부리 관광스포츠청·관광경찰·관광청(TAT) 등이 회의했다.",
  "센터는 교통·관광 정보 제공과 응급 시 관계 기관 연계를 목표로 하며, 위치·운영 방식은 해양국 등과 추가 협의가 필요하다. 시장은 관광객 안전·편의를 중시한다며 부두 공간이 적합한지 살피겠다고 했다."
 ],
 context="",
 source="The Pattaya News (더파타야뉴스)", url="https://thepattayanews.com/2026/10/16/pattaya-considers-tourist-assistance-centre-at-bali-hai-pier-to-improve-visitor-safety/",
 title_th="Pattaya Considers Tourist Assistance Centre at Bali Hai Pier to Improve Visitor Safety",
 published="2026-10-16T15:24:04+07:00",
 tags=["발리하이","꼬란","관광객","파타야시","지원센터"],
 impact=[], for_me="꼬란 갈 때 발리하이에서 문제가 생기면 관광경찰·시청 안내에 먼저 문의하세요. 센터는 아직 검토 단계입니다.",
 also=[],
 issue=None,
 quick_replies=["생기면 편리하겠어요", "아직 검토 단계군요", "꼬란 가는 분들 참고"]),

# ───────────── 방콕 ─────────────
dict(id="bk1", topic="bangkok", secondary=["society", "poleco"], region="방콕(플런칫·나나)",
 headline="IMF·세계은행 반대 시위 종료…6개 요구 발표, 플런칫~나나 도로 재개방",
 update="아침판 이후 새로 나온 내용: 시위대가 부채 탕감·공공 감시 등 6개 요구를 발표하며 집회를 끝냈고, 시경찰은 플런칫~나나 구간 교통을 다시 열었다.",
 summary=[
  "IMF·세계은행 연차총회에 반대하던 시위가 16일 종료됐다고 카오솟 영문판·네이션이 전했다. '세계은행·IMF 반대 민중네트워크'는 유엔 세계식량의 날에 맞춰 빈민집회(Assembly of the Poor) 명의로 6개 요구를 읽었다.",
  "요구는 ① 부채 위기 중·저소득국 채무 탕감 ② 정부 대외채무 공공 감시 ③ 대기업 보조금 중단·농생태 지원 ④ 누진 과세 강화 ⑤ 중앙은행의 민주적 책임 ⑥ 사람과 지구를 중심에 둔 경제 정책이다.",
  "시경찰은 시위 종료 후 플런칫~나나 사이 플런칫 도로를 다시 열었다고 밝혔다. 앞서 오전 8시~오후 1시 해당 구간  outbound 통제와 버스 2·40·48·501·508·511 등 우회가 안내된 바 있다."
 ],
 context="",
 source="Khaosod English (카오솟 영문)", url="https://www.khaosodenglish.com/news/2026/10/16/anti-imf-protesters-issue-six-demands-before-ending-bangkok-rally/",
 title_th="Anti-IMF protesters issue six demands before ending Bangkok rally",
 published="2026-10-16T17:08:00+07:00",
 tags=["IMF","세계은행","시위","플런칫","교통"],
 impact=["교통·사고"], for_me="플런칫·나나·시리킷 일대는 시위가 끝나 도로가 다시 열렸지만, 총회 기간엔 검문·우회가 남을 수 있으니 실시간 교통을 확인하세요.",
 also=[dict(source="The Nation (네이션)", url="https://www.nationthailand.com/news/general/40072374")],
 issue=None,
 quick_replies=["도로 열려서 다행", "요구안이 구체적이네요", "시리킷 가는 길 풀렸나요?"]),

dict(id="bk2", topic="bangkok", secondary=["weather", "life"], region="방콕(민부리·농쭉·라드끄라방)",
 headline="방콕시, 침수 15개 구 복구 한 달 목표…일부 도로를 '물막이'로 활용 검토",
 update="아침판 이동 진료 이후 새로 나온 내용: 방콕시 사무총장이 침수 15개 구 복구회의를 열어 도로·보도 수리를 한 달 안에 끝내고, 동부 8~9개 클로옹 확장과 일부 도로의 외수 유입 차단용 활용을 장기 과제로 제시했다.",
 summary=[
  "타이웃 칸깨우 방콕시 사무총장이 16일 시청에서 침수 피해 15개 구·관련 부서와 복구 회의를 열었다고 마티촌이 전했다. 손상된 도로·보도 조사·수리를 한 달 안에 마치겠다는 목표를 세웠다.",
  "최근 3일간 약 300㎜의 비가 내려 여러 클로옹이 제방을 넘쳐 배수가 어려웠다고 설명했다. 장기적으로 민부리·농쭉·라드끄라방 등 동부에서 기존 클로옹 8~9곳을 확장하고, 일부 도로를 시 바깥에서 들어오는 물을 막는 방어선으로 높이는 방안을 검토한다.",
  "같은 날 타위다 부시장 등은 침수 후 이동 진료를 10곳에서 이어 갔고, 개·고양이 대상 광견병 백신 등은 쁘라웻·브엉꿈·사이마이·돈므앙·방켄 5개 구에서 제공했다고 밝혔다."
 ],
 context="",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/local/news_5935972",
 title_th="กทม.เล็งปรับถนนบางเส้น เป็น ‘แนวป้องกันน้ำ’ โกยเจ้าหน้าที่ 500 ชีวิต ลุยฟื้นฟู 15 เขตให้จบในเดือนเดียว",
 published="2026-10-16T17:35:13+07:00",
 tags=["방콕시","침수","복구","라드끄라방","농쭉"],
 impact=["날씨·재해", "교통·사고"], for_me="동부(라드끄라방·롬끌라오·민부리·농쭉) 사시면 복구 공사로 도로가 막힐 수 있으니, 통행 전 구청·교통 안내를 확인하세요.",
 also=[dict(source="Matichon (마티촌)", url="https://www.matichon.co.th/local/news_5936060")],
 issue=dict(id="2026-floods-bangkok-east", title="방콕 동부(라드끄라방·롬끌라오) 침수"),
 quick_replies=["한 달 복구면 빠르네요", "동부 배수 대책이 급해요", "진료소 위치 알아둬야겠어요"]),

# ───────────── 북부·남부 ─────────────
dict(id="no1", topic="north", secondary=["weather"], region="딱(폽프라)",
 headline="딱 폽프라 산골 물 도로 덮쳐…매솟–움팡 1090호선 약 200m 통제·구조 투입",
 summary=[
  "16일 딱 주 폽프라군 총깨쁘 면 반세라랏(6촌) 일대에서 산골 물이 넘쳐 국도 1090호선(매솟–움팡) km 34~35 구간 약 200m가 물에 잠겼다고 시암랏이 전했다.",
  "폽프라 군청·총깨쁘 면사무소·폽프라 경찰·파얍 구조대가 교통 통제와 주민 지원에 나섰다. 차량은 서행·우회가 필요하다."
 ],
 context="",
 source="Siam Rath (시암랏)", url="https://siamrath.co.th/regional/329349",
 title_th="ระทึก! น้ำป่าทะลักไหลท่วมถนน บ้านเสรีราษฎร์ ต.ช่องแคบ อ.พบพระ จ.ตาก",
 published="2026-10-16T16:55:00+07:00",
 tags=["딱","폽프라","산골 물","1090호선","매솟"],
 impact=["날씨·재해", "교통·사고"], for_me="매솟–움팡 쪽을 차로 가실 분은 1090호선 침수 구간을 피하고, 비 온 뒤엔 산기슭 도로를 야간 운전하지 마세요.",
 also=[],
 issue=None,
 quick_replies=["산골 물은 갑자기 오네요", "움팡 가는 길 조심", "구조대 고생이 많겠어요"]),

dict(id="st1", topic="south", secondary=["society"], region="빳따니(마이깬)",
 headline="빳따니 마이깬서 향토방위대원 피습…교전 중 대원·가해자 1명씩 사망, 1명 추적",
 summary=[
  "16일 오후 1시 30분께 빳따니 마이깬군 딸로끄라이통 면 고무나무 숲 도로에서 향토방위대 대원 루스리 우마(54) 씨가 총에 맞아 숨졌다고 타이랏이 전했다.",
  "금요 예배(살라) 가는 길에 오토바이 2인조가 민간인처럼 따라와 총을 쏘았고, 대원이 9㎜로 응사해 가해자 1명(무함마드 씨로 보도)도 머리 총상으로 숨졌다. 부상당한 나머지 1명은 추적 중이다.",
  "빳따니 도경찰청장은 반경 5km 검문과 CCTV·총기 이력을 조사하라고 지시했다."
 ],
 context="",
 source="Thairath (타이랏)", url="https://www.thairath.co.th/news/crime/2966657",
 title_th="ปัตตานี “อส.ไม้แก่น” สู้ยิบตา ถูกประกบยิงกลางสวนยาง ดวลปืนดับทั้งคู่ เร่งล่าคนร้ายอีก 1",
 published="2026-10-16T17:14:29+07:00",
 tags=["빳따니","마이깬","향토방위대","총격","남부"],
 impact=["치안"], for_me="남부 국경 인근을 여행할 때는 저녁 이후 외진 도로를 피하고, 현지 치안 안내를 확인하세요.",
 also=[dict(source="Manager Online (MGR)", url="https://mgronline.com/south/detail/9690000100305")],
 issue=None,
 quick_replies=["고인의 명복을 빕니다", "남부 치안이 걱정돼요", "남은 용의자 빨리 잡히길"]),

dict(id="st2", topic="south", secondary=["life", "travel"], region="송클라(핫야이)",
 headline="핫야이 모노레일 논의 재가동…1단계 클롱와–승합차 터미널 12.5km·공항 연장 검토",
 summary=[
  "전 내무부 차관 니폰 분야마니가 대중교통공사(MRTA) 총재와 함께 핫야이 시장을 만나 철도 대중교통(모노레일) 추진을 협의했다고 방콕비즈뉴스가 16일 전했다.",
  "1단계는 클롱와–승합차 터미널 약 12.54km·12개 역으로, 과거 송클라 도행정기구 시절 연구에서 이어진다. 2단계는 터미널에서 핫야이 공항까지 연결을 검토하며 추가 연구에 약 1년, 건설은 연구 후 약 5년이 걸릴 수 있다고 했다.",
  "핫야이 시장과 MRTA 총재는 교통 혼잡 완화·남부 거점 도시 인프라로 필요하다고 화답했다."
 ],
 context="",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256594",
 title_th="“นิพนธ์”นำผู้ว่าฯ รฟม.ถกนายกนครหาดใหญ่ เดินหน้ารถไฟฟ้า โมโลเรล",
 published="2026-10-16T11:06:00+07:00",
 tags=["핫야이","모노레일","MRTA","송클라","공항"],
 impact=["교통·사고"], for_me="핫야이 거주·방문 예정이면 아직 착공 전 단계니, 단기 교통은 기존 송클람·툭툭·그랩을 기준으로 잡으세요.",
 also=[],
 issue=None,
 quick_replies=["핫야이에도 전철이!", "공항 연결이면 좋겠어요", "아직 연구는 더 필요하네요"]),

# ───────────── 정치·경제·사회 ─────────────
dict(id="pe1", topic="poleco", secondary=["bangkok"], region="방콕",
 headline="연준 워시 의장, 아누틴 총리와 면담…IMF·연준, 태국 재정 규율·스캠 단속 평가",
 summary=[
  "케빈 워시 미국 연방준비제도(연준) 의장이 16일 시리킷 국립컨벤션센터에서 아누틴 짠위라꾼 태국 총리를 면담했다고 탄셋타낏이 전했다. 연준 측은 IMF·세계은행 총회 운영과 정부 안정성을 평가했다고 보도됐다.",
  "엣니띠 재무장관은 포스트투데이에 IMF가 태국 재정 규율을 적절하다고 봤고, 10년물 국채 금리가 약 2.3~2.4%대라고 소개했다고 밝혔다. 세계은행은 태국이 선보인 소상공인용 소형 AI '녹끄라십'과 Bangkok Blueprint를 언급하며 호평했다고 했다.",
  "워시 의장은 태국의 온라인 스캠 단속 의지와 경찰·증권당국·중앙은행·관련 기관을 잇는 'Connect the Dots' 접근도 긍정적으로 봤다고 엣니띠 장관이 전했다."
 ],
 context="",
 source="Post Today (포스트투데이)", url="https://www.posttoday.com/business/750524",
 title_th="IMF-เฟด ชมไทย วินัยการคลังเหมาะสม ยก \"นกกระซิบ-Bangkok Blueprint\" ต้นแบบ",
 published="2026-10-16T17:41:00+07:00",
 tags=["연준","IMF","아누틴","재정","스캠"],
 impact=[], for_me="총회 관련 교통·보안은 완화 중이지만, 스캠 단속 강조 기조는 이어질 수 있으니 투자·송금 사기에 더 조심하세요.",
 also=[dict(source="Thansettakij (탄셋타낏)", url="https://www.thansettakij.com/economy/671606")],
 issue=None,
 quick_replies=["스캠 공조가 핵심이네요", "총회 끝난 뒤 분위기", "교민도 사기 주의"]),

dict(id="so1", topic="society", secondary=["visa"], region="방콕",
 headline="사이버경찰, 검찰과 스캠 '큰손' 추적 협의…은행 계좌 동결·정보 지연 개선 촉구",
 summary=[
  "틴꼰 랑맛 사이버수사경찰청장이 16일 대검찰청 수사국을 찾아 국외 스캠 조직의 실소유주 추적과 검찰·경찰 공조를 논의했다고 마티촌이 전했다.",
  "머피(대포 계좌)뿐 아니라 피해 자금을 실제로 챙긴 상위 가담자를 기소하는 경로, 해외 사건 관할, 다수 피의자 영장 기한 안에 보강 수사가 어려워지는 문제를 거론했다.",
  "은행과의 머피 계좌 정보·동결 공조가 늦거나 거부되는 사례가 있다며, 전 은행 경영진과 회의가 필요하다고 밝혔다. 오후에는 고위 검찰과도 스캠 사건 검토를 이어 갔다."
 ],
 context="",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/local/crime/news_5935949",
 title_th="ตำรวจไซเบอร์หารืออัยการ ล่าตัวการใหญ่สแกมเมอร์ เร่งประสานธนาคารอายัดเงิน–แก้ปมข้อมูลล่าช้า",
 published="2026-10-16T17:21:00+07:00",
 tags=["스캠","사이버경찰","검찰","대포통장","은행"],
 impact=["치안"], for_me="송금·투자 권유 문자는 일단 의심하고, 이미 보냈다면 은행에 즉시 동결을 요청한 뒤 경찰에 신고하세요.",
 also=[],
 issue=None,
 quick_replies=["큰손까지 가면 좋겠어요", "은행 동결이 핵심이죠", "교민 피해가 줄었으면"]),

# ───────────── 생활·여행·날씨 ─────────────
dict(id="lf1", topic="life", secondary=["weather"], region="",
 headline="상무부 '태국이 태국을 돕는다' 물가 완화…전국 3,036곳·최대 78% 할인(90일)",
 summary=[
  "상무부 내국무역국이 홍수·물가 부담을 덜기 위한 '태국이 태국을 돕는다 청깃발 생계비 완화' 프로젝트를 공개했다고 탄셋타낏이 16일 전했다. 기간은 10월 1일~12월 31일(90일), 판매 거점은 전국 3,036곳(방콕 300곳 포함)이다.",
  "상품·서비스 4,223개를 최대 78%까지 낮춰 팔며, 달걀·쌀·식용유·설탕과 침수 복구용품, 생필품 등이 포함된다. 내국무역국은 도지사·군수와 연계해 피해 지역에 우선 공급한다고 했다."
 ],
 context="",
 source="Thansettakij (탄셋타낏)", url="https://www.thansettakij.com/economy/671571",
 title_th="พาณิชย์ Kick off \"ไทยช่วยไทย ลดค่าครองชีพ\" ลดสูงสุด 78% ปักหมุด 3,036 จุดทั่วไทย",
 published="2026-10-16T11:35:00+07:00",
 tags=["물가","상무부","홍수","할인","청깃발"],
 impact=["환율·물가"], for_me="침수 피해를 보셨거나 생필품 값이 부담되면 거주지 군청·상무부 안내에 할인 판매점(청깃발) 위치를 물어보세요.",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["할인점 어디인지 궁금", "달걀·쌀이면 도움이 돼요", "90일이면 연말까지네요"]),

dict(id="lf2", topic="life", secondary=[], region="",
 headline="내일(17일) 휘발유·디젤 시세…PTT 기준 디젤 " + T("43") + "·가스홀 95 " + T("41") + "대",
 summary=[
  "방콕비즈뉴스가 16일 오후 공개한 17일 주유소 가격(PTT·PT·방짝·셸)에 따르면, PTT 기준 디젤은 리터당 " + T("42.94") + ", 디젤 B20은 " + T("37.19") + ", 가스홀 95는 " + T("41.44") + ", 가스홀 91은 " + T("41.07") + ", 가스홀 E20은 " + T("35.69") + ", 휘발유는 " + T("50.43") + "이다.",
  "PT·방짝·셸도 디젤·가스홀 주요 유종은 같은 수준으로 안내됐다. 기사에는 전일 대비 등락 폭은 따로 적히지 않았다."
 ],
 context="헤더 시세와 다를 수 있습니다. 실제 주유 전 앱·현장 가격을 확인하세요.",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256692",
 title_th="ราคาน้ำมันพรุ่งนี้ 17 ต.ค. 69 ปตท. บางจาก อัปเดต ราคาน้ำมันดีเซล แก๊สโซฮอล์",
 published="2026-10-16T18:08:00+07:00",
 tags=["유가","디젤","가스홀","PTT","17일"],
 impact=["환율·물가", "교통·사고"], for_me="내일 장거리 운전 전이면 PTT·방짝 앱에서 최종 리터당 가격을 한 번 더 확인하세요.",
 also=[],
 issue=None,
 quick_replies=["디젤이 아직 비싸네요", "가스홀 95 참고할게요", "등락은 내일 봐야겠어요"]),

dict(id="tr1", topic="travel", secondary=["visa"], region="",
 headline="오늘부터 수하물 X선 이상 시 승객 없이 개봉 가능…CAAT 새 공항 보안 규칙",
 summary=[
  "태국 민간항공국(CAAT)이 16일부터 위탁 수하물(항공기 화물칸)에 대해, X선에서 위험·금지·의심 물체가 나오면 승객이 자리에 없어도 지정 구역에서 개봉 검사할 수 있게 했다고 카오솟 영문판이 전했다.",
  "무작위 검사가 아니라 합리적 사유가 있을 때만 가능하며, 영상 등 증거를 남기고 사후에 승객에게 통지해야 한다. 기내 휴대 수하물에는 적용되지 않는다.",
  "CAAT는 TSA 인정 자물쇠 사용, 배터리·보조배터리·에어로졸은 규정 확인, 귀중품·서류는 기내로 가져가라고 권고했다. 파손·분실 의심 시 공항·항공사·CAAT 온라인 민원을 안내했다."
 ],
 context="",
 source="Khaosod English (카오솟 영문)", url="https://www.khaosodenglish.com/tourism/2026/10/16/thailand-allows-security-to-open-suspicious-checked-bags-under-new-airport-rules/",
 title_th="Thailand allows security to open suspicious checked bags under new airport rules",
 published="2026-10-16T16:14:00+07:00",
 tags=["CAAT","수하물","공항","보안","개봉검사"],
 impact=["교통·사고"], for_me="오늘 이후 태국 공항에서 출국하면 위탁 가방 안에 검사 안내문이 들어 있을 수 있습니다. 귀중품은 기내로 옮기세요.",
 also=[],
 issue=None,
 quick_replies=["출국 전 짐 다시 볼게요", "TSA 자물쇠가 좋겠네요", "통지는 꼭 해 줘야죠"]),

dict(id="wt1", topic="weather", secondary=["east", "south", "bangkok"], region="",
 headline="태국 기상청, 중부·동부·남부·방콕 비 60%…호우·강풍·산골 물 주의",
 summary=[
  "태국 기상청이 16일 오후 예보에서 중부·동부·남부와 방콕·인근에 뇌우 가능성이 60%에 달하고 일부는 호우·강풍이 있다고 카오솟·네이션이 전했다.",
  "중부에서는 롭부리·사라부리·우타이타니·차이낫·수판부리·아유타야·깐짜나부리·랏차부리·나콘파톰 등이, 동부에서는 나콘나욕·촌부리·라용·짠타부리·뜨랏이 거론됐다. 남부 만 쪽은 춤폰·수랏타니·나콘시탐마랏·송클라·얄라·나라티왓에 호우 가능성이 있다.",
  "약한 고기압이 북부·동북부 상층과 남중국해에 있어 동풍·남동풍이 습기를 밀어 올린다고 설명했다. 뇌우 해상은 파고 2m 초과 가능하다고 했다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/breaking-news/news_10439967",
 title_th="กรมอุตุนิยมวิทยา สภาพอากาศพรุ่งนี้ เตือน 3 ภาค-กทม. ฝนหนัก 60% เปิดชื่อจังหวัดโดนเต็มๆ",
 published="2026-10-16T17:10:00+07:00",
 tags=["기상청","호우","동부","남부","방콕"],
 impact=["날씨·재해", "교통·사고"], for_me="동부·방콕·남부 사시면 내일도 우산·침수 낮은 길을 피하고, 산기슭·클로옹 근처는 야간 외출을 줄이세요.",
 also=[dict(source="The Nation (네이션)", url="https://www.nationthailand.com/news/general/40072377")],
 issue=dict(id="2026-rain-warnings-oct", title="10월 초 비 경보(4~7일·11~14일)"),
 quick_replies=["동부도 60%네요", "우산 챙길게요", "남부 여행 미룰까요?"]),

dict(id="wt2", topic="weather", secondary=["life", "society"], region="",
 headline="재난청, 침수 20개 주+방콕…71만 가구·216만 명 영향(16일 06시 기준)",
 summary=[
  "재난방지완화청(DDPM)이 16일 06시 기준으로 북·중부 물과 호우로 20개 주와 방콕이 여전히 침수 영향을 받고 있다고 방콕비즈뉴스가 전했다. 90개 군·726개 면·5,329개 마을, 71만789가구·약 216만 명이다.",
  "포함된 주에는 핏사눌록·나콘사완·우타이타니·롭부리·싱부리·차이낫·수판부리·깐짜나부리·앙통·아유타야·사뭇쁘라칸·빠툼타니·나콘파톰·랏차부리·사뭇송크람·펫부리·나콘나욕·쁘라친부리·차층사오·촌부리와 방콕이 있다.",
  "동부 쪽에서는 나콘나욕·쁘라친부리·차층사오·촌부리 등에서 수위가 내려가는 지역과 사망자 집계가 함께 보고됐다. DDPM은 잔여 침수 구호와 함께 해소 지역 복구를 서두른다고 했다."
 ],
 context="",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256675",
 title_th="เปิดรายชื่อ 20 จังหวัด 'น้ำท่วม' กระทบ 7 แสนครัวเรือน ปภ. เร่งช่วยเหลือ-ฟื้นฟู",
 published="2026-10-16T16:40:00+07:00",
 tags=["재난청","침수","20개 주","방콕","구호"],
 impact=["날씨·재해"], for_me="아직 물이 남은 지역이면 군청·재난청 대피·구호 안내를 확인하고, 전기·식수는 안전 점검 후에 쓰세요.",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["아직 71만 가구라니", "동부도 포함이네요", "복구가 빨리 되길"]),
]

briefing = [
  B("bangkok", "IMF 반대 시위 **종료·6개 요구**…플런칫~나나 **도로 재개방**", "bk1"),
  B("east", "라용 전자폐기물 창고 **2,500톤↑ 압류**·DSI 검토", "ea1"),
  B("visa", "사업개발국·이민국 **노미니 특별팀** 가동", "vi1"),
  B("weather", "중부·동부·남부·방콕 **비 60%** 호우 주의", "wt1"),
  B("travel", "오늘부터 위탁 수하물 **승객 없이 개봉 검사** 가능", "tr1"),
  B("poleco", "연준 워시, 아누틴 면담…**재정·스캠 단속** 평가", "pe1"),
]

korea_top = [
  KR("추미애, 부천 화재 현장에서 '빨대 발언' 질문에 \"그런 얘기 하지 마시죠\"", "주간경향", "https://weekly.khan.co.kr/article/202610161711001", "2026-10-16T15:11:00+07:00"),
  KR("\"죽을 죄를 지었다\"… 인천 흉기난동범 50대 남성, 구속심사 출석", "조선일보", "https://www.chosun.com/national/incident/2026/10/16/JGHZLXZXBVDODJRK627RDW45IY/", "2026-10-16T12:10:00+07:00"),
  KR("이 대통령 \"부마항쟁 헌법에 담아야\"…기념사 마치며 울먹이기도", "YTN", "https://www.ytn.co.kr/_ln/0101_202610161543008534", "2026-10-16T13:43:00+07:00"),
  KR("이 대통령 지지율 39%…하락세 멈추고 2%p 반등 [갤럽]", "한겨레", "https://www.hani.co.kr/arti/politics/politics_general/1282707.html", "2026-10-16T08:34:00+07:00"),
  KR("조국 \"한동훈 딸 천재인지 특검으로 확인하자\"", "한겨레", "https://www.hani.co.kr/arti/politics/politics_general/1282714.html", "2026-10-16T11:29:00+07:00"),
  KR("특검, '평양 무인기' 윤석열에 2심도 징역 30년 구형", "한국경제", "https://www.hankyung.com/article/2026101662417", "2026-10-16T10:06:10+07:00"),
]

data = dict(
  id="2026-10-16-pm", date="2026-10-16", edition="pm", edition_label="저녁판",
  weekday="금요일", timezone="Asia/Bangkok (UTC+7)",
  coverage="10-16 아침판(07:27 BKK) 이후 ~ 10-16 18:15 BKK 보도. tools/collect.py --hours 14 + visa gnews. 원문 확인: Thai Post·The Thaiger·Matichon·Thansettakij·Khaosod·TOP NEWS·The Pattaya News·Khaosod English·The Nation·Siam Rath·Thairath·MGR·Bangkok Biz News·Post Today. 제외: 파타야 한국인 274일 오버스테이(10-15-pm 이미 게재)·Muaythai DTV 안내(원문 게재 10-02)·사무이 성매매 연루 오버스테이(선정)·Korean air-gun(선정). Google News 날짜만 새 옛 기사 제외. 한국 주요 뉴스는 data/korea.json(16:12 BKK) 6건 GN decode(MBC URL 상자 접속 실패→제외). X 트렌드 없음. 환율 1바트=40.11원.",
  previous="2026-10-16-am",
  briefing=briefing,
  highlights=["bk1", "ea1", "vi1"],
  stories=stories, korea_top=korea_top,
  fx=dict(THB_KRW=FX, note="1바트 = 40.11원(이 판의 모든 원화 환산에 사용, 정수로 반올림)",
          source="data/ticker.json(16:12 BKK 조회) THB_KRW 40.1114 — open.er-api.com, rate_time 2026-10-16 07:02 BKK. 18:15 BKK 직접 조회 같은 값(40.111402) 확인 → 40.11"),
)

if __name__ == "__main__":
    write_edition(data)
