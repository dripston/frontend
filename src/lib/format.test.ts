import { describe, expect, it } from 'vitest';

import {
  avatarGradient,
  compactNumber,
  hueFromString,
  initials,
  relativeTime,
} from './format';

describe('compactNumber', () => {
  it('formats millions with a lowercase unit', () => {
    expect(compactNumber(1_730_000)).toBe('1.73m');
  });

  it('formats thousands', () => {
    expect(compactNumber(12_000)).toBe('12k');
    expect(compactNumber(2_510)).toBe('2.51k');
  });

  it('leaves small numbers alone', () => {
    expect(compactNumber(823)).toBe('823');
    expect(compactNumber(0)).toBe('0');
  });
});

describe('relativeTime', () => {
  const now = new Date('2026-08-22T12:00:00.000Z');

  it('describes days in the past', () => {
    expect(relativeTime('2026-08-15T12:00:00.000Z', now)).toBe('7 days ago');
  });

  it('describes hours in the past', () => {
    expect(relativeTime('2026-08-22T04:00:00.000Z', now)).toBe('8 hours ago');
  });

  it('keeps day granularity for a single day', () => {
    expect(relativeTime('2026-08-21T12:00:00.000Z', now)).toBe('1 day ago');
  });

  it('keeps day granularity past a week', () => {
    expect(relativeTime('2026-08-01T12:00:00.000Z', now)).toBe('21 days ago');
  });

  it('rolls over to months', () => {
    expect(relativeTime('2026-06-22T12:00:00.000Z', now)).toBe('2 months ago');
  });

  it('falls back to years for distant dates', () => {
    expect(relativeTime('2023-08-22T12:00:00.000Z', now)).toBe('3 years ago');
  });
});

describe('hueFromString', () => {
  it('is deterministic', () => {
    expect(hueFromString('Qwen')).toBe(hueFromString('Qwen'));
  });

  it('stays inside the hue circle', () => {
    for (const name of ['Qwen', 'unsloth', 'MiniMaxAI', 'deepseek-ai', '']) {
      const hue = hueFromString(name);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });

  it('separates different names', () => {
    expect(hueFromString('Qwen')).not.toBe(hueFromString('unsloth'));
  });
});

describe('initials', () => {
  it('takes the first two alphanumerics, uppercased', () => {
    expect(initials('deepseek-ai')).toBe('DE');
    expect(initials('Qwen')).toBe('QW');
  });

  it('falls back when there is nothing to use', () => {
    expect(initials('---')).toBe('??');
  });
});

describe('avatarGradient', () => {
  it('is deterministic', () => {
    expect(avatarGradient('Qwen')).toEqual(avatarGradient('Qwen'));
  });

  it('only uses palette colours', () => {
    const palette = ['#fe7f2d', '#b16838', '#233d4d', '#3e6478', '#f7a571', '#905e3d'];
    for (const name of [
      'Qwen',
      'unsloth',
      'MiniMaxAI',
      'deepseek-ai',
      'Lightricks',
      '',
    ]) {
      for (const colour of avatarGradient(name)) {
        expect(palette).toContain(colour);
      }
    }
  });

  it('always returns a pair', () => {
    expect(avatarGradient('anything')).toHaveLength(2);
  });
});
