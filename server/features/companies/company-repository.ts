import { and, eq } from "drizzle-orm";
import {
  certidoes,
  companies,
  companyDetails,
  companyStakeholders,
  documents,
  propertyOwners,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type { companyInputSchema } from "./company-types";
import type {
  stakeholderDeleteSchema,
  stakeholderInputSchema,
  stakeholderUpdateSchema,
} from "./company-stakeholder";
import { withAdvisoryLock, AdvisoryLockKey } from "../../_shared/advisory-lock";
import { onlyDigits } from "../../../shared/validation/digitos";
import { normalizarCpf } from "../../../shared/validation/cpf";
import { badRequest, conflict, notFound } from "../_shared/errors";

/** Tolerância de fração de centavo na soma das participações. */
const PCT_EPSILON = 0.001;

type StakeholderRow = {
  personId: string | null;
  externalName: string | null;
  percentage: string | null;
};

function totalPercentage(rows: StakeholderRow[]) {
  return rows.reduce((sum, row) => sum + Number(row.percentage ?? 0), 0);
}

export function normalizeName(name: string | null) {
  const withoutAccents = (name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return withoutAccents
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");
}

/**
 * Documento gravado só com dígitos (convenção de `normalizarCnpj`): o índice
 * único (familyId, taxNumber) compara texto, então "12.345.678/0001-90" e
 * "12345678000190" seriam duas sociedades. A exibição usa `mascaraCnpj`.
 */
export function normalizeTaxNumber(value: string | null | undefined): string | null {
  const digits = onlyDigits(value ?? "");
  return digits || null;
}

export async function createCompanyRecord(input: z.infer<typeof companyInputSchema>) {
  const db = await requireDatabase();
  const id = createId();
  const taxNumber = normalizeTaxNumber(input.taxNumber);

  if (taxNumber) {
    // Compara por dígitos para pegar também linhas antigas gravadas com máscara.
    const sameFamily = await db
      .select({ id: companies.id, taxNumber: companies.taxNumber })
      .from(companies)
      .where(eq(companies.familyId, input.familyId));
    if (sameFamily.some(row => normalizeTaxNumber(row.taxNumber) === taxNumber)) {
      throw conflict("Já existe uma sociedade com este CNPJ nesta família.");
    }
  }

  await db.insert(companies).values({ ...input, id, taxNumber });
  return id;
}

export async function getCompanyRecord(companyId: string) {
  const db = await requireDatabase();
  const result = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  return result[0] ?? null;
}

export async function listCompanyRecords(familyId: string) {
  const db = await requireDatabase();
  return db
    .select({
      id: companies.id,
      familyId: companies.familyId,
      legalName: companies.legalName,
      taxNumber: companies.taxNumber,
      isOffshore: companies.isOffshore,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
      taxRegime: companyDetails.taxRegime,
      capitalSocial: companyDetails.capitalSocial,
      shareQuantity: companyDetails.shareQuantity,
      equity: companyDetails.equity,
      cashAndEquivalents: companyDetails.cashAndEquivalents,
      inventory: companyDetails.inventory,
      accountsReceivable: companyDetails.accountsReceivable,
      investments: companyDetails.investments,
      fixedAssets: companyDetails.fixedAssets,
      retainedEarnings: companyDetails.retainedEarnings,
      taxLiabilities: companyDetails.taxLiabilities,
      laborLiabilities: companyDetails.laborLiabilities,
      financing: companyDetails.financing,
      notes: companyDetails.notes,
    })
    .from(companies)
    .leftJoin(companyDetails, eq(companyDetails.companyId, companies.id))
    .where(eq(companies.familyId, familyId));
}

export async function listStakeholderRecords(companyId: string) {
  const db = await requireDatabase();
  return db.select().from(companyStakeholders).where(eq(companyStakeholders.companyId, companyId));
}

export async function createStakeholderRecord(input: z.infer<typeof stakeholderInputSchema>) {
  return withAdvisoryLock(
    requireDatabase(),
    "STAKEHOLDER_PERCENT",
    input.companyId,
    async (tx) => {
      const id = createId();
      const externalName = input.externalName?.trim() || null;
      const existing = await tx
        .select()
        .from(companyStakeholders)
        .where(eq(companyStakeholders.companyId, input.companyId));
      if (input.personId && existing.some(row => row.personId === input.personId)) {
        throw conflict("Este membro já participa da sociedade.");
      }
      if (externalName && existing.some(row => normalizeName(row.externalName) === normalizeName(externalName))) {
        throw conflict("Este não-membro já participa da sociedade.");
      }
      const total = totalPercentage(existing) + input.percentage;
      if (total > 100 + PCT_EPSILON) {
        throw badRequest(
          `A soma das participações não pode passar de 100% (atual ${totalPercentage(existing)}%).`
        );
      }
      const externalCpf = input.externalCpf
        ? normalizarCpf(input.externalCpf)
        : null;
      await tx
        .insert(companyStakeholders)
        .values({
          id,
          companyId: input.companyId,
          personId: input.personId ?? null,
          externalName,
          externalCpf,
          percentage: input.percentage.toFixed(2),
        });
      return id;
    }
  );
}

export async function updateStakeholderRecord(
  input: z.infer<typeof stakeholderUpdateSchema>
) {
  return withAdvisoryLock(
    requireDatabase(),
    "STAKEHOLDER_PERCENT",
    input.companyId,
    async (tx) => {
      const current = await tx
        .select()
        .from(companyStakeholders)
        .where(eq(companyStakeholders.id, input.stakeholderId))
        .limit(1);
      const stakeholder = current[0];
      if (!stakeholder || stakeholder.companyId !== input.companyId) {
        throw notFound("Participação não encontrada.");
      }
      const others = await tx
        .select()
        .from(companyStakeholders)
        .where(eq(companyStakeholders.companyId, input.companyId));
      const remaining = others.filter(row => row.id !== input.stakeholderId);

      const personId = input.personId !== undefined ? input.personId : stakeholder.personId;
      const externalName =
        input.externalName !== undefined
          ? input.externalName.trim() || null
          : stakeholder.externalName;
      const externalCpf =
        input.externalCpf !== undefined
          ? (input.externalCpf ? normalizarCpf(input.externalCpf) : null)
          : stakeholder.externalCpf;
      if (!personId && !externalName) {
        throw badRequest("Informe um membro da família ou o nome do não-membro.");
      }
      if (personId && remaining.some(row => row.personId === personId)) {
        throw conflict("Este membro já participa da sociedade.");
      }
      if (
        externalName &&
        remaining.some(row => normalizeName(row.externalName) === normalizeName(externalName))
      ) {
        throw conflict("Este não-membro já participa da sociedade.");
      }

      const percentage = input.percentage ?? Number(stakeholder.percentage);
      const total = totalPercentage(remaining) + percentage;
      if (total > 100 + PCT_EPSILON) {
        throw badRequest(
          `A soma das participações não pode passar de 100% (atual ${totalPercentage(remaining)}%).`
        );
      }

      await tx
        .update(companyStakeholders)
        .set({
          personId,
          externalName,
          externalCpf,
          percentage: percentage.toFixed(2),
        })
        .where(eq(companyStakeholders.id, input.stakeholderId));
    }
  );
}

export async function removeStakeholderRecord(
  input: z.infer<typeof stakeholderDeleteSchema>
) {
  const db = await requireDatabase();
  // O filtro por companyId vai no próprio DELETE: antes, a linha era apagada
  // e só depois comparada, o que removia sócio de outra sociedade/família.
  const removed = await db
    .delete(companyStakeholders)
    .where(
      and(
        eq(companyStakeholders.id, input.stakeholderId),
        eq(companyStakeholders.companyId, input.companyId)
      )
    )
    .returning({
      id: companyStakeholders.id,
      companyId: companyStakeholders.companyId,
    });
  const row = removed[0];
  if (!row || row.companyId !== input.companyId) {
    throw notFound("Participação não encontrada.");
  }
  return row.id;
}

export async function removeCompanyRecord(
  familyId: string,
  companyId: string
): Promise<{ archivedDocuments: number }> {
  const db = await requireDatabase();

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.familyId, familyId)))
    .limit(1);
  if (!company) throw notFound("Sociedade não encontrada nesta família.");

  const [owner] = await db
    .select({ id: propertyOwners.id })
    .from(propertyOwners)
    .where(eq(propertyOwners.companyId, companyId))
    .limit(1);
  if (owner) {
    throw conflict(
      "Não é possível excluir: a sociedade é titular de imóvel. Remova a titularidade antes."
    );
  }

  const documentsToArchive = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(
        eq(documents.familyId, familyId),
        eq(documents.entityType, "SOCIEDADE"),
        eq(documents.entityId, companyId)
      )
    );
  if (documentsToArchive.length) {
    await db
      .update(documents)
      .set({ status: "DISPENSADO" })
      .where(
        and(
          eq(documents.familyId, familyId),
          eq(documents.entityType, "SOCIEDADE"),
          eq(documents.entityId, companyId)
        )
      );
  }

  await db
    .delete(certidoes)
    .where(
      and(
        eq(certidoes.familyId, familyId),
        eq(certidoes.scope, "SOCIEDADE"),
        eq(certidoes.subjectId, companyId)
      )
    );

  await db
    .delete(companyStakeholders)
    .where(eq(companyStakeholders.companyId, companyId));

  await db
    .delete(companyDetails)
    .where(eq(companyDetails.companyId, companyId));

  await db
    .delete(companies)
    .where(eq(companies.id, companyId));

  return { archivedDocuments: documentsToArchive.length };
}
