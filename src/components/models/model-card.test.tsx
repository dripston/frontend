import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModelCard } from './model-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Model } from '@/lib/models';

const model: Model = {
  id: 'mdl_7Kq2XvN4',
  org: 'Qwen',
  name: 'Qwen3.8-27B',
  task: 'Image-Text-to-Text',
  params: '28B',
  updatedAt: '2026-08-15T09:12:00.000Z',
  downloads: 1_730_000,
  likes: 12_000,
  inference: true,
  base: true,
};

function renderCard(overrides: Partial<Model> = {}) {
  return render(
    <TooltipProvider>
      <ModelCard model={{ ...model, ...overrides }} />
    </TooltipProvider>,
  );
}

describe('ModelCard', () => {
  it('shows the org and model name', () => {
    renderCard();
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Qwen/Qwen3.8-27B');
  });

  it('shows the model id', () => {
    renderCard();
    expect(screen.getByText('mdl_7Kq2XvN4')).toBeInTheDocument();
  });

  it('shows task, params and compact counters', () => {
    renderCard();
    expect(screen.getByText('Image-Text-to-Text')).toBeInTheDocument();
    expect(screen.getByText('28B')).toBeInTheDocument();
    expect(screen.getByText('1.73m')).toBeInTheDocument();
    expect(screen.getByText('12k')).toBeInTheDocument();
  });

  it('marks inference availability', () => {
    renderCard();
    expect(screen.getByText('Inference available')).toBeInTheDocument();
  });

  it('hides the inference marker when unavailable', () => {
    renderCard({ inference: false });
    expect(screen.queryByText('Inference available')).not.toBeInTheDocument();
  });

  it('omits the params segment when a model has none', () => {
    renderCard({ params: null });
    expect(screen.queryByText('28B')).not.toBeInTheDocument();
  });

  it('flags a base model', () => {
    renderCard();
    expect(screen.getByText('Base')).toBeInTheDocument();
  });

  it('does not flag a derived model', () => {
    renderCard({ base: false });
    expect(screen.queryByText('Base')).not.toBeInTheDocument();
  });

  it('exposes the update time as a machine-readable timestamp', () => {
    const { container } = renderCard();
    expect(container.querySelector('time')).toHaveAttribute(
      'dateTime',
      '2026-08-15T09:12:00.000Z',
    );
  });
});
