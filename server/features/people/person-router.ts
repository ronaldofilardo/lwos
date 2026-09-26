import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "@shared/domain/roles";
import { requireRole } from "../access/authorization";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit } from "../audit/audit-repository";
import { ensureCertidoesForSubject } from "../certidoes/certidao-repository";
import { findOrCreateDocumentRecord } from "../documents/document-repository";
import { storeDocumentVersion } from "../documents/document-upload";
import {
  addPersonRecord,
  getPersonRecord,
  listPeopleByFamily,
  setPrimaryContact,
} from "./person-repository";
import { attachDocumentsSchema, personInputSchema, setPrimaryContactSchema } from "./person-types";

export const personRouter = router({
  list: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertFamilyAccess(ctx, input.familyId);
      return listPeopleByFamily(input.familyId);
    }),
  create: protectedProcedure
    .input(personInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      const personId = await addPersonRecord(input);
      await ensureCertidoesForSubject({
        familyId: input.familyId,
        scope: "PESSOA",
        subjectId: personId,
      });
      await recordAudit({
        action: "PESSOA_CRIADA",
        entityType: "PESSOA",
        entityId: personId,
        actorUserId: user.id,
        familyId: input.familyId,
      });
      return { personId };
    }),
  attachDocuments: protectedProcedure
    .input(attachDocumentsSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const person = await getPersonRecord(input.personId);
      if (!person || person.familyId !== input.familyId) {
        throw new Error("Pessoa não encontrada nesta família.");
      }

      const stored: { documentId: string; versionNumber: number; category: string }[] = [];
      for (const attachment of input.attachments) {
        const documentId = await findOrCreateDocumentRecord({
          familyId: input.familyId,
          entityType: "PESSOA",
          entityId: input.personId,
          category: attachment.category,
        });
        const result = await storeDocumentVersion({
          documentId,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          base64Data: attachment.base64Data,
          userId: user.id,
        });
        stored.push({
          documentId,
          versionNumber: result.versionNumber,
          category: attachment.category,
        });
      }

      await recordAudit({
        action: "ANEXOS_PESSOA_ENVIADOS",
        entityType: "PESSOA",
        entityId: input.personId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { count: stored.length, categories: stored.map(item => item.category).join(", ") },
      });
      return { stored };
    }),
  setPrimaryContact: protectedProcedure
    .input(setPrimaryContactSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      const { migratedFiles } = await setPrimaryContact(input);
      await recordAudit({
        action: "TITULAR_FAMILIA_DEFINIDO",
        entityType: "PESSOA",
        entityId: input.personId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { migratedFiles },
      });
      return { success: true, migratedFiles };
    }),
});
