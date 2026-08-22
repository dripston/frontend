'use client';

import { FileIcon, MessagesSquareIcon } from 'lucide-react';
import { useState } from 'react';

import { RichText } from '@/components/chat/rich-text';
import { Badge } from '@/components/ui/badge';
import type { ModelDetail } from '@/lib/model-detail';
import { cn } from '@/lib/utils';

const TABS = ['Model card', 'Files and versions', 'Community'] as const;
type Tab = (typeof TABS)[number];

export function ModelTabs({ detail }: { detail: ModelDetail }) {
  const [active, setActive] = useState<Tab>('Model card');

  return (
    <div className="space-y-6">
      <div role="tablist" className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              'relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              active === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
            {tab === 'Files and versions' ? (
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {detail.files.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {active === 'Model card' ? <RichText source={detail.card} /> : null}

      {active === 'Files and versions' ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {detail.files.map((file) => (
            <li key={file.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-mono text-[0.8rem]">
                {file.name}
              </span>
              {file.lfs ? (
                <Badge variant="outline" className="text-[0.65rem] font-normal">
                  LFS
                </Badge>
              ) : null}
              <span className="text-muted-foreground tabular-nums">{file.size}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {active === 'Community' ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-sm text-muted-foreground">
          <MessagesSquareIcon className="size-6" />
          No discussions yet.
        </div>
      ) : null}
    </div>
  );
}
