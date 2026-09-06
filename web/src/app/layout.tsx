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
  description: 'Open source packages by kihyun1998, with live demos you can try in the browser.',
};

/**
 * 저장된 테마를 첫 페인트 전에 찍는다.
 *
 * 정적 HTML 은 data-theme 없이 서빙된다. React 가 마운트해 localStorage 를
 * 읽을 때까지 기다리면, OS 가 라이트인데 다크를 고른 사용자에게 흰 화면이
 * 한 번 번쩍인다. 동기 스크립트라 파서를 잠깐 막는데, 그게 목적이다.
 *
 * 저장된 값이 없으면 아무것도 찍지 않는다 — 그러면 CSS 의
 * prefers-color-scheme 가 결정한다. 초기값이 시스템인 것은 이 침묵 덕분이다.
 */
const STAMP_THEME = `try{var t=localStorage.theme;if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // 위 스크립트가 <html> 의 속성을 바꾸므로 서버 마크업과 어긋난다. 의도된 것이다.
    <html lang="en" className={`${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STAMP_THEME }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
