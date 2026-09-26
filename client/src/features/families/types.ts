export type CivilStatus =
  | "SOLTEIRO"
  | "DIVORCIADO"
  | "VIUVO"
  | "CASADO"
  | "UNIAO_ESTAVEL";
export type MaritalRegime = "CPB" | "CUB" | "STB" | "STOB" | "NA";
export type Vinculo = "TITULAR" | "CONJUGE" | "FILHO" | "NETO" | "BISNETO";

export type FamilyFormData = {
  name: string;
  civilStatus: CivilStatus;
  maritalRegime: MaritalRegime;
  notes: string;
};

export const civilStatusLabels: Record<CivilStatus, string> = {
  SOLTEIRO: "Solteiro",
  DIVORCIADO: "Divorciado",
  VIUVO: "Viúvo",
  CASADO: "Casado",
  UNIAO_ESTAVEL: "União estável",
};

export const maritalRegimeLabels: Record<MaritalRegime, string> = {
  CPB: "CPB — Comunhão parcial de bens",
  CUB: "CUB — Comunhão universal de bens",
  STB: "STB — Separação total de bens",
  STOB: "STOB — Separação total obrigatória de bens",
  NA: "N/A — Não aplicável",
};

export const vinculoLabels: Record<Vinculo, string> = {
  TITULAR: "Titular",
  CONJUGE: "Cônjuge",
  FILHO: "Filho(a)",
  NETO: "Neto(a)",
  BISNETO: "Bisneto(a)",
};

export const parentVinculoOptions: Record<
  Extract<Vinculo, "NETO" | "BISNETO">,
  Extract<Vinculo, "FILHO" | "NETO">
> = {
  NETO: "FILHO",
  BISNETO: "NETO",
};

export function isMarriedStatus(status: CivilStatus): boolean {
  return status === "CASADO" || status === "UNIAO_ESTAVEL";
}
