import { z } from "zod";

export const lwrInputSchema = z.object({
  familyId: z.string().min(1),
  baseDate: z.string().min(10),
  proposedStructure: z.string().min(10).max(12000),
  financialProposal: z.string().max(12000).optional().default("Proposta financeira gerenciada no módulo autônomo."),
  canvaUrl: z.string().max(1000).optional(),
  presentationFileKey: z.string().max(500).optional(),
});
