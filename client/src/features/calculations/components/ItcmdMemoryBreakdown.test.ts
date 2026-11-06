import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ItcmdMemoryBreakdown } from "./ItcmdMemoryBreakdown";
import { ItcmdCalculationSlice } from "@shared/domain/itcmd-types";

describe("ItcmdMemoryBreakdown", () => {
  it("renderiza mensagem amigável quando não há fatias", () => {
    const html = renderToStaticMarkup(
      createElement(ItcmdMemoryBreakdown, { slices: [] })
    );
    expect(html).toContain("Patrimônio isento ou sem faixas");
  });

  it("renderiza tabela de fatias com valores e alíquotas", () => {
    const slices: ItcmdCalculationSlice[] = [
      {
        order: 1,
        fromValue: 0,
        toValue: 200000,
        sliceBase: 200000,
        rate: 4,
        taxAmount: 8000,
      },
    ];

    const html = renderToStaticMarkup(
      createElement(ItcmdMemoryBreakdown, {
        slices,
        indexedUnitName: "UFIR",
        indexedUnitValue: 4.5,
      })
    );

    expect(html).toContain("1ª Faixa");
    expect(html).toContain("4%");
    expect(html).toContain("UFIR");
  });
});
