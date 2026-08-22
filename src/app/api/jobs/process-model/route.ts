import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { env } from '@/env';
import { db } from '@/lib/db';
import { model } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

export const maxDuration = 300;

const BENCHMARK_TIMEOUT_MS = 240_000;

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
});

const reportSchema = z.object({
  overall_accuracy_pct: z.number(),
  average_latency_ms: z.number(),
  total_passed: z.number(),
  total_prompts: z.number(),
  overall_composite_score: z.number(),
  overall_grade: z.string(),
  categories_tested: z.array(z.string()),
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

  logger.info({ modelId, declaredNiche }, 'process-model: benchmark started');

  let response: Response;

  try {
    response = await fetch(`${env.BENCHMARK_API_URL}/api/benchmark`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        model_id: modelId,
        seller_id: sellerId,
        endpoint_url,
        declared_niche: declaredNiche,
      }),
      signal: AbortSignal.timeout(BENCHMARK_TIMEOUT_MS),
    });
  } catch (error) {
    logger.error({ error, modelId }, 'process-model: benchmark service unreachable');
    return Response.json({ error: 'Benchmark service unreachable' }, { status: 502 });
  }

  if (!response.ok) {
    logger.error(
      { modelId, status: response.status, body: await response.text() },
      'process-model: benchmark run failed',
    );
    return Response.json({ error: 'Benchmark run failed' }, { status: 502 });
  }

  const report = reportSchema.safeParse(await response.json());

  if (!report.success) {
    logger.error(
      { modelId, issues: report.error.issues },
      'process-model: unexpected benchmark response',
    );
    return Response.json({ error: 'Unexpected benchmark response' }, { status: 502 });
  }

  const [verified] = await db
    .update(model)
    .set({ isVerified: true })
    .where(eq(model.id, modelId))
    .returning({ id: model.id });

  if (!verified) {
    logger.error({ modelId }, 'process-model: model row no longer exists');
    return Response.json({ status: 'dropped', reason: 'model not found' });
  }

  revalidatePath('/');
  revalidatePath(`/models/${modelId}`);

  logger.info(
    {
      modelId,
      grade: report.data.overall_grade,
      score: report.data.overall_composite_score,
      accuracy: report.data.overall_accuracy_pct,
      categories: report.data.categories_tested,
    },
    'process-model: model verified',
  );

  return Response.json({
    status: 'verified',
    model_id: modelId,
    grade: report.data.overall_grade,
    score: report.data.overall_composite_score,
  });
}

export const POST = verifySignatureAppRouter(processModel);
