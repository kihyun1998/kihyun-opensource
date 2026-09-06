/**
 * CI 에서 데모를 만든다. **바뀐 것만.**
 *
 * 반드시 gen-packages.mjs 를 먼저 돌린 뒤에 실행한다.
 * -------------------------------------------------
 * 이 스크립트는 packages.ts 의 버전을 "만들어야 할 것" 으로 삼는다. 그런데
 * 커밋된 packages.ts 는 릴리스를 모른다 — pub.dev 에 새 버전이 올라와도 그
 * 파일은 그대로다. 그 상태로 읽으면 매니페스트와 일치해 **아무것도 다시
 * 만들지 않고**, 목록만 새 버전으로 갱신되어 옛 데모에 새 버전 딱지가 붙는다.
 * 그래서 워크플로는 gen → 이 스크립트 → gen 순서로 돈다. 앞의 gen 이 pub.dev
 * 에서 진짜 버전을 받아오고, 뒤의 gen 이 demoReady 를 러너의 실물로 맞춘다.
 *
 * 형제 저장소는 캐시가 적중해도 받는다
 * ----------------------------------
 * hasExample 은 `../<slug>/example/lib` 의 존재로 정해진다. 데모가 캐시에서
 * 나왔다고 클론을 건너뛰면 그 값이 false 가 되어, 데모 파일은 배포되는데
 * 화면은 "실행 불가" 라고 말한다. 정상 경로가 곧 고장 경로가 된다.
 *
 * 태그를 받는 이유
 * --------------
 * example 이 패키지를 경로 의존(`path: ../`)으로 물어 데모 번들에 소스가
 * 통째로 들어간다. 기본 브랜치를 받으면 아직 배포되지 않은 코드가 데모에
 * 실려, 방문자가 만지는 것이 pub.dev 에서 받을 것과 달라진다.
 *
 * 사용법
 *   node scripts/ci-build-demos.mjs            # 낡은 것만
 *   node scripts/ci-build-demos.mjs --all      # 전부 다시
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT = dirname(REPO);
const MANIFEST = join(REPO, 'web', '.demo-versions.json');

const force = process.argv.includes('--all');
const lines = [];
const log = (s) => {
  console.log(s);
  lines.push(s);
};

const { PACKAGES } = await import(join(REPO, 'web', 'src', 'content', 'packages.ts'));

const built = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const demoDir = (slug) => join(REPO, 'web', 'public', 'demo', slug);

/** 데모를 만들 수 있는가. desktop/tool 은 원리적으로 불가능하다. */
const demoable = (p) => p.category === 'ui' && p.hasExample;

/** 이미 만들어 둔 것이 만들어야 할 것과 같고, 산출물이 실제로 있는가. */
const isFresh = (pkg) =>
  !force && built[pkg.slug] === pkg.version && existsSync(join(demoDir(pkg.slug), 'index.html'));

/** 형제 저장소를 그 버전의 태그로 받는다. 이미 있으면 그대로 둔다. */
function ensureCheckout(pkg) {
  const dir = join(ROOT, pkg.slug);
  if (existsSync(dir)) return;
  const url = `https://github.com/kihyun1998/${pkg.slug}.git`;
  try {
    run('git', ['clone', '--depth', '1', '--branch', `v${pkg.version}`, url, dir]);
  } catch {
    log(`  ! ${pkg.slug}: v${pkg.version} 태그가 없다. 기본 브랜치를 받는다 —`);
    log(`    데모가 pub.dev 에 올라간 것보다 앞설 수 있다.`);
    run('git', ['clone', '--depth', '1', url, dir]);
  }
}

// hasExample 은 pub.dev 가 모른다. 캐시 적중 여부와 무관하게 실물이 있어야 한다.
const candidates = PACKAGES.filter((p) => p.category === 'ui');
for (const pkg of candidates) ensureCheckout(pkg);

const targets = PACKAGES.filter(demoable);
const stale = targets.filter((p) => !isFresh(p));

log(`데모 대상 ${targets.length}개 · 다시 만들 것 ${stale.length}개`);
for (const p of targets) log(`  ${isFresh(p) ? '캐시' : '빌드'}  ${p.slug} ${p.version}`);

const failures = [];
for (const pkg of stale) {
  log(`\n▶ ${pkg.slug} ${pkg.version}`);
  try {
    run('node', [join(REPO, 'scripts', 'build-demo.mjs'), pkg.slug], REPO);
    built[pkg.slug] = pkg.version;
  } catch (err) {
    failures.push({ slug: pkg.slug, msg: String(err?.message ?? err).split('\n')[0] });
  }
}

// 낡은 데모를 새 버전 딱지로 내보내지 않는다. 빌드가 실패한 패키지의 이전
// 산출물이 캐시에 남아 있으면 demoReady 가 참이 되어, 목록은 새 버전을
// 말하는데 방문자가 만지는 것은 옛 코드가 된다. 그것이 이 이슈가 든 문제다.
// 데모가 없는 편이 거짓 데모보다 정직하다.
for (const pkg of targets) {
  if (built[pkg.slug] === pkg.version) continue;
  if (!existsSync(demoDir(pkg.slug))) continue;
  log(`  ! ${pkg.slug}: ${built[pkg.slug] ?? '없음'} 인 데모를 걷어낸다 (목록은 ${pkg.version})`);
  rmSync(demoDir(pkg.slug), { recursive: true, force: true });
  delete built[pkg.slug];
}

writeFileSync(MANIFEST, JSON.stringify(built, null, 2) + '\n');

if (failures.length) {
  log(`\n실패 ${failures.length}개:`);
  for (const f of failures) log(`  ✗ ${f.slug.padEnd(28)} ${f.msg}`);
}

const ready = targets.filter((p) => existsSync(join(demoDir(p.slug), 'index.html')));
log(`\n데모 준비됨 ${ready.length}/${targets.length}`);

// 실패를 모아 보고하되, 워크플로 요약에도 남긴다. 로그 위쪽에 묻히면 못 찾는다.
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `\n### 데모\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`,
    {
      flag: 'a',
    },
  );
}

if (targets.length > 0 && ready.length === 0) {
  console.error('데모가 하나도 만들어지지 않았다. 배포하지 않는다.');
  process.exit(1);
}
