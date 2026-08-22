'use client';

import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

const PROVIDERS = [
  {
    id: 'github',
    name: 'GitHub',
    path: 'M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z',
  },
  {
    id: 'google',
    name: 'Google',
    path: 'M21.35 11.1H12v2.9h5.35c-.23 1.4-1.65 4.1-5.35 4.1a5.95 5.95 0 0 1 0-11.9c1.7 0 2.84.72 3.5 1.34l2.38-2.3A9.3 9.3 0 0 0 12 2.6a9.4 9.4 0 1 0 0 18.8c5.43 0 9.02-3.82 9.02-9.2 0-.62-.07-1.09-.17-1.1Z',
  },
] as const;

export function SocialButtons({ onError }: { onError: (message: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          size="lg"
          onClick={async () => {
            const { error } = await signIn.social({
              provider: provider.id,
              callbackURL: '/',
            });
            if (error) {
              onError(error.message ?? `${provider.name} sign in is not configured.`);
            }
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
            <path d={provider.path} />
          </svg>
          {provider.name}
        </Button>
      ))}
    </div>
  );
}
