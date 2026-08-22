'use client';

import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { Field } from '@/components/auth/field';
import { PasswordField } from '@/components/auth/password-field';
import { PasswordMeter } from '@/components/auth/password-meter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth-client';
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
  const [formError, setFormError] = useState('');

  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signupSchema.safeParse({ name, email, password, confirm, terms });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError('');
    setPending(true);

    const { error } = await signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setPending(false);

    if (error) {
      setFormError(error.message ?? 'Could not create the account. Try again.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div>
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

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
          >
            {formError}
          </p>
        ) : null}
      </form>
    </div>
  );
}
