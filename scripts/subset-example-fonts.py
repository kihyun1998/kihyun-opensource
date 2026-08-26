"""example 이 실제로 쓰는 글자만 남기도록 폰트를 부분집합한다.

왜 필요한가
-----------
Pretendard 같은 한글 폰트는 글리프가 11,000자를 넘어 굵기당 2.6MB 다.
example 이 영문뿐이면 그 전부가 낭비다 — 그런데 Flutter 웹은 pubspec 에
선언된 폰트를 통째로 내려받는다. flutter_table_plus 의 경우 Flutter 코드가
6MB 인데 폰트가 15.5MB 였다.

무엇을 하는가
-------------
1. example/lib 의 모든 .dart 를 읽어 실제로 등장하는 문자를 모은다
2. 라틴 기본 + 문장부호 + 발견된 한글만 남겨 폰트를 다시 쓴다
3. 코드에서 안 쓰는 FontWeight 는 건드리지 않는다 (판단이 필요해 사람 몫)

되돌리기
--------
폰트는 git 추적 대상이다. `git checkout -- example/assets/fonts` 로 복원된다.

사용법
------
    python scripts/subset-example-fonts.py D:/github/flutter_table_plus [--apply]

--apply 없이는 크기만 계산하고 파일을 쓰지 않는다.
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys

# 라틴 기본, 라틴-1 보충, 굽은 따옴표, 불릿·말줄임, 원화·유로, 화살표, 도형.
# UI 에서 실제로 쓰이는 기호 범위다.
BASE_RANGES = (
    'U+0020-007E,U+00A0-00FF,U+2018-201F,U+2022,U+2026,'
    'U+20A9,U+20AC,U+2190-2193,U+25A0-25FF,U+2713,U+2714'
)


def scan_chars(lib: pathlib.Path) -> set[str]:
    """소스에 등장하는 한글·CJK 문자를 모은다. 라틴은 어차피 BASE 에 있다."""
    found: set[str] = set()
    for p in lib.rglob('*.dart'):
        for ch in p.read_text(encoding='utf-8', errors='ignore'):
            o = ord(ch)
            if 0xAC00 <= o <= 0xD7A3 or 0x3131 <= o <= 0x318E or 0x4E00 <= o <= 0x9FFF:
                found.add(ch)
    return found


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('package', type=pathlib.Path, help='패키지 루트 (example/ 를 품은 곳)')
    ap.add_argument('--apply', action='store_true', help='실제로 파일을 덮어쓴다')
    args = ap.parse_args()

    example = args.package / 'example'
    fonts_dir = example / 'assets' / 'fonts'
    lib = example / 'lib'

    if not fonts_dir.is_dir():
        print(f'폰트 없음: {fonts_dir} — 할 일 없음')
        return 0

    faces = sorted(p for p in fonts_dir.iterdir() if p.suffix.lower() in ('.ttf', '.otf'))
    if not faces:
        print('폰트 파일 없음 — 할 일 없음')
        return 0

    extra = scan_chars(lib)
    unicodes = BASE_RANGES
    if extra:
        unicodes += ',' + ','.join(f'U+{ord(c):04X}' for c in sorted(extra))

    print(f'소스에서 발견한 CJK 글리프: {len(extra)}자')
    print(f'{"폰트":<30}{"현재":>10}{"부분집합":>11}{"절감":>9}')
    print('-' * 60)

    before = after = 0
    for face in faces:
        out = face.with_suffix(face.suffix + '.subset')
        subprocess.run(
            ['pyftsubset', str(face), f'--unicodes={unicodes}',
             '--layout-features=*', f'--output-file={out}'],
            check=True,
        )
        a, b = face.stat().st_size, out.stat().st_size
        before, after = before + a, after + b
        print(f'{face.name:<30}{a/1048576:>9.2f}M{b/1024:>10.0f}K{100*(1-b/a):>8.0f}%')

        if args.apply:
            out.replace(face)
        else:
            out.unlink()

    print('-' * 60)
    print(f'{"합계":<30}{before/1048576:>9.2f}M{after/1024:>10.0f}K{100*(1-after/before):>8.0f}%')
    print()
    print('적용됨.' if args.apply else '미적용 — 실제로 바꾸려면 --apply 를 붙일 것.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
