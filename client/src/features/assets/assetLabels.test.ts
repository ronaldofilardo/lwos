/**
 * @description Demais Ativos: categorias (inclusive offshore), rótulo sem
 * "/Balanço", placeholder por moeda e linha "Valor:" na lista.
 * @see client/src/features/assets/assetLabels.ts
 */
import { describe, expect, it } from "vitest";
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_VALUES,
  DECLARED_VALUE_LABEL,
  assetCategoryLabel,
  declaredValuePlaceholder,
  formatAssetValue,
  isOffshoreAssetCategory,
} from "./assetLabels";

describe("categorias de ativo", () => {
  it("toda categoria tem rótulo e inclui as duas offshore", () => {
    for (const value of ASSET_CATEGORY_VALUES) {
      expect(ASSET_CATEGORY_LABELS[value]).toBeTruthy();
    }
    expect(assetCategoryLabel("CONTA_CORRENTE_OFFSHORE")).toBe("Conta Corrente Offshore");
    expect(assetCategoryLabel("INVESTIMENTOS_OFFSHORE")).toBe("Investimentos Offshore");
  });

  it("categoria desconhecida volta como veio (sem quebrar a lista)", () => {
    expect(assetCategoryLabel("LEGADO_X")).toBe("LEGADO_X");
  });

  it("só as duas categorias offshore usam dólar", () => {
    expect(isOffshoreAssetCategory("CONTA_CORRENTE_OFFSHORE")).toBe(true);
    expect(isOffshoreAssetCategory("INVESTIMENTOS_OFFSHORE")).toBe(true);
    expect(isOffshoreAssetCategory("CONTA_CORRENTE")).toBe(false);
    expect(isOffshoreAssetCategory("")).toBe(false);
    expect(isOffshoreAssetCategory(null)).toBe(false);
  });
});

describe("valor declarado", () => {
  it("rótulo sem \"/Balanço\"", () => {
    expect(DECLARED_VALUE_LABEL).toBe("Valor declarado (IRPF)");
    expect(DECLARED_VALUE_LABEL).not.toContain("Balanço");
  });

  it("placeholder só com a moeda da categoria", () => {
    expect(declaredValuePlaceholder()).toBe("R$");
    expect(declaredValuePlaceholder("CONTA_CORRENTE")).toBe("R$");
    expect(declaredValuePlaceholder("INVESTIMENTOS_OFFSHORE")).toBe("$");
  });

  it("formata a linha com o rótulo \"Valor:\" e a moeda da categoria", () => {
    expect(formatAssetValue("1500.5")).toBe("Valor: R$ 1.500,50");
    expect(formatAssetValue(100000, "CONTA_CORRENTE")).toBe("Valor: R$ 100.000,00");
    expect(formatAssetValue("1500.5", "CONTA_CORRENTE_OFFSHORE")).toBe("Valor: $ 1,500.50");
    expect(formatAssetValue("150000.00")).not.toContain("Declarado");
  });
});
