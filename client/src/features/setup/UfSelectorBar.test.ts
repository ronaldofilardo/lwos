import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UfSelectorBar } from "./UfSelectorBar";

describe("UfSelectorBar", () => {
  it("renderiza botões das UFs agrupadas por região", () => {
    const html = renderToStaticMarkup(
      createElement(UfSelectorBar, {
        selectedUf: "SP",
        onSelectUf: vi.fn(),
        summaries: [
          {
            uf: "SP",
            bracketCount: 1,
            minRate: 4,
            maxRate: 4,
            indexedUnitName: null,
            indexedUnitValue: null,
          },
        ],
      })
    );

    expect(html).toContain("Sudeste");
    expect(html).toContain("Sul");
    expect(html).toContain("SP");
    expect(html).toContain("RJ");
  });
});
