export const encumbranceTypeValues = [
  "HIPOTECA",
  "ALIENACAO_FIDUCIARIA",
  "PENHOR",
  "USUFRUTO",
  "SERVIDAO",
  "SEQUESTRO",
  "OUTRO",
] as const;

export type EncumbranceType = (typeof encumbranceTypeValues)[number];

export const encumbranceTypeLabels: Record<EncumbranceType, string> = {
  HIPOTECA: "Hipoteca",
  ALIENACAO_FIDUCIARIA: "Alienação fiduciária",
  PENHOR: "Penhor",
  USUFRUTO: "Usufruto",
  SERVIDAO: "Servidão",
  SEQUESTRO: "Sequestro judicial",
  OUTRO: "Outro",
};
