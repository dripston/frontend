import { describe, expect, it } from 'vitest';

import { MODEL_TASKS, models } from './models';

describe('models', () => {
  it('gives every model a unique id', () => {
    const ids = models.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses the documented id format', () => {
    for (const model of models) {
      expect(model.id).toMatch(/^mdl_[A-Za-z0-9]{8}$/);
    }
  });

  it('only uses known tasks', () => {
    for (const model of models) {
      expect(MODEL_TASKS).toContain(model.task);
    }
  });

  it('stores updatedAt as a parseable timestamp', () => {
    for (const model of models) {
      expect(Number.isNaN(Date.parse(model.updatedAt))).toBe(false);
    }
  });

  it('never dates a model in the future', () => {
    const now = Date.now();
    for (const model of models) {
      expect(Date.parse(model.updatedAt)).toBeLessThanOrEqual(now);
    }
  });

  it('has non-negative counters', () => {
    for (const model of models) {
      expect(model.downloads).toBeGreaterThanOrEqual(0);
      expect(model.likes).toBeGreaterThanOrEqual(0);
    }
  });
});
