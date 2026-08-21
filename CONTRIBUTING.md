# Contributing

## Setup

```bash
corepack enable
pnpm install          # also installs the git hooks
cp .env.example .env.local
pnpm run dev
```

## Workflow

1. Branch from `main`: `git checkout -b feat/short-description`
2. Make the change, with tests.
3. Run `pnpm run validate` — this is exactly what CI checks.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org).
5. Open a PR and fill in the template.

## Commit messages

```
type(scope): subject
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`. Subject is imperative and lower-case, under 100 characters total.

```
feat(auth): add password reset flow
fix(api): return 404 instead of 500 for unknown ids
```

A commit that breaks an existing contract carries `BREAKING CHANGE:` in the body.

## Tests

- Unit tests live next to the code as `*.test.ts(x)` and run under Vitest.
- End-to-end specs live in `e2e/` and run under Playwright against a production build.
- Coverage must stay at or above 70%. Genuinely untestable glue is excluded in
  `vitest.config.ts` rather than papered over by lowering the threshold.

Test behaviour, not implementation: query by role and accessible name, not by CSS class.

## Code style

Prettier and ESLint decide formatting — do not argue with them in review. Beyond that:

- No `any`. Use `unknown` and narrow it.
- Server Components by default; add `'use client'` only where interactivity requires it.
- Reach for `@/lib/logger` instead of `console.log`; the lint rule enforces this.
- Every new environment variable goes in `src/env.ts` **and** `.env.example`.

## Adding a dependency

Justify it in the PR description. Prefer the platform and the existing toolchain over a new
package; each addition is code you now maintain, audit and upgrade.
