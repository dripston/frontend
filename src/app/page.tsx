import { ModeToggle } from '@/components/mode-toggle';
import { ModelExplorer } from '@/components/models/model-explorer';
import { TooltipProvider } from '@/components/ui/tooltip';
import { models } from '@/lib/models';
import { siteConfig } from '@/lib/site-config';

export default function HomePage() {
  return (
    <TooltipProvider>
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <span className="text-sm font-medium tracking-tight text-muted-foreground">
            {siteConfig.name}
          </span>
          <ModeToggle />
        </div>
        <ModelExplorer models={models} />
      </main>
    </TooltipProvider>
  );
}
