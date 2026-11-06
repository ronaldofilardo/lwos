import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ItcmdCompetenceTable } from "./ItcmdCompetenceTable";
import type { StateCompetenceSummary } from "@shared/domain/itcmd-types";

describe("ItcmdCompetenceTable", () => {
  it("renderiza aviso quando não há linhas", () => {
    const html = renderToStaticMarkup(
      createElement(ItcmdCompetenceTable, { rows: [] })
    );
    expect(html).toContain("Nenhum patrimônio cadastrado");
  });

  it("renderiza linhas com estados credores e valores", () => {
    const rows: StateCompetenceSummary[] = [
      {
        uf: "SP",
        scope: "Imóveis situados em SP",
        patrimonyBase: 1000000,
        taxAmount: 40000,
        effectiveRate: 4,
      },
      {
        uf: "RJ",
        scope: "Quotas/Móveis (Domicílio Titular)",
        patrimonyBase: 500000,
        taxAmount: 22500,
        effectiveRate: 4.5,
      },
    ];

    const html = renderToStaticMarkup(
      createElement(ItcmdCompetenceTable, { rows })
    );

    expect(html).toContain("SEFAZ / SP");
    expect(html).toContain("SEFAZ / RJ");
    expect(html).toContain("Imóveis situados em SP");
    expect(html).toContain("4.00%");
    expect(html).toContain("4.50%");
  });
});

