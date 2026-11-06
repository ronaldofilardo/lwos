import {
  ItcmdBracketRule,
  ItcmdCalculationResult,
  ItcmdCalculationSlice,
} from "./itcmd-types";

const round2 = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

export function convertIndexedLimits(
  brackets: ItcmdBracketRule[]
): ItcmdBracketRule[] {
  return brackets.map(b => {
    const unitVal = Number(b.indexedUnitValue);
    if (unitVal && unitVal > 0 && b.indexedUnitName) {
      return {
        ...b,
        limitValue: round2(Number(b.limitValue) * unitVal),
        deductionValue: b.deductionValue
          ? round2(Number(b.deductionValue) * unitVal)
          : 0,
      };
    }
    return { ...b, limitValue: Number(b.limitValue) };
  });
}

export function calculateItcmdForUf(
  patrimony: number,
  rawBrackets: ItcmdBracketRule[]
): ItcmdCalculationResult {
  const base = Math.max(0, Number(patrimony) || 0);
  if (!rawBrackets || rawBrackets.length === 0 || base === 0) {
    return {
      uf: rawBrackets[0]?.uf ?? "",
      patrimonyBase: base,
      totalTax: 0,
      effectiveRate: 0,
      slices: [],
    };
  }

  const converted = convertIndexedLimits(rawBrackets);
  const sorted = [...converted].sort((a, b) => a.bracketOrder - b.bracketOrder);
  const slices: ItcmdCalculationSlice[] = [];
  let remaining = base;
  let prevLimit = 0;
  let totalTax = 0;

  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];
    const isLast = i === sorted.length - 1;
    const limit = Number(b.limitValue);
    const bracketCeiling = isLast && limit <= prevLimit ? Infinity : limit;
    const sliceCapacity = bracketCeiling - prevLimit;

    if (remaining > 0 && sliceCapacity > 0) {
      const sliceBase = Math.min(remaining, sliceCapacity);
      const numRate = Number(b.rate) || 0;
      const ratePct = numRate > 0 && numRate <= 0.2 ? round2(numRate * 100) : numRate;
      const tax = round2((sliceBase * ratePct) / 100);

      slices.push({
        order: b.bracketOrder,
        fromValue: prevLimit,
        toValue: bracketCeiling === Infinity ? base : bracketCeiling,
        sliceBase: round2(sliceBase),
        rate: ratePct,
        taxAmount: tax,
      });

      totalTax = round2(totalTax + tax);
      remaining = Math.max(0, remaining - sliceBase);
      prevLimit = bracketCeiling;
    }
  }

  const effectiveRate = base > 0 ? round2((totalTax / base) * 100) : 0;
  const first = rawBrackets[0];

  return {
    uf: first.uf,
    patrimonyBase: round2(base),
    totalTax,
    effectiveRate,
    slices,
    indexedUnitName: first.indexedUnitName,
    indexedUnitValue: first.indexedUnitValue ? Number(first.indexedUnitValue) : null,
  };
}

