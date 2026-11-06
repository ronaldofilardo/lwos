import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";

export function PropertyIntegralizationSection({
  property,
}: {
  property: PropertyTaxRow;
}) {
  return (
    <div className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-lucathi-navy">
          1. Custo de Integralização na Holding
        </h4>
        <span className="text-xs text-lucathi-gray">
          Transferência para a Pessoa Jurídica
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">ITBI</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.itbi) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            Alíquota: {property.itbiRate !== null ? `${property.itbiRate}%` : "não informada"}
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">Laudêmio / Aforamento</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.laudemio) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            {property.hasLaudemio
              ? `Alíquota: ${property.laudemioRate ?? 0}%`
              : "Não incidente"}
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-lucathi-line/60">
          <p className="text-xs text-lucathi-gray">Emolumentos Cartório</p>
          <p className="mt-1 font-semibold text-sm text-lucathi-navy tabular-nums">
            {formatBRL(property.emolumentsValue) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            Escritura e registro
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-lucathi-deep px-4 py-2.5 text-white">
        <span className="text-xs font-medium">Custo Total de Integralização</span>
        <span className="font-display text-base font-semibold tabular-nums">
          {formatBRL(property.integralizationCost) ?? "—"}
        </span>
      </div>
    </div>
  );
}

