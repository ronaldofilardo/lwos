import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./FamilyWealthPieChart", () => ({
  FamilyWealthPieChart: () =>
    createElement("div", { "data-testid": "pie-chart" }, "PieChartMock"),
}));

import { FamilyWealthOverviewCard } from "./FamilyWealthOverviewCard";

describe("FamilyWealthOverviewCard", () => {
  it("renderiza o total patrimonial e nomes dos patriarcas", () => {
    const markup = renderToStaticMarkup(
      createElement(FamilyWealthOverviewCard, {
        wealth: {
          properties: 1_000_000,
          companies: 1_000_000,
          otherAssets: 500_000,
          total: 2_500_000,
        },
        patriarchNames: ["Carlos Silva", "Mariana Silva"],
        isLoading: false,
      })
    );

    expect(markup).toContain("Patrimônio Total Familiar — Visão dos Patriarcas");
    expect(markup).toContain("Carlos Silva · Mariana Silva");
    expect(markup).toContain("R$ 2.500.000,00");
    expect(markup).toContain("Imóveis");
    expect(markup).toContain("Sociedades");
    expect(markup).toContain("Demais ativos");
    expect(markup).toContain("PieChartMock");
  });

  it("exibe aviso de risco de liquidez quando imóveis superam 70% do patrimônio", () => {
    const markup = renderToStaticMarkup(
      createElement(FamilyWealthOverviewCard, {
        wealth: {
          properties: 800_000,
          companies: 100_000,
          otherAssets: 100_000,
          total: 1_000_000,
        },
        patriarchNames: ["Carlos Silva"],
        isLoading: false,
      })
    );

    expect(markup).toContain("80% do patrimônio concentrado em imóveis — risco de liquidez elevado");
  });

  it("exibe aviso quando não há holding societária estruturada", () => {
    const markup = renderToStaticMarkup(
      createElement(FamilyWealthOverviewCard, {
        wealth: {
          properties: 500_000,
          companies: 0,
          otherAssets: 100_000,
          total: 600_000,
        },
        patriarchNames: ["Carlos Silva"],
        isLoading: false,
      })
    );

    expect(markup).toContain("Nenhuma holding societária identificada — avaliar estrutura de proteção");
    expect(markup).toContain("Imóveis sem blindagem societária — exposição a inventário e litígios");
  });

  it("exibe traço quando em estado de carregamento", () => {
    const markup = renderToStaticMarkup(
      createElement(FamilyWealthOverviewCard, {
        wealth: { properties: 0, companies: 0, otherAssets: 0, total: 0 },
        patriarchNames: [],
        isLoading: true,
      })
    );

    expect(markup).toContain("—");
    expect(markup).toContain("Nenhum titular/cônjuge cadastrado");
  });
});

