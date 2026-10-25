/**
 * Categorias, textos e formatação de valor dos Demais Ativos. Ficam fora do
 * componente para serem testáveis (os testes do client rodam em ambiente node)
 * e para o painel e o patrimônio do cliente usarem os mesmos rótulos.
 */
import { formatarDinheiro } from "@shared/validation/dinheiro";

/** Espelho de `assetCategoryValues` (drizzle/schema.ts); o servidor valida com zod. */
export const ASSET_CATEGORY_VALUES = [
  "INVESTIMENTOS",
  "INVESTIMENTOS_OFFSHORE",
  "VEICULO_EMBARCACAO_AERONAVE",
  "SEMOVENTES",
  "CREDITO",
  "DINHEIRO_ESPECIE",
  "CONTA_CORRENTE",
  "CONTA_CORRENTE_OFFSHORE",
  "ATIVOS_AGRO",
  "OUTROS",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORY_VALUES)[number];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  INVESTIMENTOS: "Aplicações / Investimentos",
  INVESTIMENTOS_OFFSHORE: "Investimentos Offshore",
  VEICULO_EMBARCACAO_AERONAVE: "Veículo / Embarcação / Aeronave",
  SEMOVENTES: "Semoventes (animais)",
  CREDITO: "Crédito / Direito creditório",
  DINHEIRO_ESPECIE: "Dinheiro em espécie",
  CONTA_CORRENTE: "Conta corrente / Depósitos",
  CONTA_CORRENTE_OFFSHORE: "Conta Corrente Offshore",
  ATIVOS_AGRO: "Ativos agropecuários",
  OUTROS: "Outros ativos",
};

/** Rótulo da categoria; valor desconhecido volta como veio. */
export function assetCategoryLabel(category: string): string {
  return ASSET_CATEGORY_LABELS[category as AssetCategory] ?? category;
}

/** Categorias offshore: valor em dólar (símbolo $), sem coluna de moeda no banco. */
export function isOffshoreAssetCategory(category: string | null | undefined): boolean {
  return category === "CONTA_CORRENTE_OFFSHORE" || category === "INVESTIMENTOS_OFFSHORE";
}

/** Rótulo do campo de valor (sem "/Balanço": ativo não vem de balanço). */
export const DECLARED_VALUE_LABEL = "Valor declarado (IRPF)";

/** Placeholder do campo de valor: só a moeda; o rótulo diz do que se trata. */
export function declaredValuePlaceholder(category?: string | null): string {
  return isOffshoreAssetCategory(category) ? "$" : "R$";
}

/** Linha de valor na lista de ativos: "Valor: R$ 1.500,00" ou, offshore, "Valor: $ 1,500.00". */
export function formatAssetValue(declaredValue: string | number, category?: string | null): string {
  const value = Number(declaredValue);
  if (isOffshoreAssetCategory(category)) {
    const formatted = value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Valor: $ ${formatted}`;
  }
  return `Valor: R$ ${formatarDinheiro(value)}`;
}
