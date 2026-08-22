import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kicker } from './kicker';

describe('Kicker', () => {
  it('renders its label', () => {
    render(<Kicker>Overview</Kicker>);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('uses the mono tracking treatment', () => {
    render(<Kicker>Overview</Kicker>);
    expect(screen.getByText('Overview').className).toContain('font-mono');
  });

  it('merges a caller class', () => {
    render(<Kicker className="mb-4">Overview</Kicker>);
    expect(screen.getByText('Overview').className).toContain('mb-4');
  });
});
