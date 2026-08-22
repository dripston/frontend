import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ChatPanel } from './chat-panel';

function renderPanel() {
  return {
    user: userEvent.setup(),
    ...render(<ChatPanel streamMs={0} />),
  };
}

function textbox() {
  return screen.getByRole('textbox', { name: 'Message the assistant' });
}

describe('ChatPanel', () => {
  it('starts on the empty state with suggested prompts', () => {
    renderPanel();

    expect(
      screen.getByRole('heading', { name: 'Ask about this repository' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('keeps send disabled until something is typed', async () => {
    const { user } = renderPanel();

    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    await user.type(textbox(), 'hi');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });

  it('shows the prompt and an answer after sending', async () => {
    const { user } = renderPanel();

    await user.type(textbox(), 'how is this repo structured?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('how is this repo structured?')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Repository layout' }),
      ).toBeInTheDocument(),
    );
  });

  it('clears the input after sending', async () => {
    const { user } = renderPanel();

    await user.type(textbox(), 'hello');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(textbox()).toHaveValue(''));
  });

  it('sends on Enter', async () => {
    const { user } = renderPanel();

    await user.type(textbox(), 'hello{Enter}');

    expect(await screen.findByText('hello')).toBeInTheDocument();
  });

  it('does not send on Shift+Enter', async () => {
    const { user } = renderPanel();

    await user.type(textbox(), 'first{Shift>}{Enter}{/Shift}second');

    expect(textbox()).toHaveValue('first\nsecond');
    expect(
      screen.queryByRole('button', { name: 'Stop generating' }),
    ).not.toBeInTheDocument();
  });

  it('sends a suggested prompt when its chip is clicked', async () => {
    const { user } = renderPanel();

    const chip = screen.getByRole('button', { name: 'What does the CSP allow?' });
    await user.click(chip);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Content Security Policy' }),
      ).toBeInTheDocument(),
    );
  });

  it('renders a fenced code block from the answer', async () => {
    const { user } = renderPanel();

    await user.click(
      screen.getByRole('button', { name: 'How do I add a shadcn component?' }),
    );

    await waitFor(() => {
      const figure = screen.getAllByRole('figure')[0];
      expect(within(figure!).getByText('bash')).toBeInTheDocument();
    });
  });

  it('falls back for an unknown question', async () => {
    const { user } = renderPanel();

    await user.type(textbox(), 'what is the weather{Enter}');

    await waitFor(() => expect(screen.getByText(/demo assistant/)).toBeInTheDocument());
  });
});
