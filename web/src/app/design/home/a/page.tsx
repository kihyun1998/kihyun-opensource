import { ThemeToggle } from '@/components/site/theme-toggle';
import { FIXTURES, type FixturePkg } from '@/content/design-fixtures';
import { VariantChrome } from '../chrome';

/**
 * 시안 A — 리스트. 참고: antfu.me/projects
 *
 * 카드를 버린다. 카드는 항목이 서로 대등하고 각자 이미지를 가질 때 쓰는 그릇인데,
 * 이 목록은 둘 다 아니다. 주력 패키지와 실험이 같은 크기의 상자에 담기면
 * 무엇을 먼저 열어야 하는지가 사라진다.
 *
 * 대신 첫 섹션을 분류가 아니라 **"요즘 손대는 것"** 으로 연다. 사람이 자기
 * 작업을 소개할 때 쓰는 순서다 — 분류는 그 다음 문제다.
 */

const SECTIONS = [
  {
    title: '요즘 손대는 것',
    note: '최근에 손을 댄 순서입니다.',
    pick: (rows: readonly FixturePkg[]) => rows.slice(0, 3),
  },
  {
    title: '위젯',
    note: '브라우저에서 그대로 돕니다.',
    pick: (rows: readonly FixturePkg[]) => rows.filter((p) => p.category === 'ui').slice(3),
  },
  {
    title: '데스크톱',
    note: 'Windows · macOS 네이티브에 붙습니다.',
    pick: (rows: readonly FixturePkg[]) => rows.filter((p) => p.category === 'desktop'),
  },
  {
    title: '도구',
    note: '터미널에서 돕니다.',
    pick: (rows: readonly FixturePkg[]) => rows.filter((p) => p.category === 'tool'),
  },
];

function Row({ pkg }: { pkg: FixturePkg }) {
  const playable = pkg.category === 'ui' && pkg.hasExample;
  return (
    <li>
      <a
        href="#"
        className="group border-rule duration-(--duration-quick) -mx-3 flex items-baseline gap-3 rounded-control border-b px-3 py-2.5 transition-colors last:border-b-0 hover:bg-chip"
      >
        <span className="text-small w-52 shrink-0 truncate font-mono font-semibold">
          {pkg.slug}
        </span>
        <span className="text-small text-muted min-w-0 flex-1 truncate">{pkg.description}</span>
        <span className="text-label text-muted hidden shrink-0 font-mono tabular-nums sm:inline">
          {pkg.version}
        </span>
        <span className="text-label w-14 shrink-0 text-right font-mono">
          {playable ? (
            <span className="text-muted group-hover:text-ink">실행 →</span>
          ) : (
            <span className="text-muted/50">pub.dev</span>
          )}
        </span>
      </a>
    </li>
  );
}

export default function VariantA() {
  return (
    <>
      <VariantChrome active="a" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-11 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-display font-bold text-balance">
              Flutter 패키지를 만듭니다.
              <br />
              <span className="text-muted">전부 눌러볼 수 있게 해뒀습니다.</span>
            </h1>
            <ThemeToggle className="mt-2 shrink-0" />
          </div>
          <p className="text-body text-muted max-w-(--container-measure) text-pretty">
            테이블, 드롭다운, 트리뷰처럼 매번 다시 짜게 되는 것들을 패키지로 떼어 두고 씁니다.
            스크린샷 대신 example 앱을 그대로 웹에 올려두었으니, 설명을 읽는 대신 눌러보고
            판단하세요. 문서와 API 는 pub.dev 에 있습니다.
          </p>
          <p className="text-small text-muted font-mono">
            <a
              href="https://github.com/kihyun1998"
              className="hover:text-ink underline-offset-4 hover:underline"
            >
              github.com/kihyun1998
            </a>
            <span className="text-muted/40 mx-2">·</span>
            <a
              href="https://pub.dev/publishers"
              className="hover:text-ink underline-offset-4 hover:underline"
            >
              pub.dev
            </a>
          </p>
        </header>

        {SECTIONS.map((s) => {
          const items = s.pick(FIXTURES);
          if (items.length === 0) return null;
          return (
            <section key={s.title} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-heading font-semibold">{s.title}</h2>
                <span className="text-label text-muted font-mono tabular-nums">{items.length}</span>
                <span className="text-small text-muted ml-auto hidden sm:inline">{s.note}</span>
              </div>
              <ul className="flex flex-col">
                {items.map((p) => (
                  <Row key={p.slug} pkg={p} />
                ))}
              </ul>
            </section>
          );
        })}

        <footer className="border-rule text-small text-muted border-t pt-6">
          © 2026 kihyun · 전부 MIT
        </footer>
      </main>
    </>
  );
}
