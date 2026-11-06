import { StateCompetenceSummary } from "@shared/domain/itcmd-types";

const formatBrl = (val: number) =>
  val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ItcmdCompetenceTable({
  rows,
}: {
  rows: StateCompetenceSummary[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-lucathi-line p-4 text-center text-xs text-lucathi-gray">
        Nenhum patrimônio cadastrado para apuração de competência.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-lucathi-line/70 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-lucathi-line bg-lucathi-mist/50 text-[11px] font-semibold text-lucathi-gray">
          <tr>
            <th className="px-3.5 py-2.5">Estado Credor (SEFAZ)</th>
            <th className="px-3.5 py-2.5">Escopo Constitucional</th>
            <th className="px-3.5 py-2.5">Base Tributável</th>
            <th className="px-3.5 py-2.5">Alíquota Efetiva</th>
            <th className="px-3.5 py-2.5 text-right">ITCMD Devido</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lucathi-line/60">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-lucathi-mist/20">
              <td className="px-3.5 py-3 font-semibold text-lucathi-navy">
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded bg-lucathi-mist px-1.5 py-0.5 text-[10px] font-bold text-lucathi-navy">
                    {row.uf}
                  </span>
                  <span>SEFAZ / {row.uf}</span>
                </span>
              </td>
              <td className="px-3.5 py-3 text-lucathi-gray">{row.scope}</td>
              <td className="px-3.5 py-3 font-medium text-lucathi-ink">
                {formatBrl(row.patrimonyBase)}
              </td>
              <td className="px-3.5 py-3 font-semibold text-lucathi-navy">
                {row.effectiveRate.toFixed(2)}%
              </td>
              <td className="px-3.5 py-3 text-right font-bold text-lucathi-navy">
                {formatBrl(row.taxAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

