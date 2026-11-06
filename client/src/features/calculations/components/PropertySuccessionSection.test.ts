import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PropertySuccessionSection } from "./PropertySuccessionSection";
import type { PropertyTaxRow } from "../types";

const mockProperty: PropertyTaxRow = {
  propertyId: "p1",
  description: "Fazenda Rio Pardo",
  marketValue: 5000000,
  bookValue: 2000000,
  itbiValue: 150000,
  itbiRate: 3,
  emolumentsValue: 12000,
  irGcapValue: 450000,
  integralizationCost: 162000,
  annualRentalSaving: 0,
  paybackYears: 0,
  isRental: false,
  hasLaudemio: false,
  laudemioRate: null,
  recommendation: "MANTER_PF",
  gainOnSale: 3000000,
  taxPfSale: 450000,
  taxPjSale: 200000,
  saleSaving: 250000,
  rentValue: 0,
  uf: "GO",
  itcmdTax: 320000,
  itcmdRate: 6.4,
};

describe("PropertySuccessionSection", () => {
  it("renderiza a seção individual com UF e valores tributários", () => {
    const html = renderToStaticMarkup(
      createElement(PropertySuccessionSection, { property: mockProperty })
    );

    expect(html).toContain("SEFAZ / GO");
    expect(html).toContain("6.40%");
    expect(html).toContain("Devido ao Estado de GO");
    expect(html).toContain("Art. 155, § 1º, I da CF/88");
  });
});

