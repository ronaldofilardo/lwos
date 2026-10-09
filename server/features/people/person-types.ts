import { z } from "zod";
import {
  civilStatusSchema,
  maritalRegimeSchema,
} from "../families/family-types";
import {
  isCpfValido,
  isNascimentoValido,
  isTelefoneValido,
  idadeEmAnosCompletos,
  normalizarCpf,
  normalizarTelefone,
  ufSchema,
} from "../../../shared/validation";

export const vinculoSchema = z.enum([
  "TITULAR",
  "CONJUGE",
  "FILHO",
  "NETO",
  "BISNETO",
]);

const marriedStatuses = new Set(["CASADO", "UNIAO_ESTAVEL"]);

/** Dados de pessoa usados nas regras de vínculo (criação e edição). */
export type PersonRuleData = {
  vinculo: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  birthDate?: string | null;
  civilStatus?: string | null;
  maritalRegime?: string | null;
  spouseName?: string | null;
  addressSameAsPrimary?: boolean | null;
  city?: string | null;
  uf?: string | null;
  parentPersonId?: string | null;
};

/**
 * Regras de negócio por vínculo (Fase 4) — usadas pelo zod na criação e pelo
 * repositório na criação/edição (fonte da verdade do servidor).
 */
export function collectPersonIssues(
  data: PersonRuleData
): { path: (string | number)[]; message: string }[] {
  const issues: { path: (string | number)[]; message: string }[] = [];

  if (
    (data.vinculo === "NETO" || data.vinculo === "BISNETO") &&
    !data.parentPersonId
  ) {
    issues.push({
      path: ["parentPersonId"],
      message:
        data.vinculo === "NETO"
          ? "Neto(a) precisa de um filho(a) como pai/mãe."
          : "Bisneto(a) precisa de um neto(a) como pai/mãe.",
    });
  }

  if (!data.taxId || !isCpfValido(data.taxId)) {
    issues.push({ path: ["taxId"], message: "CPF inválido." });
  }

  if (!data.birthDate || !isNascimentoValido(data.birthDate)) {
    issues.push({
      path: ["birthDate"],
      message: "Data de nascimento inválida.",
    });
  }

  if (data.phone && !isTelefoneValido(data.phone)) {
    issues.push({
      path: ["phone"],
      message: "Telefone inválido. Use DDD + número.",
    });
  }

  if (data.vinculo === "TITULAR") {
    if (!data.email?.trim()) {
      issues.push({
        path: ["email"],
        message: "E-mail obrigatório para o titular.",
      });
    }
    if (!data.phone || !isTelefoneValido(data.phone)) {
      issues.push({
        path: ["phone"],
        message: "Telefone obrigatório para o titular (DDD + número).",
      });
    }
  }

  // Endereço: ou referencia o do titular, ou informa cidade + UF.
  if (!data.addressSameAsPrimary && (!data.city?.trim() || !data.uf)) {
    issues.push({
      path: ["city"],
      message: "Informe a cidade e a UF do endereço.",
    });
  }

  // Menor de 18 anos (anos completos): sempre solteiro, sem regime, sem cônjuge.
  const menor =
    Boolean(data.birthDate) &&
    isNascimentoValido(data.birthDate as string) &&
    idadeEmAnosCompletos(data.birthDate as string) < 18;
  if (menor) {
    if (data.civilStatus && data.civilStatus !== "SOLTEIRO") {
      issues.push({
        path: ["civilStatus"],
        message: "Menores de 18 anos são sempre solteiros.",
      });
    }
    if (data.maritalRegime && data.maritalRegime !== "NA") {
      issues.push({
        path: ["maritalRegime"],
        message: "Menores de 18 anos não têm regime de bens.",
      });
    }
    if (data.spouseName?.trim()) {
      issues.push({
        path: ["spouseName"],
        message: "Menores de 18 anos não têm cônjuge.",
      });
    }
  } else if (data.vinculo !== "CONJUGE") {
    if (!data.civilStatus) {
      issues.push({ path: ["civilStatus"], message: "Informe o estado civil." });
      return issues;
    }
    if (marriedStatuses.has(data.civilStatus)) {
      if (!data.maritalRegime) {
        issues.push({
          path: ["maritalRegime"],
          message: "Informe o regime de bens.",
        });
      }
      if (!data.spouseName?.trim()) {
        issues.push({
          path: ["spouseName"],
          message: "Informe o nome do cônjuge.",
        });
      }
    }
  }

  return issues;
}

const personBaseSchema = z.object({
  familyId: z.string().min(1),
  fullName: z.string().trim().min(3).max(160),
  email: z
    .string()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  taxId: z
    .string()
    .transform(value => normalizarCpf(value))
    .refine(value => isCpfValido(value), "CPF inválido."),
  birthDate: z.string().min(1, "Informe a data de nascimento."),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform(value => (value ? normalizarTelefone(value) : "")),
  vinculo: vinculoSchema,
  parentPersonId: z.string().min(1).optional(),
  spouseName: z.string().max(160).optional(),
  civilStatus: civilStatusSchema.optional(),
  maritalRegime: maritalRegimeSchema.optional(),
  exSpouseNote: z.string().max(1000).optional(),
  isPrimaryContact: z.boolean().optional(),
  addressSameAsPrimary: z.boolean().optional(),
  cep: z.string().max(8).optional().or(z.literal("")),
  street: z.string().max(160).optional().or(z.literal("")),
  number: z.string().max(20).optional().or(z.literal("")),
  complement: z.string().max(80).optional().or(z.literal("")),
  district: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  uf: ufSchema.optional(),
});

export const personInputSchema = personBaseSchema.superRefine((data, ctx) => {
  for (const issue of collectPersonIssues(data)) {
    ctx.addIssue({
      code: "custom",
      path: issue.path,
      message: issue.message,
    });
  }
});

/**
 * Edição: vínculo, pai/mãe e titularidade não mudam por aqui. As regras por
 * vínculo (collectPersonIssues) são aplicadas no repositório com o vínculo
 * real vindo do banco.
 */
export const personUpdateSchema = personBaseSchema
  .omit({ vinculo: true, parentPersonId: true, isPrimaryContact: true })
  .extend({ personId: z.string().min(1) });

export const setPrimaryContactSchema = z.object({
  familyId: z.string().min(1),
  personId: z.string().min(1),
});

export const removePersonSchema = z.object({
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
