import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ModelTabs } from './model-tabs';
import { buildModelDetail } from '@/lib/model-detail';
import { models } from '@/lib/models';

const detail = buildModelDetail(models[0]!);

function renderTabs() {
  return { user: userEvent.setup(), ...render(<ModelTabs detail={detail} />) };
}

describe('ModelTabs', () => {
  it('opens on the model card', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: /Model card/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('renders the card content as formatted text', () => {
    renderTabs();
    expect(screen.getByRole('heading', { name: 'Model overview' })).toBeInTheDocument();
  });

  it('switches to the files tab', async () => {
    const { user } = renderTabs();

    await user.click(screen.getByRole('tab', { name: /Files and versions/ }));

    expect(screen.getByText('model.safetensors')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Model overview' }),
    ).not.toBeInTheDocument();
  });

  it('marks large files as LFS', async () => {
    const { user } = renderTabs();

    await user.click(screen.getByRole('tab', { name: /Files and versions/ }));

    expect(screen.getAllByText('LFS').length).toBeGreaterThan(0);
  });

  it('shows an empty community tab', async () => {
    const { user } = renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Community' }));

    expect(screen.getByText('No discussions yet.')).toBeInTheDocument();
  });
});
