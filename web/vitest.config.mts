import { defineConfig } from 'vitest/config';

/**
 * 테스트는 하나뿐이다 — 패키지 목록 생성기의 변환부.
 *
 * 그 생성기는 저장소 루트의 scripts/ 에 있고 자체 package.json 이 없다.
 * 매니페스트를 하나 더 두는 대신 여기서 루트 밖을 include 한다. Vite 의
 * 리졸버는 이 설정 파일의 위치를 기준으로 'vitest' 를 찾으므로, 테스트
 * 파일이 web/ 바깥에 있어도 의존성이 풀린다.
 */
export default defineConfig({
  test: {
    include: ['../scripts/**/*.test.mjs'],
    environment: 'node',
  },
});
