import { ModelExplorer } from '@/components/models/model-explorer';
import { SiteHeader } from '@/components/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { models } from '@/lib/models';

export default function HomePage() {
  return (
    <TooltipProvider>
      <SiteHeader />
      <main className="w-full px-4 py-8">
        <ModelExplorer models={models} />
      </main>
    </TooltipProvider>
  );
}
