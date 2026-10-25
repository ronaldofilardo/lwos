/**
 * @description Helpers do modal de detalhes da holding: leitura/gravação da
 * ficha, parsing de valores em pt-BR, cálculo por quota e moeda.
 * @see client/src/features/companies/CompanyDetailsModal.tsx
 */
import { describe, expect, it } from "vitest";
import {
  administratorLabel,
  computePerShare,
  emptyHoldingForm,
  estimatedValueFromForm,
  formatAmount,
  holdingFormFromDetails,
  holdingFormToFields,
  parseAmount,
} from "./holdingDetails";

describe("parseAmount", () => {
  it("entende milhar com ponto e decimal com vírgula", () => {
    expect(parseAmount("1.234,56")).toBe(1234.56);
    expect(parseAmount("1234.56")).toBe(1234.56);
    expect(parseAmount("1234,56")).toBe(1234.56);
    expect(parseAmount("1.000")).toBe(1000);
  });

  it("rejeita valor negativo (dinheiro nunca é negativo)", () => {
    expect(parseAmount("-5,00")).toBeNull();
    expect(parseAmount("R$ -10")).toBeNull();
  });

  it("descarta símbolos, vazio e lixo", () => {
    expect(parseAmount("R$ 10.000,00")).toBe(10000);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
  });
});

describe("holdingFormFromDetails / holdingFormToFields", () => {
  it("vira string no formulário e volta null quando vazio", () => {
    const form = holdingFormFromDetails({
      nire: "123",
      capitalSocial: "100000.00",
      jurisdiction: "BVI",
      notes: null,
    });

    expect(form.nire).toBe("123");
    expect(form.capitalSocial).toBe("100000.00");
    expect(form.jurisdiction).toBe("BVI");
    expect(form.notes).toBe("");

    const fields = holdingFormToFields(form);
    expect(fields.nire).toBe("123");
    expect(fields.capitalSocial).toBe(100000);
    expect(fields.notes).toBeNull();
    expect(fields.jurisdiction).toBe("BVI");
  });

  it("zera a ficha quando não há linha gravada", () => {
    const form = holdingFormFromDetails(null);
    expect(form).toEqual(emptyHoldingForm());
    expect(holdingFormToFields(form).capitalSocial).toBeNull();
  });

  it("não envia jurisdição fora do droplist", () => {
    const form = { ...emptyHoldingForm(), jurisdiction: "COSTA_RICA" };
    expect(holdingFormToFields(form).jurisdiction).toBeNull();
  });
});

describe("computePerShare", () => {
  const form = {
    ...emptyHoldingForm(),
    capitalSocial: "100.000,00",
    shareQuantity: "1.000",
    equity: "50000",
    // Valor estimado derivado: 300.000 + 20.000 − 40.000 − 20.000 − 10.000 = 250.000
    cashAndEquivalents: "300.000,00",
    retainedEarnings: "20.000,00",
    laborLiabilities: "40.000,00",
    taxLiabilities: "20.000,00",
    financing: "10.000,00",
  };

  it("ignora um valor estimado digitado e usa o derivado do balanço", () => {
    expect(computePerShare({ ...form, estimatedMarketValue: "999999" }).mercado).toBe(250);
    expect(estimatedValueFromForm(form)).toBe(250000);
  });

  it("não envia o valor estimado no payload (o servidor deriva)", () => {
    expect(holdingFormToFields({ ...form, estimatedMarketValue: "999999" })).not.toHaveProperty(
      "estimatedMarketValue"
    );
  });

  it("calcula os três valores por quota", () => {
    expect(computePerShare(form)).toEqual({
      contabil: 100,
      patrimonial: 50,
      mercado: 250,
    });
  });

  it("fica null sem quantidade de quotas", () => {
    expect(computePerShare({ ...form, shareQuantity: "" })).toEqual({
      contabil: null,
      patrimonial: null,
      mercado: null,
    });
  });
});

describe("formatAmount", () => {
  it("usa R$ pt-BR e $ en-US", () => {
    expect(formatAmount(1234.5, false)).toBe("R$ 1.234,50");
    expect(formatAmount(1234.5, true)).toBe("$ 1,234.50");
    expect(formatAmount(null, false)).toBe("—");
  });
});

describe("administratorLabel", () => {
  it("nacional usa Administrador/Diretor e offshore usa Directors", () => {
    expect(administratorLabel(false)).toBe("Administrador/Diretor");
    expect(administratorLabel(true)).toBe("Directors");
    expect(administratorLabel(false, 1)).toBe("1º Administrador/Diretor");
    expect(administratorLabel(true, 2)).toBe("2º Director");
  });

  it("mapeia administrator person IDs e nomes de terceiros", () => {
    const form = holdingFormFromDetails({
      administrator1PersonId: "person-1",
      administrator1: null,
      administrator2PersonId: null,
      administrator2: "Maria Terceira",
    });
    expect(form.administrator1PersonId).toBe("person-1");
    expect(form.administrator2).toBe("Maria Terceira");

    const fields = holdingFormToFields(form);
    expect(fields.administrator1PersonId).toBe("person-1");
    expect(fields.administrator1).toBeNull();
    expect(fields.administrator2PersonId).toBeNull();
    expect(fields.administrator2).toBe("Maria Terceira");
  });
});

