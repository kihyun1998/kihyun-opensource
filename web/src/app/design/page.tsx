import Link from 'next/link';
import { PACKAGES, canDemo } from '@/content/packages';
import { ThemeToggle } from '@/components/site/theme-toggle';

/**
 * 디자인 명세.
 *
 * 결정된 것만 있다. 후보나 탈락안은 두지 않는다 — 이 페이지는 화면을 만들
 * 때 펼쳐 놓고 보는 참조지, 기록 보관소가 아니다.
 *
 * 여기 그려진 컴포넌트는 실제 구현과 같은 토큰·같은 클래스를 쓴다.
 * 값을 여기 따로 적어 두면 구현이 바뀔 때 이 페이지가 먼저 거짓말을 한다.
 */

const pkg = PACKAGES[0];

/* ------------------------------------------------------------------ 뼈대 */

const SECTIONS = [
  { id: 'rules', label: '규칙' },
  { id: 'color', label: '색' },
  { id: 'type', label: '타입' },
  { id: 'motion', label: '모션' },
  { id: 'parts', label: '컴포넌트' },
  { id: 'layout', label: '레이아웃' },
] as const;

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-rule flex scroll-mt-6 flex-col gap-5 border-t pt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-title font-semibold">{title}</h2>
        {note && <p className="text-small text-muted max-w-(--container-measure)">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** 컴포넌트 표본 하나. 이름·용도·실물을 함께 둔다. */
function Specimen({
  name,
  use,
  children,
  wide = false,
}: {
  name: string;
  use: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-small font-mono font-medium">{name}</span>
        <span className="text-label text-muted">{use}</span>
      </div>
      <div className="border-rule rounded-panel overflow-hidden border">{children}</div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

/* 계기판 바 — ExampleStage 상단과 같은 마크업. */
function Instrument({ state }: { state: '대기' | '실행중' | '불가' }) {
  const running = state === '실행중';
  const dead = state === '불가';
  return (
    <div className="border-rule text-label flex h-9 items-center gap-3 border-b px-3 font-mono">
      {running ? <LiveDot /> : <span className="bg-muted size-1.5 rounded-full" />}
      <span className="text-muted">
        {dead ? '실행 불가' : running ? 'Running by Flutter · WebAssembly' : 'Flutter · 대기 중'}
      </span>
      <span className="text-muted ml-auto flex gap-3">
        <span className={running ? '' : 'opacity-40'}>⛶ 전체화면</span>
        <span className={running ? '' : 'opacity-40'}>↗ 새 탭</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ 토큰 */

// Tailwind 는 클래스명을 소스에서 문자열로 찾는다. `bg-${name}` 처럼 조립하면
// 빌드 시 그런 클래스가 존재하지 않는다 — 그래서 전부 적어 둔다.
const NEUTRALS = [
  { name: 'page', swatch: 'bg-page', use: '페이지 바탕' },
  { name: 'panel', swatch: 'bg-panel', use: '카드·입력·코드 블록' },
  { name: 'ink', swatch: 'bg-ink', use: '본문 글자' },
  { name: 'muted', swatch: 'bg-muted', use: '보조 글자·비활성' },
  { name: 'rule', swatch: 'bg-rule', use: '괘선·테두리' },
  { name: 'chip', swatch: 'bg-chip', use: '옅은 강조 바탕·hover' },
] as const;

const TYPE_SCALE = [
  { step: 'display', cls: 'text-display font-bold', use: '페이지 제목' },
  { step: 'title', cls: 'text-title font-semibold', use: '섹션 제목' },
  { step: 'heading', cls: 'text-heading font-semibold', use: '카드·패키지 이름' },
  { step: 'body', cls: 'text-body', use: '본문' },
  { step: 'small', cls: 'text-small', use: '설명·메타' },
  { step: 'label', cls: 'text-label font-mono', use: '모노 라벨·계기판' },
] as const;

const MOTION = [
  { token: '--duration-quick', ms: 180, use: 'hover · focus 상태 전이' },
  { token: '--duration-settle', ms: 340, use: '서랍 열림·패널 이동' },
  { token: '--duration-travel', ms: 500, use: '길이가 새 값으로 이동' },
] as const;

const RULES = [
  {
    rule: '사이트는 example 내부를 모른다',
    why: 'example 이 무엇을 보여줄지, 메뉴가 몇 개인지는 패키지 저자의 몫이다. 사이트는 slug 로 iframe 을 걸고 크롬만 얹는다. prop 을 하나 더 넣고 싶어지는 순간이 선을 넘는 순간이다.',
  },
  {
    rule: '문서를 복제하지 않는다',
    why: 'README·API·가이드는 pub.dev 와 패키지 레포에 있다. 여기 옮겨 적으면 두 벌 관리가 되고, 코드에서 생성된 dartdoc 쪽이 항상 최신이다.',
  },
  {
    rule: '못 도는 패키지는 이유를 말한다',
    why: '데스크톱 플러그인과 CLI 는 브라우저에서 원리적으로 실행할 수 없다. "준비 중" 으로 표시하면 거짓말이고, 목록에서 빼면 패키지의 3분의 1이 사라진다.',
  },
  {
    rule: '데모는 클릭 후에 마운트한다',
    why: 'Flutter 웹은 엔진(MB 단위)을 받아야 첫 프레임이 나온다. 그 비용을 초기 로딩에 태우면 LCP 를 잃는다.',
  },
  {
    rule: '테마의 초기값은 시스템이다',
    why: '저장된 선택이 없으면 data-theme 을 찍지 않아 prefers-color-scheme 가 결정한다. 한 번 누르면 그때부터는 명시적인 라이트/다크 토글이고, 시스템으로 되돌아가는 UI 는 없다. 토글 라벨도 CSS 가 고르므로 React 상태가 없다 — 상태를 JS 로 들면 서버가 사용자의 선택을 모르니 hydration 이 어긋난다.',
  },
  {
    rule: '런처는 순수 HTML 이다',
    why: 'Flutter 웹 엔진은 캔버스에 그려서 검색엔진에 한 글자도 남기지 않는다. 유입은 전부 목록 페이지가 감당하므로, 여기에 Flutter 엔진을 띄우지 않는다.',
  },
] as const;

/* ------------------------------------------------------------------ 페이지 */

export default function DesignSpec() {
  const playable = canDemo(pkg);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <span className="text-label text-muted font-mono uppercase">design spec</span>
        <h1 className="text-display font-bold">디자인 명세</h1>
        <p className="text-muted text-body max-w-(--container-measure)">
          결정된 것만 있습니다. 화면을 만들 때 펼쳐 놓고 보는 참조입니다. 여기 그려진 컴포넌트는
          실제 구현과 <b className="text-ink">같은 토큰·같은 클래스</b>를 씁니다 — 값을 따로 적어
          두면 구현이 바뀔 때 이 페이지가 먼저 거짓말을 합니다.
        </p>
        <nav className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="border-rule rounded-control text-small hover:bg-chip duration-(--duration-quick) border px-2.5 py-1 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ----------------------------------------------------------- 규칙 */}
      <Section id="rules" title="규칙" note="화면을 고칠 때 먼저 확인할 것.">
        <ol className="flex flex-col gap-4">
          {RULES.map((r, i) => (
            <li key={r.rule} className="flex gap-3">
              <span className="bg-chip text-label text-muted flex size-5 shrink-0 items-center justify-center rounded-full font-mono tabular-nums">
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-body font-medium">{r.rule}</span>
                <span className="text-small text-muted max-w-(--container-measure)">{r.why}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------------------- 색 */}
      <Section
        id="color"
        title="색"
        note="중립 6색뿐입니다. 강조색이 없는 것은 의도입니다 — 화면에서 채도를 가진 유일한 영역이 데모여야, 시선이 자동으로 거기로 갑니다. 토큰은 light-dark() 로 한 번만 선언되고 color-scheme 이 라이트/다크를 가릅니다."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NEUTRALS.map((c) => (
            <div
              key={c.name}
              className="border-rule rounded-panel flex flex-col overflow-hidden border"
            >
              <div className={`h-14 ${c.swatch} border-rule border-b`} />
              <div className="flex flex-col gap-0.5 p-2.5">
                <code className="text-small font-mono font-medium">--{c.name}</code>
                <span className="text-label text-muted">{c.use}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- 타입 */}
      <Section
        id="type"
        title="타입"
        note="Wanted Sans (가변 축 400–1000) + Geist Mono. 한글은 같은 크기에서 라틴보다 넉넉한 행간이 필요해 본문 단계는 1.75 에 둡니다."
      >
        <div className="border-rule flex flex-col border-t">
          {TYPE_SCALE.map((t) => (
            <div
              key={t.step}
              className="border-rule flex flex-col gap-1 border-b py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <code className="text-label text-muted w-20 shrink-0 font-mono">{t.step}</code>
              <span className={`${t.cls} min-w-0 flex-1 truncate`}>
                만져보고 고르는 Flutter 패키지
              </span>
              <span className="text-label text-muted shrink-0">{t.use}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- 모션 */}
      <Section
        id="motion"
        title="모션"
        note="세 단계뿐입니다. 값을 직접 쓰지 말고 토큰을 참조하세요 — 아래 칸에 마우스를 올리면 각 시간이 어떻게 느껴지는지 알 수 있습니다."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {MOTION.map((m) => (
            <div
              key={m.token}
              className="border-rule rounded-panel hover:bg-chip flex flex-col gap-1 border p-3.5 transition-colors"
              style={{ transitionDuration: `${m.ms}ms` }}
            >
              <code className="text-small font-mono font-medium">{m.token}</code>
              <span className="text-label text-muted font-mono tabular-nums">{m.ms}ms</span>
              <span className="text-label text-muted">{m.use}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- 컴포넌트 */}
      <Section
        id="parts"
        title="컴포넌트"
        note="상태별로 펼쳐 둡니다. 구현에서 빠뜨리기 쉬운 것은 늘 '비어 있을 때'와 '못 할 때'입니다."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Specimen name="계기판 · 대기" use="ExampleStage 상단">
            <Instrument state="대기" />
          </Specimen>
          <Specimen name="계기판 · 실행중" use="점이 깜빡이고 버튼이 산다">
            <Instrument state="실행중" />
          </Specimen>
          <Specimen name="계기판 · 불가" use="desktop · tool 범주" wide>
            <Instrument state="불가" />
          </Specimen>

          <Specimen name="실행 버튼" use="클릭 전 데모 자리" wide>
            <div className="demo-surface flex flex-col items-center justify-center gap-2.5 py-12 text-white">
              <span className="flex size-14 items-center justify-center rounded-full border border-white/45">
                ▶
              </span>
              <span className="text-small font-medium">데모 실행</span>
              <span className="text-label font-mono opacity-60">~1.3 MB · 엔진 내려받기</span>
            </div>
          </Specimen>

          <Specimen name="패키지 카드 · 데모 있음" use="런처">
            <div className="bg-panel flex flex-col gap-2.5 p-4">
              <div className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-small truncate font-mono font-semibold">{pkg.slug}</span>
                <span className="text-label text-muted ml-auto font-mono tabular-nums">
                  {pkg.version}
                </span>
              </div>
              <p className="text-small text-muted line-clamp-2">{pkg.description}</p>
              <div className="border-rule text-label flex items-center border-t pt-2.5 font-mono">
                <span className="font-medium">▶ 실행</span>
              </div>
            </div>
          </Specimen>

          <Specimen name="패키지 카드 · 데모 없음" use="pub.dev 로 직행">
            <div className="bg-panel flex flex-col gap-2.5 p-4 opacity-75">
              <div className="flex items-center gap-2">
                <span className="bg-rule size-1.5 shrink-0 rounded-full" />
                <span className="text-small truncate font-mono font-semibold">flutter_alone</span>
                <span className="text-label text-muted ml-auto font-mono tabular-nums">4.1.0</span>
              </div>
              <p className="text-small text-muted line-clamp-2">
                데스크톱 앱의 단일 인스턴스를 보장하는 플러그인.
              </p>
              <div className="border-rule text-label flex items-center border-t pt-2.5 font-mono">
                <span className="text-muted">웹 데모 없음</span>
                <span className="text-muted ml-auto">pub.dev ↗</span>
              </div>
            </div>
          </Specimen>

          <Specimen name="레일 항목" use="PackageRail · 활성/비활성/불가" wide>
            <div className="flex flex-col gap-0.5 p-2">
              {[
                { slug: pkg.slug, v: pkg.version, on: true, demo: playable },
                { slug: 'just_tooltip', v: '0.4.4', on: false, demo: true },
                { slug: 'flutter_dev_graph', v: '0.1.0', on: false, demo: false },
              ].map((r) => (
                <div
                  key={r.slug}
                  className={`rounded-control flex flex-col gap-0.5 px-2 py-1.5 ${r.on ? 'bg-chip' : ''}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${r.demo ? 'bg-emerald-500' : 'bg-rule'}`}
                    />
                    <span
                      className={`text-small truncate font-mono ${r.on ? 'font-semibold' : ''}`}
                    >
                      {r.slug}
                    </span>
                  </span>
                  <span className="text-label text-muted pl-3 font-mono tabular-nums">v{r.v}</span>
                </div>
              ))}
            </div>
          </Specimen>

          <Specimen name="테마 토글" use="지금 상태를 보여주고, 누르면 뒤집는다" wide>
            <div className="flex items-center gap-4 p-4">
              <ThemeToggle />
              <span className="text-small text-muted">
                라벨은 CSS 가 고릅니다 — 두 라벨이 모두 HTML 에 있고
                <code className="bg-chip rounded-mark mx-1 px-1 font-mono">.theme-*-only</code>가
                한쪽만 보입니다.
              </span>
            </div>
          </Specimen>

          <Specimen name="실행 불가 화면" use="NotPlayable · 이유를 말한다" wide>
            <div className="bg-chip flex flex-col items-center gap-3 p-8 text-center">
              <span className="text-label text-muted font-mono uppercase">웹 데모 없음</span>
              <p className="text-body max-w-md">
                Windows · macOS 네이티브에 직접 붙는 패키지라 브라우저에서는 실행할 수 없습니다.
              </p>
              <p className="text-small text-muted max-w-md">
                준비 중이라서가 아닙니다 — 이 패키지의 쓸모는 브라우저 밖에 있습니다.
              </p>
              <div className="text-small mt-1 flex gap-4 font-mono">
                <span>pub.dev ↗</span>
                <span>GitHub ↗</span>
                <span>API 레퍼런스 ↗</span>
              </div>
            </div>
          </Specimen>
        </div>
      </Section>

      {/* -------------------------------------------------------- 레이아웃 */}
      <Section
        id="layout"
        title="레이아웃"
        note="레일은 폭에 따라 자리를 바꿉니다. 같은 컴포넌트가 데스크톱에서는 왼쪽에 서고 모바일에서는 서랍이 됩니다 — 부모가 flex-col md:flex-row 이기 때문입니다."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-label text-muted font-mono uppercase">데스크톱 (md 이상)</span>
            <pre className="border-rule bg-panel rounded-panel text-label overflow-x-auto border p-3.5 font-mono leading-relaxed">
              {`┌────────┬──────────────┐
│ 레일   │ 헤더          │
│ 검색   ├──────────────┤
│ ●table │              │
│ ○alone │   example    │
│        │              │
└────────┴──────────────┘`}
            </pre>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label text-muted font-mono uppercase">모바일 (md 미만)</span>
            <pre className="border-rule bg-panel rounded-panel text-label overflow-x-auto border p-3.5 font-mono leading-relaxed">
              {`┌──────────────────────┐
│ ← 목록    패키지 N ▾ │
├──────────────────────┤
│ 헤더                  │
├──────────────────────┤
│      example         │
└──────────────────────┘`}
            </pre>
          </div>
        </div>

        <p className="text-small text-muted max-w-(--container-measure)">
          레일을 모바일에서 그냥 숨기면 목록·검색·나가는 링크가 함께 사라져 페이지가 막다른 골목이
          됩니다. 컨테이너가{' '}
          <code className="bg-chip rounded-mark px-1 font-mono">fixed inset-0</code> 이라 스크롤로
          빠져나갈 수도 없습니다.
        </p>
      </Section>

      <footer className="border-rule text-label text-muted flex justify-between border-t pt-6 font-mono uppercase">
        <Link href="/" className="hover:text-ink">
          ← 사이트
        </Link>
        <span>noindex · 만드는 사람용</span>
      </footer>
    </main>
  );
}
