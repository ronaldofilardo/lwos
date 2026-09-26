/**
 * @description Valida o fluxo idempotente do setPassword: conta existente ou
 * corrida de criação concede o vínculo e consome o link sem redefinir senha.
 * @see server/features/people/first-access-router.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({ requireDatabase: vi.fn() }));
const dbMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
}));
const personMocks = vi.hoisted(() => ({ getPersonRecord: vi.fn() }));
const bcryptMocks = vi.hoisted(() => ({ default: { hash: vi.fn() } }));
const idMocks = vi.hoisted(() => ({ createId: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../../db", () => dbMocks);
vi.mock("./person-repository", () => personMocks);
vi.mock("bcryptjs", () => bcryptMocks);
vi.mock("../_shared/ids", () => idMocks);

import { firstAccessRouter } from "./first-access-router";

const person = {
  id: "pessoa-1",
  familyId: "familia-1",
  fullName: "Ana Silva",
  email: "ana@exemplo.com",
};
const link = { id: "link-1", personId: "pessoa-1", consumedAt: null };

function firstAccessDb() {
  const select = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([link]),
      }),
    }),
  });
  const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn().mockReturnValue({ onConflictDoNothing });
  const insert = vi.fn().mockReturnValue({ values: insertValues });
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const update = vi
    .fn()
    .mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) });
  const db = { select, insert, update };
  return { db, insertValues, onConflictDoNothing, updateWhere };
}

function caller() {
  return firstAccessRouter.createCaller({
    req: {} as never,
    res: {} as never,
    user: null,
  });
}

describe("first-access setPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idMocks.createId.mockReturnValue("access-1");
    personMocks.getPersonRecord.mockResolvedValue(person);
  });

  it("concede vínculo e consome o link quando a conta já existe", async () => {
    const { db, insertValues, onConflictDoNothing, updateWhere } =
      firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue({ id: 5 });

    await expect(
      caller().setPassword({
        token: "token-existente-0001",
        password: "senha123",
      })
    ).resolves.toEqual({ success: true });

    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(bcryptMocks.default.hash).not.toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: "familia-1",
        userId: 5,
        accessRole: "CLIENTE",
      })
    );
    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it("resolve corrida de criação reconsultando o e-mail e concede vínculo", async () => {
    const { db, insertValues, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ id: 9 });
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockRejectedValue(
      new Error("Já existe um usuário com este e-mail.")
    );

    await expect(
      caller().setPassword({
        token: "token-corrida-0002",
        password: "senha123",
      })
    ).resolves.toEqual({ success: true });

    expect(dbMocks.createUser).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 9 })
    );
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it("cria a conta em fluxo novo, grava vínculo e consome o link", async () => {
    const { db, insertValues, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockResolvedValue({ id: 3 });

    await expect(
      caller().setPassword({ token: "token-novo-00003", password: "senha123" })
    ).resolves.toEqual({ success: true });

    expect(bcryptMocks.default.hash).toHaveBeenCalledWith("senha123", 12);
    expect(dbMocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@exemplo.com",
        role: "CLIENTE",
        passwordHash: "hash-novo",
      })
    );
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 3 })
    );
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it("propaga erro inesperado do createUser sem consumir o link", async () => {
    const { db, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockRejectedValue(
      new Error("Banco de dados indisponível.")
    );

    await expect(
      caller().setPassword({ token: "token-falha-0004", password: "senha123" })
    ).rejects.toThrow("Banco de dados indisponível.");
    expect(updateWhere).not.toHaveBeenCalled();
  });
});
