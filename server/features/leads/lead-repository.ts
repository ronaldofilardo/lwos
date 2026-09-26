import { and, desc, eq } from "drizzle-orm";
import {
  leads,
  families as familiesTable,
  projects,
  people,
  documents,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { storagePut, storageGetSignedUrl } from "../../storage";
import { documentCategoriesForVinculo } from "../documents/person-document-categories";
import { ensureCertidoesForSubject } from "../certidoes/certidao-repository";
import {
  ALLOWED_LEAD_MIME_TYPES,
  leadAcceptSchema,
  leadCreateSchema,
} from "./lead-types";
import type { z } from "zod";

export async function createLeadRecord(
  input: z.infer<typeof leadCreateSchema>
) {
  if (!ALLOWED_LEAD_MIME_TYPES.has(input.mimeType))
    throw new Error(
      "Tipo de arquivo não permitido. Envie uma imagem (JPEG/PNG/WEBP) ou PDF."
    );
  const bytes = Buffer.from(input.base64Data, "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("Arquivo inválido ou maior que 5 MB.");

  const db = await requireDatabase();
  const id = createId();
  const taxId = input.taxId.replace(/\D/g, "");
  const relativeKey = `leads/${id}/${input.fileName}`;
  const stored = await storagePut(relativeKey, bytes, input.mimeType);
  const storageKey = stored.key.split("\\").join("/");

  await db.insert(leads).values({
    id,
    fullName: input.fullName,
    taxId,
    email: input.email.toLowerCase().trim(),
    birthDate: input.birthDate,
    fileName: input.fileName,
    mimeType: input.mimeType,
    storageKey,
    status: "PENDENTE",
  });

  return { id };
}

export async function listLeadRecords() {
  const db = await requireDatabase();
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return Promise.all(
    rows.map(async lead => ({
      ...lead,
      fileUrl: await storageGetSignedUrl(lead.storageKey),
    }))
  );
}

export async function getLeadRecord(leadId: string) {
  const db = await requireDatabase();
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  return lead ?? null;
}

/** Usado pelo proxy de download (/local-storage/*) pra servir o arquivo anexado pelo interessado. */
export async function getLeadRecordByStorageKey(storageKey: string) {
  const db = await requireDatabase();
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.storageKey, storageKey))
    .limit(1);
  return lead ?? null;
}

/**
 * Aceite do SOCIO: cria a família, cadastra o interessado como pessoa titular
 * (isPrimaryContact) com os dados que ele já enviou (nome/CPF/e-mail/nascimento),
 * e marca o lead como ACEITO. Tudo dentro de uma única transação — se qualquer
 * etapa falhar, nenhuma alteração é persistida (evita famílias órfãs).
 *
 * Após o aceite, o SOCIO pode gerar um link de primeiro acesso token-based
 * via families.generateFirstAccessLink, que cria um registro em firstAccessLinks.
 */
export async function acceptLeadRecord(
  input: z.infer<typeof leadAcceptSchema>,
  reviewedBy: number
) {
  const lead = await getLeadRecord(input.leadId);
  if (!lead) throw new Error("Interessado não encontrado.");
  if (lead.status !== "PENDENTE")
    throw new Error("Este interessado já foi analisado.");

  const db = await requireDatabase();

  const result = await db.transaction(async tx => {
    const familyId = createId();
    const projectId = createId();
    await tx.insert(familiesTable).values({
      id: familyId,
      name: input.familyName,
      civilStatus: input.civilStatus,
      maritalRegime: input.maritalRegime,
      createdBy: String(reviewedBy),
    });
    await tx
      .insert(projects)
      .values({ id: projectId, familyId, title: input.familyName });

    const personId = createId();
    if (input.civilStatus) {
      await tx
        .update(people)
        .set({ isPrimaryContact: false })
        .where(eq(people.familyId, familyId));
    }
    await tx.insert(people).values({
      id: personId,
      familyId,
      fullName: lead.fullName,
      email: lead.email,
      taxId: lead.taxId,
      birthDate: lead.birthDate,
      civilStatus: input.civilStatus,
      maritalRegime: input.maritalRegime,
      vinculo: "TITULAR",
      isPrimaryContact: true,
    });
    await tx.insert(documents).values(
      documentCategoriesForVinculo("TITULAR").map(category => ({
        id: createId(),
        familyId,
        entityType: "PESSOA" as const,
        entityId: personId,
        category,
        status: "PENDENTE" as const,
        currentVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    const accepted = await tx
      .update(leads)
      .set({ status: "ACEITO", familyId, reviewedBy })
      .where(and(eq(leads.id, input.leadId), eq(leads.status, "PENDENTE")))
      .returning({ id: leads.id });
    if (accepted.length === 0)
      throw new Error("Este interessado já foi analisado.");

    return { familyId, personId };
  });

  // Fora da transação: o aceite já gravou a família e o titular — agora o
  // titular ganha a matriz de certidões (8 tipos) junto com os requisitos.
  await ensureCertidoesForSubject({
    familyId: result.familyId,
    scope: "PESSOA",
    subjectId: result.personId,
  });

  return result;
}

export async function rejectLeadRecord(
  leadId: string,
  reviewedBy: number,
  reviewNote?: string
) {
  const lead = await getLeadRecord(leadId);
  if (!lead) throw new Error("Interessado não encontrado.");
  if (lead.status !== "PENDENTE")
    throw new Error("Este interessado já foi analisado.");

  const db = await requireDatabase();
  const rejected = await db
    .update(leads)
    .set({ status: "RECUSADO", reviewedBy, reviewNote: reviewNote || null })
    .where(and(eq(leads.id, leadId), eq(leads.status, "PENDENTE")))
    .returning({ id: leads.id });
  if (rejected.length === 0)
    throw new Error("Este interessado já foi analisado.");

  return { success: true, leadId, fullName: lead.fullName };
}
