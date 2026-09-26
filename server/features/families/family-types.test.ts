import { describe, expect, it } from "vitest";
import { familyInputSchema } from "./family-types";

describe("familyInputSchema", () => {
  it("aceita situação conjugal e regime de bens confirmados", () => {
    const parsed = familyInputSchema.parse({ name: "Família Lucathi", civilStatus: "UNIAO_ESTAVEL", maritalRegime: "CPB" });
    expect(parsed.name).toBe("Família Lucathi");
  });

  it("recusa regime fora da taxonomia aprovada", () => {
    expect(() => familyInputSchema.parse({ name: "Família Lucathi", civilStatus: "CASADO", maritalRegime: "PFA" })).toThrow();
  });
});
