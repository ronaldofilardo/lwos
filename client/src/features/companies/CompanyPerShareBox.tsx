import type { ValuationTriple } from "@shared/domain/company-valuation";
import { ReadonlyField } from "./common/CompanyFormField";
import { formatAmount } from "./holdingDetails";

/** Quadro "Valores por quota/ação": contábil, patrimonial e de mercado (somente leitura). */
export function CompanyPerShareBox({
  values,
  international,
}: {
  values: ValuationTriple;
  international: boolean;
}) {
  return (
    <div className="rounded-xl border border-lucathi-line bg-lucathi-mist/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
        Valores por quota/ação
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ReadonlyField label="Valor contábil" value={formatAmount(values.contabil, international)} />
        <ReadonlyField
          label="Valor patrimonial"
          value={formatAmount(values.patrimonial, international)}
        />
        <ReadonlyField label="Valor de mercado" value={formatAmount(values.mercado, international)} />
      </div>
    </div>
  );
}
