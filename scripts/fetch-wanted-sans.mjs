/**
 * Wanted Sans (SIL OFL 1.1) 를 내려받아 자체 호스팅한다.
 *
 * 왜 split 인가
 * ------------
 * 한글 폰트는 글리프가 많아 통짜로 받으면 1.23MB 다. 배포처가 제공하는
 * split 판은 유니코드 범위별로 92 조각이라, 브라우저가 **페이지에 실제로
 * 그려지는 글자의 조각만** 내려받는다. 디스크는 2.18MB 로 늘지만
 * 방문자가 받는 양은 보통 그 10 분의 1 이하다.
 *
 * 왜 CDN 을 직접 링크하지 않는가
 * ------------------------------
 * 1) 정적 export 라 외부 의존은 그대로 첫 페인트의 위험이 된다
 * 2) 나중에 wasm 멀티스레드용 COOP/COEP 를 켜면 교차 출처 리소스가 성가셔진다
 *    — 같은 출처에서 나가면 그 문제가 아예 없다
 *
 * 사용법
 *   node scripts/fetch-wanted-sans.mjs
 */

import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = 'v1.0.3';
const BASE = `https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@${VERSION}/packages/wanted-sans/fonts/webfonts/variable/split`;

const SITE = join(dirname(dirname(fileURLToPath(import.meta.url))), 'web');
const OUT_FONTS = join(SITE, 'public', 'fonts', 'wanted-sans');
const OUT_CSS = join(SITE, 'src', 'app', 'wanted-sans.css');

/** 공개 경로. CSS 의 상대 url 을 이걸로 바꿔 붙인다. */
const PUBLIC_PREFIX = '/fonts/wanted-sans';

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

const css = await (await get(`${BASE}/WantedSansVariable.min.css`)).text();

// url("woff2/WantedSansVariable.split.N.woff2") → url("/fonts/wanted-sans/woff2/...")
const files = [...css.matchAll(/url\("([^"]+\.woff2)"\)/g)].map((m) => m[1]);
console.log(`@font-face 블록의 woff2 참조: ${files.length}개`);

mkdirSync(join(OUT_FONTS, 'woff2'), { recursive: true });

let downloaded = 0;
let bytes = 0;
let skipped = 0;

// 동시성 8. jsDelivr 를 몰아치지 않으면서 충분히 빠르다.
const queue = [...new Set(files)];
async function worker() {
  for (;;) {
    const rel = queue.shift();
    if (!rel) return;
    const dest = join(OUT_FONTS, rel);
    if (existsSync(dest)) {
      bytes += statSync(dest).size;
      skipped++;
      continue;
    }
    const buf = Buffer.from(await (await get(`${BASE}/${rel}`)).arrayBuffer());
    mkdirSync(join(dest, '..'), { recursive: true });
    writeFileSync(dest, buf);
    downloaded++;
    bytes += buf.length;
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const header = `/*
 * Wanted Sans ${VERSION} — SIL Open Font License 1.1
 * https://github.com/wanteddev/wanted-sans
 *
 * scripts/fetch-wanted-sans.mjs 가 생성한다. 손으로 고치지 말 것.
 * 유니코드 범위별로 쪼개져 있어, 브라우저는 페이지에 실제로 쓰인 글자의
 * 조각만 내려받는다.
 */
`;

writeFileSync(
  OUT_CSS,
  header + css.replace(/url\("([^"]+\.woff2)"\)/g, (_, p) => `url("${PUBLIC_PREFIX}/${p}")`),
  'utf8'
);

console.log(`내려받음 ${downloaded}개, 건너뜀 ${skipped}개, 합계 ${(bytes / 1048576).toFixed(2)} MB`);
console.log(`  폰트 → ${OUT_FONTS}/woff2/`);
console.log(`  CSS  → ${OUT_CSS}`);
