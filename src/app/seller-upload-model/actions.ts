'use server';

import { type z } from 'zod';
import { modelUploadSchema } from '@/zod-schema/upload-model-schema';

export async function uploadModelAction(data: z.infer<typeof modelUploadSchema>) {
  const parsed = modelUploadSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data provided',
      details: parsed.error.flatten(),
    };
  }

  // TODO: Database insertion logic here
  // e.g. await db.insert(models).values(parsed.data);

  return { success: true };
}
