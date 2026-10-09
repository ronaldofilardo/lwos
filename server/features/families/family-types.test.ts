import { describe, expect, it } from "vitest";
import { familyInputSchema } from "./family-types";

describe("familyInputSchema", () => {
  it("aceita família com nome e observações", () => {
    const parsed = familyInputSchema.parse({ name: "Família Lucathi", notes: "diligência inicial" });
    expect(parsed.name).toBe("Família Lucathi");
    expect(parsed.notes).toBe("diligência inicial");
  });

  it("descarta campos legados (civilStatus/maritalRegime) sem rejeitar", () => {
    const parsed = familyInputSchema.parse({ name: "Família Lucathi", civilStatus: "CASADO", maritalRegime: "PFA" });
    expect(parsed).toEqual({ name: "Família Lucathi" });
  });
});
