import {
  AudioLinesIcon,
  BinaryIcon,
  BoxIcon,
  DownloadIcon,
  EyeIcon,
  HeartIcon,
  ImageIcon,
  LayersIcon,
  MessageSquareIcon,
  MicIcon,
  TagsIcon,
  ZapIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { avatarGradient, compactNumber, initials, relativeTime } from '@/lib/format';
import { FORMAT_LABELS, priceLabel, type ModelSummary } from '@/lib/models';
import type { ModelCategory } from '@/zod-schema/upload-model-schema';
import { cn } from '@/lib/utils';

export const CATEGORY_ICONS: Record<
  ModelCategory,
  ComponentType<{ className?: string }>
> = {
  llm: MessageSquareIcon,
  multimodal: LayersIcon,
  'computer-vision': EyeIcon,
  'image-generation': ImageIcon,
  audio: AudioLinesIcon,
  speech: MicIcon,
  embedding: BinaryIcon,
  classification: TagsIcon,
  other: BoxIcon,
};

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1 whitespace-nowrap">{children}</span>;
}

export function ModelCard({ model }: { model: ModelSummary }) {
  const CategoryIcon = CATEGORY_ICONS[model.category];
  const [from, to] = avatarGradient(model.org);

  return (
    <Card
      className={cn(
        'group relative h-full gap-0 rounded-xl border-border bg-card p-5 shadow-sm transition-all',
        'text-card-foreground focus-within:border-primary/60 hover:border-primary/40 hover:shadow-md',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center rounded-md text-[0.6rem] font-semibold text-white"
          style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
        >
          {initials(model.org)}
        </span>

        <h3 className="min-w-0 truncate font-mono text-[0.95rem] font-medium tracking-tight">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/models/${model.id}`}
                  className="outline-none before:absolute before:inset-0 before:content-['']"
                >
                  <span className="text-muted-foreground">{model.org}/</span>
                  <span className="transition-colors group-hover:text-primary">
                    {model.name}
                  </span>
                </Link>
              }
            />
            <TooltipContent className="font-mono">{model.id}</TooltipContent>
          </Tooltip>
        </h3>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <Meta>
          <CategoryIcon className="size-3.5 shrink-0" />
          <span className="truncate">{model.task}</span>
        </Meta>

        <span aria-hidden="true">•</span>
        <Meta>
          <BoxIcon className="size-3.5" />
          {model.parameters}
        </Meta>

        <span aria-hidden="true">•</span>
        <Meta>
          <time dateTime={model.updatedAt} suppressHydrationWarning>
            Updated {relativeTime(model.updatedAt)}
          </time>
        </Meta>

        <span aria-hidden="true">•</span>
        <Meta>
          <DownloadIcon className="size-3.5" />
          {compactNumber(model.downloads)}
        </Meta>

        <span aria-hidden="true">•</span>
        <Meta>
          <HeartIcon className="size-3.5" />
          {compactNumber(model.likes)}
        </Meta>

        {model.inference ? (
          <>
            <span aria-hidden="true">•</span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="flex items-center text-primary">
                    <ZapIcon className="size-3.5 fill-current" />
                    <span className="sr-only">Inference endpoint available</span>
                  </span>
                }
              />
              <TooltipContent>Inference endpoint available</TooltipContent>
            </Tooltip>
          </>
        ) : null}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-secondary-foreground"
        >
          {FORMAT_LABELS[model.format]}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-foreground"
        >
          {priceLabel(model.pricing)}
        </Badge>
        {model.base ? (
          <Badge
            variant="outline"
            className="rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-foreground"
          >
            Base
          </Badge>
        ) : null}
      </div>
    </Card>
  );
}
