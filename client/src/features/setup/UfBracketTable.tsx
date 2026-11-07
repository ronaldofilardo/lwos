import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { UfBracketFormData } from "./types";
import { UfIndexedUnitHeader } from "./UfIndexedUnitHeader";

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
      <UfIndexedUnitHeader
        indexedUnitName={indexedUnitName}
        indexedUnitValue={indexedUnitValue}
        onIndexedUnitChange={onIndexedUnitChange}
        onAdd={onAdd}
      />
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
