import { z } from "zod";
import { projectObjectiveValues } from "../../../drizzle/schema";

export const civilStatusSchema = z.enum([
  "SOLTEIRO",
  "DIVORCIADO",
  "VIUVO",
  "CASADO",
  "UNIAO_ESTAVEL",
]);

export const maritalRegimeSchema = z.enum(["CPB", "CUB", "STB", "STOB", "NA"]);

export const projectObjectiveSchema = z.enum(projectObjectiveValues);

export const familyInputSchema = z.object({
  name: z.string().trim().min(3, "O nome do projeto precisa de ao menos 3 caracteres.").max(160),
  notes: z.string().max(2000).optional(),
  objectives: z
    .array(projectObjectiveSchema)
    .min(1, "Selecione ao menos um objetivo para o projeto."),
});
