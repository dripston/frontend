import { ModelExplorer } from '@/components/models/model-explorer';
import { SiteHeader } from '@/components/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { models } from '@/lib/models';

export default function HomePage() {
  return (
    <TooltipProvider>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <ModelExplorer models={models} />
      </main>
    </TooltipProvider>
  );
}
