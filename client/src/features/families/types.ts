export type CivilStatus =
  | "SOLTEIRO"
  | "DIVORCIADO"
  | "VIUVO"
  | "CASADO"
  | "UNIAO_ESTAVEL";
export type MaritalRegime = "CPB" | "CUB" | "STB" | "STOB" | "NA";
export type Vinculo = "TITULAR" | "CONJUGE" | "FILHO" | "NETO" | "BISNETO";

export type ProjectObjective =
  | "PROTECAO_PATRIMONIAL"
  | "PLANEJAMENTO_SUCESSORIO"
  | "GOVERNANCA_FAMILIAR_OU_SOCIETARIA"
  | "PREVENCAO_DE_CONFLITOS_ENTRE_HERDEIROS"
  | "FORMALIZACAO_DE_RELACIONAMENTOS"
  | "SEGURO_DE_VIDA"
  | "SEGURO_SAUDE"
  | "EFICIENCIA_FISCAL"
  | "REESTRUTURACAO_SOCIETARIA"
  | "DIVERSIFICACAO_DE_JURISDICAO_E_MOEDA"
  | "FUNDOS_DE_INVESTIMENTOS"
  | "SAIDA_DEFINITIVA_DO_BRASIL"
  | "REPERFILAMENTO_DE_DIVIDA"
  | "FILANTROPIA";

export type ProjectStatus = "ATIVO" | "SUSPENSO" | "CONCLUIDO" | "CANCELADO";

export type FamilyFormData = {
  name: string;
  notes: string;
  objectives: ProjectObjective[];
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

export const projectObjectiveOrder: ProjectObjective[] = [
  "PROTECAO_PATRIMONIAL",
  "PLANEJAMENTO_SUCESSORIO",
  "GOVERNANCA_FAMILIAR_OU_SOCIETARIA",
  "PREVENCAO_DE_CONFLITOS_ENTRE_HERDEIROS",
  "FORMALIZACAO_DE_RELACIONAMENTOS",
  "SEGURO_DE_VIDA",
  "SEGURO_SAUDE",
  "EFICIENCIA_FISCAL",
  "REESTRUTURACAO_SOCIETARIA",
  "DIVERSIFICACAO_DE_JURISDICAO_E_MOEDA",
  "FUNDOS_DE_INVESTIMENTOS",
  "SAIDA_DEFINITIVA_DO_BRASIL",
  "REPERFILAMENTO_DE_DIVIDA",
  "FILANTROPIA",
];

export const projectObjectiveLabels: Record<ProjectObjective, string> = {
  PROTECAO_PATRIMONIAL: "Proteção patrimonial",
  PLANEJAMENTO_SUCESSORIO: "Planejamento sucessório",
  GOVERNANCA_FAMILIAR_OU_SOCIETARIA: "Governança familiar ou societária",
  PREVENCAO_DE_CONFLITOS_ENTRE_HERDEIROS: "Prevenção de conflitos entre herdeiros",
  FORMALIZACAO_DE_RELACIONAMENTOS: "Formalização de relacionamentos",
  SEGURO_DE_VIDA: "Seguro de vida",
  SEGURO_SAUDE: "Seguro saúde",
  EFICIENCIA_FISCAL: "Eficiência fiscal",
  REESTRUTURACAO_SOCIETARIA: "Reestruturação societária",
  DIVERSIFICACAO_DE_JURISDICAO_E_MOEDA: "Diversificação de jurisdição e moeda",
  FUNDOS_DE_INVESTIMENTOS: "Fundos de investimentos",
  SAIDA_DEFINITIVA_DO_BRASIL: "Saída definitiva do Brasil",
  REPERFILAMENTO_DE_DIVIDA: "Reperfilamento de dívida",
  FILANTROPIA: "Filantropia",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  ATIVO: "Ativo",
  SUSPENSO: "Suspenso",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
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
