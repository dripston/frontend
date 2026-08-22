import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sparkline } from './sparkline';

describe('Sparkline', () => {
  it('renders a labelled chart', () => {
    render(<Sparkline points={[1, 5, 3, 9]} />);
    expect(screen.getByRole('img', { name: /downloads/i })).toBeInTheDocument();
  });

  it('draws a path for each point', () => {
    const { container } = render(<Sparkline points={[0, 10, 5]} />);
    const line = container.querySelectorAll('path')[1];
    expect(line?.getAttribute('d')?.split('L')).toHaveLength(3);
  });

  it('survives a flat series without dividing by zero', () => {
    const { container } = render(<Sparkline points={[4, 4, 4]} />);
    expect(container.querySelector('path')?.getAttribute('d')).not.toContain('NaN');
  });

  it('renders nothing for a single point', () => {
    const { container } = render(<Sparkline points={[1]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
