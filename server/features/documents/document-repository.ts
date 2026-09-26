import { and, desc, eq } from "drizzle-orm";
import { documentVersions, documents } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import { documentEntitySchema } from "./document-types";
import type { createDocumentSchema } from "./document-types";

export async function createDocumentRecord(
  input: z.infer<typeof createDocumentSchema>
) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(documents).values({
    ...input,
    id,
    validUntil: input.validUntil || null,
  });
  return id;
}

/**
 * Localiza o requisito documental da entidade e, se não existir, cria.
 * Usado pelo anexo opcional do formulário de pessoa (categorias novas como
 * "Certidão de estado civil" não estão na matriz automática).
 */
export async function findOrCreateDocumentRecord(input: {
  familyId: string;
  entityType: z.infer<typeof documentEntitySchema>;
  entityId: string;
  category: string;
}) {
  const db = await requireDatabase();
  const existing = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(
        eq(documents.familyId, input.familyId),
        eq(documents.entityType, input.entityType),
        eq(documents.entityId, input.entityId),
        eq(documents.category, input.category)
      )
    )
    .limit(1);
  if (existing[0]) return existing[0].id;

  const id = createId();
  await db.insert(documents).values({
    id,
    familyId: input.familyId,
    entityType: input.entityType,
    entityId: input.entityId,
    category: input.category,
    status: "PENDENTE",
    currentVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getDocumentRecord(documentId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  return result[0] ?? null;
}

export async function listDocumentRecords(familyId: string) {
  const db = await requireDatabase();
  return db
    .select()
    .from(documents)
    .where(eq(documents.familyId, familyId))
    .orderBy(desc(documents.updatedAt));
}

export async function listVersions(documentId: string) {
  const db = await requireDatabase();
  return db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber));
}

/**
 * Busca reversa: a partir da storageKey (usada na rota de download
 * /local-storage/*), descobre a qual família o arquivo pertence — pra dar
 * pra checar permissão antes de servir o arquivo.
 */
export async function getDocumentVersionByStorageKey(storageKey: string) {
  const db = await requireDatabase();
  const [row] = await db
    .select({ familyId: documents.familyId, documentId: documents.id })
    .from(documentVersions)
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(eq(documentVersions.storageKey, storageKey))
    .limit(1);
  return row ?? null;
}
