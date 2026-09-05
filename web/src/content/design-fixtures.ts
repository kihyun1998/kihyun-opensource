/**
 * /design 프로토타입 전용 고정 데이터. **사이트는 이 파일을 읽지 않는다.**
 *
 * 정본은 content/packages.ts 이고, 거기에는 사이트에 올릴 준비가 끝난 것만
 * 들어간다 — 지금은 1개다. 1개짜리 목록으로는 레이아웃을 판단할 수 없어서
 * (카드 그리드가 비었는지, 리스트가 길어 지치는지가 안 보인다) 형제 저장소의
 * pubspec.yaml 에서 실물을 한 번 떠 왔다.
 *
 * 손으로 고쳐도 된다. 여기서 나온 결정이 packages.ts 로 넘어가는 것이지,
 * 이 파일이 무언가의 소스가 되지는 않는다.
 */

export type FixturePkg = {
  slug: string;
  version: string;
  category: 'ui' | 'desktop' | 'tool';
  description: string;
  hasExample: boolean;
  /** 형제 저장소의 마지막 커밋 날짜. 릴리스 날짜의 자리끼움이다. */
  updated: string;
};

export const FIXTURES: readonly FixturePkg[] = [
  {
    slug: 'flutter_table_plus',
    version: '2.17.0',
    category: 'ui',
    description:
      'A highly customizable and efficient table widget for Flutter, featuring synchronized scrolling, theming, sorting, selection, column reordering, hover buttons, and expandable rows.',
    hasExample: true,
    updated: '2026-09-04',
  },
  {
    slug: 'flutter_dropdown_button',
    version: '4.2.0',
    category: 'ui',
    description:
      'A highly customizable dropdown widget with overlay-based rendering, smart positioning, search, tooltips, and full control over appearance.',
    hasExample: true,
    updated: '2026-08-17',
  },
  {
    slug: 'boring_avatars',
    version: '0.3.0',
    category: 'ui',
    description:
      'A bit-exact Dart port of boring-avatars. Same name in, same avatar out — with every upstream version selectable.',
    hasExample: true,
    updated: '2026-08-15',
  },
  {
    slug: 'flutter_checkbox',
    version: '0.3.2',
    category: 'ui',
    description:
      'Customizable Flutter checkbox widgets with tristate, tile layout, hover ring, keyboard navigation, and smooth animations.',
    hasExample: true,
    updated: '2026-08-09',
  },
  {
    slug: 'flutter_tweakcn_generator',
    version: '0.5.1',
    category: 'tool',
    description:
      'Converts tweakcn CSS themes into Flutter ThemeData with ColorScheme, ThemeExtension, Google Fonts, and light/dark mode support.',
    hasExample: true,
    updated: '2026-08-04',
  },
  {
    slug: 'flutter_folderview',
    version: '0.11.2',
    category: 'ui',
    description:
      'A customizable Flutter widget for displaying hierarchical data in tree and folder views with rich theming support.',
    hasExample: true,
    updated: '2026-07-10',
  },
  {
    slug: 'flutter_password_input',
    version: '0.6.1',
    category: 'ui',
    description:
      'A customizable password text field widget with Caps Lock detection, visibility toggle, force English input mode, and comprehensive theming support.',
    hasExample: true,
    updated: '2026-07-10',
  },
  {
    slug: 'just_tooltip',
    version: '0.4.4',
    category: 'ui',
    description:
      'A lightweight, customizable Flutter tooltip with flexible placement, hover & tap triggers, programmatic control, and RTL support.',
    hasExample: true,
    updated: '2026-07-10',
  },
  {
    slug: 'flutter_license_manager',
    version: '3.0.0',
    category: 'ui',
    description:
      'A comprehensive Flutter package for managing and displaying OSS license information with support for custom licenses and improved UI components.',
    hasExample: true,
    updated: '2026-07-02',
  },
  {
    slug: 'flutter_ime',
    version: '2.1.4',
    category: 'desktop',
    description:
      'A Flutter plugin for controlling IME (Input Method Editor) state. Switch to English keyboard, detect input source changes, and monitor Caps Lock state on Windows and macOS.',
    hasExample: true,
    updated: '2026-07-01',
  },
  {
    slug: 'just_font_scan',
    version: '0.3.0',
    category: 'desktop',
    description:
      'Scan system font families and their supported weights using platform-native APIs (DirectWrite on Windows, CoreText on macOS).',
    hasExample: true,
    updated: '2026-04-22',
  },
  {
    slug: 'flutter_oss_manager',
    version: '2.1.0',
    category: 'tool',
    description:
      "A Flutter package and CLI for scanning, summarizing, and generating open-source license information for your project's dependencies.",
    hasExample: true,
    updated: '2026-04-22',
  },
  {
    slug: 'just_make_logo',
    version: '0.12.0',
    category: 'tool',
    description: 'A simple logo maker. Create logos with text, images, or both.',
    hasExample: false,
    updated: '2026-03-25',
  },
  {
    slug: 'just_color_picker',
    version: '0.1.0',
    category: 'ui',
    description:
      'A customizable HSV color picker with circular hue wheel, saturation-value panel, alpha slider, and HEX input. No external dependencies.',
    hasExample: true,
    updated: '2026-02-22',
  },
];
