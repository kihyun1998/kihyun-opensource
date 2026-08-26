/**
 * 프로덕션 배포에 들어가면 안 되는 라우트를 out/ 에서 걷어낸다.
 *
 * 왜 빌드 후에 지우는가
 * --------------------
 * 정적 export 에는 서버가 없어 미들웨어도 인증도 쓸 수 없다. 그렇다고
 * 라우트를 안 만들 수도 없었다:
 *
 *   robots: noindex   검색엔진에 부탁하는 것일 뿐. 파일은 배포된다.
 *   notFound()        404 껍데기 안에 본문이 그대로 실려 나갔다.
 *   generateStaticParams 이 빈 배열   output: export 가 거부한다.
 *
 * 남는 방법은 만들어진 파일을 지우는 것이다. 단순하고, 결과가 분명하다.
 */
import { existsSync, rmSync } from 'node:fs';

const DEV_ONLY = ['out/design'];

for (const dir of DEV_ONLY) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`  걷어냄: ${dir}`);
  }
}
