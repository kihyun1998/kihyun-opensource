/**
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

export const pubUrl = (p: Pkg) => `https://pub.dev/packages/${p.slug}`;
export const apiUrl = (p: Pkg) => `https://pub.dev/documentation/${p.slug}/latest/`;

export const PACKAGES: readonly Pkg[] = [
  {
    slug: 'flutter_table_plus',
    version: '2.16.2',
    category: 'ui',
    description: 'A highly customizable and efficient table widget for Flutter, featuring synchronized scrolling, theming, sorting, selection, column reordering, hover buttons, and expandable rows.',
    repoUrl: 'https://github.com/kihyun1998/flutter_table_plus',
    hasExample: true,
    demoReady: true,
  },
];

export const getPackage = (slug: string) => PACKAGES.find((p) => p.slug === slug);
