import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "@shared/domain/roles";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import { ensureDocumentRequirements, PROPERTY_DOCUMENT_CATEGORIES } from "../documents/document-requirements";
import {
  addEncumbranceRecord,
  addPropertyOwnerRecord,
  createPropertyRecord,
  getPropertyRecord,
  listEncumbrances,
  listPropertyOwners,
  listPropertyRecords,
  removePropertyOwnerRecord,
  updatePropertyOwnerRecord,
} from "./property-repository";
import {
  encumbranceInputSchema,
  propertyInputSchema,
  propertyOwnerDeleteSchema,
  propertyOwnerInputSchema,
  propertyOwnerUpdateSchema,
} from "./property-types";

export const propertyRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPropertyRecords(input.familyId);
  }),
  encumbrances: protectedProcedure.input(z.object({ propertyId: z.string() })).query(async ({ ctx, input }) => {
    const property = await getPropertyRecord(input.propertyId);
    if (!property) return [];
    await assertFamilyAccess(ctx, property.familyId);
    return listEncumbrances(input.propertyId);
  }),
  owners: protectedProcedure.input(z.object({ propertyId: z.string() })).query(async ({ ctx, input }) => {
    const property = await getPropertyRecord(input.propertyId);
    if (!property) return [];
    await assertFamilyAccess(ctx, property.familyId);
    return listPropertyOwners(input.propertyId);
  }),
  create: protectedProcedure.input(propertyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const propertyId = await createPropertyRecord(input);
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "IMOVEL",
      entityId: propertyId,
      categories: input.hasRegistration
        ? PROPERTY_DOCUMENT_CATEGORIES.withRegistration
        : PROPERTY_DOCUMENT_CATEGORIES.withoutRegistration,
    });
    await recordAudit({
      action: "IMOVEL_CRIADO",
      entityType: "IMOVEL",
      entityId: propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { requirements: requirements.length },
    });
    return { propertyId };
  }),
  addEncumbrance: protectedProcedure.input(encumbranceInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const encumbranceId = await addEncumbranceRecord(input);
    await recordAudit({ action: "GRAVAME_CADASTRADO", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { encumbranceId, type: input.type } });
    return { encumbranceId };
  }),
  addOwner: protectedProcedure.input(propertyOwnerInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const ownerId = await addPropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId, personId: input.personId, ownershipPercentage: input.ownershipPercentage } });
    return { ownerId };
  }),
  updateOwner: protectedProcedure.input(propertyOwnerUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    await updatePropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_ATUALIZADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId: input.ownerId } });
    return { success: true };
  }),
  removeOwner: protectedProcedure.input(propertyOwnerDeleteSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    await removePropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REMOVIDA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId: input.ownerId } });
    return { success: true };
  }),
});
