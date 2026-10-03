# 🌅 아침에 고르실 것 — 승인함 #4(검색 막기 풀기) · #5(ads.txt 둘 곳 = 주소)

작성 2026-10-03 16:32 (방콕). **아무것도 사지 않았고 noindex 도 그대로예요.** 고르신 번호만 봇에게 알려 주세요 (예: "#5 = 가, #4 = B").
환율: 사이트 헤더와 같은 값(ExchangeRate-API, 2026-10-03 07:02 방콕) — 1달러 = 33.55바트 = 1,348원, 1바트 = 40.18원.

---

## #5 주소(ads.txt·앱 포장이 놓일 곳) — 먼저 무료부터

**사실 확인(공식 문서):**
- 애드센스 '사이트'로 넣을 수 있는 것 = ① 도메인(example.com) ② **공용 접미사 목록(Public Suffix List)에 있는 플랫폼의 하위 도메인**(예 site.appspot.com) ③ 애드센스 플랫폼 파트너 사이트(예 blogspot). 하위 경로(…/thai-news-kr)는 목록에 없음 → **지금 주소 그대로는 신청 불가**.
  https://support.google.com/adsense/answer/12170421?hl=en ('What can be added as a site to AdSense')
- `github.io` 는 공용 접미사 목록에 있음(14427줄 중 13775번째 줄, 2026-10-03 확인) → `p-max168.github.io` 자체는 '사이트'로 넣을 수 있는 모양.
  https://publicsuffix.org/list/public_suffix_list.dat
- ads.txt 는 **사이트 맨 위(root)** 에 있어야 함: `https://example.com/ads.txt`.
  https://support.google.com/adsense/answer/12171612?hl=en · 크롤러가 root 에서 읽는 조건 https://support.google.com/adsense/answer/7679060?hl=en
- 공용 접미사 목록의 하위 도메인은 그 하위 도메인 root 에 ads.txt 를 둠.
  https://developers.google.com/adsense/platforms/direct/ads-txt
- 한 번 승인된 사이트의 하위 경로(…/thai-news-kr/)에는 따로 신청 없이 광고 가능(같은 문서 12170421 'Subdomains' 와 Ad Manager 안내 https://support.google.com/admanager/answer/10111490?hl=en).
- 앱 포장(TWA) 은 `https://<주소>/.well-known/assetlinks.json` (주소 맨 위)이 필요.
  https://developer.chrome.com/docs/android/trusted-web-activity/android-for-web-devs · https://developer.android.com/training/app-links/configure-assetlinks
- GitHub '사용자 사이트' = 저장소 이름이 `p-max168.github.io` 이면 주소 맨 위에 뜸(지금 사이트는 '프로젝트 사이트' = …/thai-news-kr).
  https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#types-of-github-pages-sites
- 지금 상태(2026-10-03 16:33 확인): `https://p-max168.github.io/` · `/ads.txt` · `/robots.txt` 모두 404.

| 안 | 비용 | 애드센스 사이트 등록 | ads.txt | 앱 포장(TWA) | 좋은 점 | 아쉬운 점 |
|---|---|---|---|---|---|---|
| **(가) GitHub 사용자 사이트 `p-max168.github.io` 저장소 새로 만들기** — 안에 ads.txt · `.well-known/assetlinks.json` · 첫 화면은 /thai-news-kr/ 로 넘기기만 | 무료 | ✅ `p-max168.github.io` (공용 접미사 목록) | ✅ root | ✅ root | 지금 사이트·주소 그대로, 10분 작업 | 주소가 github.io 라 덜 '사이트' 같음 · 나중에 도메인으로 옮기면 애드센스·검색 다시 시작 · **공개 저장소를 새로 만드는 일이라 민구님 OK 필요** |
| (나) Firebase Hosting 무료 주소 `thai-news-kr.web.app` 로 옮기기(이미 Firebase 프로젝트 있음) | 무료(무료 한도 안) | ✅ web.app 도 공용 접미사 목록 | ✅ | ✅ | 주소가 조금 더 짧음 | 배포 방법이 바뀜(지금 GitHub Pages 자동 반영 버리고 Firebase 배포 — 로그인 필요) · 주소 바뀜 |
| (다) 지금 그대로(…/thai-news-kr) | 무료 | ❌ 하위 경로는 못 넣음 | ❌ 하위 경로 ads.txt 는 안 읽음 | ❌ | 할 일 없음 | 애드센스 신청 자체가 막힘 |
| (참고) 무료 하위 도메인 서비스(eu.org · is-a.dev 등) | 무료 | 목록엔 있음(2026-10-03 확인) | — | — | — | 심사·규칙이 서비스마다 달라 **확인 안 됨** → 권하지 않음 |

### 유료 도메인 2~3개 (가격 = 등록 업체 공개 가격표, 2026-10-03 16:3x 방콕에 직접 봄. 결제 화면에서 세금·수수료가 붙을 수 있음)
이름 예시는 RDAP(등록 여부 공개 조회)에서 **등록 안 된 것으로 나온 이름**(2026-10-03 16:33): `thainewskr.com` · `thainews-kr.com` · `thainewskr.net` · `hannun-thai.com`. (사는 순간까지 바뀔 수 있음)

| 후보 | 업체·가격표 | 첫해 | 해마다(갱신) | 좋은 점 | 아쉬운 점 |
|---|---|---|---|---|---|
| **① `.com` (예 thainewskr.com)** | Porkbun https://porkbun.com/products/domains | 11.08달러 ≈ **372바트 ≈ 14,900원** | 같음 ≈ 372바트 ≈ 14,900원 | 가장 익숙한 주소 · 첫해·갱신 같은 값(갱신 폭탄 없음) | 영어 사이트 가입·카드 결제 필요 |
| ② `.net` (예 thainewskr.net) | Porkbun(같은 쪽) / Namecheap https://www.namecheap.com/domains/ | Porkbun 12.52달러 ≈ 420바트 ≈ 16,900원 · Namecheap 12.48달러 ≈ 419바트 ≈ 16,800원 | Porkbun 같음 ≈ 420바트 · Namecheap 14.98달러 ≈ 503바트 ≈ 20,200원 | .com 이름이 없을 때 대안 | .com 보다 덜 익숙 · Namecheap 은 갱신이 비쌈 |
| ③ `.org` | Porkbun / Namecheap(같은 쪽) | Porkbun 7.98달러 ≈ 268바트 ≈ 10,800원 · Namecheap 8.48달러 ≈ 285바트 | Porkbun 11.84달러 ≈ 397바트 ≈ 16,000원 · Namecheap 14.48달러 ≈ 486바트 ≈ 19,500원 | 첫해가 가장 쌈 | 비영리 단체 느낌(광고 사이트와 안 맞음) · 2년째부터 비싸짐 |
| (참고) Cloudflare 등록 | https://www.cloudflare.com/products/registrar/ ('원가, 웃돈 없음' 안내) | **확인 안 됨**(가격은 로그인해야 보임) | 확인 안 됨 | 웃돈 없음 | 가격을 공개 쪽에서 확인 못 함 |

도메인을 사면 할 일: GitHub Pages '맞춤 도메인' 설정 + DNS(https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) → ads.txt · assetlinks.json 을 그 도메인 맨 위에. 지금 저장소의 ads.txt(주석만)를 그대로 쓸 수 있음.

**봇 추천:** 지금은 **(가) 무료**로 애드센스 신청까지 가 보고, 수익이 확인되면 **① .com** 으로 옮기기. 단, 옮기면 검색·애드센스를 다시 시작해야 하니 **처음부터 도메인을 쓸 생각이면 ①을 바로** 고르는 게 덜 번거로워요.

---

## #4 검색엔진 막기(noindex) 풀기 — 언제?

**사실 확인:**
- 지금 모든 쪽 `<meta name="robots" content="noindex, nofollow">`. 저장소의 `robots.txt`(Disallow: /)는 …/thai-news-kr/robots.txt 에 있어서 **실제로는 효과가 없음**(robots.txt 는 주소 맨 위 것만 읽음 — 맨 위 `p-max168.github.io/robots.txt` 는 404). https://developers.google.com/search/docs/crawling-indexing/robots/intro
- noindex = 구글 검색에 안 뜸(쪽은 읽음). https://developers.google.com/search/docs/crawling-indexing/block-indexing
- 애드센스 크롤러(Mediapartners-Google)는 robots.txt 를 따르고, 막혀 있으면 광고·심사가 안 됨. https://support.google.com/adsense/answer/10532?hl=en · https://support.google.com/adsense/answer/99376?hl=en · 심사 전 점검 https://support.google.com/adsense/answer/12176698?hl=en

| 안 | 내용 | 좋은 점 | 아쉬운 점 |
|---|---|---|---|
| **A. 애드센스 신청하는 날 풀기(봇 추천)** | #3 안내 4쪽 확정 + #5 주소 정한 뒤, 신청 직전에 noindex 제거 | 초안(안내 쪽 [자리표시])이 검색에 안 남음 | 그날까지 검색 유입 0 |
| B. 지금 풀기 | 내일 아침 바로 제거 | 검색에 일찍 뜨기 시작(쌓이는 데 시간이 걸림) | 초안 안내 쪽·시험 화면(가게 카드 '시험')도 검색에 뜸 · 주소를 나중에 바꾸면(#5 ①) 다시 쌓아야 함 |
| C. 나눠 풀기 | 첫 화면·소개·연락만 풀고, 초안·시안 쪽은 계속 noindex | 중간 | 쪽마다 관리할 게 늘어남 |

**정해 주실 것:** #5 = (가)/(나)/①/②/③ 중 하나, #4 = A/B/C 중 하나. 고르시면 봇이 같은 순서(백업 → 바꾸기 → 반영 → 확인)로 진행해요. 사는 것·공개 저장소 만들기는 OK 하신 뒤에만.
