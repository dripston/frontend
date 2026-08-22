import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

import { Kicker } from '@/components/kicker';
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
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <SparklesIcon className="size-4 text-primary" />
            {siteConfig.name}
          </Link>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xs sm:p-8">
            <Kicker className="mb-2">{kicker}</Kicker>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  );
}
