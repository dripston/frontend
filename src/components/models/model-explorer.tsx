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
import { Label } from '@/components/ui/label';
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
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {visible.length.toLocaleString('en-US')}
          {visible.length === models.length
            ? ''
            : ` of ${models.length.toLocaleString('en-US')}`}
        </p>

        <div className="relative min-w-[14rem] flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name"
            aria-label="Filter by name"
            className="h-9 rounded-full pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="base-only"
            checked={baseOnly}
            onCheckedChange={(checked) => setBaseOnly(Boolean(checked))}
          />
          <Label htmlFor="base-only" className="text-sm text-muted-foreground">
            Base only
          </Label>
        </div>

        <Toggle
          variant="outline"
          pressed={inferenceOnly}
          onPressedChange={setInferenceOnly}
          aria-label="Inference available"
          className="rounded-full data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        >
          <ZapIcon className="fill-current" />
          Inference Available
        </Toggle>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="rounded-full">
                <ArrowUpDownIcon />
                Sort: {sortLabel}
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => setSort(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-sm text-muted-foreground">
          <BoxIcon className="size-6" />
          No models match these filters.
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
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
