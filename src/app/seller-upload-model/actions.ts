'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { type z } from 'zod';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { model } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { modelUploadSchema } from '@/zod-schema/upload-model-schema';

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type UploadModelResult =
  { success: true; id: string } | { success: false; error: string; details?: unknown };

export async function uploadModelAction(
  data: z.infer<typeof modelUploadSchema>,
): Promise<UploadModelResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please sign in to upload a model.' };
  }

  const parsed = modelUploadSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data provided',
      details: parsed.error.flatten(),
    };
  }

  const id = `${slug(session.user.name)}/${slug(parsed.data.basicInfo.name)}`;

  const [existing] = await db
    .select({ id: model.id })
    .from(model)
    .where(eq(model.id, id))
    .limit(1);

  if (existing) {
    return {
      success: false,
      error: `You already publish a model at ${id}. Pick a different name.`,
    };
  }

  try {
    await db.insert(model).values({
      id,
      userId: session.user.id,
      name: parsed.data.basicInfo.name,
      niche: parsed.data.basicInfo.declared_niche,
      category: parsed.data.basicInfo.category,
      task: parsed.data.basicInfo.task,
      version: parsed.data.basicInfo.version,
      endpointUrl: parsed.data.basicInfo.endpoint_url,
      basicInfo: parsed.data.basicInfo,
      files: parsed.data.files,
      technical: parsed.data.technical,
      training: parsed.data.training,
      evaluation: parsed.data.evaluation,
      usage: parsed.data.usage,
      license: parsed.data.license,
      pricing: parsed.data.pricing,
      modelCard: parsed.data.modelCard,
    });
  } catch (error) {
    logger.error({ error, id }, 'Failed to insert model');
    return { success: false, error: 'Failed to insert model into the database.' };
  }

  revalidatePath('/');
  revalidatePath(`/models/${id}`);

  return { success: true, id };
}
