import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UFS, type Uf } from "@shared/validation";
import { useCepLookup } from "@/shared/hooks/useCepLookup";
import type { PersonFormState } from "./usePersonFormState";

export function PersonContactFields({ state }: { state: PersonFormState }) {
  const { lookupCep, loading: loadingCep } = useCepLookup();
  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <>
      <fieldset className="space-y-2 rounded-xl border border-lucathi-line/70 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
          Endereço
        </legend>
        {!state.isTitular ? (
          <label className="flex items-center gap-2 text-sm text-lucathi-navy">
            <input
              type="checkbox"
              className="size-4 accent-lucathi-deep"
              checked={state.addressSameAsPrimary}
              onChange={e => state.setAddressSameAsPrimary(e.target.checked)}
            />
            Mesmo endereço do titular
          </label>
        ) : null}
        {!state.addressSameAsPrimary || state.isTitular ? (
          <div className="grid gap-2 md:grid-cols-3">
            <div className="relative">
              <Input
                value={state.cep}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                  state.setCep(val);
                  if (val.length === 8) {
                    lookupCep(val, addr => {
                      if (addr.street) state.setStreet(addr.street);
                      if (addr.complement && !state.complement)
                        state.setComplement(addr.complement);
                      if (addr.district) state.setDistrict(addr.district);
                      if (addr.city) state.setCity(addr.city);
                      if (addr.uf && UFS.includes(addr.uf as Uf))
                        state.setUf(addr.uf as Uf);
                    });
                  }
                }}
                placeholder={loadingCep ? "Buscando CEP..." : "CEP"}
                inputMode="numeric"
              />
              {loadingCep ? (
                <Loader2 className="absolute right-2.5 top-2.5 size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>
            <Input
              value={state.street}
              onChange={e => state.setStreet(e.target.value)}
              placeholder="Logradouro"
              className="md:col-span-2"
            />
            <Input
              value={state.number}
              onChange={e => state.setNumber(e.target.value)}
              placeholder="Número"
            />
            <Input
              value={state.complement}
              onChange={e => state.setComplement(e.target.value)}
              placeholder="Complemento"
            />
            <Input
              value={state.district}
              onChange={e => state.setDistrict(e.target.value)}
              placeholder="Bairro"
            />
            <Input
              value={state.city}
              onChange={e => state.setCity(e.target.value)}
              placeholder="Cidade"
            />
            <select
              value={state.uf}
              onChange={e => state.setUf(e.target.value as Uf | "")}
              className={selectClass}
              aria-label="UF do endereço"
            >
              <option value="">UF</option>
              {UFS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </fieldset>
      <Textarea
        value={state.note}
        onChange={e => state.setNote(e.target.value)}
        placeholder="Observação"
      />
    </>
  );
}
