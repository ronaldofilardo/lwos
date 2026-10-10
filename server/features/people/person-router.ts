import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { requireRole } from "../access/authorization";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit } from "../audit/audit-repository";
import { ensureCertidoesForSubject } from "../certidoes/certidao-repository";
import { findOrCreateDocumentRecord } from "../documents/document-repository";
import { storeDocumentVersion } from "../documents/document-upload";
import {
  computePersonCategories,
} from "../documents/person-document-categories";
import {
  reconcileEntityDocuments,
} from "../documents/document-requirements";
import {
  addPersonRecord,
  getPersonRecord,
  listPeopleByFamily,
  removePersonRecord,
  setPrimaryContact,
  updatePersonRecord,
} from "./person-repository";
import {
  attachDocumentsSchema,
  personInputSchema,
  personUpdateSchema,
  removePersonSchema,
  setPrimaryContactSchema,
} from "./person-types";

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
      const person = await getPersonRecord(personId);
      await recordAudit({
        action: "PESSOA_CRIADA",
        entityType: "PESSOA",
        entityId: personId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { isDependent: person?.isDependent ?? false },
      });
      return { personId };
    }),
  update: protectedProcedure
    .input(personUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const result = await updatePersonRecord(input);
      const person = await getPersonRecord(input.personId);
      let requirementsCreated = 0;
      let requirementsRemoved = 0;
      if (person) {
        const { created, removed } = await reconcileEntityDocuments({
          familyId: input.familyId,
          entityType: "PESSOA",
          entityId: input.personId,
          categories: computePersonCategories({
            vinculo: person.vinculo,
            civilStatus: person.civilStatus,
          }),
        });
        requirementsCreated = created;
        requirementsRemoved = removed;
      }
      await recordAudit({
        action: "PESSOA_ATUALIZADA",
        entityType: "PESSOA",
        entityId: input.personId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: {
          migratedFiles: result.migratedFiles,
          requirementsCreated,
          requirementsRemoved,
          isDependent: person?.isDependent ?? false,
        },
      });
      return result;
    }),
  remove: protectedProcedure
    .input(removePersonSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requireRole(ctx, TEAM_ROLES);
      await assertFamilyAccess(ctx, input.familyId);
      const result = await removePersonRecord(input.familyId, input.personId);
      await recordAudit({
        action: "PESSOA_EXCLUIDA",
        entityType: "PESSOA",
        entityId: input.personId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { archivedDocuments: result.archivedDocuments },
      });
      return result;
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
