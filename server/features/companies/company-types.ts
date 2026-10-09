import { z } from "zod";

export const companyInputSchema = z.object({
  familyId: z.string().min(1),
  legalName: z.string().min(3).max(180),
  taxNumber: z.string().max(20).optional(),
  isOffshore: z.boolean().default(false),
});
