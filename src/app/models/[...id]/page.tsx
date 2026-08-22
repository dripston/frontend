import {
  BadgeCheckIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileIcon,
  GaugeIcon,
  HeartIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { RichText } from '@/components/chat/rich-text';
import { ModelDetailSidebar } from '@/components/models/model-detail-sidebar';
import { ModelTabs, type ModelTab } from '@/components/models/model-tabs';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { avatarGradient, compactNumber, initials, relativeTime } from '@/lib/format';
import { getModelRecord, organisationOf, type ModelRecord } from '@/lib/model-repository';
import {
  CATEGORY_LABELS,
  FORMAT_LABELS,
  FRAMEWORK_LABELS,
  PRECISION_LABELS,
  dataSize,
  priceLabel,
} from '@/lib/models';

export const dynamic = 'force-dynamic';

async function recordFor(params: PageProps<'/models/[...id]'>['params']) {
  const { id } = await params;
  return getModelRecord(id.join('/'));
}

export async function generateMetadata({
  params,
}: PageProps<'/models/[...id]'>): Promise<Metadata> {
  const record = await recordFor(params);
  if (!record) return { title: 'Model not found' };

  return {
    title: record.id,
    description: record.basicInfo.description.slice(0, 200),
  };
}

function CardTab({ record }: { record: ModelRecord }) {
  const { modelCard } = record;
  const sections: Array<[string, string | undefined]> = [
    ['Overview', modelCard.overview],
    ['Intended use', modelCard.intendedUse],
    ['Limitations', modelCard.limitations],
    ['Safety notes', modelCard.safetyNotes],
    ['Bias notes', modelCard.biasNotes],
    ['Citation', modelCard.citation],
  ];

  return (
    <div className="space-y-8">
      {sections
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([title, body]) => (
          <section key={title} className="space-y-3">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <RichText source={body} className="text-muted-foreground" />
          </section>
        ))}
    </div>
  );
}

function FilesTab({ record }: { record: ModelRecord }) {
  const { files } = record;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {FORMAT_LABELS[files.modelFormat]} · {dataSize(files.totalSize)} total
      </p>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {files.modelFiles.map((file) => (
          <li key={file.path} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[0.8rem]">{file.name}</span>
              <span className="block truncate font-mono text-[0.7rem] text-muted-foreground">
                {file.path}
              </span>
            </span>
            {file.type ? (
              <Badge variant="outline" className="shrink-0 text-[0.65rem] font-normal">
                {file.type}
              </Badge>
            ) : null}
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {dataSize(file.size)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UsageTab({ record }: { record: ModelRecord }) {
  const { usage } = record;
  const facts: Array<[string, string | undefined]> = [
    ['Input format', usage.inputFormat],
    ['Output format', usage.outputFormat],
    ['Python', usage.pythonVersion],
    ['Framework', usage.frameworkVersion],
  ];
  const visibleFacts = facts.filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );

  return (
    <div className="space-y-8">
      {usage.installationInstructions ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">Installation</h2>
          <RichText
            source={usage.installationInstructions}
            className="text-muted-foreground"
          />
        </section>
      ) : null}

      {usage.inferenceExample ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">Inference example</h2>
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted/60 p-4 font-mono text-[0.8rem] leading-relaxed">
            {usage.inferenceExample}
          </pre>
        </section>
      ) : null}

      {visibleFacts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">Interface</h2>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {visibleFacts.map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="min-w-0 font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {usage.dependencies && usage.dependencies.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">Dependencies</h2>
          <ul className="flex flex-wrap gap-1.5">
            {usage.dependencies.map((dependency) => (
              <li key={dependency}>
                <Badge variant="secondary" className="rounded-md font-mono font-normal">
                  {dependency}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BenchmarksTab({ record }: { record: ModelRecord }) {
  const { evaluation } = record;
  const benchmarks = evaluation.benchmarks ?? [];

  return (
    <div className="space-y-6">
      {evaluation.latency || evaluation.throughput ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {evaluation.latency ? (
            <div className="rounded-xl border border-border p-4">
              <dt className="text-xs text-muted-foreground">Latency</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {evaluation.latency.toLocaleString('en-US')} ms
              </dd>
            </div>
          ) : null}
          {evaluation.throughput ? (
            <div className="rounded-xl border border-border p-4">
              <dt className="text-xs text-muted-foreground">Throughput</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {evaluation.throughput.toLocaleString('en-US')} tokens/s
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {benchmarks.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Benchmark
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Dataset
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Metric
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {benchmarks.map((benchmark) => (
                <tr key={`${benchmark.name}-${benchmark.metric}`}>
                  <td className="px-4 py-2.5 font-mono text-[0.8rem]">
                    {benchmark.name}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {benchmark.dataset ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {benchmark.metric}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                    {benchmark.score.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {evaluation.evaluationNotes ? (
        <RichText source={evaluation.evaluationNotes} className="text-muted-foreground" />
      ) : null}
    </div>
  );
}

export default async function ModelPage({ params }: PageProps<'/models/[...id]'>) {
  const record = await recordFor(params);
  if (!record) notFound();

  const org = organisationOf(record.id);
  const [from, to] = avatarGradient(org);
  const updatedAt = record.updatedAt.toISOString();
  const benchmarkCount = record.evaluation.benchmarks?.length ?? 0;
  const hasBenchmarks =
    benchmarkCount > 0 ||
    Boolean(record.evaluation.latency) ||
    Boolean(record.evaluation.throughput) ||
    Boolean(record.evaluation.evaluationNotes);
  const hasUsage = Object.values(record.usage).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  const tags = [
    CATEGORY_LABELS[record.category],
    record.task,
    record.niche,
    FRAMEWORK_LABELS[record.technical.framework],
    FORMAT_LABELS[record.files.modelFormat],
    PRECISION_LABELS[record.technical.precision],
    record.license.modelLicense,
  ];

  const tabs: ModelTab[] = [
    { id: 'card', label: 'Model card', content: <CardTab record={record} /> },
    {
      id: 'files',
      label: 'Files and versions',
      count: record.files.modelFiles.length,
      content: <FilesTab record={record} />,
    },
  ];

  if (hasUsage) {
    tabs.push({ id: 'usage', label: 'Usage', content: <UsageTab record={record} /> });
  }

  if (hasBenchmarks) {
    tabs.push({
      id: 'benchmarks',
      label: 'Benchmarks',
      count: benchmarkCount || undefined,
      content: <BenchmarksTab record={record} />,
    });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Models
        </Link>

        <header className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-md text-[0.65rem] font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
            >
              {initials(org)}
            </span>
            <h1 className="min-w-0 font-mono text-xl font-medium tracking-tight break-all sm:text-2xl">
              <span className="text-muted-foreground">{org}/</span>
              {record.name}
            </h1>
            <Badge
              variant="secondary"
              className="rounded-md font-mono text-[11px] font-medium tracking-wide"
            >
              v{record.version}
            </Badge>
            {record.isVerified ? (
              <Badge
                className="rounded-md bg-primary/10 text-primary"
                variant="secondary"
              >
                <BadgeCheckIcon className="size-3.5" />
                Verified
              </Badge>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="h-8 rounded-md px-3 font-normal">
                {priceLabel(record.pricing)}
              </Badge>
              <Button
                nativeButton={false}
                render={
                  <a
                    href={record.basicInfo.endpoint_url}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <ExternalLinkIcon />
                    Open endpoint
                  </a>
                }
              />
            </div>
          </div>

          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" className="rounded-md font-normal">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>

          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
            <span>Published by {record.ownerName}</span>
            <span aria-hidden="true">·</span>
            <span>
              Updated{' '}
              <time dateTime={updatedAt} suppressHydrationWarning>
                {relativeTime(updatedAt)}
              </time>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <DownloadIcon className="size-3.5" />
              {compactNumber(record.downloads)} downloads
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <HeartIcon className="size-3.5" />
              {compactNumber(record.likes)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <GaugeIcon className="size-3.5" />
              {record.technical.parameters} parameters
            </span>
          </p>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {record.basicInfo.description}
          </p>
        </header>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ModelTabs tabs={tabs} />
          <ModelDetailSidebar record={record} />
        </div>
      </main>
    </>
  );
}
