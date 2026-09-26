import { z } from "zod";
import { encumbranceTypeValues } from "../../../drizzle/schema";

export const propertyInputSchema = z.object({
  familyId: z.string().min(1),
  description: z.string().min(3).max(240),
  hasRegistration: z.boolean().default(true),
  registrationNumber: z.string().max(120).optional(),
  alternativeDocType: z.enum(["ESCRITURA_PUBLICA", "CONTRATO_COMPRA_VENDA"]).optional(),
  noRegistrationReason: z.string().max(1000).optional(),
  registryOffice: z.string().max(160).optional(),
  propertyCity: z.string().min(2).max(120),
  registryCity: z.string().max(120).optional(),
  acquisitionDate: z.string().optional(),
  declaredValue: z.number().nonnegative().optional(),
  marketValue: z.number().nonnegative().optional(),
}).refine(data => {
  if (!data.hasRegistration) {
    return Boolean(data.alternativeDocType && data.noRegistrationReason && data.noRegistrationReason.trim().length >= 3);
  }
  return true;
}, {
  message: "Imóveis sem matrícula exigem documento alternativo (Escritura Pública ou Contrato de Compra e Venda) e justificativa.",
  path: ["alternativeDocType"],
});

export const encumbranceInputSchema = z.object({
  propertyId: z.string().min(1),
  type: z.enum(encumbranceTypeValues),
  description: z.string().max(1000).optional(),
});

export const propertyOwnerInputSchema = z.object({
  propertyId: z.string().min(1),
  personId: z.string().min(1),
  ownershipPercentage: z.number().positive().max(100),
  rightType: z.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"]),
});

export const propertyOwnerUpdateSchema = z.object({
  propertyId: z.string().min(1),
  ownerId: z.string().min(1),
  personId: z.string().min(1).optional(),
  ownershipPercentage: z.number().positive().max(100).optional(),
  rightType: z.enum(["PROPRIEDADE", "USUFRUTO", "NUA_PROPRIEDADE"]).optional(),
});

export const propertyOwnerDeleteSchema = z.object({
  propertyId: z.string().min(1),
  ownerId: z.string().min(1),
});
