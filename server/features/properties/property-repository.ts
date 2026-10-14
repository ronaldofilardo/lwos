import { desc, eq, and } from "drizzle-orm";
import {
  documents,
  propertyOwners,
  properties,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { isEncumbranceRed } from "./property-types";
import type { z } from "zod";
import type {
  propertyInputSchema,
  propertyOwnerDeleteSchema,
  propertyOwnerInputSchema,
  propertyOwnerUpdateSchema,
  propertyUpdateSchema,
} from "./property-types";

/** Tolerância de fração de centavo na soma das titularidades. */
const PCT_EPSILON = 0.001;

function totalOwnership(rows: { ownershipPercentage: string | null }[]) {
  return rows.reduce((sum, row) => sum + Number(row.ownershipPercentage ?? 0), 0);
}

function money(value: number | undefined): string | null {
  return value === undefined ? null : value.toFixed(2);
}

/** Normaliza os campos opcionais do imóvel para gravação (create/update). */
function propertyValues(
  input:
    | z.infer<typeof propertyInputSchema>
    | z.infer<typeof propertyUpdateSchema>
) {
  return {
    description: input.description,
    kind: input.kind ?? null,
    uf: input.uf ?? null,
    cep: input.cep ? input.cep.replace(/\D/g, "").slice(0, 8) || null : null,
    hasRegistration: input.hasRegistration,
    registrationNumber: input.hasRegistration
      ? input.registrationNumber || null
      : null,
    alternativeDocType: input.hasRegistration
      ? null
      : input.alternativeDocType || null,
    noRegistrationReason: input.hasRegistration
      ? null
      : input.noRegistrationReason || null,
    registryOfficeNumber: input.registryOfficeNumber ?? null,
    registryUf: input.registryUf ?? null,
    registryCity: input.registryCity || null,
    propertyCity: input.propertyCity,
    inscricaoImobiliaria: input.inscricaoImobiliaria || null,
    ccir: input.ccir || null,
    nirf: input.nirf || null,
    notes: input.notes || null,
    acquisitionDate: input.acquisitionDate || null,
    irpfBalanceValue: money(input.declaredValue),
    marketValue: money(input.marketValue),
    venalValue: money(input.venalValue),
    irGcapValue: money(input.irGcapValue),
    emolumentsValue: money(input.emolumentsValue),
    itbiRate: money(input.itbiRate),
    hasLaudemio: input.hasLaudemio,
    laudemioRate: input.hasLaudemio ? money(input.laudemioRate) : null,
    utility: input.utility,
    rentValue:
      input.utility === "LOCACAO_ARRENDAMENTO" ? money(input.rentValue) : null,
    encumbranceType: input.encumbranceType,
    encumbranceNote: input.encumbranceNote || null,
  };
}

export async function createPropertyRecord(
  input: z.infer<typeof propertyInputSchema>
) {
  const db = await requireDatabase();
  const id = createId();

  const existingProperty = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.familyId, input.familyId),
        eq(properties.description, input.description),
        eq(properties.propertyCity, input.propertyCity)
      )
    )
    .limit(1);

  if (existingProperty.length > 0) {
    return existingProperty[0].id;
  }

  await db.insert(properties).values({
    ...propertyValues(input),
    id,
    familyId: input.familyId,
  });
  return id;
}

export async function updatePropertyRecord(
  input: z.infer<typeof propertyUpdateSchema>
) {
  const db = await requireDatabase();
  const [current] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, input.propertyId))
    .limit(1);
  if (!current) throw new Error("Imóvel não encontrado.");

  await db
    .update(properties)
    .set({ ...propertyValues(input), updatedAt: new Date() })
    .where(eq(properties.id, input.propertyId));
  return { propertyId: input.propertyId };
}

/**
 * Exclui o imóvel quando não há titularidade. Documentos e arquivos enviados
 * permanecem no sistema (arquivados) — nada é apagado do disco.
 */
export async function removePropertyRecord(
  familyId: string,
  propertyId: string
): Promise<{ archivedDocuments: number }> {
  const db = await requireDatabase();

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.familyId, familyId)))
    .limit(1);
  if (!property) throw new Error("Imóvel não encontrado nesta família.");

  const [owner] = await db
    .select({ id: propertyOwners.id })
    .from(propertyOwners)
    .where(eq(propertyOwners.propertyId, propertyId))
    .limit(1);
  if (owner) {
    throw new Error(
      "Não é possível excluir: remova as titularidades do imóvel antes."
    );
  }

  const documentsToArchive = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(eq(documents.familyId, familyId), eq(documents.entityId, propertyId))
    );
  if (documentsToArchive.length) {
    await db
      .update(documents)
      .set({ status: "DISPENSADO" })
      .where(
        and(
          eq(documents.familyId, familyId),
          eq(documents.entityId, propertyId)
        )
      );
  }

  await db.delete(properties).where(eq(properties.id, propertyId));
  return { archivedDocuments: documentsToArchive.length };
}

export async function listPropertyRecords(familyId: string) {
  const db = await requireDatabase();
  return db
    .select()
    .from(properties)
    .where(eq(properties.familyId, familyId))
    .orderBy(desc(properties.updatedAt));
}

export async function getPropertyRecord(propertyId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  return result[0] ?? null;
}

export async function addPropertyOwnerRecord(
  input: z.infer<typeof propertyOwnerInputSchema>
) {
  const db = await requireDatabase();
  const id = createId();
  await db.transaction(async tx => {
    const existing = await tx
      .select()
      .from(propertyOwners)
      .where(eq(propertyOwners.propertyId, input.propertyId));
    const duplicate =
      (input.personId && existing.some(row => row.personId === input.personId)) ||
      (input.companyId && existing.some(row => row.companyId === input.companyId));
    if (duplicate) {
      throw new Error("Este membro já está vinculado a este imóvel.");
    }
    const total = totalOwnership(existing) + input.ownershipPercentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades não pode passar de 100% (atual ${totalOwnership(existing)}%).`
      );
    }
    await tx.insert(propertyOwners).values({
      ...input,
      id,
      personId: input.personId ?? null,
      companyId: input.companyId ?? null,
      ownershipPercentage: input.ownershipPercentage.toFixed(2),
    });
  });
  return id;
}

/** Bloqueia vínculo com sociedade enquanto o gravame estiver vermelho. */
export async function assertCompanyOwnershipAllowed(propertyId: string) {
  const property = await getPropertyRecord(propertyId);
  if (property && isEncumbranceRed(property.encumbranceType)) {
    throw new Error(
      "Imóvel com gravame ativo: remova o gravame (ou marque como Não há) antes de vincular a uma sociedade."
    );
  }
}

/** Bloqueia alteração de titularidade (movimentação) com gravame vermelho. */
export async function assertPropertyMovementAllowed(propertyId: string) {
  const property = await getPropertyRecord(propertyId);
  if (property && isEncumbranceRed(property.encumbranceType)) {
    throw new Error(
      "Imóvel com gravame ativo: remova o gravame (ou marque como Não há) antes de alterar a titularidade."
    );
  }
}

export async function updatePropertyOwnerRecord(
  input: z.infer<typeof propertyOwnerUpdateSchema>
) {
  const db = await requireDatabase();
  await db.transaction(async tx => {
    const current = await tx
      .select()
      .from(propertyOwners)
      .where(eq(propertyOwners.id, input.ownerId))
      .limit(1);
    const owner = current[0];
    if (!owner || owner.propertyId !== input.propertyId) {
      throw new Error("Titularidade não encontrada.");
    }
    const others = await tx
      .select()
      .from(propertyOwners)
      .where(eq(propertyOwners.propertyId, input.propertyId));
    const remaining = others.filter(row => row.id !== input.ownerId);

    const personId = input.personId ?? owner.personId;
    const companyId = input.companyId ?? owner.companyId;
    if (Boolean(personId) === Boolean(companyId)) {
      throw new Error(
        "A titularidade exige exatamente um dono: pessoa ou sociedade."
      );
    }
    const duplicate =
      (personId && remaining.some(row => row.personId === personId)) ||
      (companyId && remaining.some(row => row.companyId === companyId));
    if (duplicate) {
      throw new Error("Este membro já está vinculado a este imóvel.");
    }
    const percentage =
      input.ownershipPercentage ?? Number(owner.ownershipPercentage);
    const total = totalOwnership(remaining) + percentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades não pode passar de 100% (atual ${totalOwnership(remaining)}%).`
      );
    }

    await tx
      .update(propertyOwners)
      .set({
        personId: personId ?? null,
        companyId: companyId ?? null,
        ownershipPercentage: percentage.toFixed(2),
        rightType: input.rightType ?? owner.rightType,
      })
      .where(eq(propertyOwners.id, input.ownerId));
  });
}

export async function removePropertyOwnerRecord(
  input: z.infer<typeof propertyOwnerDeleteSchema>
) {
  const db = await requireDatabase();
  const removed = await db
    .delete(propertyOwners)
    .where(eq(propertyOwners.id, input.ownerId))
    .returning({ id: propertyOwners.id, propertyId: propertyOwners.propertyId });
  const row = removed[0];
  if (!row || row.propertyId !== input.propertyId) {
    throw new Error("Titularidade não encontrada.");
  }
  return row.id;
}

export async function listPropertyOwners(propertyId: string) {
  const db = await requireDatabase();
  return db
    .select()
    .from(propertyOwners)
    .where(eq(propertyOwners.propertyId, propertyId));
}
