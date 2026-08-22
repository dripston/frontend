import { describe, expect, it } from 'vitest';

import {
  collectErrors,
  loginSchema,
  passwordStrength,
  signupSchema,
  strengthLabel,
} from './auth-schema';

const validSignup = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'Analytical1!',
  confirm: 'Analytical1!',
  terms: true as const,
};

describe('loginSchema', () => {
  it('accepts a valid credential pair', () => {
    const result = loginSchema.safeParse({
      email: 'ada@example.com',
      password: 'anything',
      remember: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'anything',
      remember: false,
    });
    expect(result.success).toBe(false);
  });

  it('requires a password', () => {
    const result = loginSchema.safeParse({
      email: 'ada@example.com',
      password: '',
      remember: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  it('accepts a complete signup', () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('rejects a short name', () => {
    const result = signupSchema.safeParse({ ...validSignup, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a weak password', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'lowercase',
      confirm: 'lowercase',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a mismatched confirmation', () => {
    const result = signupSchema.safeParse({ ...validSignup, confirm: 'Different1!' });
    expect(result.success).toBe(false);
    expect(collectErrors(result.error!).confirm).toBe('Passwords do not match');
  });

  it('requires the terms to be accepted', () => {
    const result = signupSchema.safeParse({ ...validSignup, terms: false });
    expect(result.success).toBe(false);
  });
});

describe('collectErrors', () => {
  it('maps each failing field to its first message', () => {
    const result = signupSchema.safeParse({
      name: '',
      email: 'nope',
      password: 'x',
      confirm: 'y',
      terms: false,
    });

    const errors = collectErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'password', 'terms']);
  });

  it('reports the mismatch only once the other fields are valid', () => {
    const result = signupSchema.safeParse({ ...validSignup, confirm: 'Different1!' });
    expect(Object.keys(collectErrors(result.error!))).toEqual(['confirm']);
  });

  it('keeps only the first message per field', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'x',
      confirm: 'x',
    });
    const errors = collectErrors(result.error!);
    expect(typeof errors.password).toBe('string');
  });
});

describe('passwordStrength', () => {
  it('scores an empty password at zero', () => {
    expect(passwordStrength('')).toBe(0);
  });

  it('scores each satisfied rule', () => {
    expect(passwordStrength('abcdefgh')).toBe(1);
    expect(passwordStrength('Abcdefgh')).toBe(2);
    expect(passwordStrength('Abcdefg1')).toBe(3);
    expect(passwordStrength('Abcdefg1!')).toBe(4);
  });
});

describe('strengthLabel', () => {
  it('labels every score', () => {
    expect(strengthLabel(0)).toBe('Too weak');
    expect(strengthLabel(4)).toBe('Strong');
  });

  it('falls back for an out-of-range score', () => {
    expect(strengthLabel(9)).toBe('Too weak');
  });
});
