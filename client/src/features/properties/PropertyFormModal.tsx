import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UFS, parseNumeroPtBR, parsePercentual, type Uf } from "@shared/validation";
import {
  encumbranceTypeLabels,
  encumbranceTypeValues,
  propertyUtilityLabels,
  propertyUtilityValues,
  type EncumbranceType,
} from "./types";

export type PropertyFormValues = {
  id?: string;
  description: string;
  kind: "URBANO" | "RURAL" | "";
  uf: string;
  hasRegistration: boolean;
  registrationNumber: string;
  alternativeDocType: "ESCRITURA_PUBLICA" | "CONTRATO_COMPRA_VENDA";
  noRegistrationReason: string;
  registryOfficeNumber: string;
  registryUf: string;
  registryCity: string;
  propertyCity: string;
  inscricaoImobiliaria: string;
  ccir: string;
  nirf: string;
  notes: string;
  acquisitionDate: string;
  declaredValue: string;
  marketValue: string;
  venalValue: string;
  irGcapValue: string;
  emolumentsValue: string;
  itbiRate: string;
  hasLaudemio: boolean;
  laudemioRate: string;
  utility: string;
  rentValue: string;
  encumbranceType: string;
  encumbranceNote: string;
};

export const emptyPropertyValues: PropertyFormValues = {
  description: "",
  kind: "",
  uf: "",
  hasRegistration: true,
  registrationNumber: "",
  alternativeDocType: "ESCRITURA_PUBLICA",
  noRegistrationReason: "",
  registryOfficeNumber: "",
  registryUf: "",
  registryCity: "",
  propertyCity: "",
  inscricaoImobiliaria: "",
  ccir: "",
  nirf: "",
  notes: "",
  acquisitionDate: "",
  declaredValue: "",
  marketValue: "",
  venalValue: "",
  irGcapValue: "",
  emolumentsValue: "",
  itbiRate: "",
  hasLaudemio: false,
  laudemioRate: "",
  utility: "PENDENTE",
  rentValue: "",
  encumbranceType: "PENDENTE",
  encumbranceNote: "",
};

export function toPropertyFormValues(property: Record<string, unknown>): PropertyFormValues {
  const str = (value: unknown) =>
    value === null || value === undefined ? "" : String(value);
  const num = (value: unknown) =>
    value === null || value === undefined || value === ""
      ? ""
      : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    id: str(property.id) || undefined,
    description: str(property.description),
    kind: (str(property.kind) as PropertyFormValues["kind"]) || "",
    uf: str(property.uf),
    hasRegistration: property.hasRegistration !== false,
    registrationNumber: str(property.registrationNumber),
    alternativeDocType:
      (str(property.alternativeDocType) as PropertyFormValues["alternativeDocType"]) ||
      "ESCRITURA_PUBLICA",
    noRegistrationReason: str(property.noRegistrationReason),
    registryOfficeNumber: str(property.registryOfficeNumber),
    registryUf: str(property.registryUf),
    registryCity: str(property.registryCity),
    propertyCity: str(property.propertyCity),
    inscricaoImobiliaria: str(property.inscricaoImobiliaria),
    ccir: str(property.ccir),
    nirf: str(property.nirf),
    notes: str(property.notes),
    acquisitionDate: str(property.acquisitionDate),
    declaredValue: num(property.irpfBalanceValue),
    marketValue: num(property.marketValue),
    venalValue: num(property.venalValue),
    irGcapValue: num(property.irGcapValue),
    emolumentsValue: num(property.emolumentsValue),
    itbiRate: num(property.itbiRate),
    hasLaudemio: Boolean(property.hasLaudemio),
    laudemioRate: num(property.laudemioRate),
    utility: str(property.utility) || "PENDENTE",
    rentValue: num(property.rentValue),
    encumbranceType: str(property.encumbranceType) || "PENDENTE",
    encumbranceNote: str(property.encumbranceNote),
  };
}

const inputClass = "h-9 text-xs";
const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2 text-xs";

export function buildPropertyPayload(values: PropertyFormValues, familyId: string) {
  const money = (value: string) => {
    const parsed = parseNumeroPtBR(value);
    return parsed === null ? undefined : parsed;
  };
  const percent = (value: string) => {
    const parsed = parsePercentual(value);
    return parsed === null ? undefined : parsed;
  };
  return {
    familyId,
    description: values.description.trim(),
    kind: values.kind || undefined,
    uf: (values.uf || undefined) as Uf | undefined,
    hasRegistration: values.hasRegistration,
    registrationNumber: values.hasRegistration
      ? values.registrationNumber.trim() || undefined
      : undefined,
    alternativeDocType: !values.hasRegistration
      ? values.alternativeDocType
      : undefined,
    noRegistrationReason: !values.hasRegistration
      ? values.noRegistrationReason.trim() || undefined
      : undefined,
    registryOfficeNumber: values.registryOfficeNumber
      ? Number(values.registryOfficeNumber)
      : undefined,
    registryUf: (values.registryUf || undefined) as Uf | undefined,
    registryCity: values.registryCity.trim() || undefined,
    propertyCity: values.propertyCity.trim(),
    inscricaoImobiliaria:
      values.kind === "URBANO"
        ? values.inscricaoImobiliaria.trim() || undefined
        : undefined,
    ccir: values.kind === "RURAL" ? values.ccir.trim() || undefined : undefined,
    nirf: values.kind === "RURAL" ? values.nirf.trim() || undefined : undefined,
    notes: values.notes.trim() || undefined,
    acquisitionDate: values.acquisitionDate || undefined,
    declaredValue: money(values.declaredValue),
    marketValue: money(values.marketValue),
    venalValue: money(values.venalValue),
    irGcapValue: money(values.irGcapValue),
    emolumentsValue: money(values.emolumentsValue),
    itbiRate: percent(values.itbiRate),
    hasLaudemio: values.hasLaudemio,
    laudemioRate: values.hasLaudemio ? percent(values.laudemioRate) : undefined,
    utility: values.utility as (typeof propertyUtilityValues)[number],
    rentValue:
      values.utility === "LOCACAO_ARRENDAMENTO"
        ? money(values.rentValue)
        : undefined,
    encumbranceType: values.encumbranceType as EncumbranceType,
    encumbranceNote: values.encumbranceNote.trim() || undefined,
  };
}

export function validatePropertyValues(values: PropertyFormValues): string | null {
  if (values.description.trim().length < 3) return "Descrição mínima de 3 caracteres.";
  if (values.propertyCity.trim().length < 2) return "Informe a cidade do imóvel.";
  if (!values.hasRegistration) {
    if (values.noRegistrationReason.trim().length < 3) {
      return "Sem matrícula: informe o documento alternativo e a justificativa.";
    }
  }
  if (values.kind === "RURAL" && (!values.ccir.trim() || !values.nirf.trim())) {
    return "Imóvel rural exige CCIR e NIRF.";
  }
  if (values.registryOfficeNumber) {
    const office = Number(values.registryOfficeNumber);
    if (!Number.isInteger(office) || office < 1 || office > 55) {
      return "Número do cartório deve ser inteiro entre 1 e 55.";
    }
  }
  for (const [label, raw] of [
    ["Valor IRPF/Balanço", values.declaredValue],
    ["Valor de mercado", values.marketValue],
    ["Valor venal", values.venalValue],
    ["IR sobre GCAP", values.irGcapValue],
    ["Emolumentos", values.emolumentsValue],
    ["Valor de locação", values.rentValue],
  ] as const) {
    if (raw.trim()) {
      const parsed = parseNumeroPtBR(raw);
      if (parsed === null || parsed < 0) return `${label} inválido.`;
    }
  }
  if (values.itbiRate.trim()) {
    const parsed = parsePercentual(values.itbiRate);
    if (parsed === null) return "ITBI deve estar entre 0 e 100.";
  }
  if (values.hasLaudemio) {
    const parsed = parsePercentual(values.laudemioRate);
    if (parsed === null || parsed <= 0) {
      return "Laudêmio confirmado exige alíquota maior que zero.";
    }
  }
  if (
    values.utility === "LOCACAO_ARRENDAMENTO" &&
    (!values.rentValue.trim() || (parseNumeroPtBR(values.rentValue) ?? 0) <= 0)
  ) {
    return "Locação/Arrendamento exige valor de locação maior que zero.";
  }
  return null;
}

export function PropertyFormFields({
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
    <div className="grid gap-2 md:grid-cols-2">
      <Input
        className={inputClass}
        value={values.description}
        onChange={e => set({ description: e.target.value })}
        placeholder="Descrição do imóvel (ex: Fazenda Boa Vista, Apto 101 Jardins...)"
      />
      <div className="grid grid-cols-[90px_1fr] gap-2">
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

      {values.kind === "URBANO" ? (
        <Input
          className={inputClass}
          value={values.inscricaoImobiliaria}
          onChange={e => set({ inscricaoImobiliaria: e.target.value })}
          placeholder="Inscrição imobiliária (obrigatória para urbano)"
        />
      ) : values.kind === "RURAL" ? (
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
            <Input
              className={inputClass}
              inputMode="numeric"
              value={values.registryOfficeNumber}
              onChange={e =>
                set({ registryOfficeNumber: e.target.value.replace(/\D/g, "") })
              }
              placeholder="Nº cartório (1–55)"
            />
          </div>
        )}
      </div>

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

      <select
        value={values.encumbranceType}
        onChange={e => set({ encumbranceType: e.target.value })}
        className={selectClass}
        aria-label="Gravame do imóvel"
      >
        {encumbranceTypeValues.map(value => (
          <option key={value} value={value}>
            {encumbranceTypeLabels[value]}
          </option>
        ))}
      </select>
      <Input
        className={inputClass}
        value={values.encumbranceNote}
        onChange={e => set({ encumbranceNote: e.target.value })}
        placeholder="Observação do gravame (opcional)"
      />

      <textarea
        className="col-span-full min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        value={values.notes}
        onChange={e => set({ notes: e.target.value })}
        placeholder="Observação"
      />
    </div>
  );
}

export function PropertyFormModal({
  title,
  initial,
  familyId,
  submitLabel,
  onSubmit,
  onClose,
  isPending,
}: {
  title: string;
  initial?: PropertyFormValues;
  familyId: string;
  submitLabel: string;
  onSubmit: (payload: ReturnType<typeof buildPropertyPayload>) => void;
  onClose: () => void;
  isPending?: boolean;
}) {
  const [values, setValues] = useState<PropertyFormValues>(
    initial ?? emptyPropertyValues
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const validation = validatePropertyValues(values);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    onSubmit(buildPropertyPayload(values, familyId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-lucathi-line bg-white p-6 shadow-xl">
        <h3 className="font-display text-xl text-lucathi-navy">{title}</h3>
        <div className="mt-3">
          <PropertyFormFields
            values={values}
            onChange={patch => setValues(prev => ({ ...prev, ...patch }))}
          />
        </div>
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
