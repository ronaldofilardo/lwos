import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";

export function PropertySuccessionSection({
  property,
}: {
  property: PropertyTaxRow;
}) {
  return (
    <div className="rounded-xl border border-lucathi-line/70 bg-status-warning-bg/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-status-warning-text font-subtitle">
          Sucessão / Doação — ITCMD Individual
        </h4>
        <span className="rounded bg-status-warning-bg px-2 py-0.5 text-[10px] font-bold text-status-warning-text">
          SEFAZ / {property.uf}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-3 border border-status-warning-border/60">
          <p className="text-xs text-lucathi-gray">Base de Cálculo</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.marketValue)}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">Valor de mercado</p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-status-warning-border/60">
          <p className="text-xs text-lucathi-gray">Alíquota Estadual</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {property.itcmdRate.toFixed(2)}%
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            Tabela vigente de {property.uf}
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-status-warning-border/60">
          <p className="text-xs text-lucathi-gray">ITCMD Estimado</p>
          <p className="mt-1 font-bold text-sm text-status-warning-text tabular-nums">
            {formatBRL(property.itcmdTax)}
          </p>
          <p className="mt-0.5 text-[11px] text-status-warning-text">
            Devido ao Estado de {property.uf}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-lucathi-gray">
        * Conforme Art. 155, § 1º, I da CF/88, o ITCMD de bens imóveis é devido com exclusividade ao estado onde o imóvel está situado.
      </p>
    </div>
  );
}