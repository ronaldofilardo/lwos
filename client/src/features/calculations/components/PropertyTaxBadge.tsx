import {
  saleRecommendationLabels,
  type SaleRecommendation,
} from "@shared/domain/property-tax-engine";

/** Cor semântica da recomendação: verde = vender PF, azul = vender PJ. */
const styles: Record<SaleRecommendation, string> = {
  VENDER_PF: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  VENDER_PJ: "bg-sky-50 text-sky-700 ring-sky-200",
  PENDENTE: "bg-lucathi-mist text-lucathi-gray ring-lucathi-line",
};

export function PropertyTaxBadge({
  recommendation,
}: {
  recommendation: SaleRecommendation;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${styles[recommendation]}`}
      title="Recomendação tributária de desinvestimento (métrica 6)"
    >
      {saleRecommendationLabels[recommendation]}
    </span>
  );
}
