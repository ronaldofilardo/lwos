/**
 * @description Valoração da sociedade: valor estimado derivado do balanço (PL
 * fora da conta), valores por quota/ação e participação de cada sócio.
 * @see shared/domain/company-valuation.ts
 */
import { describe, expect, it } from "vitest";
import {
  companyTotalsFromRow,
  computeEstimatedValue,
  computeStakeholderValues,
  computeUnitValues,
} from "./company-valuation";

const balance = {
  cashAndEquivalents: 1000,
  inventory: 200,
  accountsReceivable: 300,
  investments: 400,
  fixedAssets: 500,
  retainedEarnings: 600,
  laborLiabilities: 100,
  taxLiabilities: 50,
  financing: 150,
};

describe("computeEstimatedValue", () => {
  it("soma ativos e lucros acumulados e subtrai obrigações e financiamentos", () => {
    // 1000+200+300+400+500+600 = 3000; 100+50+150 = 300
    expect(computeEstimatedValue(balance)).toBe(2700);
  });

  it("ignora o PL (patrimônio líquido não entra na conta)", () => {
    expect(computeEstimatedValue({ ...balance, equity: 9_999_999 } as never)).toBe(2700);
  });

  it("aceita texto do banco e trata campo vazio como zero", () => {
    expect(
      computeEstimatedValue({ cashAndEquivalents: "1000.50", financing: "0.25", inventory: null })
    ).toBe(1000.25);
  });

  it("devolve null quando nada do balanço foi informado", () => {
    expect(computeEstimatedValue({})).toBeNull();
    expect(computeEstimatedValue({ cashAndEquivalents: null, financing: "" })).toBeNull();
  });

  it("pode ficar negativo quando as obrigações superam os ativos", () => {
    expect(computeEstimatedValue({ cashAndEquivalents: 100, financing: 250 })).toBe(-150);
  });

  it("arredonda para centavos sem erro de ponto flutuante", () => {
    expect(computeEstimatedValue({ cashAndEquivalents: 0.1, inventory: 0.2 })).toBe(0.3);
  });
});

describe("companyTotalsFromRow", () => {
  it("converte a linha do banco e deriva o valor estimado", () => {
    expect(
      companyTotalsFromRow({
        capitalSocial: "10000.00",
        equity: "5000.00",
        shareQuantity: "10000.00",
        cashAndEquivalents: "2000.00",
      })
    ).toEqual({
      capitalSocial: 10000,
      equity: 5000,
      estimatedValue: 2000,
      shareQuantity: 10000,
    });
  });

  it("sem linha de detalhes tudo é null", () => {
    expect(companyTotalsFromRow(null)).toEqual({
      capitalSocial: null,
      equity: null,
      estimatedValue: null,
      shareQuantity: null,
    });
  });
});

describe("computeUnitValues", () => {
  const totals = { capitalSocial: 10000, equity: 5_000_000, estimatedValue: 2700, shareQuantity: 10000 };

  it("divide capital, PL e valor estimado pela quantidade de quotas", () => {
    expect(computeUnitValues(totals)).toEqual({ contabil: 1, patrimonial: 500, mercado: 0.27 });
  });

  it("fica null sem quantidade (ou zero) e sem valor", () => {
    expect(computeUnitValues({ ...totals, shareQuantity: null }).contabil).toBeNull();
    expect(computeUnitValues({ ...totals, shareQuantity: 0 }).mercado).toBeNull();
    expect(computeUnitValues({ ...totals, equity: null }).patrimonial).toBeNull();
  });
});

describe("computeStakeholderValues", () => {
  const totals = { capitalSocial: 10000, equity: 5000, estimatedValue: 2700, shareQuantity: 10000 };

  it("aplica o percentual do sócio a cada valor", () => {
    expect(computeStakeholderValues("40.00", totals)).toEqual({
      contabil: 4000,
      patrimonial: 2000,
      mercado: 1080,
    });
    expect(computeStakeholderValues(100, totals).contabil).toBe(10000);
  });

  it("devolve null onde falta o valor da sociedade ou o percentual", () => {
    expect(computeStakeholderValues(50, { ...totals, equity: null }).patrimonial).toBeNull();
    expect(computeStakeholderValues(null, totals)).toEqual({
      contabil: null,
      patrimonial: null,
      mercado: null,
    });
  });

  it("não depende da quantidade de quotas", () => {
    expect(computeStakeholderValues(25, { ...totals, shareQuantity: null }).contabil).toBe(2500);
  });
});
