import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-prose text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}
