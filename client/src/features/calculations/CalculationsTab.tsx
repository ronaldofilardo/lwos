import { FamilyWealthOverviewCard } from "./components/FamilyWealthOverviewCard";
import { IbsCbsAlertBanner } from "./components/IbsCbsAlertBanner";
import { MemberWealthTable } from "./components/MemberWealthTable";
import { PropertyOwnerTotalsTable } from "./components/PropertyOwnerTotalsTable";
import { PropertyTaxComparisonTable } from "./components/PropertyTaxComparisonTable";
import { ItcmdSuccessionCard } from "./components/ItcmdSuccessionCard";
import { useCalculationsData } from "./hooks/useCalculationsData";

/**
 * Aba «Cálculos» da Área de Trabalho do projeto.
 *
 * Layout em 4 zonas com hierarquia executiva:
 *   1. Briefing patrimonial (overview + gráfico integrado)
 *   2. Alerta fiscal IBS/CBS (condicional — só aparece quando disparado)
 *   3. Concentração familiar (tabela de membros com % e barra)
 *   4. Painel de imóveis (executivo + detalhe via modal)
 *      + Totais por proprietário (contexto de due diligence)
 */
export function CalculationsTab({ familyId }: { familyId: string }) {
  const { view, isLoading, isError } = useCalculationsData(familyId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Apurando os cálculos patrimoniais…
      </div>
    );
  }

  if (isError || !view) {
    return (
      <div className="rounded-2xl border border-lucathi-line bg-white p-8 text-center text-sm text-lucathi-gray">
        Não foi possível carregar os dados dos cálculos deste projeto.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ZONA 1 — Briefing patrimonial */}
      <FamilyWealthOverviewCard
        wealth={view.patriarch}
        patriarchNames={view.patriarchNames}
        isLoading={false}
      />

      {/* ZONA 2 — Alerta fiscal IBS/CBS (condicional) */}
      <IbsCbsAlertBanner
        portfolio={view.portfolio}
        triggered={view.ibsCbsTriggered}
      />

      {/* ZONA 3 — Concentração familiar */}
      <MemberWealthTable rows={view.members} />

      {/* ZONA 4 — Painel de imóveis */}
      <PropertyTaxComparisonTable rows={view.properties} />

      {/* Totais por proprietário — contexto para due diligence */}
      <PropertyOwnerTotalsTable rows={view.ownerTotals} />

      {/* ZONA 5 — Diagnóstico sucessório ITCMD */}
      <ItcmdSuccessionCard
        multiState={view.multiStateItcmd}
        patriarchUf={view.patriarchUf}
        properties={view.properties.map(p => ({
          id: p.propertyId,
          description: p.description,
          marketValue: p.marketValue,
          uf: p.uf,
        }))}
        mobileBase={view.patriarch.companies + view.patriarch.otherAssets}
      />
    </div>
  );
}
