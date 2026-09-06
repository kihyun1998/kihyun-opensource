'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_LABEL, canDemo, type Category, type Pkg } from '@/content/packages';
import { ThemeToggle } from './theme-toggle';

/**
 * 좌측 레일 — 29개를 다루는 네비게이션.
 *
 * 10개가 넘어가면 평평한 목록은 목록이 아니라 벽이 된다. 그래서 세 가지가 있다:
 * 검색, 범주별 묶음, 그리고 "이건 웹에서 못 돈다"는 표시.
 *
 * 마지막 것이 특히 중요하다. 데스크톱 플러그인과 CLI 도구는 원리적으로
 * 브라우저에서 돌 수 없다 — 그걸 "준비 중"처럼 보이게 하면 거짓말이 되고,
 * 목록에서 빼면 패키지의 3분의 1이 사라진다.
 */

const ORDER: readonly Category[] = ['ui', 'desktop', 'tool'];

export function PackageRail({
  packages,
  activeSlug,
}: {
  packages: readonly Pkg[];
  activeSlug?: string;
}) {
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hit = (p: Pkg) =>
      !needle ||
      p.slug.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle);

    return ORDER.map((c) => ({
      category: c,
      items: packages.filter((p) => p.category === c && hit(p)),
    })).filter((g) => g.items.length > 0);
  }, [packages, q]);

  const shown = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 px-3 pt-3">
        <Link href="/" className="text-label text-muted hover:text-ink font-mono uppercase">
          ← All packages
        </Link>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search packages"
          className="border-rule bg-panel rounded-control text-small placeholder:text-muted focus:border-ink w-full border px-2.5 py-1.5 outline-none"
        />

        <span className="text-label text-muted font-mono tabular-nums">
          {shown} / {packages.length}
        </span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3">
        {groups.map((g) => (
          <div key={g.category} className="flex flex-col gap-0.5">
            <span className="text-label text-muted px-2 py-1 font-mono uppercase">
              {CATEGORY_LABEL[g.category]}
              <span className="ml-1.5 tabular-nums opacity-60">{g.items.length}</span>
            </span>

            {g.items.map((p) => {
              const active = p.slug === activeSlug;
              const playable = canDemo(p);
              return (
                <Link
                  key={p.slug}
                  href={`/play/${p.slug}`}
                  className={`rounded-control duration-(--duration-quick) flex flex-col gap-0.5 px-2 py-1.5 transition-colors ${
                    active ? 'bg-chip' : 'hover:bg-chip'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {/* 데모 가능 여부를 이름 옆에서 바로 말한다. 눌러보고 알게 하면 늦다. */}
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        playable ? 'bg-emerald-500' : 'bg-rule'
                      }`}
                      title={playable ? 'Playable in the browser' : 'Cannot run in a browser'}
                    />
                    <span
                      className={`text-small truncate font-mono ${active ? 'font-semibold' : ''}`}
                    >
                      {p.slug}
                    </span>
                  </span>
                  <span className="text-label text-muted pl-3 font-mono tabular-nums">
                    v{p.version}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {groups.length === 0 && (
          <p className="text-small text-muted px-2 py-4">No packages match &lsquo;{q}&rsquo;.</p>
        )}
      </nav>

      {/* 설정 자리. 언어 전환도 곧 여기 들어온다. */}
      <div className="border-rule flex shrink-0 items-center border-t px-3 py-2.5">
        <ThemeToggle />
      </div>
    </div>
  );
}
