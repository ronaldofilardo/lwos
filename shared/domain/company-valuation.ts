/**
 * Valoração da sociedade (fonte única para cliente e servidor).
 *
 * Balanço apurado = Caixa + Estoque + Créditos a receber + Investimentos +
 * Ativo Imobilizado + Lucros Acumulados − Obrigações trabalhistas −
 * Obrigações tributárias − Financiamentos.
 * O PL NÃO entra na conta. O campo não é digitado: sempre derivado.
 *
 * Valor mercado = balanço apurado + valor dos imóveis em nome da sociedade.
 * Os imóveis NÃO entram no balanço (nem no ativo imobilizado): são somados na
 * leitura, a partir de `propertyOwners`, para que editar um imóvel não deixe o
 * valor da sociedade desatualizado e para que o patrimônio sob gestão some
 * cada imóvel uma única vez.
 */

type Num = number | string | null | undefined;

export const ESTIMATED_VALUE_ASSET_KEYS = [
  "cashAndEquivalents",
  "inventory",
  "accountsReceivable",
  "investments",
  "fixedAssets",
  "retainedEarnings",
] as const;

export const ESTIMATED_VALUE_LIABILITY_KEYS = [
  "laborLiabilities",
  "taxLiabilities",
  "financing",
] as const;

export type EstimatedValueInput = Partial<
  Record<
    | (typeof ESTIMATED_VALUE_ASSET_KEYS)[number]
    | (typeof ESTIMATED_VALUE_LIABILITY_KEYS)[number],
    Num
  >
>;

export type CompanyTotals = {
  capitalSocial: number | null;
  equity: number | null;
  estimatedValue: number | null;
  shareQuantity: number | null;
};

export type ValuationTriple = {
  contabil: number | null;
  patrimonial: number | null;
  mercado: number | null;
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** "100000.00" / 100000 → 100000; vazio, null ou inválido → null. */
export function toNumberOrNull(value: Num): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Valor estimado; null quando nenhum item do balanço foi informado. */
export function computeEstimatedValue(input: EstimatedValueInput): number | null {
  const assets = ESTIMATED_VALUE_ASSET_KEYS.map(key => toNumberOrNull(input[key]));
  const liabilities = ESTIMATED_VALUE_LIABILITY_KEYS.map(key => toNumberOrNull(input[key]));
  if ([...assets, ...liabilities].every(value => value === null)) return null;
  const sum = (values: (number | null)[]) =>
    values.reduce<number>((total, value) => total + (value ?? 0), 0);
  return round2(sum(assets) - sum(liabilities));
}

/**
 * Valor mercado da sociedade: balanço apurado + imóveis em seu nome.
 * `propertyValue` é a soma de `marketValue` ponderada pela participação
 * (propertyOwners) e nunca é gravada na coluna do balanço.
 */
export function computeMarketValue(
  balanceValue: number | null,
  propertyValue: Num
): number | null {
  const properties = toNumberOrNull(propertyValue) ?? 0;
  if (balanceValue === null && properties === 0) return null;
  return round2((balanceValue ?? 0) + properties);
}

/** Totais da sociedade a partir de uma linha de detalhes (valores numéricos ou texto do banco). */
export function companyTotalsFromRow(
  row: (EstimatedValueInput & {
    capitalSocial?: Num;
    equity?: Num;
    shareQuantity?: Num;
  }) | null | undefined,
  propertyValue?: Num
): CompanyTotals {
  const balanceValue = row ? computeEstimatedValue(row) : null;
  return {
    capitalSocial: toNumberOrNull(row?.capitalSocial),
    equity: toNumberOrNull(row?.equity),
    estimatedValue: computeMarketValue(balanceValue, propertyValue),
    shareQuantity: toNumberOrNull(row?.shareQuantity),
  };
}

/** Valor por quota/ação: capital ÷ qtd, PL ÷ qtd, valor estimado ÷ qtd (null sem quantidade). */
export function computeUnitValues(totals: CompanyTotals): ValuationTriple {
  const quantity = totals.shareQuantity;
  const perUnit = (value: number | null) =>
    quantity !== null && quantity > 0 && value !== null ? value / quantity : null;
  return {
    contabil: perUnit(totals.capitalSocial),
    patrimonial: perUnit(totals.equity),
    mercado: perUnit(totals.estimatedValue),
  };
}

/**
 * Participação de um sócio em valores. Equivale a (quotas do sócio × valor
 * unitário), pois quotas do sócio = % × total de quotas; calculado direto
 * pelo percentual para não depender da quantidade de quotas e evitar erro de
 * arredondamento do valor unitário.
 */
export function computeStakeholderValues(
  percentage: Num,
  totals: CompanyTotals
): ValuationTriple {
  const pct = toNumberOrNull(percentage);
  const share = (value: number | null) =>
    pct !== null && value !== null ? round2((value * pct) / 100) : null;
  return {
    contabil: share(totals.capitalSocial),
    patrimonial: share(totals.equity),
    mercado: share(totals.estimatedValue),
  };
}
