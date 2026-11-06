/**
 * Motor tributário de imóveis — as 14 métricas comparativas PF × PJ.
 *
 * Funções puras (sem banco, sem React, sem efeitos colaterais): a mesma fonte
 * alimenta a tabela da aba «Cálculos» e os testes unitários. Todos os valores
 * monetários são arredondados em centavos na saída.
 */
import { toNumberOrNull } from "./company-valuation";

type Num = number | string | null | undefined;

/** IRPJ/CSLL sobre a venda do imóvel na PJ (Lucro Presumido). */
export const SALE_IRPJ_CSLL_RATE = 0.0673;
/** IRPJ/CSLL sobre a receita mensal de locação na PJ. */
export const RENTAL_PJ_IRPJ_CSLL_RATE = 0.1133;
/** IBS/CBS sobre a receita de locação (PF com gatilho e PJ). */
export const IBS_CBS_RENTAL_RATE = 0.084;
/** Mais de 3 imóveis locados na PF exigem receita anual acima deste limite. */
export const IBS_CBS_MIN_REVENUE_MANY_PROPERTIES = 240_000;
/** Um imóvel locado com receita anual acima deste limite dispara o gatilho. */
export const IBS_CBS_MIN_REVENUE_SINGLE_PROPERTY = 288_000;
/** Quantidade de imóveis locados que passa a exigir o limite menor. */
export const IBS_CBS_RENTED_PROPERTIES_THRESHOLD = 3;
/** Utilidade que caracteriza locação/arrendamento (receita de aluguel). */
export const RENTAL_UTILITY = "LOCACAO_ARRENDAMENTO";

export type SaleRecommendation = "PENDENTE" | "VENDER_PF" | "VENDER_PJ";

export const saleRecommendationLabels: Record<SaleRecommendation, string> = {
  PENDENTE: "Pendente",
  VENDER_PF: "Vender PF",
  VENDER_PJ: "Vender PJ",
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const num = (value: Num) => toNumberOrNull(value) ?? 0;

/** Percentual aplicado sobre uma base monetária (alíquota em %, não fração). */
const percentOf = (base: number, rate: Num) => (base * num(rate)) / 100;

/** 1 — ITBI da integralização (alíquota cadastrada no imóvel). */
export function computeItbi(marketValue: Num, itbiRate: Num): number {
  return round2(percentOf(num(marketValue), itbiRate));
}

/** 2 — Laudêmio/aforamento; zero quando o imóvel não tem laudêmio. */
export function computeLaudemio(
  marketValue: Num,
  hasLaudemio: boolean | null | undefined,
  laudemioRate: Num
): number {
  if (!hasLaudemio) return 0;
  return round2(percentOf(num(marketValue), laudemioRate));
}

export type IntegralizationInput = {
  marketValue?: Num;
  itbiRate?: Num;
  emolumentsValue?: Num;
  hasLaudemio?: boolean | null;
  laudemioRate?: Num;
};

/** 3 — Custo de integralização: ITBI + emolumentos + laudêmio. */
export function computeIntegralizationCost(
  input: IntegralizationInput
): number {
  const itbi = computeItbi(input.marketValue, input.itbiRate);
  const emoluments = round2(num(input.emolumentsValue));
  const laudemio = computeLaudemio(
    input.marketValue,
    input.hasLaudemio,
    input.laudemioRate
  );
  return round2(itbi + emoluments + laudemio);
}

/** 4 — IRPJ/CSLL na venda pela PJ (6,73% do valor de mercado). */
export function computeSaleIrpjCsll(marketValue: Num): number {
  return round2(num(marketValue) * SALE_IRPJ_CSLL_RATE);
}

/** 5 — Diferença de IR na venda: PJ (−) PF. Positiva = a PJ paga mais. */
export function computeSaleIrDifference(
  saleIrpjCsll: Num,
  irGcapValue: Num
): number {
  return round2(num(saleIrpjCsll) - num(irGcapValue));
}

/** 6 — Recomendação «Melhor vender» a partir da diferença de IR. */
export function resolveSaleRecommendation(input: {
  marketValue?: Num;
  irGcapValue?: Num;
  difference?: Num;
}): SaleRecommendation {
  const marketValue = num(input.marketValue);
  const irGcapValue = num(input.irGcapValue);
  const difference = round2(num(input.difference));
  if (marketValue === 0 || irGcapValue === 0 || difference === 0) {
    return "PENDENTE";
  }
  return difference > 0 ? "VENDER_PF" : "VENDER_PJ";
}

/**
 * 7 — IRPF mensal sobre a locação (tabela progressiva).
 * Faixas: isento até 2.428,80; depois 7,5%/15%/22,5%/27,5% com parcela a
 * deduzir.
 */
export function computeMonthlyIrpf(rentValue: Num): number {
  const rent = num(rentValue);
  if (rent <= 0 || rent <= 2428.8) return 0;
  if (rent <= 2826.65) return round2(rent * 0.075 - 182.16);
  if (rent <= 3751.05) return round2(rent * 0.15 - 394.16);
  if (rent <= 4664.68) return round2(rent * 0.225 - 675.49);
  return round2(rent * 0.275 - 908.73);
}

export type RentalPortfolio = {
  /** Imóveis locados/arrendados na PF. */
  rentedCount: number;
  /** Receita anual de locação (aluguel mensal × 12). */
  annualRevenue: number;
};

/** Portfólio de locação da família (base do gatilho do IBS/CBS). */
export function computeRentalPortfolio(
  properties: { utility?: string | null; rentValue?: Num }[]
): RentalPortfolio {
  const rented = properties.filter(
    property => property.utility === RENTAL_UTILITY
  );
  const monthlyRevenue = rented.reduce(
    (total, property) => total + num(property.rentValue),
    0
  );
  return {
    rentedCount: rented.length,
    annualRevenue: round2(monthlyRevenue * 12),
  };
}

/**
 * Gatilho do IBS/CBS na locação PF (regra da reforma):
 * i) mais de 3 imóveis locados E receita anual acima de R$ 240.000; ou
 * ii) receita anual acima de R$ 288.000.
 *
 * O item ii é um limite de receita: com um único imóvel ele coincide com a
 * regra descrita no plano e, com dois ou três, evita que uma receita acima do
 * teto fique sem tributação (a exigência de «> 3 imóveis» vale para o limite
 * menor, não para o maior).
 */
export function isIbsCbsTriggered(portfolio: RentalPortfolio): boolean {
  if (portfolio.annualRevenue > IBS_CBS_MIN_REVENUE_SINGLE_PROPERTY) return true;
  return (
    portfolio.rentedCount > IBS_CBS_RENTED_PROPERTIES_THRESHOLD &&
    portfolio.annualRevenue > IBS_CBS_MIN_REVENUE_MANY_PROPERTIES
  );
}

export type PropertyTaxInput = {
  marketValue?: Num;
  irGcapValue?: Num;
  emolumentsValue?: Num;
  itbiRate?: Num;
  hasLaudemio?: boolean | null;
  laudemioRate?: Num;
  utility?: string | null;
  rentValue?: Num;
};

export type PropertyTaxMetrics = {
  /** 1 */ itbi: number;
  /** 2 */ laudemio: number;
  /** 3 */ integralizationCost: number;
  /** 4 */ saleIrpjCsll: number;
  /** 5 */ saleIrDifference: number;
  /** 6 */ recommendation: SaleRecommendation;
  /** 7 */ monthlyIrpf: number;
  /** 8 */ monthlyIbsCbs: number;
  /** 9 */ annualRentalPf: number;
  /** 10 */ annualRentalPjIrpjCsll: number;
  /** 11 */ annualRentalPjIbsCbs: number;
  /** 12 */ annualRentalPj: number;
  /** 13 */ annualRentalSaving: number;
  /** 14 */ paybackYears: number;
};

/**
 * As 14 métricas de um imóvel. `ibsCbsTriggered` é a decisão do portfólio da
 * família (ver `isIbsCbsTriggered`), aplicada só aos imóveis locados.
 */
export function computePropertyTaxMetrics(
  property: PropertyTaxInput,
  options: { ibsCbsTriggered: boolean }
): PropertyTaxMetrics {
  const isRental = property.utility === RENTAL_UTILITY;
  const rent = isRental ? num(property.rentValue) : 0;

  const itbi = computeItbi(property.marketValue, property.itbiRate);
  const laudemio = computeLaudemio(
    property.marketValue,
    property.hasLaudemio,
    property.laudemioRate
  );
  const integralizationCost = round2(
    itbi + round2(num(property.emolumentsValue)) + laudemio
  );
  const saleIrpjCsll = computeSaleIrpjCsll(property.marketValue);
  const saleIrDifference = computeSaleIrDifference(
    saleIrpjCsll,
    property.irGcapValue
  );
  const recommendation = resolveSaleRecommendation({
    marketValue: property.marketValue,
    irGcapValue: property.irGcapValue,
    difference: saleIrDifference,
  });

  const monthlyIrpf = isRental ? computeMonthlyIrpf(rent) : 0;
  const monthlyIbsCbs =
    isRental && options.ibsCbsTriggered
      ? round2(rent * IBS_CBS_RENTAL_RATE)
      : 0;
  const annualRentalPf = round2((monthlyIrpf + monthlyIbsCbs) * 12);
  const annualRentalPjIrpjCsll = round2(
    rent * RENTAL_PJ_IRPJ_CSLL_RATE * 12
  );
  const annualRentalPjIbsCbs = round2(rent * IBS_CBS_RENTAL_RATE * 12);
  const annualRentalPj = round2(
    annualRentalPjIrpjCsll + annualRentalPjIbsCbs
  );
  const annualRentalSaving = round2(annualRentalPf - annualRentalPj);
  const paybackYears =
    annualRentalSaving > 0
      ? round2(integralizationCost / annualRentalSaving)
      : 0;

  return {
    itbi,
    laudemio,
    integralizationCost,
    saleIrpjCsll,
    saleIrDifference,
    recommendation,
    monthlyIrpf,
    monthlyIbsCbs,
    annualRentalPf,
    annualRentalPjIrpjCsll,
    annualRentalPjIbsCbs,
    annualRentalPj,
    annualRentalSaving,
    paybackYears,
  };
}
