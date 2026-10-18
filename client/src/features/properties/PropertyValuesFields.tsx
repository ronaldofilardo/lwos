import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { parseNumeroPtBR, parsePercentual } from "@shared/validation";
import { inputClass } from "./propertyFormRules";
import type { PropertyFormValues } from "./propertyFormValues";

export function PropertyValuesFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (next: Partial<PropertyFormValues>) => void;
}) {
  const set = (patch: Partial<PropertyFormValues>) => onChange(patch);
  const market = parseNumeroPtBR(values.marketValue);
  const venal = parseNumeroPtBR(values.venalValue);
  const venalDiverges =
    market !== null && venal !== null && market > 0 &&
    Math.abs(venal - market) / market > 0.3;
  const itbi = parsePercentual(values.itbiRate);
  const itbiAtypical = itbi !== null && itbi > 0 && (itbi < 1 || itbi > 6);

  return (
    <>
      <Input
        type="date"
        className={inputClass}
        value={values.acquisitionDate}
        onChange={e => set({ acquisitionDate: e.target.value })}
        placeholder="Data de aquisição"
      />
      <Input
        className={inputClass}
        inputMode="decimal"
        value={values.declaredValue}
        onChange={e => set({ declaredValue: e.target.value })}
        placeholder="Valor IRPF / Balanço (R$)"
      />
      <Input
        className={inputClass}
        inputMode="decimal"
        value={values.marketValue}
        onChange={e => set({ marketValue: e.target.value })}
        placeholder="Valor estimado de mercado (R$)"
      />
      <Input
        className={inputClass}
        inputMode="decimal"
        value={values.venalValue}
        onChange={e => set({ venalValue: e.target.value })}
        placeholder="Valor venal (R$)"
      />
      {venalDiverges ? (
        <p className="col-span-full flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle className="size-3.5" /> Valor venal diverge bastante do
          mercado — confira os valores.
        </p>
      ) : null}
      <Input
        className={inputClass}
        inputMode="decimal"
        value={values.irGcapValue}
        onChange={e => set({ irGcapValue: e.target.value })}
        placeholder="Valor de IR sobre GCAP (R$)"
      />
      <Input
        className={inputClass}
        inputMode="decimal"
        value={values.emolumentsValue}
        onChange={e => set({ emolumentsValue: e.target.value })}
        placeholder="Emolumentos (R$)"
      />
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <Input
          className={inputClass}
          inputMode="decimal"
          value={values.itbiRate}
          onChange={e => set({ itbiRate: e.target.value })}
          placeholder="ITBI (%)"
        />
        <label className="flex items-center gap-2 text-xs text-lucathi-navy">
          <input
            type="checkbox"
            checked={values.hasLaudemio}
            onChange={() => set({ hasLaudemio: !values.hasLaudemio })}
            className="size-4 rounded border-gray-300"
          />
          Laudêmio/Aforamento
        </label>
      </div>
      {itbiAtypical ? (
        <p className="col-span-full flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle className="size-3.5" /> Alíquota de ITBI atípica —
          confira o valor informado.
        </p>
      ) : null}
      {values.hasLaudemio ? (
        <Input
          className={inputClass}
          inputMode="decimal"
          value={values.laudemioRate}
          onChange={e => set({ laudemioRate: e.target.value })}
          placeholder="Alíquota de laudêmio (%) — obrigatória"
        />
      ) : null}
    </>
  );
}
