import { Input } from "@/components/ui/input";
import { propertyUtilityLabels } from "./types";
import { inputClass, selectClass } from "./propertyFormRules";
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
      <select
        value={values.utility}
        onChange={e => set({ utility: e.target.value })}
        className={selectClass}
        aria-label="Utilidade do imóvel"
      >
        {Object.entries(propertyUtilityLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {values.utility === "LOCACAO_ARRENDAMENTO" ? (
        <Input
          className={inputClass}
          inputMode="decimal"
          value={values.rentValue}
          onChange={e => set({ rentValue: e.target.value })}
          placeholder="Valor de locação (R$) — obrigatório"
        />
      ) : null}
    </>
  );
}
