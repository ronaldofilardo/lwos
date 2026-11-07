import type { ValuationTriple } from "@shared/domain/company-valuation";
import { formatAmount } from "./holdingDetails";

const VALUE_FIELDS: {
  key: keyof ValuationTriple;
  shortLabel: string;
  tooltip: string;
}[] = [
  { key: "contabil", shortLabel: "V.C.", tooltip: "Valor Contábil" },
  { key: "patrimonial", shortLabel: "V.P.", tooltip: "Valor Patrimonial" },
  { key: "mercado", shortLabel: "V.M.", tooltip: "Valor de Mercado" },
];

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
      {VALUE_FIELDS.map((field, index) => (
        <span key={field.key}>
          {index > 0 ? " – " : null}
          <span className="cursor-help font-medium" title={field.tooltip}>
            {field.shortLabel}
          </span>{" "}
          <span className="tabular-nums">
            {formatAmount(values[field.key], international)}
          </span>
        </span>
      ))}
    </p>
  );
}
