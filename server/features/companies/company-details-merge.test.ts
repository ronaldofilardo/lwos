/**
 * @description Upsert da ficha da holding com merge: no conflito só atualiza o
 * que foi enviado (campo ausente preserva o valor gravado; null limpa). Antes,
 * qualquer campo ausente virava NULL e apagava o dado.
 * @see server/features/companies/company-details-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);

import { upsertCompanyDetailsRecord } from "./company-details-repository";

function mockDb(existing: Record<string, unknown>[] = []) {
  const select = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({ limit: vi.fn(async () => existing.slice(0, 1)) })),
    })),
  }));
  const onConflictDoUpdate = vi.fn(async (_config: { set: Record<string, unknown> }) => undefined);
  const values = vi.fn((_input: Record<string, unknown>) => ({ onConflictDoUpdate }));
  const db = { select, insert: vi.fn(() => ({ values })) };
  return { db, values, onConflictDoUpdate };
}

describe("upsertCompanyDetailsRecord — merge parcial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idMocks.createId.mockReturnValue("novo-id");
  });

  it("no conflito atualiza só os campos enviados", async () => {
    const { db, onConflictDoUpdate } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: { nire: "999", capitalSocial: 5000 } as never,
    });

    const set = onConflictDoUpdate.mock.calls[0][0].set;
    expect(set).toMatchObject({ nire: "999", capitalSocial: "5000.00" });
    expect(set).not.toHaveProperty("sede");
    expect(set).not.toHaveProperty("equity");
    expect(set).not.toHaveProperty("notes");
    expect(set).toHaveProperty("updatedAt");
  });

  it("o valor estimado é sempre derivado do balanço (o enviado é ignorado)", async () => {
    const { db, onConflictDoUpdate } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: { cashAndEquivalents: 1000, financing: 300, estimatedMarketValue: 999999 } as never,
    });

    expect(onConflictDoUpdate.mock.calls[0][0].set.estimatedMarketValue).toBe("700.00");
  });

  it("em salvamento parcial usa o balanço já gravado para os campos ausentes", async () => {
    const { db, onConflictDoUpdate } = mockDb([
      { companyId: "hold-1", cashAndEquivalents: "5000.00", financing: "1000.00" },
    ]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: { investments: 2000 } as never,
    });

    // 5000 (gravado) + 2000 (enviado) − 1000 (gravado)
    expect(onConflictDoUpdate.mock.calls[0][0].set.estimatedMarketValue).toBe("6000.00");
  });

  it("sem nenhum item de balanço o valor estimado fica null", async () => {
    const { db, onConflictDoUpdate } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({ companyId: "hold-1", fields: { nire: "1" } as never });

    expect(onConflictDoUpdate.mock.calls[0][0].set.estimatedMarketValue).toBeNull();
  });

  it("null enviado explicitamente limpa o campo", async () => {
    const { db, onConflictDoUpdate } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: { notes: null, administrator1: null } as never,
    });

    const set = onConflictDoUpdate.mock.calls[0][0].set;
    expect(set).toMatchObject({ notes: null, administrator1: null });
    expect(set).not.toHaveProperty("nire");
  });

  it("atualiza administrator1PersonId e administrator2PersonId no merge", async () => {
    const { db, onConflictDoUpdate } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: {
        administrator1PersonId: "person-1",
        administrator2PersonId: null,
      } as never,
    });

    const set = onConflictDoUpdate.mock.calls[0][0].set;
    expect(set).toMatchObject({
      administrator1PersonId: "person-1",
      administrator2PersonId: null,
    });
  });

  it("na criação da linha, campos ausentes entram como null", async () => {
    const { db, values } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({
      companyId: "hold-1",
      fields: { nire: "123" } as never,
    });

    expect(values.mock.calls[0][0]).toMatchObject({
      id: "novo-id",
      companyId: "hold-1",
      nire: "123",
      sede: null,
      capitalSocial: null,
    });
  });
});
