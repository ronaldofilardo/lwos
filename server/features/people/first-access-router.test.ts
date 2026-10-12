/**
 * @description Valida o verifyToken (link válido, inválido e pessoa ausente) e o
 * fluxo do setPassword: conta nova cria CLIENTE; conta pré-existente só é
 * reutilizada/resetada se for CLIENTE já vinculada à família do link (evita
 * takeover de conta de equipe ou de outra família); corrida de criação exige papel CLIENTE.
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
const rateLimitMocks = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));

vi.mock("../_shared/database", () => databaseMocks);
vi.mock("../../db", () => dbMocks);
vi.mock("./person-repository", () => personMocks);
vi.mock("bcryptjs", () => bcryptMocks);
vi.mock("../_shared/ids", () => idMocks);
vi.mock("../../_core/rateLimit", () => rateLimitMocks);

import { firstAccessRouter } from "./first-access-router";

const person = {
  id: "pessoa-1",
  familyId: "familia-1",
  fullName: "Ana Silva",
  email: "ana@exemplo.com",
};
const link = { id: "link-1", personId: "pessoa-1", consumedAt: null };
const clienteUser = { id: 5, role: "CLIENTE", email: "ana@exemplo.com" };

/**
 * Devolve um db cuja 1ª consulta `select` (link) retorna `linkRows` e a 2ª
 * (vínculo familyAccess, em assertExistingClientUsable) retorna `accessRows`.
 */
function firstAccessDb(
  linkRows: Record<string, unknown>[] = [link],
  accessRows: Record<string, unknown>[] = [{ id: "access-1" }]
) {
  const results = [linkRows, accessRows];
  let call = 0;
  const limit = vi.fn().mockImplementation(() => {
    const rows = results[Math.min(call, results.length - 1)];
    call += 1;
    return Promise.resolve(rows);
  });
  const select = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ limit }),
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
  return { db, insertValues, onConflictDoNothing, updateWhere, limit };
}

function caller() {
  return firstAccessRouter.createCaller({
    req: {} as never,
    res: {} as never,
    user: null,
  });
}

describe("first-access verifyToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMocks.checkRateLimit.mockReturnValue(undefined);
    personMocks.getPersonRecord.mockResolvedValue(person);
  });

  it("retorna os dados da pessoa para um link válido", async () => {
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().verifyToken({ token: "token-valido-0001" })
    ).resolves.toEqual({
      personId: "pessoa-1",
      fullName: "Ana Silva",
      email: "ana@exemplo.com",
    });
    expect(rateLimitMocks.checkRateLimit).toHaveBeenCalledWith(
      "verify:token-valido-0001"
    );
    expect(personMocks.getPersonRecord).toHaveBeenCalledWith("pessoa-1");
  });

  it("retorna null no e-mail quando a pessoa não tem e-mail", async () => {
    personMocks.getPersonRecord.mockResolvedValue({
      ...person,
      email: null,
    });
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().verifyToken({ token: "token-sememail-002" })
    ).resolves.toEqual({
      personId: "pessoa-1",
      fullName: "Ana Silva",
      email: null,
    });
  });

  it("rejeita link inválido, expirado ou já utilizado", async () => {
    const { db } = firstAccessDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().verifyToken({ token: "token-invalido-099" })
    ).rejects.toThrow("Link inválido, expirado ou já utilizado.");
    expect(personMocks.getPersonRecord).not.toHaveBeenCalled();
  });

  it("rejeita quando a pessoa do link não existe mais", async () => {
    personMocks.getPersonRecord.mockResolvedValue(null);
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().verifyToken({ token: "token-sem-pessoa-3" })
    ).rejects.toThrow("Pessoa não encontrada.");
  });
});

describe("first-access setPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idMocks.createId.mockReturnValue("access-1");
    personMocks.getPersonRecord.mockResolvedValue(person);
  });

  it("redefini senha e consome o link quando a conta pré-existente é CLIENTE já vinculada", async () => {
    const { db, insertValues, onConflictDoNothing, updateWhere } =
      firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(clienteUser);

    await expect(
      caller().setPassword({
        token: "token-existente-0001",
        password: "senha123",
      })
    ).resolves.toEqual({ success: true });

    expect(dbMocks.createUser).not.toHaveBeenCalled();
    expect(bcryptMocks.default.hash).toHaveBeenCalledWith("senha123", 12);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: "familia-1",
        userId: 5,
        accessRole: "CLIENTE",
      })
    );
    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);
    expect(updateWhere).toHaveBeenCalledTimes(2);
  });

  it("recusa redefinir senha de conta de equipe (SOCIO) — evita takeover", async () => {
    const { db, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue({ id: 8, role: "SOCIO", email: "ana@exemplo.com" });

    await expect(
      caller().setPassword({ token: "token-takeover-01", password: "senha123" })
    ).rejects.toThrow("conta de equipe");

    expect(bcryptMocks.default.hash).not.toHaveBeenCalled();
    expect(updateWhere).not.toHaveBeenCalled();
  });

  it("recusa CLIENTE de outra família (sem vínculo) — evita takeover", async () => {
    const { db, updateWhere } = firstAccessDb([link], []);
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(clienteUser);

    await expect(
      caller().setPassword({ token: "token-outrefam-1", password: "senha123" })
    ).rejects.toThrow("sem vínculo com esta família");

    expect(bcryptMocks.default.hash).not.toHaveBeenCalled();
    expect(updateWhere).not.toHaveBeenCalled();
  });

  it("resolve corrida de criação reconsultando o e-mail e concede vínculo", async () => {
    const { db, insertValues, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ id: 9, role: "CLIENTE" });
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

  it("recusa corrida de criação quando a conta disputada é de equipe", async () => {
    const { db, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ id: 11, role: "ADMIN" });
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockRejectedValue(
      new Error("Já existe um usuário com este e-mail.")
    );

    await expect(
      caller().setPassword({ token: "token-corrida-0003", password: "senha123" })
    ).rejects.toThrow("conta de equipe");

    expect(updateWhere).not.toHaveBeenCalled();
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

  it("omite o nome na criação quando a pessoa não tem fullName", async () => {
    personMocks.getPersonRecord.mockResolvedValue({
      ...person,
      fullName: null,
    });
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockResolvedValue({ id: 4 });

    await expect(
      caller().setPassword({ token: "token-novo-00004", password: "senha123" })
    ).resolves.toEqual({ success: true });
    expect(dbMocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: undefined })
    );
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

  it("rejeita setPassword com link inválido", async () => {
    const { db } = firstAccessDb([]);
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().setPassword({ token: "token-invalido-099", password: "senha123" })
    ).rejects.toThrow("Link inválido, expirado ou já utilizado.");
    expect(dbMocks.getUserByEmail).not.toHaveBeenCalled();
  });

  it("rejeita setPassword quando a pessoa não existe", async () => {
    personMocks.getPersonRecord.mockResolvedValue(null);
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().setPassword({ token: "token-sem-pessoa-1", password: "senha123" })
    ).rejects.toThrow("Pessoa não encontrada.");
  });

  it("rejeita setPassword quando a pessoa não tem e-mail", async () => {
    personMocks.getPersonRecord.mockResolvedValue({
      ...person,
      email: null,
    });
    const { db } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);

    await expect(
      caller().setPassword({ token: "token-sem-email-01", password: "senha123" })
    ).rejects.toThrow("Pessoa sem e-mail cadastrado.");
  });

  it("repropaga o erro da corrida quando o re-lookup não encontra o usuário", async () => {
    const { db, updateWhere } = firstAccessDb();
    databaseMocks.requireDatabase.mockResolvedValue(db);
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    bcryptMocks.default.hash.mockResolvedValue("hash-novo");
    dbMocks.createUser.mockRejectedValue(
      new Error("Já existe um usuário com este e-mail.")
    );

    await expect(
      caller().setPassword({ token: "token-corrida-0009", password: "senha123" })
    ).rejects.toThrow("Já existe um usuário com este e-mail.");
    expect(updateWhere).not.toHaveBeenCalled();
  });
});
