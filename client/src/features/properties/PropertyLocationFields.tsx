import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UFS, type Uf } from "@shared/validation";
import { useCepLookup } from "@/shared/hooks/useCepLookup";
import { inputClass, selectClass } from "./propertyFormRules";
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
      <Input
        className={inputClass}
        value={values.description}
        onChange={e => set({ description: e.target.value })}
        placeholder="Descrição do imóvel (ex: Fazenda Boa Vista, Apto 101 Jardins...)"
      />
      <div className="grid grid-cols-[105px_80px_1fr] gap-2">
        <div className="relative">
          <Input
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
                    patch.description = [addr.street, addr.district, `${addr.city}/${addr.uf}`]
                      .filter(Boolean)
                      .join(", ");
                  }
                  set(patch);
                });
              }
            }}
            placeholder={loadingCep ? "..." : "CEP"}
            inputMode="numeric"
          />
          {loadingCep ? (
            <Loader2 className="absolute right-2 top-2.5 size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <select
          value={values.uf}
          onChange={e => set({ uf: e.target.value })}
          className={selectClass}
          aria-label="UF do imóvel"
        >
          <option value="">UF</option>
          {UFS.map(uf => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
        <Input
          className={inputClass}
          value={values.propertyCity}
          onChange={e => set({ propertyCity: e.target.value })}
          placeholder="Cidade do imóvel"
        />
      </div>
      <select
        value={values.kind}
        onChange={e =>
          set({ kind: e.target.value as PropertyFormValues["kind"] })
        }
        className={selectClass}
        aria-label="Tipo do imóvel"
      >
        <option value="">Tipo (Urbano/Rural)</option>
        <option value="URBANO">Urbano</option>
        <option value="RURAL">Rural</option>
      </select>
    </>
  );
}
