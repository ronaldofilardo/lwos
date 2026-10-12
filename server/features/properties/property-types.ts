import { z } from "zod";
import { ufSchema, isoDateSchema } from "../../../shared/validation";
import {
  encumbranceTypeValues,
  propertyKindValues,
  propertyUtilityValues,
} from "../../../drizzle/schema";

export const propertyKindSchema = z.enum(propertyKindValues);
export const propertyUtilitySchema = z.enum(propertyUtilityValues);
export const encumbranceTypeSchema = z.enum(encumbranceTypeValues);

const moneySchema = z.number().nonnegative();

export const propertyInputSchema = z
  .object({
    familyId: z.string().min(1, "Projeto obrigatório."),
    description: z.string().min(3, "Informe a descrição (mínimo 3 caracteres).").max(240),
    kind: propertyKindSchema.optional(),
    uf: ufSchema.optional(),
    hasRegistration: z.boolean().default(true),
    registrationNumber: z.string().max(120).optional(),
    alternativeDocType: z
      .enum(["ESCRITURA_PUBLICA", "CONTRATO_COMPRA_VENDA"])
      .optional(),
    noRegistrationReason: z.string().max(1000).optional(),
    registryOfficeNumber: z.number().int().min(1).max(55).optional(),
    registryUf: ufSchema.optional(),
    registryCity: z.string().max(120).optional(),
    propertyCity: z.string().min(2, "Informe a cidade do imóvel.").max(120),
    inscricaoImobiliaria: z.string().max(120).optional(),
    ccir: z.string().max(40).optional(),
    nirf: z.string().max(40).optional(),
    notes: z.string().max(4000).optional(),
    acquisitionDate: isoDateSchema("Data de aquisição inválida (use AAAA-MM-DD).").optional(),
    declaredValue: moneySchema.optional(),
    marketValue: moneySchema.optional(),
    venalValue: moneySchema.optional(),
    irGcapValue: moneySchema.optional(),
    emolumentsValue: moneySchema.optional(),
    itbiRate: z.number().min(0, "Alíquota de ITBI não pode ser negativa.").max(100, "Alíquota de ITBI deve estar entre 0 e 100.").optional(),
    hasLaudemio: z.boolean().default(false),
    laudemioRate: z.number().min(0, "Alíquota de laudemio não pode ser negativa.").max(100, "Alíquota de laudemio deve estar entre 0 e 100.").optional(),
    utility: propertyUtilitySchema.default("PENDENTE"),
    rentValue: moneySchema.optional(),
    encumbranceType: encumbranceTypeSchema.default("PENDENTE"),
    encumbranceNote: z.string().max(1000).optional(),
  })
  .refine(
    data => {
      if (!data.hasRegistration) {
        return Boolean(
          data.alternativeDocType &&
            data.noRegistrationReason &&
            data.noRegistrationReason.trim().length >= 3
        );
      }
      return true;
    },
    {
      message:
        "Imóveis sem matrícula exigem documento alternativo (Escritura Pública ou Contrato de Compra e Venda) e justificativa.",
      path: ["alternativeDocType"],
    }
  )
  .refine(
    data => {
      if (data.kind === "RURAL") {
        return Boolean(data.ccir?.trim() && data.nirf?.trim());
      }
      return true;
    },
    {
      message: "Imóvel rural exige CCIR e NIRF.",
      path: ["ccir"],
    }
  )
  .refine(
    data => {
      if (data.hasLaudemio) {
        return data.laudemioRate !== undefined && data.laudemioRate > 0;
      }
      return true;
    },
    {
      message: "Laudêmio confirmado exige alíquota maior que zero.",
      path: ["laudemioRate"],
    }
  )
  .refine(
    data => {
      if (data.utility === "LOCACAO_ARRENDAMENTO") {
        return data.rentValue !== undefined && data.rentValue > 0;
      }
      return true;
    },
    {
      message: "Locação/Arrendamento exige valor de locação maior que zero.",
      path: ["rentValue"],
    }
  );

export const propertyUpdateSchema = propertyInputSchema
  .omit({ familyId: true })
  .extend({ propertyId: z.string().min(1) });

export const propertyOwnerInputSchema = z
  .object({
    propertyId: z.string().min(1),
    personId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    ownershipPercentage: z.number().positive("Percentual deve ser maior que zero.").max(100, "Percentual deve estar entre 0 e 100."),
    rightType: z.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"]),
  })
  .refine(data => Boolean(data.personId) !== Boolean(data.companyId), {
    message: "A titularidade exige exatamente um dono: pessoa ou sociedade.",
    path: ["personId"],
  });

export const propertyOwnerUpdateSchema = z
  .object({
    propertyId: z.string().min(1),
    ownerId: z.string().min(1),
    personId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    ownershipPercentage: z.number().positive().max(100).optional(),
    rightType: z
      .enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"])
      .optional(),
  })
  .refine(
    data => {
      if (data.personId === undefined && data.companyId === undefined) {
        return true;
      }
      return Boolean(data.personId) !== Boolean(data.companyId);
    },
    {
      message: "A titularidade exige exatamente um dono: pessoa ou sociedade.",
      path: ["personId"],
    }
  );

export const propertyOwnerDeleteSchema = z.object({
  propertyId: z.string().min(1),
  ownerId: z.string().min(1),
});

export const removePropertySchema = z.object({
  familyId: z.string().min(1),
  propertyId: z.string().min(1),
});

/** Gravames que travam a movimentação do imóvel (semáforo vermelho). */
export function isEncumbranceRed(value: string | null | undefined): boolean {
  return (
    Boolean(value) &&
    value !== "PENDENTE" &&
    value !== "NA" &&
    value !== "NAO_HA"
  );
}
