'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageRail } from './package-rail';
import { canDemo, type Pkg } from '@/content/packages';

/**
 * 레일을 화면 폭에 맞게 내놓는다.
 *
 * 데스크톱: 왼쪽에 고정된 레일.
 * 모바일: 상단 바 + 서랍. 레일을 그냥 숨기면 목록도 검색도 나가는 링크도
 * 같이 사라져서, 페이지가 막다른 골목이 된다 (컨테이너가 fixed inset-0 이라
 * 스크롤로 빠져나갈 수도 없다).
 *
 * 부모가 `flex-col md:flex-row` 이므로, 모바일 바는 위에 쌓이고
 * 데스크톱 레일은 왼쪽에 선다 — 같은 조각이 폭에 따라 자리를 바꾼다.
 */
export function RailShell({
  packages,
  activeSlug,
}: {
  packages: readonly Pkg[];
  activeSlug: string;
}) {
  const [open, setOpen] = useState(false);

  // 이동하며 닫는 일은 서랍 래퍼의 onClick 이 맡는다 — 링크 클릭이 거기까지
  // 버블링한다. effect 로 activeSlug 를 좇으면 같은 일을 한 프레임 늦게 할 뿐이다.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const playable = packages.filter(canDemo).length;

  return (
    <>
      {/* ------------------------------------------------------ 모바일 바 */}
      <div className="border-rule text-label flex shrink-0 items-center gap-3 border-b px-4 py-2.5 font-mono md:hidden">
        <Link href="/" className="text-muted hover:text-ink">
          ← 목록
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-rule rounded-control hover:bg-chip ml-auto border px-2.5 py-1"
          aria-expanded={open}
        >
          패키지 <span className="text-muted tabular-nums">{packages.length}</span> ▾
        </button>
      </div>

      {/* ---------------------------------------------------- 데스크톱 레일 */}
      <aside className="border-rule hidden w-56 shrink-0 border-r md:block">
        <PackageRail packages={packages} activeSlug={activeSlug} />
      </aside>

      {/* ------------------------------------------------------ 모바일 서랍 */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          {/* 링크를 누르면 이동과 함께 닫힌다 — 이벤트가 여기까지 올라온다. */}
          <div
            onClick={() => setOpen(false)}
            className="bg-page border-rule relative flex w-72 max-w-[85vw] flex-col border-r shadow-2xl"
          >
            <div className="border-rule text-label flex shrink-0 items-center justify-between border-b px-3 py-2.5 font-mono">
              <span className="text-muted">
                <span className="tabular-nums">{playable}</span> / {packages.length} 데모 있음
              </span>
              <button type="button" onClick={() => setOpen(false)} className="hover:text-ink">
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <PackageRail packages={packages} activeSlug={activeSlug} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
