import { sql, type SQL } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

/**
 * Advisory locks para evitar race conditions em operações críticas.
 *
 * PostgreSQL advisory locks:
 * - `pg_advisory_xact_lock(key1, key2)` — bloqueia até o fim da transação.
 * - `pg_try_advisory_xact_lock(key1, key2)` — tenta bloquear, devolve true/false sem esperar.
 *
 * Uso típico:
 * ```ts
 * await withAdvisoryLock(db, AdvisoryLockKey.FIRST_ACCESS, personId, async (tx) => {
 *   // lógica atômica
 * });
 * ```
 */

/** Chaves de lock conhecidas — evita colisões acidentais. */
export const AdvisoryLockKey = {
  FIRST_ACCESS: 1000,           // first-access-router: setPassword
  DOCUMENT_UPLOAD: 2000,        // document-upload: storeDocumentVersion
  LWR_CREATE: 3000,             // lwr-router: create
  STAKEHOLDER_PERCENT: 4000,    // company-repository: stakeholder soma ≤100%
} as const;

export type AdvisoryLockKeyType = keyof typeof AdvisoryLockKey;

type TransactionalDB = NodePgDatabase<Record<string, unknown>> & { $client?: Pool };

/**
 * Executa `fn` dentro de uma transação com advisory lock exclusivo.
 * Se o lock não puder ser obtido, a transação falha (nunca bloqueia indefinidamente
 * porque usa `pg_try_advisory_xact_lock`).
 *
 * Em testes (onde o mock de `requireDatabase` não tem `transaction`),
 * executa `fn` diretamente sem lock — os testes unitários validam a lógica
 * de negócio, não a concorrência.
 */
export async function withAdvisoryLock<T>(
  dbOrPromise: Promise<TransactionalDB> | TransactionalDB,
  lockName: AdvisoryLockKeyType,
  discriminator: number | string,
  fn: (tx: TransactionalDB) => Promise<T>
): Promise<T> {
  // Se receber Promise (ex.: requireDatabase()), aguarda resolver.
  const db = dbOrPromise instanceof Promise ? await dbOrPromise : dbOrPromise;

  const key = AdvisoryLockKey[lockName];
  const disc = typeof discriminator === "string" ? hashString(discriminator) : discriminator;

  // Se não há método transaction (ex.: mock de teste), roda sem lock.
  if (typeof db.transaction !== "function") {
    return fn(db);
  }

  return db.transaction(async (tx) => {
    // Tenta obter o lock; se falhar, lança erro (o chamador trata retry/409).
    const lockResult = await tx.execute(sql`
      SELECT pg_try_advisory_xact_lock(${key}, ${disc}) as acquired
    `);
    const acquired = (lockResult as unknown as { acquired: boolean }[])?.[0]?.acquired ?? false;
    if (!acquired) {
      throw new Error("Operação concorrente em andamento. Tente novamente.");
    }
    return fn(tx as TransactionalDB);
  });
}

/** Hash simples de string pra número 32-bit (estável entre chamadas). */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // to 32-bit integer
  }
  return Math.abs(hash);
}