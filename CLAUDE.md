# kihyun-opensource

A showcase site for Flutter packages. Each package's `example/` app is built for
the web and embedded live, so visitors try the widget instead of reading about it.

```
web/         Next.js 16 static site (pnpm, Tailwind v4, output: 'export')
scripts/     tooling — package list generation, demo builds, release watching
.github/     deploy on push, and a daily pub.dev release watcher
docs/        procedures, starting with ADDING-A-PACKAGE.md
```

Tests live beside the scripts they cover and run from `web/` (`pnpm test`,
Vitest). There is one seam per script — the pure transform — and nothing else
is tested; see the Testing Decisions in issues #2 and #3 for why.

Packages themselves live in sibling repositories (`../<slug>/`), not here.
The scripts derive that from their own location, so no path is machine-specific.

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
- **The site is in English. Only the site.** Every user-visible string is
  English; `<html lang>` is `en`. Code comments, commit messages and issues stay
  in Korean — those are read by whoever builds this, not by whoever visits it.
  Do not add a Korean UI string, and do not reintroduce locale routes: package
  descriptions come from pub.dev and cannot be translated without breaking the
  rule above, so a second locale can never be more than half a translation.
  Closed as #1 with the full reasoning.
- **Packages go up one at a time.** Move a single line from `PENDING` to
  `CATEGORY`, deploy it, look at it, then take the next one. Filling the list is
  not the goal.

## Deployment

Pushing to `main` deploys. Every build happens in the runner — Vercel only
serves, and its Git integration is deliberately **disconnected**, because that
build environment has no Flutter and would ship a site with no demos. `vercel
link` reconnects it silently, so check after running it.

The order inside the workflow is load-bearing and explained in
`docs/ADDING-A-PACKAGE.md`; the short version is that the package list is
generated **twice**, before and after the demos are built.

A scheduled job compares pub.dev against the committed list once a day and
deploys only when something actually changed.

## Agent skills

### Issue tracker

GitHub Issues on `kihyun1998/kihyun-opensource`, via the `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical labels, unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root.
See `docs/agents/domain.md`.
