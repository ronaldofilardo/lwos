import { asc, eq, inArray } from "drizzle-orm";
import {
  certidoes,
  certidaoTypeValues,
  companies,
  documents,
  people,
} from "../../../drizzle/schema";
import { requireDatabase } from "../_shared/database";
import { createId } from "../_shared/ids";
import { CERTIDAO_TYPE_LABELS } from "./certidao-types";

type Scope = "PESSOA" | "SOCIEDADE";

/**
 * Gera as 8 certidões (CND Federal/Estadual/Municipal, TJ, TRF, CNAT, CNDT e
 * Protestos) para um membro da família ou para uma holding/sociedade que
 * ainda não as tenha. Idempotente — o unique (subjectId, type) segura corrida.
 */
export async function ensureCertidoesForSubject(input: {
  familyId: string;
  scope: Scope;
  subjectId: string;
}) {
  const db = await requireDatabase();
  const existing = await db
    .select({ type: certidoes.type })
    .from(certidoes)
    .where(eq(certidoes.subjectId, input.subjectId));
  const known = new Set(existing.map(row => row.type));
  const missing = certidaoTypeValues.filter(type => !known.has(type));
  if (!missing.length) return 0;

  await db.transaction(async tx => {
    for (const type of missing) {
      const certidaoId = createId();
      const inserted = await tx
        .insert(certidoes)
        .values({
          id: certidaoId,
          familyId: input.familyId,
          scope: input.scope,
          subjectId: input.subjectId,
          type,
          status: "PENDENTE",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: certidoes.id });
      if (!inserted[0]) continue;

      // O arquivo vive em `documents` (entityType CERTIDAO) pra reaproveitar
      // versionamento, SHA-256 e o proxy de download com autorização.
      const documentId = createId();
      await tx.insert(documents).values({
        id: documentId,
        familyId: input.familyId,
        entityType: "CERTIDAO",
        entityId: certidaoId,
        category: CERTIDAO_TYPE_LABELS[type],
        status: "PENDENTE",
        currentVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await tx
        .update(certidoes)
        .set({ documentId })
        .where(eq(certidoes.id, certidaoId));
    }
  });
  return missing.length;
}

/** Backfill da família inteira: membros (PESSOA) + holdings (SOCIEDADE). */
export async function ensureFamilyCertidoes(familyId: string) {
  const db = await requireDatabase();
  const [peopleRows, companyRows] = await Promise.all([
    db.select({ id: people.id }).from(people).where(eq(people.familyId, familyId)),
    db.select({ id: companies.id }).from(companies).where(eq(companies.familyId, familyId)),
  ]);

  let created = 0;
  for (const person of peopleRows) {
    created += await ensureCertidoesForSubject({
      familyId,
      scope: "PESSOA",
      subjectId: person.id,
    });
  }
  for (const company of companyRows) {
    created += await ensureCertidoesForSubject({
      familyId,
      scope: "SOCIEDADE",
      subjectId: company.id,
    });
  }
  return created;
}

export async function getCertidaoRecord(certidaoId: string) {
  const db = await requireDatabase();
  const result = await db
    .select()
    .from(certidoes)
    .where(eq(certidoes.id, certidaoId))
    .limit(1);
  return result[0] ?? null;
}

export async function listCertidaoRecords(familyId: string) {
  const db = await requireDatabase();
  const rows = await db
    .select()
    .from(certidoes)
    .where(eq(certidoes.familyId, familyId))
    .orderBy(asc(certidoes.scope), asc(certidoes.type));
  if (!rows.length) return [];

  const [peopleRows, companyRows] = await Promise.all([
    db
      .select({ id: people.id, name: people.fullName })
      .from(people)
      .where(eq(people.familyId, familyId)),
    db
      .select({ id: companies.id, name: companies.legalName })
      .from(companies)
      .where(eq(companies.familyId, familyId)),
  ]);
  const names = new Map(
    [...peopleRows, ...companyRows].map(row => [row.id, row.name])
  );

  const documentIds = rows
    .map(row => row.documentId)
    .filter((id): id is string => Boolean(id));
  const documentRows = documentIds.length
    ? await db
        .select({
          id: documents.id,
          currentVersion: documents.currentVersion,
          updatedAt: documents.updatedAt,
        })
        .from(documents)
        .where(inArray(documents.id, documentIds))
    : [];
  const documentsById = new Map(documentRows.map(row => [row.id, row]));

  return rows.map(row => ({
    ...row,
    subjectName: names.get(row.subjectId) ?? null,
    documentCurrentVersion: row.documentId
      ? documentsById.get(row.documentId)?.currentVersion ?? 0
      : 0,
    documentUpdatedAt: row.documentId
      ? documentsById.get(row.documentId)?.updatedAt ?? null
      : null,
  }));
}

export async function updateCertidaoRecord(input: {
  certidaoId: string;
  status?: string;
  validUntil?: string;
}) {
  const db = await requireDatabase();
  const current = await getCertidaoRecord(input.certidaoId);
  if (!current) throw new Error("Certidão não encontrada.");

  await db
    .update(certidoes)
    .set({
      status: (input.status ?? current.status) as typeof current.status,
      validUntil:
        input.validUntil !== undefined
          ? input.validUntil || null
          : current.validUntil,
      updatedAt: new Date(),
    })
    .where(eq(certidoes.id, input.certidaoId));
  return current;
}
