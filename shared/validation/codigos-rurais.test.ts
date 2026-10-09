/**
 * @description Testes da validação de códigos rurais (NIRF/CCIR).
 * @see shared/validation/codigos-rurais.ts — regras da Fase 1.
 */
import { describe, expect, it } from "vitest";
import {
  isCodigoRuralValido,
  TAMANHO_CCIR,
  TAMANHO_NIRF,
} from "./codigos-rurais";

describe("isCodigoRuralValido", () => {
  it("aceita somente dígitos no tamanho configurado", () => {
    expect(isCodigoRuralValido("1234567890123", TAMANHO_NIRF)).toBe(true);
    expect(isCodigoRuralValido("1234.5678-90123", TAMANHO_CCIR)).toBe(true);
  });

  it("rejeita tamanho errado", () => {
    expect(isCodigoRuralValido("123", TAMANHO_NIRF)).toBe(false);
    expect(isCodigoRuralValido("", TAMANHO_CCIR)).toBe(false);
  });

  it("rejeita letras", () => {
    expect(isCodigoRuralValido("123456789012A", TAMANHO_NIRF)).toBe(false);
    expect(isCodigoRuralValido("ABCDEFGHIJKLM", TAMANHO_CCIR)).toBe(false);
  });

  it("usa tamanhos provisórios configuráveis", () => {
    expect(TAMANHO_NIRF).toBe(13);
    expect(TAMANHO_CCIR).toBe(13);
    expect(isCodigoRuralValido("12345678901234567", 17)).toBe(true);
  });
});
