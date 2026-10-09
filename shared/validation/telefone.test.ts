/**
 * @description Testes das validações de telefone (DDD + 8/9 dígitos).
 * @see shared/validation/telefone.ts — regras da Fase 1.
 */
import { describe, expect, it } from "vitest";
import { DDDS_VALIDOS, isTelefoneValido, normalizarTelefone } from "./telefone";

describe("normalizarTelefone", () => {
  it("mantém somente dígitos", () => {
    expect(normalizarTelefone("(11) 98765-4321")).toBe("11987654321");
  });
});

describe("isTelefoneValido", () => {
  it("aceita celular com 9 dígitos começando em 9", () => {
    expect(isTelefoneValido("11 98765-4321")).toBe(true);
    expect(isTelefoneValido("11987654321")).toBe(true);
  });

  it("aceita fixo com 8 dígitos", () => {
    expect(isTelefoneValido("(11) 3456-7890")).toBe(true);
  });

  it("aceita DDI +55 opcional", () => {
    expect(isTelefoneValido("+55 11 98765-4321")).toBe(true);
    expect(isTelefoneValido("551134567890")).toBe(true);
  });

  it("rejeita DDD inválido", () => {
    expect(isTelefoneValido("20 98765-4321")).toBe(false);
    expect(isTelefoneValido("00 3456-7890")).toBe(false);
  });

  it("rejeita tamanho errado", () => {
    expect(isTelefoneValido("11 98765-43")).toBe(false);
    expect(isTelefoneValido("")).toBe(false);
  });

  it("rejeita 9 dígitos que não começam com 9", () => {
    expect(isTelefoneValido("11 38765-4321")).toBe(false);
  });

  it("tem 67 DDDs válidos", () => {
    expect(DDDS_VALIDOS).toHaveLength(67);
    expect(DDDS_VALIDOS).toContain(11);
    expect(DDDS_VALIDOS).toContain(99);
  });
});
