// Espelhos dos enums de drizzle/schema.ts (o client não importa valores do
// schema — só tipos via @shared/types — e o servidor valida com zod).

export type CompanyType =
  | "HOLDING_NACIONAL"
  | "HOLDING_INTERNACIONAL"
  | "SOCIEDADE_NACIONAL";

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

export const companyDocStatusValues = [
  "PENDENTE",
  "RECEBIDO",
  "NA",
  "NAO_POSSUI",
] as const;

export type CompanyDocStatus = (typeof companyDocStatusValues)[number];

export const companyDocStatusLabels: Record<CompanyDocStatus, string> = {
  PENDENTE: "Pendente",
  RECEBIDO: "Recebido",
  NA: "N/A",
  NAO_POSSUI: "Não possui",
};

export const nationalCompanyDocTypes = [
  "CONTRATO_SOCIAL",
  "BALANCO_FECHADO",
  "BALANCETE_ATUALIZADO",
  "ACORDO_SOCIOS",
  "LIVRO_RAZAO_IMOBILIZADO",
  "LIVRO_REGISTRO_ACOES_NOMINATIVAS",
  "LIVRO_TRANSFERENCIA_ACOES",
] as const;

export const internationalCompanyDocTypes = [
  "MEMORANDUM_ARTICLES",
  "BALANCE_SHEET",
  "CERTIFICATE_INCORPORATION",
  "REGISTER_DIRECTORS",
  "REGISTER_MEMBERS",
  "CERTIFICATE_GOOD_STANDING",
  "SHARE_CERTIFICATE",
] as const;

export type CompanyDocType =
  | (typeof nationalCompanyDocTypes)[number]
  | (typeof internationalCompanyDocTypes)[number];

export const companyDocLabels: Record<CompanyDocType, string> = {
  CONTRATO_SOCIAL: "Contrato social",
  BALANCO_FECHADO: "Balanço fechado",
  BALANCETE_ATUALIZADO: "Balancete atualizado",
  ACORDO_SOCIOS: "Acordo de sócios",
  LIVRO_RAZAO_IMOBILIZADO: "Livro razão do imobilizado",
  LIVRO_REGISTRO_ACOES_NOMINATIVAS: "Livro de registro de ações nominativas",
  LIVRO_TRANSFERENCIA_ACOES: "Livro de transferência de ações",
  MEMORANDUM_ARTICLES: "Memorandum & Articles of Association",
  BALANCE_SHEET: "Balance Sheet",
  CERTIFICATE_INCORPORATION: "Certificate of Incorporation",
  REGISTER_DIRECTORS: "Register of Directors",
  REGISTER_MEMBERS: "Register of Members",
  CERTIFICATE_GOOD_STANDING: "Certificate of Good Standing",
  SHARE_CERTIFICATE: "Share Certificate",
};

export function docTypesForCompany(
  type: CompanyType
): readonly CompanyDocType[] {
  return type === "HOLDING_INTERNACIONAL"
    ? internationalCompanyDocTypes
    : nationalCompanyDocTypes;
}

export type HoldingFormState = {
  nire: string;
  uf: string;
  sede: string;
  societaryType: string;
  taxRegime: string;
  corporatePurpose: string;
  capitalSocial: string;
  shareQuantity: string;
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
  "societaryType",
  "taxRegime",
  "corporatePurpose",
  "capitalSocial",
  "shareQuantity",
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

/** "1.234,56" / "1234.56" / "1.000" → 1234.56 / 1234.56 / 1000 (null se vazio). */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned) return null;
  const hasGroupedThousands = /^\d{1,3}(?:\.\d{3})+$/.test(cleaned);
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : hasGroupedThousands
      ? cleaned.replace(/\./g, "")
      : cleaned;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Estado do formulário → payload do servidor (null = campo limpo). */
export function holdingFormToFields(form: HoldingFormState) {
  const text = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  return {
    nire: text(form.nire),
    uf: text(form.uf),
    sede: text(form.sede),
    societaryType: text(form.societaryType),
    taxRegime: text(form.taxRegime),
    corporatePurpose: text(form.corporatePurpose),
    capitalSocial: parseAmount(form.capitalSocial),
    shareQuantity: parseAmount(form.shareQuantity),
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
    estimatedMarketValue: parseAmount(form.estimatedMarketValue),
    companyNumber: text(form.companyNumber),
    jurisdiction: (companyJurisdictionValues as readonly string[]).includes(
      form.jurisdiction
    )
      ? (form.jurisdiction as CompanyJurisdiction)
      : null,
    residentAgent: text(form.residentAgent),
    notes: text(form.notes),
  };
}

/** Valores por quota calculados ao vivo no formulário. */
export function computePerShare(form: HoldingFormState) {
  const quantity = parseAmount(form.shareQuantity) ?? 0;
  const perShare = (raw: string) => {
    const amount = parseAmount(raw) ?? 0;
    return quantity > 0 ? amount / quantity : null;
  };

  return {
    contabil: perShare(form.capitalSocial),
    patrimonial: perShare(form.equity),
    mercado: perShare(form.estimatedMarketValue),
  };
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
