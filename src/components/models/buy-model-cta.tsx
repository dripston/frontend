import { CheckCircle2Icon, LockIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMoney, quoteFor } from '@/lib/payments';
import type { ModelPricing } from '@/zod-schema/upload-model-schema';

type BuyModelCtaProps = {
  modelId: string;
  pricing: ModelPricing;
  signedIn: boolean;
  isSeller: boolean;
  purchaseId: string | null;
};

export function BuyModelCta({
  modelId,
  pricing,
  signedIn,
  isSeller,
  purchaseId,
}: BuyModelCtaProps) {
  if (isSeller) {
    return (
      <Badge variant="secondary" className="h-8 rounded-md px-3 font-normal">
        Your listing
      </Badge>
    );
  }

  const quote = quoteFor(pricing);
  if (!quote) return null;

  if (purchaseId) {
    return (
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/purchases/${purchaseId}`} />}
      >
        <CheckCircle2Icon />
        View receipt
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button
        nativeButton={false}
        render={<Link href={`/login?redirect=/checkout/${modelId}`} />}
      >
        Sign in to rent
      </Button>
    );
  }

  return (
    <Button nativeButton={false} render={<Link href={`/checkout/${modelId}`} />}>
      <LockIcon />
      Rent for {formatMoney(quote.total, quote.currency)} / hr
    </Button>
  );
}
