'use client';

import { ShieldCheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { purchaseModelAction } from '@/app/models/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CARD_BRAND_LABELS,
  DECLINE_MESSAGES,
  TEST_CARDS,
  cvcLength,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatMoney,
  type PaymentQuote,
} from '@/lib/payments';
import { checkoutSchema } from '@/zod-schema/checkout-schema';

type CheckoutFormValues = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  email: string;
  country: string;
  acceptTerms: boolean;
};

type CheckoutFormProps = {
  modelId: string;
  modelName: string;
  quote: PaymentQuote;
  buyerName?: string;
  buyerEmail?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

export function CheckoutForm({
  modelId,
  modelName,
  quote,
  buyerName,
  buyerEmail,
}: CheckoutFormProps) {
  const router = useRouter();
  const [declineMessage, setDeclineMessage] = useState<string | null>(null);

  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      cardholderName: buyerName ?? '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      email: buyerEmail ?? '',
      country: '',
      acceptTerms: false,
    },
  });

  const cardNumber = useWatch({ control, name: 'cardNumber' });
  const brand = detectCardBrand(cardNumber);

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
        toast.success(`Payment complete — your hourly rental of ${modelName} is active`);
        router.replace(`/purchases/${result.receipt.reference}`);
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
        router.replace('/purchases');
      }
    } catch {
      setDeclineMessage('The payment could not be completed. Try again.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-tight">Billing contact</h2>

        <div className="grid gap-4 sm:grid-cols-2">
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
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-tight">Card details</h2>

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

        <div className="grid grid-cols-2 gap-4">
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
                  onChange={(event) => field.onChange(formatExpiry(event.target.value))}
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
                      event.target.value.replace(/\D/g, '').slice(0, cvcLength(brand)),
                    )
                  }
                />
              )}
            />
            <FieldError message={errors.cvc?.message} />
          </div>
        </div>
      </section>

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

      {declineMessage ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {declineMessage}
        </p>
      ) : null}

      <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
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

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        Pay {formatMoney(quote.total, quote.currency)}
      </Button>
    </form>
  );
}
