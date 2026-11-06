import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { UfSelectorBar } from "./UfSelectorBar";
import { UfBracketTable } from "./UfBracketTable";
import { UfBracketFormModal } from "./UfBracketFormModal";
import { UfBracketFormData } from "./types";

export function ItcmdPanel() {
  const [selectedUf, setSelectedUf] = useState("SP");
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [brackets, setBrackets] = useState<UfBracketFormData[]>([]);
  const [unitName, setUnitName] = useState("");
  const [unitValue, setUnitValue] = useState("");

  const utils = trpc.useUtils();
  const summariesQuery = trpc.setup.itcmd.listUfs.useQuery();
  const ufQuery = trpc.setup.itcmd.getByUf.useQuery({ uf: selectedUf });

  useEffect(() => {
    if (ufQuery.data) {
      setBrackets(ufQuery.data.brackets);
      setUnitName(ufQuery.data.brackets[0]?.indexedUnitName ?? "");
      setUnitValue(ufQuery.data.brackets[0]?.indexedUnitValue ? String(ufQuery.data.brackets[0].indexedUnitValue) : "");
    }
  }, [ufQuery.data]);

  const saveMutation = trpc.setup.itcmd.updatePolicy.useMutation({
    onSuccess: () => {
      toast.success(`Políticas de ITCMD para ${selectedUf} salvas com sucesso!`);
      utils.setup.itcmd.listUfs.invalidate();
      utils.setup.itcmd.getByUf.invalidate({ uf: selectedUf });
    },
    onError: err => toast.error(`Erro ao salvar: ${err.message}`),
  });

  const handleSaveModal = (data: UfBracketFormData) => {
    if (editIndex !== null) {
      setBrackets(prev => prev.map((b, i) => (i === editIndex ? { ...b, ...data } : b)));
    } else {
      setBrackets(prev => [...prev, { ...data, bracketOrder: prev.length + 1 }]);
    }
  };

  const handleSavePolicy = () => {
    const payload = brackets.map((b, idx) => ({
      bracketOrder: idx + 1,
      limitValue: b.limitValue,
      rate: b.rate,
      accumulatedTax: 0,
      deductionValue: 0,
      indexedUnitName: unitName.trim() || null,
      indexedUnitValue: parseFloat(unitValue) || null,
    }));
    saveMutation.mutate({ uf: selectedUf, brackets: payload });
  };

  return (
    <div className="space-y-6">
      <UfSelectorBar
        selectedUf={selectedUf}
        onSelectUf={setSelectedUf}
        summaries={summariesQuery.data ?? []}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-lucathi-navy">
            Faixas de Tributação de {selectedUf}
          </h2>
          <p className="text-xs text-lucathi-gray">
            Configure as alíquotas e indexadores estaduais para cálculo do imposto sucessório.
          </p>
        </div>
        <Button
          onClick={handleSavePolicy}
          disabled={saveMutation.isPending}
          className="gap-2 bg-lucathi-navy text-white hover:bg-lucathi-navy/90"
        >
          <Save className="size-4" />
          {saveMutation.isPending ? "Salvando…" : "Salvar Alterações"}
        </Button>
      </div>

      <UfBracketTable
        brackets={brackets}
        onAdd={() => { setEditIndex(null); setModalOpen(true); }}
        onEdit={idx => { setEditIndex(idx); setModalOpen(true); }}
        onRemove={idx => setBrackets(prev => prev.filter((_, i) => i !== idx))}
        indexedUnitName={unitName}
        indexedUnitValue={unitValue}
        onIndexedUnitChange={(name, val) => { setUnitName(name); setUnitValue(val); }}
      />

      <UfBracketFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editIndex !== null ? brackets[editIndex] : null}
        onSave={handleSaveModal}
      />
    </div>
  );
}

