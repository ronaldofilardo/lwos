import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  encumbranceTypeLabels,
  encumbranceTypeValues,
  type EncumbranceType,
} from "./types";

export function EncumbranceForm({
  propertyId,
  onSubmit,
}: {
  propertyId: string;
  onSubmit: (type: EncumbranceType, description?: string) => Promise<unknown>;
}) {
  const [type, setType] = useState<EncumbranceType>("HIPOTECA");
  const [description, setDescription] = useState("");

  const submit = async () => {
    await onSubmit(type, description.trim() || undefined);
    setDescription("");
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <select
        value={type}
        onChange={e => setType(e.target.value as EncumbranceType)}
        className="h-9 min-w-48 rounded-md border border-input bg-background px-2 text-xs"
        aria-label="Tipo de gravame"
      >
        {encumbranceTypeValues.map(value => (
          <option key={value} value={value}>
            {encumbranceTypeLabels[value]}
          </option>
        ))}
      </select>
      <Input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Detalhes do gravame (opcional)"
        className="h-9 min-w-56 flex-1 text-xs"
      />
      <Button variant="outline" onClick={submit}>
        <AlertTriangle className="mr-1 size-3 text-amber-600" />
        Adicionar
      </Button>
    </div>
  );
}
