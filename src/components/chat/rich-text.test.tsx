import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RichText } from './rich-text';

describe('RichText', () => {
  it('renders a paragraph', () => {
    render(<RichText source="plain sentence" />);
    expect(screen.getByText('plain sentence')).toBeInTheDocument();
  });

  it('renders a heading at the right level', () => {
    render(<RichText source="## Section" />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Section' }),
    ).toBeInTheDocument();
  });

  it('renders a bullet list', () => {
    render(<RichText source={'- one\n- two'} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders a numbered list', () => {
    const { container } = render(<RichText source={'1. one\n2. two'} />);
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('renders a code block with its language caption', () => {
    render(<RichText source={'```ts\nconst a = 1;\n```'} />);
    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(screen.getByText('const a = 1;')).toBeInTheDocument();
  });

  it('renders inline code', () => {
    const { container } = render(<RichText source="run `pnpm dev` now" />);
    expect(container.querySelector('code')).toHaveTextContent('pnpm dev');
  });

  it('renders links with their href', () => {
    render(<RichText source="see [docs](https://example.com)" />);
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('renders bold text', () => {
    const { container } = render(<RichText source="**important**" />);
    expect(container.querySelector('strong')).toHaveTextContent('important');
  });
});
