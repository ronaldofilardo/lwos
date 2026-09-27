import { desc, eq, count, inArray, and } from "drizzle-orm";
import { families as familiesTable, projects, people, documents, familyAccess, fileBlobs } from "../../../drizzle/schema";
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
 * Listagem de arquivos/pastas no storage.
 * Como o storage agora é no banco de dados (fileBlobs), esta função
 * agrupa as keys por prefixo de pasta e retorna o tamanho total por pasta.
 *
 * `allowedFolders`, quando informado, restringe a listagem a essas pastas
 * (matching pelo prefixo da key). usado pelo CLIENTE (via listClientStorageFiles).
 */
export async function listStorageFiles(allowedFolders?: string[]): Promise<{ path: string; size: number; isDirectory: boolean }[]> {
  const db = await requireDatabase();

  // Busca todas as keys no banco
  const allKeys = await db.select({ key: fileBlobs.key, sizeBytes: fileBlobs.sizeBytes }).from(fileBlobs);

  // Agrupa por pasta (primeiro segmento da key)
  const folderMap = new Map<string, { size: number; fileCount: number }>();

  for (const { key, sizeBytes } of allKeys) {
    // O formato da key é "familyId/relativePath"
    // O primeiro segmento após o "/" é a "pasta" raiz a ser listada
    const parts = key.split("/");
    if (parts.length === 0) continue;

    const folderName = parts[0]; // ex: "familia-123"
    const fileName = parts.slice(1).join("/") || ""; // restante do caminho

    if (!folderMap.has(folderName)) {
      folderMap.set(folderName, { size: 0, fileCount: 0 });
    }
    folderMap.get(folderName)!.size += (sizeBytes ?? 0);
    folderMap.get(folderName)!.fileCount += 1;
  }

  // Se houver pastas definidas como allowed, filtramos
  const result: { path: string; size: number; isDirectory: boolean }[] = [];

  if (allowedFolders !== undefined) {
    // Modo restrito: apenas pastas solicitadas
    for (const folder of allowedFolders) {
      const info = folderMap.get(folder);
      if (info) {
        result.push({
          path: folder,
          size: info.size,
          isDirectory: true,
        });
        // Também inclui os arquivos soltos dentro dessa pasta, se houver
        // (aqui simplificamos: apenas a pasta)
      }
    }
  } else {
    // Modo geral: listar todas as pastas e arquivos
    for (const [folderName, info] of folderMap) {
      result.push({
        path: folderName,
        size: info.size,
        isDirectory: true,
      });
      // Poderia também listar arquivos individuais aqui, mas o frontend
      // atual espera pastas no topo. Mantemos simples.
    }
  }

  return result;
}

export async function listClientStorageFiles(userId: number) {
  const allowedFamilyIds = await getClientFamilyIds(userId);
  if (allowedFamilyIds.length === 0) return [];
  const { resolveFamilyStorageFolder } = await import("../../lib/family-storage-path");
  const folders = await Promise.all(allowedFamilyIds.map(id => resolveFamilyStorageFolder(id)));
  return listStorageFiles(folders);
}
