export type CertidaoScope = "PESSOA" | "SOCIEDADE";

// Espelhos dos enums de drizzle/schema.ts (o client não importa valores do
// schema — só tipos via @shared/types — e o servidor valida com zod).
export const certidaoTypeValues = [
  "CND_FEDERAL",
  "CND_ESTADUAL",
  "CND_MUNICIPAL",
  "CERTIDAO_TJ",
  "CERTIDAO_TRF",
  "CNAT",
  "CNDT",
  "CERTIDAO_PROTESTOS",
] as const;

export const certidaoStatusValues = [
  "PENDENTE",
  "NEGATIVA",
  "POSITIVA_COM_EFEITOS_DE_NEGATIVA",
  "SOMENTE_FISICA",
  "POSITIVA",
] as const;

export type CertidaoType = (typeof certidaoTypeValues)[number];
export type CertidaoStatus = (typeof certidaoStatusValues)[number];

export const certidaoTypeLabels: Record<CertidaoType, string> = {
  CND_FEDERAL: "CND Federal",
  CND_ESTADUAL: "CND Estadual",
  CND_MUNICIPAL: "CND Municipal",
  CERTIDAO_TJ: "Certidão TJ",
  CERTIDAO_TRF: "Certidão TRF",
  CNAT: "CNAT",
  CNDT: "CNDT",
  CERTIDAO_PROTESTOS: "Certidão de Protestos",
};

export const certidaoStatusLabels: Record<CertidaoStatus, string> = {
  PENDENTE: "Pendente",
  NEGATIVA: "Negativa",
  POSITIVA_COM_EFEITOS_DE_NEGATIVA: "Positiva com efeitos de negativa",
  SOMENTE_FISICA: "Somente física (presencial)",
  POSITIVA: "Positiva",
};

export const certidaoStatusStyles: Record<CertidaoStatus, string> = {
  PENDENTE: "bg-amber-50 text-amber-800 border-amber-200",
  NEGATIVA: "bg-emerald-50 text-emerald-800 border-emerald-200",
  POSITIVA_COM_EFEITOS_DE_NEGATIVA:
    "bg-sky-50 text-sky-800 border-sky-200",
  SOMENTE_FISICA: "bg-purple-50 text-purple-800 border-purple-200",
  POSITIVA: "bg-orange-50 text-orange-800 border-orange-200",
};

export const certidaoScopeLabels: Record<CertidaoScope, string> = {
  PESSOA: "Membros da família",
  SOCIEDADE: "Holdings",
};
