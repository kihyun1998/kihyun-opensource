'use client';

import { useRef, useState } from 'react';
import { FlutterStage } from '@/components/site/flutter-stage';
import { apiUrl, canDemo, pubUrl, type Pkg } from '@/content/packages';

/**
 * example 이 사는 곳.
 *
 * 사이트는 example 내부를 모른다. 무엇을 보여줄지, 메뉴가 몇 개인지,
 * 어떤 화면으로 전환되는지는 전부 패키지 저자의 몫이다.
 * 여기가 아는 것은 slug 하나뿐이고, 그것으로 iframe 을 건다.
 *
 * prop 을 하나 더 넣고 싶어지는 순간이 곧 선을 넘는 순간이다.
 */

function LiveDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

/** 웹에서 돌 수 없는 패키지의 자리. 빈 화면 대신 이유를 말한다. */
function NotPlayable({ pkg }: { pkg: Pkg }) {
  const reason =
    pkg.category === 'desktop'
      ? 'Binds directly to Windows and macOS native APIs. It cannot run in a browser.'
      : pkg.category === 'tool'
        ? 'A command-line tool. There is no screen to put in a browser.'
        : 'No example app yet.';

  return (
    <div className="bg-chip flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-label text-muted font-mono uppercase">Not playable</span>
      <p className="text-body max-w-md">{reason}</p>
      <p className="text-small text-muted max-w-md">
        Not a matter of readiness — this package is useful outside the browser.
      </p>
      <div className="text-small mt-2 flex flex-wrap justify-center gap-4 font-mono">
        <a href={pubUrl(pkg)} className="hover:text-ink underline-offset-4 hover:underline">
          pub.dev ↗
        </a>
        <a href={pkg.repoUrl} className="hover:text-ink underline-offset-4 hover:underline">
          GitHub ↗
        </a>
        <a href={apiUrl(pkg)} className="hover:text-ink underline-offset-4 hover:underline">
          API reference ↗
        </a>
      </div>
    </div>
  );
}

export function ExampleStage({ pkg }: { pkg: Pkg }) {
  const [running, setRunning] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const playable = canDemo(pkg);
  const demoUrl = `/demo/${pkg.slug}/index.html`;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen();
  };

  return (
    <div ref={box} className="bg-page flex h-full flex-col">
      {/* 계기판. 지금 무엇이 돌고 있는지 계속 말한다. */}
      <div className="border-rule text-label flex h-9 shrink-0 items-center gap-3 border-b px-3 font-mono">
        {running ? <LiveDot /> : <span className="bg-muted size-1.5 rounded-full" />}
        <span className="text-muted">
          {!playable
            ? 'Not playable'
            : running
              ? 'Running by Flutter · WebAssembly'
              : 'Flutter · idle'}
        </span>

        <span className="text-muted ml-auto flex gap-3">
          <button
            onClick={toggleFullscreen}
            disabled={!running}
            className={running ? 'hover:text-ink' : 'cursor-not-allowed opacity-40'}
          >
            ⛶ <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <a
            href={pkg.demoReady ? demoUrl : undefined}
            target="_blank"
            rel="noreferrer"
            className={
              running && pkg.demoReady ? 'hover:text-ink' : 'cursor-not-allowed opacity-40'
            }
          >
            ↗ <span className="hidden sm:inline">New tab</span>
          </a>
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {!playable ? (
          <NotPlayable pkg={pkg} />
        ) : !running ? (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="demo-surface group flex h-full w-full flex-col items-center justify-center gap-2.5 text-white"
          >
            <span className="duration-(--duration-quick) flex size-14 items-center justify-center rounded-full border border-white/45 transition-transform group-hover:scale-110">
              ▶
            </span>
            <span className="text-small font-medium">Run the demo</span>
            <span className="text-label font-mono opacity-60">~1.3 MB engine download</span>
          </button>
        ) : pkg.demoReady ? (
          <iframe
            src={demoUrl}
            title={`${pkg.slug} live demo`}
            className="block h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
            allow="clipboard-write; fullscreen"
          />
        ) : (
          <div className="relative h-full">
            <FlutterStage className="h-full w-full" />
            <span className="text-label absolute right-3 bottom-3 rounded bg-black/70 px-2 py-1 font-mono text-white/80">
              mockup · public/demo/{pkg.slug}/ is empty
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
