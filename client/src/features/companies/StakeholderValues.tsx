import type { ValuationTriple } from "@shared/domain/company-valuation";
import { formatAmount } from "./holdingDetails";

/** Participação do sócio em valor contábil, patrimonial e de mercado (moeda da sociedade). */
export function StakeholderValues({
  values,
  international,
  className,
}: {
  values: ValuationTriple;
  international: boolean;
  className?: string;
}) {
  return (
    <p className={className}>
      <span>Contábil {formatAmount(values.contabil, international)}</span>
      {" · "}
      <span>Patrimonial {formatAmount(values.patrimonial, international)}</span>
      {" · "}
      <span>Mercado {formatAmount(values.mercado, international)}</span>
    </p>
  );
}
