import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { requireRole } from "../access/authorization";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit } from "../audit/audit-repository";
import { ensureCertidoesForSubject, listCertidaoRecords } from "../certidoes/certidao-repository";
import { COMPANY_DOCUMENT_CATEGORIES, ensureDocumentRequirements } from "../documents/document-requirements";
import { getPropertyRecord } from "../properties/property-repository";
import { listPeopleByFamily } from "../people/person-repository";
import {
  createCompanyRecord,
  createContributionRecord,
  createStakeholderRecord,
  getCompanyRecord,
  listCompanyRecords,
  listStakeholderRecords,
  removeStakeholderRecord,
  updateStakeholderRecord,
} from "./company-repository";
import { companyInputSchema, contributionInputSchema } from "./company-types";
import {
  companyDetailDocUpdateSchema,
  companyDetailsIdSchema,
  companyDetailsUpsertSchema,
  docTypesForCompanyType,
} from "./company-details";
import {
  computePerShare,
  getCompanyDetailsRecord,
  listCompanyDetailDocs,
  updateCompanyDetailDocRecord,
  upsertCompanyDetailsRecord,
} from "./company-details-repository";
import {
  stakeholderDeleteSchema,
  stakeholderInputSchema,
  stakeholderUpdateSchema,
} from "./company-stakeholder";

async function requireCompanyFamily(companyId: string) {
  const company = await getCompanyRecord(companyId);
  if (!company) throw new Error("Sociedade não encontrada.");
  return company;
}

export const companyRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listCompanyRecords(input.familyId);
  }),
  stakeholders: protectedProcedure.input(z.object({ companyId: z.string() })).query(async ({ ctx, input }) => {
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    return listStakeholderRecords(input.companyId);
  }),
  create: protectedProcedure.input(companyInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const companyId = await createCompanyRecord(input);
    await ensureCertidoesForSubject({
      familyId: input.familyId,
      scope: "SOCIEDADE",
      subjectId: companyId,
    });
    const requirements = await ensureDocumentRequirements({
      familyId: input.familyId,
      entityType: "SOCIEDADE",
      entityId: companyId,
      categories: COMPANY_DOCUMENT_CATEGORIES,
    });
    await recordAudit({
      action: "SOCIEDADE_CRIADA",
      entityType: "SOCIEDADE",
      entityId: companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { type: input.type, requirements: requirements.length },
    });
    return { companyId };
  }),
  createContribution: protectedProcedure.input(contributionInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const property = await getPropertyRecord(input.propertyId);
    if (!property) throw new Error("Imóvel não encontrado.");
    await assertFamilyAccess(ctx, property.familyId);
    const contributionId = await createContributionRecord(input);
    await recordAudit({ action: "INTEGRALIZACAO_REGISTRADA", entityType: "IMOVEL", entityId: input.propertyId, actorUserId: user.id, familyId: property.familyId, metadata: { contributionId } });
    return { contributionId };
  }),
  addStakeholder: protectedProcedure.input(stakeholderInputSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const stakeholderId = await createStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_REGISTRADA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId, percentage: input.percentage, personId: input.personId ?? "", externalName: input.externalName ?? "" },
    });
    return { stakeholderId };
  }),
  updateStakeholder: protectedProcedure.input(stakeholderUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    await updateStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_ATUALIZADA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId: input.stakeholderId },
    });
    return { success: true };
  }),
  removeStakeholder: protectedProcedure.input(stakeholderDeleteSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    await removeStakeholderRecord(input);
    await recordAudit({
      action: "PARTICIPACAO_SOCIETARIA_REMOVIDA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { stakeholderId: input.stakeholderId },
    });
    return { success: true };
  }),
  getDetails: protectedProcedure.input(companyDetailsIdSchema).query(async ({ ctx, input }) => {
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const [details, docs, stakeholders, certidoes, people] = await Promise.all([
      getCompanyDetailsRecord(company.id),
      listCompanyDetailDocs({ companyId: company.id, companyType: company.type }),
      listStakeholderRecords(company.id),
      listCertidaoRecords(company.familyId),
      listPeopleByFamily(company.familyId),
    ]);
    const names = new Map(people.map(person => [person.id, person.fullName]));
    return {
      company: {
        id: company.id,
        legalName: company.legalName,
        taxNumber: company.taxNumber,
        type: company.type,
      },
      details,
      docs,
      stakeholders: stakeholders.map(stakeholder => ({
        ...stakeholder,
        displayName:
          stakeholder.externalName ??
          (stakeholder.personId ? names.get(stakeholder.personId) ?? null : null),
      })),
      certidoes: certidoes.filter(
        row => row.scope === "SOCIEDADE" && row.subjectId === company.id
      ),
      perShare: computePerShare(details ?? {}),
    };
  }),
  upsertDetails: protectedProcedure.input(companyDetailsUpsertSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const allowed = new Set<string>(docTypesForCompanyType(company.type));
    for (const doc of input.docs ?? []) {
      if (!allowed.has(doc.docType)) {
        throw new Error("Documento inválido para o tipo desta sociedade.");
      }
    }
    await upsertCompanyDetailsRecord({ companyId: company.id, fields: input.fields });
    for (const doc of input.docs ?? []) {
      await updateCompanyDetailDocRecord({ ...doc, companyId: company.id });
    }
    await recordAudit({
      action: "DETALHES_HOLDING_SALVOS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: {
        type: company.type,
        documents: (input.docs ?? []).length,
        capitalSocial: input.fields.capitalSocial ?? 0,
      },
    });
    return { success: true };
  }),
  updateDetailDoc: protectedProcedure.input(companyDetailDocUpdateSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    const allowed = new Set<string>(docTypesForCompanyType(company.type));
    if (!allowed.has(input.docType)) {
      throw new Error("Documento inválido para o tipo desta sociedade.");
    }
    await updateCompanyDetailDocRecord(input);
    await recordAudit({
      action: "DETALHES_HOLDING_DOC_STATUS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: { docType: input.docType, status: input.status },
    });
    return { success: true };
  }),
});
