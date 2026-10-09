import { z } from "zod";
import { assetCategoryValues } from "../../../drizzle/schema";

export const assetCategorySchema = z.enum(assetCategoryValues);

export const createAssetSchema = z.object({
  familyId: z.string().min(1),
  category: assetCategorySchema.default("OUTROS"),
  description: z.string().min(2).max(240),
  declaredValue: z.number().nonnegative(),
  ownerPersonId: z.string().min(1),
  notes: z.string().max(1000).optional(),
});
