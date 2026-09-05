import { ThemeToggle } from '@/components/site/theme-toggle';
import { FIXTURES, type FixturePkg } from '@/content/design-fixtures';
import { VariantChrome } from '../chrome';

/**
 * 시안 B — 릴리스 타임라인. 참고: simonw/releases.md
 *
 * 분류를 버리고 시간만 남긴다. 분류는 "무엇인지"를 말하지만 시간은
 * "살아 있는지"를 말한다. 방문자가 처음 던지는 질문은 대개 후자다.
 *
 * gen-packages.mjs 가 이미 pubspec 에서 버전을 읽으므로 날짜 한 줄을
 * 더 읽으면 이 화면은 공짜로 생성된다 — 손으로 관리할 목록이 늘지 않는다.
 */

const CATEGORY_MARK: Record<FixturePkg['category'], string> = {
  ui: '위젯',
  desktop: '데스크톱',
  tool: '도구',
};

export default function VariantB() {
  // 연도 구분선은 렌더 중에 변수를 굴리지 않고 미리 계산한다.
  // 렌더 도중의 변형은 다시 그릴 때 같은 결과를 보장하지 않는다.
  const rows = [...FIXTURES]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .map((pkg, i, all) => ({
      pkg,
      year: pkg.updated.slice(0, 4),
      showYear: i === 0 || pkg.updated.slice(0, 4) !== all[i - 1].updated.slice(0, 4),
    }));

  return (
    <>
      <VariantChrome active="b" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-display font-bold text-balance">
              최근에 만든 것부터.
            </h1>
            <ThemeToggle className="mt-2 shrink-0" />
          </div>
          <p className="text-body text-muted max-w-(--container-measure) text-pretty">
            Flutter 패키지 {FIXTURES.length}개를 만들고 고치고 있습니다. 위젯은 example 앱이
            브라우저에서 그대로 도니 눌러보고 판단하세요. 아래는 마지막으로 손댄 순서입니다.
          </p>
        </header>

        <ol className="flex flex-col">
          {rows.map(({ pkg, year, showYear }) => {
            const playable = pkg.category === 'ui' && pkg.hasExample;

            return (
              <li key={pkg.slug}>
                {showYear && (
                  <div className="border-rule text-label text-muted mt-6 border-t pt-2 font-mono tabular-nums first:mt-0">
                    {year}
                  </div>
                )}
                <a
                  href="#"
                  className="group duration-(--duration-quick) -mx-3 flex gap-4 rounded-control px-3 py-3 transition-colors hover:bg-chip"
                >
                  <time className="text-label text-muted w-12 shrink-0 pt-1 font-mono tabular-nums">
                    {pkg.updated.slice(5).replace('-', '.')}
                  </time>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-small font-mono font-semibold">{pkg.slug}</span>
                      <span className="text-label text-muted font-mono tabular-nums">
                        v{pkg.version}
                      </span>
                      {playable && (
                        <span className="text-label text-muted group-hover:text-ink ml-auto shrink-0 font-mono">
                          실행 →
                        </span>
                      )}
                    </div>
                    <p className="text-small text-muted text-pretty">{pkg.description}</p>
                    <span className="text-label text-muted/70 font-mono uppercase">
                      {CATEGORY_MARK[pkg.category]}
                      {!playable && ' · 웹 데모 없음'}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>

        <footer className="border-rule text-small text-muted flex justify-between border-t pt-6">
          <span>© 2026 kihyun · 전부 MIT</span>
          <a href="https://github.com/kihyun1998" className="hover:text-ink font-mono">
            GitHub ↗
          </a>
        </footer>
      </main>
    </>
  );
}
