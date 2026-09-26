import { z } from "zod";
import { TEAM_ROLES } from "@shared/domain/roles";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import { createAssetRecord, listAssetRecords } from "./assets-repository";
import { createAssetSchema } from "./assets-types";
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
});
