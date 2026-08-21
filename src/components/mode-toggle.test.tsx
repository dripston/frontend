import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ModeToggle } from './mode-toggle';

const setTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme, theme: 'system' }),
}));

describe('ModeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it('exposes an accessible trigger', () => {
    render(<ModeToggle />);
    expect(screen.getByRole('button', { name: 'Change theme' })).toBeInTheDocument();
  });

  it('offers every theme once opened', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByRole('button', { name: 'Change theme' }));

    expect(await screen.findByRole('menuitem', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'System' })).toBeInTheDocument();
  });

  it('applies the chosen theme', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByRole('button', { name: 'Change theme' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Dark' }));

    expect(setTheme).toHaveBeenCalledExactlyOnceWith('dark');
  });
});
