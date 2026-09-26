import { and, eq } from "drizzle-orm";
import { documents, people } from "../../../drizzle/schema";
import { getFamilyRecord } from "../families/family-repository";
import { migrateFamilyStorageFolder } from "../../lib/family-storage-migration";
import {
  findFamilyIdByPrimaryContactCpf,
  resolveFamilyStorageFolder,
} from "../../lib/family-storage-path";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { documentCategoriesForVinculo } from "../documents/person-document-categories";
import { isMarriedStatus } from "./person-types";
import type { z } from "zod";
import type {
  personInputSchema,
  setPrimaryContactSchema,
} from "./person-types";

/**
 * Garante que este CPF não é titular de OUTRA família — evita duas famílias
 * apontando pra mesma pasta de storage por erro de digitação. Lança erro com
 * o nome da família conflitante, pra facilitar corrigir o cadastro.
 */
async function assertCpfNotUsedByAnotherFamily(
  taxId: string,
  familyId: string
) {
  const conflictingFamilyId = await findFamilyIdByPrimaryContactCpf(
    taxId,
    familyId
  );
  if (!conflictingFamilyId) return;

  const conflictingFamily = await getFamilyRecord(conflictingFamilyId);
  const familyLabel =
    conflictingFamily?.name ?? `família ${conflictingFamilyId}`;
  throw new Error(
    `Este CPF já é o titular de outra família (${familyLabel}). Corrija o CPF ou defina outra pessoa como titular.`
  );
}

async function assertParentMatches(
  familyId: string,
  parentPersonId: string,
  expectedVinculo: "FILHO" | "NETO"
) {
  const db = await requireDatabase();
  const [parent] = await db
    .select({
      id: people.id,
      vinculo: people.vinculo,
      fullName: people.fullName,
    })
    .from(people)
    .where(and(eq(people.id, parentPersonId), eq(people.familyId, familyId)))
    .limit(1);
  if (!parent) throw new Error("Pai/mãe não encontrado nesta família.");
  if (parent.vinculo !== expectedVinculo) {
    throw new Error(
      expectedVinculo === "FILHO"
        ? "O pai/mãe de um neto(a) deve ter vínculo Filho(a)."
        : "O pai/mãe de um bisneto(a) deve ter vínculo Neto(a)."
    );
  }
  return parent;
}

export async function addPersonRecord(
  input: z.infer<typeof personInputSchema>
) {
  const db = await requireDatabase();
  const id = createId();

  if (input.vinculo === "NETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "FILHO");
  }
  if (input.vinculo === "BISNETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "NETO");
  }

  // Cônjuge do titular: estado civil/regime espelham a família — não vem do form.
  let civilStatus = input.civilStatus;
  let maritalRegime = input.maritalRegime;
  if (input.vinculo === "CONJUGE") {
    const family = await getFamilyRecord(input.familyId);
    if (!family) throw new Error("Família não encontrada.");
    civilStatus = family.civilStatus;
    maritalRegime = family.maritalRegime;
  } else if (civilStatus && !isMarriedStatus(civilStatus)) {
    maritalRegime = "NA";
  }

  await db.transaction(async tx => {
    if (input.isPrimaryContact && input.taxId) {
      await assertCpfNotUsedByAnotherFamily(input.taxId, input.familyId);
      await tx
        .update(people)
        .set({ isPrimaryContact: false })
        .where(eq(people.familyId, input.familyId));
    }
    await tx.insert(people).values({
      id,
      familyId: input.familyId,
      fullName: input.fullName,
      email: input.email || null,
      taxId: input.taxId || null,
      birthDate: input.birthDate || null,
      civilStatus: civilStatus!,
      maritalRegime: maritalRegime!,
      exSpouseNote: input.exSpouseNote || null,
      vinculo: input.vinculo,
      parentPersonId: input.parentPersonId || null,
      spouseName: input.spouseName?.trim() || null,
      isPrimaryContact: input.isPrimaryContact ?? false,
    });
    // Cônjuge não recebe os documentos do casal (certidão/endereço) — só o
    // titular apresenta; ver person-document-categories.ts.
    await tx.insert(documents).values(
      documentCategoriesForVinculo(input.vinculo).map(category => ({
        id: createId(),
        familyId: input.familyId,
        entityType: "PESSOA" as const,
        entityId: id,
        category,
        status: "PENDENTE" as const,
        currentVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  });
  return id;
}

export async function getPersonRecord(personId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);
  return result[0] ?? null;
}

export async function listPeopleByFamily(familyId: string) {
  const db = await requireDatabase();
  return db.select().from(people).where(eq(people.familyId, familyId));
}

export async function getPrimaryContact(familyId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(people)
    .where(
      and(eq(people.familyId, familyId), eq(people.isPrimaryContact, true))
    )
    .limit(1);
  return result[0] ?? null;
}

/**
 * Troca o titular da família: desmarca o titular atual, marca personId, e
 * migra os arquivos já enviados da pasta de storage antiga (CPF anterior)
 * pra pasta nova (CPF do novo titular) — ver server/lib/family-storage-migration.ts.
 * A validação de CPF e a troca de titular ocorrem dentro da mesma transação
 * para evitar race conditions (TOCTOU).
 */
export async function setPrimaryContact(
  input: z.infer<typeof setPrimaryContactSchema>
): Promise<{ migratedFiles: number }> {
  const db = await requireDatabase();

  let oldFolder = "";
  await db.transaction(async tx => {
    const [candidate] = await tx
      .select({ id: people.id, taxId: people.taxId, familyId: people.familyId })
      .from(people)
      .where(
        and(eq(people.id, input.personId), eq(people.familyId, input.familyId))
      )
      .limit(1);
    if (!candidate) throw new Error("Pessoa não encontrada nesta família.");

    if (candidate.taxId) {
      await assertCpfNotUsedByAnotherFamily(candidate.taxId, input.familyId);
    }

    oldFolder = await resolveFamilyStorageFolder(input.familyId);

    await tx
      .update(people)
      .set({ isPrimaryContact: false })
      .where(eq(people.familyId, input.familyId));
    await tx
      .update(people)
      .set({ isPrimaryContact: true })
      .where(
        and(eq(people.familyId, input.familyId), eq(people.id, input.personId))
      );
  });

  const newFolder = await resolveFamilyStorageFolder(input.familyId);
  return migrateFamilyStorageFolder(input.familyId, oldFolder, newFolder);
}
