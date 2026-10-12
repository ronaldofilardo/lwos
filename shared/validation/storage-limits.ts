/**
 * Limites de armazenamento — única fonte de verdade.
 *
 * O storage do MVP persiste em PostgreSQL (tabela `fileBlobs` como base64).
 * O limite de 5 MB é aplicado em TODOS os ambientes (dev/test/produção) pra
 * que a validação do storagePut seja idêntica à das camadas de application
 * (document-upload, lead-repository) — evita testes que passam em dev e
 * falham em produção.
 */

/** Tamanho máximo de um arquivo em bytes (5 MB). */
export const MAX_STORAGE_BYTES = 5 * 1024 * 1024;

/** Valida que o buffer não excede o limite de armazenamento. */
export function assertStorageSize(bytes: Buffer): void {
  if (!bytes.length || bytes.length > MAX_STORAGE_BYTES) {
    throw new Error("Arquivo inválido ou maior que 5 MB.");
  }
}