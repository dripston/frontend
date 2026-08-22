import 'server-only';

import { desc, eq, getTableColumns } from 'drizzle-orm';

import { db } from '@/lib/db';
import { model, user } from '@/lib/db/schema';
import type { ModelSummary } from '@/lib/models';

export type ModelRecord = typeof model.$inferSelect & { ownerName: string };

const selection = { ...getTableColumns(model), ownerName: user.name };

export function organisationOf(id: string): string {
  const separator = id.indexOf('/');
  return separator > 0 ? id.slice(0, separator) : id;
}

export function toSummary(record: ModelRecord): ModelSummary {
  return {
    id: record.id,
    org: organisationOf(record.id),
    name: record.name,
    task: record.task,
    category: record.category,
    niche: record.niche,
    parameters: record.technical.parameters,
    format: record.files.modelFormat,
    license: record.license.modelLicense,
    pricing: record.pricing,
    updatedAt: record.updatedAt.toISOString(),
    downloads: record.downloads,
    likes: record.likes,
    inference: Boolean(record.endpointUrl),
    base: record.training.trainingMethod === 'pretraining',
  };
}

export async function listModels(): Promise<ModelSummary[]> {
  const records = await db
    .select(selection)
    .from(model)
    .innerJoin(user, eq(model.userId, user.id))
    .orderBy(desc(model.updatedAt));

  return records.map(toSummary);
}

export async function getModelRecord(id: string): Promise<ModelRecord | null> {
  const [record] = await db
    .select(selection)
    .from(model)
    .innerJoin(user, eq(model.userId, user.id))
    .where(eq(model.id, id))
    .limit(1);

  return record ?? null;
}
