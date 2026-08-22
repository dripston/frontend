# Security policy

## Reporting a vulnerability

Do not open a public issue. Report privately through
[GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability),
or email the maintainers.

Please include reproduction steps, affected versions, and impact. Expect an acknowledgement
within 3 business days and an assessment within 10.

## Supported versions

Only the latest release on `main` receives security fixes.

## Built-in protections

| Control                                                      | Where                    |
| ------------------------------------------------------------ | ------------------------ |
| Content-Security-Policy                                      | `next.config.ts`         |
| HSTS, `nosniff`, `frame-ancestors`, COOP, Permissions-Policy | `next.config.ts`         |
| Environment validation                                       | `src/env.ts`             |
| Server/client secret isolation                               | `src/env.ts` Proxy guard |
| Credential redaction in logs                                 | `src/lib/logger.ts`      |
| Dependency updates                                           | `.github/dependabot.yml` |

## Expectations for contributors

- Never commit secrets. `.env*` is gitignored except `.env.example`.
- Server-only values must not carry the `NEXT_PUBLIC_` prefix — that prefix inlines them into
  the client bundle.
- Validate and narrow all external input (request bodies, query params, webhooks) with Zod
  before use.
- Adding a third-party script means widening the CSP in `next.config.ts`. Do that
  deliberately, and say so in the PR.

## CSP: why there is no nonce

`script-src` allows `'unsafe-inline'`. That is a deliberate trade, not an oversight.

A nonce must be unique per response, so it only works on dynamically rendered pages — a
prerendered page's HTML is generated once at build time and reused. Adopting a nonce-based
policy therefore means marking every hydrating route `force-dynamic` and giving up static
prerendering. On top of that, Next.js 16.3.2 does not propagate a proxy's modified request
headers to the renderer under `output: 'standalone'`, so the nonce silently fails to reach
the script tags and `'strict-dynamic'` blocks hydration outright.

The policy still blocks the highest-value attacks: scripts from foreign origins, framing,
`<base>` injection and cross-origin form posts. The residual risk is injected inline script,
which React's escaping already covers for anything rendered through JSX.

To adopt a strict nonce policy instead: drop `output: 'standalone'`, serve with `next start`,
add `export const dynamic = 'force-dynamic'` to every hydrating route, and generate the CSP
per request in `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`), setting the
header on **both** the request and the response so Next can read the nonce back.
