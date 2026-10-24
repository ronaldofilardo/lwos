import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { inputClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyRuralFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  if (values.kind !== "RURAL") return null;
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  return (
    <div className="grid grid-cols-2 gap-2">
      <LabeledField label={copy.ccir.label}>
        {id => (
          <Input
            id={id}
            className={inputClass}
            value={values.ccir}
            onChange={e => set({ ccir: e.target.value })}
            placeholder={copy.ccir.placeholder}
          />
        )}
      </LabeledField>
      <LabeledField label={copy.nirf.label}>
        {id => (
          <Input
            id={id}
            className={inputClass}
            value={values.nirf}
            onChange={e => set({ nirf: e.target.value })}
            placeholder={copy.nirf.placeholder}
          />
        )}
      </LabeledField>
    </div>
  );
}
