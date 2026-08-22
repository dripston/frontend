'use client';

import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';

import { Field } from '@/components/auth/field';
import { PasswordField } from '@/components/auth/password-field';
import { PasswordMeter } from '@/components/auth/password-meter';
import { SocialButtons } from '@/components/auth/social-buttons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { collectErrors, signupSchema, type FieldErrors } from '@/lib/auth-schema';

export function SignupForm() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const termsId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signupSchema.safeParse({ name, email, password, confirm, terms });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }

    setErrors({});
    setPending(true);
    setDone(true);
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <SocialButtons />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field id={nameId} label="Full name" error={errors.name}>
          <Input
            id={nameId}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field id={emailId} label="Email" error={errors.email}>
          <Input
            id={emailId}
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field id={passwordId} label="Password" error={errors.password}>
          <PasswordField
            id={passwordId}
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
          />
          <PasswordMeter value={password} />
        </Field>

        <Field id={confirmId} label="Confirm password" error={errors.confirm}>
          <PasswordField
            id={confirmId}
            name="confirm"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            invalid={Boolean(errors.confirm)}
          />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <Checkbox
              id={termsId}
              checked={terms}
              onCheckedChange={(checked) => setTerms(Boolean(checked))}
              aria-invalid={Boolean(errors.terms)}
              className="mt-0.5"
            />
            <Label
              htmlFor={termsId}
              className="text-sm leading-snug text-muted-foreground"
            >
              I agree to the{' '}
              <Link href="/signup" className="text-primary underline underline-offset-4">
                terms of service
              </Link>{' '}
              and{' '}
              <Link href="/signup" className="text-primary underline underline-offset-4">
                privacy policy
              </Link>
            </Label>
          </div>
          {errors.terms ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          Create account
        </Button>

        {done ? (
          <p role="status" className="text-center text-xs text-muted-foreground">
            Validated. Connect an auth provider to create the account.
          </p>
        ) : null}
      </form>
    </div>
  );
}
