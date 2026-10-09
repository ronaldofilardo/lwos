import { z } from "zod";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import {
  createAssetRecord,
  getAssetRecord,
  listAssetRecords,
  removeAssetRecord,
  updateAssetRecord,
} from "./assets-repository";
import { createAssetSchema, removeAssetSchema, updateAssetSchema } from "./assets-types";
import { ASSET_DOCUMENT_CATEGORIES, ensureDocumentRequirements } from "../documents/document-requirements";

export const assetRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listAssetRecords(input.familyId);
  }),
  create: protectedProcedure.input(createAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const assetId = await createAssetRecord(input);
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "ATIVO",
      entityId: assetId,
      categories: ASSET_DOCUMENT_CATEGORIES,
    });
    await recordAudit({
      action: "ATIVO_CRIADO",
      entityType: "ATIVO",
      entityId: assetId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { category: input.category, description: input.description, requirements: requirements.length },
    });
    return { assetId };
  }),
  update: protectedProcedure.input(updateAssetSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const asset = await getAssetRecord(input.assetId);
    if (!asset) throw new Error("Ativo não encontrado.");
    await assertFamilyAccess(ctx, asset.familyId);
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
    const user = requireRole(ctx, TEAM_ROLES);
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
