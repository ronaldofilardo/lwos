import { ItcmdCalculationSlice } from "@shared/domain/itcmd-types";

const formatBrl = (val: number) =>
  val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ItcmdMemoryBreakdown({
  slices,
  indexedUnitName,
  indexedUnitValue,
}: {
  slices: ItcmdCalculationSlice[];
  indexedUnitName?: string | null;
  indexedUnitValue?: number | null;
}) {
  if (slices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-lucathi-line p-4 text-center text-xs text-lucathi-gray">
        Patrimônio isento ou sem faixas tributadas nesta UF.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {indexedUnitName && indexedUnitValue && (
        <p className="text-[11px] text-lucathi-gray">
          * Valores de teto calculados com base na cotação de 1 {indexedUnitName} = {formatBrl(indexedUnitValue)}.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-lucathi-line/70 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-lucathi-line bg-lucathi-mist/40 text-[11px] font-semibold text-lucathi-gray">
            <tr>
              <th className="px-3.5 py-2">Faixa</th>
              <th className="px-3.5 py-2">Intervalo do Patrimônio</th>
              <th className="px-3.5 py-2">Base na Faixa</th>
              <th className="px-3.5 py-2">Alíquota</th>
              <th className="px-3.5 py-2 text-right">Imposto da Faixa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lucathi-line/50">
            {slices.map(s => (
              <tr key={s.order} className="hover:bg-lucathi-mist/20">
                <td className="px-3.5 py-2.5 font-medium text-lucathi-navy">{s.order}ª Faixa</td>
                <td className="px-3.5 py-2.5 text-lucathi-gray">
                  {formatBrl(s.fromValue)} até {formatBrl(s.toValue)}
                </td>
                <td className="px-3.5 py-2.5 font-medium text-lucathi-ink">{formatBrl(s.sliceBase)}</td>
                <td className="px-3.5 py-2.5 font-semibold text-lucathi-navy">{s.rate}%</td>
                <td className="px-3.5 py-2.5 text-right font-semibold text-lucathi-ink">
                  {formatBrl(s.taxAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

