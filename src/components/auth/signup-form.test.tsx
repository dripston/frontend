import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SignupForm } from './signup-form';

function setup() {
  return { user: userEvent.setup(), ...render(<SignupForm />) };
}

const name = () => screen.getByLabelText('Full name');
const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Password');
const confirm = () => screen.getByLabelText('Confirm password');
const terms = () => screen.getByRole('checkbox');
const submit = () => screen.getByRole('button', { name: 'Create account' });

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(name(), 'Ada Lovelace');
  await user.type(email(), 'ada@example.com');
  await user.type(password(), 'Analytical1!');
  await user.type(confirm(), 'Analytical1!');
  await user.click(terms());
}

describe('SignupForm', () => {
  it('renders every field', () => {
    setup();
    for (const field of [name(), email(), password(), confirm()]) {
      expect(field).toBeInTheDocument();
    }
  });

  it('reports a weak password', async () => {
    const { user } = setup();

    await user.type(name(), 'Ada Lovelace');
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'short');
    await user.type(confirm(), 'short');
    await user.click(terms());
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('at least 8 characters');
  });

  it('reports a mismatched confirmation', async () => {
    const { user } = setup();

    await user.type(name(), 'Ada Lovelace');
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'Analytical1!');
    await user.type(confirm(), 'Different1!');
    await user.click(terms());
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match');
  });

  it('requires the terms to be accepted', async () => {
    const { user } = setup();

    await user.type(name(), 'Ada Lovelace');
    await user.type(email(), 'ada@example.com');
    await user.type(password(), 'Analytical1!');
    await user.type(confirm(), 'Analytical1!');
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('Accept the terms');
  });

  it('accepts a complete submission', async () => {
    const { user } = setup();

    await fillValid(user);
    await user.click(submit());

    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('grows the strength meter as the password improves', async () => {
    const { user } = setup();

    expect(screen.getByText('Too weak')).toBeInTheDocument();

    await user.type(password(), 'Analytical1!');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
