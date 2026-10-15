# -*- coding: utf-8 -*-
"""2026-10-15 아침판 (07:08 정기 루틴).
저녁판(2026-10-14-pm, 약 18:24 BKK) 이후 ~ 10-15 07:20 BKK 보도. tools/collect.py --hours 14.
모든 내용은 raw/2026-10-15-am/art/ 에 저장한 원문에서 확인한 것만 사용. trends 없음."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR, krw_for

FX = 39.83
def T(n):
    return "%s바트(%s)" % (n, krw_for(n, FX))

stories = [
# ───────────── 외국인·비자 ─────────────
dict(id="vi1", topic="visa", secondary=["east", "society"], region="파타야(텝프라시트 12)",
 headline="파타야서 러시아인 568일 오버스테이로 체포…촌부리 이민국 거리 단속",
 summary=[
  "촌부리 이민국은 14일 오후 1시께 파타야 텝프라시트(Thappraya) 12 골목 일대를 점검하다 체류 허가 기간을 568일 넘긴 32세 러시아 남성을 붙잡았다고 파타야메일이 전했다. 단속은 촌부리 이민국 부경감 찟띠야 피핏꾼(Jittiya Phiphitkun) 경위가 이끌었다.",
  "남성에게는 '체류 허가가 끝난 뒤에도 왕국에 머문' 혐의가 적용됐고, 이후 법 절차를 위해 파타야시 경찰서로 넘겨졌다. 이민국은 외국인 법 위반자 점검을 계속하고 있다."
 ],
 context="체류 기간은 여권 도장·연장 스티커·90일 신고 영수증 날짜로 스스로 확인할 수 있습니다. 하루라도 넘겼다면 숨기지 말고 이민국에 먼저 문의하는 편이 안전합니다(벌금·입국 금지 기준은 이민국 공식 안내로 확인).",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/news/russian-man-arrested-in-pattaya-after-568-days-of-visa-overstay-568387",
 title_th="Russian man arrested in Pattaya after 568 days of visa overstay",
 published="2026-10-15T03:17:00+07:00",
 tags=["오버스테이","파타야","촌부리 이민국","러시아인","텝프라시트"],
 impact=["비자·체류"], for_me="파타야에서도 이민국이 골목 단위로 체류 기간을 점검하고 있으니, 여권·연장 스티커 날짜를 한 번 더 확인해 두세요.",
 also=[],
 issue=None,
 quick_replies=["568일이면 1년 반이 넘네요", "체류 날짜 다시 확인할게요", "골목 단속도 하는군요"]),

dict(id="vi2", topic="visa", secondary=["south", "society"], region="푸껫(까론)",
 headline="푸껫 숲속 셋집에 숨은 중국인, 오버스테이 1,793일…중국 '카지노 사건' 수배자",
 summary=[
  "푸껫 이민국은 14일 오전 11시께 제보를 받고 므엉푸껫군 까론(Karon) 쁠락체(Plak Che) 길 안쪽 숲속, 번지 없는 단층 셋집에 숨어 있던 중국인 왕(55)씨를 붙잡았다고 MGR온라인이 전했다. 집은 산길을 오르내려야 닿는 막다른 골목 끝에 있었다.",
  "이민국 기록상 왕씨는 2019년 4월 2일 '타일랜드 프리빌리지 카드(PE)' 비자로 입국해 연장을 거쳤지만 2021년 11월 16일 허가가 끝난 뒤 출국·연장 기록이 없어 1,793일 오버스테이로 기소됐다. 집에서는 태국 은행 통장, 다른 중국인의 여권·신분증, 휴대전화 5대, 칼 4자루가 나왔다.",
  "이민국 6관구 대변인 짜른퐁 칸띠로(Charoenphong Khantilo) 대령은 인터폴 확인 결과 왕씨가 '카지노 소유' 관련 사건으로 중국 당국의 체포영장이 발부된 인물이라고 밝혔다. 이민국은 압수품을 바탕으로 다른 범죄 연루 여부를 수사하고, 제보는 1178로 받는다."
 ],
 context="프리빌리지(옛 엘리트) 카드 같은 장기 비자도 실제 체류 허가는 입국·연장 때 찍힌 날짜까지입니다. 카드 유효기간과 여권 체류 날짜가 따로 움직일 수 있으니 둘 다 확인하세요.",
 source="MGR Online (MGR온라인)", url="https://mgronline.com/crime/detail/9690000099764",
 title_th="ตม.ภูเก็ตบุกรวบหนุ่มจีน Overstay 1,793 วัน ซ่อนตัวบ้านเช่ากลางป่าลึก พบหมายจับจีนคดีเจ้าของคาสิโน",
 published="2026-10-14T22:23:00+07:00",
 tags=["오버스테이","푸껫","프리빌리지 카드","인터폴","중국인"],
 impact=["비자·체류", "치안"], for_me="장기 비자 카드가 있어도 여권에 찍힌 체류 허가 날짜를 넘기면 오버스테이가 됩니다. 연장 기록을 꼭 챙기세요.",
 also=[dict(source="Chiang Rai Times (치앙라이타임스)", url="https://www.chiangraitimes.com/phuket/chinese-fugitive-phuke/")],
 issue=None,
 quick_replies=["5년 가까이 숨어 지냈다니", "프리빌리지 카드도 날짜 관리가 필요하네요", "1178 번호 알아 둘게요"]),

# ───────────── 동부 ─────────────
dict(id="ea1", topic="east", secondary=["weather"], region="시라차(나꼬로이·까오낄로)",
 headline="시라차 2시간 폭우에 만조까지…나꼬로이·까오낄로 도로 물바다",
 summary=[
  "14일 오후 시라차에 2시간 넘게 폭우가 쏟아진 데다 바닷물 수위가 높아지는 만조가 겹쳐, 시라차·수라삭(Surasak) 지역 나꼬로이(Koh Loi) 앞 도로와 까오낄로(9km) 도로가 물에 잠겼다고 타이랏이 전했다. 취재진이 오후 6시께 현장을 확인했을 때 물이 빠지기를 기다리는 상태였다.",
  "만조로 물이 빨리 고이고 더디게 빠지면서 특히 오토바이 운전자들이 물살을 헤치며 사고·시동 꺼짐 위험을 겪었다. 시라차시 직원들이 현장에서 차량을 유도하며 침수 지점에 들어가지 말고, 꼭 필요하지 않으면 해당 도로를 피하라고 당부했다."
 ],
 context="",
 source="Thairath (타이랏)", url="https://www.thairath.co.th/news/local/east/2966227",
 title_th="ฝนถล่มศรีราชา 2 ชั่วโมง น้ำทะเลหนุนซ้ำ ทำน้ำท่วมสูงหน้าเกาะลอย-ถนนเก้ากิโล",
 published="2026-10-14T19:52:00+07:00",
 tags=["시라차","침수","만조","나꼬로이","까오낄로"],
 impact=["날씨·재해", "교통·사고"], for_me="시라차에서 저녁 퇴근길에 비가 길게 오면 나꼬로이·까오낄로 쪽은 만조와 겹쳐 물이 늦게 빠질 수 있으니 우회로를 먼저 보세요.",
 also=[dict(source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/news/sriracha-floods-after-two-hours-of-heavy-rain-high-tide-slows-drainage-568373")],
 issue=None,
 quick_replies=["시라차 지금은 물 빠졌나요?", "만조 겹치면 정말 안 빠지죠", "오토바이는 조심하세요"]),

dict(id="ea2", topic="east", secondary=["society"], region="파타야(수쿰윗 도로)",
 headline="새벽 파타야 수쿰윗서 러시아인 대형 오토바이 중앙분리대 충돌…37세 숨져",
 summary=[
  "15일 오전 1시 49분께 파타야로 들어오는 수쿰윗 도로, 왓분깐짜나람(Wat Boonkanjanaram) 골목 신호 교차로 약 50m 앞에서 오토바이가 넘어졌다는 신고가 들어왔다고 FM91이 전했다. 구조대가 도착했을 때 37세 러시아 남성이 중앙분리대에 쓰러져 있었고, 의료진이 사망을 확인했다.",
  "약 20m 떨어진 곳에서는 크게 부서진 야마하 XSR 900 오토바이가 발견됐고, 파타야시가 심은 분리대 나무도 충격으로 손상됐다. 경찰은 고속으로 달리다 중심을 잃고 분리대를 들이받은 것으로 보고 있으며, 시신은 부검을 위해 병원으로 옮겨졌다."
 ],
 context="",
 source="FM91 (FM91 교통방송)", url="https://www.fm91bkk.com/newsarticle/80453",
 title_th="หนุ่มรัสเซีย 37 ปี ขี่บิ๊กไบค์ เสียหลักพุ่งชนเกาะกลางถนนสุขุมวิท รถพัง - ร่างกระเด็นกระแทกต้นไม้ เสียชีวิต จ.ชลบุรี",
 published="2026-10-15T04:51:00+07:00",
 tags=["파타야","수쿰윗","오토바이 사고","러시아인","심야"],
 impact=["교통·사고"], for_me="파타야 수쿰윗 도로는 심야에 과속 오토바이가 많으니, 밤에 이동할 때는 중앙 차로 쪽을 피하고 속도를 줄이세요.",
 also=[],
 issue=None,
 quick_replies=["삼가 고인의 명복을 빕니다", "밤 수쿰윗은 정말 위험해요", "과속은 절대 안 되겠어요"]),

dict(id="ea3", topic="east", secondary=["life"], region="파타야(프라탐낙)",
 headline="파타야 세컨드로드~프라탐낙 언덕, 도로 새로 깔고 보도·가로등 교체",
 summary=[
  "파타야시는 프라탐낙(Pratumnak) 언덕으로 이어지는 세컨드로드 구간에서 도로 포장, 보도 보수, 가로등 교체 작업을 이어가고 있다고 파타야메일이 전했다. 운전자·보행자·주민의 안전과 편의를 높이려는 것이다.",
  "남부 파타야 주민·관광객·가게가 함께 쓰는 길인 만큼 꾸준한 보수가 중요하다는 지적도 나왔다. 도로 파손, 깨진 보도, 꺼진 가로등, 배수 문제는 파타야시 콜센터 1337로 신고할 수 있으며, 정확한 위치·설명·사진을 함께 보내면 처리에 도움이 된다고 안내했다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/news/getting-up-pratumnak-hill-easier-and-safer-with-pattayas-new-roads-footpaths-and-lighting-568382",
 title_th="Getting up Pratumnak Hill easier and safer with Pattaya’s new roads, footpaths and lighting",
 published="2026-10-15T03:13:00+07:00",
 tags=["파타야","프라탐낙","세컨드로드","가로등","1337"],
 impact=[], for_me="프라탐낙·세컨드로드 쪽에 살거나 자주 다니면 공사 구간을 피하고, 고장 난 가로등이나 파인 도로는 1337에 사진과 함께 신고하세요.",
 also=[],
 issue=None,
 quick_replies=["밤길이 밝아지면 좋겠어요", "1337 번호 저장해 둘게요", "공사 언제 끝나나요?"]),

dict(id="ea4", topic="east", secondary=["travel"], region="라용(우타파오)",
 headline="이지 에어라인, 우타파오 공항을 거점으로…훠힌·수랏타니 노선부터 지방 연결",
 summary=[
  "소형 항공사 이지 에어라인(EZY Airlines)은 우타파오(U-Tapao) 공항을 거점으로 지방 도시를 잇는 '지역 항공 연결' 전략을 내놨다고 방콕비즈뉴스가 14일 전했다. 첫 단계로 2026년 10월께 우타파오–훠힌, 우타파오–수랏타니 노선을 열 계획이다.",
  "2단계인 2027년 중반에는 60~70석 ATR 72-600 기종을 임대해 우타파오를 운항 기지로 노선을 넓히고, 콘깬을 두 번째 거점으로 키운다는 구상이다. 지금은 세스나 그랜드 캐러밴 EX 2대로 정기·전세·환자 이송 비행을 하고 있으며, 2027~2031년 해마다 1대씩 늘려 7대로 만들 계획이다. EEC 공단 기술 인력·기업인 수요도 노린다고 했다."
 ],
 context="",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/business/1256386",
 title_th="‘อีซี่ แอร์ไลน์” ชูแผนนำ ATR 72-600 ปักหมุดฮับบิน ‘อู่ตะเภา’ เฟสแรก 3 เส้นทางสู่สุราษฎร์ธานี กระบี่ ขอนแก่น",
 published="2026-10-14T22:39:00+07:00",
 tags=["우타파오","이지 에어라인","수랏타니","훠힌","ATR 72-600"],
 impact=[], for_me="파타야·시라차에서 남부로 갈 때 방콕 공항까지 가지 않고 우타파오에서 바로 뜨는 선택지가 생길 수 있습니다. 실제 취항·요금은 항공사 발표를 확인하세요.",
 also=[],
 issue=None,
 quick_replies=["우타파오 노선 늘면 편하겠어요", "수랏타니 직항 반갑네요", "취항 날짜가 궁금해요"]),

# ───────────── 방콕 ─────────────
dict(id="bk1", topic="bangkok", secondary=["life"], region="방콕·논타부리·사뭇쁘라깐",
 headline="방콕·논타부리·사뭇쁘라깐 오늘~내일 곳곳 단수·수압 약화…물 받아 두세요",
 summary=[
  "수도권 수도청(MWA)은 파손 배관 수리, 계량기 설치, 배관 연결 공사 등으로 15~16일 방콕·논타부리·사뭇쁘라깐 여러 곳에서 수돗물이 약하게 나오거나 끊긴다고 알렸다고 탄셋따킷이 전했다. 해당 지역 집과 가게는 미리 물을 받아 두라는 당부다.",
  "방콕은 15일 오전 10시~오후 4시 끄룽톤부리 4·6 골목, 팔람2 30·50 골목, 딱신 46, 짜른나콘 48·62~78, 프라디팟 20, 펫까셈 77·81, 람인트라 19·21, 짜런사닛웡 44 등이 대상이다. 15일 밤~16일 새벽에는 파야타이 세나낏 골목(21:00~05:00), 방나–뜨랏 21~23 골목(센트럴 방나, 22:00~05:00), 수코타이 6 골목, 팔람3 아몬 골목 등이 포함됐다.",
  "사뭇쁘라깐은 15일 방나–뜨랏 도로 클롱방플리노이(10:00~18:00), 테파락(3413번 국도) 전 구간 등, 논타부리는 피분송크람 22 골목·쨍왓타나–빡끄렛 일대 등이다. 문의는 MWA 콜센터 1125."
 ],
 context="",
 source="Thansettakij (탄셋따킷)", url="https://www.thansettakij.com/general-news/671458",
 title_th="3 จังหวัด กทม.-นนท์-สมุทรปราการ เตรียมรับมือ 'น้ำประปาไม่ไหล' 15-16 ต.ค.นี้",
 published="2026-10-15T03:00:00+07:00",
 tags=["단수","수도청","방콕","방나","논타부리"],
 impact=["환율·물가"], for_me="방나·팔람2·딱신·짜른나콘·파야타이 쪽에 사시면 오늘 낮과 밤 시간대를 확인하고 욕조·물통에 물을 미리 받아 두세요.",
 also=[],
 issue=None,
 quick_replies=["우리 골목도 들어가는지 봐야겠어요", "물 미리 받아 둘게요", "1125 번호 저장할게요"]),

dict(id="bk2", topic="bangkok", secondary=["weather"], region="방콕(라차다·아속·팔람4)",
 headline="오늘 방콕 라차다피섹 도로 아속~팔람4 양방향 통제…MRT 시리킷역은 정상",
 summary=[
  "IMF·세계은행 연차총회 경호를 위해 15일 시리킷 국가컨벤션센터 주변 라차다피섹 도로가 아속몬뜨리 교차로~팔람4 교차로 구간 양방향 모두 통제된다고 타이PBS가 전했다. MRT 시리킷 국가컨벤션센터역은 평소대로 운영하고, 이 구역 주민·근무자는 평소처럼 드나들 수 있다.",
  "일반 승용차·택시는 경호선 밖인 아속몬뜨리 교차로나 팔람4 교차로에서만 승객을 내려 줄 수 있고, 참석자 셔틀버스는 오전 5시부터 다닌다. 당국은 이 일대를 오갈 때 MRT나 셔틀을 이용하라고 권했다. 한편 내일(16일)은 방콕에만 적용되는 정부 특별 휴일이라 수도청도 방콕 지역 사무소 문을 닫는다."
 ],
 context="",
 update="10-12·10-13 저녁판의 총회 교통·드론 금지 소식 후속: 총회 막바지인 15일 라차다 도로 양방향 전면 통제가 공지됐다.",
 source="Thai PBS (타이PBS)", url="https://www.thaipbs.or.th/news/content/571020",
 title_th="เช็กเส้นทางวันนี้! ปิดถนนรัชดาฯ 2 ฝั่ง รับประชุม IMF-World Bank",
 published="2026-10-15T06:08:00+07:00",
 related=[dict(source="FM91 (FM91 교통방송)", title="กปน. แจ้งปิดที่ทำการเฉพาะพื้นที่กรุงเทพมหานคร วันที่ 16 ตุลาคม 2569 เนื่องในวันหยุดราชการกรณีพิเศษ ตามมติ ครม.", url="https://fm91bkk.com/newsarticle/80425")],
 tags=["라차다피섹","IMF","세계은행","도로 통제","MRT"],
 impact=["교통·사고"], for_me="오늘 아속·클롱떠이·팔람4 쪽으로 가면 차 대신 MRT를 타고, 택시는 아속이나 팔람4 교차로에서 내리세요. 내일은 방콕 관공서가 쉽니다.",
 also=[dict(source="FM91 (FM91 교통방송)", url="https://fm91bkk.com/newsarticle/80447")],
 issue=None,
 quick_replies=["오늘은 MRT 타야겠네요", "아속 쪽 많이 막히나요?", "내일 관공서 쉬는 거 기억할게요"]),

dict(id="bk3", topic="bangkok", secondary=["life", "weather"], region="방콕(라드끄라방)",
 headline="라드끄라방구, 홍수 지원금 '세입자·번지 없는 집'도 서류 추가 접수…라인으로도 가능",
 summary=[
  "방콕 라드끄라방구청은 '탕랏(Tang Rat)' 앱으로 홍수 지원금을 신청했지만 서류가 모자라 처리가 밀린 세입자와 번지 없는 집 거주자에게 추가 서류를 받는다고 방콕비즈뉴스가 전했다. 구청에 직접 내거나 구청 라인 공식 계정(@673tzmjr)으로 보낼 수 있다.",
  "세입자는 임대 계약서 원본·사본, 계약서가 없으면 집주인이 서명한 '임대 확인서'와 집주인 신분증·주민등록(호적) 사본이 필요하다. 번지 없는 집은 마을 대표가 서명한 확인서와 대표 신분증 사본, 대표가 없으면 이웃 번지 있는 집 주인의 서명·신분증·주민등록 사본으로 대신한다. 양식은 구청 페이스북에서 받을 수 있고, 14일 오전 구청 앞에는 신청자 줄이 길게 늘어섰다고 했다."
 ],
 context="",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1256281",
 title_th="เงินเยียวยาน้ำท่วม 2569 ลาดกระบัง ให้ผู้เช่า-บ้านไม่มีเลขที่ ยื่นเพิ่ม",
 published="2026-10-14T13:39:00+07:00",
 tags=["라드끄라방","홍수 지원금","세입자","탕랏","구청"],
 impact=["날씨·재해"], for_me="태국인 가족·직원이 라드끄라방에서 세 들어 살다 침수 피해를 봤다면 임대 확인서와 집주인 서류를 챙겨 구청 라인으로 보내도록 알려 주세요.",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["세입자도 받을 수 있어 다행이에요", "줄이 길면 라인이 낫겠네요", "서류 목록 저장해 둘게요"]),

# ───────────── 날씨 ─────────────
dict(id="wt1", topic="weather", secondary=["east", "bangkok"], region="",
 headline="태국 기상청, 32개 도 뇌우·강풍 경보…방콕·동부 60% 지역 비",
 summary=[
  "태국 기상청은 15일 오전 6시부터 24시간 동안 북부, 중부 서쪽, 동부, 남부에 곳곳 강한 비가 이어진다며 뇌우·돌풍·누적 강우로 인한 돌발 홍수와 산사태성 급류에 주의하라고 했다고 카오솟이 전했다. 중국 쪽 고기압(찬 공기)이 북부 위쪽·북동부 위쪽·남중국해를 덮으면서 동풍·남동풍이 습기를 몰고 오기 때문이다.",
  "동부는 60% 지역에 비가 오고 나콘나욕·촌부리·라용·짠타부리·뜨랏 일부에 강한 비(최저 24~26도, 최고 31~35도), 방콕·수도권도 60% 지역에 뇌우(최저 25~27도, 최고 33~35도)가 예보됐다. 남부 동해안은 수랏타니·나콘시탐마랏·송클라 등 60%, 안다만해·태국만은 뇌우 지역에서 파도가 2m를 넘겠다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/breaking-news/news_10437670",
 title_th="สภาพอากาศวันนี้ กรมอุตุฯ เปิดชื่อ 32 จังหวัด ฝนฟ้าคะนอง ลมแรงมาก",
 published="2026-10-15T06:17:00+07:00",
 tags=["태국 기상청","뇌우","촌부리","방콕","파도"],
 impact=["날씨·재해"], for_me="촌부리·라용과 방콕은 오늘도 오후·저녁 소나기 가능성이 높으니 우산을 챙기고, 섬 투어 배편은 출발 전에 운항 여부를 확인하세요.",
 also=[],
 issue=None,
 quick_replies=["오늘도 우산 챙겨야겠네요", "꼬란 배는 괜찮을까요?", "비가 언제쯤 그칠까요"]),

# ───────────── 정치·경제 ─────────────
dict(id="pe1", topic="poleco", secondary=[], region="",
 headline="태국 야당, 장관 18명 불신임 토론 27~30일 유력…아누틴 총리 \"모든 쟁점 해명 준비\"",
 summary=[
  "아누틴 짠위라꾼 태국 총리는 14일 각료회의에서 장관들에게 홍수 피해 구제와 물 관리에 힘쓰는 한편, 야당의 헌법 151조 불신임 토론에 대비해 모든 쟁점을 해명할 준비를 하라고 지시했다고 마티촌이 전했다. 정부는 토론 기간을 10월 27~30일로 잡았지만, 이후 총리 해외 일정이 있어 여야 원내 대표 협의를 거쳐 확정한다.",
  "하원 사무총장 시롯 팻판(Sirote Phaetphan)은 야당이 8일 낸 장관 18명 불신임안을 소폰 사람(Sophon Zaram) 하원의장이 검토를 마치고 의사일정에 올리도록 허락했다고 밝혔다. 야당 대표인 국민당 낫타퐁 르앙빤야웃(Natthaphong Ruengpanyawut) 대표는 의장실에서 '사소한 오탈자 수정'만 요청받았다며, 정부가 토론 날짜를 흥정하듯 줄이지 말고 충분히 열어 줘야 한다고 했다. 연정 파트너인 프아타이당의 욧차난 웡사왓(Yodchanan Wongsawat) 부총리는 당이 정부를 지지할 준비가 돼 있다고 말했다."
 ],
 context="",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/politics/news_5932782",
 title_th="อนุทินแจ้งครม. พร้อมรับศึกซักฟอก27-30ตค. สั่งรมต.เตรียมแจงทุกปม เชนยันรัฐมนตรีพท.หนุน เท้งชี้ญัตติแค่ปรู๊ฟคำผิด โสภณเคาะบรรจุวาระแล้ว",
 published="2026-10-15T06:00:00+07:00",
 tags=["불신임 토론","아누틴","국민당","하원","장관 18명"],
 impact=[], for_me="",
 also=[],
 issue=None,
 quick_replies=["18명이면 규모가 크네요", "토론 며칠 할지 지켜볼게요", "홍수 대응도 쟁점이겠어요"]),

# ───────────── 북부 ─────────────
dict(id="no1", topic="north", secondary=["society"], region="치앙라이·치앙마이·프래",
 headline="태국 북부 경찰, 13일 만에 야바 2,650만 정·아이스 637kg 압수",
 summary=[
  "태국 5관구 경찰은 10월 1~13일 국경 마약 조직을 겨냥한 9건의 작전에서 야바(필로폰 알약) 2,650만 정 이상과 크리스털 메스(아이스) 637kg을 압수하고 12명을 체포, 차량 11대를 압수했다고 치앙마이에서 발표했다고 치앙라이타임스가 전했다. 발표는 5관구 경찰 사령관 쁘라차 쁘라산숙(Prachya Prasarnsuk) 중장이 맡았다.",
  "치앙라이 텅(Thoeng)군에서만 1,000만 정이 나왔고, 프래 검문소에서는 700만 정 이상과 케타민 10kg을 실은 차량들이 걸렸다. 치앙마이 산사이(San Sai)군 셋방에서 아이스 약 300kg, 치앙라이의 차량 한 대에서 약 350kg이 추가로 압수됐다. 경찰은 자금줄 추적을 이어간다고 했다."
 ],
 context="",
 source="Chiang Rai Times (치앙라이타임스)", url="https://www.chiangraitimes.com/north-thailand/police-seize-26-5m-meth-pills/",
 title_th="Police Seize 26.5M Meth Pills in Northern Thailand",
 published="2026-10-15T04:36:00+07:00",
 tags=["마약","야바","치앙라이","치앙마이","5관구 경찰"],
 impact=["치안"], for_me="북부 국경 쪽을 차로 여행하면 검문이 잦을 수 있으니 여권 사본과 차량 서류를 챙기고, 낯선 사람의 짐은 절대 맡지 마세요.",
 also=[],
 issue=None,
 quick_replies=["2,650만 정이라니 엄청나네요", "국경 검문이 늘겠어요", "남의 짐은 절대 안 들어요"]),

dict(id="no2", topic="north", secondary=["travel", "weather"], region="치앙마이(도이인타논)",
 headline="도이인타논 정상 12도·시야 20m 짙은 안개…새벽부터 전망대 주차장 꽉",
 summary=[
  "치앙마이 도이인타논(Doi Inthanon)에 14일 짙은 안개로 시야가 20m까지 줄었지만 관광객이 몰렸다고 파타야메일이 전했다. 기온은 태국 최고봉 정상 12도, 끼우매판(Kew Mae Pan) 전망대 14도까지 내려갔고, 쩜텅군 42km 지점 전망대 주차장은 해 뜨기 전에 가득 찼다.",
  "당국은 산을 오르는 운전자에게 차량 상태를 점검하고, 정상 전 마지막 5km 급경사 굽잇길에서 브레이크 타는 냄새가 나면 안전한 곳에 세워 식히라고 당부했다. 13일 방문객은 3,216명(태국인 2,527명·외국인 689명), 차량 935대였다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/thailandnews/tourists-flock-to-doi-inthanon-despite-thick-fog-and-20-metre-visibility-568413",
 title_th="Tourists flock to Doi Inthanon despite thick fog and 20-metre visibility",
 published="2026-10-15T01:44:00+07:00",
 tags=["도이인타논","치앙마이","안개","관광","기온"],
 impact=["교통·사고"], for_me="도이인타논에 가실 땐 얇은 패딩을 챙기고, 렌터카라면 내리막에서 저단 기어를 써 브레이크 과열을 막으세요.",
 also=[],
 issue=None,
 quick_replies=["벌써 12도라니 시원하겠어요", "새벽 주차 전쟁이네요", "브레이크 조심해야겠어요"]),

dict(id="no3", topic="north", secondary=["society"], region="치앙마이(매아이)",
 headline="'무료 심카드 교육'으로 아이들 신분 빼돌려 사기단에…팡 법원, 최고 징역 20년",
 summary=[
  "치앙마이 매아이(Mae Ai)군 학생들에게 '온라인 위험 교육'이라며 무료 인터넷 심카드를 나눠 주는 행사를 열고, 아이들 신분증 정보와 얼굴 사진으로 심카드 수천 장을 몰래 개통해 사기 조직에 판 사건에 팡(Fang) 지방법원이 8일 판결을 내렸다고 파타야메일이 전했다. 부모 동의는 없었다.",
  "법원은 회사에 벌금 " + T("100만") + "을 선고하고 자백을 이유로 " + T("50만") + "으로 줄였다. 여성 피고 2명은 각각 징역 20년에서 10년으로 감형됐고, 혐의를 부인한 휴대폰 회사 영업직원은 범행을 주도하고 아이들을 행사에 데려온 것으로 인정돼 징역 20년을 받았다. 경찰은 4개 도 8곳을 수색해 심카드 2,160장 이상을 압수했고, 확인된 초기 피해액은 " + T("30만") + "을 넘는다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/thailandnews/thai-court-jails-three-defendants-in-scheme-using-childrens-ids-to-register-scam-sim-cards-568342",
 title_th="Thai court jails three defendants in scheme using children’s IDs to register scam SIM cards",
 published="2026-10-15T01:11:00+07:00",
 tags=["심카드","사기","개인정보","치앙마이","팡 법원"],
 impact=["치안"], for_me="아이가 태국 학교에 다닌다면 학교 행사에서 신분증 사본·얼굴 사진을 요구할 때 누가 왜 쓰는지 먼저 확인하세요.",
 also=[],
 issue=None,
 quick_replies=["아이들 정보를 이용하다니", "학교 행사도 조심해야겠어요", "엄한 처벌이 맞아요"]),

# ───────────── 남부 ─────────────
dict(id="st1", topic="south", secondary=["travel", "poleco"], region="송클라·끄라비(꼬란따)",
 headline="송클라 호수 다리·꼬란따 연륙교 " + T("63억8,000만") + " 사업, 11월 14일 착공",
 summary=[
  "피팟 랏차낏쁘라칸(Phiphat Ratchakitprakarn) 부총리 겸 교통부 장관은 농촌도로국이 송클라와 끄라비의 대형 교량 2곳을 계획대로 추진해 11월 14일 착공, 2029년 완공을 목표로 한다고 밝혔다고 방콕포스트가 전했다. 사업비는 모두 " + T("63억8,000만") + "이다.",
  "송클라 끄라새신(Krasae Sin)군과 팟타룽 카오차이손(Khao Chaison)군을 송클라 호수 위로 잇는 " + T("46억") + " 다리, 끄라비 본토와 꼬란따(Koh Lanta)를 잇는 " + T("17억8,000만") + " 다리다. 태국 각료회의는 사업비의 70%를 세계은행 차관으로, 30%를 정부 예산으로 대는 방안을 승인했다."
 ],
 context="",
 source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/thailand/general/3337308/key-bridge-projects-due-to-start-in-songkhla-krabi",
 title_th="Key bridge projects due to start in Songkhla, Krabi",
 published="2026-10-15T04:08:00+07:00",
 tags=["꼬란따","송클라 호수","다리","농촌도로국","세계은행"],
 impact=[], for_me="꼬란따를 자주 가는 분은 2029년 완공 전까지는 지금처럼 차량 페리를 이용하게 됩니다. 공사 중 교통 안내는 끄라비 도청 공지를 보세요.",
 also=[],
 issue=None,
 quick_replies=["꼬란따 가기 쉬워지겠네요", "2029년이면 아직 멀었어요", "세계은행 차관이군요"]),

dict(id="st2", topic="south", secondary=["travel"], region="푸껫",
 headline="푸껫, 채식 축제 맞춰 전기버스 투입…빠똥·공항 잇는 노선 앱으로 확인",
 summary=[
  "푸껫도와 푸껫도 자치단체(PPAO)는 연례 채식 축제 기간 주민·관광객의 이동을 돕기 위해 전기버스(EV 버스)를 공식 투입했다고 푸껫익스프레스가 전했다. 출범식은 촛나린 끗솜(Chotnarin Kerdsom) 지사와 레왓 아리롭(Rewat Areerob) 자치단체장 등이 도청 앞에서 열었다.",
  "시내·빠똥을 도는 1종 노선 6개에 전기버스 28대, 군과 군을 잇는 4종 노선 13개에 전체 226대 중 19대가 전기버스다. 주요 노선은 푸껫타운과 공항·빠똥·까론·까따·라와이·까말라를 잇고, 'Phuket Bus' 앱(태국어·영어·러시아어·중국어)에서 노선·정류장·도착 예정 시각·요금을 볼 수 있다."
 ],
 context="",
 source="The Phuket Express (푸껫익스프레스)", url="https://thephuketexpress.com/2026/10/15/phuket-launches-ev-bus-initiative-to-support-vegetarian-festival/",
 title_th="Phuket Launches EV Bus Initiative to Support Vegetarian Festival",
 published="2026-10-15T00:29:00+07:00",
 tags=["푸껫","전기버스","채식 축제","빠똥","Phuket Bus"],
 impact=["교통·사고"], for_me="채식 축제 기간 푸껫 시내는 행렬로 혼잡하니, 공항·빠똥 이동은 Phuket Bus 앱으로 버스 시간을 확인해 보세요.",
 also=[],
 issue=None,
 quick_replies=["앱으로 버스 시간 보면 편하겠어요", "축제 기간 이동 걱정 덜었네요", "한국어 지원도 있으면 좋겠어요"]),

# ───────────── 여행 ─────────────
dict(id="tr1", topic="travel", secondary=[], region="",
 headline="태국관광청, 트립어드바이저와 손잡고 2027년 '고부가 관광객' 겨냥",
 summary=[
  "태국관광청(TAT)은 2027년 관광 방향 '변화의 해(The Year of Transformation)'에 따른 'Transform Together' 전략의 하나로 트립어드바이저와 협력 의향서(LOI)를 맺었다고 파타야메일이 전했다. 목표는 태국을 '아시아 1위 고부가·의미 있는 여행지'로 만드는 것이다.",
  "타파니 끼앗파이분(Thapanee Kiatphaibool) 관광청장은 앞으로 태국 관광은 '몇 명이 오느냐'보다 여행이 만드는 가치와 의미로 평가될 것이라고 했다. 두 기관은 태국 관광 이미지·캠페인 공동 홍보, 여행자 행동·트렌드 데이터 교환, 태국 여행지·업체의 해외 노출을 늘리는 디지털 협력을 추진한다."
 ],
 context="",
 source="Pattaya Mail (파타야메일)", url="https://www.pattayamail.com/thailandnews/thailand-partners-with-tripadvisor-to-attract-high-value-tourists-in-2027-568401",
 title_th="Thailand partners with Tripadvisor to attract high-value tourists in 2027",
 published="2026-10-15T01:29:00+07:00",
 tags=["태국관광청","트립어드바이저","고부가 관광","2027년","TAT"],
 impact=[], for_me="태국에서 숙소·식당·투어 사업을 하는 분은 트립어드바이저 노출이 관광청 캠페인과 묶일 수 있으니 업체 정보와 후기를 정리해 두면 좋습니다.",
 also=[],
 issue=None,
 quick_replies=["양보다 질로 가겠다는 거군요", "트립어드바이저 후기 더 중요해지겠어요", "한국 관광객 마케팅도 궁금해요"]),
]

briefing = [
  B("bangkok", "방콕·논타부리·사뭇쁘라깐 **15~16일** 곳곳 단수·수압 약화…물 받아 두세요", "bk1"),
  B("bangkok", "오늘 **라차다피섹 아속~팔람4** 양방향 통제, 내일은 방콕 특별 휴일", "bk2"),
  B("east", "시라차 **2시간 폭우+만조**에 나꼬로이·까오낄로 도로 침수", "ea1"),
  B("visa", "푸껫 숲속 셋집 중국인 **1,793일** 오버스테이…중국 수배자", "vi2"),
  B("weather", "태국 기상청 **32개 도** 뇌우 경보…방콕·동부 60% 지역 비", "wt1"),
  B("north", "북부 경찰 13일 만에 야바 **2,650만 정**·아이스 637kg 압수", "no1"),
]

korea_top = [
  KR("가슴 찌른 칼, 주머니 '담뱃갑'이 막았다…'인천 칼부림' 피해자 사연", "동아일보", "https://www.donga.com/news/Society/article/all/20261014/134841351/2", "2026-10-14T14:18:00+07:00"),
  KR("새 비서실장, 정무형보다 정책 실무형…대통령 국정 장악력 세질 듯", "한겨레", "https://www.hani.co.kr/arti/politics/bluehouse/1282416.html", "2026-10-14T20:18:00+07:00"),
  KR("주한미군사령관 \"전작권 전환 조건 변화…새 기준 생겨\"", "연합뉴스TV", "https://www.yonhapnewstv.co.kr/news/AKR2026101506074822K", "2026-10-15T04:07:00+07:00"),
  KR("민주, 김지용 '적격' 의견…15일 청문보고서 채택한다", "한겨레", "https://www.hani.co.kr/arti/politics/politics_general/1282449.html", "2026-10-14T21:46:00+07:00"),
  KR("북 \"어제 동해서 잠수함 발사 전략순항미사일 시험 발사\"", "YTN", "https://www.ytn.co.kr/_ln/0101_202610150657486669", "2026-10-15T04:57:00+07:00"),
  KR("\"3~4년 뒤 최대 호재\"…공무원 1만명 유입, 벌써부터 들뜬 세종시", "경향신문", "https://www.khan.co.kr/article/202610142122005", "2026-10-14T19:22:00+07:00"),
]

data = dict(
  id="2026-10-15-am", date="2026-10-15", edition="am", edition_label="아침판",
  weekday="목요일", timezone="Asia/Bangkok (UTC+7)",
  coverage="10-14 저녁판(약 18:24 BKK) 이후 ~ 10-15 07:20 BKK 보도. tools/collect.py --hours 14 (소스 254/262). 원문 확인: Pattaya Mail·MGR Online·Thairath·FM91·Bangkok Biz News·Thansettakij·Thai PBS·Khaosod·Matichon·Chiang Rai Times·Bangkok Post·The Phuket Express. 지난 판과 같은 사건(파타야 주유소 총격·포르투갈 오버스테이·매사이 비소·재난보험 첫 지급·농누치 Ctrip·블루프린트)과 날짜가 지난 기사(Google News 날짜만 새것: 차찻 90% 회복·네네 퍼레이드·무에타이 DTV·채소값 3.5%)는 제외. 출국세·라용 전자 폐기물은 새 전개 없음. 외국인·비자 2건. 연예: 오늘은 쓸 만한 태국 새 소식 없음. 한국 주요 뉴스는 data/korea.json(06:04 BKK) 6건 GN decode. X 트렌드 없음. 환율 1바트=39.83원.",
  previous="2026-10-14-pm",
  briefing=briefing,
  highlights=["bk1", "ea1", "vi2"],
  stories=stories, korea_top=korea_top,
  fx=dict(THB_KRW=FX, note="1바트 = 39.83원(이 판의 모든 원화 환산에 사용, 정수로 반올림)",
          source="open.er-api.com 직접 조회 2026-10-15 07:17 BKK (공시 2026-10-15 00:02 UTC, 39.825408 → 39.83). ticker.json(06:04) THB_KRW 39.9474 는 rate_time 이 10-14 07:02 라 더 새 값을 씀"),
)

if __name__ == "__main__":
    write_edition(data)
