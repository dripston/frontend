import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

import { UserMenu } from '@/components/auth/user-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { siteConfig } from '@/lib/site-config';

const NAV = [
  { href: '/', label: 'Models' },
  { href: '/chat', label: 'Assistant' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-16 items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <SparklesIcon className="size-4 text-primary" />
          </div>
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
