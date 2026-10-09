import { z } from "zod";
import { entityTypeValues } from "../../../drizzle/schema";

export const documentEntitySchema = z.enum(entityTypeValues);
export const documentStatusSchema = z.enum([
  "PENDENTE",
  "RECEBIDO_EM_ANALISE",
  "VALIDADO",
  "REJEITADO",
  "VENCIDO",
  "DISPENSADO",
  "NA",
]);

export const createDocumentSchema = z.object({
  familyId: z.string().min(1),
  entityType: documentEntitySchema,
  entityId: z.string().min(1),
  category: z.string().min(2).max(80),
  validUntil: z.string().optional(),
  /** Data-base do documento (ex.: balanço fechado / balancete). */
  referenceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data-base inválida (use AAAA-MM-DD).")
    .optional(),
});

export const uploadVersionSchema = z.object({
  documentId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  base64Data: z.string().min(8).max(8_000_000),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum(["VALIDADO", "REJEITADO"]),
  rejectionReason: z.string().min(3).max(1000).optional(),
});

export const dispenseDocumentSchema = z.object({
  documentId: z.string().min(1),
  reason: z.string().min(3).max(1000),
  requestedBy: z.string().optional(),
});
