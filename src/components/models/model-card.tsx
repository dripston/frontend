import {
  AudioLinesIcon,
  BoxIcon,
  DownloadIcon,
  FileTextIcon,
  HeartIcon,
  ImageIcon,
  VideoIcon,
  ZapIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { avatarGradient, compactNumber, initials, relativeTime } from '@/lib/format';
import type { Model, ModelTask } from '@/lib/models';
import { cn } from '@/lib/utils';

const TASK_ICONS: Record<ModelTask, ComponentType<{ className?: string }>> = {
  'Text Generation': FileTextIcon,
  'Image-Text-to-Text': ImageIcon,
  'Text-to-Audio': AudioLinesIcon,
  'Image-to-Video': VideoIcon,
  'Image-Text-to-Video': VideoIcon,
};

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1 whitespace-nowrap">{children}</span>;
}

export function ModelCard({ model }: { model: Model }) {
  const TaskIcon = TASK_ICONS[model.task];
  const [from, to] = avatarGradient(model.org);
  const fullName = `${model.org}/${model.name}`;

  return (
    <Card
      className={cn(
        'group relative gap-0 rounded-xl p-4 shadow-2xs transition-all',
        'focus-within:border-primary/60 hover:border-primary/40 hover:shadow-sm',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center rounded-md text-[0.6rem] font-semibold text-white"
          style={{
            backgroundImage: `linear-gradient(140deg, ${from}, ${to})`,
          }}
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
            <TooltipContent className="font-mono">{fullName}</TooltipContent>
          </Tooltip>
        </h3>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <Meta>
          <TaskIcon className="size-3.5" />
          {model.task}
        </Meta>

        {model.params ? (
          <>
            <span aria-hidden="true">•</span>
            <Meta>
              <BoxIcon className="size-3.5" />
              {model.params}
            </Meta>
          </>
        ) : null}

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

        {model.inference ? (
          <>
            <span aria-hidden="true">•</span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="flex items-center text-primary">
                    <ZapIcon className="size-3.5 fill-current" />
                    <span className="sr-only">Inference available</span>
                  </span>
                }
              />
              <TooltipContent>Inference available</TooltipContent>
            </Tooltip>
          </>
        ) : null}

        <span aria-hidden="true">•</span>
        <Meta>
          <HeartIcon className="size-3.5" />
          {compactNumber(model.likes)}
        </Meta>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-md font-mono text-[11px] font-medium tracking-wide"
        >
          {model.id}
        </Badge>
        {model.base ? (
          <Badge
            variant="outline"
            className="rounded-md font-mono text-[11px] font-medium tracking-wide"
          >
            Base
          </Badge>
        ) : null}
      </div>
    </Card>
  );
}
