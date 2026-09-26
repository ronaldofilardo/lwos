import { z } from "zod";
import {
  companyDocStatusValues,
  companyDocTypeValues,
  companyJurisdictionValues,
} from "../../../drizzle/schema";

/**
 * Documentos do modal "Detalhes" por variante de sociedade.
 * Nacional: livros e balanços societários. Internacional: documentos
 * corporativos em inglês exigidos da offshore.
 */
export const NATIONAL_COMPANY_DOC_TYPES = [
  "CONTRATO_SOCIAL",
  "BALANCO_FECHADO",
  "BALANCETE_ATUALIZADO",
  "ACORDO_SOCIOS",
  "LIVRO_RAZAO_IMOBILIZADO",
  "LIVRO_REGISTRO_ACOES_NOMINATIVAS",
  "LIVRO_TRANSFERENCIA_ACOES",
] as const;

export const INTERNATIONAL_COMPANY_DOC_TYPES = [
  "MEMORANDUM_ARTICLES",
  "BALANCE_SHEET",
  "CERTIFICATE_INCORPORATION",
  "REGISTER_DIRECTORS",
  "REGISTER_MEMBERS",
  "CERTIFICATE_GOOD_STANDING",
  "SHARE_CERTIFICATE",
] as const;

export function isInternationalCompany(type: string) {
  return type === "HOLDING_INTERNACIONAL";
}

export function docTypesForCompanyType(type: string) {
  return isInternationalCompany(type)
    ? INTERNATIONAL_COMPANY_DOC_TYPES
    : NATIONAL_COMPANY_DOC_TYPES;
}

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
  uf: text(2),
  sede: text(160),
  societaryType: text(60),
  taxRegime: text(60),
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

export const companyDetailDocSchema = z.object({
  docType: z.enum(companyDocTypeValues),
  status: z.enum(companyDocStatusValues),
});

export const companyDetailsUpsertSchema = companyDetailsIdSchema.extend({
  fields: companyDetailsFieldsSchema,
  docs: z.array(companyDetailDocSchema).optional(),
});

export const companyDetailDocUpdateSchema = companyDetailsIdSchema.extend({
  docType: z.enum(companyDocTypeValues),
  status: z.enum(companyDocStatusValues),
});

export type CompanyDetailsFields = z.infer<typeof companyDetailsFieldsSchema>;
export type CompanyDetailDoc = z.infer<typeof companyDetailDocSchema>;
