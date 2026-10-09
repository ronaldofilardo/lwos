/**
 * @description Testes das validações de data, idade e nascimento.
 * @see shared/validation/datas.ts — regras da Fase 1 (datas limite, fuso SP).
 */
import { describe, expect, it } from "vitest";
import {
  isDataIsoValida,
  isNascimentoValido,
  idadeDecimal,
  idadeEmAnosCompletos,
  formatarIdadeDecimal,
  IDADE_MAXIMA_ANOS,
  hoje,
} from "./datas";

describe("isDataIsoValida", () => {
  it("aceita datas reais em YYYY-MM-DD", () => {
    expect(isDataIsoValida("2024-02-29")).toBe(true);
    expect(isDataIsoValida("2023-12-31")).toBe(true);
  });

  it("rejeita datas impossíveis ou com formato errado", () => {
    expect(isDataIsoValida("2023-02-29")).toBe(false);
    expect(isDataIsoValida("2023-13-01")).toBe(false);
    expect(isDataIsoValida("09/10/2026")).toBe(false);
    expect(isDataIsoValida("")).toBe(false);
  });
});

describe("hoje", () => {
  it("devolve data local de São Paulo em YYYY-MM-DD", () => {
    expect(hoje()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("idadeEmAnosCompletos", () => {
  it("conta exatamente no aniversário de 18 anos", () => {
    expect(idadeEmAnosCompletos("2008-10-09", "2026-10-09")).toBe(18);
    expect(idadeEmAnosCompletos("2008-10-09", "2026-10-08")).toBe(17);
  });

  it("trata 29/02 corretamente em ano não bissexto", () => {
    expect(idadeEmAnosCompletos("2008-02-29", "2026-02-28")).toBe(17);
    expect(idadeEmAnosCompletos("2008-02-29", "2026-03-01")).toBe(18);
    expect(idadeEmAnosCompletos("2008-02-29", "2024-02-29")).toBe(16);
  });

  it("retorna NaN para data inválida", () => {
    expect(idadeEmAnosCompletos("abc", "2026-10-09")).toBeNaN();
    expect(idadeDecimal("abc", "2026-10-09")).toBeNaN();
  });
});

describe("idadeDecimal", () => {
  it("calcula idade em dias ÷ 365,25", () => {
    expect(idadeDecimal("2008-10-09", "2026-10-09")).toBeCloseTo(17.9986, 3);
    expect(idadeDecimal("2026-10-09", "2026-10-09")).toBe(0);
  });

  it("formata no padrão pt-BR com vírgula", () => {
    expect(formatarIdadeDecimal(42.26)).toBe("42,3 anos");
    expect(formatarIdadeDecimal(0)).toBe("0,0 anos");
  });
});

describe("isNascimentoValido", () => {
  it("aceita data real não futura dentro da idade máxima", () => {
    expect(isNascimentoValido("1990-05-20", "2026-10-09")).toBe(true);
    expect(isNascimentoValido("1906-10-09", "2026-10-09")).toBe(true);
  });

  it("rejeita data futura", () => {
    expect(isNascimentoValido("2027-01-01", "2026-10-09")).toBe(false);
    expect(isNascimentoValido("2026-10-10", "2026-10-09")).toBe(false);
  });

  it("rejeita acima da idade máxima", () => {
    const cemAnosAtras = `${2026 - IDADE_MAXIMA_ANOS - 1}-10-09`;
    expect(isNascimentoValido(cemAnosAtras, "2026-10-09")).toBe(false);
    const exatamente = `${2026 - IDADE_MAXIMA_ANOS}-10-09`;
    expect(isNascimentoValido(exatamente, "2026-10-09")).toBe(true);
  });

  it("rejeita calendário inválido", () => {
    expect(isNascimentoValido("1990-02-30", "2026-10-09")).toBe(false);
    expect(isNascimentoValido("não é data", "2026-10-09")).toBe(false);
  });
});
