import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ModelExplorer } from './model-explorer';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Model } from '@/lib/models';

const base: Model = {
  id: 'mdl_1111AAAA',
  org: 'Qwen',
  name: 'Qwen3.8-27B',
  task: 'Text Generation',
  params: '28B',
  updatedAt: '2026-08-20T09:00:00.000Z',
  downloads: 500,
  likes: 10,
  inference: true,
  base: true,
};

const derived: Model = {
  id: 'mdl_2222BBBB',
  org: 'unsloth',
  name: 'Mistral-Small-GGUF',
  task: 'Text Generation',
  params: '7B',
  updatedAt: '2026-08-21T09:00:00.000Z',
  downloads: 9000,
  likes: 1,
  inference: false,
  base: false,
};

const models = [base, derived];

function renderExplorer() {
  return render(
    <TooltipProvider>
      <ModelExplorer models={models} />
    </TooltipProvider>,
  );
}

function listedIds() {
  return screen
    .getAllByRole('listitem')
    .map((item) => within(item).getByText(/^mdl_/).textContent);
}

describe('ModelExplorer', () => {
  it('lists every model by default', () => {
    renderExplorer();
    expect(listedIds()).toHaveLength(2);
  });

  it('filters by name, case-insensitively', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'mistral');

    expect(listedIds()).toEqual(['mdl_2222BBBB']);
  });

  it('matches on the org segment too', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'qwen');

    expect(listedIds()).toEqual(['mdl_1111AAAA']);
  });

  it('narrows to base models', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('switch', { name: 'Base only' }));

    expect(listedIds()).toEqual(['mdl_1111AAAA']);
  });

  it('narrows to models with inference', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('button', { name: 'Inference available' }));

    expect(listedIds()).toEqual(['mdl_1111AAAA']);
  });

  it('reports how many of the total are showing', async () => {
    const user = userEvent.setup();
    renderExplorer();

    expect(screen.getByText('2')).toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Base only' }));

    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('re-sorts by downloads', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('button', { name: /^Sort:/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Most downloads' }));

    expect(listedIds()).toEqual(['mdl_2222BBBB', 'mdl_1111AAAA']);
  });

  it('sorts trending by likes ahead of raw downloads', async () => {
    renderExplorer();
    expect(listedIds()).toEqual(['mdl_1111AAAA', 'mdl_2222BBBB']);
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'zzzz');

    expect(screen.getByText('No models match these filters.')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
