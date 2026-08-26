/**
 * 패키지 하나의 example 을 웹으로 빌드해 public/demo/<slug>/ 에 앉힌다.
 *
 * 사용법
 *   node scripts/build-demo.mjs flutter_table_plus
 *   node scripts/build-demo.mjs --all          # ui 범주 전부
 *   node scripts/build-demo.mjs --all --dry    # 무엇을 할지만 출력
 *   node scripts/build-demo.mjs --all --subset-fonts   # 빌드 전에 폰트도 정리
 *
 * 빌드 후 지우는 것들 (전부 브라우저가 요청하지 않는 파일이다)
 *   *.map / *.symbols  소스맵과 크래시 심볼. 개발용이다.
 *   canvaskit/         렌더러. 기본 설정에서 Flutter 는 이걸 로컬이 아니라
 *                      https://www.gstatic.com/flutter-canvaskit/<engineRevision>/
 *                      에서 받는다 (flutter_bootstrap.js 의 canvasKitBaseUrl 결정
 *                      로직: canvasKitBaseUrl → engineRevision CDN → 로컬 순).
 *                      엔진 리비전이 URL 에 들어가므로 같은 Flutter 로 빌드한
 *                      데모들이 전부 같은 URL 을 공유한다 — 방문자가 하나를 열면
 *                      나머지는 브라우저 캐시에서 뜬다. 자체 호스팅으로는 못 내는 효과다.
 *
 *                      gstatic 이 막힌 망을 지원해야 한다면 이 삭제를 끄고
 *                      (KEEP_CANVASKIT=1) 대신 index.html 에서 canvasKitBaseUrl 을
 *                      공유 경로로 지정하면 된다.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/github';
const SITE = join(ROOT, 'kihyun-opensource', 'web');
const KEEP_CANVASKIT = process.env.KEEP_CANVASKIT === '1';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const all = args.includes('--all');
const subsetFonts = args.includes('--subset-fonts');
const named = args.filter((a) => !a.startsWith('--'));

/** packages.ts 를 파싱하지 않고 slug/category 만 정규식으로 훑는다. */
function demoableSlugs() {
  const src = readFileSync(join(SITE, 'src', 'content', 'packages.ts'), 'utf8');
  const out = [];
  for (const m of src.matchAll(
    /slug: '([^']+)',\s*version: '[^']*',\s*category: '([^']+)',[\s\S]*?hasExample: (true|false)/g
  )) {
    if (m[2] === 'ui' && m[3] === 'true') out.push(m[1]);
  }
  return out;
}

function dirSize(dir) {
  let total = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    total += e.isDirectory() ? dirSize(p) : statSync(p).size;
  }
  return total;
}

const mb = (n) => (n / 1048576).toFixed(2) + ' MB';

function buildOne(slug) {
  const example = join(ROOT, slug, 'example');
  if (!existsSync(join(example, 'lib'))) {
    console.log(`  건너뜀 (example 없음): ${slug}`);
    return null;
  }

  const dest = join(SITE, 'public', 'demo', slug);
  console.log(`\n▶ ${slug}`);

  if (dry) {
    console.log(`  flutter build web --release --wasm --base-href=/demo/${slug}/`);
    console.log(`  → ${dest}`);
    return null;
  }

  if (subsetFonts) {
    // 폰트는 example 이 통째로 싣는다. flutter_table_plus 는 Flutter 코드가
    // 6MB 인데 Pretendard 가 15.5MB 였다. 패키지 저장소를 고치는 일이라 옵트인이다.
    execFileSync(
      'python',
      [join(ROOT, 'kihyun-opensource', 'scripts', 'subset-example-fonts.py'),
       join(ROOT, slug), '--apply'],
      { stdio: 'inherit', shell: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }
    );
  }

  execFileSync(
    'flutter',
    [
      'build', 'web', '--release', '--wasm',
      `--base-href=/demo/${slug}/`,
      '--pwa-strategy=none',
    ],
    { cwd: example, stdio: 'inherit', shell: true }
  );

  const out = join(example, 'build', 'web');
  const before = dirSize(out);

  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(out, dest, { recursive: true });

  // 죽은 파일 제거.
  const prune = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) prune(p);
      else if (/\.(map|symbols)$/.test(e.name) || e.name === '.last_build_id') {
        rmSync(p);
      }
    }
  };
  prune(dest);

  if (!KEEP_CANVASKIT) rmSync(join(dest, 'canvaskit'), { recursive: true, force: true });

  const after = dirSize(dest);
  console.log(`  ${mb(before)} → ${mb(after)}  (${(100 * (1 - after / before)).toFixed(0)}% 감소)`);
  return { slug, before, after };
}

const targets = all ? demoableSlugs() : named;
if (targets.length === 0) {
  console.error('대상이 없습니다. slug 를 주거나 --all 을 쓰세요.');
  process.exit(1);
}

console.log(`대상 ${targets.length}개${dry ? ' (dry run)' : ''}${subsetFonts ? ' · 폰트 부분집합 적용' : ''}`);

// 15개를 도는 중에 하나가 터진다고 나머지를 버리지 않는다.
// 실패는 모아서 끝에 한 번에 보고한다 — 어느 패키지가 왜 실패했는지가
// 스크롤 위쪽 어딘가에 묻히면 못 찾는다.
const results = [];
const failures = [];
for (const slug of targets) {
  try {
    const r = buildOne(slug);
    if (r) results.push(r);
  } catch (err) {
    const msg = String(err?.message ?? err).split('\n')[0];
    failures.push({ slug, msg });
    console.error(`  ✗ 실패: ${msg}`);
  }
}

if (results.length > 1) {
  const b = results.reduce((n, r) => n + r.before, 0);
  const a = results.reduce((n, r) => n + r.after, 0);
  console.log(`\n성공 ${results.length}개  ${mb(b)} → ${mb(a)}`);
}

if (failures.length) {
  console.log(`\n실패 ${failures.length}개:`);
  for (const f of failures) console.log(`  ✗ ${f.slug.padEnd(28)} ${f.msg}`);
}

if (!dry && results.length) {
  console.log('\ndemoReady 를 갱신합니다...');
  execFileSync('node', [join(ROOT, 'kihyun-opensource', 'scripts', 'gen-packages.mjs')], {
    stdio: 'inherit',
  });
}

process.exit(failures.length && !results.length ? 1 : 0);
