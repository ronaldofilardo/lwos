export type ProcessStageStatus =
  | "CONCLUIDO"
  | "EM_ANDAMENTO"
  | "PENDENTE"
  | "BLOQUEADO";

export type ProcessStage = {
  id: string;
  title: string;
  description: string;
  status: ProcessStageStatus;
  detail: string | null;
  progress: { current: number; total: number } | null;
  at: string | null;
};

export type ProcessTimelineInput = {
  family: {
    id: string;
    createdAt: string | Date;
  };
  lead: {
    id: string;
    status: "PENDENTE" | "ACEITO" | "RECUSADO";
    createdAt: string | Date;
    reviewedAt?: string | Date | null;
  } | null;
  people: {
    total: number;
    hasTitular: boolean;
  };
  patrimony: {
    properties: number;
    companies: number;
    assets: number;
  };
  documents: {
    total: number;
    resolved: number;
  };
  lwr: {
    versions: number;
  };
  proposal: {
    id: string;
    status: string;
    createdAt: string | Date;
    acceptedAt?: string | Date | null;
  } | null;
  access: {
    hasClientAccess: boolean;
    activePortalLinks: number;
  };
};

export type ProcessTimeline = {
  stages: ProcessStage[];
  currentStageId: string;
  overallPercent: number;
};

const iso = (value: string | Date | null | undefined): string | null =>
  value ? new Date(value).toISOString() : null;

function stage(
  partial: Omit<ProcessStage, "progress" | "at" | "detail"> & {
    detail?: string | null;
    progress?: { current: number; total: number } | null;
    at?: string | Date | null;
  }
): ProcessStage {
  return {
    ...partial,
    detail: partial.detail ?? null,
    progress: partial.progress ?? null,
    at: iso(partial.at),
  };
}

function docDetail(documents: ProcessTimelineInput["documents"]): string {
  if (!documents.total) return "Nenhum requisito documental aberto.";
  return `${documents.resolved}/${documents.total} requisitos resolvidos (validados ou dispensados).`;
}

function patrimonyDetail(patrimony: ProcessTimelineInput["patrimony"]): string {
  const parts: string[] = [];
  if (patrimony.properties) parts.push(`${patrimony.properties} imóvel(is)`);
  if (patrimony.companies) parts.push(`${patrimony.companies} sociedade(s)`);
  if (patrimony.assets) parts.push(`${patrimony.assets} ativo(s)`);
  if (!parts.length) return "Nenhum bem mapeado ainda.";
  return parts.join(" · ");
}

function proposalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    RASCUNHO: "Rascunho",
    ENVIADA: "Enviada",
    ACEITA: "Aceita",
    CONTRAPROPOSTA_RECEBIDA: "Contraproposta recebida",
    RECUSADA: "Recusada",
  };
  return labels[status] ?? status;
}

export function buildProcessTimeline(
  input: ProcessTimelineInput
): ProcessTimeline {
  const stages: ProcessStage[] = [];

  // 1) Interesse → aceite do lead
  if (input.lead) {
    const accepted = input.lead.status === "ACEITO";
    const rejected = input.lead.status === "RECUSADO";
    stages.push(
      stage({
        id: "interesse",
        title: "Interesse & triagem",
        description: "Cadastro público do interessado e análise do sócio.",
        status: accepted
          ? "CONCLUIDO"
          : rejected
            ? "BLOQUEADO"
            : "EM_ANDAMENTO",
        detail: accepted
          ? "Lead aceito — caso familiar gerado."
          : rejected
            ? "Lead recusado."
            : "Aguardando análise do sócio.",
        at: accepted
          ? (input.lead.reviewedAt ?? input.lead.createdAt)
          : input.lead.createdAt,
      })
    );
  } else {
    stages.push(
      stage({
        id: "interesse",
        title: "Interesse & triagem",
        description: "Cadastro público do interessado e análise do sócio.",
        status: "CONCLUIDO",
        detail: "Caso aberto sem lead público (criação direta pela equipe).",
        at: input.family.createdAt,
      })
    );
  }

  // 2) Abertura do caso
  stages.push(
    stage({
      id: "abertura",
      title: "Abertura do caso",
      description:
        "Família e projeto criados; situação conjugal e regime registrados.",
      status: "CONCLUIDO",
      detail: `Caso familiar ativo.`,
      at: input.family.createdAt,
    })
  );

  // 3) Núcleo familiar
  const peopleDone = input.people.hasTitular && input.people.total >= 1;
  stages.push(
    stage({
      id: "familia",
      title: "Núcleo familiar",
      description:
        "Titular definido e membros (cônjuge, filhos, netos) cadastrados.",
      status: peopleDone
        ? "CONCLUIDO"
        : input.people.total > 0
          ? "EM_ANDAMENTO"
          : "PENDENTE",
      detail: !input.people.total
        ? "Nenhuma pessoa vinculada."
        : input.people.hasTitular
          ? `${input.people.total} pessoa(s) · titular definido.`
          : `${input.people.total} pessoa(s) · defina o titular.`,
      progress: {
        current: input.people.hasTitular ? 1 : 0,
        total: 1,
      },
    })
  );

  // 4) Due diligence patrimonial
  const assetsMapped =
    input.patrimony.properties +
    input.patrimony.companies +
    input.patrimony.assets;
  stages.push(
    stage({
      id: "patrimonio",
      title: "Due diligence patrimonial",
      description:
        "Imóveis, holdings/sociedades e demais ativos sob mapeamento.",
      status: assetsMapped > 0 ? "EM_ANDAMENTO" : "PENDENTE",
      detail:
        assetsMapped > 0
          ? `${patrimonyDetail(input.patrimony)} — continue o mapeamento na aba Due Diligence.`
          : "Nenhum bem mapeado ainda.",
    })
  );

  // 5) Matriz documental (resumo — não repete a aba)
  const docsDone =
    input.documents.total > 0 &&
    input.documents.resolved >= input.documents.total;
  stages.push(
    stage({
      id: "documentos",
      title: "Matriz documental",
      description:
        "Coleta, análise e dispensas dos requisitos por membro, imóvel e sociedade.",
      status:
        input.documents.total === 0
          ? "PENDENTE"
          : docsDone
            ? "CONCLUIDO"
            : input.documents.resolved > 0
              ? "EM_ANDAMENTO"
              : "PENDENTE",
      detail: docDetail(input.documents),
      progress: {
        current: input.documents.resolved,
        total: input.documents.total,
      },
    })
  );

  // 6) LWR
  stages.push(
    stage({
      id: "lwr",
      title: "Lucathi Wealth Report",
      description:
        "Apresentação executiva (diagnóstico, fragilidades, estrutura proposta).",
      status: input.lwr.versions > 0 ? "CONCLUIDO" : "PENDENTE",
      detail:
        input.lwr.versions > 0
          ? `${input.lwr.versions} versão(ões) registrada(s).`
          : "Nenhuma versão do LWR registrada.",
    })
  );

  // 7) Proposta financeira
  if (input.proposal) {
    const status = input.proposal.status;
    const stageStatus: ProcessStageStatus =
      status === "ACEITA"
        ? "CONCLUIDO"
        : status === "RECUSADA"
          ? "BLOQUEADO"
          : status === "RASCUNHO"
            ? "PENDENTE"
            : "EM_ANDAMENTO";
    stages.push(
      stage({
        id: "proposta",
        title: "Proposta financeira",
        description: "Escopo, valor e eventual contraproposta da consultoria.",
        status: stageStatus,
        detail:
          status === "ACEITA"
            ? "Proposta aceita pelo cliente."
            : status === "RECUSADA"
              ? "Proposta recusada."
              : status === "CONTRAPROPOSTA_RECEBIDA"
                ? "Contraproposta aguardando decisão do sócio."
                : `Status: ${proposalStatusLabel(status)}.`,
        at:
          status === "ACEITA"
            ? (input.proposal.acceptedAt ?? input.proposal.createdAt)
            : input.proposal.createdAt,
      })
    );
  } else {
    stages.push(
      stage({
        id: "proposta",
        title: "Proposta financeira",
        description: "Escopo, valor e eventual contraproposta da consultoria.",
        status: "PENDENTE",
        detail: "Nenhuma proposta registrada.",
      })
    );
  }

  // 8) Portal & governança
  const accessDone = input.access.hasClientAccess;
  stages.push(
    stage({
      id: "portal",
      title: "Portal do cliente",
      description: "Acesso do titular ao portal seguro e trilha de governança.",
      status: accessDone
        ? "CONCLUIDO"
        : input.access.activePortalLinks > 0
          ? "EM_ANDAMENTO"
          : "PENDENTE",
      detail: accessDone
        ? "Conta de cliente ativa."
        : input.access.activePortalLinks > 0
          ? `${input.access.activePortalLinks} link(s) de portal ativo(s) — aguardando 1º acesso.`
          : "Nenhum acesso de cliente liberado.",
    })
  );

  const currentStage =
    stages.find(s => s.status !== "CONCLUIDO") ?? stages[stages.length - 1]!;

  const weight = (s: ProcessStage): number => {
    if (s.status === "CONCLUIDO") return 1;
    if (s.status === "EM_ANDAMENTO") return 0.5;
    if (s.status === "BLOQUEADO") return 0;
    if (s.progress && s.progress.total > 0) {
      return Math.min(1, s.progress.current / s.progress.total) * 0.75;
    }
    return 0;
  };

  const overallPercent =
    stages.length === 0
      ? 0
      : Math.round(
          (stages.reduce((sum, s) => sum + weight(s), 0) / stages.length) * 100
        );

  return {
    stages,
    currentStageId: currentStage.id,
    overallPercent,
  };
}
