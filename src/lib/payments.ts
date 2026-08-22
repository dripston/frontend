import type { ModelPricing } from '../zod-schema/upload-model-schema';

export type Currency = ModelPricing['currency'];
export type PricingType = ModelPricing['type'];

export const PURCHASE_STATUSES = ['paid', 'refunded'] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const CARD_BRANDS = [
  'visa',
  'mastercard',
  'amex',
  'discover',
  'rupay',
  'card',
] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  rupay: 'RuPay',
  card: 'Card',
};

export function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(value: string): CardBrand {
  const digits = digitsOf(value);
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  if (/^(60|81|82)/.test(digits)) return 'rupay';
  return 'card';
}

export function cardMaxDigits(brand: CardBrand): number {
  return brand === 'amex' ? 15 : 19;
}

export function cvcLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3;
}

export function luhnValid(value: string): boolean {
  const digits = digitsOf(value);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let double = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits.charCodeAt(index) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  const brand = detectCardBrand(value);
  const digits = digitsOf(value).slice(0, cardMaxDigits(brand));
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4, 3];

  const parts: string[] = [];
  let cursor = 0;

  for (const size of groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }

  return parts.join(' ');
}

export function formatExpiry(value: string): string {
  const digits = digitsOf(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function expiryIsFuture(value: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  return new Date(year, month, 1).getTime() > now.getTime();
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function formatMoney(minorUnits: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    minorUnits / 100,
  );
}

export const PLATFORM_FEE_RATE = 0.029;
export const PLATFORM_FEE_FIXED = 30;

export type PaymentQuote = {
  type: PricingType;
  currency: Currency;
  subtotal: number;
  platformFee: number;
  total: number;
  recurring: boolean;
};

export function isPayable(pricing: ModelPricing): boolean {
  return (
    pricing.type !== 'free' && typeof pricing.price === 'number' && pricing.price > 0
  );
}

export function quoteFor(pricing: ModelPricing): PaymentQuote | null {
  if (!isPayable(pricing) || pricing.price === undefined) return null;

  const subtotal = toMinorUnits(pricing.price);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE) + PLATFORM_FEE_FIXED;

  return {
    type: pricing.type,
    currency: pricing.currency,
    subtotal,
    platformFee,
    total: subtotal + platformFee,
    recurring: pricing.type === 'subscription',
  };
}

export const BILLING_NOTES: Record<PricingType, string> = {
  free: 'No charge',
  'hourly': 'Hourly payment, billed per hour of usage',
  subscription: 'Billed monthly until cancelled',
  'usage-based': 'Prepaid usage credit',
};

export type DeclineCode =
  'card_declined' | 'insufficient_funds' | 'expired_card' | 'processing_error';

export const DECLINE_MESSAGES: Record<DeclineCode, string> = {
  card_declined: 'Your card was declined. Try a different card.',
  insufficient_funds: 'That card has insufficient funds for this purchase.',
  expired_card: 'That card has expired. Use a different card.',
  processing_error: 'The payment processor is unavailable. Try again in a moment.',
};

const SIMULATED_DECLINES: Record<string, DeclineCode> = {
  '4000000000000002': 'card_declined',
  '4000000000009995': 'insufficient_funds',
  '4000000000000069': 'expired_card',
  '4000000000000119': 'processing_error',
};

export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', outcome: 'Payment succeeds' },
  { number: '4000 0000 0000 0002', outcome: 'Card declined' },
  { number: '4000 0000 0000 9995', outcome: 'Insufficient funds' },
  { number: '4000 0000 0000 0119', outcome: 'Processor error' },
] as const;

export type Authorization = { approved: true } | { approved: false; code: DeclineCode };

export function authorizeCard(cardNumber: string): Authorization {
  const digits = digitsOf(cardNumber);

  const decline = SIMULATED_DECLINES[digits];
  if (decline) return { approved: false, code: decline };

  if (!luhnValid(digits)) return { approved: false, code: 'card_declined' };

  return { approved: true };
}

const TOKEN_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let out = '';
  for (const byte of bytes) {
    out += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
  }
  return out;
}

export function paymentReference(): string {
  return `pay_${randomChars(20).toLowerCase()}`;
}

export function newLicenseKey(): string {
  return `AIRO-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`;
}
