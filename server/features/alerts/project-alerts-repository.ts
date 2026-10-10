import { eq, inArray } from "drizzle-orm";
import { certidoes, companies, people, properties } from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import {
  computeAlertCounts,
  computeConclusionBlockers,
  computeSubjectAlerts,
  type AlertLevel,
  type CertidaoAlertRow,
} from "./project-alerts";

type AlertRows = {
  certidoes: CertidaoAlertRow[];
  properties: { id: string; description: string; encumbranceType: string | null }[];
};

async function loadAlertRows(familyId: string): Promise<AlertRows> {
  const db = await requireDatabase();
  const [certidaoRows, propertyRows, peopleRows, companyRows] =
    await Promise.all([
      db
        .select({
          scope: certidoes.scope,
          subjectId: certidoes.subjectId,
          type: certidoes.type,
          status: certidoes.status,
          validUntil: certidoes.validUntil,
        })
        .from(certidoes)
        .where(eq(certidoes.familyId, familyId)),
      db
        .select({
          id: properties.id,
          description: properties.description,
          encumbranceType: properties.encumbranceType,
        })
        .from(properties)
        .where(eq(properties.familyId, familyId)),
      db
        .select({ id: people.id, fullName: people.fullName })
        .from(people)
        .where(eq(people.familyId, familyId)),
      db
        .select({ id: companies.id, legalName: companies.legalName })
        .from(companies)
        .where(eq(companies.familyId, familyId)),
    ]);
  const nameByKey = new Map<string, string>();
  for (const row of peopleRows) {
    nameByKey.set(`PESSOA:${row.id}`, row.fullName);
  }
  for (const row of companyRows) {
    nameByKey.set(`SOCIEDADE:${row.id}`, row.legalName);
  }
  return {
    certidoes: certidaoRows.map(row => ({
      ...row,
      subjectName:
        nameByKey.get(`${row.scope}:${row.subjectId}`) ?? null,
    })),
    properties: propertyRows,
  };
}

/**
 * Resumo de alertas do projeto (Fase 9): nível por assunto, contagem,
 * gravames pendentes e o gate de conclusão. Serve as telas de Pessoas,
 * Imóveis, Sociedades e Ativos e a lista de projetos.
 */
export async function getProjectAlertSummary(familyId: string) {
  const rows = await loadAlertRows(familyId);
  const bySubject = computeSubjectAlerts(rows.certidoes);
  const { blockers, hardBlockers, redCertidoes } = computeConclusionBlockers({
    certidoes: rows.certidoes,
    properties: rows.properties,
  });
  const pendenteGravames = rows.properties
    .filter(property => property.encumbranceType === "PENDENTE")
    .map(property => ({
      propertyId: property.id,
      description: property.description,
    }));
  return {
    bySubject,
    counts: computeAlertCounts(rows.certidoes),
    pendenteGravames,
    redCertidoes,
    hardBlockers,
    blockers,
    canConclude: hardBlockers.length === 0,
  };
}

/** Motivos que impedem a conclusão; a justificativa só cobre certidão vermelha. */
export async function getConclusionBlockers(
  familyId: string,
  justification?: string | null
): Promise<string[]> {
  const rows = await loadAlertRows(familyId);
  return computeConclusionBlockers({
    certidoes: rows.certidoes,
    properties: rows.properties,
    justification,
  }).blockers;
}

/** Nível máximo de alerta por família — usado na lista de projetos. */
export async function listProjectAlertLevels(
  familyIds: string[]
): Promise<Record<string, AlertLevel>> {
  if (!familyIds.length) return {};
  const db = await requireDatabase();
  const rows = await db
    .select({
      familyId: certidoes.familyId,
      scope: certidoes.scope,
      subjectId: certidoes.subjectId,
      status: certidoes.status,
      validUntil: certidoes.validUntil,
    })
    .from(certidoes)
    .where(inArray(certidoes.familyId, familyIds));
  const byFamily = new Map<string, CertidaoAlertRow[]>();
  for (const row of rows) {
    const list = byFamily.get(row.familyId) ?? [];
    list.push(row);
    byFamily.set(row.familyId, list);
  }
  const levels: Record<string, AlertLevel> = {};
  for (const familyId of familyIds) {
    const subjects = computeSubjectAlerts(byFamily.get(familyId) ?? []);
    let level: AlertLevel = "NENHUM";
    for (const subjectLevel of Object.values(subjects)) {
      if (subjectLevel === "VERMELHO") {
        level = "VERMELHO";
        break;
      }
      if (subjectLevel === "AMARELO") level = "AMARELO";
    }
    levels[familyId] = level;
  }
  return levels;
}
