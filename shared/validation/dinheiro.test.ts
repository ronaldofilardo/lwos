/**
 * @description Testes de parse/formato de dinheiro e percentual em pt-BR.
 * @see shared/validation/dinheiro.ts — regras da Fase 1 ("1.500,50" nunca vira 1,5).
 */
import { describe, expect, it } from "vitest";
import {
  formatarDinheiro,
  formatarPercentual,
  isDinheiroValido,
  isPercentualValido,
  MAX_DINHEIRO,
  parseNumeroPtBR,
  parsePercentual,
} from "./dinheiro";

describe("parseNumeroPtBR", () => {
  it("interpreta ponto como milhar e vírgula como decimal", () => {
    expect(parseNumeroPtBR("1.500")).toBe(1500);
    expect(parseNumeroPtBR("1.500,50")).toBe(1500.5);
    expect(parseNumeroPtBR("0,5")).toBe(0.5);
  });

  it("aceita ponto decimal quando não forma grupos de 3", () => {
    expect(parseNumeroPtBR("1.5")).toBe(1.5);
    expect(parseNumeroPtBR("10")).toBe(10);
  });

  it("aceita prefixo R$ e espaços", () => {
    expect(parseNumeroPtBR("R$ 1.500,50")).toBe(1500.5);
    expect(parseNumeroPtBR("  25,00  ")).toBe(25);
  });

  it("rejeita vazio, letras, negativo e múltiplas vírgulas", () => {
    expect(parseNumeroPtBR("")).toBeNull();
    expect(parseNumeroPtBR("abc")).toBeNull();
    expect(parseNumeroPtBR("-5,00")).toBeNull();
    expect(parseNumeroPtBR("1,5,5")).toBeNull();
    expect(parseNumeroPtBR("1.50.0")).toBeNull();
  });
});

describe("formatarDinheiro", () => {
  it("formata com 2 casas no padrão pt-BR", () => {
    expect(formatarDinheiro(1500.5)).toBe("1.500,50");
    expect(formatarDinheiro(0)).toBe("0,00");
  });
});

describe("isDinheiroValido", () => {
  it("aceita não negativo dentro de numeric(15,2)", () => {
    expect(isDinheiroValido(0)).toBe(true);
    expect(isDinheiroValido(MAX_DINHEIRO)).toBe(true);
  });

  it("rejeita negativo, NaN e acima do teto", () => {
    expect(isDinheiroValido(-0.01)).toBe(false);
    expect(isDinheiroValido(Number.NaN)).toBe(false);
    expect(isDinheiroValido(MAX_DINHEIRO + 1)).toBe(false);
  });
});

describe("parsePercentual", () => {
  it("aceita valores na faixa 0–100 com ponto pt-BR", () => {
    expect(parsePercentual("50,5")).toBe(50.5);
    expect(parsePercentual("0")).toBe(0);
    expect(parsePercentual("100,00")).toBe(100);
  });

  it("rejeita fora da faixa e entradas inválidas", () => {
    expect(parsePercentual("100,01")).toBeNull();
    expect(parsePercentual("-1")).toBeNull();
    expect(parsePercentual("")).toBeNull();
  });
});

describe("formatarPercentual / isPercentualValido", () => {
  it("formata com 2 casas e valida faixa", () => {
    expect(formatarPercentual(50.5)).toBe("50,50");
    expect(isPercentualValido(100)).toBe(true);
    expect(isPercentualValido(100.01)).toBe(false);
    expect(isPercentualValido(-1)).toBe(false);
    expect(isPercentualValido(Number.NaN)).toBe(false);
  });
});
