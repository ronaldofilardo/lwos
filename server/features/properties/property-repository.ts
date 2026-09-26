import { desc, eq } from "drizzle-orm";
import { encumbrances, properties, propertyOwners } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type {
  encumbranceInputSchema,
  propertyInputSchema,
  propertyOwnerDeleteSchema,
  propertyOwnerInputSchema,
  propertyOwnerUpdateSchema,
} from "./property-types";

/** Tolerância de fração de centavo na soma das titularidades. */
const PCT_EPSILON = 0.001;

function totalOwnership(rows: { ownershipPercentage: string | null }[]) {
  return rows.reduce((sum, row) => sum + Number(row.ownershipPercentage ?? 0), 0);
}

export async function createPropertyRecord(input: z.infer<typeof propertyInputSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(properties).values({
    ...input,
    id,
    hasRegistration: input.hasRegistration,
    registrationNumber: input.hasRegistration ? (input.registrationNumber || null) : null,
    alternativeDocType: input.hasRegistration ? null : (input.alternativeDocType || null),
    noRegistrationReason: input.hasRegistration ? null : (input.noRegistrationReason || null),
    registryOffice: input.registryOffice || null,
    registryCity: input.registryCity || null,
    acquisitionDate: input.acquisitionDate || null,
    declaredValue: input.declaredValue?.toFixed(2) ?? null,
    marketValue: input.marketValue?.toFixed(2) ?? null,
  });
  return id;
}

export async function listPropertyRecords(familyId: string) {
  const db = await requireDatabase();
  return db.select().from(properties).where(eq(properties.familyId, familyId)).orderBy(desc(properties.updatedAt));
}

export async function getPropertyRecord(propertyId: string) {
  const db = await requireDatabase();
  const result = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  return result[0] ?? null;
}

export async function addEncumbranceRecord(input: z.infer<typeof encumbranceInputSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(encumbrances).values({ ...input, id });
  return id;
}

export async function listEncumbrances(propertyId: string) {
  const db = await requireDatabase();
  return db.select().from(encumbrances).where(eq(encumbrances.propertyId, propertyId));
}

export async function addPropertyOwnerRecord(input: z.infer<typeof propertyOwnerInputSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.transaction(async tx => {
    const existing = await tx
      .select()
      .from(propertyOwners)
      .where(eq(propertyOwners.propertyId, input.propertyId));
    if (existing.some(row => row.personId === input.personId)) {
      throw new Error("Este membro já está vinculado a este imóvel.");
    }
    const total = totalOwnership(existing) + input.ownershipPercentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades não pode passar de 100% (atual ${totalOwnership(existing)}%).`
      );
    }
    await tx
      .insert(propertyOwners)
      .values({ ...input, id, ownershipPercentage: input.ownershipPercentage.toFixed(2) });
  });
  return id;
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
    if (remaining.some(row => row.personId === personId)) {
      throw new Error("Este membro já está vinculado a este imóvel.");
    }
    const percentage = input.ownershipPercentage ?? Number(owner.ownershipPercentage);
    const total = totalOwnership(remaining) + percentage;
    if (total > 100 + PCT_EPSILON) {
      throw new Error(
        `A soma das titularidades não pode passar de 100% (atual ${totalOwnership(remaining)}%).`
      );
    }

    await tx
      .update(propertyOwners)
      .set({
        personId,
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
  return db.select().from(propertyOwners).where(eq(propertyOwners.propertyId, propertyId));
}

