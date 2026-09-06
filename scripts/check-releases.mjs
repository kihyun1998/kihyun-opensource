// 사이트가 말하고 있는 버전과 pub.dev 의 최신 버전을 견주어,
// 데모를 다시 만들어야 할 패키지를 고른다.
//
// 이것이 감시 작업의 유일한 판단이다. 나머지(빌드·배포)는 워크플로가 한다.
//
// 사용법
//   node scripts/check-releases.mjs           # 사람이 읽는 출력
//   node scripts/check-releases.mjs --github  # $GITHUB_OUTPUT 에 기록
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const PUB_API = "https://pub.dev/api/packages";

/**
 * 이 스크립트의 테스트 seam.
 *
 * @param current 사이트가 지금 말하고 있는 것. `{ slug, version }` 의 배열.
 * @param latest  pub.dev 가 말하는 최신 버전. 아직 배포되지 않았으면 null.
 * @returns 데모를 다시 만들어야 할 slug. 이름순.
 *
 * 규칙 셋:
 *   - **다름**이 기준이지 **높음**이 아니다. 되돌린 릴리스도 데모를 다시 만들어야 한다.
 *   - pub.dev 에 없는 패키지(null·누락)는 건너뛴다. 아직 배포 전인 패키지 하나가
 *     감시를 죽이거나 매일 헛된 배포를 부르면 안 된다.
 *   - pub.dev 에만 있고 사이트 목록에 없는 것은 보지 않는다. 무엇을 올릴지는
 *     사람의 판단이고 감시가 대신 정하지 않는다.
 */
export function changedSlugs(current, latest) {
  return current
    .filter(({ slug, version }) => {
      const published = latest[slug];
      if (published == null) return false;
      return published !== version;
    })
    .map(({ slug }) => slug)
    .sort((a, b) => a.localeCompare(b));
}

/** pub.dev 최신 버전 하나. 없으면 null, 확인하지 못했으면 던진다. */
async function fetchLatest(slug) {
  const res = await fetch(`${PUB_API}/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(`pub.dev 조회 실패 (${slug}): HTTP ${res.status}`);
  const { latest } = await res.json();
  if (!latest?.version) {
    throw new Error(
      `pub.dev 응답 모양이 다르다 (${slug}): latest.version 이 필요하다`,
    );
  }
  return latest.version;
}

const isCli = process.argv[1] && process.argv[1].endsWith("check-releases.mjs");

if (isCli) {
  // packages.ts 를 정규식으로 훑지 않고 그대로 읽는다. Node 24 가 타입을 벗겨 준다.
  // 파서를 두면 그것이 조용히 빈 목록을 내놓는 날 배포가 영영 돌지 않는다.
  const { PACKAGES } = await import(
    join(REPO, "web", "src", "content", "packages.ts")
  );

  const latest = {};
  for (const pkg of PACKAGES) {
    latest[pkg.slug] = await fetchLatest(pkg.slug); // 네트워크 오류는 그대로 위로
  }

  const changed = changedSlugs(PACKAGES, latest);

  for (const pkg of PACKAGES) {
    const now = latest[pkg.slug];
    const mark =
      now == null ? "· 미배포" : now === pkg.version ? "  그대로" : "↑ 바뀜";
    console.log(
      `  ${mark}  ${pkg.slug.padEnd(28)} ${pkg.version} → ${now ?? "—"}`,
    );
  }
  console.log(
    changed.length
      ? `\n다시 만들 것 ${changed.length}개: ${changed.join(" ")}`
      : "\n바뀐 것 없음.",
  );

  if (process.argv.includes("--github") && process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `changed=${changed.join(" ")}\nany=${changed.length ? "true" : "false"}\n`,
    );
  }
}
