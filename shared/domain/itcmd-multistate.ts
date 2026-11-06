import { getBaselineBracketsForUf } from "./itcmd-seed-data";
import { calculateItcmdForUf } from "./itcmd-engine";
import {
  ItcmdBracketRule,
  MultiStateSuccessionResult,
  StateCompetenceSummary,
} from "./itcmd-types";

const round2 = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

export interface PropertyItcmdInput {
  id: string;
  description: string;
  marketValue: number;
  uf?: string | null;
}

export function computePropertyIndividualItcmd(
  property: { marketValue: number; uf?: string | null },
  fallbackUf: string = "SP",
  customBrackets?: ItcmdBracketRule[]
) {
  const uf = (property.uf?.trim() || fallbackUf).toUpperCase();
  const brackets = customBrackets ?? getBaselineBracketsForUf(uf);
  const res = calculateItcmdForUf(property.marketValue, brackets);
  return {
    uf,
    tax: res.totalTax,
    rate: res.effectiveRate,
  };
}

export function computeMultiStateSuccessionTax(
  properties: PropertyItcmdInput[],
  holdingsAndAssetsValue: number,
  domicileUf: string = "SP"
): MultiStateSuccessionResult {
  const normDomicile = domicileUf.trim().toUpperCase();
  const byStateMap = new Map<string, { count: number; base: number }>();

  for (const p of properties) {
    const uf = (p.uf?.trim() || normDomicile).toUpperCase();
    const cur = byStateMap.get(uf) ?? { count: 0, base: 0 };
    cur.count += 1;
    cur.base += Math.max(0, Number(p.marketValue) || 0);
    byStateMap.set(uf, cur);
  }

  const byState: StateCompetenceSummary[] = [];
  let totalPatrimony = 0;
  let totalTax = 0;

  // 1. Imóveis por Estado de Situação (Art. 155, §1º, I da CF)
  for (const [uf, data] of byStateMap.entries()) {
    const brackets = getBaselineBracketsForUf(uf);
    const res = calculateItcmdForUf(data.base, brackets);
    byState.push({
      uf,
      scope: `${data.count} imóvel(is) no estado`,
      itemCount: data.count,
      patrimonyBase: round2(data.base),
      taxAmount: res.totalTax,
      effectiveRate: res.effectiveRate,
    });
    totalPatrimony += data.base;
    totalTax += res.totalTax;
  }

  // 2. Sociedades e Demais Ativos no Domicílio do Patriarca (Art. 155, §1º, II da CF)
  const mobileBase = Math.max(0, Number(holdingsAndAssetsValue) || 0);
  if (mobileBase > 0) {
    const domicileBrackets = getBaselineBracketsForUf(normDomicile);
    const resMobile = calculateItcmdForUf(mobileBase, domicileBrackets);

    byState.push({
      uf: normDomicile,
      scope: "Sociedades e Ativos (Domicílio)",
      itemCount: 1,
      patrimonyBase: round2(mobileBase),
      taxAmount: resMobile.totalTax,
      effectiveRate: resMobile.effectiveRate,
    });
    totalPatrimony += mobileBase;
    totalTax += resMobile.totalTax;
  }

  const effectiveRate =
    totalPatrimony > 0 ? round2((totalTax / totalPatrimony) * 100) : 0;

  return {
    totalPatrimony: round2(totalPatrimony),
    totalTax: round2(totalTax),
    effectiveRate,
    byState,
  };
}

