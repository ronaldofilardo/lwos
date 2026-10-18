/**
 * @description Testes do advisory lock transacional (pg_try_advisory_xact_lock).
 * @see server/_shared/advisory-lock.ts — aquisição, falha fast-path e hash de discriminator.
 */
import { describe, expect, it, vi } from "vitest";
import {
  AdvisoryLockKey,
  withAdvisoryLock,
  type AdvisoryLockKeyType,
} from "./advisory-lock";

type LockRow = { acquired: boolean };

function makeDb(lockResult: LockRow[] | undefined) {
  const tx = {
    execute: vi.fn(async () => lockResult),
  };
  const db = {
    transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => cb(tx)),
  };
  return { db, tx };
}

describe("AdvisoryLockKey", () => {
  it("expõe chaves estáveis por operação", () => {
    expect(AdvisoryLockKey.FIRST_ACCESS).toBe(1000);
    expect(AdvisoryLockKey.DOCUMENT_UPLOAD).toBe(2000);
    expect(AdvisoryLockKey.LWR_CREATE).toBe(3000);
    expect(AdvisoryLockKey.STAKEHOLDER_PERCENT).toBe(4000);
  });
});

describe("withAdvisoryLock", () => {
  const lockName: AdvisoryLockKeyType = "FIRST_ACCESS";

  it("executa fn quando o lock é obtido (discriminator numérico)", async () => {
    const { db, tx } = makeDb([{ acquired: true }]);
    const result = await withAdvisoryLock(db, lockName, 42, async () => "ok");
    expect(result).toBe("ok");
    expect(tx.execute).toHaveBeenCalledTimes(1);
  });

  it("lança erro rápido quando o lock está indisponível", async () => {
    const { db } = makeDb([{ acquired: false }]);
    await expect(
      withAdvisoryLock(db, lockName, 42, async () => "nunca")
    ).rejects.toThrow("Operação concorrente em andamento. Tente novamente.");
  });

  it("trata resultado vazio como lock não adquirido", async () => {
    const { db } = makeDb([]);
    await expect(
      withAdvisoryLock(db, lockName, 42, async () => "nunca")
    ).rejects.toThrow("Operação concorrente");
  });

  it("aceita discriminator string (hash estável) e Promise de db", async () => {
    const { db } = makeDb([{ acquired: true }]);
    const result = await withAdvisoryLock(
      Promise.resolve(db),
      lockName,
      "family-abc",
      async tx => (tx as { execute: unknown }) !== undefined
    );
    expect(result).toBe(true);

    const again = await withAdvisoryLock(db, lockName, "family-abc", async () => "x");
    expect(again).toBe("x");
  });

  it("roda fn sem lock quando o db não tem transaction (mock de teste)", async () => {
    const dbWithoutTx = {} as never;
    const result = await withAdvisoryLock(dbWithoutTx, lockName, 1, async () => "direto");
    expect(result).toBe("direto");
  });
});
