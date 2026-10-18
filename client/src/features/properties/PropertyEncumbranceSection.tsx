import { Input } from "@/components/ui/input";
import {
  encumbranceTypeLabels,
  encumbranceTypeValues,
} from "./types";
import { inputClass, selectClass } from "./propertyFormRules";
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
      <select
        value={values.encumbranceType}
        onChange={e => set({ encumbranceType: e.target.value })}
        className={selectClass}
        aria-label="Gravame do imóvel"
      >
        {encumbranceTypeValues.map(value => (
          <option key={value} value={value}>
            {encumbranceTypeLabels[value]}
          </option>
        ))}
      </select>
      <Input
        className={inputClass}
        value={values.encumbranceNote}
        onChange={e => set({ encumbranceNote: e.target.value })}
        placeholder="Observação do gravame (opcional)"
      />
    </>
  );
}
