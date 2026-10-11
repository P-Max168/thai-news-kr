# -*- coding: utf-8 -*-
"""2026-10-11 아침판 (대체 루틴 07:38 빌드 — 07:08 정기 실행이 판을 올리지 못함).
직전 판 2026-10-05-am 이후 6일 동안 판이 없었음. 이 판은 10-10 오전 ~ 10-11 아침(약 07:40 BKK) 보도만 다룸.
모든 내용은 raw/2026-10-11-am/art/ 에 저장한 원문에서 확인한 것만 사용. trends 없음."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from newslib import write_edition, B, KR

stories = [
# ───────────── 동부(촌부리·라용) ─────────────
dict(id="ea1", topic="east", secondary=["society"], region="파타야(농쁘루)",
 headline="파타야 고급 주택서 3,700만 바트(약 14억7,963만 원) 강도…용의자 5명 이미 출국",
 summary=[
  "태국 경찰 2관구는 10일, 6일 새벽 3시 30분께 방라뭉군 농쁘루(Nong Prue)의 고급 주택단지에서 일어난 무장 강도 사건 용의자 5명에게 체포영장이 나왔다고 밝혔다. 검은 옷에 얼굴을 가린 남성 3명이 총과 칼을 들고 들어가 터키인 사업가 쿠타이 아슬란(Kutay Aslan, 34)과 미얀마인 청소 직원을 위협·폭행하고 수갑을 채웠다.",
  "빼앗긴 것은 가상화폐 82만4,000 USDT, 현금 21만 바트(약 839만7,900원), 롤렉스 시계 5개, 휴대전화 4대 등 모두 약 3,700만 바트(약 14억7,963만 원)어치다. 파타야 법원은 9일 중국 국적 용의자 5명에게 영장을 발부했지만, 출입국 기록상 5명 모두 이미 태국을 떠났다. 경찰은 주태국 중국대사관과 협력하고 인터폴 적색수배를 요청하는 절차를 밟고 있다고 카오솟 잉글리시가 전했다."
 ],
 context="경찰은 도주 경로 CCTV에서 사건 관련으로 보이는 토요타 포추너가 좀티엔 쏘이 9에 버려진 것을 찾았고, 복면·장갑·사다리 등 증거물 14점을 확보했다.",
 source="Khaosod English (카오솟 잉글리시)", url="https://www.khaosodenglish.com/news/2026/10/10/five-suspects-flee-thailand-after-37-million-baht-robbery/",
 title_th="Five suspects flee Thailand after 37-million-baht robbery",
 published="2026-10-10T16:15:00+07:00",
 tags=["파타야","농쁘루","강도","가상화폐","인터폴"],
 impact=["치안"], for_me="파타야 고급 주택단지도 무장 강도 표적이 됐습니다. 집에 현금·시계·가상화폐 지갑을 많이 두지 않는 편이 안전합니다.",
 also=[dict(source="Bangkok Post (방콕포스트)", url="https://www.bangkokpost.com/thailand/general/3334893/suspects-flee-country-after-b37m-robbery-of-turk-in-pattaya")],
 issue=None,
 quick_replies=["이미 출국했다니 허탈하네요", "농쁘루 쪽 사시는 분들 조심하세요", "집에 현금 두지 말아야겠어요"]),

dict(id="ea2", topic="east", secondary=["society"], region="촌부리(파나니콤)",
 headline="촌부리 파나니콤서 픽업 중앙분리대 넘어 정면충돌…2명 숨지고 2명 다쳐",
 summary=[
  "10일 촌부리 파나니콤(Phanat Nikhom)군 반썻(Ban Soed) 유턴 지점에서 흰색 이스즈 디맥스 픽업이 중앙분리대를 넘어 마주 오던 직원 통근용 픽업과 부딪혔다. 넘어온 차의 운전자 낫타웃(41)과 뒷좌석의 조카 난티칸(25)이 현장에서 숨졌고, 통근 차 운전자(30)와 다른 차 앞좌석 여성(34)이 다쳐 파나니콤 병원으로 옮겨졌다.",
  "목격자는 픽업 두 대가 경주하듯 빠르게 달리다 한 대가 중심을 잃었다고 말했다. 동료들에 따르면 숨진 운전자는 공장 연휴를 맞아 어린 자녀를 보러 수린(Surin)의 집으로 가던 길이었다. 경찰은 주변 CCTV로 사고 원인을 확인하고 있다고 더 파타야 뉴스가 전했다."
 ],
 context="연휴에는 장거리 귀성 차량이 몰려 과속 사고가 잦다. 국도 36호선에서도 전날 밤 오토바이 운전자(33)가 대형 트럭 뒤를 들이받아 숨졌다.",
 source="The Pattaya News (더 파타야 뉴스)", url="https://thepattayanews.com/2026/10/10/two-people-dead-two-injured-after-pickup-crosses-median-and-hits-oncoming-vehicle-in-phanat-nikhom-chonburi/",
 title_th="Two People Dead, Two Injured After Pickup Crosses Median and Hits Oncoming Vehicle in Phanat Nikhom, Chonburi",
 published="2026-10-10T18:47:00+07:00",
 tags=["촌부리","파나니콤","교통사고","픽업"],
 impact=["교통·사고"], for_me="연휴 동안 촌부리 국도에 과속 차량이 많습니다. 유턴 구간에서는 특히 조심하세요.",
 also=[],
 issue=None,
 quick_replies=["삼가 고인의 명복을 빕니다", "유턴 구간 정말 위험하죠", "연휴 운전 조심하세요"]),

dict(id="ea3", topic="east", secondary=["travel"], region="파타야(발리하이 선착장)",
 headline="파타야 발리하이 선착장에 경찰 대거 배치…공유지 점유 분쟁, 꼬란 배는 정상 운항",
 summary=[
  "파타야 경찰서장 아넥 사통유(Anek Sathongyu) 경찰 대령이 10일 남파타야 발리하이(Bali Hai) 선착장에 경찰 다수를 배치했다. 선착장 땅 사용을 둘러싼 분쟁이 충돌로 번지지 않게 막고, 꼬란(Koh Larn)행 배를 타고 내리는 태국인·외국인 승객을 보호하기 위해서라고 경찰서는 밝혔다. 체포나 충돌은 없었다.",
  "파타야시는 짓다 만 '워터프런트' 건물 옆 공유지를 쓰는 개인에게 땅을 비우라고 공고한 상태다. 기한은 보도에 따라 10월 31일, 또는 10월 1일로 엇갈린다고 더 파타야 뉴스가 전했다. 분쟁 당사자는 공개되지 않았다."
 ],
 context="발리하이는 꼬란으로 가는 주요 선착장이다. 시는 지난 8월 이곳 주차장에서 영수증 없이 관광객에게 2,000~3,000바트(약 7만9,980~11만9,970원)를 요구했다는 민원으로 직원·용역 6명을 직무 정지했다.",
 source="The Pattaya News (더 파타야 뉴스)", url="https://thepattayanews.com/2026/10/10/many-pattaya-police-deployed-to-bali-hai-pier-as-public-land-encroachment-dispute-runs-toward-a-deadline/",
 title_th="Many Pattaya Police Deployed to Bali Hai Pier as Public Land Encroachment Dispute Runs Toward a Deadline",
 published="2026-10-10T19:29:00+07:00",
 tags=["파타야","발리하이","꼬란","선착장","공유지"],
 impact=["치안"], for_me="꼬란 배는 정상 운항 중입니다. 이달 말까지 선착장 주변이 어수선할 수 있으니 시간을 넉넉히 잡으세요.",
 also=[],
 issue=dict(id="2026-pattaya-officers-cash", title="파타야 단속 직원 관광객 금전 요구 의혹"),
 quick_replies=["주말에 꼬란 가는데 괜찮을까요?", "워터프런트 건물 아직도 그대로네요", "선착장 정리되면 좋겠어요"]),

# ───────────── 외국인·비자 ─────────────
dict(id="vi1", topic="visa", secondary=["society"], region="방콕",
 headline="태국 이민국, 한국인 불법 온라인 도박 조직 급습…한국인 10명 체포·비자 취소",
 summary=[
  "태국 이민국 경찰은 한국인이 불법 온라인 도박 사업을 운영한다는 첩보를 받고 방콕 남부지방법원 수색 영장으로 콘도를 수색했다. 한국인 관리자 4명이 도박 사이트 시스템을 관리하며 고객 거래를 지켜보고 있었고, 노트북 11대·OTP 기기 12개·하드웨어 지갑 1개·휴대전화 11대가 압수됐다.",
  "같은 콘도의 다른 방 예약 기록을 찾아 추가로 수색해 한국인 6명을 더 체포하고 노트북 21대·OTP 기기 19대·휴대전화 19대 등을 압수했다. 이 조직은 회원 150만 명 이상, 월 거래액 5억 바트(약 199억9,500만 원) 이상인 '레드벳'·'블랙벳'과 연루됐다. 한국 경찰과 공조한 이번 작전으로 체포된 한국인 10명은 모두 비자가 취소돼 구금됐고, 한국 추방을 기다리고 있다고 뉴스따옴이 주태국한국문화원 자료를 인용해 전했다."
 ],
 context="기사에는 단속 날짜와 콘도 위치가 나오지 않는다. 태국에서는 온라인 도박 운영이 불법이며, 외국인은 비자 취소·추방으로 이어진다.",
 source="뉴스따옴 (주태국한국문화원 자료)", url="https://www.newsttaom.co.kr/news/articleView.html?idxno=237878",
 title_th="태국 이민국 경찰, 월 매출 5억 바트(약 200억 원) 규모 한국 온라인 도박조직 급습해 체포",
 published="2026-10-10T20:04:00+07:00",
 tags=["한국인","온라인 도박","이민국","비자 취소","추방"],
 impact=["비자·체류","치안"], for_me="한국인 10명이 비자 취소·추방 절차에 들어갔습니다. '쉬운 고수익' 해외 취업 제안은 불법 도박·사기 조직일 수 있으니 조심하세요.",
 also=[],
 issue=None,
 quick_replies=["한국인 망신이네요", "고수익 알바 제안 조심해야겠어요", "추방 뒤 한국에서도 처벌받나요?"]),

dict(id="vi2", topic="visa", secondary=["bangkok", "society"], region="방콕(방나·쑤언루앙·팔람까오·끄룽텝끄리타)",
 headline="태국 경찰, 방콕 고급 주택단지 4곳 '외국인 차명 소유' 단속…60억 바트(약 2,399억4,000만 원) 규모",
 summary=[
  "태국 경찰청장 쌈란 누알마(Samran Nualma) 경찰 대장이 이끄는 이민국·수도경찰 합동팀이 10일 방나·쑤언루앙·팔람까오(라마9)-씨나카린·끄룽텝끄리타 일대 고급 주택단지 4곳 등 17곳을 수색했다. 외국인 조직이 태국인 명의 회사를 내세워 집과 땅 약 60억 바트(약 2,399억4,000만 원)어치를 가진 것으로 보고 외국인 86명에게 체포영장을 받아 11명(중국인 10명·미국인 1명)을 체포했다.",
  "단속 대상 중에는 중국 당국이 살인·사기 혐의로 쫓는 인물과 인터폴 적색수배자도 있었다고 경찰은 밝혔다. 경찰은 앞선 7차례 단속에서 회사 297곳, 땅 309필지(약 217라이(약 347,200㎡, 약 105,028평)), 약 30억3,900만 바트(약 1,215억2,961만 원)어치를 조사해 238명에게 체포영장을 받고 118명을 붙잡았다. 경찰은 단속 목적이 외국인 투자를 막는 것이 아니라 차명 소유를 바로잡는 것이라고 강조했다고 마티촌이 전했다."
 ],
 context="태국에서 외국인은 원칙적으로 토지를 소유할 수 없고, 태국인 명의를 빌린 회사로 땅을 갖는 것은 불법이다. 집을 사거나 장기 임대할 때는 명의 구조를 변호사에게 확인하자.",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/local/crime/news_5926980",
 title_th="บิ๊กราญ บุกค้น 4 หมู่บ้านหรู ทลายนอมินีต่างชาติ 6 พันล้าน พบโยงแก๊งสแกมเมอร์จีน",
 published="2026-10-10T11:59:00+07:00",
 tags=["노미니","차명 소유","방콕","고급 주택","태국 경찰청"],
 impact=["비자·체류"], for_me="외국인 명의 부동산 단속이 8차까지 이어지고 있습니다. 태국인 명의를 빌린 집·땅·회사가 있다면 지금 법적 구조를 점검하세요.",
 also=[dict(source="Thai Examiner (타이 이그재미너)", url="https://www.thaiexaminer.com/thai-news-foreigners/2026/10/10/eleven-arrested-in-saturday-property-raids-linked-to-foreigners-with-links-to-criminality-across-bangkok/")],
 issue=dict(id="nominee-crackdown", title="외국인 노미니(차명) 단속"),
 quick_replies=["파타야도 단속하나요?", "콘도는 괜찮은 거죠?", "명의 구조 확인 방법 아시는 분?"]),

dict(id="vi3", topic="visa", secondary=["east", "society"], region="파타야",
 headline="촌부리 이민국, 파타야 콘도서 나이지리아인 2명 체포…주방 후드 속 코카인",
 summary=[
  "촌부리 이민국은 9일 파타야의 한 콘도를 수색해 나이지리아인 남성 2명(25세·29세)을 붙잡았다. 이 중 1명은 불법 체류 상태였다. 20분 넘게 방을 뒤진 끝에 주방 레인지 후드 안에서 검은 테이프로 감은 코카인 5덩이(약 6g)를 찾아냈다.",
  "두 사람은 워킹 스트리트(Walking Street)에서 아는 친구에게 산 것이며 직접 쓰려던 것이라고 주장했다. 이민국은 두 사람을 파타야 경찰서로 넘기고 마약 출처를 캐고 있다고 FM91이 전했다."
 ],
 context="태국 경찰청장이 9일 전국 경찰에 마약·차명 소유·사기 조직 단속을 서두르라고 지시한 뒤 이민국 단속이 이어지고 있다.",
 source="FM91 (에프엠91)", url="https://www.fm91bkk.com/newsarticle/80253",
 title_th="ตม.ชลบุรี บุกคอนโดเมืองพัทยา รวบ 2 หนุ่มไนจีเรีย แอบซุกโคเคน ในเครื่องดูดควัน หวังตบตาเจ้าหน้าที่",
 published="2026-10-11T03:13:00+07:00",
 tags=["파타야","이민국","불법 체류","코카인","워킹 스트리트"],
 impact=["비자·체류","치안"], for_me="파타야 콘도에도 이민국 수색이 들어옵니다. 여권과 체류 기간을 늘 확인해 두세요.",
 also=[],
 issue=None,
 quick_replies=["요즘 단속이 많네요", "워킹 스트리트 조심해야겠어요", "체류 기간 다시 확인해야겠어요"]),

dict(id="vi4", topic="visa", secondary=["north"], region="치앙마이(창클란)",
 headline="치앙마이 호텔서 62일 넘게 불법 체류한 중국인 체포…중국서 1억 바트(약 39억9,900만 원) 사기 수배",
 summary=[
  "태국 이민국 5지역대는 9일 치앙마이 창클란(Chang Khlan)의 한 호텔에서 중국인 순하오(Sun Hao, 40)를 체포했다. 그는 4월 5일 관광 비자로 들어와 학생 연장으로 8월 7일까지 머물 수 있었지만, 체포 때는 체류 허가가 끝난 지 62일이 넘었다.",
  "중국 당국은 피해액 2,000만 위안(1억 바트(약 39억9,900만 원) 이상) 사기 혐의로 그를 수배 중이었다. 그는 체류 기간 초과 혐의로 치앙마이 경찰서에 넘겨졌고, 중국 송환은 별도 절차라고 더 파타야 뉴스가 전했다."
 ],
 context="기사에 따르면 체류 기간 초과는 하루 500바트(약 1만9,995원), 최대 2만 바트(약 79만9,800원) 벌금이 흔히 거론되며, 구금·추방과 재입국 금지로 이어질 수 있다. 연장 만료일을 달력에 적어 두자.",
 source="The Pattaya News (더 파타야 뉴스)", url="https://thepattayanews.com/2026/10/10/royal-thai-immigration-arrests-overstaying-chinese-man-wanted-in-100-million-baht-fraud-case-at-chiang-mai-hotel/",
 title_th="Royal Thai Immigration Arrests Overstaying Chinese Man Wanted in 100-Million-Baht Fraud Case at Chiang Mai Hotel",
 published="2026-10-10T20:06:00+07:00",
 tags=["치앙마이","불법 체류","오버스테이","이민국","중국인"],
 impact=["비자·체류"], for_me="학생 연장 같은 체류 연장이 끝나면 바로 불법 체류가 됩니다. 만료일을 꼭 확인하세요.",
 also=[],
 issue=None,
 quick_replies=["오버스테이 벌금 정확히 아시는 분?", "연장 만료일 꼭 챙겨야겠네요", "요즘 호텔도 점검하나 봐요"]),

# ───────────── 여행·생활 ─────────────
dict(id="tr1", topic="travel", secondary=["life", "poleco"], region="",
 headline="태국 '출국세 1,000바트(약 3만9,990원)' 추진에 호텔협회 반대…외국인 1인 부담 2,570바트(약 10만2,774원)",
 summary=[
  "태국 국세청은 비행기로 나라를 떠나는 모든 국적의 승객에게 1회 1,000바트(약 3만9,990원), 최대 5,000바트(약 19만9,950원)까지 '출국세'를 걷는 법안 원칙에 대해 의견을 받고 있다. 태국호텔협회 티안쁘라싯 차이야파타라논(Thienprasit Chaiyapatranun) 회장은 8일 국세청장에게, 이어 에까닛 닛티탄쁘라팟(Ekniti Nitithanprapas) 부총리 겸 재무장관에게 반대 의견서를 냈다.",
  "협회는 법안이 통과되면 외국인 관광객 1명이 한 번 여행에 내는 돈이 2,570바트(약 10만2,774원)가 된다고 설명했다. 6월 20일부터 적용된 출국 승객 이용료 1,120바트(약 4만4,789원), 준비 중인 외국인 관광객 입국료 450바트(약 1만7,996원), 출국세 1,000바트(약 3만9,990원)를 더한 것으로, 4인 가족이면 10,280바트(약 41만1,097원)가 늘어난다고 타이랏이 전했다."
 ],
 context="아직 법안 의견 수렴 단계로 시행 날짜는 정해지지 않았다. 협회는 이웃 나라와의 관광 경쟁에서 불리해진다며 법안 재검토를 요구했다.",
 source="Thairath (타이랏)", url="https://www.thairath.co.th/money/economics/thai_economics/2965391",
 title_th="โรงแรมฮึ่ม!ค้านภาษีบินนอก หวั่นท่องเที่ยวพัง! แบกภาษีอ่วม 2,570 บาท/คน",
 published="2026-10-11T07:00:00+07:00",
 tags=["출국세","관광세","태국호텔협회","국세청","항공"],
 impact=["환율·물가","비자·체류"], for_me="법안이 그대로 통과되면 태국에서 비행기로 나갈 때마다 1,000바트(약 3만9,990원)가 더 듭니다. 거주자도 예외인지는 기사에 나오지 않았습니다.",
 also=[dict(source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/business/1255780")],
 issue=None,
 quick_replies=["거주자도 내야 하나요?", "한국 갈 때마다 부담되겠네요", "입국료 450바트(약 1만7,996원)는 언제부터예요?"]),

dict(id="bk1", topic="bangkok", secondary=["life", "weather"], region="방콕",
 headline="방콕 전철 '환승 통합 요금' 2027년 1월 1일 목표…기본 17바트(약 680원), 한 번에 최대 45바트(약 1,800원)",
 summary=[
  "피팟 랏차낏쁘라깐(Phiphat Ratchakitprakarn) 태국 부총리 겸 교통장관은 10일 방콕과 주변 도시 전철 전 노선 통합 요금제를 2027년 1월 1일에 시작하는 것을 목표로 한다고 밝혔다. 처음 탈 때 17바트(약 680원)만 내고 노선을 갈아탈 때는 기본요금을 다시 내지 않으며, 한 번 이동에 최대 45바트(약 1,800원)다.",
  "중앙 시스템은 태국 지하철공사(MRTA)가, 결제는 끄룽타이 은행이 맡아 차액을 3일 안에 돌려준다. 가장 큰 숙제는 BTS 그린라인의 래빗(Rabbit) 카드 결제 방식이다. 국제 EMV 기준을 쓰기로 해 호환되는 비자 카드를 가진 외국인 방문객도 카드를 대고 탈 수 있게 된다고 더 네이션이 전했다."
 ],
 context="교통부는 2027년 4분기에는 버스·배까지 통합 요금으로 잇겠다는 계획이다. 아직 목표일 뿐이고, 그린라인 결제 협상은 진행 중이다.",
 source="The Nation (더 네이션)", url="https://www.nationthailand.com/news/general/40072093",
 title_th="Bangkok common rail ticket with 17–45 baht fares planned for January 1, 2027",
 published="2026-10-10T12:08:00+07:00",
 tags=["방콕","전철","BTS","MRT","통합 요금","교통비"],
 impact=["환율·물가"], for_me="계획대로라면 내년부터 방콕 전철을 갈아타도 한 번에 45바트(약 1,800원)를 넘지 않고, 한국 비자 카드로도 탈 수 있게 됩니다.",
 also=[],
 issue=None,
 quick_replies=["BTS 갈아탈 때 너무 비쌌는데 좋네요", "한국 카드도 되면 편하겠어요", "정말 1월에 시작할까요?"]),

dict(id="lf1", topic="life", secondary=["bangkok", "weather"], region="방콕",
 headline="태국 상무부, 방콕 침수 지역 20곳서 생필품 최대 62% 할인 판매…18일까지",
 summary=[
  "태국 상무부 국내무역국은 물이 빠지고 주민이 집으로 돌아가는 방콕 침수 지역에 이동 판매차를 보내 9~18일 하루 2곳씩 모두 20곳에서 오전 9시~오후 8시 생필품을 싸게 판다. 10개 분류 30여 품목이다.",
  "재스민 쌀 5kg 120바트(약 4,799원), 달걀 M 사이즈 30개 110바트(약 4,399원, 시중 140바트(약 5,599원)), 설탕 1kg 22바트(약 880원), 팜유 1L 42바트(약 1,680원) 등이고 청소 도구는 최대 62% 싸다. 10월 16일부터 12월까지는 전국에서 3,036회 할인 판매를 연다고 카오솟이 전했다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/economics/news_10432478",
 title_th="พาณิชย์เดินหน้า “ไทยช่วยไทย ธงฟ้าสู้ภัยน้ำท่วม” ขนสินค้าลดสูงสุด 62% ทั่วประเทศ",
 published="2026-10-10T13:03:00+07:00",
 tags=["방콕","침수","생필품","할인","달걀값"],
 impact=["환율·물가"], for_me="",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["판매 장소는 어디서 확인하나요?", "달걀값이 아직 비싸네요", "파타야에도 오면 좋겠어요"]),

# ───────────── 날씨 ─────────────
dict(id="wt1", topic="weather", secondary=["east", "bangkok"], region="전국",
 headline="태국 21개 도·방콕 침수 피해 113만 가구…53명 숨져, 차층사오는 아직 물 불어",
 summary=[
  "태국 재난방지청(DDPM)은 10일 오전 6시 기준 21개 도와 방콕에서 113만5,377가구, 315만8,615명이 침수 피해를 입었다고 밝혔다. 각 도 집계로 사망자는 53명이며, 쁘라친부리(Prachin Buri) 23명, 사뭇쁘라깐 9명, 방콕 4명 등이다.",
  "대부분 지역은 물이 줄고 있지만 차층사오(Chachoengsao)는 8개 군에서 수위가 계속 올라 5만4,729가구가 피해를 입었다. 촌부리는 파나니콤·판통 2개 군 1,571가구, 라용은 끌랭 20가구로 두 곳 모두 물이 빠지는 중이다. 방콕은 32만9,000가구가 피해를 입었고 전체 수위는 내려가고 있다고 더 네이션이 전했다."
 ],
 context="",
 source="The Nation (더 네이션)", url="https://www.nationthailand.com/news/general/40072090",
 title_th="Flooding affects 21 provinces and Bangkok, hitting 1.13m households",
 published="2026-10-10T11:48:00+07:00",
 tags=["홍수","재난방지청","차층사오","촌부리","방콕"],
 impact=["날씨·재해"], for_me="촌부리 피해 지역은 파나니콤·판통입니다. 차층사오 방향 도로를 쓸 때는 침수 정보를 먼저 확인하세요.",
 also=[],
 issue=dict(id="2026-floods-chachoengsao", title="차층사오 침수"),
 quick_replies=["차층사오 쪽 도로 괜찮나요?", "피해 지역 분들 힘내세요", "파타야는 이제 괜찮은가요?"]),

dict(id="wt2", topic="weather", secondary=["east", "bangkok"], region="방콕·동부",
 headline="태국 기상청 '오늘 방콕·동부 70% 지역에 비'…촌부리·라용도 곳곳 폭우",
 summary=[
  "11일 아침 방콕비즈뉴스가 전한 태국 기상청 24시간 예보(오전 6시부터)에 따르면 방콕과 주변 지역은 70% 지역에 뇌우와 돌풍, 곳곳에 폭우가 예상된다. 기온은 최저 25~27도, 최고 32~34도다.",
  "동부도 70% 지역에 비가 오고, 나콘나욕·차층사오·촌부리·라용·짠타부리·뜨랏 일부에는 폭우가 내릴 수 있다. 중국에서 내려온 고기압과 남중국해의 습한 바람, 타이만과 남부를 지나는 몬순골이 겹친 탓이다. 타이만과 안다만해는 뇌우 지역에서 파도가 2m 넘게 일 수 있어 배를 탈 때 조심하라고 기상청은 당부했다."
 ],
 context="",
 source="Bangkok Biz News (방콕비즈뉴스)", url="https://www.bangkokbiznews.com/news/news-update/1255867",
 title_th="กรมอุตุ เตือนมรสุมเข้า อากาศแปรปรวน กทม. ฝนตกหนัก ลมแรง ร้อยละ 70",
 published="2026-10-11T07:33:00+07:00",
 tags=["날씨","폭우","태국 기상청","촌부리","방콕"],
 impact=["날씨·재해"], for_me="오늘 파타야·방콕 모두 비 소식입니다. 꼬란·꼬사멧 배편은 파도가 높을 수 있어요.",
 also=[],
 issue=dict(id="2026-rain-warnings-oct", title="10월 초 비 경보(4~7일·11~14일)"),
 quick_replies=["오늘 파타야 비 오나요?", "우산 챙겨야겠네요", "배 타는 분들 조심하세요"]),

# ───────────── 방콕·북부·남부·사회 ─────────────
dict(id="bk2", topic="bangkok", secondary=["society"], region="방콕(카오산 로드)",
 headline="카오산 로드 술집서 마약 적발…태국 수도경찰, 인근 경찰서 간부 5명 전보",
 summary=[
  "태국 내무부 지방행정국 특별팀이 10일 새벽 3시 방콕 카오산 로드의 한 유흥업소를 급습해 용의자를 체포하고 마약류를 압수했다. 이 업소는 차나쏭크람(Chana Songkhram) 경찰서에서 불과 수백 m 거리였다.",
  "싸얌 분쏨(Siam Boonsom) 수도경찰청장은 업소를 문 닫게 하고, 공정한 조사를 위해 차나쏭크람 경찰서 간부 5명을 다른 곳으로 보냈다고 밝혔다. 같은 날 새벽 1시 이 경찰서가 점검했을 때는 이상이 없다고 했던 만큼, 위원회가 근무 실태를 조사해 잘못이 있으면 형사·징계 처분한다고 PPTV가 전했다."
 ],
 context="",
 source="PPTV (피피티비)", url="https://www.pptvhd36.com/news/%E0%B8%AA%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%A1/285007",
 title_th="ผบช.น. สั่งเด้ง 5 เสือ สน.ชนะสงคราม เซ่นปมตรวจผับใกล้โรงพักเจอยาเสพติด",
 published="2026-10-10T14:08:00+07:00",
 tags=["방콕","카오산 로드","마약","경찰","유흥업소"],
 impact=["치안"], for_me="",
 also=[dict(source="Siam Rath (싸얌랏)", url="https://siamrath.co.th/crime/327925")],
 issue=None,
 quick_replies=["경찰서 바로 옆인데 몰랐다니요", "카오산 요즘 분위기 어떤가요?", "제대로 조사되길 바랍니다"]),

dict(id="no1", topic="north", secondary=["society"], region="치앙마이(산싸이)",
 headline="치앙마이 산싸이 기숙사 방에서 필로폰(아이스) 287kg 압수…미얀마인 세입자 도주",
 summary=[
  "태국 경찰 5관구는 10일 치앙마이 산싸이(San Sai)군 매카우 마을의 한 기숙사 2층 방을 포위·수색해 플라스틱 상자에 숨긴 필로폰(아이스) 약 287kg을 압수했다.",
  "기숙사 주인에 따르면 방은 미얀마 국적 남성 '짜이'가 빌렸고, 그는 미리 달아났다. 경찰은 그가 북부 국경으로 들여온 마약을 받아 옮기는 역할을 했다고 보고 뒤를 쫓으며 조직 전체를 수사하고 있다고 카오솟이 전했다."
 ],
 context="",
 source="Khaosod (카오솟)", url="https://www.khaosod.co.th/around-thailand/news_10433129",
 title_th="ตร.ปิดล้อม หอพักย่านสันทราย เชียงใหม่ ผงะเจอไอซ์บิ๊กล็อตเกือบ 300 กิโล กองเต็มห้อง",
 published="2026-10-10T19:44:00+07:00",
 tags=["치앙마이","산싸이","마약","필로폰"],
 impact=["치안"], for_me="",
 also=[],
 issue=None,
 quick_replies=["양이 어마어마하네요", "치앙마이 사시는 분들 조심하세요", "빨리 잡히길 바랍니다"]),

dict(id="st1", topic="south", secondary=["weather"], region="빳따니",
 headline="아누틴 태국 총리, 빳따니서 남부 14개 도지사 회의…'10월 말까지 폭우 대비'",
 summary=[
  "아누틴 찬위라꾼(Anutin Charnvirakul) 태국 총리 겸 내무장관은 10일 빳따니(Pattani)에서 남부 14개 도 도지사들과 재난 대비 회의를 열었다. 태국 기상청이 펫차부리부터 말레이시아 국경까지 남부 여러 도에 10월 말까지 비가 잦을 것으로 예보했기 때문이다.",
  "총리는 대피가 필요하면 언제, 어디로, 어느 길로 가는지 쉬운 말로 알리고, 거동이 어려운 환자·노인을 먼저 옮기라고 지시했다. 또 10월 1일부터 3,000만 가구를 대상으로 홍수·폭풍·지진 피해를 보장하는 국가 재난보험을 널리 알리라고 했다고 싸얌랏이 전했다."
 ],
 context="",
 source="Siam Rath (싸얌랏)", url="https://siamrath.co.th/regional/327975",
 title_th="\"นายกฯ\" ลงพื้นที่ปัตตานี ประชุมผู้ว่าฯ \"14 จว.ใต้\" เร่งเตรียมรับมือฝนหนัก ย้ำห้ามละเลยประชาชน",
 published="2026-10-10T18:34:00+07:00",
 tags=["남부","빳따니","아누틴","폭우","재난보험"],
 impact=["날씨·재해"], for_me="이달 말까지 푸껫·사무이·핫야이 등 남부 여행 계획이 있다면 날씨와 대피 안내를 확인하세요.",
 also=[],
 issue=dict(id="2026-floods-relief", title="홍수 구호금·재난보험"),
 quick_replies=["푸껫 여행 미뤄야 할까요?", "재난보험 외국인도 되나요?", "남부도 피해 없길 바랍니다"]),

# ───────────── 연예 ─────────────
dict(id="en1", topic="ent", secondary=["bangkok"], region="방콕",
 headline="미스 그랜드 인터내셔널 2026 왕관은 탄자니아…태국 대표 '닝 빳타마' 5위",
 summary=[
  "10일 밤 방콕 브라보 BKK 쇼핑몰 MGI 홀에서 80여 개국이 참가한 미스 그랜드 인터내셔널 2026 결선이 열려 탄자니아 대표 지한 모힌 디마크(Jihan Mohin Dimachk)가 왕관을 썼다. 1위 준우승은 에콰도르의 샤레 안드라데(Shyare Andrade)였다.",
  "태국 대표 닝 빳타마 찟사왓(Patama Jitsawat)은 최종 11명에 들어 5위 준우승(Runner-up 5)에 올랐다고 마티촌이 전했다."
 ],
 context="",
 source="Matichon (마티촌)", url="https://www.matichon.co.th/lifestyle/social-women/news_5927723",
 title_th="สาวงามแทนซาเนีย คว้ามง มิสแกรนด์อินเตอร์ฯ 2026 ‘หนิง ปัทมา’ คว้ารองอันดับ 5",
 published="2026-10-10T23:35:00+07:00",
 tags=["미스 그랜드","미인대회","탄자니아","방콕"],
 impact=[], for_me="",
 also=[],
 issue=None,
 quick_replies=["결선 보신 분 계세요?", "태국 대표 아쉽네요", "탄자니아 축하해요"]),
]

briefing = [
  B("visa", "태국 이민국, **한국인 불법 온라인 도박 조직** 급습…한국인 10명 체포·비자 취소", "vi1"),
  B("east", "파타야 고급 주택 **3,700만 바트(약 14억7,963만 원)** 강도 용의자 5명 이미 출국", "ea1"),
  B("travel", "태국 **출국세 1,000바트(약 3만9,990원)** 추진에 호텔협회 반대", "tr1"),
  B("weather", "오늘 방콕·동부 **70% 지역 비**, 촌부리·라용 곳곳 폭우", "wt2"),
  B("bangkok", "방콕 전철 **환승 통합 요금 최대 45바트(약 1,800원)**, 2027년 1월 목표", "bk1"),
  B("visa", "방콕 고급 주택단지 **외국인 차명 소유** 8차 단속", "vi2"),
]

korea_top = []

data = dict(
  id="2026-10-11-am", date="2026-10-11", edition="am", edition_label="아침판",
  weekday="일요일", timezone="Asia/Bangkok (UTC+7)",
  coverage="10-10 오전 ~ 10-11 아침(약 07:40 BKK) 보도. 07:08 정기 실행이 판을 올리지 못해 07:38 대체 점검이 만든 판(직전 판 10-05 아침판 이후 6일 공백 — 그 사이 기사는 다루지 않음). tools/collect.py --hours 20: 1,994건, 262개 소스 중 253개 정상. 원문 확인: Khaosod English·Bangkok Post·The Pattaya News·FM91·Matichon·Thai Examiner·뉴스따옴·Thairath·Bangkok Biz News·The Nation·Khaosod·PPTV·Siam Rath. 한국 주요 뉴스는 2시간마다 갱신되는 data/korea.json 을 씀(판 korea_top 비움). X 트렌드 없음. 환율 1바트=39.99원.",
  previous="2026-10-05-am",
  briefing=briefing,
  highlights=["vi1", "ea1", "tr1"],
  stories=stories, korea_top=korea_top,
  fx=dict(THB_KRW=39.99, note="1바트 = 39.99원(이 판의 모든 원화 환산에 사용, 정수로 반올림)",
          source="open.er-api.com (2026-10-11 07:40 BKK 조회, 공시 기준시각 2026-10-10 00:02 UTC, 39.9854 → 판 환율 39.99)"),
)

if __name__ == "__main__":
    write_edition(data)
