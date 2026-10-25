// Espelhos dos enums de drizzle/schema.ts (o client não importa valores do
// schema — só tipos via @shared/types — e o servidor valida com zod).
import { parseNumeroPtBR } from "@shared/validation/dinheiro";
import {
  computeEstimatedValue,
  computeUnitValues,
  type CompanyTotals,
} from "@shared/domain/company-valuation";

export const companyJurisdictionValues = [
  "BVI",
  "BAHAMAS",
  "DELAWARE",
  "ILHAS_MARSHALL",
  "CAYMAN",
  "UK",
  "PANAMA",
] as const;

export type CompanyJurisdiction = (typeof companyJurisdictionValues)[number];

export const companyJurisdictionLabels: Record<CompanyJurisdiction, string> = {
  BVI: "BVI",
  BAHAMAS: "Bahamas",
  DELAWARE: "Delaware",
  ILHAS_MARSHALL: "Ilhas Marshall",
  CAYMAN: "Cayman",
  UK: "UK",
  PANAMA: "Panamá",
};

export const societaryTypeValues = ["LTDA", "SA", "SCP"] as const;

export type SocietaryType = (typeof societaryTypeValues)[number];

export const societaryTypeLabels: Record<SocietaryType, string> = {
  LTDA: "Ltda",
  SA: "S.A.",
  SCP: "Sociedade em Conta de Participação",
};

export const taxRegimeValues = [
  "SIMPLES_NACIONAL",
  "LUCRO_PRESUMIDO",
  "LUCRO_REAL",
] as const;

export type TaxRegime = (typeof taxRegimeValues)[number];

export const taxRegimeLabels: Record<TaxRegime, string> = {
  SIMPLES_NACIONAL: "Simples Nacional",
  LUCRO_PRESUMIDO: "Lucro Presumido",
  LUCRO_REAL: "Lucro Real",
};

export const ufValues = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export type Uf = (typeof ufValues)[number];

export type HoldingFormState = {
  nire: string;
  uf: string;
  sede: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  societaryType: string;
  taxRegime: string;
  corporatePurpose: string;
  capitalSocial: string;
  shareQuantity: string;
  administrator1PersonId: string;
  administrator2PersonId: string;
  administrator1: string;
  administrator2: string;
  equity: string;
  cashAndEquivalents: string;
  inventory: string;
  accountsReceivable: string;
  investments: string;
  fixedAssets: string;
  retainedEarnings: string;
  taxLiabilities: string;
  laborLiabilities: string;
  financing: string;
  estimatedMarketValue: string;
  companyNumber: string;
  jurisdiction: string;
  residentAgent: string;
  notes: string;
};

const HOLDING_FORM_KEYS: (keyof HoldingFormState)[] = [
  "nire",
  "uf",
  "sede",
  "cep",
  "street",
  "number",
  "complement",
  "district",
  "city",
  "societaryType",
  "taxRegime",
  "corporatePurpose",
  "capitalSocial",
  "shareQuantity",
  "administrator1PersonId",
  "administrator2PersonId",
  "administrator1",
  "administrator2",
  "equity",
  "cashAndEquivalents",
  "inventory",
  "accountsReceivable",
  "investments",
  "fixedAssets",
  "retainedEarnings",
  "taxLiabilities",
  "laborLiabilities",
  "financing",
  "estimatedMarketValue",
  "companyNumber",
  "jurisdiction",
  "residentAgent",
  "notes",
];

export function emptyHoldingForm(): HoldingFormState {
  return HOLDING_FORM_KEYS.reduce((form, key) => {
    form[key] = "";
    return form;
  }, {} as HoldingFormState);
}

/** Estado inicial a partir da linha gravada (null → ""). */
export function holdingFormFromDetails(
  details: Partial<
    Record<keyof HoldingFormState, string | number | null>
  > | null
): HoldingFormState {
  const form = emptyHoldingForm();
  if (!details) return form;
  for (const key of HOLDING_FORM_KEYS) {
    const value = details[key];
    form[key] = value === undefined || value === null ? "" : String(value);
  }
  return form;
}

/** Rótulo do(s) administrador(es): "Directors" na offshore, "Administrador/Diretor" na nacional. */
export function administratorLabel(international: boolean, index?: number): string {
  if (international) {
    return index ? `${index}º Director` : "Directors";
  }
  return index ? `${index}º Administrador/Diretor` : "Administrador/Diretor";
}

/**
 * "1.234,56" / "1234.56" / "1.000" → 1234.56 / 1234.56 / 1000 (null se vazio
 * ou inválido). Descarta símbolos de moeda e espaços e delega ao parser
 * compartilhado (`parseNumeroPtBR`), o mesmo usado nos demais formulários;
 * valores negativos retornam null.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned) return null;
  return parseNumeroPtBR(cleaned);
}

function asEnumOrNull<T extends string>(
  value: string,
  allowed: readonly T[]
): T | null {
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/** Estado do formulário → payload do servidor (null = campo limpo). */
export function holdingFormToFields(form: HoldingFormState) {
  const text = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  return {
    nire: text(form.nire),
    uf: asEnumOrNull(form.uf.trim().toUpperCase(), ufValues),
    sede: text(form.sede),
    cep: text(form.cep) ? form.cep.replace(/\D/g, "").slice(0, 8) : null,
    street: text(form.street),
    number: text(form.number),
    complement: text(form.complement),
    district: text(form.district),
    city: text(form.city),
    societaryType: asEnumOrNull(form.societaryType, societaryTypeValues),
    taxRegime: asEnumOrNull(form.taxRegime, taxRegimeValues),
    corporatePurpose: text(form.corporatePurpose),
    capitalSocial: parseAmount(form.capitalSocial),
    shareQuantity: parseAmount(form.shareQuantity),
    administrator1PersonId: text(form.administrator1PersonId),
    administrator2PersonId: text(form.administrator2PersonId),
    administrator1: text(form.administrator1),
    administrator2: text(form.administrator2),
    equity: parseAmount(form.equity),
    cashAndEquivalents: parseAmount(form.cashAndEquivalents),
    inventory: parseAmount(form.inventory),
    accountsReceivable: parseAmount(form.accountsReceivable),
    investments: parseAmount(form.investments),
    fixedAssets: parseAmount(form.fixedAssets),
    retainedEarnings: parseAmount(form.retainedEarnings),
    taxLiabilities: parseAmount(form.taxLiabilities),
    laborLiabilities: parseAmount(form.laborLiabilities),
    financing: parseAmount(form.financing),
    // estimatedMarketValue não é enviado: o servidor deriva do balanço.
    companyNumber: text(form.companyNumber),
    jurisdiction: asEnumOrNull(form.jurisdiction, companyJurisdictionValues),
    residentAgent: text(form.residentAgent),
    notes: text(form.notes),
  };
}

/** Valor estimado da empresa calculado ao vivo a partir do balanço digitado (PL fora). */
export function estimatedValueFromForm(form: HoldingFormState): number | null {
  return computeEstimatedValue({
    cashAndEquivalents: parseAmount(form.cashAndEquivalents),
    inventory: parseAmount(form.inventory),
    accountsReceivable: parseAmount(form.accountsReceivable),
    investments: parseAmount(form.investments),
    fixedAssets: parseAmount(form.fixedAssets),
    retainedEarnings: parseAmount(form.retainedEarnings),
    taxLiabilities: parseAmount(form.taxLiabilities),
    laborLiabilities: parseAmount(form.laborLiabilities),
    financing: parseAmount(form.financing),
  });
}

/** Totais da sociedade (capital, PL, valor estimado, quotas) a partir do formulário. */
export function holdingTotalsFromForm(form: HoldingFormState): CompanyTotals {
  return {
    capitalSocial: parseAmount(form.capitalSocial),
    equity: parseAmount(form.equity),
    estimatedValue: estimatedValueFromForm(form),
    shareQuantity: parseAmount(form.shareQuantity),
  };
}

/** Valores por quota/ação calculados ao vivo no formulário. */
export function computePerShare(form: HoldingFormState) {
  return computeUnitValues(holdingTotalsFromForm(form));
}

export function formatAmount(
  value: number | null | undefined,
  international: boolean
) {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "—";
  const symbol = international ? "$" : "R$";
  const formatted = value.toLocaleString(international ? "en-US" : "pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}
