import { z } from "zod";
import { isCnpjValido } from "../../../shared/validation/cnpj";

/**
 * Criação de sociedade: Denominação Social + CNPJ (com DV) obrigatório quando
 * nacional; offshore não leva CNPJ (jurisdição e identificador estrangeiro
 * ficam na ficha de detalhes).
 */
export const companyInputSchema = z
  .object({
    familyId: z.string().min(1),
    legalName: z.string().min(3).max(180),
    taxNumber: z.string().max(20).optional(),
    isOffshore: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const taxNumber = data.taxNumber?.trim() || null;
    if (data.isOffshore) {
      if (taxNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxNumber"],
          message: "Sociedade offshore não possui CNPJ.",
        });
      }
      return;
    }
    if (!taxNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxNumber"],
        message: "Informe o CNPJ da sociedade nacional.",
      });
      return;
    }
    if (!isCnpjValido(taxNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxNumber"],
        message: "CNPJ inválido.",
      });
    }
  });
