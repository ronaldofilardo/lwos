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

/** Valores que não devem acionar o alerta visual de gravame. */
export const inactiveEncumbranceValues: readonly EncumbranceType[] = [
  "PENDENTE",
  "NA",
  "NAO_HA",
];
