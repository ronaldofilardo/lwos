import { z } from "zod";
import { assetCategoryValues } from "../../../drizzle/schema";

export const assetCategorySchema = z.enum(assetCategoryValues);

/** Categoria obrigatória, sem default — o usuário escolhe explicitamente. */
export const createAssetSchema = z.object({
  familyId: z.string().min(1),
  category: assetCategorySchema,
  description: z.string().min(2).max(240),
  declaredValue: z.number().positive("Informe o valor declarado (> 0)."),
  ownerPersonId: z.string().min(1, "Informe o responsável pelo ativo."),
  notes: z.string().max(1000).optional(),
});

export const updateAssetSchema = createAssetSchema
  .omit({ familyId: true })
  .extend({ assetId: z.string().min(1) });

export const removeAssetSchema = z.object({
  familyId: z.string().min(1),
  assetId: z.string().min(1),
});
