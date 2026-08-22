'use server';

import { type z } from 'zod';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { model } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { modelUploadSchema } from '@/zod-schema/upload-model-schema';

export async function uploadModelAction(data: z.infer<typeof modelUploadSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized. Please sign in to upload a model.',
    };
  }

  const parsed = modelUploadSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data provided',
      details: parsed.error.flatten(),
    };
  }

  try {
    const ownerName = session.user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const modelName = parsed.data.basicInfo.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const customId = `${ownerName}/${modelName}`;

    await db.insert(model).values({
      id: customId,
      userId: session.user.id,
      name: parsed.data.basicInfo.name,
      niche: parsed.data.basicInfo.declared_niche,
      category: parsed.data.basicInfo.category,
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
    console.error('Failed to insert model:', error);
    return {
      success: false,
      error: 'Failed to insert model into the database.',
    };
  }

  return { success: true };
}
