import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit } from "../audit/audit-repository";
import { ensureCertidoesForSubject, listCertidaoRecords } from "../certidoes/certidao-repository";
import {
  computeCompanyCategories,
  reconcileEntityDocuments,
} from "../documents/document-requirements";
import { listPeopleByFamily } from "../people/person-repository";
import {
  createCompanyRecord,
  createStakeholderRecord,
  getCompanyRecord,
  listCompanyRecords,
  listStakeholderRecords,
  normalizeName,
  removeCompanyRecord,
  removeStakeholderRecord,
  updateStakeholderRecord,
} from "./company-repository";
import { companyInputSchema, removeCompanySchema } from "./company-types";
import {
  companyDetailsIdSchema,
  companyDetailsUpsertSchema,
} from "./company-details";
import {
  computePerShare,
  getCompanyDetailsRecord,
  upsertCompanyDetailsRecord,
} from "./company-details-repository";
import {
  stakeholderDeleteSchema,
  stakeholderInputSchema,
  stakeholderUpdateSchema,
} from "./company-stakeholder";
import { fetchCompanyByCnpj } from "./brasilapi-client";
import { mapBrasilApiToCompanyData } from "./brasilapi-mapper";

async function requireCompanyFamily(companyId: string) {
  const company = await getCompanyRecord(companyId);
  if (!company) throw new Error("Sociedade não encontrada.");
  return company;
}

export const companyRouter = router({
  lookupCnpj: protectedProcedure
    .input(z.object({ cnpj: z.string().min(14) }))
    .query(async ({ input }) => {
      const apiData = await fetchCompanyByCnpj(input.cnpj);
      if (!apiData) return null;
      return mapBrasilApiToCompanyData(apiData);
    }),
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
    const user = requirePermission(ctx, Permission.COMPANY_CREATE);
    await assertFamilyAccess(ctx, input.familyId);

    let finalLegalName = input.legalName;
    let mappedData = null;
    let fromApi = false;

    if (!input.isOffshore && input.taxNumber) {
      const apiData = await fetchCompanyByCnpj(input.taxNumber);
      if (apiData) {
        fromApi = true;
        mappedData = mapBrasilApiToCompanyData(apiData);
        if (mappedData.legalName) {
          finalLegalName = mappedData.legalName;
        }
      }
    }

    const companyId = await createCompanyRecord({
      ...input,
      legalName: finalLegalName,
    });

    if (mappedData) {
      await upsertCompanyDetailsRecord({
        companyId,
        fields: {
          uf: mappedData.uf,
          sede: mappedData.sede,
          cep: mappedData.cep,
          street: mappedData.street,
          number: mappedData.number,
          complement: mappedData.complement,
          district: mappedData.district,
          city: mappedData.city,
          societaryType: mappedData.societaryType,
          taxRegime: mappedData.taxRegime,
          corporatePurpose: mappedData.corporatePurpose,
          capitalSocial: mappedData.capitalSocial,
          administrator1: mappedData.administrator1,
          administrator2: mappedData.administrator2,
        },
      });

      if (mappedData.stakeholders.length) {
        const people = (await listPeopleByFamily(input.familyId)) ?? [];
        for (const item of mappedData.stakeholders) {
          try {
            const match = people.find(
              p => normalizeName(p.fullName) === normalizeName(item.name)
            );
            await createStakeholderRecord({
              companyId,
              personId: match?.id,
              externalName: match ? undefined : item.name,
              percentage: 0,
            });
          } catch {
            // Ignora duplicidades pontuais de sócios
          }
        }
      }
    }

    // Certidões e requisitos nacionais não se aplicam a offshore.
    let requirementsCount = 0;
    if (!input.isOffshore) {
      await ensureCertidoesForSubject({
        familyId: input.familyId,
        scope: "SOCIEDADE",
        subjectId: companyId,
      });
    }
    const reconciled = await reconcileEntityDocuments({
      familyId: input.familyId,
      entityType: "SOCIEDADE",
      entityId: companyId,
      categories: computeCompanyCategories({
        isOffshore: input.isOffshore,
        societaryType: mappedData?.societaryType ?? null,
      }),
    });
    requirementsCount = reconciled.created;
    await recordAudit({
      action: "SOCIEDADE_CRIADA",
      entityType: "SOCIEDADE",
      entityId: companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { isOffshore: input.isOffshore, requirements: requirementsCount, fromApi },
    });
    return { companyId, fromApi };
  }),
  remove: protectedProcedure.input(removeCompanySchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.COMPANY_REMOVE);
    await assertFamilyAccess(ctx, input.familyId);
    const result = await removeCompanyRecord(input.familyId, input.companyId);
    await recordAudit({
      action: "SOCIEDADE_EXCLUIDA",
      entityType: "SOCIEDADE",
      entityId: input.companyId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { archivedDocuments: result.archivedDocuments },
    });
    return result;
  }),
  addStakeholder: protectedProcedure.input(stakeholderInputSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.COMPANY_ADD_STAKEHOLDER);
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
    const user = requirePermission(ctx, Permission.COMPANY_UPDATE_STAKEHOLDER);
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
    const user = requirePermission(ctx, Permission.COMPANY_REMOVE_STAKEHOLDER);
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
    const [details, stakeholders, certidoes, people] = await Promise.all([
      getCompanyDetailsRecord(company.id),
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
        isOffshore: company.isOffshore,
      },
      details,
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
    const user = requirePermission(ctx, Permission.COMPANY_UPSERT_DETAILS);
    const company = await requireCompanyFamily(input.companyId);
    await assertFamilyAccess(ctx, company.familyId);
    // Offshore: exige jurisdição e identificador estrangeiro; não usa regime
    // tributário brasileiro.
    if (company.isOffshore) {
      if (!input.fields.jurisdiction) {
        throw new Error("Informe a jurisdição da sociedade offshore.");
      }
      if (!input.fields.companyNumber) {
        throw new Error("Informe o identificador estrangeiro (company number).");
      }
      if (input.fields.taxRegime) {
        throw new Error("Sociedade offshore não usa regime tributário brasileiro.");
      }
    }
    await upsertCompanyDetailsRecord({ companyId: company.id, fields: input.fields });
    const { created, removed } = await reconcileEntityDocuments({
      familyId: company.familyId,
      entityType: "SOCIEDADE",
      entityId: company.id,
      categories: computeCompanyCategories({
        isOffshore: company.isOffshore,
        societaryType: input.fields.societaryType ?? null,
      }),
    });
    await recordAudit({
      action: "DETALHES_HOLDING_SALVOS",
      entityType: "SOCIEDADE",
      entityId: company.id,
      actorUserId: user.id,
      familyId: company.familyId,
      metadata: {
        isOffshore: company.isOffshore,
        capitalSocial: input.fields.capitalSocial ?? 0,
        requirementsCreated: created,
        requirementsRemoved: removed,
      },
    });
    return { success: true };
  }),
});
