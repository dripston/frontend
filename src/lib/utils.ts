import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function absoluteUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}
