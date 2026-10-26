import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { assertPersonInFamily } from "../access/entity-guards";
import { notFound } from "../_shared/errors";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { recordAudit } from "../audit/audit-repository";
import {
  createAssetRecord,
  getAssetRecord,
  listAssetRecords,
  removeAssetRecord,
  updateAssetRecord,
} from "./assets-repository";
import { createAssetSchema, removeAssetSchema, updateAssetSchema } from "./assets-types";

export const assetRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listAssetRecords(input.familyId);
  }),
  create: protectedProcedure.input(createAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_CREATE);
    await assertFamilyAccess(ctx, input.familyId);
    await assertPersonInFamily(input.ownerPersonId, input.familyId);
    const assetId = await createAssetRecord(input);
    await recordAudit({
      action: "ATIVO_CRIADO",
      entityType: "ATIVO",
      entityId: assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { category: input.category, description: input.description },
    });
    return { assetId };
  }),
  update: protectedProcedure.input(updateAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_UPDATE);
    const asset = await getAssetRecord(input.assetId);
    if (!asset) throw notFound("Ativo não encontrado.");
    await assertFamilyAccess(ctx, asset.familyId);
    await assertPersonInFamily(input.ownerPersonId, asset.familyId);
    const result = await updateAssetRecord(input);
    await recordAudit({
      action: "ATIVO_ATUALIZADO",
      entityType: "ATIVO",
      entityId: input.assetId,
      actorUserId: user.id,
      familyId: asset.familyId,
      metadata: { category: input.category, description: input.description },
    });
    return result;
  }),
  remove: protectedProcedure.input(removeAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.ASSET_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removeAssetRecord(input.familyId, input.assetId);
    await recordAudit({
      action: "ATIVO_EXCLUIDO",
      entityType: "ATIVO",
      entityId: input.assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments },
    });
    return result;
  }),
});
