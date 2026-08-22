import { z } from 'zod';

import { digitsOf, expiryIsFuture, luhnValid } from '../lib/payments';

export const checkoutSchema = z.object({
  modelId: z.string().min(1, 'Model is required'),

  cardholderName: z
    .string()
    .trim()
    .min(2, 'Enter the name printed on the card')
    .max(100, 'Name cannot exceed 100 characters'),

  cardNumber: z
    .string()
    .refine((value) => digitsOf(value).length >= 13, 'Card number is too short')
    .refine((value) => luhnValid(value), 'That card number is not valid'),

  expiry: z
    .string()
    .regex(/^\d{2}\s*\/\s*\d{2}$/, 'Use MM/YY')
    .refine((value) => expiryIsFuture(value), 'That card has expired'),

  cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),

  email: z.email('Enter a valid email address'),

  country: z.string().trim().min(2, 'Country is required').max(56),

  acceptTerms: z.boolean().refine((value) => value === true, {
    message: 'Accept the licence terms to continue',
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
