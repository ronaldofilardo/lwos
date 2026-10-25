import { and, eq, inArray, ne } from "drizzle-orm";
import { documents, people } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { badRequest } from "../_shared/errors";

/**
 * IRPF do dependente herda o status do IRPF do titular (Fase 8): o dependente
 * não envia o próprio IRPF — o upload é bloqueado e o status espelha o do
 * titular sempre que o IRPF titular muda (upload/review).
 */

async function findPrimaryContactId(familyId: string): Promise<string | null> {
  const db = await requireDatabase();
  const [titular] = await db
    .select({ id: people.id })
    .from(people)
    .where(
      and(eq(people.familyId, familyId), eq(people.isPrimaryContact, true))
    )
    .limit(1);
  return titular?.id ?? null;
}

type DocumentStatus =
  | "PENDENTE"
  | "RECEBIDO_EM_ANALISE"
  | "VALIDADO"
  | "REJEITADO"
  | "VENCIDO"
  | "DISPENSADO"
  | "NAO_POSSUI"
  | "NA";

async function getIrpfStatus(
  familyId: string,
  personId: string
): Promise<DocumentStatus | null> {
  const db = await requireDatabase();
  const [irpf] = await db
    .select({ status: documents.status })
    .from(documents)
    .where(
      and(
        eq(documents.familyId, familyId),
        eq(documents.entityType, "PESSOA"),
        eq(documents.entityId, personId),
        eq(documents.category, "IRPF")
      )
    )
    .limit(1);
  return (irpf?.status as DocumentStatus | undefined) ?? null;
}

/**
 * Copia o status do IRPF do titular para o IRPF de todos os dependentes da
 * família. Retorna quantos documentos foram atualizados.
 */
export async function syncDependentIrpfStatus(familyId: string): Promise<number> {
  const titularId = await findPrimaryContactId(familyId);
  if (!titularId) return 0;
  const titularStatus = await getIrpfStatus(familyId, titularId);
  if (!titularStatus) return 0;

  const db = await requireDatabase();
  const dependents = await db
    .select({ id: people.id })
    .from(people)
    .where(
      and(
        eq(people.familyId, familyId),
        eq(people.isDependent, true),
        ne(people.id, titularId)
      )
    );
  if (!dependents.length) return 0;

  const updated = await db
    .update(documents)
    .set({ status: titularStatus })
    .where(
      and(
        eq(documents.familyId, familyId),
        eq(documents.entityType, "PESSOA"),
        inArray(documents.entityId, dependents.map(row => row.id)),
        eq(documents.category, "IRPF")
      )
    )
    .returning({ id: documents.id });
  return updated.length;
}

/**
 * Bloqueia o upload do IRPF de um dependente — o IRPF é herdados do titular.
 * Lança erro com mensagem em pt-BR quando o documento é IRPF de dependente.
 */
export async function assertIrpfUploadAllowed(document: {
  familyId: string;
  entityType: string;
  entityId: string;
  category: string;
}): Promise<void> {
  if (document.entityType !== "PESSOA" || document.category !== "IRPF") return;
  const db = await requireDatabase();
  const [person] = await db
    .select({ isDependent: people.isDependent, vinculo: people.vinculo })
    .from(people)
    .where(eq(people.id, document.entityId))
    .limit(1);
  if (person?.isDependent && person.vinculo !== "TITULAR") {
    throw badRequest(
      "O IRPF do dependente herda o IRPF do titular — upload bloqueado."
    );
  }
}
