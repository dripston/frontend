import { ExternalLinkIcon, ReceiptIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { BILLING_NOTES, CARD_BRAND_LABELS, formatMoney } from '@/lib/payments';
import { listPurchases } from '@/lib/purchase-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Purchases',
  description: 'Models you have bought and the licences that came with them.',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/login');

  const purchases = await listPurchases(session.user.id);
  const total = purchases.reduce((sum, entry) => sum + entry.amount, 0);
  const currency = purchases[0]?.currency ?? 'USD';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-screen-lg px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground">
            {purchases.length === 0
              ? 'Models you buy appear here with their licence keys.'
              : `${purchases.length} model${purchases.length === 1 ? '' : 's'} · ${formatMoney(total, currency)} spent in sandbox mode.`}
          </p>
        </header>

        {purchases.length === 0 ? (
          <div className="mt-8 grid place-items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <ReceiptIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You have not bought a model yet.
            </p>
            <Button nativeButton={false} render={<Link href="/" />}>
              Browse models
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {purchases.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="min-w-0 font-mono text-[0.95rem] font-medium tracking-tight break-all">
                    <Link
                      href={`/models/${entry.modelId}`}
                      className="transition-colors hover:text-primary"
                    >
                      {entry.modelId}
                    </Link>
                  </h2>
                  <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                    v{entry.modelVersion}
                  </Badge>
                  <span className="ml-auto font-semibold tabular-nums">
                    {formatMoney(entry.amount, entry.currency)}
                  </span>
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                  <span>{entry.modelTask}</span>
                  <span aria-hidden="true">·</span>
                  <span>{BILLING_NOTES[entry.pricingType]}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {CARD_BRAND_LABELS[entry.cardBrand]} •••• {entry.cardLast4}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={entry.createdAt.toISOString()}>
                    {dateFormatter.format(entry.createdAt)}
                  </time>
                </p>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0 space-y-1">
                    <dt className="text-xs text-muted-foreground">Licence key</dt>
                    <dd className="truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[0.75rem]">
                      {entry.licenseKey}
                    </dd>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <dt className="text-xs text-muted-foreground">Endpoint</dt>
                    <dd>
                      <a
                        href={entry.endpointUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[0.75rem] break-all transition-colors hover:border-primary/40"
                      >
                        <ExternalLinkIcon className="size-3.5 shrink-0" />
                        <span className="min-w-0 truncate">{entry.endpointUrl}</span>
                      </a>
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 font-mono text-[0.7rem] text-muted-foreground">
                  {entry.id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
