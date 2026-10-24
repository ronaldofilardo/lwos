import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { UFS, type Uf } from "@shared/validation";
import { useCepLookup } from "@/shared/hooks/useCepLookup";
import { inputClass, selectClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyLocationFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  const { lookupCep, loading: loadingCep } = useCepLookup();

  return (
    <>
      <LabeledField label={copy.description.label}>
        {id => (
          <Input
            id={id}
            className={inputClass}
            value={values.description}
            onChange={e => set({ description: e.target.value })}
            placeholder={copy.description.placeholder}
          />
        )}
      </LabeledField>
      <div className="grid grid-cols-[110px_90px_1fr] gap-2">
        <LabeledField label={copy.cep.label}>
          {id => (
            <div className="relative">
              <Input
                id={id}
                className={inputClass}
                value={values.cep}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                  set({ cep: val });
                  if (val.length === 8) {
                    lookupCep(val, addr => {
                      const patch: Partial<PropertyFormValues> = {};
                      if (addr.uf && UFS.includes(addr.uf as Uf))
                        patch.uf = addr.uf;
                      if (addr.city) patch.propertyCity = addr.city;
                      if (!values.description && addr.street) {
                        patch.description = [
                          addr.street,
                          addr.district,
                          `${addr.city}/${addr.uf}`,
                        ]
                          .filter(Boolean)
                          .join(", ");
                      }
                      set(patch);
                    });
                  }
                }}
                placeholder={loadingCep ? "..." : copy.cep.placeholder}
                inputMode="numeric"
              />
              {loadingCep ? (
                <Loader2 className="absolute right-2 top-2.5 size-3.5 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          )}
        </LabeledField>
        <LabeledField label={copy.uf.label}>
          {id => (
            <select
              id={id}
              value={values.uf}
              onChange={e => set({ uf: e.target.value })}
              className={selectClass}
            >
              <option value="">{copy.uf.placeholder}</option>
              {UFS.map(uf => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          )}
        </LabeledField>
        <LabeledField label={copy.city.label}>
          {id => (
            <Input
              id={id}
              className={inputClass}
              value={values.propertyCity}
              onChange={e => set({ propertyCity: e.target.value })}
              placeholder={copy.city.placeholder}
            />
          )}
        </LabeledField>
      </div>
      <LabeledField label={copy.kind.label}>
        {id => (
          <select
            id={id}
            value={values.kind}
            onChange={e =>
              set({ kind: e.target.value as PropertyFormValues["kind"] })
            }
            className={selectClass}
          >
            <option value="">{copy.kind.placeholder}</option>
            <option value="URBANO">Urbano</option>
            <option value="RURAL">Rural</option>
          </select>
        )}
      </LabeledField>
    </>
  );
}
