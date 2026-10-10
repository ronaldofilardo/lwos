import { and, eq, ne } from "drizzle-orm";
import {
  documents,
  people,
  propertyOwners,
  companyStakeholders,
  otherAssets,
} from "../../../drizzle/schema";
import { getFamilyRecord } from "../families/family-repository";
import { migrateFamilyStorageFolder } from "../../lib/family-storage-migration";
import {
  findFamilyIdByPrimaryContactCpf,
  resolveFamilyStorageFolder,
} from "../../lib/family-storage-path";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { computePersonCategories } from "../documents/person-document-categories";
import { syncDependentIrpfStatus } from "../documents/dependent-irpf";
import {
  collectPersonIssues,
  isMarriedStatus,
} from "./person-types";
import { idadeEmAnosCompletos, isNascimentoValido } from "../../../shared/validation";
import type { z } from "zod";
import type {
  personInputSchema,
  personUpdateSchema,
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

function isMinor(birthDate: string | null | undefined): boolean {
  return Boolean(
    birthDate && isNascimentoValido(birthDate) && idadeEmAnosCompletos(birthDate) < 18
  );
}

/** Estado civil/regime gravados: menor sempre solteiro; não casado sem regime. */
function resolveCivilFields(input: {
  vinculo: string;
  civilStatus?: string | null;
  maritalRegime?: string | null;
  birthDate?: string | null;
}): {
  civilStatus: "SOLTEIRO" | "DIVORCIADO" | "VIUVO" | "CASADO" | "UNIAO_ESTAVEL";
  maritalRegime: "CPB" | "CUB" | "STB" | "STOB" | "NA";
} {
  let civilStatus = input.civilStatus ?? undefined;
  let maritalRegime = input.maritalRegime ?? undefined;
  if (isMinor(input.birthDate)) {
    civilStatus = "SOLTEIRO";
    maritalRegime = "NA";
  } else if (input.vinculo === "CONJUGE") {
    civilStatus = civilStatus ?? "CASADO";
    maritalRegime = maritalRegime ?? "CPB";
  } else if (civilStatus && !isMarriedStatus(civilStatus)) {
    maritalRegime = "NA";
  }
  return {
    civilStatus: civilStatus as
      | "SOLTEIRO"
      | "DIVORCIADO"
      | "VIUVO"
      | "CASADO"
      | "UNIAO_ESTAVEL",
    maritalRegime: maritalRegime as "CPB" | "CUB" | "STB" | "STOB" | "NA",
  };
}

/** CPF já usado por outra pessoa do mesmo projeto (erro). */
async function assertCpfNotDuplicatedInFamily(
  familyId: string,
  taxId: string,
  excludePersonId?: string
) {
  const db = await requireDatabase();
  const query = excludePersonId
    ? and(
        eq(people.familyId, familyId),
        eq(people.taxId, taxId),
        ne(people.id, excludePersonId)
      )
    : and(eq(people.familyId, familyId), eq(people.taxId, taxId));
  const [duplicate] = await db
    .select({ id: people.id, fullName: people.fullName })
    .from(people)
    .where(query)
    .limit(1);
  if (duplicate) {
    throw new Error(
      `Este CPF já está cadastrado neste projeto (${duplicate.fullName}).`
    );
  }
}

/** Segundo cônjuge no mesmo projeto (erro) — o índice único também barra. */
async function assertConjugeNotDuplicated(familyId: string) {
  const db = await requireDatabase();
  const [existing] = await db
    .select({ id: people.id })
    .from(people)
    .where(and(eq(people.familyId, familyId), eq(people.vinculo, "CONJUGE")))
    .limit(1);
  if (existing) {
    throw new Error(
      "Este projeto já possui um cônjuge. Edite o registro existente."
    );
  }
}

/**
 * Marcar isDependent exige que o IRPF do titular já esteja recebido
 * (RECEBIDO_EM_ANALISE ou VALIDADO) — o dependente herda o IRPF do titular.
 */
async function assertTitularIrpfReceived(familyId: string) {
  const db = await requireDatabase();
  const [titular] = await db
    .select({ id: people.id })
    .from(people)
    .where(
      and(eq(people.familyId, familyId), eq(people.isPrimaryContact, true))
    )
    .limit(1);
  if (!titular) {
    throw new Error("Defina o titular antes de marcar um dependente.");
  }
  const [irpf] = await db
    .select({ status: documents.status })
    .from(documents)
    .where(
      and(
        eq(documents.familyId, familyId),
        eq(documents.entityType, "PESSOA"),
        eq(documents.entityId, titular.id),
        eq(documents.category, "IRPF")
      )
    )
    .limit(1);
  if (
    !irpf ||
    (irpf.status !== "RECEBIDO_EM_ANALISE" && irpf.status !== "VALIDADO")
  ) {
    throw new Error(
      "O IRPF do titular precisa estar recebido para marcar um dependente."
    );
  }
}

/** Coerência entre gerações: filho não pode nascer antes do pai/mãe. */
async function assertBirthAfterParent(
  familyId: string,
  parentPersonId: string,
  birthDate: string
) {
  const db = await requireDatabase();
  const [parent] = await db
    .select({ birthDate: people.birthDate, fullName: people.fullName })
    .from(people)
    .where(
      and(eq(people.id, parentPersonId), eq(people.familyId, familyId))
    )
    .limit(1);
  if (parent?.birthDate && birthDate < parent.birthDate) {
    throw new Error(
      `Data de nascimento anterior à do pai/mãe (${parent.fullName}). Confira as datas.`
    );
  }
}

export async function addPersonRecord(
  input: z.infer<typeof personInputSchema>
) {
  const db = await requireDatabase();
  const id = createId();

  const issues = collectPersonIssues(input);
  if (issues.length) throw new Error(issues[0].message);

  if (input.vinculo === "NETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "FILHO");
  }
  if (input.vinculo === "BISNETO" && input.parentPersonId) {
    await assertParentMatches(input.familyId, input.parentPersonId, "NETO");
  }
  if (input.parentPersonId && input.birthDate) {
    await assertBirthAfterParent(
      input.familyId,
      input.parentPersonId,
      input.birthDate
    );
  }

  await assertCpfNotDuplicatedInFamily(input.familyId, input.taxId);
  if (input.vinculo === "CONJUGE") {
    await assertConjugeNotDuplicated(input.familyId);
  }

  const { civilStatus, maritalRegime } = resolveCivilFields(input);

  if (input.isDependent && input.vinculo !== "TITULAR") {
    await assertTitularIrpfReceived(input.familyId);
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
      isDependent: input.isDependent ?? false,
      phone: input.phone || null,
      addressSameAsPrimary: input.addressSameAsPrimary ?? false,
      cep: input.addressSameAsPrimary ? null : input.cep || null,
      street: input.addressSameAsPrimary ? null : input.street || null,
      number: input.addressSameAsPrimary ? null : input.number || null,
      complement: input.addressSameAsPrimary ? null : input.complement || null,
      district: input.addressSameAsPrimary ? null : input.district || null,
      city: input.addressSameAsPrimary ? null : input.city || null,
      uf: input.addressSameAsPrimary ? null : input.uf || null,
    });
    // Cônjuge não recebe os documentos do casal (certidão/endereço) — só o
    // titular apresenta; ver person-document-categories.ts.
    await tx.insert(documents).values(
      computePersonCategories({
        vinculo: input.vinculo,
        civilStatus,
      }).map(category => ({
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
  if (input.isDependent && input.vinculo !== "TITULAR") {
    await syncDependentIrpfStatus(input.familyId);
  }
  return id;
}

export async function updatePersonRecord(
  input: z.infer<typeof personUpdateSchema>
) {
  const db = await requireDatabase();

  const [person] = await db
    .select()
    .from(people)
    .where(
      and(eq(people.id, input.personId), eq(people.familyId, input.familyId))
    )
    .limit(1);
  if (!person) throw new Error("Pessoa não encontrada nesta família.");

  const issues = collectPersonIssues({ ...input, vinculo: person.vinculo ?? "" });
  if (issues.length) throw new Error(issues[0].message);

  if (person.parentPersonId && input.birthDate) {
    await assertBirthAfterParent(
      input.familyId,
      person.parentPersonId,
      input.birthDate
    );
  }

  if (input.taxId && input.taxId !== person.taxId) {
    await assertCpfNotDuplicatedInFamily(
      input.familyId,
      input.taxId,
      input.personId
    );
  }

  const { civilStatus, maritalRegime } = resolveCivilFields({
    vinculo: person.vinculo ?? "",
    civilStatus: input.civilStatus ?? person.civilStatus,
    maritalRegime: input.maritalRegime ?? person.maritalRegime,
    birthDate: input.birthDate,
  });

  const isDependent = input.isDependent ?? person.isDependent ?? false;
  if (isDependent && person.vinculo !== "TITULAR") {
    await assertTitularIrpfReceived(input.familyId);
  }

  const taxChanged = Boolean(input.taxId) && input.taxId !== person.taxId;
  const needsMigration = taxChanged && person.isPrimaryContact && Boolean(input.taxId);
  let oldFolder = "";
  let migratedFiles = 0;

  await db.transaction(async tx => {
    if (needsMigration && input.taxId) {
      await assertCpfNotUsedByAnotherFamily(input.taxId, input.familyId);
      oldFolder = await resolveFamilyStorageFolder(input.familyId);
    }
    await tx
      .update(people)
      .set({
        fullName: input.fullName,
        email: input.email || null,
        taxId: input.taxId || null,
        birthDate: input.birthDate || null,
        civilStatus: civilStatus!,
        maritalRegime: maritalRegime!,
        exSpouseNote: input.exSpouseNote || null,
        spouseName: input.spouseName?.trim() || null,
        isDependent,
        phone: input.phone || null,
        addressSameAsPrimary: input.addressSameAsPrimary ?? false,
        cep: input.addressSameAsPrimary ? null : input.cep || null,
        street: input.addressSameAsPrimary ? null : input.street || null,
        number: input.addressSameAsPrimary ? null : input.number || null,
        complement: input.addressSameAsPrimary ? null : input.complement || null,
        district: input.addressSameAsPrimary ? null : input.district || null,
        city: input.addressSameAsPrimary ? null : input.city || null,
        uf: input.addressSameAsPrimary ? null : input.uf || null,
      })
      .where(eq(people.id, input.personId));
  });

  if (needsMigration) {
    const newFolder = await resolveFamilyStorageFolder(input.familyId);
    migratedFiles = (await migrateFamilyStorageFolder(
      input.familyId,
      oldFolder,
      newFolder
    )).migratedFiles;
  }

  if (isDependent && person.vinculo !== "TITULAR") {
    await syncDependentIrpfStatus(input.familyId);
  }

  return { personId: input.personId, migratedFiles };
}

/**
 * Exclui a pessoa quando não há vínculos blockers. Documentos e arquivos
 * enviados permanecem no sistema (arquivados) — nada é apagado do disco.
 */
export async function removePersonRecord(
  familyId: string,
  personId: string
): Promise<{ archivedDocuments: number }> {
  const db = await requireDatabase();

  const [person] = await db
    .select()
    .from(people)
    .where(and(eq(people.id, personId), eq(people.familyId, familyId)))
    .limit(1);
  if (!person) throw new Error("Pessoa não encontrada nesta família.");

  if (person.isPrimaryContact) {
    throw new Error(
      "Não é possível excluir o titular do projeto. Defina outro titular antes."
    );
  }

  const [child] = await db
    .select({ id: people.id })
    .from(people)
    .where(eq(people.parentPersonId, personId))
    .limit(1);
  if (child) {
    throw new Error(
      "Não é possível excluir: existem filhos/netos dependentes desta pessoa na árvore."
    );
  }

  const [owner] = await db
    .select({ id: propertyOwners.id })
    .from(propertyOwners)
    .where(eq(propertyOwners.personId, personId))
    .limit(1);
  if (owner) {
    throw new Error(
      "Não é possível excluir: a pessoa é titular de imóvel."
    );
  }

  const [stakeholder] = await db
    .select({ id: companyStakeholders.id })
    .from(companyStakeholders)
    .where(eq(companyStakeholders.personId, personId))
    .limit(1);
  if (stakeholder) {
    throw new Error(
      "Não é possível excluir: a pessoa tem participação em sociedade."
    );
  }

  const [asset] = await db
    .select({ id: otherAssets.id })
    .from(otherAssets)
    .where(eq(otherAssets.ownerPersonId, personId))
    .limit(1);
  if (asset) {
    throw new Error(
      "Não é possível excluir: a pessoa é responsável por ativos."
    );
  }

  const documentsToArchive = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(eq(documents.familyId, familyId), eq(documents.entityId, personId))
    );
  if (documentsToArchive.length) {
    await db
      .update(documents)
      .set({ status: "DISPENSADO" })
      .where(
        and(eq(documents.familyId, familyId), eq(documents.entityId, personId))
      );
  }

  await db.delete(people).where(eq(people.id, personId));
  return { archivedDocuments: documentsToArchive.length };
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
