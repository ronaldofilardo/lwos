import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import {
  findOrCreateDocumentRecord,
  getDocumentRecord,
  listDocumentRecords,
  listVersions,
} from "./document-repository";
import {
  dispenseDocumentRecord,
  reviewDocumentRecord,
} from "./document-review";
import {
  createDocumentSchema,
  dispenseDocumentSchema,
  reviewDocumentSchema,
  uploadVersionSchema,
} from "./document-types";
import { storeDocumentVersion } from "./document-upload";
import { ensureFamilyDocumentRequirements } from "./document-requirements";

export const documentRouter = router({
  list: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return listDocumentRecords(input.familyId);
    }),
  versions: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await getDocumentRecord(input.documentId);
      if (!document) return [];
      await assertFamilyAccess(ctx, document.familyId);
      return listVersions(input.documentId);
    }),
  create: protectedProcedure
    .input(createDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const documentId = await findOrCreateDocumentRecord(input);
      await recordAudit({
        action: "DOCUMENTO_CRIADO",
        entityType: "DOCUMENTO",
        entityId: documentId,
        actorUserId: user.id,
        familyId: input.familyId,
      });
      return { documentId };
    }),
  generateRequirements: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const created = await ensureFamilyDocumentRequirements(input.familyId);
      await recordAudit({
        action: "REQUISITOS_DOCUMENTAIS_GERADOS",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { created },
      });
      return { created };
    }),
  uploadVersion: protectedProcedure
    .input(uploadVersionSchema)
    .mutation(async ({ ctx, input }) => {
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw new Error("Documento não encontrado.");
      const user = await assertFamilyAccess(ctx, document.familyId);
      const result = await storeDocumentVersion({ ...input, userId: user.id });
      await recordAudit({
        action: "VERSAO_DOCUMENTO_ENVIADA",
        entityType: "DOCUMENTO",
        entityId: input.documentId,
        actorUserId: user.id,
        familyId: document.familyId,
        metadata: { version: result.versionNumber },
      });
      return result;
    }),
  review: protectedProcedure
    .input(reviewDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, ["SOCIO"]);
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw new Error("Documento não encontrado.");
      await reviewDocumentRecord(input);
      await recordAudit({
        action: `DOCUMENTO_${input.status}`,
        entityType: "DOCUMENTO",
        entityId: input.documentId,
        actorUserId: user.id,
        familyId: document.familyId,
      });
      return { success: true };
    }),
  dispense: protectedProcedure
    .input(dispenseDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, ["SOCIO"]);
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw new Error("Documento não encontrado.");
      await dispenseDocumentRecord({
        documentId: input.documentId,
        reason: input.reason,
        requestedBy: input.requestedBy || String(user.id),
        approvedBy: String(user.id),
      });
      await recordAudit({
        action: "DOCUMENTO_DISPENSADO",
        entityType: "DOCUMENTO",
        entityId: input.documentId,
        actorUserId: user.id,
        familyId: document.familyId,
        metadata: {
          reason: input.reason,
          requestedBy: input.requestedBy || "SOLICITANTE_NAO_INFORMADO",
        },
      });
      return { success: true };
    }),
  /** Upload de balanço fechado / balancete de uma sociedade, com data-base. */
  uploadBalance: protectedProcedure
    .input(
      z.object({
        familyId: z.string().min(1),
        companyId: z.string().min(1),
        category: z.enum(["Balanço fechado", "Balancete atualizado"]),
        referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(120).default("application/pdf"),
        base64Data: z.string().min(8).max(8_000_000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const documentId = await findOrCreateDocumentRecord({
        familyId: input.familyId,
        entityType: "SOCIEDADE",
        entityId: input.companyId,
        category: input.category,
        referenceDate: input.referenceDate,
      });
      const result = await storeDocumentVersion({
        documentId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        base64Data: input.base64Data,
        userId: user.id,
      });
      await recordAudit({
        action: "BALANCO_ENVIADO",
        entityType: "SOCIEDADE",
        entityId: input.companyId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: {
          category: input.category,
          referenceDate: input.referenceDate,
          version: result.versionNumber,
        },
      });
      return { documentId, versionNumber: result.versionNumber };
    }),
});
