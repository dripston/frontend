'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { model, purchase } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import {
  authorizeCard,
  detectCardBrand,
  digitsOf,
  newLicenseKey,
  paymentReference,
  quoteFor,
  type CardBrand,
  type Currency,
  type DeclineCode,
  type PricingType,
} from '@/lib/payments';
import { checkoutSchema, type CheckoutInput } from '@/zod-schema/checkout-schema';

export type PurchaseReceipt = {
  reference: string;
  licenseKey: string;
  modelId: string;
  modelName: string;
  pricingType: PricingType;
  subtotal: number;
  platformFee: number;
  amount: number;
  currency: Currency;
  cardBrand: CardBrand;
  cardLast4: string;
  purchasedAt: string;
  endpointUrl: string;
};

export type PurchaseFailure =
  | { reason: 'unauthorized' }
  | { reason: 'not-found' }
  | { reason: 'invalid'; fields: Record<string, string> }
  | { reason: 'free' }
  | { reason: 'own-model' }
  | { reason: 'already-owned' }
  | { reason: 'declined'; code: DeclineCode }
  | { reason: 'error' };

export type PurchaseResult =
  | { success: true; receipt: PurchaseReceipt }
  | { success: false; failure: PurchaseFailure; message: string };

const PROCESSOR_LATENCY_MS = 1400;

const FAILURE_MESSAGES: Record<PurchaseFailure['reason'], string> = {
  unauthorized: 'Sign in to buy this model.',
  'not-found': 'That model is no longer available.',
  invalid: 'Check the highlighted payment details.',
  free: 'This model is free — no payment needed.',
  'own-model': 'You cannot buy a model you published.',
  'already-owned': 'You already own this model.',
  declined: 'Your card was declined.',
  error: 'Something went wrong while processing the payment.',
};

function fail(failure: PurchaseFailure, message?: string): PurchaseResult {
  return {
    success: false,
    failure,
    message: message ?? FAILURE_MESSAGES[failure.reason],
  };
}

function fieldErrorsOf(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const fields: Record<string, string> = {};

  for (const issue of issues) {
    const key = issue.path.join('.');
    if (key && !fields[key]) fields[key] = issue.message;
  }

  return fields;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}

export async function purchaseModelAction(input: CheckoutInput): Promise<PurchaseResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) return fail({ reason: 'unauthorized' });

  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return fail({ reason: 'invalid', fields: fieldErrorsOf(parsed.error.issues) });
  }

  const [record] = await db
    .select()
    .from(model)
    .where(eq(model.id, parsed.data.modelId))
    .limit(1);

  if (!record) return fail({ reason: 'not-found' });
  if (record.userId === session.user.id) return fail({ reason: 'own-model' });

  const quote = quoteFor(record.pricing);
  if (!quote) return fail({ reason: 'free' });

  const [owned] = await db
    .select({ id: purchase.id })
    .from(purchase)
    .where(and(eq(purchase.userId, session.user.id), eq(purchase.modelId, record.id)))
    .limit(1);

  if (owned) return fail({ reason: 'already-owned' });

  await new Promise((resolve) => setTimeout(resolve, PROCESSOR_LATENCY_MS));

  const cardDigits = digitsOf(parsed.data.cardNumber);
  const authorization = authorizeCard(cardDigits);

  if (!authorization.approved) {
    logger.info(
      { modelId: record.id, code: authorization.code },
      'Simulated payment declined',
    );
    return fail({ reason: 'declined', code: authorization.code });
  }

  const reference = paymentReference();
  const licenseKey = newLicenseKey();
  const cardBrand = detectCardBrand(cardDigits);
  const cardLast4 = cardDigits.slice(-4);
  const purchasedAt = new Date();

  try {
    await db.insert(purchase).values({
      id: reference,
      userId: session.user.id,
      modelId: record.id,
      status: 'paid',
      pricingType: quote.type,
      subtotal: quote.subtotal,
      platformFee: quote.platformFee,
      amount: quote.total,
      currency: quote.currency,
      cardBrand,
      cardLast4,
      licenseKey,
      createdAt: purchasedAt,
      updatedAt: purchasedAt,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail({ reason: 'already-owned' });

    logger.error({ error, modelId: record.id }, 'Failed to record purchase');
    return fail({ reason: 'error' });
  }

  try {
    await db
      .update(model)
      .set({ downloads: sql`${model.downloads} + 1` })
      .where(eq(model.id, record.id));
  } catch (error) {
    logger.error({ error, modelId: record.id }, 'Failed to increment download count');
  }

  revalidatePath('/');
  revalidatePath('/purchases');
  revalidatePath(`/models/${record.id}`);

  return {
    success: true,
    receipt: {
      reference,
      licenseKey,
      modelId: record.id,
      modelName: record.name,
      pricingType: quote.type,
      subtotal: quote.subtotal,
      platformFee: quote.platformFee,
      amount: quote.total,
      currency: quote.currency,
      cardBrand,
      cardLast4,
      purchasedAt: purchasedAt.toISOString(),
      endpointUrl: record.endpointUrl,
    },
  };
}
