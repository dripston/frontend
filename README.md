# Hackathon

A production-grade [Next.js](https://nextjs.org) 16 starter: strict TypeScript, validated
environment, hardened headers, unit and end-to-end tests, gated CI, and a container build.

## Requirements

| Tool   | Version                                  |
| ------ | ---------------------------------------- |
| Node   | 24 (see `.nvmrc`; anything ≥ 20.9 works) |
| pnpm   | 9+ (`corepack enable`)                   |
| Docker | optional, for container builds           |

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

The app runs at http://localhost:3000.

## Scripts

| Script               | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Dev server with hot reload                            |
| `pnpm build`         | Production build (`.next/standalone`)                 |
| `pnpm start`         | Serve the production build                            |
| `pnpm typecheck`     | `tsc --noEmit`                                        |
| `pnpm lint`          | ESLint, zero warnings tolerated                       |
| `pnpm lint:fix`      | ESLint with autofix                                   |
| `pnpm format`        | Prettier write                                        |
| `pnpm format:check`  | Prettier check (what CI runs)                         |
| `pnpm test`          | Unit tests once                                       |
| `pnpm test:watch`    | Unit tests in watch mode                              |
| `pnpm test:coverage` | Unit tests with coverage thresholds                   |
| `pnpm test:e2e`      | Playwright against a real production build            |
| `pnpm validate`      | format + lint + typecheck + test — run before pushing |

## Layout

```
src/
├── app/                    App Router: routes, layouts, error boundaries
│   ├── api/health/         Liveness probe for load balancers
│   ├── error.tsx           Route-level error boundary
│   ├── global-error.tsx    Boundary for failures in the root layout
│   ├── robots.ts           Generated robots.txt (blocks non-production)
│   └── sitemap.ts          Generated sitemap.xml
├── components/
│   └── ui/                 Reusable presentational primitives
├── lib/
│   ├── logger.ts           Structured pino logger (server-only)
│   ├── site-config.ts      Branding and SEO constants
│   └── utils.ts            `cn` and small shared helpers
├── env.ts                  Zod-validated environment variables
├── instrumentation.ts      Server startup hook + `onRequestError`
└── proxy.ts                Per-request CSP nonce (was `middleware.ts`)
e2e/                        Playwright specs
```

## What makes this production-grade

**Type safety.** `strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
`noUnusedLocals` and `noUnusedParameters`. `typedRoutes` checks every `<Link href>` at
compile time. `next.config.ts` refuses to build past a type or lint error.

**Environment validation.** `src/env.ts` parses `process.env` through Zod at startup, so a
missing variable fails immediately with a readable message instead of surfacing as
`undefined` mid-request. A Proxy throws if server-only variables are read from client code.

**Security headers.** HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and COOP are static in `next.config.ts`. The Content-Security-Policy is
generated per request in `src/proxy.ts` with a fresh nonce and `strict-dynamic` — an
end-to-end test asserts two requests never share a nonce.

**Testing.** Vitest and Testing Library for units (70% coverage floor, enforced in CI);
Playwright for end-to-end, running against a real production build so headers and caching
behave as they will in production.

**CI.** Format, lint and typecheck run as a parallel matrix; unit tests, build and e2e run
alongside. `ci-passed` aggregates them into one required status check for branch protection.
CodeQL scans weekly. Dependabot batches updates by ecosystem.

**Container.** Multi-stage build on the standalone output, running as a non-root user with a
`HEALTHCHECK` wired to `/api/health`.

## Environment variables

Declare every variable in `src/env.ts`, then document it in `.env.example`. Anything not in
the schema is ignored.

- Server-only variables go in `serverSchema` and never reach the browser.
- Browser-visible variables need the `NEXT_PUBLIC_` prefix and go in `clientSchema`. They are
  inlined into the client bundle at build time — never put a secret there.

## Docker

```bash
docker build -t hackathon .
docker run -p 3000:3000 --env-file .env.local hackathon
# or
docker compose up --build
```

`NEXT_PUBLIC_*` values are baked in at build time, so pass them as `--build-arg` for any
non-localhost deployment.

## Git hooks

Husky runs on `pnpm install`:

- **pre-commit** — lint-staged formats and lints staged files.
- **commit-msg** — commitlint enforces [Conventional Commits](https://www.conventionalcommits.org)
  (`feat:`, `fix:`, `docs:`, …).
- **pre-push** — typecheck and unit tests.

Bypass with `--no-verify` only when you have a specific reason.

## Optional Next.js 16 features

Both are off by default because they change build behaviour; enable deliberately.

- **Cache Components** — set `cacheComponents: true` in `next.config.ts` for `use cache` and
  Partial Prerendering. Data fetching becomes dynamic by default and pages need Suspense
  boundaries around dynamic reads.
- **React Compiler** — `pnpm add -D babel-plugin-react-compiler`, then `reactCompiler: true`.
  Removes most manual `useMemo`/`useCallback` at the cost of slower builds.

## Notes

TypeScript is pinned to 5.9 rather than 7.x: the 7.0 native compiler is released, but the
lint toolchain here has not certified against it yet. Revisit once `typescript-eslint`
declares support.
