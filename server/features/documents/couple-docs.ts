import { and, eq, inArray, ne } from "drizzle-orm";
import { documents, people } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import {
  COUPLE_SHARED_CATEGORIES,
  isCoupleSharedCategory,
} from "./person-document-categories";

/**
 * Quando o titular apresenta (envia versão de) um documento do casal,
 * dispensa automaticamente a cópia pendente do cônjuge — o casal não
 * precisa anexar o mesmo comprovante duas vezes.
 *
 * No-op se a categoria não é do casal ou se o documento não é de pessoa.
 */
export async function releaseSpouseCoupleDocs(sourceDocument: {
  familyId: string;
  entityType: string;
  entityId: string;
  category: string;
}): Promise<number> {
  if (sourceDocument.entityType !== "PESSOA") return 0;
  if (!isCoupleSharedCategory(sourceDocument.category)) return 0;

  const db = await requireDatabase();

  const [spouse] = await db
    .select({ id: people.id })
    .from(people)
    .where(
      and(
        eq(people.familyId, sourceDocument.familyId),
        eq(people.vinculo, "CONJUGE"),
        ne(people.id, sourceDocument.entityId)
      )
    )
    .limit(1);
  if (!spouse) return 0;

  const updated = await db
    .update(documents)
    .set({
      status: "DISPENSADO",
      dispensationReason:
        "Documento do casal — apresentado pelo titular (não exigido do cônjuge).",
      dispensationRequestedBy: "SISTEMA",
      dispensationApprovedBy: "SISTEMA",
      dispensedAt: new Date(),
      rejectionReason: null,
    })
    .where(
      and(
        eq(documents.familyId, sourceDocument.familyId),
        eq(documents.entityType, "PESSOA"),
        eq(documents.entityId, spouse.id),
        eq(documents.category, sourceDocument.category),
        eq(documents.status, "PENDENTE"),
        inArray(documents.category, [...COUPLE_SHARED_CATEGORIES])
      )
    )
    .returning({ id: documents.id });

  return updated.length;
}
