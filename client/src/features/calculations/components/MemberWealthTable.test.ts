import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MemberWealthTable } from "./MemberWealthTable";

describe("MemberWealthTable", () => {
  const rows = [
    {
      personId: "p1",
      personName: "Carlos Patriarca",
      properties: 1_200_000,
      companies: 800_000,
      otherAssets: 200_000,
      total: 2_200_000,
    },
    {
      personId: "p2",
      personName: "Mariana Esposa",
      properties: 800_000,
      companies: 200_000,
      otherAssets: 100_000,
      total: 1_100_000,
    },
    {
      personId: "p3",
      personName: "Lucas Filho",
      properties: 0,
      companies: 0,
      otherAssets: 50_000,
      total: 50_000,
    },
  ];

  it("renderiza tabela de membros com totalizações individuais", () => {
    const markup = renderToStaticMarkup(
      createElement(MemberWealthTable, { rows })
    );

    expect(markup).toContain("Patrimônio por membro");
    expect(markup).toContain("Carlos Patriarca");
    expect(markup).toContain("Mariana Esposa");
    expect(markup).toContain("Lucas Filho");
    expect(markup).toContain("R$ 2.200.000,00");
    expect(markup).toContain("R$ 1.100.000,00");
    expect(markup).toContain("R$ 50.000,00");
    expect(markup).toContain("Total familiar");
    expect(markup).toContain("R$ 3.350.000,00");
  });

  it("exibe alerta de concentração sucessória no rodapé", () => {
    const markup = renderToStaticMarkup(
      createElement(MemberWealthTable, { rows })
    );

    expect(markup).toContain("concentram");
    expect(markup).toContain("Carlos Patriarca");
  });

  it("exibe estado vazio quando não há membros", () => {
    const markup = renderToStaticMarkup(
      createElement(MemberWealthTable, { rows: [] })
    );

    expect(markup).toContain("Cadastre os membros na aba Família para ver o patrimônio individual.");
  });
});
