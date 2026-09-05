import Link from 'next/link';

/**
 * 세 시안을 오갈 때 쓰는 얇은 띠. 시안 자체의 일부가 아니므로
 * 판단을 흐리지 않도록 최대한 가늘게 둔다.
 */

export const VARIANTS = [
  { id: 'a', name: '리스트', ref: 'antfu.me/projects' },
  { id: 'b', name: '릴리스 타임라인', ref: 'simonw/releases.md' },
  { id: 'c', name: '내러티브', ref: 'jvns.ca/projects' },
] as const;

export function VariantChrome({ active }: { active: 'a' | 'b' | 'c' }) {
  return (
    <div className="border-rule bg-chip sticky top-0 z-10 border-b">
      <div className="text-label mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-2 font-mono">
        <Link href="/design/home" className="text-muted hover:text-ink shrink-0">
          ← 시안
        </Link>
        <span className="text-muted/50 mx-2">|</span>
        {VARIANTS.map((v) => (
          <Link
            key={v.id}
            href={`/design/home/${v.id}`}
            className={`rounded-mark px-2 py-1 ${
              v.id === active ? 'bg-ink text-page font-medium' : 'text-muted hover:text-ink'
            }`}
          >
            {v.id.toUpperCase()} {v.name}
          </Link>
        ))}
        <span className="text-muted ml-auto hidden sm:inline">
          {VARIANTS.find((v) => v.id === active)!.ref}
        </span>
      </div>
    </div>
  );
}
