import { describe, expect, it } from "vitest";
import { familyInputSchema } from "./family-types";

describe("familyInputSchema", () => {
  it("aceita projeto com nome, observações e objetivo", () => {
    const parsed = familyInputSchema.parse({
      name: "Projeto Lucathi",
      notes: "diligência inicial",
      objectives: ["PROTECAO_PATRIMONIAL"],
    });
    expect(parsed.name).toBe("Projeto Lucathi");
    expect(parsed.notes).toBe("diligência inicial");
    expect(parsed.objectives).toEqual(["PROTECAO_PATRIMONIAL"]);
  });

  it("aceita múltiplos objetivos", () => {
    const parsed = familyInputSchema.parse({
      name: "Projeto Lucathi",
      objectives: ["PLANEJAMENTO_SUCESSORIO", "EFICIENCIA_FISCAL", "FILANTROPIA"],
    });
    expect(parsed.objectives).toHaveLength(3);
  });

  it("recusa a criação sem objetivo", () => {
    expect(() =>
      familyInputSchema.parse({ name: "Projeto Lucathi", objectives: [] })
    ).toThrow(/ao menos um objetivo/i);
    expect(() =>
      familyInputSchema.parse({ name: "Projeto Lucathi" })
    ).toThrow();
  });

  it("recusa objetivo fora das 14 opções", () => {
    expect(() =>
      familyInputSchema.parse({ name: "Projeto Lucathi", objectives: ["OBJETIVO_INVENTADO"] })
    ).toThrow();
  });

  it("exige nome com ao menos 3 caracteres", () => {
    expect(() =>
      familyInputSchema.parse({ name: "AB", objectives: ["FILANTROPIA"] })
    ).toThrow();
  });

  it("descarta campos legados (civilStatus/maritalRegime) sem rejeitar", () => {
    const parsed = familyInputSchema.parse({
      name: "Projeto Lucathi",
      objectives: ["FILANTROPIA"],
      civilStatus: "CASADO",
      maritalRegime: "PFA",
    });
    expect(parsed).toEqual({ name: "Projeto Lucathi", objectives: ["FILANTROPIA"] });
  });
});
