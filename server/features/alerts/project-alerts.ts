import { CERTIDAO_TYPE_LABELS } from "../certidoes/certidao-types";

/**
 * Alertas do projeto (Fase 9): vermelho para certidão positiva ou somente
 * física (não emitida pela internet), amarelo para pendente ou vencida e o
 * gate de conclusão do projeto. Cálculo puro — a consulta vive no
 * project-alerts-repository e o resultado é reaproveitado por todas as
 * telas e pela lista de projetos.
 */

export type AlertLevel = "VERMELHO" | "AMARELO" | "NENHUM";

export type CertidaoAlertRow = {
  scope: string;
  subjectId: string;
  type?: string | null;
  status: string;
  validUntil?: string | null;
  subjectName?: string | null;
};

export type PropertyAlertRow = {
  id: string;
  description: string;
  encumbranceType?: string | null;
};

const RED_CERTIDAO_STATUSES = new Set(["POSITIVA", "SOMENTE_FISICA"]);

function todayIso(today: Date): string {
  return today.toISOString().slice(0, 10);
}

/** Vermelho: positiva ou somente física. Amarelo: pendente ou vencida. */
export function certidaoAlertLevel(
  status: string,
  validUntil?: string | null,
  today = new Date()
): AlertLevel {
  if (RED_CERTIDAO_STATUSES.has(status)) return "VERMELHO";
  if (status === "PENDENTE") return "AMARELO";
  if (validUntil) {
    const expiry = String(validUntil).slice(0, 10);
    if (expiry < todayIso(today)) return "AMARELO";
  }
  return "NENHUM";
}

export function subjectAlertKey(scope: string, subjectId: string): string {
  return `${scope}:${subjectId}`;
}

export function maxAlertLevel(
  left?: AlertLevel | string | null,
  right?: AlertLevel | string | null
): AlertLevel {
  if (left === "VERMELHO" || right === "VERMELHO") return "VERMELHO";
  if (left === "AMARELO" || right === "AMARELO") return "AMARELO";
  return "NENHUM";
}

/** Nível máximo por assunto («PESSOA:id» / «SOCIEDADE:id»). */
export function computeSubjectAlerts(
  rows: CertidaoAlertRow[],
  today = new Date()
): Record<string, AlertLevel> {
  const bySubject: Record<string, AlertLevel> = {};
  for (const row of rows) {
    const level = certidaoAlertLevel(row.status, row.validUntil, today);
    if (level === "NENHUM") continue;
    const key = subjectAlertKey(row.scope, row.subjectId);
    bySubject[key] = maxAlertLevel(bySubject[key], level);
  }
  return bySubject;
}

/** Contagem de assuntos em alerta — usada no header e na lista de projetos. */
export function computeAlertCounts(
  rows: CertidaoAlertRow[],
  today = new Date()
): { vermelho: number; amarelo: number } {
  let vermelho = 0;
  let amarelo = 0;
  for (const level of Object.values(computeSubjectAlerts(rows, today))) {
    if (level === "VERMELHO") vermelho += 1;
    else if (level === "AMARELO") amarelo += 1;
  }
  return { vermelho, amarelo };
}

function certidaoLabel(row: CertidaoAlertRow): string {
  const typeLabel = row.type
    ? (CERTIDAO_TYPE_LABELS[
        row.type as keyof typeof CERTIDAO_TYPE_LABELS
      ] ?? row.type)
    : "Certidão";
  return `${typeLabel} de ${row.subjectName ?? row.subjectId}`;
}

/**
 * Gate de conclusão: gravame «Pendente» bloqueia sempre; certidão em
 * vermelho bloqueia sem justificativa registrada.
 */
export function computeConclusionBlockers(input: {
  certidoes: CertidaoAlertRow[];
  properties: PropertyAlertRow[];
  justification?: string | null;
  today?: Date;
}): { blockers: string[]; hardBlockers: string[]; redCertidoes: string[] } {
  const today = input.today ?? new Date();
  const hardBlockers = input.properties
    .filter(property => property.encumbranceType === "PENDENTE")
    .map(
      property =>
        `Imóvel «${property.description}» com gravame Pendente — resolva o gravame antes de concluir o projeto.`
    );
  const redCertidoes = input.certidoes
    .filter(
      row => certidaoAlertLevel(row.status, row.validUntil, today) === "VERMELHO"
    )
    .map(certidaoLabel);
  const blockers = [...hardBlockers];
  if (redCertidoes.length && !input.justification?.trim()) {
    blockers.push(
      `Certidão em vermelho sem justificativa registrada: ${redCertidoes.join(", ")}.`
    );
  }
  return { blockers, hardBlockers, redCertidoes };
}
