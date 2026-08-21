import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

const features = [
  [
    'Strict TypeScript',
    'strict mode plus noUncheckedIndexedAccess and unused-symbol checks',
  ],
  [
    'Validated env',
    'Zod-parsed at startup; server secrets cannot be read from the client',
  ],
  ['Hardened headers', 'HSTS, nosniff, frame-ancestors and a per-request CSP nonce'],
  ['Tested', 'Vitest with Testing Library for units, Playwright for end-to-end'],
  ['CI that gates', 'format, lint, typecheck, test, build and e2e on every push'],
  [
    'Container-ready',
    'multi-stage Docker build on the standalone output, running as non-root',
  ],
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-prose text-lg text-pretty text-muted-foreground">
          {siteConfig.description}
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {features.map(([title, detail]) => (
          <li key={title} className="rounded-lg border border-border p-4">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Button type="button">Get started</Button>

        <a
          href="/api/health"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Health check
        </a>
      </div>
    </main>
  );
}
