import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { documentVersions, documents } from "../../../drizzle/schema";
import { resolveFamilyStorageFolder } from "../../lib/family-storage-path";
import { storagePut } from "../../storage";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { releaseSpouseCoupleDocs } from "./couple-docs";
import { getDocumentRecord } from "./document-repository";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function storeDocumentVersion(input: {
  documentId: string;
  fileName: string;
  mimeType: string;
  base64Data: string;
  userId: number;
}) {
  if (!ALLOWED_MIME_TYPES.has(input.mimeType))
    throw new Error("Tipo de arquivo não permitido.");
  const document = await getDocumentRecord(input.documentId);
  if (!document) throw new Error("Documento não encontrado.");
  const bytes = Buffer.from(input.base64Data, "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("Arquivo inválido ou maior que 5 MB.");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const nextVersion = document.currentVersion + 1;

  // Pasta por família = CPF do titular (com fallback pro id da família, ver
  // resolveFamilyStorageFolder). Ex: storage/12345678900/{documentId}/v1/arquivo.pdf
  const familyFolder = await resolveFamilyStorageFolder(document.familyId);
  const relativeKey = `${familyFolder}/${document.id}/v${nextVersion}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);

  const db = await requireDatabase();
  await db.transaction(async tx => {
    await tx.insert(documentVersions).values({
      id: createId(),
      documentId: document.id,
      versionNumber: nextVersion,
      originalName: input.fileName,
      mimeType: input.mimeType,
      storageKey: stored.key,
      sha256,
      uploadedBy: String(input.userId),
    });
    await tx
      .update(documents)
      .set({
        currentVersion: nextVersion,
        status: "RECEBIDO_EM_ANALISE",
        rejectionReason: null,
      })
      .where(eq(documents.id, document.id));
  });
  // Titular apresentou documento do casal → dispensa cópia pendente do cônjuge.
  await releaseSpouseCoupleDocs({
    familyId: document.familyId,
    entityType: document.entityType,
    entityId: document.entityId,
    category: document.category,
  });
  return { versionNumber: nextVersion, sha256, storageKey: stored.key };
}
