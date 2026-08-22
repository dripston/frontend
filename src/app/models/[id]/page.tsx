import { HeartIcon, RocketIcon, TerminalIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ModelDetailSidebar } from '@/components/models/model-detail-sidebar';
import { ModelTabs } from '@/components/models/model-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { avatarGradient, compactNumber, initials, relativeTime } from '@/lib/format';
import { buildModelDetail } from '@/lib/model-detail';
import { getModel, models } from '@/lib/models';

export const dynamicParams = false;

export function generateStaticParams() {
  return models.map((model) => ({ id: model.id }));
}

export async function generateMetadata({
  params,
}: PageProps<'/models/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const model = getModel(id);
  if (!model) return { title: 'Model not found' };

  return {
    title: `${model.org}/${model.name}`,
    description: `${model.task} model with ${model.params ?? 'unpublished'} parameters.`,
  };
}

export default async function ModelPage({ params }: PageProps<'/models/[id]'>) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const detail = buildModelDetail(model);
  const [from, to] = avatarGradient(model.org);

  const tags = [
    model.task,
    detail.library,
    detail.format,
    detail.architecture,
    `License: ${detail.license}`,
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Models
      </Link>

      <header className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-md text-[0.65rem] font-semibold text-white"
            style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
          >
            {initials(model.org)}
          </span>
          <h1 className="font-mono text-xl font-medium tracking-tight sm:text-2xl">
            <span className="text-muted-foreground">{model.org}/</span>
            {model.name}
          </h1>
          <Badge variant="secondary" className="font-mono text-[0.7rem] font-normal">
            {model.id}
          </Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <HeartIcon className="size-3.5" />
            {compactNumber(model.likes)}
          </span>
          <span className="text-sm text-muted-foreground">
            {compactNumber(detail.followers)} followers
          </span>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm">
              <TerminalIcon />
              Use this model
            </Button>
            <Button size="sm">
              <RocketIcon />
              Deploy
            </Button>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline" className="font-normal">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          Updated{' '}
          <time dateTime={model.updatedAt} suppressHydrationWarning>
            {relativeTime(model.updatedAt)}
          </time>{' '}
          · {compactNumber(model.downloads)} downloads
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ModelTabs detail={detail} />
        <ModelDetailSidebar model={model} detail={detail} />
      </div>
    </main>
  );
}
