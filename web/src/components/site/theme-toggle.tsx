'use client';

/**
 * 테마 토글.
 *
 * 초기값은 시스템이다. 저장된 선택이 없으면 data-theme 이 찍히지 않고
 * prefers-color-scheme 가 결정한다. 한 번 누르면 그때부터는 명시적인
 * 라이트/다크 토글이다 — 시스템으로 되돌아가는 UI 는 없다.
 *
 * React 상태가 없다. 라벨은 CSS 가 고르고(globals.css 의 .theme-*-only),
 * 남는 것은 클릭 핸들러 하나뿐이다. 상태를 JS 로 들고 있으면 서버는 사용자의
 * 선택도 OS 설정도 모르므로 hydration 이 어긋나고 마운트 전 한 프레임이 빈다.
 */

const STORAGE_KEY = 'theme';

function currentIsDark() {
  const stamped = document.documentElement.dataset.theme;
  // 아직 아무것도 고르지 않았다면 지금 보이는 것은 OS 가 정한 것이다.
  if (stamped !== 'light' && stamped !== 'dark') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return stamped === 'dark';
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const next = currentIsDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 시크릿 모드나 저장이 막힌 브라우저에서는 이번 세션에만 적용된다.
      // 화면이 바뀌는 것이 더 중요하므로 조용히 넘어간다.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="테마 전환"
      className={`border-rule rounded-control text-label hover:bg-chip duration-(--duration-quick) inline-flex items-center gap-1.5 border px-2 py-1 font-mono uppercase transition-colors ${className}`}
    >
      {/* 두 라벨을 모두 렌더한다. 보이는 쪽은 CSS 가 고른다. */}
      <span className="theme-light-only items-center gap-1.5">
        <span aria-hidden>☀</span>
        <span>Light</span>
      </span>
      <span className="theme-dark-only items-center gap-1.5">
        <span aria-hidden>☾</span>
        <span>Dark</span>
      </span>
      <span className="sr-only">테마 전환</span>
    </button>
  );
}
