'use client';

import { ArrowUpDownIcon, BoxIcon, LayersIcon, SearchIcon, ZapIcon } from 'lucide-react';
import Link from 'next/link';
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
import {
  CATEGORY_LABELS,
  SORT_OPTIONS,
  type ModelSummary,
  type SortOption,
} from '@/lib/models';
import type { ModelCategory } from '@/zod-schema/upload-model-schema';

const SORTERS: Record<SortOption, (a: ModelSummary, b: ModelSummary) => number> = {
  updated: (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  downloads: (a, b) => b.downloads - a.downloads,
  likes: (a, b) => b.likes - a.likes,
  name: (a, b) => a.id.localeCompare(b.id),
};

type CategoryFilter = ModelCategory | 'all';

export function ModelExplorer({ models }: { models: ModelSummary[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [baseOnly, setBaseOnly] = useState(false);
  const [inferenceOnly, setInferenceOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('updated');

  const categories = useMemo(() => {
    const counts = new Map<ModelCategory, number>();
    for (const model of models) {
      counts.set(model.category, (counts.get(model.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [models]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return models
      .filter((model) => {
        if (category !== 'all' && model.category !== category) return false;
        if (baseOnly && !model.base) return false;
        if (inferenceOnly && !model.inference) return false;
        if (!needle) return true;
        return (
          model.id.toLowerCase().includes(needle) ||
          model.task.toLowerCase().includes(needle) ||
          model.niche.toLowerCase().includes(needle)
        );
      })
      .toSorted(SORTERS[sort]);
  }, [models, query, category, baseOnly, inferenceOnly, sort]);

  const filtered = visible.length !== models.length;
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Recently updated';
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_LABELS[category];

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setBaseOnly(false);
    setInferenceOnly(false);
  };

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
            {filtered ? ` of ${models.length.toLocaleString('en-US')}` : ''}
          </p>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <LayersIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No models published yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Every model a seller uploads appears here with its technical profile,
              licence and pricing.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/seller-upload-model">Upload a model</Link>}
          />
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="relative min-w-[14rem] flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by name, task or niche"
                aria-label="Filter by name, task or niche"
                className="h-10 rounded-lg pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg border-input bg-background font-normal text-foreground hover:bg-muted"
                  >
                    <LayersIcon className="mr-1.5 size-4 text-muted-foreground" />
                    <span className="text-sm">{categoryLabel}</span>
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="rounded-lg border-border bg-popover shadow-md"
              >
                <DropdownMenuItem
                  onClick={() => setCategory('all')}
                  className="rounded-md"
                >
                  All categories
                </DropdownMenuItem>
                {categories.map(([value, count]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => setCategory(value)}
                    className="rounded-md"
                  >
                    {CATEGORY_LABELS[value]}
                    <span className="ml-auto pl-4 text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3">
              <label htmlFor="base-only" className="text-sm">
                Base only
              </label>
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
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <BoxIcon className="size-5 text-muted-foreground" />
              </div>
              No models match these filters.
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
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
        </>
      )}
    </section>
  );
}
