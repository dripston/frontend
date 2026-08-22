import type { Metadata } from 'next';

import { SiteHeader } from '@/components/site-header';
import { ArenaArena } from '@/components/arena/arena-arena';

export const metadata: Metadata = {
  title: 'Arena',
  description:
    'Pit AI models against each other and see which performs best for your use case.',
};

export default function ArenaPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-screen-lg px-4 py-8">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] tracking-[0.15em] text-primary uppercase">
            02 — Arena
          </p>
          <h1 className="text-2xl text-foreground">Model Arena</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your use case and watch models battle it out.
          </p>
        </div>
        <ArenaArena />
      </main>
    </>
  );
}
