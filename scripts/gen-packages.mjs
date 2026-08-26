// pubspec.yaml 에서 패키지 목록을 뽑아 content/packages.ts 를 생성한다.
// 범주(category)만 판단이 필요해서 여기에 표로 박아두고, 나머지는 전부 실물에서 읽는다.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/github';

// ui      = Flutter 위젯. 웹에서 그대로 돈다 → 데모 가능
// desktop = Windows/macOS 네이티브에 의존 → 웹 데모 불가
// tool    = CLI/생성기 → 웹 데모 불가
//
// **사이트에 올릴 준비가 된 패키지만 여기 둔다.** 목록에 있으면 사이트에
// 뜨고, 뜬다는 건 사람들이 들어온다는 뜻이다. example 이 아직 완성되지
// 않은 패키지를 미리 올리면 빈 데모나 반쯤 만든 화면을 보여주게 된다.
//
// 준비되는 대로 PENDING 에서 CATEGORY 로 한 줄씩 옮긴다.
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

/** description 은 인라인·접힘(>-)·따옴표 세 형태로 쓰여 있다. 전부 한 줄로 편다. */
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
const asUrl = (s) => (/^https?:\/\//.test(s) ? s : '');

const rows = [];
for (const [slug, category] of Object.entries(CATEGORY)) {
  const p = join(ROOT, slug, 'pubspec.yaml');
  if (!existsSync(p)) {
    console.error('missing', slug);
    continue;
  }
  const yaml = readFileSync(p, 'utf8');
  const version = (yaml.match(/^version:\s*(.+)$/m)?.[1] ?? '0.0.0').trim();
  const description = readDescription(yaml);
  const repo = asUrl((yaml.match(/^repository:\s*(.+)$/m)?.[1] ?? '').trim());
  const homepage = asUrl((yaml.match(/^homepage:\s*(.+)$/m)?.[1] ?? '').trim());
  const hasExample = existsSync(join(ROOT, slug, 'example', 'lib'));
  // demoReady 는 손으로 관리하지 않는다. 빌드를 복사했는지는 파일시스템이 안다.
  const demoReady = existsSync(
    join(ROOT, 'kihyun-opensource', 'web', 'public', 'demo', slug, 'index.html')
  );
  rows.push({ slug, category, version, description, repo: repo || homepage, hasExample, demoReady });
}

// ui 먼저, 그 안에서는 이름순. 목록의 기본 순서가 곧 사이트의 기본 순서다.
const ORDER = { ui: 0, desktop: 1, tool: 2 };
rows.sort((a, b) => ORDER[a.category] - ORDER[b.category] || a.slug.localeCompare(b.slug));

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const body = rows
  .map(
    (r) => `  {
    slug: '${r.slug}',
    version: '${r.version}',
    category: '${r.category}',
    description: '${esc(r.description)}',
    repoUrl: '${r.repo || `https://github.com/kihyun1998/${r.slug}`}',
    hasExample: ${r.hasExample},
    demoReady: ${r.demoReady},
  },`
  )
  .join('\n');

const out = `/**
 * 패키지 목록의 정본. scripts/gen-packages.mjs 가 pubspec.yaml 에서 생성한다.
 * 손으로 고치지 말고 스크립트를 다시 돌릴 것 — 버전이 어긋나면 사이트가 거짓말을 한다.
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
};

export const CATEGORY_LABEL: Record<Category, string> = {
  ui: '위젯',
  desktop: '데스크톱',
  tool: '도구',
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

writeFileSync('D:/github/kihyun-opensource/web/src/content/packages.ts', out, 'utf8');
console.log(`생성됨: ${rows.length}개 (ui ${rows.filter((r) => r.category === 'ui').length}, desktop ${rows.filter((r) => r.category === 'desktop').length}, tool ${rows.filter((r) => r.category === 'tool').length})`);
