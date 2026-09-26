import { z } from "zod";
import { civilStatusSchema, maritalRegimeSchema } from "../families/family-types";

export const ALLOWED_LEAD_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const leadCreateSchema = z.object({
  fullName: z.string().min(3).max(160),
  taxId: z.string().min(11).max(20),
  email: z.string().email(),
  birthDate: z.string().min(1), // YYYY-MM-DD
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  base64Data: z.string().min(1),
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
