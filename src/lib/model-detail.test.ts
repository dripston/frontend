import { describe, expect, it } from 'vitest';

import { buildModelDetail } from './model-detail';
import { models } from './models';

const model = models[0]!;

describe('buildModelDetail', () => {
  it('is deterministic for the same model', () => {
    expect(buildModelDetail(model)).toEqual(buildModelDetail(model));
  });

  it('produces a detail record for every model', () => {
    for (const entry of models) {
      const detail = buildModelDetail(entry);
      expect(detail.library).toBeTruthy();
      expect(detail.license).toBeTruthy();
      expect(detail.files.length).toBeGreaterThan(0);
      expect(detail.evals.length).toBeGreaterThan(0);
    }
  });

  it('mentions the model in the card', () => {
    const detail = buildModelDetail(model);
    expect(detail.card).toContain(`${model.org}/${model.name}`);
  });

  it('reports the task and license in the card', () => {
    const detail = buildModelDetail(model);
    expect(detail.card).toContain(model.task);
    expect(detail.card).toContain(detail.license);
  });

  it('keeps tree counts non-negative', () => {
    const { tree } = buildModelDetail(model);
    for (const count of Object.values(tree)) {
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it('scores every eval within a sane range', () => {
    for (const entry of buildModelDetail(model).evals) {
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(100);
    }
  });

  it('builds a download trend with 24 points', () => {
    expect(buildModelDetail(model).downloadTrend).toHaveLength(24);
  });

  it('keeps the download trend inside the plotted range', () => {
    for (const point of buildModelDetail(model).downloadTrend) {
      expect(point).toBeGreaterThanOrEqual(6);
      expect(point).toBeLessThanOrEqual(95);
    }
  });

  it('varies the download trend rather than drawing a straight line', () => {
    const trend = buildModelDetail(model).downloadTrend;
    const deltas = trend.slice(1).map((point, index) => point - trend[index]!);
    expect(new Set(deltas).size).toBeGreaterThan(3);
  });

  it('gives different models different details', () => {
    const a = buildModelDetail(models[0]!);
    const b = buildModelDetail(models[5]!);
    expect(a.card).not.toBe(b.card);
  });
});
