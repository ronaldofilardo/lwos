import { z } from "zod";
import {
  civilStatusSchema,
  maritalRegimeSchema,
} from "../families/family-types";

export const vinculoSchema = z.enum([
  "TITULAR",
  "CONJUGE",
  "FILHO",
  "NETO",
  "BISNETO",
]);

const marriedStatuses = new Set(["CASADO", "UNIAO_ESTAVEL"]);

export const personInputSchema = z
  .object({
    familyId: z.string().min(1),
    fullName: z.string().min(3).max(160),
    email: z.string().email().optional().or(z.literal("")),
    taxId: z.string().max(20).optional(),
    birthDate: z.string().optional(),
    vinculo: vinculoSchema,
    parentPersonId: z.string().min(1).optional(),
    spouseName: z.string().max(160).optional(),
    civilStatus: civilStatusSchema.optional(),
    maritalRegime: maritalRegimeSchema.optional(),
    exSpouseNote: z.string().max(1000).optional(),
    // Fase 3: marca esta pessoa como titular/responsável da família — usado
    // pra nomear a pasta de storage local (CPF do titular). Opcional; se
    // omitido, a pessoa não vira titular automaticamente.
    isPrimaryContact: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.vinculo === "NETO" || data.vinculo === "BISNETO") &&
      !data.parentPersonId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["parentPersonId"],
        message:
          data.vinculo === "NETO"
            ? "Neto(a) precisa de um filho(a) como pai/mãe."
            : "Bisneto(a) precisa de um neto(a) como pai/mãe.",
      });
    }

    // Cônjuge do titular: estado civil e regime são os mesmos da família —
    // preenchidos no servidor, não pedidos no form.
    if (data.vinculo === "CONJUGE") return;

    if (!data.civilStatus) {
      ctx.addIssue({
        code: "custom",
        path: ["civilStatus"],
        message: "Informe o estado civil.",
      });
      return;
    }

    if (marriedStatuses.has(data.civilStatus)) {
      if (!data.maritalRegime) {
        ctx.addIssue({
          code: "custom",
          path: ["maritalRegime"],
          message: "Informe o regime de bens.",
        });
      }
      if (!data.spouseName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["spouseName"],
          message: "Informe o nome do cônjuge.",
        });
      }
    }
  });

export const setPrimaryContactSchema = z.object({
  familyId: z.string().min(1),
  personId: z.string().min(1),
});

/** Anexo opcional enviado junto com a criação da pessoa. */
export const personAttachmentSchema = z.object({
  category: z.string().min(2).max(80),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  base64Data: z.string().min(8).max(8_000_000),
});

export const attachDocumentsSchema = z.object({
  familyId: z.string().min(1),
  personId: z.string().min(1),
  attachments: z.array(personAttachmentSchema).min(1).max(8),
});

export function isMarriedStatus(status: string | null | undefined): boolean {
  return Boolean(status && marriedStatuses.has(status));
}
