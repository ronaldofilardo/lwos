// @ts-nocheck
import { checkRateLimit } from "../../_core/rateLimit";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { TEAM_ROLES } from "../../../shared/domain/roles";
import { requireRole } from "../access/authorization";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit } from "../audit/audit-repository";
import { acceptLeadRecord, createLeadRecord, listLeadRecords, rejectLeadRecord } from "./lead-repository";
import { leadAcceptSchema, leadCreateSchema, leadRejectSchema } from "./lead-types";

export const leadRouter = router({
  // Pública — usada pela tela de "Tenho interesse" no login, sem autenticação.
  create: publicProcedure.input(leadCreateSchema).mutation(async ({ ctx, input }) => {
    checkRateLimit(`lead:create:${ctx.req.ip ?? "unknown"}`, 10);
    return createLeadRecord(input);
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx, ["SOCIO", "ADMIN"]);
    return listLeadRecords();
  }),
  accept: protectedProcedure.input(leadAcceptSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const result = await acceptLeadRecord(input, user.id);
    try {
      await recordAudit({ action: "INTERESSADO_ACEITO", entityType: "FAMILIA", entityId: result.familyId, actorUserId: user.id, familyId: result.familyId });
    } catch { /* audit failure should not break main operation */ }
    return result;
  }),
  reject: protectedProcedure.input(leadRejectSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, ["SOCIO"]);
    const result = await rejectLeadRecord(input.leadId, user.id, input.reviewNote);
    try {
      await recordAudit({ action: "INTERESSADO_RECUSADO", entityType: "INTERESSADO", entityId: input.leadId, actorUserId: user.id });
    } catch { /* audit failure should not break main operation */ }
    return result;
  }),
});

