import { z } from "zod";

export const civilStatusSchema = z.enum([
  "SOLTEIRO",
  "DIVORCIADO",
  "VIUVO",
  "CASADO",
  "UNIAO_ESTAVEL",
]);

export const maritalRegimeSchema = z.enum(["CPB", "CUB", "STB", "STOB", "NA"]);

export const familyInputSchema = z.object({
  name: z.string().min(3).max(160),
  civilStatus: civilStatusSchema,
  maritalRegime: maritalRegimeSchema,
  notes: z.string().max(2000).optional(),
});
