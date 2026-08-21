'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100dvh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Application error</h1>
        <p style={{ maxWidth: '40ch', opacity: 0.7 }}>
          The application failed to load. Please refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: '1px solid currentColor',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
