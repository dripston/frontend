'use client';

import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { Field } from '@/components/auth/field';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth-client';
import { collectErrors, loginSchema, type FieldErrors } from '@/lib/auth-schema';

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');

  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError('');
    setPending(true);

    const { error } = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.remember,
    });

    setPending(false);

    if (error) {
      setFormError(error.message ?? 'Could not sign you in. Check your details.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
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

        <Field
          id={passwordId}
          label="Password"
          error={errors.password}
          hint={
            <Link
              href="/login"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordField
            id={passwordId}
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id={rememberId}
            checked={remember}
            onCheckedChange={(checked) => setRemember(Boolean(checked))}
          />
          <Label htmlFor={rememberId} className="text-sm text-muted-foreground">
            Keep me signed in
          </Label>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full relative group overflow-hidden mt-6" 
          disabled={pending}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-100 transition-opacity group-hover:opacity-90" />
          <span className="relative flex items-center justify-center gap-2 text-white font-medium">
            {pending ? <Loader2Icon className="animate-spin size-4" /> : null}
            Sign in
          </span>
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
