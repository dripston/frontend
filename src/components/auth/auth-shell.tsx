import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

import { ModeToggle } from '@/components/mode-toggle';
import { siteConfig } from '@/lib/site-config';

export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="absolute h-[600px] w-[600px] animate-[aurora-drift_8s_ease-in-out_infinite_alternate] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <header className="absolute top-0 z-20 mx-auto flex w-full max-w-screen-xl items-center justify-between p-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-7 items-center justify-center rounded-[calc(var(--radius)*0.8)] bg-primary">
            <SparklesIcon className="size-3.5 text-primary-foreground" />
          </div>
          {siteConfig.name}
        </Link>
        <ModeToggle />
      </header>

      <main className="z-10 mt-12 w-full max-w-md animate-rise-in">
        <div className="mb-8 text-center">
          {kicker && (
            <p className="mb-3 font-mono text-[11px] tracking-[0.15em] text-primary uppercase">
              {kicker}
            </p>
          )}
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
      </main>
    </div>
  );
}
