import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),

      version:
        process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
