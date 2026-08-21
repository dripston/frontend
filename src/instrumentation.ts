import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { logger } = await import('@/lib/logger');
  logger.info(
    { runtime: process.env.NEXT_RUNTIME, nodeEnv: process.env.NODE_ENV },
    'server starting',
  );
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { logger } = await import('@/lib/logger');

  const digest =
    typeof err === 'object' && err !== null && 'digest' in err
      ? String((err as { digest: unknown }).digest)
      : undefined;

  logger.error(
    {
      err,
      digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    },
    'unhandled server error',
  );
};
