import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExampleStage } from '@/components/site/example-stage';
import { RailShell } from '@/components/site/rail-shell';
import { PACKAGES, apiUrl, getPackage, pubUrl } from '@/content/packages';

/**
 * 체험 화면 — 레일 + example.
 *
 * 페이지 스크롤은 없다. 뷰포트를 나눠 쓰고, 남는 픽셀은 전부 example 이 가진다.
 * 문서는 여기 없다. pub.dev 와 패키지 레포에 있고 사이트는 링크만 건다.
 */

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/play/[slug]'>): Promise<Metadata> {
  const pkg = getPackage((await params).slug);
  if (!pkg) return {};
  return { title: `${pkg.slug} · 라이브 데모`, description: pkg.description };
}

export default async function PlayPage({ params }: PageProps<'/play/[slug]'>) {
  const pkg = getPackage((await params).slug);
  if (!pkg) notFound();

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      <RailShell packages={PACKAGES} activeSlug={pkg.slug} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-rule flex shrink-0 flex-col gap-1 border-b px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-heading font-mono font-semibold">{pkg.slug}</h1>
            <span className="text-label text-muted font-mono tabular-nums">v{pkg.version}</span>
            <span className="text-label text-muted ml-auto flex gap-3.5 font-mono">
              <a href={pubUrl(pkg)} className="hover:text-ink">
                pub.dev ↗
              </a>
              <a href={pkg.repoUrl} className="hover:text-ink">
                GitHub ↗
              </a>
              <a href={apiUrl(pkg)} className="hover:text-ink hidden sm:inline">
                API ↗
              </a>
            </span>
          </div>
          <p className="text-small text-muted max-w-(--container-measure)">{pkg.description}</p>
          <code className="text-label text-muted mt-1 font-mono">
            <span className="select-none">$ </span>flutter pub add {pkg.slug}
          </code>
        </header>

        <div className="min-h-0 flex-1">
          <ExampleStage pkg={pkg} />
        </div>
      </main>
    </div>
  );
}
