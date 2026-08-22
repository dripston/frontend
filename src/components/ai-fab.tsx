'use client';

import { SparklesIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDDEN_ON = ['/chat', '/login', '/signup'];

export function AiFab() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname?.startsWith(route))) return null;

  return (
    <div className="fixed right-5 bottom-5 z-40">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 blur-lg"
        style={{ animation: 'fab-halo 3.2s ease-in-out infinite' }}
      />
      <Link
        href="/chat"
        aria-label="Open the AI assistant"
        className="gradient-ring relative grid size-14 place-items-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
      >
        <span className="grid size-full place-items-center rounded-full bg-card">
          <SparklesIcon className="size-5 text-primary" />
        </span>
      </Link>
    </div>
  );
}
