import { and, desc, eq } from "drizzle-orm";
import { documents, otherAssets } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type { createAssetSchema, updateAssetSchema } from "./assets-types";
import { notFound } from "../_shared/errors";

export async function createAssetRecord(input: z.infer<typeof createAssetSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(otherAssets).values({
    ...input,
    id,
    declaredValue: input.declaredValue.toFixed(2),
    notes: input.notes || null,
  });
  return id;
}

export async function listAssetRecords(familyId: string) {
  const db = await requireDatabase();
  return db.select().from(otherAssets).where(eq(otherAssets.familyId, familyId)).orderBy(desc(otherAssets.updatedAt));
}

export async function getAssetRecord(assetId: string) {
  const db = await requireDatabase();
  const [result] = await db.select().from(otherAssets).where(eq(otherAssets.id, assetId)).limit(1);
  return result ?? null;
}

export async function updateAssetRecord(input: z.infer<typeof updateAssetSchema>) {
  const db = await requireDatabase();
  const existing = await getAssetRecord(input.assetId);
  if (!existing) throw notFound("Ativo não encontrado.");
  await db
    .update(otherAssets)
    .set({
      category: input.category,
      description: input.description,
      declaredValue: input.declaredValue.toFixed(2),
      ownerPersonId: input.ownerPersonId,
      notes: input.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(otherAssets.id, input.assetId));
  return { assetId: input.assetId };
}

/**
 * Exclusão do ativo: arquiva os documentos vinculados (DISPENSADO) e remove a
 * linha — nunca apaga arquivo enviado.
 */
export async function removeAssetRecord(
  familyId: string,
  assetId: string
): Promise<{ archivedDocuments: number }> {
  const db = await requireDatabase();
  const [asset] = await db
    .select()
    .from(otherAssets)
    .where(and(eq(otherAssets.id, assetId), eq(otherAssets.familyId, familyId)))
    .limit(1);
  if (!asset) throw notFound("Ativo não encontrado nesta família.");

  const docs = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(eq(documents.entityType, "ATIVO"), eq(documents.entityId, assetId))
    );
  for (const doc of docs) {
    await db
      .update(documents)
      .set({ status: "DISPENSADO" })
      .where(eq(documents.id, doc.id));
  }

  await db.delete(otherAssets).where(eq(otherAssets.id, assetId));
  return { archivedDocuments: docs.length };
}
