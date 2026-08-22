import {
  CpuIcon,
  GraduationCapIcon,
  ScaleIcon,
  TagsIcon,
  TerminalIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Kicker } from '@/components/kicker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ModelRecord } from '@/lib/model-repository';
import {
  FRAMEWORK_LABELS,
  PLATFORM_LABELS,
  PRECISION_LABELS,
  TRAINING_METHOD_LABELS,
  dataSize,
  priceLabel,
  tokenCount,
} from '@/lib/models';

type Row = { label: string; value: ReactNode };

function rowsOf(entries: Array<[string, ReactNode | null | undefined]>): Row[] {
  return entries
    .filter((entry): entry is [string, ReactNode] => {
      const value = entry[1];
      return value !== null && value !== undefined && value !== '';
    })
    .map(([label, value]) => ({ label, value }));
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CpuIcon;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <Kicker>{title}</Kicker>
      </h2>
      {children}
    </section>
  );
}

function Definitions({ rows }: { rows: Row[] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline gap-3">
          <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
          <span
            aria-hidden="true"
            className="min-w-4 flex-1 border-b border-dashed border-border/70"
          />
          <dd className="min-w-0 text-right font-medium break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function BadgeList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="secondary" className="rounded-md font-normal">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function ModelDetailSidebar({ record }: { record: ModelRecord }) {
  const { technical, training, license, pricing, basicInfo, files } = record;

  const technicalRows = rowsOf([
    ['Framework', FRAMEWORK_LABELS[technical.framework]],
    [
      'Architecture',
      <span key="arch" className="font-mono text-[0.8rem]">
        {technical.architecture}
      </span>,
    ],
    ['Parameters', technical.parameters],
    ['Precision', PRECISION_LABELS[technical.precision]],
    ['Context', technical.contextLength ? tokenCount(technical.contextLength) : null],
    ['VRAM', technical.vramRequirement ? dataSize(technical.vramRequirement) : null],
    ['RAM', technical.ramRequirement ? dataSize(technical.ramRequirement) : null],
    ['GPU', technical.gpuRequired ? 'Required' : 'Not required'],
    ['Total size', dataSize(files.totalSize)],
  ]);

  const trainingRows = rowsOf([
    ['Method', TRAINING_METHOD_LABELS[training.trainingMethod]],
    ['Base model', training.baseModel],
    ['Dataset', training.datasetName],
    ['Dataset size', training.datasetSize],
    ['Epochs', training.trainingEpochs],
    ['Learning rate', training.learningRate],
    ['Batch size', training.batchSize],
    ['Hardware', training.trainingHardware],
    ['Duration', training.trainingTime],
    [
      'Source',
      training.datasetSource ? (
        <a
          key="dataset-source"
          href={training.datasetSource}
          className="text-primary underline underline-offset-4 hover:opacity-80"
          rel="noreferrer noopener"
          target="_blank"
        >
          Dataset
        </a>
      ) : null,
    ],
  ]);

  const licenseRows = rowsOf([
    ['Model', license.modelLicense],
    ['Dataset', license.datasetLicense],
    ['Commercial use', license.commercialUse ? 'Allowed' : 'Not allowed'],
    ['Redistribution', license.redistributionAllowed ? 'Allowed' : 'Not allowed'],
    ['Attribution', license.attributionRequired ? 'Required' : 'Not required'],
  ]);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <Section icon={TerminalIcon} title="Inference endpoint">
        <a
          href={basicInfo.endpoint_url}
          rel="noreferrer noopener"
          target="_blank"
          className="block rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[0.75rem] break-all text-foreground transition-colors hover:border-primary/40"
        >
          {basicInfo.endpoint_url}
        </a>
        <Definitions
          rows={rowsOf([
            ['Pricing', priceLabel(pricing)],
            ['Refund', pricing.refundPolicy],
          ])}
        />
      </Section>

      <Separator />

      <Section icon={CpuIcon} title="Technical">
        <Definitions rows={technicalRows} />
        <div className="space-y-2 pt-1">
          <BadgeList items={technical.supportedHardware} />
          <BadgeList
            items={technical.supportedPlatforms.map(
              (platform) => PLATFORM_LABELS[platform],
            )}
          />
        </div>
      </Section>

      <Separator />

      <Section icon={GraduationCapIcon} title="Training">
        <Definitions rows={trainingRows} />
      </Section>

      <Separator />

      <Section icon={ScaleIcon} title="License">
        <Definitions rows={licenseRows} />
        {license.licenseNotes ? (
          <p className="text-sm text-muted-foreground">{license.licenseNotes}</p>
        ) : null}
      </Section>

      <Separator />

      <Section icon={TagsIcon} title="Tags">
        <BadgeList items={basicInfo.tags} />
      </Section>
    </aside>
  );
}
