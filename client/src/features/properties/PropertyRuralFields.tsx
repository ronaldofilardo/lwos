import { Input } from "@/components/ui/input";
import { inputClass } from "./propertyFormRules";
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
      <Input
        className={inputClass}
        value={values.ccir}
        onChange={e => set({ ccir: e.target.value })}
        placeholder="CCIR (obrigatório)"
      />
      <Input
        className={inputClass}
        value={values.nirf}
        onChange={e => set({ nirf: e.target.value })}
        placeholder="NIRF (obrigatório)"
      />
    </div>
  );
}
