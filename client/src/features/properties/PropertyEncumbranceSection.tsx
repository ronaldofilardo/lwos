import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { encumbranceTypeLabels, encumbranceTypeValues } from "./types";
import { inputClass, selectClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyEncumbranceSection({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  return (
    <>
      {/* O gravame nasce «Pendente de verificação» (enum sem vazio). */}
      <LabeledField label={copy.encumbranceType.label}>
        {id => (
          <select
            id={id}
            value={values.encumbranceType}
            onChange={e => set({ encumbranceType: e.target.value })}
            className={selectClass}
          >
            {encumbranceTypeValues.map(value => (
              <option key={value} value={value}>
                {encumbranceTypeLabels[value]}
              </option>
            ))}
          </select>
        )}
      </LabeledField>
      <LabeledField label={copy.encumbranceNote.label}>
        {id => (
          <Input
            id={id}
            className={inputClass}
            value={values.encumbranceNote}
            onChange={e => set({ encumbranceNote: e.target.value })}
            placeholder={copy.encumbranceNote.placeholder}
          />
        )}
      </LabeledField>
    </>
  );
}
