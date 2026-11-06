/**
 * Agregação patrimonial da família (aba «Cálculos»).
 *
 * Visão dos Patriarcas: só TITULAR/CONJUGE (ou o contato principal) entram,
 * cada um pela sua cota-parte. Visão por membro: todos, na ordem de `people`.
 *
 * Regra anti-dupla-contagem: o imóvel entra pela cota-parte da pessoa titular;
 * quando quem titula é uma sociedade, o imóvel entra dentro do valor de mercado
 * da sociedade (§2.3) — nunca nas duas somas ao mesmo tempo.
 */
import {
  computeEstimatedValue,
  computeMarketValue,
  toNumberOrNull,
  type EstimatedValueInput,
} from "./company-valuation";
import { computeIntegralizationCost } from "./property-tax-engine";

type Num = number | string | null | undefined;

export type WealthPerson = {
  id: string;
  fullName: string;
  vinculo?: string | null;
  isPrimaryContact?: boolean | null;
};

export type WealthOwnership = {
  propertyId?: string | null;
  personId?: string | null;
  companyId?: string | null;
  ownershipPercentage: Num;
};

export type WealthProperty = {
  id: string;
  description?: string | null;
  marketValue?: Num;
  irpfBalanceValue?: Num;
  rentValue?: Num;
  utility?: string | null;
  itbiRate?: Num;
  emolumentsValue?: Num;
  hasLaudemio?: boolean | null;
  laudemioRate?: Num;
};

export type WealthCompany = EstimatedValueInput & {
  id: string;
  legalName: string;
  propertyValue?: Num;
  capitalSocial?: Num;
  equity?: Num;
  shareQuantity?: Num;
};

export type WealthCompanyShare = {
  companyId: string;
  personId?: string | null;
  percentage: Num;
};

export type WealthAsset = {
  ownerPersonId: string;
  declaredValue: Num;
};

export type WealthInput = {
  people: WealthPerson[];
  properties: WealthProperty[];
  owners: WealthOwnership[];
  companies: WealthCompany[];
  shares: WealthCompanyShare[];
  assets: WealthAsset[];
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Patriarca = titular, cônjuge do titular ou contato principal da família. */
export function isPatriarch(person: WealthPerson): boolean {
  return (
    person.vinculo === "TITULAR" ||
    person.vinculo === "CONJUGE" ||
    person.isPrimaryContact === true
  );
}

/** Cota-parte de um valor (percentual de titularidade em `ownershipPercentage`). */
export function shareOfValue(value: Num, percentage: Num): number {
  return round2(((toNumberOrNull(value) ?? 0) * (toNumberOrNull(percentage) ?? 0)) / 100);
}

/**
 * Valor dos imóveis em nome de cada sociedade — §2.3.1
 * (`marketValue` ponderado pela participação da sociedade no imóvel).
 */
export function computeCompanyPropertyValues(
  properties: WealthProperty[],
  owners: WealthOwnership[]
): Map<string, number> {
  const marketValueByProperty = new Map(
    properties.map(property => [property.id, property.marketValue])
  );
  const values = new Map<string, number>();
  for (const owner of owners) {
    if (!owner.companyId) continue;
    const marketValue = marketValueByProperty.get(owner.propertyId ?? "");
    if (marketValue === undefined) continue;
    values.set(
      owner.companyId,
      round2((values.get(owner.companyId) ?? 0) + shareOfValue(marketValue, owner.ownershipPercentage))
    );
  }
  return values;
}

/** §2.3.3 — valor de mercado da sociedade: balanço apurado + imóveis da PJ. */
export function computeCompanyMarketValues(
  companies: WealthCompany[],
  properties: WealthProperty[],
  owners: WealthOwnership[]
): Map<string, number> {
  const propertyValues = computeCompanyPropertyValues(properties, owners);
  const values = new Map<string, number>();
  for (const company of companies) {
    const propertyValue =
      propertyValues.get(company.id) ?? toNumberOrNull(company.propertyValue) ?? 0;
    values.set(
      company.id,
      computeMarketValue(computeEstimatedValue(company), propertyValue) ?? 0
    );
  }
  return values;
}

export type WealthBreakdown = {
  properties: number;
  companies: number;
  otherAssets: number;
  total: number;
};

const emptyBreakdown = (): WealthBreakdown => ({
  properties: 0,
  companies: 0,
  otherAssets: 0,
  total: 0,
});

const closeBreakdown = (partial: Omit<WealthBreakdown, "total">): WealthBreakdown => ({
  ...partial,
  total: round2(partial.properties + partial.companies + partial.otherAssets),
});

/** §2.1 — patrimônio total familiar na visão dos Patriarcas. */
export function computePatriarchWealth(input: WealthInput): WealthBreakdown {
  const patriarchIds = new Set(
    input.people.filter(isPatriarch).map(person => person.id)
  );
  if (patriarchIds.size === 0) return emptyBreakdown();

  const marketValueByProperty = new Map(
    input.properties.map(property => [property.id, property.marketValue])
  );
  let properties = 0;
  for (const owner of input.owners) {
    if (!owner.personId || !patriarchIds.has(owner.personId)) continue;
    const marketValue = marketValueByProperty.get(owner.propertyId ?? "");
    if (marketValue === undefined) continue;
    properties += shareOfValue(marketValue, owner.ownershipPercentage);
  }

  const companyMarketValues = computeCompanyMarketValues(
    input.companies,
    input.properties,
    input.owners
  );
  let companies = 0;
  for (const share of input.shares) {
    if (!share.personId || !patriarchIds.has(share.personId)) continue;
    companies += shareOfValue(
      companyMarketValues.get(share.companyId) ?? 0,
      share.percentage
    );
  }

  let otherAssets = 0;
  for (const asset of input.assets) {
    if (!patriarchIds.has(asset.ownerPersonId)) continue;
    otherAssets += toNumberOrNull(asset.declaredValue) ?? 0;
  }

  return closeBreakdown({
    properties: round2(properties),
    companies: round2(companies),
    otherAssets: round2(otherAssets),
  });
}

export type MemberWealthRow = WealthBreakdown & {
  personId: string;
  personName: string;
};

/** §2.2 — patrimônio total por membro da família. */
export function computeMembersWealth(input: WealthInput): MemberWealthRow[] {
  const companyMarketValues = computeCompanyMarketValues(
    input.companies,
    input.properties,
    input.owners
  );
  const marketValueByProperty = new Map(
    input.properties.map(property => [property.id, property.marketValue])
  );

  return input.people.map(person => {
    let properties = 0;
    for (const owner of input.owners) {
      if (owner.personId !== person.id) continue;
      const marketValue = marketValueByProperty.get(owner.propertyId ?? "");
      if (marketValue === undefined) continue;
      properties += shareOfValue(marketValue, owner.ownershipPercentage);
    }

    let companies = 0;
    for (const share of input.shares) {
      if (share.personId !== person.id) continue;
      companies += shareOfValue(
        companyMarketValues.get(share.companyId) ?? 0,
        share.percentage
      );
    }

    let otherAssets = 0;
    for (const asset of input.assets) {
      if (asset.ownerPersonId !== person.id) continue;
      otherAssets += toNumberOrNull(asset.declaredValue) ?? 0;
    }

    return {
      personId: person.id,
      personName: person.fullName,
      ...closeBreakdown({
        properties: round2(properties),
        companies: round2(companies),
        otherAssets: round2(otherAssets),
      }),
    };
  });
}

export type OwnerTotalsRow = {
  personId: string;
  personName: string;
  irpfValue: number;
  marketValue: number;
  monthlyRent: number;
  integralizationCost: number;
};

/** §2.5 — quadro «Totais por Proprietário» (4 colunas ponderadas pela cota). */
export function computePropertyOwnerTotals(
  input: Pick<WealthInput, "people" | "properties" | "owners">
): OwnerTotalsRow[] {
  const propertyById = new Map(
    input.properties.map(property => [property.id, property])
  );

  return input.people.map(person => {
    let irpfValue = 0;
    let marketValue = 0;
    let monthlyRent = 0;
    let integralizationCost = 0;

    for (const owner of input.owners) {
      if (owner.personId !== person.id) continue;
      const property = propertyById.get(owner.propertyId ?? "");
      if (!property) continue;
      irpfValue += shareOfValue(property.irpfBalanceValue, owner.ownershipPercentage);
      marketValue += shareOfValue(property.marketValue, owner.ownershipPercentage);
      monthlyRent += shareOfValue(property.rentValue, owner.ownershipPercentage);
      integralizationCost += shareOfValue(
        computeIntegralizationCost(property),
        owner.ownershipPercentage
      );
    }

    return {
      personId: person.id,
      personName: person.fullName,
      irpfValue: round2(irpfValue),
      marketValue: round2(marketValue),
      monthlyRent: round2(monthlyRent),
      integralizationCost: round2(integralizationCost),
    };
  });
}
