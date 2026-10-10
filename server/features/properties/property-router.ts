import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import {
  computePropertyCategories,
  reconcileEntityDocuments,
} from "../documents/document-requirements";
import {
  addPropertyOwnerRecord,
  assertCompanyOwnershipAllowed,
  assertPropertyMovementAllowed,
  createPropertyRecord,
  getPropertyRecord,
  listPropertyOwners,
  listPropertyRecords,
  removePropertyRecord,
  removePropertyOwnerRecord,
  updatePropertyOwnerRecord,
  updatePropertyRecord,
} from "./property-repository";
import {
  propertyInputSchema,
  propertyOwnerDeleteSchema,
  propertyOwnerInputSchema,
  propertyOwnerUpdateSchema,
  propertyUpdateSchema,
  removePropertySchema,
} from "./property-types";

export const propertyRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listPropertyRecords(input.familyId);
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
    const { created, removed } = await reconcileEntityDocuments({
      familyId: input.familyId,
      entityType: "IMOVEL",
      entityId: propertyId,
      categories: computePropertyCategories(input),
    });
    await recordAudit({
      action: "IMOVEL_CRIADO",
      entityType: "IMOVEL",
      entityId: propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { requirements: created, requirementsRemoved: removed },
    });
    return { propertyId };
  }),
  update: protectedProcedure.input(propertyUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const result = await updatePropertyRecord(input);
    const updated = await getPropertyRecord(input.propertyId);
    let requirementsCreated = 0;
    let requirementsRemoved = 0;
    if (updated) {
      const reconciled = await reconcileEntityDocuments({
        familyId: property.familyId,
        entityType: "IMOVEL",
        entityId: input.propertyId,
        categories: computePropertyCategories(updated),
      });
      requirementsCreated = reconciled.created;
      requirementsRemoved = reconciled.removed;
    }
    await recordAudit({
      action: "IMOVEL_ATUALIZADO",
      entityType: "IMOVEL",
      entityId: input.propertyId,
      actorUserId: user.id,
      familyId: property.familyId,
      metadata: { requirementsCreated, requirementsRemoved },
    });
    return result;
  }),
  remove: protectedProcedure.input(removePropertySchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removePropertyRecord(input.familyId, input.propertyId);
    await recordAudit({
      action: "IMOVEL_EXCLUIDO",
      entityType: "IMOVEL",
      entityId: input.propertyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments },
    });
    return result;
  }),
  addOwner: protectedProcedure.input(propertyOwnerInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    if (input.companyId) await assertCompanyOwnershipAllowed(input.propertyId);
    else await assertPropertyMovementAllowed(input.propertyId);
    const ownerId = await addPropertyOwnerRecord(input);
    await recordAudit({ action: "TITULARIDADE_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { ownerId, personId: input.personId ?? "", companyId: input.companyId ?? "", ownershipPercentage: input.ownershipPercentage } });
    return { ownerId };
  }),
  updateOwner: protectedProcedure.input(propertyOwnerUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    if (input.companyId) await assertCompanyOwnershipAllowed(input.propertyId);
    else await assertPropertyMovementAllowed(input.propertyId);
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
