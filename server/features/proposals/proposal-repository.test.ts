/**
 * @description Cobre o repositório de propostas financeiras: criação, listagem/leitura,
 * aceite do cliente, contraproposta e a decisão do sócio (aceitar/recusar).
 * @see server/features/proposals/proposal-repository.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const idsMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../_shared/ids", () => idsMocks);

import { financialProposals } from "../../../drizzle/schema";
import {
  acceptProposalRecord,
  createProposalRecord,
  getProposalRecord,
  listProposalRecords,
  reviewCounterProposalRecord,
  submitCounterProposalRecord,
} from "./proposal-repository";

type Config = {
  listRows?: Record<string, unknown>[];
  getRows?: Record<string, unknown>[];
};

function proposalDb(config: Config = {}) {
  const insertValues = vi.fn(async () => undefined);
  const setValues = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set: setValues }));

  const select = vi.fn(() => ({
    from: vi.fn(() => {
      const orderBy = vi.fn(() => ({
        then: (resolve: (value: unknown) => unknown) => resolve(config.listRows ?? []),
      }));
      const limit = vi.fn(async () => config.getRows ?? []);
      return {
        limit,
        orderBy,
        where: vi.fn(() => ({ limit, orderBy, then: (resolve: (value: unknown) => unknown) => resolve(config.listRows ?? []) })),
        then: (resolve: (value: unknown) => unknown) => resolve(config.listRows ?? []),
      };
    }),
  }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const db = { select, insert, update };
  return { db, insertValues, setValues };
}

describe("proposal-repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria a proposta com o valor formatado e status ENVIADA", async () => {
    const { db, insertValues } = proposalDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    idsMocks.createId.mockReturnValue("prop-1");

    await expect(
      createProposalRecord({
        familyId: "fam-1",
        scopeDescription: "Escopo completo",
        proposedValue: 1234.5,
      } as never)
    ).resolves.toBe("prop-1");

    expect(insertValues).toHaveBeenCalledWith({
      id: "prop-1",
      familyId: "fam-1",
      scopeDescription: "Escopo completo",
      proposedValue: "1234.50",
      status: "ENVIADA",
    });
    expect(insertValues.mock.calls[0][0]).toEqual(expect.objectContaining({ status: "ENVIADA" }));
  });

  it("lista as propostas da família e lê uma proposta específica", async () => {
    const listDb = proposalDb({ listRows: [{ id: "prop-1" }, { id: "prop-2" }] });
    databaseMocks.requireDatabase.mockResolvedValue(listDb.db);
    await expect(listProposalRecords("fam-1")).resolves.toHaveLength(2);

    const found = proposalDb({ getRows: [{ id: "prop-1" }] });
    databaseMocks.requireDatabase.mockResolvedValue(found.db);
    await expect(getProposalRecord("prop-1")).resolves.toEqual({ id: "prop-1" });

    const missing = proposalDb({ getRows: [] });
    databaseMocks.requireDatabase.mockResolvedValue(missing.db);
    await expect(getProposalRecord("prop-x")).resolves.toBeNull();
  });

  it("aceita a proposta normalizando as observações vazias", async () => {
    const { db, setValues } = proposalDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await acceptProposalRecord("prop-1");
    expect(setValues.mock.calls[0][0]).toEqual(
      expect.objectContaining({ status: "ACEITA", clientNotes: null })
    );
    expect(setValues.mock.calls[0][0].acceptedAt).toBeInstanceOf(Date);

    await acceptProposalRecord("prop-1", "aceito!");
    expect(setValues.mock.calls[1][0]).toEqual(
      expect.objectContaining({ clientNotes: "aceito!" })
    );
  });

  it("registra a contraproposta do cliente com valor formatado", async () => {
    const { db, setValues } = proposalDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await submitCounterProposalRecord({
      proposalId: "prop-1",
      counterProposalValue: 900000.5,
      counterProposalNotes: "Valor ajustado",
    });

    expect(setValues.mock.calls[0][0]).toEqual({
      status: "CONTRAPROPOSTA_RECEBIDA",
      counterProposalValue: "900000.50",
      counterProposalNotes: "Valor ajustado",
    });
  });

  it("decisão do sócio: aceitar marca data e recusar zera, mantendo notas", async () => {
    const { db, setValues } = proposalDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await reviewCounterProposalRecord({
      proposalId: "prop-1",
      decision: "ACEITAR",
      socioUserId: 7,
      notes: "aprovado",
    });
    expect(setValues.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        status: "ACEITA",
        approvedBySocioId: "7",
        clientNotes: "aprovado",
      })
    );
    expect(setValues.mock.calls[0][0].acceptedAt).toBeInstanceOf(Date);

    await reviewCounterProposalRecord({
      proposalId: "prop-1",
      decision: "RECUSAR",
      socioUserId: 7,
    });
    expect(setValues.mock.calls[1][0]).toEqual({
      status: "RECUSADA",
      approvedBySocioId: "7",
      acceptedAt: null,
      clientNotes: null,
    });
  });

  it("aponta para a proposta correta em cada operação", async () => {
    const { db, setValues } = proposalDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await submitCounterProposalRecord({
      proposalId: "prop-2",
      counterProposalValue: 1,
      counterProposalNotes: "x",
    });
    expect(setValues.mock.results[0].value.where).toHaveBeenCalledWith(
      expect.anything()
    );
    expect(db.select).not.toHaveBeenCalled();
  });
});
