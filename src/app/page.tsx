import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/lib/site-config';

const features = [
  {
    title: 'Strict TypeScript',
    detail: 'strict mode plus noUncheckedIndexedAccess and unused-symbol checks',
  },
  {
    title: 'Validated env',
    detail: 'Zod-parsed at startup; server secrets cannot be read from the client',
  },
  {
    title: 'Hardened headers',
    detail: 'HSTS, nosniff, frame-ancestors and a per-request CSP nonce',
  },
  {
    title: 'shadcn/ui',
    detail: 'Base UI primitives, owned in-repo and themed with CSS variables',
  },
  {
    title: 'Tested',
    detail: 'Vitest with Testing Library for units, Playwright for end-to-end',
  },
  {
    title: 'Container-ready',
    detail: 'multi-stage Docker build on the standalone output, running as non-root',
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge variant="secondary">Next.js 16</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="max-w-prose text-lg text-pretty text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        <ModeToggle />
      </div>

      <Separator />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, detail }) => (
          <li key={title}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{detail}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>

      <Card>
        <CardHeader>
          <CardTitle>Verify the setup</CardTitle>
          <CardDescription>
            Run `pnpm run validate` for the full gate, or hit the liveness probe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button render={<a href="/api/health" />}>Health check</Button>
          <Button variant="outline" render={<a href={siteConfig.links.github} />}>
            Source
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
