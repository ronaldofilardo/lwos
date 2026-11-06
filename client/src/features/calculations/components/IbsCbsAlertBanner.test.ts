import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IbsCbsAlertBanner } from "./IbsCbsAlertBanner";

describe("IbsCbsAlertBanner", () => {
  it("não renderiza nada quando o gatilho não foi disparado", () => {
    const markup = renderToStaticMarkup(
      createElement(IbsCbsAlertBanner, {
        portfolio: { rentedCount: 2, annualRevenue: 100_000 },
        triggered: false,
      })
    );
    expect(markup).toBe("");
  });

  it("renderiza o banner com alerta quando disparado com mais de 3 imóveis", () => {
    const markup = renderToStaticMarkup(
      createElement(IbsCbsAlertBanner, {
        portfolio: { rentedCount: 4, annualRevenue: 300_000 },
        triggered: true,
      })
    );

    expect(markup).toContain("Gatilho IBS/CBS atingido");
    expect(markup).toContain("4 imóvel(is) locado(s)");
    expect(markup).toContain("8,4%");
    expect(markup).toContain("Mais de 3 imóveis locados e receita acima de R$ 240.000/ano");
  });

  it("renderiza texto para gatilho por receita alta em poucos imóveis", () => {
    const markup = renderToStaticMarkup(
      createElement(IbsCbsAlertBanner, {
        portfolio: { rentedCount: 1, annualRevenue: 350_000 },
        triggered: true,
      })
    );

    expect(markup).toContain("Gatilho IBS/CBS atingido");
    expect(markup).toContain("1 imóvel(is) locado(s)");
    expect(markup).toContain("Receita anual acima de R$ 288.000");
  });
});

