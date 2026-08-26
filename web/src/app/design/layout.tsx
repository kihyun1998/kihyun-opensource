import type { Metadata } from 'next';

/**
 * /design 은 읽는 사람의 페이지가 아니라 만드는 사람의 계기(instrument)다.
 *
 * **프로덕션 빌드에는 아예 들어가지 않는다.** 방법은 [[...slug]]/page.tsx 의
 * generateStaticParams 에 있다 — robots: noindex 도 notFound() 도 파일이
 * 생기는 것 자체를 막지는 못했다.
 *
 * next dev 에서는 그대로 열린다.
 */
export const metadata: Metadata = {
  title: '디자인 명세',
  robots: { index: false, follow: false },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-page text-ink min-h-full">{children}</div>;
}
