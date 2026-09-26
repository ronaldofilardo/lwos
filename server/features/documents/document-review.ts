import { eq } from "drizzle-orm";
import { documents } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { releaseSpouseCoupleDocs } from "./couple-docs";
import { getDocumentRecord } from "./document-repository";

export async function reviewDocumentRecord(input: {
  documentId: string;
  status: "VALIDADO" | "REJEITADO";
  rejectionReason?: string;
}) {
  if (input.status === "REJEITADO" && !input.rejectionReason) {
    throw new Error("Motivo da rejeição é obrigatório.");
  }
  const db = await requireDatabase();
  const document = await getDocumentRecord(input.documentId);
  await db
    .update(documents)
    .set({
      status: input.status,
      rejectionReason:
        input.status === "REJEITADO" ? input.rejectionReason : null,
    })
    .where(eq(documents.id, input.documentId));
  // Validação do titular em doc do casal → dispensa cópia do cônjuge.
  if (document && input.status === "VALIDADO") {
    await releaseSpouseCoupleDocs({
      familyId: document.familyId,
      entityType: document.entityType,
      entityId: document.entityId,
      category: document.category,
    });
  }
}

export async function dispenseDocumentRecord(input: {
  documentId: string;
  reason: string;
  requestedBy: string;
  approvedBy: string;
}) {
  if (!input.reason || input.reason.trim().length < 3) {
    throw new Error("Justificativa da dispensa é obrigatória.");
  }
  const db = await requireDatabase();
  await db
    .update(documents)
    .set({
      status: "DISPENSADO",
      dispensationReason: input.reason.trim(),
      dispensationRequestedBy: input.requestedBy,
      dispensationApprovedBy: input.approvedBy,
      dispensedAt: new Date(),
    })
    .where(eq(documents.id, input.documentId));
}
