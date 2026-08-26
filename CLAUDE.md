# kihyun-opensource

A showcase site for Flutter packages. Each package's `example/` app is built for
the web and embedded live, so visitors try the widget instead of reading about it.

```
web/       Next.js 16 static site (pnpm, Tailwind v4, output: 'export')
scripts/   demo build tooling — package list generation, font subsetting, web builds
docs/      procedures, starting with ADDING-A-PACKAGE.md
```

Packages themselves live in sibling repositories (`D:/github/<slug>/`), not here.

## Ground rules

These are load-bearing. `web/src/app/design/page.tsx` states them with the
components they shape; it is dev-only and stripped from production builds.

- **The site does not know what is inside an example.** It has a slug, and it
  mounts an iframe. What the example shows is the package author's business.
- **Documentation is not duplicated.** READMEs, API references and guides live on
  pub.dev and in the package repos. Copying them here creates a second copy that
  goes stale first.
- **Packages that cannot run on the web say why.** Desktop plugins and CLI tools
  are not "coming soon" — they are not browser software, and the site says so.

## Agent skills

### Issue tracker

GitHub Issues on `kihyun1998/kihyun-opensource`, via the `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical labels, unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root.
See `docs/agents/domain.md`.
