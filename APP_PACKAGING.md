# 앱으로 포장하기 준비 (2026-10-03 — 아직 포장 안 함, 메모만)

지금 사이트는 **설치형 웹앱(PWA)** 그대로 앱 가게용 포장이 가능하게 맞춰 둠. 실제 포장·가게 등록은 운영자 계정·비용이 필요해서 LOGIN_TODO 에 둠.

## 이미 갖춘 것(점검 2026-10-03)
| 항목 | 상태 | 어디 |
|---|---|---|
| 아이콘 192·512(any) + 192·512(maskable) + apple-touch 180 | 있음(크기 확인) | `assets/icons/`, `manifest.json` |
| manifest: name·short_name·id·start_url(`./?source=pwa`)·scope·standalone·portrait·theme/background·lang ko | 있음 | `manifest.json` |
| 바로가기(아이콘 길게 누르기): ❤️ 하트한 기사(`#hearts`) · 📍 내 주변(`#nearby/food`) | 추가 | `manifest.json` `shortcuts` |
| 오프라인: 앱 셸·최신 판 미리 받기, 한 번 본 판은 오프라인으로 읽힘. 처음 여는 쪽은 **오프라인 안내**(`offline.html`) | 있음 | `sw.js` |
| 노치·상태 표시줄·홈 막대 여백(`env(safe-area-inset-*)`): 헤더·서랍·시트·내 주변·맨 위로·푸터 | 헤더·맨 위로·푸터 추가 | `assets/style.css` 끝 |
| 휴대폰 **뒤로 버튼**: ☰ 서랍·설정 창·❤️/📊/✅ 페이지·📍 내 주변을 닫음(앱이 바로 꺼지지 않음) | 추가 | `assets/app.js` `Back`, `pages.js`, `nearby.js` |
| 외부 링크는 새 탭(앱 안에서는 브라우저로 열림) | 있음 | README '외부 링크는 모두 새 탭' |

## 길 1 — Android, 무료 쪽: PWABuilder(TWA)
1. https://www.pwabuilder.com 에 사이트 주소를 넣음 → 'Android' 패키지 생성(서명 키는 PWABuilder 가 만들어 줌 — **키 파일·비밀번호는 잃어버리면 업데이트 불가, 안전한 곳에 보관**).
2. 주소창 없이 열리려면 **도메인 맨 위**에 `/.well-known/assetlinks.json` 이 있어야 함 → 지금 사이트는 `p-max168.github.io/thai-news-kr/` 아래라 ads.txt 와 같은 문제(승인함 #5: 사용자 사이트 저장소 또는 맞춤 도메인). 없으면 앱 위에 주소 막대가 보임.
3. Google Play 개발자 등록(1회 25달러) → 앱 올리기. 사이트를 고치면 앱도 바로 바뀜(다시 올릴 필요 없음).

## 길 2 — Android·iOS: Capacitor
- 웹 파일을 앱 안에 넣는 방식. 이 저장소는 빌드 단계 없는 정적 파일이라 `webDir` 을 저장소 루트(필요한 파일만 복사한 폴더)로 두면 됨. 판 데이터(`data/*`)는 앱 안 복사본이 낡으므로 **네트워크에서 받게** 바꿔야 함(예: 시작 시 `https://p-max168.github.io/thai-news-kr/data/index.json` 을 먼저 시도).
- 서비스 워커는 앱 안(capacitor://, http://localhost)에선 필요 없음 — 등록 실패해도 화면은 동작(지금 코드는 실패를 무시함).
- Google 로그인: 앱 안 웹뷰에서는 팝업 로그인이 막히는 경우가 많음 → 앱용 로그인 플러그인 필요(나중 일). 로그인 없이도 모든 기능 동작.
- iOS 심사: '웹사이트를 감싼 것뿐'이면 거절될 수 있음(앱 심사 지침 4.2) → 오프라인 읽기·바로가기·알림 같은 앱다운 기능이 있어야 유리.
- 명령(노드가 있는 컴퓨터에서): `npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios` → `npx cap init "태국 뉴스 한눈에" kr.thainews.app --web-dir www` → `npx cap add android` / `ios` → Android Studio / Xcode 로 빌드. **이 저장소엔 node_modules 를 넣지 않음**(별도 폴더 권장).

## 비용(LOGIN_TODO)
- Google Play 개발자 계정: 1회 25달러.
- Apple Developer Program: **연 99달러**(iOS 앱 필수) + 맥(Xcode) 필요.
- 맞춤 도메인(선택, assetlinks·ads.txt 해결): 연 약 1~2만 원.
