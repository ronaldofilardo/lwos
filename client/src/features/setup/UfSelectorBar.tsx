import { Button } from "@/components/ui/button";
import { UfSummary } from "./types";

interface Props {
  selectedUf: string;
  onSelectUf: (uf: string) => void;
  summaries: UfSummary[];
}

const REGIONS: Record<string, string[]> = {
  Sudeste: ["SP", "RJ", "MG", "ES"],
  Sul: ["PR", "SC", "RS"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Nordeste: ["BA", "CE", "PE", "MA", "PB", "RN", "AL", "PI", "SE"],
  Norte: ["AM", "PA", "RO", "TO", "AC", "AP", "RR"],
};

export function UfSelectorBar({ selectedUf, onSelectUf, summaries }: Props) {
  const summaryMap = new Map(summaries.map(s => [s.uf, s]));

  return (
    <div className="space-y-3 rounded-xl border border-lucathi-line/70 bg-lucathi-mist/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Selecione a Unidade Federativa (27 UFs)
        </p>
        <span className="text-xs text-lucathi-gray">
          Ativa: <strong className="text-lucathi-navy">{selectedUf}</strong>
        </span>
      </div>

      <div className="space-y-2">
        {Object.entries(REGIONS).map(([region, ufs]) => (
          <div key={region} className="flex flex-wrap items-center gap-1.5">
            <span className="w-24 text-[11px] font-medium text-lucathi-gray shrink-0">
              {region}:
            </span>
            <div className="flex flex-wrap gap-1">
              {ufs.map(uf => {
                const s = summaryMap.get(uf);
                const isSelected = selectedUf === uf;
                const rateLabel =
                  s && s.minRate === s.maxRate
                    ? `${s.minRate}%`
                    : s
                      ? `${s.minRate}-${s.maxRate}%`
                      : "";

                return (
                  <Button
                    key={uf}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onSelectUf(uf)}
                    className={`h-7 px-2.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-lucathi-navy text-white shadow-sm"
                        : "bg-white text-lucathi-ink hover:bg-lucathi-mist"
                    }`}
                  >
                    <span>{uf}</span>
                    {rateLabel && (
                      <span className="ml-1 text-[10px] opacity-75">({rateLabel})</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

