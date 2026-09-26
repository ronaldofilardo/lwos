/**
 * @description Ficha da holding no modal "Detalhes": upsert completo, criação
 * find-or-create dos documentos da variante e cálculo de valor por quota.
 * @see server/features/companies/company-details-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idMocks);

import {
  computePerShare,
  getCompanyDetailsRecord,
  listCompanyDetailDocs,
  updateCompanyDetailDocRecord,
  upsertCompanyDetailsRecord,
} from "./company-details-repository";

type Row = Record<string, unknown>;

function mockDb() {
  const state: { rows: Row[]; inserted: Row[]; updated: Row[] } = {
    rows: [],
    inserted: [],
    updated: [],
  };
  const select = vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => {
        const rows = state.rows;
        return {
          limit: vi.fn().mockResolvedValue(rows.slice(0, 1)),
          then: (
            resolve: (value: Row[]) => unknown,
            reject: (reason: unknown) => unknown
          ) => Promise.resolve(rows).then(resolve, reject),
        };
      }),
    })),
  }));
  const values = vi.fn().mockImplementation((input: Row | Row[]) => {
    if (Array.isArray(input)) state.rows.push(...input);
    state.inserted.push(input as Row);
    return {
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      then: (
        resolve: (value: unknown) => unknown,
        reject: (reason: unknown) => unknown
      ) => Promise.resolve(input).then(resolve, reject),
    };
  });
  const insert = vi.fn().mockImplementation(() => ({ values }));
  const update = vi.fn().mockImplementation(() => ({
    set: vi.fn().mockImplementation((input: Row) => {
      state.updated.push(input);
      return { where: vi.fn().mockResolvedValue(undefined) };
    }),
  }));
  return { db: { select, insert, update }, state };
}

const fields = {
  nire: "123",
  uf: "SP",
  sede: "São Paulo",
  societaryType: "Ltda",
  taxRegime: "Lucro presumido",
  corporatePurpose: "Administração de bens",
  capitalSocial: 100000,
  shareQuantity: 1000,
  administrator1: "Ana",
  administrator2: null,
  equity: 50000,
  cashAndEquivalents: 10000,
  inventory: null,
  accountsReceivable: 2000,
  investments: 3000,
  fixedAssets: 4000,
  retainedEarnings: 1500,
  taxLiabilities: 500,
  laborLiabilities: 300,
  financing: 700,
  estimatedMarketValue: 250000,
  companyNumber: null,
  jurisdiction: null,
  residentAgent: null,
  notes: "observação",
} as never;

describe("company-details-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idMocks.createId.mockReturnValue("novo-id");
  });

  it("faz upsert convertendo números para decimal e limpando vazios", async () => {
    const { db, state } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await upsertCompanyDetailsRecord({ companyId: "hold-1", fields });

    const payload = state.inserted[0];
    expect(payload).toMatchObject({
      companyId: "hold-1",
      capitalSocial: "100000.00",
      shareQuantity: "1000.00",
      estimatedMarketValue: "250000.00",
      inventory: null,
      administrator2: null,
      jurisdiction: null,
      notes: "observação",
    });
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it("lê a ficha existente", async () => {
    const { db, state } = mockDb();
    state.rows = [{ companyId: "hold-1", nire: "123" }];
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const row = await getCompanyDetailsRecord("hold-1");
    expect(row?.nire).toBe("123");
  });

  it("cria só os documentos da variante e não duplica na segunda chamada", async () => {
    const { db, state } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const first = await listCompanyDetailDocs({
      companyId: "hold-1",
      companyType: "HOLDING_NACIONAL",
    });
    expect(first).toHaveLength(7);
    expect(first[0].docType).toBe("CONTRATO_SOCIAL");
    expect(state.inserted).toHaveLength(1);

    state.inserted.length = 0;
    const second = await listCompanyDetailDocs({
      companyId: "hold-1",
      companyType: "HOLDING_NACIONAL",
    });
    expect(second).toHaveLength(7);
    expect(state.inserted).toHaveLength(0);
  });

  it("gera os documentos da holding internacional", async () => {
    const { db } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    const rows = await listCompanyDetailDocs({
      companyId: "hold-2",
      companyType: "HOLDING_INTERNACIONAL",
    });
    expect(rows.map(row => row.docType)).toEqual([
      "MEMORANDUM_ARTICLES",
      "BALANCE_SHEET",
      "CERTIFICATE_INCORPORATION",
      "REGISTER_DIRECTORS",
      "REGISTER_MEMBERS",
      "CERTIFICATE_GOOD_STANDING",
      "SHARE_CERTIFICATE",
    ]);
  });

  it("atualiza o status de um documento existente", async () => {
    const { db, state } = mockDb();
    state.rows = [{ id: "doc-1" }];
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await updateCompanyDetailDocRecord({
      companyId: "hold-1",
      docType: "CONTRATO_SOCIAL",
      status: "RECEBIDO",
    });

    expect(state.updated[0]).toMatchObject({ status: "RECEBIDO" });
  });

  it("falha quando o documento não existe na sociedade", async () => {
    const { db } = mockDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      updateCompanyDetailDocRecord({
        companyId: "hold-1",
        docType: "CONTRATO_SOCIAL",
        status: "RECEBIDO",
      })
    ).rejects.toThrow("não encontrado");
  });
});

describe("computePerShare", () => {
  it("divide capital, PL e mercado pela quantidade de quotas", () => {
    expect(
      computePerShare({
        capitalSocial: "100000",
        equity: "50000",
        estimatedMarketValue: "250000",
        shareQuantity: "1000",
      })
    ).toEqual({ contabil: 100, patrimonial: 50, mercado: 250 });
  });

  it("devolve null quando não há quantidade de quotas", () => {
    expect(
      computePerShare({
        capitalSocial: "100000",
        equity: null,
        estimatedMarketValue: undefined,
        shareQuantity: null,
      })
    ).toEqual({ contabil: null, patrimonial: null, mercado: null });
  });
});
