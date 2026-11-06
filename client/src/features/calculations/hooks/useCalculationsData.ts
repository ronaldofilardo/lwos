import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  computeMembersWealth,
  computePatriarchWealth,
  computePropertyOwnerTotals,
  isPatriarch,
} from "@shared/domain/family-wealth-calculator";
import {
  computePropertyTaxMetrics,
  computeRentalPortfolio,
  isIbsCbsTriggered,
  RENTAL_UTILITY,
} from "@shared/domain/property-tax-engine";
import {
  computeMultiStateSuccessionTax,
  computePropertyIndividualItcmd,
} from "@shared/domain/itcmd-multistate";
import { toNumberOrNull } from "@shared/domain/company-valuation";
import type { CalculationsView, PropertyTaxRow } from "../types";

export function useCalculationsData(familyId: string) {
  const query = trpc.calculations.getData.useQuery({ familyId });

  const view = useMemo<CalculationsView | null>(() => {
    const data = query.data;
    if (!data) return null;

    const patriarchUf =
      data.people.find(p => p.isPrimaryContact || p.vinculo === "TITULAR")?.uf ||
      data.properties.find(p => p.uf)?.uf || "SP";

    const portfolio = computeRentalPortfolio(data.properties);
    const ibsCbsTriggered = isIbsCbsTriggered(portfolio);
    const patriarch = computePatriarchWealth(data);

    const properties: PropertyTaxRow[] = data.properties.map(property => {
      const marketValue = toNumberOrNull(property.marketValue) ?? 0;
      const uf = property.uf?.trim() || patriarchUf;
      const itcmdInd = computePropertyIndividualItcmd({ marketValue, uf }, patriarchUf);
      return {
        propertyId: property.id,
        description: property.description,
        marketValue,
        isRental: property.utility === RENTAL_UTILITY,
        itbiRate: toNumberOrNull(property.itbiRate),
        hasLaudemio: Boolean(property.hasLaudemio),
        laudemioRate: toNumberOrNull(property.laudemioRate),
        emolumentsValue: toNumberOrNull(property.emolumentsValue) ?? 0,
        irGcapValue: toNumberOrNull(property.irGcapValue) ?? 0,
        rentValue: toNumberOrNull(property.rentValue) ?? 0,
        uf,
        itcmdTax: itcmdInd.tax,
        itcmdRate: itcmdInd.rate,
        ...computePropertyTaxMetrics(property, { ibsCbsTriggered }),
      };
    });

    const propertyInputs = properties.map(p => ({
      id: p.propertyId,
      description: p.description,
      marketValue: p.marketValue,
      uf: p.uf,
    }));

    const mobileBase = patriarch.companies + patriarch.otherAssets;
    const multiStateItcmd = computeMultiStateSuccessionTax(
      propertyInputs,
      mobileBase,
      patriarchUf
    );

    return {
      patriarch,
      patriarchNames: data.people.filter(isPatriarch).map(p => p.fullName),
      members: computeMembersWealth(data),
      properties,
      ownerTotals: computePropertyOwnerTotals(data),
      portfolio,
      ibsCbsTriggered,
      patriarchUf,
      multiStateItcmd,
    };
  }, [query.data]);

  return { view, isLoading: query.isLoading, isError: query.isError };
}
