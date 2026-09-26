import { desc, eq, count, inArray, and } from "drizzle-orm";
import { families as familiesTable, projects, people, documents, familyAccess } from "../../../drizzle/schema";
import { createId } from "../_shared/ids";
import { requireDatabase } from "../_shared/database";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import type { familyInputSchema } from "./family-types";

export async function createFamilyRecord(
  input: z.infer<typeof familyInputSchema>,
  createdBy: number,
) {
  const db = await requireDatabase();
  const familyId = createId();
  const projectId = createId();
  await db.transaction(async tx => {
    await tx.insert(familiesTable).values({ ...input, id: familyId, createdBy: String(createdBy) });
    await tx.insert(projects).values({ id: projectId, familyId, title: input.name });
  });
  return { familyId, projectId };
}

export async function listFamilyRecords() {
  const db = await requireDatabase();
  const records = await db.select().from(familiesTable).orderBy(desc(familiesTable.updatedAt));
  if (!records.length) return [];

  // Famílias que já têm pelo menos um usuário CLIENTE vinculado (ou seja, o
  // titular já concluiu o primeiro acesso) — usado pra esconder o botão
  // "1º acesso" na tela de famílias, já que gerar um novo link não faz
  // sentido depois que a conta já existe.
  const accessRows = await db
    .select({ familyId: familyAccess.familyId })
    .from(familyAccess)
    .where(and(inArray(familyAccess.familyId, records.map(r => r.id)), eq(familyAccess.accessRole, "CLIENTE")));
  const familyIdsWithAccess = new Set(accessRows.map(r => r.familyId));

  return records.map(record => ({ ...record, hasClientAccess: familyIdsWithAccess.has(record.id) }));
}

export async function getFamilyRecord(familyId: string) {
  const db = await requireDatabase();
  const result = await db.select().from(familiesTable).where(eq(familiesTable.id, familyId)).limit(1);
  return result[0] ?? null;
}

export interface DashboardData {
  totalFamilies: number;
  totalPeople: number;
  totalDocuments: number;
  families: { id: string; name: string; civilStatus: string; maritalRegime: string; updatedAt: Date; peopleCount: number; documentsCount: number }[];
}

/**
 * Ids das famílias que um usuário CLIENTE pode ver.
 * Times (SOCIO/ADMIN) enxergam tudo, por isso essa função só é chamada pro papel CLIENTE.
 */
async function getClientFamilyIds(userId: number): Promise<string[]> {
  const db = await requireDatabase();
  const access = await db.select({ familyId: familyAccess.familyId }).from(familyAccess).where(eq(familyAccess.userId, userId));
  return access.map(a => a.familyId);
}

/**
 * Dashboard completo (visão de time): todas as famílias.
 * `allowedFamilyIds`, quando informado, restringe o resultado a essas famílias —
 * usado pro dashboard de um CLIENTE, que só pode ver as famílias às quais tem acesso.
 */
export async function getDashboardData(allowedFamilyIds?: string[]) {
  const db = await requireDatabase();
  const scoped = allowedFamilyIds !== undefined;
  if (scoped && allowedFamilyIds.length === 0) {
    return { totalFamilies: 0, totalPeople: 0, totalDocuments: 0, families: [] };
  }

  const allFamilies = scoped
    ? await db.select().from(familiesTable).where(inArray(familiesTable.id, allowedFamilyIds)).orderBy(desc(familiesTable.updatedAt))
    : await db.select().from(familiesTable).orderBy(desc(familiesTable.updatedAt));

  const families = [];
  let totalPeople = 0;
  let totalDocuments = 0;
  for (const f of allFamilies) {
    const [{ count: peopleCount }] = await db.select({ count: count() }).from(people).where(eq(people.familyId, f.id));
    const [{ count: documentsCount }] = await db.select({ count: count() }).from(documents).where(eq(documents.familyId, f.id));
    families.push({ id: f.id, name: f.name, civilStatus: f.civilStatus, maritalRegime: f.maritalRegime, updatedAt: f.updatedAt, peopleCount: Number(peopleCount), documentsCount: Number(documentsCount) });
    totalPeople += Number(peopleCount);
    totalDocuments += Number(documentsCount);
  }

  if (scoped) {
    return { totalFamilies: families.length, totalPeople, totalDocuments, families };
  }

  const [{ count: totalFamilies }] = await db.select({ count: count() }).from(familiesTable);
  const [{ count: totalPeopleAll }] = await db.select({ count: count() }).from(people);
  const [{ count: totalDocumentsAll }] = await db.select({ count: count() }).from(documents);
  return { totalFamilies, totalPeople: totalPeopleAll, totalDocuments: totalDocumentsAll, families };
}

export async function getClientDashboardData(userId: number) {
  const allowedFamilyIds = await getClientFamilyIds(userId);
  return getDashboardData(allowedFamilyIds);
}

/**
 * Storage local (visão de time): tudo dentro de STORAGE_ROOT.
 * `allowedFolders`, quando informado, restringe a listagem a essas subpastas —
 * usado pro CLIENTE, que só pode ver a pasta de storage da(s) família(s) dele.
 */
export async function listStorageFiles(allowedFolders?: string[]): Promise<{ path: string; size: number; isDirectory: boolean }[]> {
  const root = process.env.STORAGE_ROOT ?? "";
  if (!root) return [];
  const scoped = allowedFolders !== undefined;
  if (scoped && allowedFolders.length === 0) return [];
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const filtered = scoped ? entries.filter(entry => allowedFolders!.includes(entry.name)) : entries;
    const items = await Promise.all(filtered.map(async (entry) => {
      const fullPath = path.join(root, entry.name);
      const stats = await stat(fullPath);
      return { path: fullPath, size: stats.size, isDirectory: entry.isDirectory() };
    }));
    return items;
  } catch {
    return [];
  }
}

export async function listClientStorageFiles(userId: number) {
  const allowedFamilyIds = await getClientFamilyIds(userId);
  if (allowedFamilyIds.length === 0) return [];
  const { resolveFamilyStorageFolder } = await import("../../lib/family-storage-path");
  const folders = await Promise.all(allowedFamilyIds.map(id => resolveFamilyStorageFolder(id)));
  return listStorageFiles(folders);
}
