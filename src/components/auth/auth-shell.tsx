import { CheckIcon, SparklesIcon } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from '@/lib/site-config';

const HIGHLIGHTS = [
  'Browse every model with filters that actually filter',
  'Inspect weights, files and eval scores in one place',
  'Ask the assistant anything about a repository',
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="gradient-ring grid size-7 place-items-center rounded-full">
              <span className="grid size-full place-items-center rounded-full bg-background">
                <SparklesIcon className="size-3.5 text-primary" />
              </span>
            </span>
            {siteConfig.name}
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-card lg:flex lg:flex-col lg:justify-center lg:px-14">
        <span
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-96 rounded-full bg-gradient-to-br from-primary/25 to-transparent blur-3xl"
          style={{ animation: 'aurora-drift 9s ease-in-out infinite' }}
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 size-96 rounded-full bg-gradient-to-tr from-chart-4/40 to-transparent blur-3xl"
          style={{ animation: 'aurora-drift 11s ease-in-out infinite reverse' }}
        />

        <span
          aria-hidden="true"
          className="absolute top-1/3 -right-10 size-72 rounded-full bg-gradient-to-bl from-chart-2/25 to-transparent blur-3xl"
          style={{ animation: 'aurora-drift 13s ease-in-out infinite' }}
        />

        <div className="relative max-w-md">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Model registry
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-balance">
            Everything about a model, on one page.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <CheckIcon className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
