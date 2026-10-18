import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCepLookup } from "@/shared/hooks/useCepLookup";
import type { HoldingFormState } from "./holdingDetails";
import { Field } from "./common/CompanyFormField";

type UpdateField = (key: keyof HoldingFormState, value: string) => void;
type UpdatePatch = (patch: Partial<HoldingFormState>) => void;
type LookupCep = ReturnType<typeof useCepLookup>["lookupCep"];

export function CompanyAddressFields({
  form,
  update,
  updateMultiple,
  lookupCep,
  loadingCep,
}: {
  form: HoldingFormState;
  update: UpdateField;
  updateMultiple: UpdatePatch;
  lookupCep: LookupCep;
  loadingCep: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="relative">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-lucathi-gray">CEP da sede</span>
          <Input
            value={form.cep}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
              update("cep", val);
              if (val.length === 8) {
                lookupCep(val, addr => {
                  updateMultiple({
                    street: addr.street,
                    complement: addr.complement || form.complement,
                    district: addr.district,
                    city: addr.city,
                    uf: addr.uf,
                  });
                });
              }
            }}
            placeholder={loadingCep ? "Buscando..." : "00000000"}
            inputMode="numeric"
            className="h-9"
          />
        </label>
        {loadingCep ? (
          <Loader2 className="absolute right-2.5 bottom-2.5 size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Logradouro"
          value={form.street}
          onChange={value => update("street", value)}
          placeholder="Rua, Av..."
        />
      </div>
      <Field
        label="Número"
        value={form.number}
        onChange={value => update("number", value)}
        placeholder="Ex: 100"
      />
      <Field
        label="Complemento"
        value={form.complement}
        onChange={value => update("complement", value)}
        placeholder="Sala, Andar..."
      />
      <Field
        label="Bairro"
        value={form.district}
        onChange={value => update("district", value)}
        placeholder="Bairro"
      />
      <Field
        label="Cidade"
        value={form.city}
        onChange={value => update("city", value)}
        placeholder="Cidade"
      />
    </div>
  );
}
