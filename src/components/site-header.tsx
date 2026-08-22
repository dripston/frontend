import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';

import { UserMenu } from '@/components/auth/user-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { siteConfig } from '@/lib/site-config';

const NAV = [
  { href: '/', label: 'Models' },
  { href: '/chat', label: 'Assistant' },
  { href: '/design-system', label: 'Design system' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <SparklesIcon className="size-4 text-primary" />
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
