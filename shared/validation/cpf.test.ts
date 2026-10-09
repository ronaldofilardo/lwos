/**
 * @description Testes do núcleo de validação de CPF.
 * @see shared/validation/cpf.ts — regras de negócio da Fase 1.
 */
import { describe, expect, it } from "vitest";
import { isCpfValido, mascaraCpf, normalizarCpf } from "./cpf";

describe("normalizarCpf", () => {
  it("mantém somente dígitos", () => {
    // arrange
    const entrada = "529.982.247-25";

    // act
    const resultado = normalizarCpf(entrada);

    // assert
    expect(resultado).toBe("52998224725");
  });
});

describe("isCpfValido", () => {
  it("aceita CPFs válidos conhecidos", () => {
    expect(isCpfValido("529.982.247-25")).toBe(true);
    expect(isCpfValido("111.444.777-35")).toBe(true);
    expect(isCpfValido("52998224725")).toBe(true);
  });

  it("rejeita dígito verificador incorreto", () => {
    expect(isCpfValido("529.982.247-24")).toBe(false);
    expect(isCpfValido("111.444.777-30")).toBe(false);
  });

  it("rejeita sequência repetida", () => {
    expect(isCpfValido("111.111.111-11")).toBe(false);
    expect(isCpfValido("000.000.000-00")).toBe(false);
    expect(isCpfValido("99999999999")).toBe(false);
  });

  it("rejeita tamanhos errados e letras", () => {
    expect(isCpfValido("1234567890")).toBe(false);
    expect(isCpfValido("")).toBe(false);
    expect(isCpfValido("abc.def.ghi-jk")).toBe(false);
  });
});

describe("mascaraCpf", () => {
  it("aplica a máscara 000.000.000-00", () => {
    expect(mascaraCpf("52998224725")).toBe("529.982.247-25");
    expect(mascaraCpf("529.982.247-25")).toBe("529.982.247-25");
  });

  it("devolve só dígitos quando o tamanho não bate", () => {
    expect(mascaraCpf("123")).toBe("123");
  });
});
