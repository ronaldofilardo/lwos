import { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { MultiStateSuccessionResult } from "@shared/domain/itcmd-types";
import {
  computeMultiStateSuccessionTax,
  PropertyItcmdInput,
} from "@shared/domain/itcmd-multistate";
import { ItcmdCompetenceTable } from "./ItcmdCompetenceTable";
import { ItcmdKpiSummary } from "./ItcmdKpiSummary";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function ItcmdSuccessionCard({
  multiState,
  patriarchUf = "SP",
  properties = [],
  mobileBase = 0,
}: {
  multiState: MultiStateSuccessionResult;
  patriarchUf?: string;
  properties?: PropertyItcmdInput[];
  mobileBase?: number;
}) {
  const [selectedDomicile, setSelectedDomicile] = useState(patriarchUf);

  const activeResult = useMemo(() => {
    if (selectedDomicile === patriarchUf) return multiState;
    return computeMultiStateSuccessionTax(properties, mobileBase, selectedDomicile);
  }, [multiState, patriarchUf, properties, mobileBase, selectedDomicile]);

  return (
    <div className="space-y-4 rounded-2xl border border-lucathi-line/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lucathi-line/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-lucathi-mist p-2 text-lucathi-navy">
            <Landmark className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-lucathi-navy">
              Diagnóstico Sucessório — ITCMD por Competência (CF Art. 155)
            </h3>
            <p className="text-xs text-lucathi-gray">
              Tributação individual por situação do imóvel e domicílio das sociedades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-lucathi-gray">Domicílio Fiscal:</label>
          <select
            value={selectedDomicile}
            onChange={e => setSelectedDomicile(e.target.value)}
            className="h-8 rounded-lg border border-lucathi-line bg-white px-2.5 text-xs font-semibold text-lucathi-navy shadow-xs focus:outline-none"
          >
            {UFS.map(uf => (
              <option key={uf} value={uf}>
                {uf} {uf === patriarchUf ? "(Domicílio Real)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ItcmdKpiSummary result={activeResult} />

      <div className="space-y-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Rateio por Estado Credor (Art. 155 da CF/88)
        </p>
        <ItcmdCompetenceTable rows={activeResult.byState} />
      </div>
    </div>
  );
}
