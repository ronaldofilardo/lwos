import { describe, expect, it, vi, beforeEach } from "vitest";
import { lookupAddressByCep } from "./viacep-client";

describe("lookupAddressByCep", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna null para CEP com tamanho inválido", async () => {
    const result = await lookupAddressByCep("12345");
    expect(result).toBeNull();
  });

  it("retorna dados formatados do ViaCEP com sucesso", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cep: "01001-000",
        logradouro: "Praça da Sé",
        complemento: "lado ímpar",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      }),
    } as unknown as Response);

    const result = await lookupAddressByCep("01.001-000");
    expect(result).toEqual({
      cep: "01001000",
      street: "Praça da Sé",
      complement: "lado ímpar",
      district: "Sé",
      city: "São Paulo",
      uf: "SP",
      source: "VIACEP",
    });
  });

  it("aciona fallback da BrasilAPI quando ViaCEP falha ou dá erro", async () => {
    // Primeira chamada (ViaCEP) falha com erro
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true }),
      } as unknown as Response)
      // Segunda chamada (BrasilAPI) responde com sucesso
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cep: "01001000",
          state: "SP",
          city: "São Paulo",
          neighborhood: "Sé",
          street: "Praça da Sé",
        }),
      } as unknown as Response);

    const result = await lookupAddressByCep("01001000");
    expect(result).toEqual({
      cep: "01001000",
      street: "Praça da Sé",
      complement: "",
      district: "Sé",
      city: "São Paulo",
      uf: "SP",
      source: "BRASILAPI",
    });
  });

  it("retorna null se ambos falharem", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network offline"));
    const result = await lookupAddressByCep("01001000");
    expect(result).toBeNull();
  });

  it("cai para a BrasilAPI quando o ViaCEP responde com erro HTTP", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          state: "RJ",
          city: "Rio de Janeiro",
          neighborhood: "Centro",
          street: "Av. Rio Branco",
        }),
      } as unknown as Response);

    const result = await lookupAddressByCep("20010-000");
    expect(result?.source).toBe("BRASILAPI");
    expect(result?.street).toBe("Av. Rio Branco");
  });

  it("preenche campos ausentes do ViaCEP com string vazia", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ localidade: "Curitiba", uf: "pr" }),
    } as unknown as Response);

    const result = await lookupAddressByCep("80010-000");
    expect(result).toEqual({
      cep: "80010000",
      street: "",
      complement: "",
      district: "",
      city: "Curitiba",
      uf: "PR",
      source: "VIACEP",
    });
  });

  it("retorna null quando a BrasilAPI responde com erro HTTP", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: "true" }),
      } as unknown as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) } as unknown as Response);

    const result = await lookupAddressByCep("99999-999");
    expect(result).toBeNull();
  });

  it("preenche campos ausentes da BrasilAPI com string vazia", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ city: "Salvador", state: "ba" }),
      } as unknown as Response);

    const result = await lookupAddressByCep("40015-000");
    expect(result).toEqual({
      cep: "40015000",
      street: "",
      complement: "",
      district: "",
      city: "Salvador",
      uf: "BA",
      source: "BRASILAPI",
    });
  });
});
