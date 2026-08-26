import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // eslint-config-next 의 기본 ignore
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // 프로젝트 추가분
    'node_modules/**',
    '.claude/**',
    // Flutter 웹 빌드 산출물은 린트 대상이 아니다.
    'public/demo/**',
  ]),
]);

export default eslintConfig;
