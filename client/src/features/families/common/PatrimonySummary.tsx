import { MetricCard } from "@/components/lucathi/MetricCard";
import { trpc } from "@/lib/trpc";
import { formatBRL } from "@/features/properties/propertyCardView";
import {
  companyTotalsFromRow,
  toNumberOrNull,
} from "@shared/domain/company-valuation";

const sum = (values: (number | null)[]) =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0);

/**
 * Totalização patrimonial do projeto (aba Patrimônio).
 *
 * Cada imóvel entra uma única vez pelo `marketValue`; a sociedade entra pelo
 * balanço apurado (sem os imóveis em nome dela, que já estão na soma de
 * imóveis). Mesma regra do Patrimônio sob Gestão da Home — evita dupla
 * contagem e mantém os dois números coerentes.
 */
export function PatrimonySummary({ familyId }: { familyId: string }) {
  const properties = trpc.properties.list.useQuery({ familyId });
  const companies = trpc.companies.list.useQuery({ familyId });
  const assets = trpc.assets.list.useQuery({ familyId });

  const propertyRows = properties.data ?? [];
  const companyRows = companies.data ?? [];
  const assetRows = assets.data ?? [];

  const propertiesTotal = sum(
    propertyRows.map(property => toNumberOrNull(property.marketValue))
  );
  const companiesTotal = sum(
    companyRows.map(company => companyTotalsFromRow(company).estimatedValue)
  );
  const assetsTotal = sum(
    assetRows.map(asset => toNumberOrNull(asset.declaredValue))
  );
  const total = propertiesTotal + companiesTotal + assetsTotal;
  const isLoading =
    properties.isLoading || companies.isLoading || assets.isLoading;

  const money = (value: number) =>
    isLoading ? "—" : (formatBRL(value) ?? "—");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Imóveis"
        value={money(propertiesTotal)}
        detail={`${propertyRows.length} imóvel(is) · valor de mercado`}
      />
      <MetricCard
        label="Sociedades"
        value={money(companiesTotal)}
        detail={`${companyRows.length} sociedade(s) · balanço apurado, sem imóveis`}
      />
      <MetricCard
        label="Demais ativos"
        value={money(assetsTotal)}
        detail={`${assetRows.length} ativo(s) · valor declarado`}
      />
      <MetricCard
        label="Total patrimonial"
        value={money(total)}
        detail="Imóveis + sociedades + demais ativos"
      />
    </div>
  );
}
