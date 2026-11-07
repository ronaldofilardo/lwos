import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { UfBracketFormData } from "./types";

interface Props {
  brackets: UfBracketFormData[];
  onAdd: () => void;
  onEdit: (idx: number) => void;
  onRemove: (idx: number) => void;
  indexedUnitName: string;
  indexedUnitValue: string;
  onIndexedUnitChange: (name: string, val: string) => void;
}

export function UfBracketTable({
  brackets,
  onAdd,
  onEdit,
  onRemove,
  indexedUnitName,
  indexedUnitValue,
  onIndexedUnitChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-lucathi-line/70 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-medium text-lucathi-gray">
              Unidade Indexada (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: UFESP, UFIR-RJ"
              value={indexedUnitName}
              onChange={e => onIndexedUnitChange(e.target.value, indexedUnitValue)}
              className="mt-1 block h-8 rounded-lg border border-lucathi-line px-2 text-xs text-lucathi-navy"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-lucathi-gray">
              Valor da Unidade em R$
            </label>
            <input
              type="number"
              step="any"
              placeholder="Ex: 35.36"
              value={indexedUnitValue}
              onChange={e => onIndexedUnitChange(indexedUnitName, e.target.value)}
              className="mt-1 block h-8 w-28 rounded-lg border border-lucathi-line px-2 text-xs text-lucathi-navy"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={onAdd}
          className="gap-1.5 bg-lucathi-navy text-white hover:bg-lucathi-navy/90"
        >
          <Plus className="size-3.5" /> Adicionar Faixa
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-lucathi-line/80 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-lucathi-line bg-lucathi-mist/50 text-[11px] font-semibold text-lucathi-gray">
            <tr>
              <th className="px-4 py-2.5">Ordem</th>
              <th className="px-4 py-2.5">Teto da Faixa</th>
              <th className="px-4 py-2.5">Alíquota (%)</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lucathi-line/60">
            {brackets.map((b, idx) => (
              <tr key={idx} className="hover:bg-lucathi-mist/20">
                <td className="px-4 py-3 font-medium text-lucathi-navy">{idx + 1}ª Faixa</td>
                <td className="px-4 py-3">
                  {b.limitValue >= 900000000
                    ? "Acima da faixa anterior (Sem teto)"
                    : `${b.limitValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ${indexedUnitName ? `(${indexedUnitName})` : "R$"}`}
                </td>
                <td className="px-4 py-3 font-semibold text-lucathi-ink">{b.rate}%</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => onEdit(idx)}>
                      <Edit2 className="size-3.5 text-lucathi-gray" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 text-status-danger-text hover:text-status-danger-text/80" onClick={() => onRemove(idx)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

