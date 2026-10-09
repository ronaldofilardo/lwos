/**
 * @description Testes do enum de UF (27 unidades federativas).
 * @see shared/validation/uf.ts — regras da Fase 1.
 */
import { describe, expect, it } from "vitest";
import { isUf, UFS, ufSchema } from "./uf";

describe("UFS", () => {
  it("tem as 27 unidades federativas", () => {
    expect(UFS).toHaveLength(27);
    expect(UFS).toContain("SP");
    expect(UFS).toContain("DF");
    expect(UFS).toContain("AM");
  });
});

describe("isUf", () => {
  it("aceita siglas válidas", () => {
    expect(isUf("SP")).toBe(true);
    expect(isUf("RR")).toBe(true);
  });

  it("rejeita siglas inválidas", () => {
    expect(isUf("XX")).toBe(false);
    expect(isUf("sp")).toBe(false);
    expect(isUf("São Paulo")).toBe(false);
  });
});

describe("ufSchema", () => {
  it("valida siglas pelo zod enum", () => {
    expect(ufSchema.safeParse("MG").success).toBe(true);
    expect(ufSchema.safeParse("ZZ").success).toBe(false);
  });
});
