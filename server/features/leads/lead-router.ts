// @ts-nocheck
import { checkRateLimit } from "../../_core/rateLimit";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { requirePermission } from "../access/authorization";
import { Permission } from "../../../shared/domain/permissions";
import { assertFamilyAccess } from "../access/family-access";
import { recordAudit, recordAuditSafe } from "../audit/audit-repository";
import { acceptLeadRecord, createLeadRecord, listLeadRecords, rejectLeadRecord } from "./lead-repository";
import { leadAcceptSchema, leadCreateSchema, leadRejectSchema } from "./lead-types";

export const leadRouter = router({
  // Pública — usada pela tela de "Tenho interesse" no login, sem autenticação.
  create: publicProcedure.input(leadCreateSchema).mutation(async ({ ctx, input }) => {
    checkRateLimit(`lead:create:${ctx.req.ip ?? "unknown"}`, 10);
    const result = await createLeadRecord(input);
    await recordAuditSafe({
      action: "LEAD_CRIADO",
      entityType: "LEAD",
      entityId: result.leadId,
      familyId: result.familyId,
      metadata: { source: "public_form" },
    });
    return result;
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx, Permission.LEAD_LIST);
    return listLeadRecords();
  }),
  accept: protectedProcedure.input(leadAcceptSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LEAD_ACCEPT);
    const result = await acceptLeadRecord(input, user.id);
    await recordAuditSafe({ action: "INTERESSADO_ACEITO", entityType: "FAMILIA", entityId: result.familyId, actorUserId: user.id, familyId: result.familyId });
    return result;
  }),
  reject: protectedProcedure.input(leadRejectSchema).mutation(async ({ ctx, input }) => {
    const user = requirePermission(ctx, Permission.LEAD_REJECT);
    const result = await rejectLeadRecord(input.leadId, user.id, input.reviewNote);
    await recordAuditSafe({ action: "INTERESSADO_RECUSADO", entityType: "INTERESSADO", entityId: input.leadId, actorUserId: user.id });
    return result;
  }),
});

