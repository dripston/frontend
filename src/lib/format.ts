const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export function compactNumber(value: number): string {
  return compactFormatter
    .format(value)
    .replace(/([KMBT])$/, (unit) => unit.toLowerCase());
}

const DIVISIONS = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 30, unit: 'day' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
] as const satisfies ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }>;

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'always' });

export function relativeTime(iso: string, now: Date = new Date()): string {
  let duration = (new Date(iso).getTime() - now.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return relativeFormatter.format(Math.round(duration), 'year');
}

export function hueFromString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360;
  }
  return hash;
}

export function initials(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
  return (cleaned.slice(0, 2) || '??').toUpperCase();
}

const AVATAR_GRADIENTS = [
  ['#fe7f2d', '#b16838'],
  ['#233d4d', '#3e6478'],
  ['#fe7f2d', '#233d4d'],
  ['#f7a571', '#fe7f2d'],
  ['#3e6478', '#233d4d'],
  ['#905e3d', '#fe7f2d'],
] as const;

export function avatarGradient(value: string): readonly [string, string] {
  const pair = AVATAR_GRADIENTS[hueFromString(value) % AVATAR_GRADIENTS.length];
  return pair ?? AVATAR_GRADIENTS[0];
}
