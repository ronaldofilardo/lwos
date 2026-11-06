/**
 * @description Motor tributário das 14 métricas de imóveis (aba «Cálculos»):
 * ITBI, laudêmio, integralização, IR da venda, tabela progressiva do IRPF,
 * gatilho do IBS/CBS na locação, comparativo PF × PJ e payback.
 * @see shared/domain/property-tax-engine.ts
 */
import { describe, expect, it } from "vitest";
import {
  computeIntegralizationCost,
  computeItbi,
  computeLaudemio,
  computeMonthlyIrpf,
  computePropertyTaxMetrics,
  computeRentalPortfolio,
  computeSaleIrDifference,
  computeSaleIrpjCsll,
  isIbsCbsTriggered,
  resolveSaleRecommendation,
} from "./property-tax-engine";

describe("property-tax-engine — desembolsos de transferência", () => {
  it("calcula ITBI pela alíquota cadastrada e trata alíquota vazia como zero", () => {
    expect(computeItbi(1_000_000, 3)).toBe(30_000);
    expect(computeItbi(1_000_000, null)).toBe(0);
    expect(computeItbi(null, 2)).toBe(0);
  });

  it("só cobra laudêmio quando o imóvel tem laudêmio e alíquota", () => {
    expect(computeLaudemio(500_000, true, 5)).toBe(25_000);
    expect(computeLaudemio(500_000, false, 5)).toBe(0);
    expect(computeLaudemio(500_000, true, null)).toBe(0);
  });

  it("soma ITBI + emolumentos + laudêmio no custo de integralização", () => {
    expect(
      computeIntegralizationCost({
        marketValue: 500_000,
        itbiRate: 2,
        emolumentsValue: 12_000,
        hasLaudemio: true,
        laudemioRate: 5,
      })
    ).toBe(47_000);
  });
});

describe("property-tax-engine — venda PF × PJ", () => {
  it("aplica 6,73% de IRPJ/CSLL sobre o valor de mercado", () => {
    expect(computeSaleIrpjCsll(1_000_000)).toBe(67_300);
  });

  it("mede a diferença como PJ menos PF", () => {
    expect(computeSaleIrDifference(67_300, 50_000)).toBe(17_300);
    expect(computeSaleIrDifference(67_300, 80_000)).toBe(-12_700);
  });

  it("recomenda vender PF quando a PJ paga mais e PJ quando paga menos", () => {
    expect(
      resolveSaleRecommendation({
        marketValue: 1_000_000,
        irGcapValue: 50_000,
        difference: 17_300,
      })
    ).toBe("VENDER_PF");
    expect(
      resolveSaleRecommendation({
        marketValue: 1_000_000,
        irGcapValue: 80_000,
        difference: -12_700,
      })
    ).toBe("VENDER_PJ");
  });

  it("deixa pendente sem valor de mercado, sem IRPF ou sem diferença", () => {
    expect(
      resolveSaleRecommendation({ marketValue: 0, irGcapValue: 1, difference: 10 })
    ).toBe("PENDENTE");
    expect(
      resolveSaleRecommendation({ marketValue: 10, irGcapValue: 0, difference: 10 })
    ).toBe("PENDENTE");
    expect(
      resolveSaleRecommendation({ marketValue: 10, irGcapValue: 1, difference: 0 })
    ).toBe("PENDENTE");
  });
});

describe("property-tax-engine — IRPF mensal (tabela progressiva)", () => {
  it("é isento até R$ 2.428,80", () => {
    expect(computeMonthlyIrpf(2_428.8)).toBe(0);
    expect(computeMonthlyIrpf(2_000)).toBe(0);
  });

  it("aplica as quatro faixas seguintes", () => {
    expect(computeMonthlyIrpf(2_500)).toBe(5.34);
    expect(computeMonthlyIrpf(3_000)).toBe(55.84);
    expect(computeMonthlyIrpf(4_000)).toBe(224.51);
    expect(computeMonthlyIrpf(5_000)).toBe(466.27);
  });

  it("trata aluguel ausente como isento", () => {
    expect(computeMonthlyIrpf(null)).toBe(0);
  });
});

describe("property-tax-engine — gatilho do IBS/CBS na locação PF", () => {
  const rented = (rentValue: number, index: number) => ({
    utility: "LOCACAO_ARRENDAMENTO" as const,
    rentValue,
    id: `imovel-${index}`,
  });

  it("não dispara com 3 imóveis e receita abaixo do limite", () => {
    const portfolio = computeRentalPortfolio([
      rented(6_000, 1),
      rented(6_000, 2),
      rented(6_000, 3),
    ]);
    expect(portfolio.rentedCount).toBe(3);
    expect(portfolio.annualRevenue).toBe(216_000);
    expect(isIbsCbsTriggered(portfolio)).toBe(false);
  });

  it("dispara com mais de 3 imóveis e receita acima de R$ 240.000/ano", () => {
    const portfolio = computeRentalPortfolio([
      rented(6_000, 1),
      rented(6_000, 2),
      rented(6_000, 3),
      rented(6_000, 4),
    ]);
    expect(portfolio.annualRevenue).toBe(288_000);
    expect(isIbsCbsTriggered(portfolio)).toBe(true);
  });

  it("dispara com um imóvel e receita acima de R$ 288.000/ano", () => {
    expect(isIbsCbsTriggered(computeRentalPortfolio([rented(25_000, 1)]))).toBe(true);
  });

  it("ignora imóveis que não são de locação", () => {
    const portfolio = computeRentalPortfolio([
      { utility: "RESIDENCIAL", rentValue: 100_000 },
      { utility: "PENDENTE", rentValue: null },
    ]);
    expect(portfolio.rentedCount).toBe(0);
    expect(isIbsCbsTriggered(portfolio)).toBe(false);
  });
});

describe("property-tax-engine — as 14 métricas de um imóvel", () => {
  const property = {
    marketValue: 1_000_000,
    irGcapValue: 50_000,
    emolumentsValue: 10_000,
    itbiRate: 2,
    hasLaudemio: false,
    laudemioRate: 0,
    utility: "LOCACAO_ARRENDAMENTO",
    rentValue: 10_000,
  };

  it("calcula o comparativo completo de locação com o gatilho ligado", () => {
    const metrics = computePropertyTaxMetrics(property, { ibsCbsTriggered: true });
    expect(metrics.itbi).toBe(20_000);
    expect(metrics.laudemio).toBe(0);
    expect(metrics.integralizationCost).toBe(30_000);
    expect(metrics.saleIrpjCsll).toBe(67_300);
    expect(metrics.saleIrDifference).toBe(17_300);
    expect(metrics.recommendation).toBe("VENDER_PF");
    // Faixa de 27,5%: 10.000 × 27,5% − 908,73.
    expect(metrics.monthlyIrpf).toBe(1_841.27);
    expect(metrics.monthlyIbsCbs).toBe(840);
    expect(metrics.annualRentalPf).toBe(32_175.24);
    expect(metrics.annualRentalPjIrpjCsll).toBe(13_596);
    expect(metrics.annualRentalPjIbsCbs).toBe(10_080);
    expect(metrics.annualRentalPj).toBe(23_676);
    expect(metrics.annualRentalSaving).toBe(8_499.24);
    expect(metrics.paybackYears).toBe(3.53);
  });

  it("zera o IBS/CBS mensal quando o portfólio não dispara o gatilho", () => {
    const metrics = computePropertyTaxMetrics(property, { ibsCbsTriggered: false });
    expect(metrics.monthlyIbsCbs).toBe(0);
    expect(metrics.annualRentalPf).toBe(22_095.24);
  });

  it("zera as métricas de locação em imóvel que não é de locação", () => {
    const metrics = computePropertyTaxMetrics(
      { ...property, utility: "RESIDENCIAL" },
      { ibsCbsTriggered: true }
    );
    expect(metrics.monthlyIrpf).toBe(0);
    expect(metrics.annualRentalPj).toBe(0);
    expect(metrics.paybackYears).toBe(0);
    expect(metrics.integralizationCost).toBe(30_000);
  });

  it("não calcula payback quando a economia é nula ou negativa", () => {
    const metrics = computePropertyTaxMetrics(
      {
        marketValue: 100_000,
        irGcapValue: 10_000,
        emolumentsValue: 1_000,
        itbiRate: 2,
        utility: "LOCACAO_ARRENDAMENTO",
        rentValue: 1_000,
      },
      { ibsCbsTriggered: false }
    );
    expect(metrics.annualRentalSaving).toBeLessThanOrEqual(0);
    expect(metrics.paybackYears).toBe(0);
  });
});
