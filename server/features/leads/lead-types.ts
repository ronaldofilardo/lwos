import { z } from "zod";
import { civilStatusSchema, maritalRegimeSchema } from "../families/family-types";
import { isCpfValido, normalizarCpf, isoDateSchema } from "../../../shared/validation";

export const ALLOWED_LEAD_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const leadCreateSchema = z.object({
  familyId: z.string().optional(),
  fullName: z.string().min(3, "Informe o nome completo (mínimo 3 caracteres).").max(160),
  taxId: z
    .string()
    .transform(value => normalizarCpf(value))
    .refine(value => isCpfValido(value), "CPF inválido."),
  email: z.string().email("E-mail inválido."),
  birthDate: isoDateSchema("Data de nascimento inválida (use AAAA-MM-DD)."),
  fileName: z.string().min(1, "Informe o nome do arquivo.").max(255),
  mimeType: z.string().min(1, "Informe o tipo do arquivo."),
  base64Data: z.string().min(1, "Conteúdo do arquivo ausente."),
});

export const leadAcceptSchema = z.object({
  leadId: z.string().min(1),
  familyName: z.string().min(3).max(160),
  civilStatus: civilStatusSchema,
  maritalRegime: maritalRegimeSchema,
});

export const leadRejectSchema = z.object({
  leadId: z.string().min(1),
  reviewNote: z.string().max(1000).optional(),
});
