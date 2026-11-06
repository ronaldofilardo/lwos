import { describe, expect, it } from "vitest";
import { calculateItcmdForUf, convertIndexedLimits } from "./itcmd-engine";
import { ItcmdBracketRule } from "./itcmd-types";
import { getBaselineBracketsForUf } from "./itcmd-seed-data";

describe("itcmd-engine", () => {
  it("retorna imposto zero para patrimônio zero ou negativo", () => {
    const spRules = getBaselineBracketsForUf("SP");
    const resZero = calculateItcmdForUf(0, spRules);
    expect(resZero.totalTax).toBe(0);
    expect(resZero.effectiveRate).toBe(0);
    expect(resZero.slices).toHaveLength(0);

    const resNeg = calculateItcmdForUf(-50000, spRules);
    expect(resNeg.totalTax).toBe(0);
  });

  it("calcula alíquota fixa linear de São Paulo (4%)", () => {
    const spRules = getBaselineBracketsForUf("SP");
    const res = calculateItcmdForUf(1_000_000, spRules);
    expect(res.patrimonyBase).toBe(1_000_000);
    expect(res.totalTax).toBe(40_000);
    expect(res.effectiveRate).toBe(4.0);
    expect(res.slices).toHaveLength(1);
    expect(res.slices[0].sliceBase).toBe(1_000_000);
    expect(res.slices[0].taxAmount).toBe(40_000);
  });

  it("calcula exatamente o caso real da planilha em RN para R$ 12.000.320,02", () => {
    const rnRules = getBaselineBracketsForUf("RN");
    const res = calculateItcmdForUf(12_000_320.02, rnRules);

    // Faixa 1 (0 a 500k @ 3%) = 15.000
    // Faixa 2 (500k a 1M @ 4%) = 20.000
    // Faixa 3 (1M a 3M @ 5%) = 100.000
    // Faixa 4 (3M a 12.000.320,02 @ 6%) = 540.019,20
    // Total = 675.019,20 (efetivo 5.62%)
    expect(res.slices).toHaveLength(4);
    expect(res.slices[0].taxAmount).toBe(15000);
    expect(res.slices[1].taxAmount).toBe(20000);
    expect(res.slices[2].taxAmount).toBe(100000);
    expect(res.slices[3].taxAmount).toBe(540019.20);
    expect(res.totalTax).toBe(675019.20);
    expect(res.effectiveRate).toBeCloseTo(5.62, 1);
  });

  it("calcula Santa Catarina com faixa de 1%", () => {
    const scRules = getBaselineBracketsForUf("SC");
    const res = calculateItcmdForUf(200_000, scRules);

    // 0 a 20k @ 1% = 200
    // 20k a 50k @ 3% = 900
    // 50k a 150k @ 5% = 5000
    // 150k a 200k @ 7% = 3500
    // Total = 9600
    expect(res.slices).toHaveLength(4);
    expect(res.slices[0].rate).toBe(1);
    expect(res.slices[0].taxAmount).toBe(200);
    expect(res.totalTax).toBe(9600);
  });

  it("converte limites em unidades fiscais indexadas (ex: UFIR-RJ = 4.7508)", () => {
    const rjRules = getBaselineBracketsForUf("RJ");
    const converted = convertIndexedLimits(rjRules);
    // 70.000 UFIR * 4.7508 = 332.556,00
    expect(converted[0].limitValue).toBe(332556);

    const res = calculateItcmdForUf(300_000, rjRules);
    expect(res.totalTax).toBe(12_000);
    expect(res.indexedUnitName).toBe("UFIR-RJ");
  });

  it("respeita isenção na primeira faixa (ex: Acre até 50k @ 0%)", () => {
    const acRules = getBaselineBracketsForUf("AC");
    const res = calculateItcmdForUf(40_000, acRules);
    expect(res.totalTax).toBe(0);
    expect(res.slices[0].rate).toBe(0);
    expect(res.slices[0].taxAmount).toBe(0);
  });
});
