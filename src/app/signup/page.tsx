import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create an account to browse and deploy models.',
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. No card required."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
