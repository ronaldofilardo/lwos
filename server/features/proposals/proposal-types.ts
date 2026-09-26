import { z } from "zod";

export const proposalStatusSchema = z.enum([
  "RASCUNHO",
  "ENVIADA",
  "ACEITA",
  "CONTRAPROPOSTA_RECEBIDA",
  "RECUSADA",
]);

export const createProposalSchema = z.object({
  familyId: z.string().min(1),
  scopeDescription: z.string().min(10, "Descrição do escopo de trabalho deve ter ao menos 10 caracteres."),
  proposedValue: z.number().positive("Valor da proposta deve ser maior que zero."),
});

export const acceptProposalSchema = z.object({
  proposalId: z.string().min(1),
  clientNotes: z.string().max(1000).optional(),
});

export const counterProposalSchema = z.object({
  proposalId: z.string().min(1),
  counterProposalValue: z.number().positive("Valor da contraproposta deve ser maior que zero."),
  counterProposalNotes: z.string().min(3, "Justificativa da contraproposta é obrigatória.").max(1000),
});

export const reviewCounterProposalSchema = z.object({
  proposalId: z.string().min(1),
  decision: z.enum(["ACEITAR", "RECUSAR"]),
  notes: z.string().max(1000).optional(),
});
