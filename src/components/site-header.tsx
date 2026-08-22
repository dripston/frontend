import Link from 'next/link';
import { Cog } from 'lucide-react';

import { UserMenu } from '@/components/auth/user-menu';
import { ModeToggle } from '@/components/mode-toggle';
const NAV = [
  { href: '/', label: 'Models' },
  { href: '/arena', label: 'Arena' },
  { href: '/chat', label: 'Assistant' },
  { href: '/purchases', label: 'Purchases' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-[calc(var(--radius)*0.8)] bg-primary">
            <Cog className="size-6 text-primary-foreground" />
          </div>
          Verifi
        </Link>

        <nav className="ml-2 hidden items-center gap-5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-[21px] left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
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
