export interface UfBracketFormData {
  bracketOrder: number;
  limitValue: number;
  rate: number;
  accumulatedTax?: number;
  deductionValue?: number;
  indexedUnitName?: string | null;
  indexedUnitValue?: number | null;
}

export interface UfSummary {
  uf: string;
  bracketCount: number;
  minRate: number;
  maxRate: number;
  indexedUnitName: string | null;
  indexedUnitValue: number | null;
}

