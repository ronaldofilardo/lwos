import { desc, eq } from "drizzle-orm";
import { otherAssets } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type { createAssetSchema } from "./assets-types";

export async function createAssetRecord(input: z.infer<typeof createAssetSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(otherAssets).values({
    ...input,
    id,
    declaredValue: input.declaredValue?.toFixed(2) ?? null,
    marketValue: input.marketValue?.toFixed(2) ?? null,
    ownerPersonId: input.ownerPersonId || null,
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
