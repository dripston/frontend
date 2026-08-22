import { ModelExplorer } from '@/components/models/model-explorer';
import { SiteHeader } from '@/components/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { listModels } from '@/lib/model-repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const models = await listModels();

  return (
    <TooltipProvider>
      <SiteHeader />
      <main className="w-full px-4 py-8">
        <ModelExplorer models={models} />
      </main>
    </TooltipProvider>
  );
}
