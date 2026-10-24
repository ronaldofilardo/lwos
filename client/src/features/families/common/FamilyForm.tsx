import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { Textarea } from "@/components/ui/textarea";
import {
  projectObjectiveLabels,
  projectObjectiveOrder,
  type FamilyFormData,
  type ProjectObjective,
} from "../types";

type Props = {
  data: FamilyFormData;
  disabled: boolean;
  existingNames?: string[];
  onChange: (data: FamilyFormData) => void;
  onSubmit: () => void;
};

export function FamilyForm({ data, disabled, existingNames, onChange, onSubmit }: Props) {
  const trimmedName = data.name.trim();
  const duplicateName =
    trimmedName.length >= 3 &&
    (existingNames ?? []).some(name => name.trim().toLowerCase() === trimmedName.toLowerCase());
  const toggleObjective = (objective: ProjectObjective) => {
    const objectives = data.objectives.includes(objective)
      ? data.objectives.filter(item => item !== objective)
      : [...data.objectives, objective];
    onChange({ ...data, objectives });
  };
  return (
    <div className="space-y-4">
      <LabeledField label="Projeto">
        {id => (
          <Input
            id={id}
            value={data.name}
            onChange={e => onChange({ ...data, name: e.target.value })}
            placeholder="Ex.: Família Silva"
          />
        )}
      </LabeledField>
      {duplicateName ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700">
          <AlertTriangle className="size-3.5 shrink-0" />
          Já existe um projeto com este nome. Você pode criar mesmo assim.
        </p>
      ) : null}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-lucathi-navy">
          Objetivo <span className="text-lucathi-gray">(ao menos um)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {projectObjectiveOrder.map(objective => (
            <label
              key={objective}
              className="flex items-start gap-2 rounded-lg border border-lucathi-line px-3 py-2 text-sm text-lucathi-navy"
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-lucathi-deep"
                checked={data.objectives.includes(objective)}
                onChange={() => toggleObjective(objective)}
              />
              {projectObjectiveLabels[objective]}
            </label>
          ))}
        </div>
      </fieldset>
      <LabeledField label="Observação (opcional)">
        {id => (
          <Textarea
            id={id}
            value={data.notes}
            onChange={e => onChange({ ...data, notes: e.target.value })}
            placeholder="Ex.: Informações adicionais"
          />
        )}
      </LabeledField>
      <Button
        disabled={disabled || trimmedName.length < 3 || data.objectives.length === 0}
        onClick={onSubmit}
        className="w-full bg-lucathi-deep hover:bg-lucathi-navy"
      >
        Criar Projeto
      </Button>
    </div>
  );
}
