import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

// 본문 폰트는 자체 호스팅하는 Wanted Sans 다 — src/app/wanted-sans.css 가
// 유니코드 범위별로 쪼갠 @font-face 92개를 들고 있어서, 브라우저는 페이지에
// 실제로 쓰인 글자의 조각만 내려받는다. next/font 로는 그 분할을 쓸 수 없다.
//
// 코드·수치용 모노만 next/font 로 받는다.
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'kihyun · open source',
  description: 'Flutter 패키지 소개와 라이브 데모.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
