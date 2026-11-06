import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PropertyTaxComparisonTable } from "./PropertyTaxComparisonTable";
import type { PropertyTaxRow } from "../types";

describe("PropertyTaxComparisonTable", () => {
  const rows: PropertyTaxRow[] = [
    {
      propertyId: "prop-1",
      description: "Apto Jardins",
      marketValue: 2_000_000,
      isRental: true,
      itbiRate: 3,
      hasLaudemio: false,
      laudemioRate: null,
      emolumentsValue: 1_500,
      irGcapValue: 50_000,
      rentValue: 10_000,
      itbi: 60_000,
      laudemio: 0,
      integralizationCost: 61_500,
      saleIrpjCsll: 134_600,
      saleIrDifference: 84_600,
      recommendation: "VENDER_PF",
      monthlyIrpf: 1841.27,
      monthlyIbsCbs: 0,
      annualRentalPf: 22095.24,
      annualRentalPjIrpjCsll: 13596,
      annualRentalPjIbsCbs: 10080,
      annualRentalPj: 23676,
      annualRentalSaving: -1580.76,
      paybackYears: 0,
    },
    {
      propertyId: "prop-2",
      description: "Casa Praia",
      marketValue: 1_500_000,
      isRental: false,
      itbiRate: 2,
      hasLaudemio: true,
      laudemioRate: 2.5,
      emolumentsValue: 1_200,
      irGcapValue: 0,
      rentValue: 0,
      itbi: 30_000,
      laudemio: 37_500,
      integralizationCost: 68_700,
      saleIrpjCsll: 100_950,
      saleIrDifference: 100_950,
      recommendation: "PENDENTE",
      monthlyIrpf: 0,
      monthlyIbsCbs: 0,
      annualRentalPf: 0,
      annualRentalPjIrpjCsll: 0,
      annualRentalPjIbsCbs: 0,
      annualRentalPj: 0,
      annualRentalSaving: 0,
      paybackYears: 0,
    },
  ];

  it("renderiza cabeçalhos executivos da tabela sem scroll abusivo", () => {
    const markup = renderToStaticMarkup(
      createElement(PropertyTaxComparisonTable, { rows })
    );

    expect(markup).toContain("Comparativo tributário por imóvel");
    expect(markup).toContain("Imóvel");
    expect(markup).toContain("Valor de mercado");
    expect(markup).toContain("Desinvestir");
    expect(markup).toContain("Economia PJ/ano");
    expect(markup).toContain("Payback");
  });

  it("renderiza linhas dos imóveis com badges e botões de ficha", () => {
    const markup = renderToStaticMarkup(
      createElement(PropertyTaxComparisonTable, { rows })
    );

    expect(markup).toContain("Apto Jardins");
    expect(markup).toContain("Com locação ativa");
    expect(markup).toContain("R$ 2.000.000,00");
    expect(markup).toContain("Vender PF");

    expect(markup).toContain("Casa Praia");
    expect(markup).toContain("Sem locação");
    expect(markup).toContain("R$ 1.500.000,00");
    expect(markup).toContain("Ver Ficha");
  });

  it("exibe mensagem quando não há imóveis cadastrados", () => {
    const markup = renderToStaticMarkup(
      createElement(PropertyTaxComparisonTable, { rows: [] })
    );

    expect(markup).toContain("Cadastre imóveis na aba Patrimônio para visualizar o comparativo.");
  });
});
