import { ThemeToggle } from '@/components/site/theme-toggle';
import { FIXTURES, type FixturePkg } from '@/content/design-fixtures';
import { VariantChrome } from '../chrome';

/**
 * 시안 C — 내러티브. 참고: jvns.ca/projects
 *
 * 목록에 **"왜 만들었는가"** 를 한 줄씩 붙인다. 이 한 줄이 페이지 전체를
 * 사람이 쓴 것으로 만든다 — 나머지 두 시안이 끝내 얻지 못하는 것이다.
 *
 * 대가가 분명하다. 이 줄은 **생성할 수 없다.** pubspec 에 없는 정보이므로
 * 패키지마다 사람이 한 번씩 써야 하고, 안 쓴 패키지는 빈 자리가 남는다.
 * 아래 WHY 는 전부 **자리끼움**이다 — 내가 지어낸 문장이지 저자의 말이 아니다.
 */

const WHY: Record<string, string> = {
  flutter_table_plus:
    '행 2만 개짜리 표를 그릴 때마다 스크롤이 끊겼습니다. 헤더와 본문을 따로 그리면서 스크롤만 묶는 구조로 다시 짰습니다.',
  flutter_dropdown_button:
    '기본 DropdownButton 은 다이얼로그 안에서 잘리거나 화면 밖으로 넘어갑니다. 오버레이로 띄우고 위치를 직접 계산하게 했습니다.',
  boring_avatars:
    '웹에서 쓰던 boring-avatars 를 Flutter 앱에도 그대로 쓰고 싶었는데, 같은 이름이 같은 얼굴을 내야 의미가 있어서 비트 단위로 옮겼습니다.',
  flutter_checkbox: '체크박스 하나 스타일 맞추자고 매번 Theme 를 뒤지는 게 지겨웠습니다.',
  flutter_tweakcn_generator:
    'tweakcn 에서 고른 테마를 Flutter 로 손으로 옮겨 적다가 오타를 냈습니다. 두 번은 안 하려고 만들었습니다.',
  flutter_folderview: '트리뷰가 필요할 때마다 새로 짜고 있었습니다. 세 번째에 패키지로 뗐습니다.',
  flutter_password_input:
    'Windows 에서 한글 상태로 비밀번호를 치면 로그인이 계속 실패했습니다. Caps Lock 과 입력기 상태를 필드가 직접 알아야 했습니다.',
  just_tooltip: '툴팁 하나 띄우려고 무거운 패키지를 넣기 싫었습니다.',
  flutter_license_manager: '앱 스토어에 올릴 때마다 오픈소스 고지 화면을 다시 만들고 있었습니다.',
  flutter_ime:
    '데스크톱 앱에서 입력기가 한글로 남아 있으면 단축키가 안 먹습니다. 상태를 읽고 바꿀 방법이 필요했습니다.',
  just_font_scan:
    '설치된 폰트 목록을 굵기까지 정확히 알아야 했는데, 플랫폼 API 를 직접 부르는 것 말고는 방법이 없었습니다.',
  flutter_oss_manager:
    'flutter_license_manager 에 넣을 데이터를 손으로 모으고 있었습니다. 그 일을 CLI 로 옮겼습니다.',
  just_make_logo: '로고가 급할 때 디자인 도구를 켜는 대신 쓰려고 만들었습니다.',
  just_color_picker: '색 고르는 위젯 하나 때문에 의존성이 세 개 늘어나는 게 이상했습니다.',
};

function Entry({ pkg }: { pkg: FixturePkg }) {
  const playable = pkg.category === 'ui' && pkg.hasExample;
  return (
    <li className="border-rule flex flex-col gap-2 border-b pb-7 last:border-b-0">
      <div className="flex items-baseline gap-2.5">
        <a
          href="#"
          className="text-heading font-mono font-semibold underline-offset-4 hover:underline"
        >
          {pkg.slug}
        </a>
        <span className="text-label text-muted font-mono tabular-nums">v{pkg.version}</span>
        {playable && (
          <span className="text-label text-muted ml-auto shrink-0 font-mono">눌러보기 →</span>
        )}
      </div>
      <p className="text-body max-w-(--container-measure) text-pretty">{WHY[pkg.slug]}</p>
      <p className="text-small text-muted max-w-(--container-measure) text-pretty">
        {pkg.description}
      </p>
    </li>
  );
}

export default function VariantC() {
  return (
    <>
      <VariantChrome active="c" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <div className="rounded-panel border-rule text-small text-muted border border-dashed p-4">
          <strong className="text-ink font-semibold">
            주의 — 아래 굵은 문장들은 자리끼움입니다.
          </strong>{' '}
          패키지마다 붙은 &ldquo;왜 만들었나&rdquo; 한 줄은 pubspec 에 없는 정보라 생성할 수
          없습니다. 제가 짐작해서 써 둔 것이니, 이 방향을 고르면 14줄을 직접 쓰셔야 합니다.
        </div>

        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-display font-bold text-balance">안녕하세요, 기현입니다.</h1>
            <ThemeToggle className="mt-2 shrink-0" />
          </div>
          <p className="text-body max-w-(--container-measure) text-pretty">
            Flutter 로 데스크톱 앱을 만들다 보면 같은 위젯을 자꾸 다시 짜게 됩니다. 세 번째로 같은
            걸 짜고 있으면 패키지로 뗐습니다. 아래가 그렇게 나온 것들이고, 대부분은 제가 지금도 쓰고
            있습니다.
          </p>
          <p className="text-body text-muted max-w-(--container-measure) text-pretty">
            위젯은 example 앱을 브라우저에 그대로 올려뒀습니다. 스크린샷으로는 스크롤이 부드러운지
            키보드가 먹는지 알 수 없으니 직접 눌러보세요.
          </p>
        </header>

        <ul className="flex flex-col gap-7">
          {FIXTURES.map((p) => (
            <Entry key={p.slug} pkg={p} />
          ))}
        </ul>

        <footer className="border-rule text-small text-muted flex justify-between border-t pt-6">
          <span>© 2026 kihyun · 전부 MIT</span>
          <a href="https://github.com/kihyun1998" className="hover:text-ink font-mono">
            GitHub ↗
          </a>
        </footer>
      </main>
    </>
  );
}
