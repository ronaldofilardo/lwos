import { formatBRL } from "@/features/properties/propertyCardView";
import type { PropertyTaxRow } from "../types";

export function PropertyRentalComparisonSection({
  property,
}: {
  property: PropertyTaxRow;
}) {
  if (!property.isRental) {
    return (
      <div className="rounded-xl border border-dashed border-lucathi-line bg-lucathi-mist/30 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          3. Locação & Renda Recorrente (PF × PJ)
        </p>
        <p className="mt-1 text-xs text-lucathi-gray">
          Este imóvel não possui utilidade de Locação/Arrendamento configurada.
        </p>
      </div>
    );
  }

  const isSaving = property.annualRentalSaving > 0;

  return (
    <div className="rounded-xl border border-lucathi-line/70 bg-lucathi-mist/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-lucathi-navy">
          3. Locação & Renda Recorrente (PF × PJ)
        </h4>
        <span className="text-xs text-lucathi-navy font-medium">
          Aluguel informado: {formatBRL(property.rentValue)}/mês
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-lucathi-line bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-lucathi-mist/70 text-lucathi-gray">
            <tr>
              <th className="px-3 py-2 font-medium">Componente Tributário</th>
              <th className="px-3 py-2 text-right font-medium">Pessoa Física (PF)</th>
              <th className="px-3 py-2 text-right font-medium">Pessoa Jurídica (PJ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lucathi-line/60">
            <tr>
              <td className="px-3 py-2 text-lucathi-navy">IR / IRPJ (mensal)</td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.monthlyIrpf) ?? "—"}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.annualRentalPjIrpjCsll / 12) ?? "—"}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-lucathi-navy">IBS / CBS (mensal)</td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.monthlyIbsCbs) ?? "—"}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.annualRentalPjIbsCbs / 12) ?? "—"}
              </td>
            </tr>
            <tr className="bg-lucathi-mist/40 font-semibold">
              <td className="px-3 py-2 text-lucathi-navy">Custo Fiscal Anual Total</td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.annualRentalPf) ?? "—"}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-lucathi-navy">
                {formatBRL(property.annualRentalPj) ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-lg p-3 border ${
            isSaving
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          <p className="text-xs font-medium">Economia Líquida Anual na PJ</p>
          <p className="mt-1 text-base font-bold tabular-nums">
            {formatBRL(property.annualRentalSaving) ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] opacity-80">
            {isSaving ? "Receber pela PJ gera economia" : "Receber pela PJ custa mais"}
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 border border-lucathi-line/70">
          <p className="text-xs text-lucathi-gray">Tempo de Payback Estimado</p>
          <p className="mt-1 text-base font-bold text-lucathi-navy tabular-nums">
            {property.paybackYears > 0
              ? `${property.paybackYears.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })} anos`
              : "Sem retorno (0 anos)"}
          </p>
          <p className="mt-0.5 text-[11px] text-lucathi-gray">
            Custo de integralização ÷ economia anual
          </p>
        </div>
      </div>
    </div>
  );
}

