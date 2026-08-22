import { z } from 'zod';

export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
  { label: 'One symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol');

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean(),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    password,
    confirm: z.string(),
    terms: z.literal(true, { error: 'Accept the terms to continue' }),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    error: 'Passwords do not match',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

export type FieldErrors = Record<string, string>;

export function collectErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function passwordStrength(value: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

export function strengthLabel(score: number): string {
  return ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? 'Too weak';
}
