import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LoginForm } from './login-form';

function setup() {
  return { user: userEvent.setup(), ...render(<LoginForm />) };
}

const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Password');
const submit = () => screen.getByRole('button', { name: 'Sign in' });

describe('LoginForm', () => {
  it('renders both credential fields and the social providers', () => {
    setup();
    expect(email()).toBeInTheDocument();
    expect(password()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
  });

  it('reports a malformed email', async () => {
    const { user } = setup();

    await user.type(email(), 'nope');
    await user.type(password(), 'secret');
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a valid email address',
    );
  });

  it('reports a missing password', async () => {
    const { user } = setup();

    await user.type(email(), 'ada@example.com');
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter your password');
  });

  it('accepts a valid submission', async () => {
    const { user } = setup();

    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'secret');
    await user.click(submit());

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('masks the password until revealed', async () => {
    const { user } = setup();

    expect(password()).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password()).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password()).toHaveAttribute('type', 'password');
  });

  it('toggles the keep-signed-in checkbox', async () => {
    const { user } = setup();
    const box = screen.getByRole('checkbox', { name: 'Keep me signed in' });

    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });
});
