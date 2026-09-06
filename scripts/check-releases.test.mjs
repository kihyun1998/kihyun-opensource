import { describe, expect, it } from 'vitest';
import { changedSlugs } from './check-releases.mjs';

/**
 * 감시 작업이 내리는 유일한 판단 — **무엇을 다시 만들 것인가.**
 *
 * 워크플로 문법이나 Flutter 설치는 여기서 보지 않는다. 실제로 한 번
 * 돌려보는 것 말고 의미 있게 검증할 방법이 없고, 첫 배포가 그 역할을 한다.
 *
 * 네트워크에 나가지 않는다.
 */

/** 사이트가 지금 말하고 있는 것. PACKAGES 에서 필요한 두 필드만. */
const site = (pairs) => Object.entries(pairs).map(([slug, version]) => ({ slug, version }));

describe('changedSlugs', () => {
  it('전부 같으면 아무것도 다시 만들지 않는다', () => {
    const changed = changedSlugs(site({ a_pkg: '1.0.0', b_pkg: '2.3.4' }), {
      a_pkg: '1.0.0',
      b_pkg: '2.3.4',
    });

    expect(changed).toEqual([]);
  });

  it('하나만 올랐으면 그 하나만 나온다', () => {
    const changed = changedSlugs(site({ a_pkg: '1.0.0', b_pkg: '2.3.4' }), {
      a_pkg: '1.0.0',
      b_pkg: '2.4.0',
    });

    expect(changed).toEqual(['b_pkg']);
  });

  it('여러 개가 올랐으면 전부 나오고, 순서는 이름순이다', () => {
    // 순서가 흔들리면 워크플로 로그와 캐시 키가 빌드마다 달라진다.
    const changed = changedSlugs(site({ zebra: '1.0.0', alpha: '1.0.0', mango: '1.0.0' }), {
      zebra: '2.0.0',
      alpha: '2.0.0',
      mango: '1.0.0',
    });

    expect(changed).toEqual(['alpha', 'zebra']);
  });

  it('버전이 내려가도 바뀐 것으로 친다', () => {
    // 되돌린 릴리스도 데모를 다시 만들어야 한다. "다름" 이 기준이지 "높음" 이 아니다.
    const changed = changedSlugs(site({ a_pkg: '2.0.0' }), { a_pkg: '1.9.0' });

    expect(changed).toEqual(['a_pkg']);
  });

  it('pub.dev 에 없는 패키지는 비교를 세우지 않고, 바뀐 것으로도 치지 않는다', () => {
    // 아직 배포하지 않은 패키지가 목록에 있을 수 있다. 그것 때문에 감시가
    // 죽거나, 매일 헛되이 배포가 도는 일이 없어야 한다.
    const changed = changedSlugs(site({ not_published: '0.1.0', b_pkg: '1.0.0' }), {
      not_published: null,
      b_pkg: '1.0.0',
    });

    expect(changed).toEqual([]);
  });

  it('조회 결과에 아예 빠져 있어도 마찬가지다', () => {
    const changed = changedSlugs(site({ missing_entirely: '0.1.0' }), {});

    expect(changed).toEqual([]);
  });

  it('pub.dev 에는 있는데 사이트 목록에 없는 것은 무시한다', () => {
    // 무엇을 사이트에 올릴지는 사람의 판단이다. 감시가 대신 정하지 않는다.
    const changed = changedSlugs(site({ a_pkg: '1.0.0' }), {
      a_pkg: '1.0.0',
      some_other_package: '9.9.9',
    });

    expect(changed).toEqual([]);
  });

  it('목록이 비어 있으면 빈 배열이다', () => {
    expect(changedSlugs([], { a_pkg: '1.0.0' })).toEqual([]);
  });
});
