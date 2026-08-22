'use client';

import { CheckCircle2Icon, CopyIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { purchaseModelAction, type PurchaseReceipt } from '@/app/models/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  BILLING_NOTES,
  CARD_BRAND_LABELS,
  DECLINE_MESSAGES,
  TEST_CARDS,
  cvcLength,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatMoney,
  quoteFor,
} from '@/lib/payments';
import { checkoutSchema } from '@/zod-schema/checkout-schema';
import type { ModelPricing } from '@/zod-schema/upload-model-schema';

type CheckoutFormValues = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  email: string;
  country: string;
  acceptTerms: boolean;
};

type BuyModelDialogProps = {
  modelId: string;
  modelName: string;
  pricing: ModelPricing;
  signedIn: boolean;
  isSeller: boolean;
  owned: boolean;
  buyerName?: string;
  buyerEmail?: string;
};

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={emphasis ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
      <span className={emphasis ? 'font-semibold tabular-nums' : 'tabular-nums'}>
        {value}
      </span>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function BuyModelDialog({
  modelId,
  modelName,
  pricing,
  signedIn,
  isSeller,
  owned,
  buyerName,
  buyerEmail,
}: BuyModelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
  const [declineMessage, setDeclineMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      cardholderName: buyerName ?? '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      email: buyerEmail ?? '',
      country: 'India',
      acceptTerms: false,
    },
  });

  const cardNumber = useWatch({ control, name: 'cardNumber' });

  const quote = quoteFor(pricing);
  if (!quote) return null;

  const brand = detectCardBrand(cardNumber);

  if (isSeller) {
    return (
      <Badge variant="secondary" className="h-8 rounded-md px-3 font-normal">
        Your listing
      </Badge>
    );
  }

  if (owned) {
    return (
      <Button variant="outline" nativeButton={false} render={<Link href="/purchases" />}>
        <CheckCircle2Icon />
        Purchased
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button nativeButton={false} render={<Link href="/login" />}>
        <LockIcon />
        Sign in to buy
      </Button>
    );
  }

  const closeAndReset = () => {
    setOpen(false);
    setDeclineMessage(null);
    setReceipt(null);
    reset();
  };

  const fillTestCard = (number: string) => {
    setValue('cardNumber', formatCardNumber(number));
    setValue('expiry', '12/34');
    setValue('cvc', '123');
    if (!getValues('cardholderName')) {
      setValue('cardholderName', buyerName ?? 'Test Buyer');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setDeclineMessage(null);

    const parsed = checkoutSchema.safeParse({ ...values, modelId });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        if (path && path !== 'modelId') {
          setError(path as keyof CheckoutFormValues, { message: issue.message });
        }
      }
      return;
    }

    try {
      const result = await purchaseModelAction(parsed.data);

      if (result.success) {
        setReceipt(result.receipt);
        toast.success(`Payment complete — you now own ${modelName}`);
        router.refresh();
        return;
      }

      if (result.failure.reason === 'invalid') {
        for (const [path, message] of Object.entries(result.failure.fields)) {
          setError(path as keyof CheckoutFormValues, { message });
        }
        setDeclineMessage(result.message);
        return;
      }

      if (result.failure.reason === 'declined') {
        setDeclineMessage(DECLINE_MESSAGES[result.failure.code]);
        return;
      }

      setDeclineMessage(result.message);

      if (result.failure.reason === 'already-owned') {
        router.refresh();
      }
    } catch {
      setDeclineMessage('The payment could not be completed. Try again.');
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        if (!next) {
          closeAndReset();
          return;
        }
        setOpen(true);
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <LockIcon />
            Buy for {formatMoney(quote.total, quote.currency)}
          </Button>
        }
      />

      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-md">
        {receipt ? (
          <div className="space-y-5">
            <DialogHeader>
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2Icon className="size-5" />
              </span>
              <DialogTitle>Payment complete</DialogTitle>
              <DialogDescription>
                You now have access to{' '}
                <span className="font-mono text-foreground">{receipt.modelId}</span>.
              </DialogDescription>
            </DialogHeader>

            <dl className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
              <SummaryRow
                label="Amount paid"
                value={formatMoney(receipt.amount, receipt.currency)}
                emphasis
              />
              <SummaryRow
                label="Paid with"
                value={`${CARD_BRAND_LABELS[receipt.cardBrand]} •••• ${receipt.cardLast4}`}
              />
              <SummaryRow label="Reference" value={receipt.reference} />
            </dl>

            <div className="space-y-1.5">
              <Label>Licence key</Label>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 font-mono text-[0.8rem]">
                  {receipt.licenseKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy licence key"
                  onClick={async () => {
                    await navigator.clipboard.writeText(receipt.licenseKey);
                    toast.success('Licence key copied');
                  }}
                >
                  <CopyIcon />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Inference endpoint</Label>
              <a
                href={receipt.endpointUrl}
                rel="noreferrer noopener"
                target="_blank"
                className="block rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[0.75rem] break-all transition-colors hover:border-primary/40"
              >
                {receipt.endpointUrl}
              </a>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/purchases" />}
              >
                View purchases
              </Button>
              <Button onClick={closeAndReset}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                <span className="font-mono text-foreground">{modelId}</span> ·{' '}
                {BILLING_NOTES[quote.type]}
              </DialogDescription>
            </DialogHeader>

            <dl className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
              <SummaryRow
                label="Model licence"
                value={formatMoney(quote.subtotal, quote.currency)}
              />
              <SummaryRow
                label="Platform fee"
                value={formatMoney(quote.platformFee, quote.currency)}
              />
              <Separator />
              <SummaryRow
                label={quote.recurring ? 'Due monthly' : 'Total due'}
                value={formatMoney(quote.total, quote.currency)}
                emphasis
              />
            </dl>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cardholderName">Name on card</Label>
                <Input
                  id="cardholderName"
                  autoComplete="cc-name"
                  placeholder="Ada Lovelace"
                  aria-invalid={Boolean(errors.cardholderName)}
                  {...register('cardholderName')}
                />
                <FieldError message={errors.cardholderName?.message} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardNumber">Card number</Label>
                <div className="relative">
                  <Controller
                    control={control}
                    name="cardNumber"
                    render={({ field }) => (
                      <Input
                        id="cardNumber"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        className="pr-24 font-mono"
                        aria-invalid={Boolean(errors.cardNumber)}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(formatCardNumber(event.target.value))
                        }
                      />
                    )}
                  />
                  {brand !== 'card' ? (
                    <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[0.7rem] text-muted-foreground">
                      {CARD_BRAND_LABELS[brand]}
                    </span>
                  ) : null}
                </div>
                <FieldError message={errors.cardNumber?.message} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Controller
                    control={control}
                    name="expiry"
                    render={({ field }) => (
                      <Input
                        id="expiry"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        className="font-mono"
                        aria-invalid={Boolean(errors.expiry)}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(formatExpiry(event.target.value))
                        }
                      />
                    )}
                  />
                  <FieldError message={errors.expiry?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cvc">CVC</Label>
                  <Controller
                    control={control}
                    name="cvc"
                    render={({ field }) => (
                      <Input
                        id="cvc"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder={brand === 'amex' ? '1234' : '123'}
                        className="font-mono"
                        aria-invalid={Boolean(errors.cvc)}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              .replace(/\D/g, '')
                              .slice(0, cvcLength(brand)),
                          )
                        }
                      />
                    )}
                  />
                  <FieldError message={errors.cvc?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Receipt email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    autoComplete="country-name"
                    placeholder="India"
                    aria-invalid={Boolean(errors.country)}
                    {...register('country')}
                  />
                  <FieldError message={errors.country?.message} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="items-start gap-2.5 text-sm font-normal">
                  <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="mt-0.5"
                      />
                    )}
                  />
                  I accept the model licence and understand this purchase is final.
                </Label>
                <FieldError message={errors.acceptTerms?.message} />
              </div>
            </div>

            {declineMessage ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {declineMessage}
              </p>
            ) : null}

            <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheckIcon className="size-3.5" />
                Sandbox mode — no real money moves. Try a test card:
              </p>
              <ul className="space-y-1">
                {TEST_CARDS.map((card) => (
                  <li key={card.number}>
                    <button
                      type="button"
                      onClick={() => fillTestCard(card.number)}
                      className="flex w-full items-baseline justify-between gap-3 rounded-md px-1.5 py-1 text-left text-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="font-mono">{card.number}</span>
                      <span className="text-muted-foreground">{card.outcome}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeAndReset}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Pay {formatMoney(quote.total, quote.currency)}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
