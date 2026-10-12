import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { recordAudit } from "../audit/audit-repository";
import { getProjectAlertSummary } from "../alerts/project-alerts-repository";
import {
  ensureFamilyCertidoes,
  getCertidaoRecord,
  listCertidaoRecords,
  updateCertidaoRecord,
} from "./certidao-repository";
import { certidaoUpdateSchema } from "./certidao-types";

export const certidaoRouter = router({
  list: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Leitura liberada para o titular (CLIENTE) com vínculo na família;
      // gerar/atualizar continua restrito à equipe (TEAM_ROLES / SOCIO).
      await assertFamilyAccess(ctx, input.familyId);
      return listCertidaoRecords(input.familyId);
    }),
  summary: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Resumo de alertas (Fase 9): mesmo cálculo usado na lista de projetos
      // e nas telas de Pessoas/Imóveis/Sociedades/Ativos.
      await assertFamilyAccess(ctx, input.familyId);
      return getProjectAlertSummary(input.familyId);
    }),
  generate: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.CERTIDAO_GENERATE);
      await assertFamilyAccess(ctx, input.familyId);
      const created = await ensureFamilyCertidoes(input.familyId);
      await recordAudit({
        action: "CERTIDOES_GERADAS",
        entityType: "FAMILIA",
        entityId: input.familyId,
        actorUserId: user.id,
        familyId: input.familyId,
        metadata: { created },
      });
      return { created };
    }),
  updateStatus: protectedProcedure
    .input(certidaoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = requirePermission(ctx, Permission.CERTIDAO_UPDATE_STATUS);
      const certidao = await getCertidaoRecord(input.certidaoId);
      if (!certidao) throw new Error("Certidão não encontrada.");
      await assertFamilyAccess(ctx, certidao.familyId);
      await updateCertidaoRecord(input);
      await recordAudit({
        action: "CERTIDAO_STATUS_ATUALIZADO",
        entityType: "CERTIDAO",
        entityId: input.certidaoId,
        actorUserId: user.id,
        familyId: certidao.familyId,
        metadata: {
          type: certidao.type,
          status: input.status ?? certidao.status,
          validUntil: input.validUntil ?? certidao.validUntil ?? "",
        },
      });
      return { success: true };
    }),
});
