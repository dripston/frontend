'use client';

import { ArrowUpDownIcon, BoxIcon, SearchIcon, ZapIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ModelCard } from '@/components/models/model-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import { SORT_OPTIONS, type Model, type SortOption } from '@/lib/models';

const SORTERS: Record<SortOption, (a: Model, b: Model) => number> = {
  trending: (a, b) => b.likes * 1000 + b.downloads - (a.likes * 1000 + a.downloads),
  downloads: (a, b) => b.downloads - a.downloads,
  likes: (a, b) => b.likes - a.likes,
  updated: (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
};

export function ModelExplorer({ models }: { models: Model[] }) {
  const [query, setQuery] = useState('');
  const [baseOnly, setBaseOnly] = useState(false);
  const [inferenceOnly, setInferenceOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('trending');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return models
      .filter((model) => {
        if (baseOnly && !model.base) return false;
        if (inferenceOnly && !model.inference) return false;
        if (!needle) return true;
        return `${model.org}/${model.name}`.toLowerCase().includes(needle);
      })
      .toSorted(SORTERS[sort]);
  }, [models, query, baseOnly, inferenceOnly, sort]);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Trending';

  return (
    <section className="mx-auto w-full max-w-screen-xl scroll-mt-24 border-b border-border pt-2 pb-14">
      <div className="mb-8">
        <div className="mb-2 flex items-end justify-between gap-x-4">
          <div>
            <p className="mb-2 font-mono text-[11px] tracking-[0.15em] text-primary uppercase">
              01 — Explorer
            </p>
            <h1 className="text-2xl text-foreground">Models</h1>
          </div>
          <p className="mb-1 text-sm text-muted-foreground tabular-nums">
            {visible.length.toLocaleString('en-US')}
            {visible.length === models.length
              ? ''
              : ` of ${models.length.toLocaleString('en-US')}`}
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="relative min-w-[14rem] flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name"
            aria-label="Filter by name"
            className="h-10 rounded-lg pl-9"
          />
        </div>

        <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3">
          <span className="text-sm">Base only</span>
          <div className="ml-2">
            <Switch
              id="base-only"
              checked={baseOnly}
              onCheckedChange={(checked) => setBaseOnly(Boolean(checked))}
            />
          </div>
        </div>

        <Toggle
          variant="outline"
          pressed={inferenceOnly}
          onPressedChange={setInferenceOnly}
          aria-label="Inference available"
          className="h-10 rounded-lg border-input bg-background transition-colors data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <ZapIcon className="size-4 fill-current" />
          <span className="text-sm">Inference Available</span>
        </Toggle>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-10 rounded-lg border-input bg-background font-normal text-foreground hover:bg-muted"
              >
                <ArrowUpDownIcon className="mr-1.5 size-4 text-muted-foreground" />
                <span className="text-sm">Sort: {sortLabel}</span>
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="rounded-lg border-border bg-popover shadow-md"
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSort(option.value)}
                className="rounded-md"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-sm text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BoxIcon className="size-5 text-muted-foreground" />
          </div>
          No models match these filters.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((model) => (
            <li key={model.id}>
              <ModelCard model={model} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
