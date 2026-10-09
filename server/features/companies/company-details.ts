import { z } from "zod";
import {
  companyJurisdictionValues,
  societaryTypeValues,
  taxRegimeValues,
} from "../../../drizzle/schema";
import { UFS } from "../../../shared/validation/uf";

const text = (max: number) =>
  z
    .string()
    .max(max, `Máximo de ${max} caracteres.`)
    .transform(value => value.trim() || null)
    .nullish();

const money = z.number().finite().nullish();

/** Campos da ficha — todos opcionais (upsert substitui a linha inteira). */
export const companyDetailsFieldsSchema = z.object({
  nire: text(20),
  uf: z.enum(UFS).nullish(),
  sede: text(160),
  societaryType: z.enum(societaryTypeValues).nullish(),
  taxRegime: z.enum(taxRegimeValues).nullish(),
  corporatePurpose: text(4000),
  capitalSocial: money,
  shareQuantity: money,
  administrator1: text(120),
  administrator2: text(120),
  equity: money,
  cashAndEquivalents: money,
  inventory: money,
  accountsReceivable: money,
  investments: money,
  fixedAssets: money,
  retainedEarnings: money,
  taxLiabilities: money,
  laborLiabilities: money,
  financing: money,
  estimatedMarketValue: money,
  companyNumber: text(60),
  jurisdiction: z.enum(companyJurisdictionValues).nullish(),
  residentAgent: text(120),
  notes: text(8000),
});

export const companyDetailsIdSchema = z.object({
  companyId: z.string().min(1, "Informe a sociedade."),
});

export const companyDetailsUpsertSchema = companyDetailsIdSchema.extend({
  fields: companyDetailsFieldsSchema,
});

export type CompanyDetailsFields = z.infer<typeof companyDetailsFieldsSchema>;
