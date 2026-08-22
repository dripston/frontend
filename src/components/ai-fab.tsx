'use client';

import { Bot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThinkingOrb } from 'thinking-orbs';
const HIDDEN_ON = ['/chat', '/login', '/signup'];

export function AiFab() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname?.startsWith(route))) return null;

  return (
    <div className="fixed right-6 bottom-6 z-40">
      <Link href="/chat" aria-label="Open the AI assistant" className="relative">
        <ThinkingOrb state="breathing" size={64} />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Bot size={24} />
        </span>
      </Link>
    </div>
  );
}
