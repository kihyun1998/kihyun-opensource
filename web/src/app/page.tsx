import Link from 'next/link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { CATEGORY_LABEL, PACKAGES, canDemo, pubUrl, type Pkg } from '@/content/packages';

/**
 * 런처.
 *
 * 이 페이지의 일은 하나다 — 어느 것을 열지 고르게 하는 것.
 * 순수 정적 HTML 이라 즉시 칠해지고 색인된다. Flutter 엔진은 0개다.
 * (CanvasKit 은 캔버스에 그리므로 Flutter 로 만든 화면은 검색엔진에 한 글자도
 * 남지 않는다. 유입은 전부 이 페이지가 감당한다.)
 *
 * 분류가 아니라 시간으로 세운다. 분류는 "이것이 무엇인가" 를 말하지만,
 * 방문자가 처음 던지는 질문은 "아직 살아 있는가" 다. 맨 위 항목의 날짜가
 * 그 답이고, 그 아래로 내려가는 날짜들이 활동의 밀도를 보여준다.
 *
 * **순서를 여기서 정하지 않는다.** PACKAGES 의 배열 순서가 곧 화면의 순서이고,
 * 그것은 생성기가 pub.dev 의 릴리스 날짜로 이미 굳혀 놓았다. 여기서 다시
 * 정렬하면 정본이 둘이 된다.
 */

/** 웹에서 돌 수 없는 이유. 빈 자리나 "준비 중" 을 보여주지 않는다 — 준비의 문제가 아니다. */
const CANNOT_RUN: Record<Pkg['category'], string> = {
  ui: 'example 없음',
  desktop: '네이티브 의존',
  tool: 'CLI 도구',
};

/**
 * 연도 구분선은 렌더 중에 변수를 굴리지 않고 미리 계산한다.
 * 렌더 도중의 변형은 다시 그릴 때 같은 결과를 보장하지 않는다.
 */
function withYearMarks(packages: readonly Pkg[]) {
  return packages.map((pkg, i) => {
    const year = pkg.published?.slice(0, 4) ?? null;
    const prev = i === 0 ? undefined : (packages[i - 1].published?.slice(0, 4) ?? null);
    return { pkg, year, showYear: i === 0 || year !== prev };
  });
}

function Entry({ pkg, playable }: { pkg: Pkg; playable: boolean }) {
  const body = (
    <>
      <time className="text-label text-muted w-12 shrink-0 pt-1 font-mono tabular-nums">
        {pkg.published ? pkg.published.slice(5).replace('-', '.') : '––'}
      </time>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2.5">
          <span className="text-small font-mono font-semibold">{pkg.slug}</span>
          <span className="text-label text-muted font-mono tabular-nums">v{pkg.version}</span>
          <span className="text-label text-muted group-hover:text-ink ml-auto shrink-0 font-mono">
            {playable ? '실행 →' : 'pub.dev ↗'}
          </span>
        </div>
        <p className="text-small text-muted text-pretty">{pkg.description}</p>
        <span className="text-label text-muted/70 font-mono uppercase">
          {CATEGORY_LABEL[pkg.category]}
          {!playable && ` · ${CANNOT_RUN[pkg.category]}`}
        </span>
      </div>
    </>
  );

  const cls =
    'group duration-(--duration-quick) hover:bg-chip -mx-3 flex gap-4 rounded-control px-3 py-3 transition-colors';

  // 못 도는 패키지는 체험 화면으로 보내지 않고 pub.dev 로 바로 보낸다.
  return playable ? (
    <Link href={`/play/${pkg.slug}`} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={pubUrl(pkg)} className={cls}>
      {body}
    </a>
  );
}

export default function Home() {
  const rows = withYearMarks(PACKAGES);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-display font-bold text-balance">Flutter 패키지를 만듭니다.</h1>
          <ThemeToggle className="mt-2 shrink-0" />
        </div>
        <p className="text-body text-muted max-w-(--container-measure) text-pretty">
          위젯은 example 앱을 브라우저에 그대로 올려뒀습니다. 스크린샷으로는 스크롤이 부드러운지
          키보드가 먹는지 알 수 없으니 직접 눌러보세요. 문서와 API 는 pub.dev 에 있습니다 — 여기서
          복제하지 않습니다.
        </p>
        <p className="text-small text-muted font-mono">최근에 릴리스한 순서입니다.</p>
      </header>

      <ol className="flex flex-col">
        {rows.map(({ pkg, year, showYear }) => (
          <li key={pkg.slug}>
            {showYear && (
              <div className="border-rule text-label text-muted mt-6 border-t pt-2 font-mono tabular-nums first:mt-0">
                {year ?? '미배포'}
              </div>
            )}
            <Entry pkg={pkg} playable={canDemo(pkg) && pkg.demoReady} />
          </li>
        ))}
      </ol>

      <footer className="border-rule text-small text-muted flex items-center justify-between border-t pt-6">
        <span>© 2026 kihyun · 전부 MIT</span>
        <span className="flex gap-4 font-mono">
          <a href="https://pub.dev/publishers/kihyun1998.com/packages" className="hover:text-ink">
            pub.dev ↗
          </a>
          <a href="https://github.com/kihyun1998" className="hover:text-ink">
            GitHub ↗
          </a>
        </span>
      </footer>
    </main>
  );
}
