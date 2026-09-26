import { z } from "zod";
import { TEAM_ROLES } from "@shared/domain/roles";
import { protectedProcedure, router } from "../../_core/trpc";
import { assertFamilyAccess } from "../access/family-access";
import { requireRole } from "../access/authorization";
import { recordAudit } from "../audit/audit-repository";
import {
  acceptProposalRecord,
  createProposalRecord,
  getProposalRecord,
  listProposalRecords,
  reviewCounterProposalRecord,
  submitCounterProposalRecord,
} from "./proposal-repository";
import {
  acceptProposalSchema,
  counterProposalSchema,
  createProposalSchema,
  reviewCounterProposalSchema,
} from "./proposal-types";

export const proposalRouter = router({
  list: protectedProcedure.input(z.object({ familyId: z.string() })).query(async ({ ctx, input }) => {
    await assertFamilyAccess(ctx, input.familyId);
    return listProposalRecords(input.familyId);
  }),
  create: protectedProcedure.input(createProposalSchema).mutation(async ({ ctx, input }) => {
    const user = requireRole(ctx, TEAM_ROLES);
    await assertFamilyAccess(ctx, input.familyId);
    const proposalId = await createProposalRecord(input);
    await recordAudit({
      action: "PROPOSTA_FINANCEIRA_CRIADA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: proposalId,
      actorUserId: user.id,
      familyId: input.familyId,
      metadata: { proposedValue: input.proposedValue },
    });
    return { proposalId };
  }),
  accept: protectedProcedure.input(acceptProposalSchema).mutation(async ({ ctx, input }) => {
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira não encontrada.");
    const user = await assertFamilyAccess(ctx, proposal.familyId);
    await acceptProposalRecord(input.proposalId, input.clientNotes);
    await recordAudit({
      action: "PROPOSTA_FINANCEIRA_ACEITA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: user.id,
      familyId: proposal.familyId,
    });
    return { success: true };
  }),
  counterProposal: protectedProcedure.input(counterProposalSchema).mutation(async ({ ctx, input }) => {
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira não encontrada.");
    const user = await assertFamilyAccess(ctx, proposal.familyId);
    await submitCounterProposalRecord(input);
    await recordAudit({
      action: "CONTRAPROPOSTA_ENVIADA",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: user.id,
      familyId: proposal.familyId,
      metadata: {
        counterProposalValue: input.counterProposalValue,
        notes: input.counterProposalNotes,
      },
    });
    return { success: true };
  }),
  reviewCounterProposal: protectedProcedure.input(reviewCounterProposalSchema).mutation(async ({ ctx, input }) => {
    const socio = requireRole(ctx, ["SOCIO"]);
    const proposal = await getProposalRecord(input.proposalId);
    if (!proposal) throw new Error("Proposta financeira não encontrada.");
    await reviewCounterProposalRecord({
      proposalId: input.proposalId,
      decision: input.decision,
      socioUserId: socio.id,
      notes: input.notes,
    });
    await recordAudit({
      action: input.decision === "ACEITAR" ? "CONTRAPROPOSTA_ACEITA_PELO_SOCIO" : "CONTRAPROPOSTA_RECUSADA_PELO_SOCIO",
      entityType: "PROPOSTA_FINANCEIRA",
      entityId: input.proposalId,
      actorUserId: socio.id,
      familyId: proposal.familyId,
      metadata: { decision: input.decision, notes: input.notes || "" },
    });
    return { success: true };
  }),
});
