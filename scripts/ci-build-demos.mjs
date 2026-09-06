/**
 * CI 에서 데모를 만든다. **바뀐 것만.**
 *
 * 왜 별도 스크립트인가
 * -------------------
 * 데모 하나의 웹 빌드가 30초를 넘는다. 목록이 자라면 매번 전부 다시 만드는
 * 것은 감당이 안 된다. 무엇이 이미 최신인지는 캐시와 함께 실려 온 매니페스트가
 * 알고 있다.
 *
 * 왜 태그를 체크아웃하는가
 * ----------------------
 * example 은 패키지를 경로 의존(`path: ../`)으로 물기 때문에 데모 번들 안에
 * 패키지 소스가 통째로 들어간다. 기본 브랜치를 받으면 아직 배포되지 않은
 * 코드가 데모에 실려, 방문자가 만지는 것이 pub.dev 에서 받을 것과 달라진다.
 * 그래서 packages.ts 의 버전에 해당하는 `v<버전>` 태그를 받는다.
 *
 * 사용법
 *   node scripts/ci-build-demos.mjs            # 낡은 것만
 *   node scripts/ci-build-demos.mjs --all      # 전부 다시
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT = dirname(REPO);
const MANIFEST = join(REPO, "web", ".demo-versions.json");

const force = process.argv.includes("--all");

const { PACKAGES } = await import(
  join(REPO, "web", "src", "content", "packages.ts")
);

const built = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", env: process.env });

/** 데모를 만들 수 있는가. desktop/tool 은 원리적으로 불가능하다. */
const demoable = (p) => p.category === "ui" && p.hasExample;

/**
 * 이미 만들어 둔 것과 만들어야 할 것이 같은가.
 * 산출물이 사라졌으면 매니페스트가 뭐라 하든 다시 만들어야 한다.
 */
const isFresh = (pkg) =>
  !force &&
  built[pkg.slug] === pkg.version &&
  existsSync(join(REPO, "web", "public", "demo", pkg.slug, "index.html"));

const targets = PACKAGES.filter(demoable);
const stale = targets.filter((p) => !isFresh(p));

console.log(`데모 대상 ${targets.length}개 · 다시 만들 것 ${stale.length}개`);
for (const p of targets) {
  console.log(`  ${isFresh(p) ? "캐시" : "빌드"}  ${p.slug} ${p.version}`);
}

const failures = [];

for (const pkg of stale) {
  const dir = join(ROOT, pkg.slug);
  const tag = `v${pkg.version}`;
  console.log(`\n▶ ${pkg.slug} ${tag}`);

  try {
    if (!existsSync(dir)) {
      // 태그 하나만 얕게 받는다. 전체 히스토리는 쓸 데가 없다.
      try {
        run("git", [
          "clone",
          "--depth",
          "1",
          "--branch",
          tag,
          `https://github.com/kihyun1998/${pkg.slug}.git`,
          dir,
        ]);
      } catch {
        console.log(
          `  ! ${tag} 태그가 없다. 기본 브랜치를 받는다 — 데모가 pub.dev 보다 앞설 수 있다.`,
        );
        run("git", [
          "clone",
          "--depth",
          "1",
          `https://github.com/kihyun1998/${pkg.slug}.git`,
          dir,
        ]);
      }
    }

    run("node", [join(REPO, "scripts", "build-demo.mjs"), pkg.slug], REPO);
    built[pkg.slug] = pkg.version;
  } catch (err) {
    const msg = String(err?.message ?? err).split("\n")[0];
    failures.push({ slug: pkg.slug, msg });
    console.error(`  ✗ 실패: ${msg}`);
  }
}

writeFileSync(MANIFEST, JSON.stringify(built, null, 2) + "\n");

if (failures.length) {
  console.log(`\n실패 ${failures.length}개:`);
  for (const f of failures) console.log(`  ✗ ${f.slug.padEnd(28)} ${f.msg}`);
}

// 하나가 터졌다고 나머지를 버리지 않는다. 다만 하나도 없으면 배포할 것이 없다.
const ready = targets.filter((p) =>
  existsSync(join(REPO, "web", "public", "demo", p.slug, "index.html")),
);
console.log(`\n데모 준비됨 ${ready.length}/${targets.length}`);

if (targets.length > 0 && ready.length === 0) {
  console.error("데모가 하나도 만들어지지 않았다. 배포하지 않는다.");
  process.exit(1);
}
