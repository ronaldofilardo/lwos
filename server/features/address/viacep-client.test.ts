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
});
