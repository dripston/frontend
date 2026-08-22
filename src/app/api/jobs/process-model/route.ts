import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { z } from 'zod';

import { env } from '@/env';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

const ENQUEUE_TIMEOUT_MS = 20_000;

const BENCHMARK_NICHES = [
  'generic',
  'legal',
  'healthcare',
  'finance',
  'customer_support',
  'ecommerce',
] as const;

type BenchmarkNiche = (typeof BENCHMARK_NICHES)[number];

const jobSchema = z.object({
  name: z.string().min(1),
  model_id: z.string().min(1),
  seller_id: z.string().min(1),
  endpoint_url: z.url(),
  declared_niche: z.string().optional(),
  model_identifier: z.string().optional(),
});

const acceptedSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  queued_jobs: z.number().optional(),
  workers: z.number().optional(),
});

function toBenchmarkNiche(value: string | undefined): BenchmarkNiche | null {
  const normalised = value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return BENCHMARK_NICHES.find((niche) => niche === normalised) ?? null;
}

async function processModel(request: Request): Promise<Response> {
  const job = jobSchema.safeParse(await request.json());

  if (!job.success) {
    logger.error({ issues: job.error.issues }, 'process-model: malformed job payload');
    return Response.json({ status: 'dropped', reason: 'malformed payload' });
  }

  const { name, model_id: modelId, seller_id: sellerId, endpoint_url } = job.data;
  const declaredNiche = toBenchmarkNiche(job.data.declared_niche);

  let response: Response;

  try {
    response = await fetch(`${env.BENCHMARK_API_URL}/api/jobs/benchmark`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        model_id: modelId,
        seller_id: sellerId,
        endpoint_url,
        declared_niche: declaredNiche,
        model_identifier: job.data.model_identifier ?? null,
      }),
      signal: AbortSignal.timeout(ENQUEUE_TIMEOUT_MS),
    });
  } catch (error) {
    logger.error({ error, modelId }, 'process-model: benchmark service unreachable');
    return Response.json({ error: 'Benchmark service unreachable' }, { status: 502 });
  }

  if (response.status === 404) {
    logger.error(
      { modelId },
      'process-model: benchmark service does not know this model',
    );
    return Response.json({ status: 'dropped', reason: 'model not found' });
  }

  if (!response.ok) {
    logger.error(
      { modelId, status: response.status, body: await response.text() },
      'process-model: could not queue the benchmark',
    );
    return Response.json({ error: 'Could not queue the benchmark' }, { status: 502 });
  }

  const accepted = acceptedSchema.safeParse(await response.json());

  if (!accepted.success) {
    logger.error(
      { modelId, issues: accepted.error.issues },
      'process-model: unexpected enqueue response',
    );
    return Response.json({ error: 'Unexpected enqueue response' }, { status: 502 });
  }

  logger.info(
    {
      modelId,
      jobId: accepted.data.job_id,
      queued: accepted.data.queued_jobs,
      workers: accepted.data.workers,
    },
    'process-model: benchmark queued',
  );

  return Response.json({
    status: 'queued',
    model_id: modelId,
    job_id: accepted.data.job_id,
  });
}

let verifiedHandler: ReturnType<typeof verifySignatureAppRouter> | null = null;

export async function POST(request: Request): Promise<Response> {
  verifiedHandler ??= verifySignatureAppRouter(processModel, {
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });

  return verifiedHandler(request);
}
