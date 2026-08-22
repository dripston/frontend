'use client';

import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';

import { Field } from '@/components/auth/field';
import { PasswordField } from '@/components/auth/password-field';
import { SocialButtons } from '@/components/auth/social-buttons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse({ email, password, remember });
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

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          Sign in
        </Button>

        {done ? (
          <p role="status" className="text-center text-xs text-muted-foreground">
            Validated. Connect an auth provider to complete the sign in.
          </p>
        ) : null}
      </form>
    </div>
  );
}
