/**
 * Textos dos formulários de imóvel e de titularidade.
 * `label` é o nome do campo (sempre visível); `placeholder` é só um EXEMPLO
 * de preenchimento ("Ex.: …", "dd/mm/aaaa") ou "Selecione" nos selects.
 */
export const SELECT_PLACEHOLDER = "Selecione";

export type FieldCopy = { label: string; placeholder: string };

export const propertyFieldCopy = {
  description: {
    label: "Descrição do imóvel",
    placeholder: "Ex.: Apartamento Jardins, Rua Augusta 100",
  },
  cep: { label: "CEP", placeholder: "Ex.: 01310100" },
  uf: { label: "Estado", placeholder: SELECT_PLACEHOLDER },
  city: { label: "Cidade", placeholder: "Ex.: São Paulo" },
  kind: {
    label: "Imóvel urbano ou rural",
    placeholder: SELECT_PLACEHOLDER,
  },
  inscricaoImobiliaria: {
    label: "Inscrição imobiliária",
    placeholder: "Ex.: 123.456.0789-0",
  },
  ccir: { label: "CCIR", placeholder: "Ex.: 950.123.456.789-0" },
  nirf: { label: "NIRF", placeholder: "Ex.: 1.234.567-8" },
  alternativeDocType: {
    label: "Documento alternativo",
    placeholder: SELECT_PLACEHOLDER,
  },
  noRegistrationReason: {
    label: "Observação",
    placeholder: "Ex.: Imóvel em regularização",
  },
  registrationNumber: {
    label: "Número da matrícula",
    placeholder: "Ex.: 123456",
  },
  registryUf: { label: "UF do Cartório", placeholder: SELECT_PLACEHOLDER },
  registryCity: { label: "Cidade do Cartório", placeholder: "Ex.: São Paulo" },
  registryOfficeNumber: {
    label: "Número do cartório",
    placeholder: "Selecione (1 a 55)",
  },
  acquisitionDate: { label: "Data da aquisição", placeholder: "dd/mm/aaaa" },
  declaredValue: {
    label: "Valor do IRPF/Balanço",
    placeholder: "Ex.: 1.000.000,00",
  },
  marketValue: { label: "Valor de mercado", placeholder: "Ex.: 1.500.000,00" },
  venalValue: { label: "Valor venal", placeholder: "Ex.: 1.200.000,00" },
  irGcapValue: { label: "IR sobre GCAP", placeholder: "Ex.: 0,00" },
  emolumentsValue: { label: "Emolumentos", placeholder: "Ex.: 0,00" },
  itbiRate: { label: "Alíquota ITBI", placeholder: "Ex.: 3%" },
  laudemioRate: { label: "Alíquota Laudêmio", placeholder: "Ex.: 2,5%" },
  utility: { label: "Utilidade", placeholder: SELECT_PLACEHOLDER },
  rentValue: {
    label: "Valor aluguel/arrendamento",
    placeholder: "Ex.: 5.000,00",
  },
  encumbranceType: {
    label: "Gravames/Restrições",
    placeholder: SELECT_PLACEHOLDER,
  },
  encumbranceNote: {
    label: "Observação do gravame",
    placeholder: "Ex.: Hipoteca em favor do Banco X",
  },
  notes: {
    label: "Observação",
    placeholder: "Ex.: Informações adicionais",
  },
} as const satisfies Record<string, FieldCopy>;

export const propertyOwnerFieldCopy = {
  ownerKind: { label: "Tipo de titular", placeholder: SELECT_PLACEHOLDER },
  person: { label: "Membro da família", placeholder: SELECT_PLACEHOLDER },
  company: { label: "Sociedade", placeholder: SELECT_PLACEHOLDER },
  percentage: { label: "Percentual (%)", placeholder: "Ex.: 50" },
  rightType: { label: "Direito", placeholder: SELECT_PLACEHOLDER },
} as const satisfies Record<string, FieldCopy>;

/** Placeholder válido = exemplo ("Ex.: …"), formato de data ou "Selecione…". */
export function isExamplePlaceholder(placeholder: string): boolean {
  return (
    placeholder.startsWith("Ex.:") ||
    placeholder.startsWith(SELECT_PLACEHOLDER) ||
    placeholder === "dd/mm/aaaa"
  );
}
