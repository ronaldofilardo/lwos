import { Input } from "@/components/ui/input";
import { UFS } from "@shared/validation";
import { inputClass, selectClass } from "./propertyFormRules";
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
        <Input
          className={inputClass}
          value={values.inscricaoImobiliaria}
          onChange={e => set({ inscricaoImobiliaria: e.target.value })}
          placeholder="Inscrição imobiliária (obrigatória para urbano)"
        />
      ) : null}
      <div className="col-span-full rounded-xl border border-lucathi-line/50 bg-lucathi-mist/50 p-3">
      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-lucathi-navy">
        <input
          type="checkbox"
          checked={!values.hasRegistration}
          onChange={() => set({ hasRegistration: !values.hasRegistration })}
          className="size-4 rounded border-gray-300 text-lucathi-navy"
        />
        Não há matrícula registrada (Imóvel em construção, posse ou loteamento)
      </label>
      {!values.hasRegistration ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select
            value={values.alternativeDocType}
            onChange={e =>
              set({
                alternativeDocType: e.target
                  .value as PropertyFormValues["alternativeDocType"],
              })
            }
            className={selectClass}
            aria-label="Documento alternativo"
          >
            <option value="ESCRITURA_PUBLICA">
              Escritura Pública de Compra e Venda / Posse
            </option>
            <option value="CONTRATO_COMPRA_VENDA">
              Contrato de Compra e Venda / Cessão de Direitos
            </option>
          </select>
          <Input
            className={inputClass}
            value={values.noRegistrationReason}
            onChange={e => set({ noRegistrationReason: e.target.value })}
            placeholder="Justificativa da ausência de matrícula"
          />
        </div>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Input
            className={inputClass}
            value={values.registrationNumber}
            onChange={e => set({ registrationNumber: e.target.value })}
            placeholder="Número da Matrícula"
          />
          <div className="grid grid-cols-[90px_1fr] gap-2">
            <select
              value={values.registryUf}
              onChange={e => set({ registryUf: e.target.value })}
              className={selectClass}
              aria-label="UF do cartório"
            >
              <option value="">UF cartório</option>
              {UFS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
            <Input
              className={inputClass}
              value={values.registryCity}
              onChange={e => set({ registryCity: e.target.value })}
              placeholder="Cidade do Cartório"
            />
          </div>
            <select
              className={selectClass}
              value={values.registryOfficeNumber}
              onChange={e => set({ registryOfficeNumber: e.target.value })}
              aria-label="Número do cartório"
            >
              <option value="">Selecione (1 a 55)</option>
              {Array.from({ length: 55 }, (_, i) => i + 1).map(n => (
                <option key={n} value={String(n)}>{n}</option>
              ))}
            </select>
        </div>
      )}
      </div>
    </>
  );
}
