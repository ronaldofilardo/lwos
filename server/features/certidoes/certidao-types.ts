import { z } from "zod";
import {
  certidaoScopeValues,
  certidaoStatusValues,
  certidaoTypeValues,
} from "../../../drizzle/schema";
import { isoDateSchema } from "../../../shared/validation";

export const certidaoTypeSchema = z.enum(certidaoTypeValues);
export const certidaoStatusSchema = z.enum(certidaoStatusValues);
export const certidaoScopeSchema = z.enum(certidaoScopeValues);

export const certidaoUpdateSchema = z.object({
  certidaoId: z.string().min(1),
  status: certidaoStatusSchema.optional(),
  validUntil: isoDateSchema("Data de validade inválida (use AAAA-MM-DD).").optional(),
});

export const CERTIDAO_TYPE_LABELS: Record<(typeof certidaoTypeValues)[number], string> = {
  CND_FEDERAL: "CND Federal",
  CND_ESTADUAL: "CND Estadual",
  CND_MUNICIPAL: "CND Municipal",
  CERTIDAO_TJ: "Certidão TJ",
  CERTIDAO_TRF: "Certidão TRF",
  CNAT: "CNAT",
  CNDT: "CNDT",
  CERTIDAO_PROTESTOS: "Certidão de Protestos",
};
