// pub.dev 에서 패키지 목록을 뽑아 content/packages.ts 를 생성한다.
//
// 정본은 pub.dev 다. 버전·설명·저장소 링크·릴리스 날짜가 전부 거기서 온다.
// 형제 저장소의 로컬 체크아웃은 pub.dev 가 알 수 없는 단 하나 — example 이
// 있는지 — 에만 쓴다. 그래야 사이트의 정확도가 "그 저장소를 마지막으로 pull
// 한 시점" 에 좌우되지 않는다. 유지 관리자가 `pub publish` 하는 것이 사이트가
// 알아야 할 전부다.
//
// 범주(category)만 판단이 필요해서 여기에 표로 박아두고, 나머지는 전부 실물에서 읽는다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 저장소 자신의 위치에서 뽑는다. 패키지들은 이 저장소의 형제로 놓여 있다.
// 경로를 박아두면 다른 머신·다른 OS 에서 그대로 죽는다.
const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT = dirname(REPO);

const PUB_API = 'https://pub.dev/api/packages';

// ui      = Flutter 위젯. 웹에서 그대로 돈다 → 데모 가능
// desktop = Windows/macOS 네이티브에 의존 → 웹 데모 불가
// tool    = CLI/생성기 → 웹 데모 불가
//
// **사이트에 올릴 준비가 된 패키지만 여기 둔다.** 목록에 있으면 사이트에
// 뜨고, 뜬다는 건 사람들이 들어온다는 뜻이다. example 이 아직 완성되지
// 않은 패키지를 미리 올리면 빈 데모나 반쯤 만든 화면을 보여주게 된다.
//
// **한 번에 하나씩만 옮긴다.** PENDING 에서 한 줄을 꺼내 배포하고, 그 패키지가
// 사이트에서 제대로 도는 것을 눈으로 확인한 다음에 그 다음 것을 꺼낸다.
// 여러 개를 한꺼번에 올리지 않는다 — 무엇이 깨졌는지 가려내야 하는 상황이
// 되고, 반쯤 만들어진 example 이 섞여 들어와도 알아채기 어렵다.
// 목록을 채우는 것이 목적이 아니다.
const CATEGORY = {
  flutter_table_plus: 'ui',
};

// 저장소에는 있지만 아직 사이트에 올리지 않는 것들. 지우지 말 것 —
// example 이 완성되면 위로 옮기기만 하면 되도록 범주를 미리 판단해 둔다.
export const PENDING = {
  boring_avatars: 'ui',
  flutter_animation_stepper: 'ui',
  flutter_checkbox: 'ui',
  flutter_dropdown_button: 'ui',
  flutter_flexible_menu: 'ui',
  flutter_folderview: 'ui',
  flutter_license_manager: 'ui',
  flutter_otp_widget: 'ui',
  flutter_password_input: 'ui',
  flutter_root_context_menu: 'ui',
  flutter_show_menu: 'ui',
  flutter_split_workspace: 'ui',
  flutter_vertical_table: 'ui',
  just_color_picker: 'ui',
  just_tooltip: 'ui',

  all_window_manager: 'desktop',
  ffi_url_launcher: 'desktop',
  flutter_alone: 'desktop',
  flutter_bin: 'desktop',
  flutter_ime: 'desktop',
  flutter_inactive_timer: 'desktop',
  just_autostart: 'desktop',
  just_font_scan: 'desktop',
  x509_cert_store: 'desktop',

  flutter_dev_graph: 'tool',
  flutter_oss_manager: 'tool',
  flutter_tweakcn_generator: 'tool',
  just_make_logo: 'tool',
};

/**
 * description 은 인라인·접힘(>-)·따옴표 세 형태로 쓰여 있다. 전부 한 줄로 편다.
 * pub.dev 가 답하지 않는 패키지의 폴백 경로에서만 쓰인다.
 */
function readDescription(yaml) {
  const lines = yaml.split(/\r?\n/);
  const i = lines.findIndex((l) => /^description:/.test(l));
  if (i < 0) return '';
  const head = lines[i].replace(/^description:\s*/, '').trim();
  // 인라인이든 접힘(>-)이든, 이어지는 들여쓴 줄은 모두 같은 설명의 일부다.
  // 첫 줄만 읽으면 여러 줄로 쓴 설명이 문장 중간에서 잘린다.
  const body = head === '>-' || head === '>' || head === '|' ? [] : [head];
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j].trim() === '') continue;
    if (!/^\s/.test(lines[j])) break; // 들여쓰기가 끝나면 다음 키다
    body.push(lines[j].trim());
  }
  return body
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/^["']|["']$/g, '')
    .trim();
}

/** pubspec 에 없는 필드를 정규식이 옆 줄에서 주워오는 일이 있어 URL 만 통과시킨다. */
const asUrl = (s) => (/^https?:\/\//.test(String(s ?? '')) ? String(s) : '');

/** 타임스탬프를 날짜로 자른다. 사이트가 보여주는 단위가 날짜다. */
const asDate = (published) => String(published).slice(0, 10);

/**
 * 이 저장소의 유일한 테스트 seam.
 *
 * 바깥 세계 둘을 주입받는다:
 *   fetchPackage(slug)  pub.dev 단일 패키지 조회. fetch 의 Response 를 돌려준다.
 *   readLocal(slug)     { pubspec, hasExample, demoReady }
 *
 * 404 와 그 밖의 실패를 **여기서** 가른다. 404 는 "그 패키지는 정말 pub.dev 에
 * 없다" 이고, 나머지는 "사실을 확인하지 못했다" 이다. 후자를 폴백으로 넘기면
 * 낡은 데이터가 조용히 배포된다 — 눈에 보이는 실패보다 나쁘다.
 *
 * 404 응답의 본문은 JSON 이 아니라 XML 이므로 본문이 아니라 상태 코드로 가른다.
 */
export async function buildRows(categories, { fetchPackage, readLocal, onWarn = () => {} }) {
  const rows = [];

  for (const [slug, category] of Object.entries(categories)) {
    const local = readLocal(slug);
    const res = await fetchPackage(slug); // 네트워크 오류는 그대로 위로 던진다

    let version;
    let description;
    let repo;
    let published;

    if (res.status === 404) {
      if (!local.pubspec) {
        onWarn(`${slug}: pub.dev 에도 로컬에도 없다. 목록에서 뺀다.`);
        continue;
      }
      onWarn(`${slug}: pub.dev 에 없다. 로컬 pubspec 으로 대신하고 날짜는 비운다.`);
      const yaml = local.pubspec;
      version = (yaml.match(/^version:\s*(.+)$/m)?.[1] ?? '0.0.0').trim();
      description = readDescription(yaml);
      repo =
        asUrl((yaml.match(/^repository:\s*(.+)$/m)?.[1] ?? '').trim()) ||
        asUrl((yaml.match(/^homepage:\s*(.+)$/m)?.[1] ?? '').trim());
      published = null;
    } else if (!res.ok) {
      throw new Error(`pub.dev 조회 실패 (${slug}): HTTP ${res.status}`);
    } else {
      const { latest } = await res.json();
      // 200 을 받았다는 것이 우리가 기대하는 모양이라는 뜻은 아니다. 검증하지
      // 않으면 version: 'undefined' 나 published: 'undefine' 이 날짜인 척
      // 정렬되어 사이트에 실린다 — 조용히 잘못된 값이 정확히 이 경로로 온다.
      if (!latest?.version || !latest?.published) {
        throw new Error(
          `pub.dev 응답 모양이 다르다 (${slug}): latest.version 과 latest.published 가 필요하다`
        );
      }
      version = latest.version;
      published = asDate(latest.published);
      description = String(latest.pubspec?.description ?? '')
        .replace(/\s+/g, ' ')
        .trim();
      repo = asUrl(latest.pubspec?.repository) || asUrl(latest.pubspec?.homepage);
    }

    rows.push({
      slug,
      category,
      version,
      description,
      repoUrl: repo || `https://github.com/kihyun1998/${slug}`,
      hasExample: local.hasExample,
      demoReady: local.demoReady,
      published,
    });
  }

  // 최근 릴리스가 먼저. 아직 배포되지 않은 것은 맨 뒤로 보내고, 같은 날은
  // 이름으로 가른다 — 순서가 빌드마다 흔들리면 diff 가 거짓말을 한다.
  rows.sort((a, b) => {
    if (a.published && b.published) {
      return b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug);
    }
    if (a.published) return -1;
    if (b.published) return 1;
    return a.slug.localeCompare(b.slug);
  });

  return rows;
}

/* ------------------------------------------------------------------ */
/* 아래는 진짜 세계를 주입하는 껍데기. import 될 때는 돌지 않는다.       */
/* ------------------------------------------------------------------ */

const fetchPackage = (slug) => fetch(`${PUB_API}/${slug}`);

const readLocal = (slug) => {
  const pubspecPath = join(ROOT, slug, 'pubspec.yaml');
  return {
    pubspec: existsSync(pubspecPath) ? readFileSync(pubspecPath, 'utf8') : null,
    hasExample: existsSync(join(ROOT, slug, 'example', 'lib')),
    // demoReady 는 손으로 관리하지 않는다. 빌드를 복사했는지는 파일시스템이 안다.
    demoReady: existsSync(join(REPO, 'web', 'public', 'demo', slug, 'index.html')),
  };
};

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export function render(rows) {
  const body = rows
    .map(
      (r) => `  {
    slug: '${r.slug}',
    version: '${r.version}',
    category: '${r.category}',
    description: '${esc(r.description)}',
    repoUrl: '${r.repoUrl}',
    hasExample: ${r.hasExample},
    demoReady: ${r.demoReady},
    published: ${r.published ? `'${r.published}'` : 'null'},
  },`
    )
    .join('\n');

  return `/**
 * 패키지 목록의 정본. scripts/gen-packages.mjs 가 pub.dev 에서 생성한다.
 * 손으로 고치지 말고 스크립트를 다시 돌릴 것 — 버전이 어긋나면 사이트가 거짓말을 한다.
 *
 * 순서도 생성물이다. 최근 릴리스가 먼저 오고, 아직 배포되지 않은 것이 뒤에 온다.
 * 배열의 순서가 곧 화면의 순서이며, 사람이 정하지 않는다.
 *
 * 사이트가 아는 것은 여기까지다. README·API·가이드는 전부 pub.dev 와
 * 패키지 레포에 있고, 사이트는 링크만 건다.
 */

export type Category = 'ui' | 'desktop' | 'tool';

export type Pkg = {
  slug: string;
  version: string;
  /** ui = 웹에서 데모 가능. desktop/tool = 웹에서 돌 수 없다. */
  category: Category;
  description: string;
  repoUrl: string;
  /** 패키지에 example/lib 이 있는지. */
  hasExample: boolean;
  /** public/demo/<slug>/ 에 Flutter 웹 빌드를 실제로 복사했는지. */
  demoReady: boolean;
  /** pub.dev 최신 릴리스 날짜(YYYY-MM-DD). 아직 배포하지 않았으면 null. */
  published: string | null;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  ui: 'Widget',
  desktop: 'Desktop',
  tool: 'Tool',
};

/** 웹 데모를 띄울 수 있는가. desktop/tool 은 원리적으로 불가능하다. */
export const canDemo = (p: Pkg) => p.category === 'ui' && p.hasExample;

export const pubUrl = (p: Pkg) => \`https://pub.dev/packages/\${p.slug}\`;
export const apiUrl = (p: Pkg) => \`https://pub.dev/documentation/\${p.slug}/latest/\`;

export const PACKAGES: readonly Pkg[] = [
${body}
];

export const getPackage = (slug: string) => PACKAGES.find((p) => p.slug === slug);
`;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  const rows = await buildRows(CATEGORY, {
    fetchPackage,
    readLocal,
    onWarn: (m) => console.warn(`  ! ${m}`),
  });
  writeFileSync(join(REPO, 'web', 'src', 'content', 'packages.ts'), render(rows), 'utf8');
  const n = (c) => rows.filter((r) => r.category === c).length;
  console.log(
    `생성됨: ${rows.length}개 (ui ${n('ui')}, desktop ${n('desktop')}, tool ${n('tool')})`
  );
}
