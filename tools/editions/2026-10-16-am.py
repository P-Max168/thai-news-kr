# -*- coding: utf-8 -*-
"""2026-10-16 아침판 (07:08 정기 루틴).
저녁판(2026-10-15-pm) 이후 ~ 10-16 07:10 BKK 보도. tools/collect.py --hours 14.
모든 내용은 raw/2026-10-16-am/art/ 에 저장한 원문에서 확인한 것만 사용. trends 없음."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR, krw_for

FX = 39.83
def T(n):
    return "%s바트(%s)" % (n, krw_for(n, FX))

stories = [
# ───────────── 외국인·비자 ─────────────
dict(id="vi1", topic="visa", secondary=["north", "society"], region="치앙라이(매사이·판)",
 headline="치앙라이서 중국인 밀입국 잇따라 적발…메콩강 건너 '대기 숙소'에 6명, 승용차 2대에 10명",
 summary=[
  "태국 이민국은 치앙라이 매사이군 퐁파 지역 빠패 마을의 한 집을 덮쳐 태국인 2명(43세 '수'씨, 54세 '펀'씨)과 15~36세 중국인 6명을 붙잡았다고 카오솟이 전했다. 중국인들은 라오스 보께오주 톤픙의 골든트라이앵글 경제특구에서 배를 타고 메콩강을 건너 치앙센군의 비공식 경로로 들어왔다고 진술했다.",
  "태국인 2명은 '똔'이라는 사람의 부탁으로 9월 24일부터 이 집을 월 " + T("5,000") + "에 빌려 중국인들에게 음식과 물을 대 주고 1인당 " + T("200") + "을 받았다고 했으며, 불법 입국 외국인을 숨겨 준 혐의를 받는다.",
  "시암랏에 따르면 판군에서도 14일 저녁 경찰이 치앙라이 번호판을 단 흰색 마쓰다·혼다 승용차 2대를 세워 서류 없는 중국인 10명을 적발했다. 이들은 휴대전화 20대를 갖고 중부로 가던 중이었고, 운전한 태국인 2명(39세 남성·28세 여성)도 입건됐다."
 ],
 context="국경 지역에선 외국인을 태우거나 재워 주기만 해도 '불법 입국자 은닉' 혐의가 될 수 있습니다. 모르는 사람이 운전·숙소를 부탁하며 돈을 주겠다고 하면 거절하는 편이 안전합니다.",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/around-thailand/news_10439010",
 title_th="สกัด ขบวนการลักลอบนำคนต่างด้าว เข้าเมืองผิดกฎหมาย รวบ 2 คนไทย 6 ชาวจีน",
 published="2026-10-15T21:33:00+07:00",
 tags=["밀입국","치앙라이","메콩강","골든트라이앵글","중국인"],
 impact=["비자·체류", "치안"], for_me="치앙라이·국경 쪽을 여행하다 낯선 사람이 차를 태워 달라거나 숙소를 대신 잡아 달라고 하면 정중히 거절하세요.",
 also=[],
 issue=None,
 quick_replies=["국경은 늘 조심해야겠네요", "돈 몇 푼에 이런 일을…", "단속이 계속되면 좋겠어요"]),

dict(id="vi2", topic="visa", secondary=["poleco"], region="방콕",
 headline="한국·태국 제2차 전략대화 방콕서 열려…CEPA 조기 타결·온라인 스캠 공동 대응 논의",
 summary=[
  "한국 외교부 박윤주 제1차관과 태국 외교부 엑시리 삔따루찌 사무차관이 14일 방콕에서 제2차 한-태국 전략대화를 열었다고 외교문화뉴스가 전했다. 1차 대화는 2025년 11월 서울에서 열렸다.",
  "양측은 한-태국 경제동반자협정(CEPA) 조기 타결, 공동 산업단지와 지식재산권 보호를 논의했고, 한국 측은 태국에 진출한 한국 기업 지원을 요청했다. 인공지능·신기술·보건·청정에너지 협력과 인적·문화·관광 교류 확대도 다뤘다.",
  "온라인 스캠과 마약 같은 국경을 넘는 범죄에 함께 대응할 필요성에도 공감했으며, 2028년 수교 70주년을 앞두고 한-아세안·한-메콩 협력도 의견을 나눴다."
 ],
 context="",
 source="외교문화뉴스", url="https://www.dcnews.kr/news/articleView.html?idxno=3062",
 title_th="한-태국, 제2차 전략대화 개최…수교 70주년 앞두고 경제·안보·미래산업 협력 강화",
 published="2026-10-15T18:58:00+07:00",
 tags=["한국","전략대화","CEPA","온라인 스캠","수교 70주년"],
 impact=[], for_me="한-태국 CEPA가 타결되면 무역·투자 조건이 바뀔 수 있으니, 태국에서 사업하는 분은 후속 발표를 지켜보세요.",
 also=[],
 issue=None,
 quick_replies=["교민 입장에선 반가운 소식", "스캠 공조가 꼭 성과를 냈으면", "CEPA는 언제 타결될까요?"]),

# ───────────── 동부 ─────────────
dict(id="ea1", topic="east", secondary=["society"], region="촌부리(보텅군)",
 headline="촌부리 보텅서 미얀마 노동자 태운 6륜 트럭 전복…\"브레이크 고장\" 59명 다쳐",
 summary=[
  "15일 오후 촌부리 보텅군 왓수완 지역(쁘록파–보텅 도로)에서 미얀마 노동자 60~70명을 태운 6륜 화물 트럭이 길옆 깊은 도랑으로 굴러 뒤집혔다고 데일리뉴스가 전했다. 다친 59명은 보텅 병원으로 옮겨졌다.",
  "35세 운전사는 파인애플 공장에서 일을 마친 직원들을 숙소로 데려다주던 중 브레이크가 한쪽 바퀴만 잠기는 고장이 나 차가 미끄러졌다고 진술했다. 경찰은 차량 상태를 조사하고 법적 처리를 검토하고 있다."
 ],
 context="공장 통근 트럭 짐칸에 많은 사람을 태우는 일이 동부 공단 지역에선 흔해 비슷한 사고가 반복됩니다. 직원을 차로 실어 나른다면 차량 점검과 정원을 챙겨 보세요.",
 source="Daily News (데일리뉴스)", url="https://www.dailynews.co.th/news/6277559/",
 title_th="รถหกล้อขนแรงงานพม่าเบรกแตก! เสียหลักตกข้างทาง บาดเจ็บ 59 ราย",
 published="2026-10-15T22:58:00+07:00",
 tags=["보텅","트럭 전복","미얀마 노동자","촌부리","교통사고"],
 impact=["교통·사고"], for_me="보텅·쁘록파 쪽 지방도는 커브와 도랑이 많아 비 온 뒤엔 특히 조심해서 달리세요.",
 also=[dict(source="FM91 (FM91 교통방송)", url="https://www.fm91bkk.com/newsarticle/80507")],
 issue=None,
 quick_replies=["다친 분들 빨리 회복하시길", "짐칸에 너무 많이 태워요", "차량 점검 의무화했으면"]),

dict(id="ea2", topic="east", secondary=[], region="파타야(나끌르아 란포)",
 headline="파타야 '란포 나끌르아 주차 빌딩' 손본다…경사로 시야 개선·과속방지턱·보행로 표시",
 summary=[
  "파타야시 관계자들이 15일 나끌르아 란포 주차 빌딩의 진입·진출 경사로를 점검했다고 더파타야뉴스가 전했다. 공간이 좁고 시야가 가려 회전이 어렵고 벽에 차를 긁는 일이 잦다는 운전자 불만이 이어졌기 때문이다.",
  "시는 내려가는 경사로의 시야를 가리는 차단물을 조정하고 입구에 과속방지턱을 설치하며, 보행자 통로를 따로 표시하는 방안을 검토 중이다. 시 관계자는 건물 구조상 한계가 있다며, 처음 가는 운전자는 각별히 조심하거나 다른 주차장을 이용해 달라고 했다."
 ],
 context="",
 source="The Pattaya News (더파타야뉴스)", url="https://thepattayanews.com/2026/10/15/pattaya-plans-safety-improvements-at-lan-pho-naklua-parking-building-after-driver-complaints/",
 title_th="Pattaya Plans Safety Improvements at Lan Pho Naklua Parking Building After Driver Complaints",
 published="2026-10-15T18:51:00+07:00",
 tags=["란포","나끌르아","주차장","파타야시","경사로"],
 impact=["교통·사고"], for_me="란포 시장·공원 갈 때 주차 빌딩 경사로가 처음이면 천천히 내려가거나 주변 다른 주차장을 이용하세요.",
 also=[],
 issue=None,
 quick_replies=["거기 경사로 정말 무서워요", "빨리 고쳐졌으면", "저는 다른 데 세워요"]),

dict(id="ea3", topic="east", secondary=["weather"], region="라용·촌부리(EEC)",
 headline="동부 EEC 넝쁠라라이 저수지 106%로 넘쳐…쁘라세 89%·방프라 86%, 남부는 17~20일 폭우 대비",
 summary=[
  "태국 국가수자원청(ONWR)은 15일 기준 라용의 넝쁠라라이 저수지 저수량이 1억7,400만㎥로 용량의 106%에 이르러 긴급 관리에 들어갔다고 밝혔다고 방콕비즈뉴스가 전했다. 같은 동부경제회랑(EEC)의 쁘라세 저수지(라용)는 89%, 촌부리 방프라 저수지는 86%다.",
  "전국 대·중형 저수지 저수율은 82%이고 동부 지역은 87%, 서부는 96%로 특히 높다. 짜오프라야 댐은 초당 1,800㎥를 계속 방류 중이며, 북부·동북부 등 윗지방은 곧 비가 줄겠지만 남부는 17~20일 매우 많은 비에 대비하라고 당부했다."
 ],
 context="저수지가 가득 차면 큰비가 올 때 방류량을 늘릴 수밖에 없어 하류 저지대 침수 위험이 커집니다. 라용·촌부리 저수지 하류에 사는 분은 지역 방류 안내를 챙겨 보세요.",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256541",
 title_th="สทนช. เผย ภาคใต้ ฝนตกหนัก 17-20 ต.ค. ด้าน เขื่อน EEC น้ำทะลักเกิน 100%",
 published="2026-10-15T20:45:00+07:00",
 tags=["넝쁠라라이","저수지","EEC","라용","국가수자원청"],
 impact=["날씨·재해"], for_me="라용·촌부리 저지대라면 비 예보가 있는 날 저수지 방류 공지를 확인하고 차량·귀중품을 높은 곳에 두세요.",
 also=[],
 issue=None,
 quick_replies=["106%면 정말 꽉 찼네요", "방류 소식 잘 알려 주세요", "올해 비가 너무 많아요"]),

dict(id="ea4", topic="east", secondary=["society"], region="파타야(세컨드 로드)",
 headline="파타야 세컨드 로드 '보도 위 주차' 단속…위반 차량 적발해 벌금 처분",
 summary=[
  "파타야시 단속반이 세컨드 로드 보도에 올라가 세운 차량들을 적발해 위반 기록을 작성하고 시 단속센터에서 벌금을 내도록 했다고 파타야메일이 전했다. 흰색 승합차가 보도에 올라가 보행 공간을 막는 모습도 포착됐다.",
  "보도를 막은 차량 때문에 보행자가 차도로 돌아가야 해 장애인·노인·아이 동반 가족·관광객이 특히 불편을 겪는다며, 시는 보행 공간을 되찾기 위해 단속을 이어 가겠다고 밝혔다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/news/pattaya-fights-to-reclaim-pavements-from-vehicles-invading-pedestrian-space-568652",
 title_th="Pattaya fights to reclaim pavements from vehicles invading pedestrian space",
 published="2026-10-16T03:50:00+07:00",
 tags=["세컨드 로드","보도 주차","파타야시","단속","보행자"],
 impact=["교통·사고"], for_me="세컨드 로드에서 잠깐이라도 보도에 차·오토바이를 올려 세우면 벌금 대상이니 주차장을 이용하세요.",
 also=[],
 issue=None,
 quick_replies=["보도 걷기 정말 힘들었어요", "오토바이도 단속했으면", "계속 단속해 주세요"]),

# ───────────── 방콕 ─────────────
dict(id="bk1", topic="bangkok", secondary=["poleco", "society"], region="방콕(라마 4세로·끌렁떠이)",
 headline="방콕 IMF·세계은행 총회 반대 시위서 몸싸움…경찰청장 \"강경 진압 지시 안 해\", 시위대는 라마 4세로서 밤샘",
 summary=[
  "15일 오전 라마 4세로 육교에 현수막을 걸려던 시위대와 경찰이 충돌해 부상자가 나왔다고 타이이그재미너가 전했다. 시암 분솜 방콕 경찰청장은 무력 사용을 지시하지 않았고 의사소통 착오였다며, 다친 사람은 경찰이나 국가인권위원회에 신고할 수 있다고 밝혔다. 현장에는 경찰병원 의료진이 배치됐다.",
  "'국민 네트워크' 시위대는 7가지 긴급 요구안을 내고 라마 4세로 교차로에서 밤샘 농성에 들어갔으며, 경찰은 주변에 병력을 배치했다고 방콕비즈뉴스·카오솟이 전했다.",
  "JS100에 따르면 태국 민간항공청(CAAT)은 총회 경호를 위해 16일 0시 1분부터 밤 11시 59분까지 'VT R1 방콕 시티' 구역에서 드론 비행을 금지했다."
 ],
 context="총회장이 있는 퀸 시리킷 컨벤션센터 주변은 통제와 시위가 겹쳐 차가 막힐 수 있습니다. 오늘 라마 4세로·끌렁떠이·아속 쪽 이동은 대중교통과 여유 시간을 잡으세요.",
 update="저녁판(10-15)은 펀찟 도로 통제·시리킷역 폐쇄 일정을 전했고, 이번엔 시위 충돌과 밤샘 농성, 오늘 드론 금지가 더해졌습니다.",
 source="Thai Examiner (타이이그재미너)", url="https://www.thaiexaminer.com/thai-news-foreigners/2026/10/15/protests-at-the-imf-world-bank-meetings-turn-violent-but-bangkok-police-strongly-deny-being-heavy-handed/",
 title_th="Protests at the IMF World Bank meetings turn violent but Bangkok police strongly deny being heavy handed",
 published="2026-10-15T21:07:00+07:00",
 tags=["IMF","세계은행","시위","라마 4세로","드론 금지"],
 impact=["치안", "교통·사고"], for_me="오늘 라마 4세로·시리킷 센터 주변은 시위와 통제가 겹치니 피하고, 드론은 방콕 시내에서 날리지 마세요.",
 also=[dict(source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256531"),
       dict(source="Khaosod (카오솟)", url="https://www.khaosod.co.th/around-thailand/news_10439081")],
 issue=None,
 quick_replies=["다친 분이 없었으면 했는데", "오늘 그쪽은 피해야겠네요", "평화 시위였으면 좋겠어요"]),

dict(id="bk2", topic="bangkok", secondary=["society"], region="방콕 동부·북부 10곳",
 headline="방콕시, 오늘 침수 지역 10곳에 무료 이동 진료소…반려동물 광견병 백신도",
 summary=[
  "방콕시(BMA)는 16일 오전 8시~오후 2시 홍수 피해 지역 10곳에 무료 이동 진료소를 연다고 타생낏이 전했다. 라드끄라방(케하 롬끌라오), 방켄, 쁘라웻(넝본), 돈므앙, 사판숭, 클렁삼와, 민부리, 넝쪽, 사이마이, 붕꿈의 공동체·사원·학교 등이다.",
  "건강 검진, 상처 치료, 상비약·무좀약, 파상풍 예방접종을 해 주며, 쁘라웻·붕꿈·사이마이·돈므앙·방켄 5곳에서는 반려동물 기본 진료와 광견병 백신, 마이크로칩 등록, 사료 나눔도 한다."
 ],
 context="침수 지역을 오래 걸으면 무좀이나 상처 감염이 생기기 쉽습니다. 발에 상처가 있거나 붓는다면 이런 무료 진료소나 가까운 병원에서 일찍 보이세요.",
 source="Thansettakij (타생낏)", url="https://www.thansettakij.com/health-wellness/health/671554",
 title_th="หน่วยแพทย์เคลื่อนที่ กทม. 10 จุด ตรวจสุขภาพ-รักษาโรคหลังน้ำท่วมฟรี 16 ต.ค.นี้",
 published="2026-10-16T03:00:00+07:00",
 tags=["방콕시","이동 진료소","홍수","광견병 백신","라드끄라방"],
 impact=["날씨·재해"], for_me="라드끄라방·민부리·돈므앙 등에 살고 침수 뒤 발 상처나 무좀이 생겼다면 오늘 오후 2시 전 가까운 진료소를 찾아보세요.",
 also=[],
 issue=dict(id="2026-floods-bangkok-east", title="방콕 동부(라드끄라방·롬끌라오) 침수"),
 quick_replies=["반려동물까지 챙겨 줘서 고마워요", "이런 정보 정말 필요해요", "무좀 고생하는 분 많아요"]),

dict(id="lf1", topic="life", secondary=["bangkok"], region="방콕 동부",
 headline="태국 부동산업계 '홍수 대비' 설계 바꾼다…롬끌라오·라드끄라방·민부리 수요 약화 우려",
 summary=[
  "올해 홍수로 주거 단지와 공단의 약점이 드러나자 태국 부동산 개발사들이 부지와 진입로를 높이고 저류지와 펌프를 늘리며 차수벽을 강화하는 등 설계를 고치고 있다고 파타야메일이 전했다. 저층 단지는 진입로를 20~30㎝ 높이고 담장을 올리는 방안을 검토 중이다.",
  "다만 단지 안을 막아도 바깥 공공도로 침수는 못 막는다며 업계는 운하 정비와 배수 펌프 확충을 요구했다. 방콕 동부 롬끌라오·라드끄라방·민부리는 심한 침수로 수요가 약해질 수 있고, 집을 살 때 침수 이력·지대 높이·배수 능력을 더 꼼꼼히 볼 것이라는 전망이다. 실제 집값 하락이나 대규모 이주로 이어질지는 아직 불확실하다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/latestnews/news/thailand-property-sector-rethinks-flood-defenses-as-buyers-reassess-risky-locations-568629",
 title_th="Thailand property sector rethinks flood defenses as buyers reassess risky locations",
 published="2026-10-16T03:44:00+07:00",
 tags=["부동산","홍수","롬끌라오","콘도","주택 구매"],
 impact=["날씨·재해"], for_me="방콕에서 집·콘도를 구하거나 계약을 갱신한다면 올해 침수 여부와 단지 배수 설비를 먼저 물어보세요.",
 also=[],
 issue=dict(id="2026-floods-economy", title="홍수 경제 피해 추산"),
 quick_replies=["집 구할 때 꼭 물어봐야겠네요", "동부 쪽은 걱정이에요", "배수부터 고쳐야죠"]),

# ───────────── 여행 ─────────────
dict(id="tr1", topic="travel", secondary=["bangkok"], region="방콕(위파와디 본사)",
 headline="타이항공, 홍수 때 지연·결항·수하물 피해 보상 접수…오늘 오후 1시부터 본사 고객센터",
 summary=[
  "타이항공은 9월 26~30일 홍수로 항공편이 늦어지거나 취소되고 수하물을 늦게 받은 승객의 보상 신청을 받는 고객센터를 방콕 위파와디랑싯로 본사 3동 1층에 연다고 타이PBS가 전했다. 16일은 오후 1~4시, 17일부터는 휴일 포함 매일 오전 8시 30분~오후 4시에 운영하며 온라인으로도 신청할 수 있다.",
  "신청할 땐 신분증이나 여권, 전자항공권 번호 또는 탑승권, 수하물표 번호와 지연·결항으로 쓴 비용의 증빙을 준비해 달라고 했다."
 ],
 context="해외 결제 영수증·숙박비 내역처럼 지연 때문에 추가로 든 비용 증빙이 있으면 보상 심사에 도움이 됩니다. 사진으로라도 모아 두세요.",
 source="Thai PBS (타이PBS)", url="https://www.thaipbs.or.th/news/content/571080",
 title_th="การบินไทยเปิดรับคำร้องขอเยียวยา ผู้โดยสารที่ได้รับผลกระทบจากน้ำท่วม เริ่ม 16 ต.ค.",
 published="2026-10-15T19:59:00+07:00",
 tags=["타이항공","보상","항공편 지연","수하물","홍수"],
 impact=["교통·사고"], for_me="9월 말 타이항공 지연·결항이나 짐 분실을 겪었다면 여권·탑승권·영수증을 챙겨 오늘 오후부터 본사나 온라인으로 신청하세요.",
 also=[],
 issue=dict(id="2026-floods-airport-thai", title="수완나품·타이항공 홍수 차질"),
 quick_replies=["저도 그때 짐 늦게 받았어요", "온라인 신청이 편하겠네요", "보상이 제대로 됐으면"]),

# ───────────── 북부 ─────────────
dict(id="no1", topic="north", secondary=["travel", "society"], region="매홍손(반락타이)",
 headline="매홍손 관광 명소 '반락타이' 숲 침범 리조트 조사…주인 없어, 죽은 큰 나무 4그루 확인",
 summary=[
  "매홍손 행정 당국은 산림청, 마을 이장과 함께 무앙매홍손군 목짬패 지역 반락타이 6마을의 한 리조트를 찾아 숲 침범 여부를 측량했다고 MGR온라인이 전했다. 주인이나 관리인은 없었고, 침범 의심 구역에서 원인 모를 이유로 말라 죽은 큰 나무 4그루를 확인해 증거를 수사관에게 넘겼다.",
  "반락타이는 윈난 출신 중국계 마을의 흙집과 호수 풍경으로 세계적인 인기를 얻은 관광지이지만, 숙소가 잇따라 들어서면서 옛 마을 모습이 거의 사라졌다는 지적이 나왔다."
 ],
 context="",
 source="MGR Online (MGR온라인)", url="https://mgronline.com/local/detail/9690000100072",
 title_th="จนท.บุกตรวจรีสอร์ตรุกป่าบ้านรักไทย ชุมชนท่องเที่ยวแม่ฮ่องสอนชื่อชั้นดังระดับโลก",
 published="2026-10-15T19:31:00+07:00",
 tags=["반락타이","매홍손","숲 침범","리조트","산림청"],
 impact=[], for_me="반락타이 여행을 계획한다면 숙소가 정식 등록 업소인지 예약 전에 한 번 확인해 보세요.",
 also=[dict(source="Amarin TV (아마린TV)", url="https://www.amarintv.com/news/social/560359")],
 issue=None,
 quick_replies=["예전 모습이 그리워요", "자연은 지켜야죠", "가 보고 싶던 곳인데요"]),

dict(id="no2", topic="north", secondary=["society"], region="치앙마이",
 headline="치앙마이대 병원서 태국 첫 '자연 일란성 네쌍둥이' 출산…산모·아기 모두 무사",
 summary=[
  "치앙마이대학교 마하랏 나콘 치앙마이 병원 의료진이 한 난자에서 나와 태반 하나를 함께 쓴 자연 임신 일란성 네쌍둥이를 무사히 받아냈다고 치앙라이타임스가 전했다. 태국에서 처음 보고된 사례로, 전 세계적으로 약 70만 건에 1건꼴인 매우 드문 경우다.",
  "산모는 매사리앙군 산간 지역의 33세 여성으로, 처음엔 세쌍둥이로 알았다가 정밀 초음파에서 넷째가 확인됐다. 임신 29주 5일째 새벽 진통이 와 응급 제왕절개로 출산했고, 산모와 네 아기는 신생아 집중치료실에서 회복 중이다."
 ],
 context="",
 source="Chiang Rai Times (치앙라이타임스)", url="https://www.chiangraitimes.com/chiang-mai/chiang-mai-mother-quadruplets/",
 title_th="Chiang Mai Mother Gives Birth to Rare Identical Quadruplets",
 published="2026-10-16T06:36:00+07:00",
 tags=["네쌍둥이","치앙마이대","마하랏 병원","매사리앙","출산"],
 impact=[], for_me="",
 also=[],
 issue=None,
 quick_replies=["정말 축하드려요!", "의료진 대단하네요", "아기들 건강하게 자라길"]),

# ───────────── 남부 ─────────────
dict(id="st1", topic="south", secondary=["society"], region="얄라(반낭사따군)",
 headline="얄라 반낭사따 레인저 기지에 폭탄 2발 투척…1발 터져 5명 부상",
 summary=[
  "15일 저녁 6시 45분께 얄라 반낭사따군 반낭사따 3마을 응오까뽀 지역의 레인저 작전기지에 정체불명의 괴한이 폭탄 2발을 던졌다고 타이랏이 전했다. 1발은 대원 숙소 쪽에서 터졌고 1발은 터지지 않았다.",
  "레인저 대원 5명이 귀 출혈·다리 부상·이명과 두통 등으로 다쳐 반낭사따 병원으로 옮겨졌으며, 당국은 경위를 조사하고 있다."
 ],
 context="얄라·빳따니·나라티왓 일부 지역은 한국 외교부 여행경보가 높게 걸린 곳입니다. 남부 국경 지역 방문 전에는 해외안전여행 사이트에서 최신 경보를 확인하세요.",
 source="Thairath (타이랏)", url="https://www.thairath.co.th/news/crime/2966462",
 title_th="ป่วนยะลา คนร้ายขว้างระเบิด 2 ลูก ใส่ฐานปฏิบัติการ ชคต.บันนังสตา บาดเจ็บ 5 นาย",
 published="2026-10-15T21:07:00+07:00",
 tags=["얄라","반낭사따","폭탄","레인저","남부 국경"],
 impact=["치안"], for_me="남부 국경 3개 주를 오가야 한다면 밤 이동을 줄이고 현지 당국 안내를 따르세요.",
 also=[dict(source="Matichon (마티촌)", url="https://www.matichon.co.th/region/news_5934585")],
 issue=None,
 quick_replies=["다친 대원분들 쾌유를 빌어요", "남부는 언제쯤 평화로울까요", "늘 걱정되는 지역이에요"]),

dict(id="st2", topic="south", secondary=["travel"], region="푸껫(빠똥)",
 headline="푸껫 빠똥서 28일~11월 1일 아시아 첫 '인터프라이드 세계 총회'",
 summary=[
  "세계 성소수자(LGBTQ+) 프라이드 행사 주최자들의 모임인 '인터프라이드 총회·세계 콘퍼런스 2026'이 28일부터 11월 1일까지 푸껫 빠똥 비치에서 '아시아의 진주'를 주제로 열린다고 파타야메일이 전했다. 아시아에서 열리는 것은 처음이다.",
  "인권·정신 건강·허위 정보 대응 등 12개 워크숍과 태국 혼인 평등 경험, 드래그 문화 세션이 열리고, 빠똥 거리 드래그 공연 등 푸껫 문화 체험도 마련된다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/thailandnews/phuket-hosts-asias-first-interpride-world-conference-oct-28-nov-1-568598",
 title_th="Phuket hosts Asia's first InterPride world conference Oct 28 - Nov 1",
 published="2026-10-16T01:58:00+07:00",
 tags=["푸껫","빠똥","인터프라이드","LGBTQ+","국제회의"],
 impact=[], for_me="10월 말~11월 초 빠똥에 머문다면 행사로 숙소·교통이 붐빌 수 있으니 미리 예약하세요.",
 also=[],
 issue=None,
 quick_replies=["푸껫이 더 붐비겠네요", "태국다운 행사네요", "그때 푸껫 가는데 참고할게요"]),

# ───────────── 날씨 ─────────────
dict(id="wt1", topic="weather", secondary=["east", "south"], region="전국",
 headline="태국 기상청 \"오늘 31개 주 비\"…동부 촌부리·라용 포함, 17일부터 윗지방 비 줄고 남부는 계속",
 summary=[
  "태국 기상청(TMD)은 16일 하부 북부·중부·동부·남부에 곳에 따라 많은 비가 내리겠다고 예보했다고 카오솟이 전했다. 동부는 촌부리·라용·짠타부리·뜨랏에 많은 비가 예상되고 뇌우가 칠 때 파도가 2m 넘게 일겠다. 방콕과 주변은 지역의 60%에 뇌우와 돌풍이 있겠다.",
  "타생낏에 따르면 17~21일에는 찬 공기 영향으로 북부·동북부·중부·동부 등 윗지방은 비가 눈에 띄게 줄지만, 남부는 몬순 기압골 영향으로 많은 비가 이어져 돌발 홍수와 산사태에 주의해야 한다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/breaking-news/news_10439166",
 title_th="สภาพอากาศวันนี้ กรมอุตุฯ เปิดชื่อ 31 จังหวัด ฝนฟ้าคะนอง ลมแรงมาก",
 published="2026-10-16T06:09:00+07:00",
 tags=["태국 기상청","폭우","촌부리","남부","주말 날씨"],
 impact=["날씨·재해"], for_me="오늘 파타야·시라차 출퇴근은 우산과 여유 시간을 챙기고, 주말 남부 여행은 출발 전 예보를 다시 확인하세요.",
 also=[dict(source="Thansettakij (타생낏)", url="https://www.thansettakij.com/general-news/671531")],
 issue=None,
 quick_replies=["드디어 비가 줄어든다니", "남부는 계속 조심해야겠네요", "주말엔 맑았으면"]),

# ───────────── 사회 ─────────────
dict(id="so1", topic="society", secondary=["weather"], region="차층사오(방남프리아우군)",
 headline="차층사오 침수로 낚시터 '앨리게이터 가' 300여 마리 탈출…길이 2~3m, \"잡아도 먹지 마세요\"",
 summary=[
  "차층사오 방남프리아우군 살라댕 13마을의 대형 낚시터 '붕삼란'이 4주 가까이 물에 잠기면서 기르던 물고기 20~30톤이 물살에 휩쓸려 나갔다고 카오솟이 전했다. 17~18년 동안 키운 길이 2~3m짜리 앨리게이터 가(악어 주둥이 물고기)도 300마리 넘게 빠져나간 것으로 추정된다.",
  "69세 주인은 숙소·방갈로·식당이 모두 잠겨 수입이 끊겼지만 직원 100명 가까이에게 월급과 식사를 계속 주고 있다며 배수를 서둘러 달라고 호소했다. 주민들은 위험한 곳에서 물고기를 잡지 말고, 정체를 모르는 물고기, 특히 독이 있다고 알려진 앨리게이터 가의 알은 먹지 말라는 당부를 받았다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/around-thailand/news_10438858",
 title_th="ผวา ปลาอัลลิเกเตอร์ ขนาด 2-3 เมตร หลุดออกจากบ่อกว่า 300 ตัว หลังน้ำท่วมบึงสำราญ",
 published="2026-10-15T18:48:00+07:00",
 tags=["차층사오","앨리게이터 가","홍수","낚시터","외래 어종"],
 impact=["날씨·재해"], for_me="차층사오·방콕 동부 물가에서 낯선 큰 물고기를 보면 직접 잡지 말고 수산 당국에 알리세요.",
 also=[],
 issue=dict(id="2026-floods-chachoengsao", title="차층사오 침수"),
 quick_replies=["2~3m라니 무섭네요", "생태계가 걱정돼요", "주인분도 힘드시겠어요"]),

# ───────────── 정치·경제 ─────────────
dict(id="pe1", topic="poleco", secondary=[], region="",
 headline="한화오션 태국 호위함 본계약 '난항' 관측…새 해군 사령관 취임·탈락 업체 이의 제기",
 summary=[
  "한화오션이 지난 9월 우선협상대상자로 뽑힌 태국 해군 4,000톤급 차세대 호위함 사업(총사업비 " + T("167억3,000만") + ")이 본계약 승인 단계에서 걸림돌을 만났다는 관측이 나왔다고 한국신용신문이 외신과 방산업계를 인용해 전했다.",
  "10월 1일 취임한 지라폰 웡윗 태국 해군 사령관 체제가 예산 제약과 법적 위험을 이유로 승인에 신중하다는 것이다. 입찰에 참여했다 떨어진 4개 업체는 한화오션 제안이 현지 부품 조달·기술 이전 기준을 충족하지 못했다며 이의를 제기했고, 태국 해군은 앞서 선정 과정이 공정했다고 반박했다. 태국은 2037년까지 신형 호위함 8척을 들일 계획이다."
 ],
 context="",
 source="한국신용신문", url="https://www.creditnews.kr/news/articleView.html?idxno=31732",
 title_th="6,800억 태국 호위함 수주 한화오션…신임 사령관 제동에 난항",
 published="2026-10-16T05:02:00+07:00",
 tags=["한화오션","호위함","태국 해군","방산","한국 기업"],
 impact=[], for_me="",
 also=[],
 issue=None,
 quick_replies=["한국 기업이 꼭 따냈으면", "공식 발표를 기다려 봐야겠네요", "방산 수주는 변수가 많네요"]),

# ───────────── 연예·스포츠 ─────────────
dict(id="en1", topic="ent", secondary=[], region="",
 headline="태국 사이클 팀 스프린트, 세계선수권서 태국 신기록 44.183초…LA 올림픽 출전권 경쟁 시작",
 summary=[
  "태국 남자 팀 스프린트 대표팀이 중국 상하이에서 열린 UCI 트랙 세계선수권에서 44.183초로 태국 신기록을 세우며 전체 13위, 아시아 3위에 올랐다고 방콕포스트가 전했다. 2028년 LA 올림픽 출전 포인트 787.5점을 얻었다.",
  "1라운드에서 아시안게임 동메달을 다퉜던 홍콩(44.787초)과 말레이시아(44.851초)를 앞섰다. 대표팀은 44초 벽을 깨 아시아 동메달권을 노린다는 목표다."
 ],
 context="",
 source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/sports/3337730/thai-sprinters-set-national-record-as-la-push-begins",
 title_th="Thai sprinters set national record as LA push begins",
 published="2026-10-16T06:08:00+07:00",
 tags=["사이클","팀 스프린트","세계선수권","태국 신기록","LA 올림픽"],
 impact=[], for_me="",
 also=[],
 issue=None,
 quick_replies=["태국 선수들 화이팅!", "신기록 축하해요", "올림픽까지 가길"]),
]

briefing = [
  B("bangkok", "IMF 총회 반대 시위서 **몸싸움·밤샘 농성**…오늘 방콕 시내 **드론 금지**", "bk1"),
  B("east", "보텅서 미얀마 노동자 태운 트럭 전복, **59명 부상**", "ea1"),
  B("visa", "치앙라이 중국인 밀입국 **2건·16명** 적발", "vi1"),
  B("east", "EEC 넝쁠라라이 저수지 **106%**…남부는 **17~20일 폭우** 대비", "ea3"),
  B("travel", "타이항공 홍수 피해 보상 접수 **오늘 오후 1시**부터", "tr1"),
  B("visa", "한-태 전략대화서 **CEPA 조기 타결·스캠 공조** 논의", "vi2"),
]

korea_top = [
  KR("전작권 전환 \"새 기준\" 밝힌 미국…국방부 \"골대 옮기면 영원히 불가\"", "한겨레", "https://www.hani.co.kr/arti/politics/defense/1282649.html", "2026-10-15T22:56:00+07:00"),
  KR("정부, 청해부대 작전범위 오만만으로 확대·해상초계기 1대 파견 검토…호르무즈 파병엔 '선 긋기'", "경향신문", "https://www.khan.co.kr/article/202610152012001", "2026-10-15T18:12:00+07:00"),
  KR("이 대통령 위례 사건에 '검찰 수사 위법성 단정 어렵다'…미래위, 보완조사 요구", "한겨레", "https://www.hani.co.kr/arti/society/society_general/1282646.html", "2026-10-15T23:00:00+07:00"),
  KR("북한도 신압록강대교 개통 보도…\"중국과 경제적 연계 강화\"", "연합뉴스", "https://www.yna.co.kr/view/AKR20261016011500504", "2026-10-16T05:00:35+07:00"),
  KR("'1억 공천헌금' 강선우, 1심 실형에 항소…선고 하루 만", "조선일보", "https://www.chosun.com/national/court_law/2026/10/15/HQ3JOLXNUJHMZAVQ7PMNIQLY7M/", "2026-10-15T17:12:08+07:00"),
  KR("공수처 \"조희대 업무추진비 수사 예정\", 중수청장 후보자 \"수사 가능\"", "뉴스타파", "https://newstapa.org/article/iEFEh", "2026-10-15T08:55:50+07:00"),
]

data = dict(
  id="2026-10-16-am", date="2026-10-16", edition="am", edition_label="아침판",
  weekday="금요일", timezone="Asia/Bangkok (UTC+7)",
  coverage="10-15 저녁판(18:25 BKK) 이후 ~ 10-16 07:10 BKK 보도. tools/collect.py --hours 14. 원문 확인: Khaosod·Siam Rath·외교문화뉴스·Daily News·FM91·The Pattaya News·Pattaya Mail·Bangkok Biz News·Thai Examiner·JS100·Thansettakij·Thai PBS·MGR Online·Amarin TV·Chiang Rai Times·Thairath·Matichon·한국신용신문·Bangkok Post. 구글뉴스 날짜만 새로운 옛 기사(The Standard 9-26 재난지역 발표, VisasNews 8-12 기사, Ch3 2025년 푸껫 터널)는 제외. Bangkok Post 일부 기사는 본문이 뒤집힌 문자로 와 쓰지 않음(사이클 기사는 문장 순서를 복원해 확인). 한국인 관련: 한-태 전략대화·한화오션 호위함. 외국인·비자 2건. 시라차는 새 단독 소식이 없어 동부 날씨(wt1)·저수지(ea3)로만 다룸. 한국 주요 뉴스는 data/korea.json(06:01 BKK) 6건 GN decode. X 트렌드 없음. 환율 1바트=39.83원.",
  previous="2026-10-15-pm",
  briefing=briefing,
  highlights=["bk1", "ea1", "vi1"],
  stories=stories, korea_top=korea_top,
  fx=dict(THB_KRW=FX, note="1바트 = 39.83원(이 판의 모든 원화 환산에 사용, 정수로 반올림)",
          source="data/ticker.json(06:01 BKK 조회) THB_KRW 39.8254 — open.er-api.com, rate_time 2026-10-15 07:02 BKK. 07:17 BKK 직접 조회로 같은 값(39.825408) 확인(10-16 갱신 전) → 39.83"),
)

if __name__ == "__main__":
    write_edition(data)
