import Link from 'next/link';
import { FIXTURES } from '@/content/design-fixtures';
import { VARIANTS } from './chrome';

/**
 * 메인 화면 시안 세 개의 목차.
 *
 * 세 시안은 예쁨을 겨루지 않는다. 각각 **다른 질문에 먼저 답한다** —
 * 무엇이 있는가(A), 살아 있는가(B), 누가 왜 만들었는가(C).
 * 고르는 기준은 취향이 아니라 "방문자가 처음 던지는 질문이 무엇인가" 다.
 */

const CARDS = [
  {
    id: 'a',
    answers: '무엇이 있는가',
    keeps: '29개가 늘어도 한 화면에서 훑힌다. 카드 그리드를 버려 항목당 높이가 1/4 로 준다.',
    costs: '개성은 헤더 문단 하나에만 실린다. 목록 자체는 여전히 목록이다.',
    upkeep: '전부 생성된다. 사람이 쓸 글이 없다.',
  },
  {
    id: 'b',
    answers: '살아 있는가',
    keeps: '마지막 커밋 날짜가 앞에 온다. 방치된 저장소가 아니라는 증거가 첫 화면에 있다.',
    costs:
      '분류가 사라져 "데스크톱 패키지만 보고 싶다" 는 요구를 못 받는다. 오래된 것이 아래로 밀려 억울해진다.',
    upkeep: 'pubspec 에 날짜 한 줄만 더 읽으면 된다. 역시 전부 생성된다.',
  },
  {
    id: 'c',
    answers: '누가 왜 만들었는가',
    keeps: '"난 이런 걸 만들었어요" 에 실제로 답한다. 세 시안 중 유일하게 사람 목소리가 난다.',
    costs: '항목당 높이가 가장 크다. 29개가 되면 스크롤이 길어져 A 의 장점을 잃는다.',
    upkeep: '패키지마다 한 줄씩 직접 써야 한다. 안 쓰면 빈 자리가 남는다.',
  },
] as const;

export default function DesignHomeIndex() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-14">
      <header className="flex flex-col gap-3">
        <span className="text-label text-muted font-mono uppercase">design · 메인 화면 시안</span>
        <h1 className="text-title font-semibold">지금 메인을 무엇으로 바꿀까</h1>
        <p className="text-body text-muted max-w-(--container-measure) text-pretty">
          세 시안 모두 실제 토큰·폰트·테마 토글을 그대로 쓰고, 형제 저장소에서 떠 온 실제 패키지{' '}
          {FIXTURES.length}개로 그립니다. 보이는 것이 곧 배포될 모습입니다. 지금 메인은 카드 3열
          그리드에 패키지가 1개라 레이아웃 판단이 아예 불가능해서, 판단이 가능한 밀도를 만들어
          두었습니다.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {CARDS.map((c) => {
          const v = VARIANTS.find((x) => x.id === c.id)!;
          return (
            <li key={c.id}>
              <Link
                href={`/design/home/${c.id}`}
                className="rounded-panel border-rule bg-panel hover:border-ink/30 duration-(--duration-quick) flex flex-col gap-3 border p-5 transition-colors"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-label bg-ink text-page rounded-mark px-1.5 py-0.5 font-mono font-semibold">
                    {c.id.toUpperCase()}
                  </span>
                  <h2 className="text-heading font-semibold">{v.name}</h2>
                  <span className="text-label text-muted font-mono">{v.ref}</span>
                </div>
                <p className="text-small">
                  <span className="text-muted">먼저 답하는 질문 — </span>
                  <span className="font-medium">{c.answers}</span>
                </p>
                <dl className="text-small grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
                  <dt className="text-muted font-mono">얻는 것</dt>
                  <dd className="text-pretty">{c.keeps}</dd>
                  <dt className="text-muted font-mono">잃는 것</dt>
                  <dd className="text-muted text-pretty">{c.costs}</dd>
                  <dt className="text-muted font-mono">유지비</dt>
                  <dd className="text-muted text-pretty">{c.upkeep}</dd>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-small text-muted border-rule border-t pt-5 text-pretty">
        섞어도 됩니다. A 의 목록에 B 의 날짜를 얹고 상위 3개에만 C 의 한 줄을 붙이는 조합이 유지비
        대비 가장 큽니다 — 직접 쓸 글이 14줄이 아니라 3줄로 줄어듭니다.
      </p>
    </main>
  );
}
