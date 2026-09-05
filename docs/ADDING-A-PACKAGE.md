# 패키지를 사이트에 올리는 절차

`kihyun-opensource` 사이트에 Flutter 패키지 데모를 추가하는 전체 과정.
`flutter_table_plus` 로 한 번 완주해서 검증한 순서다.

## 전제

- 패키지가 이 저장소의 형제 디렉터리(`../<slug>/`)에 있고 `example/lib/` 이 있다
- example 이 **완성돼 있다** — 사이트에 올린다는 건 사람들이 들어온다는 뜻이다.
  반쯤 만든 화면을 보여줄 바에는 목록에 없는 편이 낫다
- **패키지가 pub.dev 에 이미 배포돼 있다** — 버전·설명·릴리스 날짜의 정본이
  거기다. 아직 배포 전이라면 목록에 올려도 로컬 pubspec 으로 대신 채워지고
  날짜 자리가 빈다
- Flutter 3.29 이상 (wasm 빌드)
- 네트워크 — 목록 생성이 pub.dev 를 조회한다
- Python + fontTools (`pip install fonttools`) — 폰트 정리에만 필요

---

## 1. 목록에 등록

`scripts/gen-packages.mjs` 의 `CATEGORY` 에 한 줄 추가한다.
아직 준비 안 된 패키지는 `PENDING` 에 두고, 준비되면 위로 옮긴다.

```js
const CATEGORY = {
  flutter_table_plus: 'ui',
  your_package: 'ui',        // ← 추가
};
```

범주는 **웹에서 돌 수 있느냐**로 정한다. 이건 자동 판별이 안 되는 판단이다.

| 범주 | 뜻 | 데모 |
|---|---|---|
| `ui` | Flutter 위젯 | 가능 |
| `desktop` | Windows/macOS 네이티브 의존 | **불가** |
| `tool` | CLI·생성기 | **불가** |

`desktop`·`tool` 은 사이트에 뜨되 데모 자리에 "왜 못 도는지" 를 설명하는 화면이
나온다. 빈 화면이나 "준비 중" 을 보여주지 않는다 — 준비의 문제가 아니기 때문이다.

```bash
node scripts/gen-packages.mjs
```

`web/src/content/packages.ts` 가 pub.dev 에서 다시 생성된다.
**이 파일은 손으로 고치지 않는다.** 버전·설명·repository·릴리스 날짜가 전부
pub.dev 에서 오고, 손으로 고치면 릴리스 때 사이트가 거짓말을 하게 된다.

**목록의 순서도 생성물이다.** 최근 릴리스가 먼저 오고 아직 배포되지 않은 것이
뒤에 온다. 배열 순서가 곧 메인 화면의 순서이며, 사람이 정하지 않는다.

### 왜 로컬 pubspec 이 아니라 pub.dev 인가

로컬을 읽으면 사이트의 정확도가 **그 저장소를 마지막으로 pull 한 시점**에
달린다. 실제로 어긋나 있었다 — `flutter_ime` 는 로컬 체크아웃이 24커밋 밀려
pubspec 에 2.1.4 가 적혀 있는데 pub.dev 에는 3.0.0 이 올라가 있었다. 그 상태로
목록에 옮겼다면 사이트가 조용히 낮은 버전을 말했을 것이다.

로컬 형제 저장소는 이제 pub.dev 가 알 수 없는 단 하나 — `example/lib` 이
있는지 — 에만 쓰인다.

### 실패했을 때

| 상황 | 동작 |
|---|---|
| pub.dev 에 없음 (404) | 경고 후 로컬 pubspec 으로 채우고 날짜는 비운다 |
| pub.dev 에도 로컬에도 없음 | 경고 후 **목록에서 뺀다** |
| 5xx · 네트워크 오류 | **생성을 중단한다** |
| 200 인데 응답 모양이 다름 | **생성을 중단한다** |

404 와 나머지를 가르는 기준이 있다. 404 는 "그 패키지는 정말 pub.dev 에 없다"
이고, 나머지는 "사실을 확인하지 못했다" 이다. 후자를 폴백으로 넘기면 낡은
데이터가 조용히 배포된다 — 눈에 보이는 실패보다 나쁘다.

---

## 2. 폰트 정리 (선택, 효과 큼)

example 이 한글 폰트를 싣는다면 **여기가 가장 큰 절감처**다.
`flutter_table_plus` 는 Flutter 코드가 6MB 인데 Pretendard 가 15.5MB 였다.

```bash
python3 scripts/subset-example-fonts.py ../<slug>          # 계산만
python3 scripts/subset-example-fonts.py ../<slug> --apply  # 적용
```

소스를 훑어 실제로 쓰이는 CJK 글자만 남긴다. 라틴뿐이면 굵기당 2.6MB → 65KB.

**주의 두 가지**

- **패키지 저장소를 수정한다.** 폰트는 git 추적 대상이라 `git checkout -- example/`
  로 되돌아가지만, 어느 브랜치에서 하는지 확인하고 커밋을 분리할 것
- **가정을 박는 작업이다.** 나중에 example 에 한글을 넣으면 두부(□)가 뜬다.
  그때는 스크립트를 다시 돌리면 된다 — 소스를 스캔해 발견된 글자를 자동 포함한다

안 쓰는 `FontWeight` 를 pubspec 에서 빼는 건 사람이 판단해야 한다.
`grep -rhoE "FontWeight\.w?[a-z0-9]+" example/lib/ | sort | uniq -c` 로 확인한다.

---

## 3. 데모 빌드

```bash
node scripts/build-demo.mjs <slug>
node scripts/build-demo.mjs --all                  # CATEGORY 의 ui 전부
node scripts/build-demo.mjs --all --dry            # 무엇을 할지만 출력
node scripts/build-demo.mjs --all --subset-fonts   # 2번을 함께 수행
```

스크립트가 하는 일:

```
flutter build web --release --wasm
    --base-href=/demo/<slug>/     ← 없으면 main.dart.js 를 루트에서 찾다 404
    --pwa-strategy=none           ← 서비스워커가 사이트 전체를 캐싱하는 것을 막는다
  → web/public/demo/<slug>/ 로 복사
  → *.map, *.symbols, canvaskit/ 제거
  → gen-packages.mjs 재실행 (demoReady 갱신)
```

`demoReady` 는 손으로 관리하지 않는다. `public/demo/<slug>/index.html` 의
존재 여부로 결정된다.

빌드가 몇 개 실패해도 나머지는 계속 진행하고, 실패 목록을 끝에 모아서 보고한다.

### 왜 `canvaskit/` 을 지우는가

`flutter_bootstrap.js` 의 렌더러 경로 결정 순서:

```
canvasKitBaseUrl 설정 있음  → 그것
engineRevision 있고 !useLocalCanvasKit → https://www.gstatic.com/flutter-canvaskit/<revision>/
그 외                        → 로컬 canvaskit/
```

기본 빌드에는 `engineRevision` 이 있고 `useLocalCanvasKit` 은 없다. 즉 **CDN 이
선택되고 로컬 폴더는 아무도 읽지 않는다** — 실제 브라우저로 확인했다.

게다가 엔진 리비전이 URL 에 들어가므로 **같은 Flutter 로 빌드한 데모들이 전부
같은 URL 을 공유한다.** 방문자가 하나를 열면 나머지는 브라우저 캐시에서 뜬다.
자체 호스팅으로는 낼 수 없는 효과다.

gstatic 이 막힌 망(중국·일부 사내망)을 지원해야 한다면:

```bash
KEEP_CANVASKIT=1 node scripts/build-demo.mjs <slug>
```

---

## 4. 확인

```bash
cd web && pnpm dev
```

- `http://localhost:3000/` — 목록에 카드가 떴는지
- `http://localhost:3000/play/<slug>/` — **데모 실행**을 눌러 실제로 도는지
- 브라우저 폭을 좁혀 모바일 서랍이 뜨는지
- OS 테마를 바꿔 라이트/다크 양쪽을 보는지

렌더러가 CDN 에서 오는지는 개발자도구 Network 에서
`gstatic.com/flutter-canvaskit/...` 요청으로 확인한다.

---

## 실측값 (flutter_table_plus 2.16.1)

| 단계 | 배포 용량 | 방문자 다운로드 |
|---|---|---|
| 원본 빌드 | 57.0 MB | 21.5 MB |
| `*.map`·`*.symbols` 제거 | 47.0 MB | 21.5 MB |
| 폰트 6종 → 4종 라틴 부분집합 | 32.0 MB | 6.2 MB |
| `canvaskit/` 제거 | **7.3 MB** | **2.8 MB** + CDN 3.4MB |

세 절감은 성격이 다르다. `*.map` 은 **아무도 받지 않던 것**, 폰트는 **방문자
다운로드를 실제로 줄인 것**, `canvaskit` 은 **받는 곳을 옮긴 것**이다.

---

## 배포

`web/.gitignore` 가 `/public/demo/` 를 무시한다. 빌드 산출물은 커밋하지 않는다.

Vercel 은 빌드 환경에 Flutter 가 없으므로 다음 중 하나를 골라야 한다:

- **GitHub Actions** — Flutter 설치 → 데모 빌드 → Next 빌드 → Vercel CLI 배포
- **산출물 커밋** — `.gitignore` 에서 빼고 커밋. 패키지가 늘면 히스토리가 부푼다

패키지 15개 기준 최적화 후 약 110MB 이므로 Actions 쪽이 맞다. (아직 미구축)

---

## 관련 파일

```
scripts/gen-packages.mjs           pub.dev → packages.ts (+ 로컬은 example 유무만)
scripts/gen-packages.test.mjs      위 스크립트의 변환부 테스트 (pnpm test)
scripts/subset-example-fonts.py    example 폰트 부분집합
scripts/build-demo.mjs             데모 빌드 + 정리 + 배치
scripts/fetch-wanted-sans.mjs      사이트 본문 폰트 (사이트용, 패키지와 무관)
web/src/content/packages.ts        생성물 — 손대지 말 것
web/src/content/design-fixtures.ts /design 프로토타입 전용 고정 데이터
```
