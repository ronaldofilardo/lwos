import { z } from "zod";

export const assetCategorySchema = z.enum([
  "INVESTIMENTO",
  "VEICULO",
  "PARTICIPACAO_OUTRA",
  "DIREITO",
  "OUTRO",
]);

export const createAssetSchema = z.object({
  familyId: z.string().min(1),
  category: assetCategorySchema.default("OUTRO"),
  description: z.string().min(2).max(240),
  declaredValue: z.number().nonnegative().optional(),
  marketValue: z.number().nonnegative().optional(),
  ownerPersonId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
