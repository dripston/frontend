import { BoxIcon, ChartNoAxesColumnIcon, LayersIcon, ShapesIcon } from 'lucide-react';

import { Kicker } from '@/components/kicker';
import { Sparkline } from '@/components/models/sparkline';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ModelDetail } from '@/lib/model-detail';
import type { Model } from '@/lib/models';

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BoxIcon;
  title: React.ReactNode;
  children: React.ReactNode;
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

export function ModelDetailSidebar({
  model,
  detail,
}: {
  model: Model;
  detail: ModelDetail;
}) {
  const tree = [
    ['Adapters', detail.tree.adapters],
    ['Finetunes', detail.tree.finetunes],
    ['Merges', detail.tree.merges],
    ['Quantizations', detail.tree.quantizations],
  ] as const;

  return (
    <aside className="space-y-6">
      <section className="space-y-2">
        <Kicker>Downloads last month</Kicker>
        <div className="flex items-end justify-between gap-4">
          <p className="text-2xl font-semibold tabular-nums">
            {model.downloads.toLocaleString('en-US')}
          </p>
          <Sparkline points={detail.downloadTrend} className="h-10 w-32" />
        </div>
      </section>

      <Separator />

      <Section icon={LayersIcon} title={detail.format}>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-normal">
            Model size
            <span className="ml-1 font-medium text-foreground">
              {model.params ?? 'n/a'} params
            </span>
          </Badge>
          <Badge variant="outline" className="font-normal">
            Tensor type
            <span className="ml-1 font-medium text-foreground">{detail.tensorType}</span>
          </Badge>
          <Badge variant="outline" className="font-normal">
            Context
            <span className="ml-1 font-medium text-foreground">
              {detail.contextLength}
            </span>
          </Badge>
        </div>
      </Section>

      <Separator />

      <Section icon={ShapesIcon} title="Model tree">
        <ul className="space-y-2 text-sm">
          {tree.map(([label, count]) => (
            <li key={label} className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">{label}</span>
              <span className="flex-1 border-b border-dashed border-border/70" />
              <span className="font-medium text-primary tabular-nums">
                {count.toLocaleString('en-US')} models
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Separator />

      <Section icon={BoxIcon} title="Spaces using this model">
        <ul className="flex flex-wrap gap-2">
          {detail.spaces.map((space) => (
            <li key={space}>
              <Badge
                variant="secondary"
                className="max-w-full truncate rounded-md font-mono text-[11px] font-medium tracking-wide"
              >
                {space}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Separator />

      <Section icon={ChartNoAxesColumnIcon} title="Evaluation results">
        <ul className="space-y-2 text-sm">
          {detail.evals.map((entry) => (
            <li key={entry.suite} className="flex items-baseline gap-3">
              <span className="min-w-0 truncate">
                <span className="font-mono text-[0.8rem]">{entry.suite}</span>
                {entry.dataset ? (
                  <span className="text-muted-foreground"> · {entry.dataset}</span>
                ) : null}
              </span>
              <span className="flex-1 border-b border-dashed border-border/70" />
              <span className="font-medium tabular-nums">{entry.score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </aside>
  );
}
