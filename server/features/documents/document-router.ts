import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { badRequest, notFound } from "../_shared/errors";
import { hoje } from "../../../shared/validation/datas";
import { requiresReferenceDate } from "../../../shared/domain/balance-documents";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { recordAudit } from "../audit/audit-repository";
import {
  findOrCreateDocumentRecord,
  getDocumentRecord,
  listDocumentRecords,
  listVersions,
  setDocumentReferenceDate,
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
import { reconcileFamilyDocumentRequirements } from "./document-requirements";

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
      const user = requirePermission(ctx, Permission.DOCUMENT_CREATE);
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
      const user = requirePermission(ctx, Permission.DOCUMENT_GENERATE_REQUIREMENTS);
      await assertFamilyAccess(ctx, input.familyId);
      const { created, removed } = await reconcileFamilyDocumentRequirements(
        input.familyId
      );
      await recordAudit({
        action: "REQUISITOS_DOCUMENTAIS_GERADOS",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { created, removed },
      });
      return { created, removed };
    }),
  uploadVersion: protectedProcedure
    .input(uploadVersionSchema)
    .mutation(async ({ ctx, input }) => {
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw notFound("Documento não encontrado.");
      const user = requirePermission(ctx, Permission.DOCUMENT_UPLOAD_VERSION);
      await assertFamilyAccess(ctx, document.familyId);

      const { referenceDate, ...file } = input;
      // Balanço/balancete só entram na Matriz com a data-base (não pode ser futura).
      const isBalance = requiresReferenceDate(document);
      if (isBalance && !referenceDate) {
        throw badRequest("Informe a data-base do balanço/balancete.");
      }
      if (isBalance && referenceDate && referenceDate > hoje()) {
        throw badRequest("A data-base não pode ser uma data futura.");
      }

      const result = await storeDocumentVersion({ ...file, userId: user.id });
      if (isBalance && referenceDate) {
        await setDocumentReferenceDate(input.documentId, referenceDate);
      }
      await recordAudit({
        action: "VERSAO_DOCUMENTO_ENVIADA",
        entityType: "DOCUMENTO",
        entityId: input.documentId,
        actorUserId: user.id,
        familyId: document.familyId,
        metadata:
          isBalance && referenceDate
            ? { version: result.versionNumber, category: document.category, referenceDate }
            : { version: result.versionNumber },
      });
      return result;
    }),
  review: protectedProcedure
    .input(reviewDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.DOCUMENT_REVIEW);
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw notFound("Documento não encontrado.");
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
      const user = requirePermission(ctx, Permission.DOCUMENT_DISPENSE);
      const document = await getDocumentRecord(input.documentId);
      if (!document) throw notFound("Documento não encontrado.");
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
});
