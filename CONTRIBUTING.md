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
2. Make the change.
3. Run `pnpm run validate` — format, lint and typecheck in one pass.
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

## Verifying a change

This repo does not carry test files — see rule 6 in AGENTS.md. Verify work by running
`pnpm run validate` and `pnpm run build`, and by exercising the path in the browser or with
`curl`. Say in the PR which of those you did.

If something genuinely warrants a permanent test, raise it in the PR rather than adding one.

## Code style

Prettier and ESLint decide formatting — do not argue with them in review. Beyond that:

- No `any`. Use `unknown` and narrow it.
- Server Components by default; add `'use client'` only where interactivity requires it.
- Reach for `@/lib/logger` instead of `console.log`; the lint rule enforces this.
- Every new environment variable goes in `src/env.ts` **and** `.env.example`.

## Adding a dependency

Justify it in the PR description. Prefer the platform and the existing toolchain over a new
package; each addition is code you now maintain, audit and upgrade.
