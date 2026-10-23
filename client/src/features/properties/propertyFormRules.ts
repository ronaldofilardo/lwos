import {
  parseNumeroPtBR,
  parsePercentual,
  type Uf,
} from "@shared/validation";
import {
  propertyUtilityValues,
  type EncumbranceType,
} from "./types";
import type { PropertyFormValues } from "./propertyFormValues";

export const inputClass = "h-9 text-xs";
export const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-xs";

export function buildPropertyPayload(
  values: PropertyFormValues,
  familyId: string
) {
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
    cep: values.cep.replace(/\D/g, "").slice(0, 8) || undefined,
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

export function validatePropertyValues(
  values: PropertyFormValues
): string | null {
  if (values.description.trim().length < 3)
    return "Descrição mínima de 3 caracteres.";
  if (values.propertyCity.trim().length < 2)
    return "Informe a cidade do imóvel.";
  if (!values.hasRegistration) {
    if (values.noRegistrationReason.trim().length < 3) {
      return "Sem matrícula: informe o documento alternativo e a justificativa.";
    }
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
