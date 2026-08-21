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

| Control                                                      | Where                          |
| ------------------------------------------------------------ | ------------------------------ |
| CSP with per-request nonce                                   | `src/proxy.ts`                 |
| HSTS, `nosniff`, `frame-ancestors`, COOP, Permissions-Policy | `next.config.ts`               |
| Environment validation                                       | `src/env.ts`                   |
| Server/client secret isolation                               | `src/env.ts` Proxy guard       |
| Credential redaction in logs                                 | `src/lib/logger.ts`            |
| Static analysis                                              | `.github/workflows/codeql.yml` |
| Dependency updates                                           | `.github/dependabot.yml`       |
| Non-root container                                           | `Dockerfile`                   |

## Expectations for contributors

- Never commit secrets. `.env*` is gitignored except `.env.example`.
- Server-only values must not carry the `NEXT_PUBLIC_` prefix — that prefix inlines them into
  the client bundle.
- Validate and narrow all external input (request bodies, query params, webhooks) with Zod
  before use.
- Adding a third-party script means widening the CSP in `src/proxy.ts`. Do that deliberately,
  and say so in the PR.
