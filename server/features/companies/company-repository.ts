import { eq } from "drizzle-orm";
import { companyDetails, companies, companyStakeholders } from "../../../drizzle/schema";
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

function normalizeName(name: string | null) {
  const withoutAccents = (name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return withoutAccents
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");
}

export async function createCompanyRecord(input: z.infer<typeof companyInputSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(companies).values({ ...input, id, taxNumber: input.taxNumber || null });
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
        throw new Error("Este membro já participa da sociedade.");
      }
      if (externalName && existing.some(row => normalizeName(row.externalName) === normalizeName(externalName))) {
        throw new Error("Este não-membro já participa da sociedade.");
      }
      const total = totalPercentage(existing) + input.percentage;
      if (total > 100 + PCT_EPSILON) {
        throw new Error(
          `A soma das participações não pode passar de 100% (atual ${totalPercentage(existing)}%).`
        );
      }
      await tx
        .insert(companyStakeholders)
        .values({
          id,
          companyId: input.companyId,
          personId: input.personId ?? null,
          externalName,
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
        throw new Error("Participação não encontrada.");
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
      if (!personId && !externalName) {
        throw new Error("Informe um membro da família ou o nome do não-membro.");
      }
      if (personId && remaining.some(row => row.personId === personId)) {
        throw new Error("Este membro já participa da sociedade.");
      }
      if (
        externalName &&
        remaining.some(row => normalizeName(row.externalName) === normalizeName(externalName))
      ) {
        throw new Error("Este não-membro já participa da sociedade.");
      }

      const percentage = input.percentage ?? Number(stakeholder.percentage);
      const total = totalPercentage(remaining) + percentage;
      if (total > 100 + PCT_EPSILON) {
        throw new Error(
          `A soma das participações não pode passar de 100% (atual ${totalPercentage(remaining)}%).`
        );
      }

      await tx
        .update(companyStakeholders)
        .set({ personId, externalName, percentage: percentage.toFixed(2) })
        .where(eq(companyStakeholders.id, input.stakeholderId));
    }
  );
}

export async function removeStakeholderRecord(
  input: z.infer<typeof stakeholderDeleteSchema>
) {
  const db = await requireDatabase();
  const removed = await db
    .delete(companyStakeholders)
    .where(eq(companyStakeholders.id, input.stakeholderId))
    .returning({
      id: companyStakeholders.id,
      companyId: companyStakeholders.companyId,
    });
  const row = removed[0];
  if (!row || row.companyId !== input.companyId) {
    throw new Error("Participação não encontrada.");
  }
  return row.id;
}
