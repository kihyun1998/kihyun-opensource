import { describe, expect, it } from 'vitest';
import { buildRows } from './gen-packages.mjs';

/**
 * 이 저장소의 유일한 테스트 seam.
 *
 * 검증하는 것은 하나다 — 주어진 pub.dev 응답과 로컬 상태에 대해 **어떤 행
 * 배열이 나오는가.** 설명을 펴는 정규식이나 중간 파싱 단계는 보지 않는다.
 * 답이 같은 한 그것들은 자유롭게 바뀌어야 한다.
 *
 * 네트워크에 나가지 않는다. pub.dev 가 죽어도 이 테스트는 돈다.
 */

/** pub.dev 응답 하나. fetch 의 Response 중 우리가 쓰는 부분만 흉내낸다. */
const found = (data) => ({ ok: true, status: 200, json: async () => data });
const missing = { ok: false, status: 404 };
const serverError = { ok: false, status: 503 };

const pubdev = ({ version, description, repository, published }) =>
  found({
    name: 'x',
    latest: {
      version,
      published,
      pubspec: { description, repository, homepage: repository },
    },
  });

/** 로컬 형제 저장소 하나. */
const local = ({ pubspec = null, hasExample = false, demoReady = false } = {}) => ({
  pubspec,
  hasExample,
  demoReady,
});

/** 주입 두 개를 표에서 만들어 준다. */
function harness({ remote = {}, disk = {} }) {
  return {
    fetchPackage: async (slug) => {
      const r = remote[slug];
      if (!r) throw new Error(`테스트가 ${slug} 의 응답을 정의하지 않았다`);
      if (typeof r === 'function') return r();
      return r;
    },
    readLocal: (slug) => disk[slug] ?? local(),
  };
}

describe('buildRows — 정렬', () => {
  it('릴리스가 최근인 것부터 온다', async () => {
    const rows = await buildRows(
      { old_one: 'ui', new_one: 'ui', middle_one: 'ui' },
      harness({
        remote: {
          old_one: pubdev({ version: '1.0.0', published: '2024-01-01T00:00:00Z' }),
          new_one: pubdev({ version: '3.0.0', published: '2026-09-01T00:00:00Z' }),
          middle_one: pubdev({ version: '2.0.0', published: '2025-05-05T00:00:00Z' }),
        },
      })
    );

    expect(rows.map((r) => r.slug)).toEqual(['new_one', 'middle_one', 'old_one']);
  });

  it('아직 배포되지 않은 것은 맨 뒤로 간다', async () => {
    const rows = await buildRows(
      { unpublished: 'tool', released: 'ui' },
      harness({
        remote: {
          unpublished: missing,
          released: pubdev({ version: '1.0.0', published: '2020-01-01T00:00:00Z' }),
        },
        disk: { unpublished: local({ pubspec: 'version: 0.1.0\n' }) },
      })
    );

    expect(rows.map((r) => r.slug)).toEqual(['released', 'unpublished']);
    expect(rows[1].published).toBeNull();
  });

  it('같은 날 배포된 것은 이름순으로 갈린다', async () => {
    const sameDay = '2026-03-03T00:00:00Z';
    const rows = await buildRows(
      { zebra: 'ui', alpha: 'ui', mango: 'ui' },
      harness({
        remote: {
          zebra: pubdev({ version: '1.0.0', published: sameDay }),
          alpha: pubdev({ version: '1.0.0', published: sameDay }),
          mango: pubdev({ version: '1.0.0', published: sameDay }),
        },
      })
    );

    expect(rows.map((r) => r.slug)).toEqual(['alpha', 'mango', 'zebra']);
  });
});

describe('buildRows — 정본은 pub.dev 다', () => {
  it('로컬 pubspec 이 뒤처져 있어도 pub.dev 의 값이 나온다', async () => {
    // 이 테스트가 이 작업 전체의 요지다. 로컬 체크아웃이 밀려 있을 때
    // 사이트가 낡은 버전을 말하던 것이 바로 고치려는 문제다.
    const staleLocal = [
      'name: flutter_ime',
      'version: 2.1.4',
      'description: 낡은 설명',
      'repository: https://example.invalid/wrong',
    ].join('\n');

    const rows = await buildRows(
      { flutter_ime: 'desktop' },
      harness({
        remote: {
          flutter_ime: pubdev({
            version: '3.0.0',
            description: 'The published description.',
            repository: 'https://github.com/kihyun1998/flutter_ime',
            published: '2026-07-22T00:00:00Z',
          }),
        },
        disk: { flutter_ime: local({ pubspec: staleLocal }) },
      })
    );

    expect(rows[0].version).toBe('3.0.0');
    expect(rows[0].description).toBe('The published description.');
    expect(rows[0].repoUrl).toBe('https://github.com/kihyun1998/flutter_ime');
    expect(rows[0].published).toBe('2026-07-22');
  });

  it('published 는 타임스탬프가 아니라 날짜로 굳는다', async () => {
    const rows = await buildRows(
      { a_pkg: 'ui' },
      harness({
        remote: {
          a_pkg: pubdev({ version: '1.0.0', published: '2026-09-04T12:33:02.429576Z' }),
        },
      })
    );

    expect(rows[0].published).toBe('2026-09-04');
  });
});

describe('buildRows — 로컬에서만 오는 것', () => {
  it('hasExample 과 demoReady 는 디스크가 정한다', async () => {
    const rows = await buildRows(
      { with_demo: 'ui', without: 'ui' },
      harness({
        remote: {
          with_demo: pubdev({ version: '1.0.0', published: '2026-02-02T00:00:00Z' }),
          without: pubdev({ version: '1.0.0', published: '2026-01-01T00:00:00Z' }),
        },
        disk: {
          // 두 필드에 같은 값을 주면 서로 맞바꿔도 테스트가 눈치채지 못한다.
          // example 은 있는데 데모를 아직 빌드하지 않은 상태가 실제로 흔하고,
          // 그 조합이라야 두 값이 구별된다.
          with_demo: local({ hasExample: true, demoReady: false }),
          without: local({ hasExample: false, demoReady: false }),
        },
      })
    );

    expect(rows[0]).toMatchObject({ slug: 'with_demo', hasExample: true, demoReady: false });
    expect(rows[1]).toMatchObject({ slug: 'without', hasExample: false, demoReady: false });
  });
});

describe('buildRows — 실패의 처리', () => {
  it('404 는 로컬로 폴백하고, 나머지 패키지는 그대로 처리된다', async () => {
    const rows = await buildRows(
      { not_on_pub: 'tool', fine: 'ui' },
      harness({
        remote: {
          not_on_pub: missing,
          fine: pubdev({ version: '9.9.9', published: '2026-01-01T00:00:00Z' }),
        },
        disk: {
          not_on_pub: local({
            pubspec: 'version: 0.12.0\ndescription: 로컬에만 있는 설명\n',
          }),
        },
      })
    );

    const fallback = rows.find((r) => r.slug === 'not_on_pub');
    expect(fallback.version).toBe('0.12.0');
    expect(fallback.description).toBe('로컬에만 있는 설명');
    expect(fallback.published).toBeNull();
    expect(rows.find((r) => r.slug === 'fine').version).toBe('9.9.9');
  });

  it('5xx 는 빌드를 세운다', async () => {
    await expect(
      buildRows({ any_pkg: 'ui' }, harness({ remote: { any_pkg: serverError } }))
    ).rejects.toThrow(/any_pkg/);
  });

  it('200 인데 응답 모양이 다르면 빌드를 세운다 — 버전이 없을 때', async () => {
    // 200 을 받았다고 해서 우리가 기대하는 모양이라는 보장은 없다.
    // 검증하지 않으면 version: 'undefined' 가 그대로 사이트에 실린다.
    await expect(
      buildRows(
        { p: 'ui' },
        harness({
          remote: {
            p: found({ latest: { published: '2026-01-01T00:00:00Z', pubspec: { description: 'd' } } }),
          },
        })
      )
    ).rejects.toThrow(/응답 모양이 다르다 \(p\)/);
  });

  it('200 인데 응답 모양이 다르면 빌드를 세운다 — 날짜가 없을 때', async () => {
    await expect(
      buildRows(
        { p: 'ui' },
        harness({
          remote: { p: found({ latest: { version: '1.0.0', pubspec: { description: 'd' } } }) },
        })
      )
    ).rejects.toThrow(/응답 모양이 다르다 \(p\)/);
  });

  it('200 인데 latest 자체가 없으면 빌드를 세운다', async () => {
    await expect(
      buildRows({ p: 'ui' }, harness({ remote: { p: found({ name: 'p' }) } }))
    ).rejects.toThrow(/응답 모양이 다르다 \(p\)/);
  });

  it('네트워크 오류는 빌드를 세운다', async () => {
    await expect(
      buildRows(
        { any_pkg: 'ui' },
        harness({
          remote: {
            any_pkg: () => {
              throw new Error('getaddrinfo ENOTFOUND pub.dev');
            },
          },
        })
      )
    ).rejects.toThrow(/ENOTFOUND/);
  });

  it('pub.dev 에도 로컬에도 없으면 그 패키지는 빠지고 나머지는 남는다', async () => {
    const rows = await buildRows(
      { ghost: 'ui', real: 'ui' },
      harness({
        remote: {
          ghost: missing,
          real: pubdev({ version: '1.0.0', published: '2026-01-01T00:00:00Z' }),
        },
        disk: { ghost: local({ pubspec: null }) },
      })
    );

    expect(rows.map((r) => r.slug)).toEqual(['real']);
  });
});

describe('buildRows — 폴백 경로의 설명 읽기', () => {
  const cases = [
    ['인라인', 'description: 한 줄짜리 설명\nversion: 1.0.0\n', '한 줄짜리 설명'],
    [
      '접힘',
      'description: >-\n  여러 줄에 걸쳐\n  쓰인 설명이다\nversion: 1.0.0\n',
      '여러 줄에 걸쳐 쓰인 설명이다',
    ],
    ['따옴표', 'description: "따옴표에 싸인 설명"\nversion: 1.0.0\n', '따옴표에 싸인 설명'],
  ];

  it.each(cases)('%s 형태를 한 줄로 편다', async (_label, pubspec, expected) => {
    const rows = await buildRows(
      { p: 'ui' },
      harness({ remote: { p: missing }, disk: { p: local({ pubspec }) } })
    );

    expect(rows[0].description).toBe(expected);
  });
});

describe('buildRows — 저장소 링크', () => {
  it('pub.dev 가 repository 를 주지 않으면 homepage 를 쓴다', async () => {
    const rows = await buildRows(
      { p: 'ui' },
      harness({
        remote: {
          p: found({
            latest: {
              version: '1.0.0',
              published: '2026-01-01T00:00:00Z',
              pubspec: { description: 'd', homepage: 'https://github.com/kihyun1998/p' },
            },
          }),
        },
      })
    );

    expect(rows[0].repoUrl).toBe('https://github.com/kihyun1998/p');
  });

  it('둘 다 없으면 규약상의 GitHub 주소로 떨어진다', async () => {
    const rows = await buildRows(
      { lonely: 'ui' },
      harness({
        remote: {
          lonely: found({
            latest: {
              version: '1.0.0',
              published: '2026-01-01T00:00:00Z',
              pubspec: { description: 'd' },
            },
          }),
        },
      })
    );

    expect(rows[0].repoUrl).toBe('https://github.com/kihyun1998/lonely');
  });

  it('URL 이 아닌 값은 통과시키지 않는다', async () => {
    const rows = await buildRows(
      { p: 'ui' },
      harness({
        remote: {
          p: found({
            latest: {
              version: '1.0.0',
              published: '2026-01-01T00:00:00Z',
              pubspec: { description: 'd', repository: 'sdk: flutter' },
            },
          }),
        },
      })
    );

    expect(rows[0].repoUrl).toBe('https://github.com/kihyun1998/p');
  });
});
