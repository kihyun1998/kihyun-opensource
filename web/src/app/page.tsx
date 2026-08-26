import Link from 'next/link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import {
  CATEGORY_LABEL,
  PACKAGES,
  apiUrl,
  canDemo,
  pubUrl,
  type Category,
  type Pkg,
} from '@/content/packages';

/**
 * 런처.
 *
 * 이 페이지의 일은 하나다 — 29개 중 어느 것을 열지 고르게 하는 것.
 * 순수 정적 HTML 이라 즉시 칠해지고 색인된다. Flutter 엔진은 0개다.
 * (CanvasKit 은 캔버스에 그리므로 Flutter 로 만든 화면은 검색엔진에 한 글자도
 * 남지 않는다. 유입은 전부 이 페이지가 감당한다.)
 */

const ORDER: readonly Category[] = ['ui', 'desktop', 'tool'];

const CATEGORY_NOTE: Record<Category, string> = {
  ui: '브라우저에서 그대로 돕니다. 눌러서 만져 보세요.',
  desktop: 'Windows · macOS 네이티브에 붙습니다. 웹에서는 실행할 수 없습니다.',
  tool: '터미널에서 도는 CLI 도구입니다.',
};

function Card({ pkg }: { pkg: Pkg }) {
  const playable = canDemo(pkg);

  const body = (
    <>
      <div className="flex items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${playable ? 'bg-emerald-500' : 'bg-rule'}`}
        />
        <span className="text-small truncate font-mono font-semibold">{pkg.slug}</span>
        <span className="text-label text-muted ml-auto shrink-0 font-mono tabular-nums">
          {pkg.version}
        </span>
      </div>
      <p className="text-small text-muted line-clamp-3 flex-1">{pkg.description}</p>
      <div className="border-rule text-label flex items-center gap-3 border-t pt-2.5 font-mono">
        {playable ? (
          <span className="font-medium">▶ 실행</span>
        ) : (
          <span className="text-muted">웹 데모 없음</span>
        )}
        <span className="text-muted ml-auto">{playable ? '' : 'pub.dev ↗'}</span>
      </div>
    </>
  );

  const cls =
    'rounded-panel border-rule bg-panel duration-(--duration-quick) flex h-full flex-col gap-2.5 border p-4 transition-colors';

  // 못 도는 패키지는 체험 화면으로 보내지 않고 pub.dev 로 바로 보낸다.
  return playable ? (
    <Link href={`/play/${pkg.slug}`} className={`${cls} hover:border-ink/30`}>
      {body}
    </Link>
  ) : (
    <a href={pubUrl(pkg)} className={`${cls} hover:border-ink/20 opacity-75 hover:opacity-100`}>
      {body}
    </a>
  );
}

export default function Home() {
  const groups = ORDER.map((c) => ({
    category: c,
    items: PACKAGES.filter((p) => p.category === c),
  })).filter((g) => g.items.length > 0);

  const playable = PACKAGES.filter(canDemo).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-14">
      <header className="flex flex-col gap-3">
        <span className="text-label text-muted font-mono uppercase">kihyun · open source</span>
        <h1 className="text-display font-bold text-balance">만져보고 고르는 Flutter 패키지</h1>
        <p className="text-muted text-body max-w-(--container-measure) text-pretty">
          스크린샷 대신 브라우저에서 그대로 도는 example 을 둡니다. 읽고 짐작하는 대신 눌러보고
          정하세요. 문서와 API 는 pub.dev 에 있습니다 — 여기서 복제하지 않습니다.
        </p>
        <dl className="text-small mt-1 flex gap-6 font-mono">
          <span className="flex gap-2">
            <dt className="text-muted">패키지</dt>
            <dd className="tabular-nums">{PACKAGES.length}</dd>
          </span>
          <span className="flex gap-2">
            <dt className="text-muted">웹 데모</dt>
            <dd className="tabular-nums">{playable}</dd>
          </span>
          <span className="flex gap-2">
            <dt className="text-muted">라이선스</dt>
            <dd>MIT</dd>
          </span>
          <ThemeToggle className="ml-auto" />
        </dl>
      </header>

      {groups.map((g) => (
        <section key={g.category} className="flex flex-col gap-4">
          <div className="border-rule flex flex-col gap-1 border-t pt-5">
            <h2 className="text-title flex items-baseline gap-2.5 font-semibold">
              {CATEGORY_LABEL[g.category]}
              <span className="text-label text-muted font-mono tabular-nums">{g.items.length}</span>
            </h2>
            <p className="text-small text-muted">{CATEGORY_NOTE[g.category]}</p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((p) => (
              <li key={p.slug}>
                <Card pkg={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="border-rule text-small text-muted flex items-center justify-between border-t pt-6">
        <span>© 2026 kihyun</span>
        <span className="flex gap-4 font-mono">
          <a href="https://pub.dev/publishers" className="hover:text-ink">
            pub.dev ↗
          </a>
          <a href="https://github.com/kihyun1998" className="hover:text-ink">
            GitHub ↗
          </a>
          <a href={apiUrl(PACKAGES[0])} className="hover:text-ink hidden sm:inline">
            dartdoc ↗
          </a>
        </span>
      </footer>
    </main>
  );
}
