import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { documentVersions, documents } from "../../../drizzle/schema";
import { resolveFamilyStorageFolder } from "../../lib/family-storage-path";
import { storagePut } from "../../storage";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { releaseSpouseCoupleDocs } from "./couple-docs";
import {
  assertIrpfUploadAllowed,
  syncDependentIrpfStatus,
} from "./dependent-irpf";
import { getDocumentRecord } from "./document-repository";
import { assertStorageSize } from "../../../shared/validation/storage-limits";
import { withAdvisoryLock, AdvisoryLockKey } from "../../_shared/advisory-lock";

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
  await assertIrpfUploadAllowed(document);
  const bytes = Buffer.from(input.base64Data, "base64");
  assertStorageSize(bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const nextVersion = document.currentVersion + 1;

  // Pasta por família = CPF do titular (com fallback pro id da família, ver
  // resolveFamilyStorageFolder). Ex: storage/12345678900/{documentId}/v1/arquivo.pdf
  const familyFolder = await resolveFamilyStorageFolder(document.familyId);
  const relativeKey = `${familyFolder}/${document.id}/v${nextVersion}/${input.fileName}`;

  // Upload do arquivo ANTES da transação (storage é idempotente por key).
  // Se a transação falhar, o arquivo fica órfão — limpeza periódica resolve.
  const stored = await storagePut(relativeKey, bytes, input.mimeType);

  // Lock por documento para evitar race na versão (duplo envio simultâneo).
  return withAdvisoryLock(
    requireDatabase(),
    "DOCUMENT_UPLOAD",
    document.id,
    async (tx) => {
      // Re-lê o documento dentro da transação para pegar o currentVersion atual.
      const [currentDoc] = await tx
        .select({ currentVersion: documents.currentVersion })
        .from(documents)
        .where(eq(documents.id, document.id))
        .limit(1);
      if (!currentDoc) throw new Error("Documento não encontrado.");

      const versionNumber = currentDoc.currentVersion + 1;

      await tx.insert(documentVersions).values({
        id: createId(),
        documentId: document.id,
        versionNumber,
        originalName: input.fileName,
        mimeType: input.mimeType,
        storageKey: stored.key,
        sha256,
        uploadedBy: String(input.userId),
      });
      await tx
        .update(documents)
        .set({
          currentVersion: versionNumber,
          status: "RECEBIDO_EM_ANALISE",
          rejectionReason: null,
        })
        .where(eq(documents.id, document.id));

      // Titular apresentou documento do casal → dispensa cópia pendente do cônjuge.
      await releaseSpouseCoupleDocs({
        familyId: document.familyId,
        entityType: document.entityType,
        entityId: document.entityId,
        category: document.category,
      });
      // IRPF do titular enviado → espelha status nos dependentes.
      if (document.entityType === "PESSOA" && document.category === "IRPF") {
        await syncDependentIrpfStatus(document.familyId);
      }
      return { versionNumber, sha256, storageKey: stored.key };
    }
  );
}
