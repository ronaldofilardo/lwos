/**
 * @description Testes do núcleo de validação de CNPJ.
 * @see shared/validation/cnpj.ts — regras de negócio da Fase 1.
 */
import { describe, expect, it } from "vitest";
import { isCnpjValido, mascaraCnpj, normalizarCnpj } from "./cnpj";

describe("normalizarCnpj", () => {
  it("mantém somente dígitos", () => {
    expect(normalizarCnpj("11.222.333/0001-81")).toBe("11222333000181");
  });
});

describe("isCnpjValido", () => {
  it("aceita CNPJs válidos conhecidos", () => {
    expect(isCnpjValido("11.222.333/0001-81")).toBe(true);
    expect(isCnpjValido("04.252.011/0001-10")).toBe(true);
    expect(isCnpjValido("11222333000181")).toBe(true);
  });

  it("rejeita dígito verificador incorreto", () => {
    expect(isCnpjValido("11.222.333/0001-82")).toBe(false);
    expect(isCnpjValido("04.252.011/0001-11")).toBe(false);
  });

  it("rejeita sequência repetida", () => {
    expect(isCnpjValido("11.111.111/1111-11")).toBe(false);
    expect(isCnpjValido("00000000000000")).toBe(false);
  });

  it("rejeita tamanhos errados e letras", () => {
    expect(isCnpjValido("1122233300018")).toBe(false);
    expect(isCnpjValido("")).toBe(false);
    expect(isCnpjValido("ab.ab.ab/abab-ab")).toBe(false);
  });
});

describe("mascaraCnpj", () => {
  it("aplica a máscara 00.000.000/0000-00", () => {
    expect(mascaraCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(mascaraCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("devolve só dígitos quando o tamanho não bate", () => {
    expect(mascaraCnpj("123")).toBe("123");
  });
});
