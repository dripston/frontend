'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ModelTab = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

export function ModelTabs({ tabs }: { tabs: ModelTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="min-w-0 space-y-6">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={current?.id === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              'relative -mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              current?.id === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.count === undefined ? null : (
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
        >
          {current.content}
        </div>
      ) : null}
    </div>
  );
}
