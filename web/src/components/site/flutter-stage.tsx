/**
 * 실행 중인 example 앱의 목업.
 *
 * 실제로는 이 자리에 <iframe src="/demo/flutter_table_plus/index.html" /> 가 온다.
 * example 은 그 자체로 플레이그라운드다 — shell 메뉴, 설정 컨트롤, 프리셋,
 * 뷰포트 전환이 전부 Flutter 안에 있다. 사이트는 감싸기만 하면 된다.
 *
 * 목업이 테이블인 이유: flutter_table_plus 의 example 이 실제로
 * Employee 데이터를 띄우는 테이블이기 때문이다. 버튼 목업으로는
 * 프레임 크기·비율 판단이 안 된다.
 */

const ROWS = [
  ['Kim Minseo', 'Engineer', 'Platform', '₩ 82,000,000', '4.6'],
  ['Park Jiwon', 'Designer', 'Product', '₩ 71,500,000', '4.8'],
  ['Lee Junho', 'Engineer', 'Platform', '₩ 95,200,000', '4.2'],
  ['Choi Yuna', 'PM', 'Product', '₩ 88,000,000', '4.9'],
  ['Jung Hyun', 'Engineer', 'Infra', '₩ 79,400,000', '4.1'],
] as const;

const COLS = ['NAME', 'POSITION', 'DEPARTMENT', 'SALARY', 'PERF'] as const;

export function FlutterStage({ className = '' }: { className?: string }) {
  return (
    <div className={`flex overflow-hidden bg-[#12151c] text-white/90 ${className}`}>
      {/* example 의 shell 메뉴 */}
      <div className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-white/10 p-2.5 sm:flex">
        <span className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-white/40">
          Playground
        </span>
        {['Employees', 'Sorting', 'Selection', 'Cell editing', 'Viewport lab'].map((d, i) => (
          <span
            key={d}
            className={`rounded px-2 py-1.5 text-[10px] ${
              i === 0 ? 'bg-white/12 font-medium' : 'text-white/50'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 테이블 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 프리셋 바 */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          {['Default', 'Compact', 'Dense'].map((p, i) => (
            <span
              key={p}
              className={`rounded px-2 py-0.5 text-[9px] ${
                i === 0
                  ? 'bg-white/85 text-black font-semibold'
                  : 'border border-white/20 text-white/60'
              }`}
            >
              {p}
            </span>
          ))}
          <span className="ml-auto font-mono text-[9px] text-white/40">5 / 1,000 rows</span>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/12 bg-white/[0.04]">
                {COLS.map((c, i) => (
                  <th
                    key={c}
                    className={`px-3 py-2 font-mono text-[9px] font-normal tracking-wider text-white/45 ${
                      i > 2 ? 'hidden md:table-cell' : ''
                    }`}
                  >
                    {c}
                    {i === 0 && <span className="ml-1 text-white/70">▲</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                <tr
                  key={r[0]}
                  className={`border-b border-white/[0.06] ${ri === 1 ? 'bg-sky-400/15' : ''}`}
                >
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 text-[10px] whitespace-nowrap ${
                        ci > 2 ? 'hidden md:table-cell' : ''
                      } ${ci === 0 ? 'font-medium' : 'text-white/65'} ${ci >= 3 ? 'font-mono tabular-nums' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 성능 모니터 */}
        <div className="flex items-center gap-3 border-t border-white/10 px-3 py-1.5 font-mono text-[9px] text-white/40">
          <span>16.4 ms/frame</span>
          <span>60 fps</span>
          <span className="ml-auto">Wasm</span>
        </div>
      </div>
    </div>
  );
}
