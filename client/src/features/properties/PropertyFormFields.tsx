import { LabeledField } from "@/components/LabeledField";
import { PropertyLocationFields } from "./PropertyLocationFields";
import { PropertyUrbanFields } from "./PropertyUrbanFields";
import { PropertyRuralFields } from "./PropertyRuralFields";
import { PropertyValuesFields } from "./PropertyValuesFields";
import { PropertyUtilityFields } from "./PropertyUtilityFields";
import { PropertyEncumbranceSection } from "./PropertyEncumbranceSection";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyFormFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <PropertyLocationFields values={values} onChange={onChange} />
      <PropertyUrbanFields values={values} onChange={onChange} />
      <PropertyRuralFields values={values} onChange={onChange} />
      <PropertyValuesFields values={values} onChange={onChange} />
      <PropertyUtilityFields values={values} onChange={onChange} />
      <PropertyEncumbranceSection values={values} onChange={onChange} />
      <LabeledField label={copy.notes.label} className="col-span-full">
        {id => (
          <textarea
            id={id}
            className="min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
            value={values.notes}
            onChange={e => set({ notes: e.target.value })}
            placeholder={copy.notes.placeholder}
          />
        )}
      </LabeledField>
    </div>
  );
}
