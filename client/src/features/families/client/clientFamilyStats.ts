/**
 * Estatísticas do dashboard do titular (CLIENTE): agregações puras sobre
 * documentos da matriz e certidões, sem dependência de React/tRPC.
 */

type DocumentLike = {
  entityType: string;
  status: string;
};

type CertidaoLike = {
  status: string;
  validUntil: string | null;
};

export type ClientDocumentSummary = {
  total: number;
  resolved: number;
  actionRequired: number;
  inAnalysis: number;
};

export type CertidaoSummary = {
  total: number;
  expired: number;
  pending: number;
};

/** Status que exigem nova ação do titular (enviar/reenviar arquivo). */
const ACTION_REQUIRED_STATUSES = new Set(["PENDENTE", "REJEITADO", "VENCIDO"]);

/** Status que não dependem do titular (validado, dispensado ou não aplicável). */
const RESOLVED_STATUSES = new Set(["VALIDADO", "DISPENSADO", "NA"]);

/**
 * Resume a matriz documental da família. Certidões (entityType CERTIDAO) têm
 * fluxo/contagem próprios e ficam de fora deste resumo.
 */
export function summarizeClientDocuments(
  documents: DocumentLike[]
): ClientDocumentSummary {
  const matrix = documents.filter(doc => doc.entityType !== "CERTIDAO");
  let resolved = 0;
  let actionRequired = 0;
  let inAnalysis = 0;
  for (const doc of matrix) {
    if (ACTION_REQUIRED_STATUSES.has(doc.status)) actionRequired++;
    else if (RESOLVED_STATUSES.has(doc.status)) resolved++;
    else if (doc.status === "RECEBIDO_EM_ANALISE") inAnalysis++;
  }
  return {
    total: matrix.length,
    resolved,
    actionRequired,
    inAnalysis,
  };
}

function isExpired(validUntil: string | null, today: Date): boolean {
  if (!validUntil) return false;
  const [year, month, day] = validUntil.split("-").map(Number);
  if (!year || !month || !day) return false;
  return new Date(year, month - 1, day).getTime() < today.setHours(0, 0, 0, 0);
}

/** Resume certidões/CNDs: total, vencidas (validade) e pendentes de coleta. */
export function summarizeCertidoes(
  rows: CertidaoLike[],
  today: Date = new Date()
): CertidaoSummary {
  let expired = 0;
  let pending = 0;
  for (const row of rows) {
    if (isExpired(row.validUntil, today)) expired++;
    if (row.status === "PENDENTE") pending++;
  }
  return { total: rows.length, expired, pending };
}
