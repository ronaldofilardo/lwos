/**
 * @description Helpers do modal de detalhes da holding: leitura/gravação da
 * ficha, parsing de valores em pt-BR, cálculo por quota e moeda.
 * @see client/src/features/companies/CompanyDetailsModal.tsx
 */
import { describe, expect, it } from "vitest";
import {
  computePerShare,
  docTypesForCompany,
  emptyHoldingForm,
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
    estimatedMarketValue: "250000",
  };

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

describe("docTypesForCompany", () => {
  it("alterna entre as duas listas de documentos", () => {
    expect(docTypesForCompany("HOLDING_INTERNACIONAL")).toHaveLength(7);
    expect(docTypesForCompany("HOLDING_NACIONAL")).toHaveLength(7);
    expect(docTypesForCompany("HOLDING_NACIONAL")).not.toContain(
      "SHARE_CERTIFICATE"
    );
  });
});
