import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AiFab } from './ai-fab';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}));

describe('AiFab', () => {
  it('links to the chat route', () => {
    pathname.current = '/';
    render(<AiFab />);

    expect(screen.getByRole('link', { name: 'Open the AI assistant' })).toHaveAttribute(
      'href',
      '/chat',
    );
  });

  it.each(['/chat', '/login', '/signup'])('hides itself on %s', (route) => {
    pathname.current = route;
    const { container } = render(<AiFab />);

    expect(container).toBeEmptyDOMElement();
  });

  it('still shows on a model detail route', () => {
    pathname.current = '/models/mdl_7Kq2XvN4';
    render(<AiFab />);

    expect(screen.getByRole('link', { name: 'Open the AI assistant' })).toBeVisible();
  });
});
