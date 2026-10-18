export type PropertyFormValues = {
  id?: string;
  description: string;
  kind: "URBANO" | "RURAL" | "";
  cep: string;
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
  cep: "",
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

export function toPropertyFormValues(
  property: Record<string, unknown>
): PropertyFormValues {
  const str = (value: unknown) =>
    value === null || value === undefined ? "" : String(value);
  const num = (value: unknown) =>
    value === null || value === undefined || value === ""
      ? ""
      : Number(value).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  return {
    id: str(property.id) || undefined,
    description: str(property.description),
    kind: (str(property.kind) as PropertyFormValues["kind"]) || "",
    cep: str(property.cep),
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
