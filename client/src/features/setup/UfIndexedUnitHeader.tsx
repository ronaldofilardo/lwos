import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  indexedUnitName: string;
  indexedUnitValue: string;
  onIndexedUnitChange: (name: string, val: string) => void;
  onAdd: () => void;
}

export function UfIndexedUnitHeader({
  indexedUnitName,
  indexedUnitValue,
  onIndexedUnitChange,
  onAdd,
}: Props) {
  return (
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
  );
}
