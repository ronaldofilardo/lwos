import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { UFS } from "@shared/validation";
import { inputClass, selectClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyUrbanFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);

  return (
    <>
      {values.kind === "URBANO" ? (
        <LabeledField label={copy.inscricaoImobiliaria.label}>
          {id => (
            <Input
              id={id}
              className={inputClass}
              value={values.inscricaoImobiliaria}
              onChange={e => set({ inscricaoImobiliaria: e.target.value })}
              placeholder={copy.inscricaoImobiliaria.placeholder}
            />
          )}
        </LabeledField>
      ) : null}
      <div className="col-span-full rounded-xl border border-lucathi-line/50 bg-lucathi-mist/50 p-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-lucathi-navy">
          <input
            type="checkbox"
            checked={!values.hasRegistration}
            onChange={() => set({ hasRegistration: !values.hasRegistration })}
            className="size-4 rounded border-gray-300 text-lucathi-navy"
          />
          Não há matrícula registrada (Imóvel em construção, posse ou
          loteamento)
        </label>
        {!values.hasRegistration ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <LabeledField label={copy.alternativeDocType.label}>
              {id => (
                <select
                  id={id}
                  value={values.alternativeDocType}
                  onChange={e =>
                    set({
                      alternativeDocType: e.target
                        .value as PropertyFormValues["alternativeDocType"],
                    })
                  }
                  className={selectClass}
                >
                  <option value="ESCRITURA_PUBLICA">
                    Escritura Pública de Compra e Venda / Posse
                  </option>
                  <option value="CONTRATO_COMPRA_VENDA">
                    Contrato de Compra e Venda / Cessão de Direitos
                  </option>
                </select>
              )}
            </LabeledField>
            <LabeledField label={copy.noRegistrationReason.label}>
              {id => (
                <Input
                  id={id}
                  className={inputClass}
                  value={values.noRegistrationReason}
                  onChange={e => set({ noRegistrationReason: e.target.value })}
                  placeholder={copy.noRegistrationReason.placeholder}
                />
              )}
            </LabeledField>
          </div>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <LabeledField label={copy.registrationNumber.label}>
              {id => (
                <Input
                  id={id}
                  className={inputClass}
                  value={values.registrationNumber}
                  onChange={e => set({ registrationNumber: e.target.value })}
                  placeholder={copy.registrationNumber.placeholder}
                />
              )}
            </LabeledField>
            <div className="grid grid-cols-[130px_1fr] gap-2">
              <LabeledField label={copy.registryUf.label}>
                {id => (
                  <select
                    id={id}
                    value={values.registryUf}
                    onChange={e => set({ registryUf: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">{copy.registryUf.placeholder}</option>
                    {UFS.map(uf => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                )}
              </LabeledField>
              <LabeledField label={copy.registryCity.label}>
                {id => (
                  <Input
                    id={id}
                    className={inputClass}
                    value={values.registryCity}
                    onChange={e => set({ registryCity: e.target.value })}
                    placeholder={copy.registryCity.placeholder}
                  />
                )}
              </LabeledField>
            </div>
            <LabeledField label={copy.registryOfficeNumber.label}>
              {id => (
                <select
                  id={id}
                  className={selectClass}
                  value={values.registryOfficeNumber}
                  onChange={e => set({ registryOfficeNumber: e.target.value })}
                >
                  <option value="">
                    {copy.registryOfficeNumber.placeholder}
                  </option>
                  {Array.from({ length: 55 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
            </LabeledField>
          </div>
        )}
      </div>
    </>
  );
}
