import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 서버 런타임 없이 out/ 에 순수 정적 파일만 생성한다.
  // API Routes / ISR / 미들웨어를 쓰면 빌드가 깨지므로 정적 전제가 강제된다.
  output: 'export',

  // 정적 export 에는 이미지 최적화 서버가 없으므로 next/image 를 원본 그대로 내보낸다.
  images: { unoptimized: true },

  // /docs -> /docs/index.html 매핑. 정적 호스팅에서 경로 해석이 안정적이다.
  trailingSlash: true,
};

export default nextConfig;
