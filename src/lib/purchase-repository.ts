import 'server-only';

import { and, desc, eq, getTableColumns } from 'drizzle-orm';

import { db } from '@/lib/db';
import { model, purchase, user } from '@/lib/db/schema';

export type PurchaseRecord = typeof purchase.$inferSelect;

export type PurchaseWithModel = PurchaseRecord & {
  modelName: string;
  modelTask: string;
  modelVersion: string;
  endpointUrl: string;
  sellerName: string;
};

export async function getPurchase(
  userId: string,
  modelId: string,
): Promise<PurchaseRecord | null> {
  const [record] = await db
    .select()
    .from(purchase)
    .where(and(eq(purchase.userId, userId), eq(purchase.modelId, modelId)))
    .limit(1);

  return record ?? null;
}

export async function getPurchaseById(
  userId: string,
  purchaseId: string,
): Promise<PurchaseWithModel | null> {
  const [record] = await db
    .select({
      ...getTableColumns(purchase),
      modelName: model.name,
      modelTask: model.task,
      modelVersion: model.version,
      endpointUrl: model.endpointUrl,
      sellerName: user.name,
    })
    .from(purchase)
    .innerJoin(model, eq(purchase.modelId, model.id))
    .innerJoin(user, eq(model.userId, user.id))
    .where(and(eq(purchase.id, purchaseId), eq(purchase.userId, userId)))
    .limit(1);

  return record ?? null;
}

export async function listPurchases(userId: string): Promise<PurchaseWithModel[]> {
  return db
    .select({
      ...getTableColumns(purchase),
      modelName: model.name,
      modelTask: model.task,
      modelVersion: model.version,
      endpointUrl: model.endpointUrl,
      sellerName: user.name,
    })
    .from(purchase)
    .innerJoin(model, eq(purchase.modelId, model.id))
    .innerJoin(user, eq(model.userId, user.id))
    .where(eq(purchase.userId, userId))
    .orderBy(desc(purchase.createdAt));
}
