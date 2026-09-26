import { eq, inArray } from "drizzle-orm";
import { documentVersions, documents } from "../../drizzle/schema";
import { requireDatabase } from "../features/_shared/database";
import { moveFolder } from "../storage";

/**
 * Quando o titular de uma família muda, a pasta de storage muda de nome
 * (CPF antigo → CPF novo). Isso:
 * 1. Move fisicamente a pasta no disco (server/storage.ts::moveFolder).
 * 2. Atualiza documentVersions.storageKey de todos os arquivos daquela
 *    família que estavam sob a pasta antiga, pra apontar pra pasta nova.
 *
 * Se oldFolder === newFolder, não faz nada. Se a família ainda não tem
 * nenhum arquivo, moveFolder é um no-op e não há storageKey pra atualizar.
 *
 * Se o move FS succeed mas os UPDATEs no DB falharem, tenta reverter o move
 * (compensação). Em caso de falha parcial nos UPDATEs, os arquivos que já
 * foram atualizados ficam com a chave correta; os que não foram ficam com
 * a chave antiga mas o arquivo está na pasta nova — inconsistentes, mas
 * recuperáveis manualmente.
 */
export async function migrateFamilyStorageFolder(
  familyId: string,
  oldFolder: string,
  newFolder: string,
): Promise<{ migratedFiles: number }> {
  if (oldFolder === newFolder) return { migratedFiles: 0 };

  const db = await requireDatabase();

  const familyDocs = await db.select({ id: documents.id }).from(documents).where(eq(documents.familyId, familyId));
  const docIds = familyDocs.map(d => d.id);
  if (docIds.length === 0) return { migratedFiles: 0 };

  const versions = await db
    .select({ id: documentVersions.id, storageKey: documentVersions.storageKey })
    .from(documentVersions)
    .where(inArray(documentVersions.documentId, docIds));

  const prefix = `${oldFolder}/`;
  const toMigrate = versions.filter(v => v.storageKey.startsWith(prefix));
  if (toMigrate.length === 0) return { migratedFiles: 0 };

  await moveFolder(oldFolder, newFolder);

  let migratedCount = 0;
  try {
    for (const version of toMigrate) {
      const newKey = `${newFolder}/${version.storageKey.slice(prefix.length)}`;
      await db.update(documentVersions).set({ storageKey: newKey }).where(eq(documentVersions.id, version.id));
      migratedCount++;
    }
  } catch {
    // Compensation: tenta reverter o move FS se os UPDATEs falharam
    try {
      await moveFolder(newFolder, oldFolder);
    } catch {
      // Falha na compensação — estado inconsistente, requer intervenção manual
    }
    throw new Error(`Migração de storage falhou após mover arquivos. ${migratedCount}/${toMigrate.length} registros atualizados. Pasta revertida.`);
  }

  return { migratedFiles: migratedCount };
}
