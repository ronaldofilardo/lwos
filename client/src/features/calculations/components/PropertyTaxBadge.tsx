import {
  saleRecommendationLabels,
  type SaleRecommendation,
} from "@shared/domain/property-tax-engine";

const styles: Record<SaleRecommendation, string> = {
  VENDER_PF: "bg-status-success-bg text-status-success-text border-status-success-border",
  VENDER_PJ: "bg-status-info-bg text-status-info-text border-status-info-border",
  PENDENTE: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
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