import type { Metadata } from 'next';

/**
 * /design 은 읽는 사람의 페이지가 아니라 만드는 사람의 계기(instrument)다.
 * 색인되면 안 되고, 사이트 본체의 헤더/푸터도 걸치지 않는다.
 */
export const metadata: Metadata = {
  title: '디자인 프로토타입',
  robots: { index: false, follow: false },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-page text-ink min-h-full">{children}</div>;
}
