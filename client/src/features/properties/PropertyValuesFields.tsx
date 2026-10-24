import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LabeledField } from "@/components/LabeledField";
import { parseNumeroPtBR, parsePercentual } from "@shared/validation";
import { inputClass } from "./propertyFormRules";
import { propertyFieldCopy as copy } from "./propertyFieldCopy";
import type { PropertyFormValues } from "./propertyFormValues";

type MoneyKey =
  | "declaredValue"
  | "marketValue"
  | "venalValue"
  | "irGcapValue"
  | "emolumentsValue";

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
    market !== null &&
    venal !== null &&
    market > 0 &&
    Math.abs(venal - market) / market > 0.3;
  const itbi = parsePercentual(values.itbiRate);
  const itbiAtypical = itbi !== null && itbi > 0 && (itbi < 1 || itbi > 6);

  const moneyField = (key: MoneyKey) => (
    <LabeledField label={copy[key].label}>
      {id => (
        <Input
          id={id}
          className={inputClass}
          inputMode="decimal"
          value={values[key]}
          onChange={e =>
            set({ [key]: e.target.value } as Partial<PropertyFormValues>)
          }
          placeholder={copy[key].placeholder}
        />
      )}
    </LabeledField>
  );

  return (
    <>
      <LabeledField label={copy.acquisitionDate.label}>
        {id => (
          <Input
            id={id}
            type="date"
            className={inputClass}
            value={values.acquisitionDate}
            onChange={e => set({ acquisitionDate: e.target.value })}
            placeholder={copy.acquisitionDate.placeholder}
          />
        )}
      </LabeledField>
      {moneyField("declaredValue")}
      {moneyField("marketValue")}
      {moneyField("venalValue")}
      {venalDiverges ? (
        <p className="col-span-full flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle className="size-3.5" /> Valor venal diverge bastante do
          mercado — confira os valores.
        </p>
      ) : null}
      {moneyField("irGcapValue")}
      {moneyField("emolumentsValue")}
      <div className="grid grid-cols-[1fr_1fr] items-end gap-2">
        <LabeledField label={copy.itbiRate.label}>
          {id => (
            <Input
              id={id}
              className={inputClass}
              inputMode="decimal"
              value={values.itbiRate}
              onChange={e => set({ itbiRate: e.target.value })}
              placeholder={copy.itbiRate.placeholder}
            />
          )}
        </LabeledField>
        <label className="flex h-9 items-center gap-2 text-xs text-lucathi-navy">
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
        <LabeledField label={copy.laudemioRate.label}>
          {id => (
            <Input
              id={id}
              className={inputClass}
              inputMode="decimal"
              value={values.laudemioRate}
              onChange={e => set({ laudemioRate: e.target.value })}
              placeholder={copy.laudemioRate.placeholder}
            />
          )}
        </LabeledField>
      ) : null}
    </>
  );
}
