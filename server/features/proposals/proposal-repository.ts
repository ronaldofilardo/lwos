import { desc, eq } from "drizzle-orm";
import { financialProposals } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import type { z } from "zod";
import type { createProposalSchema } from "./proposal-types";

export async function createProposalRecord(input: z.infer<typeof createProposalSchema>) {
  const db = await requireDatabase();
  const id = createId();
  await db.insert(financialProposals).values({
    id,
    familyId: input.familyId,
    scopeDescription: input.scopeDescription,
    proposedValue: input.proposedValue.toFixed(2),
    status: "ENVIADA",
  });
  return id;
}

export async function listProposalRecords(familyId: string) {
  const db = await requireDatabase();
  return db
    .select()
    .from(financialProposals)
    .where(eq(financialProposals.familyId, familyId))
    .orderBy(desc(financialProposals.createdAt));
}

export async function getProposalRecord(proposalId: string) {
  const db = await requireDatabase();
  const [result] = await db
    .select()
    .from(financialProposals)
    .where(eq(financialProposals.id, proposalId))
    .limit(1);
  return result ?? null;
}

export async function acceptProposalRecord(proposalId: string, clientNotes?: string) {
  const db = await requireDatabase();
  await db
    .update(financialProposals)
    .set({
      status: "ACEITA",
      clientNotes: clientNotes || null,
      acceptedAt: new Date(),
    })
    .where(eq(financialProposals.id, proposalId));
}

export async function submitCounterProposalRecord(input: {
  proposalId: string;
  counterProposalValue: number;
  counterProposalNotes: string;
}) {
  const db = await requireDatabase();
  await db
    .update(financialProposals)
    .set({
      status: "CONTRAPROPOSTA_RECEBIDA",
      counterProposalValue: input.counterProposalValue.toFixed(2),
      counterProposalNotes: input.counterProposalNotes,
    })
    .where(eq(financialProposals.id, input.proposalId));
}

export async function reviewCounterProposalRecord(input: {
  proposalId: string;
  decision: "ACEITAR" | "RECUSAR";
  socioUserId: number;
  notes?: string;
}) {
  const db = await requireDatabase();
  const status = input.decision === "ACEITAR" ? "ACEITA" : "RECUSADA";
  await db
    .update(financialProposals)
    .set({
      status,
      approvedBySocioId: String(input.socioUserId),
      acceptedAt: input.decision === "ACEITAR" ? new Date() : null,
      clientNotes: input.notes || null,
    })
    .where(eq(financialProposals.id, input.proposalId));
}
