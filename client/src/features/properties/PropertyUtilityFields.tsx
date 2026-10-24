import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { propertyUtilityLabels } from "./types";
import { inputClass, selectClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyUtilityFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  return (
    <>
      {/* O valor inicial é «Pendente» (enum sem vazio): não há opção «Selecione». */}
      <LabeledField label={copy.utility.label}>
        {id => (
          <select
            id={id}
            value={values.utility}
            onChange={e => set({ utility: e.target.value })}
            className={selectClass}
          >
            {Object.entries(propertyUtilityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </LabeledField>
      {values.utility === "LOCACAO_ARRENDAMENTO" ? (
        <LabeledField label={copy.rentValue.label}>
          {id => (
            <Input
              id={id}
              className={inputClass}
              inputMode="decimal"
              value={values.rentValue}
              onChange={e => set({ rentValue: e.target.value })}
              placeholder={copy.rentValue.placeholder}
            />
          )}
        </LabeledField>
      ) : null}
    </>
  );
}
