import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";
import { PropertyTaxBadge } from "./PropertyTaxBadge";

export function PropertySaleSection({ property }: { property: PropertyTaxRow }) {
  const isPjMoreExpensive = property.saleIrDifference > 0;
  const isPfMoreExpensive = property.saleIrDifference < 0;

  return (
    <div className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-lucathi-navy">
          2. Cenário de Alienação (Venda PF × PJ)
        </h4>
        <PropertyTaxBadge recommendation={property.recommendation} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">Venda pela PJ (6,73%)</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.saleIrpjCsll) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            IRPJ/CSLL Lucro Presumido
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">Venda pela PF (GCAP)</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.irGcapValue) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            IR Ganho de Capital informado
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">Diferença (PJ − PF)</p>
          <p
            className={`mt-1 font-semibold text-sm tabular-nums ${
              isPjMoreExpensive
                ? "text-amber-700"
                : isPfMoreExpensive
                  ? "text-emerald-700"
                  : "text-lucathi-navy"
            }`}
          >
            {formatBRL(property.saleIrDifference) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            {isPjMoreExpensive
              ? "Vender pela PJ custa mais"
              : isPfMoreExpensive
                ? "Vender pela PJ custa menos"
                : "Valores equivalentes"}
          </p>
        </div>
      </div>
    </div>
  );
}

