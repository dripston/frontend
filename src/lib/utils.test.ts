import { describe, expect, it } from 'vitest';

import { absoluteUrl, cn, formatCurrency } from './utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('resolves conflicting Tailwind utilities in favour of the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm text-red-500', 'text-lg')).toBe('text-red-500 text-lg');
  });

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('honours an explicit currency and locale', () => {
    expect(formatCurrency(1234.5, 'EUR', 'de-DE').replace(/ /g, ' ')).toBe('1.234,50 €');
  });
});

describe('absoluteUrl', () => {
  it('resolves a path against the base URL', () => {
    expect(absoluteUrl('/about', 'https://example.com')).toBe(
      'https://example.com/about',
    );
  });

  it('leaves an already-absolute URL untouched', () => {
    expect(absoluteUrl('https://other.test/x', 'https://example.com')).toBe(
      'https://other.test/x',
    );
  });
});
