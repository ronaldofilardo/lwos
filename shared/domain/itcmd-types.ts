export interface ItcmdBracketRule {
  id?: string;
  uf: string;
  bracketOrder: number;
  limitValue: number;
  rate: number; // Ex: 4 para 4%
  accumulatedTax?: number;
  deductionValue?: number;
  indexedUnitName?: string | null;
  indexedUnitValue?: number | null;
}

export interface ItcmdCalculationSlice {
  order: number;
  fromValue: number;
  toValue: number;
  sliceBase: number;
  rate: number;
  taxAmount: number;
}

export interface ItcmdCalculationResult {
  uf: string;
  patrimonyBase: number;
  totalTax: number;
  effectiveRate: number; // Percentual efetivo, ex: 3.85
  slices: ItcmdCalculationSlice[];
  indexedUnitName?: string | null;
  indexedUnitValue?: number | null;
}

export interface StateCompetenceSummary {
  uf: string;
  scope: string; // Ex: "Imóveis situados na UF" ou "Sociedades & Ativos (Domicílio)"
  itemCount: number;
  patrimonyBase: number;
  taxAmount: number;
  effectiveRate: number;
}

export interface MultiStateSuccessionResult {
  totalPatrimony: number;
  totalTax: number;
  effectiveRate: number;
  byState: StateCompetenceSummary[];
}
