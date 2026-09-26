import { z } from "zod";
import { companyTypeValues } from "../../../drizzle/schema";

export const companyInputSchema = z.object({
  familyId: z.string().min(1),
  legalName: z.string().min(3).max(180),
  taxNumber: z.string().max(20).optional(),
  type: z.enum(companyTypeValues),
});

export const contributionInputSchema = z.object({
  propertyId: z.string().min(1),
  companyId: z.string().min(1),
  percentage: z.number().positive().max(100),
});
