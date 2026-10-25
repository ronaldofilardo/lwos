/**
 * @description Schemas zod de dinheiro e quantidade de quotas: faixa de
 * numeric(15,2), sem negativos, sem infinito e sem fração nas quotas.
 * @see shared/validation/dinheiro-schema.ts
 */
import { describe, expect, it } from "vitest";
import { dinheiroSchema, quantidadeQuotasSchema } from "./dinheiro-schema";

describe("dinheiroSchema", () => {
  it("aceita de zero até o teto", () => {
    expect(dinheiroSchema.safeParse(0).success).toBe(true);
    expect(dinheiroSchema.safeParse(1234.56).success).toBe(true);
    expect(dinheiroSchema.safeParse(9_999_999_999_999.99).success).toBe(true);
  });

  it("rejeita negativo, infinito, NaN e acima do teto", () => {
    expect(dinheiroSchema.safeParse(-0.01).success).toBe(false);
    expect(dinheiroSchema.safeParse(Number.POSITIVE_INFINITY).success).toBe(false);
    expect(dinheiroSchema.safeParse(Number.NaN).success).toBe(false);
    expect(dinheiroSchema.safeParse(10_000_000_000_000).success).toBe(false);
  });
});

describe("quantidadeQuotasSchema", () => {
  it("aceita inteiro positivo", () => {
    expect(quantidadeQuotasSchema.safeParse(1).success).toBe(true);
    expect(quantidadeQuotasSchema.safeParse(10_000).success).toBe(true);
  });

  it("rejeita zero, negativo e fração", () => {
    expect(quantidadeQuotasSchema.safeParse(0).success).toBe(false);
    expect(quantidadeQuotasSchema.safeParse(-1).success).toBe(false);
    expect(quantidadeQuotasSchema.safeParse(2.5).success).toBe(false);
  });
});
