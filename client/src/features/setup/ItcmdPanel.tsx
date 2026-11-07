import { useEffect, useState } from "react";
import { UfBracketFormData } from "./types";
import { useItcmdPolicySync } from "./hooks/useItcmdPolicySync";
import { ItcmdHeaderActions } from "./ItcmdHeaderActions";
import { UfSelectorBar } from "./UfSelectorBar";
import { UfBracketTable } from "./UfBracketTable";
import { UfBracketFormModal } from "./UfBracketFormModal";

export function ItcmdPanel() {
  const [selectedUf, setSelectedUf] = useState("SP");
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [brackets, setBrackets] = useState<UfBracketFormData[]>([]);
  const [unitName, setUnitName] = useState("");
  const [unitValue, setUnitValue] = useState("");

  const {
    summaries,
    serverBrackets,
    initialUnitName,
    initialUnitValue,
    saveMutation,
    handleSavePolicy,
  } = useItcmdPolicySync({ selectedUf });

  useEffect(() => {
    if (serverBrackets.length > 0) {
      setBrackets(serverBrackets);
      setUnitName(initialUnitName);
      setUnitValue(initialUnitValue);
    }
  }, [serverBrackets, initialUnitName, initialUnitValue]);

  const handleSaveModal = (data: UfBracketFormData) => {
    if (editIndex !== null) {
      setBrackets(prev =>
        prev.map((b, i) => (i === editIndex ? { ...b, ...data } : b))
      );
    } else {
      setBrackets(prev => [...prev, { ...data, bracketOrder: prev.length + 1 }]);
    }
  };

  return (
    <div className="space-y-6">
      <UfSelectorBar
        selectedUf={selectedUf}
        onSelectUf={setSelectedUf}
        summaries={summaries}
      />
      <ItcmdHeaderActions
        selectedUf={selectedUf}
        onSave={() => handleSavePolicy(brackets, unitName, unitValue)}
        isPending={saveMutation.isPending}
      />
      <UfBracketTable
        brackets={brackets}
        onAdd={() => { setEditIndex(null); setModalOpen(true); }}
        onEdit={idx => { setEditIndex(idx); setModalOpen(true); }}
        onRemove={idx => setBrackets(prev => prev.filter((_, i) => i !== idx))}
        indexedUnitName={unitName}
        indexedUnitValue={unitValue}
        onIndexedUnitChange={(name, val) => {
          setUnitName(name);
          setUnitValue(val);
        }}
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
