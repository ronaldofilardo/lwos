import { z } from "zod";
import { entityTypeValues } from "../../../drizzle/schema";
import { isoDateSchema } from "../../../shared/validation";

export const documentEntitySchema = z.enum(entityTypeValues);
export const documentStatusSchema = z.enum([
  "PENDENTE",
  "RECEBIDO_EM_ANALISE",
  "VALIDADO",
  "REJEITADO",
  "VENCIDO",
  "DISPENSADO",
  "NAO_POSSUI",
  "NA",
]);

export const createDocumentSchema = z.object({
  familyId: z.string().min(1),
  entityType: documentEntitySchema,
  entityId: z.string().min(1),
  category: z.string().min(2).max(80),
  validUntil: isoDateSchema("Data de validade inválida (use AAAA-MM-DD).").optional(),
  /** Data-base do documento (ex.: balanço fechado / balancete). */
  referenceDate: isoDateSchema("Data-base inválida (use AAAA-MM-DD).").optional(),
});

export const uploadVersionSchema = z.object({
  documentId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  base64Data: z.string().min(8).max(8_000_000),
  /** Data-base do balanço/balancete (obrigatória nesses documentos; ignorada nos demais). */
  referenceDate: isoDateSchema("Data-base inválida (use AAAA-MM-DD).").optional(),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum(["VALIDADO", "REJEITADO", "NAO_POSSUI"]),
  rejectionReason: z.string().min(3).max(1000).optional(),
});

export const dispenseDocumentSchema = z.object({
  documentId: z.string().min(1),
  reason: z.string().min(3).max(1000),
  requestedBy: z.string().optional(),
});
