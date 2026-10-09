export const encumbranceTypeValues = [
  "PENDENTE",
  "ALIENACAO_FIDUCIARIA",
  "ARROLAMENTO",
  "HIPOTECA",
  "INCOMUNICABILIDADE_INALIENABILIDADE_IMPENHORABILIDADE",
  "NA",
  "NAO_HA",
  "OUTROS",
  "PENHORA",
  "SERVIDAO_PASSAGEM",
  "USUFRUTO",
] as const;

export type EncumbranceType = (typeof encumbranceTypeValues)[number];

export const encumbranceTypeLabels: Record<EncumbranceType, string> = {
  PENDENTE: "Pendente de verificação",
  ALIENACAO_FIDUCIARIA: "Alienação fiduciária",
  ARROLAMENTO: "Arrolamento",
  HIPOTECA: "Hipoteca",
  INCOMUNICABILIDADE_INALIENABILIDADE_IMPENHORABILIDADE:
    "Incomunicabilidade / Inalienabilidade / Impenhorabilidade",
  NA: "N/A",
  NAO_HA: "Não há",
  OUTROS: "Outro",
  PENHORA: "Penhora",
  SERVIDAO_PASSAGEM: "Servidão de passagem",
  USUFRUTO: "Usufruto",
};

/** Semáforo amarelo: Pendente e N/A — só alerta, não trava. */
export const yellowEncumbranceValues: readonly EncumbranceType[] = [
  "PENDENTE",
  "NA",
];

/** Semáforo verde: apenas «Não há». */
export const greenEncumbranceValues: readonly EncumbranceType[] = ["NAO_HA"];

export type EncumbranceSeverity = "verde" | "amarelo" | "vermelho";

/** Regra do semáforo: Não há = verde; Pendente/N/A = amarelo; resto = vermelho. */
export function encumbranceSeverity(
  value: string | null | undefined
): EncumbranceSeverity | null {
  if (!value) return null;
  if (greenEncumbranceValues.includes(value as EncumbranceType)) return "verde";
  if (yellowEncumbranceValues.includes(value as EncumbranceType))
    return "amarelo";
  return "vermelho";
}

/** Vermelho trava a movimentação (vínculo com sociedade, conclusão). */
export function isEncumbranceRed(value: string | null | undefined): boolean {
  return encumbranceSeverity(value) === "vermelho";
}

export const propertyKindLabels = {
  URBANO: "Urbano",
  RURAL: "Rural",
} as const;

export const propertyUtilityValues = [
  "ATIVIDADE_INDUSTRIAL_COMERCIAL",
  "ATIVIDADE_RURAL",
  "INVESTIMENTO",
  "LAZER",
  "LOCACAO_ARRENDAMENTO",
  "OUTRA",
  "PENDENTE",
  "RESIDENCIAL",
] as const;

export const propertyUtilityLabels: Record<(typeof propertyUtilityValues)[number], string> = {
  ATIVIDADE_INDUSTRIAL_COMERCIAL: "Atividade industrial/comercial",
  ATIVIDADE_RURAL: "Atividade rural",
  INVESTIMENTO: "Investimento",
  LAZER: "Lazer",
  LOCACAO_ARRENDAMENTO: "Locação / Arrendamento",
  OUTRA: "Outra",
  PENDENTE: "Pendente",
  RESIDENCIAL: "Residencial",
};
