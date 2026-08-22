import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SiteHeader } from './site-header';

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: vi.fn(), theme: 'system' }),
}));

describe('SiteHeader', () => {
  it('links to every primary destination', () => {
    render(<SiteHeader />);

    for (const [name, href] of [
      ['Models', '/'],
      ['Assistant', '/chat'],
      ['Design system', '/design-system'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('offers both auth entry points', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  it('includes the theme switcher', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('button', { name: 'Change theme' })).toBeInTheDocument();
  });
});
